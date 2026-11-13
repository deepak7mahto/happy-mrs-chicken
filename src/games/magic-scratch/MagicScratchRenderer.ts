/**
 * Magic Scratch-to-Reveal Renderer
 * Uses cached offscreen illustration & scratch mask canvases for 60fps performance
 * Strictly under 500 lines
 */

import { MagicScratchLogic, SCRATCH_PICTURES } from './MagicScratchLogic';
import { drawMrsClucky, drawLeo, drawTrishu } from '../../graphics/characters';

export class MagicScratchRenderer {
  private artCanvas: HTMLCanvasElement | null = null;
  private artCtx: CanvasRenderingContext2D | null = null;
  private maskCanvas: HTMLCanvasElement | null = null;
  private maskCtx: CanvasRenderingContext2D | null = null;
  private cachedPicId: string = '';
  private cachedW: number = 0;
  private cachedH: number = 0;

  private ensureOffscreenCanvases(w: number, h: number): void {
    if (typeof document === 'undefined') return;
    if (!this.artCanvas) {
      this.artCanvas = document.createElement('canvas');
      this.artCtx = this.artCanvas.getContext('2d');
    }
    if (!this.maskCanvas) {
      this.maskCanvas = document.createElement('canvas');
      this.maskCtx = this.maskCanvas.getContext('2d');
    }
    if (this.artCanvas && (this.artCanvas.width !== w || this.artCanvas.height !== h)) {
      this.artCanvas.width = w;
      this.artCanvas.height = h;
      this.cachedPicId = '';
    }
    if (this.maskCanvas && (this.maskCanvas.width !== w || this.maskCanvas.height !== h)) {
      this.maskCanvas.width = w;
      this.maskCanvas.height = h;
      this.cachedW = 0;
    }
  }

  private drawIllustrationToCache(logic: MagicScratchLogic, box: { x: number; y: number; w: number; h: number }): void {
    const ctx = this.artCtx;
    if (!ctx) return;
    const pic = logic.activePicture;
    ctx.save();
    ctx.clearRect(0, 0, box.w, box.h);

    const grad = ctx.createLinearGradient(0, 0, box.w, box.h);
    grad.addColorStop(0, pic.bgGradient[0]);
    grad.addColorStop(1, pic.bgGradient[1]);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, box.w, box.h);

    // Decorative rainbow bands in background
    const rainbowColors = ['#FF5252', '#FF9800', '#FFEB3B', '#66BB6A', '#29B6F6', '#AB47BC'];
    const cx = box.w / 2;
    const cy = box.h * 0.56;
    ctx.globalAlpha = 0.28;
    for (let i = 0; i < rainbowColors.length; i++) {
      ctx.strokeStyle = rainbowColors[i];
      ctx.lineWidth = 18;
      ctx.beginPath();
      ctx.arc(cx, box.h * 0.85, Math.min(box.w, box.h) * (0.65 - i * 0.06), Math.PI, 0);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Draw themed center illustration
    if (pic.id === 'happy_clucky') {
      drawMrsClucky(ctx, cx, cy, 1.8, { flap: 0.2, squash: 1.05 });
    } else if (pic.id === 'friendly_dino') {
      drawLeo(ctx, cx, cy, 1.7, { holdingDino: true, expression: 'excited' });
    } else if (pic.id === 'rainbow_castle') {
      this.drawCastle(ctx, cx, cy, Math.min(box.w, box.h) * 0.35);
    } else if (pic.id === 'space_rocket') {
      this.drawRocket(ctx, cx, cy, Math.min(box.w, box.h) * 0.32);
    } else {
      drawTrishu(ctx, cx, cy, 1.6, { expression: 'happy' });
    }

    ctx.restore();
    this.cachedPicId = pic.id;
  }

