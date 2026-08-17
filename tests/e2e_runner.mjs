#!/usr/bin/env node
/**
 * Headless Automated E2E Test Runner & Mock Environment
 * Peppa Pig: Happy Mrs Chicken 8-Game Deluxe Expansion Suite
 */

import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { readdirSync } from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = resolve(__dirname, '..');

// Auto-delegate to tsx if executing directly in node without TS loader
if (!process.env.__TSX_ACTIVE__) {
  try {
    const result = spawnSync('npx', ['tsx', __filename, ...process.argv.slice(2)], {
      cwd: PROJECT_ROOT,
      stdio: 'inherit',
      env: { ...process.env, __TSX_ACTIVE__: '1' }
    });
    process.exit(result.status ?? 0);
  } catch (err) {
    console.error('Failed to spawn tsx runner:', err);
    process.exit(1);
  }
}

// ---------------------------------------------------------
// 1. Mock Global Browser Environment
// ---------------------------------------------------------

export class MockLocalStorage {
  constructor() {
    this.store = new Map();
  }
  getItem(key) {
    return this.store.has(String(key)) ? this.store.get(String(key)) : null;
  }
  setItem(key, value) {
    this.store.set(String(key), String(value));
  }
  removeItem(key) {
    this.store.delete(String(key));
  }
  clear() {
    this.store.clear();
  }
  key(index) {
    return Array.from(this.store.keys())[index] || null;
  }
  get length() {
    return this.store.size;
  }
}

export class MockAudioParam {
  constructor(defaultValue = 1) {
    this.value = defaultValue;
    this.targetValue = defaultValue;
  }
  setValueAtTime(val) {
    this.value = val;
    this.targetValue = val;
    return this;
  }
  exponentialRampToValueAtTime(val) {
    this.targetValue = val;
    return this;
  }
  linearRampToValueAtTime(val) {
    this.targetValue = val;
    return this;
  }
  setTargetAtTime(val) {
    this.targetValue = val;
    return this;
  }
  cancelScheduledValues() {
    return this;
  }
}

export class MockAudioNode {
  constructor() {
    this.connectedTo = [];
  }
  connect(dest) {
    this.connectedTo.push(dest);
    return dest;
  }
  disconnect() {
    this.connectedTo = [];
  }
}

export class MockGainNode extends MockAudioNode {
  constructor() {
    super();
    this.gain = new MockAudioParam(1);
  }
}

export class MockOscillatorNode extends MockAudioNode {
  constructor() {
    super();
    this.type = 'sine';
    this.frequency = new MockAudioParam(440);
    this.onended = null;
  }
  start() {}
  stop() {
    if (typeof this.onended === 'function') {
      setTimeout(() => this.onended?.(), 0);
    }
  }
}

export class MockAudioBufferSourceNode extends MockAudioNode {
  constructor() {
    super();
    this.buffer = null;
    this.playbackRate = new MockAudioParam(1);
    this.onended = null;
  }
  start() {}
  stop() {
    if (typeof this.onended === 'function') {
      setTimeout(() => this.onended?.(), 0);
    }
  }
}

export class MockBiquadFilterNode extends MockAudioNode {
  constructor() {
    super();
    this.type = 'lowpass';
    this.frequency = new MockAudioParam(350);
    this.Q = new MockAudioParam(1);
    this.gain = new MockAudioParam(0);
  }
}

export class MockAudioBuffer {
  constructor(channels, length, sampleRate) {
    this.numberOfChannels = channels;
    this.length = length;
    this.sampleRate = sampleRate;
    this.duration = length / sampleRate;
    this._data = new Float32Array(length);
  }
  getChannelData() {
    return this._data;
  }
}

class MockDynamicsCompressorNode extends MockAudioNode {
  constructor() {
    super();
    this.threshold = new MockAudioParam(-24);
    this.knee = new MockAudioParam(30);
    this.ratio = new MockAudioParam(12);
    this.attack = new MockAudioParam(0.003);
    this.release = new MockAudioParam(0.25);
  }
}

export class MockAudioContext {
  constructor() {
    this.state = 'running';
    this.sampleRate = 44100;
    this.currentTime = 0;
    this.destination = new MockAudioNode();
  }
  createGain() {
    return new MockGainNode();
  }
  createOscillator() {
    return new MockOscillatorNode();
  }
  createBufferSource() {
    return new MockAudioBufferSourceNode();
  }
  createBiquadFilter() {
    return new MockBiquadFilterNode();
  }
  createDynamicsCompressor() {
    return new MockDynamicsCompressorNode();
  }
  createBuffer(channels, length, sampleRate) {
    return new MockAudioBuffer(channels, length, sampleRate);
  }
  async resume() {
    this.state = 'running';
  }
  async suspend() {
    this.state = 'suspended';
  }
  async close() {
    this.state = 'closed';
  }
}

