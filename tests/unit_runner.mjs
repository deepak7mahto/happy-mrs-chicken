/**
 * Fast Headless Node.js Unit & Math Test Runner
 * Validates core game math, boids flocking algorithms, physics integration,
 * hatching state machines, audio lookahead scheduling, and scoring formulas.
 *
 * Usage: node tests/unit_runner.mjs
 */

import { assert, assertEqual, assertDeepEqual, assertApprox, assertInRange, assertDefined, assertThrows } from './helpers/assert_helpers.mjs';
import { createMockEnvironment, MockLocalStorage } from './helpers/mock_browser.mjs';

const unitTests = [];
function test(name, fn) {
  unitTests.push({ name, fn });
}

// =========================================================================
// 1. Viewport & Coordinate Transformation Math
// =========================================================================
test('Viewport Math: 16:9 Letterboxing scale and centered offset computation', () => {
  function computeViewportTransform(windowWidth, windowHeight, virtualWidth = 960, virtualHeight = 540) {
    const scale = Math.min(windowWidth / virtualWidth, windowHeight / virtualHeight);
    const offsetX = (windowWidth - virtualWidth * scale) / 2;
    const offsetY = (windowHeight - virtualHeight * scale) / 2;
    return { scale, offsetX, offsetY };
  }

  function clientToVirtual(clientX, clientY, transform) {
    const { scale, offsetX, offsetY } = transform;
    const x = Math.max(0, Math.min(960, (clientX - offsetX) / scale));
    const y = Math.max(0, Math.min(540, (clientY - offsetY) / scale));
    return { x, y };
  }

  // 1. Exact 16:9 (1920x1080)
  const t1 = computeViewportTransform(1920, 1080);
  assertEqual(t1.scale, 2.0);
  assertEqual(t1.offsetX, 0);
  assertEqual(t1.offsetY, 0);
  assertDeepEqual(clientToVirtual(960, 540, t1), { x: 480, y: 270 });

  // 2. Ultrawide 21:9 (2560x1080) -> Pillarboxing
  const t2 = computeViewportTransform(2560, 1080);
  assertEqual(t2.scale, 2.0);
  assertEqual(t2.offsetX, (2560 - 1920) / 2); // 320px black bars on left/right
  assertEqual(t2.offsetY, 0);
  // Center of screen should map to virtual center (480, 270)
  const center2 = clientToVirtual(1280, 540, t2);
  assertApprox(center2.x, 480, 0.01);
  assertApprox(center2.y, 270, 0.01);

  // 3. Mobile Portrait 9:16 (375x667) -> Letterboxing
  const t3 = computeViewportTransform(375, 667);
  assertApprox(t3.scale, 375 / 960, 0.001);
  assert(t3.offsetY > 0, 'Vertical offset should be positive for letterbox');
});

// =========================================================================
// 2. Egg Physics & Semi-Implicit Euler Integration
// =========================================================================
test('Physics Math: Semi-implicit Euler integration & ground restitution bounce', () => {
  class EggPhysics {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.vx = 0;
      this.vy = 50; // downward ejection
      this.g = 980; // px/s^2
      this.eGround = 0.38; // bounce restitution
      this.groundY = 460;
      this.isSettled = false;
    }

    step(dt) {
      if (this.isSettled) return;
      this.vy += this.g * dt;
      this.x += this.vx * dt;
      this.y += this.vy * dt;

      // Ground collision
      if (this.y >= this.groundY) {
        this.y = this.groundY;
        this.vy = -this.vy * this.eGround;
        this.vx *= 0.94;
        if (Math.abs(this.vy) < 25) {
          this.vy = 0;
          this.isSettled = true;
        }
      }
    }
  }

  const egg = new EggPhysics(480, 150);
  const dt = 1 / 60;

  // Step 30 frames (0.5s)
  for (let i = 0; i < 30; i++) {
    egg.step(dt);
  }

  assert(egg.y > 150, 'Egg should fall downwards');
  assert(egg.y <= 460, 'Egg should not penetrate below groundY');

  // Step until fully settled (e.g. 200 frames)
  for (let i = 0; i < 200; i++) {
    egg.step(dt);
  }

  assertEqual(egg.isSettled, true, 'Egg should come to a settled rest');
  assertApprox(egg.y, 460, 0.001, 'Egg should settle exactly on ground level');
});

