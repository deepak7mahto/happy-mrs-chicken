/**
 * Adventures of Trishu — Mode 15: Rainbow Flower Garden
 * Types and State Definitions
 */

export interface FlowerMound {
  x: number;
  y: number;
  growth: number; // 0 (seed) -> 1.0 (bloomed)
  color: string;
  type: 'sunflower' | 'tulip' | 'daisy' | 'rose';
  bloomed: boolean;
}

export interface GardenButterfly {
  x: number;
  y: number;
  color: string;
  phase: number;
}