export class MockCanvasRenderingContext2D {
  constructor(canvas) {
    this.canvas = canvas;
    this.fillStyle = '#000000';
    this.strokeStyle = '#000000';
    this.lineWidth = 1;
    this.lineCap = 'butt';
    this.lineJoin = 'miter';
    this.globalAlpha = 1.0;
    this.globalCompositeOperation = 'source-over';
    this.font = '10px sans-serif';
    this.textAlign = 'start';
    this.textBaseline = 'alphabetic';
    this.shadowColor = 'rgba(0,0,0,0)';
    this.shadowBlur = 0;
    this.shadowOffsetX = 0;
    this.shadowOffsetY = 0;

    this.saveCount = 0;
    this.restoreCount = 0;
    this.scaleCalls = [];
  }
  save() {
    this.saveCount++;
  }
  restore() {
    this.restoreCount++;
  }
  scale(x, y) {
    this.scaleCalls.push({ x, y });
  }
  rotate() {}
  translate() {}
  transform() {}
  setTransform() {}
  resetTransform() {}
  beginPath() {}
  closePath() {}
  moveTo() {}
  lineTo() {}
  quadraticCurveTo() {}
  bezierCurveTo() {}
  arc() {}
  ellipse() {}
  rect() {}
  roundRect() {}
  fillRect() {}
  strokeRect() {}
  clearRect() {}
  fill() {}
  stroke() {}
  clip() {}
  fillText() {}
  strokeText() {}
  measureText(text) {
    const len = String(text ?? '').length || 1;
    return {
      width: len * 10,
      actualBoundingBoxAscent: 10,
      actualBoundingBoxDescent: 2,
      actualBoundingBoxLeft: 0,
      actualBoundingBoxRight: len * 10
    };
  }
  drawImage() {}
  createLinearGradient() {
    return { addColorStop() {} };
  }
  createRadialGradient() {
    return { addColorStop() {} };
  }
  getImageData(sx, sy, sw, sh) {
    return { data: new Uint8ClampedArray(sw * sh * 4), width: sw, height: sh };
  }
  putImageData() {}
}

export class MockHTMLCanvasElement {
  constructor() {
    this.width = 960;
    this.height = 540;
    this.style = { width: '960px', height: '540px', display: 'block' };
    this._ctx = new MockCanvasRenderingContext2D(this);
    this._listeners = new Map();
  }
  getContext(type) {
    return type === '2d' ? this._ctx : null;
  }
  getBoundingClientRect() {
    return {
      left: 0,
      top: 0,
      width: this.width,
      height: this.height,
      x: 0,
      y: 0,
      right: this.width,
      bottom: this.height
    };
  }
  addEventListener(type, listener) {
    if (!this._listeners.has(type)) this._listeners.set(type, []);
    this._listeners.get(type).push(listener);
  }
  removeEventListener(type, listener) {
    if (!this._listeners.has(type)) return;
    this._listeners.set(type, this._listeners.get(type).filter(l => l !== listener));
  }
  dispatchEvent(event) {
    const list = this._listeners.get(event.type) || [];
    for (const fn of list) fn(event);
    return true;
  }
}

export class MockEvent {
  constructor(type, options = {}) {
    this.type = type;
    this.bubbles = !!options.bubbles;
    this.cancelable = !!options.cancelable;
    this.defaultPrevented = false;
  }
  preventDefault() {
    if (this.cancelable) this.defaultPrevented = true;
  }
  stopPropagation() {}
}

export class MockPointerEvent extends MockEvent {
  constructor(type, options = {}) {
    super(type, options);
    this.pointerId = options.pointerId ?? 1;
    this.clientX = options.clientX ?? 0;
    this.clientY = options.clientY ?? 0;
    this.pointerType = options.pointerType ?? 'touch';
    this.isPrimary = options.isPrimary ?? true;
  }
}

export class MockKeyboardEvent extends MockEvent {
  constructor(type, options = {}) {
    super(type, options);
    this.key = options.key ?? '';
    this.code = options.code ?? '';
  }
}

export class MockMouseEvent extends MockEvent {
  constructor(type, options = {}) {
    super(type, options);
    this.clientX = options.clientX ?? 0;
    this.clientY = options.clientY ?? 0;
    this.button = options.button ?? 0;
  }
}

