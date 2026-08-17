/**
 * Tier 5: Milestone M4 Empirical Adversarial Stress Suite (Challenger 1)
 * Focus: MenuScene (Responsive 8-Game Grid & Animated Previews),
 *        EggLayingScene (Rate Limiting, Ballistics, Hatching & Dispersion),
 *        MuddyPuddlesScene (Parabola Physics, Collision Math, Multipliers & Bonuses)
 */

import { describe, test, expect, beforeEach } from './e2e_runner.mjs';
import { GameEngine } from '../src/engine/GameEngine';
import { DisplayManager } from '../src/engine/DisplayManager';
import { InputManager } from '../src/engine/InputManager';
import { soundEngine } from '../src/engine/SoundEngine';
import { MenuScene } from '../src/modes/MenuScene';
import { EggLayingScene } from '../src/modes/EggLayingScene';
import { MuddyPuddlesScene } from '../src/modes/MuddyPuddlesScene';

export class ChallengerSpyContext {
  public calls: Array<{ method: string; args: any[] }> = [];
  public fillStyle: string | CanvasGradient | CanvasPattern = '#000000';
  public strokeStyle: string | CanvasGradient | CanvasPattern = '#000000';
  public lineWidth: number = 1;
  public font: string = '10px sans-serif';
  public textAlign: string = 'start';
  public textBaseline: string = 'alphabetic';
  public saveCount: number = 0;
  public restoreCount: number = 0;
  public saveDepth: number = 0;
  public minSaveDepth: number = 0;
  public filledTexts: string[] = [];

  reset() {
    this.calls = [];
    this.saveCount = 0;
    this.restoreCount = 0;
    this.saveDepth = 0;
    this.minSaveDepth = 0;
    this.filledTexts = [];
  }

  save() {
    this.saveCount++;
    this.saveDepth++;
    this.calls.push({ method: 'save', args: [] });
  }

  restore() {
    this.restoreCount++;
    this.saveDepth--;
    if (this.saveDepth < this.minSaveDepth) {
      this.minSaveDepth = this.saveDepth;
    }
    this.calls.push({ method: 'restore', args: [] });
  }

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
  fillText(text: string, x: number, y: number) {
    this.filledTexts.push(text);
    this.calls.push({ method: 'fillText', args: [text, x, y] });
  }
  strokeText(text: string, x: number, y: number) {
    this.calls.push({ method: 'strokeText', args: [text, x, y] });
  }
  measureText(text: string) { return { width: text.length * 10 }; }
  createLinearGradient() { return { addColorStop() {} }; }
  createRadialGradient() { return { addColorStop() {} }; }
}

