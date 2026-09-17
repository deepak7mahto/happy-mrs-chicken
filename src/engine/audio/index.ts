/**
 * Audio Engine Subsystem Facade & Global Wiring
 * Adventures of Trishu 8-Game Suite
 */

import { ISoundEngine, SFXName, SFXOptions, BGMMoodTrack } from '../../types/audio';
import { AudioContextHolder } from './AudioContextHolder';
import { SoundSynthesizer } from './SoundSynthesizer';
import { BGMSequencer } from './BGMSequencer';
import { AudioSpyImpl } from './AudioSpy';

export class SoundEngine implements ISoundEngine {
  public holder = new AudioContextHolder();
  public synth = new SoundSynthesizer(this.holder);
  public sequencer = new BGMSequencer(this.holder);
  public spy = new AudioSpyImpl(this.holder);

  public get ctx(): AudioContext | null { return this.holder.ctx; }
  public get isUnlocked(): boolean { return this.holder.isUnlocked; }
  public get isMuted(): boolean { return this.holder.isMuted; }
  public isMutedState(): boolean { return this.holder.isMuted; }
  public get masterGain(): GainNode | null { return this.holder.masterGain; }
  public get sfxGain(): GainNode | null { return this.holder.sfxGain; }
  public get musicGain(): GainNode | null { return this.holder.musicGain; }

  public async init(): Promise<boolean> { return this.holder.init(); }
  public async unlock(): Promise<boolean> { return this.holder.unlock(); }
  public setMuted(m: boolean): void { this.holder.setMuted(m); this.spy.record('mute_toggle', { muted: m }); }
  public toggleMute(): boolean { const next = !this.holder.isMuted; this.setMuted(next); return next; }
  public setVolume(v: number): void { this.holder.setVolume(v); }
  public setBgmVolume(v: number): void { this.holder.setBgmVolume(v); }
  public setSfxVolume(v: number): void { this.holder.setSfxVolume(v); }

  public playSFX(name: SFXName, opt: SFXOptions = {}): void { this.spy.record(name, opt); this.synth.playSFX(name, opt); }
  public playTone(f: number, d?: number, t?: OscillatorType, v?: number): void { this.synth.playTone(f, d, t, v); }
  public playCluck(type?: string): void { this.playSFX('cluck', { type }); }
  public playEggPop(): void { this.playSFX('eggPop'); }
  public playCrack(): void { this.playSFX('crack'); }
  public playHatch(): void { this.playSFX('hatch'); }
  public playMudSplash(intensity?: number): void { this.playSFX('splash', { intensity }); }
  public playSeedChime(): void { this.playSFX('seedDrop'); }
  public playVictoryFanfare(): void { this.duckBGM(1.8); this.playSFX('fanfare'); }
  public playOverheatCrash(): void { this.duckBGM(1.2); this.playSFX('crash'); }
  public playClick(): void { this.playSFX('click'); }
  public playDuckQuack(pitch?: number): void { this.playSFX('duckQuack', { pitch }); }
  public playDuckFanfare(): void { this.duckBGM(1.8); this.playSFX('duckFanfare'); }
  public playPigOink(): void { this.playSFX('pigOink'); }

  public duckBGM(durationSec: number = 0.8): void {
    this.sequencer.duckBGM(durationSec);
  }

  public setTrack(track: BGMMoodTrack): void {
    this.sequencer.setTrack(track);
    this.spy.record('bgm_track', { track });
  }

  private wantsBGM: boolean = false;
  private isSuspended: boolean = false;

  public startBGM(): void {
    this.wantsBGM = true;
    this.unlock().then(() => {
      if (this.wantsBGM && !this.isSuspended) {
        this.sequencer.start();
        this.spy.record('bgm_start');
      }
    });
  }
  public stopBGM(): void {
    this.wantsBGM = false;
    this.sequencer.stop();
    this.spy.record('bgm_stop');
  }
  public setBGMTempo(bpm: number): void { this.sequencer.setTempo(bpm); this.spy.record('bgm_tempo', { bpm }); }

  public async pauseAll(): Promise<void> {
    this.isSuspended = true;
    this.sequencer.stop();
    await this.holder.suspend();
  }

  public async resumeAll(): Promise<void> {
    this.isSuspended = false;
    await this.holder.resume();
    if (this.wantsBGM && !this.holder.isMuted) {
      this.sequencer.start();
    }
  }
}

export const soundEngine = new SoundEngine();

if (typeof window !== 'undefined') {
  (window as unknown as { __AUDIO_SPY__: unknown }).__AUDIO_SPY__ = soundEngine.spy;
  (window as unknown as { __AUDIO_ENGINE__: unknown }).__AUDIO_ENGINE__ = {
    init: async () => soundEngine.init(),
    unlock: async () => soundEngine.unlock(),
    setMuted: (m: boolean) => soundEngine.setMuted(m),
    isMuted: () => soundEngine.isMutedState(),
    playSFX: (name: SFXName, opt: SFXOptions = {}) => soundEngine.playSFX(name, opt),
    startBGM: () => soundEngine.startBGM(),
    stopBGM: () => soundEngine.stopBGM(),
    setBGMTempo: (bpm: number) => soundEngine.setBGMTempo(bpm),
    setTrack: (track: BGMMoodTrack) => soundEngine.setTrack(track),
    duckBGM: (durationSec?: number) => soundEngine.duckBGM(durationSec),
    pauseAll: async () => soundEngine.pauseAll(),
    resumeAll: async () => soundEngine.resumeAll()
  };
}

export * from './AudioContextHolder';
export * from './SoundSynthesizer';
export * from './BGMSequencer';
export * from './AudioSpy';
