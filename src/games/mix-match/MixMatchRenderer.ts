/**
 * Mode 9: Trishu's Mix & Match Funny Studio - Pure Canvas Renderer
 * Adventures of Trishu Mini-Game Suite
 */

import { DisplayManager } from '../../engine/DisplayManager';
import { CharacterAnimState } from '../../types/characters';
import { drawLandscapeSkyHills } from '../../graphics/environmentRenderer';
import { drawCompositeCharacter } from '../../graphics/characters/modularBodyParts';
import { MixMatchLogic } from './MixMatchLogic';

export class MixMatchRenderer {
  public render(
    ctx: CanvasRenderingContext2D,
    logic: MixMatchLogic,
    animState: CharacterAnimState,
    display: DisplayManager
  ): void {
    const vW = display.vWidth;
    const vH = display.vHeight;
    const isPortrait = display.isPortrait;
    const cx = vW / 2;
    const cy = isPortrait ? vH * 0.44 : vH * 0.48;

    drawLandscapeSkyHills(ctx, vW, vH, logic.time);

    // Studio Stage Platform
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(cx, cy + 95, 120, 36, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Studio Frame Background Card
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.strokeStyle = '#FFD54F';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(cx - 145, cy - 130, 290, 240, 24);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Center Composite Character
    drawCompositeCharacter(
      ctx,
      logic.headIdx,
      logic.torsoIdx,
      logic.legsIdx,
      cx,
      cy,
      isPortrait ? 1.45 : 1.35,
      animState
    );

    // Interactive Arrow Selectors
    this.renderSlotArrows(ctx, cx, cy);

    // Bottom Buttons (Shuffle & Photo)
    this.renderBottomButtons(ctx, display, cx);

    // Title & HUD Badge
    this.renderHUD(ctx, display, cx, logic.currentTitle);

    // Photo Flash Effect
    if (logic.photoFlashTimer > 0) {
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1.0, logic.photoFlashTimer * 3.5)})`;
      ctx.fillRect(0, 0, vW, vH);
    }
  }

  private renderSlotArrows(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
    const rows = [
      { y: cy - 65, label: 'HEAD' },
      { y: cy, label: 'TORSO' },
      { y: cy + 65, label: 'LEGS' }
    ];

    for (const r of rows) {
      this.drawArrowBtn(ctx, cx - 110, r.y, true);
      this.drawArrowBtn(ctx, cx + 110, r.y, false);
    }
  }

  private drawArrowBtn(ctx: CanvasRenderingContext2D, x: number, y: number, isLeft: boolean): void {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = '#FF4081';
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    if (isLeft) {
      ctx.moveTo(4, -8);
      ctx.lineTo(-6, 0);
      ctx.lineTo(4, 8);
    } else {
      ctx.moveTo(-4, -8);
      ctx.lineTo(6, 0);
      ctx.lineTo(-4, 8);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  private renderBottomButtons(ctx: CanvasRenderingContext2D, display: DisplayManager, cx: number): void {
    const isPortrait = display.isPortrait;
    const vH = display.vHeight;
    const btnY = isPortrait ? vH * 0.84 : vH * 0.86;

    const shuffleX = cx - 90;
    this.drawActionButton(ctx, shuffleX, btnY, '🎲 SHUFFLE', '#4CAF50', '#2E7D32');

    const photoX = cx + 90;
    this.drawActionButton(ctx, photoX, btnY, '📸 PHOTO', '#FF9800', '#E65100');
  }

  private drawActionButton(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    label: string,
    color: string,
    strokeColor: string
  ): void {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = color;
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(-70, -26, 140, 52, 26);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 18px "Fredoka", "Quicksand", "Arial Rounded MT Bold", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, 0, 1);
    ctx.restore();
  }

  private renderHUD(ctx: CanvasRenderingContext2D, display: DisplayManager, cx: number, currentTitle: string): void {
    const isPortrait = display.isPortrait;
    const hudY = isPortrait ? 76 : Math.max(18, display.vHeight * 0.035);

    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.strokeStyle = '#FFD54F';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(cx - 170, hudY, 340, 48, 24);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 20px "Fredoka", "Quicksand", "Arial Rounded MT Bold", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`✨ ${currentTitle}`, cx, hudY + 24);
    ctx.restore();
  }
}
