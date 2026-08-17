import { PALETTE } from './palette';

export function drawPeppaPig(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number = 1.0,
  state: { jumpY?: number; squish?: number; armWave?: number } = {}
): void {
  const jumpY = state.jumpY || 0;
  const squish = state.squish || 1.0;
  const armWave = state.armWave || 0;

  ctx.save();
  ctx.translate(x, y + jumpY);
  ctx.scale(scale, scale * squish);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Boots
  ctx.fillStyle = PALETTE.PEPPA_BOOTS;
  ctx.strokeStyle = PALETTE.PEPPA_BOOTS_OUTLINE;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(-22, 45, 18, 14, 6);
  ctx.roundRect(4, 45, 18, 14, 6);
  ctx.fill();
  ctx.stroke();

  // Legs
  ctx.strokeStyle = PALETTE.PEPPA_SKIN;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(-12, 35);
  ctx.lineTo(-12, 46);
  ctx.moveTo(12, 35);
  ctx.lineTo(12, 46);
  ctx.stroke();

  // Dress
  ctx.fillStyle = PALETTE.PEPPA_DRESS;
  ctx.strokeStyle = PALETTE.PEPPA_DRESS_OUTLINE;
  ctx.lineWidth = 4.5;
  ctx.beginPath();
  ctx.moveTo(-16, -5);
  ctx.quadraticCurveTo(-35, 35, -28, 40);
  ctx.lineTo(28, 40);
  ctx.quadraticCurveTo(35, 35, 16, -5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Arms
  ctx.strokeStyle = PALETTE.PEPPA_SKIN;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-18, 10);
  ctx.lineTo(-32 + Math.sin(armWave) * 6, 0);
  ctx.moveTo(18, 10);
  ctx.lineTo(32 - Math.sin(armWave) * 6, 0);
  ctx.stroke();

  // Head & Snout
  ctx.fillStyle = PALETTE.PEPPA_SKIN;
  ctx.strokeStyle = PALETTE.PEPPA_OUTLINE;
  ctx.lineWidth = 4.5;
  ctx.beginPath();
  ctx.moveTo(0, -15);
  ctx.quadraticCurveTo(35, -15, 38, -35);
  ctx.lineTo(55, -35);
  ctx.arc(55, -28, 8, -Math.PI / 2, Math.PI / 2);
  ctx.lineTo(30, -20);
  ctx.quadraticCurveTo(15, -45, -15, -45);
  ctx.quadraticCurveTo(-45, -45, -45, -15);
  ctx.quadraticCurveTo(-45, 15, 0, -15);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Ears
  ctx.beginPath();
  ctx.ellipse(-15, -50, 6, 12, -0.2, 0, Math.PI * 2);
  ctx.ellipse(-2, -50, 6, 12, 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Cheek
  ctx.fillStyle = PALETTE.PEPPA_CHEEK;
  ctx.beginPath();
  ctx.arc(-15, -12, 11, 0, Math.PI * 2);
  ctx.fill();

  // Eyes
  ctx.fillStyle = PALETTE.WHITE;
  ctx.beginPath();
  ctx.arc(2, -35, 6, 0, Math.PI * 2);
  ctx.arc(16, -35, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = PALETTE.BLACK;
  ctx.beginPath();
  ctx.arc(3, -35, 2.5, 0, Math.PI * 2);
  ctx.arc(17, -35, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Smile
  ctx.strokeStyle = PALETTE.PEPPA_DRESS_OUTLINE;
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.arc(12, -15, 10, 0.1 * Math.PI, 0.8 * Math.PI);
  ctx.stroke();

  ctx.restore();
}
