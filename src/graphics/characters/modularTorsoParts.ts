/**
 * Modular Torso Parts Vector Renderer (7 Characters)
 * Mix & Match Studio
 * Strictly under 500 Lines of Code
 */

import { PALETTE } from '../palette';
import { CharacterAnimState } from '../../types/characters';

export function drawTorsoPart(
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

  const breath = animState?.breathScale ?? 1.0;
  ctx.scale(breath, 1.0);

  switch (charIdx % 7) {
    case 0: { // Trishu Torso
      ctx.fillStyle = PALETTE.TRISHU_DRESS;
      ctx.strokeStyle = PALETTE.TRISHU_DRESS_OUTLINE;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(-22, -18, 44, 38, [6, 6, 12, 12]);
      ctx.fill();
      ctx.stroke();

      // Straps & Buttons
      ctx.fillStyle = '#FFD54F';
      ctx.beginPath();
      ctx.arc(-11, -8, 3.5, 0, Math.PI * 2);
      ctx.arc(11, -8, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Arms
      ctx.fillStyle = PALETTE.TRISHU_SKIN;
      ctx.strokeStyle = PALETTE.TRISHU_OUTLINE;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(-26, -4, 6, 0, Math.PI * 2);
      ctx.arc(26, -4, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      break;
    }

    case 1: { // Leo Torso
      ctx.fillStyle = PALETTE.LEO_SHIRT;
      ctx.strokeStyle = PALETTE.LEO_SHIRT_OUTLINE;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(-20, -16, 40, 34, 8);
      ctx.fill();
      ctx.stroke();

      // Mini Plush Dino
      ctx.fillStyle = PALETTE.DINOSAUR_GREEN;
      ctx.strokeStyle = PALETTE.DINOSAUR_OUTLINE;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(18, 2, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      break;
    }

    case 2: { // Dad Torso
      ctx.fillStyle = PALETTE.DAD_SHIRT;
      ctx.strokeStyle = PALETTE.DAD_SHIRT_OUTLINE;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(0, 0, 28, 22, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Collar
      ctx.fillStyle = '#E0F2F1';
      ctx.beginPath();
      ctx.moveTo(-8, -18); ctx.lineTo(0, -10); ctx.lineTo(8, -18);
      ctx.fill();
      break;
    }

    case 3: { // Mom Torso
      ctx.fillStyle = PALETTE.MOM_DRESS;
      ctx.strokeStyle = PALETTE.MOM_DRESS_OUTLINE;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-16, -16);
      ctx.lineTo(16, -16);
      ctx.lineTo(26, 20);
      ctx.lineTo(-26, 20);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    }

    case 4: { // Grandpa Torso
      ctx.fillStyle = PALETTE.GRANDPA_SHIRT;
      ctx.strokeStyle = PALETTE.GRANDPA_SHIRT_OUTLINE;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(-24, -18, 48, 38, 8);
      ctx.fill();
      ctx.stroke();

      // Pocket
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.rect(-8, -4, 16, 14);
      ctx.stroke();
      break;
    }

    case 5: { // Mimi Torso
      ctx.fillStyle = PALETTE.MIMI_DRESS;
      ctx.strokeStyle = PALETTE.MIMI_DRESS_OUTLINE;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(-18, -16, 36, 34, [6, 6, 12, 12]);
      ctx.fill();
      ctx.stroke();

      // Bubble Wand
      ctx.strokeStyle = PALETTE.MIMI_WAND;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(18, -6); ctx.lineTo(26, 12);
      ctx.stroke();
      ctx.fillStyle = PALETTE.MIMI_BUBBLE;
      ctx.beginPath();
      ctx.arc(18, -6, 5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 6: { // Mrs Clucky Torso
      ctx.fillStyle = PALETTE.CHICKEN_BODY;
      ctx.strokeStyle = PALETTE.CHICKEN_OUTLINE;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(0, 0, 30, 22, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Wing
      ctx.fillStyle = PALETTE.CHICKEN_WING_SHADOW;
      ctx.beginPath();
      ctx.ellipse(-10, 0, 16, 10, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      break;
    }
  }

  ctx.restore();
}
