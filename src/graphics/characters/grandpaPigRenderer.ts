/**
 * Grandpa Pig Procedural Vector Renderer
 * Peppa Pig: Happy Mrs Chicken 8-Game Deluxe Expansion Suite
 */

import { PALETTE } from '../palette';
import { GrandpaPigOptions } from '../../types/characters';
import { preserveVolume, getVeggiePullTension } from '../animations';

export function drawGrandpaPig(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number = 1.0,
  options: GrandpaPigOptions = {}
): void {
  const animState = options.animState;
  const baseSquash = animState?.squash ?? 1.0;
  const breath = animState?.breathScale ?? 1.0;
  const activeSquash = baseSquash * breath;
  const { scaleX: stretchX, scaleY: activeSquish } = preserveVolume(activeSquash);
  const eyeBlink = options.eyeBlink ?? animState?.isBlinking ?? false;
  const pulling = options.pulling ?? (animState?.pullTension !== undefined && animState.pullTension > 0);
  const rawTension = options.pullTension ?? animState?.pullTension ?? 0;
  const tension = Math.min(1.0, Math.max(0, rawTension));
  const hatTilt = options.hatTilt ?? 0;
  const welliesMuddy = options.welliesMuddy !== false;

  let pullY = 0;
  let strainTremor = 0;
  let strainAngle = -0.12 * tension;

  if (pulling && animState) {
    const tensionData = getVeggiePullTension(tension, animState.customTimer ?? 0);
    pullY = tensionData.pullY;
    strainAngle = tensionData.strainAngle;
    strainTremor = tensionData.strainTremor;
  }

  ctx.save();
  ctx.translate(x + strainTremor, y + pullY);
  ctx.scale(scale * stretchX, scale * activeSquish);
  if (pulling) {
    ctx.rotate(strainAngle);
  }
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // 1. Dark Green Garden Wellies
  ctx.fillStyle = PALETTE.GRANDPA_WELLIES;
  ctx.strokeStyle = PALETTE.GRANDPA_WELLIES_OUTLINE;
  ctx.lineWidth = 4.5;
  ctx.beginPath();
  ctx.roundRect(-26, 48, 22, 16, 5);
  ctx.roundRect(8, 48, 22, 16, 5);
  ctx.fill();
  ctx.stroke();

  // Mud splatters on boots
  if (welliesMuddy) {
    ctx.fillStyle = PALETTE.MUD_DARK;
    ctx.beginPath();
    ctx.arc(-16, 58, 3, 0, Math.PI * 2);
    ctx.arc(18, 56, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Legs
  ctx.strokeStyle = PALETTE.GRANDPA_SKIN;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(-15, 38);
  ctx.lineTo(-15, 49);
  ctx.moveTo(15, 38);
  ctx.lineTo(15, 49);
  ctx.stroke();

  // 2. Rotund Belly & Purple Shirt
  ctx.fillStyle = PALETTE.GRANDPA_SHIRT;
  ctx.strokeStyle = PALETTE.GRANDPA_SHIRT_OUTLINE;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.ellipse(0, 24, 48, 40, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 3. Head & Snout
  ctx.fillStyle = PALETTE.GRANDPA_SKIN;
  ctx.strokeStyle = PALETTE.GRANDPA_OUTLINE;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(0, -16);
  ctx.quadraticCurveTo(46, -16, 50, -40);
  ctx.lineTo(72, -40);
  ctx.arc(72, -30, 11, -Math.PI / 2, Math.PI / 2);
  ctx.lineTo(42, -20);
  ctx.quadraticCurveTo(22, -56, -20, -56);
  ctx.quadraticCurveTo(-60, -56, -60, -16);
  ctx.quadraticCurveTo(-60, 20, 0, -16);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Nostril Dots
  ctx.fillStyle = PALETTE.GRANDPA_OUTLINE;
  ctx.beginPath();
  ctx.arc(72, -33, 2.5, 0, Math.PI * 2);
  ctx.arc(72, -27, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Cheeks
  ctx.fillStyle = PALETTE.GRANDPA_CHEEK;
  ctx.beginPath();
  ctx.arc(-20, -10, 14, 0, Math.PI * 2);
  ctx.fill();

  // White Beard Stubble
  ctx.strokeStyle = PALETTE.GRANDPA_STUBBLE;
  ctx.lineWidth = 3.5;
  for (let i = 0; i < 7; i++) {
    ctx.beginPath();
    ctx.arc(-24 + i * 9, 2, 3, 0, Math.PI);
    ctx.stroke();
  }

  // Eyes & Blinking
  if (eyeBlink) {
    ctx.strokeStyle = PALETTE.BLACK;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(6, -40); ctx.lineTo(16, -40);
    ctx.moveTo(26, -40); ctx.lineTo(36, -40);
    ctx.stroke();
  } else {
    ctx.fillStyle = PALETTE.WHITE;
    ctx.strokeStyle = PALETTE.GRANDPA_OUTLINE;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(11, -40, 6.5, 0, Math.PI * 2);
    ctx.arc(31, -40, 6.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = PALETTE.BLACK;
    ctx.beginPath();
    ctx.arc(12, -40, 2.8, 0, Math.PI * 2);
    ctx.arc(32, -40, 2.8, 0, Math.PI * 2);
    ctx.fill();
  }

  // Smile or Straining Grin
  ctx.strokeStyle = PALETTE.GRANDPA_SHIRT_OUTLINE;
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  if (pulling) {
    // Determined clenched grimace
    ctx.rect(14, -18, 20, 8);
    ctx.fillStyle = PALETTE.WHITE;
    ctx.fill();
    ctx.stroke();
    // Teeth lines
    ctx.beginPath();
    ctx.moveTo(20, -18); ctx.lineTo(20, -10);
    ctx.moveTo(27, -18); ctx.lineTo(27, -10);
    ctx.stroke();
  } else {
    ctx.arc(18, -16, 12, 0.1 * Math.PI, 0.8 * Math.PI);
    ctx.stroke();
  }

  // 4. Nautical Sailing Cap
  ctx.save();
  ctx.translate(-5, -54);
  ctx.rotate(hatTilt);

  // Cap Crown
  ctx.fillStyle = PALETTE.GRANDPA_CAP;
  ctx.strokeStyle = PALETTE.GRANDPA_CAP_OUTLINE;
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.arc(0, 0, 26, Math.PI * 1.05, Math.PI * 1.95);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Cap Visor / Brim
  ctx.fillStyle = PALETTE.GRANDPA_CAP_OUTLINE;
  ctx.beginPath();
  ctx.moveTo(-16, 0);
  ctx.lineTo(28, 0);
  ctx.lineTo(22, 6);
  ctx.lineTo(-12, 6);
  ctx.closePath();
  ctx.fill();

  // Gold Anchor Badge
  ctx.strokeStyle = PALETTE.GRANDPA_ANCHOR;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(4, -12, 2.5, 0, Math.PI * 2);
  ctx.moveTo(4, -10); ctx.lineTo(4, -4);
  ctx.moveTo(0, -8); ctx.lineTo(8, -8);
  ctx.moveTo(0, -6);
  ctx.quadraticCurveTo(4, -2, 8, -6);
  ctx.stroke();

  ctx.restore();

  // 5. Arms
  ctx.strokeStyle = PALETTE.GRANDPA_SKIN;
  ctx.lineWidth = 4.5;
  if (pulling) {
    // Both arms reaching forward gripping vegetable
    ctx.beginPath();
    ctx.moveTo(10, 16);
    ctx.lineTo(42, 28);
    ctx.moveTo(18, 22);
    ctx.lineTo(46, 32);
    ctx.stroke();
  } else {
    // Hearty idle arms
    ctx.beginPath();
    ctx.moveTo(-22, 16);
    ctx.lineTo(-36, 10);
    ctx.moveTo(22, 16);
    ctx.lineTo(36, 10);
    ctx.stroke();
  }

  ctx.restore();
}

export const renderGrandpa = drawGrandpaPig;
export const renderGrandpaPig = drawGrandpaPig;
export const drawGrandpa = drawGrandpaPig;
