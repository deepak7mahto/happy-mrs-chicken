/**
 * Mode 11: Miss Bunny's Ice Cream Van - Pure Canvas Renderer
 * Adventures of Trishu Mini-Game Suite
 */

import { DisplayManager } from '../../engine/DisplayManager';
import { drawLandscapeSkyHills } from '../../graphics/environmentRenderer';
import { drawMimi, renderCharacter } from '../../graphics/characters';
import { IceCreamVanLogic } from './IceCreamVanLogic';
import { CharacterId } from '../../types/characters';

export class IceCreamVanRenderer {
  public render(
    ctx: CanvasRenderingContext2D,
    logic: IceCreamVanLogic,
    display: DisplayManager,
    selectedAvatar: CharacterId
  ): void {
    const vWidth = display.vWidth;
    const vHeight = display.vHeight;
    const isPortrait = display.isPortrait;

    drawLandscapeSkyHills(ctx, vWidth, vHeight, logic.time);

    // Awning & Counter
    const awningY = isPortrait ? 130 : 60;
    ctx.save();
    ctx.fillStyle = '#FFF9C4';
    ctx.beginPath();
    ctx.roundRect(16, awningY, vWidth - 32, 100, 16);
    ctx.fill();

    const stripeW = (vWidth - 32) / 8;
    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = i % 2 === 0 ? '#E91E63' : '#FFFFFF';
      ctx.beginPath();
      ctx.roundRect(16 + i * stripeW, awningY, stripeW, 26, [8, 8, 4, 4]);
      ctx.fill();
    }

    ctx.font = '900 22px "Fredoka", "Quicksand", "Arial Rounded MT Bold", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#C2185B';
    ctx.fillText("🍦 Miss Bunny's Ice Cream 🍦", vWidth / 2, awningY + 54);
    ctx.restore();

    // Miss Bunny Host on Left
    ctx.save();
    drawMimi(ctx, 65, isPortrait ? 230 : 200, 0.45, {
      earFlap: Math.sin(logic.time * 4) * 0.15,
      hopY: Math.abs(Math.sin(logic.time * 5)) * 6,
      holdingWand: false,
      blowingBubble: false,
      eyeBlink: Math.sin(logic.time * 2) > 0.85
    });
    ctx.restore();

    // Customer on Right: Selected Avatar
    ctx.save();
    const custX = vWidth - 65;
    const custY = isPortrait ? 235 : 205;
    renderCharacter(selectedAvatar, ctx, custX, custY, 0.45, {
      jumpY: logic.celebrationTimer > 0 ? Math.abs(Math.sin(logic.time * 8)) * 10 : 0,
      squish: 1.0,
      squash: 1.0,
      armWave: Math.sin(logic.time * 5) * 0.25,
      eyeBlink: Math.sin(logic.time * 2.2) > 0.85,
      expression: 'happy'
    });
    ctx.restore();

    // Customer Order Speech Bubble
    this.renderSpeechBubble(ctx, custX - 28, custY - 48, logic.scoops.length);

    // Big Waffle Cone in Center
    const coneX = vWidth / 2;
    const coneY = vHeight - 145;

    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.14)';
    ctx.beginPath();
    ctx.ellipse(coneX, coneY + 12, 38, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFB74D';
    ctx.strokeStyle = '#E65100';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(coneX - 32, coneY - 10);
    ctx.lineTo(coneX + 32, coneY - 10);
    ctx.lineTo(coneX, coneY + 58);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = '#F57C00';
    ctx.lineWidth = 1.5;
    for (let i = -20; i <= 20; i += 10) {
      ctx.beginPath();
      ctx.moveTo(coneX + i, coneY - 8);
      ctx.lineTo(coneX + i / 2, coneY + 50);
      ctx.stroke();
    }
    ctx.restore();

    // Stacked Scoops
    const baseScoopY = coneY - 22;
    for (let i = 0; i < logic.scoops.length; i++) {
      const s = logic.scoops[i];
      const wobble = Math.sin(logic.time * 4 + s.wobblePhase) * Math.min(8, (i + 1) * 1.5);
      const scoopY = baseScoopY - i * 28;

      ctx.save();
      ctx.translate(coneX + wobble, scoopY);
      ctx.scale(s.scale, s.scale);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.beginPath();
      ctx.arc(0, 4, 30, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = s.color;
      ctx.strokeStyle = s.borderColor;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(0, 0, 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(-18, 18, 10, 0, Math.PI * 2);
      ctx.arc(0, 20, 11, 0, Math.PI * 2);
      ctx.arc(18, 18, 10, 0, Math.PI * 2);
      ctx.fill();

      if (s.hasCherry) {
        ctx.fillStyle = '#D50000';
        ctx.strokeStyle = '#B71C1C';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, -28, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = '#33691E';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(0, -38);
        ctx.quadraticCurveTo(8, -48, 12, -44);
        ctx.stroke();
      }
      ctx.restore();
    }

    if (logic.munchTimer > 0) {
      ctx.save();
      ctx.font = '900 36px "Fredoka", "Quicksand", "Arial Rounded MT Bold", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#E91E63';
      ctx.fillText('YUM YUM! 😋', vWidth / 2, coneY - 90);
      ctx.restore();
    }

    // Flavor Tubs
    const flavors = logic.getFlavors(vWidth, vHeight);
    for (const f of flavors) {
      ctx.save();
      ctx.translate(f.x, f.y);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.16)';
      ctx.beginPath();
      ctx.ellipse(0, f.radius + 2, f.radius, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = f.color;
      ctx.strokeStyle = f.borderColor;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, f.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, -4, f.radius * 0.65, 0, Math.PI * 2);
      ctx.stroke();

      ctx.font = 'bold 12px "Fredoka", "Quicksand", "Arial Rounded MT Bold", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#37474F';
      ctx.fillText(f.name, 0, 2);
      ctx.restore();
    }

    // Top HUD Pill Badge
    const scoreX = vWidth / 2;
    const scoreY = isPortrait ? 76 : Math.max(18, vHeight * 0.035);
    const badgeW = isPortrait ? 280 : 260;
    const badgeH = 46;

    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.48)';
    ctx.beginPath();
    ctx.roundRect(scoreX - badgeW / 2, scoreY, badgeW, badgeH, 23);
    ctx.fill();
    ctx.strokeStyle = '#F48FB1';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 19px "Fredoka", "Quicksand", "Arial Rounded MT Bold", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`🍨 Scoops: ${logic.totalScooped}  |  ★ ${logic.score}`, scoreX, scoreY + badgeH / 2);
    ctx.restore();
  }

  private renderSpeechBubble(ctx: CanvasRenderingContext2D, x: number, y: number, scoops: number): void {
    const text = scoops >= 3 ? 'Yummy! Eat it! 😋' : 'More please! 🍦';
    ctx.save();
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#FF80AB';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(x - 90, y - 16, 100, 26, 12);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#C2185B';
    ctx.font = 'bold 11px "Fredoka", "Quicksand", "Arial Rounded MT Bold", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x - 40, y - 3);
    ctx.restore();
  }
}
