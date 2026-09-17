/**
 * Adventures of Trishu — Mode 7: Grandpa's Veggie Harvest
 * Types and State Definitions
 */

import { VegetableEntity } from '../../types/game';

export interface ActiveVeggie extends VegetableEntity {
  springK: number;
  breakoutThreshold: number;
  points: number;
  startY: number;
  pullOffsetY: number;
  isFlying: boolean;
  flightTimer: number;
  flightDuration: number;
  flightStartX: number;
  flightStartY: number;
  flightVy: number;
  rotation: number;
  vRot: number;
}

export interface GardenMoundItem {
  id: string;
  x: number;
  y: number;
  vegetable: ActiveVeggie | null;
  respawnTimer: number;
}

export const SPRING_K = { CARROT: 1.2, CABBAGE: 2.4, PUMPKIN: 4.0 };
export const BREAKOUT_THRESHOLDS = { CARROT: 50, CABBAGE: 60, PUMPKIN: 75 };
export const VEGGIE_POINTS = { CARROT: 20, CABBAGE: 50, PUMPKIN: 100 };
