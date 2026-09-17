/**
 * Adventures of Trishu — Mode 7: Grandpa's Veggie Harvest
 * Dedicated Canvas 2D Renderer (Zero State Leaks)
 */

import { DisplayManager } from '../../engine/DisplayManager';
import { CharacterAnimState, CharacterId } from '../../types/characters';
import { drawLandscapeSkyHills } from '../../graphics/environmentRenderer';
import { renderCharacter } from '../../graphics/characters';
import { getVeggiePullTension } from '../../graphics/animations';
import { ActiveVeggie, GardenMoundItem } from './types';

export class VegetableHarvestRenderer {
  public static renderScene(
    ctx: CanvasRenderingContext2D,
    display: DisplayManager,
    time: number,
    mounds: GardenMoundItem[],
    harvestedCount: number,
    currentPullTension: number,
    activePullMoundIdx: number,
    wheelbarrowBounce: number,
    animState: CharacterAnimState,
    selectedAvatar: CharacterId,
    score: number,
    wheelbarrowRollOffset: number = 0
  ): void {
    const isPortrait = display.isPortrait;
    const vWidth = display.vWidth;
    const vHeight = display.vHeight;

    // 1. Sky & Hills Background
    drawLandscapeSkyHills(ctx, vWidth, vHeight, time);

    // 2. Soil Bed
    const bedY = isPortrait ? vHeight * 0.52 : vHeight * 0.65;
    ctx.save();
    ctx.fillStyle = '#5D4037';
    ctx.fillRect(0, bedY, vWidth, vHeight - bedY);
    ctx.fillStyle = '#4E342E';
    ctx.fillRect(0, bedY - 12, vWidth, 12);
    ctx.restore();

    // 3. Mounds and Ground Vegetables
    for (const m of mounds) {
      ctx.save();
      ctx.fillStyle = '#6D4C41';
      ctx.strokeStyle = '#3E2723';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(m.x, m.y + 12, 45, 18, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      const veg = m.vegetable;
      if (veg && !veg.isFlying && !veg.isHarvested) {
        this.drawVegetableSprite(ctx, m.x, m.y - veg.pullOffsetY, veg.type, 0, 1.0);
      }
      ctx.restore();
    }

    // 4. Wheelbarrow & Grandpa
    const rollX = wheelbarrowRollOffset;
    const wbX = (isPortrait ? vWidth * 0.22 : 120) + rollX;
    const wbY = isPortrait ? vHeight * 0.38 : vHeight * 0.72;
    const grandpaX = (isPortrait ? vWidth * 0.52 : 95) + rollX;
    const grandpaY = isPortrait ? vHeight * 0.38 : vHeight * 0.62;

    this.drawWheelbarrow(ctx, wbX, wbY, harvestedCount, wheelbarrowBounce);

    const pullArt = getVeggiePullTension(currentPullTension, time);
    renderCharacter(selectedAvatar, ctx, grandpaX, grandpaY + pullArt.pullY, isPortrait ? 1.15 : 1.1, {
      pulling: activePullMoundIdx >= 0,
      pullTension: currentPullTension,
      welliesMuddy: true,
      eyeBlink: animState.isBlinking,
      animState,
      expression: rollX > 0 ? 'excited' : activePullMoundIdx >= 0 ? 'straining' : 'happy'
    });

    // 5. Flying Vegetables
    for (const m of mounds) {
      const veg = m.vegetable;
      if (veg && veg.isFlying) {
        this.drawVegetableSprite(ctx, veg.x, veg.y, veg.type, veg.rotation, 1.15);
      }
    }

    // 6. HUD
    this.renderHUD(ctx, score, harvestedCount, vWidth);
  }

  private static drawVegetableSprite(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    type: 'CARROT' | 'CABBAGE' | 'PUMPKIN',
    rotation: number,
    scale: number
  ): void {
    ctx.save();
    ctx.translate(x, y);
    if (rotation !== 0) ctx.rotate(rotation);
    ctx.scale(scale, scale);

    if (type === 'CARROT') {
      // Leafy green top
      ctx.fillStyle = '#4CAF50';
      ctx.beginPath();
      ctx.ellipse(-6, -24, 5, 14, -0.3, 0, Math.PI * 2);
      ctx.ellipse(6, -24, 5, 14, 0.3, 0, Math.PI * 2);
      ctx.ellipse(0, -28, 5, 16, 0, 0, Math.PI * 2);
      ctx.fill();

      // Orange carrot body
      ctx.fillStyle = '#FF9800';
      ctx.strokeStyle = '#E65100';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-16, -10);
      ctx.lineTo(16, -10);
      ctx.quadraticCurveTo(8, 20, 0, 36);
      ctx.quadraticCurveTo(-8, 20, -16, -10);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (type === 'CABBAGE') {
      ctx.fillStyle = '#66BB6A';
      ctx.strokeStyle = '#2E7D32';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 24, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#81C784';
      ctx.beginPath();
      ctx.ellipse(0, 0, 18, 14, 0.2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Pumpkin
      ctx.fillStyle = '#2E7D32';
      ctx.fillRect(-4, -28, 8, 12);

      ctx.fillStyle = '#FF6F00';
      ctx.strokeStyle = '#BF360C';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(0, 0, 30, 22, 0, 0, Math.PI * 2);
      ctx.ellipse(-14, 0, 22, 20, 0, 0, Math.PI * 2);
      ctx.ellipse(14, 0, 22, 20, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }

  private static drawWheelbarrow(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    count: number,
    bounce: number
  ): void {
    ctx.save();
    ctx.translate(x, y - bounce * 8);

    // Wheel
    ctx.fillStyle = '#212121';
    ctx.beginPath();
    ctx.arc(36, 22, 16, 0, Math.PI * 2);
    ctx.fill();

    // Tub
    ctx.fillStyle = '#D32F2F';
    ctx.strokeStyle = '#B71C1C';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-45, -18);
    ctx.lineTo(35, -18);
    ctx.lineTo(25, 12);
    ctx.lineTo(-30, 12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Handles
    ctx.strokeStyle = '#795548';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-55, -2);
    ctx.lineTo(-30, 10);
    ctx.stroke();

    // Veggies inside wheelbarrow
    if (count > 0) {
      ctx.fillStyle = '#FF9800';
      ctx.beginPath();
      ctx.arc(-10, -18, 10, 0, Math.PI * 2);
      ctx.fill();
    }
    if (count > 2) {
      ctx.fillStyle = '#66BB6A';
      ctx.beginPath();
      ctx.arc(10, -18, 12, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  private static renderHUD(
    ctx: CanvasRenderingContext2D,
    score: number,
    harvestedCount: number,
    vWidth: number
  ): void {
    ctx.save();
    const pillX = vWidth - 85;
    const pillY = 32;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
    ctx.strokeStyle = '#FF8F00';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(pillX - 60, pillY - 17, 120, 34, 17);
    ctx.fill();
    ctx.stroke();

    ctx.font = '900 15px "Fredoka", "Quicksand", sans-serif';
    ctx.fillStyle = '#E65100';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`🥕 ${harvestedCount} • ${score}`, pillX, pillY);
    ctx.restore();
  }
}
