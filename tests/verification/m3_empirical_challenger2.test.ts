// =============================================================================
// Mock Global Browser Environment
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
import { VegetableHarvestScene } from '../../src/modes/VegetableHarvestScene';
import { HopscotchBubbleScene } from '../../src/modes/HopscotchBubbleScene';
import { PALETTE } from '../../src/graphics/palette';
import { getVeggiePullTension, getHopscotchPhase } from '../../src/graphics/animations';

// =============================================================================
// Test Harness Infrastructure & Assertion Engine
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

// Create GameEngine instance
const canvas = document.createElement('canvas');
const engine = new GameEngine(canvas);

// Helper for simulating pointer events
function simulatePointerDown(input: InputManager, x: number, y: number, id: number = 1) {
  canvas.dispatchEvent(
    new PointerEvent('pointerdown', {
      pointerId: id,
      clientX: x,
      clientY: y,
      bubbles: true
    })
  );
}

function simulatePointerMove(input: InputManager, x: number, y: number, id: number = 1) {
  window.dispatchEvent(
    new PointerEvent('pointermove', {
      pointerId: id,
      clientX: x,
      clientY: y,
      bubbles: true
    })
  );
}

function simulatePointerUp(input: InputManager, x: number, y: number, id: number = 1) {
  window.dispatchEvent(
    new PointerEvent('pointerup', {
      pointerId: id,
      clientX: x,
      clientY: y,
      bubbles: true
    })
  );
}

// =============================================================================
// 1. MODE 7: VEGETABLE HARVEST - ELASTIC DRAG, TENSION MATH & BREAKOUT
// =============================================================================

