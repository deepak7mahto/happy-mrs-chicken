/**
 * Types for Mode 10: Peek-a-Boo Barnyard
 */

export type HidingSpotType = 'BARN' | 'BUSH' | 'HAY' | 'BARREL';

export interface HidingSpot {
  id: string;
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  type: HidingSpotType;
  isOpen: boolean;
  openProgress: number; // 0 to 1
  peekTimer: number;    // time left revealed
  hintWobble: number;
  foundCount: number;
}
