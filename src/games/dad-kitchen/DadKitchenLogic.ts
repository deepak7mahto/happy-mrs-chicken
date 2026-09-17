/**
 * Adventures of Trishu — Mode 4: Dad's Kitchen Dash
 * Pure Game Simulation Logic (Headless & Testable)
 */

import { FallingIngredient, SandwichLayer, KitchenIngredientType } from './types';

export interface DadKitchenEvents {
  onIngredientAdded?: (layer: SandwichLayer, earned: number) => void;
  onFeastCelebration?: () => void;
}

const INGREDIENT_COLORS: Record<KitchenIngredientType, string> = {
  BREAD: '#D7CCC8',
  CHEESE: '#FFEE58',
  TOMATO: '#EF5350',
  LETTUCE: '#66BB6A',
  CUCUMBER: '#81C784',
  RUBBER_DUCK: '#FFD54F',
  TOY_DINO: '#81C784',
  GOLDEN_CROWN: '#FFD700'
};

export class DadKitchenLogic {
  public score: number = 0;
  public fever: number = 0;
  public timer: number = 20.0;
  public multiplier: number = 1;
  public itemsStacked: number = 0;
  public celebrationTimer: number = 0;
  public feastBites: number = 0;
  public isOverheating: boolean = false;
  public ingredients: FallingIngredient[] = [];
  public layers: SandwichLayer[] = [];
  private nextId: number = 1;

  public reset(): void {
    this.score = 0;
    this.fever = 0;
    this.timer = 20.0;
    this.multiplier = 1;
    this.itemsStacked = 0;
    this.celebrationTimer = 0;
    this.feastBites = 0;
    this.isOverheating = false;
    this.ingredients = [];
    this.layers = [{ type: 'BREAD', color: '#BCAAA4', w: 100, h: 14 }];
  }

  public tap(events?: DadKitchenEvents): number {
    if (this.celebrationTimer > 0) {
      this.celebrationTimer = 0;
      this.fever = 0;
      this.feastBites = 0;
      this.isOverheating = false;
      this.layers = [{ type: 'BREAD', color: '#BCAAA4', w: 100, h: 14 }];
    }

    this.itemsStacked++;
    this.fever = Math.min(100, this.fever + 6);
    this.multiplier = this.fever >= 90 ? 5 : (this.fever >= 60 ? 3 : (this.fever >= 30 ? 2 : 1));
    const earned = 10 * this.multiplier;
    this.score += earned;

    const types: KitchenIngredientType[] = [
      'CHEESE', 'TOMATO', 'LETTUCE', 'RUBBER_DUCK', 'CUCUMBER', 'TOY_DINO', 'GOLDEN_CROWN', 'BREAD'
    ];
    const chosenType = types[this.itemsStacked % types.length];
    const newLayer: SandwichLayer = {
      type: chosenType,
      color: INGREDIENT_COLORS[chosenType],
      w: Math.max(70, 100 - (this.itemsStacked % 6) * 4),
      h: 12
    };
    this.layers.push(newLayer);

    if (events?.onIngredientAdded) {
      events.onIngredientAdded(newLayer, earned);
    }

    // Feast celebration at 100%
    if (this.fever >= 100) {
      this.isOverheating = false;
      this.celebrationTimer = 2.5;
      this.score += 250;
      if (events?.onFeastCelebration) {
        events.onFeastCelebration();
      }
    }

    return earned;
  }

  public update(dt: number): void {
    if (this.celebrationTimer > 0) {
      this.celebrationTimer -= dt;
      this.feastBites = Math.min(3, Math.floor((2.5 - this.celebrationTimer) / 0.8) + 1);
      if (this.celebrationTimer <= 0) {
        this.fever = 0;
        this.feastBites = 0;
      }
    } else {
      this.fever = Math.max(0, this.fever - 2.5 * dt);
      this.multiplier = this.fever >= 90 ? 5 : (this.fever >= 60 ? 3 : (this.fever >= 30 ? 2 : 1));
    }
  }
}
