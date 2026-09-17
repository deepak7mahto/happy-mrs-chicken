/**
 * Adventures of Trishu — Mode 15: Rainbow Flower Garden
 * Dedicated Canvas 2D Renderer (Zero State Leaks)
 */

import { DisplayManager } from '../../engine/DisplayManager';
import { drawLandscapeSkyHills } from '../../graphics/environmentRenderer';
import { FlowerMound, GardenButterfly } from './types';

export class RainbowGardenRenderer {
  public static renderScene(
    ctx: CanvasRenderingContext2D,
    display: DisplayManager,
    time: number,
    mounds: FlowerMound[],
    butterflies: GardenButterfly[],
    wateringCanX: number,
    isWatering: boolean,
    rainbowTimer: number,
    totalBloomed: number,
    score: number
  ): void {
    const vWidth = display.vWidth;
    const vHeight = display.vHeight;

    // 1. Sky & Hills Background
    drawLandscapeSkyHills(ctx, vWidth, vHeight, time);

    // Smiling Sun in Sky
    const sunX = vWidth - 65;
    const sunY = 70;
    ctx.save();
    ctx.translate(sunX, sunY);

    // Radiant Rays
    ctx.strokeStyle = '#FFE082';
    ctx.lineWidth = 3;
    const rayCount = 8;
    const raySpin = time * 0.8;
    for (let r = 0; r < rayCount; r++) {
      const angle = raySpin + (r * Math.PI * 2) / rayCount;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * 34, Math.sin(angle) * 34);
      ctx.lineTo(Math.cos(angle) * 44, Math.sin(angle) * 44);
      ctx.stroke();
    }

    // Sun Body
    ctx.fillStyle = '#FFEE58';
    ctx.strokeStyle = '#FBC02D';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Rosy Cheeks
    ctx.fillStyle = '#FF8A80';
    ctx.beginPath();
    ctx.arc(-13, 4, 4, 0, Math.PI * 2);
    ctx.arc(13, 4, 4, 0, Math.PI * 2);
    ctx.fill();

    // Cute Smile
    ctx.strokeStyle = '#E65100';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 4, 9, 0.2, Math.PI - 0.2);
    ctx.stroke();

    // Cute Eyes
    ctx.fillStyle = '#212121';
    ctx.beginPath();
    ctx.arc(-8, -4, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(8, -4, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 2. Rainbow Celebration Arc
    if (rainbowTimer > 0) {
      ctx.save();
      const rainbowColors = ['#FF1744', '#FF9100', '#FFEA00', '#00E676', '#2979FF', '#D500F9'];
      const cx = vWidth / 2;
      const cy = vHeight * 0.72;
      ctx.lineWidth = 10;
      for (let i = 0; i < rainbowColors.length; i++) {
        ctx.strokeStyle = rainbowColors[i];
        ctx.beginPath();
        ctx.arc(cx, cy, 180 + i * 11, Math.PI, 0, false);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 3. Flower Mounds
    for (const m of mounds) {
      this.drawMoundAndFlower(ctx, m, time);
    }

    // 4. Watering Can
    if (isWatering) {
      this.drawWateringCan(ctx, wateringCanX, vHeight - 165);
    }

    // 5. Butterflies
    for (const b of butterflies) {
      this.drawButterfly(ctx, b.x, b.y, b.color, time);
    }

    // 6. HUD
    this.renderHUD(ctx, score, totalBloomed, vWidth);
  }

  private static drawMoundAndFlower(ctx: CanvasRenderingContext2D, m: FlowerMound, time: number): void {
    ctx.save();
    ctx.translate(m.x, m.y);

    // Dirt Mound
    ctx.fillStyle = '#6D4C41';
    ctx.beginPath();
    ctx.ellipse(0, 8, 36, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    if (m.growth > 0) {
      const stemH = m.growth * 55;

      // Green Stem
      ctx.strokeStyle = '#43A047';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(0, 6);
      const sway = Math.sin(time * 3 + m.x) * 4 * m.growth;
      ctx.quadraticCurveTo(sway, -stemH * 0.5, sway, -stemH);
      ctx.stroke();

      // Leaves
      if (m.growth > 0.3) {
        ctx.fillStyle = '#4CAF50';
        ctx.beginPath();
        ctx.ellipse(-12, -stemH * 0.4, 10, 5, -0.4, 0, Math.PI * 2);
        ctx.ellipse(12, -stemH * 0.4, 10, 5, 0.4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Blossoming Flower Head
      if (m.growth > 0.5) {
        const flowerScale = (m.growth - 0.5) * 2;
        ctx.save();
        ctx.translate(sway, -stemH);
        ctx.scale(flowerScale, flowerScale);

        // Petals
        ctx.fillStyle = m.color;
        for (let p = 0; p < 6; p++) {
          const ang = (p * Math.PI * 2) / 6;
          ctx.beginPath();
          ctx.ellipse(Math.cos(ang) * 14, Math.sin(ang) * 14, 10, 6, ang, 0, Math.PI * 2);
          ctx.fill();
        }

        // Center Pistil
        ctx.fillStyle = '#FFE082';
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
    ctx.restore();
  }

  private static drawWateringCan(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(-0.25);

    // Can body
    ctx.fillStyle = '#42A5F5';
    ctx.beginPath();
    ctx.roundRect(-25, -18, 50, 36, 8);
    ctx.fill();

    // Spout
    ctx.fillStyle = '#1E88E5';
    ctx.beginPath();
    ctx.moveTo(25, -5);
    ctx.lineTo(48, -16);
    ctx.lineTo(48, -8);
    ctx.lineTo(25, 8);
    ctx.closePath();
    ctx.fill();

    // Water droplet stream
    ctx.fillStyle = 'rgba(129, 212, 250, 0.8)';
    for (let d = 0; d < 4; d++) {
      ctx.beginPath();
      ctx.arc(52 + d * 6, -10 + d * 14, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  private static drawButterfly(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    color: string,
    time: number
  ): void {
    ctx.save();
    ctx.translate(x, y);
    const flap = Math.sin(time * 12);
    ctx.scale(flap, 1);

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(-8, -6, 8, 12, -0.3, 0, Math.PI * 2);
    ctx.ellipse(8, -6, 8, 12, 0.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#212121';
    ctx.fillRect(-1.5, -10, 3, 16);
    ctx.restore();
  }

  private static renderHUD(
    ctx: CanvasRenderingContext2D,
    score: number,
    totalBloomed: number,
    vWidth: number
  ): void {
    ctx.save();
    const pillX = vWidth - 85;
    const pillY = 32;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
    ctx.strokeStyle = '#AB47BC';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(pillX - 60, pillY - 17, 120, 34, 17);
    ctx.fill();
    ctx.stroke();

    ctx.font = '900 15px "Fredoka", "Quicksand", sans-serif';
    ctx.fillStyle = '#6A1B9A';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`🌸 ${totalBloomed} • ${score}`, pillX, pillY);
    ctx.restore();
  }
}
