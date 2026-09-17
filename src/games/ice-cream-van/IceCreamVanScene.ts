/**
 * Mode 11: Miss Bunny's Ice Cream Van
 * Adventures of Trishu Mini-Game Suite
 * Strictly under 500 Lines of Code
 */

import { BaseScene } from '../base/BaseScene';
import { GameEngine } from '../../engine/GameEngine';
import { InputManager } from '../../engine/InputManager';
import { DisplayManager } from '../../engine/DisplayManager';
import { soundEngine } from '../../engine/SoundEngine';
import { Haptics } from '../../engine/Haptics';
import { FlavorTub, Scoop } from './types';
import { IceCreamVanLogic } from './IceCreamVanLogic';
import { IceCreamVanRenderer } from './IceCreamVanRenderer';

export class IceCreamVanScene extends BaseScene {
  public logic: IceCreamVanLogic;
  public renderer: IceCreamVanRenderer;

  // Forwarded properties for test & integration compatibility
  public time: number = 0;
  public scoops: Scoop[] = [];
  public totalScooped: number = 0;
  public munchTimer: number = 0;

  constructor(game: GameEngine) {
    super(game);
    this.logic = new IceCreamVanLogic();
    this.renderer = new IceCreamVanRenderer();
  }

  enter(): void {
    super.enter();
    soundEngine.setTrack('waltz');
    this.logic.reset();
    this.syncFromLogic();
    soundEngine.unlock();
  }

  private syncFromLogic(): void {
    this.time = this.logic.time;
    this.scoops = this.logic.scoops;
    this.totalScooped = this.logic.totalScooped;
    this.munchTimer = this.logic.munchTimer;
    this.score = this.logic.score;
  }

  public addScoop(flavor: FlavorTub): void {
    const { added, isCelebration } = this.logic.addScoop(flavor);
    if (!added) return;

    soundEngine.playSFX('eggPop');
    Haptics.tap();
    this.syncFromLogic();
    this.checkStoryGoal(this.totalScooped);
    this.game.storage.saveHighScore('iceCreamVan', this.score);

    const vWidth = this.game.display.vWidth;
    const vHeight = this.game.display.vHeight;
    this.game.particles.spawnSparkles(vWidth / 2, vHeight - 160 - this.scoops.length * 28, 8);

    if (isCelebration) {
      soundEngine.playSFX('fanfare');
      soundEngine.playSFX('toddlerGiggle');
      Haptics.success();
    }
  }

  public munchFeast(): void {
    const munched = this.logic.munchFeast();
    if (!munched) return;

    this.syncFromLogic();
    soundEngine.playSFX('coneMunch' as any);
    soundEngine.playSFX('pancakeSizzle');
    soundEngine.playSFX('toddlerGiggle');
    Haptics.medium();
    this.game.storage.saveHighScore('iceCreamVan', this.score);
  }

  update(dt: number, input: InputManager): void {
    this.logic.update(dt);
    this.syncFromLogic();

    const vWidth = this.game.display.vWidth;
    const vHeight = this.game.display.vHeight;
    const flavors = this.logic.getFlavors(vWidth, vHeight);

    const checkTap = (x: number, y: number) => {
      for (const f of flavors) {
        if (Math.hypot(x - f.x, y - f.y) <= f.radius + 12) {
          this.addScoop(f);
          return;
        }
      }

      const coneX = vWidth / 2;
      const coneY = vHeight - 150;
      if (Math.hypot(x - coneX, y - coneY) <= 80 || y < coneY) {
        if (this.scoops.length >= 3) {
          this.munchFeast();
        } else {
          this.addScoop(flavors[Math.floor(Math.random() * flavors.length)]);
        }
      }
    };

    if (input.actionJustReleased) {
      checkTap(input.primaryPointer.x, input.primaryPointer.y);
    }
  }

  render(ctx: CanvasRenderingContext2D, _alpha: number, display: DisplayManager): void {
    this.renderer.render(ctx, this.logic, display, this.game.selectedAvatar);
  }

  override getEntities(): Record<string, unknown> {
    return {
      scoopsCount: this.scoops.length,
      totalScooped: this.totalScooped,
      munchTimer: this.munchTimer
    };
  }

  override getModeState(): Record<string, unknown> {
    return {
      score: this.score,
      scoopsCount: this.scoops.length,
      totalScooped: this.totalScooped,
      munchTimer: this.munchTimer,
      timer: this.time,
      feverMeter: 0,
      multiplier: 1,
      coopSavedCount: 0,
      isOverheating: false
    };
  }
}
