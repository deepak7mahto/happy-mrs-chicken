/**
 * Suzy Sheep Procedural Vector Renderer
 * Peppa Pig: Happy Mrs Chicken 8-Game Deluxe Expansion Suite
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

  // 1. Black Mary Jane Shoes & White Socks
  ctx.fillStyle = PALETTE.BLACK;
  ctx.beginPath();
  ctx.roundRect(-20, 44, 16, 12, 5);
  ctx.roundRect(4, 44, 16, 12, 5);
  ctx.fill();

  // White Sheep Legs
  ctx.strokeStyle = PALETTE.SUZY_WOOL;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-11, 35);
  ctx.lineTo(-11, 45);
  ctx.moveTo(11, 35);
  ctx.lineTo(11, 45);
  ctx.stroke();

  // Fluffy Tail (Cotton Puff)
  ctx.fillStyle = PALETTE.SUZY_WOOL;
  ctx.strokeStyle = PALETTE.SUZY_WOOL_OUTLINE;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(-28, 32, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 2. Pink Dress
  ctx.fillStyle = PALETTE.SUZY_DRESS;
  ctx.strokeStyle = PALETTE.SUZY_DRESS_OUTLINE;
  ctx.lineWidth = 4.5;
  ctx.beginPath();
  ctx.moveTo(-16, -5);
  ctx.quadraticCurveTo(-35 + dressSway, 35, -28 + dressSway, 40);
  ctx.lineTo(28 + dressSway, 40);
  ctx.quadraticCurveTo(35 + dressSway, 35, 16, -5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 3. Back Arm
  ctx.strokeStyle = PALETTE.SUZY_WOOL;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-18, 10);
  ctx.lineTo(-32, 0);
  ctx.stroke();

  // 4. White Wool Head & Sheep Snout
  ctx.fillStyle = PALETTE.SUZY_WOOL;
  ctx.strokeStyle = PALETTE.SUZY_WOOL_OUTLINE;
  ctx.lineWidth = 4.5;
  ctx.beginPath();
  ctx.moveTo(0, -15);
  ctx.quadraticCurveTo(32, -15, 36, -32);
  ctx.lineTo(50, -32);
  ctx.arc(50, -25, 7.5, -Math.PI / 2, Math.PI / 2);
  ctx.lineTo(28, -18);
  ctx.quadraticCurveTo(14, -44, -14, -44);
  ctx.quadraticCurveTo(-42, -44, -42, -15);
  ctx.quadraticCurveTo(-42, 14, 0, -15);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Pink Sheep Nose Pad
  ctx.fillStyle = PALETTE.SUZY_NOSE;
  ctx.beginPath();
  ctx.arc(50, -25, 4, 0, Math.PI * 2);
  ctx.fill();

  // Scalloped Fluffy Wool Ears & Crown
  ctx.fillStyle = PALETTE.SUZY_WOOL;
  ctx.strokeStyle = PALETTE.SUZY_WOOL_OUTLINE;
  ctx.lineWidth = 3.5;

  const drawFluffyEar = (baseX: number, baseY: number, rot: number) => {
    ctx.save();
    ctx.translate(baseX, baseY);
    ctx.rotate(rot + earFlap);
    ctx.beginPath();
    ctx.arc(-2, -6, 6, 0, Math.PI * 2);
    ctx.arc(-4, -14, 6.5, 0, Math.PI * 2);
    ctx.arc(2, -20, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  };

  drawFluffyEar(-16, -42, -0.2);
  drawFluffyEar(-4, -44, 0.1);

  // Wool Head Crown Puffs
  ctx.beginPath();
  ctx.arc(-2, -46, 5, 0, Math.PI * 2);
  ctx.arc(8, -47, 5.5, 0, Math.PI * 2);
  ctx.arc(16, -44, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Cheek Blush
  ctx.fillStyle = PALETTE.SUZY_CHEEK;
  ctx.beginPath();
  ctx.arc(-14, -12, 10, 0, Math.PI * 2);
  ctx.fill();

  // Eyes & Blinking
  if (eyeBlink) {
    ctx.strokeStyle = PALETTE.BLACK;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, -32); ctx.lineTo(7, -32);
    ctx.moveTo(13, -32); ctx.lineTo(20, -32);
    ctx.stroke();
  } else {
    ctx.fillStyle = PALETTE.WHITE;
    ctx.strokeStyle = PALETTE.SUZY_WOOL_OUTLINE;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(3, -32, 5.5, 0, Math.PI * 2);
    ctx.arc(16, -32, 5.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = PALETTE.BLACK;
    ctx.beginPath();
    ctx.arc(4, -32, 2.4, 0, Math.PI * 2);
    ctx.arc(17, -32, 2.4, 0, Math.PI * 2);
    ctx.fill();
  }

  // Mouth (Happy or Puckered for Bubble Blowing)
  if (blowingBubble) {
    ctx.fillStyle = PALETTE.SUZY_DRESS_OUTLINE;
    ctx.beginPath();
    ctx.arc(18, -14, 3.5 + mouthPucker * 2, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.strokeStyle = PALETTE.SUZY_DRESS_OUTLINE;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(12, -14, 9, 0.1 * Math.PI, 0.8 * Math.PI);
    ctx.stroke();
  }

  // 5. Front Arm & Bubble Wand
  if (holdingWand) {
    ctx.save();
    ctx.translate(18, 10);
    ctx.rotate(wandAngle);

    // Arm to wand
    ctx.strokeStyle = PALETTE.SUZY_WOOL;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(16, -6);
    ctx.stroke();

    // Wand Stick
    ctx.strokeStyle = PALETTE.SUZY_WAND;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(14, -6);
    ctx.lineTo(28, -14);
    ctx.stroke();

    // Wand Loop Ring
    ctx.strokeStyle = PALETTE.SUZY_BUBBLE;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(34, -18, 6, 0, Math.PI * 2);
    ctx.stroke();

    // Bubble Soap Film / Highlight
    ctx.fillStyle = 'rgba(79, 195, 247, 0.35)';
    ctx.beginPath();
    ctx.arc(34, -18, 5.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  } else {
    // Normal front arm
    ctx.strokeStyle = PALETTE.SUZY_WOOL;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(18, 10);
    ctx.lineTo(32, 0);
    ctx.stroke();
  }

  ctx.restore();
}

export const renderSuzy = drawSuzySheep;
export const renderSuzySheep = drawSuzySheep;
export const drawSuzy = drawSuzySheep;
