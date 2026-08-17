// =============================================================================
// Milestone M4 Challenger 2 Empirical Adversarial Stress Test Suite
// Focus: Mode 3 (Chick Maze), Mode 4 (Daddy Pig), PWA & Service Worker Offline
// =============================================================================

export class MockLocalStorage implements Storage {
  private store = new Map<string, string>();
  getItem(key: string): string | null { return this.store.has(key) ? this.store.get(key)! : null; }
  setItem(key: string, value: string): void { this.store.set(key, String(value)); }
  removeItem(key: string): void { this.store.delete(key); }
  clear(): void { this.store.clear(); }
  key(index: number): string | null { return Array.from(this.store.keys())[index] || null; }
  get length(): number { return this.store.size; }
}

export class MockAudioParam {
  public value: number;
  public targetValue: number;
  constructor(defaultValue = 1) { this.value = defaultValue; this.targetValue = defaultValue; }
  setValueAtTime(val: number) { this.value = val; this.targetValue = val; return this; }
  exponentialRampToValueAtTime(val: number) { this.targetValue = val; return this; }
  linearRampToValueAtTime(val: number) { this.targetValue = val; return this; }
  setTargetAtTime(val: number) { this.targetValue = val; return this; }
  cancelScheduledValues() { return this; }
}

export class MockAudioNode {
  public connectedTo: any[] = [];
  connect(dest: any) { this.connectedTo.push(dest); return dest; }
  disconnect() { this.connectedTo = []; }
}

export class MockGainNode extends MockAudioNode {
  public gain = new MockAudioParam(1);
}

export class MockOscillatorNode extends MockAudioNode {
  public type: OscillatorType = 'sine';
  public frequency = new MockAudioParam(440);
  public onended: (() => void) | null = null;
  start() {}
  stop() { if (this.onended) setTimeout(() => this.onended?.(), 0); }
}

export class MockAudioBufferSourceNode extends MockAudioNode {
  public buffer: any = null;
  public playbackRate = new MockAudioParam(1);
  public onended: (() => void) | null = null;
  start() {}
  stop() { if (this.onended) setTimeout(() => this.onended?.(), 0); }
}

export class MockBiquadFilterNode extends MockAudioNode {
  public type: BiquadFilterType = 'lowpass';
  public frequency = new MockAudioParam(350);
  public Q = new MockAudioParam(1);
  public gain = new MockAudioParam(0);
}

export class MockAudioBuffer {
  public numberOfChannels: number;
  public length: number;
  public sampleRate: number;
  public duration: number;
  private _data: Float32Array;
  constructor(channels: number, length: number, sampleRate: number) {
    this.numberOfChannels = channels;
    this.length = length;
    this.sampleRate = sampleRate;
    this.duration = length / sampleRate;
    this._data = new Float32Array(length);
  }
  getChannelData() { return this._data; }
}

export class MockDynamicsCompressorNode extends MockAudioNode {
  public threshold = new MockAudioParam(-24);
  public knee = new MockAudioParam(30);
  public ratio = new MockAudioParam(12);
  public attack = new MockAudioParam(0.003);
  public release = new MockAudioParam(0.25);
}

export class MockAudioContext {
  public state = 'running';
  public sampleRate = 44100;
  public currentTime = 0;
  public destination = new MockAudioNode();
  createGain() { return new MockGainNode(); }
  createOscillator() { return new MockOscillatorNode(); }
  createBufferSource() { return new MockAudioBufferSourceNode(); }
  createBiquadFilter() { return new MockBiquadFilterNode(); }
  createDynamicsCompressor() { return new MockDynamicsCompressorNode(); }
  createBuffer(channels: number, length: number, sampleRate: number) {
    return new MockAudioBuffer(channels, length, sampleRate);
  }
  async resume() { this.state = 'running'; }
  async suspend() { this.state = 'suspended'; }
  async close() { this.state = 'closed'; }
}

export class MockEvent {
  public type: string;
  public bubbles: boolean;
  public cancelable: boolean;
  public defaultPrevented = false;
  constructor(type: string, options: any = {}) {
    this.type = type;
    this.bubbles = !!options.bubbles;
    this.cancelable = !!options.cancelable;
  }
  preventDefault() { if (this.cancelable) this.defaultPrevented = true; }
  stopPropagation() {}
}

