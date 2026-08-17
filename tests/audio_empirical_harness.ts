/**
 * Deep Empirical Audio Verifier & Graph Inspector
 * Peppa Pig: Happy Mrs Chicken 8-Game Deluxe Expansion
 */

// Setup standalone mock window before importing any audio engine modules
const windowListeners = new Map();
(globalThis as any).window = {
  innerWidth: 960,
  innerHeight: 540,
  addEventListener(type: string, listener: any) {
    if (!windowListeners.has(type)) windowListeners.set(type, []);
    windowListeners.get(type).push(listener);
  },
  removeEventListener(type: string, listener: any) {
    if (!windowListeners.has(type)) return;
    windowListeners.set(type, windowListeners.get(type).filter((l: any) => l !== listener));
  },
  setTimeout,
  clearTimeout,
  setInterval,
  clearInterval
};
(globalThis as any).performance = { now: () => Date.now() };

interface AudioEventRecord {
  method: string;
  args: any[];
  time: number;
}

class DetailedMockAudioParam {
  public value: number;
  public defaultValue: number;
  public timeline: AudioEventRecord[] = [];

  constructor(defaultValue: number = 1) {
    this.defaultValue = defaultValue;
    this.value = defaultValue;
  }

  setValueAtTime(val: number, time: number) {
    this.timeline.push({ method: 'setValueAtTime', args: [val, time], time });
    this.value = val;
    return this;
  }

  linearRampToValueAtTime(val: number, time: number) {
    this.timeline.push({ method: 'linearRampToValueAtTime', args: [val, time], time });
    return this;
  }

  exponentialRampToValueAtTime(val: number, time: number) {
    this.timeline.push({ method: 'exponentialRampToValueAtTime', args: [val, time], time });
    return this;
  }

  setTargetAtTime(val: number, time: number, timeConstant: number) {
    this.timeline.push({ method: 'setTargetAtTime', args: [val, time, timeConstant], time });
    return this;
  }

  cancelScheduledValues(time: number) {
    this.timeline.push({ method: 'cancelScheduledValues', args: [time], time });
    this.timeline = this.timeline.filter(e => e.time < time);
    return this;
  }
}

class DetailedMockAudioNode {
  public connections: any[] = [];
  public isDisconnected = false;

  connect(dest: any) {
    this.connections.push(dest);
    return dest;
  }

  disconnect() {
    this.isDisconnected = true;
    this.connections = [];
  }
}

class DetailedMockGainNode extends DetailedMockAudioNode {
  public gain = new DetailedMockAudioParam(1.0);
}

class DetailedMockOscillatorNode extends DetailedMockAudioNode {
  public type: OscillatorType = 'sine';
  public frequency = new DetailedMockAudioParam(440);
  public detune = new DetailedMockAudioParam(0);
  public started = false;
  public stopped = false;
  public startTime = 0;
  public stopTime = 0;
  public onended: (() => void) | null = null;

  start(time: number = 0) {
    this.started = true;
    this.startTime = time;
  }

  stop(time: number = 0) {
    this.stopped = true;
    this.stopTime = time;
  }
}

class DetailedMockAudioBufferSourceNode extends DetailedMockAudioNode {
  public buffer: any = null;
  public playbackRate = new DetailedMockAudioParam(1.0);
  public loop = false;
  public started = false;
  public stopped = false;
  public startTime = 0;
  public stopTime = 0;
  public onended: (() => void) | null = null;

  start(time: number = 0) {
    this.started = true;
    this.startTime = time;
  }

  stop(time: number = 0) {
    this.stopped = true;
    this.stopTime = time;
  }
}

class DetailedMockBiquadFilterNode extends DetailedMockAudioNode {
  public type: BiquadFilterType = 'lowpass';
  public frequency = new DetailedMockAudioParam(350);
  public Q = new DetailedMockAudioParam(1);
  public gain = new DetailedMockAudioParam(0);
}

