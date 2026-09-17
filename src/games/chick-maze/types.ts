/**
 * Adventures of Trishu — Mode 3: Fluffy Chick Trail
 * Types and State Definitions
 */

import { ChickEntity, SeedEntity } from '../../types/game';

export interface PastureFence {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface CoopDoor {
  x: number;
  y: number;
  r: number;
}

export type { ChickEntity, SeedEntity };