export class MockPointerEvent extends MockEvent {
  public pointerId: number;
  public clientX: number;
  public clientY: number;
  public pointerType: string;
  public isPrimary: boolean;
  constructor(type: string, options: any = {}) {
    super(type, options);
    this.pointerId = options.pointerId ?? 1;
    this.clientX = options.clientX ?? 0;
    this.clientY = options.clientY ?? 0;
    this.pointerType = options.pointerType ?? 'touch';
    this.isPrimary = options.isPrimary ?? true;
  }
}

export interface CanvasCall {
  method: string;
  args: any[];
  fillStyle?: any;
  strokeStyle?: any;
  lineWidth?: number;
}

export class SpyCanvasContext {
  public calls: CanvasCall[] = [];
  public fillStyle: string | CanvasGradient | CanvasPattern = '#000000';
  public strokeStyle: string | CanvasGradient | CanvasPattern = '#000000';
  public lineWidth: number = 1;
  public saveDepth: number = 0;
  public maxSaveDepth: number = 0;
  public saveCount: number = 0;
  public restoreCount: number = 0;

  private record(method: string, args: any[]) {
    this.calls.push({
      method,
      args: [...args],
      fillStyle: this.fillStyle,
      strokeStyle: this.strokeStyle,
      lineWidth: this.lineWidth
    });
  }

  reset() {
    this.calls = [];
    this.saveDepth = 0;
    this.maxSaveDepth = 0;
    this.saveCount = 0;
    this.restoreCount = 0;
  }

  save() {
    this.saveCount++;
    this.saveDepth++;
    if (this.saveDepth > this.maxSaveDepth) this.maxSaveDepth = this.saveDepth;
    this.record('save', []);
  }

  restore() {
    this.restoreCount++;
    this.saveDepth--;
    this.record('restore', []);
  }

  scale(sx: number, sy: number) { this.record('scale', [sx, sy]); }
  translate(tx: number, ty: number) { this.record('translate', [tx, ty]); }
  rotate(angle: number) { this.record('rotate', [angle]); }
  beginPath() { this.record('beginPath', []); }
  closePath() { this.record('closePath', []); }
  moveTo(x: number, y: number) { this.record('moveTo', [x, y]); }
  lineTo(x: number, y: number) { this.record('lineTo', [x, y]); }
  quadraticCurveTo(cp1x: number, cp1y: number, x: number, y: number) { this.record('quadraticCurveTo', [cp1x, cp1y, x, y]); }
  bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number) { this.record('bezierCurveTo', [cp1x, cp1y, cp2x, cp2y, x, y]); }
  arc(x: number, y: number, r: number, sa: number, ea: number, anticlockwise?: boolean) { this.record('arc', [x, y, r, sa, ea, anticlockwise]); }
  ellipse(x: number, y: number, rx: number, ry: number, rot: number, sa: number, ea: number, anticlockwise?: boolean) { this.record('ellipse', [x, y, rx, ry, rot, sa, ea, anticlockwise]); }
  rect(x: number, y: number, w: number, h: number) { this.record('rect', [x, y, w, h]); }
  roundRect(x: number, y: number, w: number, h: number, radii: any) { this.record('roundRect', [x, y, w, h, radii]); }
  fillRect(x: number, y: number, w: number, h: number) { this.record('fillRect', [x, y, w, h]); }
  strokeRect(x: number, y: number, w: number, h: number) { this.record('strokeRect', [x, y, w, h]); }
  fill() { this.record('fill', []); }
  stroke() { this.record('stroke', []); }
  fillText(text: string, x: number, y: number) { this.record('fillText', [text, x, y]); }
  measureText(text: string) { return { width: text.length * 10 }; }
  createLinearGradient() { return { addColorStop() {} }; }
  createRadialGradient() { return { addColorStop() {} }; }
}

export class MockHTMLCanvasElement {
  public width = 960;
  public height = 540;
  public style = { width: '960px', height: '540px', display: 'block' };
  public _ctx: any;
  private _listeners = new Map<string, Function[]>();
  constructor() {
    this._ctx = new SpyCanvasContext();
  }
  getContext(type: string) {
    return type === '2d' ? this._ctx : null;
  }
  getBoundingClientRect() {
    return { left: 0, top: 0, width: this.width, height: this.height, x: 0, y: 0, right: this.width, bottom: this.height };
  }
  addEventListener(type: string, listener: Function) {
    if (!this._listeners.has(type)) this._listeners.set(type, []);
    this._listeners.get(type)!.push(listener);
  }
  removeEventListener(type: string, listener: Function) {
    if (!this._listeners.has(type)) return;
    this._listeners.set(type, this._listeners.get(type)!.filter(l => l !== listener));
  }
  dispatchEvent(event: any) {
    const list = this._listeners.get(event.type) || [];
    for (const fn of list) fn(event);
    return true;
  }
}

