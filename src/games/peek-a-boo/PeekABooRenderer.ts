/**
 * Mode 10: Peek-a-Boo Barnyard - Pure Canvas Renderer
 * Adventures of Trishu Mini-Game Suite
 */

import { DisplayManager } from '../../engine/DisplayManager';
import { drawLandscapeSkyHills } from '../../graphics/environmentRenderer';
import { drawMrsClucky } from '../../graphics/characters/chickenRenderer';
import { drawMimi } from '../../graphics/characters/mimiRenderer';
import { drawLeo } from '../../graphics/characters/leoRenderer';
import { drawTrishu } from '../../graphics/characters/trishuRenderer';
import { HidingSpot } from './types';
import { PeekABooLogic } from './PeekABooLogic';

export class PeekABooRenderer {
  public render(
    ctx: CanvasRenderingContext2D,
    logic: PeekABooLogic,
    display: DisplayManager
  ): void {
    const vW = display.vWidth;
    const vH = display.vHeight;
    const isPortrait = display.isPortrait;

    drawLandscapeSkyHills(ctx, vW, vH, logic.time);

    // Render Hiding Spots
    for (const spot of logic.spots) {
      ctx.save();
      ctx.translate(spot.x, spot.y);

      // 1. Draw Peek Hint (if closed) or Character (if open)
      if (spot.isOpen || spot.openProgress > 0) {
        ctx.save();
        const popScale = Math.min(1.0, spot.openProgress * 1.15);
        ctx.scale(popScale, popScale);
        const charY = -spot.h * 0.42 * spot.openProgress;

        if (spot.type === 'BARN') {
          drawMrsClucky(ctx, 0, charY, 0.95, {
            squash: 1.0 + Math.sin(logic.time * 6) * 0.08,
            flap: Math.sin(logic.time * 10) * 0.3,
            headBob: Math.sin(logic.time * 5) * 3,
            eyeBlink: Math.sin(logic.time * 2) > 0.85
          });
        } else if (spot.type === 'BUSH') {
          drawMimi(ctx, 0, charY, 0.95, {
            hopY: Math.sin(logic.time * 8) * 3,
            earFlap: Math.sin(logic.time * 6) * 0.25,
            holdingWand: true,
            blowingBubble: true,
            eyeBlink: Math.sin(logic.time * 2) > 0.85
          });
        } else if (spot.type === 'HAY') {
          drawLeo(ctx, 0, charY, 0.95, {
            holdingDino: true,
            dinoChomp: Math.abs(Math.sin(logic.time * 8)),
            jumpY: Math.sin(logic.time * 6) * 3,
            expression: 'excited',
            eyeBlink: Math.sin(logic.time * 2) > 0.85
          });
        } else if (spot.type === 'BARREL') {
          drawTrishu(ctx, 0, charY, 0.95, {
            jumpY: Math.sin(logic.time * 8) * 4,
            squish: 1.0,
            squash: 1.0,
            armWave: Math.sin(logic.time * 7) * 0.4,
            eyeBlink: Math.sin(logic.time * 2) > 0.85,
            expression: 'excited'
          });
        }
        ctx.restore();
      } else {
        this.renderPeekHint(ctx, spot);
      }

      // 2. Draw the Front Covering Object
      if (spot.type === 'BARN') {
        this.drawBarnDoor(ctx, spot);
      } else if (spot.type === 'BUSH') {
        this.drawGardenBush(ctx, spot);
      } else if (spot.type === 'HAY') {
        this.drawHayBale(ctx, spot);
      } else if (spot.type === 'BARREL') {
        this.drawAppleBarrel(ctx, spot);
      }

      ctx.restore();
    }

    // Score Badge
    const scoreX = vW / 2;
    const scoreY = isPortrait ? 76 : Math.max(18, vH * 0.035);
    const badgeW = isPortrait ? 320 : 300;
    const badgeH = 46;

    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.roundRect(scoreX - badgeW / 2, scoreY, badgeW, badgeH, 23);
    ctx.fill();
    ctx.strokeStyle = '#81C784';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 20px "Fredoka", "Quicksand", "Arial Rounded MT Bold", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`🙈 Friends Found: ${logic.peekFoundCount}  |  ★ ${logic.score}`, scoreX, scoreY + badgeH / 2);
    ctx.restore();

