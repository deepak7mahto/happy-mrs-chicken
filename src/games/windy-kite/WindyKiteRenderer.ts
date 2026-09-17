/**
 * Mode 14: Windy Castle Kite - Pure Canvas Renderer
 * Adventures of Trishu Mini-Game Suite
 */

import { DisplayManager } from '../../engine/DisplayManager';
import { drawLandscapeSkyHills } from '../../graphics/environmentRenderer';
import { renderCharacter } from '../../graphics/characters';
import { CharacterId } from '../../types/characters';
import { WindyKiteLogic } from './WindyKiteLogic';

export class WindyKiteRenderer {
  public render(
    ctx: CanvasRenderingContext2D,
    logic: WindyKiteLogic,
    display: DisplayManager,
    selectedAvatar: CharacterId
  ): void {
    const vWidth = display.vWidth;
    const vHeight = display.vHeight;

    drawLandscapeSkyHills(ctx, vWidth, vHeight, logic.time);

    // Puffy Sheep Clouds
    for (const c of logic.clouds) {
      ctx.save();
      ctx.translate(c.x, c.y);
      const scale = c.puffTimer > 0 ? 1.0 + Math.sin(c.puffTimer * Math.PI) * 0.35 : 1.0;
      ctx.scale(scale, scale);

      // Cloud body puffs
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#CFD8DC';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, c.radius * 0.7, 0, Math.PI * 2);
      ctx.arc(-c.radius * 0.45, 0, c.radius * 0.5, 0, Math.PI * 2);
      ctx.arc(c.radius * 0.45, 0, c.radius * 0.5, 0, Math.PI * 2);
      ctx.arc(-c.radius * 0.2, -c.radius * 0.35, c.radius * 0.45, 0, Math.PI * 2);
      ctx.arc(c.radius * 0.2, -c.radius * 0.35, c.radius * 0.45, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Sheep Face
      ctx.fillStyle = '#FFE0B2';
      ctx.beginPath();
      ctx.ellipse(c.radius * 0.5, 0, 10, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      // Sheep ear & eye
      ctx.fillStyle = '#FFA726';
      ctx.beginPath();
      ctx.ellipse(c.radius * 0.5 + 4, -8, 5, 3, 0.4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(c.radius * 0.5 + 4, -1, 1.8, 0, Math.PI * 2);
      ctx.fill();

      if (c.puffTimer > 0) {
        ctx.strokeStyle = '#FFF59D';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, c.radius * 1.15, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Rainbow Spiral Ribbon Trail
    for (const p of logic.trail) {
      ctx.save();
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Floating Rainbow Ribbons (Stars)
    for (const r of logic.ribbons) {
      if (!r.collected) {
        const floatY = r.y + Math.sin(logic.time * 3 + r.x) * 8;
        ctx.save();
        ctx.translate(r.x, floatY);

        ctx.fillStyle = r.color;
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, 0, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.font = 'bold 13px "Fredoka", "Quicksand", "Arial Rounded MT Bold", sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('★', 0, 1);
        ctx.restore();
      }
    }

    // Player Avatar on Ground
    const trishuX = 85;
    const trishuY = vHeight - 110;
    renderCharacter(selectedAvatar, ctx, trishuX, trishuY, 0.65, {
      armWave: Math.sin(logic.time * 4) * 0.25,
      eyeBlink: Math.sin(logic.time * 2.2) > 0.85,
      jumpY: logic.loopTimer > 0 ? 8 : 0,
      expression: 'excited'
    });

    // Kite String
    ctx.save();
    ctx.strokeStyle = '#ECEFF1';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(trishuX + 18, trishuY - 20);
    const midX = (trishuX + logic.kiteX) / 2;
    const midY = (trishuY + logic.kiteY) / 2 + 25;
    ctx.quadraticCurveTo(midX, midY, logic.kiteX, logic.kiteY + 28);
    ctx.stroke();
    ctx.restore();

    // The Flying Kite
    ctx.save();
    ctx.translate(logic.kiteX, logic.kiteY);
    const loopAngle = logic.loopTimer > 0 ? Math.sin(logic.loopTimer * 10) * 0.4 : Math.sin(logic.time * 2) * 0.12;
    ctx.rotate(loopAngle);

    // Kite Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
    ctx.beginPath();
    ctx.moveTo(0, -32 + 6);
    ctx.lineTo(26, 0 + 6);
    ctx.lineTo(0, 32 + 6);
    ctx.lineTo(-26, 0 + 6);
    ctx.closePath();
    ctx.fill();

    // 4 Quadrants of the Diamond Kite
    const drawFacet = (p1x: number, p1y: number, p2x: number, p2y: number, color: string) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(p1x, p1y);
      ctx.lineTo(p2x, p2y);
      ctx.closePath();
      ctx.fill();
    };

    drawFacet(0, -32, 26, 0, '#FF1744');
    drawFacet(26, 0, 0, 32, '#FFEA00');
    drawFacet(0, 32, -26, 0, '#00E676');
    drawFacet(-26, 0, 0, -32, '#2979FF');

    // Diamond Border & Cross Spars
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, -32);
    ctx.lineTo(26, 0);
    ctx.lineTo(0, 32);
    ctx.lineTo(-26, 0);
    ctx.closePath();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, -32);
    ctx.lineTo(0, 32);
    ctx.moveTo(-26, 0);
    ctx.lineTo(26, 0);
    ctx.stroke();

    // Fluttering Tail Ribbons
    ctx.strokeStyle = '#37474F';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 32);
    for (let i = 1; i <= Math.min(6, logic.ribbonBows.length); i++) {
      const tailX = Math.sin(logic.time * 6 + i * 0.8) * (14 + i * 4);
      const tailY = 32 + i * 18;
      ctx.lineTo(tailX, tailY);
    }
    ctx.stroke();

    // Bow ties on the tail
    for (let i = 1; i <= Math.min(6, logic.ribbonBows.length); i++) {
      const bowX = Math.sin(logic.time * 6 + i * 0.8) * (14 + i * 4);
      const bowY = 32 + i * 18;
      ctx.fillStyle = logic.ribbonBows[i % logic.ribbonBows.length];
      ctx.beginPath();
      ctx.ellipse(bowX, bowY, 8, 4, Math.sin(logic.time * 4) * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Tap Prompt
    ctx.save();
    ctx.font = 'bold 15px "Fredoka", "Quicksand", "Arial Rounded MT Bold", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#37474F';
    ctx.fillText('🪁 Tap anywhere to swoop the kite!', vWidth / 2, vHeight - 30);
    ctx.restore();

    // Top HUD Pill Badge
    const isPortrait = display.isPortrait;
    const scoreX = vWidth / 2;
    const scoreY = isPortrait ? 76 : Math.max(18, vHeight * 0.035);
    const badgeW = isPortrait ? 270 : 250;
    const badgeH = 46;

    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.48)';
    ctx.beginPath();
    ctx.roundRect(scoreX - badgeW / 2, scoreY, badgeW, badgeH, 23);
    ctx.fill();
    ctx.strokeStyle = '#FFE082';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 19px "Fredoka", "Quicksand", "Arial Rounded MT Bold", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`✨ Stars: ${logic.collectedCount}  |  ★ ${logic.score}`, scoreX, scoreY + badgeH / 2);
    ctx.restore();
  }
}
