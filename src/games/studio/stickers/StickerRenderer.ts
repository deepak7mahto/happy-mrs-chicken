/**
 * Interactive Sticker World Canvas Renderer
 * Adventures of Trishu Preschool Suite
 * Strictly under 500 lines
 */

import { StickerLogic } from './StickerLogic';
import { STICKER_CATALOG, BACKGROUND_LIST } from './StickerCatalog';
import { renderCharacter } from '../../../graphics/characters';
import { CharacterId } from '../../../types/characters';
import { PlacedSticker } from '../types';

export class StickerRenderer {
  public scrollX: number = 0;
  private maxScrollX: number = 0;

  public render(ctx: CanvasRenderingContext2D, logic: StickerLogic, w: number, h: number, time: number): void {
    ctx.save();

    // 1. Render Active Background Scene
    this.renderBackground(ctx, logic.currentBackground, w, h, time);

    // 2. Background Switcher Arrows
    this.renderSceneArrows(ctx, logic, w, h, time);

    // 3. Render Placed Stickers (sorted by z)
    const sorted = [...logic.stickers].sort((a, b) => a.z - b.z);
    for (const sticker of sorted) {
      this.renderSticker(ctx, sticker, sticker.uid === logic.selectedUid, time);
    }

    // 4. Render Trash Can (bottom-right)
    this.renderTrashCan(ctx, logic, w, h, time);

    // 5. Render Bottom Sticker Tray
    this.renderTray(ctx, logic, w, h, time);

    ctx.restore();
  }

  private renderBackground(ctx: CanvasRenderingContext2D, bg: string, w: number, h: number, time: number): void {
    ctx.save();
    switch (bg) {
      case 'farm':
        this.renderFarmBackground(ctx, w, h, time);
        break;
      case 'puddles':
        this.renderPuddlesBackground(ctx, w, h, time);
        break;
      case 'castle':
        this.renderCastleBackground(ctx, w, h, time);
        break;
      case 'bedtime':
        this.renderBedtimeBackground(ctx, w, h, time);
        break;
      case 'meadow':
      default:
        this.renderMeadowBackground(ctx, w, h, time);
        break;
    }
    ctx.restore();
  }

