/**
 * Mimi the Bunny Character Procedural Vector Renderer
 * Adventures of Trishu 8-Game Suite
 * Strictly under 500 Lines of Code
 */

import { PALETTE } from '../palette';
import { MimiOptions } from '../../types/characters';
import { preserveVolume, getHopscotchPhase, getBubbleBlowPose } from '../animations';

export function drawMimi(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number = 1.0,
  options: MimiOptions = {}
): void {
  const animState = options.animState;
  const baseSquash = animState?.squash ?? 1.0;
  const breath = animState?.breathScale ?? 1.0;

  let hopY = options.hopY ?? 0;
  let dynamicSquash = 1.0;
  let earFlap = options.earFlap ?? 0;

  if (animState?.hopY !== undefined && options.hopY === undefined) {
    const hopData = getHopscotchPhase(animState.hopY);
    hopY = hopData.hopY;
    dynamicSquash = hopData.squashY;
    earFlap = hopData.earFlap;
  }

  const activeSquash = baseSquash * breath * dynamicSquash;
  const { scaleX: stretchX, scaleY: activeSquish } = preserveVolume(activeSquash);
  const eyeBlink = options.eyeBlink ?? animState?.isBlinking ?? false;
  const dressSway = options.dressSway ?? (animState?.wobbleAngle ? Math.sin(animState.wobbleTimer * 3.5) * 4 : 0);
  const holdingWand = !!options.holdingWand;
  const blowingBubble = !!options.blowingBubble || options.expression === 'blowing';

  let mouthPucker = 0;
  let wandAngle = 0;
  if (blowingBubble && animState) {
    const bubblePose = getBubbleBlowPose(animState.customTimer ?? 0);
    mouthPucker = bubblePose.mouthPucker;
    wandAngle = bubblePose.wandAngle;
  }

  ctx.save();
  ctx.translate(x, y + hopY);
  ctx.scale(scale * stretchX, scale * activeSquish);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // 1. Tall Bunny Ears (Back Layer)
  const drawBunnyEar = (baseX: number, baseY: number, rot: number) => {
    ctx.save();
    ctx.translate(baseX, baseY);
    ctx.rotate(rot + earFlap);

    // Outer Ear
    ctx.fillStyle = PALETTE.MIMI_FUR;
    ctx.strokeStyle = PALETTE.MIMI_FUR_OUTLINE;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(0, -16, 7, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Inner Ear (Pink)
    ctx.fillStyle = PALETTE.MIMI_EAR_INNER;
    ctx.beginPath();
    ctx.ellipse(0, -16, 3.5, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  };

  drawBunnyEar(-10, -26, -0.15);
  drawBunnyEar(10, -26, 0.15);

  // 2. White Paws & Shoes
  ctx.fillStyle = '#37474F';
  ctx.beginPath();
  ctx.roundRect(-18, 42, 14, 12, 4);
  ctx.roundRect(4, 42, 14, 12, 4);
  ctx.fill();

  ctx.strokeStyle = PALETTE.MIMI_FUR;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-10, 34);
  ctx.lineTo(-10, 44);
  ctx.moveTo(10, 34);
  ctx.lineTo(10, 44);
  ctx.stroke();

  // Fluffy Tail
  ctx.fillStyle = PALETTE.MIMI_FUR;
  ctx.strokeStyle = PALETTE.MIMI_FUR_OUTLINE;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(-22, 30, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 3. Pink Floral Dress
  ctx.fillStyle = PALETTE.MIMI_DRESS;
  ctx.strokeStyle = PALETTE.MIMI_DRESS_OUTLINE;
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(-12, 0);
  ctx.lineTo(12, 0);
  ctx.quadraticCurveTo(22 + dressSway, 18, 26 + dressSway, 38);
  ctx.lineTo(-26 + dressSway, 38);
  ctx.quadraticCurveTo(-22 + dressSway, 18, -12, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 4. Back Arm
  ctx.strokeStyle = PALETTE.MIMI_FUR;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-14, 10);
  ctx.lineTo(-26, 4);
  ctx.stroke();

  // 5. Head
  ctx.fillStyle = PALETTE.MIMI_FUR;
  ctx.strokeStyle = PALETTE.MIMI_FUR_OUTLINE;
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.arc(0, -12, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 6. Rosy Cheeks
  ctx.fillStyle = PALETTE.MIMI_CHEEK;
  ctx.beginPath();
  ctx.arc(-10, -8, 3.5, 0, Math.PI * 2);
  ctx.arc(10, -8, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // 7. Pink Bunny Nose
  ctx.fillStyle = PALETTE.MIMI_NOSE;
  ctx.beginPath();
  ctx.moveTo(0, -11);
  ctx.lineTo(-3, -15);
  ctx.lineTo(3, -15);
  ctx.closePath();
  ctx.fill();

  // 8. Eyes & Blinking
  if (eyeBlink) {
    ctx.strokeStyle = PALETTE.BLACK;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(-6, -14, 3.5, Math.PI, 0, false);
    ctx.moveTo(2.5, -14);
    ctx.arc(6, -14, 3.5, Math.PI, 0, false);
    ctx.stroke();
  } else {
    ctx.fillStyle = PALETTE.BLACK;
    ctx.beginPath();
    ctx.arc(-6, -14, 2.5, 0, Math.PI * 2);
    ctx.arc(6, -14, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(-6.8, -15, 0.9, 0, Math.PI * 2);
    ctx.arc(5.2, -15, 0.9, 0, Math.PI * 2);
    ctx.fill();
  }

  // 9. Mouth / Bubble Blowing
  if (blowingBubble) {
    ctx.fillStyle = '#E91E63';
    ctx.strokeStyle = '#D81B60';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, -5, 3 + mouthPucker * 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else {
    ctx.strokeStyle = '#D81B60';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(-2, -7, 2.5, 0, Math.PI);
    ctx.arc(2, -7, 2.5, 0, Math.PI);
    ctx.stroke();
  }

  // 10. Front Arm & Bubble Wand
  if (holdingWand) {
    ctx.save();
    ctx.translate(12, 10);
    ctx.strokeStyle = PALETTE.MIMI_FUR;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(14, -2);
    ctx.stroke();

    ctx.save();
    ctx.translate(14, -2);
    ctx.rotate(wandAngle);

    // Wand Stick
    ctx.strokeStyle = '#FF4081';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(14, 0);
    ctx.stroke();

    // Wand Bubble Ring
    ctx.strokeStyle = '#FF4081';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(20, 0, 6, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
    ctx.restore();
  } else {
    ctx.strokeStyle = PALETTE.MIMI_FUR;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(12, 10);
    ctx.lineTo(24, 2);
    ctx.stroke();
  }

  ctx.restore();
}

export const renderMimi = drawMimi;
export const drawMimiBunny = drawMimi;