export function setupMockEnvironment() {
  const windowListeners = new Map();
  const mockWindow = {
    innerWidth: 960,
    innerHeight: 540,
    devicePixelRatio: 1.0,
    localStorage: new MockLocalStorage(),
    AudioContext: MockAudioContext,
    webkitAudioContext: MockAudioContext,
    HTMLCanvasElement: MockHTMLCanvasElement,
    CanvasRenderingContext2D: MockCanvasRenderingContext2D,
    PointerEvent: MockPointerEvent,
    KeyboardEvent: MockKeyboardEvent,
    MouseEvent: MockMouseEvent,
    Event: MockEvent,
    performance: { now: () => Date.now() },
    navigator: {
      vibrate: () => true,
      userAgent: 'NodeTestRunner',
      onLine: true
    },
    addEventListener(type, listener) {
      if (!windowListeners.has(type)) windowListeners.set(type, []);
      windowListeners.get(type).push(listener);
    },
    removeEventListener(type, listener) {
      if (!windowListeners.has(type)) return;
      windowListeners.set(type, windowListeners.get(type).filter(l => l !== listener));
    },
    dispatchEvent(event) {
      const list = windowListeners.get(event.type) || [];
      for (const fn of list) fn(event);
      return true;
    },
    requestAnimationFrame(cb) {
      return setTimeout(() => cb(Date.now()), 16);
    },
    cancelAnimationFrame(id) {
      clearTimeout(id);
    },
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval
  };

  const mockDocument = {
    createElement(tag) {
      if (tag === 'canvas') return new MockHTMLCanvasElement();
      return {
        style: {},
        addEventListener() {},
        removeEventListener() {},
        setAttribute() {},
        getAttribute() { return null; }
      };
    },
    getElementById() {
      return new MockHTMLCanvasElement();
    },
    documentElement: {
      requestFullscreen: async () => {},
      webkitRequestFullscreen: () => {}
    },
    fullscreenElement: null,
    exitFullscreen: async () => {},
    addEventListener(type, listener) {
      mockWindow.addEventListener(type, listener);
    },
    removeEventListener(type, listener) {
      mockWindow.removeEventListener(type, listener);
    }
  };

  function defineGlobal(key, value) {
    try {
      Object.defineProperty(globalThis, key, {
        value,
        configurable: true,
        writable: true,
        enumerable: true
      });
    } catch (_) {
      try {
        globalThis[key] = value;
      } catch (_) {}
    }
  }

  defineGlobal('window', mockWindow);
  defineGlobal('document', mockDocument);
  defineGlobal('localStorage', mockWindow.localStorage);
  defineGlobal('AudioContext', MockAudioContext);
  defineGlobal('webkitAudioContext', MockAudioContext);
  defineGlobal('HTMLCanvasElement', MockHTMLCanvasElement);
  defineGlobal('CanvasRenderingContext2D', MockCanvasRenderingContext2D);
  defineGlobal('PointerEvent', MockPointerEvent);
  defineGlobal('KeyboardEvent', MockKeyboardEvent);
  defineGlobal('MouseEvent', MockMouseEvent);
  defineGlobal('Event', MockEvent);
  defineGlobal('navigator', mockWindow.navigator);
  defineGlobal('requestAnimationFrame', mockWindow.requestAnimationFrame);
  defineGlobal('cancelAnimationFrame', mockWindow.cancelAnimationFrame);
  defineGlobal('performance', mockWindow.performance);
}

setupMockEnvironment();

// ---------------------------------------------------------
// 2. Test Framework & Assertion Subsystem
// ---------------------------------------------------------

function safeFormat(val) {
  if (val === null) return 'null';
  if (val === undefined) return 'undefined';
  if (typeof val === 'function') return `[Function ${val.name || 'anonymous'}]`;
  if (typeof val === 'symbol') return val.toString();
  if (typeof val === 'number' || typeof val === 'boolean' || typeof val === 'string') {
    return JSON.stringify(val);
  }
  try {
    const seen = new WeakSet();
    return JSON.stringify(val, (k, v) => {
      if (typeof v === 'object' && v !== null) {
        if (seen.has(v)) return '[Circular]';
        seen.add(v);
      }
      return v;
    });
  } catch (_) {
    return String(val);
  }
}

export class Expectation {
  constructor(actual, isNot = false) {
    this.actual = actual;
    this.isNot = isNot;
  }
  get not() {
    return new Expectation(this.actual, !this.isNot);
  }

  _assert(condition, getMessage) {
    const pass = this.isNot ? !condition : condition;
    if (!pass) {
      const msg = typeof getMessage === 'function' ? getMessage() : getMessage;
      throw new Error(this.isNot ? `[NOT] ${msg}` : msg);
    }
  }

