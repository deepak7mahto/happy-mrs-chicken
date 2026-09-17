/**
 * Mode 15: Rainbow Flower Garden
 * Adventures of Trishu — Modular Architecture
 * Strictly under 200 Lines of Code
 */

import { BaseScene } from '../base/BaseScene';
import { GameEngine } from '../../engine/GameEngine';
import { InputManager } from '../../engine/InputManager';
import { DisplayManager } from '../../engine/DisplayManager';
import { soundEngine } from '../../engine/SoundEngine';
import { Haptics } from '../../engine/Haptics';
import { RainbowGardenLogic } from './RainbowGardenLogic';
import { RainbowGardenRenderer } from './RainbowGardenRenderer';
import { FlowerMound } from './types';

export class RainbowGardenScene extends BaseScene {
  public time: number = 0;
  public logic: RainbowGardenLogic;

  constructor(game: GameEngine) {
    super(game);
    this.logic = new RainbowGardenLogic();
  }

  // Public state proxies for 100% test compatibility
  public get mounds(): FlowerMound[] { return this.logic.mounds; }
  public set mounds(val: FlowerMound[]) { this.logic.mounds = val; }

  public get totalBloomed(): number { return this.logic.totalBloomed; }
  public set totalBloomed(val: number) { this.logic.totalBloomed = val; }

  enter(): void {
    soundEngine.setTrack('gentle');
    this.time = 0;
    this.logic.reset(this.game.display.vWidth, this.game.display.vHeight);
    this.score = this.logic.score;
    soundEngine.unlock();
  }

  exit(): void {
    if (this.score > 0) {
      this.game.storage.saveHighScore('rainbowGarden', this.score);
    }
  }

  waterMound(mound: FlowerMound): void {
    this.logic.waterMound(mound, {
      onPetalTickle: (px, py) => {
        soundEngine.playSFX('bunnySqueak');
        Haptics.tap();
        this.game.particles.spawnSparkles(px, py - 60, 6);
      },
      onWaterSprayed: (wx, wy) => {
        soundEngine.playSFX('splash');
        Haptics.tap();
      },
      onFlowerBloomed: (m) => {
        this.checkStoryGoal(this.logic.totalBloomed);
        this.score = this.logic.score;
        this.game.storage.saveHighScore('rainbowGarden', this.score);
        soundEngine.playSFX('veggiePop');
        this.game.particles.spawnSparkles(m.x, m.y - 50, 10);
      },
      onAllBloomed: () => {
        this.score = this.logic.score;
        this.game.storage.saveHighScore('rainbowGarden', this.score);
        soundEngine.playSFX('fanfare');
        soundEngine.playSFX('toddlerGiggle');
        Haptics.success();
      }
    });

    this.score = this.logic.score;
  }

  update(dt: number, input: InputManager): void {
    this.time += dt;
    this.logic.update(dt, this.time);
    this.score = this.logic.score;

    const checkTap = (x: number, y: number) => {
      for (const m of this.logic.mounds) {
        if (Math.hypot(x - m.x, y - m.y) <= 55 || (Math.abs(x - m.x) < 45 && y > m.y - 90)) {
          this.waterMound(m);
          return;
        }
      }
      // Tap anywhere else to water closest mound
      let closest = this.logic.mounds[0];
      let minDist = Infinity;
      for (const m of this.logic.mounds) {
        const d = Math.abs(x - m.x);
        if (d < minDist) {
          minDist = d;
          closest = m;
        }
      }
      if (closest) {
        this.waterMound(closest);
      }
    };

    if (input.actionJustReleased) {
      checkTap(input.primaryPointer.x, input.primaryPointer.y);
    }
    for (const ptr of input.pointers.values()) {
      if (ptr.justPressed) {
        checkTap(ptr.x, ptr.y);
        break;
      }
    }
  }

  render(ctx: CanvasRenderingContext2D, _alpha: number, display: DisplayManager): void {
    RainbowGardenRenderer.renderScene(
      ctx,
      display,
      this.time,
      this.logic.mounds,
      this.logic.butterflies,
      this.logic.wateringCanX,
      this.logic.isWatering,
      this.logic.rainbowTimer,
      this.logic.totalBloomed,
      this.score
    );
  }
}