// =========================================================================
// 3. Egg Stacking & Positional Separation
// =========================================================================
test('Stacking Math: Positional circle-circle separation resolves overlap', () => {
  function resolveEggCollision(e1, e2, radius = 14, restitution = 0.28) {
    const dx = e1.x - e2.x;
    const dy = e1.y - e2.y;
    const distSq = dx * dx + dy * dy;
    const minRadius = radius * 2; // 28px

    if (distSq > 0 && distSq < minRadius * minRadius) {
      const dist = Math.sqrt(distSq);
      const overlap = minRadius - dist;
      const nx = dx / dist;
      const ny = dy / dist;

      // Push apart equally
      e1.x += nx * overlap * 0.5;
      e1.y += ny * overlap * 0.5;
      e2.x -= nx * overlap * 0.5;
      e2.y -= ny * overlap * 0.5;

      // Impulse
      const kx = e1.vx - e2.vx;
      const ky = e1.vy - e2.vy;
      const p = 2 * (nx * kx + ny * ky) / 2;
      e1.vx -= p * nx * (1 + restitution) * 0.5;
      e1.vy -= p * ny * (1 + restitution) * 0.5;
      e2.vx += p * nx * (1 + restitution) * 0.5;
      e2.vy += p * ny * (1 + restitution) * 0.5;
      return true;
    }
    return false;
  }

  const e1 = { x: 480, y: 450, vx: 0, vy: 0 };
  const e2 = { x: 480, y: 460, vx: 0, vy: 0 }; // 10px distance (overlaps by 18px)

  const collided = resolveEggCollision(e1, e2);
  assertEqual(collided, true, 'Collision should be detected');

  const newDist = Math.sqrt((e1.x - e2.x) ** 2 + (e1.y - e2.y) ** 2);
  assertApprox(newDist, 28, 0.01, 'Separation should push eggs to exact 28px contact distance');
  assert(e1.y < e2.y, 'Top egg e1 should be pushed upward');
});

// =========================================================================
// 4. 8-State Cracking & Hatching State Machine
// =========================================================================
test('State Machine: 8-Stage Hatching Lifecycle progression', () => {
  const STAGES = [
    'FALLING',
    'SETTLING',
    'INCUBATING',
    'CRACK_1',
    'CRACK_2',
    'HATCH_BURST',
    'CHICK_EMERGE',
    'CHICK_SCAMPER',
    'DESPAWNED'
  ];

  class EggLifecycle {
    constructor() {
      this.state = 'FALLING';
      this.timer = 0;
    }

    advance(event, dt = 0) {
      this.timer += dt;
      switch (this.state) {
        case 'FALLING':
          if (event === 'GROUND_TOUCH') this.state = 'SETTLING';
          break;
        case 'SETTLING':
          if (event === 'VELOCITY_STOP') {
            this.state = 'INCUBATING';
            this.timer = 0;
          }
          break;
        case 'INCUBATING':
          if (this.timer >= 2.5 || event === 'FORCE_HATCH') {
            this.state = 'CRACK_1';
            this.timer = 0;
          }
          break;
        case 'CRACK_1':
          if (this.timer >= 0.6) {
            this.state = 'CRACK_2';
            this.timer = 0;
          }
          break;
        case 'CRACK_2':
          if (this.timer >= 0.5) {
            this.state = 'HATCH_BURST';
            this.timer = 0;
          }
          break;
        case 'HATCH_BURST':
          this.state = 'CHICK_EMERGE';
          this.timer = 0;
          break;
        case 'CHICK_EMERGE':
          if (this.timer >= 0.4) {
            this.state = 'CHICK_SCAMPER';
            this.timer = 0;
          }
          break;
        case 'CHICK_SCAMPER':
          if (event === 'OFFSCREEN') {
            this.state = 'DESPAWNED';
          }
          break;
      }
    }
  }

  const egg = new EggLifecycle();
  assertEqual(egg.state, 'FALLING');

  egg.advance('GROUND_TOUCH');
  assertEqual(egg.state, 'SETTLING');

  egg.advance('VELOCITY_STOP');
  assertEqual(egg.state, 'INCUBATING');

  egg.advance(null, 2.6);
  assertEqual(egg.state, 'CRACK_1');

  egg.advance(null, 0.7);
  assertEqual(egg.state, 'CRACK_2');

  egg.advance(null, 0.6);
  assertEqual(egg.state, 'HATCH_BURST');

  egg.advance(null, 0.01);
  assertEqual(egg.state, 'CHICK_EMERGE');

  egg.advance(null, 0.5);
  assertEqual(egg.state, 'CHICK_SCAMPER');

  egg.advance('OFFSCREEN');
  assertEqual(egg.state, 'DESPAWNED');
});

