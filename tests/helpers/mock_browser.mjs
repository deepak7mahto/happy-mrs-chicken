/**
 * High-Fidelity Browser Mocks for Unit Testing
 * Provides mock implementations of DOM, Canvas2D, Web Audio API, and LocalStorage
 * for running fast headless unit and state-machine tests.
 */

export class MockCanvasRenderingContext2D {
  constructor(canvas) {
    this.canvas = canvas;
    this.fillStyle = '#000000';
    this.strokeStyle = '#000000';
    this.lineWidth = 1;
    this.lineCap = 'butt';
    this.lineJoin = 'miter';
    this.font = '10px sans-serif';
    this.textAlign = 'start';
    this.textBaseline = 'alphabetic';
    this.globalAlpha = 1.0;
    this.globalCompositeOperation = 'source-over';
    this.shadowColor = 'transparent';
    this.shadowBlur = 0;
    this.shadowOffsetX = 0;
    this.shadowOffsetY = 0;
    this.transformStack = [];
    this.currentTransform = [1, 0, 0, 1, 0, 0];
    this.drawCalls = [];
    this.paths = [];
    this.currentPath = [];
  }

  save() {
    this.transformStack.push([...this.currentTransform]);
    this.drawCalls.push({ type: 'save' });
  }

  restore() {
    if (this.transformStack.length > 0) {
      this.currentTransform = this.transformStack.pop();
    }
    this.drawCalls.push({ type: 'restore' });
  }

  translate(x, y) {
    this.currentTransform[4] += x;
    this.currentTransform[5] += y;
    this.drawCalls.push({ type: 'translate', x, y });
  }

  scale(sx, sy) {
    this.currentTransform[0] *= sx;
    this.currentTransform[3] *= sy;
    this.drawCalls.push({ type: 'scale', sx, sy });
  }

  rotate(angle) {
    this.drawCalls.push({ type: 'rotate', angle });
  }

  beginPath() {
    this.currentPath = [];
    this.drawCalls.push({ type: 'beginPath' });
  }

  closePath() {
    this.drawCalls.push({ type: 'closePath' });
  }

  moveTo(x, y) {
    this.currentPath.push({ type: 'moveTo', x, y });
    this.drawCalls.push({ type: 'moveTo', x, y });
  }

  lineTo(x, y) {
    this.currentPath.push({ type: 'lineTo', x, y });
    this.drawCalls.push({ type: 'lineTo', x, y });
  }

  arc(x, y, radius, startAngle, endAngle, counterclockwise = false) {
    this.currentPath.push({ type: 'arc', x, y, radius, startAngle, endAngle, counterclockwise });
    this.drawCalls.push({ type: 'arc', x, y, radius, startAngle, endAngle, counterclockwise });
  }

  ellipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle, counterclockwise = false) {
    this.currentPath.push({ type: 'ellipse', x, y, radiusX, radiusY, rotation, startAngle, endAngle, counterclockwise });
    this.drawCalls.push({ type: 'ellipse', x, y, radiusX, radiusY, rotation, startAngle, endAngle, counterclockwise });
  }

  quadraticCurveTo(cpx, cpy, x, y) {
    this.currentPath.push({ type: 'quadraticCurveTo', cpx, cpy, x, y });
    this.drawCalls.push({ type: 'quadraticCurveTo', cpx, cpy, x, y });
  }

  bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y) {
    this.currentPath.push({ type: 'bezierCurveTo', cp1x, cp1y, cp2x, cp2y, x, y });
    this.drawCalls.push({ type: 'bezierCurveTo', cp1x, cp1y, cp2x, cp2y, x, y });
  }

  rect(x, y, w, h) {
    this.currentPath.push({ type: 'rect', x, y, w, h });
    this.drawCalls.push({ type: 'rect', x, y, w, h });
  }

  roundRect(x, y, w, h, radii) {
    this.currentPath.push({ type: 'roundRect', x, y, w, h, radii });
    this.drawCalls.push({ type: 'roundRect', x, y, w, h, radii });
  }

  fill() {
    this.paths.push({ path: [...this.currentPath], fillStyle: this.fillStyle, alpha: this.globalAlpha });
    this.drawCalls.push({ type: 'fill', fillStyle: this.fillStyle });
  }

  stroke() {
    this.paths.push({ path: [...this.currentPath], strokeStyle: this.strokeStyle, lineWidth: this.lineWidth, alpha: this.globalAlpha });
    this.drawCalls.push({ type: 'stroke', strokeStyle: this.strokeStyle, lineWidth: this.lineWidth });
  }

  fillRect(x, y, w, h) {
    this.drawCalls.push({ type: 'fillRect', x, y, w, h, fillStyle: this.fillStyle });
  }

  strokeRect(x, y, w, h) {
    this.drawCalls.push({ type: 'strokeRect', x, y, w, h, strokeStyle: this.strokeStyle });
  }

  clearRect(x, y, w, h) {
    this.drawCalls.push({ type: 'clearRect', x, y, w, h });
  }

  fillText(text, x, y, maxWidth) {
    this.drawCalls.push({ type: 'fillText', text, x, y, font: this.font, fillStyle: this.fillStyle });
  }

  strokeText(text, x, y, maxWidth) {
    this.drawCalls.push({ type: 'strokeText', text, x, y, font: this.font, strokeStyle: this.strokeStyle });
  }

  measureText(text) {
    return {
      width: (text || '').length * 8,
      actualBoundingBoxAscent: 10,
      actualBoundingBoxDescent: 2
    };
  }

  createLinearGradient(x0, y0, x1, y1) {
    return {
      type: 'linear',
      stops: [],
      addColorStop(offset, color) {
        this.stops.push({ offset, color });
      }
    };
  }

  createRadialGradient(x0, y0, r0, x1, y1, r1) {
    return {
      type: 'radial',
      stops: [],
      addColorStop(offset, color) {
        this.stops.push({ offset, color });
      }
    };
  }

  getImageData(sx, sy, sw, sh) {
    const data = new Uint8ClampedArray(sw * sh * 4);
    // Fill with sample non-empty pixel data
    for (let i = 3; i < data.length; i += 4) {
      data[i] = 255; // opaque alpha
    }
    return { width: sw, height: sh, data };
  }

  reset() {
    this.drawCalls = [];
    this.paths = [];
    this.currentPath = [];
    this.transformStack = [];
    this.currentTransform = [1, 0, 0, 1, 0, 0];
  }
}

