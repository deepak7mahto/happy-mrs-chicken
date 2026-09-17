/**
 * Mode 14: Windy Castle Kite
 * Adventures of Trishu Mini-Game Suite
 * Strictly under 500 Lines of Code
 */

import { BaseScene } from '../base/BaseScene';
import { GameEngine } from '../../engine/GameEngine';
import { InputManager } from '../../engine/InputManager';
import { DisplayManager } from '../../engine/DisplayManager';
import { soundEngine } from '../../engine/SoundEngine';
import { Haptics } from '../../engine/Haptics';
import { RainbowRibbon } from './types';
import { WindyKiteLogic } from './WindyKiteLogic';
import { WindyKiteRenderer } from './WindyKiteRenderer';

export class WindyKiteScene extends BaseScene {
  public logic: WindyKiteLogic;
  public renderer: WindyKiteRenderer;

  // Forwarded properties for test & state compatibility
  public time: number = 0;
  public get kiteX(): number { return this.logic.kiteX; }
  public get kiteY(): number { return this.logic.kiteY; }
  public get targetKiteX(): number { return this.logic.targetKiteX; }
  public get targetKiteY(): number { return this.logic.targetKiteY; }
  public get ribbons(): RainbowRibbon[] { return this.logic.ribbons; }
  public get ribbonBows(): string[] { return this.logic.ribbonBows; }
  public get collectedCount(): number { return this.logic.collectedCount; }
  public get loopTimer(): number { return this.logic.loopTimer; }

  constructor(game: GameEngine) {
    super(game);
    this.logic = new WindyKiteLogic();
    this.renderer = new WindyKiteRenderer();
  }

  enter(): void {
    super.enter();
    soundEngine.setTrack('gentle');
    const vWidth = this.game.display.vWidth;
    const vHeight = this.game.display.vHeight;
    const isPortrait = this.game.display.isPortrait;
    this.logic.reset(vWidth, vHeight, isPortrait);
    this.syncFromLogic();
    soundEngine.unlock();
  }

  private syncFromLogic(): void {
    this.time = this.logic.time;
    this.score = this.logic.score;
  }

  public swoopKite(tx: number, ty: number, playSound: boolean = true): void {
    const vWidth = this.game.display.vWidth;
    const vHeight = this.game.display.vHeight;
    this.logic.swoopKite(tx, ty, vWidth, vHeight);
    this.syncFromLogic();

    if (playSound) {
      soundEngine.playSFX('whoosh');
      Haptics.medium();
    }
  }

  update(dt: number, input: InputManager): void {
    const vWidth = this.game.display.vWidth;
    const vHeight = this.game.display.vHeight;
    const isPortrait = this.game.display.isPortrait;

    const { collectedRibbon, allCollected } = this.logic.update(dt, vWidth, vHeight, isPortrait);
    this.syncFromLogic();
    this.checkStoryGoal(this.time, 15);

    if (collectedRibbon) {
      this.game.storage.saveHighScore('windyKite', this.score);
      soundEngine.playSFX('bubblePop');
      Haptics.tap();
      this.game.particles.spawnSparkles(collectedRibbon.x, collectedRibbon.y, 8);
    }

    if (allCollected) {
      soundEngine.playSFX('fanfare');
      soundEngine.playSFX('toddlerGiggle');
      Haptics.success();
      this.game.storage.saveHighScore('windyKite', this.score);
      setTimeout(() => {
        this.logic.spawnRibbons(vWidth, vHeight, isPortrait);
      }, 400);
    }

    const handleTap = (x: number, y: number, isJustPressed: boolean) => {
      if (isJustPressed) {
        const hitCloud = this.logic.findHitCloud(x, y);
        if (hitCloud) {
          this.logic.tapCloud(hitCloud);
          soundEngine.playTone(520, 0.16, 'sine', 0.22);
          soundEngine.playSFX('bunnySqueak');
          this.particles.spawnSparkles(hitCloud.x, hitCloud.y, 12);
          this.particles.spawnScorePopup(hitCloud.x, hitCloud.y - 20, 'Baa! Puffy Cloud! ☁️ +20');
          Haptics.tap();
          this.game.storage.saveHighScore('windyKite', this.score);
          return;
        }
      }
      this.swoopKite(x, y, isJustPressed);
    };

    if (input.isActionJustPressed()) {
      handleTap(input.primaryPointer.x, input.primaryPointer.y, true);
    } else if (input.isActionDown()) {
      handleTap(input.primaryPointer.x, input.primaryPointer.y, false);
    } else if (input.actionJustReleased) {
      handleTap(input.primaryPointer.x, input.primaryPointer.y, false);
    }

    for (const ptr of input.pointers.values()) {
      if (ptr.justPressed) {
        handleTap(ptr.x, ptr.y, true);
        break;
      } else if (ptr.isDown) {
        handleTap(ptr.x, ptr.y, false);
        break;
      }
    }
  }

  render(ctx: CanvasRenderingContext2D, _alpha: number, display: DisplayManager): void {
    this.renderer.render(ctx, this.logic, display, this.game.selectedAvatar);
  }

  override getEntities(): Record<string, unknown> {
    return {
      kiteX: this.kiteX,
      kiteY: this.kiteY,
      ribbons: this.ribbons,
      collectedCount: this.collectedCount
    };
  }

  override getModeState(): Record<string, unknown> {
    return {
      score: this.score,
      collectedCount: this.collectedCount,
      ribbonsLeft: this.ribbons.filter(r => !r.collected).length
    };
  }
}
