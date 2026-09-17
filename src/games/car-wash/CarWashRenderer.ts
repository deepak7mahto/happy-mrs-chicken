/**
 * Mode 13: Muddy Car Wash - Pure Canvas Renderer
 * Adventures of Trishu Mini-Game Suite
 */

import { DisplayManager } from '../../engine/DisplayManager';
import { renderCharacter } from '../../graphics/characters';
import { CharacterId } from '../../types/characters';
import { CarWashLogic } from './CarWashLogic';

export class CarWashRenderer {
  public render(
    ctx: CanvasRenderingContext2D,
    logic: CarWashLogic,
    display: DisplayManager,
    selectedAvatar: CharacterId
  ): void {
    const vWidth = display.vWidth;
    const vHeight = display.vHeight;
    const cx = vWidth / 2;
    const cy = vHeight / 2 + 30;

    // Driveway & Sky
    ctx.save();
    ctx.fillStyle = '#B3E5FC';
    ctx.fillRect(0, 0, vWidth, vHeight);

    // Green Grass Garden
    ctx.fillStyle = '#81C784';
    ctx.fillRect(0, cy + 85, vWidth, vHeight - (cy + 85));

    // Driveway Pavement
    ctx.fillStyle = '#B0BEC5';
    ctx.fillRect(30, cy + 70, vWidth - 60, 30);
    ctx.restore();

    // Player Avatar Character Watching on Left
    ctx.save();
    renderCharacter(selectedAvatar, ctx, 70, cy + 20, 0.45, {
      panicStage: 0,
      time: logic.time,
      eyeBlink: Math.sin(logic.time * 2) > 0.85,
      expression: 'happy'
    });
    ctx.restore();

    // Family Car Shadow
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 80, 160, 22, 0, 0, Math.PI * 2);
    ctx.fill();

    // Car Body
    ctx.fillStyle = '#E53935';
    ctx.strokeStyle = '#B71C1C';
    ctx.lineWidth = 4;

    ctx.beginPath();
    ctx.roundRect(cx - 145, cy - 10, 290, 75, 18);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx - 95, cy - 10);
    ctx.lineTo(cx - 65, cy - 85);
    ctx.lineTo(cx + 65, cy - 85);
    ctx.lineTo(cx + 105, cy - 10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Windows
    ctx.fillStyle = '#E1F5FE';
    ctx.strokeStyle = '#0288D1';
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    ctx.moveTo(cx - 85, cy - 12);
    ctx.lineTo(cx - 60, cy - 78);
    ctx.lineTo(cx - 5, cy - 78);
    ctx.lineTo(cx - 5, cy - 12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx + 5, cy - 12);
    ctx.lineTo(cx + 5, cy - 78);
    ctx.lineTo(cx + 58, cy - 78);
    ctx.lineTo(cx + 92, cy - 12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Headlights
    ctx.fillStyle = '#FFEE58';
    ctx.strokeStyle = '#FBC02D';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(cx - 142, cy + 12, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Wheels
    const drawWheel = (wx: number, wy: number) => {
      ctx.fillStyle = '#212121';
      ctx.strokeStyle = '#BDBDBD';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(wx, wy, 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#EEEEEE';
      ctx.beginPath();
      ctx.arc(wx, wy, 12, 0, Math.PI * 2);
      ctx.fill();
    };

    drawWheel(cx - 85, cy + 68);
    drawWheel(cx + 85, cy + 68);
    ctx.restore();

    // Mud Spots Overlay
    for (const m of logic.mudSpots) {
      if (!m.cleaned) {
        ctx.save();
        ctx.translate(m.x, m.y);

        ctx.fillStyle = '#5D4037';
        ctx.beginPath();
        ctx.arc(0, 0, m.radius, 0, Math.PI * 2);
        ctx.arc(-m.radius * 0.7, -m.radius * 0.4, m.radius * 0.5, 0, Math.PI * 2);
        ctx.arc(m.radius * 0.6, -m.radius * 0.5, m.radius * 0.45, 0, Math.PI * 2);
        ctx.arc(m.radius * 0.5, m.radius * 0.6, m.radius * 0.55, 0, Math.PI * 2);
        ctx.fill();

        if (m.sudsLevel > 0) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
          ctx.beginPath();
          ctx.arc(0, 0, m.radius * m.sudsLevel, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }
    }

    // Soap Bubbles
    for (const b of logic.bubbles) {
      ctx.save();
      ctx.fillStyle = b.color;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // Celebration
    if (logic.celebrationTimer > 0) {
      ctx.save();
      ctx.font = '900 36px "Fredoka", "Quicksand", "Arial Rounded MT Bold", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#FFD600';
      ctx.strokeStyle = '#E65100';
      ctx.lineWidth = 5;
      ctx.strokeText('✨ ALL CLEAN! ✨', cx, cy - 110);
      ctx.fillText('✨ ALL CLEAN! ✨', cx, cy - 110);
      ctx.restore();
    }

    // Instruction Pill
    ctx.save();
    ctx.font = 'bold 15px "Fredoka", "Quicksand", "Arial Rounded MT Bold", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#37474F';
    ctx.fillText('🧽 Tap & scrub the mud away!', cx, vHeight - 30);
    ctx.restore();

    // Top HUD Pill Badge
    const isPortrait = display.isPortrait;
    const scoreX = cx;
    const scoreY = isPortrait ? 76 : Math.max(18, vHeight * 0.035);
    const badgeW = isPortrait ? 280 : 260;
    const badgeH = 46;

    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.48)';
    ctx.beginPath();
    ctx.roundRect(scoreX - badgeW / 2, scoreY, badgeW, badgeH, 23);
    ctx.fill();
    ctx.strokeStyle = '#80DEEA';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 19px "Fredoka", "Quicksand", "Arial Rounded MT Bold", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`🚗 Cleaned: ${logic.cleanCarsCount}  |  ★ ${logic.score}`, scoreX, scoreY + badgeH / 2);
    ctx.restore();
  }
}
