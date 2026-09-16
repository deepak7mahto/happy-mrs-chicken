/**
 * Suzy Sheep Procedural Vector Renderer (Show-Accurate Cartoon Geometry)
 * Peppa Pig: Happy Mrs Chicken 8-Game Deluxe Expansion Suite
 * Strictly under 500 Lines of Code
 */

import { PALETTE } from '../palette';
import { SuzySheepOptions } from '../../types/characters';
import { preserveVolume, getHopscotchPhase, getBubbleBlowPose } from '../animations';

export function drawSuzySheep(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number = 1.0,
  options: SuzySheepOptions = {}
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

  // 1. Black Mary Jane Shoes & White Legs
  ctx.fillStyle = PALETTE.BLACK;
  ctx.beginPath();
  ctx.roundRect(-20, 44, 16, 12, 5);
  ctx.roundRect(4, 44, 16, 12, 5);
  ctx.fill();

  ctx.strokeStyle = PALETTE.SUZY_WOOL;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-11, 35);
  ctx.lineTo(-11, 45);
  ctx.moveTo(11, 35);
  ctx.lineTo(11, 45);
  ctx.stroke();

  // Fluffy Tail
  ctx.fillStyle = PALETTE.SUZY_WOOL;
  ctx.strokeStyle = PALETTE.SUZY_WOOL_OUTLINE;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(-26, 32, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 2. Pink Dress
  ctx.fillStyle = PALETTE.SUZY_DRESS;
  ctx.strokeStyle = PALETTE.SUZY_DRESS_OUTLINE;
  ctx.lineWidth = 4.5;
  ctx.beginPath();
  ctx.moveTo(-14, 0);
  ctx.lineTo(14, 0);
  ctx.quadraticCurveTo(24 + dressSway, 20, 30 + dressSway, 40);
  ctx.quadraticCurveTo(0, 43, -30 + dressSway, 40);
  ctx.quadraticCurveTo(-24 + dressSway, 20, -14, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 3. Back Arm
  ctx.strokeStyle = PALETTE.SUZY_WOOL;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-16, 10);
  ctx.lineTo(-30, 2);
  ctx.stroke();

  // 4. White Wool Head & Snout Contour
  ctx.fillStyle = PALETTE.SUZY_WOOL;
  ctx.strokeStyle = PALETTE.SUZY_WOOL_OUTLINE;
  ctx.lineWidth = 4.5;
  ctx.beginPath();
  ctx.moveTo(-10, -42);
  ctx.quadraticCurveTo(12, -42, 38, -36);
  ctx.quadraticCurveTo(46, -34, 46, -26);
  ctx.quadraticCurveTo(46, -18, 38, -16);
  ctx.quadraticCurveTo(14, -16, 4, -4);
  ctx.quadraticCurveTo(-4, 6, -22, 4);
  ctx.quadraticCurveTo(-42, 2, -42, -18);
  ctx.quadraticCurveTo(-42, -42, -10, -42);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Snout Oval
  ctx.beginPath();
  ctx.ellipse(38, -26, 4.5, 9, 0.12, 0, Math.PI * 2);
  ctx.fillStyle = PALETTE.SUZY_WOOL;
  ctx.fill();
  ctx.strokeStyle = PALETTE.SUZY_WOOL_OUTLINE;
  ctx.lineWidth = 3.5;
  ctx.stroke();

  // Pink Sheep Nose Pad
  ctx.fillStyle = PALETTE.SUZY_NOSE;
  ctx.beginPath();
  ctx.arc(38, -26, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // Fluffy Wool Ears
  ctx.fillStyle = PALETTE.SUZY_WOOL;
  ctx.strokeStyle = PALETTE.SUZY_WOOL_OUTLINE;
  ctx.lineWidth = 3.5;

  const drawFluffyEar = (baseX: number, baseY: number, rot: number) => {
    ctx.save();
    ctx.translate(baseX, baseY);
    ctx.rotate(rot + earFlap);
    ctx.beginPath();
    ctx.ellipse(0, 0, 6, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  };

  drawFluffyEar(-18, -46, -0.2);
  drawFluffyEar(-6, -46, 0.1);

  // Rosy Cheek
  ctx.fillStyle = '#FF80AB';
  ctx.beginPath();
  ctx.arc(-18, -12, 10, 0, Math.PI * 2);
  ctx.fill();

  // Eyes & Blinking
  if (eyeBlink) {
    ctx.strokeStyle = PALETTE.SUZY_WOOL_OUTLINE;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(4, -36, 5, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(18, -34, 5, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.stroke();
  } else {
    ctx.fillStyle = PALETTE.WHITE;
    ctx.strokeStyle = PALETTE.SUZY_WOOL_OUTLINE;
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    ctx.arc(4, -36, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(18, -34, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = PALETTE.BLACK;
    ctx.beginPath();
    ctx.arc(5.5, -36, 2.6, 0, Math.PI * 2);
    ctx.arc(19.5, -34, 2.6, 0, Math.PI * 2);
    ctx.fill();
  }

  // Smile / Blowing Mouth
  if (blowingBubble) {
    ctx.fillStyle = '#E91E63';
    ctx.strokeStyle = PALETTE.SUZY_WOOL_OUTLINE;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(18, -14, 4 + mouthPucker * 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else {
    ctx.strokeStyle = '#E91E63';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(12, -12, 10, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(20, -14, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = '#E91E63';
    ctx.fill();
  }

  // 5. Front Arm & Bubble Wand
  if (holdingWand) {
    ctx.save();
    ctx.translate(14, 10);
    ctx.strokeStyle = PALETTE.SUZY_WOOL;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(16, -2);
    ctx.stroke();

    ctx.save();
    ctx.translate(16, -2);
    ctx.rotate(wandAngle);

    // Wand Stick
    ctx.strokeStyle = '#FF4081';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(16, 0);
    ctx.stroke();

    // Wand Bubble Ring
    ctx.strokeStyle = '#FF4081';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(22, 0, 6, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
    ctx.restore();
  } else {
    ctx.strokeStyle = PALETTE.SUZY_WOOL;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(14, 10);
    ctx.lineTo(28, 2);
    ctx.stroke();
  }

  ctx.restore();
}

export const renderSuzySheep = drawSuzySheep;
export const renderSuzy = drawSuzySheep;
export const drawSuzy = drawSuzySheep;