    // Toddler Tap Cue at Bottom
    ctx.save();
    const promptBob = Math.sin(logic.time * 4) * 3;
    ctx.fillStyle = '#FFE600';
    ctx.font = `900 ${isPortrait ? '21px' : '23px'} "Fredoka", "Quicksand", "Arial Rounded MT Bold", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 4;
    const promptY = isPortrait ? Math.min(vH - 35, vH * 0.94) + promptBob : vH - 35 + promptBob;
    ctx.strokeText('👉 TAP TO FIND FRIENDS! 👈', vW / 2, promptY);
    ctx.fillText('👉 TAP TO FIND FRIENDS! 👈', vW / 2, promptY);
    ctx.restore();
  }

  private renderPeekHint(ctx: CanvasRenderingContext2D, spot: HidingSpot): void {
    const wobble = spot.hintWobble * 4;
    ctx.save();
    ctx.translate(wobble, 0);

    if (spot.type === 'BARN') {
      ctx.fillStyle = '#E53935';
      ctx.beginPath();
      ctx.arc(0, -spot.h * 0.38, 12, 0, Math.PI * 2);
      ctx.arc(-8, -spot.h * 0.34, 9, 0, Math.PI * 2);
      ctx.arc(8, -spot.h * 0.34, 9, 0, Math.PI * 2);
      ctx.fill();
    } else if (spot.type === 'BUSH') {
      ctx.fillStyle = '#FAFAFA';
      ctx.strokeStyle = '#E0E0E0';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(-10, -spot.h * 0.42, 6, 18, -0.15, 0, Math.PI * 2);
      ctx.ellipse(10, -spot.h * 0.42, 6, 18, 0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#F8BBD0';
      ctx.beginPath();
      ctx.ellipse(-10, -spot.h * 0.42, 3.5, 12, -0.15, 0, Math.PI * 2);
      ctx.ellipse(10, -spot.h * 0.42, 3.5, 12, 0.15, 0, Math.PI * 2);
      ctx.fill();
    } else if (spot.type === 'HAY') {
      ctx.fillStyle = '#4CAF50';
      ctx.strokeStyle = '#2E7D32';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(25, -spot.h * 0.2);
      ctx.quadraticCurveTo(45 + wobble, -spot.h * 0.38, 38, -spot.h * 0.45);
      ctx.quadraticCurveTo(30, -spot.h * 0.35, 18, -spot.h * 0.15);
      ctx.fill();
      ctx.stroke();
    } else if (spot.type === 'BARREL') {
      ctx.fillStyle = '#E53935';
      ctx.beginPath();
      ctx.arc(-14, -spot.h * 0.34, 7, 0, Math.PI * 2);
      ctx.arc(14, -spot.h * 0.34, 7, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  private drawBarnDoor(ctx: CanvasRenderingContext2D, spot: HidingSpot): void {
    const hw = spot.w * 0.45;
    const hh = spot.h * 0.45;
    const openOffset = spot.openProgress * (hw * 0.7);

    ctx.fillStyle = '#C62828';
    ctx.strokeStyle = '#5D4037';
    ctx.lineWidth = 4;

    // Left Door
    ctx.save();
    ctx.translate(-openOffset, 0);
    ctx.beginPath();
    ctx.roundRect(-hw, -hh, hw, hh * 2, 8);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = '#B71C1C';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-hw + 6, -hh + 6); ctx.lineTo(-6, hh - 6);
    ctx.moveTo(-6, -hh + 6); ctx.lineTo(-hw + 6, hh - 6);
    ctx.stroke();
    ctx.restore();

    // Right Door
    ctx.save();
    ctx.translate(openOffset, 0);
    ctx.beginPath();
    ctx.roundRect(0, -hh, hw, hh * 2, 8);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = '#B71C1C';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(6, -hh + 6); ctx.lineTo(hw - 6, hh - 6);
    ctx.moveTo(hw - 6, -hh + 6); ctx.lineTo(6, hh - 6);
    ctx.stroke();
    ctx.restore();
  }

  private drawGardenBush(ctx: CanvasRenderingContext2D, spot: HidingSpot): void {
    const hw = spot.w * 0.44;
    const hh = spot.h * 0.38;
    ctx.fillStyle = '#43A047';
    ctx.strokeStyle = '#2E7D32';
    ctx.lineWidth = 3.5;

    ctx.beginPath();
    ctx.arc(-hw * 0.5, 0, hh * 0.75, 0, Math.PI * 2);
    ctx.arc(hw * 0.5, 0, hh * 0.75, 0, Math.PI * 2);
    ctx.arc(0, -hh * 0.3, hh * 0.85, 0, Math.PI * 2);
    ctx.arc(0, hh * 0.2, hh * 0.85, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#FFF59D';
    ctx.beginPath();
    ctx.arc(-hw * 0.3, -hh * 0.2, 5, 0, Math.PI * 2);
    ctx.arc(hw * 0.35, -hh * 0.1, 5, 0, Math.PI * 2);
    ctx.arc(0, hh * 0.25, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawHayBale(ctx: CanvasRenderingContext2D, spot: HidingSpot): void {
    const hw = spot.w * 0.45;
    const hh = spot.h * 0.36;
    ctx.fillStyle = '#FDD835';
    ctx.strokeStyle = '#F57F17';
    ctx.lineWidth = 3.5;

    ctx.beginPath();
    ctx.roundRect(-hw, -hh, hw * 2, hh * 2, 12);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = '#D84315';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-hw * 0.4, -hh); ctx.lineTo(-hw * 0.4, hh);
    ctx.moveTo(hw * 0.4, -hh); ctx.lineTo(hw * 0.4, hh);
    ctx.stroke();
  }

  private drawAppleBarrel(ctx: CanvasRenderingContext2D, spot: HidingSpot): void {
    const hw = spot.w * 0.38;
    const hh = spot.h * 0.42;
    ctx.fillStyle = '#795548';
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 3.5;

    ctx.beginPath();
    ctx.roundRect(-hw, -hh, hw * 2, hh * 2, 10);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = '#455A64';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-hw, -hh * 0.5); ctx.lineTo(hw, -hh * 0.5);
    ctx.moveTo(-hw, hh * 0.5); ctx.lineTo(hw, hh * 0.5);
    ctx.stroke();
  }
}
