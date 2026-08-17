/**
 * BGMSequencer - 128 BPM Multi-Track Algorithmic Nursery Music Sequencer
 * Adventures of Trishu 8-Game Suite
 */

import { AudioContextHolder } from './AudioContextHolder';

export class BGMSequencer {
  private holder: AudioContextHolder;
  public isRunning: boolean = false;
  public tempo: number = 128; // BPM
  private currentStep: number = 0;
  private nextNoteTime: number = 0;
  private timerId: number | null = null;
  private readonly lookaheadMs: number = 25;
  private readonly scheduleAheadSec: number = 0.15;

  // Track 1: Lead Melody in C Major (E5, G5, C6, E5, D5, F5, A5, ...)
  private readonly melodyNotes: (number | null)[] = [
    523.25, 659.25, 783.99, 1046.50, 659.25, 783.99, 523.25, null,
    587.33, 698.46, 880.00, 1174.66, 698.46, 880.00, 587.33, null,
    523.25, 659.25, 783.99, 1046.50, 659.25, 783.99, 1046.50, 1174.66,
    1046.50, 880.00, 783.99, 659.25, 523.25, null, 523.25, null
  ];

  // Track 2: Bass Tuba / Sub-line (C3, G3, D3, A3, ...)
  private readonly bassNotes: (number | null)[] = [
    130.81, null, 196.00, null, 130.81, null, 196.00, null,
    146.83, null, 220.00, null, 146.83, null, 220.00, null,
    130.81, null, 196.00, null, 130.81, null, 196.00, null,
    196.00, null, 164.81, null, 130.81, null, 196.00, null
  ];

  // Track 3: Offbeat Harmonies (C Maj / G Maj chords)
  private readonly chordTriads: (number[] | null)[] = [
    null, [329.63, 392.00], null, [329.63, 392.00], null, [329.63, 392.00], null, [329.63, 392.00],
    null, [349.23, 440.00], null, [349.23, 440.00], null, [349.23, 440.00], null, [349.23, 440.00],
    null, [329.63, 392.00], null, [329.63, 392.00], null, [329.63, 392.00], null, [329.63, 392.00],
    null, [392.00, 493.88], null, [349.23, 440.00], null, [329.63, 392.00], null, null
  ];

  constructor(holder: AudioContextHolder) {
    this.holder = holder;
  }

  public setTempo(bpm: number): void {
    this.tempo = Math.max(60, Math.min(220, bpm));
  }

  public start(): void {
    if (this.isRunning || !this.holder.ctx) return;
    this.isRunning = true;
    this.currentStep = 0;
    this.nextNoteTime = this.holder.ctx.currentTime + 0.05;
    this.scheduler();
  }

  public stop(): void {
    this.isRunning = false;
    if (this.timerId !== null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  public duckBGM(durationSec: number = 0.8): void {
    if (!this.holder.musicGain || !this.holder.ctx) return;
    const now = this.holder.ctx.currentTime;
    this.holder.musicGain.gain.cancelScheduledValues(now);
    this.holder.musicGain.gain.setValueAtTime(0.08, now);
    this.holder.musicGain.gain.linearRampToValueAtTime(0.35, now + durationSec);
  }

  private scheduler(): void {
    if (!this.isRunning || !this.holder.ctx) return;
    const stepDuration = 60 / this.tempo / 2; // Eighth note

    while (this.nextNoteTime < this.holder.ctx.currentTime + this.scheduleAheadSec) {
      this.scheduleStep(this.currentStep, this.nextNoteTime, stepDuration);
      this.nextNoteTime += stepDuration;
      this.currentStep = (this.currentStep + 1) % this.melodyNotes.length;
    }

    this.timerId = window.setTimeout(() => this.scheduler(), this.lookaheadMs);
  }

  private scheduleStep(step: number, time: number, stepDuration: number): void {
    if (!this.holder.ctx || !this.holder.musicGain || this.holder.isMuted) return;

    // Track 1: Lead Melody
    const mFreq = this.melodyNotes[step];
    if (mFreq) {
      this.playNote(mFreq, time, stepDuration * 0.85, 'triangle', 0.12);
    }

    // Track 2: Bass Tuba
    const bFreq = this.bassNotes[step];
    if (bFreq) {
      this.playNote(bFreq, time, stepDuration * 0.95, 'sine', 0.18);
    }

    // Track 3: Offbeat Harmony Chords
    const chord = this.chordTriads[step];
    if (chord) {
      chord.forEach(freq => {
        this.playNote(freq, time, stepDuration * 0.6, 'triangle', 0.045);
      });
    }

    // Track 4: Woodblock & Shaker Percussion
    if (step % 2 === 0) {
      this.playPercussionClick(time, step % 4 === 0 ? 1400 : 900);
    }
  }

  private playNote(freq: number, time: number, duration: number, type: OscillatorType, volume: number): void {
    if (!this.holder.ctx || !this.holder.musicGain) return;
    const osc = this.holder.ctx.createOscillator();
    const gain = this.holder.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(0.001, time);
    gain.gain.linearRampToValueAtTime(volume, time + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(gain);
    gain.connect(this.holder.musicGain);

    osc.start(time);
    osc.stop(time + duration);
    osc.onended = () => { osc.disconnect(); gain.disconnect(); };
  }

  private playPercussionClick(time: number, filterFreq: number): void {
    if (!this.holder.ctx || !this.holder.musicGain || !this.holder.noiseBuffer) return;
    const src = this.holder.ctx.createBufferSource();
    src.buffer = this.holder.noiseBuffer;

    const filter = this.holder.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(filterFreq, time);
    filter.Q.setValueAtTime(6.0, time);

    const gain = this.holder.ctx.createGain();
    gain.gain.setValueAtTime(0.04, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.025);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.holder.musicGain);

    src.start(time);
    src.stop(time + 0.025);
    src.onended = () => { src.disconnect(); filter.disconnect(); gain.disconnect(); };
  }
}
