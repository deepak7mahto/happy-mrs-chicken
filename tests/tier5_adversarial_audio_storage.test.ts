/**
 * Tier 5: Milestone M5 Adversarial Hardening & Forensic Stress Suite (Challenger 2)
 * Domain: Audio Polyphony & Saturation, Storage Corruption & Boundary Fallbacks,
 *         Physics/Time-Delta Coordinate Fuzzing & Particle Pool Stress
 * Peppa Pig: Happy Mrs Chicken 8-Game Deluxe Expansion Suite
 */

import { describe, test, expect, beforeEach } from './e2e_runner.mjs';
import { GameEngine } from '../src/engine/GameEngine';
import { DisplayManager } from '../src/engine/DisplayManager';
import { InputManager } from '../src/engine/InputManager';
import { StorageManager } from '../src/engine/StorageManager';
import { ParticleEngine } from '../src/engine/ParticleEngine';
import { soundEngine, SoundEngine } from '../src/engine/SoundEngine';
import { SFXName } from '../src/types/audio';
import { EggLayingScene } from '../src/modes/EggLayingScene';
import { MuddyPuddlesScene } from '../src/modes/MuddyPuddlesScene';
import { ChickMazeScene } from '../src/modes/ChickMazeScene';
import { DaddyPigScene } from '../src/modes/DaddyPigScene';
import { DinosaurBalloonScene } from '../src/modes/DinosaurBalloonScene';
import { PancakeFlipperScene } from '../src/modes/PancakeFlipperScene';
import { VegetableHarvestScene } from '../src/modes/VegetableHarvestScene';
import { HopscotchBubbleScene } from '../src/modes/HopscotchBubbleScene';

export class MockCanvasContext {
  public calls: Array<{ method: string; args: any[] }> = [];
  public fillStyle: string | CanvasGradient | CanvasPattern = '#000000';
  public strokeStyle: string | CanvasGradient | CanvasPattern = '#000000';
  public lineWidth: number = 1;
  public font: string = '10px sans-serif';
  public textAlign: string = 'start';
  public textBaseline: string = 'alphabetic';
  public globalAlpha: number = 1.0;

  save() { this.calls.push({ method: 'save', args: [] }); }
  restore() { this.calls.push({ method: 'restore', args: [] }); }
  scale(sx: number, sy: number) { this.calls.push({ method: 'scale', args: [sx, sy] }); }
  translate(tx: number, ty: number) { this.calls.push({ method: 'translate', args: [tx, ty] }); }
  rotate(angle: number) { this.calls.push({ method: 'rotate', args: [angle] }); }
  beginPath() { this.calls.push({ method: 'beginPath', args: [] }); }
  closePath() { this.calls.push({ method: 'closePath', args: [] }); }
  moveTo(x: number, y: number) { this.calls.push({ method: 'moveTo', args: [x, y] }); }
  lineTo(x: number, y: number) { this.calls.push({ method: 'lineTo', args: [x, y] }); }
  arc(x: number, y: number, r: number, s: number, e: number) { this.calls.push({ method: 'arc', args: [x, y, r, s, e] }); }
  ellipse(x: number, y: number, rx: number, ry: number, rot: number, s: number, e: number) { this.calls.push({ method: 'ellipse', args: [x, y, rx, ry, rot, s, e] }); }
  rect(x: number, y: number, w: number, h: number) { this.calls.push({ method: 'rect', args: [x, y, w, h] }); }
  roundRect(x: number, y: number, w: number, h: number, r: number) { this.calls.push({ method: 'roundRect', args: [x, y, w, h, r] }); }
  fill() { this.calls.push({ method: 'fill', args: [] }); }
  stroke() { this.calls.push({ method: 'stroke', args: [] }); }
  fillRect(x: number, y: number, w: number, h: number) { this.calls.push({ method: 'fillRect', args: [x, y, w, h] }); }
  strokeRect(x: number, y: number, w: number, h: number) { this.calls.push({ method: 'strokeRect', args: [x, y, w, h] }); }
  fillText(text: string, x: number, y: number) { this.calls.push({ method: 'fillText', args: [text, x, y] }); }
  strokeText(text: string, x: number, y: number) { this.calls.push({ method: 'strokeText', args: [text, x, y] }); }
  drawImage() { this.calls.push({ method: 'drawImage', args: [] }); }
}

