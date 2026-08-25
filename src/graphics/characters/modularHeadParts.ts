/**
 * Modular Head Parts Vector Renderer (7 Characters)
 * Mix & Match Studio
 * Strictly under 500 Lines of Code
 */

import { PALETTE } from '../palette';
import { CharacterAnimState } from '../../types/characters';

export function drawHeadPart(
  ctx: CanvasRenderingContext2D,
  charIdx: number,
  x: number,
  y: number,
  scale: number = 1.0,
  animState?: CharacterAnimState
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  const blink = animState?.isBlinking ?? false;
  const bob = animState?.headBob ?? 0;

  switch (charIdx % 7) {
    case 0: { // Trishu Head
      ctx.fillStyle = PALETTE.TRISHU_HAIR;
      ctx.beginPath();
      ctx.arc(-22, -8 + bob, 11, 0, Math.PI * 2);
      ctx.arc(22, -8 + bob, 11, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = PALETTE.TRISHU_BOW;
      ctx.beginPath();
      ctx.ellipse(-20, -18 + bob, 7, 4, -0.4, 0, Math.PI * 2);
      ctx.ellipse(20, -18 + bob, 7, 4, 0.4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = PALETTE.TRISHU_SKIN;
      ctx.strokeStyle = PALETTE.TRISHU_OUTLINE;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0 + bob, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = PALETTE.TRISHU_HAIR;
      ctx.beginPath();
      ctx.arc(0, -10 + bob, 20, Math.PI * 1.1, Math.PI * 1.9);
      ctx.fill();

      ctx.fillStyle = PALETTE.TRISHU_CHEEK;
      ctx.beginPath();
      ctx.arc(-11, 4 + bob, 4.5, 0, Math.PI * 2);
      ctx.arc(11, 4 + bob, 4.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = PALETTE.BLACK;
      if (blink) {
        ctx.strokeStyle = PALETTE.BLACK;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-9, 0 + bob); ctx.lineTo(-3, 0 + bob);
        ctx.moveTo(3, 0 + bob); ctx.lineTo(9, 0 + bob);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(-6, -1 + bob, 3, 0, Math.PI * 2);
        ctx.arc(6, -1 + bob, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.strokeStyle = PALETTE.TRISHU_HAIR_OUTLINE;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 6 + bob, 7, 0.1, Math.PI - 0.1);
      ctx.stroke();
      break;
    }

    case 1: { // Leo Head
      ctx.fillStyle = PALETTE.TRISHU_HAIR;
      ctx.beginPath();
      ctx.arc(0, -8 + bob, 21, Math.PI * 0.9, Math.PI * 2.1);
      ctx.fill();

      ctx.fillStyle = PALETTE.LEO_SKIN;
      ctx.strokeStyle = PALETTE.LEO_OUTLINE;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0 + bob, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = PALETTE.LEO_CHEEK;
      ctx.beginPath();
      ctx.arc(-9, 4 + bob, 4, 0, Math.PI * 2);
      ctx.arc(9, 4 + bob, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = PALETTE.BLACK;
      if (blink) {
        ctx.strokeStyle = PALETTE.BLACK;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-8, 0 + bob); ctx.lineTo(-2, 0 + bob);
        ctx.moveTo(2, 0 + bob); ctx.lineTo(8, 0 + bob);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(-5, -1 + bob, 3, 0, Math.PI * 2);
        ctx.arc(5, -1 + bob, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = PALETTE.LEO_OUTLINE;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 5 + bob, 7, 0, Math.PI);
      ctx.fill();
      ctx.stroke();
      break;
    }

    case 2: { // Dad Head
      ctx.fillStyle = PALETTE.DAD_HAIR;
      ctx.beginPath();
      ctx.arc(0, -6 + bob, 23, Math.PI * 1.0, Math.PI * 2.0);
      ctx.fill();

      ctx.fillStyle = PALETTE.DAD_SKIN;
      ctx.strokeStyle = PALETTE.DAD_OUTLINE;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 2 + bob, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = PALETTE.DAD_GLASSES;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(-7, 0 + bob, 6, 0, Math.PI * 2);
      ctx.arc(7, 0 + bob, 6, 0, Math.PI * 2);
      ctx.moveTo(-1, 0 + bob); ctx.lineTo(1, 0 + bob);
      ctx.stroke();

      ctx.fillStyle = PALETTE.BLACK;
      if (!blink) {
        ctx.beginPath();
        ctx.arc(-7, 0 + bob, 2.5, 0, Math.PI * 2);
        ctx.arc(7, 0 + bob, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = '#8D6E63';
      ctx.beginPath();
      ctx.ellipse(0, 8 + bob, 8, 3, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = PALETTE.DAD_GLASSES;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 11 + bob, 6, 0.2, Math.PI - 0.2);
      ctx.stroke();
      break;
    }

    case 3: { // Mom Head
      ctx.fillStyle = PALETTE.MOM_HAIR;
      ctx.beginPath();
      ctx.arc(-16, -6 + bob, 12, 0, Math.PI * 2);
      ctx.arc(16, -6 + bob, 12, 0, Math.PI * 2);
      ctx.arc(0, -12 + bob, 16, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = PALETTE.MOM_HAIRCLIP;
      ctx.beginPath();
      ctx.arc(-16, -16 + bob, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = PALETTE.MOM_SKIN;
      ctx.strokeStyle = PALETTE.MOM_OUTLINE;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 1 + bob, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = PALETTE.BLACK;
      if (blink) {
        ctx.strokeStyle = PALETTE.BLACK;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-8, 0 + bob); ctx.lineTo(-2, 0 + bob);
        ctx.moveTo(2, 0 + bob); ctx.lineTo(8, 0 + bob);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(-5, -1 + bob, 3, 0, Math.PI * 2);
        ctx.arc(5, -1 + bob, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = PALETTE.BLACK;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-8, -4 + bob); ctx.lineTo(-5, -1 + bob);
        ctx.moveTo(8, -4 + bob); ctx.lineTo(5, -1 + bob);
        ctx.stroke();
      }

      ctx.fillStyle = PALETTE.MOM_CHEEK;
      ctx.beginPath();
      ctx.arc(-9, 5 + bob, 4, 0, Math.PI * 2);
      ctx.arc(9, 5 + bob, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = PALETTE.MOM_DRESS_OUTLINE;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 7 + bob, 6, 0.1, Math.PI - 0.1);
      ctx.stroke();
      break;
    }

    case 4: { // Grandpa Head
      ctx.fillStyle = PALETTE.GRANDPA_HAT;
      ctx.strokeStyle = PALETTE.GRANDPA_HAT_OUTLINE;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, -10 + bob, 28, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, -18 + bob, 15, Math.PI, 0);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = PALETTE.GRANDPA_HAT_BAND;
      ctx.beginPath();
      ctx.rect(-15, -14 + bob, 30, 4);
      ctx.fill();

      ctx.fillStyle = PALETTE.GRANDPA_SKIN;
      ctx.strokeStyle = PALETTE.GRANDPA_OUTLINE;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 4 + bob, 21, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = PALETTE.GRANDPA_STUBBLE;
      ctx.beginPath();
      ctx.arc(0, 14 + bob, 12, 0, Math.PI);
      ctx.fill();

      ctx.fillStyle = PALETTE.BLACK;
      if (!blink) {
        ctx.beginPath();
        ctx.arc(-6, 2 + bob, 2.5, 0, Math.PI * 2);
        ctx.arc(6, 2 + bob, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.strokeStyle = PALETTE.GRANDPA_OUTLINE;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-12, 0 + bob); ctx.lineTo(-8, 2 + bob);
      ctx.moveTo(12, 0 + bob); ctx.lineTo(8, 2 + bob);
      ctx.stroke();
      break;
    }

    case 5: { // Mimi Bunny Head
      ctx.fillStyle = PALETTE.MIMI_FUR;
      ctx.strokeStyle = PALETTE.MIMI_FUR_OUTLINE;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(-10, -22 + bob, 7, 20, -0.15, 0, Math.PI * 2);
      ctx.ellipse(10, -22 + bob, 7, 20, 0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = PALETTE.MIMI_EAR_INNER;
      ctx.beginPath();
      ctx.ellipse(-10, -22 + bob, 4, 15, -0.15, 0, Math.PI * 2);
      ctx.ellipse(10, -22 + bob, 4, 15, 0.15, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = PALETTE.MIMI_FUR;
      ctx.strokeStyle = PALETTE.MIMI_FUR_OUTLINE;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 2 + bob, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = PALETTE.MIMI_NOSE;
      ctx.beginPath();
      ctx.arc(0, 4 + bob, 3.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = PALETTE.BLACK;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-6, 4 + bob); ctx.lineTo(-18, 2 + bob);
      ctx.moveTo(-6, 6 + bob); ctx.lineTo(-17, 8 + bob);
      ctx.moveTo(6, 4 + bob); ctx.lineTo(18, 2 + bob);
      ctx.moveTo(6, 6 + bob); ctx.lineTo(17, 8 + bob);
      ctx.stroke();

      ctx.fillStyle = PALETTE.BLACK;
      if (!blink) {
        ctx.beginPath();
        ctx.arc(-6, -1 + bob, 3, 0, Math.PI * 2);
        ctx.arc(6, -1 + bob, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }

    case 6: { // Mrs Clucky Hen Head
      ctx.fillStyle = PALETTE.CHICKEN_COMB;
      ctx.strokeStyle = PALETTE.CHICKEN_COMB_OUTLINE;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(-8, -16 + bob, 7, 0, Math.PI * 2);
      ctx.arc(0, -20 + bob, 8, 0, Math.PI * 2);
      ctx.arc(8, -16 + bob, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = PALETTE.CHICKEN_BODY;
      ctx.strokeStyle = PALETTE.CHICKEN_OUTLINE;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0 + bob, 19, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = PALETTE.CHICKEN_BEAK;
      ctx.strokeStyle = PALETTE.CHICKEN_BEAK_OUTLINE;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-4, 0 + bob);
      ctx.lineTo(12, 4 + bob);
      ctx.lineTo(-4, 8 + bob);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = PALETTE.CHICKEN_WATTLE;
      ctx.beginPath();
      ctx.arc(0, 11 + bob, 4.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = PALETTE.BLACK;
      if (!blink) {
        ctx.beginPath();
        ctx.arc(-5, -3 + bob, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
  }

  ctx.restore();
}
