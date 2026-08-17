/**
 * Peppa Pig Procedural Vector Renderer (Authentic Cartoon Geometry)
 * Peppa Pig: Happy Mrs Chicken 8-Game Deluxe Expansion Suite
 * Strictly under 500 Lines of Code
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

  // 1. Legs (Pink Sticks)
  ctx.strokeStyle = PALETTE.PEPPA_SKIN;
  ctx.lineWidth = 4.5;
  ctx.beginPath();
  ctx.moveTo(-10, 36);
  ctx.lineTo(-10, 48);
  ctx.moveTo(10, 36);
  ctx.lineTo(10, 48);
  ctx.stroke();

  // 2. Boots (Yellow Rain Boots)
  ctx.fillStyle = PALETTE.PEPPA_BOOTS;
  ctx.strokeStyle = PALETTE.PEPPA_BOOTS_OUTLINE;
  ctx.lineWidth = 3.5;

  ctx.beginPath();
  ctx.roundRect(-20, 46, 18, 12, 5);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.roundRect(4, 46, 18, 12, 5);
  ctx.fill();
  ctx.stroke();

  if (muddyBoots) {
    ctx.fillStyle = PALETTE.MUD_DARK;
    ctx.beginPath();
    ctx.arc(-12, 52, 3, 0, Math.PI * 2);
    ctx.arc(12, 50, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // 3. Red Dress (Bell / Trapezoid Shape)
  ctx.fillStyle = PALETTE.PEPPA_DRESS;
  ctx.strokeStyle = PALETTE.PEPPA_DRESS_OUTLINE;
  ctx.lineWidth = 4.5;
  ctx.beginPath();
  ctx.moveTo(-14, -6);
  ctx.lineTo(14, -6);
  ctx.quadraticCurveTo(24, 18, 28, 38);
  ctx.quadraticCurveTo(0, 41, -28, 38);
  ctx.quadraticCurveTo(-24, 18, -14, -6);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 4. Arms (Pink Stick Arms with 3 Twig Fingers)
  ctx.strokeStyle = PALETTE.PEPPA_SKIN;
  ctx.lineWidth = 3.5;

  // Left Arm
  ctx.save();
  ctx.translate(-14, 8);
  ctx.rotate(Math.sin(armWave) * 0.4);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-16, 6);
  ctx.lineTo(-21, 3);
  ctx.moveTo(-16, 6);
  ctx.lineTo(-22, 8);
  ctx.moveTo(-16, 6);
  ctx.lineTo(-19, 12);
  ctx.stroke();
  ctx.restore();

  // Right Arm
  ctx.save();
  ctx.translate(14, 8);
  ctx.rotate(-Math.sin(armWave) * 0.4);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(16, 6);
  ctx.lineTo(21, 3);
  ctx.moveTo(16, 6);
  ctx.lineTo(22, 8);
  ctx.moveTo(16, 6);
  ctx.lineTo(19, 12);
  ctx.stroke();
  ctx.restore();

  // 5. Ears (Behind Head)
  ctx.fillStyle = PALETTE.PEPPA_SKIN;
  ctx.strokeStyle = PALETTE.PEPPA_OUTLINE;
  ctx.lineWidth = 4;

  ctx.beginPath();
  ctx.ellipse(-18, -52, 5.5, 11, -0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(-6, -52, 5.5, 11, 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 6. Canonical Hairdryer Head Silhouette
  ctx.fillStyle = PALETTE.PEPPA_SKIN;
  ctx.strokeStyle = PALETTE.PEPPA_OUTLINE;
  ctx.lineWidth = 4.5;
  ctx.beginPath();
  // Start at top of head behind ears
  ctx.moveTo(-10, -46);
  // Top bridge of snout
  ctx.lineTo(34, -36);
  // Snout tip disk
  ctx.quadraticCurveTo(44, -34, 44, -26);
  ctx.quadraticCurveTo(44, -18, 34, -16);
  // Bottom snout line
  ctx.lineTo(6, -16);
  // Jaw & Chin
  ctx.quadraticCurveTo(0, -6, -16, -6);
  // Cheek and back of head
  ctx.quadraticCurveTo(-38, -6, -38, -26);
  ctx.quadraticCurveTo(-38, -46, -10, -46);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Snout Front Oval
  ctx.beginPath();
  ctx.ellipse(34, -26, 4.5, 9.5, 0.15, 0, Math.PI * 2);
  ctx.fillStyle = PALETTE.PEPPA_SKIN;
  ctx.fill();
  ctx.strokeStyle = PALETTE.PEPPA_OUTLINE;
  ctx.lineWidth = 3.5;
  ctx.stroke();

  // Nostrils (Solid pink dots)
  ctx.fillStyle = PALETTE.PEPPA_OUTLINE;
  ctx.beginPath();
  ctx.arc(33, -29, 2.2, 0, Math.PI * 2);
  ctx.arc(35, -23, 2.2, 0, Math.PI * 2);
  ctx.fill();

  // 7. Hot Pink Cheek Circle
  ctx.fillStyle = PALETTE.PEPPA_CHEEK;
  ctx.beginPath();
  ctx.arc(-18, -18, 10.5, 0, Math.PI * 2);
  ctx.fill();

  // 8. Eyes (On Top of Snout Ridge)
  if (eyeBlink) {
    ctx.strokeStyle = PALETTE.PEPPA_OUTLINE;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(4, -38, 5, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(18, -36, 5, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.stroke();
  } else {
    ctx.fillStyle = PALETTE.WHITE;
    ctx.strokeStyle = PALETTE.PEPPA_OUTLINE;
    ctx.lineWidth = 2.5;

    // Left Eye
    ctx.beginPath();
    ctx.arc(4, -38, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Right Eye
    ctx.beginPath();
    ctx.arc(18, -36, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Pupils
    ctx.fillStyle = PALETTE.BLACK;
    ctx.beginPath();
    ctx.arc(5.5, -38, 2.6, 0, Math.PI * 2);
    ctx.arc(19.5, -36, 2.6, 0, Math.PI * 2);
    ctx.fill();
  }

  // 9. Happy Red Mouth (Inside Face Area)
  ctx.strokeStyle = PALETTE.PEPPA_DRESS_OUTLINE;
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.arc(10, -18, 8, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();

  // Dimple
  ctx.beginPath();
  ctx.arc(17, -19, 2.2, 0, Math.PI * 2);
  ctx.fillStyle = PALETTE.PEPPA_DRESS_OUTLINE;
  ctx.fill();

  ctx.restore();
}

export const renderPeppa = drawPeppaPig;
export const renderPeppaPig = drawPeppaPig;
export const drawPeppa = drawPeppaPig;
