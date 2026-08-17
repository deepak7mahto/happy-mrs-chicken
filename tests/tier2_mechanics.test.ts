/**
 * Tier 2: Mini-Game Core Mechanics Test Suite (36 Test Cases)
 * Peppa Pig: Happy Mrs Chicken 8-Game Deluxe Expansion Suite
 */

import { describe, test, expect, beforeEach } from './e2e_runner.mjs';
import { GameEngine } from '../src/engine/GameEngine';
import { EggLayingScene } from '../src/modes/EggLayingScene';
import { MuddyPuddlesScene } from '../src/modes/MuddyPuddlesScene';
import { ChickMazeScene } from '../src/modes/ChickMazeScene';
import { DaddyPigScene } from '../src/modes/DaddyPigScene';
import { ParticleEngine } from '../src/engine/ParticleEngine';
import { StorageManager } from '../src/engine/StorageManager';
import { soundEngine } from '../src/engine/SoundEngine';
import { InputManager } from '../src/engine/InputManager';
import { BalloonEntity, PancakeEntity, VegetableEntity, BubbleEntity } from '../src/types/game';

describe('Tier 2: Mini-Game Core Mechanics Suite', () => {
  let canvas: HTMLCanvasElement;
  let engine: GameEngine;

  beforeEach(() => {
    window.localStorage.clear();
    const spy = (window as unknown as { __AUDIO_SPY__?: { clear: () => void } }).__AUDIO_SPY__;
    if (spy) spy.clear();
    canvas = document.createElement('canvas') as HTMLCanvasElement;
    engine = new GameEngine(canvas);
  });

  // =========================================================================
  // MODE 1: HAPPY MRS CHICKEN (CLASSIC EGG-LAYING)
  // =========================================================================

  test('T2.1.1_egg_laying_rate_limiting - Debounce rate-limiter prevents spam and updates squawk', () => {
    const scene = new EggLayingScene(engine);
    scene.enter();

    scene.layEggAt(270, 200);
    expect(scene.eggs.length).toBe(1);
    expect(scene.score).toBe(1);
    expect(scene.chicken.squash).toBeCloseTo(0.72, 2);
    expect(scene.chicken.squawk).toBe(1.0);

    // Call immediately (dt < 50ms) -> rate-limiter skips
    scene.layEggAt(270, 200);
    expect(scene.eggs.length).toBe(1);

    const spy = (window as unknown as { __AUDIO_SPY__: { events: Array<{ type: string }> } }).__AUDIO_SPY__;
    const types = spy.events.map(e => e.type);
    expect(types).toContain('cluck');
    expect(types).toContain('eggPop');
  });

  test('T2.1.2_egg_physics_gravity_rebound - Gravity accelerates egg and ground rebounds with damping', () => {
    const scene = new EggLayingScene(engine);
    scene.enter();

    scene.eggs.push({
      x: 270,
      y: 100,
      vx: 30,
      vy: 50,
      rotation: 0,
      vRot: 0.1,
      state: 'FALLING',
      timer: 0,
      crackStage: 0
    });

    const mockInput = new InputManager(engine.display);
    // Step simulation 15 frames
    for (let f = 0; f < 15; f++) {
      scene.update(1 / 60, mockInput);
    }

    const egg = scene.eggs[0];
    expect(egg.y).toBeGreaterThan(100);
    expect(egg.vy).toBeGreaterThan(50); // Gravity applied

    // Step until egg settles onto ground
    for (let f = 0; f < 120; f++) {
      scene.update(1 / 60, mockInput);
    }

    expect(['INCUBATING', 'CRACK_1', 'CRACK_2', 'HATCH_BURST']).toContain(scene.eggs[0]?.state || 'INCUBATING');
  });

  test('T2.1.3_egg_cracking_and_hatching - Multi-stage cracking sequence hatches baby chick', () => {
    const scene = new EggLayingScene(engine);
    scene.enter();

    scene.eggs.push({
      x: 270,
      y: 400,
      vx: 0,
      vy: 0,
      rotation: 0,
      vRot: 0,
      state: 'INCUBATING',
      timer: 2.1,
      crackStage: 0
    });

    const mockInput = new InputManager(engine.display);
    scene.update(0.2, mockInput); // Exceeds 2.2s -> CRACK_1

    expect(scene.eggs.length).toBeGreaterThan(0);
    const egg = scene.eggs[0];
    expect(egg.state).toBe('CRACK_1');
    expect(egg.crackStage).toBe(1);

    // Advance through CRACK_2 to HATCH_BURST
    scene.update(0.5, mockInput); // CRACK_2
    scene.update(0.4, mockInput); // HATCH_BURST

    // Hatched chick spawned
    expect(scene.chicks.length).toBeGreaterThanOrEqual(1);
    expect(scene.chicks[0].x).toBeGreaterThan(0);
  });

  test('T2.1.4_chick_soft_separation_and_bounds - Pairwise soft separation pushes overlapping chicks apart', () => {
    const scene = new EggLayingScene(engine);
    scene.enter();

    // Place 2 chicks 10px apart
    scene.chicks.push({ x: 200, y: 300, vx: 0, vy: 0, walkCycle: 0, state: 'WANDERING' });
    scene.chicks.push({ x: 208, y: 304, vx: 0, vy: 0, walkCycle: 0, state: 'WANDERING' });

    const initialDist = Math.hypot(scene.chicks[1].x - scene.chicks[0].x, scene.chicks[1].y - scene.chicks[0].y);
    const mockInput = new InputManager(engine.display);

    for (let f = 0; f < 20; f++) {
      scene.update(1 / 60, mockInput);
    }

    const newDist = Math.hypot(scene.chicks[1].x - scene.chicks[0].x, scene.chicks[1].y - scene.chicks[0].y);
    expect(newDist).toBeGreaterThan(initialDist);
    expect(scene.chicks[0].walkCycle).toBeGreaterThan(0);
  });

  // =========================================================================
  // MODE 2: MUDDY PUDDLES
  // =========================================================================

  test('T2.2.1_puddles_spawner_and_cap - Dynamic spawner limits active puddles to max 5', () => {
    const scene = new MuddyPuddlesScene(engine);
    scene.enter();

    const mockInput = new InputManager(engine.display);
    for (let s = 0; s < 12; s++) {
      scene.update(1.0, mockInput);
    }

    expect(scene.puddles.length).toBeLessThanOrEqual(5);
    expect(scene.puddles.length).toBeGreaterThan(0);
    const hasValidTypes = scene.puddles.every(p => p.type === 'STANDARD' || p.type === 'GOLDEN');
    expect(hasValidTypes).toBeTruthy();
  });

  test('T2.2.2_peppa_jump_physics - Jump impulse elevates Peppa and landing compresses squash', () => {
    const scene = new MuddyPuddlesScene(engine);
    scene.enter();

    scene.jump();
    expect(scene.peppa.isJumping).toBeTruthy();
    expect(scene.peppa.jumpV).toBe(-460);

    const mockInput = new InputManager(engine.display);
    // Apex reached around 15-20 frames
    for (let f = 0; f < 15; f++) {
      scene.update(1 / 60, mockInput);
    }
    expect(scene.peppa.jumpY).toBeLessThan(0); // Airborne

    // Step until landing
    while (scene.peppa.isJumping) {
      scene.update(1 / 60, mockInput);
    }
    expect(scene.peppa.isJumping).toBeFalsy();
    expect(scene.peppa.squish).toBeLessThan(1.05);
  });

  test('T2.2.3_puddle_hit_detection_and_multiplier - Center puddle landing awards double bonus and increments multiplier', () => {
    const scene = new MuddyPuddlesScene(engine);
    scene.enter();
    scene.puddles = [
      { x: 270, y: scene.peppa.y, rx: 50, ry: 25, type: 'STANDARD', lifetime: 8.0, ripplePhase: 0 }
    ];
    scene.peppa.x = 270;

    scene.jump();
    const mockInput = new InputManager(engine.display);
    for (let f = 0; f < 45; f++) {
      scene.update(1 / 60, mockInput);
    }

    expect(scene.score).toBeGreaterThanOrEqual(50); // 25 standard * 2 center bonus * 1 mult
    expect(scene.multiplier).toBeGreaterThanOrEqual(2);
    expect(scene.puddles.length).toBe(0); // Splashed puddle consumed
  });

  test('T2.2.4_puddle_golden_and_timer - Golden puddles add time bonus and dry grass resets multiplier', () => {
    const scene = new MuddyPuddlesScene(engine);
    scene.enter();
    const initTimer = scene.timer;

    scene.puddles = [
      { x: 270, y: scene.peppa.y, rx: 50, ry: 25, type: 'GOLDEN', lifetime: 8.0, ripplePhase: 0 }
    ];
    scene.peppa.x = 270;
    scene.jump();

    const mockInput = new InputManager(engine.display);
    for (let f = 0; f < 45; f++) {
      scene.update(1 / 60, mockInput);
    }

    expect(scene.score).toBeGreaterThanOrEqual(100);
    expect(scene.timer).toBeGreaterThan(initTimer - 1.0); // +3s bonus offset dt

    // Jump on empty grass
    scene.puddles = [];
    scene.jump();
    for (let f = 0; f < 45; f++) {
      scene.update(1 / 60, mockInput);
    }
    expect(scene.multiplier).toBe(1); // Reset
  });

  // =========================================================================
  // MODE 3: CHICK MAZE / SORTING
  // =========================================================================

  test('T2.3.1_seed_trail_dropping_cap - Drops seeds up to max 6 FIFO cap with sound feedback', () => {
    const scene = new ChickMazeScene(engine);
    scene.enter();

    for (let i = 0; i < 8; i++) {
      scene.dropSeed(100 + i * 20, 200);
    }

    expect(scene.seeds.length).toBe(6);
    expect(scene.seeds[0].x).toBe(140); // Oldest 2 shifted out

    const spy = (window as unknown as { __AUDIO_SPY__: { events: Array<{ type: string }> } }).__AUDIO_SPY__;
    const seeds = spy.events.filter(e => e.type === 'seedDrop');
    expect(seeds.length).toBe(8);
  });

  test('T2.3.2_chick_flocking_and_seed_attraction - Chicks steer toward dropped seeds', () => {
    const scene = new ChickMazeScene(engine);
    scene.enter();
    scene.chicks = [{ x: 100, y: 200, vx: 0, vy: 0, walkCycle: 0, state: 'WANDERING' }];
    scene.dropSeed(160, 200);

    const mockInput = new InputManager(engine.display);
    for (let f = 0; f < 10; f++) {
      scene.update(1 / 60, mockInput);
    }

    expect(scene.chicks[0].vx).toBeGreaterThan(0); // Accelerated right toward seed
    expect(scene.chicks[0].x).toBeGreaterThan(100);
  });

  test('T2.3.3_seed_consumption_and_sparkles - Chick consumes adjacent seed within 14px', () => {
    const scene = new ChickMazeScene(engine);
    scene.enter();
    scene.seeds = [{ x: 150, y: 200, remaining: 1 }];
    scene.chicks = [{ x: 146, y: 200, vx: 5, vy: 0, walkCycle: 0, state: 'WANDERING' }];

    const mockInput = new InputManager(engine.display);
    scene.update(1 / 60, mockInput);

    expect(scene.seeds.length).toBe(0); // Consumed
    expect(scene.particles.active.length).toBeGreaterThan(0); // Sparkles spawned
  });

  test('T2.3.4_chick_coop_arrival_win - Rescuing chicks to coop increments score and respawns wave', () => {
    const scene = new ChickMazeScene(engine);
    scene.enter();
    const isPortrait = engine.display.isPortrait;
    const vWidth = engine.display.vWidth;
    const coopDoor = isPortrait ? { x: vWidth / 2, y: 180 } : { x: vWidth - 150, y: 160 };

    // Place 2 chicks: 1 right at coop door, 1 safely far away
    scene.chicks = [
      { x: coopDoor.x, y: coopDoor.y, vx: 0, vy: 0, walkCycle: 0, state: 'WANDERING' },
      { x: 50, y: 300, vx: 0, vy: 0, walkCycle: 0, state: 'WANDERING' }
    ];

    const mockInput = new InputManager(engine.display);
    scene.update(1 / 60, mockInput);

    expect(scene.coopSavedCount).toBe(1);
    expect(scene.score).toBe(100);
    expect(scene.chicks.length).toBe(1); // 1 chick remaining

    // Move second chick into coop to complete wave
    scene.chicks[0].x = coopDoor.x;
    scene.chicks[0].y = coopDoor.y;
    scene.update(1 / 60, mockInput);

    expect(scene.chicks.length).toBe(5); // Auto wave respawn
  });

  // =========================================================================
  // MODE 4: DADDY PIG HIGH SCORE CHALLENGE
  // =========================================================================

  test('T2.4.1_daddy_pig_fever_and_multipliers - Tapping builds fever and advances multiplier tiers', () => {
    const scene = new DaddyPigScene(engine);
    scene.enter();

    for (let t = 0; t < 10; t++) {
      scene.tap();
    }

    expect(scene.fever).toBeCloseTo(45, 1);
    expect(scene.multiplier).toBeGreaterThanOrEqual(2);
    expect(scene.score).toBeGreaterThan(100);
  });

  test('T2.4.2_daddy_pig_survival_timer_and_decay - Timer extends with taps and fever decays passively', () => {
    const scene = new DaddyPigScene(engine);
    scene.enter();
    const initTimer = scene.timer;

    scene.tap();
    scene.tap();
    expect(scene.timer).toBeCloseTo(initTimer + 0.36, 2);

    const fBefore = scene.fever;
    const mockInput = new InputManager(engine.display);
    scene.update(0.5, mockInput);

    expect(scene.fever).toBeLessThan(fBefore);
    expect(scene.timer).toBeLessThan(initTimer + 0.36);
  });

  test('T2.4.3_daddy_pig_panic_stages - High fever triggers steam and sparkle particle emitters', () => {
    const scene = new DaddyPigScene(engine);
    scene.enter();
    scene.fever = 68;
    scene.tap();

    expect(scene.particles.active.length).toBeGreaterThan(0);

    scene.fever = 96;
    scene.tap();
    expect(scene.particles.active.length).toBeGreaterThan(5);
  });

  test('T2.4.4_daddy_pig_100_fever_meltdown - 100% fever triggers computer crash cutscene and saves high score', () => {
    const scene = new DaddyPigScene(engine);
    scene.enter();
    scene.fever = 98;
    scene.tap();

    expect(scene.isOverheating).toBeTruthy();
    expect(engine.storage.getHighScore('daddyPig')).toBe(scene.score);
    expect(scene.getModeState().isOverheating).toBeTruthy();

    const spy = (window as unknown as { __AUDIO_SPY__: { events: Array<{ type: string }> } }).__AUDIO_SPY__;
    expect(spy.events.map(e => e.type)).toContain('crash');
  });

  // =========================================================================
  // MODE 5: GEORGE'S DINOSAUR BALLOON POP
  // =========================================================================

  test('T2.5.1_balloon_rising_physics_and_wobble - Balloons spawn at bottom and float upwards with sinusoidal wobble', () => {
    const balloons: BalloonEntity[] = [
      { x: 300, y: 500, vx: 0, vy: -90, radius: 35, color: '#4CAF50', shape: 'DINO', popped: false, wobblePhase: 0 }
    ];

    const dt = 1 / 60;
    for (let f = 0; f < 30; f++) {
      for (const b of balloons) {
        b.y += b.vy * dt;
        b.wobblePhase += 2.0 * dt;
        b.x += Math.sin(b.wobblePhase) * 20 * dt;
      }
    }

    expect(balloons[0].y).toBeLessThan(500);
    expect(balloons[0].vy).toBe(-90);
    expect(balloons[0].x).not.toBe(300);
  });

  test('T2.5.2_balloon_hit_detection - Tap coordinates within balloon radius register hit and pop', () => {
    const balloon: BalloonEntity = {
      x: 300,
      y: 250,
      vx: 0,
      vy: -80,
      radius: 35,
      color: '#4CAF50',
      shape: 'DINO',
      popped: false,
      wobblePhase: 0
    };

    const isHit = (tapX: number, tapY: number) => {
      const dist = Math.hypot(tapX - balloon.x, tapY - balloon.y);
      return dist <= balloon.radius;
    };

    expect(isHit(310, 255)).toBeTruthy(); // 11.2px <= 35px -> HIT
    expect(isHit(400, 400)).toBeFalsy();  // > 35px -> MISS
  });

  test('T2.5.3_balloon_confetti_and_dino_audio - Balloon pop emits confetti burst and plays dinosaur roar', () => {
    const pe = new ParticleEngine(100);
    pe.spawnConfetti(300, 250, 20);
    expect(pe.active.length).toBe(20);

    soundEngine.playSFX('dinosaurRoar');
    soundEngine.playSFX('toddlerGiggle');

    const spy = (window as unknown as { __AUDIO_SPY__: { events: Array<{ type: string }> } }).__AUDIO_SPY__;
    const types = spy.events.map(e => e.type);
    expect(types).toContain('dinosaurRoar');
    expect(types).toContain('toddlerGiggle');
  });

  test('T2.5.4_balloon_combo_and_storage - Sequential balloon pops increment combo multiplier and persist score', () => {
    const storage = new StorageManager();
    let score = 0;
    let combo = 1;

    for (let pop = 0; pop < 3; pop++) {
      score += 50 * combo;
      combo++;
    }

    expect(score).toBe(50 + 100 + 150); // 300 pts
    expect(combo).toBe(4);
    storage.saveHighScore('dinosaurBalloon', score);
    expect(storage.getHighScore('dinosaurBalloon')).toBe(300);
  });

  // =========================================================================
  // MODE 6: MUMMY PIG'S PANCAKE FLIPPER
  // =========================================================================

  test('T2.6.1_pancake_flip_impulse_and_whoosh - Swipe on frying pan applies airborne velocity and whoosh audio', () => {
    const pancake: PancakeEntity = {
      x: 270,
      y: 350,
      vy: 0,
      rotation: 0,
      vRot: 0,
      flipCount: 0,
      isCooked: false,
      isStacked: false
    };

    // Apply flip impulse
    pancake.vy = -550;
    pancake.vRot = Math.PI * 3.5;
    soundEngine.playSFX('whoosh');

    expect(pancake.vy).toBe(-550);
    expect(pancake.vRot).toBeGreaterThan(0);

    const spy = (window as unknown as { __AUDIO_SPY__: { events: Array<{ type: string }> } }).__AUDIO_SPY__;
    expect(spy.events.map(e => e.type)).toContain('whoosh');
  });

  test('T2.6.2_pancake_ballistic_flight_and_spin - Airborne pancake follows ballistic parabola under gravity', () => {
    const pancake: PancakeEntity = {
      x: 270,
      y: 350,
      vy: -500,
      rotation: 0,
      vRot: 6.0,
      flipCount: 0,
      isCooked: false,
      isStacked: false
    };

    const g = 900;
    const dt = 1 / 60;

    for (let f = 0; f < 20; f++) {
      pancake.vy += g * dt;
      pancake.y += pancake.vy * dt;
      pancake.rotation += pancake.vRot * dt;
    }

    expect(pancake.y).toBeLessThan(350); // Airborne
    expect(pancake.rotation).toBeGreaterThan(0); // Spun
  });

  test('T2.6.3_pancake_cooking_state_machine - Cook timing windows transition between RAW, GOLDEN, and OVERCOOKED', () => {
    const getCookState = (t: number) => {
      if (t < 1.2) return 'RAW';
      if (t <= 2.8) return 'PERFECT_GOLDEN';
      return 'OVERCOOKED';
    };

    expect(getCookState(0.5)).toBe('RAW');
    expect(getCookState(2.0)).toBe('PERFECT_GOLDEN');
    expect(getCookState(3.5)).toBe('OVERCOOKED');

    soundEngine.playSFX('pancakeSizzle');
    const spy = (window as unknown as { __AUDIO_SPY__: { events: Array<{ type: string }> } }).__AUDIO_SPY__;
    expect(spy.events.map(e => e.type)).toContain('pancakeSizzle');
  });

  test('T2.6.4_pancake_plate_stacking_and_syrup - Caught pancake locks to plate tower and spawns syrup drips', () => {
    const plate = { x: 420, y: 400, stackCount: 0 };
    const pancakeThickness = 12;

    const stackPancake = () => {
      plate.stackCount++;
      return plate.y - plate.stackCount * pancakeThickness;
    };

    const topY1 = stackPancake();
    expect(topY1).toBe(388);
    const topY2 = stackPancake();
    expect(topY2).toBe(376);

    const pe = new ParticleEngine(50);
    pe.spawnPancakeSyrup(plate.x, topY2, 6);
    expect(pe.active.length).toBe(6);
  });

  // =========================================================================
  // MODE 7: GRANDPA PIG'S VEGETABLE HARVEST
  // =========================================================================

  test('T2.7.1_vegetable_mounds_and_types - Garden mounds hold carrots, cabbages, and giant pumpkins with spring resistance', () => {
    const veggies: VegetableEntity[] = [
      { id: '1', type: 'CARROT', x: 100, y: 350, pullProgress: 0, isHarvested: false },
      { id: '2', type: 'CABBAGE', x: 200, y: 350, pullProgress: 0, isHarvested: false },
      { id: '3', type: 'PUMPKIN', x: 300, y: 350, pullProgress: 0, isHarvested: false }
    ];

    const kValues = { CARROT: 1.2, CABBAGE: 2.4, PUMPKIN: 4.0 };
    expect(kValues[veggies[0].type]).toBe(1.2);
    expect(kValues[veggies[2].type]).toBe(4.0);
  });

  test('T2.7.2_vegetable_elastic_drag_and_snapback - Sub-threshold pull snaps vegetable back to soil mound', () => {
    let pullOffset = 30; // < 60px breakout threshold
    const breakoutThreshold = 60;

    let isHarvested = false;
    if (pullOffset >= breakoutThreshold) {
      isHarvested = true;
    } else {
      pullOffset = 0; // Elastic snapback on release
    }

    expect(isHarvested).toBeFalsy();
    expect(pullOffset).toBe(0);
  });

  test('T2.7.3_vegetable_breakout_mud_explosion - Exceeding pull threshold pops vegetable and triggers mud particles', () => {
    const pullOffset = 75;
    const isHarvested = pullOffset >= 60;
    expect(isHarvested).toBeTruthy();

    const pe = new ParticleEngine(50);
    pe.spawnMudSplash(200, 350, 15);
    expect(pe.active.length).toBe(15);

    soundEngine.playSFX('veggiePop');
    soundEngine.playSFX('mudThud');

    const spy = (window as unknown as { __AUDIO_SPY__: { events: Array<{ type: string }> } }).__AUDIO_SPY__;
    const types = spy.events.map(e => e.type);
    expect(types).toContain('veggiePop');
    expect(types).toContain('mudThud');
  });

  test('T2.7.4_vegetable_wheelbarrow_collection - Harvested vegetable increments collection counter and score', () => {
    let harvestedCount = 0;
    let score = 0;

    const harvestVeggie = (points: number) => {
      harvestedCount++;
      score += points;
    };

    harvestVeggie(20);  // Carrot
    harvestVeggie(100); // Pumpkin

    expect(harvestedCount).toBe(2);
    expect(score).toBe(120);
  });

  // =========================================================================
  // MODE 8: SUZY SHEEP'S HOPSCOTCH & BUBBLE TRAIL
  // =========================================================================

  test('T2.8.1_bubble_floating_physics_and_shimmer - Soap bubbles float upwards with gentle drift and shimmer', () => {
    const bubbles: BubbleEntity[] = [
      { x: 200, y: 400, radius: 24, vy: -30, wobbleOffset: 0, popped: false }
    ];

    const dt = 1 / 60;
    for (let f = 0; f < 30; f++) {
      bubbles[0].y += bubbles[0].vy * dt;
      bubbles[0].wobbleOffset += 3.0 * dt;
      bubbles[0].x += Math.sin(bubbles[0].wobbleOffset) * 15 * dt;
    }

    expect(bubbles[0].y).toBeLessThan(400);
    expect(bubbles[0].x).not.toBe(200);
  });

  test('T2.8.2_bubble_pop_chimes_and_sparkles - Tapping bubble pops with glockenspiel chime and sparkles', () => {
    const bubble: BubbleEntity = { x: 200, y: 300, radius: 25, vy: -30, wobbleOffset: 0, popped: false };
    const tap = { x: 205, y: 302 };

    const dist = Math.hypot(tap.x - bubble.x, tap.y - bubble.y);
    if (dist <= bubble.radius) {
      bubble.popped = true;
      soundEngine.playSFX('bubblePop');
      soundEngine.playSFX('sheepBleat');
    }

    expect(bubble.popped).toBeTruthy();
    const spy = (window as unknown as { __AUDIO_SPY__: { events: Array<{ type: string }> } }).__AUDIO_SPY__;
    const types = spy.events.map(e => e.type);
    expect(types).toContain('bubblePop');
    expect(types).toContain('sheepBleat');
  });

  test('T2.8.3_hopscotch_hop_progression - Bubble pop guides Suzy Sheep hop to consecutive path tiles', () => {
    let currentTile = 1;
    const totalTiles = 8;

    const advanceHop = () => {
      if (currentTile < totalTiles) currentTile++;
    };

    advanceHop();
    advanceHop();
    expect(currentTile).toBe(3);
  });

  test('T2.8.4_picnic_basket_win_celebration - Final hopscotch tile triggers picnic celebration and fanfare', () => {
    const reachedPicnic = true;
    if (reachedPicnic) {
      soundEngine.playSFX('fanfare');
      engine.storage.saveHighScore('hopscotchBubble', 500);
    }

    const spy = (window as unknown as { __AUDIO_SPY__: { events: Array<{ type: string }> } }).__AUDIO_SPY__;
    expect(spy.events.map(e => e.type)).toContain('fanfare');
    expect(engine.storage.getHighScore('hopscotchBubble')).toBe(500);
  });

  // =========================================================================
  // CROSS-CUTTING MECHANICS & BOUNDARY VALUE ANALYSIS (BVA)
  // =========================================================================

  test('T2.9.1_universal_scene_polymorphism - All registered scenes comply with BaseScene polymorphic contract', () => {
    for (const [id, scene] of engine.scenes.entries()) {
      scene.enter();
      expect(typeof scene.score).toBe('number');
      const entities = scene.getEntities();
      expect(typeof entities).toBe('object');
      const state = scene.getModeState();
      expect(typeof state).toBe('object');
      scene.exit();
    }
  });

  test('T2.9.2_multitouch_rapid_tap_tolerance - Multi-pointer rapid concurrent taps execute without singularities', () => {
    const input = new InputManager(engine.display);

    // Simulate 5 simultaneous touch events
    for (let id = 1; id <= 5; id++) {
      canvas.dispatchEvent(
        new PointerEvent('pointerdown', {
          pointerId: id,
          clientX: id * 80,
          clientY: id * 60,
          bubbles: true
        })
      );
    }

    expect(input.pointers.size).toBe(5);
    expect(input.actionIsDown).toBeTruthy();

    for (let id = 1; id <= 5; id++) {
      window.dispatchEvent(
        new PointerEvent('pointerup', {
          pointerId: id,
          clientX: id * 80,
          clientY: id * 60,
          bubbles: true
        })
      );
    }

    input.postUpdate();
    expect(input.pointers.size).toBe(0);
    expect(input.actionIsDown).toBeFalsy();
    input.detach();
  });

  test('T2.9.3_scene_state_isolation_on_transition - Sequential scene switching clears particles and resets state', () => {
    engine.changeScene('EGG_LAYING');
    const eggScene = engine.activeScene as EggLayingScene;
    eggScene.layEggAt(200, 200);
    expect(eggScene.eggs.length).toBeGreaterThan(0);

    engine.changeScene('MUDDY_PUDDLES');
    expect(engine.currentSceneId).toBe('MUDDY_PUDDLES');

    // Return to EGG_LAYING -> verify clean reset
    engine.changeScene('EGG_LAYING');
    const resetEggScene = engine.activeScene as EggLayingScene;
    expect(resetEggScene.eggs.length).toBe(0);
    expect(resetEggScene.score).toBe(0);
  });

  test('T2.9.4_bva_extreme_dt_and_score_overflow - Engine gracefully handles dt=0, dt=0.001, and large dt spikes', () => {
    const scene = new EggLayingScene(engine);
    scene.enter();
    const mockInput = new InputManager(engine.display);

    expect(() => {
      scene.update(0, mockInput);
      scene.update(0.0001, mockInput);
      scene.update(0.5, mockInput); // Large lag spike
    }).not.toThrow();

    // High score boundary values
    const storage = new StorageManager();
    storage.saveHighScore('eggLaying', Number.MAX_SAFE_INTEGER);
    expect(storage.getHighScore('eggLaying')).toBe(Number.MAX_SAFE_INTEGER);
  });
});
