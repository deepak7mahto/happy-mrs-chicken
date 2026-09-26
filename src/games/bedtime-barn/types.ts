/**
 * Mode 20: Sleepy Bedtime Barn Types
 * Adventures of Trishu Preschool Suite
 * Strictly under 500 lines
 */

import { CharacterId } from '../../types/characters';

export interface SleepyStall {
  id: string;
  name: string;
  characterId: CharacterId;
  x: number;
  y: number;
  width: number;
  height: number;
  isAsleep: boolean;
  blanketHeight: number; // 0 to 1
  lanternLit: boolean;
  yawnTimer: number;
  quiltColor: string;
  zzzTimer: number;
}

export interface DriftingStar {
  id: number;
  x: number;
  y: number;
  radius: number;
  speed: number;
  twinklePhase: number;
  alpha: number;
  color: string;
}

export interface MoonState {
  x: number;
  y: number;
  radius: number;
  isWinking: boolean;
  winkTimer: number;
}

export interface ZzzBubble {
  id: number;
  x: number;
  y: number;
  alpha: number;
  scale: number;
}
