import { SFXName } from '../types/game';

class BGMSequencer {
  private soundEngine: SoundEngine;
  public isRunning: boolean = false;
  private currentStep: number = 0;
  private timerId: number | null = null;
  private tempo: number = 128; // BPM
  private intervalMs: number = (60 / 128 / 4) * 1000;

  // Cheerful cartoon melody pattern
  private melodyNotes: (number | null)[] = [
    261.63, null, 329.63, null, 392.00, null, 523.25, 392.00,
    329.63, null, 261.63, null, 293.66, null, 392.00, null,
    261.63, null, 329.63, null, 392.00, null, 523.25, null,
    587.33, 523.25, 392.00, 329.63, 261.63, null, null, null
  ];

  private bassNotes: (number | null)[] = [
    130.81, null, 130.81, null, 164.81, null, 196.00, null,
    130.81, null, 130.81, null, 146.83, null, 196.00, null,
    130.81, null, 130.81, null, 164.81, null, 196.00, null,
    196.00, null, 164.81, null, 130.81, null, null, null
  ];

  constructor(soundEngine: SoundEngine) {
    this.soundEngine = soundEngine;
  }

  setTempo(bpm: number): void {
    this.tempo = bpm;
    this.intervalMs = (60 / bpm / 4) * 1000;
    if (this.isRunning) {
      this.stop();
      this.start();
    }
  }

  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.currentStep = 0;
    this.scheduleNext();
  }

  stop(): void {
    this.isRunning = false;
    if (this.timerId !== null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  private scheduleNext(): void {
    if (!this.isRunning) return;
    this.tick();
    this.timerId = window.setTimeout(() => this.scheduleNext(), this.intervalMs);
  }

  private tick(): void {
    if (!this.soundEngine.ctx || this.soundEngine.isMutedState()) return;

    const mNote = this.melodyNotes[this.currentStep % this.melodyNotes.length];
    if (mNote) {
      this.soundEngine.playTone(mNote, 0.12, 'triangle', 0.08);
    }

    const bNote = this.bassNotes[this.currentStep % this.bassNotes.length];
    if (bNote) {
      this.soundEngine.playTone(bNote, 0.18, 'sine', 0.12);
    }

    this.currentStep++;
  }
}

export class SoundEngine {
  public ctx: AudioContext | null = null;
  public masterGain: GainNode | null = null;
  public sfxGain: GainNode | null = null;
  public musicGain: GainNode | null = null;
  public isUnlocked: boolean = false;
  private isMuted: boolean = false;
  public sequencer: BGMSequencer | null = null;
  private noiseBuffer: AudioBuffer | null = null;

  constructor() {
    this.setupUnlockListeners();
  }

  async init(): Promise<boolean> {
    if (this.ctx) return true;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();
      this.musicGain = this.ctx.createGain();

      this.sfxGain.connect(this.masterGain);
      this.musicGain.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);

      this.generateNoiseBuffer();
      this.sequencer = new BGMSequencer(this);
      return true;
    } catch (e) {
      console.warn('Web Audio initialization error:', e);
      return false;
    }
  }

  setupUnlockListeners(): void {
    const unlockHandler = () => {
      this.unlock();
      ['pointerdown', 'touchstart', 'keydown', 'mousedown'].forEach(evt => {
        window.removeEventListener(evt, unlockHandler, { capture: true });
      });
    };
    ['pointerdown', 'touchstart', 'keydown', 'mousedown'].forEach(evt => {
      window.addEventListener(evt, unlockHandler, { capture: true, passive: true });
    });
  }

  async unlock(): Promise<boolean> {
    if (!this.ctx) await this.init();
    if (!this.ctx) return false;

    if (this.ctx.state === 'suspended') {
      try {
        await this.ctx.resume();
      } catch (_) {}
    }

    try {
      const dummy = this.ctx.createBufferSource();
      dummy.buffer = this.ctx.createBuffer(1, 1, 22050);
      dummy.connect(this.ctx.destination);
      dummy.start(0);
      dummy.stop(0.001);
    } catch (_) {}

    this.isUnlocked = this.ctx.state === 'running';
    return this.isUnlocked;
  }

  setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 1, this.ctx.currentTime);
    }
  }

  isMutedState(): boolean {
    return this.isMuted;
  }

  generateNoiseBuffer(): void {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 2;
    this.noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = this.noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
  }

  playTone(freq: number, duration: number = 0.1, type: OscillatorType = 'sine', volume: number = 0.15): void {
    if (!this.ctx || this.isMuted || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + duration);
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
  }

  playCluck(type: string = 'short'): void {
    if (!this.ctx || this.isMuted || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    const baseFreq = type === 'high' ? 620 : 440;
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.6, now + 0.04);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.7, now + 0.14);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.14);
    osc.onended = () => { osc.disconnect(); gain.disconnect(); };
  }

  playEggPop(): void {
    if (!this.ctx || this.isMuted || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(780, now + 0.08);

    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.08);
    osc.onended = () => { osc.disconnect(); gain.disconnect(); };
  }

  playCrack(): void {
    if (!this.ctx || this.isMuted || !this.sfxGain || !this.noiseBuffer) return;
    const now = this.ctx.currentTime;
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1400, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.onended = () => {
      try {
        noise.disconnect();
        filter.disconnect();
        gain.disconnect();
      } catch (_) {}
    };

    noise.start(now);
    noise.stop(now + 0.06);
  }

  playHatch(): void {
    this.playCrack();
    this.playTone(880, 0.12, 'sine', 0.2);
    setTimeout(() => this.playTone(1174.66, 0.16, 'sine', 0.2), 60);
  }

  playMudSplash(intensity: number = 1.0): void {
    if (!this.ctx || this.isMuted || !this.sfxGain || !this.noiseBuffer) return;
    const now = this.ctx.currentTime;
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, now);
    filter.frequency.exponentialRampToValueAtTime(120, now + 0.25);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3 * intensity, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.onended = () => {
      try {
        noise.disconnect();
        filter.disconnect();
        gain.disconnect();
      } catch (_) {}
    };

    noise.start(now);
    noise.stop(now + 0.25);
  }

  playSeedChime(): void {
    this.playTone(1046.50, 0.1, 'sine', 0.15);
  }

  playVictoryFanfare(): void {
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((note, i) => {
      setTimeout(() => this.playTone(note, 0.18, 'triangle', 0.2), i * 90);
    });
  }

  playOverheatCrash(): void {
    if (!this.ctx || this.isMuted || !this.sfxGain || !this.noiseBuffer) return;
    const now = this.ctx.currentTime;
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

    noise.connect(gain);
    gain.connect(this.sfxGain);

    noise.onended = () => {
      try {
        noise.disconnect();
        gain.disconnect();
      } catch (_) {}
    };

    noise.start(now);
    noise.stop(now + 0.8);
  }

  playClick(): void {
    this.playTone(800, 0.03, 'sine', 0.1);
  }

  playSFX(sfxName: SFXName, options: { type?: string; intensity?: number } = {}): void {
    switch (sfxName) {
      case 'cluck': this.playCluck(options.type); break;
      case 'eggPop': this.playEggPop(); break;
      case 'crack': this.playCrack(); break;
      case 'hatch': this.playHatch(); break;
      case 'splash': this.playMudSplash(options.intensity); break;
      case 'seedDrop': this.playSeedChime(); break;
      case 'fanfare': this.playVictoryFanfare(); break;
      case 'crash': this.playOverheatCrash(); break;
      case 'click': this.playClick(); break;
    }
  }
}

