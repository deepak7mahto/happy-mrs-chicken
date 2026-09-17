/**
 * Adventures of Trishu — Mode 1: Happy Mrs Clucky
 * Types and State Definitions
 */

import { EggEntity, ChickEntity } from '../../types/game';

export interface ChickenState {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  facingLeft: boolean;
  squash: number;
  squawk: number;
  flap: number;
}

export interface EggStackInfo {
  x: number;
  stackHeight: number;
  baseY: number;
}

export type { EggEntity, ChickEntity };
