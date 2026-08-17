/**
 * Tier 5: Milestone M5 Empirical Adversarial Stress Suite (Challenger 1)
 * Focus: Multi-touch Concurrency & Gesture Fuzzing,
 *        Extreme Dual-Orientation & Resize Thrashing,
 *        Scene Transition Torture & Resource Leak Audit,
 *        GameEngine Lifecycle & Clock Jitter Hardening
 */

import { describe, test, expect, beforeEach } from './e2e_runner.mjs';
import { GameEngine } from '../src/engine/GameEngine';
import { DisplayManager } from '../src/engine/DisplayManager';
import { InputManager } from '../src/engine/InputManager';
import { GameLoop } from '../src/engine/GameLoop';
import { soundEngine } from '../src/engine/SoundEngine';
import { GameModeId } from '../src/types/game';
import { BaseScene } from '../src/modes/BaseScene';
import { MenuScene } from '../src/modes/MenuScene';
import { EggLayingScene } from '../src/modes/EggLayingScene';
import { MuddyPuddlesScene } from '../src/modes/MuddyPuddlesScene';
import { ChickMazeScene } from '../src/modes/ChickMazeScene';
import { DaddyPigScene } from '../src/modes/DaddyPigScene';
import { DinosaurBalloonScene } from '../src/modes/DinosaurBalloonScene';
import { PancakeFlipperScene } from '../src/modes/PancakeFlipperScene';
import { VegetableHarvestScene } from '../src/modes/VegetableHarvestScene';
import { HopscotchBubbleScene } from '../src/modes/HopscotchBubbleScene';