export class MockCanvas {
  constructor(width = 960, height = 540) {
    this.width = width;
    this.height = height;
    this.style = { width: `${width}px`, height: `${height}px` };
    this.ctx = new MockCanvasRenderingContext2D(this);
    this.eventListeners = {};
  }

  getContext(type) {
    if (type === '2d') return this.ctx;
    return null;
  }

  getBoundingClientRect() {
    return {
      left: 0,
      top: 0,
      right: this.width,
      bottom: this.height,
      width: this.width,
      height: this.height,
      x: 0,
      y: 0
    };
  }

  addEventListener(event, handler) {
    if (!this.eventListeners[event]) this.eventListeners[event] = [];
    this.eventListeners[event].push(handler);
  }

  removeEventListener(event, handler) {
    if (this.eventListeners[event]) {
      this.eventListeners[event] = this.eventListeners[event].filter(h => h !== handler);
    }
  }

  dispatchEvent(event) {
    const handlers = this.eventListeners[event.type] || [];
    for (const h of handlers) h(event);
    return true;
  }
}

export class MockAudioParam {
  constructor(defaultValue = 0) {
    this.value = defaultValue;
    this.defaultValue = defaultValue;
    this.events = [];
  }

  setValueAtTime(value, startTime) {
    this.value = value;
    this.events.push({ type: 'setValueAtTime', value, startTime });
    return this;
  }

  linearRampToValueAtTime(value, endTime) {
    this.value = value;
    this.events.push({ type: 'linearRampToValueAtTime', value, endTime });
    return this;
  }

  exponentialRampToValueAtTime(value, endTime) {
    this.value = value;
    this.events.push({ type: 'exponentialRampToValueAtTime', value, endTime });
    return this;
  }

  setTargetAtTime(target, startTime, timeConstant) {
    this.value = target;
    this.events.push({ type: 'setTargetAtTime', target, startTime, timeConstant });
    return this;
  }
}

export class MockAudioNode {
  constructor(ctx) {
    this.context = ctx;
    this.connections = [];
  }

  connect(destination) {
    this.connections.push(destination);
    return destination;
  }

  disconnect(destination) {
    if (destination) {
      this.connections = this.connections.filter(c => c !== destination);
    } else {
      this.connections = [];
    }
  }
}

export class MockGainNode extends MockAudioNode {
  constructor(ctx, defaultGain = 1.0) {
    super(ctx);
    this.gain = new MockAudioParam(defaultGain);
  }
}

export class MockOscillatorNode extends MockAudioNode {
  constructor(ctx) {
    super(ctx);
    this.type = 'sine';
    this.frequency = new MockAudioParam(440);
    this.detune = new MockAudioParam(0);
    this.started = false;
    this.stopped = false;
    this.startTime = 0;
    this.stopTime = 0;
  }

  start(time = 0) {
    this.started = true;
    this.startTime = time;
    this.context._activeVoices++;
  }

  stop(time = 0) {
    this.stopped = true;
    this.stopTime = time;
    if (this.context._activeVoices > 0) {
      this.context._activeVoices--;
    }
  }
}

export class MockBiquadFilterNode extends MockAudioNode {
  constructor(ctx) {
    super(ctx);
    this.type = 'lowpass';
    this.frequency = new MockAudioParam(350);
    this.Q = new MockAudioParam(1);
    this.gain = new MockAudioParam(0);
  }
}

