/**
 * Adventures of Trishu — Mode 3: Fluffy Chick Trail
 * Dedicated Canvas 2D Renderer (Zero State Leaks)
 */

import { DisplayManager } from '../../engine/DisplayManager';
import { drawBabyChick } from '../../graphics/characters/chickRenderer';
import { PALETTE } from '../../graphics/palette';
import { ChickEntity, SeedEntity, PastureFence, CoopDoor } from './types';

export class ChickMazeRenderer {
  public static renderScene(
    ctx: CanvasRenderingContext2D,
    display: DisplayManager,
    time: number,
    chicks: ChickEntity[],
    seeds: SeedEntity[],
    fences: PastureFence[],
    coopDoor: CoopDoor,
    score: number,
    round: number,
    coopSavedCount: number
  ): void {
    const isPortrait = display.isPortrait;
    const vWidth = display.vWidth;
    const vHeight = display.vHeight;

    // 1. Grass Background
    ctx.save();
    ctx.fillStyle = '#81C784';
    ctx.fillRect(0, 0, vWidth, vHeight);

    // Subtle grass texture clovers
    ctx.fillStyle = '#66BB6A';
    for (let gx = 60; gx < vWidth - 40; gx += 90) {
      for (let gy = 140; gy < vHeight - 40; gy += 100) {
        ctx.beginPath();
        ctx.arc(gx, gy, 3.5, 0, Math.PI * 2);
        ctx.arc(gx + 4, gy + 3, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();

    // 2. Wooden Pasture Fences
    ctx.save();
    ctx.fillStyle = PALETTE.FENCE_WOOD;
    ctx.strokeStyle = PALETTE.FENCE_OUTLINE;
    ctx.lineWidth = 3;
    for (const f of fences) {
      ctx.beginPath();
      ctx.roundRect(f.x, f.y, f.w, f.h, 6);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();

    // 3. Hen Coop
    ctx.save();
    ctx.translate(coopDoor.x, coopDoor.y);
    ctx.fillStyle = PALETTE.COOP_WALL;
    ctx.strokeStyle = PALETTE.COOP_ROOF;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(-55, -45, 110, 85, 12);
    ctx.fill();
    ctx.stroke();

    // Red coop roof
    ctx.fillStyle = PALETTE.COOP_ROOF;
    ctx.beginPath();
    ctx.moveTo(-65, -42);
    ctx.lineTo(0, -82);
    ctx.lineTo(65, -42);
    ctx.closePath();
    ctx.fill();

    // Cozy coop entrance
    ctx.fillStyle = '#212121';
    ctx.beginPath();
    ctx.arc(0, 8, coopDoor.r, 0, Math.PI * 2);
    ctx.fill();

    // Golden hay nest in door
    ctx.fillStyle = PALETTE.HAY_LIGHT;
    ctx.beginPath();
    ctx.ellipse(0, 20, 28, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 4. Seeds
    for (const s of seeds) {
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.fillStyle = '#FFF176';
      ctx.strokeStyle = '#F57F17';
      ctx.lineWidth = 1.5;
      for (let k = 0; k < 3; k++) {
        const ang = (k * Math.PI * 2) / 3;
        ctx.beginPath();
        ctx.ellipse(Math.cos(ang) * 4, Math.sin(ang) * 4, 3.5, 2, ang, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
    }

    // 5. Baby Chicks
    for (const chick of chicks) {
      ctx.save();
      ctx.translate(chick.x, chick.y);
      if (chick.facingLeft) {
        ctx.scale(-1, 1);
      }
      drawBabyChick(ctx, 0, 0, 1.1, { walkCycle: chick.walkCycle });
      ctx.restore();
    }

    // 6. HUD Pills
    this.renderHUD(ctx, score, round, coopSavedCount, vWidth);
  }

  private static renderHUD(
    ctx: CanvasRenderingContext2D,
    score: number,
    round: number,
    coopSavedCount: number,
    vWidth: number
  ): void {
    ctx.save();
    const pillX = vWidth - 85;
    const pillY = 32;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
    ctx.strokeStyle = '#388E3C';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(pillX - 60, pillY - 17, 120, 34, 17);
    ctx.fill();
    ctx.stroke();

    ctx.font = '900 15px "Fredoka", "Quicksand", sans-serif';
    ctx.fillStyle = '#1B5E20';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`🐥 R${round} • ${score}`, pillX, pillY);
    ctx.restore();
  }
}
