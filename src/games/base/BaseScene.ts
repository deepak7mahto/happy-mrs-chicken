import { GameEngine } from '../../engine/GameEngine';
import { InputManager } from '../../engine/InputManager';
import { DisplayManager } from '../../engine/DisplayManager';

export abstract class BaseScene {
  public game: GameEngine;
  public score: number = 0;

  constructor(game: GameEngine) {
    this.game = game;
  }

  enter(_params: Record<string, unknown> = {}): void {}
  exit(): void {}
  abstract update(dt: number, input: InputManager): void;
  abstract render(ctx: CanvasRenderingContext2D, alpha: number, display: DisplayManager): void;

  getEntities(): Record<string, unknown> {
    return { eggs: [], chicks: [], puddles: [], seeds: [], particles: [] };
  }

  getModeState(): Record<string, unknown> {
    return { timer: 0, feverMeter: 0, multiplier: 1, coopSavedCount: 0, isOverheating: false };
  }
}
