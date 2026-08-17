/**
 * Leo (Little Brother) Procedural Vector Renderer
 * Adventures of Trishu 8-Game Suite
 * Strictly under 500 Lines of Code
 */

import { PALETTE } from '../palette';
import { LeoOptions } from '../../types/characters';
import { preserveVolume, getJawRotationAngle } from '../animations';

export function drawLeo(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number = 1.0,
  options: LeoOptions = {}
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
  const holdingDino = options.holdingDino !== false;
  const rawChomp = options.dinoChomp ?? (animState?.chompingJaw ? getJawRotationAngle(animState.chompingJaw) / (Math.PI / 6) : 0);
  const dinoChomp = Math.max(0, Math.min(1.0, rawChomp));
  const isCrying = !!options.isCrying || options.expression === 'crying';

  ctx.save();
  ctx.translate(x, y + jumpY);
  ctx.scale(facingLeft ? -scale * stretchX : scale * stretchX, scale * activeSquish);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // 1. Shoes & Legs (Blue Sneakers)
  ctx.fillStyle = '#1565C0';
  ctx.strokeStyle = '#0D47A1';
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.roundRect(-14, 34, 12, 10, 3.5);
  ctx.roundRect(2, 34, 12, 10, 3.5);
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = PALETTE.LEO_SKIN;
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(-8, 26);
  ctx.lineTo(-8, 35);
  ctx.moveTo(8, 26);
  ctx.lineTo(8, 35);
  ctx.stroke();

  // 2. Toddler Blue Overalls / Shirt
  ctx.fillStyle = PALETTE.LEO_SHIRT;
  ctx.strokeStyle = PALETTE.LEO_SHIRT_OUTLINE;
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(-11, 2);
  ctx.lineTo(11, 2);
  ctx.quadraticCurveTo(18, 16, 16, 28);
  ctx.lineTo(-16, 28);
  ctx.quadraticCurveTo(-18, 16, -11, 2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 3. Back Arm
  ctx.strokeStyle = PALETTE.LEO_SKIN;
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(-11, 10);
  ctx.lineTo(-20 + Math.sin(armWave) * 4, 6);
  ctx.stroke();

  // 4. Neck & Head
  ctx.fillStyle = PALETTE.LEO_SKIN;
  ctx.strokeStyle = PALETTE.LEO_OUTLINE;
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  ctx.arc(0, -9, 17, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 5. Short Toddler Hair (Dark Brown)
  ctx.fillStyle = '#5D4037';
  ctx.strokeStyle = '#3E2723';
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.moveTo(-16, -12);
  ctx.quadraticCurveTo(-12, -26, 0, -26);
  ctx.quadraticCurveTo(12, -26, 16, -12);
  ctx.quadraticCurveTo(8, -19, 0, -19);
  ctx.quadraticCurveTo(-8, -19, -16, -12);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 6. Cheeks
  ctx.fillStyle = PALETTE.LEO_CHEEK;
  ctx.beginPath();
  ctx.arc(-9, -5, 3.5, 0, Math.PI * 2);
  ctx.arc(9, -5, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // 7. Eyes / Tears
  if (isCrying) {
    ctx.strokeStyle = PALETTE.BLACK;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-9, -10); ctx.lineTo(-4, -13); ctx.lineTo(-9, -16);
    ctx.moveTo(9, -10); ctx.lineTo(4, -13); ctx.lineTo(9, -16);
    ctx.stroke();

    // Teardrops
    ctx.fillStyle = '#4FC3F7';
    ctx.beginPath();
    ctx.arc(-14, -6, 3, 0, Math.PI * 2);
    ctx.arc(-17, 2, 2.5, 0, Math.PI * 2);
    ctx.arc(14, -6, 3, 0, Math.PI * 2);
    ctx.arc(17, 2, 2.5, 0, Math.PI * 2);
    ctx.fill();
  } else if (eyeBlink) {
    ctx.strokeStyle = PALETTE.BLACK;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(-6, -10, 3, Math.PI, 0, false);
    ctx.moveTo(3, -10);
    ctx.arc(6, -10, 3, Math.PI, 0, false);
    ctx.stroke();
  } else {
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.ellipse(-6, -10, 4, 5, 0, 0, Math.PI * 2);
    ctx.ellipse(6, -10, 4, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = PALETTE.BLACK;
    ctx.beginPath();
    ctx.arc(-5, -10, 2.2, 0, Math.PI * 2);
    ctx.arc(5, -10, 2.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(-6, -11.5, 0.9, 0, Math.PI * 2);
    ctx.arc(4, -11.5, 0.9, 0, Math.PI * 2);
    ctx.fill();
  }

  // 8. Mouth
  ctx.strokeStyle = PALETTE.BLACK;
  ctx.lineWidth = 2.2;
  if (isCrying) {
    ctx.fillStyle = '#D32F2F';
    ctx.beginPath();
    ctx.arc(0, -2, 4.5, 0, Math.PI, true);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.arc(0, -4, 4, 0.2, Math.PI - 0.2, false);
    ctx.stroke();
  }

  // 9. Green Plush Dinosaur Toy Held in Hand
  if (holdingDino) {
    ctx.save();
    ctx.translate(14, 10);
    ctx.scale(0.85, 0.85);

    // Dino Torso & Tail
    ctx.fillStyle = PALETTE.DINOSAUR_GREEN;
    ctx.strokeStyle = PALETTE.DINOSAUR_OUTLINE;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-12, 2, -16, 12);
    ctx.quadraticCurveTo(-8, 10, -3, 6);
    ctx.lineTo(6, 6);
    ctx.quadraticCurveTo(10, 3, 8, -6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 4 Back Spines
    ctx.fillStyle = PALETTE.DINOSAUR_OUTLINE;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(-10 + i * 4.5, 2 - i * 1.8);
      ctx.lineTo(-8 + i * 4.5, -2 - i * 1.8);
      ctx.lineTo(-6 + i * 4.5, 1 - i * 1.8);
      ctx.fill();
    }

    // Upper Head & Snout
    ctx.fillStyle = PALETTE.DINOSAUR_GREEN;
    ctx.strokeStyle = PALETTE.DINOSAUR_OUTLINE;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(5, -6);
    ctx.quadraticCurveTo(8, -14, 18, -14);
    ctx.lineTo(21, -12);
    ctx.lineTo(14, -6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Sharp White Teeth
    ctx.fillStyle = PALETTE.DINOSAUR_TEETH;
    ctx.beginPath();
    ctx.moveTo(14, -6); ctx.lineTo(16, -4); ctx.lineTo(18, -6);
    ctx.lineTo(20, -4); ctx.lineTo(21, -6);
    ctx.fill();

    // Articulated Lower Jaw (Chomping)
    ctx.save();
    ctx.translate(12, -6);
    ctx.rotate(dinoChomp * (Math.PI / 6));

    if (dinoChomp > 0.05) {
      ctx.fillStyle = PALETTE.DINOSAUR_MOUTH;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(7, -3 * dinoChomp);
      ctx.lineTo(7, 3);
      ctx.closePath();
      ctx.fill();
    }

    ctx.fillStyle = PALETTE.DINOSAUR_GREEN;
    ctx.strokeStyle = PALETTE.DINOSAUR_OUTLINE;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(8, 0);
    ctx.lineTo(6, 3.5);
    ctx.lineTo(0, 2.5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = PALETTE.DINOSAUR_TEETH;
    ctx.beginPath();
    ctx.moveTo(2, 0); ctx.lineTo(4, -1.8); ctx.lineTo(6, 0);
    ctx.lineTo(7, -1.8); ctx.lineTo(8, 0);
    ctx.fill();
    ctx.restore();

    // Dino Eye
    ctx.fillStyle = '#FFEB3B';
    ctx.beginPath();
    ctx.arc(10, -11, 2.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = PALETTE.BLACK;
    ctx.beginPath();
    ctx.arc(11, -11, 1.3, 0, Math.PI * 2);
    ctx.fill();

    // Dino Tiny Arms
    ctx.strokeStyle = PALETTE.DINOSAUR_OUTLINE;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(5, 2);
    ctx.lineTo(10, 0);
    ctx.stroke();

    ctx.restore();

    // Front Arm Holding Dino
    ctx.strokeStyle = PALETTE.LEO_SKIN;
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.moveTo(8, 8);
    ctx.lineTo(15, 12);
    ctx.stroke();
  } else {
    ctx.strokeStyle = PALETTE.LEO_SKIN;
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.moveTo(8, 8);
    ctx.lineTo(18 - Math.sin(armWave) * 4, 2);
    ctx.stroke();
  }

  ctx.restore();
}

export const renderLeo = drawLeo;
export const drawLeoBoy = drawLeo;
