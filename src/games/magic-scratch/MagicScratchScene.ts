/**
 * Magic Scratch-to-Reveal Scene
 * Adventures of Trishu Preschool Suite
 */

import { BaseScene } from '../base/BaseScene';
import { GameEngine } from '../../engine/GameEngine';
import { InputManager } from '../../engine/InputManager';
import { DisplayManager } from '../../engine/DisplayManager';
import { ParticleEngine } from '../../engine/ParticleEngine';
import { soundEngine } from '../../engine/SoundEngine';
import { voiceNarrator } from '../../engine/audio';
import { Haptics } from '../../engine/Haptics';
import { MagicScratchLogic } from './MagicScratchLogic';
import { MagicScratchRenderer } from './MagicScratchRenderer';

export class MagicScratchScene extends BaseScene {
  public logic: MagicScratchLogic;
  public renderer: MagicScratchRenderer;
  public particles: ParticleEngine;
  public time: number = 0;
  private isScratching: boolean = false;

  constructor(game: GameEngine) {
    super(game);
    this.logic = new MagicScratchLogic();
    this.renderer = new MagicScratchRenderer();
    this.particles = new ParticleEngine(90);
  }

  public enter(): void {
    super.enter();
    this.time = 0;
    this.isScratching = false;
    this.particles.clear();
    const w = this.game.display ? this.game.display.vWidth : 960;
    const h = this.game.display ? this.game.display.vHeight : 540;
    this.logic.reset(w, h);
    soundEngine.setTrack('waltz');
    voiceNarrator.speak('Magic Scratch! Rub the screen to reveal the rainbow picture!');
  }

  public exit(): void {
    if (this.score > 0) {
      this.game.storage.saveHighScore('MAGIC_SCRATCH', this.score);
    }
    super.exit();
  }

  public update(dt: number, input: InputManager): void {
    this.time += dt;
    const w = this.game.display ? this.game.display.vWidth : 960;
    const h = this.game.display ? this.game.display.vHeight : 540;
    this.logic.layout(w, h);

    const pos = input.getPointerPos();
    const barY = h - 72;

    if (input.wasJustPressed()) {
      if (pos.y >= barY) {
        if (pos.x >= 38 && pos.x <= 148) {
          this.logic.resetCard();
          soundEngine.playSFX('bubblePop');
          Haptics.tap();
        } else if (pos.x >= w - 158 && pos.x <= w - 38) {
          this.logic.nextPicture();
          soundEngine.playSFX('click');
          Haptics.tap();
        }
      } else {
        this.isScratching = true;
        const wasDone = this.logic.isCompleted;
        if (this.logic.startScratch(pos.x, pos.y)) {
          this.onScratchProgress(pos.x, pos.y, !wasDone && this.logic.isCompleted);
        }
      }
    } else if (input.isPointerDown() && this.isScratching && pos.y < barY) {
      const wasDone = this.logic.isCompleted;
      if (this.logic.moveScratch(pos.x, pos.y)) {
        this.onScratchProgress(pos.x, pos.y, !wasDone && this.logic.isCompleted);
      }
    } else if (this.isScratching && !input.isPointerDown()) {
      this.isScratching = false;
      this.logic.endScratch();
    }

    this.logic.update(dt);
    this.particles.update(dt);
  }

  private onScratchProgress(x: number, y: number, justCompleted: boolean): void {
    this.score = this.logic.score;
    this.particles.spawnSparkles(x, y, justCompleted ? 24 : 3);
    if (justCompleted) {
      soundEngine.playSFX('fanfare');
      Haptics.medium();
      voiceNarrator.speak('Hooray! You revealed the magic picture!');
      this.game.storage.saveHighScore('MAGIC_SCRATCH', this.score);
      this.checkStoryGoal(this.logic.totalRevealedPictures, 1);
    }
  }

  public render(ctx: CanvasRenderingContext2D, _alpha: number, display: DisplayManager): void {
    this.renderer.render(ctx, this.logic, display.vWidth, display.vHeight, this.time);
    this.particles.render(ctx);
  }

  public override getEntities(): Record<string, unknown> {
    return {
      picture: this.logic.activePicture,
      revealPercent: this.logic.revealPercent
    };
  }

  public override getModeState(): Record<string, unknown> {
    return {
      score: this.score,
      revealPercent: this.logic.revealPercent,
      isCompleted: this.logic.isCompleted,
      pictureIndex: this.logic.pictureIndex
    };
  }
}