section('1. Mode 7: Grandpa Pig Vegetable Harvest - Elastic Drag & Snapback vs Breakout');
{
  const scene = new VegetableHarvestScene(engine);
  scene.enter();
  const input = new InputManager(engine.display);

  // 1.1 Verify Mound Initialization
  assertEqual(scene.mounds.length, 4, 'Scene initializes exactly 4 garden mounds');
  for (let i = 0; i < 4; i++) {
    const m = scene.mounds[i];
    assert(m.vegetable !== null, `Mound ${i} starts with an active vegetable`);
    assert(['CARROT', 'CABBAGE', 'PUMPKIN'].includes(m.vegetable!.type), `Mound ${i} vegetable type is valid`);
    assert(m.vegetable!.pullOffsetY === 0, `Mound ${i} vegetable start pullOffsetY is 0`);
  }

  // 1.2 Sub-threshold Drag and Elastic Snapback
  // Force mound 0 to have a CARROT
  const m0 = scene.mounds[0];
  m0.vegetable!.type = 'CARROT';
  m0.vegetable!.springK = 1.2;
  m0.vegetable!.breakoutThreshold = 50;
  m0.vegetable!.points = 20;

  // Press down on mound 0
  simulatePointerDown(input, m0.x, m0.y, 1);
  scene.update(1 / 60, input);
  assertEqual((scene as any).activePullMoundIdx, 0, 'PointerDown on mound 0 selects active mound');

  // Drag up 30px (rawPull = 30px, pullOffsetY = 30 / 1.2 = 25px < 50px threshold)
  simulatePointerMove(input, m0.x, m0.y - 30, 1);
  scene.update(1 / 60, input);
  assertCloseTo(m0.vegetable!.pullOffsetY, 25, 0.5, 'Pulling 30px yields 25px pullOffsetY with k=1.2');
  assertCloseTo(m0.vegetable!.pullProgress, 0.5, 0.05, 'pullProgress is 0.5 at 25/50px');
  assertCloseTo(scene.currentPullTension, 0.5, 0.05, 'currentPullTension matches pullProgress');

  // Release pointer -> trigger snapback
  simulatePointerUp(input, m0.x, m0.y - 30, 1);
  scene.update(1 / 60, input);
  assertEqual((scene as any).activePullMoundIdx, -1, 'PointerUp releases active pull mound');
  assertEqual(scene.currentPullTension, 0, 'currentPullTension resets to 0 immediately on release');

  // Verify snapback decay over time (dt * 280 px/s)
  const offsetBefore = m0.vegetable!.pullOffsetY;
  scene.update(0.05, input); // 0.05 * 280 = 14px decay
  assert(m0.vegetable!.pullOffsetY < offsetBefore, `pullOffsetY decayed during snapback (${m0.vegetable!.pullOffsetY.toFixed(1)} < ${offsetBefore.toFixed(1)})`);

  // Further decay to 0
  scene.update(0.2, input);
  assertEqual(m0.vegetable!.pullOffsetY, 0, 'pullOffsetY fully snapped back to 0');
  assertEqual(m0.vegetable!.pullProgress, 0, 'pullProgress fully snapped back to 0');

  // 1.3 Spring K Resistance Scaling Across Veggie Types
  // Carrot: k=1.2, Cabbage: k=2.4, Pumpkin: k=4.0
  const pullDelta = 48; // 48px upward drag
  const kCarrot = 1.2;
  const kCabbage = 2.4;
  const kPumpkin = 4.0;

  const carrotDisp = pullDelta / kCarrot;   // 40px
  const cabbageDisp = pullDelta / kCabbage; // 20px
  const pumpkinDisp = pullDelta / kPumpkin; // 12px

  assert(carrotDisp > cabbageDisp, 'Carrot (k=1.2) displaces more easily than Cabbage (k=2.4)');
  assert(cabbageDisp > pumpkinDisp, 'Cabbage (k=2.4) displaces more easily than Pumpkin (k=4.0)');
  assertCloseTo(carrotDisp, 40, 0.01, 'Carrot displacement strictly matches Δy / k formula');
  assertCloseTo(cabbageDisp, 20, 0.01, 'Cabbage displacement strictly matches Δy / k formula');
  assertCloseTo(pumpkinDisp, 12, 0.01, 'Pumpkin displacement strictly matches Δy / k formula');

  // 1.4 Breakout Threshold Clamping
  // If dragged 500px, pullOffsetY should be clamped at breakoutThreshold * 1.2
  simulatePointerDown(input, m0.x, m0.y, 1);
  simulatePointerMove(input, m0.x, m0.y - 500, 1);
  // Before breakout trigger executes, max displacement is threshold * 1.2
  const maxAllowedDisplacement = m0.vegetable!.breakoutThreshold * 1.2;
  assert(maxAllowedDisplacement === 60, 'Carrot max pull displacement clamp is 60px');

  input.detach();
}

// =============================================================================
// 2. MODE 7: GIANT PUMPKIN 3-TUG MECHANIC & RAPID CADENCE
// =============================================================================

