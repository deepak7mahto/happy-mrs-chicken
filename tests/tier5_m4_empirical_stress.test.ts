/**
 * Tier 5: Empirical Adversarial Stress Suite for Milestone M4
 * Focus: Mode 3 (Chick Maze), Mode 4 (Daddy Pig), PWA & Service Worker Offline
 * Challenger 2 Verification Suite
 */

import { describe, test, expect, beforeEach } from './e2e_runner.mjs';
import { GameEngine } from '../src/engine/GameEngine';
import { InputManager } from '../src/engine/InputManager';
import { soundEngine } from '../src/engine/SoundEngine';
import { ChickMazeScene } from '../src/modes/ChickMazeScene';
import { DaddyPigScene } from '../src/modes/DaddyPigScene';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export class SpyCanvasContext {
  public calls: Array<{ method: string; args: any[] }> = [];
  public fillStyle: string | CanvasGradient | CanvasPattern = '#000000';
  public strokeStyle: string | CanvasGradient | CanvasPattern = '#000000';
  public lineWidth: number = 1;
  public saveCount: number = 0;
  public restoreCount: number = 0;
  public saveDepth: number = 0;

  reset() { this.calls = []; this.saveCount = 0; this.restoreCount = 0; this.saveDepth = 0; }
  save() { this.saveCount++; this.saveDepth++; this.calls.push({ method: 'save', args: [] }); }
  restore() { this.restoreCount++; this.saveDepth--; this.calls.push({ method: 'restore', args: [] }); }
  scale(sx: number, sy: number) { this.calls.push({ method: 'scale', args: [sx, sy] }); }
  translate(tx: number, ty: number) { this.calls.push({ method: 'translate', args: [tx, ty] }); }
  rotate(angle: number) { this.calls.push({ method: 'rotate', args: [angle] }); }
  beginPath() { this.calls.push({ method: 'beginPath', args: [] }); }
  closePath() { this.calls.push({ method: 'closePath', args: [] }); }
  moveTo(x: number, y: number) { this.calls.push({ method: 'moveTo', args: [x, y] }); }
  lineTo(x: number, y: number) { this.calls.push({ method: 'lineTo', args: [x, y] }); }
  quadraticCurveTo(cp1x: number, cp1y: number, x: number, y: number) { this.calls.push({ method: 'quadraticCurveTo', args: [cp1x, cp1y, x, y] }); }
  bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number) { this.calls.push({ method: 'bezierCurveTo', args: [cp1x, cp1y, cp2x, cp2y, x, y] }); }
  arc(x: number, y: number, r: number, sa: number, ea: number, anticlockwise?: boolean) { this.calls.push({ method: 'arc', args: [x, y, r, sa, ea, anticlockwise] }); }
  ellipse(x: number, y: number, rx: number, ry: number, rot: number, sa: number, ea: number, anticlockwise?: boolean) { this.calls.push({ method: 'ellipse', args: [x, y, rx, ry, rot, sa, ea, anticlockwise] }); }
  rect(x: number, y: number, w: number, h: number) { this.calls.push({ method: 'rect', args: [x, y, w, h] }); }
  roundRect(x: number, y: number, w: number, h: number, radii: any) { this.calls.push({ method: 'roundRect', args: [x, y, w, h, radii] }); }
  fillRect(x: number, y: number, w: number, h: number) { this.calls.push({ method: 'fillRect', args: [x, y, w, h] }); }
  strokeRect(x: number, y: number, w: number, h: number) { this.calls.push({ method: 'strokeRect', args: [x, y, w, h] }); }
  fill() { this.calls.push({ method: 'fill', args: [] }); }
  stroke() { this.calls.push({ method: 'stroke', args: [] }); }
  fillText(text: string, x: number, y: number) { this.calls.push({ method: 'fillText', args: [text, x, y] }); }
  measureText(text: string) { return { width: text.length * 10 }; }
  createLinearGradient() { return { addColorStop() {} }; }
  createRadialGradient() { return { addColorStop() {} }; }
}

