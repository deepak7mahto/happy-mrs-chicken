/**
 * SoundSynthesizer - Procedural Web Audio synthesis recipes for all 18 cartoon SFX
 * Adventures of Trishu 8-Game Suite
 */

import { AudioContextHolder } from './AudioContextHolder';
import { SFXName, SFXOptions } from '../../types/audio';

export class SoundSynthesizer {
  private holder: AudioContextHolder;

  constructor(holder: AudioContextHolder) {
    this.holder = holder;
  }

  private get ctx(): AudioContext | null { return this.holder.ctx; }
  private get sfxGain(): GainNode | null { return this.holder.sfxGain; }
  private get noise(): AudioBuffer | null { return this.holder.noiseBuffer; }
  private get canPlay(): boolean { return Boolean(this.ctx && !this.holder.isMuted && this.sfxGain); }

  private makeNoise(dur: number, fType: BiquadFilterType, freq: number, q: number, gainVal: number): { src: AudioBufferSourceNode; filter: BiquadFilterNode; gain: GainNode } | null {
    if (!this.canPlay || !this.ctx || !this.sfxGain || !this.noise) return null;
    const now = this.ctx.currentTime;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noise;
    const filter = this.ctx.createBiquadFilter();
    filter.type = fType;
    filter.frequency.setValueAtTime(freq, now);
    filter.Q.setValueAtTime(q, now);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(gainVal, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    src.start(now);
    src.stop(now + dur);
    src.onended = () => { src.disconnect(); filter.disconnect(); gain.disconnect(); };
    return { src, filter, gain };
  }

  public playTone(freq: number, dur: number = 0.1, type: OscillatorType = 'sine', vol: number = 0.15): void {
    if (!this.canPlay || !this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + dur);
    osc.onended = () => { osc.disconnect(); gain.disconnect(); };
  }

  public playCluck(type: string = 'short'): void {
    if (!this.canPlay || !this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator(), mod = this.ctx.createOscillator();
    const modGain = this.ctx.createGain(), filter = this.ctx.createBiquadFilter(), gain = this.ctx.createGain();
    const base = type === 'high' ? 620 : 440;
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(base, now);
    osc.frequency.linearRampToValueAtTime(base * 1.35, now + 0.025);
    osc.frequency.exponentialRampToValueAtTime(base * 0.55, now + 0.12);
    mod.frequency.setValueAtTime(30, now);
    modGain.gain.setValueAtTime(95, now);
    mod.connect(osc.frequency);
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(880, now);
    filter.Q.setValueAtTime(3.5, now);
    gain.gain.setValueAtTime(0.24, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    mod.start(now); osc.start(now); mod.stop(now + 0.12); osc.stop(now + 0.12);
    osc.onended = () => { osc.disconnect(); mod.disconnect(); modGain.disconnect(); filter.disconnect(); gain.disconnect(); };
  }

  public playEggPop(): void {
    if (!this.canPlay || !this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator(), gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(840, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.08);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now); osc.stop(now + 0.08);
    osc.onended = () => { osc.disconnect(); gain.disconnect(); };
  }

  public playCrack(): void { this.makeNoise(0.07, 'highpass', 2600, 2.2, 0.28); }

  public playHatch(): void {
    this.playCrack();
    this.playTone(1650, 0.08, 'sine', 0.18);
    setTimeout(() => this.playTone(2100, 0.1, 'sine', 0.2), 110);
  }

  public playSplash(intensity: number = 1.0): void {
    const res = this.makeNoise(0.24, 'lowpass', 3200, 4.0, 0.32 * Math.min(2.0, intensity));
    if (res && this.ctx) res.filter.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.24);
    this.playTone(160, 0.18, 'sine', 0.2 * intensity);
  }

  public playSeedDrop(): void {
    this.playTone(1760, 0.18, 'sine', 0.15);
    this.playTone(3520, 0.12, 'sine', 0.08);
    this.playTone(5280, 0.09, 'triangle', 0.04);
  }

  public playFanfare(): void {
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.14, 'triangle', 0.22), i * 75);
    });
    setTimeout(() => {
      this.playTone(523.25, 0.5, 'triangle', 0.15);
      this.playTone(659.25, 0.5, 'triangle', 0.15);
      this.playTone(1046.50, 0.5, 'triangle', 0.18);
    }, 320);
  }

  public playCrash(): void {
    this.makeNoise(0.75, 'bandpass', 3200, 1.0, 0.35);
    if (!this.canPlay || !this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator(), gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(90, now + 0.65);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now); osc.stop(now + 0.65);
    osc.onended = () => { osc.disconnect(); gain.disconnect(); };
  }

  public playClick(): void { this.playTone(540, 0.025, 'sine', 0.12); }

  public playDinosaurRoar(): void {
    if (!this.canPlay || !this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const o1 = this.ctx.createOscillator(), o2 = this.ctx.createOscillator();
    const lfo = this.ctx.createOscillator(), lfoG = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter(), gain = this.ctx.createGain();
    o1.type = 'sawtooth'; o2.type = 'sawtooth';
    o1.frequency.setValueAtTime(115, now); o2.frequency.setValueAtTime(120, now);
    o1.frequency.exponentialRampToValueAtTime(55, now + 0.5); o2.frequency.exponentialRampToValueAtTime(58, now + 0.5);
    lfo.type = 'sawtooth'; lfo.frequency.setValueAtTime(42, now); lfoG.gain.setValueAtTime(50, now);
    lfo.connect(o1.frequency); lfo.connect(o2.frequency);
    filter.type = 'lowpass'; filter.frequency.setValueAtTime(800, now); filter.frequency.exponentialRampToValueAtTime(250, now + 0.5);
    gain.gain.setValueAtTime(0.01, now); gain.gain.linearRampToValueAtTime(0.3, now + 0.03); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    o1.connect(filter); o2.connect(filter); filter.connect(gain); gain.connect(this.sfxGain);
    lfo.start(now); o1.start(now); o2.start(now); lfo.stop(now + 0.5); o1.stop(now + 0.5); o2.stop(now + 0.5);
    o1.onended = () => { o1.disconnect(); o2.disconnect(); lfo.disconnect(); lfoG.disconnect(); filter.disconnect(); gain.disconnect(); };
  }

  public playBalloonPop(): void {
    this.makeNoise(0.04, 'highpass', 1800, 1.0, 0.3);
    this.playTone(360, 0.06, 'sine', 0.22);
  }

  public playPancakeSizzle(): void {
    const res = this.makeNoise(0.45, 'bandpass', 2600, 1.8, 0.01);
    if (res && this.ctx) {
      const now = this.ctx.currentTime;
      res.gain.gain.linearRampToValueAtTime(0.22, now + 0.04);
      res.gain.gain.setValueAtTime(0.22, now + 0.39);
      res.gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    }
  }

  public playWhoosh(): void {
    const res = this.makeNoise(0.28, 'bandpass', 280, 2.0, 0.01);
    if (res && this.ctx) {
      const now = this.ctx.currentTime;
      res.filter.frequency.exponentialRampToValueAtTime(1600, now + 0.12);
      res.filter.frequency.exponentialRampToValueAtTime(320, now + 0.28);
      res.gain.gain.linearRampToValueAtTime(0.25, now + 0.12);
      res.gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
    }
  }

  public playVeggiePop(): void {
    if (!this.canPlay || !this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator(), gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(110, now);
    osc.frequency.exponentialRampToValueAtTime(380, now + 0.05);
    osc.frequency.exponentialRampToValueAtTime(95, now + 0.15);
    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now); osc.stop(now + 0.15);
    osc.onended = () => { osc.disconnect(); gain.disconnect(); };
  }

  public playMudThud(): void {
    this.playTone(140, 0.18, 'triangle', 0.28);
    this.playSplash(0.6);
  }

  public playBubblePop(options: SFXOptions = {}): void {
    const pitch = options.pitch ?? options.playbackRate ?? 1.0;
    const baseFreq = (options.detune ? 440 * Math.pow(2, options.detune / 1200) : 1200) * pitch;
    this.playTone(baseFreq, 0.055, 'sine', (options.volume ?? 1.0) * 0.22);
    this.playTone(baseFreq * 3.5, 0.035, 'sine', (options.volume ?? 1.0) * 0.12);
  }

  public playBunnySqueak(): void {
    if (!this.canPlay || !this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator(), lfo = this.ctx.createOscillator();
    const lfoG = this.ctx.createGain(), filter = this.ctx.createBiquadFilter(), gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(329.6, now);
    osc.frequency.exponentialRampToValueAtTime(311.1, now + 0.35);
    lfo.frequency.setValueAtTime(12, now);
    lfoG.gain.setValueAtTime(18, now);
    lfo.connect(osc.frequency);
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1050, now);
    filter.Q.setValueAtTime(3.0, now);
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.24, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc.connect(filter); filter.connect(gain); gain.connect(this.sfxGain);
    lfo.start(now); osc.start(now); lfo.stop(now + 0.35); osc.stop(now + 0.35);
    osc.onended = () => { osc.disconnect(); lfo.disconnect(); lfoG.disconnect(); filter.disconnect(); gain.disconnect(); };
  }

  public playSheepBleat(): void {
    this.playBunnySqueak();
  }

  public playToddlerGiggle(): void {
    [{ f: 587, d: 0 }, { f: 784, d: 70 }, { f: 880, d: 140 }].forEach(({ f, d }) => {
      setTimeout(() => this.playTone(f, 0.06, 'triangle', 0.16), d);
    });
  }

  public playSFX(name: SFXName, options: SFXOptions = {}): void {
    switch (name) {
      case 'cluck': this.playCluck(options.type); break;
      case 'eggPop': this.playEggPop(); break;
      case 'crack': this.playCrack(); break;
      case 'hatch': this.playHatch(); break;
      case 'splash': this.playSplash(options.intensity ?? 1.0); break;
      case 'seedDrop': this.playSeedDrop(); break;
      case 'fanfare': this.playFanfare(); break;
      case 'crash': this.playCrash(); break;
      case 'click': this.playClick(); break;
      case 'dinosaurRoar': this.playDinosaurRoar(); break;
      case 'balloonPop': this.playBalloonPop(); break;
      case 'pancakeSizzle': this.playPancakeSizzle(); break;
      case 'whoosh': this.playWhoosh(); break;
      case 'veggiePop': this.playVeggiePop(); break;
      case 'mudThud': this.playMudThud(); break;
      case 'bubblePop': this.playBubblePop(options); break;
      case 'bunnySqueak': this.playBunnySqueak(); break;
      case 'sheepBleat' as any: this.playBunnySqueak(); break;
      case 'toddlerGiggle': this.playToddlerGiggle(); break;
    }
  }
}
