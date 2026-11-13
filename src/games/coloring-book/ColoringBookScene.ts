/**
 * Coloring Book Game Scene
 * Standalone Tap-to-Fill & Crayon Coloring Book
 * Reuses shared ColoringLogic & ColoringRenderer
 */

import { BaseScene } from '../base/BaseScene';
import { GameEngine } from '../../engine/GameEngine';
import { InputManager } from '../../engine/InputManager';
import { DisplayManager } from '../../engine/DisplayManager';
import { ParticleEngine } from '../../engine/ParticleEngine';
import { soundEngine } from '../../engine/SoundEngine';
import { voiceNarrator } from '../../engine/audio';
import { Haptics } from '../../engine/Haptics';
import { ColoringLogic } from '../studio/coloring/ColoringLogic';
import { ColoringRenderer } from '../studio/coloring/ColoringRenderer';
import { CRAYON_PALETTE } from '../studio/coloring/ColoringSheets';

export class ColoringBookScene extends BaseScene {
  public logic: ColoringLogic;
  public renderer: ColoringRenderer;
  public particles: ParticleEngine;
  public time: number = 0;
  private isDrawing: boolean = false;
  private regionsColoredCount: number = 0;

  constructor(game: GameEngine) {
    super(game);
    this.logic = new ColoringLogic();
    this.renderer = new ColoringRenderer();
    this.particles = new ParticleEngine(80);
  }

  public enter(): void {
    super.enter();
    this.time = 0;
    this.isDrawing = false;
    this.regionsColoredCount = 0;
    this.particles.clear();
    this.logic.setToolMode('crayon');
    const w = this.game.display ? this.game.display.vWidth : 960;
    const h = this.game.display ? this.game.display.vHeight : 540;
    this.logic.layout(w, h);
    soundEngine.setTrack('waltz');
    voiceNarrator.speak('Coloring Book! Pick a crayon and tap to color!');
  }

  public exit(): void {
    this.logic.saveCurrentSheet();
    if (this.score > 0) {
      this.game.storage.saveHighScore('COLORING_BOOK', this.score);
    }
    super.exit();
  }

  public update(dt: number, input: InputManager): void {
    this.time += dt;
    const w = this.game.display ? this.game.display.vWidth : 960;
    const h = this.game.display ? this.game.display.vHeight : 540;
    if (this.logic.width !== w || this.logic.height !== h) {
      this.logic.layout(w, h);
    }

    const pos = input.getPointerPos();

    if (input.wasJustPressed()) {
      const action = this.renderer.getTappedAction(pos.x, pos.y, w, h);
      if (action === 'toggle') {
        const nextMode = this.logic.toolMode === 'magic' ? 'crayon' : 'magic';
        this.logic.setToolMode(nextMode);
        soundEngine.playSFX('click');
        Haptics.tap();
      } else if (action === 'prevSheet') {
        this.logic.prevSheet();
        soundEngine.playSFX('click');
        Haptics.tap();
      } else if (action === 'nextSheet') {
        this.logic.nextSheet();
        soundEngine.playSFX('click');
        Haptics.tap();
      } else if (action === 'undo') {
        if (this.logic.undo()) {
          soundEngine.playSFX('click');
          Haptics.tap();
        }
      } else if (action === 'clear') {
        this.logic.clearSheet();
        soundEngine.playSFX('bubblePop');
        Haptics.medium();
      } else if (typeof action === 'number' && action >= 0 && this.logic.toolMode === 'crayon') {
        this.logic.setColor(CRAYON_PALETTE[action]);
        soundEngine.playSFX('click');
        Haptics.tap();
      } else if (pos.y < h - 80) {
        const filled = this.logic.handleTap(pos.x, pos.y);
        if (filled) {
          this.onRegionColored(pos.x, pos.y);
        }
        if (this.logic.toolMode === 'crayon') {
          this.isDrawing = true;
          this.logic.startStroke(pos.x, pos.y);
        }
      }
    } else if (input.isPointerDown()) {
      if (this.logic.toolMode === 'magic' && pos.y < h - 80) {
        if (this.logic.handleTouchMove(pos.x, pos.y)) {
          this.onRegionColored(pos.x, pos.y);
        }
      } else if (this.isDrawing && this.logic.toolMode === 'crayon' && pos.y < h - 80) {
        this.logic.addStrokePoint(pos.x, pos.y);
      }
    } else if (this.isDrawing) {
      this.isDrawing = false;
      this.logic.endStroke();
    }

    this.particles.update(dt);
  }

  private onRegionColored(x: number, y: number): void {
    this.score += 10;
    this.regionsColoredCount++;
    soundEngine.playSFX('paintSplat');
    Haptics.tap();
    this.particles.spawnSparkles(x, y, 10);
    this.game.storage.saveHighScore('COLORING_BOOK', this.score);
    this.checkStoryGoal(this.regionsColoredCount, 6);
  }

  public render(ctx: CanvasRenderingContext2D, _alpha: number, display: DisplayManager): void {
    this.renderer.render(ctx, this.logic, display.vWidth, display.vHeight, this.time);
    this.particles.render(ctx);
  }

  public override getEntities(): Record<string, unknown> {
    return {
      filledRegions: this.logic.filledRegions,
      strokes: this.logic.strokes
    };
  }

  public override getModeState(): Record<string, unknown> {
    return {
      score: this.score,
      sheetIndex: this.logic.sheetIndex,
      toolMode: this.logic.toolMode,
      regionsColoredCount: this.regionsColoredCount
    };
  }
}
