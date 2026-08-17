/**
 * Trishu Character Procedural Vector Renderer
 * Adventures of Trishu 8-Game Suite
 * Strictly under 500 Lines of Code
 */

import { PALETTE } from '../palette';
import { TrishuOptions } from '../../types/characters';
import { preserveVolume } from '../animations';

export function drawTrishu(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number = 1.0,
  options: TrishuOptions = {}
): void {
  const animState = options.animState;
  const jumpY = options.jumpY ?? animState?.jumpY ?? 0;
  const baseSquash = options.squash ?? options.squish ?? animState?.squash ?? 1.0;
  const breath = animState?.breathScale ?? 1.0;
  const activeSquash = baseSquash * breath;
  const { scaleX: stretchX, scaleY: activeSquish } = preserveVolume(activeSquash);
  const armWave = options.armWave ?? animState?.armWave ?? (animState?.wobbleAngle ? Math.sin(animState.wobbleTimer * 4) * 0.4 : 0);
  const eyeBlink = options.eyeBlink ?? animState?.isBlinking ?? false;
  const facingLeft = options.facingLeft ?? animState?.facingLeft ?? false;
  const muddyBoots = !!options.muddyBoots;
  const expression = options.expression ?? 'happy';

  ctx.save();
  ctx.translate(x, y + jumpY);
  ctx.scale(facingLeft ? -scale * stretchX : scale * stretchX, scale * activeSquish);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // 1. Twin Pigtails (Back Layer)
  ctx.fillStyle = PALETTE.TRISHU_HAIR;
  ctx.strokeStyle = PALETTE.TRISHU_HAIR_OUTLINE;
  ctx.lineWidth = 3.5;

  // Left Pigtail
  ctx.beginPath();
  ctx.ellipse(-24, -14, 12, 16, -Math.PI / 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Right Pigtail
  ctx.beginPath();
  ctx.ellipse(24, -14, 12, 16, Math.PI / 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Hair Bows (Back of pigtails)
  ctx.fillStyle = PALETTE.TRISHU_BOW;
  ctx.strokeStyle = PALETTE.TRISHU_DRESS_OUTLINE;
  ctx.lineWidth = 2.5;

  ctx.beginPath();
  ctx.arc(-18, -20, 5, 0, Math.PI * 2);
  ctx.arc(18, -20, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 2. Legs
  ctx.strokeStyle = PALETTE.TRISHU_SKIN;
  ctx.lineWidth = 4.5;
  ctx.beginPath();
  ctx.moveTo(-9, 28);
  ctx.lineTo(-9, 44);
  ctx.moveTo(9, 28);
  ctx.lineTo(9, 44);
  ctx.stroke();

  // 3. Boots / Sneakers
  ctx.fillStyle = PALETTE.TRISHU_BOOTS;
  ctx.strokeStyle = PALETTE.TRISHU_BOOTS_OUTLINE;
  ctx.lineWidth = 3;

  // Left Boot
  ctx.beginPath();
  ctx.roundRect(-16, 42, 14, 13, [4, 4, 6, 6]);
  ctx.fill();
  ctx.stroke();

  // Right Boot
  ctx.beginPath();
  ctx.roundRect(2, 42, 14, 13, [4, 4, 6, 6]);
  ctx.fill();
  ctx.stroke();

  // Boot Toes
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(-13, 50, 3.5, 0, Math.PI * 2);
  ctx.arc(13, 50, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // Mud splatters on boots
  if (muddyBoots) {
    ctx.fillStyle = PALETTE.MUD_DARK;
    ctx.beginPath();
    ctx.arc(-11, 48, 2.5, 0, Math.PI * 2);
    ctx.arc(-6, 52, 2.0, 0, Math.PI * 2);
    ctx.arc(6, 51, 2.5, 0, Math.PI * 2);
    ctx.arc(11, 47, 2.0, 0, Math.PI * 2);
    ctx.fill();
  }

  // 4. Dress / Dungarees
  ctx.fillStyle = PALETTE.TRISHU_DRESS;
  ctx.strokeStyle = PALETTE.TRISHU_DRESS_OUTLINE;
  ctx.lineWidth = 3.5;

  ctx.beginPath();
  ctx.moveTo(-14, 4);
  ctx.lineTo(14, 4);
  ctx.quadraticCurveTo(20, 20, 18, 32);
  ctx.lineTo(-18, 32);
  ctx.quadraticCurveTo(-20, 20, -14, 4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Pocket on dress
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = PALETTE.TRISHU_DRESS_OUTLINE;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(-7, 16, 14, 11, 4);
  ctx.fill();
  ctx.stroke();

  // Cute flower/star on pocket
  ctx.fillStyle = PALETTE.TRISHU_BOW;
  ctx.beginPath();
  ctx.arc(0, 21, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // 5. Arms
  ctx.strokeStyle = PALETTE.TRISHU_SKIN;
  ctx.lineWidth = 4;

  // Left Arm
  ctx.save();
  ctx.translate(-14, 10);
  ctx.rotate(-0.3 + armWave);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-10, 12);
  ctx.stroke();
  // Left Hand
  ctx.fillStyle = PALETTE.TRISHU_SKIN;
  ctx.beginPath();
  ctx.arc(-11, 13, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Right Arm
  ctx.save();
  ctx.translate(14, 10);
  ctx.rotate(0.3 - armWave);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(10, 12);
  ctx.stroke();
  // Right Hand
  ctx.fillStyle = PALETTE.TRISHU_SKIN;
  ctx.beginPath();
  ctx.arc(11, 13, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 6. Neck & Head
  ctx.fillStyle = PALETTE.TRISHU_SKIN;
  ctx.strokeStyle = PALETTE.TRISHU_OUTLINE;
  ctx.lineWidth = 3.5;

  ctx.beginPath();
  ctx.arc(0, -10, 20, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 7. Hair (Front Bangs & Hairline)
  ctx.fillStyle = PALETTE.TRISHU_HAIR;
  ctx.strokeStyle = PALETTE.TRISHU_HAIR_OUTLINE;
  ctx.lineWidth = 3;

  ctx.beginPath();
  ctx.moveTo(-19, -15);
  ctx.quadraticCurveTo(-14, -30, 0, -30);
  ctx.quadraticCurveTo(14, -30, 19, -15);
  ctx.quadraticCurveTo(10, -22, 0, -22);
  ctx.quadraticCurveTo(-10, -22, -19, -15);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 8. Cheeks (Rosy Blush)
  ctx.fillStyle = PALETTE.TRISHU_CHEEK;
  ctx.beginPath();
  ctx.arc(-11, -6, 4, 0, Math.PI * 2);
  ctx.arc(11, -6, 4, 0, Math.PI * 2);
  ctx.fill();

  // 9. Eyes
  if (eyeBlink) {
    // Blinking / Happy Arcs
    ctx.strokeStyle = PALETTE.BLACK;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(-7, -11, 3.5, Math.PI, 0, false);
    ctx.moveTo(3.5, -11);
    ctx.arc(7, -11, 3.5, Math.PI, 0, false);
    ctx.stroke();
  } else {
    // Open Expressive Eyes
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.ellipse(-7, -11, 4.5, 5.5, 0, 0, Math.PI * 2);
    ctx.ellipse(7, -11, 4.5, 5.5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = PALETTE.BLACK;
    ctx.beginPath();
    ctx.arc(-6, -11, 2.5, 0, Math.PI * 2);
    ctx.arc(6, -11, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Eye Sparkle
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(-7, -12.5, 1, 0, Math.PI * 2);
    ctx.arc(5, -12.5, 1, 0, Math.PI * 2);
    ctx.fill();
  }

  // 10. Cute Smile / Mouth Expression
  ctx.strokeStyle = PALETTE.BLACK;
  ctx.lineWidth = 2.5;

  if (expression === 'surprised') {
    ctx.fillStyle = '#FF5252';
    ctx.beginPath();
    ctx.ellipse(0, -3, 3.5, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else if (expression === 'laughing' || expression === 'excited') {
    ctx.fillStyle = '#FF5252';
    ctx.beginPath();
    ctx.arc(0, -4, 5, 0, Math.PI, false);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else {
    // Classic Gentle Smile
    ctx.beginPath();
    ctx.arc(0, -5, 5, 0.2, Math.PI - 0.2, false);
    ctx.stroke();
  }

  ctx.restore();
}

export const renderTrishu = drawTrishu;
export const drawTrishuGirl = drawTrishu;