export const soundEngine = new SoundEngine();

interface AudioSpy {
  events: { type: string; timestamp: number; params?: unknown }[];
  clear: () => void;
  record: (type: string, params?: unknown) => void;
  isContextRunning: () => boolean;
}

// Telemetry & Test Harness Audio Global Spy
if (typeof window !== 'undefined') {
  const spy: AudioSpy = {
    events: [],
    clear() { this.events = []; },
    record(type: string, params: unknown = {}) {
      this.events.push({ type, timestamp: performance.now(), params });
      if (this.events.length > 500) this.events.shift();
    },
    isContextRunning() {
      return Boolean(soundEngine.ctx && soundEngine.ctx.state === 'running');
    }
  };
  (window as unknown as { __AUDIO_SPY__: AudioSpy }).__AUDIO_SPY__ = spy;

  (window as unknown as { __AUDIO_ENGINE__: unknown }).__AUDIO_ENGINE__ = {
    init: async () => soundEngine.init(),
    unlock: async () => soundEngine.unlock(),
    setMuted: (isMuted: boolean) => {
      soundEngine.setMuted(isMuted);
      (window as unknown as { __AUDIO_SPY__: { record: (t: string, p: unknown) => void } }).__AUDIO_SPY__.record('mute_toggle', { muted: isMuted });
    },
    isMuted: () => soundEngine.isMutedState(),
    playSFX: (sfxName: SFXName, options: unknown = {}) => {
      (window as unknown as { __AUDIO_SPY__: { record: (t: string, p: unknown) => void } }).__AUDIO_SPY__.record(sfxName, options);
      soundEngine.playSFX(sfxName, options as { type?: string; intensity?: number });
    },
    startBGM: () => {
      soundEngine.unlock().then(() => {
        if (soundEngine.sequencer) {
          soundEngine.sequencer.start();
          (window as unknown as { __AUDIO_SPY__: { record: (t: string) => void } }).__AUDIO_SPY__.record('bgm_start');
        }
      });
    },
    stopBGM: () => {
      if (soundEngine.sequencer) {
        soundEngine.sequencer.stop();
        (window as unknown as { __AUDIO_SPY__: { record: (t: string) => void } }).__AUDIO_SPY__.record('bgm_stop');
      }
    },
    setBGMTempo: (bpm: number) => {
      if (soundEngine.sequencer) {
        soundEngine.sequencer.setTempo(bpm);
        (window as unknown as { __AUDIO_SPY__: { record: (t: string, p: unknown) => void } }).__AUDIO_SPY__.record('bgm_tempo', { bpm });
      }
    }
  };
}
