/**
 * Adventures of Trishu — Mode 6: Golden Pancake Flipper
 * Types and State Definitions
 */

import { PancakeEntity } from '../../types/game';

export interface StackedPancakeItem {
  y: number;
  state: 'RAW' | 'PERFECT_GOLDEN' | 'OVERCOOKED';
  butter: boolean;
  syrup?: boolean;
}

export interface ActivePancakeState extends PancakeEntity {
  cookTimer: number;
  startX: number;
  startY: number;
  isCeilingStuck?: boolean;
  ceilingTimer?: number;
}

export type { PancakeEntity };
