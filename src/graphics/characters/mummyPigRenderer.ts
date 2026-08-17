/**
 * Mummy Pig Procedural Vector Renderer
 * Peppa Pig: Happy Mrs Chicken 8-Game Deluxe Expansion Suite
 */

import { PALETTE } from '../palette';
import { MummyPigOptions } from '../../types/characters';
import { preserveVolume, getFryingPanAngle } from '../animations';

export function drawMummyPig(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number = 1.0,
  options: MummyPigOptions = {}
): void {
  const animState = options.animState;
  const baseSquash = animState?.squash ?? 1.0;
  const breath = animState?.breathScale ?? 1.0;
  const activeSquash = baseSquash * breath;
  const { scaleX: stretchX, scaleY: activeSquish } = preserveVolume(activeSquash);
  const eyeBlink = options.eyeBlink ?? animState?.isBlinking ?? false;
  const armWave = options.armWave ?? animState?.armWave ?? (animState?.wobbleAngle ? Math.sin(animState.wobbleTimer * 3.5) * 0.3 : 0);
  const holdingPan = options.holdingPan !== false;
  const dressSway = options.dressSway ?? (animState?.wobbleAngle ? Math.sin(animState.wobbleTimer * 3) * 4 : 0);
  const smiling = options.smiling !== false && options.expression !== 'surprised';

  let panAngle = options.panAngle ?? 0;
  let panArmOffset = 0;
  if (animState?.flipperAngle !== undefined && options.panAngle === undefined) {
    const art = getFryingPanAngle(animState.flipperAngle);
    panAngle = art.panAngle;
    panArmOffset = art.armOffset;
  }

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale * stretchX, scale * activeSquish);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // 1. Black Mary Jane Shoes & Legs
  ctx.fillStyle = PALETTE.BLACK;
  ctx.beginPath();
  ctx.roundRect(-26, 52, 22, 12, 5);
  ctx.roundRect(6, 52, 22, 12, 5);
  ctx.fill();

  ctx.strokeStyle = PALETTE.MUMMY_SKIN;
  ctx.lineWidth = 4.5;
  ctx.beginPath();
  ctx.moveTo(-15, 42);
  ctx.lineTo(-15, 53);
  ctx.moveTo(15, 42);
  ctx.lineTo(15, 53);
  ctx.stroke();

  // 2. Coral-Orange Dress
  ctx.fillStyle = PALETTE.MUMMY_DRESS;
  ctx.strokeStyle = PALETTE.MUMMY_DRESS_OUTLINE;
  ctx.lineWidth = 4.5;
  ctx.beginPath();
  ctx.moveTo(-20, -5);
  ctx.quadraticCurveTo(-45 + dressSway, 45, -35 + dressSway, 50);
  ctx.quadraticCurveTo(0, 54, 35 + dressSway, 50);
  ctx.quadraticCurveTo(45 + dressSway, 45, 20, -5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 3. Back Arm
  ctx.strokeStyle = PALETTE.MUMMY_SKIN;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-20, 8);
  ctx.lineTo(-35 + Math.sin(armWave) * 6, 0);
  ctx.stroke();

  // 4. Head & Snout
  ctx.fillStyle = PALETTE.MUMMY_SKIN;
  ctx.strokeStyle = PALETTE.MUMMY_OUTLINE;
  ctx.lineWidth = 4.5;
  ctx.beginPath();
  ctx.moveTo(0, -18);
  ctx.quadraticCurveTo(42, -18, 45, -42);
  ctx.lineTo(65, -42);
  ctx.arc(65, -34, 9.5, -Math.PI / 2, Math.PI / 2);
  ctx.lineTo(36, -24);
  ctx.quadraticCurveTo(18, -54, -18, -54);
  ctx.quadraticCurveTo(-54, -54, -54, -18);
  ctx.quadraticCurveTo(-54, 18, 0, -18);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Snout Nostril Dots
  ctx.fillStyle = PALETTE.MUMMY_OUTLINE;
  ctx.beginPath();
  ctx.arc(65, -37, 2.2, 0, Math.PI * 2);
  ctx.arc(65, -31, 2.2, 0, Math.PI * 2);
  ctx.fill();

  // Ears
  ctx.beginPath();
  ctx.ellipse(-18, -60, 7, 14, -0.2, 0, Math.PI * 2);
  ctx.ellipse(-2, -60, 7, 14, 0.1, 0, Math.PI * 2);
  ctx.fillStyle = PALETTE.MUMMY_SKIN;
  ctx.fill();
  ctx.stroke();

  // Cheeks
  ctx.fillStyle = PALETTE.MUMMY_CHEEK;
  ctx.beginPath();
  ctx.arc(-18, -14, 13, 0, Math.PI * 2);
  ctx.fill();

  // 3-Strand Mascara Eyelashes
  const drawEyelashes = (cx: number, cy: number) => {
    ctx.strokeStyle = PALETTE.MUMMY_MASCARA;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(cx - 5, cy - 6);
    ctx.quadraticCurveTo(cx - 8, cy - 13, cx - 11, cy - 14);
    ctx.moveTo(cx, cy - 7);
    ctx.quadraticCurveTo(cx, cy - 14, cx + 1, cy - 16);
    ctx.moveTo(cx + 5, cy - 6);
    ctx.quadraticCurveTo(cx + 8, cy - 12, cx + 11, cy - 13);
    ctx.stroke();
  };

  const eyeCenters = [{ x: 3, y: -42 }, { x: 19, y: -42 }];
  for (const pos of eyeCenters) {
    if (eyeBlink) {
      ctx.strokeStyle = PALETTE.BLACK;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 6.5, 0.1 * Math.PI, 0.9 * Math.PI);
      ctx.stroke();
      drawEyelashes(pos.x, pos.y);
    } else {
      ctx.fillStyle = PALETTE.WHITE;
      ctx.strokeStyle = PALETTE.MUMMY_OUTLINE;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 6.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = PALETTE.BLACK;
      ctx.beginPath();
      ctx.arc(pos.x + 1, pos.y, 2.8, 0, Math.PI * 2);
      ctx.fill();

      drawEyelashes(pos.x, pos.y);
    }
  }

  // Smile
  ctx.strokeStyle = PALETTE.MUMMY_DRESS_OUTLINE;
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  if (smiling) {
    ctx.arc(14, -18, 12, 0.1 * Math.PI, 0.8 * Math.PI);
  } else {
    ctx.moveTo(8, -14);
    ctx.lineTo(24, -14);
  }
  ctx.stroke();

  // 5. Front Arm & Frying Pan
  if (holdingPan) {
    ctx.save();
    ctx.translate(18, 12 + panArmOffset);
    ctx.rotate(panAngle);

    // Arm to pan handle
    ctx.strokeStyle = PALETTE.MUMMY_SKIN;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(16, 4);
    ctx.stroke();

    // Pan Handle
    ctx.strokeStyle = PALETTE.MUMMY_PAN_OUTLINE;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(14, 4);
    ctx.lineTo(34, 4);
    ctx.stroke();

    // Pan Base & Rim
    ctx.fillStyle = PALETTE.MUMMY_PAN;
    ctx.strokeStyle = PALETTE.MUMMY_PAN_OUTLINE;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(48, 4, 18, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Pancake in Pan
    ctx.fillStyle = PALETTE.MUMMY_PANCAKE;
    ctx.strokeStyle = '#FFA000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(48, 2, 12, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Butter Pat
    ctx.fillStyle = PALETTE.MUMMY_BUTTER;
    ctx.fillRect(46, 0, 4, 3);

    ctx.restore();
  } else {
    // Normal front arm
    ctx.strokeStyle = PALETTE.MUMMY_SKIN;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(18, 12);
    ctx.lineTo(34 - Math.sin(armWave) * 6, 2);
    ctx.stroke();
  }

  ctx.restore();
}

export const renderMummy = drawMummyPig;
export const renderMummyPig = drawMummyPig;
export const drawMummy = drawMummyPig;