const windowListeners = new Map<string, Function[]>();
const mockWindow: any = {
  innerWidth: 960,
  innerHeight: 540,
  devicePixelRatio: 1.0,
  localStorage: new MockLocalStorage(),
  AudioContext: MockAudioContext,
  webkitAudioContext: MockAudioContext,
  HTMLCanvasElement: MockHTMLCanvasElement,
  PointerEvent: MockPointerEvent,
  Event: MockEvent,
  performance: { now: () => Date.now() },
  navigator: { vibrate: () => true, userAgent: 'NodeTestRunner', onLine: true },
  addEventListener(type: string, listener: Function) {
    if (!windowListeners.has(type)) windowListeners.set(type, []);
    windowListeners.get(type)!.push(listener);
  },
  removeEventListener(type: string, listener: Function) {
    if (!windowListeners.has(type)) return;
    windowListeners.set(type, windowListeners.get(type)!.filter(l => l !== listener));
  },
  dispatchEvent(event: any) {
    const list = windowListeners.get(event.type) || [];
    for (const fn of list) fn(event);
    return true;
  }
};

const mockDocument: any = {
  createElement(tag: string) {
    if (tag === 'canvas') return new MockHTMLCanvasElement();
    return { style: {}, addEventListener() {}, removeEventListener() {}, setAttribute() {}, getAttribute() { return null; } };
  },
  getElementById() { return new MockHTMLCanvasElement(); },
  documentElement: { requestFullscreen: async () => {}, webkitRequestFullscreen: () => {} },
  fullscreenElement: null,
  exitFullscreen: async () => {},
  addEventListener(type: string, listener: Function) { mockWindow.addEventListener(type, listener); },
  removeEventListener(type: string, listener: Function) { mockWindow.removeEventListener(type, listener); }
};

(globalThis as any).window = mockWindow;
(globalThis as any).document = mockDocument;
(globalThis as any).localStorage = mockWindow.localStorage;
(globalThis as any).AudioContext = MockAudioContext;
(globalThis as any).webkitAudioContext = MockAudioContext;
(globalThis as any).HTMLCanvasElement = MockHTMLCanvasElement;
(globalThis as any).PointerEvent = MockPointerEvent;
(globalThis as any).Event = MockEvent;
(globalThis as any).navigator = mockWindow.navigator;
(globalThis as any).performance = mockWindow.performance;

import { GameEngine } from '../../src/engine/GameEngine';
import { InputManager } from '../../src/engine/InputManager';
import { DisplayManager } from '../../src/engine/DisplayManager';
import { StorageManager } from '../../src/engine/StorageManager';
import { ParticleEngine } from '../../src/engine/ParticleEngine';
import { soundEngine } from '../../src/engine/SoundEngine';
import { ChickMazeScene } from '../../src/modes/ChickMazeScene';
import { DaddyPigScene } from '../../src/modes/DaddyPigScene';
import { PALETTE } from '../../src/graphics/palette';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// =============================================================================
// Test Harness & Assertions
// =============================================================================

let totalAssertions = 0;
let passedAssertions = 0;
let failedAssertions = 0;
const failures: string[] = [];