describe('Tier 5: M4 Refactored Mini-Games & Menu Adversarial Stress Suite (Challenger 1)', () => {
  let canvas: HTMLCanvasElement;
  let engine: GameEngine;
  let spyCtx: ChallengerSpyContext;
  let mockCtx: CanvasRenderingContext2D;

  beforeEach(() => {
    window.localStorage.clear();
    soundEngine.spy.clear();
    canvas = document.createElement('canvas') as HTMLCanvasElement;
    engine = new GameEngine(canvas);
    spyCtx = new ChallengerSpyContext();
    mockCtx = spyCtx as unknown as CanvasRenderingContext2D;
  });

  // =========================================================================
  // 1. MenuScene Layout, Aspect Ratios & Card Bounds Stress
  // =========================================================================

  test('T5.16_menu_dual_orientation_layout_across_5_extreme_aspect_ratios - Bounding boxes & card proportions remain valid', () => {
    const menu = new MenuScene(engine);
    const testViewports = [
      { name: 'Ultrawide Landscape 21:9', width: 2560, height: 1080, expectedPortrait: false },
      { name: 'Standard Landscape 16:9', width: 1280, height: 720, expectedPortrait: false },
      { name: 'Square 1:1', width: 800, height: 800, expectedPortrait: false },
      { name: 'Narrow Mobile Portrait 9:19.5', width: 390, height: 844, expectedPortrait: true },
      { name: 'Ultra-tall Mobile Portrait 9:22', width: 400, height: 978, expectedPortrait: true }
    ];

    for (const vp of testViewports) {
      window.innerWidth = vp.width;
      window.innerHeight = vp.height;
      engine.display.syncResize();

      expect(engine.display.isPortrait).toBe(vp.expectedPortrait);
      const cards = menu.getModeCards(engine.display);

      expect(cards.length).toBe(8);

      for (let i = 0; i < cards.length; i++) {
        const c = cards[i];
        expect(Number.isFinite(c.x)).toBeTruthy();
        expect(Number.isFinite(c.y)).toBeTruthy();
        expect(Number.isFinite(c.w)).toBeTruthy();
        expect(Number.isFinite(c.h)).toBeTruthy();
        expect(c.w).toBeGreaterThan(100);
        expect(c.h).toBeGreaterThan(50);

        // Check cards remain inside virtual canvas bounds
        const left = c.x - c.w / 2;
        const right = c.x + c.w / 2;
        const top = c.y - c.h / 2;
        const bottom = c.y + c.h / 2;

        expect(left).toBeGreaterThanOrEqual(0);
        expect(right).toBeLessThanOrEqual(engine.display.vWidth + 0.1);
        expect(top).toBeGreaterThanOrEqual(50); // Below title banner
        expect(bottom).toBeLessThanOrEqual(engine.display.vHeight + 0.1);

        // Check no pair of cards overlaps
        for (let j = i + 1; j < cards.length; j++) {
          const c2 = cards[j];
          const l2 = c2.x - c2.w / 2;
          const r2 = c2.x + c2.w / 2;
          const t2 = c2.y - c2.h / 2;
          const b2 = c2.y + c2.h / 2;

          const overlaps = (left < r2 && right > l2 && top < b2 && bottom > t2);
          expect(overlaps).toBeFalsy();
        }
      }
    }
  });

  test('T5.17_menu_card_tapping_hitboxes_boundary_tolerance_and_scene_switch - Precise hits transition, out of bounds ignored', () => {
    const menu = new MenuScene(engine);
    window.innerWidth = 1280;
    window.innerHeight = 720;
    engine.display.syncResize();

    const cards = menu.getModeCards(engine.display);
    const card0 = cards[0]; // EGG_LAYING
    const card3 = cards[3]; // DADDY_PIG (far right of row 0)

    // Center tap on card 0
    let switched = menu.handleTap(card0.x, card0.y);
    expect(switched).toBeTruthy();
    expect(engine.currentSceneId).toBe(card0.id);

    // Boundary tap: 5px outside card edge is within +6px tolerance
    switched = menu.handleTap(card0.x + card0.w / 2 + 5, card0.y);
    expect(switched).toBeTruthy();
    expect(engine.currentSceneId).toBe(card0.id);

    // Out of bounds tap far to the right of card 3 (outside screen cards)
    const prevScene = engine.currentSceneId;
    switched = menu.handleTap(card3.x + card3.w / 2 + 25, card3.y);
    expect(switched).toBeFalsy();
    expect(engine.currentSceneId).toBe(prevScene);

    // Tap in title header dead zone (y = 15)
    switched = menu.handleTap(engine.display.vWidth / 2, 15);
    expect(switched).toBeFalsy();
  });

  test('T5.18_menu_high_score_badge_integration_for_all_8_modes - Retrieves & renders persisted high scores correctly', () => {
    const menu = new MenuScene(engine);
    window.innerWidth = 1280;
    window.innerHeight = 720;
    engine.display.syncResize();

    // Persist scores across all 8 modes using varied keys
    engine.storage.saveHighScore('eggLaying', 42);
    engine.storage.saveHighScore('MUDDY_PUDDLES', 88);
    engine.storage.saveHighScore('chickMaze', 120);
    engine.storage.saveHighScore('daddyPig', 55);
    engine.storage.saveHighScore('dinosaurBalloon', 30);
    engine.storage.saveHighScore('pancakeFlipper', 15);
    engine.storage.saveHighScore('vegetableHarvest', 70);
    engine.storage.saveHighScore('hopscotchBubble', 99);

    spyCtx.reset();
    menu.render(mockCtx, 1.0, engine.display);

    expect(spyCtx.filledTexts).toContain('★ 42');
    expect(spyCtx.filledTexts).toContain('★ 88');
    expect(spyCtx.filledTexts).toContain('★ 120');
    expect(spyCtx.filledTexts).toContain('★ 55');
    expect(spyCtx.filledTexts).toContain('★ 30');
    expect(spyCtx.filledTexts).toContain('★ 15');
    expect(spyCtx.filledTexts).toContain('★ 70');
    expect(spyCtx.filledTexts).toContain('★ 99');
  });

  test('T5.19_menu_animated_character_previews_1000_frame_soak_and_canvas_stack_safety - Zero stack leak across continuous animation', () => {
    const menu = new MenuScene(engine);
    window.innerWidth = 1280;
    window.innerHeight = 720;
    engine.display.syncResize();
    const input = new InputManager(engine.display);

    spyCtx.reset();

    for (let frame = 0; frame < 1000; frame++) {
      menu.update(0.016, input);
      menu.render(mockCtx, 1.0, engine.display);

      expect(spyCtx.saveDepth).toBe(0);
      expect(spyCtx.minSaveDepth).toBeGreaterThanOrEqual(0);
    }

    expect(menu.time).toBeCloseTo(16.0, 1);
    expect(spyCtx.saveCount).toBeGreaterThan(8000);
    expect(spyCtx.saveCount).toBe(spyCtx.restoreCount);
  });

  // =========================================================================
  // 2. EggLayingScene Rate Limiting, Ballistics, Cracking & Chicks
  // =========================================================================

  test('T5.20_egg_laying_rate_limiting_and_ballistic_physics_simulation - Throttles rapid taps & simulates realistic gravity bounce', () => {
    const scene = new EggLayingScene(engine);
    scene.enter();
    const isPortrait = engine.display.isPortrait;
    const groundY = isPortrait ? engine.display.vHeight - 140 : engine.display.vHeight - 80;

    // Lay 1st egg at t = 0
    scene.layEggAt(250, 150);
    expect(scene.eggs.length).toBe(1);
    expect(scene.score).toBe(1);

    const initialEgg = scene.eggs[0];
    expect(initialEgg.state).toBe('FALLING');
    expect(initialEgg.vy).toBeGreaterThan(0);

    // Attempt rapid tap within 10ms (throttled)
    scene.layEggAt(250, 150); // same instant -> throttled
    expect(scene.eggs.length).toBe(1);

    // Step physics forward until egg hits ground and settles
    const dt = 0.016;
    for (let step = 0; step < 120; step++) {
      scene.update(dt, new InputManager(engine.display));
      if (initialEgg.state === 'INCUBATING') break;
    }

    expect(initialEgg.state).toBe('INCUBATING');
    expect(initialEgg.y).toBeCloseTo(groundY, 1);
    expect(initialEgg.vy).toBe(0);
  });

  test('T5.21_egg_laying_multi_stage_crack_hatch_and_chick_dispersion_stress - Eggs progress stages, hatch chicks & repel cleanly', () => {
    const scene = new EggLayingScene(engine);
    scene.enter();
    const input = new InputManager(engine.display);

    // Spawn 1 egg directly in INCUBATING state
    scene.eggs.push({
      x: 300,
      y: 400,
      vx: 0,
      vy: 0,
      rotation: 0,
      vRot: 0,
      state: 'INCUBATING',
      timer: 0,
      crackStage: 0
    });

    const dt = 0.05;

    // Step 2.3s -> transitions to CRACK_1
    for (let t = 0; t < 2.3; t += dt) {
      scene.update(dt, input);
    }
    expect(scene.eggs[0].state).toBe('CRACK_1');
    expect(scene.eggs[0].crackStage).toBe(1);

    // Step 0.5s -> transitions to CRACK_2
    for (let t = 0; t < 0.5; t += dt) {
      scene.update(dt, input);
    }
    expect(scene.eggs[0].state).toBe('CRACK_2');
    expect(scene.eggs[0].crackStage).toBe(3);

    // Step 0.4s -> hatches into a SCAMPERING chick
    for (let t = 0; t < 0.4; t += dt) {
      scene.update(dt, input);
    }
    expect(scene.eggs.length).toBe(0);
    expect(scene.chicks.length).toBe(1);
    expect(scene.chicks[0].state).toBe('SCAMPERING');

    // Stress test chick pairwise repulsion with 20 overlapping chicks
    for (let i = 0; i < 20; i++) {
      scene.chicks.push({
        x: 300 + (Math.random() * 4 - 2),
        y: 400 + (Math.random() * 4 - 2),
        vx: 0,
        vy: 0,
        walkCycle: 0,
        facingLeft: false,
        state: 'SCAMPERING'
      });
    }

    // Step 60 frames of pairwise separation physics
    for (let f = 0; f < 60; f++) {
      scene.update(0.016, input);
    }

    // Check all chicks remain inside yard bounds
    const minChickX = 25;
    const maxChickX = engine.display.vWidth - 25;
    for (const c of scene.chicks) {
      expect(c.x).toBeGreaterThanOrEqual(minChickX - 0.1);
      expect(c.x).toBeLessThanOrEqual(maxChickX + 0.1);
      expect(Number.isFinite(c.x)).toBeTruthy();
      expect(Number.isFinite(c.y)).toBeTruthy();
    }
  });

  test('T5.22_egg_laying_milestone_fanfare_and_chicken_tap_navigation - Multiple of 10 eggs triggers fanfare & chicken turns', () => {
    const scene = new EggLayingScene(engine);
    scene.enter();

    // Lay 10 eggs rapidly with artificially reset lastLayTime
    for (let i = 1; i <= 10; i++) {
      (scene as any).lastLayTime = 0;
      scene.layEggAt(200, 150);
    }

    expect(scene.score).toBe(10);
    const fanfareEvents = soundEngine.spy.getEventsByType('fanfare');
    expect(fanfareEvents.length).toBeGreaterThan(0);
  });

  // =========================================================================
  // 3. MuddyPuddlesScene Parabola, Collision Math, Multipliers & Bonuses
  // =========================================================================

  test('T5.23_muddy_puddles_jump_parabola_and_ellipse_collision_math - High velocity jump lands with authentic gravity & center bonus', () => {
    const scene = new MuddyPuddlesScene(engine);
    scene.enter();
    const input = new InputManager(engine.display);
    const groundY = scene.peppa.y;

    // Clear auto-spawned puddles and place deterministic standard puddle
    scene.puddles = [
      {
        x: 270,
        y: groundY,
        rx: 50,
        ry: 25,
        type: 'STANDARD',
        lifetime: 8.0,
        ripplePhase: 0
      }
    ];

    scene.peppa.x = 270; // Direct center bullseye
    scene.jump();

    expect(scene.peppa.isJumping).toBeTruthy();
    expect(scene.peppa.jumpV).toBe(-460);

    // Simulate jump in flight: jumpY should become negative (above ground)
    scene.update(0.016, input);
    expect(scene.peppa.jumpY).toBeLessThan(0);

    // Step until landing (approx ~0.66s)
    for (let step = 0; step < 60; step++) {
      scene.update(0.016, input);
      if (!scene.peppa.isJumping) break;
    }

    expect(scene.peppa.isJumping).toBeFalsy();
    expect(scene.peppa.jumpY).toBe(0);
    // Center bonus (<= 0.4) on standard puddle (25 pts) with 1x multiplier: 25 * 2 * 1 = 50 pts
    expect(scene.score).toBe(50);
    expect(scene.multiplier).toBe(2);
    expect(scene.muddyBootsTimer).toBeGreaterThan(0);
  });

  test('T5.24_muddy_puddles_golden_bonus_combo_multiplier_ladder_and_dry_grass_reset - Streak builds to 5x and resets on dry grass', () => {
    const scene = new MuddyPuddlesScene(engine);
    scene.enter();
    const input = new InputManager(engine.display);
    const groundY = scene.peppa.y;

    // Streak of 5 golden puddles
    for (let streak = 1; streak <= 5; streak++) {
      scene.puddles = [
        {
          x: 200 + streak * 30,
          y: groundY,
          rx: 52,
          ry: 26,
          type: 'GOLDEN',
          lifetime: 8.0,
          ripplePhase: 0
        }
      ];

      scene.peppa.x = 200 + streak * 30;
      scene.jump();

      // Step jump to completion
      for (let s = 0; s < 50; s++) {
        scene.update(0.016, input);
        if (!scene.peppa.isJumping) break;
      }
    }

    expect(scene.multiplier).toBe(5); // Capped at 5x

    // Next jump lands on dry grass (no puddles)
    scene.puddles = [];
    scene.peppa.x = 100;
    scene.jump();

    for (let s = 0; s < 50; s++) {
      scene.update(0.016, input);
      if (!scene.peppa.isJumping) break;
    }

    expect(scene.peppa.isJumping).toBeFalsy();
    expect(scene.multiplier).toBe(1); // Dry grass resets multiplier!
  });
});