  toBe(expected) {
    this._assert(
      Object.is(this.actual, expected),
      () => `Expected ${safeFormat(this.actual)} to be ${safeFormat(expected)}`
    );
  }

  toEqual(expected) {
    const deepEqual = (a, b) => {
      if (Object.is(a, b)) return true;
      if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) return false;
      const keysA = Object.keys(a), keysB = Object.keys(b);
      if (keysA.length !== keysB.length) return false;
      return keysA.every(k => deepEqual(a[k], b[k]));
    };
    this._assert(
      deepEqual(this.actual, expected),
      () => `Expected ${safeFormat(this.actual)} to equal ${safeFormat(expected)}`
    );
  }

  toBeTruthy() {
    this._assert(Boolean(this.actual), () => `Expected ${safeFormat(this.actual)} to be truthy`);
  }
  toBeFalsy() {
    this._assert(!this.actual, () => `Expected ${safeFormat(this.actual)} to be falsy`);
  }
  toBeNull() {
    this._assert(this.actual === null, () => `Expected ${safeFormat(this.actual)} to be null`);
  }
  toBeUndefined() {
    this._assert(this.actual === undefined, () => `Expected ${safeFormat(this.actual)} to be undefined`);
  }
  toBeDefined() {
    this._assert(this.actual !== undefined, () => `Expected value to be defined`);
  }

  toBeGreaterThan(n) {
    this._assert(this.actual > n, () => `Expected ${this.actual} > ${n}`);
  }
  toBeGreaterThanOrEqual(n) {
    this._assert(this.actual >= n, () => `Expected ${this.actual} >= ${n}`);
  }
  toBeLessThan(n) {
    this._assert(this.actual < n, () => `Expected ${this.actual} < ${n}`);
  }
  toBeLessThanOrEqual(n) {
    this._assert(this.actual <= n, () => `Expected ${this.actual} <= ${n}`);
  }

  toBeCloseTo(n, precision = 2) {
    const delta = Math.abs(this.actual - n);
    const threshold = Math.pow(10, -precision) / 2;
    this._assert(delta <= threshold, () => `Expected ${this.actual} close to ${n} (delta: ${delta}, threshold: ${threshold})`);
  }

  toContain(item) {
    let has = false;
    if (typeof this.actual === 'string' || Array.isArray(this.actual)) {
      has = this.actual.includes(item);
    } else if (this.actual instanceof Set || this.actual instanceof Map) {
      has = this.actual.has(item);
    }
    this._assert(has, () => `Expected collection to contain ${safeFormat(item)}`);
  }

  toHaveLength(len) {
    this._assert(
      this.actual && typeof this.actual.length === 'number' && this.actual.length === len,
      () => `Expected length ${len}, got ${this.actual?.length}`
    );
  }

  toThrow(expected) {
    let threw = false;
    let error = null;
    try {
      if (typeof this.actual === 'function') {
        this.actual();
      }
    } catch (e) {
      threw = true;
      error = e;
    }
    if (expected && error) {
      const match = typeof expected === 'string'
        ? error.message.includes(expected)
        : expected instanceof RegExp
          ? expected.test(error.message)
          : true;
      this._assert(threw && match, () => `Expected function to throw error matching ${expected}, threw ${error?.message}`);
    } else {
      this._assert(threw, () => `Expected function to throw an error`);
    }
  }
}

export function expect(actual) {
  return new Expectation(actual);
}

export const suites = [];
let currentSuite = null;

export function describe(name, fn) {
  const suite = { name, tests: [], beforeAll: [], afterAll: [], beforeEach: [], afterEach: [] };
  suites.push(suite);
  const prev = currentSuite;
  currentSuite = suite;
  fn();
  currentSuite = prev;
}

export function test(name, fn, options = {}) {
  if (!currentSuite) {
    describe('Default Suite', () => test(name, fn, options));
  } else {
    currentSuite.tests.push({ name, fn, timeout: options.timeout || 10000 });
  }
}
export const it = test;

export function beforeAll(fn) {
  if (currentSuite) currentSuite.beforeAll.push(fn);
}
export function afterAll(fn) {
  if (currentSuite) currentSuite.afterAll.push(fn);
}
export function beforeEach(fn) {
  if (currentSuite) currentSuite.beforeEach.push(fn);
}
export function afterEach(fn) {
  if (currentSuite) currentSuite.afterEach.push(fn);
}

// ---------------------------------------------------------
// 3. Test Runner Execution & Formatting
// ---------------------------------------------------------

