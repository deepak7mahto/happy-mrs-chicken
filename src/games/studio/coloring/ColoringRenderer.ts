/**
 * Preschool Magic Coloring Book Canvas Renderer
 * Adventures of Trishu Preschool Suite
 * Strictly under 500 lines
 */

import { ColoringLogic } from './ColoringLogic';
import { CRAYON_PALETTE } from './ColoringSheets';

export class ColoringRenderer {
  public render(ctx: CanvasRenderingContext2D, logic: ColoringLogic, w: number, h: number, time: number): void {
    ctx.save();

    // 1. Paper Sheet Canvas
    this.renderPaperSheet(ctx, w, h);

    // 2. Sheet Navigation & Title
    this.renderSheetHeader(ctx, logic, w, h, time);

    // 3. Render Filled Regions & Thick Outlines
    this.renderLineArt(ctx, logic, w, h);

    // 4. Render Crayon Strokes
    this.renderCrayonStrokes(ctx, logic);

    // 5. Render Tools & Crayon Pots
    this.renderBottomTools(ctx, logic, w, h, time);

    ctx.restore();
  }

  private renderPaperSheet(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    // Desk background
    ctx.fillStyle = '#E0F2F1';
    ctx.fillRect(0, 0, w, h);

    // Paper page
    const px = 20, py = 48, pw = w - 40, ph = h - 132;
    // Paper shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
    ctx.beginPath();
    ctx.roundRect(px + 4, py + 4, pw, ph, 16);
    ctx.fill();

    // Clean white drawing page
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.roundRect(px, py, pw, ph, 16);
    ctx.fill();
    ctx.strokeStyle = '#CFD8DC';
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  private renderSheetHeader(ctx: CanvasRenderingContext2D, logic: ColoringLogic, w: number, h: number, time: number): void {
    const sheet = logic.activeSheet;
    const arrowY = h * 0.42;
    const bounce = Math.sin(time * 4) * 3;

    // Title banner
    ctx.fillStyle = '#37474F';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(`${sheet.title} (${logic.sheetIndex + 1}/6)`, w / 2, 54);

    // Left Page Arrow
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.beginPath();
    ctx.arc(36 + bounce, arrowY, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#37474F';
    ctx.font = 'bold 20px sans-serif';
    ctx.textBaseline = 'middle';
    ctx.fillText('◀', 36 + bounce, arrowY);

    // Right Page Arrow
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.beginPath();
    ctx.arc(w - 36 - bounce, arrowY, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#37474F';
    ctx.fillText('▶', w - 36 - bounce, arrowY);
  }

  private renderLineArt(ctx: CanvasRenderingContext2D, logic: ColoringLogic, w: number, h: number): void {
    const sheet = logic.activeSheet;

    // Render region fills
    for (const region of sheet.regions) {
      const color = logic.getRegionColor(region.id) || '#FFFFFF';
      ctx.fillStyle = color;
      ctx.beginPath();
      for (let i = 0; i < region.polygon.length; i++) {
        const pt = region.polygon[i];
        const rx = pt.x * w;
        const ry = pt.y * h;
        if (i === 0) ctx.moveTo(rx, ry);
        else ctx.lineTo(rx, ry);
      }
      ctx.closePath();
      ctx.fill();
    }

    // Render bold preschool outlines
    ctx.strokeStyle = '#263238';
    ctx.lineWidth = 6;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    for (const region of sheet.regions) {
      ctx.beginPath();
      for (let i = 0; i < region.polygon.length; i++) {
        const pt = region.polygon[i];
        const rx = pt.x * w;
        const ry = pt.y * h;
        if (i === 0) ctx.moveTo(rx, ry);
        else ctx.lineTo(rx, ry);
      }
      ctx.closePath();
      ctx.stroke();
    }
  }

  private renderCrayonStrokes(ctx: CanvasRenderingContext2D, logic: ColoringLogic): void {
    const allStrokes = [...logic.strokes];
    if (logic.currentStroke) allStrokes.push(logic.currentStroke);

    ctx.save();
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    for (const s of allStrokes) {
      if (s.points.length < 2) continue;
      ctx.strokeStyle = s.color;
      ctx.lineWidth = s.width;
      ctx.beginPath();
      ctx.moveTo(s.points[0].x, s.points[0].y);
      for (let i = 1; i < s.points.length; i++) {
        ctx.lineTo(s.points[i].x, s.points[i].y);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  private renderBottomTools(ctx: CanvasRenderingContext2D, logic: ColoringLogic, w: number, h: number, time: number): void {
    const barY = h - 76;
    const barH = 72;

    // Tool Bar background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.beginPath();
    ctx.roundRect(16, barY, w - 32, barH, 20);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Mode Toggle Button on Left (Magic Wand vs Crayon)
    const isMagic = logic.toolMode === 'magic';
    ctx.fillStyle = isMagic ? '#EDE7F6' : '#FFF3E0';
    ctx.beginPath();
    ctx.roundRect(28, barY + 10, 116, 52, 14);
    ctx.fill();
    ctx.strokeStyle = isMagic ? '#7E57C2' : '#FF9800';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = 'bold 15px sans-serif';
    ctx.fillStyle = isMagic ? '#512DA8' : '#E65100';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(isMagic ? '🪄 Magic' : '🖍️ Crayon', 86, barY + 36);

    // Center tool area
    if (isMagic) {
      // Magic helper text with sparkles
      const sparkle = Math.sin(time * 6) * 3;
      ctx.font = 'bold 16px sans-serif';
      ctx.fillStyle = '#673AB7';
      ctx.fillText(`✨ Swipe anywhere to magically color! ✨`, w / 2, barY + 36 + sparkle);
    } else {
      // 12 Jumbo Crayon Pots
      const potW = Math.min(38, (w - 320) / CRAYON_PALETTE.length);
      const startX = 160;
      for (let i = 0; i < CRAYON_PALETTE.length; i++) {
        const color = CRAYON_PALETTE[i];
        const cx = startX + i * potW + potW / 2;
        const cy = barY + 36;
        const isSelected = logic.selectedColor === color;

        ctx.save();
        if (isSelected) {
          ctx.translate(0, -6);
        }
        // Crayon tip
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(cx, cy, 14, 0, Math.PI * 2);
        ctx.fill();

        if (isSelected) {
          ctx.strokeStyle = '#37474F';
          ctx.lineWidth = 3;
          ctx.stroke();
        }
        ctx.restore();
      }
    }

    // Right action buttons: Undo & Squeegee
    const undoX = w - 120;
    ctx.fillStyle = '#ECEFF1';
    ctx.beginPath();
    ctx.arc(undoX, barY + 36, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = '20px sans-serif';
    ctx.fillStyle = '#37474F';
    ctx.fillText('↩️', undoX, barY + 36);

    const clearX = w - 60;
    ctx.fillStyle = '#FFEBEE';
    ctx.beginPath();
    ctx.arc(clearX, barY + 36, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillText('🧽', clearX, barY + 36);
  }

  public getTappedAction(x: number, y: number, w: number, h: number): 'toggle' | 'undo' | 'clear' | 'prevSheet' | 'nextSheet' | number {
    const arrowY = h * 0.42;
    // Check left arrow
    if (Math.hypot(x - 36, y - arrowY) < 36) return 'prevSheet';
    // Check right arrow
    if (Math.hypot(x - (w - 36), y - arrowY) < 36) return 'nextSheet';

    const barY = h - 76;
    if (y >= barY && y <= h) {
      // Toggle button
      if (x >= 28 && x <= 144) return 'toggle';
      // Undo button
      if (Math.hypot(x - (w - 120), y - (barY + 36)) < 28) return 'undo';
      // Clear squeegee
      if (Math.hypot(x - (w - 60), y - (barY + 36)) < 28) return 'clear';

      // Crayon palette tap
      const potW = Math.min(38, (w - 320) / CRAYON_PALETTE.length);
      const startX = 160;
      for (let i = 0; i < CRAYON_PALETTE.length; i++) {
        const cx = startX + i * potW + potW / 2;
        if (Math.hypot(x - cx, y - (barY + 36)) < 20) {
          return i;
        }
      }
    }

    return -1 as any;
  }
}