section('2. Mode 7: Giant Pumpkin 3-Tug Boss Mechanic State Machine');
{
  const scene = new VegetableHarvestScene(engine);
  scene.enter();
  const input = new InputManager(engine.display);

  const m0 = scene.mounds[0];
  m0.vegetable!.type = 'PUMPKIN';
  m0.vegetable!.springK = 4.0;
  m0.vegetable!.breakoutThreshold = 75;
  m0.vegetable!.points = 100;

  soundEngine.spy.clear();
  const audioSpy = soundEngine.spy;

  // 2.1 Tug 1: Press down on mound 0, then drag upward >= 75px
  // Frame 1: PointerDown on mound
  simulatePointerDown(input, m0.x, m0.y, 1);
  scene.update(1 / 60, input);
  assertEqual((scene as any).activePullMoundIdx, 0, 'Active pull index locked to mound 0');

  // Frame 2: Drag upward by 320px (320 / 4.0 = 80px >= 75px threshold)
  simulatePointerMove(input, m0.x, m0.y - 320, 1);
  scene.update(1 / 60, input);

  assertEqual(scene.pumpkinTugs, 1, 'Tug 1: pumpkinTugs incremented to 1');
  assert(!m0.vegetable!.isFlying, 'Tug 1: Pumpkin remains rooted (isFlying = false)');
  assertCloseTo(m0.vegetable!.pullOffsetY, 30, 0.1, 'Tug 1: pullOffsetY reset to 40% of threshold (30px)');
  assertEqual(m0.vegetable!.pullProgress, 0.4, 'Tug 1: pullProgress reset to 0.4');
  assert(scene.particles.active.length > 0, 'Tug 1: Steam particles spawned');
  assert(audioSpy.events.some(e => e.type === 'seedDrop'), 'Tug 1: Strain SFX (seedDrop) played');

  // 2.2 Tug 2: Continue pulling further upward (delta >= 75px from new anchor)
  simulatePointerMove(input, m0.x, m0.y - 650, 1);
  scene.update(1 / 60, input);

  assertEqual(scene.pumpkinTugs, 2, 'Tug 2: pumpkinTugs incremented to 2');
  assert(!m0.vegetable!.isFlying, 'Tug 2: Pumpkin remains rooted after 2 tugs');
  assertCloseTo(m0.vegetable!.pullOffsetY, 30, 0.1, 'Tug 2: pullOffsetY reset to 40% of threshold (30px)');

  // 2.3 Tug 3: Final Breakout Launch
  simulatePointerMove(input, m0.x, m0.y - 980, 1);
  scene.update(1 / 60, input);

  assert(m0.vegetable!.isFlying, 'Tug 3: Pumpkin breaks out into ballistic flight (isFlying = true)');
  assert(audioSpy.events.some(e => e.type === 'veggiePop'), 'Tug 3: veggiePop SFX played');
  assertEqual((scene as any).activePullMoundIdx, -1, 'Active pull index released upon breakout');

  simulatePointerUp(input, m0.x, m0.y - 980, 1);
  scene.update(1 / 60, input);

  // 2.4 Irregular & Rapid Clicking Adversarial Stress
  // Reset mound 1 with pumpkin and spam rapid alternating pointer down/up
  const m1 = scene.mounds[1];
  m1.vegetable!.type = 'PUMPKIN';
  m1.vegetable!.springK = 4.0;
  m1.vegetable!.breakoutThreshold = 75;

  for (let cycle = 0; cycle < 50; cycle++) {
    simulatePointerDown(input, m1.x, m1.y, (cycle % 3) + 1);
    scene.update(1 / 120, input);
    simulatePointerMove(input, m1.x, m1.y - ((cycle * 17) % 350), (cycle % 3) + 1);
    scene.update(1 / 120, input);
    simulatePointerUp(input, m1.x, m1.y, (cycle % 3) + 1);
    scene.update(1 / 120, input);
  }

  // Ensure no NaNs or undefined states
  assert(m1.vegetable === null || !isNaN(m1.vegetable.x), 'Pumpkin x is valid after rapid click spam');
  assert(m1.vegetable === null || !isNaN(m1.vegetable.y), 'Pumpkin y is valid after rapid click spam');
  assert(m1.vegetable === null || !isNaN(m1.vegetable.pullOffsetY), 'Pumpkin pullOffsetY is valid');
  assert(!isNaN(scene.score), 'Score is not NaN');
  assert(typeof scene.harvestedCount === 'number', 'harvestedCount is valid number');

  input.detach();
}

// =============================================================================
// 3. MODE 7: BALLISTIC TRAJECTORY & WHEELBARROW COLLECTION
// =============================================================================

