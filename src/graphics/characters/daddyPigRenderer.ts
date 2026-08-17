/**
 * Daddy Pig Procedural Vector Renderer
 * Peppa Pig: Happy Mrs Chicken 8-Game Deluxe Expansion Suite
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
  ctx.ellipse(0, 45 + bellyBounce, 58, 48, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 2. Head & Snout
  ctx.fillStyle = PALETTE.DADDY_SKIN;
  ctx.strokeStyle = PALETTE.DADDY_OUTLINE;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(0, -10);
  ctx.quadraticCurveTo(45, -10, 48, -35);
  ctx.lineTo(70, -35);
  ctx.arc(70, -25, 11, -Math.PI / 2, Math.PI / 2);
  ctx.lineTo(40, -15);
  ctx.quadraticCurveTo(20, -55, -20, -55);
  ctx.quadraticCurveTo(-60, -55, -60, -15);
  ctx.quadraticCurveTo(-60, 20, 0, -10);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Nostril Dots
  ctx.fillStyle = PALETTE.DADDY_OUTLINE;
  ctx.beginPath();
  ctx.arc(70, -28, 2.2, 0, Math.PI * 2);
  ctx.arc(70, -22, 2.2, 0, Math.PI * 2);
  ctx.fill();

  // Ears
  ctx.beginPath();
  ctx.ellipse(-20, -60, 7, 14, -0.2, 0, Math.PI * 2);
  ctx.ellipse(-4, -60, 7, 14, 0.1, 0, Math.PI * 2);
  ctx.fillStyle = PALETTE.DADDY_SKIN;
  ctx.fill();
  ctx.stroke();

  // Cheek
  ctx.fillStyle = PALETTE.DADDY_CHEEK;
  ctx.beginPath();
  ctx.arc(-22, -8, 14, 0, Math.PI * 2);
  ctx.fill();

  // 3. Beard Stubble
  ctx.strokeStyle = PALETTE.DADDY_BEARD;
  ctx.lineWidth = 3;
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.arc(-20 + i * 8, 5, 3, 0, Math.PI);
    ctx.stroke();
  }

  // 4. Glasses
  ctx.strokeStyle = PALETTE.DADDY_GLASSES;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(10, -35, 10, 0, Math.PI * 2);
  ctx.arc(32, -35, 10, 0, Math.PI * 2);
  ctx.moveTo(20, -35);
  ctx.lineTo(22, -35);
  ctx.moveTo(0, -35);
  ctx.lineTo(-12, -38);
  ctx.stroke();

  // 5. Eyes & Blinking
  if (eyeBlink) {
    ctx.strokeStyle = PALETTE.BLACK;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(6, -35); ctx.lineTo(14, -35);
    ctx.moveTo(28, -35); ctx.lineTo(36, -35);
    ctx.stroke();
  } else {
    ctx.fillStyle = PALETTE.BLACK;
    ctx.beginPath();
    ctx.arc(11, -35, eyeRadius, 0, Math.PI * 2);
    ctx.arc(33, -35, eyeRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  // 6. Smile or Panic Mouth
  ctx.strokeStyle = PALETTE.DADDY_OUTLINE;
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  if (panic >= 3) {
    // Open screaming oval mouth
    ctx.ellipse(22, -12, 10, 8, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#D32F2F';
    ctx.fill();
    ctx.stroke();
  } else if (panic >= 1) {
    // Wavy nervous grimace
    ctx.moveTo(10, -14);
    ctx.quadraticCurveTo(18, -10, 26, -16);
    ctx.stroke();
  } else {
    // Jolly smile
    ctx.arc(18, -14, 12, 0.1 * Math.PI, 0.8 * Math.PI);
    ctx.stroke();
  }

  // 7. Sweat Drops
  if (sweatDropsCount > 0) {
    ctx.fillStyle = '#4FC3F7';
    ctx.beginPath();
    ctx.arc(-35, -35 + Math.sin(time * 8) * 5, 5, 0, Math.PI * 2);
    if (sweatDropsCount >= 2) {
      ctx.arc(-25, -55, 4, 0, Math.PI * 2);
    }
    if (sweatDropsCount >= 3) {
      ctx.arc(38, -50 + Math.cos(time * 10) * 4, 4.5, 0, Math.PI * 2);
    }
    if (sweatDropsCount >= 4) {
      ctx.arc(-15, -45, 3.5, 0, Math.PI * 2);
    }
    ctx.fill();
  }

  ctx.restore();
}

export const renderDaddy = drawDaddyPig;
export const renderDaddyPig = drawDaddyPig;
export const drawDaddy = drawDaddyPig;
