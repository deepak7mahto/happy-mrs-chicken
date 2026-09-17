/**
 * Adventures of Trishu — Mode 1: Happy Mrs Clucky
 * Dedicated Canvas 2D Renderer (Zero State Leaks)
 */

import { DisplayManager } from '../../engine/DisplayManager';
import { CharacterAnimState, CharacterId } from '../../types/characters';
import { drawLandscapeSkyHills, drawHayNest, drawEgg } from '../../graphics/environmentRenderer';
import { renderCharacter } from '../../graphics/characters';
import { drawBabyChick } from '../../graphics/characters/chickRenderer';
import { EggEntity, ChickEntity, ChickenState } from './types';

export class EggLayingRenderer {
  public static renderScene(
    ctx: CanvasRenderingContext2D,
    display: DisplayManager,
    time: number,
    chicken: ChickenState,
    animState: CharacterAnimState,
    eggs: EggEntity[],
    chicks: ChickEntity[],
    selectedAvatar: CharacterId,
    score: number
  ): void {
    const isPortrait = display.isPortrait;
    const vWidth = display.vWidth;
    const vHeight = display.vHeight;
    const groundY = isPortrait ? vHeight - 140 : vHeight - 80;

    // 1. Sky and Hills
    drawLandscapeSkyHills(ctx, vWidth, vHeight, time);

    // 2. Hay Nests along the ground
    const nestSpacing = isPortrait ? 130 : 180;
    const nestCount = Math.floor((vWidth - 80) / nestSpacing);
    for (let i = 0; i < nestCount; i++) {
      const nx = 60 + i * nestSpacing;
      drawHayNest(ctx, nx, groundY - 8);
    }

    // 3. Resting / Incubating Eggs
    for (const egg of eggs) {
      const isGolden = egg.crackStage === 0 && egg.state === 'INCUBATING' && (egg as any).isGolden;
      drawEgg(ctx, egg.x, egg.y, egg.rotation, egg.crackStage, isGolden);
    }

    // 4. Baby Chicks (sorted by Y for natural depth)
    for (const chick of chicks) {
      ctx.save();
      ctx.translate(chick.x, chick.y);
      if (chick.facingLeft) {
        ctx.scale(-1, 1);
      }
      drawBabyChick(ctx, 0, 0, 1.15, { walkCycle: chick.walkCycle });
      ctx.restore();
    }

    // 5. Mrs Clucky / Avatar Hen
    ctx.save();
    ctx.translate(chicken.x, chicken.y);
    if (chicken.facingLeft) {
      ctx.scale(-1, 1);
    }
    const henScale = isPortrait ? 1.25 : 1.15;
    renderCharacter(selectedAvatar, ctx, 0, 0, henScale, {
      squash: chicken.squash,
      armWave: chicken.flap,
      eyeBlink: animState.isBlinking,
      animState,
      expression: chicken.squawk > 0.1 ? 'excited' : 'happy'
    });
    ctx.restore();

    // 6. Tactile Score Pill in Top Corner
    this.renderScorePill(ctx, score, isPortrait, vWidth);
  }

  private static renderScorePill(
    ctx: CanvasRenderingContext2D,
    score: number,
    isPortrait: boolean,
    vWidth: number
  ): void {
    ctx.save();
    const pillX = vWidth - 85;
    const pillY = 32;
    const pillW = 100;
    const pillH = 34;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
    ctx.strokeStyle = '#FBC02D';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(pillX - pillW / 2, pillY - pillH / 2, pillW, pillH, 17);
    ctx.fill();
    ctx.stroke();

    ctx.font = '900 18px "Fredoka", "Quicksand", sans-serif';
    ctx.fillStyle = '#E65100';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`🥚 ${score}`, pillX, pillY);
    ctx.restore();
  }
}