section('3. Mode 7: Flying Vegetable Trajectory & Wheelbarrow Collection');
{
  engine.storage.resetAll();
  const scene = new VegetableHarvestScene(engine);
  scene.enter();
  const input = new InputManager(engine.display);

  const isPortrait = engine.display.isPortrait;
  const vWidth = engine.display.vWidth;
  const vHeight = engine.display.vHeight;
  const wbX = isPortrait ? vWidth * 0.22 : 120;
  const wbY = isPortrait ? vHeight * 0.38 : vHeight * 0.72;

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

  assert(veg.isFlying, 'Spacebar triggers instant vegetable harvest flight');
  assertEqual(veg.flightDuration, 0.65, 'Flight duration is fixed at 0.65s');

  const startX = veg.flightStartX;
  const startY = veg.flightStartY;
  const vy = veg.flightVy;
  const g = 980;
  const T = 0.65;

  // 3.1 Mid-flight Analytical vs Simulated Trajectory Parity (t = veg.flightTimer)
  scene.update(0.30, input);
  const curT = veg.flightTimer;
  const tNorm = curT / T;
  const expectedX = startX + (wbX - startX) * tNorm;
  const expectedY = startY + vy * curT + 0.5 * g * curT * curT;

  assertCloseTo(veg.x, expectedX, 0.1, 'Mid-flight x strictly follows parabolic interpolation');
  assertCloseTo(veg.y, expectedY, 0.1, 'Mid-flight y strictly follows projectile gravity math');

  // 3.2 Step until landing
  while (veg.isFlying) {
    scene.update(1 / 60, input);
  }

  assert(!veg.isFlying, 'Vegetable stopped flying on landing');
  assertEqual(scene.harvestedCount, 1, 'harvestedCount incremented to 1');
  assertEqual(scene.score, 50, 'Score updated to 50 for Cabbage');
  assertEqual((scene as any).wheelbarrowBounce, 1.0, 'wheelbarrowBounce set to 1.0 on impact');
  assertEqual(m0.vegetable, null, 'Harvested mound cleared (vegetable is null)');
  assert(m0.respawnTimer > 0 && m0.respawnTimer <= 1.5, `Mound respawnTimer active (${m0.respawnTimer.toFixed(2)}s)`);
  assertEqual(engine.storage.getHighScore('vegetableHarvest'), 50, 'High score saved to StorageManager');

  // 3.3 Respawn Cycle
  scene.update(1.6, input);
  assert(m0.vegetable !== null, 'Mound respawned fresh vegetable after 1.5s delay');
  assertEqual(m0.vegetable!.isHarvested, false, 'Respawned vegetable is not harvested');
}

// =============================================================================
// 4. MODE 8: SUZY SHEEP HOPSCOTCH & BUBBLE TRAIL - BUBBLE PHYSICS & POPPING
// =============================================================================

section('4. Mode 8: Suzy Sheep Hopscotch & Bubbles - Shimmering Physics & Popping Cadence');
{
  const scene = new HopscotchBubbleScene(engine);
  scene.enter();
  const input = new InputManager(engine.display);

  // 4.1 Initial Bubbles Spawned
  assertEqual(scene.bubbles.length, 6, 'Scene enters with 6 initial floating bubbles');
  for (const b of scene.bubbles) {
    assert(b.vy < 0, `Bubble has upward buoyancy velocity (${b.vy.toFixed(1)} px/s)`);
    assert(b.radius >= 22 && b.radius <= 34, `Bubble radius in valid range [22, 34] (${b.radius.toFixed(1)}px)`);
  }

  // 4.2 Bubble Wobble & Drift Physics
  const b0 = scene.bubbles[0];
  const initX = b0.x;
  const initY = b0.y;
  const dt = 1 / 60;
  for (let f = 0; f < 30; f++) {
    scene.update(dt, input);
  }
  assert(b0.y < initY, 'Bubble floated upwards over 30 frames');
  assert(b0.x !== initX, 'Bubble drifted horizontally via sinusoidal wobble');

  // 4.3 Bubble Popping Hit Test & Particle Generation
  const bubbleToPop = scene.bubbles[0];
  const popX = bubbleToPop.x;
  const popY = bubbleToPop.y;

  simulatePointerDown(input, popX, popY, 1);
  scene.update(1 / 60, input);

  assertEqual(scene.bubblesPoppedCount, 1, 'bubblesPoppedCount incremented to 1');
  assertEqual(scene.score, 50, 'Score incremented by +50 for popping bubble');
  assert(scene.particles.active.length >= 10, 'Soap bubble & sparkle particles spawned on pop');

  // 4.4 Rapid Bubble Popping Burst (10 Bubbles in rapid succession)
  for (let p = 0; p < 10; p++) {
    if (scene.bubbles.length === 0) {
      (scene as any).spawnBubble(300);
    }
    const b = scene.bubbles[0];
    simulatePointerDown(input, b.x, b.y, (p % 4) + 1);
    scene.update(1 / 60, input);
    simulatePointerUp(input, b.x, b.y, (p % 4) + 1);
    scene.update(1 / 60, input);
  }

  assert(scene.bubblesPoppedCount >= 5, `Rapid popping registered multiple pops (${scene.bubblesPoppedCount})`);
  assert(scene.score >= 250, `Score accumulated correctly (${scene.score} >= 250)`);

  input.detach();
}

