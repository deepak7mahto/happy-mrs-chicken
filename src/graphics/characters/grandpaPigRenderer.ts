/**
 * Grandpa Pig Procedural Vector Renderer (Show-Accurate Cartoon Geometry)
 * Peppa Pig: Happy Mrs Chicken 8-Game Deluxe Expansion Suite
 * Strictly under 500 Lines of Code
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

  // 3. Ears
  ctx.fillStyle = PALETTE.GRANDPA_SKIN;
  ctx.strokeStyle = PALETTE.GRANDPA_OUTLINE;
  ctx.lineWidth = 4.5;

  ctx.beginPath();
  ctx.ellipse(-22, -54, 7, 14, -0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(-8, -54, 7, 14, 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 4. Canonical Hairdryer Head & Snout Contour (Grandpa Pig)
  ctx.fillStyle = PALETTE.GRANDPA_SKIN;
  ctx.strokeStyle = PALETTE.GRANDPA_OUTLINE;
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
  ctx.fillStyle = PALETTE.GRANDPA_SKIN;
  ctx.fill();
  ctx.strokeStyle = PALETTE.GRANDPA_OUTLINE;
  ctx.lineWidth = 4;
  ctx.stroke();

  // Nostril Dots
  ctx.fillStyle = PALETTE.GRANDPA_OUTLINE;
  ctx.beginPath();
  ctx.arc(45, -30, 2.5, 0, Math.PI * 2);
  ctx.arc(47, -22, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Rosy Cheeks
  ctx.fillStyle = PALETTE.GRANDPA_CHEEK;
  ctx.beginPath();
  ctx.arc(-22, -10, 14, 0, Math.PI * 2);
  ctx.fill();

  // 5. White Beard Stubble
  ctx.strokeStyle = PALETTE.GRANDPA_STUBBLE;
  ctx.lineWidth = 3.5;
  for (let i = 0; i < 7; i++) {
    ctx.beginPath();
    ctx.arc(-22 + i * 8, 4, 3, 0, Math.PI);
    ctx.stroke();
  }

  // 6. Eyes & Blinking
  if (eyeBlink) {
    ctx.strokeStyle = PALETTE.BLACK;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(6, -38); ctx.lineTo(16, -38);
    ctx.moveTo(22, -36); ctx.lineTo(32, -36);
    ctx.stroke();
  } else {
    ctx.fillStyle = PALETTE.WHITE;
    ctx.strokeStyle = PALETTE.GRANDPA_OUTLINE;
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    ctx.arc(11, -38, 6.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(27, -36, 6.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = PALETTE.BLACK;
    ctx.beginPath();
    ctx.arc(12.5, -38, 2.8, 0, Math.PI * 2);
    ctx.arc(28.5, -36, 2.8, 0, Math.PI * 2);
    ctx.fill();
  }

  // 7. Smile or Strain Mouth
  ctx.strokeStyle = PALETTE.GRANDPA_OUTLINE;
  ctx.lineWidth = 4;
  ctx.beginPath();
  if (tension > 0.6) {
    // Straining grimace
    ctx.moveTo(6, -14);
    ctx.lineTo(28, -14);
    ctx.stroke();
  } else {
    // Jolly smile
    ctx.arc(16, -14, 12, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(26, -16, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = PALETTE.GRANDPA_OUTLINE;
    ctx.fill();
  }

  // 8. Captain / Sailor Hat
  ctx.save();
  ctx.translate(-8, -48);
  ctx.rotate(hatTilt);

  // Hat Visor / Peak
  ctx.fillStyle = '#212121';
  ctx.beginPath();
  ctx.ellipse(12, -2, 22, 6, 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Hat Crown (Blue Sailor Cap)
  ctx.fillStyle = PALETTE.GRANDPA_CAP;
  ctx.strokeStyle = PALETTE.GRANDPA_CAP_OUTLINE;
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.roundRect(-14, -20, 44, 20, [8, 8, 2, 2]);
  ctx.fill();
  ctx.stroke();

  // Gold Hat Badge Anchor
  ctx.fillStyle = PALETTE.GRANDPA_ANCHOR;
  ctx.beginPath();
  ctx.arc(8, -10, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 9. Arms & Pulling Stance
  ctx.strokeStyle = PALETTE.GRANDPA_SKIN;
  ctx.lineWidth = 5;
  ctx.beginPath();
  if (pulling) {
    ctx.moveTo(-24, 18);
    ctx.lineTo(-4, 38);
    ctx.moveTo(24, 18);
    ctx.lineTo(4, 38);
  } else {
    ctx.moveTo(-30, 20);
    ctx.lineTo(-45, 12);
    ctx.moveTo(30, 20);
    ctx.lineTo(45, 12);
  }
  ctx.stroke();

  ctx.restore();
}

export const renderGrandpa = drawGrandpaPig;
export const renderGrandpaPig = drawGrandpaPig;
export const drawGrandpa = drawGrandpaPig;
