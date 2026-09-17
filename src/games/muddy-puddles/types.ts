/**
 * Adventures of Trishu — Mode 2: Muddy Puddles
 * Types and State Definitions
 */

import { PuddleEntity } from '../../types/game';

export interface TrishuJumpState {
  x: number;
  y: number;
  vx: number;
  jumpY: number;
  isJumping: boolean;
  jumpV: number;
  squish: number;
  targetX?: number;
}

export interface MuddyFootprint {
  x: number;
  y: number;
  life: number;
  rotation: number;
}

export type { PuddleEntity };
