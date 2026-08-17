/**
 * Dad Character Procedural Vector Renderer
 * Adventures of Trishu 8-Game Suite
 * Strictly under 500 Lines of Code
 */

import { PALETTE } from '../palette';
import { DadOptions } from '../../types/characters';
import { preserveVolume, getDaddyPigPanic } from '../animations';

export function drawDad(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number = 1.0,
  options: DadOptions = {}
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

  // 1. Belly & Teal Polo Shirt
  ctx.fillStyle = PALETTE.DAD_SHIRT;
  ctx.strokeStyle = PALETTE.DAD_SHIRT_OUTLINE;
  ctx.lineWidth = 4.5;
  ctx.beginPath();
  ctx.ellipse(0, 38 + bellyBounce, 48, 40, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Polo Collar
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = PALETTE.DAD_SHIRT_OUTLINE;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(-12, 6);
  ctx.lineTo(0, 18);
  ctx.lineTo(12, 6);
  ctx.stroke();

  // 2. Dark Shoes & Legs
  ctx.fillStyle = '#37474F';
  ctx.beginPath();
  ctx.roundRect(-24, 72, 20, 13, 4);
  ctx.roundRect(4, 72, 20, 13, 4);
  ctx.fill();

  ctx.strokeStyle = '#455A64';
  ctx.lineWidth = 4.5;
  ctx.beginPath();
  ctx.moveTo(-14, 64);
  ctx.lineTo(-14, 74);
  ctx.moveTo(14, 64);
  ctx.lineTo(14, 74);
  ctx.stroke();

  // 3. Arms
  ctx.strokeStyle = PALETTE.DAD_SKIN;
  ctx.lineWidth = 4.5;
  ctx.beginPath();
  ctx.moveTo(-30, 24);
  ctx.lineTo(-46, 16);
  ctx.moveTo(30, 24);
  ctx.lineTo(46, 16);
  ctx.stroke();

  // 4. Head
  ctx.fillStyle = PALETTE.DAD_SKIN;
  ctx.strokeStyle = PALETTE.DAD_OUTLINE;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(0, -18, 24, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 5. Short Dark Hair
  ctx.fillStyle = PALETTE.DAD_HAIR;
  ctx.strokeStyle = '#3E2723';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-22, -22);
  ctx.quadraticCurveTo(-16, -42, 0, -42);
  ctx.quadraticCurveTo(16, -42, 22, -22);
  ctx.quadraticCurveTo(12, -32, 0, -32);
  ctx.quadraticCurveTo(-12, -32, -22, -22);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 6. Cheeks
  ctx.fillStyle = PALETTE.DAD_CHEEK;
  ctx.beginPath();
  ctx.arc(-14, -14, 4.5, 0, Math.PI * 2);
  ctx.arc(14, -14, 4.5, 0, Math.PI * 2);
  ctx.fill();

  // 7. Signature Round Glasses & Eyes
  ctx.strokeStyle = PALETTE.DAD_GLASSES;
  ctx.lineWidth = 3.5;

  // Left Lens
  ctx.beginPath();
  ctx.arc(-8, -20, 9, 0, Math.PI * 2);
  ctx.stroke();

  // Right Lens
  ctx.beginPath();
  ctx.arc(10, -20, 9, 0, Math.PI * 2);
  ctx.stroke();

  // Glasses Bridge
  ctx.beginPath();
  ctx.moveTo(1, -20);
  ctx.lineTo(1, -20);
  ctx.stroke();

  // Eyes Inside Glasses
  if (eyeBlink) {
    ctx.strokeStyle = PALETTE.BLACK;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-13, -20); ctx.lineTo(-3, -20);
    ctx.moveTo(5, -20); ctx.lineTo(15, -20);
    ctx.stroke();
  } else {
    ctx.fillStyle = PALETTE.BLACK;
    ctx.beginPath();
    ctx.arc(-8, -20, eyeRadius, 0, Math.PI * 2);
    ctx.arc(10, -20, eyeRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  // 8. Smile / Mouth
  ctx.strokeStyle = PALETTE.DAD_OUTLINE;
  ctx.lineWidth = 3;
  ctx.beginPath();
  if (panic >= 3) {
    ctx.fillStyle = '#C62828';
    ctx.ellipse(1, -6, 7, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else if (panic >= 1) {
    ctx.moveTo(-8, -8);
    ctx.quadraticCurveTo(1, -14, 10, -8);
    ctx.stroke();
  } else {
    ctx.arc(1, -10, 9, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
  }

  // 9. Sweat Drops in Panic Mode
  if (sweatDropsCount > 0) {
    ctx.fillStyle = '#29B6F6';
    ctx.strokeStyle = '#0288D1';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < sweatDropsCount; i++) {
      ctx.beginPath();
      ctx.arc(-24 - i * 7, -24 - (i % 2) * 8, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  }

  ctx.restore();
}

export const renderDad = drawDad;
export const drawDadFather = drawDad;
