/**
 * Mode 20: Sleepy Bedtime Barn - Canvas 2D Vector Renderer
 * Adventures of Trishu Preschool Suite
 * Strictly under 500 lines
 */

import { BedtimeBarnLogic } from './BedtimeBarnLogic';
import { SleepyStall, DriftingStar, MoonState, ZzzBubble } from './types';
import { renderCharacter } from '../../graphics/characters';

export class BedtimeBarnRenderer {
  public render(
    ctx: CanvasRenderingContext2D,
    logic: BedtimeBarnLogic,
    w: number,
    h: number
  ): void {
    ctx.save();

    // 1. Twilight sky and barn roof
    this.renderTwilightAndBarn(ctx, w, h);

    // 2. Smiling crescent moon
    this.renderMoon(ctx, logic.moon);

    // 3. Drifting twinkle stars
    for (const star of logic.stars) {
      this.renderStar(ctx, star);
    }

    // 4. Cozy hay floor & stalls
    this.renderStalls(ctx, logic, w, h);

    // 5. Rising Zzz bubbles
    for (const zzz of logic.zzzBubbles) {
      this.renderZzz(ctx, zzz);
    }

    // 6. Star collection jar HUD
    this.renderStarJar(ctx, logic, w, h);

    ctx.restore();
  }

  private renderTwilightAndBarn(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    // Deep starry night sky gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.7);
    skyGrad.addColorStop(0, '#0F172A');
    skyGrad.addColorStop(0.5, '#1E293B');
    skyGrad.addColorStop(1, '#334155');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    // Barn wooden rafters
    ctx.save();
    ctx.fillStyle = '#3E2723';
    ctx.fillRect(0, 0, w, 22);

    ctx.strokeStyle = '#4E342E';
    ctx.lineWidth = 10;
    // Cross beams
    ctx.beginPath();
    ctx.moveTo(0, 22);
    ctx.lineTo(w * 0.5, 70);
    ctx.lineTo(w, 22);
    ctx.stroke();
    ctx.restore();

    // Barn lower hay floor
    const isPortrait = h > w;
    const floorY = isPortrait ? h * 0.64 : h * 0.68;
    const floorGrad = ctx.createLinearGradient(0, floorY, 0, h);
    floorGrad.addColorStop(0, '#5D4037');
    floorGrad.addColorStop(1, '#3E2723');
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, floorY, w, h - floorY);

