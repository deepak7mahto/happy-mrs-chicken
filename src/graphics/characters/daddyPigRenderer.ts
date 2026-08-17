/**
 * Daddy Pig Procedural Vector Renderer (Show-Accurate Cartoon Geometry)
 * Peppa Pig: Happy Mrs Chicken 8-Game Deluxe Expansion Suite
 * Strictly under 500 Lines of Code
 */

import { PALETTE } from '../palette';
import { DaddyPigOptions } from '../../types/characters';
import { preserveVolume, getDaddyPigPanic } from '../animations';

export function drawDaddyPig(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number = 1.0,
  options: DaddyPigOptions = {}
): void {
  const animState = options.animState;
  const panic = options.panicStage ?? animState?.panicStage ?? 0;
  const time = options.time ?? animState?.customTimer ?? animState?.wobbleTimer ?? 0;
  const baseSquash = options.squash ?? options.squish ?? animState?.squash ?? 1.0;
  const breath = animState?.breathScale ?? 1.0;

  let shakeX = 0;
  let shakeY = 0;
  let eyeRadius = panic > 2 ? 4.5 : 3;
  let sweatDropsCount = options.sweatCount ?? (panic >= 1 ? (panic >= 3 ? 4 : 2) : 0);
  let bellyBounce = 0;

  if (panic > 0) {
    const panicData = getDaddyPigPanic(panic, time);
    shakeX = panicData.shakeX;
    shakeY = panicData.shakeY;
    eyeRadius = panicData.eyeRadius;
    sweatDropsCount = options.sweatCount ?? panicData.sweatCount;
    bellyBounce = panicData.bellyBounce;
  } else if (panic > 1) {
    shakeX = (Math.random() - 0.5) * (panic * 5);
    shakeY = (Math.random() - 0.5) * (panic * 5);
  }

  const activeSquash = baseSquash * breath;
  const { scaleX: stretchX, scaleY: activeSquish } = preserveVolume(activeSquash);
  const eyeBlink = options.eyeBlink ?? (panic === 0 ? (animState?.isBlinking ?? false) : false);

  ctx.save();
  ctx.translate(x + shakeX, y + shakeY);
  ctx.scale(scale * stretchX, scale * activeSquish);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // 1. Belly & Teal Shirt
  ctx.fillStyle = PALETTE.DADDY_SHIRT;
  ctx.strokeStyle = PALETTE.DADDY_SHIRT_OUTLINE;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.ellipse(0, 42 + bellyBounce, 56, 46, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 2. Black Shoes & Legs
  ctx.fillStyle = PALETTE.BLACK;
  ctx.beginPath();
  ctx.roundRect(-30, 80, 24, 14, 5);
  ctx.roundRect(8, 80, 24, 14, 5);
  ctx.fill();

  ctx.strokeStyle = PALETTE.DADDY_SKIN;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(-18, 70);
  ctx.lineTo(-18, 82);
  ctx.moveTo(18, 70);
  ctx.lineTo(18, 82);
  ctx.stroke();

  // 3. Arms
  ctx.strokeStyle = PALETTE.DADDY_SKIN;
  ctx.lineWidth = 4.5;
  ctx.beginPath();
  ctx.moveTo(-35, 30);
  ctx.lineTo(-52, 22);
  ctx.moveTo(35, 30);
  ctx.lineTo(52, 22);
  ctx.stroke();

  // 4. Ears
  ctx.fillStyle = PALETTE.DADDY_SKIN;
  ctx.strokeStyle = PALETTE.DADDY_OUTLINE;
  ctx.lineWidth = 4.5;

  ctx.beginPath();
  ctx.ellipse(-22, -54, 7, 14, -0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(-8, -54, 7, 14, 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 5. Canonical Hairdryer Head & Snout Contour (Daddy Pig Proportions)
  ctx.fillStyle = PALETTE.DADDY_SKIN;
  ctx.strokeStyle = PALETTE.DADDY_OUTLINE;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(-14, -46);
  ctx.quadraticCurveTo(16, -46, 46, -38);
  ctx.quadraticCurveTo(56, -36, 56, -26);
  ctx.quadraticCurveTo(56, -16, 46, -14);
  ctx.quadraticCurveTo(18, -14, 6, 0);
  ctx.quadraticCurveTo(-4, 10, -26, 8);
  ctx.quadraticCurveTo(-52, 6, -52, -18);
  ctx.quadraticCurveTo(-52, -46, -14, -46);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Snout Oval
  ctx.beginPath();
  ctx.ellipse(46, -26, 5.5, 11, 0.12, 0, Math.PI * 2);
  ctx.fillStyle = PALETTE.DADDY_SKIN;
  ctx.fill();
  ctx.strokeStyle = PALETTE.DADDY_OUTLINE;
  ctx.lineWidth = 4;
  ctx.stroke();

  // Nostril Dots
  ctx.fillStyle = PALETTE.DADDY_OUTLINE;
  ctx.beginPath();
  ctx.arc(45, -30, 2.5, 0, Math.PI * 2);
  ctx.arc(47, -22, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Rosy Cheek
  ctx.fillStyle = PALETTE.DADDY_CHEEK;
  ctx.beginPath();
  ctx.arc(-22, -10, 14, 0, Math.PI * 2);
  ctx.fill();

  // 6. Beard Stubble
  ctx.strokeStyle = PALETTE.DADDY_BEARD;
  ctx.lineWidth = 2.5;
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.arc(-20 + i * 8, 4, 3.5, 0, Math.PI);
    ctx.stroke();
  }

  // 7. Signature Round Glasses & Eyes
  ctx.strokeStyle = PALETTE.DADDY_GLASSES;
  ctx.lineWidth = 4;

  // Left lens
  ctx.beginPath();
  ctx.arc(6, -36, 11, 0, Math.PI * 2);
  ctx.stroke();

  // Right lens
  ctx.beginPath();
  ctx.arc(26, -34, 11, 0, Math.PI * 2);
  ctx.stroke();

  // Glasses bridge
  ctx.beginPath();
  ctx.moveTo(17, -35);
  ctx.lineTo(15, -35);
  ctx.moveTo(-5, -36);
  ctx.lineTo(-14, -38);
  ctx.stroke();

  // Eyes inside glasses
  if (eyeBlink) {
    ctx.strokeStyle = PALETTE.BLACK;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(1, -36); ctx.lineTo(11, -36);
    ctx.moveTo(21, -34); ctx.lineTo(31, -34);
    ctx.stroke();
  } else {
    ctx.fillStyle = PALETTE.BLACK;
    ctx.beginPath();
    ctx.arc(7, -36, eyeRadius, 0, Math.PI * 2);
    ctx.arc(27, -34, eyeRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  // 8. Smile or Panic Mouth
  ctx.strokeStyle = PALETTE.DADDY_OUTLINE;
  ctx.lineWidth = 4;
  ctx.beginPath();
  if (panic >= 3) {
    // Open screaming oval mouth
    ctx.fillStyle = '#C62828';
    ctx.ellipse(18, -10, 8, 11, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else if (panic >= 1) {
    // Wobbly worried mouth
    ctx.moveTo(6, -10);
    ctx.quadraticCurveTo(16, -16, 26, -10);
    ctx.stroke();
  } else {
    // Happy smile
    ctx.arc(16, -12, 12, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(26, -14, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = PALETTE.DADDY_OUTLINE;
    ctx.fill();
  }

  // Sweat Drops in Panic Mode
  if (sweatDropsCount > 0) {
    ctx.fillStyle = '#29B6F6';
    ctx.strokeStyle = '#0288D1';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < sweatDropsCount; i++) {
      ctx.beginPath();
      ctx.arc(-28 - i * 8, -35 - (i % 2) * 8, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  }

  ctx.restore();
}

export const renderDaddyPig = drawDaddyPig;
export const renderDaddy = drawDaddyPig;
export const drawDaddy = drawDaddyPig;
