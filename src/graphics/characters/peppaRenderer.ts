/**
 * Peppa Pig Procedural Vector Renderer
 * Peppa Pig: Happy Mrs Chicken 8-Game Deluxe Expansion Suite
 */

import { PALETTE } from '../palette';
import { PeppaOptions } from '../../types/characters';
import { preserveVolume } from '../animations';

export function drawPeppaPig(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number = 1.0,
  options: PeppaOptions = {}
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
  const muddyBoots = !!options.muddyBoots;

  ctx.save();
  ctx.translate(x, y + jumpY);
  ctx.scale(facingLeft ? -scale * stretchX : scale * stretchX, scale * activeSquish);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // 1. Boots
  ctx.fillStyle = PALETTE.PEPPA_BOOTS;
  ctx.strokeStyle = PALETTE.PEPPA_BOOTS_OUTLINE;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(-22, 45, 18, 14, 6);
  ctx.roundRect(4, 45, 18, 14, 6);
  ctx.fill();
  ctx.stroke();

  // Mud splatters on boots
  if (muddyBoots) {
    ctx.fillStyle = PALETTE.MUD_DARK;
    ctx.beginPath();
    ctx.arc(-14, 52, 3, 0, Math.PI * 2);
    ctx.arc(12, 50, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // 2. Legs
  ctx.strokeStyle = PALETTE.PEPPA_SKIN;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(-12, 35);
  ctx.lineTo(-12, 46);
  ctx.moveTo(12, 35);
  ctx.lineTo(12, 46);
  ctx.stroke();

  // 3. Red Dress
  ctx.fillStyle = PALETTE.PEPPA_DRESS;
  ctx.strokeStyle = PALETTE.PEPPA_DRESS_OUTLINE;
  ctx.lineWidth = 4.5;
  ctx.beginPath();
  ctx.moveTo(-16, -5);
  ctx.quadraticCurveTo(-35, 35, -28, 40);
  ctx.lineTo(28, 40);
  ctx.quadraticCurveTo(35, 35, 16, -5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 4. Arms
  ctx.strokeStyle = PALETTE.PEPPA_SKIN;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-18, 10);
  ctx.lineTo(-32 + Math.sin(armWave) * 6, 0);
  ctx.moveTo(18, 10);
  ctx.lineTo(32 - Math.sin(armWave) * 6, 0);
  ctx.stroke();

  // 5. Head & Snout
  ctx.fillStyle = PALETTE.PEPPA_SKIN;
  ctx.strokeStyle = PALETTE.PEPPA_OUTLINE;
  ctx.lineWidth = 4.5;
  ctx.beginPath();
  ctx.moveTo(0, -15);
  ctx.quadraticCurveTo(35, -15, 38, -35);
  ctx.lineTo(55, -35);
  ctx.arc(55, -28, 8, -Math.PI / 2, Math.PI / 2);
  ctx.lineTo(30, -20);
  ctx.quadraticCurveTo(15, -45, -15, -45);
  ctx.quadraticCurveTo(-45, -45, -45, -15);
  ctx.quadraticCurveTo(-45, 15, 0, -15);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Snout Nostrils
  ctx.fillStyle = PALETTE.PEPPA_OUTLINE;
  ctx.beginPath();
  ctx.arc(55, -30, 2, 0, Math.PI * 2);
  ctx.arc(55, -26, 2, 0, Math.PI * 2);
  ctx.fill();

  // Ears
  ctx.beginPath();
  ctx.ellipse(-15, -50, 6, 12, -0.2, 0, Math.PI * 2);
  ctx.ellipse(-2, -50, 6, 12, 0.1, 0, Math.PI * 2);
  ctx.fillStyle = PALETTE.PEPPA_SKIN;
  ctx.fill();
  ctx.stroke();

  // Cheek
  ctx.fillStyle = PALETTE.PEPPA_CHEEK;
  ctx.beginPath();
  ctx.arc(-15, -12, 11, 0, Math.PI * 2);
  ctx.fill();

  // Eyes & Blinking
  if (eyeBlink) {
    ctx.strokeStyle = PALETTE.BLACK;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-1, -35); ctx.lineTo(6, -35);
    ctx.moveTo(13, -35); ctx.lineTo(20, -35);
    ctx.stroke();
  } else {
    ctx.fillStyle = PALETTE.WHITE;
    ctx.strokeStyle = PALETTE.PEPPA_OUTLINE;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(2, -35, 6, 0, Math.PI * 2);
    ctx.arc(16, -35, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = PALETTE.BLACK;
    ctx.beginPath();
    ctx.arc(3, -35, 2.5, 0, Math.PI * 2);
    ctx.arc(17, -35, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Smile
  ctx.strokeStyle = PALETTE.PEPPA_DRESS_OUTLINE;
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.arc(12, -15, 10, 0.1 * Math.PI, 0.8 * Math.PI);
  ctx.stroke();

  ctx.restore();
}

export const renderPeppa = drawPeppaPig;
export const renderPeppaPig = drawPeppaPig;
export const drawPeppa = drawPeppaPig;
