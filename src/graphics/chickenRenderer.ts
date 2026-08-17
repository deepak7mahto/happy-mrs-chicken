import { PALETTE } from './palette';

export function drawMrsChicken(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number = 1.0,
  state: { squash?: number; flap?: number; squawk?: number; eyeBlink?: boolean; facingLeft?: boolean; headBob?: number } = {}
): void {
  const squash = state.squash !== undefined ? state.squash : 1.0;
  const stretchX = 1.0 / Math.sqrt(Math.max(0.2, squash));
  const flap = state.flap || 0;
  const squawk = state.squawk || 0;
  const eyeBlink = !!state.eyeBlink;
  const facingLeft = !!state.facingLeft;
  const headBob = state.headBob || 0;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(facingLeft ? -scale * stretchX : scale * stretchX, scale * squash);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // 1. Legs
  ctx.strokeStyle = PALETTE.CHICKEN_LEGS;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(-15, 30);
  ctx.lineTo(-18, 55);
  ctx.lineTo(-28, 58);
  ctx.moveTo(-18, 55);
  ctx.lineTo(-18, 62);
  ctx.moveTo(-18, 55);
  ctx.lineTo(-8, 58);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(15, 30);
  ctx.lineTo(18, 55);
  ctx.lineTo(8, 58);
  ctx.moveTo(18, 55);
  ctx.lineTo(18, 62);
  ctx.moveTo(18, 55);
  ctx.lineTo(28, 58);
  ctx.stroke();

  // 2. Tail Feathers
  ctx.fillStyle = PALETTE.CHICKEN_BODY;
  ctx.strokeStyle = PALETTE.CHICKEN_OUTLINE;
  ctx.lineWidth = 4.5;
  ctx.beginPath();
  ctx.moveTo(-45, -5);
  ctx.quadraticCurveTo(-75, -25, -70, -45);
  ctx.quadraticCurveTo(-50, -35, -45, -20);
  ctx.quadraticCurveTo(-65, -55, -45, -60);
  ctx.quadraticCurveTo(-35, -40, -30, -25);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 3. Body
  ctx.beginPath();
  ctx.ellipse(0, 0, 52, 44, 0, 0, Math.PI * 2);
  ctx.fillStyle = PALETTE.CHICKEN_BODY;
  ctx.fill();
  ctx.stroke();

  // 4. Wings
  ctx.save();
  ctx.translate(-5, 0);
  ctx.rotate(flap);
  ctx.beginPath();
  ctx.ellipse(0, 0, 26, 18, -0.2, 0, Math.PI * 2);
  ctx.fillStyle = PALETTE.CHICKEN_WING_SHADOW;
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // 5. Head & Neck
  ctx.save();
  ctx.translate(32, -32 + headBob);

  // Wattle
  ctx.fillStyle = PALETTE.CHICKEN_WATTLE;
  ctx.strokeStyle = PALETTE.CHICKEN_COMB_OUTLINE;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(14, 18, 6, 10, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Head Circle
  ctx.beginPath();
  ctx.arc(0, 0, 24, 0, Math.PI * 2);
  ctx.fillStyle = PALETTE.CHICKEN_BODY;
  ctx.strokeStyle = PALETTE.CHICKEN_OUTLINE;
  ctx.lineWidth = 4.5;
  ctx.fill();
  ctx.stroke();

  // Comb
  ctx.fillStyle = PALETTE.CHICKEN_COMB;
  ctx.strokeStyle = PALETTE.CHICKEN_COMB_OUTLINE;
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.arc(-8, -24, 8, Math.PI * 0.8, Math.PI * 2);
  ctx.arc(4, -28, 9, Math.PI * 0.9, Math.PI * 2.1);
  ctx.arc(16, -22, 7, Math.PI * 0.9, Math.PI * 2.2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Beak
  ctx.fillStyle = PALETTE.CHICKEN_BEAK;
  ctx.strokeStyle = PALETTE.CHICKEN_BEAK_OUTLINE;
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  if (squawk > 0) {
    ctx.moveTo(18, -4);
    ctx.lineTo(38, 2 - squawk * 8);
    ctx.lineTo(20, 8);
    ctx.lineTo(36, 12 + squawk * 8);
    ctx.lineTo(16, 16);
  } else {
    ctx.moveTo(18, -4);
    ctx.lineTo(38, 6);
    ctx.lineTo(18, 16);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Eye
  if (eyeBlink) {
    ctx.strokeStyle = PALETTE.CHICKEN_EYE;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(6, -2);
    ctx.lineTo(14, -2);
    ctx.stroke();
  } else {
    ctx.fillStyle = PALETTE.WHITE;
    ctx.strokeStyle = PALETTE.CHICKEN_OUTLINE;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(10, -3, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = PALETTE.CHICKEN_EYE;
    ctx.beginPath();
    ctx.arc(12, -3, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
  ctx.restore();
}