export class MockDynamicsCompressorNode extends MockAudioNode {
  constructor(ctx) {
    super(ctx);
    this.threshold = new MockAudioParam(-24);
    this.knee = new MockAudioParam(30);
    this.ratio = new MockAudioParam(12);
    this.attack = new MockAudioParam(0.003);
    this.release = new MockAudioParam(0.25);
  }
}

export class MockAudioBuffer {
  constructor(channels, length, sampleRate) {
    this.numberOfChannels = channels;
    this.length = length;
    this.sampleRate = sampleRate;
    this.duration = length / sampleRate;
    this._data = [];
    for (let c = 0; c < channels; c++) {
      this._data.push(new Float32Array(length));
    }
  }

  getChannelData(channel) {
    return this._data[channel] || this._data[0];
  }
}

export class MockAudioBufferSourceNode extends MockAudioNode {
  constructor(ctx) {
    super(ctx);
    this.buffer = null;
    this.loop = false;
    this.playbackRate = new MockAudioParam(1.0);
    this.started = false;
    this.stopped = false;
  }

  start(time = 0) {
    this.started = true;
  }

  stop(time = 0) {
    this.stopped = true;
  }
}

export class MockAudioContext {
  constructor() {
    this.state = 'suspended';
    this.sampleRate = 44100;
    this.currentTime = 0.0;
    this.destination = new MockAudioNode(this);
    this._activeVoices = 0;
    this.createdNodes = [];
  }

  async resume() {
    this.state = 'running';
    return true;
  }

  async suspend() {
    this.state = 'suspended';
    return true;
  }

  async close() {
    this.state = 'closed';
    return true;
  }

  createGain() {
    const node = new MockGainNode(this);
    this.createdNodes.push(node);
    return node;
  }

  createOscillator() {
    const node = new MockOscillatorNode(this);
    this.createdNodes.push(node);
    return node;
  }

  createBiquadFilter() {
    const node = new MockBiquadFilterNode(this);
    this.createdNodes.push(node);
    return node;
  }

  createDynamicsCompressor() {
    const node = new MockDynamicsCompressorNode(this);
    this.createdNodes.push(node);
    return node;
  }

  createBuffer(channels, length, sampleRate) {
    return new MockAudioBuffer(channels, length, sampleRate);
  }

  createBufferSource() {
    const node = new MockAudioBufferSourceNode(this);
    this.createdNodes.push(node);
    return node;
  }

  advanceTime(seconds) {
    this.currentTime += seconds;
  }
}

export class MockLocalStorage {
  constructor() {
    this.store = new Map();
    this.simulateQuotaError = false;
  }

  getItem(key) {
    return this.store.has(key) ? this.store.get(key) : null;
  }

  setItem(key, value) {
    if (this.simulateQuotaError) {
      const err = new Error('QuotaExceededError: DOMException');
      err.name = 'QuotaExceededError';
      throw err;
    }
    this.store.set(key, String(value));
  }

  removeItem(key) {
    this.store.delete(key);
  }

  clear() {
    this.store.clear();
  }

  get length() {
    return this.store.size;
  }

  key(index) {
    return Array.from(this.store.keys())[index] || null;
  }
}

export function createMockEnvironment() {
  const canvas = new MockCanvas(960, 540);
  const audioCtx = new MockAudioContext();
  const storage = new MockLocalStorage();
  
  let animationFrameId = 0;
  const frameCallbacks = new Map();

  const mockWindow = {
    innerWidth: 960,
    innerHeight: 540,
    devicePixelRatio: 1.0,
    localStorage: storage,
    AudioContext: function() { return audioCtx; },
    webkitAudioContext: function() { return audioCtx; },
    requestAnimationFrame(cb) {
      const id = ++animationFrameId;
      frameCallbacks.set(id, cb);
      return id;
    },
    cancelAnimationFrame(id) {
      frameCallbacks.delete(id);
    },
    performance: {
      now() {
        return audioCtx.currentTime * 1000;
      }
    },
    document: {
      querySelector(selector) {
        if (selector === 'canvas' || selector === '#gameCanvas') return canvas;
        return null;
      },
      querySelectorAll(selector) {
        if (selector === 'canvas') return [canvas];
        return [];
      },
      createElement(tag) {
        if (tag === 'canvas') return new MockCanvas(960, 540);
        return { style: {}, addEventListener() {}, removeEventListener() {} };
      },
      getElementById(id) {
        if (id === 'gameCanvas') return canvas;
        return null;
      },
      body: {
        appendChild() {},
        style: {}
      }
    },
    __stepFrame(dtSeconds = 1/60) {
      audioCtx.advanceTime(dtSeconds);
      const callbacks = Array.from(frameCallbacks.values());
      frameCallbacks.clear();
      for (const cb of callbacks) {
        cb(mockWindow.performance.now());
      }
    }
  };

  return {
    window: mockWindow,
    document: mockWindow.document,
    canvas,
    audioCtx,
    localStorage: storage,
    step: (dt = 1/60) => mockWindow.__stepFrame(dt)
  };
}
