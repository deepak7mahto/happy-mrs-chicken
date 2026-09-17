/**
 * Types and constants for Mode 9: Trishu's Mix & Match Funny Studio
 */

export const FUNNY_ADJECTIVES = [
  'Wacky', 'Super', 'Giggly', 'Speedy', 'Magical', 'Clucky', 'Disco', 'Jumping'
];

export interface MixMatchState {
  time: number;
  headIdx: number;
  torsoIdx: number;
  legsIdx: number;
  isShuffling: boolean;
  shuffleTimer: number;
  shuffleTickTimer: number;
  isDancing: boolean;
  danceTimer: number;
  photoFlashTimer: number;
  photosSnapped: number;
  currentTitle: string;
  score: number;
}