class DetailedMockDynamicsCompressorNode extends DetailedMockAudioNode {
  public threshold = new DetailedMockAudioParam(-24);
  public knee = new DetailedMockAudioParam(30);
  public ratio = new DetailedMockAudioParam(12);
  public attack = new DetailedMockAudioParam(0.003);
  public release = new DetailedMockAudioParam(0.25);
}

class DetailedMockAudioContext {
  public state: AudioContextState = 'running';
  public sampleRate = 44100;
  public currentTime = 0;
  public destination = new DetailedMockAudioNode();

  public createdNodes: {
    gains: DetailedMockGainNode[];
    oscillators: DetailedMockOscillatorNode[];
    bufferSources: DetailedMockAudioBufferSourceNode[];
    filters: DetailedMockBiquadFilterNode[];
    compressors: DetailedMockDynamicsCompressorNode[];
  } = {
    gains: [],
    oscillators: [],
    bufferSources: [],
    filters: [],
    compressors: []
  };

  createGain(): any {
    const node = new DetailedMockGainNode();
    this.createdNodes.gains.push(node);
    return node;
  }

  createOscillator(): any {
    const node = new DetailedMockOscillatorNode();
    this.createdNodes.oscillators.push(node);
    return node;
  }

  createBufferSource(): any {
    const node = new DetailedMockAudioBufferSourceNode();
    this.createdNodes.bufferSources.push(node);
    return node;
  }

  createBiquadFilter(): any {
    const node = new DetailedMockBiquadFilterNode();
    this.createdNodes.filters.push(node);
    return node;
  }

  createDynamicsCompressor(): any {
    const node = new DetailedMockDynamicsCompressorNode();
    this.createdNodes.compressors.push(node);
    return node;
  }

  createBuffer(channels: number, length: number, sampleRate: number): any {
    return {
      numberOfChannels: channels,
      length,
      sampleRate,
      duration: length / sampleRate,
      _data: new Float32Array(length),
      getChannelData: function() { return this._data; }
    };
  }

  async resume() { this.state = 'running'; }
  async suspend() { this.state = 'suspended'; }
  async close() { this.state = 'closed'; }

  resetNodeStats() {
    this.createdNodes = {
      gains: [],
      oscillators: [],
      bufferSources: [],
      filters: [],
      compressors: []
    };
  }
}

// ---------------------------------------------------------------------------
// Empirical Assertion Framework
// ---------------------------------------------------------------------------
let passedAssertions = 0;
let totalAssertions = 0;
const failures: string[] = [];

function assert(condition: boolean, msg: string) {
  totalAssertions++;
  if (condition) {
    passedAssertions++;
    console.log(`  \x1b[32m✓\x1b[0m ${msg}`);
  } else {
    failures.push(msg);
    console.error(`  \x1b[31m✗ FAIL:\x1b[0m ${msg}`);
  }
}

