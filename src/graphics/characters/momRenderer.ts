/**
 * Mom Character Procedural Vector Renderer
 * Adventures of Trishu 8-Game Suite
 * Strictly under 500 Lines of Code
 */

import { PALETTE } from '../palette';
import { MomOptions } from '../../types/characters';
import { preserveVolume, getFryingPanAngle } from '../animations';

export function drawMom(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number = 1.0,
  options: MomOptions = {}
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

  // 1. Dark Shoes & Legs
  ctx.fillStyle = '#37474F';
  ctx.beginPath();
  ctx.roundRect(-20, 50, 18, 12, 4);
  ctx.roundRect(4, 50, 18, 12, 4);
  ctx.fill();

  ctx.strokeStyle = PALETTE.MOM_SKIN;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-11, 40);
  ctx.lineTo(-11, 51);
  ctx.moveTo(11, 40);
  ctx.lineTo(11, 51);
  ctx.stroke();

  // 2. Coral-Orange Dress
  ctx.fillStyle = PALETTE.MOM_DRESS;
  ctx.strokeStyle = PALETTE.MOM_DRESS_OUTLINE;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-14, 0);
  ctx.lineTo(14, 0);
  ctx.quadraticCurveTo(24 + dressSway, 22, 28 + dressSway, 44);
  ctx.lineTo(-28 + dressSway, 44);
  ctx.quadraticCurveTo(-24 + dressSway, 22, -14, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 3. Back Arm
  ctx.strokeStyle = PALETTE.MOM_SKIN;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-14, 8);
  ctx.lineTo(-28 + Math.sin(armWave) * 4, 4);
  ctx.stroke();

  // 4. Neck & Head
  ctx.fillStyle = PALETTE.MOM_SKIN;
  ctx.strokeStyle = PALETTE.MOM_OUTLINE;
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.arc(0, -16, 20, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 5. Hair (Dark Brown with Side Sweep)
  ctx.fillStyle = PALETTE.MOM_HAIR;
  ctx.strokeStyle = '#3E2723';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-18, -18);
  ctx.quadraticCurveTo(-14, -38, 0, -38);
  ctx.quadraticCurveTo(14, -38, 18, -18);
  ctx.quadraticCurveTo(10, -28, 0, -28);
  ctx.quadraticCurveTo(-10, -28, -18, -18);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Hair Clip (Coral Flower)
  ctx.fillStyle = PALETTE.MOM_HAIRCLIP;
  ctx.beginPath();
  ctx.arc(14, -28, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FFEE58';
  ctx.beginPath();
  ctx.arc(14, -28, 1.8, 0, Math.PI * 2);
  ctx.fill();

  // 6. Cheeks
  ctx.fillStyle = PALETTE.MOM_CHEEK;
  ctx.beginPath();
  ctx.arc(-11, -12, 4, 0, Math.PI * 2);
  ctx.arc(11, -12, 4, 0, Math.PI * 2);
  ctx.fill();

  // 7. Eyelashes & Eyes
  const drawEyelashes = (cx: number, cy: number) => {
    ctx.strokeStyle = '#212121';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(cx - 3, cy - 4); ctx.lineTo(cx - 6, cy - 8);
    ctx.moveTo(cx, cy - 5); ctx.lineTo(cx, cy - 9);
    ctx.moveTo(cx + 3, cy - 4); ctx.lineTo(cx + 6, cy - 8);
    ctx.stroke();
  };

  const eyePositions = [{ x: -6, y: -18 }, { x: 8, y: -18 }];
  for (const pos of eyePositions) {
    if (eyeBlink) {
      ctx.strokeStyle = PALETTE.BLACK;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 4, 0.2 * Math.PI, 0.8 * Math.PI);
      ctx.stroke();
      drawEyelashes(pos.x, pos.y);
    } else {
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.ellipse(pos.x, pos.y, 4.5, 5.5, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = PALETTE.BLACK;
      ctx.beginPath();
      ctx.arc(pos.x + 0.8, pos.y, 2.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(pos.x, pos.y - 1.5, 0.9, 0, Math.PI * 2);
      ctx.fill();

      drawEyelashes(pos.x, pos.y);
    }
  }

  // 8. Smile
  if (smiling) {
    ctx.strokeStyle = '#D81B60';
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.arc(1, -8, 8, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
  }

  // 9. Front Arm & Frying Pan
  if (holdingPan) {
    ctx.save();
    ctx.translate(14, 10);
    ctx.strokeStyle = PALETTE.MOM_SKIN;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(16, 4 + panArmOffset);
    ctx.stroke();

    ctx.save();
    ctx.translate(16, 4 + panArmOffset);
    ctx.rotate(panAngle);

    // Pan Handle
    ctx.strokeStyle = '#424242';
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(16, 0);
    ctx.stroke();

    // Pan Body
    ctx.fillStyle = '#37474F';
    ctx.strokeStyle = '#263238';
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.roundRect(16, -11, 36, 22, 5);
    ctx.fill();
    ctx.stroke();

    // Pan interior highlight / Butter pat
    ctx.fillStyle = PALETTE.MOM_BUTTER;
    ctx.beginPath();
    ctx.roundRect(28, -4, 8, 8, 2);
    ctx.fill();

    ctx.restore();
    ctx.restore();
  } else {
    ctx.strokeStyle = PALETTE.MOM_SKIN;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(14, 8);
    ctx.lineTo(28, 2);
    ctx.stroke();
  }

  ctx.restore();
}

export const renderMom = drawMom;
export const drawMomMother = drawMom;
