/**
 * Baby Chick Procedural Vector Renderer
 * Peppa Pig: Happy Mrs Chicken 8-Game Deluxe Expansion Suite
 */

import { PALETTE } from '../palette';
import { ChickOptions } from '../../types/characters';
import { preserveVolume } from '../animations';

export function drawBabyChick(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number = 1.0,
  options: ChickOptions = {}
): void {
  const animState = options.animState;
  const walk = options.walkCycle ?? animState?.walkCycle ?? (animState?.wobbleTimer ? animState.wobbleTimer * 8 : 0);
  const isPeep = options.isPeeping ?? (animState?.squawk !== undefined && animState.squawk > 0);
  const facingLeft = options.facingLeft ?? animState?.facingLeft ?? false;
  const hopY = options.hopY ?? animState?.jumpY ?? 0;
  const eyeBlink = options.eyeBlink ?? animState?.isBlinking ?? false;
  const wingFlap = options.wingFlap ?? (animState?.armWave ?? Math.sin(walk * 2) * 0.2);

  const baseSquash = animState?.squash ?? 1.0;
  const breath = animState?.breathScale ?? 1.0;
  const activeSquash = baseSquash * breath;
  const { scaleX: stretchX, scaleY: activeSquish } = preserveVolume(activeSquash);

  ctx.save();
  ctx.translate(x, y + hopY);
  ctx.scale(facingLeft ? -scale * stretchX : scale * stretchX, scale * activeSquish);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // 1. Feet
  ctx.strokeStyle = PALETTE.CHICK_BEAK;
  ctx.lineWidth = 3;
  const legSwing = Math.sin(walk) * 6;
  ctx.beginPath();
  ctx.moveTo(-6, 14);
  ctx.lineTo(-6 - legSwing, 22);
  ctx.moveTo(6, 14);
  ctx.lineTo(6 + legSwing, 22);
  ctx.stroke();

  // 2. Body
  ctx.fillStyle = PALETTE.CHICK_BODY;
  ctx.strokeStyle = PALETTE.CHICK_OUTLINE;
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.ellipse(0, 2, 18, 15, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 3. Wing
  ctx.save();
  ctx.translate(-4, 3);
  ctx.rotate(wingFlap);
  ctx.fillStyle = PALETTE.CHICK_WING_SHADOW;
  ctx.beginPath();
  ctx.ellipse(0, 0, 9, 6, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // 4. Head
  ctx.beginPath();
  ctx.arc(8, -8, 12, 0, Math.PI * 2);
  ctx.fillStyle = PALETTE.CHICK_BODY;
  ctx.fill();
  ctx.stroke();

  // 5. Cheek
  ctx.fillStyle = PALETTE.CHICK_CHEEK;
  ctx.beginPath();
  ctx.arc(8, -4, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // 6. Beak
  ctx.fillStyle = PALETTE.CHICK_BEAK;
  ctx.beginPath();
  ctx.moveTo(17, -10);
  ctx.lineTo(24, isPeep ? -12 : -7);
  ctx.lineTo(17, -4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 7. Eye & Blinking
  if (eyeBlink) {
    ctx.strokeStyle = PALETTE.CHICK_EYE;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(10, -10);
    ctx.lineTo(15, -10);
    ctx.stroke();
  } else {
    ctx.fillStyle = PALETTE.CHICK_EYE;
    ctx.beginPath();
    ctx.arc(12, -10, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

export const renderChick = drawBabyChick;
export const renderBabyChick = drawBabyChick;
export const drawChick = drawBabyChick;
