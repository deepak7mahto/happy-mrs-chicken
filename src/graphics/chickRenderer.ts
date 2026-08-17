import { PALETTE } from './palette';

export function drawBabyChick(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number = 1.0,
  state: { walkCycle?: number; isPeeping?: boolean; facingLeft?: boolean } = {}
): void {
  const walk = state.walkCycle || 0;
  const isPeep = !!state.isPeeping;
  const facingLeft = !!state.facingLeft;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(facingLeft ? -scale : scale, scale);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Feet
  ctx.strokeStyle = PALETTE.CHICK_BEAK;
  ctx.lineWidth = 3;
  const legSwing = Math.sin(walk) * 6;
  ctx.beginPath();
  ctx.moveTo(-6, 14);
  ctx.lineTo(-6 - legSwing, 22);
  ctx.moveTo(6, 14);
  ctx.lineTo(6 + legSwing, 22);
  ctx.stroke();

  // Body
  ctx.fillStyle = PALETTE.CHICK_BODY;
  ctx.strokeStyle = PALETTE.CHICK_OUTLINE;
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.ellipse(0, 2, 18, 15, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Wing
  ctx.fillStyle = PALETTE.CHICK_WING_SHADOW;
  ctx.beginPath();
  ctx.ellipse(-4, 3, 9, 6, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Head
  ctx.beginPath();
  ctx.arc(8, -8, 12, 0, Math.PI * 2);
  ctx.fillStyle = PALETTE.CHICK_BODY;
  ctx.fill();
  ctx.stroke();

  // Cheek
  ctx.fillStyle = PALETTE.CHICK_CHEEK;
  ctx.beginPath();
  ctx.arc(8, -4, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // Beak
  ctx.fillStyle = PALETTE.CHICK_BEAK;
  ctx.beginPath();
  ctx.moveTo(17, -10);
  ctx.lineTo(24, isPeep ? -12 : -7);
  ctx.lineTo(17, -4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Eye
  ctx.fillStyle = PALETTE.CHICK_EYE;
  ctx.beginPath();
  ctx.arc(12, -10, 2.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}