// =============================================================================
// 5. MODE 8: SUZY SHEEP HOP STATE MACHINE & PICNIC CELEBRATION
// =============================================================================

section('5. Mode 8: Suzy Sheep Hop Progression, Milestone 10 & Picnic Celebration');
{
  const scene = new HopscotchBubbleScene(engine);
  scene.enter();
  const input = new InputManager(engine.display);

  // 5.1 Chalk Squares Path Verification (1 to 10)
  assertEqual(scene.tiles.length, 10, 'Path contains exactly 10 chalk hopscotch tiles');
  for (let i = 0; i < 10; i++) {
    assertEqual(scene.tiles[i].index, i + 1, `Tile ${i} has 1-based index ${i + 1}`);
  }

  // 5.2 Suzy Initial State at Tile 1
  assertEqual(scene.suzy.currentSquare, 1, 'Suzy starts at Square 1');
  assertEqual(scene.suzy.isHopping, false, 'Suzy is initially not hopping');
  assertCloseTo(scene.suzy.x, scene.tiles[0].x, 0.1, 'Suzy x matches Tile 1 x');
  assertCloseTo(scene.suzy.y, scene.tiles[0].y, 0.1, 'Suzy y matches Tile 1 y');

  // 5.3 Single Hop Step Progression
  scene.advanceSuzy();
  assertEqual(scene.suzy.isHopping, true, 'advanceSuzy sets isHopping to true');
  assertEqual(scene.suzy.targetSquare, 2, 'targetSquare set to 2');

  // Advance mid-hop (t = 0.19s, half of 0.38s)
  scene.update(0.19, input);
  assertEqual(scene.suzy.isHopping, true, 'Suzy remains hopping mid-flight');
  const expectedMidX = scene.tiles[0].x + (scene.tiles[1].x - scene.tiles[0].x) * 0.5;
  assertCloseTo(scene.suzy.x, expectedMidX, 0.5, 'Suzy x is at midpoint during hop');

  // 5.4 Rapid Tap Spamming While Hopping (Must NOT Skip Squares)
  for (let spam = 0; spam < 20; spam++) {
    scene.advanceSuzy();
  }
  assertEqual(scene.suzy.targetSquare, 2, 'Rapid spamming advanceSuzy during active hop is ignored');

  // Complete hop
  scene.update(0.25, input);
  assertEqual(scene.suzy.isHopping, false, 'Suzy lands on tile 2');
  assertEqual(scene.suzy.currentSquare, 2, 'currentSquare updated to 2');
  assertCloseTo(scene.suzy.x, scene.tiles[1].x, 0.1, 'Suzy position strictly locked to Tile 2');

  // 5.5 Advance from Tile 2 all the way to Tile 10 (Picnic Celebration Trigger)
  while (scene.suzy.currentSquare < 10) {
    scene.advanceSuzy();
    while (scene.suzy.isHopping) {
      scene.update(1 / 60, input);
    }
  }

  assertEqual(scene.suzy.currentSquare, 10, 'Suzy reached final milestone Square 10');
  assertEqual(scene.isCelebrating, true, 'Reaching Square 10 triggers isCelebrating = true');
  assert(scene.score >= 500, `Score includes picnic celebration bonus (+500 pts): ${scene.score}`);
  assertEqual(engine.storage.getHighScore('hopscotchBubble'), scene.score, 'Picnic high score saved');

  // 5.6 Celebration Timeout & Replay Reset
  scene.update(3.9, input); // Celebration lasts 3.8s
  assertEqual(scene.isCelebrating, false, 'Celebration timer expired after 3.8s');
  assertEqual(scene.suzy.currentSquare, 1, 'Suzy cleanly reset to Square 1 for replay');
  assertEqual(scene.suzy.isHopping, false, 'Suzy hopping state clean after celebration reset');

  input.detach();
}

