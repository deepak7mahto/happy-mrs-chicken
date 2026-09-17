/**
 * Mode 2: Muddy Puddles (Puddle Splash Adventure)
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
import { MuddyPuddlesLogic } from './MuddyPuddlesLogic';
import { MuddyPuddlesRenderer } from './MuddyPuddlesRenderer';
import { PuddleEntity, TrishuJumpState } from './types';

export class MuddyPuddlesScene extends BaseScene {
  public time: number = 0;
  public particles: ParticleEngine;
  public animState: CharacterAnimState;
  public logic: MuddyPuddlesLogic;

  constructor(game: GameEngine) {
    super(game);
    this.particles = new ParticleEngine(150);
    this.animState = createCharacterAnimState();
    this.logic = new MuddyPuddlesLogic();
  }

  // Public state proxies for 100% test compatibility
  public get puddles(): PuddleEntity[] { return this.logic.puddles; }
  public set puddles(val: PuddleEntity[]) { this.logic.puddles = val; }

  public get trishu(): TrishuJumpState { return this.logic.trishu; }
  public set trishu(val: TrishuJumpState) { this.logic.trishu = val; }

  public get timer(): number { return this.logic.timer; }
  public set timer(val: number) { this.logic.timer = val; }

  public get splashesCount(): number { return this.logic.splashesCount; }
  public set splashesCount(val: number) { this.logic.splashesCount = val; }

  public get multiplier(): number { return this.logic.multiplier; }
  public set multiplier(val: number) { this.logic.multiplier = val; }

  public get muddyBootsTimer(): number { return this.logic.muddyBootsTimer; }
  public set muddyBootsTimer(val: number) { this.logic.muddyBootsTimer = val; }

  enter(): void {
    soundEngine.setTrack('frenzy');
    this.score = 0;
    this.time = 0;
    this.particles.clear();
    this.animState = createCharacterAnimState();

    const isPortrait = this.game.display.isPortrait;
    const groundY = isPortrait ? this.game.display.vHeight - 150 : this.game.display.vHeight - 90;
    this.logic.reset(this.game.display.vWidth / 2, groundY);
    this.score = this.logic.score;
  }

  exit(): void {
    this.particles.clear();
    if (this.score > 0) {
      this.game.storage.saveHighScore('MUDDY_PUDDLES', this.score);
    }
  }

  spawnPuddle(): void {
    const isPortrait = this.game.display.isPortrait;
    const groundY = isPortrait ? this.game.display.vHeight - 150 : this.game.display.vHeight - 90;
    this.logic.spawnPuddle(undefined, groundY);
  }

  jump(): void {
    this.logic.jump();
    Haptics.tap();
  }

  update(dt: number, input: InputManager): void {
    this.time += dt;
    updateCharacterAnimState(this.animState, dt);

    const isPortrait = this.game.display.isPortrait;
    const groundY = isPortrait ? this.game.display.vHeight - 150 : this.game.display.vHeight - 90;

    // Keyboard controls
    if (input.isKeyDown('ArrowLeft') || input.isKeyDown('KeyA')) {
      this.logic.trishu.vx = -240;
    } else if (input.isKeyDown('ArrowRight') || input.isKeyDown('KeyD')) {
      this.logic.trishu.vx = 240;
    } else if (!this.logic.trishu.isJumping) {
      this.logic.trishu.vx = 0;
    }

    // Touch inputs: smooth leap arc toward finger position (no teleportation!)
    if (input.isActionJustPressed()) {
      const p = input.primaryPointer;
      if (p.inside && p.y > 80) {
        this.logic.jump(p.x);
      } else {
        this.jump();
      }
    } else {
      for (const ptr of input.pointers.values()) {
        if (ptr.justPressed && ptr.inside && ptr.y > 80) {
          this.logic.jump(ptr.x);
          break;
        }
      }
    }

    // Run game logic simulation
    this.logic.update(dt, groundY, this.game.display.vWidth, {
      onPuddleHit: (pud, earned, multi) => {
        this.checkStoryGoal(this.logic.splashesCount);

        if (pud.type === 'GOLDEN' || this.logic.splashesCount % 10 === 0) {
          this.particles.spawnSparkles(pud.x, pud.y, 14);
          this.particles.spawnConfetti(pud.x, pud.y - 40, 16);
          soundEngine.playSFX('fanfare');
        }

        this.particles.spawnMudSplash(pud.x, pud.y, 22, pud.type === 'GOLDEN');
        this.particles.spawnScorePopup(
          pud.x,
          pud.y - 30,
          `+${earned}${multi > 1 ? ` (x${multi})` : ''}`
        );
        soundEngine.playSFX('splash');
        soundEngine.playSFX('toddlerGiggle');
        Haptics.heavy();
        this.score = this.logic.score;
        this.game.storage.saveHighScore('MUDDY_PUDDLES', this.score);
      },
      onScreenSplat: () => {
        soundEngine.playSFX('eggPop');
        soundEngine.playSFX('toddlerGiggle');
        Haptics.medium();
      },
      onGroundStomp: (gx, gy) => {
        this.particles.spawnMudSplash(gx, gy, 8, false);
        soundEngine.playSFX('splash');
        this.score = this.logic.score;
      }
    });

    this.score = this.logic.score;
    this.animState.jumpY = this.logic.trishu.jumpY;
    this.animState.squash = this.logic.trishu.squish;
    this.particles.update(dt);
  }

  render(ctx: CanvasRenderingContext2D, _alpha: number, display: DisplayManager): void {
    MuddyPuddlesRenderer.renderScene(
      ctx,
      display,
      this.time,
      this.logic.trishu,
      this.animState,
      this.logic.puddles,
      this.logic.footprints,
      this.logic.muddyBootsTimer,
      this.game.selectedAvatar,
      this.score,
      this.logic.multiplier,
      this.logic.screenSplats
    );

    this.particles.render(ctx);
  }
}