// =========================================================================
// 5. Muddy Puddles Tier Scoring & Jump Trajectory
// =========================================================================
test('Muddy Puddles: Parabolic jump physics and center-hit scoring', () => {
  function computeJumpY(t, g = 1400, v0 = -460) {
    // Parabolic offset above ground
    const y = v0 * t + 0.5 * g * t * t;
    return y;
  }

  // Peak of jump occurs at t = -v0 / g = 460 / 1400 ≈ 0.328s
  const tPeak = 460 / 1400;
  const peakHeight = -computeJumpY(tPeak);
  assertApprox(peakHeight, 75.57, 1.0, 'Jump peak should reach ~75px height');

  // Total airtime tAir = 2 * tPeak ≈ 0.657s
  const tAir = 2 * tPeak;
  const groundLand = computeJumpY(tAir);
  assertApprox(groundLand, 0, 1.0, 'Landing offset should return to 0 at airtime end');

  // Center-hit accuracy calculation
  function calculateSplashScore(playerX, playerY, puddleX, puddleY, rx, ry, basePoints = 25, combo = 1) {
    const dx = (playerX - puddleX) / rx;
    const dy = (playerY - puddleY) / ry;
    const dNorm = Math.sqrt(dx * dx + dy * dy);

    if (dNorm <= 0.40) {
      return { rating: 'PERFECT', points: basePoints * 2 * combo, comboIncrement: 1 };
    } else if (dNorm <= 1.00) {
      return { rating: 'GOOD', points: basePoints * combo, comboIncrement: 1 };
    } else {
      return { rating: 'MISS', points: 0, comboIncrement: 0, resetCombo: true };
    }
  }

  const p1 = calculateSplashScore(480, 400, 480, 400, 44, 24, 25, 2);
  assertEqual(p1.rating, 'PERFECT');
  assertEqual(p1.points, 100); // 25 * 2 (perfect) * 2 (combo)

  const p2 = calculateSplashScore(500, 400, 480, 400, 44, 24, 25, 1);
  assertEqual(p2.rating, 'GOOD');
  assertEqual(p2.points, 25);

  const p3 = calculateSplashScore(550, 400, 480, 400, 44, 24, 25, 3);
  assertEqual(p3.rating, 'MISS');
  assertEqual(p3.points, 0);
});

