/**
 * BGMSequencer - 4 Procedural Mood Tracks Algorithmic Nursery Music Sequencer
 * Adventures of Trishu Mini-Game Suite
 * Strictly under 500 Lines of Code
 */

import { AudioContextHolder } from './AudioContextHolder';
import { BGMMoodTrack } from '../../types/audio';

export interface MoodTrackDef {
  tempo: number;
  melody: (number | null)[];
  bass: (number | null)[];
  chords: (number[] | null)[];
  leadWave: OscillatorType;
  bassWave: OscillatorType;
  chordWave: OscillatorType;
  leadVol: number;
  bassVol: number;
  chordVol: number;
  percussionInterval: number;
}

export const MOOD_TRACKS: Record<BGMMoodTrack, MoodTrackDef> = {
  // 'classic': 128 BPM, C Major, upbeat lead & tuba bass (Mrs Clucky, Chick Trail, Menu)
  classic: {
    tempo: 128,
    leadWave: 'triangle',
    bassWave: 'sine',
    chordWave: 'triangle',
    leadVol: 0.12,
    bassVol: 0.18,
    chordVol: 0.045,
    percussionInterval: 2,
    melody: [
      523.25, 659.25, 783.99, 1046.50, 659.25, 783.99, 523.25, null,
      587.33, 698.46, 880.00, 1174.66, 698.46, 880.00, 587.33, null,
      523.25, 659.25, 783.99, 1046.50, 659.25, 783.99, 1046.50, 1174.66,
      1046.50, 880.00, 783.99, 659.25, 523.25, null, 523.25, null
    ],
    bass: [
      130.81, null, 196.00, null, 130.81, null, 196.00, null,
      146.83, null, 220.00, null, 146.83, null, 220.00, null,
      130.81, null, 196.00, null, 130.81, null, 196.00, null,
      196.00, null, 164.81, null, 130.81, null, 196.00, null
    ],
    chords: [
      null, [329.63, 392.00], null, [329.63, 392.00], null, [329.63, 392.00], null, [329.63, 392.00],
      null, [349.23, 440.00], null, [349.23, 440.00], null, [349.23, 440.00], null, [349.23, 440.00],
      null, [329.63, 392.00], null, [329.63, 392.00], null, [329.63, 392.00], null, [329.63, 392.00],
      null, [392.00, 493.88], null, [349.23, 440.00], null, [329.63, 392.00], null, null
    ]
  },

  // 'frenzy': 144 BPM, G Major, bouncy staccato bass (Dad's Kitchen, Muddy Puddles, Balloon Pop)
  frenzy: {
    tempo: 144,
    leadWave: 'triangle',
    bassWave: 'triangle',
    chordWave: 'triangle',
    leadVol: 0.13,
    bassVol: 0.16,
    chordVol: 0.04,
    percussionInterval: 1,
    melody: [
      392.00, 493.88, 587.33, 783.99, 587.33, 783.99, 880.00, 783.99,
      739.99, 659.25, 587.33, 493.88, 587.33, 739.99, 587.33, null,
      392.00, 493.88, 587.33, 783.99, 880.00, 987.77, 783.99, 880.00,
      783.99, 587.33, 493.88, 440.00, 392.00, null, 392.00, null
    ],
    bass: [
      98.00, 98.00, 146.83, 98.00, 98.00, 146.83, 123.47, 146.83,
      130.81, 130.81, 196.00, 130.81, 146.83, 146.83, 220.00, 146.83,
      98.00, 98.00, 146.83, 98.00, 82.41, 82.41, 123.47, 82.41,
      130.81, null, 146.83, null, 98.00, null, 98.00, null
    ],
    chords: [
      null, [493.88, 587.33], null, [493.88, 587.33], null, [493.88, 587.33], null, [493.88, 587.33],
      null, [523.25, 659.25], null, [523.25, 659.25], null, [587.33, 739.99], null, [587.33, 739.99],
      null, [493.88, 587.33], null, [493.88, 587.33], null, [493.88, 659.25], null, [493.88, 659.25],
      null, [523.25, 659.25], null, [587.33, 739.99], null, [493.88, 587.33], null, null
    ]
  },

  // 'waltz': 108 BPM, 3/4 picnic waltz (Picnic Ducks, Ice Cream Van, Little Train)
  waltz: {
    tempo: 108,
    leadWave: 'triangle',
    bassWave: 'sine',
    chordWave: 'triangle',
    leadVol: 0.11,
    bassVol: 0.17,
    chordVol: 0.04,
    percussionInterval: 3,
    melody: [
      659.25, 783.99, null, 659.25, null, 523.25,
      698.46, 880.00, null, 698.46, null, 587.33,
      783.99, 987.77, null, 880.00, null, 698.46,
      783.99, 659.25, null, 523.25, null, null
    ],
    bass: [
      130.81, null, null, null, null, null,
      146.83, null, null, null, null, null,
      196.00, null, null, null, null, null,
      130.81, null, null, null, null, null
    ],
    chords: [
      null, null, [329.63, 392.00], null, [329.63, 392.00], null,
      null, null, [349.23, 440.00], null, [349.23, 440.00], null,
      null, null, [392.00, 493.88], null, [392.00, 493.88], null,
      null, null, [329.63, 392.00], null, [329.63, 392.00], null
    ]
  },

  // 'gentle': 92 BPM, F Major pentatonic bells (Rainbow Garden, Windy Kite, Hopscotch Bubble)
  gentle: {
    tempo: 92,
    leadWave: 'sine',
    bassWave: 'sine',
    chordWave: 'sine',
    leadVol: 0.14,
    bassVol: 0.13,
    chordVol: 0.035,
    percussionInterval: 4,
    melody: [
      523.25, null, 587.33, null, 698.46, null, 880.00, null,
      1046.50, null, 880.00, null, 698.46, null, 587.33, null,
      523.25, null, 698.46, null, 880.00, null, 698.46, null,
      587.33, null, 523.25, null, 392.00, null, 349.23, null
    ],
    bass: [
      87.31, null, null, null, 130.81, null, null, null,
      146.83, null, null, null, 87.31, null, null, null,
      110.00, null, null, null, 130.81, null, null, null,
      87.31, null, null, null, 87.31, null, null, null
    ],
    chords: [
      null, [349.23, 440.00], null, [349.23, 440.00], null, [349.23, 523.25], null, [349.23, 523.25],
      null, [392.00, 587.33], null, [392.00, 587.33], null, [349.23, 440.00], null, [349.23, 440.00],
      null, [349.23, 440.00], null, [349.23, 440.00], null, [349.23, 523.25], null, [349.23, 523.25],
      null, [392.00, 523.25], null, [392.00, 523.25], null, [349.23, 440.00], null, null
    ]
  }
};

