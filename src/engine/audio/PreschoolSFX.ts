/**
 * Preschool Procedural SFX Recipes
 * Adventures of Trishu Preschool Suite
 * Strictly under 500 lines
 */

import { AudioContextHolder } from './AudioContextHolder';

export class PreschoolSFX {
  private holder: AudioContextHolder;

  constructor(holder: AudioContextHolder) {
    this.holder = holder;
  }

  private get ctx(): AudioContext | null { return this.holder.ctx; }
  private get sfxGain(): GainNode | null { return this.holder.sfxGain; }
  private get noise(): AudioBuffer | null { return this.holder.noiseBuffer; }
  private get canPlay(): boolean { return Boolean(this.ctx && !this.holder.isMuted && this.sfxGain); }

  private makeNoise(dur: number, fType: BiquadFilterType, freq: number, q: number, gainVal: number): void {
    if (!this.canPlay || !this.ctx || !this.sfxGain || !this.noise) return;
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

  public playFoodChomp(): void {
    if (!this.canPlay || !this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator(), gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(680, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.09);
    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
    osc.connect(gain); gain.connect(this.sfxGain);
    osc.start(now); osc.stop(now + 0.1);
    osc.onended = () => { osc.disconnect(); gain.disconnect(); };
    this.makeNoise(0.05, 'lowpass', 1200, 1.2, 0.2);
  }

  public playTummyRub(): void {
    if (!this.canPlay || !this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator(), gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(130, now);
    osc.frequency.linearRampToValueAtTime(160, now + 0.1);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.25);
    gain.gain.setValueAtTime(0.24, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc.connect(gain); gain.connect(this.sfxGain);
    osc.start(now); osc.stop(now + 0.26);
    osc.onended = () => { osc.disconnect(); gain.disconnect(); };
  }

  public playXylophoneChime(freq: number = 523.25): void {
    if (!this.canPlay || !this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator(), gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0.32, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    osc.connect(gain); gain.connect(this.sfxGain);
    osc.start(now); osc.stop(now + 0.46);
    osc.onended = () => { osc.disconnect(); gain.disconnect(); };
  }

  public playDrumThump(): void {
    if (!this.canPlay || !this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator(), gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(38, now + 0.16);
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
    osc.connect(gain); gain.connect(this.sfxGain);
    osc.start(now); osc.stop(now + 0.17);
    osc.onended = () => { osc.disconnect(); gain.disconnect(); };
    this.makeNoise(0.04, 'lowpass', 2400, 1.0, 0.22);
  }

  public playMaracaShake(): void {
    this.makeNoise(0.07, 'highpass', 3500, 2.0, 0.26);
  }

  public playPaintSplat(): void {
    if (!this.canPlay || !this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator(), gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(580, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.1);
    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    osc.connect(gain); gain.connect(this.sfxGain);
    osc.start(now); osc.stop(now + 0.11);
    osc.onended = () => { osc.disconnect(); gain.disconnect(); };
    this.makeNoise(0.05, 'bandpass', 800, 1.5, 0.2);
  }

  public playMusicBoxStar(pitchIndex: number = 0): void {
    const pitches = [880, 1046.5, 1318.5, 1567.98];
    const freq = pitches[Math.abs(pitchIndex) % pitches.length];
    this.playTone(freq, 0.42, 'sine', 0.22);
  }

  public playSleepyYawn(): void {
    if (!this.canPlay || !this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator(), gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(340, now);
    osc.frequency.linearRampToValueAtTime(380, now + 0.15);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.6);
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.22, now + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc.connect(gain); gain.connect(this.sfxGain);
    osc.start(now); osc.stop(now + 0.62);
    osc.onended = () => { osc.disconnect(); gain.disconnect(); };
  }
}
