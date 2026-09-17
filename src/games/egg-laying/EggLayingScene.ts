/**
 * Mode 1: Happy Mrs Clucky (Classic Egg-Laying Mode)
 * Adventures of Trishu — Modular Architecture
 * Strictly under 200 Lines of Code
 */

import { BaseScene } from '../base/BaseScene';
import { GameEngine } from '../../engine/GameEngine';
import { InputManager } from '../../engine/InputManager';
import { DisplayManager } from '../../engine/DisplayManager';
import { CharacterAnimState } from '../../types/characters';
import { ParticleEngine } from '../../engine/ParticleEngine';
import { soundEngine } from '../../engine/SoundEngine';
import { Haptics } from '../../engine/Haptics';
import { createCharacterAnimState, updateCharacterAnimState } from '../../graphics/animations';
import { EggLayingLogic } from './EggLayingLogic';
import { EggLayingRenderer } from './EggLayingRenderer';
import { EggEntity, ChickEntity, ChickenState } from './types';

export class EggLayingScene extends BaseScene {
  public time: number = 0;
  public particles: ParticleEngine;
  public animState: CharacterAnimState;
  public logic: EggLayingLogic;

  constructor(game: GameEngine) {
    super(game);
    this.particles = new ParticleEngine(150);
    this.animState = createCharacterAnimState();
    this.logic = new EggLayingLogic();
  }

  // Public state proxies for 100% test and external compatibility
  public get eggs(): EggEntity[] { return this.logic.eggs; }
  public set eggs(val: EggEntity[]) { this.logic.eggs = val; }

  public get chicks(): ChickEntity[] { return this.logic.chicks; }
  public set chicks(val: ChickEntity[]) { this.logic.chicks = val; }

  public get chicken(): ChickenState { return this.logic.chicken; }
  public set chicken(val: ChickenState) { this.logic.chicken = val; }

  enter(): void {
    soundEngine.setTrack('classic');
    this.particles.clear();
    this.time = 0;
    this.score = 0;
    this.animState = createCharacterAnimState();

    const isPortrait = this.game.display.isPortrait;
    const startX = this.game.display.vWidth / 2;
    const startY = isPortrait ? 220 : 160;
    this.logic.reset(startX, startY);
    this.score = this.logic.score;
  }

  exit(): void {
    this.particles.clear();
    if (this.score > 0) {
      this.game.storage.saveHighScore('EGG_LAYING', this.score);
    }
  }

  layEggAt(x: number, y: number): void {
    const isGolden = this.logic.layEggAt(x, y, {
      onEggLaid: (ex, ey, golden) => {
        if (golden) {
          soundEngine.playSFX('fanfare');
          this.particles.spawnSparkles(ex, ey, 14);
          this.particles.spawnConfetti(ex, ey - 20, 15);
        } else {
          soundEngine.playSFX('cluck');
          soundEngine.playSFX('eggPop');
        }
        Haptics.tap();
        this.particles.spawnFeathers(ex, ey, 4);

        if (this.score > 0 && this.score % 10 === 0) {
          soundEngine.playSFX('toddlerGiggle');
          this.particles.spawnSparkles(ex, ey, 16);
          this.particles.spawnConfetti(ex, ey - 30, 25);
        }
      }
    });

    this.score = this.logic.score;

    if (isGolden) {
      this.game.storage.saveHighScore('EGG_LAYING', this.score);
    }
  }

  pickRandomRoamTarget(): void {
    const isPortrait = this.game.display.isPortrait;
    const groundY = isPortrait ? this.game.display.vHeight - 140 : this.game.display.vHeight - 80;
    this.chicken.targetX = 70 + Math.random() * (this.game.display.vWidth - 140);
    this.chicken.targetY = 80 + Math.random() * (groundY - 170);
  }

  update(dt: number, input: InputManager): void {
    this.time += dt;
    updateCharacterAnimState(this.animState, dt);

    const isPortrait = this.game.display.isPortrait;
    const groundY = isPortrait ? this.game.display.vHeight - 140 : this.game.display.vHeight - 80;

    // Toddler Tap to fly & lay eggs wherever touched
    if (input.isActionJustPressed()) {
      const ptr = input.primaryPointer;
      if (ptr && ptr.inside && ptr.y > 60) {
        const tx = Math.max(50, Math.min(this.game.display.vWidth - 50, ptr.x));
        const ty = Math.max(80, Math.min(groundY - 80, ptr.y - 20));
        this.logic.registerUserTap(tx, ty);
        this.layEggAt(tx, ty);
      } else {
        this.layEggAt(this.chicken.x, this.chicken.y);
      }
    }

    // Step pure game logic simulation
    this.logic.update(dt, this.time, groundY, this.game.display.vWidth, this.game.display.vHeight, {
      onEggCrack: () => {
        soundEngine.playSFX('crack');
      },
      onEggHatch: (hx, hy) => {
        this.particles.spawnEggCrack(hx, hy, 8);
        soundEngine.playSFX('hatch');
        soundEngine.playSFX('toddlerGiggle');
        Haptics.heavy();
        this.particles.spawnSparkles(hx, hy, 12);
        this.score = this.logic.score;
        this.checkStoryGoal(this.logic.totalChicksHatched);
        this.game.storage.saveHighScore('EGG_LAYING', this.score);
      }
    });

    this.score = this.logic.score;

    this.animState.facingLeft = this.chicken.facingLeft;
    this.animState.armWave = this.chicken.flap;
    this.particles.update(dt);
  }

  render(ctx: CanvasRenderingContext2D, _alpha: number, display: DisplayManager): void {
    EggLayingRenderer.renderScene(
      ctx,
      display,
      this.time,
      this.chicken,
      this.animState,
      this.eggs,
      this.chicks,
      this.game.selectedAvatar,
      this.score
    );

    this.particles.render(ctx);
  }
}
