/**
 * Adventures of Trishu — Mode 4: Dad's Kitchen Dash
 * Dedicated Canvas 2D Renderer (Zero State Leaks)
 */

import { DisplayManager } from '../../engine/DisplayManager';
import { drawLandscapeSkyHills } from '../../graphics/environmentRenderer';
import { renderCharacter } from '../../graphics/characters';
import { CharacterId } from '../../types/characters';
import { SandwichLayer } from './types';

export class DadKitchenRenderer {
  public static renderScene(
    ctx: CanvasRenderingContext2D,
    display: DisplayManager,
    time: number,
    fever: number,
    multiplier: number,
    layers: SandwichLayer[],
    celebrationTimer: number,
    selectedAvatar: CharacterId,
    score: number
  ): void {
    const isPortrait = display.isPortrait;
    const vWidth = display.vWidth;
    const vHeight = display.vHeight;

    // 1. Celebration Screen
    if (celebrationTimer > 0) {
      drawLandscapeSkyHills(ctx, vWidth, vHeight, time);

      ctx.save();
      ctx.fillStyle = 'rgba(255, 238, 88, 0.94)';
      ctx.strokeStyle = '#F57F17';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(vWidth * 0.08, vHeight * 0.15, vWidth * 0.84, vHeight * 0.45, 24);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#BF360C';
      ctx.font = `bold ${isPortrait ? '24px' : '30px'} "Fredoka", "Quicksand", sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('🥪 GIANT SANDWICH FEAST! 🥪', vWidth / 2, vHeight * 0.26);

      ctx.font = 'bold 20px "Fredoka", "Quicksand", sans-serif';
      ctx.fillStyle = '#1B5E20';
      ctx.fillText(`Delicious! +250 Bonus! Score: ${score}`, vWidth / 2, vHeight * 0.35);

      ctx.fillStyle = '#3E2723';
      ctx.font = '16px "Fredoka", "Quicksand", sans-serif';
      ctx.fillText('Dad loved making the mega sandwich! 😋', vWidth / 2, vHeight * 0.43);
      ctx.restore();
      return;
    }

    // 2. Normal Kitchen Background
    drawLandscapeSkyHills(ctx, vWidth, vHeight, time);

    // Kitchen Counter
    const counterY = isPortrait ? vHeight * 0.68 : vHeight * 0.72;
    ctx.save();
    ctx.fillStyle = '#8D6E63';
    ctx.fillRect(0, counterY, vWidth, vHeight - counterY);
    ctx.fillStyle = '#D7CCC8';
    ctx.fillRect(0, counterY - 14, vWidth, 14);
    ctx.restore();

    // 3. Dad Avatar
    const dadX = isPortrait ? vWidth * 0.32 : vWidth * 0.28;
    const dadY = isPortrait ? vHeight * 0.65 : vHeight * 0.68;
    const shakeAmount = fever >= 85 ? Math.sin(time * 35) * 3 : 0;

    renderCharacter(selectedAvatar, ctx, dadX + shakeAmount, dadY, isPortrait ? 1.25 : 1.2, {
      expression: fever >= 80 ? 'excited' : 'happy',
      armWave: Math.sin(time * 10) * 0.15
    });

    // 4. Sandwich Stacking Plate & Layers
    const plateX = isPortrait ? vWidth * 0.68 : vWidth * 0.65;
    const plateY = counterY - 10;

    ctx.save();
    // Ceramic Plate
    ctx.fillStyle = '#ECEFF1';
    ctx.strokeStyle = '#B0BEC5';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(plateX, plateY, 65, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Stacked Layers
    let currentStackY = plateY - 8;
    const visibleLayers = layers.slice(-14); // Render top 14 layers to keep within screen
    for (const layer of visibleLayers) {
      ctx.fillStyle = layer.color;
      ctx.strokeStyle = '#3E2723';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(plateX - layer.w / 2, currentStackY - layer.h, layer.w, layer.h, 4);
      ctx.fill();
      ctx.stroke();
      currentStackY -= layer.h + 1;
    }
    ctx.restore();

    // 5. Fever Meter Bar at Top
    this.renderFeverBar(ctx, fever, multiplier, score, vWidth);
  }

  private static renderFeverBar(
    ctx: CanvasRenderingContext2D,
    fever: number,
    multiplier: number,
    score: number,
    vWidth: number
  ): void {
    ctx.save();
    const barW = Math.min(260, vWidth - 140);
    const barH = 20;
    const barX = 70;
    const barY = 24;

    // Background track
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.roundRect(barX, barY, barW, barH, 10);
    ctx.fill();

    // Fever fill
    const fillW = Math.max(0, (fever / 100) * barW);
    ctx.fillStyle = fever >= 85 ? '#FF1744' : (fever >= 50 ? '#FF9100' : '#76FF03');
    ctx.beginPath();
    ctx.roundRect(barX, barY, fillW, barH, 10);
    ctx.fill();

    // Multiplier Text
    ctx.font = '900 13px "Fredoka", "Quicksand", sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`🔥 DASH x${multiplier}`, barX + barW / 2, barY + barH / 2);

    // Score Pill
    const pillX = vWidth - 75;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
    ctx.strokeStyle = '#EF5350';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(pillX - 45, barY - 4, 90, 28, 14);
    ctx.fill();
    ctx.stroke();

    ctx.font = '900 14px "Fredoka", "Quicksand", sans-serif';
    ctx.fillStyle = '#C62828';
    ctx.fillText(`🥪 ${score}`, pillX, barY + 10);
    ctx.restore();
  }
}