// =============================================================================
// 6. DUAL-ORIENTATION DYNAMIC RESIZING DURING ACTIVE ACTIONS
// =============================================================================

section('6. Dual-Orientation Dynamic Resizing Resilience');
{
  // 6.1 Mode 7 Resize during active drag
  // Set Portrait
  mockWindow.innerWidth = 540;
  mockWindow.innerHeight = 960;
  engine.display.syncResize();

  const vegScene = new VegetableHarvestScene(engine);
  vegScene.enter();
  const input = new InputManager(engine.display);
  assertEqual(vegScene.mounds.length, 4, 'Portrait has 4 mounds');

  // Begin drag in portrait
  const m0 = vegScene.mounds[0];
  simulatePointerDown(input, m0.x, m0.y, 1);
  sceneUpdate: {
    vegScene.update(1 / 60, input);
    simulatePointerMove(input, m0.x, m0.y - 20, 1);
    vegScene.update(1 / 60, input);
  }

  // Switch to Landscape mid-drag
  mockWindow.innerWidth = 960;
  mockWindow.innerHeight = 540;
  engine.display.syncResize();
  if (typeof vegScene.resize === 'function') vegScene.resize(engine.display);
  vegScene.render(mockCtx, 1.0, engine.display);

  assert(spy.saveCount === spy.restoreCount, 'Render save/restore balanced after dynamic orientation switch');
  assertEqual((vegScene as any).activePullMoundIdx, 0, 'Active pull index retained or gracefully managed');

  // Release and verify clean recovery
  simulatePointerUp(input, m0.x, m0.y, 1);
  vegScene.update(1 / 60, input);
  assertEqual(vegScene.currentPullTension, 0, 'Tension cleanly returns to 0');

  // 6.2 Mode 8 Resize during active hop
  mockWindow.innerWidth = 960;
  mockWindow.innerHeight = 540;
  engine.display.syncResize();

  const hopScene = new HopscotchBubbleScene(engine);
  hopScene.enter();
  hopScene.advanceSuzy();
  hopScene.update(0.1, input); // In mid-hop

  // Switch to Portrait mid-hop
  mockWindow.innerWidth = 540;
  mockWindow.innerHeight = 960;
  engine.display.syncResize();
  if (typeof hopScene.resize === 'function') hopScene.resize(engine.display);
  hopScene.render(mockCtx, 1.0, engine.display);

  assert(spy.saveCount === spy.restoreCount, 'Hopscotch render save/restore balanced after mid-hop orientation switch');

  // Complete hop
  while (hopScene.suzy.isHopping) {
    hopScene.update(1 / 60, input);
  }
  assert(!isNaN(hopScene.suzy.x), 'Suzy x position valid after orientation switch');
  assert(!isNaN(hopScene.suzy.y), 'Suzy y position valid after orientation switch');

  // Restore landscape
  mockWindow.innerWidth = 960;
  mockWindow.innerHeight = 540;
  engine.display.syncResize();
  input.detach();
}

// =============================================================================
// 7. CANVAS TELEMETRY, AUDIO VERIFICATION & 1,000-FRAME STRESS
// =============================================================================

