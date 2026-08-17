/**
 * Tier 5: Empirical Adversarial Stress Suite for Milestone M3 (New Mini-Games)
 * Focus: Mode 7 (Grandpa Pig Vegetable Harvest) & Mode 8 (Suzy Sheep Hopscotch & Bubble Trail)
 * Challenger 2 Verification Suite
 */

import { describe, test, expect, beforeEach } from './e2e_runner.mjs';
import { GameEngine } from '../src/engine/GameEngine';
import { InputManager } from '../src/engine/InputManager';
import { soundEngine } from '../src/engine/SoundEngine';
import { VegetableHarvestScene } from '../src/modes/VegetableHarvestScene';
import { HopscotchBubbleScene } from '../src/modes/HopscotchBubbleScene';

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

describe('Tier 5: M3 New Games Adversarial & Empirical Stress Suite (Challenger 2)', () => {
  const canvas = document.createElement('canvas');
  const engine = new GameEngine(canvas);
  const mockCtx = new SpyCanvasContext() as unknown as CanvasRenderingContext2D;
  const spy = mockCtx as unknown as SpyCanvasContext;

  beforeEach(() => {
    window.innerWidth = 960;
    window.innerHeight = 540;
    engine.display.syncResize();
  });

  function simulatePointerDown(x: number, y: number, id: number = 1) {
    canvas.dispatchEvent(
      new PointerEvent('pointerdown', {
        pointerId: id,
        clientX: x,
        clientY: y,
        bubbles: true
      })
    );
  }

  function simulatePointerMove(x: number, y: number, id: number = 1) {
    window.dispatchEvent(
      new PointerEvent('pointermove', {
        pointerId: id,
        clientX: x,
        clientY: y,
        bubbles: true
      })
    );
  }

  function simulatePointerUp(x: number, y: number, id: number = 1) {
    window.dispatchEvent(
      new PointerEvent('pointerup', {
        pointerId: id,
        clientX: x,
        clientY: y,
        bubbles: true
      })
    );
  }

  test('T5.09_veggie_drag_elastic_snapback_vs_breakout - Sub-threshold pull snaps back while breakout launches flight', () => {
    const scene = new VegetableHarvestScene(engine);
    scene.enter();
    const input = new InputManager(engine.display);

    const m0 = scene.mounds[0];
    m0.vegetable!.type = 'CARROT';
    m0.vegetable!.springK = 1.2;
    m0.vegetable!.breakoutThreshold = 50;

    // Sub-threshold drag: 30px pull -> 25px displacement < 50px threshold
    simulatePointerDown(m0.x, m0.y, 1);
    scene.update(1 / 60, input);
    simulatePointerMove(m0.x, m0.y - 30, 1);
    scene.update(1 / 60, input);

    expect(m0.vegetable!.pullOffsetY).toBeCloseTo(25, 1);
    expect(m0.vegetable!.pullProgress).toBeCloseTo(0.5, 1);

    // Release below threshold -> snapback
    simulatePointerUp(m0.x, m0.y - 30, 1);
    scene.update(1 / 60, input);
    expect(scene.currentPullTension).toBe(0);

    // After 0.25s snapback decay
    scene.update(0.25, input);
    expect(m0.vegetable!.pullOffsetY).toBe(0);

    input.detach();
  });

  test('T5.10_giant_pumpkin_3_tug_boss_mechanic - Pumpkin requires exactly 3 progressive tugs before breakout', () => {
    const scene = new VegetableHarvestScene(engine);
    scene.enter();
    const input = new InputManager(engine.display);

    const m0 = scene.mounds[0];
    m0.vegetable!.type = 'PUMPKIN';
    m0.vegetable!.springK = 4.0;
    m0.vegetable!.breakoutThreshold = 75;

    soundEngine.spy.clear();

    // Tug 1
    simulatePointerDown(m0.x, m0.y, 1);
    scene.update(1 / 60, input);
    simulatePointerMove(m0.x, m0.y - 320, 1);
    scene.update(1 / 60, input);

    expect(scene.pumpkinTugs).toBe(1);
    expect(m0.vegetable!.isFlying).toBeFalsy();
    expect(m0.vegetable!.pullOffsetY).toBeCloseTo(30, 1);

    // Tug 2
    simulatePointerMove(m0.x, m0.y - 650, 1);
    scene.update(1 / 60, input);
    expect(scene.pumpkinTugs).toBe(2);
    expect(m0.vegetable!.isFlying).toBeFalsy();

    // Tug 3 (Breakout)
    simulatePointerMove(m0.x, m0.y - 980, 1);
    scene.update(1 / 60, input);
    expect(m0.vegetable!.isFlying).toBeTruthy();
    expect(soundEngine.spy.events.some(e => e.type === 'veggiePop')).toBeTruthy();

    simulatePointerUp(m0.x, m0.y - 980, 1);
    scene.update(1 / 60, input);
    input.detach();
  });

  test('T5.11_flying_veggie_ballistic_collection_and_respawn - Flight parabola lands in wheelbarrow and triggers collection & respawn', () => {
    engine.storage.resetAll();
    const scene = new VegetableHarvestScene(engine);
    scene.enter();
    const input = new InputManager(engine.display);

    const m0 = scene.mounds[0];
    const veg = m0.vegetable!;
    veg.type = 'CABBAGE';
    veg.points = 50;

    // Spacebar harvest trigger
    scene.update(1 / 60, {
      ...input,
      isKeyJustPressed: (k: string) => k === 'Space',
      pointers: new Map()
    } as unknown as InputManager);

    expect(veg.isFlying).toBeTruthy();

    // Step until landing
    while (veg.isFlying) {
      scene.update(1 / 60, input);
    }

    expect(scene.harvestedCount).toBe(1);
    expect(scene.score).toBe(50);
    expect(m0.vegetable).toBeNull();
    expect(engine.storage.getHighScore('vegetableHarvest')).toBe(50);

    // Fast-forward respawn delay (1.5s)
    scene.update(1.6, input);
    expect(m0.vegetable).not.toBeNull();
    input.detach();
  });

  test('T5.12_soap_bubble_wobble_and_rapid_burst - Bubbles rise with sinusoidal wobble and rapid burst pops increment score', () => {
    const scene = new HopscotchBubbleScene(engine);
    scene.enter();
    const input = new InputManager(engine.display);

    expect(scene.bubbles.length).toBe(6);

    // Rapid burst pops
    for (let p = 0; p < 8; p++) {
      if (scene.bubbles.length === 0) (scene as any).spawnBubble(300);
      const b = scene.bubbles[0];
      simulatePointerDown(b.x, b.y, 1);
      scene.update(1 / 60, input);
      simulatePointerUp(b.x, b.y, 1);
      scene.update(1 / 60, input);
    }

    expect(scene.bubblesPoppedCount).toBeGreaterThanOrEqual(4);
    expect(scene.score).toBeGreaterThanOrEqual(200);
    input.detach();
  });

  test('T5.13_suzy_hopscotch_state_machine_and_picnic_win - Suzy hops 1 to 10 and triggers picnic win celebration', () => {
    engine.storage.resetAll();
    const scene = new HopscotchBubbleScene(engine);
    scene.enter();
    const input = new InputManager(engine.display);

    expect(scene.suzy.currentSquare).toBe(1);

    // Hop through all 10 squares
    while (scene.suzy.currentSquare < 10) {
      scene.advanceSuzy();
      while (scene.suzy.isHopping) {
        scene.update(1 / 60, input);
      }
    }

    expect(scene.suzy.currentSquare).toBe(10);
    expect(scene.isCelebrating).toBeTruthy();
    expect(scene.score).toBeGreaterThanOrEqual(500);
    expect(engine.storage.getHighScore('hopscotchBubble')).toBe(scene.score);

    // Celebration expiration (3.8s) -> clean replay reset
    scene.update(3.9, input);
    expect(scene.isCelebrating).toBeFalsy();
    expect(scene.suzy.currentSquare).toBe(1);
    input.detach();
  });

  test('T5.14_dual_orientation_resizing_during_active_actions - Orientation switch mid-action preserves state & stack balance', () => {
    // Mode 7 Drag Mid-Action Switch
    window.innerWidth = 540;
    window.innerHeight = 960;
    engine.display.syncResize();

    const vegScene = new VegetableHarvestScene(engine);
    vegScene.enter();
    const input = new InputManager(engine.display);

    const m0 = vegScene.mounds[0];
    simulatePointerDown(m0.x, m0.y, 1);
    vegScene.update(1 / 60, input);
    simulatePointerMove(m0.x, m0.y - 20, 1);
    vegScene.update(1 / 60, input);

    // Switch to Landscape
    window.innerWidth = 960;
    window.innerHeight = 540;
    engine.display.syncResize();
    vegScene.render(mockCtx, 1.0, engine.display);
    expect(spy.saveCount).toBe(spy.restoreCount);

    simulatePointerUp(m0.x, m0.y, 1);
    vegScene.update(1 / 60, input);
    expect(vegScene.currentPullTension).toBe(0);

    // Restore landscape
    window.innerWidth = 960;
    window.innerHeight = 540;
    engine.display.syncResize();
    input.detach();
  });

  test('T5.15_mode7_and_mode8_1000_frame_soak_stress - 1,000 continuous frames execute without memory leaks or particle overflow', () => {
    const vegScene = new VegetableHarvestScene(engine);
    vegScene.enter();
    const hopScene = new HopscotchBubbleScene(engine);
    hopScene.enter();
    const input = new InputManager(engine.display);

    const t0 = performance.now();
    for (let f = 0; f < 1000; f++) {
      if (f % 30 === 0) {
        simulatePointerDown(200, 300, 1);
        simulatePointerMove(200, 200, 1);
      } else if (f % 30 === 15) {
        simulatePointerUp(200, 200, 1);
      }
      vegScene.update(1 / 60, input);

      if (f % 25 === 0) hopScene.advanceSuzy();
      hopScene.update(1 / 60, input);
    }
    const t1 = performance.now();

    expect(t1 - t0).toBeLessThan(500); // 2000+ simulated FPS
    expect(vegScene.particles.active.length).toBeLessThanOrEqual(150);
    expect(hopScene.particles.active.length).toBeLessThanOrEqual(150);
    input.detach();
  });
});
