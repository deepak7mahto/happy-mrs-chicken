/**
 * Adventures of Trishu — Mode 6: Golden Pancake Flipper
 * Dedicated Canvas 2D Renderer (Zero State Leaks)
 */

import { DisplayManager } from '../../engine/DisplayManager';
import { CharacterAnimState, CharacterId } from '../../types/characters';
import { drawLandscapeSkyHills } from '../../graphics/environmentRenderer';
import { renderCharacter } from '../../graphics/characters';
import { getFryingPanAngle } from '../../graphics/animations';
import { ActivePancakeState, StackedPancakeItem } from './types';

export class PancakeFlipperRenderer {
  public static renderScene(
    ctx: CanvasRenderingContext2D,
    display: DisplayManager,
    time: number,
    flipPhase: number,
    activePancake: ActivePancakeState,
    stackedPancakes: StackedPancakeItem[],
    stackCount: number,
    stackWobbleTimer: number,
    isAirborne: boolean,
    newPancakeDelay: number,
    animState: CharacterAnimState,
    selectedAvatar: CharacterId,
    score: number,
    multiplier: number
  ): void {
    const isPortrait = display.isPortrait;
    const vWidth = display.vWidth;
    const vHeight = display.vHeight;

    // 1. Sky & Hills Background
    drawLandscapeSkyHills(ctx, vWidth, vHeight, time);

    const chefX = isPortrait ? vWidth * 0.2 : vWidth * 0.18;
    const chefY = isPortrait ? vHeight * 0.62 : vHeight * 0.65;
    const panX = isPortrait ? vWidth * 0.38 : vWidth * 0.36;
    const panY = isPortrait ? vHeight * 0.62 : vHeight * 0.65;
    const plateX = isPortrait ? vWidth * 0.75 : vWidth * 0.72;
    const plateBaseY = isPortrait ? vHeight * 0.65 : vHeight * 0.68;
    const counterY = isPortrait ? vHeight * 0.68 : vHeight * 0.72;

    // 2. Kitchen Counter
    ctx.save();
    ctx.fillStyle = '#8D6E63';
    ctx.fillRect(0, counterY, vWidth, vHeight - counterY);
    ctx.fillStyle = '#D7CCC8';
    ctx.fillRect(0, counterY - 14, vWidth, 14);
    ctx.restore();

    // 3. Chef Avatar
    const panArt = getFryingPanAngle(flipPhase);
    renderCharacter(selectedAvatar, ctx, chefX, chefY, isPortrait ? 1.2 : 1.15, {
      holdingPan: true,
      panAngle: panArt.panAngle,
      eyeBlink: animState.isBlinking,
      animState,
      expression: 'focused'
    });

    // 4. Frying Pan & Stove
    ctx.save();
    ctx.translate(panX, panY);
    ctx.fillStyle = '#424242';
    ctx.beginPath();
    ctx.ellipse(0, 10, 36, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.rotate(panArt.panAngle);
    ctx.fillStyle = '#212121';
    ctx.beginPath();
    ctx.ellipse(0, 0, 38, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#616161';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Handle
    ctx.fillStyle = '#795548';
    ctx.fillRect(-65, -5, 30, 10);
    ctx.restore();

    // 5. Active Pancake
    if (activePancake.isCeilingStuck) {
      this.drawPancake(ctx, activePancake.x, activePancake.y, activePancake.rotation, activePancake.cookTimer);
      ctx.fillStyle = '#E65100';
      ctx.font = '700 13px "Fredoka", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🥞 STUCK TO CEILING! 😂', activePancake.x, activePancake.y + 28);
    } else if (!isAirborne && newPancakeDelay <= 0) {
      this.drawPancake(ctx, activePancake.x, activePancake.y - 3, 0, activePancake.cookTimer);
    } else if (isAirborne) {
      this.drawPancake(ctx, activePancake.x, activePancake.y, activePancake.rotation, activePancake.cookTimer);
    }

    // 6. Plate & Stacked Pancakes
    ctx.save();
    ctx.fillStyle = '#CFD8DC';
    ctx.strokeStyle = '#90A4AE';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(plateX, plateBaseY, 55, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    for (let i = 0; i < stackedPancakes.length; i++) {
      const p = stackedPancakes[i];
      const wobble = Math.sin(stackWobbleTimer * 8 + i * 0.5) * Math.max(0, 4 - stackWobbleTimer * 3);
      this.drawPancake(ctx, plateX + wobble, p.y, 0, 2.0);

      if (p.syrup) {
        ctx.fillStyle = 'rgba(255, 160, 0, 0.82)';
        ctx.beginPath();
        ctx.ellipse(plateX + wobble, p.y - 2, 28, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(plateX + wobble - 18, p.y - 1, 4, 8);
        ctx.fillRect(plateX + wobble + 12, p.y - 1, 3, 6);
      }

      // Butter pat on top of highest pancake
      if (i === stackedPancakes.length - 1) {
        ctx.fillStyle = '#FFEE58';
        ctx.strokeStyle = '#FDD835';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(plateX + wobble - 8, p.y - 12, 16, 8, 2);
        ctx.fill();
        ctx.stroke();
      }
    }
    ctx.restore();

    // 7. Score HUD
    this.renderHUD(ctx, score, stackCount, multiplier, vWidth);
  }

  private static drawPancake(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    rotation: number,
    cookTimer: number
  ): void {
    ctx.save();
    ctx.translate(x, y);
    if (rotation !== 0) ctx.rotate(rotation);

    // Dynamic coloring based on cooking stage
    const fillColor = cookTimer < 0.6 ? '#FFF8E1' : (cookTimer <= 3.2 ? '#FFB300' : '#8D6E63');
    const borderColor = cookTimer < 0.6 ? '#FFE082' : (cookTimer <= 3.2 ? '#FF8F00' : '#5D4037');

    ctx.fillStyle = fillColor;
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(0, 0, 32, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Golden butter sheen
    if (cookTimer >= 0.6) {
      ctx.fillStyle = 'rgba(255, 238, 88, 0.4)';
      ctx.beginPath();
      ctx.ellipse(-6, -2, 16, 5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  private static renderHUD(
    ctx: CanvasRenderingContext2D,
    score: number,
    stackCount: number,
    multiplier: number,
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
    ctx.fillText(`🥞 ${stackCount} • ${score}`, pillX, pillY);
    ctx.restore();
  }
}
