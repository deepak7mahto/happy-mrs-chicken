/**
 * Mode 17: Hungry Farmyard Friends Types
 * Adventures of Trishu Preschool Suite
 * Strictly under 500 lines
 */

import { CharacterId } from '../../types/characters';

export type SnackType = 'CARROT' | 'WATERMELON' | 'APPLE' | 'COOKIE' | 'BERRY';

export interface SnackItem {
  id: number;
  type: SnackType;
  name: string;
  emoji: string;
  color: string;
  x: number;
  y: number;
  radius: number;
  isHovered?: boolean;
}

export interface SeatedAnimal {
  id: CharacterId;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  mouthX: number;
  mouthY: number;
  mouthOpen: number; // 0 (closed) to 1 (wide open)
  chewTimer: number; // >0 while munching
  tummyRubTimer: number; // >0 while giggling
  favSnack: SnackType;
  fedCount: number;
  chewCycle: number;
}

export interface FlyingFood {
  id: number;
  snackType: SnackType;
  emoji: string;
  color: string;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  currentX: number;
  currentY: number;
  progress: number; // 0 to 1
  duration: number;
  targetAnimalIndex: number;
  rotation: number;
}
