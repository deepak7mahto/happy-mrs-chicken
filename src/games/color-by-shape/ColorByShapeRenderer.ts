/**
 * Color-by-Shape Canvas Renderer
 * Strictly under 500 lines, balanced save/restore
 */

import { ColorByShapeLogic, SHAPE_COLOR_KEYS, SHAPE_PICTURES, ShapeKind } from './ColorByShapeLogic';

export function drawShapePath(ctx: CanvasRenderingContext2D, kind: ShapeKind, cx: number, cy: number, r: number): void {
  ctx.beginPath();
  if (kind === 'circle') {
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
  } else if (kind === 'square') {
    ctx.roundRect(cx - r * 0.88, cy - r * 0.88, r * 1.76, r * 1.76, 10);
  } else if (kind === 'triangle') {
    ctx.moveTo(cx, cy - r);
    ctx.lineTo(cx + r * 0.95, cy + r * 0.82);
    ctx.lineTo(cx - r * 0.95, cy + r * 0.82);
    ctx.closePath();
  } else if (kind === 'diamond') {
    ctx.moveTo(cx, cy - r);
    ctx.lineTo(cx + r * 0.82, cy);
    ctx.lineTo(cx, cy + r);
    ctx.lineTo(cx - r * 0.82, cy);
    ctx.closePath();
  } else if (kind === 'star') {
    const spikes = 5;
    for (let i = 0; i < spikes * 2; i++) {
      const rad = i % 2 === 0 ? r : r * 0.46;
      const angle = (i * Math.PI) / spikes - Math.PI / 2;
      const sx = cx + Math.cos(angle) * rad;
      const sy = cy + Math.sin(angle) * rad;
      if (i === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.closePath();
  }
}

export class ColorByShapeRenderer {
  public render(ctx: CanvasRenderingContext2D, logic: ColorByShapeLogic, w: number, h: number, time: number): void {
    ctx.save();
    ctx.fillStyle = '#E8F5E9';
    ctx.fillRect(0, 0, w, h);

    // Header (shifted below DOM Home button on portrait)
    const isPortrait = h > w;
    ctx.fillStyle = '#1B5E20';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(
      `🔷 ${logic.activePicture.title} (${logic.pictureIndex + 1}/${SHAPE_PICTURES.length})`,
      w / 2,
      isPortrait ? 74 : 28
    );

    // Paper sheet
    const box = logic.getPaperBounds();
    ctx.fillStyle = 'rgba(0,0,0,0.08)';
    ctx.beginPath();
    ctx.roundRect(box.x + 4, box.y + 4, box.w, box.h, 18);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.roundRect(box.x, box.y, box.w, box.h, 18);
    ctx.fill();
    ctx.strokeStyle = '#C8E6C9';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Render shape pieces
    const minDim = Math.min(box.w, box.h);
    for (const p of logic.pieces) {
      const cx = box.x + p.nx * box.w;
      const cy = box.y + p.ny * box.h;
      const scale = p.bounce > 0 ? 1 + Math.sin((p.bounce / 0.4) * Math.PI) * 0.14 : 1;
      const r = p.nsize * minDim * scale;
      const key = SHAPE_COLOR_KEYS.find(k => k.kind === p.kind)!;

      ctx.save();
      drawShapePath(ctx, p.kind, cx, cy, r);
      if (p.filled) {
        ctx.fillStyle = key.color;
        ctx.fill();
        ctx.strokeStyle = '#263238';
        ctx.lineWidth = 4;
        ctx.stroke();
      } else {
        ctx.fillStyle = '#FAFAFA';
        ctx.fill();
        if (typeof ctx.setLineDash === 'function') ctx.setLineDash([8, 6]);
        ctx.strokeStyle = key.color;
        ctx.lineWidth = 4;
        ctx.stroke();
        if (typeof ctx.setLineDash === 'function') ctx.setLineDash([]);

        // Small matching shape guide icon in center
        drawShapePath(ctx, p.kind, cx, cy, Math.max(10, r * 0.28));
        ctx.strokeStyle = key.color;
        ctx.lineWidth = 2.5;
        ctx.stroke();
      }
      ctx.restore();
    }

    this.renderPaletteBar(ctx, logic, w, h, time);
    ctx.restore();
  }

  private renderPaletteBar(ctx: CanvasRenderingContext2D, logic: ColorByShapeLogic, w: number, h: number, time: number): void {
    const barY = h - 76;
    ctx.fillStyle = 'rgba(255,255,255,0.96)';
    ctx.beginPath();
    ctx.roundRect(20, barY, w - 40, 62, 18);
    ctx.fill();

    // 5 Shape-Color Pots in center
    const spacing = Math.min(82, (w - 260) / SHAPE_COLOR_KEYS.length);
    const startX = w / 2 - ((SHAPE_COLOR_KEYS.length - 1) * spacing) / 2;

    for (let i = 0; i < SHAPE_COLOR_KEYS.length; i++) {
      const k = SHAPE_COLOR_KEYS[i];
      const cx = startX + i * spacing;
      const cy = barY + 31;
      const isSelected = logic.selectedKind === k.kind;
      const isHinted = logic.hintKind === k.kind;
      const lift = isSelected ? -6 : isHinted ? Math.sin(time * 14) * 4 : 0;

      ctx.save();
      ctx.translate(cx, cy + lift);
      ctx.fillStyle = k.color;
      drawShapePath(ctx, k.kind, 0, 0, isSelected ? 22 : 18);
      ctx.fill();
      ctx.strokeStyle = isSelected || isHinted ? '#263238' : '#FFFFFF';
      ctx.lineWidth = isSelected || isHinted ? 3.5 : 2;
      ctx.stroke();
      ctx.restore();
    }

    // Next Picture button (right)
    const bounce = logic.isCompleted ? Math.sin(time * 8) * 3 : 0;
    ctx.fillStyle = logic.isCompleted ? '#A5D6A7' : '#E0F2F1';
    ctx.beginPath();
    ctx.roundRect(w - 146, barY + 12 + bounce, 114, 38, 12);
    ctx.fill();
    ctx.fillStyle = '#1B5E20';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(logic.isCompleted ? '🎉 Next ▶' : 'Next ▶', w - 89, barY + 31 + bounce);
  }

  public getTappedPot(x: number, y: number, w: number, h: number): ShapeKind | 'next' | null {
    const barY = h - 76;
    if (y < barY) return null;

    if (x >= w - 146 && x <= w - 32) return 'next';

    const spacing = Math.min(82, (w - 260) / SHAPE_COLOR_KEYS.length);
    const startX = w / 2 - ((SHAPE_COLOR_KEYS.length - 1) * spacing) / 2;
    for (let i = 0; i < SHAPE_COLOR_KEYS.length; i++) {
      const cx = startX + i * spacing;
      if (Math.hypot(x - cx, y - (barY + 31)) <= 28) {
        return SHAPE_COLOR_KEYS[i].kind;
      }
    }
    return null;
  }
}
