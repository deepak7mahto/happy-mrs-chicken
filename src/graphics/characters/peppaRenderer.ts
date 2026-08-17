/**
 * Peppa Pig Procedural Vector Renderer (Show-Accurate Cartoon Geometry)
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
  const expression = options.expression ?? 'happy';

  ctx.save();
  ctx.translate(x, y + jumpY);
  ctx.scale(facingLeft ? -scale * stretchX : scale * stretchX, scale * activeSquish);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // 1. Curled Tail (Peeking out from behind the dress)
  ctx.strokeStyle = PALETTE.PEPPA_OUTLINE;
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(-18, 22);
  ctx.bezierCurveTo(-28, 20, -32, 10, -22, 9);
  ctx.bezierCurveTo(-14, 8, -16, 19, -26, 17);
  ctx.stroke();

  // 2. Legs (Pink Stick Legs)
  ctx.strokeStyle = PALETTE.PEPPA_SKIN;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-10, 34);
  ctx.lineTo(-10, 48);
  ctx.moveTo(10, 34);
  ctx.lineTo(10, 48);
  ctx.stroke();

  // 3. Boots (Show-Accurate Yellow Wellington Boots)
  ctx.fillStyle = PALETTE.PEPPA_BOOTS;
  ctx.strokeStyle = PALETTE.PEPPA_BOOTS_OUTLINE;
  ctx.lineWidth = 3.5;

  // Left Boot
  ctx.beginPath();
  ctx.moveTo(-18, 46);
  ctx.lineTo(-4, 46);
  ctx.quadraticCurveTo(-2, 46, -2, 50);
  ctx.lineTo(1, 52);
  ctx.quadraticCurveTo(4, 54, 4, 57);
  ctx.quadraticCurveTo(4, 59, 1, 59);
  ctx.lineTo(-18, 59);
  ctx.quadraticCurveTo(-21, 59, -21, 56);
  ctx.lineTo(-21, 49);
  ctx.quadraticCurveTo(-21, 46, -18, 46);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Right Boot
  ctx.beginPath();
  ctx.moveTo(4, 46);
  ctx.lineTo(18, 46);
  ctx.quadraticCurveTo(20, 46, 20, 50);
  ctx.lineTo(23, 52);
  ctx.quadraticCurveTo(26, 54, 26, 57);
  ctx.quadraticCurveTo(26, 59, 23, 59);
  ctx.lineTo(4, 59);
  ctx.quadraticCurveTo(1, 59, 1, 56);
  ctx.lineTo(1, 49);
  ctx.quadraticCurveTo(1, 46, 4, 46);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Mud Splatters on Boots (if in muddy puddle mode)
  if (muddyBoots) {
    ctx.fillStyle = PALETTE.MUD_DARK;
    ctx.beginPath();
    ctx.arc(-14, 55, 3, 0, Math.PI * 2);
    ctx.arc(-8, 57, 2, 0, Math.PI * 2);
    ctx.arc(8, 56, 3.2, 0, Math.PI * 2);
    ctx.arc(16, 54, 2.5, 0, Math.PI * 2);
    ctx.arc(22, 57, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // 4. Red Dress (Bell / A-line Shape)
  ctx.fillStyle = PALETTE.PEPPA_DRESS;
  ctx.strokeStyle = PALETTE.PEPPA_DRESS_OUTLINE;
  ctx.lineWidth = 4.5;
  ctx.beginPath();
  ctx.moveTo(-15, -4);
  ctx.quadraticCurveTo(0, -6, 15, -4);
  ctx.quadraticCurveTo(19, 14, 26, 38);
  ctx.quadraticCurveTo(0, 42, -26, 38);
  ctx.quadraticCurveTo(-19, 14, -15, -4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 5. Arms (Pink Stick Arms with 3 Rounded Fingers)
  ctx.strokeStyle = PALETTE.PEPPA_SKIN;
  ctx.lineWidth = 3.5;

  // Left Arm
  ctx.save();
  ctx.translate(-14, 8);
  ctx.rotate(Math.PI * 0.82 + Math.sin(armWave) * 0.35);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(16, 0);
  ctx.moveTo(16, 0);
  ctx.lineTo(22, 0);
  ctx.moveTo(16, 0);
  ctx.lineTo(21, -4.5);
  ctx.moveTo(16, 0);
  ctx.lineTo(21, 4.5);
  ctx.stroke();
  ctx.restore();

  // Right Arm
  ctx.save();
  ctx.translate(14, 8);
  ctx.rotate(Math.PI * 0.18 - Math.sin(armWave) * 0.35);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(16, 0);
  ctx.moveTo(16, 0);
  ctx.lineTo(22, 0);
  ctx.moveTo(16, 0);
  ctx.lineTo(21, -4.5);
  ctx.moveTo(16, 0);
  ctx.lineTo(21, 4.5);
  ctx.stroke();
  ctx.restore();

  // 6. Ears (Positioned on Crown of Head)
  ctx.fillStyle = PALETTE.PEPPA_SKIN;
  ctx.strokeStyle = PALETTE.PEPPA_OUTLINE;
  ctx.lineWidth = 4;

  // Back Ear
  ctx.beginPath();
  ctx.ellipse(-16, -50, 5.5, 12, -0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Front Ear
  ctx.beginPath();
  ctx.ellipse(-4, -50, 5.5, 12, 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 7. Canonical Hairdryer Head Silhouette
  ctx.fillStyle = PALETTE.PEPPA_SKIN;
  ctx.strokeStyle = PALETTE.PEPPA_OUTLINE;
  ctx.lineWidth = 4.5;
  ctx.beginPath();
  // Start at crown of head behind ears
  ctx.moveTo(-10, -44);
  // Snout top ridge curve
  ctx.quadraticCurveTo(14, -44, 38, -36);
  // Snout tip curve
  ctx.quadraticCurveTo(44, -34, 44, -26);
  ctx.quadraticCurveTo(44, -18, 38, -16);
  // Snout bottom line
  ctx.lineTo(12, -16);
  // Organic jaw & chin scoop
  ctx.quadraticCurveTo(2, -4, -16, -2);
  // Cheek and back of skull dome
  ctx.quadraticCurveTo(-40, 0, -40, -22);
  ctx.quadraticCurveTo(-40, -44, -10, -44);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Snout Front Disc
  ctx.beginPath();
  ctx.ellipse(38, -26, 4.5, 10, 0.08, 0, Math.PI * 2);
  ctx.fillStyle = PALETTE.PEPPA_SKIN;
  ctx.fill();
  ctx.strokeStyle = PALETTE.PEPPA_OUTLINE;
  ctx.lineWidth = 3.5;
  ctx.stroke();

  // Nostrils (Solid pink dots)
  ctx.fillStyle = PALETTE.PEPPA_OUTLINE;
  ctx.beginPath();
  ctx.arc(37, -29, 2.2, 0, Math.PI * 2);
  ctx.arc(39, -23, 2.2, 0, Math.PI * 2);
  ctx.fill();

  // 8. Rosy Blush Cheek Circle
  ctx.fillStyle = PALETTE.PEPPA_CHEEK;
  ctx.beginPath();
  ctx.arc(-16, -14, 11, 0, Math.PI * 2);
  ctx.fill();

  // 9. Eyes (Perched on Snout Ridge)
  const eyes = [
    { x: 4, y: -38 },
    { x: 18, y: -36 }
  ];

  if (eyeBlink) {
    ctx.strokeStyle = PALETTE.PEPPA_OUTLINE;
    ctx.lineWidth = 3;
    for (const eye of eyes) {
      ctx.beginPath();
      ctx.arc(eye.x, eye.y, 5.5, 0.2 * Math.PI, 0.8 * Math.PI);
      ctx.stroke();
    }
  } else {
    ctx.fillStyle = PALETTE.WHITE;
    ctx.strokeStyle = PALETTE.PEPPA_OUTLINE;
    ctx.lineWidth = 2.5;

    for (const eye of eyes) {
      ctx.beginPath();
      ctx.arc(eye.x, eye.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    // Pupils
    ctx.fillStyle = PALETTE.BLACK;
    ctx.beginPath();
    ctx.arc(5.5, -38, 2.6, 0, Math.PI * 2);
    ctx.arc(19.5, -36, 2.6, 0, Math.PI * 2);
    ctx.fill();
  }

  // 10. Cheerful Smile & Dimple
  if (expression === 'laughing' || expression === 'excited') {
    ctx.fillStyle = '#C62828';
    ctx.strokeStyle = PALETTE.PEPPA_DRESS_OUTLINE;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(8, -12, 10, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Tongue
    ctx.fillStyle = '#FF8DA1';
    ctx.beginPath();
    ctx.arc(8, -6, 5.5, Math.PI, 0);
    ctx.fill();

    // Dimple Tick
    ctx.beginPath();
    ctx.arc(17, -13, 2.5, 0.7 * Math.PI, 1.7 * Math.PI);
    ctx.strokeStyle = PALETTE.PEPPA_DRESS_OUTLINE;
    ctx.lineWidth = 3;
    ctx.stroke();
  } else if (expression === 'surprised') {
    ctx.fillStyle = '#C62828';
    ctx.strokeStyle = PALETTE.PEPPA_DRESS_OUTLINE;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(10, -10, 4.5, 6.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else {
    // Classic Happy Peppa Smile with Dimple Tick
    ctx.strokeStyle = PALETTE.PEPPA_DRESS_OUTLINE;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(8, -12, 10, 0.15 * Math.PI, 0.82 * Math.PI);
    ctx.stroke();

    // Dimple Tick (curved hook at smile corner)
    ctx.beginPath();
    ctx.arc(17, -13, 2.5, 0.7 * Math.PI, 1.7 * Math.PI);
    ctx.stroke();
  }

  ctx.restore();
}

export const renderPeppa = drawPeppaPig;
export const renderPeppaPig = drawPeppaPig;
export const drawPeppa = drawPeppaPig;
