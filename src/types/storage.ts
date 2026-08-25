/**
 * Storage Schema & Persistence Types
 * Adventures of Trishu 8-Game Suite
 */

export interface HighScores {
  eggLaying: number;        // Mode 1: Happy Mrs Clucky Egg-Laying
  muddyPuddles: number;     // Mode 2: Puddle Splash Adventure
  chickMaze: number;        // Mode 3: Fluffy Chick Trail
  daddyPig: number;         // Mode 4: Dad's Kitchen Dash
  dinosaurBalloon: number;  // Mode 5: Trishu & Leo's Balloon Pop
  pancakeFlipper: number;   // Mode 6: Golden Pancake Flipper
  vegetableHarvest: number; // Mode 7: Grandpa's Veggie Harvest
  hopscotchBubble: number;  // Mode 8: Rainbow Bubble Hopscotch
  mixMatch: number;         // Mode 9: Trishu's Mix & Match Funny Studio
  [key: string]: number;
}

export interface SettingsState {
  soundMuted: boolean;
  musicMuted: boolean;
  volume: number;
  hapticsEnabled?: boolean;
  highContrast?: boolean;
}

export type GameSettings = SettingsState;

export interface StorageData {
  highScores: HighScores;
  settings: SettingsState;
  version: number;
  lastSaved?: number;
}

export interface IStorageManager {
  data: StorageData;
  load(): StorageData;
  save(): boolean;
  getHighScore(modeKey: keyof HighScores | string): number;
  saveHighScore(modeKey: keyof HighScores | string, score: number): boolean;
  isMuted(): boolean;
  setMuted(muted: boolean): void;
  isMusicMuted(): boolean;
  setMusicMuted(muted: boolean): void;
  getVolume(): number;
  setVolume(volume: number): void;
  resetAll(): void;
}
