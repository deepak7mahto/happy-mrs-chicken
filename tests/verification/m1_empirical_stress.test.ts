/**
 * Empirical Stress Test Harness for Milestone M1
 * Target Subsystems: StorageManager, ParticleEngine
 * Challenger 1 Verification Suite
 */

import { StorageManager } from '../../src/engine/StorageManager';
import { ParticleEngine } from '../../src/engine/ParticleEngine';
import { HighScores } from '../../src/types/storage';
import { ActiveGameModeId, GameModeSlug, GAME_MODES_LIST, MODE_ID_TO_SLUG } from '../../src/types/game';

// -----------------------------------------------------------------------------
// Test Runner Infrastructure
// -----------------------------------------------------------------------------
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failures: string[] = [];

function assert(condition: boolean, testName: string, detail?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ [PASS] ${testName}`);
  } else {
    failedTests++;
    const msg = `  ✗ [FAIL] ${testName}${detail ? ` - ${detail}` : ''}`;
    console.error(msg);
    failures.push(msg);
  }
}

function assertEqual<T>(actual: T, expected: T, testName: string) {
  const match = actual === expected || JSON.stringify(actual) === JSON.stringify(expected);
  assert(
    match,
    testName,
    `Expected: ${JSON.stringify(expected)}, Actual: ${JSON.stringify(actual)}`
  );
}

function section(title: string) {
  console.log(`\n============================================================`);
  console.log(`SECTION: ${title}`);
  console.log(`============================================================`);
}

// -----------------------------------------------------------------------------
// In-Memory Mock LocalStorage Setup
// -----------------------------------------------------------------------------
class MockLocalStorage implements Storage {
  private store = new Map<string, string>();
  public shouldThrowOnSet = false;
  public shouldThrowOnGet = false;
  public throwErrorType = 'QuotaExceededError';

  getItem(key: string): string | null {
    if (this.shouldThrowOnGet) {
      throw new Error(`SecurityError: The operation is insecure for key "${key}"`);
    }
    return this.store.has(key) ? this.store.get(key)! : null;
  }

  setItem(key: string, value: string): void {
    if (this.shouldThrowOnSet) {
      const err = new Error(`DOMException: ${this.throwErrorType}`);
      err.name = this.throwErrorType;
      throw err;
    }
    this.store.set(key, String(value));
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  key(index: number): string | null {
    return Array.from(this.store.keys())[index] || null;
  }

  get length(): number {
    return this.store.size;
  }
}

const mockStorage = new MockLocalStorage();
(globalThis as any).window = {
  localStorage: mockStorage
};
(globalThis as any).localStorage = mockStorage;

// =============================================================================
// STORAGE MANAGER EMPIRICAL TESTS
// =============================================================================

section('1. StorageManager: 8-Mode Key Normalization (Enum, Slug, CamelCase)');
{
  mockStorage.clear();
  const sm = new StorageManager();

  // Test matrix of 8 modes: [Enum, Slug, CamelCase]
  const modeKeyMatrix: Array<{
    modeId: ActiveGameModeId;
    slug: GameModeSlug;
    camelCase: keyof HighScores;
  }> = [
    { modeId: 'EGG_LAYING', slug: 'classic', camelCase: 'eggLaying' },
    { modeId: 'MUDDY_PUDDLES', slug: 'mud-puddle', camelCase: 'muddyPuddles' },
    { modeId: 'CHICK_MAZE', slug: 'seed-sort', camelCase: 'chickMaze' },
    { modeId: 'DADDY_PIG', slug: 'dino-maze', camelCase: 'daddyPig' },
    { modeId: 'DINOSAUR_BALLOON', slug: 'balloon-pop', camelCase: 'dinosaurBalloon' },
    { modeId: 'PANCAKE_FLIPPER', slug: 'pancake-flip', camelCase: 'pancakeFlipper' },
    { modeId: 'VEGETABLE_HARVEST', slug: 'egg-tap', camelCase: 'vegetableHarvest' },
    { modeId: 'HOPSCOTCH_BUBBLE', slug: 'chick-catch', camelCase: 'hopscotchBubble' }
  ];

  let scoreCounter = 100;
  for (const m of modeKeyMatrix) {
    scoreCounter += 15;
    const testScore = scoreCounter;

    // Save via Slug
    const saved = sm.saveHighScore(m.slug, testScore);
    assert(saved === true, `Saved score ${testScore} via slug '${m.slug}'`);

    // Verify lookup via Enum
    assertEqual(
      sm.getHighScore(m.modeId),
      testScore,
      `Lookup via Enum '${m.modeId}' returns ${testScore}`
    );

    // Verify lookup via CamelCase
    assertEqual(
      sm.getHighScore(m.camelCase),
      testScore,
      `Lookup via CamelCase '${m.camelCase}' returns ${testScore}`
    );

    // Verify lookup via Slug
    assertEqual(
      sm.getHighScore(m.slug),
      testScore,
      `Lookup via Slug '${m.slug}' returns ${testScore}`
    );
  }

  // Verify cross-key overwrite via Enum
  sm.saveHighScore('PANCAKE_FLIPPER', 500);
  assertEqual(sm.getHighScore('pancake-flip'), 500, 'Overwrite via Enum reflects in Slug lookup');
  assertEqual(sm.getHighScore('pancakeFlipper'), 500, 'Overwrite via Enum reflects in CamelCase lookup');
}

section('2. StorageManager: High Score Monotonicity and Persistence');
{
  mockStorage.clear();
  const sm = new StorageManager();

  // Initial score is 0
  assertEqual(sm.getHighScore('classic'), 0, 'Initial high score is 0');

  // Higher score updates
  assert(sm.saveHighScore('classic', 42) === true, 'Saving 42 returns true (new high)');
  assertEqual(sm.getHighScore('classic'), 42, 'Current score is 42');

  // Lower score ignored
  assert(sm.saveHighScore('classic', 20) === false, 'Saving lower score 20 returns false');
  assertEqual(sm.getHighScore('classic'), 42, 'Current score remains 42');

  // Equal score ignored
  assert(sm.saveHighScore('classic', 42) === false, 'Saving equal score 42 returns false');
  assertEqual(sm.getHighScore('classic'), 42, 'Current score remains 42');

  // Negative score ignored
  assert(sm.saveHighScore('classic', -5) === false, 'Saving negative score -5 returns false');
  assertEqual(sm.getHighScore('classic'), 42, 'Current score remains 42');

  // Persistence across instances
  const smNewInstance = new StorageManager();
  assertEqual(
    smNewInstance.getHighScore('classic'),
    42,
    'Fresh StorageManager instance loads persisted high score 42 from localStorage'
  );
}

section('3. StorageManager: Corrupted JSON & Malformed Storage Handling');
{
  const corruptPayloads = [
    { label: 'Malformed JSON syntax', data: '{"highScores": {broken json' },
    { label: 'JSON null literal', data: 'null' },
    { label: 'JSON number primitive', data: '12345' },
    { label: 'JSON string primitive', data: '"corrupted_raw_string"' },
    { label: 'JSON array literal', data: '[1, 2, 3]' },
    {
      label: 'HighScores with NaN / non-numeric fields',
      data: JSON.stringify({
        highScores: {
          eggLaying: 'INVALID_NAN',
          muddyPuddles: null,
          chickMaze: undefined,
          daddyPig: {},
          dinosaurBalloon: true,
          pancakeFlipper: 99
        },
        settings: {
          soundMuted: 'maybe',
          volume: 'loud'
        }
      })
    }
  ];

  for (const payload of corruptPayloads) {
    mockStorage.setItem('hmc_game_data_v1', payload.data);
    let smCorrupt: StorageManager | null = null;
    let didThrow = false;
    try {
      smCorrupt = new StorageManager();
    } catch (e) {
      didThrow = true;
    }

    assert(!didThrow, `Constructor survived ${payload.label} without throwing`);
    assert(smCorrupt !== null, `Instance created successfully on ${payload.label}`);
    if (smCorrupt) {
      // High score should be number and not NaN
      const eggScore = smCorrupt.getHighScore('eggLaying');
      assert(typeof eggScore === 'number' && !isNaN(eggScore), `High score is clean number on ${payload.label}`);
      // Volume should be valid number
      const vol = smCorrupt.getVolume();
      assert(typeof vol === 'number' && vol >= 0 && vol <= 1, `Volume is valid on ${payload.label}`);
    }
  }
}

section('4. StorageManager: QuotaExceeded and SecurityError Handling');
{
  mockStorage.clear();
  const sm = new StorageManager();
  sm.saveHighScore('classic', 10);

  // Simulate QuotaExceededError on save
  mockStorage.shouldThrowOnSet = true;
  mockStorage.throwErrorType = 'QuotaExceededError';

  let saveResult = false;
  let didThrowOnSave = false;
  try {
    saveResult = sm.save();
  } catch (e) {
    didThrowOnSave = true;
  }
  assert(!didThrowOnSave, 'sm.save() caught QuotaExceededError gracefully without unhandled exception');
  assert(saveResult === false, 'sm.save() returned false when localStorage.setItem threw');

  let highscoreSaved = false;
  try {
    highscoreSaved = sm.saveHighScore('classic', 50);
  } catch (e) {
    didThrowOnSave = true;
  }
  assert(highscoreSaved === true, 'saveHighScore() recorded new session high score in memory');
  assertEqual(sm.getHighScore('classic'), 50, 'In-memory high score updated to 50 even if localStorage threw');

  // Test setVolume / setMuted with throwing localStorage
  let didThrowOnSettings = false;
  try {
    sm.setVolume(0.5);
    sm.setMuted(true);
    sm.setMusicMuted(true);
  } catch (e) {
    didThrowOnSettings = true;
  }
  assert(!didThrowOnSettings, 'Settings updates survived QuotaExceededError without throwing');
  assertEqual(sm.getVolume(), 0.5, 'In-memory volume updated to 0.5');
  assertEqual(sm.isMuted(), true, 'In-memory soundMuted updated to true');

  mockStorage.shouldThrowOnSet = false;

  // Simulate SecurityError on localStorage.getItem (e.g. cross-origin sandbox)
  mockStorage.shouldThrowOnGet = true;
  let didThrowOnLoad = false;
  let smSecurity: StorageManager | null = null;
  try {
    smSecurity = new StorageManager();
  } catch (e) {
    didThrowOnLoad = true;
  }
  assert(!didThrowOnLoad, 'StorageManager load() caught SecurityError gracefully without throwing');
  assert(smSecurity !== null, 'StorageManager initialized with defaults on SecurityError');
  if (smSecurity) {
    assertEqual(smSecurity.getHighScore('classic'), 0, 'Defaults loaded on SecurityError');
  }
  mockStorage.shouldThrowOnGet = false;
}

section('5. StorageManager: Backward Compatibility & Migration Handling');
{
  mockStorage.clear();
  // Old v0 payload with only 2 modes and missing settings
  const v0Data = {
    highScores: {
      eggLaying: 88,
      muddyPuddles: 44
    },
    settings: {
      soundMuted: true
    }
  };
  mockStorage.setItem('hmc_game_data_v1', JSON.stringify(v0Data));

  const smMigrated = new StorageManager();
  assertEqual(smMigrated.getHighScore('eggLaying'), 88, 'Preserved existing eggLaying high score 88');
  assertEqual(smMigrated.getHighScore('muddyPuddles'), 44, 'Preserved existing muddyPuddles high score 44');
  assertEqual(smMigrated.getHighScore('daddyPig'), 0, 'Newly added mode daddyPig defaulted to 0');
  assertEqual(smMigrated.getHighScore('vegetableHarvest'), 0, 'Newly added mode vegetableHarvest defaulted to 0');
  assertEqual(smMigrated.isMuted(), true, 'Preserved soundMuted setting');
  assertEqual(smMigrated.getVolume(), 1.0, 'Missing volume defaulted to 1.0');
}

section('6. StorageManager: Boundary Clamping and resetAll()');
{
  mockStorage.clear();
  const sm = new StorageManager();

  // Volume bounds clamping [0, 1]
  sm.setVolume(2.5);
  assertEqual(sm.getVolume(), 1.0, 'Volume 2.5 clamped to 1.0');
  sm.setVolume(-0.8);
  assertEqual(sm.getVolume(), 0.0, 'Volume -0.8 clamped to 0.0');
  sm.setVolume(0.45);
  assertEqual(sm.getVolume(), 0.45, 'Volume 0.45 set precisely');

  // Populate multiple scores
  sm.saveHighScore('classic', 100);
  sm.saveHighScore('mud-puddle', 200);
  sm.saveHighScore('dino-maze', 300);

  // Reset All
  sm.resetAll();
  assertEqual(sm.getHighScore('classic'), 0, 'classic reset to 0');
  assertEqual(sm.getHighScore('mud-puddle'), 0, 'mud-puddle reset to 0');
  assertEqual(sm.getHighScore('dino-maze'), 0, 'dino-maze reset to 0');
  assertEqual(sm.getVolume(), 1.0, 'volume reset to 1.0');
  assertEqual(sm.isMuted(), false, 'soundMuted reset to false');
}

// =============================================================================
// PARTICLE ENGINE EMPIRICAL TESTS
// =============================================================================

section('7. ParticleEngine: 1,000+ Rapid Spawn Bursts & Zero Array Growth');
{
  const POOL_CAPACITY = 300;
  const pe = new ParticleEngine(POOL_CAPACITY);

  assertEqual(pe.maxParticles, POOL_CAPACITY, `Max particles initialized to ${POOL_CAPACITY}`);
  assertEqual(pe.pool.length, POOL_CAPACITY, `Pool length is exactly ${POOL_CAPACITY}`);
  assertEqual(pe.active.length, 0, 'Initial active count is 0');

  // Burst spawn 1,200 particles (4x pool capacity)
  const startTime = performance.now();
  for (let i = 0; i < 1200; i++) {
    pe.spawn({
      x: i % 100,
      y: (i * 7) % 100,
      vx: 10,
      vy: -20,
      type: 'sparkle',
      maxLife: 1.0
    });
  }
  const duration = performance.now() - startTime;

  assertEqual(pe.pool.length, POOL_CAPACITY, `Pool array length remained strictly ${POOL_CAPACITY} after 1200 spawns (Zero GC expansion)`);
  assertEqual(pe.active.length, POOL_CAPACITY, `Active particles capped at pool capacity ${POOL_CAPACITY}`);
  assert(duration < 50, `1,200 particle spawns executed in ${duration.toFixed(2)}ms (< 50ms)`);

  // Clear pool
  pe.clear();
  assertEqual(pe.active.length, 0, 'clear() immediately resets active particle count to 0');
  assertEqual(pe.pool.length, POOL_CAPACITY, 'Pool length unchanged after clear()');
}

section('8. ParticleEngine: Object Pool Recycling (Oldest Particle Eviction)');
{
  const pe = new ParticleEngine(3);

  // Spawn 3 particles with differing maxLife
  const p0 = pe.spawn({ x: 10, maxLife: 1.0 }); // life = 1.0, ratio = 1.0
  const p1 = pe.spawn({ x: 20, maxLife: 2.0 }); // life = 2.0, ratio = 1.0
  const p2 = pe.spawn({ x: 30, maxLife: 3.0 }); // life = 3.0, ratio = 1.0

  assertEqual(pe.active.length, 3, 'Pool is fully saturated with 3 active particles');

  // Advance time by 0.6s
  // p0: life = 0.4, ratio = 0.4 / 1.0 = 0.40 (Lowest remaining ratio -> oldest/most depleted)
  // p1: life = 1.4, ratio = 1.4 / 2.0 = 0.70
  // p2: life = 2.4, ratio = 2.4 / 3.0 = 0.80
  pe.update(0.6);

  // Spawn 4th particle: should recycle p0 (lowest ratio)
  const p3 = pe.spawn({ x: 999, maxLife: 5.0, type: 'confetti' });
  assertEqual(p3.x, 999, 'Recycled particle has updated x position');
  assertEqual(p3.type, 'confetti', 'Recycled particle has updated type');
  assertEqual(p3.active, true, 'Recycled particle is active');
  assertEqual(pe.active.length, 3, 'Active count remains capped at 3');
}

section('9. ParticleEngine: Physics Updates across All 8 Particle Types + Steam + Score Popup');
{
  const pe = new ParticleEngine(50);

  // 1. Feather: gravity ay: 35, drag: 0.98, horizontal sine wave oscillation
  pe.clear();
  pe.spawnFeathers(100, 100, 1);
  const feather = pe.active[0];
  assert(feather.type === 'feather', 'Feather spawned with type feather');
  const initialFeatherVx = feather.vx;
  const initialFeatherVy = feather.vy;
  pe.update(0.1);
  assert(feather.vy !== initialFeatherVy, 'Feather vertical velocity updated via gravity');
  assert(feather.x !== 100, 'Feather position moved horizontally');
  assert(feather.rotation !== undefined, 'Feather has rotational animation');

  // 2. Sparkle: pulsing size = initialSize * Math.sin(ratio * PI)
  pe.clear();
  pe.spawnSparkles(200, 200, 1);
  const sparkle = pe.active[0];
  assert(sparkle.type === 'sparkle', 'Sparkle spawned with type sparkle');
  const initSparkleSize = sparkle.initialSize || sparkle.size;
  pe.update(sparkle.maxLife * 0.5); // At 50% life, sin(0.5 * PI) = 1.0 (Peak size)
  const midSize = sparkle.size;
  assert(midSize > 0, 'Sparkle size is positive at mid-life');
  pe.update(sparkle.maxLife * 0.45); // Near end of life
  assert(sparkle.size < midSize, 'Sparkle shrinks back down as life diminishes');

  // 3. EggShell: high gravity ay: 520, tumbling rotation
  pe.clear();
  pe.spawnEggCrack(150, 150, 1);
  const egg = pe.active[0];
  assert(egg.type === 'eggShell', 'Egg shell spawned with type eggShell');
  const initEggVy = egg.vy;
  pe.update(0.1);
  assert(egg.vy > initEggVy, 'Egg shell accelerated downwards rapidly by gravity (ay=520)');

  // 4. Bubble: upward buoyancy ay: -50, horizontal wobble
  pe.clear();
  pe.spawnBubbles(100, 300, 1);
  const bubble = pe.active[0];
  assert(bubble.type === 'bubble', 'Bubble spawned with type bubble');
  pe.update(0.1);
  assert(bubble.vy < 0, 'Bubble has upward vertical velocity (vy < 0)');
  assert(bubble.y < 300, 'Bubble displaced upwards (y < 300)');

  // 5. Confetti: 3D scale flip (scaleX = Math.cos(life * 10 + phase))
  pe.clear();
  pe.spawnConfetti(250, 250, 1);
  const confetti = pe.active[0];
  assert(confetti.type === 'confetti', 'Confetti spawned with type confetti');
  pe.update(0.15);
  assert(typeof confetti.scaleX === 'number' && confetti.scaleX >= -1 && confetti.scaleX <= 1, 'Confetti scaleX oscillates between -1 and 1');

  // 6. SoapBubble: upward drift ay: -15, double highlight
  pe.clear();
  pe.spawnSoapBubbles(100, 100, 1);
  const soapBubble = pe.active[0];
  assert(soapBubble.type === 'soapBubble', 'SoapBubble spawned with type soapBubble');
  assert(soapBubble.maxLife >= 1.5, 'SoapBubble has extended toddler floating life');

  // 7. PancakeSyrup: heavy gravity ay: 650
  pe.clear();
  pe.spawnPancakeSyrup(50, 50, 1);
  const syrup = pe.active[0];
  assert(syrup.type === 'pancakeSyrup', 'PancakeSyrup spawned with type pancakeSyrup');
  const initSyrupVy = syrup.vy;
  pe.update(0.1);
  assert(syrup.vy > initSyrupVy + 50, 'PancakeSyrup has high downward acceleration (ay=650)');

  // 8. MudClod & MudSplash: high gravity ay: 480, standard and golden palettes
  pe.clear();
  pe.spawnMudSplash(70, 70, 4, false); // standard
  pe.spawnMudSplash(70, 70, 4, true);  // golden
  assertEqual(pe.active.length, 8, '8 mud clods spawned');
  for (const mud of pe.active) {
    assertEqual(mud.type, 'mudClod', 'Mud particle is type mudClod');
  }

  // 9. Steam: upward steam drift
  pe.clear();
  pe.spawnSteam(80, 80);
  const steam = pe.active[0];
  assertEqual(steam.type, 'steam', 'Steam particle is type steam');
  assert(steam.vy < 0, 'Steam moves upwards');

  // 10. Score Popup: floating text
  pe.clear();
  pe.spawnScorePopup(120, 120, '+100');
  const textP = pe.active[0];
  assertEqual(textP.type, 'text', 'Score popup particle is type text');
  assertEqual(textP.text, '+100', 'Score popup text is +100');
}

section('10. ParticleEngine: Alpha Decay and Lifecycle Deactivation');
{
  const pe = new ParticleEngine(10);
  pe.spawn({
    x: 0,
    y: 0,
    maxLife: 1.0,
    type: 'sparkle'
  });

  assertEqual(pe.active.length, 1, '1 particle active');
  assertEqual(pe.active[0].alpha, 1.0, 'Initial alpha is 1.0');

  // Advance by 0.5s -> alpha should be 0.5
  pe.update(0.5);
  assert(Math.abs(pe.active[0].alpha - 0.5) < 0.01, 'Alpha decayed to 0.5 at half life');
  assertEqual(pe.active[0].active, true, 'Particle remains active');

  // Advance by 0.4s -> alpha should be 0.1
  pe.update(0.4);
  assert(Math.abs(pe.active[0].alpha - 0.1) < 0.01, 'Alpha decayed to 0.1 at 90% life');
  assertEqual(pe.active[0].active, true, 'Particle remains active');

  // Advance by 0.15s -> life expires (life <= 0)
  pe.update(0.15);
  assertEqual(pe.active.length, 0, 'Particle automatically deactivated when life <= 0');
}

section('11. ParticleEngine: Mock Canvas 2D Render Execution (All Particle Types)');
{
  // Mock CanvasRenderingContext2D
  const drawCalls: Record<string, number> = {
    save: 0,
    restore: 0,
    translate: 0,
    rotate: 0,
    scale: 0,
    beginPath: 0,
    closePath: 0,
    arc: 0,
    ellipse: 0,
    fill: 0,
    stroke: 0,
    fillRect: 0,
    strokeText: 0,
    fillText: 0,
    moveTo: 0,
    lineTo: 0
  };

  const mockCtx = {
    globalAlpha: 1.0,
    fillStyle: '#000',
    strokeStyle: '#000',
    lineWidth: 1,
    font: '',
    textAlign: 'left',
    save() { drawCalls.save++; },
    restore() { drawCalls.restore++; },
    translate(x: number, y: number) {
      if (isNaN(x) || isNaN(y)) throw new Error(`NaN in translate(${x}, ${y})`);
      drawCalls.translate++;
    },
    rotate(angle: number) {
      if (isNaN(angle)) throw new Error(`NaN in rotate(${angle})`);
      drawCalls.rotate++;
    },
    scale(sx: number, sy: number) {
      if (isNaN(sx) || isNaN(sy)) throw new Error(`NaN in scale(${sx}, ${sy})`);
      drawCalls.scale++;
    },
    beginPath() { drawCalls.beginPath++; },
    closePath() { drawCalls.closePath++; },
    arc(x: number, y: number, r: number, sa: number, ea: number) {
      if (isNaN(x) || isNaN(y) || isNaN(r) || isNaN(sa) || isNaN(ea)) {
        throw new Error(`NaN in arc(${x}, ${y}, ${r})`);
      }
      drawCalls.arc++;
    },
    ellipse(x: number, y: number, rx: number, ry: number, rot: number, sa: number, ea: number) {
      if (isNaN(x) || isNaN(y) || isNaN(rx) || isNaN(ry) || isNaN(rot)) {
        throw new Error(`NaN in ellipse(${x}, ${y}, ${rx}, ${ry})`);
      }
      drawCalls.ellipse++;
    },
    fill() { drawCalls.fill++; },
    stroke() { drawCalls.stroke++; },
    fillRect(x: number, y: number, w: number, h: number) {
      if (isNaN(x) || isNaN(y) || isNaN(w) || isNaN(h)) {
        throw new Error(`NaN in fillRect(${x}, ${y}, ${w}, ${h})`);
      }
      drawCalls.fillRect++;
    },
    strokeText(text: string, x: number, y: number) {
      if (isNaN(x) || isNaN(y)) throw new Error(`NaN in strokeText(${text}, ${x}, ${y})`);
      drawCalls.strokeText++;
    },
    fillText(text: string, x: number, y: number) {
      if (isNaN(x) || isNaN(y)) throw new Error(`NaN in fillText(${text}, ${x}, ${y})`);
      drawCalls.fillText++;
    },
    moveTo(x: number, y: number) {
      if (isNaN(x) || isNaN(y)) throw new Error(`NaN in moveTo(${x}, ${y})`);
      drawCalls.moveTo++;
    },
    lineTo(x: number, y: number) {
      if (isNaN(x) || isNaN(y)) throw new Error(`NaN in lineTo(${x}, ${y})`);
      drawCalls.lineTo++;
    }
  } as unknown as CanvasRenderingContext2D;

  const pe = new ParticleEngine(100);

  // 1. Render empty particle pool
  let didThrowOnEmptyRender = false;
  try {
    pe.render(mockCtx);
  } catch (e) {
    didThrowOnEmptyRender = true;
  }
  assert(!didThrowOnEmptyRender, 'Empty ParticleEngine renders with zero errors');
  assertEqual(drawCalls.save, drawCalls.restore, 'save() and restore() calls are balanced on empty render');

  // Reset draw calls
  for (const k of Object.keys(drawCalls)) drawCalls[k] = 0;

  // 2. Spawn one of every single particle type
  pe.spawnFeathers(50, 50, 2);
  pe.spawnSparkles(60, 60, 2);
  pe.spawnEggCrack(70, 70, 2);
  pe.spawnBubbles(80, 80, 2);
  pe.spawnConfetti(90, 90, 2);
  pe.spawnSoapBubbles(100, 100, 2);
  pe.spawnPancakeSyrup(110, 110, 2);
  pe.spawnMudSplash(120, 120, 2, false);
  pe.spawnMudSplash(130, 130, 2, true);
  pe.spawnSteam(140, 140);
  pe.spawnScorePopup(150, 150, '+50 PTS');

  const totalSpawned = pe.active.length;
  assert(totalSpawned >= 19, `Spawned mixed batch of ${totalSpawned} active particles across all types`);

  // Step physics once
  pe.update(0.016);

  // Render all active particles
  let didThrowOnPopulatedRender = false;
  try {
    pe.render(mockCtx);
  } catch (e) {
    didThrowOnPopulatedRender = true;
    console.error('Render error:', e);
  }
  assert(!didThrowOnPopulatedRender, 'Populated ParticleEngine renders all 8 particle types without errors or NaNs');

  // Verify save/restore balance (1 outer save/restore + 1 per active particle)
  assertEqual(
    drawCalls.save,
    drawCalls.restore,
    `Canvas save (${drawCalls.save}) and restore (${drawCalls.restore}) counts are strictly balanced`
  );
  assertEqual(
    drawCalls.save,
    totalSpawned + 1,
    `Total save calls equals active particles (${totalSpawned}) + 1 outer frame save`
  );

  // Verify specific draw calls were issued
  assert(drawCalls.ellipse > 0, `ctx.ellipse called for feathers/syrup (${drawCalls.ellipse} calls)`);
  assert(drawCalls.fillRect > 0, `ctx.fillRect called for confetti (${drawCalls.fillRect} calls)`);
  assert(drawCalls.fillText > 0, `ctx.fillText called for score popup (${drawCalls.fillText} calls)`);
  assert(drawCalls.arc > 0, `ctx.arc called for bubbles/sparkles/mud (${drawCalls.arc} calls)`);
  assert(drawCalls.stroke > 0, `ctx.stroke called for outlines (${drawCalls.stroke} calls)`);
}

section('12. Stress & Extreme Boundary Conditions');
{
  const pe = new ParticleEngine(300);

  // Extreme delta time spike (dt = 100.0 seconds)
  pe.spawnSparkles(100, 100, 50);
  assertEqual(pe.active.length, 50, '50 sparkles spawned');
  let didThrowOnLargeDt = false;
  try {
    pe.update(100.0);
  } catch (e) {
    didThrowOnLargeDt = true;
  }
  assert(!didThrowOnLargeDt, 'update(100.0) large dt spike handled without throwing');
  assertEqual(pe.active.length, 0, 'All particles expired cleanly under large dt spike');

  // Zero delta time (dt = 0)
  pe.spawnConfetti(50, 50, 10);
  let didThrowOnZeroDt = false;
  try {
    pe.update(0);
  } catch (e) {
    didThrowOnZeroDt = true;
  }
  assert(!didThrowOnZeroDt, 'update(0) zero dt handled without throwing');
  assertEqual(pe.active.length, 10, '10 particles remain active under zero dt');

  // 10,000 continuous updates simulation
  const t0 = performance.now();
  for (let step = 0; step < 1000; step++) {
    if (step % 10 === 0) {
      pe.spawnFeathers(50, 50, 3);
      pe.spawnConfetti(100, 100, 5);
      pe.spawnMudSplash(150, 150, 4);
    }
    pe.update(0.016);
  }
  const t1 = performance.now();
  assert(t1 - t0 < 200, `1,000 frame continuous simulation executed in ${(t1 - t0).toFixed(2)}ms (< 200ms)`);
}

section('13. StorageManager: Adversarial Keys, Prototype Protection & Numerical Boundaries');
{
  mockStorage.clear();
  const sm = new StorageManager();

  // Test prototype / unusual keys
  const weirdKeys = ['__proto__', 'constructor', 'prototype', 'toString', '', '   ', 'NON_EXISTENT_MODE_12345'];
  for (const k of weirdKeys) {
    let score = 0;
    let didThrow = false;
    try {
      score = sm.getHighScore(k);
    } catch (e) {
      didThrow = true;
    }
    assert(!didThrow, `getHighScore('${k}') did not throw`);
    assert(typeof score === 'number' && !isNaN(score), `getHighScore('${k}') returned valid number (${score})`);
  }

  // Extreme Safe Integer score
  const maxScore = Number.MAX_SAFE_INTEGER;
  const savedMax = sm.saveHighScore('classic', maxScore);
  assert(savedMax === true, 'Saved MAX_SAFE_INTEGER score successfully');
  assertEqual(sm.getHighScore('classic'), maxScore, 'Retrieved MAX_SAFE_INTEGER correctly');

  // Serialization round-trip verification
  const jsonStr = JSON.stringify(sm.data);
  const reParsed = JSON.parse(jsonStr);
  assertEqual(reParsed.highScores.eggLaying, maxScore, 'Round-trip JSON serialization preserved eggLaying score');
  assertEqual(reParsed.version, 1, 'Version is 1');
}

section('14. ParticleEngine: 5,000-Particle High Polyphony & Full 300-Particle Canvas Render');
{
  // 1. High polyphony pool (5,000 particles)
  const HUGE_POOL = 5000;
  const peHuge = new ParticleEngine(HUGE_POOL);
  assertEqual(peHuge.pool.length, HUGE_POOL, 'Pool initialized with 5,000 particles');

  const t0 = performance.now();
  for (let i = 0; i < 20000; i++) {
    peHuge.spawn({
      x: i % 500,
      y: (i * 13) % 500,
      vx: (Math.random() - 0.5) * 100,
      vy: (Math.random() - 0.5) * 100,
      type: (['feather', 'sparkle', 'eggShell', 'bubble', 'confetti', 'soapBubble', 'pancakeSyrup', 'mudClod'] as any)[i % 8],
      maxLife: 1.0 + (i % 5) * 0.2
    });
  }
  const t1 = performance.now();
  assertEqual(peHuge.active.length, HUGE_POOL, 'Active particles saturated at 5,000');
  assertEqual(peHuge.pool.length, HUGE_POOL, 'Pool array length remained strictly 5,000 without memory expansion');
  assert(t1 - t0 < 500, `20,000 particle spawns into 5,000 pool executed in ${(t1 - t0).toFixed(2)}ms (< 500ms for 200M ops)`);

  // Step physics across all 5,000 particles
  const tPhys0 = performance.now();
  for (let f = 0; f < 60; f++) {
    peHuge.update(0.016);
  }
  const tPhys1 = performance.now();
  assert(tPhys1 - tPhys0 < 250, `60 frames of 5,000 particle physics executed in ${(tPhys1 - tPhys0).toFixed(2)}ms (< 250ms)`);

  // 2. Full 300 active particle Canvas 2D render
  const peStandard = new ParticleEngine(300);
  for (let i = 0; i < 300; i++) {
    const types: any[] = ['feather', 'sparkle', 'eggShell', 'bubble', 'confetti', 'soapBubble', 'pancakeSyrup', 'mudClod', 'steam', 'text'];
    const shapes: any[] = ['FEATHER', 'STAR', 'EGG_SHELL', 'BUBBLE', 'CONFETTI', 'SOAP_BUBBLE', 'PANCAKE_SYRUP', 'MUD_CLOD', 'CIRCLE', 'TEXT'];
    peStandard.spawn({
      x: (i * 3) % 960,
      y: (i * 2) % 540,
      vx: 10,
      vy: -10,
      type: types[i % types.length],
      shape: shapes[i % shapes.length],
      text: i % 10 === 9 ? `+${i * 10}` : undefined,
      maxLife: 2.0
    });
  }
  assertEqual(peStandard.active.length, 300, '300 particles active for rendering test');

  const mockCtx = {
    globalAlpha: 1.0, fillStyle: '#000', strokeStyle: '#000', lineWidth: 1, font: '', textAlign: 'left',
    save() {}, restore() {}, translate(x: number, y: number) { if (isNaN(x) || isNaN(y)) throw new Error('NaN'); },
    rotate(a: number) { if (isNaN(a)) throw new Error('NaN'); },
    scale(sx: number, sy: number) { if (isNaN(sx) || isNaN(sy)) throw new Error('NaN'); },
    beginPath() {}, closePath() {},
    arc(x: number, y: number, r: number) { if (isNaN(x) || isNaN(y) || isNaN(r)) throw new Error('NaN'); },
    ellipse(x: number, y: number, rx: number, ry: number) { if (isNaN(x) || isNaN(y) || isNaN(rx) || isNaN(ry)) throw new Error('NaN'); },
    fill() {}, stroke() {},
    fillRect(x: number, y: number, w: number, h: number) { if (isNaN(x) || isNaN(y) || isNaN(w) || isNaN(h)) throw new Error('NaN'); },
    strokeText(t: string) { if (!t) throw new Error('Empty text'); },
    fillText(t: string) { if (!t) throw new Error('Empty text'); },
    moveTo() {}, lineTo() {}
  } as unknown as CanvasRenderingContext2D;

  let didThrowOn300Render = false;
  try {
    peStandard.render(mockCtx);
  } catch (e) {
    didThrowOn300Render = true;
    console.error('Render error:', e);
  }
  assert(!didThrowOn300Render, 'Full 300-particle saturated Canvas 2D render executed without errors');
}

// -----------------------------------------------------------------------------
// Final Summary Report
// -----------------------------------------------------------------------------
console.log(`\n============================================================`);
console.log(`EMPIRICAL STRESS TEST RESULTS FOR MILESTONE M1`);
console.log(`============================================================`);
console.log(`Total Assertions Run: ${totalTests}`);
console.log(`Passed Assertions   : ${passedTests}`);
console.log(`Failed Assertions   : ${failedTests}`);

if (failedTests > 0) {
  console.error(`\nFailures (${failedTests}):`);
  for (const f of failures) console.error(f);
  process.exit(1);
} else {
  console.log(`\nALL ${passedTests} EMPIRICAL ASSERTIONS PASSED WITH ZERO FAILURES.`);
  process.exit(0);
}
