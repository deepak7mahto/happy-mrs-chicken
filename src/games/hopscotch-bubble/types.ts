/**
 * Types and constants for Mode 8: Rainbow Bubble Hopscotch
 */

import { BubbleEntity, BubbleType } from '../../types/game';
import { HopscotchTileDef, ParachutingChickDef, CHALK_COLORS } from '../../graphics/bubbleGameRenderer';

export type { BubbleEntity, BubbleType, HopscotchTileDef, ParachutingChickDef };
export { CHALK_COLORS };

export interface MimiState {
  x: number;
  y: number;
  currentSquare: number;
  targetSquare: number;
  isHopping: boolean;
  hopTimer: number;
  hopDuration: number;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
}

export const PENTATONIC_PITCHES = [1.0, 1.122, 1.26, 1.498, 1.682, 2.0];
export const COMBO_WORDS = ['Pop! 🫧', 'Super Pop! ⭐', 'Mega Pop! 🌈', 'Bubble Magic! ✨', 'Pop-tastic! 🎉'];
