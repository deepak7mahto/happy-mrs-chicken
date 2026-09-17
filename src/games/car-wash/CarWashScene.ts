/**
 * Mode 13: Muddy Car Wash
 * Adventures of Trishu Mini-Game Suite
 * Strictly under 500 Lines of Code
 */

import { BaseScene } from '../base/BaseScene';
import { GameEngine } from '../../engine/GameEngine';
import { InputManager } from '../../engine/InputManager';
import { DisplayManager } from '../../engine/DisplayManager';
import { soundEngine } from '../../engine/SoundEngine';
import { Haptics } from '../../engine/Haptics';
import { MudSpot, CarWashBubble } from './types';
import { CarWashLogic } from './CarWashLogic';
import { CarWashRenderer } from './CarWashRenderer';

export class CarWashScene extends BaseScene {
  public logic: CarWashLogic;
  public renderer: CarWashRenderer;

  // Forwarded properties for test & state compatibility
  public time: number = 0;
  public get mudSpots(): MudSpot[] { return this.logic.mudSpots; }
  public get cleanCarsCount(): number { return this.logic.cleanCarsCount; }
  public get celebrationTimer(): number { return this.logic.celebrationTimer; }
  public get bubbles(): CarWashBubble[] { return this.logic.bubbles; }

  constructor(game: GameEngine) {
    super(game);
    this.logic = new CarWashLogic();
    this.renderer = new CarWashRenderer();
  }

  enter(): void {
    super.enter();
    soundEngine.setTrack('classic');
    const cx = this.game.display.vWidth / 2;
    const cy = this.game.display.vHeight / 2 + 30;
    this.logic.reset(cx, cy);
    this.syncFromLogic();
    soundEngine.unlock();
  }

  private syncFromLogic(): void {
    this.time = this.logic.time;
    this.score = this.logic.score;
  }

  public cleanSpot(spot: MudSpot): void {
    const { cleaned, allCleaned } = this.logic.cleanSpot(spot);
    soundEngine.playSFX('bubblePop');
    Haptics.tap();
    this.syncFromLogic();

    if (cleaned) {
      soundEngine.playSFX('waterHoseSpray' as any);
      soundEngine.playSFX('splash');
      this.game.particles.spawnSparkles(spot.x, spot.y, 8);
      this.game.storage.saveHighScore('carWash', this.score);
    }

    if (allCleaned) {
      this.checkStoryGoal(this.cleanCarsCount);
      this.game.storage.saveHighScore('carWash', this.score);
      soundEngine.playSFX('fanfare');
      soundEngine.playSFX('toddlerGiggle');
      Haptics.success();
    }
  }

  update(dt: number, input: InputManager): void {
    const { shouldRespawnMud } = this.logic.update(dt);
    this.syncFromLogic();

    if (shouldRespawnMud) {
      soundEngine.playSFX('mudThud');
      const cx = this.game.display.vWidth / 2;
      const cy = this.game.display.vHeight / 2 + 30;
      this.logic.spawnMud(cx, cy);
    }

    const checkCoords = (x: number, y: number) => {
      const hit = this.logic.findSpotAt(x, y);
      if (hit) {
        this.cleanSpot(hit);
      }
    };

    if (input.isActionDown() || input.actionJustReleased) {
      checkCoords(input.primaryPointer.x, input.primaryPointer.y);
    }
    for (const ptr of input.pointers.values()) {
      if (ptr.isDown || ptr.justPressed) {
        checkCoords(ptr.x, ptr.y);
      }
    }
  }

  render(ctx: CanvasRenderingContext2D, _alpha: number, display: DisplayManager): void {
    this.renderer.render(ctx, this.logic, display, this.game.selectedAvatar);
  }

  override getEntities(): Record<string, unknown> {
    return {
      mudSpotsCount: this.mudSpots.filter(s => !s.cleaned).length,
      cleanCarsCount: this.cleanCarsCount
    };
  }

  override getModeState(): Record<string, unknown> {
    return {
      score: this.score,
      mudSpotsRemaining: this.mudSpots.filter(s => !s.cleaned).length,
      cleanCarsCount: this.cleanCarsCount,
      timer: this.time,
      feverMeter: 0,
      multiplier: 1,
      coopSavedCount: 0,
      isOverheating: false
    };
  }
}