function assert(condition: boolean, testName: string, detail?: string) {
  totalAssertions++;
  if (condition) {
    passedAssertions++;
    console.log(`  ✓ [PASS] ${testName}`);
  } else {
    failedAssertions++;
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

function assertCloseTo(actual: number, expected: number, tolerance: number, testName: string) {
  const diff = Math.abs(actual - expected);
  assert(
    diff <= tolerance,
    testName,
    `Expected ${actual.toFixed(4)} to be within ${tolerance} of ${expected.toFixed(4)} (diff: ${diff.toFixed(4)})`
  );
}

function section(title: string) {
  console.log(`\n============================================================`);
  console.log(`SECTION: ${title}`);
  console.log(`============================================================`);
}

const mockCtx = new SpyCanvasContext() as unknown as CanvasRenderingContext2D;
const spy = mockCtx as unknown as SpyCanvasContext;

const canvas = document.createElement('canvas');
const engine = new GameEngine(canvas);

// =============================================================================
// 1. MODE 3: CHICK MAZE - FIFO SEED CAP UNDER RAPID TAP SPAMMING
// =============================================================================

section('1. Mode 3: Chick Maze - FIFO 6 Seeds Cap & Tap Spamming Stress');
{
  const scene = new ChickMazeScene(engine);
  scene.enter();

  // Initial state check
  assertEqual(scene.seeds.length, 0, 'Seeds array starts empty');
  assertEqual(scene.chicks.length, 5, 'Chicks array starts with 5 wandering chicks');

  soundEngine.spy.clear();

  // 1.1 Drop 1 to 6 seeds sequentially
  for (let i = 1; i <= 6; i++) {
    scene.dropSeed(100 + i * 20, 200 + i * 10);
    assertEqual(scene.seeds.length, i, `Seeds count is exactly ${i} after dropping seed #${i}`);
  }

  // Verify first seed is at (120, 210)
  assertEqual(scene.seeds[0].x, 120, 'Oldest seed (seed 1) is at index 0');
  assertEqual(scene.seeds[5].x, 220, 'Newest seed (seed 6) is at index 5');

  // 1.2 Drop 7th seed -> FIFO eviction of oldest seed (seed 1)
  scene.dropSeed(240, 270);
  assertEqual(scene.seeds.length, 6, 'Seed count remains capped strictly at 6');
  assertEqual(scene.seeds[0].x, 140, 'Seed 1 evicted; seed 2 is now oldest at index 0');
  assertEqual(scene.seeds[5].x, 240, 'New seed 7 is at index 5');

  // 1.3 Rapid Tap Spamming Fuzz Test (100 rapid seeds dropped in tight loop)
  for (let spam = 8; spam <= 107; spam++) {
    scene.dropSeed(spam * 5, spam * 3);
  }

  assertEqual(scene.seeds.length, 6, 'Seed count remains strictly capped at 6 after 100 rapid drops');
  assertEqual(scene.seeds[5].x, 107 * 5, 'Most recently dropped seed is preserved at index 5');
  assertEqual(scene.seeds[0].x, 102 * 5, 'FIFO ordering maintained (index 0 is seed 102)');

  // Verify audio spy recorded SFX for all dropped seeds
  const seedDropEvents = soundEngine.spy.events.filter(e => e.type === 'seedDrop');
  assertEqual(seedDropEvents.length, 107, 'Audio trigger seedDrop called for every dropped seed (107 times)');
}

// =============================================================================
// 2. MODE 3: CHICK MAZE - BOIDS FLOCKING, SEED & COOP ATTRACTION MATH
// =============================================================================

section('2. Mode 3: Chick Maze - Reynolds Boids Flocking AI & Vector Math');
{
  const scene = new ChickMazeScene(engine);
  scene.enter();
  const input = new InputManager(engine.display);

  // 2.1 Separation Force Math
  // Place two chicks close together (10px apart horizontally)
  scene.seeds = [];
  scene.chicks = [
    { x: 200, y: 250, vx: 0, vy: 0, walkCycle: 0, facingLeft: false, state: 'WANDERING' },
    { x: 210, y: 250, vx: 0, vy: 0, walkCycle: 0, facingLeft: false, state: 'WANDERING' }
  ];

  // Update 1 frame (dt = 0.01667s)
  const dt = 1 / 60;
  scene.update(dt, input);

  // Chick 0 (left) should accelerate left (vx < 0); Chick 1 (right) should accelerate right (vx > 0)
  assert(scene.chicks[0].vx < 0, `Chick 0 separated leftwards (vx = ${scene.chicks[0].vx.toFixed(2)})`);
  assert(scene.chicks[1].vx > 0, `Chick 1 separated rightwards (vx = ${scene.chicks[1].vx.toFixed(2)})`);
  const finalDist = Math.abs(scene.chicks[1].x - scene.chicks[0].x);
  assert(finalDist > 10, `Inter-chick distance increased (${finalDist.toFixed(2)}px > 10.0px)`);

  // 2.2 Alignment & Soft Cohesion Force
  // Place two chicks within alignment range (50px apart, cDist < 90) with differing velocities and no seeds
  scene.seeds = [];
  scene.chicks = [
    { x: 200, y: 250, vx: 40, vy: 0, walkCycle: 0, facingLeft: false, state: 'WANDERING' },
    { x: 250, y: 250, vx: -20, vy: 0, walkCycle: 0, facingLeft: false, state: 'WANDERING' }
  ];

  const initialVelDiff = scene.chicks[0].vx - scene.chicks[1].vx; // 60
  for (let f = 0; f < 30; f++) {
    scene.update(dt, input);
  }
  const finalVelDiff = scene.chicks[0].vx - scene.chicks[1].vx;
  assert(finalVelDiff < initialVelDiff, `Velocity difference converged under alignment (${finalVelDiff.toFixed(2)} < ${initialVelDiff})`);

  // 2.3 Seed Attraction Steering & Priority over Cohesion
  scene.seeds = [{ x: 300, y: 250, remaining: 1 }];
  scene.chicks = [
    { x: 200, y: 250, vx: 0, vy: 0, walkCycle: 0, facingLeft: false, state: 'WANDERING' }
  ];

  // Update 10 frames toward seed at x=300
  for (let f = 0; f < 10; f++) {
    scene.update(dt, input);
  }

  assert(scene.chicks[0].vx > 0, `Chick steers rightward toward seed (vx = ${scene.chicks[0].vx.toFixed(2)})`);
  assert(scene.chicks[0].x > 200, `Chick x position advanced toward seed (x = ${scene.chicks[0].x.toFixed(2)})`);

  // 2.4 Max Speed Clamping (80 px/s)
  // Inject excessive velocity and verify clamp
  scene.chicks[0].vx = 150;
  scene.chicks[0].vy = 200;
  scene.update(dt, input);
  const speed = Math.hypot(scene.chicks[0].vx, scene.chicks[0].vy);
  assertCloseTo(speed, 80, 0.01, 'Chick speed is strictly clamped to max 80 px/s');

  // 2.5 Screen Boundary Constraints
  // Push chick toward extreme left/top
  scene.chicks[0].x = 10;
  scene.chicks[0].y = 50;
  scene.update(dt, input);
  assert(scene.chicks[0].x >= 40, `Chick x bounded at min 40px (actual: ${scene.chicks[0].x})`);
  assert(scene.chicks[0].y >= 120, `Chick y bounded at min 120px (actual: ${scene.chicks[0].y})`);

  // Push chick toward extreme right/bottom
  scene.chicks[0].x = 2000;
  scene.chicks[0].y = 2000;
  scene.update(dt, input);
  assert(scene.chicks[0].x <= engine.display.vWidth - 40, `Chick x bounded at max vWidth-40`);
  assert(scene.chicks[0].y <= engine.display.vHeight - 40, `Chick y bounded at max vHeight-40`);

  input.detach();
}

// =============================================================================
// 3. MODE 3: CHICK CONSUMPTION, COOP FANFARE & WAVE RESPAWN
// =============================================================================

section('3. Mode 3: Chick Maze - Seed Consumption Threshold & Coop Wave Loop');
{
  const scene = new ChickMazeScene(engine);
  scene.enter();
  const input = new InputManager(engine.display);

  // 3.1 Consumption Threshold: 14px boundary test
  // Seed at (200, 200)
  scene.seeds = [{ x: 200, y: 200, remaining: 1 }];
  // Chick at (185, 200) -> distance = 15px (> 14px -> NOT eaten yet)
  scene.chicks = [{ x: 185, y: 200, vx: 0, vy: 0, walkCycle: 0, facingLeft: false, state: 'WANDERING' }];

  scene.update(0.001, input); // Tiny dt so it barely moves
  assertEqual(scene.seeds.length, 1, 'Seed at 15px is NOT consumed (threshold is < 14px)');

  // Move chick to 13px distance
  scene.chicks[0].x = 187; // distance = 13px (< 14px -> consumed)
  soundEngine.spy.clear();
  scene.update(0.001, input);

  assertEqual(scene.seeds.length, 0, 'Seed at 13px (< 14px) is immediately consumed and removed');
  assert(scene.particles.active.length > 0, 'Sparkle particles spawned upon eating seed');
  assert(soundEngine.spy.events.some(e => e.type === 'eggPop'), 'eggPop SFX played upon eating seed');

  // 3.2 Coop Entry Fanfare & Scoring
  const isPortrait = engine.display.isPortrait;
  const vWidth = engine.display.vWidth;
  const coopDoor = isPortrait ? { x: vWidth / 2, y: 180, r: 50 } : { x: vWidth - 150, y: 160, r: 45 };

  scene.enter();
  assertEqual(scene.chicks.length, 5, 'Wave starts with 5 chicks');
  assertEqual(scene.score, 0, 'Score starts at 0');
  assertEqual(scene.coopSavedCount, 0, 'coopSavedCount starts at 0');

  // Place Chick 0 inside coop door radius
  scene.chicks[0].x = coopDoor.x;
  scene.chicks[0].y = coopDoor.y;

  soundEngine.spy.clear();
  scene.update(1 / 60, input);

  assertEqual(scene.coopSavedCount, 1, 'coopSavedCount incremented to 1 on coop entry');
  assertEqual(scene.score, 100, 'Score incremented by +100 on coop entry');
  assertEqual(scene.chicks.length, 4, 'Entered chick removed from active flock (4 remaining)');
  assert(soundEngine.spy.events.some(e => e.type === 'fanfare'), 'fanfare SFX played on coop entry');
  assertEqual(engine.storage.getHighScore('chickMaze'), 100, 'High score persisted on chick save');

  // 3.3 Full Wave Cycle & Automatic Wave Respawn
  // Rescue remaining chicks until wave respawns
  for (let c = 0; c < 4; c++) {
    scene.chicks[0].x = coopDoor.x;
    scene.chicks[0].y = coopDoor.y;
    scene.update(1 / 60, input);
  }

  // When all chicks rescued, automatic wave respawn triggers (fresh 5 chicks)
  assertEqual(scene.chicks.length, 5, 'Automatic wave respawn spawned 5 fresh chicks');
  assertEqual(scene.seeds.length, 0, 'Seeds cleanly reset on fresh wave');

  input.detach();
}

// =============================================================================
// 4. MODE 4: DADDY PIG - 4 PANIC STAGES, FEVER INCREMENT & MULTIPLIERS
// =============================================================================

section('4. Mode 4: Daddy Pig - 4 Panic Stages, Fever Multipliers & Timer Extension');
{
  const scene = new DaddyPigScene(engine);
  scene.enter();

  assertEqual(scene.fever, 0, 'Fever starts at 0');
  assertEqual(scene.timer, 20.0, 'Timer starts at 20.0s');
  assertEqual(scene.multiplier, 1, 'Multiplier starts at 1x');
  assertEqual(scene.score, 0, 'Score starts at 0');
  assertEqual(scene.isOverheating, false, 'isOverheating starts false');

  // 4.1 Tap Fever Increment (+4.5% per tap) and Multiplier Progression
  // Stage 0: 0 to 8 taps (fever: 0 to 36.0)
  for (let t = 1; t <= 8; t++) {
    scene.tap();
    assertCloseTo(scene.fever, t * 4.5, 0.01, `Fever after tap #${t} is ${(t * 4.5).toFixed(1)}%`);
  }
  assertEqual(scene.multiplier, 1, 'Multiplier is 1x for fever < 40% (fever = 36.0%)');

  // Stage 1: Tap #9 (fever = 40.5% >= 40%) -> 2x Multiplier
  scene.tap();
  assertCloseTo(scene.fever, 40.5, 0.01, 'Fever reached 40.5%');
  assertEqual(scene.multiplier, 2, 'Multiplier advanced to 2x at fever >= 40%');

  // Advance to Stage 2: fever >= 70% -> 5x Multiplier
  while (scene.fever < 70) {
    scene.tap();
  }
  assertEqual(scene.multiplier, 5, `Multiplier advanced to 5x at fever = ${scene.fever.toFixed(1)}%`);

  // Advance to Stage 3: fever >= 95% -> 10x Multiplier
  while (scene.fever < 95) {
    scene.tap();
  }
  assertEqual(scene.multiplier, 10, `Multiplier advanced to 10x at fever = ${scene.fever.toFixed(1)}%`);

  // 4.2 Timer Extension (+0.18s per tap, max 25.0s)
  const timerBefore = scene.timer;
  scene.tap();
  assertCloseTo(scene.timer, Math.min(25.0, timerBefore + 0.18), 0.01, 'Timer extended by +0.18s on tap');
}

// =============================================================================
// 5. MODE 4: DADDY PIG - DYNAMIC DECAY, MELTDOWN BSOD & RESET
// =============================================================================

section('5. Mode 4: Daddy Pig - Dynamic Fever Decay, 100% Meltdown BSOD & Replay');
{
  engine.storage.resetAll();
  const scene = new DaddyPigScene(engine);
  scene.enter();
  const input = new InputManager(engine.display);

  // 5.1 Dynamic Decay Formula: decayRate = 6.5 + 0.05 * sqrt(score)
  scene.fever = 50.0;
  scene.score = 0; // decayRate = 6.5 %/s

  const dt = 1.0; // 1 second
  scene.update(dt, input);
  assertCloseTo(scene.fever, 50.0 - 6.5, 0.1, 'Fever decayed by 6.5% with score = 0 over 1 second');

  // With score = 10,000 -> decayRate = 6.5 + 0.05 * 100 = 11.5 %/s
  scene.fever = 50.0;
  scene.score = 10000;
  scene.update(dt, input);
  assertCloseTo(scene.fever, 50.0 - 11.5, 0.1, 'Fever decayed by 11.5% with score = 10,000 over 1 second');

  // Decay clamp at 0
  scene.fever = 2.0;
  scene.update(1.0, input);
  assertEqual(scene.fever, 0, 'Fever decays to and clamps cleanly at 0%');

  // 5.2 Meltdown BSOD Cutscene Trigger at fever >= 100%
  scene.fever = 98.0;
  soundEngine.spy.clear();

  scene.tap(); // fever becomes 100%
  assertEqual(scene.fever, 100, 'Fever reached 100% cap');
  assertEqual(scene.isOverheating, true, 'isOverheating triggered at 100% fever');
  assert(soundEngine.spy.events.some(e => e.type === 'crash'), 'crash SFX triggered on meltdown');
  assertEqual(engine.storage.getHighScore('daddyPig'), scene.score, 'Meltdown high score saved to StorageManager');

  // 5.3 Locked State While Overheating (No further score or fever gains)
  const scoreAtCrash = scene.score;
  scene.tap(); // Should be ignored while overheating
  assertEqual(scene.score, scoreAtCrash, 'Further taps during overheat do NOT increment score');

  // 5.4 Replay Reset on Screen Tap
  // In update, input.isActionJustPressed() when isOverheating triggers scene.enter()
  const mockTapInput = {
    ...input,
    isActionJustPressed: () => true
  } as unknown as InputManager;

  scene.update(1 / 60, mockTapInput);
  assertEqual(scene.isOverheating, false, 'isOverheating reset to false on Play Again tap');
  assertEqual(scene.fever, 0, 'Fever cleanly reset to 0');
  assertEqual(scene.score, 0, 'Score reset to 0');
  assertEqual(scene.timer, 20.0, 'Timer reset to 20.0s');

  input.detach();
}

// =============================================================================
// 6. OFFLINE PWA & SERVICE WORKER VERIFICATION
// =============================================================================

section('6. Offline PWA & Service Worker Manifest & Zero External Dependencies');
{
  const swPath = resolve(process.cwd(), 'public/sw.js');
  const swContent = readFileSync(swPath, 'utf-8');

  // 6.1 Cache manifest & lifecycle in public/sw.js
  assert(swContent.includes('happy-mrs-chicken-v2'), 'Service worker specifies active CACHE_NAME');
  assert(swContent.includes("'./index.html'"), 'Cache manifest includes index.html');
  assert(swContent.includes("'./manifest.json'"), 'Cache manifest includes manifest.json');
  assert(swContent.includes("'./'"), 'Cache manifest includes root path');
  assert(swContent.includes("addEventListener('install'"), 'SW registers install event listener');
  assert(swContent.includes("addEventListener('activate'"), 'SW registers activate event listener');
  assert(swContent.includes("addEventListener('fetch'"), 'SW registers fetch event listener');
  assert(swContent.includes('caches.match'), 'SW implements cache-first matching');
  assert(swContent.includes("caches.match('./index.html')"), 'SW falls back to ./index.html when offline');

  // 6.2 manifest.json compliance
  const manifestPath = resolve(process.cwd(), 'public/manifest.json');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
  assertEqual(manifest.name, 'Peppa Pig: Happy Mrs Chicken', 'Manifest name is exact');
  assertEqual(manifest.display, 'standalone', 'Manifest display is standalone');
  assertEqual(manifest.start_url, './index.html', 'Manifest start_url is ./index.html');
  assert(manifest.icons.length > 0, 'Manifest defines icons');
  assert(manifest.icons.every((i: any) => i.src.startsWith('data:image/svg+xml')), 'All manifest icons are self-contained inline SVG data URIs');

  // 6.3 Zero External Dependencies Audit across all entrypoints
  const htmlPath = resolve(process.cwd(), 'index.html');
  const htmlContent = readFileSync(htmlPath, 'utf-8');
  const cdnRegex = /(https?:)?\/\/(cdn\.|unpkg\.com|cdnjs\.cloudflare\.com|fonts\.googleapis\.com|cdn\.jsdelivr\.net)/i;

  assert(!cdnRegex.test(htmlContent), 'index.html contains zero external CDN scripts or stylesheet links');
  assert(!cdnRegex.test(swContent), 'public/sw.js contains zero external CDN references');

  // 6.4 Cold Boot Simulation with Offline Navigator
  mockWindow.navigator.onLine = false;
  const offlineEngine = new GameEngine(canvas);
  assertEqual(offlineEngine.currentSceneId, 'MENU', 'Engine cold boots into MENU scene in offline mode');
  offlineEngine.destroy();
  mockWindow.navigator.onLine = true;
}

// =============================================================================
// 7. CANVAS 2D RENDER STACK INTEGRITY & ORIENTATION STRESS
// =============================================================================

section('7. Canvas 2D Render Save/Restore Balance & Orientation Stress');
{
  const chickScene = new ChickMazeScene(engine);
  chickScene.enter();
  const daddyScene = new DaddyPigScene(engine);
  daddyScene.enter();

  // 7.1 ChickMazeScene Save/Restore Stack Balance across different seed and chick counts
  for (let seeds = 0; seeds <= 6; seeds++) {
    chickScene.seeds = Array.from({ length: seeds }, (_, i) => ({ x: 100 + i * 30, y: 200, remaining: 1 }));
    spy.reset();
    chickScene.render(mockCtx, 1.0, engine.display);
    assertEqual(
      spy.saveCount,
      spy.restoreCount,
      `ChickMaze render save/restore balanced with ${seeds} seeds (${spy.saveCount} saves == ${spy.restoreCount} restores)`
    );
  }

  // 7.2 DaddyPigScene Save/Restore Stack Balance across normal and crash states
  daddyScene.isOverheating = false;
  for (let fever = 0; fever <= 95; fever += 20) {
    daddyScene.fever = fever;
    spy.reset();
    daddyScene.render(mockCtx, 1.0, engine.display);
    assertEqual(
      spy.saveCount,
      spy.restoreCount,
      `DaddyPig render save/restore balanced at ${fever}% fever (${spy.saveCount} saves == ${spy.restoreCount} restores)`
    );
  }

  // Meltdown BSOD Render Balance
  daddyScene.isOverheating = true;
  spy.reset();
  daddyScene.render(mockCtx, 1.0, engine.display);
  assertEqual(spy.saveCount, spy.restoreCount, 'DaddyPig BSOD render save/restore balanced');

  // 7.3 Rapid Viewport Orientation Cycling (50 flips between Landscape & Portrait)
  const input = new InputManager(engine.display);
  for (let flip = 0; flip < 50; flip++) {
    const isPortrait = flip % 2 === 0;
    mockWindow.innerWidth = isPortrait ? 414 : 1280;
    mockWindow.innerHeight = isPortrait ? 896 : 720;
    engine.display.syncResize();

    chickScene.update(1 / 60, input);
    daddyScene.update(1 / 60, input);

    spy.reset();
    chickScene.render(mockCtx, 1.0, engine.display);
    assert(spy.saveCount === spy.restoreCount, `ChickMaze orientation flip #${flip} render balanced`);

    spy.reset();
    daddyScene.render(mockCtx, 1.0, engine.display);
    assert(spy.saveCount === spy.restoreCount, `DaddyPig orientation flip #${flip} render balanced`);
  }
  input.detach();
}

// =============================================================================
// Summary & Exit Code
// =============================================================================

console.log(`\n============================================================`);
console.log(`Milestone M4 Challenger 2 Empirical Stress Test Summary`);
console.log(`============================================================`);
console.log(`Total Assertions : ${totalAssertions}`);
console.log(`Passed Assertions: ${passedAssertions}`);
console.log(`Failed Assertions: ${failedAssertions}`);

if (failedAssertions > 0) {
  console.error(`\nFailures encountered:`);
  for (const f of failures) console.error(f);
  process.exit(1);
} else {
  console.log(`\nAll empirical stress assertions PASSED cleanly.`);
  process.exit(0);
}
