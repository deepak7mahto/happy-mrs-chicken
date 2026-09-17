/**
 * Mode 4: Dad's Kitchen Dash (Sandwich Tower Dash)
 * Adventures of Trishu — Modular Architecture
 * Strictly under 200 Lines of Code
 */

import { BaseScene } from '../base/BaseScene';
import { GameEngine } from '../../engine/GameEngine';
import { InputManager } from '../../engine/InputManager';
import { DisplayManager } from '../../engine/DisplayManager';
import { ParticleEngine } from '../../engine/ParticleEngine';
import { soundEngine } from '../../engine/SoundEngine';
import { Haptics } from '../../engine/Haptics';
import { DadKitchenLogic } from './DadKitchenLogic';
import { DadKitchenRenderer } from './DadKitchenRenderer';

export class DadKitchenScene extends BaseScene {
  public time: number = 0;
  public particles: ParticleEngine;
  public logic: DadKitchenLogic;

  constructor(game: GameEngine) {
    super(game);
    this.particles = new ParticleEngine(150);
    this.logic = new DadKitchenLogic();
  }

  // Public state proxies for 100% test compatibility
  public get fever(): number { return this.logic.fever; }
  public set fever(val: number) { this.logic.fever = val; }

  public get timer(): number { return this.logic.timer; }
  public set timer(val: number) { this.logic.timer = val; }

  public get multiplier(): number { return this.logic.multiplier; }
  public set multiplier(val: number) { this.logic.multiplier = val; }

  public get itemsStacked(): number { return this.logic.itemsStacked; }
  public set itemsStacked(val: number) { this.logic.itemsStacked = val; }

  public get celebrationTimer(): number { return this.logic.celebrationTimer; }
  public set celebrationTimer(val: number) { this.logic.celebrationTimer = val; }

  public get isOverheating(): boolean { return this.logic.isOverheating; }
  public set isOverheating(val: boolean) { this.logic.isOverheating = val; }

  enter(): void {
    super.enter();
    soundEngine.setTrack('frenzy');
    this.time = 0;
    this.particles.clear();
    this.logic.reset();
    this.score = this.logic.score;
  }

  exit(): void {
    this.particles.clear();
    if (this.score > 0) {
      this.game.storage.saveHighScore('daddyPig', this.score);
    }
  }

  tap(): void {
    const isPortrait = this.game.display.isPortrait;
    const dadX = isPortrait ? this.game.display.vWidth / 2 : this.game.display.vWidth * 0.72;
    const dadY = isPortrait ? this.game.display.vHeight * 0.38 : 240;

    this.logic.tap({
      onIngredientAdded: (layer, earned) => {
        this.checkStoryGoal(this.logic.itemsStacked, 6);
        if (layer.type === 'RUBBER_DUCK') {
          soundEngine.playSFX('bunnySqueak');
        } else if (layer.type === 'TOY_DINO') {
          soundEngine.playSFX('dinoBite');
        } else if (layer.type === 'GOLDEN_CROWN') {
          soundEngine.playSFX('fanfare');
        } else {
          soundEngine.playSFX('eggPop');
        }
        Haptics.tap();

        if (this.logic.fever >= 60) {
          this.particles.spawnSparkles(dadX, dadY - 20, 4);
        }
      },
      onFeastCelebration: () => {
        soundEngine.playSFX('coneMunch');
        soundEngine.playSFX('fanfare');
        soundEngine.playSFX('toddlerGiggle');
        Haptics.fanfare();
        this.particles.spawnConfetti(dadX, dadY, 35);
        this.particles.spawnSparkles(dadX, dadY - 40, 18);
        this.game.storage.saveHighScore('daddyPig', this.score);
      }
    });

    this.score = this.logic.score;
  }

  update(dt: number, input: InputManager): void {
    this.time += dt;
    this.logic.update(dt);
    this.score = this.logic.score;

    if (input.isActionJustPressed()) {
      this.tap();
    }

    this.particles.update(dt);
  }

  render(ctx: CanvasRenderingContext2D, _alpha: number, display: DisplayManager): void {
    DadKitchenRenderer.renderScene(
      ctx,
      display,
      this.time,
      this.logic.fever,
      this.logic.multiplier,
      this.logic.layers,
      this.logic.celebrationTimer,
      this.game.selectedAvatar,
      this.score
    );

    this.particles.render(ctx);
  }
}