describe('Tier 5: Audio Polyphony, Storage Corruption & Physics/Particle Pool Stress Suite (Challenger 2)', () => {
  let canvas: HTMLCanvasElement;
  let engine: GameEngine;

  beforeEach(() => {
    window.localStorage.clear();
    canvas = document.createElement('canvas') as HTMLCanvasElement;
    canvas.width = 540;
    canvas.height = 960;
    engine = new GameEngine(canvas);
  });

  // =========================================================================
  // 1. Audio Polyphony & Saturation Stress
  // =========================================================================
  test('T5.01_audio_polyphony_saturation - Concurrently triggers all 18 SFX recipes with 540+ rapid calls without crash or NaN', async () => {
    await soundEngine.init();
    await soundEngine.unlock();
    soundEngine.spy.clear();

    const allSFX: SFXName[] = [
      'cluck', 'eggPop', 'crack', 'hatch', 'splash', 'seedDrop', 'fanfare', 'crash',
      'click', 'dinosaurRoar', 'balloonPop', 'pancakeSizzle', 'whoosh', 'veggiePop',
      'mudThud', 'bubblePop', 'sheepBleat', 'toddlerGiggle'
    ];

    expect(allSFX.length).toBe(18);

    // Blast all 18 sounds 30 times each (540 sound triggers in total)
    for (let round = 0; round < 30; round++) {
      for (const sfx of allSFX) {
        soundEngine.playSFX(sfx, { volume: 0.8, intensity: 1.2, type: 'high' });
      }
    }

    // Verify spy telemetry tracked up to max ring buffer (500 events)
    expect(soundEngine.spy.events.length).toBe(500);
    const splashEvents = soundEngine.spy.getEventsByType('splash');
    expect(splashEvents.length).toBeGreaterThan(0);

    // Verify AudioContext and masterGain are non-null and gain is not NaN
    expect(soundEngine.ctx).toBeDefined();
    expect(soundEngine.masterGain).toBeDefined();
    if (soundEngine.masterGain) {
      expect(isNaN(soundEngine.masterGain.gain.value)).toBeFalsy();
      expect(soundEngine.masterGain.gain.value).toBeGreaterThanOrEqual(0);
    }
  });

  test('T5.02_audio_extreme_parameter_fuzzing - Audio synthesizer handles NaN, Infinity, negative and extreme options safely', async () => {
    await soundEngine.init();

    // Extreme/invalid SFX parameters
    expect(() => {
      soundEngine.synth.playSplash(NaN);
      soundEngine.synth.playSplash(Infinity);
      soundEngine.synth.playSplash(-500);
      soundEngine.synth.playSplash(10000);
      soundEngine.synth.playCluck('invalid_unknown_type');
      soundEngine.synth.playTone(NaN, NaN, 'sine', NaN);
      soundEngine.synth.playTone(Infinity, 0.1, 'triangle', -5);
      soundEngine.setVolume(NaN);
      soundEngine.setVolume(Infinity);
      soundEngine.setVolume(-10);
      soundEngine.setVolume(5.5);
    }).not.toThrow();

    // Volume clamped [0, 1]
    expect(soundEngine.holder.volume).toBeGreaterThanOrEqual(0);
    expect(soundEngine.holder.volume).toBeLessThanOrEqual(1.0);
  });

  test('T5.03_audio_bgm_tempo_shifts_and_ducking - Rapid tempo swings (30 to 500 BPM) and repeated ducking maintain timing integrity', async () => {
    await soundEngine.init();
    await soundEngine.unlock();

    soundEngine.startBGM();
    expect(soundEngine.sequencer.isRunning).toBeTruthy();

    const extremeBPMs = [30, 60, 240, 500, 128, -50, 0, 200, 150];
    for (const bpm of extremeBPMs) {
      soundEngine.setBGMTempo(bpm);
      const clamped = Math.max(60, Math.min(220, bpm));
      if (bpm >= 60 && bpm <= 220) {
        expect(soundEngine.sequencer.tempo).toBe(clamped);
      }
    }

    // Rapid ducking triggers
    for (let i = 0; i < 20; i++) {
      soundEngine.sequencer.duckBGM(0.5);
    }

    expect(soundEngine.musicGain).toBeDefined();
    soundEngine.stopBGM();
    expect(soundEngine.sequencer.isRunning).toBeFalsy();
  });

  test('T5.04_audio_mute_toggle_under_concurrency - Rapid mute oscillations synchronize audio state without scheduler corruption', async () => {
    await soundEngine.init();
    await soundEngine.unlock();
    soundEngine.startBGM();

    for (let i = 0; i < 100; i++) {
      const isMuted = soundEngine.toggleMute();
      expect(soundEngine.isMuted).toBe(isMuted);
      if (soundEngine.masterGain) {
        const expectedGain = isMuted ? 0 : soundEngine.holder.volume;
        expect(soundEngine.masterGain.gain.value).toBe(expectedGain);
      }
      soundEngine.playSFX('eggPop');
      soundEngine.playSFX('dinosaurRoar');
    }

    soundEngine.setMuted(false);
    expect(soundEngine.isMuted).toBeFalsy();
    soundEngine.stopBGM();
  });

  // =========================================================================
  // 2. StorageManager Corruption & Boundary Fallbacks
  // =========================================================================
  test('T5.05_storage_corrupted_json_resilience - StorageManager recovers safely from malformed JSON and garbage strings', () => {
    const corruptedPayloads = [
      '{broken JSON content [[',
      'undefined',
      'null',
      '42',
      '"string only"',
      '{"highScores": "not an object"}',
      '{"highScores": {"eggLaying": "NaN_SCORE", "muddyPuddles": null}}',
      ''
    ];

    for (const payload of corruptedPayloads) {
      window.localStorage.setItem('hmc_game_data_v1', payload);
      const storage = new StorageManager();
      const loaded = storage.load();

      expect(loaded).toBeDefined();
      expect(loaded.highScores).toBeDefined();
      expect(typeof loaded.highScores.eggLaying).toBe('number');
      expect(isNaN(loaded.highScores.eggLaying)).toBeFalsy();
      expect(typeof loaded.highScores.muddyPuddles).toBe('number');
      expect(loaded.highScores.muddyPuddles).toBeGreaterThanOrEqual(0);
      expect(loaded.settings).toBeDefined();
      expect(typeof loaded.settings.volume).toBe('number');
      expect(loaded.settings.volume).toBeGreaterThanOrEqual(0);
    }
  });

  test('T5.06_storage_extreme_numeric_boundaries - Handles MAX_SAFE_INTEGER, Infinity, NaN, and negative scores robustly', () => {
    const storage = new StorageManager();

    // Positive extreme
    storage.saveHighScore('EGG_LAYING', Number.MAX_SAFE_INTEGER);
    expect(storage.getHighScore('EGG_LAYING')).toBe(Number.MAX_SAFE_INTEGER);

    // Negative score rejection (should not overwrite existing high score)
    const saved = storage.saveHighScore('EGG_LAYING', -999);
    expect(saved).toBeFalsy();
    expect(storage.getHighScore('EGG_LAYING')).toBe(Number.MAX_SAFE_INTEGER);

    // Key normalization test across all 8 modes on fresh storage instance
    const storage2 = new StorageManager();
    storage2.resetAll();

    const modeMappings = [
      { key: 'EGG_LAYING', prop: 'eggLaying' },
      { key: 'MUDDY_PUDDLES', prop: 'muddyPuddles' },
      { key: 'CHICK_MAZE', prop: 'chickMaze' },
      { key: 'DADDY_PIG', prop: 'daddyPig' },
      { key: 'DINOSAUR_BALLOON', prop: 'dinosaurBalloon' },
      { key: 'PANCAKE_FLIPPER', prop: 'pancakeFlipper' },
      { key: 'VEGETABLE_HARVEST', prop: 'vegetableHarvest' },
      { key: 'HOPSCOTCH_BUBBLE', prop: 'hopscotchBubble' },
      { key: 'classic', prop: 'eggLaying' },
      { key: 'pancake-flip', prop: 'pancakeFlipper' },
      { key: 'balloon-pop', prop: 'dinosaurBalloon' }
    ];

    for (const mapping of modeMappings) {
      storage2.saveHighScore(mapping.key, 125);
      expect(storage2.getHighScore(mapping.key)).toBe(125);
    }
  });

  test('T5.07_storage_quota_exceeded_error_handling - Gracefully handles localStorage QuotaExceeded exceptions without crashing', () => {
    const storage = new StorageManager();
    const origSetItem = window.localStorage.setItem;

    try {
      // Simulate quota exceeded
      window.localStorage.setItem = () => {
        throw new Error('QuotaExceededError: DOM Exception 22');
      };

      const saveResult = storage.save();
      expect(saveResult).toBeFalsy();
      const scoreResult = storage.saveHighScore('daddyPig', 9999);
      expect(scoreResult).toBeTruthy(); // in-memory updated
      expect(storage.getHighScore('daddyPig')).toBe(9999);
    } finally {
      // Guaranteed restoration of localStorage mock
      window.localStorage.setItem = origSetItem;
    }

    storage.resetAll();
    expect(storage.getHighScore('daddyPig')).toBe(0);
  });

  // =========================================================================
  // 3. Physics & Time Delta (dt) Fuzzing Across Mini-Game Scenes
  // =========================================================================
  test('T5.08_physics_dt_fuzzing_all_modes - All 8 mini-game scenes survive dt <= 0 and extreme dt > 10s without NaN positions', () => {
    const scenes = [
      new EggLayingScene(engine),
      new MuddyPuddlesScene(engine),
      new ChickMazeScene(engine),
      new DaddyPigScene(engine),
      new DinosaurBalloonScene(engine),
      new PancakeFlipperScene(engine),
      new VegetableHarvestScene(engine),
      new HopscotchBubbleScene(engine)
    ];

    const extremeDTs = [0, -0.016, -10.0, 15.0, 0.00001, 100.0];

    for (const scene of scenes) {
      scene.enter();
      for (const dt of extremeDTs) {
        expect(() => {
          scene.update(dt, engine.input);
        }).not.toThrow();
      }

      // Verify mode state contains no NaN
      const state = scene.getModeState();
      expect(state).toBeDefined();
      expect(isNaN(scene.score)).toBeFalsy();
      scene.exit();
    }
  });

  test('T5.09_physics_muddy_puddles_extreme_jumping - Rapid jump spam and boundary velocity accumulation do not break Peppa physics', () => {
    const scene = new MuddyPuddlesScene(engine);
    scene.enter();

    // Simulate 100 rapid jump requests
    for (let i = 0; i < 100; i++) {
      scene.jump();
      scene.peppa.vx = (i % 2 === 0 ? 1 : -1) * 2000; // Extreme lateral velocity
      scene.update(0.016, engine.input);
    }

    expect(isNaN(scene.peppa.x)).toBeFalsy();
    expect(isNaN(scene.peppa.y)).toBeFalsy();
    expect(isNaN(scene.peppa.jumpY)).toBeFalsy();
    expect(scene.peppa.jumpY).toBeLessThanOrEqual(0); // Jump offset is negative or 0
    expect(scene.peppa.x).toBeGreaterThanOrEqual(50);
    expect(scene.peppa.x).toBeLessThanOrEqual(engine.display.vWidth - 50);
    scene.exit();
  });

  test('T5.10_physics_pancake_flipper_flight_and_multiplier - Parabolic flips and cook timing preserve stack stability', () => {
    const scene = new PancakeFlipperScene(engine);
    scene.enter();

    for (let flip = 0; flip < 10; flip++) {
      // Step past newPancakeDelay cooldown if active
      for (let d = 0; d < 35; d++) {
        scene.update(0.016, engine.input);
      }

      scene.flipPancake();
      expect(scene.isAirborne).toBeTruthy();

      // Step until pancake lands
      for (let s = 0; s < 120; s++) {
        scene.update(0.016, engine.input);
        if (!scene.isAirborne) break;
      }
    }

    expect(scene.stackCount).toBeGreaterThan(0);
    expect(scene.stackedPancakes.length).toBe(scene.stackCount);
    expect(isNaN(scene.score)).toBeFalsy();
    expect(scene.multiplier).toBeGreaterThanOrEqual(1);
    expect(scene.multiplier).toBeLessThanOrEqual(10);
    scene.exit();
  });

  test('T5.11_physics_vegetable_harvest_1000_pulls_stress - Multi-pointer pulls and pumpkin multi-stage tugs calculate valid flight trajectories', () => {
    const scene = new VegetableHarvestScene(engine);
    scene.enter();

    // 1000 pull updates
    for (let i = 0; i < 1000; i++) {
      scene.update(0.016, engine.input);
      // Simulate spacebar instant harvests
      if (i % 50 === 0) {
        for (const m of scene.mounds) {
          if (m.vegetable && !m.vegetable.isHarvested && !m.vegetable.isFlying) {
            (scene as any).triggerVegetableHarvest(m.vegetable, 120, 400);
            break;
          }
        }
      }
    }

    expect(isNaN(scene.score)).toBeFalsy();
    expect(scene.harvestedCount).toBeGreaterThan(0);
    for (const m of scene.mounds) {
      if (m.vegetable && m.vegetable.isFlying) {
        expect(isNaN(m.vegetable.x)).toBeFalsy();
        expect(isNaN(m.vegetable.y)).toBeFalsy();
      }
    }
    scene.exit();
  });

  test('T5.12_physics_chick_flocking_singularity_avoidance - Zero-distance overlapping chicks resolve separation without NaN', () => {
    const scene = new ChickMazeScene(engine);
    scene.enter();

    // Force 30 chicks onto the exact same coordinates (singularity test)
    scene.chicks = [];
    for (let i = 0; i < 30; i++) {
      scene.chicks.push({
        x: 200,
        y: 200,
        vx: 0,
        vy: 0,
        walkCycle: 0,
        facingLeft: false,
        state: 'WANDERING'
      });
    }

    // Step simulation
    for (let frame = 0; frame < 60; frame++) {
      scene.update(0.016, engine.input);
    }

    for (const c of scene.chicks) {
      expect(isNaN(c.x)).toBeFalsy();
      expect(isNaN(c.y)).toBeFalsy();
      expect(isNaN(c.vx)).toBeFalsy();
      expect(isNaN(c.vy)).toBeFalsy();
    }
    scene.exit();
  });

  // =========================================================================
  // 4. Particle Pool Stress & Recycling
  // =========================================================================
  test('T5.13_particle_pool_saturation_and_recycling - Spawning 1000+ particles on fixed pool recycles oldest without array growth', () => {
    const enginePool = new ParticleEngine(150);
    expect(enginePool.pool.length).toBe(150);

    // Massive spawn loop (1000 particle emissions)
    for (let i = 0; i < 100; i++) {
      enginePool.spawnFeathers(200, 200, 5);
      enginePool.spawnSparkles(200, 200, 10);
      enginePool.spawnEggCrack(200, 200, 8);
      enginePool.spawnConfetti(200, 200, 15);
      enginePool.spawnSoapBubbles(200, 200, 8);
      enginePool.spawnPancakeSyrup(200, 200, 6);
      enginePool.spawnMudSplash(200, 200, 12);
      enginePool.update(0.016);
    }

    // Pool size must remain strictly constant
    expect(enginePool.pool.length).toBe(150);
    expect(enginePool.active.length).toBeLessThanOrEqual(150);

    // Mock render with spy context
    const spyCtx = new MockCanvasContext() as unknown as CanvasRenderingContext2D;
    expect(() => {
      enginePool.render(spyCtx);
    }).not.toThrow();
  });

  test('T5.14_particle_fuzzed_parameters_render_safety - Particle engine handles fuzzed coordinates, zero life and negative drag', () => {
    const enginePool = new ParticleEngine(50);

    enginePool.spawn({ x: NaN, y: Infinity, vx: 1e8, vy: -1e8, maxLife: 0, drag: -1, type: 'sparkle' });
    enginePool.spawn({ x: 100, y: 100, size: -50, maxLife: -2, drag: 0, type: 'feather' });
    enginePool.spawn({ x: 200, y: 200, text: 'Pop!', size: 20, type: 'text', shape: 'TEXT' });

    expect(() => {
      enginePool.update(0.016);
      const spyCtx = new MockCanvasContext() as unknown as CanvasRenderingContext2D;
      enginePool.render(spyCtx);
    }).not.toThrow();

    enginePool.clear();
    expect(enginePool.active.length).toBe(0);
  });
});
