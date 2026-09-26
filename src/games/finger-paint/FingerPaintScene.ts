/**
 * Mode 19: Rainbow Splat & Stamp Studio - Scene Coordinator
 * Adventures of Trishu Preschool Suite
 * Strictly under 500 lines
 */

import { BaseScene } from '../base/BaseScene';
import { GameEngine } from '../../engine/GameEngine';
import { InputManager } from '../../engine/InputManager';
import { DisplayManager } from '../../engine/DisplayManager';
import { ParticleEngine } from '../../engine/ParticleEngine';
import { soundEngine } from '../../engine/SoundEngine';
import { voiceNarrator } from '../../engine/audio';
import { Haptics } from '../../engine/Haptics';
import { FingerPaintLogic } from './FingerPaintLogic';
import { FingerPaintRenderer } from './FingerPaintRenderer';

export class FingerPaintScene extends BaseScene {
  public logic: FingerPaintLogic;
  public renderer: FingerPaintRenderer;
  public particles: ParticleEngine;

  constructor(game: GameEngine) {
    super(game);
    this.logic = new FingerPaintLogic();
    this.renderer = new FingerPaintRenderer();
    this.particles = new ParticleEngine(80);
  }

  public enter(): void {
    super.enter();
    soundEngine.setTrack('calm');
    this.particles.clear();
    const w = this.game.canvas ? this.game.canvas.width : 960;
    const h = this.game.canvas ? this.game.canvas.height : 540;
    this.logic.reset(w, h);
    voiceNarrator.speak('Rainbow Splat & Stamp Studio! Tap to paint!');
  }

  public update(dt: number, input: InputManager): void {
    const w = this.game.canvas ? this.game.canvas.width : 960;
    const h = this.game.canvas ? this.game.canvas.height : 540;
    if (this.logic.width !== w || this.logic.height !== h) {
      this.logic.layout(w, h);
    }

    if (input.wasJustPressed() || input.isPointerDown()) {
      const pos = input.getPointerPos();

      // Check "Wipe Clean 🧼" button
      const toolX = w - 160;
      const toolY = 26;
      if (input.wasJustPressed() && pos.x >= toolX && pos.x <= toolX + 130 && pos.y >= toolY && pos.y <= toolY + 40) {
        this.logic.triggerSqueegee();
        soundEngine.playSFX('bubblePop');
        Haptics.medium();
        voiceNarrator.speak('All clean and fresh!');
      } else if (pos.y > h * 0.8) {
        // Palette tapped
        if (input.wasJustPressed()) {
          const potIdx = this.logic.findColorPotAt(pos.x, pos.y);
          if (potIdx >= 0) {
            this.logic.setColor(potIdx);
            soundEngine.playSFX('click');
            Haptics.light();
          }
        }
      } else if (pos.y < h * 0.76) {
        // Drawing on paper
        if (input.wasJustPressed()) {
          const splat = this.logic.addSplat(pos.x, pos.y);
          soundEngine.playSFX('paintSplat');
          Haptics.light();

          this.particles.emit({
            x: pos.x,
            y: pos.y,
            count: 8,
            color: splat.color,
            speedMin: 30,
            speedMax: 100,
            sizeMin: 2,
            sizeMax: 5,
            lifetime: 0.4
          });

          this.score = this.logic.score;
          this.checkStoryGoal(this.logic.totalSplatsMade, 8);
        }
      }
    }

    this.logic.update(dt);
    this.particles.update(dt);
  }

  public render(ctx: CanvasRenderingContext2D, _alpha: number, display: DisplayManager): void {
    this.renderer.render(ctx, this.logic, display.width, display.height);
    this.particles.render(ctx);
  }

  public override getEntities(): Record<string, unknown> {
    return {
      splats: this.logic.splats,
      colorPots: this.logic.colorPots
    };
  }

  public override getModeState(): Record<string, unknown> {
    return {
      score: this.score,
      totalSplats: this.logic.totalSplatsMade,
      isSqueegeeActive: this.logic.isSqueegeeActive
    };
  }
}
