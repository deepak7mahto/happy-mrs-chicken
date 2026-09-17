/**
 * Mode 16: Picnic Ducks (Feed the Ducks & Celebration Dance)
 * Adventures of Trishu — Modular Architecture
 * Strictly under 200 Lines of Code
 */

import { BaseScene } from '../base/BaseScene';
import { GameEngine } from '../../engine/GameEngine';
import { InputManager } from '../../engine/InputManager';
import { DisplayManager } from '../../engine/DisplayManager';
import { DuckEntity, PicnicFoodEntity, PicnicFoodType } from '../../types/game';
import { ParticleEngine } from '../../engine/ParticleEngine';
import { soundEngine } from '../../engine/SoundEngine';
import { Haptics } from '../../engine/Haptics';
import { DuckPicnicLogic } from './DuckPicnicLogic';
import {
  renderPicnicEnvironment,
  renderPicnicBlanketAndBasket,
  renderPicnicFoods,
  renderPicnicDucks
} from './duckPicnicRenderer';

export class DuckPicnicScene extends BaseScene {
  public time: number = 0;
  public particles: ParticleEngine;
  public logic: DuckPicnicLogic;

  constructor(game: GameEngine) {
    super(game);
    this.particles = new ParticleEngine(150);
    this.logic = new DuckPicnicLogic();
  }

  // Public state proxies for 100% test compatibility
  public get ducks(): DuckEntity[] { return this.logic.ducks; }
  public set ducks(val: DuckEntity[]) { this.logic.ducks = val; }

  public get foods(): PicnicFoodEntity[] { return this.logic.foods; }
  public set foods(val: PicnicFoodEntity[]) { this.logic.foods = val; }

  public get round(): number { return this.logic.round; }
  public set round(val: number) { this.logic.round = val; }

  public get isDancing(): boolean { return this.logic.isDancing; }
  public set isDancing(val: boolean) { this.logic.isDancing = val; }

  public get danceTimer(): number { return this.logic.danceTimer; }
  public set danceTimer(val: number) { this.logic.danceTimer = val; }

  public get nextFoodId(): number { return this.logic.nextFoodId; }
  public set nextFoodId(val: number) { this.logic.nextFoodId = val; }

  public get basketBounce(): number { return this.logic.basketBounce; }
  public set basketBounce(val: number) { this.logic.basketBounce = val; }

  public get foodsFedCount(): number { return this.logic.foodsFedCount; }
  public set foodsFedCount(val: number) { this.logic.foodsFedCount = val; }

  enter(): void {
    soundEngine.setTrack('waltz');
    this.time = 0;
    this.particles.clear();
    this.logic.reset(this.game.display.vWidth, this.game.display.vHeight, this.game.display.isPortrait);
    this.score = this.logic.score;
  }

  exit(): void {
    this.particles.clear();
    if (this.score > 0) {
      this.game.storage.saveHighScore('duckPicnic', this.score);
    }
  }

  public tossFood(targetX: number, targetY: number, type: PicnicFoodType = 'BREAD_CRUMB'): void {
    this.logic.tossFood(targetX, targetY, type, {
      onFoodTossed: () => {
        soundEngine.playSFX('eggPop');
        Haptics.tap();
      }
    });
  }

  public flingFromBasket(): void {
    const isPortrait = this.game.display.isPortrait;
    const vWidth = this.game.display.vWidth;
    const vHeight = this.game.display.vHeight;
    const basketPos = isPortrait ? { x: vWidth * 0.5, y: vHeight * 0.42 } : { x: vWidth * 0.32, y: vHeight * 0.42 };

    this.logic.flingFromBasket(vWidth, vHeight, isPortrait, {
      onFoodTossed: () => {
        this.particles.spawnSparkles(basketPos.x, basketPos.y, 8);
        soundEngine.playSFX('whoosh');
        Haptics.medium();
      }
    });
  }

