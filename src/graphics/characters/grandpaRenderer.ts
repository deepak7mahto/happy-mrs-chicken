/**
 * Grandpa Character Procedural Vector Renderer
 * Adventures of Trishu 8-Game Suite
 * Strictly under 500 Lines of Code
 */

import { PALETTE } from '../palette';
import { GrandpaOptions } from '../../types/characters';
import { preserveVolume, getVeggiePullTension } from '../animations';

export function drawGrandpa(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number = 1.0,
  options: GrandpaOptions = {}
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

  // 1. Dark Green Garden Boots
  ctx.fillStyle = PALETTE.GRANDPA_BOOTS;
  ctx.strokeStyle = PALETTE.GRANDPA_BOOTS_OUTLINE;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(-24, 46, 20, 15, 4);
  ctx.roundRect(6, 46, 20, 15, 4);
  ctx.fill();
  ctx.stroke();

  // Mud on Boots
  if (welliesMuddy) {
    ctx.fillStyle = PALETTE.MUD_DARK;
    ctx.beginPath();
    ctx.arc(-14, 54, 3, 0, Math.PI * 2);
    ctx.arc(16, 53, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Legs
  ctx.strokeStyle = '#512DA8';
  ctx.lineWidth = 4.5;
  ctx.beginPath();
  ctx.moveTo(-13, 36);
  ctx.lineTo(-13, 47);
  ctx.moveTo(13, 36);
  ctx.lineTo(13, 47);
  ctx.stroke();

  // 2. Purple Garden Shirt / Overalls
  ctx.fillStyle = PALETTE.GRANDPA_SHIRT;
  ctx.strokeStyle = PALETTE.GRANDPA_SHIRT_OUTLINE;
  ctx.lineWidth = 4.5;
  ctx.beginPath();
  ctx.ellipse(0, 22, 44, 36, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 3. Head
  ctx.fillStyle = PALETTE.GRANDPA_SKIN;
  ctx.strokeStyle = PALETTE.GRANDPA_OUTLINE;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(0, -14, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 4. White / Grey Beard Stubble
  ctx.strokeStyle = PALETTE.GRANDPA_STUBBLE;
  ctx.lineWidth = 2.5;
  for (let i = 0; i < 7; i++) {
    ctx.beginPath();
    ctx.arc(-15 + i * 5, 0, 2.5, 0, Math.PI);
    ctx.stroke();
  }

  // 5. Cheeks
  ctx.fillStyle = PALETTE.GRANDPA_CHEEK;
  ctx.beginPath();
  ctx.arc(-12, -10, 4, 0, Math.PI * 2);
  ctx.arc(12, -10, 4, 0, Math.PI * 2);
  ctx.fill();

  // 6. Eyes
  if (eyeBlink) {
    ctx.strokeStyle = PALETTE.BLACK;
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.moveTo(-11, -16); ctx.lineTo(-3, -16);
    ctx.moveTo(3, -16); ctx.lineTo(11, -16);
    ctx.stroke();
  } else {
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.ellipse(-7, -16, 4.5, 5.5, 0, 0, Math.PI * 2);
    ctx.ellipse(7, -16, 4.5, 5.5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = PALETTE.BLACK;
    ctx.beginPath();
    ctx.arc(-6, -16, 2.2, 0, Math.PI * 2);
    ctx.arc(6, -16, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // 7. Smile or Strain Mouth
  ctx.strokeStyle = PALETTE.GRANDPA_OUTLINE;
  ctx.lineWidth = 3;
  ctx.beginPath();
  if (tension > 0.6) {
    ctx.moveTo(-7, -4);
    ctx.lineTo(7, -4);
    ctx.stroke();
  } else {
    ctx.arc(0, -6, 8, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
  }

  // 8. Straw Sun Hat with Red Ribbon Band
  ctx.save();
  ctx.translate(0, -32);
  ctx.rotate(hatTilt);

  // Hat Brim
  ctx.fillStyle = PALETTE.GRANDPA_HAT;
  ctx.strokeStyle = PALETTE.GRANDPA_HAT_OUTLINE;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(0, 4, 32, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Hat Crown
  ctx.fillStyle = PALETTE.GRANDPA_HAT;
  ctx.strokeStyle = PALETTE.GRANDPA_HAT_OUTLINE;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(-16, -14, 32, 18, [6, 6, 0, 0]);
  ctx.fill();
  ctx.stroke();

  // Red Ribbon Band
  ctx.fillStyle = PALETTE.GRANDPA_HAT_BAND;
  ctx.beginPath();
  ctx.rect(-16, 0, 32, 5);
  ctx.fill();

  ctx.restore();

  // 9. Arms & Pulling Stance
  ctx.strokeStyle = PALETTE.GRANDPA_SKIN;
  ctx.lineWidth = 4.5;
  ctx.beginPath();
  if (pulling) {
    ctx.moveTo(-20, 16);
    ctx.lineTo(-4, 32);
    ctx.moveTo(20, 16);
    ctx.lineTo(4, 32);
  } else {
    ctx.moveTo(-26, 18);
    ctx.lineTo(-40, 10);
    ctx.moveTo(26, 18);
    ctx.lineTo(40, 10);
  }
  ctx.stroke();

  ctx.restore();
}

export const renderGrandpa = drawGrandpa;
export const drawGrandpaGardener = drawGrandpa;