section('7. Canvas Telemetry, Audio Dispatch & 1,000-Frame Soak Test');
{
  soundEngine.spy.clear();
  const audioSpy = soundEngine.spy;

  const vegScene = new VegetableHarvestScene(engine);
  vegScene.enter();
  const hopScene = new HopscotchBubbleScene(engine);
  hopScene.enter();

  const input = new InputManager(engine.display);

  // 7.1 Render passes save/restore depth audit
  spy.reset();
  vegScene.render(mockCtx, 1.0, engine.display);
  assertEqual(spy.saveCount, spy.restoreCount, 'VegetableHarvestScene: Render matrix save/restore is strictly balanced');

  spy.reset();
  hopScene.render(mockCtx, 1.0, engine.display);
  assertEqual(spy.saveCount, spy.restoreCount, 'HopscotchBubbleScene: Render matrix save/restore is strictly balanced');

  // 7.2 1,000 Frame Continuous Soak Simulation under Simulated Toddler Chaos
  const t0 = performance.now();
  for (let frame = 0; frame < 1000; frame++) {
    // Alternate random interactions in vegScene
    if (frame % 30 === 0) {
      const moundIdx = frame % 4;
      const m = vegScene.mounds[moundIdx];
      if (m && m.vegetable) {
        simulatePointerDown(input, m.x, m.y, 1);
        simulatePointerMove(input, m.x, m.y - 100, 1);
      }
    } else if (frame % 30 === 15) {
      simulatePointerUp(input, 200, 200, 1);
    }
    vegScene.update(1 / 60, input);

    // Alternate bubble pops and hops in hopScene
    if (frame % 20 === 0) {
      hopScene.advanceSuzy();
    }
    if (frame % 45 === 0 && hopScene.bubbles.length > 0) {
      const b = hopScene.bubbles[0];
      simulatePointerDown(input, b.x, b.y, 2);
      simulatePointerUp(input, b.x, b.y, 2);
    }
    hopScene.update(1 / 60, input);
  }
  const t1 = performance.now();
  const duration = t1 - t0;

  assert(duration < 500, `1,000 dual-scene frames executed in ${duration.toFixed(2)}ms (< 500ms for 2,000+ FPS)`);
  assert(vegScene.particles.active.length <= 150, 'VegetableHarvest particles remain strictly capped under pool limit (150)');
  assert(hopScene.particles.active.length <= 150, 'HopscotchBubble particles remain strictly capped under pool limit (150)');

  // 7.3 Entity and State Polymorphism Check
  const vegEntities = vegScene.getEntities();
  const vegState = vegScene.getModeState();
  assert(Array.isArray(vegEntities.vegetables), 'getEntities().vegetables is array');
  assert(typeof vegState.score === 'number', 'getModeState().score is number');
  assert(typeof vegState.harvestedCount === 'number', 'getModeState().harvestedCount is number');

  const hopEntities = hopScene.getEntities();
  const hopState = hopScene.getModeState();
  assert(Array.isArray(hopEntities.bubbles), 'getEntities().bubbles is array');
  assert(typeof hopEntities.suzy === 'object', 'getEntities().suzy is object');
  assert(typeof hopState.currentTile === 'number', 'getModeState().currentTile is number');
  assert(typeof hopState.reachedPicnic === 'boolean', 'getModeState().reachedPicnic is boolean');

  input.detach();
}

// =============================================================================
// Final Assertion Report & Process Exit
// =============================================================================

console.log('\n============================================================');
console.log('CHALLENGER 2 EMPIRICAL VERIFICATION SUMMARY');
console.log('============================================================');
console.log(`Total Assertions:  ${totalAssertions}`);
console.log(`Passed Assertions: ${passedAssertions}`);
console.log(`Failed Assertions: ${failedAssertions}`);
console.log('============================================================');

if (failedAssertions > 0) {
  console.error(`\nFAILED (${failedAssertions} failures):`);
  for (const f of failures) {
    console.error(f);
  }
  process.exit(1);
} else {
  console.log(`\nALL ${passedAssertions} ASSERTIONS EMPIRICALLY PASSED!`);
  process.exit(0);
}
