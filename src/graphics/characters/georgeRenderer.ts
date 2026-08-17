/**
 * George Pig & Mr. Dinosaur Procedural Vector Renderer
 * Peppa Pig: Happy Mrs Chicken 8-Game Deluxe Expansion Suite
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
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(-16, 22);
  ctx.bezierCurveTo(-26, 20, -28, 10, -20, 10);
  ctx.bezierCurveTo(-14, 10, -16, 18, -24, 16);
  ctx.stroke();

  // 2. Shoes & Legs
  ctx.fillStyle = '#1565C0';
  ctx.strokeStyle = '#0D47A1';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.roundRect(-18, 38, 14, 10, 4);
  ctx.roundRect(4, 38, 14, 10, 4);
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = PALETTE.GEORGE_SKIN;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-11, 28);
  ctx.lineTo(-11, 39);
  ctx.moveTo(11, 28);
  ctx.lineTo(11, 39);
  ctx.stroke();

  // 3. Toddler Blue Shirt
  ctx.fillStyle = PALETTE.GEORGE_SHIRT;
  ctx.strokeStyle = PALETTE.GEORGE_SHIRT_OUTLINE;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-13, -2);
  ctx.quadraticCurveTo(-26, 26, -20, 30);
  ctx.lineTo(20, 30);
  ctx.quadraticCurveTo(26, 26, 13, -2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 4. Back Arm
  ctx.strokeStyle = PALETTE.GEORGE_SKIN;
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(-14, 8);
  ctx.lineTo(-24 + Math.sin(armWave) * 5, 0);
  ctx.stroke();

  // 5. Head & Snout
  ctx.fillStyle = PALETTE.GEORGE_SKIN;
  ctx.strokeStyle = PALETTE.GEORGE_OUTLINE;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, -12);
  ctx.quadraticCurveTo(28, -12, 30, -28);
  ctx.lineTo(44, -28);
  ctx.arc(44, -22, 6.5, -Math.PI / 2, Math.PI / 2);
  ctx.lineTo(24, -16);
  ctx.quadraticCurveTo(12, -36, -12, -36);
  ctx.quadraticCurveTo(-36, -36, -36, -12);
  ctx.quadraticCurveTo(-36, 12, 0, -12);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Nostril Dots
  ctx.fillStyle = PALETTE.GEORGE_OUTLINE;
  ctx.beginPath();
  ctx.arc(44, -24, 1.8, 0, Math.PI * 2);
  ctx.arc(44, -20, 1.8, 0, Math.PI * 2);
  ctx.fill();

  // Ears
  ctx.beginPath();
  ctx.ellipse(-12, -40, 5, 9, -0.2, 0, Math.PI * 2);
  ctx.ellipse(-2, -40, 5, 9, 0.1, 0, Math.PI * 2);
  ctx.fillStyle = PALETTE.GEORGE_SKIN;
  ctx.fill();
  ctx.stroke();

  // Blushing Cheek
  ctx.fillStyle = PALETTE.GEORGE_CHEEK;
  ctx.beginPath();
  ctx.arc(-12, -10, 8.5, 0, Math.PI * 2);
  ctx.fill();

  // Eyes & Blinking
  if (eyeBlink) {
    ctx.strokeStyle = PALETTE.BLACK;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-1, -28);
    ctx.lineTo(6, -28);
    ctx.moveTo(10, -28);
    ctx.lineTo(17, -28);
    ctx.stroke();
  } else {
    ctx.fillStyle = PALETTE.WHITE;
    ctx.strokeStyle = PALETTE.BLACK;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(2, -28, 5, 0, Math.PI * 2);
    ctx.arc(13, -28, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = PALETTE.BLACK;
    ctx.beginPath();
    ctx.arc(3, -28, 2.2, 0, Math.PI * 2);
    ctx.arc(14, -28, 2.2, 0, Math.PI * 2);
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
    ctx.arc(-2, -20, 3.5, 0, Math.PI * 2);
    ctx.arc(16, -20, 3.5, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.strokeStyle = PALETTE.PEPPA_DRESS_OUTLINE;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(10, -12, 8, 0.1 * Math.PI, 0.8 * Math.PI);
    ctx.stroke();
  }

  // 6. Front Arm & Mr. Dinosaur
  if (holdingDino) {
    ctx.save();
    ctx.translate(22, 10);

    // Mr. Dinosaur Torso & Tail
    ctx.fillStyle = PALETTE.DINOSAUR_GREEN;
    ctx.strokeStyle = PALETTE.DINOSAUR_OUTLINE;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-14, 2, -18, 14);
    ctx.quadraticCurveTo(-10, 12, -4, 8);
    ctx.lineTo(8, 8);
    ctx.quadraticCurveTo(12, 4, 10, -8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Back Spines
    ctx.fillStyle = PALETTE.DINOSAUR_OUTLINE;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(-12 + i * 5, 2 - i * 2);
      ctx.lineTo(-10 + i * 5, -3 - i * 2);
      ctx.lineTo(-8 + i * 5, 1 - i * 2);
      ctx.fill();
    }

    // Upper Head & Snout
    ctx.fillStyle = PALETTE.DINOSAUR_GREEN;
    ctx.strokeStyle = PALETTE.DINOSAUR_OUTLINE;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(6, -8);
    ctx.quadraticCurveTo(10, -16, 20, -16);
    ctx.lineTo(24, -14);
    ctx.lineTo(16, -8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Sharp White Teeth (Upper Jaw)
    ctx.fillStyle = PALETTE.DINOSAUR_TEETH;
    ctx.beginPath();
    ctx.moveTo(16, -8); ctx.lineTo(18, -6); ctx.lineTo(20, -8);
    ctx.lineTo(22, -6); ctx.lineTo(24, -8);
    ctx.fill();

    // Articulated Lower Jaw (Chomping up to 30 deg / Math.PI / 6)
    ctx.save();
    ctx.translate(14, -8);
    ctx.rotate(dinoChomp * (Math.PI / 6));

    // Mouth interior when open
    if (dinoChomp > 0.05) {
      ctx.fillStyle = PALETTE.DINOSAUR_MOUTH;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(8, -4 * dinoChomp);
      ctx.lineTo(8, 3);
      ctx.closePath();
      ctx.fill();
    }

    ctx.fillStyle = PALETTE.DINOSAUR_GREEN;
    ctx.strokeStyle = PALETTE.DINOSAUR_OUTLINE;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(9, 0);
    ctx.lineTo(7, 4);
    ctx.lineTo(0, 3);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Sharp White Teeth (Lower Jaw)
    ctx.fillStyle = PALETTE.DINOSAUR_TEETH;
    ctx.beginPath();
    ctx.moveTo(2, 0); ctx.lineTo(4, -2); ctx.lineTo(6, 0);
    ctx.lineTo(8, -2); ctx.lineTo(9, 0);
    ctx.fill();
    ctx.restore();

    // Dino Eye
    ctx.fillStyle = '#FFEB3B';
    ctx.beginPath();
    ctx.arc(12, -13, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = PALETTE.BLACK;
    ctx.beginPath();
    ctx.arc(13, -13, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Dino Arms
    ctx.strokeStyle = PALETTE.DINOSAUR_OUTLINE;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(6, 2);
    ctx.lineTo(12, 0);
    ctx.stroke();

    ctx.restore();

    // George Front Arm Gripping Dino
    ctx.strokeStyle = PALETTE.GEORGE_SKIN;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(14, 8);
    ctx.lineTo(22, 12);
    ctx.stroke();
  } else {
    // Normal waving front arm
    ctx.strokeStyle = PALETTE.GEORGE_SKIN;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(14, 8);
    ctx.lineTo(26 - Math.sin(armWave) * 5, 0);
    ctx.stroke();
  }

  ctx.restore();
}

export const renderGeorge = drawGeorgePig;
export const renderGeorgePig = drawGeorgePig;
export const drawGeorge = drawGeorgePig;