export class BGMSequencer {
  private holder: AudioContextHolder;
  public isRunning: boolean = false;
  public tempo: number = 128; // BPM
  public currentTrack: BGMMoodTrack = 'classic';
  private currentStep: number = 0;
  private nextNoteTime: number = 0;
  private timerId: number | null = null;
  private readonly lookaheadMs: number = 25;
  private readonly scheduleAheadSec: number = 0.15;

  constructor(holder: AudioContextHolder) {
    this.holder = holder;
    this.tempo = MOOD_TRACKS.classic.tempo;
  }

  public setTrack(track: BGMMoodTrack): void {
    if (this.currentTrack === track) return;
    this.currentTrack = track;
    const config = MOOD_TRACKS[track];
    this.tempo = config.tempo;
    this.currentStep = 0;

    // Smooth transition: gently ease gain down then back up
    if (this.isRunning && this.holder.ctx && this.holder.musicGain) {
      const now = this.holder.ctx.currentTime;
      const curGain = this.holder.musicGain.gain.value || 0.35;
      this.holder.musicGain.gain.cancelScheduledValues(now);
      this.holder.musicGain.gain.setValueAtTime(curGain, now);
      this.holder.musicGain.gain.linearRampToValueAtTime(curGain * 0.25, now + 0.06);
      this.holder.musicGain.gain.linearRampToValueAtTime(curGain, now + 0.22);
    }
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
    const currentGain = this.holder.musicGain.gain.value || 0.35;
    const targetDucked = currentGain * 0.4; // 60% attenuation
    this.holder.musicGain.gain.cancelScheduledValues(now);
    this.holder.musicGain.gain.setValueAtTime(currentGain, now);
    this.holder.musicGain.gain.linearRampToValueAtTime(targetDucked, now + 0.05);
    this.holder.musicGain.gain.linearRampToValueAtTime(currentGain, now + durationSec);
  }

  private scheduler(): void {
    if (!this.isRunning || !this.holder.ctx) return;
    const trackDef = MOOD_TRACKS[this.currentTrack] || MOOD_TRACKS.classic;
    const stepDuration = 60 / this.tempo / 2; // Eighth note
    const totalSteps = trackDef.melody.length;

    while (this.nextNoteTime < this.holder.ctx.currentTime + this.scheduleAheadSec) {
      this.scheduleStep(trackDef, this.currentStep, this.nextNoteTime, stepDuration);
      this.nextNoteTime += stepDuration;
      this.currentStep = (this.currentStep + 1) % totalSteps;
    }

    this.timerId = window.setTimeout(() => this.scheduler(), this.lookaheadMs);
  }

  private scheduleStep(track: MoodTrackDef, step: number, time: number, stepDuration: number): void {
    if (!this.holder.ctx || !this.holder.musicGain || this.holder.isMuted) return;

    // Track 1: Lead Melody
    const mFreq = track.melody[step];
    if (mFreq) {
      this.playNote(mFreq, time, stepDuration * 0.85, track.leadWave, track.leadVol);
    }

    // Track 2: Bass Line
    const bFreq = track.bass[step];
    if (bFreq) {
      this.playNote(bFreq, time, stepDuration * 0.95, track.bassWave, track.bassVol);
    }

    // Track 3: Offbeat Harmony Chords
    const chord = track.chords[step];
    if (chord) {
      for (const freq of chord) {
        this.playNote(freq, time, stepDuration * 0.6, track.chordWave, track.chordVol);
      }
    }

    // Track 4: Woodblock / Shaker Percussion
    if (step % track.percussionInterval === 0) {
      const freq = step % (track.percussionInterval * 2) === 0 ? 1400 : 900;
      this.playPercussionClick(time, freq);
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