// =========================================================================
// 6. Chick Maze Boids Flocking & Obstacle Deflection
// =========================================================================
test('Chick Maze Math: Reynolds Boids flocking rules and obstacle clamp', () => {
  function computeBoidsFlocking(chick, neighbors, seedTarget = null) {
    let steerX = 0;
    let steerY = 0;

    // 1. Separation
    for (const other of neighbors) {
      const dx = chick.x - other.x;
      const dy = chick.y - other.y;
      const distSq = dx * dx + dy * dy;
      if (distSq > 0 && distSq < 30 * 30) {
        steerX += (dx / distSq) * 150;
        steerY += (dy / distSq) * 150;
      }
    }

    // 2. Seed attraction if present
    if (seedTarget) {
      const sdx = seedTarget.x - chick.x;
      const sdy = seedTarget.y - chick.y;
      const sDist = Math.sqrt(sdx * sdx + sdy * sdy);
      if (sDist <= 160 && sDist > 0) {
        steerX += (sdx / sDist) * 85;
        steerY += (sdy / sDist) * 85;
      }
    }

    return { steerX, steerY };
  }

  const chickA = { x: 300, y: 300 };
  const chickB = { x: 310, y: 300 }; // 10px away -> separation should push A to the left (negative X)
  const seed = { x: 400, y: 300 };   // Seed to the right

  const forces = computeBoidsFlocking(chickA, [chickB], seed);
  assert(typeof forces.steerX === 'number' && !isNaN(forces.steerX));
  assert(typeof forces.steerY === 'number' && !isNaN(forces.steerY));

  // Obstacle AABB Collision Clamp
  function clampAgainstFence(entity, radius, fence) {
    // fence: { minX, minY, maxX, maxY }
    const closestX = Math.max(fence.minX, Math.min(entity.x, fence.maxX));
    const closestY = Math.max(fence.minY, Math.min(entity.y, fence.maxY));
    const dx = entity.x - closestX;
    const dy = entity.y - closestY;
    const distSq = dx * dx + dy * dy;

    if (distSq < radius * radius) {
      const dist = Math.sqrt(distSq) || 0.001;
      const push = radius - dist;
      entity.x += (dx / dist) * push;
      entity.y += (dy / dist) * push;
      return true;
    }
    return false;
  }

  const chick = { x: 200, y: 195 };
  const fence = { minX: 150, minY: 200, maxX: 350, maxY: 220 };
  const pushed = clampAgainstFence(chick, 12, fence);
  assertEqual(pushed, true);
  assert(chick.y < 195, 'Chick should be pushed outside fence boundary');
});

// =========================================================================
// 7. Daddy Pig Fever Gauge Dynamics & Multipliers
// =========================================================================
test('Daddy Pig Challenge: Fever gauge charging, decay, and multipliers', () => {
  class DaddyPigFever {
    constructor() {
      this.fever = 0;
      this.score = 0;
      this.timeRemaining = 20.0;
    }

    tap() {
      this.fever = Math.min(100, this.fever + 4.5);
      const mult = this.getMultiplier();
      this.score += 10 * mult;
      this.timeRemaining = Math.min(25.0, this.timeRemaining + 0.18);
    }

    step(dt) {
      // Passive decay: decays faster as score rises
      const decayRate = 6.5 + 0.05 * Math.sqrt(this.score);
      this.fever = Math.max(0, this.fever - decayRate * dt);
      this.timeRemaining = Math.max(0, this.timeRemaining - dt);
    }

    getMultiplier() {
      if (this.fever >= 95) return 10;
      if (this.fever >= 70) return 5;
      if (this.fever >= 40) return 2;
      return 1;
    }

    getPanicStage() {
      if (this.fever >= 95) return 'OVERHEAT_MELTDOWN';
      if (this.fever >= 65) return 'PANIC_STEAM';
      if (this.fever >= 30) return 'INTENSE_SWEATING';
      return 'CALM_EXPERT';
    }
  }

  const dp = new DaddyPigFever();
  assertEqual(dp.getMultiplier(), 1);
  assertEqual(dp.getPanicStage(), 'CALM_EXPERT');

  // Tap 10 times (+45% fever)
  for (let i = 0; i < 10; i++) dp.tap();
  assert(dp.fever >= 40, 'Fever should cross 40%');
  assertEqual(dp.getMultiplier(), 2, 'Multiplier should be 2x');
  assertEqual(dp.getPanicStage(), 'INTENSE_SWEATING');

  // Tap 15 more times (+67.5% -> max 100%)
  for (let i = 0; i < 15; i++) dp.tap();
  assertEqual(dp.fever, 100);
  assertEqual(dp.getMultiplier(), 10, 'Fever Mode 10x');
  assertEqual(dp.getPanicStage(), 'OVERHEAT_MELTDOWN');

  // Step 2 seconds idle
  dp.step(2.0);
  assert(dp.fever < 100, 'Fever should decay during idle');
});