describe('Tier 5: M4 Games & PWA Adversarial Stress Suite (Challenger 2)', () => {
  const canvas = document.createElement('canvas');
  const engine = new GameEngine(canvas);
  const mockCtx = new SpyCanvasContext() as unknown as CanvasRenderingContext2D;
  const spy = mockCtx as unknown as SpyCanvasContext;

  beforeEach(() => {
    window.innerWidth = 960;
    window.innerHeight = 540;
    engine.display.syncResize();
  });

  test('T5.16_chick_maze_fifo_seed_queue_stress - 100 rapid seed drops maintain strict FIFO order and 6-seed cap', () => {
    const scene = new ChickMazeScene(engine);
    scene.enter();

    for (let i = 1; i <= 100; i++) {
      scene.dropSeed(i * 10, i * 5);
    }

    expect(scene.seeds.length).toBe(6);
    expect(scene.seeds[0].x).toBe(95 * 10);
    expect(scene.seeds[5].x).toBe(100 * 10);
  });

  test('T5.17_chick_boids_flocking_and_boundaries - Flocking separation, alignment, seed steering and speed clamp work reliably', () => {
    const scene = new ChickMazeScene(engine);
    scene.enter();
    const input = new InputManager(engine.display);

    // Separation
    scene.seeds = [];
    scene.chicks = [
      { x: 200, y: 200, vx: 0, vy: 0, walkCycle: 0, facingLeft: false, state: 'WANDERING' },
      { x: 212, y: 200, vx: 0, vy: 0, walkCycle: 0, facingLeft: false, state: 'WANDERING' }
    ];

    scene.update(1 / 60, input);
    expect(scene.chicks[0].vx).toBeLessThan(0);
    expect(scene.chicks[1].vx).toBeGreaterThan(0);

    // Seed steering
    scene.seeds = [{ x: 350, y: 200, remaining: 1 }];
    scene.update(1 / 60, input);
    expect(scene.chicks[0].vx).toBeGreaterThan(-100);

    // Speed clamping
    scene.chicks[0].vx = 150;
    scene.chicks[0].vy = 200;
    scene.update(1 / 60, input);
    const speed = Math.hypot(scene.chicks[0].vx, scene.chicks[0].vy);
    expect(speed).toBeCloseTo(80, 1);

    input.detach();
  });

  test('T5.18_chick_consumption_and_coop_wave_cycle - Seed eaten within 14px and coop entry increments score with auto-respawn', () => {
    const scene = new ChickMazeScene(engine);
    scene.enter();
    const input = new InputManager(engine.display);
    const coopDoor = { x: engine.display.vWidth - 150, y: 160 };

    // 14px boundary test
    scene.seeds = [{ x: 200, y: 200, remaining: 1 }];
    scene.chicks = [{ x: 185, y: 200, vx: 0, vy: 0, walkCycle: 0, facingLeft: false, state: 'WANDERING' }];
    scene.update(0.001, input);
    expect(scene.seeds.length).toBe(1); // 15px -> not eaten

    scene.chicks[0].x = 188; // 12px -> eaten
    scene.update(0.001, input);
    expect(scene.seeds.length).toBe(0);

    // Coop entry wave cycle
    scene.enter();
    for (let i = 0; i < 4; i++) {
      scene.chicks[0].x = coopDoor.x;
      scene.chicks[0].y = coopDoor.y;
      scene.update(1 / 60, input);
    }
    expect(scene.coopSavedCount).toBe(4);
    expect(scene.score).toBe(400);

    // 5th chick triggers wave respawn
    scene.chicks[0].x = coopDoor.x;
    scene.chicks[0].y = coopDoor.y;
    scene.update(1 / 60, input);
    expect(scene.chicks.length).toBe(5);

    input.detach();
  });

  test('T5.19_daddy_pig_fever_and_multipliers - Tapping builds fever +4.5%, extends timer +0.18s, and scales multipliers', () => {
    const scene = new DaddyPigScene(engine);
    scene.enter();

    for (let t = 0; t < 9; t++) scene.tap();
    expect(scene.fever).toBeCloseTo(40.5, 1);
    expect(scene.multiplier).toBe(2);

    while (scene.fever < 70) scene.tap();
    expect(scene.multiplier).toBe(5);

    while (scene.fever < 95) scene.tap();
    expect(scene.multiplier).toBe(10);

    expect(scene.timer).toBeGreaterThan(20.0);
  });

  test('T5.20_daddy_pig_dynamic_decay_and_meltdown_reset - Fever decays dynamically based on score and 100% triggers BSOD', () => {
    engine.storage.resetAll();
    const scene = new DaddyPigScene(engine);
    scene.enter();
    const input = new InputManager(engine.display);

    // Dynamic decay
    scene.fever = 60;
    scene.score = 10000;
    scene.update(1.0, input);
    expect(scene.fever).toBeCloseTo(60 - (6.5 + 0.05 * 100), 1); // 48.5

    // Meltdown BSOD
    scene.fever = 98;
    scene.tap();
    expect(scene.fever).toBe(100);
    expect(scene.isOverheating).toBeTruthy();
    expect(engine.storage.getHighScore('daddyPig')).toBe(scene.score);

    // Tap to reset
    scene.update(1 / 60, {
      ...input,
      isActionJustPressed: () => true
    } as unknown as InputManager);

    expect(scene.isOverheating).toBeFalsy();
    expect(scene.fever).toBe(0);
    expect(scene.score).toBe(0);

    input.detach();
  });

  test('T5.21_offline_pwa_and_zero_cdn_integrity - Service worker manifest, standalone app config and 0 CDN references verified', () => {
    const swContent = readFileSync(resolve(process.cwd(), 'public/sw.js'), 'utf-8');
    const manifest = JSON.parse(readFileSync(resolve(process.cwd(), 'public/manifest.json'), 'utf-8'));
    const htmlContent = readFileSync(resolve(process.cwd(), 'index.html'), 'utf-8');

    expect(swContent.includes('happy-mrs-chicken-v2')).toBeTruthy();
    expect(manifest.display).toBe('standalone');
    expect(manifest.icons[0].src.startsWith('data:image/svg+xml')).toBeTruthy();

    const cdnRegex = /(https?:)?\/\/(cdn\.|unpkg\.com|cdnjs\.cloudflare\.com|fonts\.googleapis\.com|cdn\.jsdelivr\.net)/i;
    expect(cdnRegex.test(htmlContent)).toBeFalsy();
    expect(cdnRegex.test(swContent)).toBeFalsy();
  });

  test('T5.22_canvas_render_stack_and_orientation_soak - Save/restore balance maintained across 50 orientation cycles', () => {
    const chickScene = new ChickMazeScene(engine);
    chickScene.enter();
    const daddyScene = new DaddyPigScene(engine);
    daddyScene.enter();

    for (let flip = 0; flip < 50; flip++) {
      const isPortrait = flip % 2 === 0;
      window.innerWidth = isPortrait ? 414 : 1280;
      window.innerHeight = isPortrait ? 896 : 720;
      engine.display.syncResize();

      spy.reset();
      chickScene.render(mockCtx, 1.0, engine.display);
      expect(spy.saveCount).toBe(spy.restoreCount);

      spy.reset();
      daddyScene.render(mockCtx, 1.0, engine.display);
      expect(spy.saveCount).toBe(spy.restoreCount);
    }
  });
});
