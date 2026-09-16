import { GameEngine } from '../../engine/GameEngine';
import { InputManager } from '../../engine/InputManager';
import { DisplayManager } from '../../engine/DisplayManager';
import { STORY_STOPS } from '../../story/storyData';

export abstract class BaseScene {
  public game: GameEngine;
  public score: number = 0;
  public storyGoalTriggered: boolean = false;

  constructor(game: GameEngine) {
    this.game = game;
  }

  enter(_params: Record<string, unknown> = {}): void {
    this.storyGoalTriggered = false;
  }

  exit(): void {}

  checkStoryGoal(currentProgress: number, target: number = 0): void {
    if (this.storyGoalTriggered) return;
    if (this.game.activeStoryStopIndex >= 0) {
      const stop = STORY_STOPS[this.game.activeStoryStopIndex];
      const goal = target || (stop ? stop.goalTarget : 5);
      if (currentProgress >= goal) {
        this.storyGoalTriggered = true;
        this.game.triggerStoryVictory(this.score, 3);
      }
    }
  }

  abstract update(dt: number, input: InputManager): void;
  abstract render(ctx: CanvasRenderingContext2D, alpha: number, display: DisplayManager): void;

  getEntities(): Record<string, unknown> {
    return { eggs: [], chicks: [], puddles: [], seeds: [], particles: [] };
  }

  getModeState(): Record<string, unknown> {
    return { timer: 0, feverMeter: 0, multiplier: 1, coopSavedCount: 0, isOverheating: false };
  }
}