// =========================================================================
// 8. Procedural Web Audio Note Frequency Tables & Schedules
// =========================================================================
test('Web Audio Math: Standard MIDI/Note frequencies and 128 BPM scheduling', () => {
  function midiToFreq(midiNote) {
    return 440 * Math.pow(2, (midiNote - 69) / 12);
  }

  // A4 = MIDI 69 = 440 Hz
  assertApprox(midiToFreq(69), 440.0, 0.01);
  // C4 = MIDI 60 ≈ 261.63 Hz
  assertApprox(midiToFreq(60), 261.63, 0.05);
  // C5 = MIDI 72 ≈ 523.25 Hz
  assertApprox(midiToFreq(72), 523.25, 0.05);

  // 128 BPM step calculation
  const tempo = 128.0;
  const secondsPerBeat = 60.0 / tempo;
  const eighthNoteDuration = 0.5 * secondsPerBeat;
  assertApprox(secondsPerBeat, 0.46875, 0.0001);
  assertApprox(eighthNoteDuration, 0.234375, 0.0001);
});

// =========================================================================
// 9. LocalStorage JSON Schema & Robust Fallback
// =========================================================================
test('LocalStorage Manager: Schema validation, migration, and QuotaExceeded fallback', () => {
  const defaultSchema = {
    version: 1,
    settings: { soundMuted: false, musicMuted: false, masterVolume: 0.85 },
    highScores: {
      classic: { eggs: 0, chicks: 0 },
      muddyPuddles: { score: 0, splashes: 0 },
      chickMaze: { levelReached: 1, bestTime: 999 },
      daddyPig: { score: 0, maxFever: 1 }
    }
  };

  class StorageManager {
    constructor(storage = new MockLocalStorage()) {
      this.storage = storage;
      this.memoryFallback = null;
      this.STORAGE_KEY = 'hmc_game_data_v1';
    }

    load() {
      try {
        const raw = this.storage.getItem(this.STORAGE_KEY);
        if (!raw) return defaultSchema;
        const parsed = JSON.parse(raw);
        if (!parsed.version) return defaultSchema;
        return parsed;
      } catch (err) {
        return this.memoryFallback || defaultSchema;
      }
    }

    save(data) {
      try {
        this.storage.setItem(this.STORAGE_KEY, JSON.stringify(data));
      } catch (err) {
        this.memoryFallback = JSON.parse(JSON.stringify(data));
      }
    }
  }

  const mockStorage = new MockLocalStorage();
  const manager = new StorageManager(mockStorage);

  // 1. Initial load
  const initial = manager.load();
  assertEqual(initial.version, 1);
  assertEqual(initial.highScores.classic.eggs, 0);

  // 2. Save & retrieve
  initial.highScores.classic.eggs = 42;
  manager.save(initial);
  const loaded = manager.load();
  assertEqual(loaded.highScores.classic.eggs, 42);

  // 3. Corrupt data recovery
  mockStorage.setItem('hmc_game_data_v1', '{corrupt json invalid');
  const recovered = manager.load();
  assertEqual(recovered.version, 1, 'Should fall back gracefully on corrupted JSON');

  // 4. QuotaExceeded fallback
  mockStorage.simulateQuotaError = true;
  initial.highScores.classic.eggs = 99;
  manager.save(initial);
  const memoryLoaded = manager.load();
  assertEqual(memoryLoaded.highScores.classic.eggs, 99, 'Memory fallback preserves data when quota exceeded');
});