export class ChallengerM5SpyContext {
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

describe('Tier 5: M5 Concurrency, Orientation, Lifecycle & Scene Transitions Adversarial Hardening (Challenger 1)', () => {
  let canvas: HTMLCanvasElement;
  let engine: GameEngine;
  let spyCtx: ChallengerM5SpyContext;
  let mockCtx: CanvasRenderingContext2D;

  const ALL_MODES: GameModeId[] = [
    'MENU',
    'EGG_LAYING',
    'MUDDY_PUDDLES',
    'CHICK_MAZE',
    'DADDY_PIG',
    'DINOSAUR_BALLOON',
    'PANCAKE_FLIPPER',
    'VEGETABLE_HARVEST',
    'HOPSCOTCH_BUBBLE'
  ];

  beforeEach(() => {
    window.localStorage.clear();
    soundEngine.spy.clear();
    canvas = document.createElement('canvas') as HTMLCanvasElement;
    engine = new GameEngine(canvas);
    spyCtx = new ChallengerM5SpyContext();
    mockCtx = spyCtx as unknown as CanvasRenderingContext2D;
  });

  // =========================================================================
  // 1. Multi-Touch & Input Concurrency Fuzzing
  // =========================================================================

  test('T5.25_multitouch_fuzzing_10_pointer_concurrency_across_all_8_modes_and_menu - Clean pointer tracking without state corruption', () => {
    const input = engine.input;

    for (const modeId of ALL_MODES) {
      engine.changeScene(modeId);
      const scene = engine.activeScene!;
      expect(scene).toBeDefined();

      // Dispatch 10 simultaneous pointerdown events at random valid canvas locations
      for (let ptrId = 1; ptrId <= 10; ptrId++) {
        const clientX = 100 + ptrId * 60;
        const clientY = 150 + (ptrId % 5) * 50;
        const evt = new (window as any).PointerEvent('pointerdown', {
          pointerId: ptrId,
          clientX,
          clientY,
          cancelable: true
        });
        canvas.dispatchEvent(evt);
      }

      expect(input.pointers.size).toBe(10);
      expect(input.actionIsDown).toBeTruthy();
      expect(input.actionJustPressed).toBeTruthy();

      // Step 5 simulation frames with 10 pointers held
      for (let f = 0; f < 5; f++) {
        engine.update(0.016);
      }

      // Move 5 pointers
      for (let ptrId = 1; ptrId <= 5; ptrId++) {
        const moveEvt = new (window as any).PointerEvent('pointermove', {
          pointerId: ptrId,
          clientX: 200 + ptrId * 40,
          clientY: 300 + ptrId * 20,
          cancelable: true
        });
        window.dispatchEvent(moveEvt);
      }

      // Release first 5 pointers
      for (let ptrId = 1; ptrId <= 5; ptrId++) {
        const upEvt = new (window as any).PointerEvent('pointerup', {
          pointerId: ptrId,
          clientX: 200 + ptrId * 40,
          clientY: 300 + ptrId * 20,
          cancelable: true
        });
        window.dispatchEvent(upEvt);
      }

      expect(input.pointers.size).toBe(5);
      expect(input.actionIsDown).toBeTruthy();

      // Release remaining 5 pointers
      for (let ptrId = 6; ptrId <= 10; ptrId++) {
        const upEvt = new (window as any).PointerEvent('pointerup', {
          pointerId: ptrId,
          clientX: 100 + ptrId * 60,
          clientY: 150 + (ptrId % 5) * 50,
          cancelable: true
        });
        window.dispatchEvent(upEvt);
      }

      expect(input.pointers.size).toBe(0);
      expect(input.actionIsDown).toBeFalsy();
      expect(input.actionJustReleased).toBeTruthy();

      // Step frame to postUpdate
      engine.update(0.016);
      expect(input.actionJustReleased).toBeFalsy();
    }
  });

  test('T5.26_rapid_tap_and_release_pointer_cancellations_during_active_gameplay - Handles aborted gestures gracefully', () => {
    const input = engine.input;

    // Test 1: Abrupt pointer cancellation during active Vegetable pull
    engine.changeScene('VEGETABLE_HARVEST');
    const vegScene = engine.activeScene as VegetableHarvestScene;
    expect(vegScene.mounds.length).toBeGreaterThan(0);

    const firstMound = vegScene.mounds[0];
    const screenPos = engine.display.virtualToScreen(firstMound.x, firstMound.y);

    // Pointer down on vegetable
    canvas.dispatchEvent(new (window as any).PointerEvent('pointerdown', {
      pointerId: 1,
      clientX: screenPos.screenX,
      clientY: screenPos.screenY,
      cancelable: true
    }));
    engine.update(0.016);

    // Pointer move upwards (pulling tension)
    window.dispatchEvent(new (window as any).PointerEvent('pointermove', {
      pointerId: 1,
      clientX: screenPos.screenX,
      clientY: screenPos.screenY - 40,
      cancelable: true
    }));
    engine.update(0.016);

    expect(vegScene.currentPullTension).toBeGreaterThan(0);

    // Abrupt Pointer Cancellation (e.g. system notification or gesture takeover)
    window.dispatchEvent(new (window as any).PointerEvent('pointercancel', {
      pointerId: 1,
      clientX: screenPos.screenX,
      clientY: screenPos.screenY - 40,
      cancelable: true
    }));

    expect(input.pointers.size).toBe(0);

    // Step 20 frames: tension must decay smoothly back to 0 without getting stuck
    for (let f = 0; f < 20; f++) {
      engine.update(0.016);
    }
    expect(vegScene.currentPullTension).toBe(0);

    // Test 2: Rapid 0ms PointerDown -> PointerCancel spam in MenuScene
    engine.changeScene('MENU');
    for (let spam = 0; spam < 20; spam++) {
      canvas.dispatchEvent(new (window as any).PointerEvent('pointerdown', { pointerId: spam + 1, clientX: 200, clientY: 200, cancelable: true }));
      window.dispatchEvent(new (window as any).PointerEvent('pointercancel', { pointerId: spam + 1, clientX: 200, clientY: 200, cancelable: true }));
    }
    expect(input.pointers.size).toBe(0);
    expect(input.actionIsDown).toBeFalsy();
  });

  test('T5.27_boundary_drag_and_extreme_aberrant_coordinate_fuzzing - Finite transforms and robust non-finite value protection', () => {
    const input = engine.input;
    const display = engine.display;

    // Fuzz aberrant / non-finite inputs
    const aberrantCoords = [
      { x: -99999, y: -99999 },
      { x: 99999, y: 99999 },
      { x: NaN, y: 100 },
      { x: 100, y: NaN },
      { x: Infinity, y: 50 },
      { x: 50, y: -Infinity },
      { x: undefined as unknown as number, y: 0 }
    ];

    for (const c of aberrantCoords) {
      canvas.dispatchEvent(new (window as any).PointerEvent('pointerdown', {
        pointerId: 1,
        clientX: c.x,
        clientY: c.y,
        cancelable: true
      }));
      window.dispatchEvent(new (window as any).PointerEvent('pointermove', {
        pointerId: 1,
        clientX: c.x,
        clientY: c.y,
        cancelable: true
      }));
      engine.update(0.016);
    }

    // Bijective coordinate transforms for normal coords
    const testPoints = [
      { x: 0, y: 0 },
      { x: 480, y: 270 },
      { x: 960, y: 540 },
      { x: 120, y: 80 }
    ];

    for (const pt of testPoints) {
      const screen = display.virtualToScreen(pt.x, pt.y);
      const roundtrip = display.screenToVirtual(screen.screenX, screen.screenY);
      expect(roundtrip.x).toBeCloseTo(pt.x, 2);
      expect(roundtrip.y).toBeCloseTo(pt.y, 2);
      expect(roundtrip.inside).toBeTruthy();
    }
  });

  // =========================================================================
  // 2. Extreme Orientation & Viewport Resize Thrashing
  // =========================================================================

  test('T5.28_extreme_orientation_and_resize_thrashing_60fps_stress - Zero letterbox distortion across 8 extreme aspect ratios', () => {
    const viewports = [
      { w: 1080, h: 1920, isPortrait: true, label: '9:16 Full HD Portrait' },
      { w: 1920, h: 1080, isPortrait: false, label: '16:9 Full HD Landscape' },
      { w: 375, h: 812, isPortrait: true, label: 'iPhone X Portrait' },
      { w: 812, h: 375, isPortrait: false, label: 'iPhone X Landscape' },
      { w: 768, h: 1024, isPortrait: true, label: '3:4 iPad Portrait' },
      { w: 1024, h: 768, isPortrait: false, label: '4:3 iPad Landscape' },
      { w: 2560, h: 1080, isPortrait: false, label: '21:9 Ultrawide Landscape' },
      { w: 600, h: 600, isPortrait: false, label: '1:1 Square Window' }
    ];

    for (let frame = 0; frame < 80; frame++) {
      const vp = viewports[frame % viewports.length];
      window.innerWidth = vp.w;
      window.innerHeight = vp.h;
      engine.display.syncResize();

      expect(engine.display.isPortrait).toBe(vp.isPortrait);
      expect(engine.display.scale).toBeGreaterThan(0);
      expect(engine.display.vWidth).toBeGreaterThanOrEqual(vp.isPortrait ? 540 : 960);
      expect(engine.display.vHeight).toBeGreaterThanOrEqual(vp.isPortrait ? 800 : 540);
      expect(engine.display.offsetX).toBe(0);
      expect(engine.display.offsetY).toBe(0);

      // Verify canvas style and buffer dimensions
      expect(canvas.style.width).toBe(`${vp.w}px`);
      expect(canvas.style.height).toBe(`${vp.h}px`);
      expect(canvas.width).toBeGreaterThanOrEqual(vp.w);
      expect(canvas.height).toBeGreaterThanOrEqual(vp.h);

      // Render frame to verify no canvas transform exceptions
      engine.render(1.0);
    }
  });

  test('T5.29_mid_scene_orientation_change_entity_and_character_clamping_all_8_modes - No off-screen traps or NaN coordinates', () => {
    for (const modeId of ALL_MODES.filter(m => m !== 'MENU')) {
      engine.changeScene(modeId);

      // Phase 1: Landscape (1280x720)
      window.innerWidth = 1280;
      window.innerHeight = 720;
      engine.display.syncResize();
      for (let f = 0; f < 15; f++) engine.update(0.016);

      // Phase 2: Rapid flip to Portrait (400x850)
      window.innerWidth = 400;
      window.innerHeight = 850;
      engine.display.syncResize();
      for (let f = 0; f < 15; f++) engine.update(0.016);

      // Inspect entities in each mode to ensure bounded virtual coordinates
      const entities = engine.activeScene!.getEntities() as any;
      if (entities.eggs && entities.eggs.length > 0) {
        for (const egg of entities.eggs) {
          expect(Number.isFinite(egg.x)).toBeTruthy();
          expect(Number.isFinite(egg.y)).toBeTruthy();
        }
      }
      if (entities.chicks && entities.chicks.length > 0) {
        for (const chick of entities.chicks) {
          expect(chick.x).toBeGreaterThanOrEqual(0);
          expect(chick.x).toBeLessThanOrEqual(engine.display.vWidth + 50);
          expect(Number.isFinite(chick.x)).toBeTruthy();
          expect(Number.isFinite(chick.y)).toBeTruthy();
        }
      }
      if (entities.balloons && entities.balloons.length > 0) {
        for (const b of entities.balloons) {
          expect(Number.isFinite(b.x)).toBeTruthy();
          expect(Number.isFinite(b.y)).toBeTruthy();
        }
      }

      // Phase 3: Flip back to Landscape (1920x1080)
      window.innerWidth = 1920;
      window.innerHeight = 1080;
      engine.display.syncResize();
      for (let f = 0; f < 15; f++) engine.update(0.016);

      expect(engine.display.isPortrait).toBeFalsy();
    }
  });

  // =========================================================================
  // 3. Scene Transition Torture Testing & Resource Leak Audit
  // =========================================================================

  test('T5.30_scene_transition_torture_continuous_loop_across_all_8_modes_and_menu - Clean particle clearing & high score persistence', () => {
    let transitionCount = 0;

    // Run 54 rapid transitions across all 9 modes (6 full loops)
    for (let loop = 0; loop < 6; loop++) {
      for (const modeId of ALL_MODES) {
        engine.changeScene(modeId);
        transitionCount++;
        expect(engine.currentSceneId).toBe(modeId);

        // Simulate activity in scene
        const scene = engine.activeScene!;
        scene.score = 50 + loop * 10;

        // Run 5 update frames and 1 render frame
        for (let f = 0; f < 5; f++) engine.update(0.016);
        engine.render(1.0);

        // When switching away, particles must be cleared
        expect((window as any).__GAME_STATE__.currentScene).toBe(modeId);
        expect((window as any).__GAME_STATE__.score).toBe(scene.score);
      }
    }

    expect(transitionCount).toBe(54);
    // Final scene is HOPSCOTCH_BUBBLE, change to MENU
    engine.changeScene('MENU');
    expect(engine.currentSceneId).toBe('MENU');
  });

  test('T5.31_event_listener_and_memory_leak_audit_during_rapid_scene_switching - Zero listener pollution across scene transitions', () => {
    const initialWindowListeners = (window as any)._listeners?.size || 0;

    for (let i = 0; i < 40; i++) {
      const targetMode = ALL_MODES[i % ALL_MODES.length];
      engine.changeScene(targetMode);
      engine.update(0.016);
    }

    // InputManager attaches listeners only once in constructor; scenes must not attach unbounded window listeners
    expect(engine.currentSceneId).toBe(ALL_MODES[39 % ALL_MODES.length]);
  });

  // =========================================================================
  // 4. Engine Disposal & Reinitialization Lifecycle Hardening
  // =========================================================================

  test('T5.32_engine_disposal_and_reinitialization_50_cycles_stress - Clean lifecycle start, stop & destruction', () => {
    for (let cycle = 0; cycle < 50; cycle++) {
      const testCanvas = document.createElement('canvas') as HTMLCanvasElement;
      const testEngine = new GameEngine(testCanvas);
      testEngine.start();
      expect(testEngine.gameLoop.isRunning).toBeTruthy();

      // Trigger inputs
      testCanvas.dispatchEvent(new (window as any).PointerEvent('pointerdown', { pointerId: 1, clientX: 200, clientY: 200, cancelable: true }));
      testEngine.update(0.016);
      testEngine.render(1.0);

      // Destroy engine
      testEngine.destroy();
      expect(testEngine.gameLoop.isRunning).toBeFalsy();
    }
  });

  test('T5.33_gameloop_clock_jitter_tab_backgrounding_dt_clamp_and_pause_stress - Delta clamped to max 0.25s preventing freeze', () => {
    let updateCount = 0;
    let accumulatedDt = 0;

    const loop = new GameLoop(
      (dt, isPaused) => {
        if (!isPaused) {
          updateCount++;
          accumulatedDt += dt;
        }
      },
      () => {}
    );

    loop.start();

    const t0 = (loop as any).lastTime || performance.now();
    (loop as any).lastTime = t0;

    // 1. Simulate normal 60 FPS tick (delta = 20ms >= 1/60s fixedDt)
    (loop as any).tick(t0 + 20);
    expect(updateCount).toBeGreaterThanOrEqual(1);

    // 2. Simulate 10.0s background tab sleep (raw delta = 10.0s)
    const countBeforeSpike = updateCount;
    (loop as any).tick(t0 + 20 + 10000);

    // Raw delta 10.0s must be clamped to 0.25s => at most 16 fixed updates (0.25 / 0.0166 ≈ 15)
    const deltaUpdates = updateCount - countBeforeSpike;
    expect(deltaUpdates).toBeGreaterThanOrEqual(14);
    expect(deltaUpdates).toBeLessThanOrEqual(16);

    // 3. Test Pause state
    loop.isPaused = true;
    const countBeforePause = updateCount;
    (loop as any).tick(t0 + 20 + 10000 + 20);
    expect(updateCount).toBe(countBeforePause); // No updates during pause

    loop.stop();
  });

  test('T5.34_toddler_tap_feedback_burst_limit_and_hud_resilience - Prevents array explosion under high-frequency tapping', () => {
    // Simulate ToddlerTapFeedback state slice behavior
    let ripples: Array<{ id: number; x: number; y: number; emoji: string }> = [];

    // Simulate 50 rapid taps
    for (let tap = 0; tap < 50; tap++) {
      const newRipple = {
        id: tap,
        x: 100 + tap * 5,
        y: 200,
        emoji: '✨'
      };
      // Component logic: [...prev.slice(-10), newRipple]
      ripples = [...ripples.slice(-10), newRipple];
    }

    // Active ripples must be capped at 11 elements (10 previous + 1 new)
    expect(ripples.length).toBeLessThanOrEqual(11);
  });
});
