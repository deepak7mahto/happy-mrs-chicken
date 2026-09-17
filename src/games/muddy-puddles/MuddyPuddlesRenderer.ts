/**
 * Adventures of Trishu — Mode 2: Muddy Puddles
 * Dedicated Canvas 2D Renderer (Zero State Leaks)
 */

import { DisplayManager } from '../../engine/DisplayManager';
import { CharacterAnimState, CharacterId } from '../../types/characters';
import { drawLandscapeSkyHills, drawMuddyPuddle } from '../../graphics/environmentRenderer';
import { renderCharacter } from '../../graphics/characters';
import { PuddleEntity, TrishuJumpState, MuddyFootprint, ScreenMudSplat } from './types';

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
    multiplier: number,
    screenSplats: ScreenMudSplat[] = []
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
      if (pud.isMega) {
        ctx.save();
        ctx.strokeStyle = '#FFE082';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.ellipse(pud.x, pud.y, pud.rx + 4, pud.ry + 2, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.font = '700 12px "Fredoka", sans-serif';
        ctx.fillStyle = '#FFE082';
        ctx.textAlign = 'center';
        ctx.fillText('⭐ MEGA ⭐', pud.x, pud.y - pud.ry - 5);
        ctx.restore();
      }
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

    // 6. Camera Screen Mud Splats (on foreground glass)
    for (const splat of screenSplats) {
      const alpha = Math.min(1.0, splat.life / 0.8);
      ctx.save();
      ctx.fillStyle = `rgba(93, 64, 55, ${alpha * 0.88})`;
      ctx.beginPath();
      ctx.arc(splat.x, splat.y, splat.r, 0, Math.PI * 2);
      ctx.arc(splat.x - splat.r * 0.7, splat.y + splat.r * 0.4, splat.r * 0.45, 0, Math.PI * 2);
      ctx.arc(splat.x + splat.r * 0.6, splat.y - splat.r * 0.5, splat.r * 0.35, 0, Math.PI * 2);
      ctx.arc(splat.x + splat.r * 0.8, splat.y + splat.r * 0.6, splat.r * 0.3, 0, Math.PI * 2);
      ctx.fill();

      // Squeegee wipe trail if fading
      if (splat.life < 1.0) {
        const wipeProgress = 1.0 - splat.life;
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.7})`;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(splat.x - splat.r * 1.2, splat.y - splat.r + wipeProgress * splat.r * 2);
        ctx.lineTo(splat.x + splat.r * 1.2, splat.y - splat.r + wipeProgress * splat.r * 2);
        ctx.stroke();
      }
      ctx.restore();
    }
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
