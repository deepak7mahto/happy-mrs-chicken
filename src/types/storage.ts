/**
 * Storage Schema & Persistence Types
 * Peppa Pig: Happy Mrs Chicken 8-Game Deluxe Expansion
 */

export interface HighScores {
  eggLaying: number;        // Mode 1: Happy Mrs Chicken Classic Egg-Laying
  muddyPuddles: number;     // Mode 2: Muddy Puddles
  chickMaze: number;        // Mode 3: Chick Maze / Sorting
  daddyPig: number;         // Mode 4: Daddy Pig High Score Challenge
  dinosaurBalloon: number;  // Mode 5: George's Dinosaur Balloon Pop
  pancakeFlipper: number;   // Mode 6: Mummy Pig's Pancake Flipper
  vegetableHarvest: number; // Mode 7: Grandpa Pig's Vegetable Harvest
  hopscotchBubble: number;  // Mode 8: Suzy Sheep's Hopscotch & Bubble Trail
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
