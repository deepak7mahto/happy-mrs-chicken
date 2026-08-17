/**
 * Audio Engine Type Definitions
 * Adventures of Trishu 8-Game Suite
 */

export type SFXName =
  | 'cluck'
  | 'eggPop'
  | 'crack'
  | 'hatch'
  | 'splash'
  | 'seedDrop'
  | 'fanfare'
  | 'crash'
  | 'click'
  | 'dinosaurRoar'
  | 'balloonPop'
  | 'pancakeSizzle'
  | 'whoosh'
  | 'veggiePop'
  | 'mudThud'
  | 'bubblePop'
  | 'bunnySqueak'
  | 'toddlerGiggle';

export interface SFXOptions {
  playbackRate?: number;
  volume?: number;
  pitch?: number;
  type?: string;
  intensity?: number;
  detune?: number;
}

export interface ISoundEngine {
  init(): Promise<boolean | void>;
  unlock(): Promise<boolean | void>;
  playSFX(name: SFXName, options?: SFXOptions): void;
  startBGM(): void;
  stopBGM(): void;
  setBGMTempo(bpm: number): void;
  toggleMute(): boolean;
  setMuted(muted: boolean): void;
  setVolume(volume: number): void;
  isMuted: boolean;
  isMutedState(): boolean;
}

export interface AudioSpyEvent {
  type: string;
  timestamp: number;
  params?: unknown;
}

export interface AudioSpy {
  events: AudioSpyEvent[];
  clear(): void;
  record(type: string, params?: unknown): void;
  isContextRunning(): boolean;
  getEventsByType?(type: string): AudioSpyEvent[];
}

export interface AudioState {
  isInitialized: boolean;
  isUnlocked: boolean;
  isMuted: boolean;
  volume: number;
  bgmPlaying: boolean;
  bgmTempo: number;
}