// ---------------------------------------------------------------------------
// Execution Routine
// ---------------------------------------------------------------------------
export async function runDeepVerification() {
  console.log('\n\x1b[1m\x1b[35m=== DEEP EMPIRICAL AUDIO VERIFICATION HARNESS ===\x1b[0m\n');

  // Install Detailed Mock AudioContext
  const mockCtx = new DetailedMockAudioContext();
  (window as any).AudioContext = function() { return mockCtx; };
  (window as any).webkitAudioContext = function() { return mockCtx; };
  (globalThis as any).AudioContext = (window as any).AudioContext;

  // Dynamically import audio modules now that window & AudioContext are fully ready
  const { AudioContextHolder } = await import('../src/engine/audio/AudioContextHolder');
  const { SoundSynthesizer } = await import('../src/engine/audio/SoundSynthesizer');
  const { BGMSequencer } = await import('../src/engine/audio/BGMSequencer');
  const { AudioSpyImpl } = await import('../src/engine/audio/AudioSpy');
  const { SoundEngine, soundEngine } = await import('../src/engine/audio/index');
  type SFXName = import('../src/types/audio').SFXName;

  // 1. AudioContextHolder Verification
  console.log('\x1b[1m[1] AudioContextHolder & Graph Topology\x1b[0m');
  const holder = new AudioContextHolder();
  await holder.init();

  assert(holder.ctx !== null, 'AudioContextHolder initialized context');
  assert(holder.compressor !== null, 'DynamicsCompressor created');
  assert(holder.sfxGain !== null, 'sfxGain created');
  assert(holder.musicGain !== null, 'musicGain created');
  assert(holder.masterGain !== null, 'masterGain created');

  // Verify routing connections
  const sfxGain = holder.sfxGain as unknown as DetailedMockGainNode;
  const musicGain = holder.musicGain as unknown as DetailedMockGainNode;
  const compressor = holder.compressor as unknown as DetailedMockDynamicsCompressorNode;
  const masterGain = holder.masterGain as unknown as DetailedMockGainNode;

  assert(sfxGain.connections.includes(holder.compressor), 'sfxGain -> compressor connection verified');
  assert(musicGain.connections.includes(holder.compressor), 'musicGain -> compressor connection verified');
  assert(compressor.connections.includes(holder.masterGain), 'compressor -> masterGain connection verified');
  assert(masterGain.connections.includes(mockCtx.destination), 'masterGain -> ctx.destination connection verified');

  // Verify Gain and Compressor values
  assert(Math.abs(sfxGain.gain.value - 0.85) < 0.001, `sfxGain value is 0.85 (got ${sfxGain.gain.value})`);
  assert(Math.abs(musicGain.gain.value - 0.35) < 0.001, `musicGain value is 0.35 (got ${musicGain.gain.value})`);
  assert(compressor.threshold.value === -4.0, `Compressor threshold is -4.0dB (got ${compressor.threshold.value})`);
  assert(compressor.knee.value === 8.0, `Compressor knee is 8.0dB (got ${compressor.knee.value})`);
  assert(compressor.ratio.value === 12.0, `Compressor ratio is 12:1 (got ${compressor.ratio.value})`);

  // Verify Noise Buffer
  assert(holder.noiseBuffer !== null, 'Noise buffer is allocated');
  assert(holder.noiseBuffer!.length === mockCtx.sampleRate * 2, 'Noise buffer length is 2.0s');

  // 2. SoundSynthesizer - All 18 SFX Recipes
  console.log('\n\x1b[1m[2] Procedural Sound Synthesizer: 18 SFX Recipes\x1b[0m');
  const synth = new SoundSynthesizer(holder);

  const ALL_18_SFX: SFXName[] = [
    'cluck', 'eggPop', 'crack', 'hatch', 'splash', 'seedDrop',
    'fanfare', 'crash', 'click', 'dinosaurRoar', 'balloonPop',
    'pancakeSizzle', 'whoosh', 'veggiePop', 'mudThud', 'bubblePop',
    'sheepBleat', 'toddlerGiggle'
  ];

  for (const name of ALL_18_SFX) {
    mockCtx.resetNodeStats();
    synth.playSFX(name);
    // Allow async timers for delayed recipes (fanfare, toddlerGiggle) to fire
    await new Promise(r => setTimeout(r, 350));

    const totalNodes = mockCtx.createdNodes.oscillators.length +
                       mockCtx.createdNodes.bufferSources.length +
                       mockCtx.createdNodes.filters.length +
                       mockCtx.createdNodes.gains.length;
    assert(totalNodes > 0, `SFX '${name}' instantiated Web Audio node graph (total nodes: ${totalNodes})`);
  }

  // Deep inspection of complex SFX recipes
  console.log('\n\x1b[1m[3] Detailed Recipe Parameter & Routing Assertions\x1b[0m');

  // Test cluck (short vs high)
  mockCtx.resetNodeStats();
  synth.playCluck('high');
  const cluckOsc = mockCtx.createdNodes.oscillators.find(o => o.type === 'triangle');
  assert(cluckOsc !== undefined, 'Cluck uses triangle carrier oscillator');
  assert(cluckOsc?.frequency.timeline.some(e => e.args[0] === 620), 'High cluck sets base frequency to 620Hz');

  // Test eggPop
  mockCtx.resetNodeStats();
  synth.playEggPop();
  const eggOsc = mockCtx.createdNodes.oscillators[0];
  assert(eggOsc !== undefined && eggOsc.type === 'sine', 'EggPop uses sine oscillator');
  assert(eggOsc.frequency.timeline.some(e => e.args[0] === 840), 'EggPop starts at 840Hz');

  // Test splash with intensity scaling
  mockCtx.resetNodeStats();
  synth.playSplash(1.5);
  const splashFilter = mockCtx.createdNodes.filters.find(f => f.type === 'lowpass');
  assert(splashFilter !== undefined, 'Splash creates lowpass biquad filter');
  assert(splashFilter?.frequency.timeline.some(e => e.args[0] === 3200), 'Splash filter starts at 3200Hz');

  // Test dinosaurRoar
  mockCtx.resetNodeStats();
  synth.playDinosaurRoar();
  const sawOscs = mockCtx.createdNodes.oscillators.filter(o => o.type === 'sawtooth');
  assert(sawOscs.length >= 3, `DinosaurRoar uses dual sawtooth oscillators + LFO (found ${sawOscs.length})`);
  const dinoFilter = mockCtx.createdNodes.filters.find(f => f.type === 'lowpass');
  assert(dinoFilter !== undefined, 'DinosaurRoar uses lowpass resonant filter');

  // Test sheepBleat
  mockCtx.resetNodeStats();
  synth.playSheepBleat();
  const bleatOsc = mockCtx.createdNodes.oscillators.find(o => o.type === 'sawtooth');
  assert(bleatOsc !== undefined, 'SheepBleat uses sawtooth voice');
  const bleatFilter = mockCtx.createdNodes.filters.find(f => f.type === 'bandpass');
  assert(bleatFilter !== undefined, 'SheepBleat uses bandpass formant filter (1050Hz)');

  // 4. BGMSequencer Lookahead Clock & Multi-Track Scheduling
  console.log('\n\x1b[1m[4] BGMSequencer Multi-Track Scheduling & Ducking\x1b[0m');
  const sequencer = new BGMSequencer(holder);
  assert(!sequencer.isRunning, 'BGMSequencer initially idle');
  assert(sequencer.tempo === 128, 'Default BGM tempo is 128 BPM');

  mockCtx.resetNodeStats();
  sequencer.start();
  assert(sequencer.isRunning, 'BGMSequencer started');
  assert(mockCtx.createdNodes.oscillators.length > 0, 'Sequencer scheduled initial lookahead musical notes');

  // Test Tempo clamping
  sequencer.setTempo(500);
  assert(sequencer.tempo === 220, 'Tempo clamped to max 220 BPM');
  sequencer.setTempo(20);
  assert(sequencer.tempo === 60, 'Tempo clamped to min 60 BPM');
  sequencer.setTempo(128);
  assert(sequencer.tempo === 128, 'Tempo restored to 128 BPM');

  // Test duckBGM timeline scheduling
  sequencer.duckBGM(0.6);
  const duckTimeline = (holder.musicGain as unknown as DetailedMockGainNode).gain.timeline;
  const duckSetVal = duckTimeline.find(e => e.method === 'setValueAtTime' && e.args[0] === 0.08);
  const duckRamp = duckTimeline.find(e => e.method === 'linearRampToValueAtTime' && e.args[0] === 0.35);
  assert(duckSetVal !== undefined, 'duckBGM immediately sets gain to 0.08');
  assert(duckRamp !== undefined, 'duckBGM schedules linear ramp restoration to 0.35');

  sequencer.stop();
  assert(!sequencer.isRunning, 'BGMSequencer stopped');

  // 5. AudioSpy Telemetry Ring Buffer
  console.log('\n\x1b[1m[5] AudioSpy Ring Buffer & Introspection\x1b[0m');
  const spy = new AudioSpyImpl(holder);
  spy.clear();
  assert(spy.events.length === 0, 'AudioSpy cleared');

  for (let i = 0; i < 550; i++) {
    spy.record(`event_${i}`, { idx: i });
  }
  assert(spy.events.length === 500, `AudioSpy capped at exactly 500 events (got ${spy.events.length})`);
  assert(spy.events[0].type === 'event_50', `Oldest 50 events shifted out (first event: ${spy.events[0].type})`);
  assert(spy.events[499].type === 'event_549', `Newest event recorded (last event: ${spy.events[499].type})`);

  // 6. SoundEngine Facade & Window Global Hooks
  console.log('\n\x1b[1m[6] SoundEngine Facade & Window Hooks\x1b[0m');
  const win = window as any;
  assert(win.__AUDIO_SPY__ !== undefined, 'window.__AUDIO_SPY__ is exposed');
  assert(win.__AUDIO_ENGINE__ !== undefined, 'window.__AUDIO_ENGINE__ is exposed');
  assert(typeof win.__AUDIO_ENGINE__.playSFX === 'function', 'window.__AUDIO_ENGINE__.playSFX is a function');
  assert(typeof win.__AUDIO_ENGINE__.startBGM === 'function', 'window.__AUDIO_ENGINE__.startBGM is a function');
  assert(typeof win.__AUDIO_ENGINE__.stopBGM === 'function', 'window.__AUDIO_ENGINE__.stopBGM is a function');
  assert(typeof win.__AUDIO_ENGINE__.setBGMTempo === 'function', 'window.__AUDIO_ENGINE__.setBGMTempo is a function');

  // 7. Adversarial Stress Testing
  console.log('\n\x1b[1m[7] Adversarial Stress Testing\x1b[0m');
  // Stress 1: 500 rapid SFX triggers in single tick
  let threwStress = false;
  try {
    for (let i = 0; i < 500; i++) {
      const sfx = ALL_18_SFX[i % ALL_18_SFX.length];
      synth.playSFX(sfx, { volume: Math.random(), pitch: 100 + Math.random() * 1000, intensity: Math.random() * 3 });
    }
  } catch (e) {
    threwStress = true;
  }
  assert(!threwStress, 'Handled 500 simultaneous SFX triggers without error');

  // Stress 2: Muted playback
  holder.setMuted(true);
  mockCtx.resetNodeStats();
  synth.playSFX('dinosaurRoar');
  synth.playSFX('fanfare');
  const mutedNodes = mockCtx.createdNodes.oscillators.length + mockCtx.createdNodes.gains.length;
  assert(mutedNodes === 0, 'Muted state prevents node creation (zero unnecessary audio nodes allocated)');
  holder.setMuted(false);

  console.log('\n------------------------------------------------------------');
  console.log(`Deep Audio Verification Results: ${passedAssertions}/${totalAssertions} Assertions Passed`);
  if (failures.length > 0) {
    console.log(`\x1b[31mFailures (${failures.length}):\x1b[0m`);
    failures.forEach(f => console.log(`  - ${f}`));
    return false;
  } else {
    console.log('\x1b[32mALL AUDIO ENGINE ASSERTIONS PASSED WITH 100% SUCCESS!\x1b[0m\n');
    return true;
  }
}

// Auto-run if executed directly
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('audio_empirical_harness.ts')) {
  runDeepVerification().then(success => {
    process.exit(success ? 0 : 1);
  });
}
