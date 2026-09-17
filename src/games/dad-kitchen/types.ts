/**
 * Adventures of Trishu — Mode 4: Dad's Kitchen Dash
 * Types and State Definitions
 */

export type KitchenIngredientType =
  | 'BREAD'
  | 'CHEESE'
  | 'TOMATO'
  | 'LETTUCE'
  | 'CUCUMBER'
  | 'RUBBER_DUCK'
  | 'TOY_DINO'
  | 'GOLDEN_CROWN';

export interface FallingIngredient {
  id: number;
  type: KitchenIngredientType;
  x: number;
  y: number;
  vy: number;
  rotation: number;
  vRot: number;
  caught: boolean;
}

export interface SandwichLayer {
  type: KitchenIngredientType;
  color: string;
  w: number;
  h: number;
}
