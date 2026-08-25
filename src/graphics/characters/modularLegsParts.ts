/**
 * Modular Legs & Feet Vector Renderer (7 Characters)
 * Mix & Match Studio
 * Strictly under 500 Lines of Code
 */

import { PALETTE } from '../palette';
import { CharacterAnimState } from '../../types/characters';

export function drawLegsPart(
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

  const wobble = animState?.wobbleAngle ?? 0;
  ctx.rotate(wobble * 0.5);

  switch (charIdx % 7) {
    case 0: { // Trishu Legs & Red Sneakers
      ctx.strokeStyle = PALETTE.TRISHU_OUTLINE;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-10, -10); ctx.lineTo(-10, 4);
      ctx.moveTo(10, -10); ctx.lineTo(10, 4);
      ctx.stroke();

      // Red Sneakers
      ctx.fillStyle = PALETTE.TRISHU_BOOTS;
      ctx.strokeStyle = PALETTE.TRISHU_BOOTS_OUTLINE;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-17, 4, 15, 10, 4);
      ctx.roundRect(3, 4, 15, 10, 4);
      ctx.fill();
      ctx.stroke();
      break;
    }

    case 1: { // Leo Green Boots
      ctx.fillStyle = PALETTE.DINOSAUR_GREEN;
      ctx.strokeStyle = PALETTE.DINOSAUR_OUTLINE;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-16, 2, 13, 12, [4, 4, 2, 2]);
      ctx.roundRect(3, 2, 13, 12, [4, 4, 2, 2]);
      ctx.fill();
      ctx.stroke();
      break;
    }

    case 2: { // Dad Slacks & Brown Shoes
      ctx.fillStyle = PALETTE.DAD_GLASSES;
      ctx.beginPath();
      ctx.rect(-14, -10, 8, 14);
      ctx.rect(6, -10, 8, 14);
      ctx.fill();

      // Brown shoes
      ctx.fillStyle = '#5D4037';
      ctx.beginPath();
      ctx.ellipse(-10, 6, 9, 5, 0, 0, Math.PI * 2);
      ctx.ellipse(10, 6, 9, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 3: { // Mom Red Flats
      ctx.fillStyle = PALETTE.MOM_DRESS_OUTLINE;
      ctx.beginPath();
      ctx.ellipse(-8, 6, 8, 4, 0, 0, Math.PI * 2);
      ctx.ellipse(8, 6, 8, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 4: { // Grandpa Green Wellies
      ctx.fillStyle = PALETTE.GRANDPA_BOOTS;
      ctx.strokeStyle = PALETTE.GRANDPA_BOOTS_OUTLINE;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-16, 0, 14, 15, [4, 4, 3, 3]);
      ctx.roundRect(2, 0, 14, 15, [4, 4, 3, 3]);
      ctx.fill();
      ctx.stroke();
      break;
    }

    case 5: { // Mimi Bunny Paws
      ctx.fillStyle = PALETTE.MIMI_FUR;
      ctx.strokeStyle = PALETTE.MIMI_FUR_OUTLINE;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(-9, 5, 8, 5, 0, 0, Math.PI * 2);
      ctx.ellipse(9, 5, 8, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 6: { // Mrs Clucky Chicken Legs
      ctx.strokeStyle = PALETTE.CHICKEN_BEAK;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-8, -10); ctx.lineTo(-8, 6);
      ctx.moveTo(8, -10); ctx.lineTo(8, 6);
      // Toes
      ctx.moveTo(-13, 8); ctx.lineTo(-8, 6); ctx.lineTo(-3, 8);
      ctx.moveTo(3, 8); ctx.lineTo(8, 6); ctx.lineTo(13, 8);
      ctx.stroke();
      break;
    }
  }

  ctx.restore();
}