  private drawCastle(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number): void {
    ctx.save();
    ctx.fillStyle = '#FFF9C4';
    ctx.strokeStyle = '#5D4037';
    ctx.lineWidth = 4;
    ctx.fillRect(cx - size * 0.6, cy - size * 0.3, size * 1.2, size * 0.9);
    ctx.strokeRect(cx - size * 0.6, cy - size * 0.3, size * 1.2, size * 0.9);
    // Towers
    for (const dx of [-0.65, 0.4]) {
      ctx.fillStyle = '#F8BBD0';
      ctx.fillRect(cx + dx * size, cy - size * 0.6, size * 0.25, size * 1.2);
      ctx.strokeRect(cx + dx * size, cy - size * 0.6, size * 0.25, size * 1.2);
      ctx.fillStyle = '#AB47BC';
      ctx.beginPath();
      ctx.moveTo(cx + (dx - 0.05) * size, cy - size * 0.6);
      ctx.lineTo(cx + (dx + 0.125) * size, cy - size * 0.95);
      ctx.lineTo(cx + (dx + 0.3) * size, cy - size * 0.6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    // Door
    ctx.fillStyle = '#8D6E63';
    ctx.beginPath();
    ctx.arc(cx, cy + size * 0.3, size * 0.2, Math.PI, 0);
    ctx.lineTo(cx + size * 0.2, cy + size * 0.6);
    ctx.lineTo(cx - size * 0.2, cy + size * 0.6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  private drawRocket(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number): void {
    ctx.save();
    // Flame
    ctx.fillStyle = '#FF9800';
    ctx.beginPath();
    ctx.moveTo(cx - size * 0.22, cy + size * 0.45);
    ctx.lineTo(cx, cy + size * 0.95);
    ctx.lineTo(cx + size * 0.22, cy + size * 0.45);
    ctx.closePath();
    ctx.fill();
    // Body
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#37474F';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(cx, cy, size * 0.32, size * 0.65, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Window
    ctx.fillStyle = '#29B6F6';
    ctx.beginPath();
    ctx.arc(cx, cy - size * 0.1, size * 0.16, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  private resetMaskToCache(logic: MagicScratchLogic, box: { x: number; y: number; w: number; h: number }): void {
    const ctx = this.maskCtx;
    if (!ctx) return;
    const pic = logic.activePicture;
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = pic.foilColor;
    ctx.fillRect(0, 0, box.w, box.h);

    // Sparkly star dots on scratch foil
    ctx.fillStyle = pic.foilAccent;
    for (let y = 24; y < box.h; y += 44) {
      for (let x = 24; x < box.w; x += 48) {
        ctx.beginPath();
        ctx.arc(x + ((y / 44) % 2) * 20, y, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✨ Rub here to reveal! ✨', box.w / 2, box.h / 2);
    ctx.restore();

    this.cachedW = box.w;
    this.cachedH = box.h;
    logic.needsMaskReset = false;
  }

  private applyPendingStrokes(logic: MagicScratchLogic, box: { x: number; y: number; w: number; h: number }): void {
    const ctx = this.maskCtx;
    if (!ctx || logic.pendingStrokes.length === 0) {
      logic.pendingStrokes.length = 0;
      return;
    }
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = logic.brushRadius * 2;
    ctx.strokeStyle = 'rgba(0,0,0,1)';
    ctx.fillStyle = 'rgba(0,0,0,1)';
    for (const s of logic.pendingStrokes) {
      ctx.beginPath();
      ctx.moveTo(s.x1 - box.x, s.y1 - box.y);
      ctx.lineTo(s.x2 - box.x, s.y2 - box.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(s.x2 - box.x, s.y2 - box.y, logic.brushRadius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    logic.pendingStrokes.length = 0;
  }

  public render(ctx: CanvasRenderingContext2D, logic: MagicScratchLogic, w: number, h: number, time: number): void {
    ctx.save();
    ctx.fillStyle = '#EDE7F6';
    ctx.fillRect(0, 0, w, h);

    const box = logic.getPaperBounds();
    this.ensureOffscreenCanvases(Math.round(box.w), Math.round(box.h));

    if (this.cachedPicId !== logic.activePicture.id) {
      this.drawIllustrationToCache(logic, box);
    }
    if (logic.needsMaskReset || this.cachedW !== box.w || this.cachedH !== box.h) {
      this.resetMaskToCache(logic, box);
    }
    this.applyPendingStrokes(logic, box);

    // Header title & progress
    ctx.fillStyle = '#311B92';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(
      `✨ ${logic.activePicture.title} (${logic.pictureIndex + 1}/${SCRATCH_PICTURES.length})`,
      w / 2,
      32
    );

    // Paper frame shadow
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.beginPath();
    ctx.roundRect(box.x + 4, box.y + 4, box.w, box.h, 18);
    ctx.fill();

    // Draw cached art + scratch mask clipped to rounded card
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(box.x, box.y, box.w, box.h, 18);
    ctx.clip();

    if (this.artCanvas) {
      ctx.drawImage(this.artCanvas, box.x, box.y, box.w, box.h);
    } else {
      ctx.fillStyle = '#FFF9C4';
      ctx.fillRect(box.x, box.y, box.w, box.h);
    }

    if (!logic.isCompleted && this.maskCanvas) {
      ctx.drawImage(this.maskCanvas, box.x, box.y, box.w, box.h);
    }
    ctx.restore();

    ctx.strokeStyle = '#7E57C2';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(box.x, box.y, box.w, box.h, 18);
    ctx.stroke();

    // Bottom toolbar
    this.renderToolbar(ctx, logic, w, h, time);
    ctx.restore();
  }

  private renderToolbar(ctx: CanvasRenderingContext2D, logic: MagicScratchLogic, w: number, h: number, time: number): void {
    const barY = h - 72;
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.beginPath();
    ctx.roundRect(24, barY, w - 48, 56, 18);
    ctx.fill();

    // Progress bar
    const progW = Math.min(240, w * 0.35);
    const progX = w / 2 - progW / 2;
    const progY = barY + 18;
    ctx.fillStyle = '#E0E0E0';
    ctx.beginPath();
    ctx.roundRect(progX, progY, progW, 20, 10);
    ctx.fill();

    ctx.fillStyle = logic.isCompleted ? '#66BB6A' : '#AB47BC';
    ctx.beginPath();
    ctx.roundRect(progX, progY, Math.max(12, (progW * logic.revealPercent) / 100), 20, 10);
    ctx.fill();

    ctx.fillStyle = '#311B92';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(
      logic.isCompleted ? '🎉 Revealed! 🎉' : `${logic.revealPercent}% Revealed`,
      w / 2,
      progY + 10
    );

    // Reset button (left)
    ctx.fillStyle = '#FFE0B2';
    ctx.beginPath();
    ctx.roundRect(38, barY + 10, 110, 36, 12);
    ctx.fill();
    ctx.fillStyle = '#E65100';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('🔄 Reset', 93, barY + 28);

    // Next Picture button (right)
    const bounce = logic.isCompleted ? Math.sin(time * 8) * 3 : 0;
    ctx.fillStyle = '#C8E6C9';
    ctx.beginPath();
    ctx.roundRect(w - 158, barY + 10 + bounce, 120, 36, 12);
    ctx.fill();
    ctx.fillStyle = '#1B5E20';
    ctx.fillText('Next ▶', w - 98, barY + 28 + bounce);
  }
}