export async function runAllSuites() {
  const filterArg = process.argv.find(a => a.startsWith('--filter='))?.split('=')[1];
  const tierArg = process.argv.find(a => a.startsWith('--tier='))?.split('=')[1];
  const bail = process.argv.includes('--bail');

  console.log('\n\x1b[1m\x1b[36m============================================================\x1b[0m');
  console.log('\x1b[1m\x1b[36m   Peppa Pig: Happy Mrs Chicken - Automated Test Runner     \x1b[0m');
  console.log('\x1b[1m\x1b[36m============================================================\x1b[0m\n');

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;
  const suiteStats = [];
  const startTime = Date.now();

  for (const suite of suites) {
    if (tierArg && !suite.name.toLowerCase().includes(`tier ${tierArg}`) && !suite.name.toLowerCase().includes(`tier${tierArg}`)) {
      continue;
    }

    console.log(`\x1b[1m\x1b[34m▶ Suite: ${suite.name}\x1b[0m`);
    let suitePassed = 0;
    let suiteFailed = 0;

    for (const hook of suite.beforeAll) await hook();

    for (const t of suite.tests) {
      if (filterArg && !t.name.includes(filterArg)) continue;
      totalTests++;
      for (const hook of suite.beforeEach) await hook();

      const tStart = Date.now();
      try {
        await Promise.race([
          t.fn(),
          new Promise((_, rej) =>
            setTimeout(() => rej(new Error(`Test timed out after ${t.timeout}ms`)), t.timeout)
          )
        ]);
        passedTests++;
        suitePassed++;
        const elapsed = Date.now() - tStart;
        console.log(`  \x1b[32m✓ PASS\x1b[0m \x1b[90m[${elapsed}ms]\x1b[0m ${t.name}`);
      } catch (err) {
        failedTests++;
        suiteFailed++;
        const elapsed = Date.now() - tStart;
        console.log(`  \x1b[31m✗ FAIL\x1b[0m \x1b[90m[${elapsed}ms]\x1b[0m ${t.name}`);
        console.log(`    \x1b[31mError:\x1b[0m ${err.message}`);
        if (err.stack) {
          console.log(`    \x1b[90m${err.stack.split('\n').slice(1, 4).join('\n    ')}\x1b[0m`);
        }
        if (bail) break;
      }
      for (const hook of suite.afterEach) await hook();
    }
    for (const hook of suite.afterAll) await hook();
    suiteStats.push({ name: suite.name, passed: suitePassed, failed: suiteFailed, total: suitePassed + suiteFailed });
    console.log('');
    if (bail && failedTests > 0) break;
  }

  const totalDuration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log('\x1b[1m------------------------------------------------------------\x1b[0m');
  console.log('\x1b[1mSummary by Suite Tier:\x1b[0m');
  for (const s of suiteStats) {
    const status = s.failed === 0 ? `\x1b[32m${s.passed}/${s.total} PASS\x1b[0m` : `\x1b[31m${s.failed} FAIL\x1b[0m, ${s.passed} pass`;
    console.log(`  • ${s.name.padEnd(45)}: ${status}`);
  }
  console.log('\x1b[1m------------------------------------------------------------\x1b[0m');
  console.log(
    `\x1b[1mTest Results: \x1b[0m ` +
      (failedTests === 0
        ? `\x1b[32mALL ${passedTests} PASSED\x1b[0m`
        : `\x1b[31m${failedTests} FAILED\x1b[0m, \x1b[32m${passedTests} passed\x1b[0m`) +
      ` \x1b[90m(Total: ${totalTests} tests in ${totalDuration}s)\x1b[0m\n`
  );

  if (process.exitCode === undefined) {
    process.exitCode = failedTests > 0 ? 1 : 0;
  }
  return { totalTests, passedTests, failedTests };
}

// Auto-run if executed directly as root runner script
const isDirectRun = process.argv[1] && (
  process.argv[1].endsWith('e2e_runner.mjs') ||
  process.argv[1].endsWith('e2e_runner.js') ||
  process.argv[1].endsWith('e2e_runner.ts')
);

async function main() {
  const testDir = resolve(__dirname);
  const files = readdirSync(testDir)
    .filter(f => f.startsWith('tier') && (f.endsWith('.ts') || f.endsWith('.mjs') || f.endsWith('.js')))
    .sort();

  for (const f of files) {
    await import(`file://${resolve(testDir, f)}`);
  }
  await runAllSuites();
}

if (isDirectRun) {
  main().catch(err => {
    console.error('Runner error:', err);
    process.exit(1);
  });
}
