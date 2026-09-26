/**
 * Mode 19: Rainbow Splat & Stamp Studio - Canvas 2D Vector Renderer
 * Adventures of Trishu Preschool Suite
 * Strictly under 500 lines
 */

import { FingerPaintLogic } from './FingerPaintLogic';
import { PaintSplatItem, PaintColor } from './types';

export class FingerPaintRenderer {
  public render(
    ctx: CanvasRenderingContext2D,
    logic: FingerPaintLogic,
    w: number,
    h: number
  ): void {
    ctx.save();

    // 1. Easel background & paper sheet
    this.renderEaselAndPaper(ctx, w, h);

    // 2. All painted splats and stamps
    for (const splat of logic.splats) {
      if (splat.type === 'SPLAT') {
        this.renderSplat(ctx, splat);
      } else {
        this.renderStamp(ctx, splat);
      }
    }

    // 3. Squeegee wiping wave
    if (logic.isSqueegeeActive) {
      this.renderSqueegee(ctx, logic, w, h);
    }

    // 4. Color pots palette
    this.renderPaletteBar(ctx, logic, w, h);

    // 5. Tool selector buttons (Splat / Stamp / Squeegee)
    this.renderToolBar(ctx, logic, w, h);

    ctx.restore();
  }

  private renderEaselAndPaper(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    // Warm wood wall
    ctx.fillStyle = '#FFE0B2';
    ctx.fillRect(0, 0, w, h);

    // White textured art paper
    const padX = w * 0.04;
    const padY = 16;
    const paperW = w * 0.92;
    const paperH = h * 0.74;

    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.12)';
    ctx.shadowBlur = 16;
    ctx.shadowOffsetY = 6;
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.roundRect(padX, padY, paperW, paperH, 16);
    ctx.fill();
    ctx.restore();

    // Cute pastel corner pins
    const pinColors = ['#FF8A80', '#80D8FF', '#A7FFEB', '#FFD180'];
    const corners = [
      { x: padX + 20, y: padY + 20 },
      { x: padX + paperW - 20, y: padY + 20 },
      { x: padX + 20, y: padY + paperH - 20 },
      { x: padX + paperW - 20, y: padY + paperH - 20 }
    ];

