/**
 * George Pig & Mr. Dinosaur Procedural Vector Renderer (Show-Accurate Cartoon Geometry)
 * Peppa Pig: Happy Mrs Chicken 8-Game Deluxe Expansion Suite
 * Strictly under 500 Lines of Code
 */

import { PALETTE } from '../palette';
import { GeorgeOptions } from '../../types/characters';
import { preserveVolume, getJawRotationAngle } from '../animations';

export function drawGeorgePig(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number = 1.0,
  options: GeorgeOptions = {}
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

  // 1. Curled Tail
  ctx.strokeStyle = PALETTE.GEORGE_OUTLINE;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-16, 20);
  ctx.bezierCurveTo(-24, 18, -26, 8, -18, 8);
  ctx.bezierCurveTo(-12, 8, -14, 16, -22, 14);
  ctx.stroke();

  // 2. Shoes & Legs (Blue Boots)
  ctx.fillStyle = '#1565C0';
  ctx.strokeStyle = '#0D47A1';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(-16, 36, 14, 10, 4);
  ctx.roundRect(3, 36, 14, 10, 4);
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = PALETTE.GEORGE_SKIN;
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(-9, 28);
  ctx.lineTo(-9, 37);
  ctx.moveTo(9, 28);
  ctx.lineTo(9, 37);
  ctx.stroke();

  // 3. Toddler Blue Shirt
  ctx.fillStyle = PALETTE.GEORGE_SHIRT;
  ctx.strokeStyle = PALETTE.GEORGE_SHIRT_OUTLINE;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-12, 0);
  ctx.lineTo(12, 0);
  ctx.quadraticCurveTo(20, 16, 24, 30);
  ctx.quadraticCurveTo(0, 32, -24, 30);
  ctx.quadraticCurveTo(-20, 16, -12, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 4. Back Arm
  ctx.strokeStyle = PALETTE.GEORGE_SKIN;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-12, 10);
  ctx.lineTo(-22 + Math.sin(armWave) * 4, 4);
  ctx.stroke();

  // 5. Ears
  ctx.fillStyle = PALETTE.GEORGE_SKIN;
  ctx.strokeStyle = PALETTE.GEORGE_OUTLINE;
  ctx.lineWidth = 3.5;

  ctx.beginPath();
  ctx.ellipse(-14, -40, 4.5, 9, -0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(-4, -40, 4.5, 9, 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 6. Canonical Hairdryer Head & Snout Contour (Toddler Size)
  ctx.fillStyle = PALETTE.GEORGE_SKIN;
  ctx.strokeStyle = PALETTE.GEORGE_OUTLINE;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-8, -34);
  ctx.quadraticCurveTo(10, -34, 30, -29);
  ctx.quadraticCurveTo(36, -27, 36, -21);
  ctx.quadraticCurveTo(36, -15, 30, -13);
  ctx.quadraticCurveTo(12, -13, 4, -3);
  ctx.quadraticCurveTo(-3, 5, -18, 3);
  ctx.quadraticCurveTo(-34, 1, -34, -15);
  ctx.quadraticCurveTo(-34, -34, -8, -34);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Snout Oval
  ctx.beginPath();
  ctx.ellipse(30, -21, 3.5, 7, 0.12, 0, Math.PI * 2);
  ctx.fillStyle = PALETTE.GEORGE_SKIN;
  ctx.fill();
  ctx.strokeStyle = PALETTE.GEORGE_OUTLINE;
  ctx.lineWidth = 3;
  ctx.stroke();

  // Nostrils
  ctx.fillStyle = PALETTE.GEORGE_OUTLINE;
  ctx.beginPath();
  ctx.arc(29, -23, 1.6, 0, Math.PI * 2);
  ctx.arc(31, -19, 1.6, 0, Math.PI * 2);
  ctx.fill();

  // Rosy Cheek
  ctx.fillStyle = PALETTE.GEORGE_CHEEK;
  ctx.beginPath();
  ctx.arc(-14, -9, 9, 0, Math.PI * 2);
  ctx.fill();

  // Eyes & Blinking
  if (eyeBlink) {
    ctx.strokeStyle = PALETTE.GEORGE_OUTLINE;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(3, -29, 4, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(14, -27, 4, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.stroke();
  } else {
    ctx.fillStyle = PALETTE.WHITE;
    ctx.strokeStyle = PALETTE.GEORGE_OUTLINE;
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.arc(3, -29, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(14, -27, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = PALETTE.BLACK;
    ctx.beginPath();
    ctx.arc(4, -29, 2.2, 0, Math.PI * 2);
    ctx.arc(15, -27, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Mouth (Happy or Crying)
  if (isCrying) {
    ctx.strokeStyle = PALETTE.GEORGE_OUTLINE;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(10, -4, 8, Math.PI * 1.1, Math.PI * 1.9);
    ctx.stroke();

    // Teardrops
    ctx.fillStyle = '#4FC3F7';
    ctx.beginPath();
    ctx.arc(-2, -18, 3, 0, Math.PI * 2);
    ctx.arc(14, -18, 3, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.strokeStyle = PALETTE.PEPPA_DRESS_OUTLINE;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(10, -9, 8, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
  }

  // 7. Front Arm & Mr. Dinosaur
  if (holdingDino) {
    ctx.save();
    ctx.translate(18, 8);

    // Mr. Dinosaur Torso & Tail
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

    // Back Spines
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

    // George Front Arm Gripping Dino
    ctx.strokeStyle = PALETTE.GEORGE_SKIN;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(12, 6);
    ctx.lineTo(18, 10);
    ctx.stroke();
  } else {
    ctx.strokeStyle = PALETTE.GEORGE_SKIN;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(12, 6);
    ctx.lineTo(22 - Math.sin(armWave) * 4, 0);
    ctx.stroke();
  }

  ctx.restore();
}

export const renderGeorge = drawGeorgePig;
export const renderGeorgePig = drawGeorgePig;
export const drawGeorge = drawGeorgePig;
