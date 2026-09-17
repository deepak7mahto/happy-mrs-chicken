/**
 * Mode 12: Grandpa's Little Train - Pure Canvas Renderer
 * Adventures of Trishu Mini-Game Suite
 */

import { DisplayManager } from '../../engine/DisplayManager';
import { renderCharacter, drawTrishu, drawMimi, drawLeo, drawBabyChick } from '../../graphics/characters';
import { LittleTrainLogic } from './LittleTrainLogic';
import { CharacterId } from '../../types/characters';

export class LittleTrainRenderer {
  public render(
    ctx: CanvasRenderingContext2D,
    logic: LittleTrainLogic,
    display: DisplayManager,
    selectedAvatar: CharacterId
  ): void {
    const vWidth = display.vWidth;
    const vHeight = display.vHeight;
    const isPortrait = display.isPortrait;
    const trackY = vHeight - 90;

    // Sky and Hills with parallax
    ctx.save();
    ctx.fillStyle = '#81D4FA';
    ctx.fillRect(0, 0, vWidth, vHeight);

    // Sun
    ctx.fillStyle = '#FFEE58';
    ctx.beginPath();
    ctx.arc(vWidth - 80, 80, 42, 0, Math.PI * 2);
    ctx.fill();

    // Far green hills (parallax)
    const hillOff = (logic.trainX * 0.2) % vWidth;
    ctx.fillStyle = '#81C784';
    ctx.beginPath();
    ctx.arc(vWidth * 0.3 - hillOff, vHeight - 70, 220, Math.PI, 0);
    ctx.arc(vWidth * 0.9 - hillOff, vHeight - 70, 260, Math.PI, 0);
    ctx.arc(vWidth * 1.5 - hillOff, vHeight - 70, 240, Math.PI, 0);
    ctx.fill();

    // Near Green Ground
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(0, trackY, vWidth, vHeight - trackY);

    // Railroad Track Sleepers & Rails
    ctx.fillStyle = '#795548';
    for (let x = -(logic.trainX % 30); x < vWidth + 30; x += 30) {
      ctx.fillRect(x, trackY + 8, 14, 16);
    }
    // Rails
    ctx.fillStyle = '#9E9E9E';
    ctx.fillRect(0, trackY + 10, vWidth, 4);
    ctx.fillRect(0, trackY + 20, vWidth, 4);
    ctx.restore();

    // Upcoming Station Platforms
    for (const st of logic.stations) {
      const screenX = st.x - logic.trainX + 170;
      if (screenX > -100 && screenX < vWidth + 100) {
        ctx.save();
        ctx.fillStyle = '#FFF59D';
        ctx.strokeStyle = '#FBC02D';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect(screenX - 30, trackY - 45, 60, 22, 6);
        ctx.fill();
        ctx.stroke();

        ctx.font = 'bold 11px "Fredoka", "Quicksand", "Arial Rounded MT Bold", sans-serif';
        ctx.fillStyle = '#F57F17';
        ctx.textAlign = 'center';
        ctx.fillText('STATION', screenX, trackY - 30);

        if (!st.pickedUp) {
          if (st.type === 'mimi') {
            drawMimi(ctx, screenX, trackY - 10, 0.35, { hopY: Math.abs(Math.sin(logic.time * 6)) * 8, earFlap: 0.2 });
          } else if (st.type === 'leo') {
            drawLeo(ctx, screenX, trackY - 10, 0.35, { jumpY: Math.abs(Math.sin(logic.time * 5)) * 6 });
          } else if (st.type === 'chick') {
            drawBabyChick(ctx, screenX, trackY - 5, 0.6, { isPeeping: true, walkCycle: logic.time * 8 });
          }
        }
        ctx.restore();
      }
    }

    // Steam Puffs
    for (const p of logic.steamPuffs) {
      ctx.save();
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, p.life * 0.85)})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Train Carriages
    const trainBaseX = 170;
    const trainBaseY = trackY + 5;
    const carriageCount = Math.min(3, Math.max(1, logic.passengers.length));

    for (let c = carriageCount; c >= 1; c--) {
      const carX = trainBaseX - c * 95;
      ctx.save();
      ctx.fillStyle = '#424242';
      ctx.fillRect(carX + 75, trainBaseY - 15, 25, 6);

      ctx.fillStyle = c === 1 ? '#42A5F5' : '#AB47BC';
      ctx.strokeStyle = c === 1 ? '#1565C0' : '#6A1B9A';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.roundRect(carX, trainBaseY - 50, 80, 42, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#212121';
      ctx.strokeStyle = '#BDBDBD';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(carX + 18, trainBaseY - 4, 12, 0, Math.PI * 2);
      ctx.arc(carX + 62, trainBaseY - 4, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      const pass = logic.passengers[c - 1];
      if (pass === 'trishu') {
        drawTrishu(ctx, carX + 40, trainBaseY - 45, 0.32, { armWave: Math.sin(logic.time * 6) * 0.2 });
      } else if (pass === 'mimi') {
        drawMimi(ctx, carX + 40, trainBaseY - 45, 0.32, { hopY: 0 });
      } else if (pass === 'leo') {
        drawLeo(ctx, carX + 40, trainBaseY - 45, 0.32, { holdingDino: true });
      } else if (pass === 'chick') {
        drawBabyChick(ctx, carX + 40, trainBaseY - 40, 0.5, { isPeeping: true });
      }
      ctx.restore();
    }

    // Engine Locomotive
    ctx.save();
    ctx.fillStyle = '#E53935';
    ctx.strokeStyle = '#B71C1C';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.roundRect(trainBaseX, trainBaseY - 60, 95, 52, [12, 20, 4, 4]);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#FFCA28';
    ctx.beginPath();
    ctx.roundRect(trainBaseX - 5, trainBaseY - 65, 55, 10, 5);
    ctx.fill();

    ctx.fillStyle = '#424242';
    ctx.fillRect(trainBaseX + 68, trainBaseY - 82, 16, 26);
    ctx.fillStyle = '#FFD54F';
    ctx.beginPath();
    ctx.ellipse(trainBaseX + 76, trainBaseY - 82, 12, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFA000';
    ctx.beginPath();
    ctx.moveTo(trainBaseX + 95, trainBaseY - 10);
    ctx.lineTo(trainBaseX + 115, trainBaseY - 2);
    ctx.lineTo(trainBaseX + 95, trainBaseY - 2);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#212121';
    ctx.strokeStyle = '#FFF';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(trainBaseX + 22, trainBaseY - 6, 16, 0, Math.PI * 2);
    ctx.arc(trainBaseX + 58, trainBaseY - 6, 16, 0, Math.PI * 2);
    ctx.arc(trainBaseX + 85, trainBaseY - 6, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    renderCharacter(selectedAvatar, ctx, trainBaseX + 22, trainBaseY - 55, 0.35, {
      pullTension: 0,
      eyeBlink: Math.sin(logic.time * 2) > 0.85,
      expression: 'happy'
    });
    ctx.restore();

    // Whistle Callout
    if (logic.whistleTimer > 0) {
      ctx.save();
      ctx.font = '900 32px "Fredoka", "Quicksand", "Arial Rounded MT Bold", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#FF6F00';
      ctx.fillText('TOOT! TOOT! 🚂💨', trainBaseX + 75, trainBaseY - 105);
      ctx.restore();
    }

    // Mountain Tunnel Darkness & Glowing Headlight
    if (logic.isInTunnel) {
      ctx.save();
      ctx.fillStyle = 'rgba(18, 22, 36, 0.72)';
      ctx.fillRect(0, 0, vWidth, vHeight);

      // Tunnel Stone Arch Ribs
      ctx.strokeStyle = '#5D4037';
      ctx.lineWidth = 12;
      for (let x = -(logic.trainX % 130); x < vWidth + 130; x += 130) {
        ctx.beginPath();
        ctx.arc(x, trackY + 10, 180, Math.PI, 0);
        ctx.stroke();
      }

      // Conical Headlight Beam cutting through dark
      const hLightX = trainBaseX + 95;
      const hLightY = trainBaseY - 25;
      const grad = ctx.createRadialGradient(hLightX, hLightY, 6, hLightX + 180, hLightY, 200);
      grad.addColorStop(0, 'rgba(255, 238, 88, 0.9)');
      grad.addColorStop(0.5, 'rgba(255, 238, 88, 0.4)');
      grad.addColorStop(1, 'rgba(255, 238, 88, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(hLightX, hLightY - 8);
      ctx.lineTo(hLightX + 220, hLightY - 55);
      ctx.lineTo(hLightX + 220, hLightY + 55);
      ctx.lineTo(hLightX, hLightY + 8);
      ctx.closePath();
      ctx.fill();

      ctx.font = 'bold 22px "Fredoka", "Quicksand", sans-serif';
      ctx.fillStyle = '#FFEE58';
      ctx.textAlign = 'center';
      ctx.fillText('⛰️ MOUNTAIN TUNNEL! 🔦', vWidth / 2, isPortrait ? 150 : 80);
      ctx.restore();
    }

    // Throttle Lever Badge (Bottom Right)
    const throttleX = vWidth - 65;
    const throttleY = vHeight - 48;
    const throttleLabels = ['🐢 SLOW', '🚂 CRUISING', '⚡ FAST!'];
    const throttleColors = ['#4CAF50', '#2196F3', '#FF9800'];

    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.strokeStyle = throttleColors[logic.throttleLevel - 1];
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(throttleX - 55, throttleY - 22, 110, 44, 22);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 13px "Fredoka", "Quicksand", "Arial Rounded MT Bold", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(throttleLabels[logic.throttleLevel - 1], throttleX, throttleY);
    ctx.restore();

    // Top HUD Pill Badge
    const scoreX = vWidth / 2;
    const scoreY = isPortrait ? 76 : Math.max(18, vHeight * 0.035);
    const badgeW = isPortrait ? 290 : 270;
    const badgeH = 46;

    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.48)';
    ctx.beginPath();
    ctx.roundRect(scoreX - badgeW / 2, scoreY, badgeW, badgeH, 23);
    ctx.fill();
    ctx.strokeStyle = '#90CAF9';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 19px "Fredoka", "Quicksand", "Arial Rounded MT Bold", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`🚂 Passengers: ${logic.passengers.length}  |  ★ ${logic.score}`, scoreX, scoreY + badgeH / 2);
    ctx.restore();
  }
}
