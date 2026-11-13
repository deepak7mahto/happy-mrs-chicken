/**
 * Color-by-Shape Scene
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
import { ColorByShapeLogic } from './ColorByShapeLogic';
import { ColorByShapeRenderer } from './ColorByShapeRenderer';

export class ColorByShapeScene extends BaseScene {
  public logic: ColorByShapeLogic;
  public renderer: ColorByShapeRenderer;
  public particles: ParticleEngine;
  public time: number = 0;

  constructor(game: GameEngine) {
    super(game);
    this.logic = new ColorByShapeLogic();
    this.renderer = new ColorByShapeRenderer();
    this.particles = new ParticleEngine(90);
  }

  public enter(): void {
    super.enter();
    this.time = 0;
    this.particles.clear();
    const w = this.game.display ? this.game.display.vWidth : 960;
    const h = this.game.display ? this.game.display.vHeight : 540;
    this.logic.layout(w, h);
    this.logic.resetPicture();
    soundEngine.setTrack('waltz');
    voiceNarrator.speak('Shape Painter! Pick a shape color and tap the matching shape!');
  }

  public exit(): void {
    if (this.score > 0) {
      this.game.storage.saveHighScore('COLOR_BY_SHAPE', this.score);
    }
    super.exit();
  }

  public update(dt: number, input: InputManager): void {
    this.time += dt;
    const w = this.game.display ? this.game.display.vWidth : 960;
    const h = this.game.display ? this.game.display.vHeight : 540;
    this.logic.layout(w, h);

    if (input.wasJustPressed()) {
      const pos = input.getPointerPos();
      const pot = this.renderer.getTappedPot(pos.x, pos.y, w, h);
      if (pot === 'next') {
        this.logic.nextPicture();
        soundEngine.playSFX('click');
        Haptics.tap();
      } else if (pot) {
        this.logic.selectedKind = pot;
        soundEngine.playSFX('click');
        Haptics.tap();
      } else {
        const res = this.logic.tryTapPiece(pos.x, pos.y);
        if (res.hit && res.matched) {
          this.score = this.logic.score;
          soundEngine.playSFX('paintSplat');
          Haptics.tap();
          this.particles.spawnSparkles(pos.x, pos.y, 12);
          if (this.logic.isCompleted) {
            soundEngine.playSFX('fanfare');
            Haptics.medium();
            this.particles.spawnSparkles(w / 2, h / 2, 24);
            voiceNarrator.speak('Awesome! You colored the whole picture!');
          }
          this.game.storage.saveHighScore('COLOR_BY_SHAPE', this.score);
          this.checkStoryGoal(this.logic.totalShapesColored, 6);
        } else if (res.hit) {
          soundEngine.playSFX('click');
          Haptics.tap();
        }
      }
    }

    this.logic.update(dt);
    this.particles.update(dt);
  }

  public render(ctx: CanvasRenderingContext2D, _alpha: number, display: DisplayManager): void {
    this.renderer.render(ctx, this.logic, display.vWidth, display.vHeight, this.time);
    this.particles.render(ctx);
  }

  public override getEntities(): Record<string, unknown> {
    return {
      pieces: this.logic.pieces,
      selectedKind: this.logic.selectedKind
    };
  }

  public override getModeState(): Record<string, unknown> {
    return {
      score: this.score,
      pictureIndex: this.logic.pictureIndex,
      isCompleted: this.logic.isCompleted,
      totalShapesColored: this.logic.totalShapesColored
    };
  }
}
