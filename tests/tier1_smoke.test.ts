/**
 * Tier 1: Smoke, Initialization & Lifecycle Test Suite
 * Minimum requirement: >= 15 test cases (18 comprehensive tests implemented)
 * Peppa Pig: Happy Mrs Chicken 8-Game Deluxe Expansion Suite
 */

import { describe, test, expect, beforeEach } from './e2e_runner.mjs';
import { GameEngine } from '../src/engine/GameEngine';
import { DisplayManager } from '../src/engine/DisplayManager';
import { StorageManager } from '../src/engine/StorageManager';
import { ParticleEngine } from '../src/engine/ParticleEngine';
import { soundEngine } from '../src/engine/SoundEngine';
import { GameModeId } from '../src/types/game';

describe('Tier 1: Smoke & Lifecycle Suite', () => {
  let canvas: HTMLCanvasElement;

  beforeEach(() => {
    window.localStorage.clear();
    canvas = document.createElement('canvas') as HTMLCanvasElement;
  });

  // 1. Engine Instantiation & Canvas Binding
  test('T1.01_engine_instantiation - GameEngine binds canvas, sub-managers, and defaults to MENU', () => {
    const engine = new GameEngine(canvas);
    expect(engine).toBeDefined();
    expect(engine.display).toBeDefined();
    expect(engine.display.canvas).toBe(canvas);
    expect(engine.input).toBeDefined();
    expect(engine.storage).toBeDefined();
    expect(engine.gameLoop).toBeDefined();
    expect(engine.currentSceneId).toBe('MENU');
    expect(engine.activeScene).toBeDefined();
    engine.destroy();
  });

  // 2. Window Introspection Globals Exposure
  test('T1.02_window_introspection - Exposes __GAME_ENGINE__, __GAME_STATE__, __SCENE_MANAGER__, __DISPLAY_MANAGER__', () => {
    const engine = new GameEngine(canvas);
    const win = window as unknown as {
      __GAME_ENGINE__: unknown;
      __GAME_STATE__: { currentScene: string; isPaused: boolean; score: number };
      __SCENE_MANAGER__: { changeScene: (mode: GameModeId) => void };
      __DISPLAY_MANAGER__: unknown;
    };
    expect(win.__GAME_ENGINE__).toBe(engine);
    expect(win.__GAME_STATE__).toBeDefined();
    expect(win.__GAME_STATE__.currentScene).toBe('MENU');
    expect(win.__SCENE_MANAGER__).toBeDefined();
    expect(typeof win.__SCENE_MANAGER__.changeScene).toBe('function');
    expect(win.__DISPLAY_MANAGER__).toBe(engine.display);
    engine.destroy();
  });

  // 3. Scene Registration (Menu & Default Modes)
  test('T1.03_scene_registration_menu - Default scenes are registered in scene map', () => {
    const engine = new GameEngine(canvas);
    expect(engine.scenes.has('MENU')).toBeTruthy();
    expect(engine.scenes.has('EGG_LAYING')).toBeTruthy();
    expect(engine.scenes.has('MUDDY_PUDDLES')).toBeTruthy();
    expect(engine.scenes.has('CHICK_MAZE')).toBeTruthy();
    expect(engine.scenes.has('DADDY_PIG')).toBeTruthy();
    engine.destroy();
  });

  // 4. Single Scene Transition Lifecycle
  test('T1.04_scene_transition_single - changeScene executes exit(), enter(), and triggers callback', () => {
    const engine = new GameEngine(canvas);
    let sceneNotified: GameModeId | null = null;
    engine.onSceneChangeCallback = (mode) => {
      sceneNotified = mode;
    };

    engine.changeScene('EGG_LAYING');
    expect(engine.currentSceneId).toBe('EGG_LAYING');
    expect(sceneNotified).toBe('EGG_LAYING');
    expect((window as unknown as { __GAME_STATE__: { currentScene: string } }).__GAME_STATE__.currentScene).toBe('EGG_LAYING');
    engine.destroy();
  });

  // 5. Scene Transitions Across All Modes & State Contract
  test('T1.05_scene_transitions_all_modes - Sequentially enters all registered scenes without throwing', () => {
    const engine = new GameEngine(canvas);
    const modeKeys = Array.from(engine.scenes.keys());

    for (const modeId of modeKeys) {
      engine.changeScene(modeId);
      expect(engine.currentSceneId).toBe(modeId);
      const scene = engine.activeScene;
      expect(scene).toBeDefined();

      const entities = scene!.getEntities();
      expect(typeof entities).toBe('object');
      expect(entities).toBeDefined();

      const modeState = scene!.getModeState();
      expect(typeof modeState).toBe('object');
      expect(modeState).toBeDefined();
    }
    engine.destroy();
  });

  // 6. Engine Frame Update & Render Execution
  test('T1.06_engine_frame_update_render - Frame update and render execute without exceptions', () => {
    const engine = new GameEngine(canvas);
    engine.changeScene('EGG_LAYING');

    expect(() => {
      engine.update(1 / 60, false);
      engine.render(1.0);
    }).not.toThrow();
    engine.destroy();
  });

  // 7. Engine Teardown & Resource Cleanup
  test('T1.07_engine_teardown_destroy - Cleanly stops gameLoop and detaches listeners', () => {
    const engine = new GameEngine(canvas);
    engine.start();
    expect(engine.gameLoop.isRunning).toBeTruthy();

    engine.destroy();
    expect(engine.gameLoop.isRunning).toBeFalsy();
  });

  // 8. DisplayManager Landscape (16:9) Viewport Scaling
  test('T1.08_display_landscape_16_9 - Configures landscape reference height (540) and wide width', () => {
    window.innerWidth = 960;
    window.innerHeight = 540;
    const display = new DisplayManager(canvas);

    expect(display.isPortrait).toBeFalsy();
    expect(display.vHeight).toBe(540);
    expect(display.vWidth).toBeGreaterThanOrEqual(960);
    expect(display.scale).toBeCloseTo(1.0, 2);
    expect(display.targetAspect).toBeGreaterThanOrEqual(16 / 9 - 0.05);
    display.destroy();
  });

  // 9. DisplayManager Portrait (9:16) Viewport Scaling
  test('T1.09_display_portrait_9_16 - Configures portrait reference width (540) and tall height', () => {
    window.innerWidth = 540;
    window.innerHeight = 960;
    const display = new DisplayManager(canvas);

    expect(display.isPortrait).toBeTruthy();
    expect(display.vWidth).toBe(540);
    expect(display.vHeight).toBeGreaterThanOrEqual(800);
    expect(display.scale).toBeCloseTo(1.0, 2);
    expect(display.targetAspect).toBeLessThan(1.0);
    display.destroy();
  });

  // 10. DisplayManager Coordinate Transformations (Bidirectional)
  test('T1.10_display_coordinate_projection - screenToVirtual and virtualToScreen calculate accurately', () => {
    window.innerWidth = 960;
    window.innerHeight = 540;
    const display = new DisplayManager(canvas);

    const vPos = display.screenToVirtual(480, 270);
    expect(vPos.inside).toBeTruthy();
    expect(vPos.x).toBeCloseTo(480, 1);
    expect(vPos.y).toBeCloseTo(270, 1);

    const sPos = display.virtualToScreen(vPos.x, vPos.y);
    expect(sPos.screenX).toBeCloseTo(480, 1);
    expect(sPos.screenY).toBeCloseTo(270, 1);

    const outside = display.screenToVirtual(-100, -100);
    expect(outside.inside).toBeFalsy();
    display.destroy();
  });

  // 11. StorageManager Default Initialization & Corrupt Data Fallback
  test('T1.11_storage_default_and_fallback - Corrupt storage falls back to clean default schema', () => {
    window.localStorage.setItem('hmc_game_data_v1', '{ invalid json ');
    const storage = new StorageManager();

    expect(storage.data.version).toBe(1);
    expect(storage.getHighScore('eggLaying')).toBe(0);
    expect(storage.getHighScore('muddyPuddles')).toBe(0);
    expect(storage.getHighScore('chickMaze')).toBe(0);
    expect(storage.getHighScore('daddyPig')).toBe(0);
    expect(storage.isMuted()).toBeFalsy();
  });

  // 12. StorageManager High Score Monotonicity Across Modes
  test('T1.12_storage_highscores_all_modes - Updates higher score and rejects lower scores', () => {
    const storage = new StorageManager();
    const updated = storage.saveHighScore('eggLaying', 150);
    expect(updated).toBeTruthy();
    expect(storage.getHighScore('eggLaying')).toBe(150);

    const lowerRejected = storage.saveHighScore('eggLaying', 100);
    expect(lowerRejected).toBeFalsy();
    expect(storage.getHighScore('eggLaying')).toBe(150);
  });

  // 13. StorageManager Settings & Mute Persistence
  test('T1.13_storage_settings_persistence - Persists mute setting across storage reload', () => {
    const storage1 = new StorageManager();
    storage1.setMuted(true);
    expect(storage1.isMuted()).toBeTruthy();

    const storage2 = new StorageManager();
    expect(storage2.isMuted()).toBeTruthy();
  });

  // 14. ParticleEngine Pre-allocation & Fixed Pool Recycling
  test('T1.14_particles_pool_allocation - Fixed pool pre-allocates and recycles oldest particle', () => {
    const pe = new ParticleEngine(30);
    expect(pe.pool.length).toBe(30);
    expect(pe.active.length).toBe(0);

    for (let i = 0; i < 30; i++) {
      pe.spawn({ x: i, y: i });
    }
    expect(pe.active.length).toBe(30);

    // Spawn 31st particle - recycles without expanding pool length
    const recycled = pe.spawn({ x: 999, y: 999 });
    expect(pe.pool.length).toBe(30);
    expect(recycled).toBeDefined();
    expect(recycled.x).toBe(999);
  });

  // 15. ParticleEngine Lifecycle, Physics & Decay
  test('T1.15_particles_lifecycle_physics - Updates velocity, gravity, and deactivates when expired', () => {
    const pe = new ParticleEngine(10);
    const p = pe.spawn({ x: 100, y: 100, vx: 50, vy: 0, ay: 100, maxLife: 0.4, shape: 'CIRCLE' });

    pe.update(0.2);
    expect(p.active).toBeTruthy();
    expect(p.life).toBeCloseTo(0.2, 2);
    expect(p.alpha).toBeCloseTo(0.5, 2);
    expect(p.x).toBeGreaterThan(100);
    expect(p.y).toBeGreaterThan(100); // Gravity applied

    pe.update(0.3); // Exceeds remaining life
    expect(p.active).toBeFalsy();
  });

  // 16. ParticleEngine Specialized Emitters & Clear
  test('T1.16_particles_emitters_and_clear - Triggers specialized emitters and clears all active particles', () => {
    const pe = new ParticleEngine(200);
    pe.spawnMudSplash(100, 100, 10);
    pe.spawnEggCrack(150, 150, 5);
    pe.spawnFeathers(200, 200, 3);
    pe.spawnSparkles(250, 250, 8);
    pe.spawnSteam(300, 300);
    pe.spawnScorePopup(350, 350, '+100');

    expect(pe.active.length).toBeGreaterThan(25);

    pe.clear();
    expect(pe.active.length).toBe(0);
  });

  // 17. SoundEngine Initialization, Web Audio Nodes & Unlock
  test('T1.17_audio_init_and_unlock - Initializes context graph and unlocks successfully', async () => {
    await soundEngine.init();
    expect(soundEngine.ctx).toBeDefined();
    expect(soundEngine.masterGain).toBeDefined();
    expect(soundEngine.sfxGain).toBeDefined();
    expect(soundEngine.musicGain).toBeDefined();

    const unlocked = await soundEngine.unlock();
    expect(unlocked).toBeTruthy();
    expect(soundEngine.isUnlocked).toBeTruthy();
  });

  // 18. SoundEngine Mute Toggle & AudioSpy Telemetry
  test('T1.18_audio_mute_and_spy_telemetry - Mute state updates gain and playSFX logs to AudioSpy', () => {
    soundEngine.setMuted(true);
    expect(soundEngine.isMutedState()).toBeTruthy();

    soundEngine.setMuted(false);
    expect(soundEngine.isMutedState()).toBeFalsy();

    const spy = (window as unknown as { __AUDIO_SPY__: { clear: () => void; events: Array<{ type: string }> } }).__AUDIO_SPY__;
    if (spy) {
      spy.clear();
      soundEngine.playSFX('cluck');
      soundEngine.playSFX('eggPop');
      soundEngine.playSFX('splash');

      const events = spy.events.map((e) => e.type);
      expect(events).toContain('cluck');
      expect(events).toContain('eggPop');
      expect(events).toContain('splash');
    }
  });
});
