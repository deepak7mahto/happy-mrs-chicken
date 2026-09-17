/**
 * Mode 5: Leo's Balloon Pop - Pure Canvas Renderer
 * Adventures of Trishu Mini-Game Suite
 */

import { DisplayManager } from '../../engine/DisplayManager';
import { drawLandscapeSkyHills } from '../../graphics/environmentRenderer';
import { renderCharacter } from '../../graphics/characters';
import { CharacterAnimState, CharacterId } from '../../types/characters';
import { getJawRotationAngle, getBalloonPopReaction } from '../../graphics/animations';
import { BalloonEntity } from './types';
import { DinosaurBalloonLogic } from './DinosaurBalloonLogic';

export class DinosaurBalloonRenderer {
  public render(
    ctx: CanvasRenderingContext2D,
    logic: DinosaurBalloonLogic,
    animState: CharacterAnimState,
    display: DisplayManager,
    selectedAvatar: CharacterId
  ): void {
    const vWidth = display.vWidth;
    const vHeight = display.vHeight;
    const isPortrait = display.isPortrait;

    drawLandscapeSkyHills(ctx, vWidth, vHeight, logic.time);

    // Balloons
    for (const b of logic.balloons) {
      if (b.popped) continue;
      this.drawBalloon(ctx, b);
    }

    // Leo / Player Avatar with Plush Dinosaur
    const leoX = isPortrait ? vWidth * 0.76 : 140;
    const leoY = isPortrait ? vHeight - 145 : vHeight - 110;
    const leoScale = isPortrait ? 1.25 : 1.15;
    const jawAngle = getJawRotationAngle(logic.chompTimer);
    const popReaction = getBalloonPopReaction(logic.popTimer);

    renderCharacter(selectedAvatar, ctx, leoX, leoY, leoScale, {
      holdingDino: true,
      dinoChomp: jawAngle > 0 ? jawAngle / (Math.PI / 6) : 0,
      squash: popReaction.surpriseScale,
      eyeBlink: animState.isBlinking,
      facingLeft: isPortrait,
      animState
    });

    // Score & Combo HUD Badge
    this.renderHUD(ctx, display, logic.score, logic.combo);
  }

  private drawBalloon(ctx: CanvasRenderingContext2D, b: BalloonEntity): void {
    ctx.save();
    ctx.translate(b.x, b.y);

    const isGolden = b.color === '#FFD700' || b.color === '#FFC107';
    const r = b.radius;

    // String
    ctx.strokeStyle = 'rgba(100, 100, 100, 0.65)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, r + 4);
    const wave = Math.sin(b.wobblePhase * 1.5) * 6;
    ctx.quadraticCurveTo(wave, r + 24, -wave * 0.5, r + 42);
    ctx.stroke();

    // Balloon Knot
    ctx.fillStyle = isGolden ? '#FFA000' : b.color;
    ctx.beginPath();
    ctx.moveTo(-4, r + 2);
    ctx.lineTo(4, r + 2);
    ctx.lineTo(0, r + 7);
    ctx.closePath();
    ctx.fill();

    // Golden Sparkle Aura
    if (isGolden) {
      ctx.strokeStyle = '#FFE082';
      ctx.lineWidth = 3.5;
      ctx.shadowColor = '#FFD54F';
      ctx.shadowBlur = 12;
    } else {
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.lineWidth = 2.5;
    }

    ctx.fillStyle = b.color;

    if (b.shape === 'DINO') {
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 0.95, r * 1.1, 0, 0, Math.PI * 2);
      ctx.arc(r * 0.65, -r * 0.35, r * 0.42, 0, Math.PI * 2);
      ctx.arc(-r * 0.7, r * 0.35, r * 0.32, 0, Math.PI * 2);
      ctx.arc(-r * 0.3, -r * 0.85, r * 0.22, 0, Math.PI * 2);
      ctx.arc(r * 0.1, -r * 0.9, r * 0.22, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(r * 0.55, -r * 0.45, 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(r * 0.62, -r * 0.45, 2.8, 0, Math.PI * 2);
      ctx.fill();
    } else if (b.shape === 'STAR') {
      ctx.beginPath();
      const points = 5;
      const outerR = r * 1.18;
      const innerR = r * 0.58;
      for (let p = 0; p < points * 2; p++) {
        const rad = (p * Math.PI) / points - Math.PI / 2;
        const currentR = p % 2 === 0 ? outerR : innerR;
        const px = Math.cos(rad) * currentR;
        const py = Math.sin(rad) * currentR;
        if (p === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (b.shape === 'HEART') {
      const s = r * 0.06;
      ctx.save();
      ctx.translate(0, -r * 0.1);
      ctx.beginPath();
      ctx.moveTo(0, 4 * s);
      ctx.bezierCurveTo(-14 * s, -14 * s, -26 * s, 6 * s, 0, 24 * s);
      ctx.bezierCurveTo(26 * s, 6 * s, 14 * s, -14 * s, 0, 4 * s);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    } else {
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 0.88, r * 1.12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    // Specular Highlight Glint
    ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.beginPath();
    ctx.ellipse(-r * 0.35, -r * 0.45, r * 0.25, r * 0.45, -0.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  private renderHUD(
    ctx: CanvasRenderingContext2D,
    display: DisplayManager,
    score: number,
    combo: number
  ): void {
    const isPortrait = display.isPortrait;
    const scoreX = display.vWidth / 2;
    const scoreY = isPortrait ? 76 : Math.max(18, display.vHeight * 0.035);
    const badgeW = isPortrait ? 270 : 240;
    const badgeH = 46;

    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.roundRect(scoreX - badgeW / 2, scoreY, badgeW, badgeH, 23);
    ctx.fill();
    ctx.strokeStyle = '#81C784';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.fillStyle = '#4CAF50';
    ctx.beginPath();
    ctx.arc(scoreX - badgeW / 2 + 28, scoreY + badgeH / 2, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 20px "Fredoka", "Quicksand", "Arial Rounded MT Bold", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    const comboText = combo > 1 ? ` (${combo}x)` : '';
    ctx.fillText(`Score: ${score}${comboText}`, scoreX - badgeW / 2 + 48, scoreY + badgeH / 2 + 1);
    ctx.restore();
  }
}