  private renderFarmBackground(ctx: CanvasRenderingContext2D, w: number, h: number, time: number): void {
    // Sky
    const sky = ctx.createLinearGradient(0, 0, 0, h * 0.65);
    sky.addColorStop(0, '#81D4FA');
    sky.addColorStop(1, '#E1F5FE');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    // Sun
    ctx.fillStyle = '#FFEE58';
    ctx.beginPath();
    ctx.arc(w * 0.85, h * 0.18 + Math.sin(time * 1.5) * 4, 38, 0, Math.PI * 2);
    ctx.fill();

    // Rolling Hills
    ctx.fillStyle = '#A5D6A7';
    ctx.beginPath();
    ctx.ellipse(w * 0.25, h * 0.68, w * 0.45, h * 0.28, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#66BB6A';
    ctx.beginPath();
    ctx.ellipse(w * 0.75, h * 0.72, w * 0.5, h * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Farm Ground
    ctx.fillStyle = '#81C784';
    ctx.fillRect(0, h * 0.62, w, h * 0.38);

    // Red Barn on Left
    const bx = w * 0.14, by = h * 0.48;
    ctx.fillStyle = '#E53935';
    ctx.fillRect(bx - 55, by - 45, 110, 85);
    // Roof
    ctx.fillStyle = '#B71C1C';
    ctx.beginPath();
    ctx.moveTo(bx - 65, by - 45);
    ctx.lineTo(bx, by - 85);
    ctx.lineTo(bx + 65, by - 45);
    ctx.closePath();
    ctx.fill();
    // Door
    ctx.fillStyle = '#FFFDE7';
    ctx.fillRect(bx - 18, by + 5, 36, 35);
  }

  private renderPuddlesBackground(ctx: CanvasRenderingContext2D, w: number, h: number, time: number): void {
    const sky = ctx.createLinearGradient(0, 0, 0, h * 0.6);
    sky.addColorStop(0, '#B3E5FC');
    sky.addColorStop(1, '#E8F5E9');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    // Grassy Hills
    ctx.fillStyle = '#81C784';
    ctx.beginPath();
    ctx.ellipse(w * 0.5, h * 0.8, w * 0.65, h * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(0, h * 0.6, w, h * 0.4);

    // Tree on right
    ctx.fillStyle = '#8D6E63';
    ctx.fillRect(w * 0.82, h * 0.35, 24, h * 0.35);
    ctx.fillStyle = '#4CAF50';
    ctx.beginPath();
    ctx.arc(w * 0.83 + 12, h * 0.32, 54, 0, Math.PI * 2);
    ctx.fill();

    // Muddy Puddles
    this.drawPuddle(ctx, w * 0.3, h * 0.68, 65, 26);
    this.drawPuddle(ctx, w * 0.6, h * 0.72, 85, 32);
  }

  private drawPuddle(ctx: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number): void {
    ctx.fillStyle = '#8D6E63';
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#A1887F';
    ctx.beginPath();
    ctx.ellipse(x - 6, y - 3, rx * 0.6, ry * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  private renderCastleBackground(ctx: CanvasRenderingContext2D, w: number, h: number, time: number): void {
    const sky = ctx.createLinearGradient(0, 0, 0, h * 0.65);
    sky.addColorStop(0, '#90CAF9');
    sky.addColorStop(1, '#FFF9C4');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    // Distant mountain
    ctx.fillStyle = '#B0BEC5';
    ctx.beginPath();
    ctx.moveTo(w * 0.05, h * 0.6);
    ctx.lineTo(w * 0.28, h * 0.28);
    ctx.lineTo(w * 0.5, h * 0.6);
    ctx.closePath();
    ctx.fill();

    // Castle on Hill
    ctx.fillStyle = '#78909C';
    ctx.fillRect(w * 0.68, h * 0.36, 90, 75);
    // Battlements
    for (let i = 0; i < 4; i++) {
      ctx.fillRect(w * 0.68 + i * 24, h * 0.33, 16, 12);
    }
    // Hill
    ctx.fillStyle = '#66BB6A';
    ctx.beginPath();
    ctx.ellipse(w * 0.65, h * 0.78, w * 0.55, h * 0.38, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(0, h * 0.64, w, h * 0.36);
  }

  private renderBedtimeBackground(ctx: CanvasRenderingContext2D, w: number, h: number, time: number): void {
    const night = ctx.createLinearGradient(0, 0, 0, h);
    night.addColorStop(0, '#0D1B2A');
    night.addColorStop(0.7, '#1B263B');
    night.addColorStop(1, '#415A77');
    ctx.fillStyle = night;
    ctx.fillRect(0, 0, w, h);

    // Twinkling stars
    const starCoords = [[0.15, 0.15], [0.35, 0.22], [0.65, 0.12], [0.82, 0.25], [0.48, 0.1], [0.22, 0.35]];
    for (let i = 0; i < starCoords.length; i++) {
      const sx = w * starCoords[i][0];
      const sy = h * starCoords[i][1];
      const sparkle = (Math.sin(time * 3 + i * 1.5) + 1) * 0.5;
      ctx.fillStyle = `rgba(255, 238, 88, ${0.4 + sparkle * 0.6})`;
      ctx.beginPath();
      ctx.arc(sx, sy, 3 + sparkle * 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Smiling Crescent Moon
    const mx = w * 0.84, my = h * 0.18;
    ctx.fillStyle = '#FFEE58';
    ctx.beginPath();
    ctx.arc(mx, my, 32, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0D1B2A';
    ctx.beginPath();
    ctx.arc(mx - 10, my - 6, 26, 0, Math.PI * 2);
    ctx.fill();

    // Barn floor
    ctx.fillStyle = '#3E2723';
    ctx.fillRect(0, h * 0.64, w, h * 0.36);
  }

  private renderMeadowBackground(ctx: CanvasRenderingContext2D, w: number, h: number, time: number): void {
    const sky = ctx.createLinearGradient(0, 0, 0, h * 0.65);
    sky.addColorStop(0, '#E1BEE7');
    sky.addColorStop(0.5, '#B3E5FC');
    sky.addColorStop(1, '#E8F5E9');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    // Rainbow Arch
    const rainbowColors = ['#FF8A80', '#FFD180', '#FFFF8D', '#CCFF90', '#80D8FF'];
    rainbowColors.forEach((color, idx) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(w * 0.5, h * 0.72, 190 - idx * 8, Math.PI, Math.PI * 2);
      ctx.stroke();
    });

    // Meadow Hills
    ctx.fillStyle = '#81C784';
    ctx.beginPath();
    ctx.ellipse(w * 0.5, h * 0.78, w * 0.6, h * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(0, h * 0.64, w, h * 0.36);
  }

  private renderSceneArrows(ctx: CanvasRenderingContext2D, logic: StickerLogic, w: number, h: number, time: number): void {
    const arrowY = h * 0.45;
    const bounce = Math.sin(time * 4) * 3;

    // Left Arrow
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.beginPath();
    ctx.arc(44 + bounce, arrowY, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#37474F';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('◀', 44 + bounce, arrowY);

    // Right Arrow
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.beginPath();
    ctx.arc(w - 44 - bounce, arrowY, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#37474F';
    ctx.fillText('▶', w - 44 - bounce, arrowY);
  }

  private renderSticker(ctx: CanvasRenderingContext2D, s: PlacedSticker, isSelected: boolean, time: number): void {
    ctx.save();
    ctx.translate(s.x, s.y);

    // Wiggle squish animation
    let sx = s.scale;
    let sy = s.scale;
    if (s.wiggleTimer > 0) {
      const f = Math.sin(s.wiggleTimer * Math.PI * 8);
      sx *= 1 + f * 0.22;
      sy *= 1 - f * 0.18;
    }

    ctx.scale(sx, sy);

    // Soft drop shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.beginPath();
    ctx.ellipse(0, 36, 32, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    const cat = STICKER_CATALOG.find(c => c.id === s.id);
    if (cat?.characterId) {
      renderCharacter(cat.characterId as CharacterId, ctx, 0, 0, 0.95);
    } else {
      // Emoji or prop sticker
      ctx.font = '54px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(cat?.emoji || '⭐', 0, 0);
    }

    if (isSelected) {
      ctx.strokeStyle = '#4B88FF';
      ctx.lineWidth = 3;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.arc(0, 0, 48, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.restore();
  }

  private renderTrashCan(ctx: CanvasRenderingContext2D, logic: StickerLogic, w: number, h: number, time: number): void {
    const tx = w - 60;
    const ty = h - 120;
    const isHover = logic.isHoveringTrash;

    ctx.save();
    ctx.translate(tx, ty);
    if (isHover) ctx.scale(1.2, 1.2);

    // Trash can body
    ctx.fillStyle = isHover ? '#EF5350' : 'rgba(255, 255, 255, 0.85)';
    ctx.beginPath();
    ctx.roundRect(-22, -18, 44, 44, 8);
    ctx.fill();

    ctx.font = '24px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🗑️', 0, 4);

    ctx.restore();
  }

  private renderTray(ctx: CanvasRenderingContext2D, logic: StickerLogic, w: number, h: number, time: number): void {
    const trayH = 78;
    const trayY = h - trayH;

    // Tray container background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
    ctx.beginPath();
    ctx.roundRect(16, trayY - 6, w - 32, trayH, 20);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Clip sticker scroll area
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(24, trayY - 4, w - 48, trayH - 4, 16);
    ctx.clip();

    const itemW = 62;
    const startX = 36 - this.scrollX;
    this.maxScrollX = Math.max(0, STICKER_CATALOG.length * itemW - (w - 72));

    for (let i = 0; i < STICKER_CATALOG.length; i++) {
      const item = STICKER_CATALOG[i];
      const ix = startX + i * itemW;
      if (ix < -itemW || ix > w + itemW) continue;

      const iy = trayY + 32;

      // Circle badge
      ctx.fillStyle = item.badgeColor;
      ctx.beginPath();
      ctx.arc(ix, iy, 24, 0, Math.PI * 2);
      ctx.fill();

      if (item.characterId) {
        renderCharacter(item.characterId as CharacterId, ctx, ix, iy, 0.42);
      } else {
        ctx.font = '24px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.emoji || '⭐', ix, iy);
      }
    }

    ctx.restore();
  }

  public getTappedTrayIndex(x: number, y: number, w: number, h: number): number {
    const trayH = 78;
    const trayY = h - trayH;
    if (y < trayY || y > h) return -1;

    const itemW = 62;
    const startX = 36 - this.scrollX;
    const idx = Math.floor((x - startX + itemW / 2) / itemW);
    if (idx >= 0 && idx < STICKER_CATALOG.length) return idx;
    return -1;
  }

  public scrollTray(delta: number): void {
    this.scrollX = Math.max(0, Math.min(this.maxScrollX, this.scrollX + delta));
  }
}