    // Golden straw bed accents
    ctx.fillStyle = '#FFE082';
    for (let x = 12; x < w; x += 18) {
      ctx.fillRect(x, floorY + 4, 10, 3);
    }
  }

  private renderMoon(ctx: CanvasRenderingContext2D, moon: MoonState): void {
    ctx.save();
    ctx.translate(moon.x, moon.y);

    // Warm moon glow
    ctx.shadowColor = '#FFF59D';
    ctx.shadowBlur = 18;

    // Golden crescent moon
    ctx.fillStyle = '#FFF59D';
    ctx.beginPath();
    ctx.arc(0, 0, moon.radius, 0, Math.PI * 2);
    ctx.fill();

    // Cut out inner circle for crescent curve
    ctx.shadowColor = 'transparent';
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(-moon.radius * 0.38, -moon.radius * 0.25, moon.radius * 0.88, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';

    // Smiling face on moon
    ctx.strokeStyle = '#F57F17';
    ctx.lineWidth = 2.5;

    // Eye (wink or gentle sleeping slit)
    if (moon.isWinking) {
      // Winking eye
      ctx.beginPath();
      ctx.arc(moon.radius * 0.2, -moon.radius * 0.1, 7, 0, Math.PI);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(moon.radius * 0.2, -moon.radius * 0.1, 6, Math.PI, 0);
      ctx.stroke();
    }

    // Gentle smile
    ctx.beginPath();
    ctx.arc(moon.radius * 0.25, moon.radius * 0.18, 9, 0.2, Math.PI - 0.2);
    ctx.stroke();

    // Rosy pink blush
    ctx.fillStyle = 'rgba(255, 138, 128, 0.6)';
    ctx.beginPath();
    ctx.ellipse(moon.radius * 0.42, moon.radius * 0.14, 5, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  private renderStar(ctx: CanvasRenderingContext2D, star: DriftingStar): void {
    ctx.save();
    ctx.translate(star.x, star.y);
    const twinkle = 0.8 + Math.sin(star.twinklePhase) * 0.25;
    ctx.scale(twinkle, twinkle);

    ctx.shadowColor = star.color;
    ctx.shadowBlur = 10;
    ctx.fillStyle = star.color;

    // 4-point twinkle star
    const r = star.radius;
    ctx.beginPath();
    ctx.moveTo(0, -r);
    ctx.quadraticCurveTo(0, 0, r, 0);
    ctx.quadraticCurveTo(0, 0, 0, r);
    ctx.quadraticCurveTo(0, 0, -r, 0);
    ctx.quadraticCurveTo(0, 0, 0, -r);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  private renderStalls(
    ctx: CanvasRenderingContext2D,
    logic: BedtimeBarnLogic,
    _w: number,
    _h: number
  ): void {
    for (const stall of logic.stalls) {
      ctx.save();
      ctx.translate(stall.x, stall.y);

      // Stall wooden box
      const sw = stall.width;
      const sh = stall.height;

      // Wooden frame
      ctx.fillStyle = '#6D4C41';
      ctx.beginPath();
      ctx.roundRect(-sw / 2 - 8, -sh / 2 - 20, sw + 16, sh + 28, 12);
      ctx.fill();

      // Straw bedding inside
      ctx.fillStyle = '#FFE082';
      ctx.fillRect(-sw / 2, -sh / 2 + 10, sw, sh);

      // Animal in stall
      renderCharacter(stall.characterId, ctx, 0, -8, 0.85);

      // Hanging lantern above stall
      this.renderLantern(ctx, 0, -sh / 2 - 32, stall.lanternLit);

      // Patchwork quilt blanket tucked over animal
      if (stall.blanketHeight > 0.05) {
        const bH = (sh * 0.58) * stall.blanketHeight;
        const bY = sh * 0.42 - bH;

        ctx.fillStyle = stall.quiltColor;
        ctx.beginPath();
        ctx.roundRect(-sw / 2 - 4, bY, sw + 8, bH + 20, [12, 12, 0, 0]);
        ctx.fill();

        // Blanket decorative white trim
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-sw / 2 - 4, bY);
        ctx.lineTo(sw / 2 + 4, bY);
        ctx.stroke();

        // Stars / Dots on quilt
        ctx.fillStyle = '#FFFFFF';
        for (let qx = -sw / 2 + 15; qx < sw / 2; qx += 24) {
          ctx.beginPath();
          ctx.arc(qx, bY + 12, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.restore();
    }
  }

  private renderLantern(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    lit: boolean
  ): void {
    ctx.save();
    ctx.translate(x, y);

    // Hanging wire
    ctx.strokeStyle = '#BCAAA4';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -18);
    ctx.lineTo(0, 0);
    ctx.stroke();

    // Lantern cap
    ctx.fillStyle = '#3E2723';
    ctx.beginPath();
    ctx.moveTo(-10, 0);
    ctx.lineTo(10, 0);
    ctx.lineTo(0, -8);
    ctx.closePath();
    ctx.fill();

    // Lantern glass bulb
    if (lit) {
      ctx.shadowColor = '#FFEB3B';
      ctx.shadowBlur = 14;
      ctx.fillStyle = '#FFEE58';
    } else {
      ctx.fillStyle = '#5D4037';
    }
    ctx.beginPath();
    ctx.roundRect(-8, 0, 16, 18, 4);
    ctx.fill();

    ctx.restore();
  }

  private renderZzz(ctx: CanvasRenderingContext2D, zzz: ZzzBubble): void {
    ctx.save();
    ctx.translate(zzz.x, zzz.y);
    ctx.globalAlpha = Math.max(0, zzz.alpha);
    ctx.fillStyle = '#81D4FA';
    ctx.font = `bold ${Math.floor(22 * zzz.scale)}px "Fredoka", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Zzz...', 0, 0);
    ctx.restore();
  }

  private renderStarJar(
    ctx: CanvasRenderingContext2D,
    logic: BedtimeBarnLogic,
    w: number,
    _h: number
  ): void {
    ctx.save();
    const jarX = 36;
    const jarY = 32;

    // Glass jar pill HUD
    ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.beginPath();
    ctx.roundRect(jarX, jarY, 150, 44, 22);
    ctx.fill();
    ctx.strokeStyle = '#FFE082';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.fillStyle = '#FFE082';
    ctx.font = 'bold 20px "Fredoka", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`⭐ Stars: ${logic.starsCollected}`, jarX + 75, jarY + 22);

    if (logic.allTuckedIn) {
      // Good night banner
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.beginPath();
      ctx.roundRect(w / 2 - 140, 20, 280, 48, 24);
      ctx.fill();
      ctx.strokeStyle = '#81D4FA';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = '#E1F5FE';
      ctx.font = 'bold 20px "Fredoka", sans-serif';
      ctx.fillText('🌙 Sweet Dreams! 💤', w / 2, 44);
    }

    ctx.restore();
  }
}
