/**
 * Adventures of Trishu — Mode 2: Muddy Puddles
 * Dedicated Canvas 2D Renderer (Zero State Leaks)
 */

import { DisplayManager } from '../../engine/DisplayManager';
import { CharacterAnimState, CharacterId } from '../../types/characters';
import { drawLandscapeSkyHills, drawMuddyPuddle } from '../../graphics/environmentRenderer';
import { renderCharacter } from '../../graphics/characters';
import { PuddleEntity, TrishuJumpState, MuddyFootprint } from './types';

export class MuddyPuddlesRenderer {
  public static renderScene(
    ctx: CanvasRenderingContext2D,
    display: DisplayManager,
    time: number,
    trishu: TrishuJumpState,
    animState: CharacterAnimState,
    puddles: PuddleEntity[],
    footprints: MuddyFootprint[],
    muddyBootsTimer: number,
    selectedAvatar: CharacterId,
    score: number,
    multiplier: number
  ): void {
    const isPortrait = display.isPortrait;
    const vWidth = display.vWidth;
    const vHeight = display.vHeight;

    // 1. Sky & Hills Background
    drawLandscapeSkyHills(ctx, vWidth, vHeight, time);

    // 2. Mud Footprints
    for (const fp of footprints) {
      ctx.save();
      ctx.translate(fp.x, fp.y);
      ctx.rotate(fp.rotation);
      ctx.fillStyle = `rgba(109, 76, 65, ${Math.max(0, fp.life * 0.45)})`;
      ctx.beginPath();
      ctx.ellipse(0, 0, 14, 8, 0, 0, Math.PI * 2);
      ctx.ellipse(8, -6, 5, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 3. Puddles
    for (const pud of puddles) {
      drawMuddyPuddle(ctx, pud.x, pud.y, pud.rx, pud.ry, {
        type: pud.type,
        ripplePhase: pud.ripplePhase
      });
    }

    // 4. Trishu Character
    renderCharacter(selectedAvatar, ctx, trishu.x, trishu.y + trishu.jumpY, isPortrait ? 1.25 : 1.2, {
      welliesMuddy: muddyBootsTimer > 0,
      squash: trishu.squish,
      jumpY: trishu.jumpY,
      eyeBlink: animState.isBlinking,
      animState,
      expression: trishu.isJumping ? 'excited' : 'happy'
    });

    // 5. Score & Combo Multiplier Pill
    this.renderHUD(ctx, score, multiplier, vWidth);
  }

  private static renderHUD(
    ctx: CanvasRenderingContext2D,
    score: number,
    multiplier: number,
    vWidth: number
  ): void {
    ctx.save();
    const pillX = vWidth - 95;
    const pillY = 32;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
    ctx.strokeStyle = '#795548';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(pillX - 60, pillY - 17, 120, 34, 17);
    ctx.fill();
    ctx.stroke();

    ctx.font = '900 16px "Fredoka", "Quicksand", sans-serif';
    ctx.fillStyle = '#4E342E';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const multiText = multiplier > 1 ? ` (x${multiplier})` : '';
    ctx.fillText(`👢 ${score}${multiText}`, pillX, pillY);
    ctx.restore();
  }
}
