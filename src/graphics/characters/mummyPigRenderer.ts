/**
 * Mummy Pig Procedural Vector Renderer (Show-Accurate Cartoon Geometry)
 * Peppa Pig: Happy Mrs Chicken 8-Game Deluxe Expansion Suite
 * Strictly under 500 Lines of Code
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
  ctx.roundRect(-24, 52, 20, 12, 5);
  ctx.roundRect(5, 52, 20, 12, 5);
  ctx.fill();

  ctx.strokeStyle = PALETTE.MUMMY_SKIN;
  ctx.lineWidth = 4.5;
  ctx.beginPath();
  ctx.moveTo(-14, 42);
  ctx.lineTo(-14, 53);
  ctx.moveTo(14, 42);
  ctx.lineTo(14, 53);
  ctx.stroke();

  // 2. Coral-Orange Dress
  ctx.fillStyle = PALETTE.MUMMY_DRESS;
  ctx.strokeStyle = PALETTE.MUMMY_DRESS_OUTLINE;
  ctx.lineWidth = 4.5;
  ctx.beginPath();
  ctx.moveTo(-16, -2);
  ctx.lineTo(16, -2);
  ctx.quadraticCurveTo(28 + dressSway, 24, 34 + dressSway, 46);
  ctx.quadraticCurveTo(0, 50, -34 + dressSway, 46);
  ctx.quadraticCurveTo(-28 + dressSway, 24, -16, -2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 3. Back Arm
  ctx.strokeStyle = PALETTE.MUMMY_SKIN;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-18, 10);
  ctx.lineTo(-32 + Math.sin(armWave) * 5, 2);
  ctx.stroke();

  // 4. Ears
  ctx.fillStyle = PALETTE.MUMMY_SKIN;
  ctx.strokeStyle = PALETTE.MUMMY_OUTLINE;
  ctx.lineWidth = 4;

  ctx.beginPath();
  ctx.ellipse(-20, -54, 6, 12, -0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(-7, -54, 6, 12, 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 5. Canonical Hairdryer Head & Snout Contour
  ctx.fillStyle = PALETTE.MUMMY_SKIN;
  ctx.strokeStyle = PALETTE.MUMMY_OUTLINE;
  ctx.lineWidth = 4.5;
  ctx.beginPath();
  ctx.moveTo(-12, -48);
  ctx.quadraticCurveTo(14, -48, 42, -40);
  ctx.quadraticCurveTo(50, -38, 50, -29);
  ctx.quadraticCurveTo(50, -20, 42, -18);
  ctx.quadraticCurveTo(16, -18, 4, -4);
  ctx.quadraticCurveTo(-4, 6, -24, 4);
  ctx.quadraticCurveTo(-46, 2, -46, -20);
  ctx.quadraticCurveTo(-46, -48, -12, -48);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Snout Oval
  ctx.beginPath();
  ctx.ellipse(42, -29, 5, 10, 0.12, 0, Math.PI * 2);
  ctx.fillStyle = PALETTE.MUMMY_SKIN;
  ctx.fill();
  ctx.strokeStyle = PALETTE.MUMMY_OUTLINE;
  ctx.lineWidth = 3.5;
  ctx.stroke();

  // Nostrils
  ctx.fillStyle = PALETTE.MUMMY_OUTLINE;
  ctx.beginPath();
  ctx.arc(41, -33, 2.2, 0, Math.PI * 2);
  ctx.arc(43, -25, 2.2, 0, Math.PI * 2);
  ctx.fill();

  // Rosy Cheek
  ctx.fillStyle = PALETTE.MUMMY_CHEEK;
  ctx.beginPath();
  ctx.arc(-20, -14, 12, 0, Math.PI * 2);
  ctx.fill();

  // 3-Strand Mascara Eyelashes
  const drawEyelashes = (cx: number, cy: number) => {
    ctx.strokeStyle = PALETTE.MUMMY_MASCARA;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(cx - 5, cy - 6);
    ctx.quadraticCurveTo(cx - 8, cy - 12, cx - 11, cy - 13);
    ctx.moveTo(cx, cy - 7);
    ctx.quadraticCurveTo(cx, cy - 13, cx + 1, cy - 15);
    ctx.moveTo(cx + 5, cy - 6);
    ctx.quadraticCurveTo(cx + 8, cy - 11, cx + 11, cy - 12);
    ctx.stroke();
  };

  // Eyes
  const eyeCenters = [{ x: 5, y: -40 }, { x: 20, y: -38 }];
  for (const pos of eyeCenters) {
    if (eyeBlink) {
      ctx.strokeStyle = PALETTE.MUMMY_OUTLINE;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 6, 0.2 * Math.PI, 0.8 * Math.PI);
      ctx.stroke();
      drawEyelashes(pos.x, pos.y);
    } else {
      ctx.fillStyle = PALETTE.WHITE;
      ctx.strokeStyle = PALETTE.MUMMY_OUTLINE;
      ctx.lineWidth = 2.5;

      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 6.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = PALETTE.BLACK;
      ctx.beginPath();
      ctx.arc(pos.x + 1.2, pos.y, 2.8, 0, Math.PI * 2);
      ctx.fill();

      drawEyelashes(pos.x, pos.y);
    }
  }

  // Smile
  if (smiling) {
    ctx.strokeStyle = '#D81B60';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(14, -14, 11, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(23, -16, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = '#D81B60';
    ctx.fill();
  }

  // 6. Front Arm & Frying Pan
  if (holdingPan) {
    ctx.save();
    ctx.translate(16, 12);
    ctx.strokeStyle = PALETTE.MUMMY_SKIN;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(16, 6 + panArmOffset);
    ctx.stroke();

    ctx.save();
    ctx.translate(16, 6 + panArmOffset);
    ctx.rotate(panAngle);

    // Pan Handle
    ctx.strokeStyle = '#424242';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(18, 0);
    ctx.stroke();

    // Pan Body
    ctx.fillStyle = '#37474F';
    ctx.strokeStyle = '#263238';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(18, -12, 38, 24, 6);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
    ctx.restore();
  } else {
    ctx.strokeStyle = PALETTE.MUMMY_SKIN;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(16, 10);
    ctx.lineTo(32, 2);
    ctx.stroke();
  }

  ctx.restore();
}

export const renderMummy = drawMummyPig;
export const renderMummyPig = drawMummyPig;
export const drawMummy = drawMummyPig;