  update(dt: number, input: InputManager): void {
    this.time += dt;

    const isPortrait = this.game.display.isPortrait;
    const vWidth = this.game.display.vWidth;
    const vHeight = this.game.display.vHeight;
    const basketPos = isPortrait ? { x: vWidth * 0.5, y: vHeight * 0.42 } : { x: vWidth * 0.32, y: vHeight * 0.42 };
    const blanketPos = isPortrait ? { x: vWidth * 0.5, y: vHeight * 0.48 } : { x: vWidth * 0.34, y: vHeight * 0.50 };

    // Input Handling
    if (input.isActionJustPressed()) {
      const p = input.primaryPointer;
      if (p.inside && p.y > 60) {
        const dxBasket = p.x - basketPos.x;
        const dyBasket = p.y - basketPos.y;
        if (Math.hypot(dxBasket, dyBasket) < 55) {
          this.flingFromBasket();
        } else {
          const clampedY = Math.max(vHeight * 0.45, Math.min(vHeight - 70, p.y));
          this.tossFood(p.x, clampedY, 'BREAD_CRUMB');
        }
      }
    }

    // Step pure duck logic simulation
    this.logic.update(dt, this.time, vWidth, vHeight, isPortrait, {
      onDuckFed: (duck, food) => {
        this.checkStoryGoal(this.logic.foodsFedCount);
        this.score = this.logic.score;
        this.game.storage.saveHighScore('duckPicnic', this.score);

        soundEngine.playSFX('duckQuack', { pitch: duck.id === 2 ? 1.4 : (duck.id === 1 ? 1.1 : 0.9) });
        this.particles.spawnSparkles(duck.x, duck.y - 15, 8);
        this.particles.spawnScorePopup(duck.x, duck.y - 30, `+${food.points} Quack! 🦆`);
      },
      onDanceCelebration: () => {
        this.score = this.logic.score;
        this.game.storage.saveHighScore('duckPicnic', this.score);
        soundEngine.playDuckFanfare();
        soundEngine.playSFX('toddlerGiggle');
        Haptics.fanfare();
        this.particles.spawnConfetti(vWidth / 2, vHeight * 0.5, 40);
        this.particles.spawnSparkles(vWidth / 2, vHeight * 0.5, 25);
        this.particles.spawnScorePopup(vWidth / 2, vHeight * 0.4, '🎉 DUCK PICNIC DANCE! +250');
      }
    });

    this.score = this.logic.score;
    this.particles.update(dt);
  }

  render(ctx: CanvasRenderingContext2D, _alpha: number, display: DisplayManager): void {
    const isPortrait = display.isPortrait;
    const vWidth = display.vWidth;
    const vHeight = display.vHeight;
    const basketPos = isPortrait ? { x: vWidth * 0.5, y: vHeight * 0.42 } : { x: vWidth * 0.32, y: vHeight * 0.42 };
    const blanketPos = isPortrait ? { x: vWidth * 0.5, y: vHeight * 0.48 } : { x: vWidth * 0.34, y: vHeight * 0.50 };

    const bW = isPortrait ? vWidth * 0.72 : vWidth * 0.46;
    const bH = isPortrait ? 130 : 150;
    const hasFood = this.logic.foods.some(f => !f.eaten);

    renderPicnicEnvironment(ctx, vWidth, vHeight, isPortrait);
    renderPicnicBlanketAndBasket(
      ctx,
      blanketPos,
      basketPos,
      bW,
      bH,
      this.logic.basketBounce,
      this.time,
      hasFood,
      this.logic.isDancing
    );
    renderPicnicFoods(ctx, this.logic.foods);
    renderPicnicDucks(ctx, this.logic.ducks, this.logic.isDancing);
    this.particles.render(ctx);

    // Score HUD
    ctx.save();
    const pillX = vWidth - 85;
    const pillY = 32;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
    ctx.strokeStyle = '#F57C00';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(pillX - 60, pillY - 17, 120, 34, 17);
    ctx.fill();
    ctx.stroke();

    ctx.font = '900 15px "Fredoka", "Quicksand", sans-serif';
    ctx.fillStyle = '#E65100';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`🦆 R${this.logic.round} • ${this.score}`, pillX, pillY);
    ctx.restore();
  }
}
