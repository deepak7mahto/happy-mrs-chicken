import { PALETTE } from './palette';

export function drawDaddyPig(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number = 1.0,
  state: { panicStage?: number; time?: number } = {}
): void {
  const panic = state.panicStage || 0;
  const time = state.time || 0;
  const shakeX = panic > 1 ? (Math.random() - 0.5) * (panic * 5) : 0;
  const shakeY = panic > 1 ? (Math.random() - 0.5) * (panic * 5) : 0;

  ctx.save();
  ctx.translate(x + shakeX, y + shakeY);
  ctx.scale(scale, scale);

  // Belly
  ctx.fillStyle = PALETTE.DADDY_SHIRT;
  ctx.strokeStyle = PALETTE.DADDY_SHIRT_OUTLINE;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.ellipse(0, 45, 58, 48, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Head
  ctx.fillStyle = PALETTE.DADDY_SKIN;
  ctx.strokeStyle = PALETTE.DADDY_OUTLINE;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(0, -10);
  ctx.quadraticCurveTo(45, -10, 48, -35);
  ctx.lineTo(70, -35);
  ctx.arc(70, -25, 11, -Math.PI / 2, Math.PI / 2);
  ctx.lineTo(40, -15);
  ctx.quadraticCurveTo(20, -55, -20, -55);
  ctx.quadraticCurveTo(-60, -55, -60, -15);
  ctx.quadraticCurveTo(-60, 20, 0, -10);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Beard Stubble
  ctx.strokeStyle = PALETTE.DADDY_BEARD;
  ctx.lineWidth = 3;
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.arc(-20 + i * 8, 5, 3, 0, Math.PI);
    ctx.stroke();
  }

  // Glasses
  ctx.strokeStyle = PALETTE.DADDY_GLASSES;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(10, -35, 10, 0, Math.PI * 2);
  ctx.arc(32, -35, 10, 0, Math.PI * 2);
  ctx.moveTo(20, -35);
  ctx.lineTo(22, -35);
  ctx.moveTo(0, -35);
  ctx.lineTo(-12, -38);
  ctx.stroke();

  // Eyes
  ctx.fillStyle = PALETTE.BLACK;
  ctx.beginPath();
  const eyeR = panic > 2 ? 4.5 : 3;
  ctx.arc(11, -35, eyeR, 0, Math.PI * 2);
  ctx.arc(33, -35, eyeR, 0, Math.PI * 2);
  ctx.fill();

  // Sweat Drops
  if (panic >= 1) {
    ctx.fillStyle = '#4FC3F7';
    ctx.beginPath();
    ctx.arc(-35, -35 + Math.sin(time * 8) * 5, 5, 0, Math.PI * 2);
    ctx.arc(-25, -55, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}