    corners.forEach((c, idx) => {
      ctx.fillStyle = pinColors[idx % pinColors.length];
      ctx.beginPath();
      ctx.arc(c.x, c.y, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  }

  private renderSplat(ctx: CanvasRenderingContext2D, splat: PaintSplatItem): void {
    ctx.save();
    ctx.translate(splat.x, splat.y);

    // Base amoeba splat body
    ctx.fillStyle = splat.color;
    ctx.beginPath();
    ctx.arc(0, 0, splat.radius, 0, Math.PI * 2);
    ctx.fill();

    // Satellite droplets
    for (const d of splat.droplets) {
      ctx.beginPath();
      ctx.arc(d.offsetX, d.offsetY, d.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Specular shine highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.beginPath();
    ctx.ellipse(-splat.radius * 0.35, -splat.radius * 0.35, splat.radius * 0.3, splat.radius * 0.18, -Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  private renderStamp(ctx: CanvasRenderingContext2D, stamp: PaintSplatItem): void {
    ctx.save();
    ctx.translate(stamp.x, stamp.y);

    ctx.fillStyle = stamp.color;
    ctx.strokeStyle = stamp.darkColor;
    ctx.lineWidth = 3;

    if (stamp.stampType === 'STAR') {
      this.drawStar(ctx, 0, 0, 5, stamp.radius * 0.9, stamp.radius * 0.45);
    } else if (stamp.stampType === 'HEART') {
      this.drawHeart(ctx, 0, 0, stamp.radius * 0.85);
    } else {
      // PAW print
      this.drawPaw(ctx, 0, 0, stamp.radius * 0.85);
    }

    ctx.restore();
  }

  private drawStar(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    spikes: number,
    outerR: number,
    innerR: number
  ): void {
    let rot = (Math.PI / 2) * 3;
    const step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerR);
    for (let i = 0; i < spikes; i++) {
      let x = cx + Math.cos(rot) * outerR;
      let y = cy + Math.sin(rot) * outerR;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerR;
      y = cy + Math.sin(rot) * innerR;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerR);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  private drawHeart(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number): void {
    ctx.beginPath();
    const topCurveHeight = size * 0.3;
    ctx.moveTo(cx, cy + topCurveHeight);
    ctx.bezierCurveTo(cx, cy, cx - size / 2, cy, cx - size / 2, cy + topCurveHeight);
    ctx.bezierCurveTo(cx - size / 2, cy + (size + topCurveHeight) / 2, cx, cy + (size + topCurveHeight) / 1.5, cx, cy + size);
    ctx.bezierCurveTo(cx, cy + (size + topCurveHeight) / 1.5, cx + size / 2, cy + (size + topCurveHeight) / 2, cx + size / 2, cy + topCurveHeight);
    ctx.bezierCurveTo(cx + size / 2, cy, cx, cy, cx, cy + topCurveHeight);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  private drawPaw(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number): void {
    // Main pad
    ctx.beginPath();
    ctx.ellipse(cx, cy + size * 0.2, size * 0.5, size * 0.38, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 4 toe pads
    const toeAngles = [-0.6, -0.2, 0.2, 0.6];
    for (const angle of toeAngles) {
      const tx = cx + Math.sin(angle) * (size * 0.65);
      const ty = cy - Math.cos(angle) * (size * 0.45);
      ctx.beginPath();
      ctx.ellipse(tx, ty, size * 0.16, size * 0.22, angle, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  }

  private renderSqueegee(
    ctx: CanvasRenderingContext2D,
    logic: FingerPaintLogic,
    w: number,
    h: number
  ): void {
    const sweepY = h * 0.74 * logic.squeegeeProgress;

    ctx.save();
    // Fresh white reveal
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(w * 0.04, 16, w * 0.92, sweepY);

    // Squeegee bar
    ctx.fillStyle = '#FFD54F';
    ctx.beginPath();
    ctx.roundRect(w * 0.03, sweepY + 8, w * 0.94, 20, 10);
    ctx.fill();
    ctx.strokeStyle = '#FFA000';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Bubbly soap suds along edge
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    for (let x = w * 0.06; x < w * 0.94; x += 24) {
      ctx.beginPath();
      ctx.arc(x, sweepY + 12, 9, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  private renderPaletteBar(
    ctx: CanvasRenderingContext2D,
    logic: FingerPaintLogic,
    w: number,
    h: number
  ): void {
    const isPortrait = h > w;
    const shelfY = isPortrait ? h * 0.82 : h * 0.82;

    ctx.save();
    // Bottom wooden palette tray
    ctx.fillStyle = '#D7CCC8';
    ctx.beginPath();
    ctx.roundRect(w * 0.04, shelfY, w * 0.92, h - shelfY - 10, 16);
    ctx.fill();
    ctx.strokeStyle = '#8D6E63';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Color pots
    for (let i = 0; i < logic.colorPots.length; i++) {
      const pot = logic.colorPots[i];
      const isSelected = i === logic.activeColorIndex;

      ctx.save();
      ctx.translate(pot.x, pot.y);

      if (isSelected) {
        ctx.scale(1.15, 1.15);
        ctx.shadowColor = pot.hex;
        ctx.shadowBlur = 12;
      }

      // Pot circle
      ctx.fillStyle = pot.hex;
      ctx.beginPath();
      ctx.arc(0, 0, pot.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = isSelected ? '#FFFFFF' : pot.darkHex;
      ctx.lineWidth = isSelected ? 4 : 2;
      ctx.stroke();

      // Jar lid reflection
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.beginPath();
      ctx.ellipse(-pot.radius * 0.3, -pot.radius * 0.3, pot.radius * 0.3, pot.radius * 0.15, -Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    ctx.restore();
  }

  private renderToolBar(
    ctx: CanvasRenderingContext2D,
    logic: FingerPaintLogic,
    w: number,
    _h: number
  ): void {
    ctx.save();
    // Top right tools: Stamp pill, Squeegee pill
    const toolX = w - 160;
    const toolY = 26;

    // Squeegee wipe button
    ctx.fillStyle = '#4DD0E1';
    ctx.beginPath();
    ctx.roundRect(toolX, toolY, 130, 40, 20);
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 16px "Fredoka", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🧼 Wipe Clean', toolX + 65, toolY + 20);

    ctx.restore();
  }
}