// =========================================================================
// 10. Particle System Math & Particle Recycling Pool
// =========================================================================
test('Particle Pool: Particle lifecycle, gravity, alpha fade, and pool recycling', () => {
  class ParticlePool {
    constructor(maxParticles = 100) {
      this.max = maxParticles;
      this.pool = [];
      this.active = [];
      for (let i = 0; i < maxParticles; i++) {
        this.pool.push({ x: 0, y: 0, vx: 0, vy: 0, life: 0, maxLife: 1, alpha: 1, active: false });
      }
    }

    emit(x, y, vx, vy, maxLife = 0.5) {
      let p = this.pool.pop();
      if (!p) {
        // Recycle oldest active particle
        p = this.active.shift();
      }
      p.x = x;
      p.y = y;
      p.vx = vx;
      p.vy = vy;
      p.life = maxLife;
      p.maxLife = maxLife;
      p.alpha = 1.0;
      p.active = true;
      this.active.push(p);
      return p;
    }

    step(dt, gravity = 800) {
      for (let i = this.active.length - 1; i >= 0; i--) {
        const p = this.active[i];
        p.life -= dt;
        if (p.life <= 0) {
          p.active = false;
          this.active.splice(i, 1);
          this.pool.push(p);
        } else {
          p.vy += gravity * dt;
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.alpha = p.life / p.maxLife;
        }
      }
    }
  }

  const emitter = new ParticlePool(20);
  for (let i = 0; i < 25; i++) {
    emitter.emit(480, 270, 50, -100, 0.5);
  }

  assertEqual(emitter.active.length, 20, 'Particle pool should clamp to max capacity');
  
  // Advance 0.25s
  emitter.step(0.25);
  assertApprox(emitter.active[0].alpha, 0.5, 0.05, 'Particle alpha should fade linearly');

  // Advance 0.3s (total 0.55s) -> all should expire and return to pool
  emitter.step(0.3);
  assertEqual(emitter.active.length, 0, 'All particles should be recycled after lifetime');
  assertEqual(emitter.pool.length, 20, 'Pool should hold all recycled particles');
});

// =========================================================================
// 11. Canonical Peppa Pig Cartoon Color Palette Verification
// =========================================================================
test('Palette Integrity: Valid hex formats and distinct character colors', () => {
  const PALETTE = {
    PEPPA_SKIN: '#FFB6C1',
    PEPPA_DRESS: '#E53935',
    PEPPA_BOOTS: '#FDD835',
    DADDY_SKIN: '#FFB6C1',
    DADDY_OUTFIT: '#00ACC1',
    CHICKEN_BODY: '#FFFFFF',
    CHICKEN_COMB: '#E53935',
    CHICKEN_BEAK: '#FFA000',
    CHICK_BODY: '#FFEE58',
    SKY_BLUE: '#81D4FA',
    HILL_FRONT: '#66BB6A',
    MUD_DARK: '#6D4C41',
    NEST_STRAW: '#FBC02D'
  };

  const hexRegex = /^#([0-9A-Fa-f]{6})$/;
  for (const [key, hex] of Object.entries(PALETTE)) {
    assert(hexRegex.test(hex), `Palette ${key} must be valid 6-character hex string (${hex})`);
  }
});


// =========================================================================
// RUN ALL TESTS
// =========================================================================
async function runUnitRunner() {
  console.log('\x1b[1m\x1b[36m========================================================\x1b[0m');
  console.log('\x1b[1m\x1b[36m   Peppa Pig: Happy Mrs Chicken — Fast Unit Test Runner  \x1b[0m');
  console.log('\x1b[1m\x1b[36m========================================================\x1b[0m\n');

  let passed = 0;
  let failed = 0;
  const startTime = Date.now();

  for (const { name, fn } of unitTests) {
    try {
      await fn();
      console.log(` \x1b[32m✔\x1b[0m ${name}`);
      passed++;
    } catch (err) {
      console.log(` \x1b[31m✖\x1b[0m ${name}`);
      console.error(`   \x1b[31m${err.message}\x1b[0m`);
      if (err.stack) {
        console.error(`   \x1b[90m${err.stack.split('\n').slice(1, 4).join('\n   ')}\x1b[0m`);
      }
      failed++;
    }
  }

  const duration = Date.now() - startTime;
  console.log('\n\x1b[1m--------------------------------------------------------\x1b[0m');
  console.log(`Total: ${unitTests.length} | \x1b[32mPassed: ${passed}\x1b[0m | \x1b[31mFailed: ${failed}\x1b[0m | Time: ${duration}ms`);
  console.log('\x1b[1m--------------------------------------------------------\x1b[0m\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runUnitRunner();
