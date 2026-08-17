import { PALETTE } from './palette';

export function drawEgg(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number = 1.0,
  rotation: number = 0,
  crackStage: number = 0
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.scale(scale, scale);

  ctx.fillStyle = PALETTE.EGG_SHELL;
  ctx.strokeStyle = PALETTE.EGG_OUTLINE;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(0, 0, 14, 19, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Cracks
  if (crackStage > 0) {
    ctx.strokeStyle = '#8D6E63';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-4, -6);
    ctx.lineTo(2, -2);
    ctx.lineTo(-2, 4);
    if (crackStage >= 2) {
      ctx.lineTo(6, 8);
      ctx.moveTo(2, -2);
      ctx.lineTo(8, -5);
    }
    ctx.stroke();
  }

  ctx.restore();
}

export function drawHayNest(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number = 260,
  h: number = 90
): void {
  ctx.save();
  ctx.translate(x, y);

  // Outer Hay Base
  ctx.fillStyle = PALETTE.HAY_DARK;
  ctx.strokeStyle = PALETTE.HAY_OUTLINE;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Inner Nest Hollow
  ctx.fillStyle = PALETTE.HAY_LIGHT;
  ctx.beginPath();
  ctx.ellipse(0, -4, w * 0.42, h * 0.38, 0, 0, Math.PI * 2);
  ctx.fill();

  // Hay Strands
  ctx.strokeStyle = PALETTE.HAY_OUTLINE;
  ctx.lineWidth = 2.5;
  for (let i = 0; i < 16; i++) {
    const angle = (i * Math.PI * 2) / 16;
    const r1 = w * 0.38;
    const r2 = w * 0.52 + (i % 3) * 6;
    ctx.beginPath();
    ctx.moveTo(Math.cos(angle) * r1, Math.sin(angle) * (r1 * (h / w)));
    ctx.lineTo(Math.cos(angle + 0.1) * r2, Math.sin(angle + 0.1) * (r2 * (h / w)));
    ctx.stroke();
  }

  ctx.restore();
}

export function drawMuddyPuddle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rx: number,
  ry: number,
  state: { type?: 'STANDARD' | 'GOLDEN'; ripplePhase?: number } = {}
): void {
  const isGolden = state.type === 'GOLDEN';
  const ripple = state.ripplePhase || 0;

  ctx.save();
  ctx.translate(x, y);

  // Puddle Fill
  ctx.fillStyle = isGolden ? PALETTE.GOLDEN_PUDDLE : PALETTE.MUD_DARK;
  ctx.strokeStyle = isGolden ? PALETTE.GOLDEN_PUDDLE_OUTLINE : PALETTE.MUD_OUTLINE;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Ripple
  if (ripple > 0) {
    ctx.strokeStyle = isGolden ? '#FFE082' : PALETTE.MUD_LIGHT;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.ellipse(0, 0, rx * (0.4 + (ripple % 1) * 0.5), ry * (0.4 + (ripple % 1) * 0.5), 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Highlight
  ctx.fillStyle = PALETTE.MUD_HIGHLIGHT;
  ctx.beginPath();
  ctx.ellipse(-rx * 0.3, -ry * 0.3, rx * 0.35, ry * 0.25, -0.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

export function drawLandscapeSkyHills(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number = 0
): void {
  ctx.save();

  // Sky Gradient
  const skyGrad = ctx.createLinearGradient(0, 0, 0, height * 0.75);
  skyGrad.addColorStop(0, PALETTE.SKY_TOP);
  skyGrad.addColorStop(1, PALETTE.SKY_BOTTOM);
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, width, height);

  // Smiling Sun
  const sunX = width * 0.86;
  const sunY = height * 0.14;
  const sunRadius = Math.min(width, height) * 0.08;
  const pulse = Math.sin(time * 3) * 5;

  ctx.fillStyle = PALETTE.SUN_RAY;
  ctx.strokeStyle = PALETTE.SUN_FACE;
  ctx.lineWidth = 3;
  const rayCount = 10;
  for (let i = 0; i < rayCount; i++) {
    const angle = (Math.PI * 2 * i) / rayCount + time * 0.2;
    const r1 = sunRadius + 6;
    const r2 = sunRadius + 18 + pulse;
    ctx.beginPath();
    ctx.moveTo(sunX + Math.cos(angle - 0.15) * r1, sunY + Math.sin(angle - 0.15) * r1);
    ctx.lineTo(sunX + Math.cos(angle) * r2, sunY + Math.sin(angle) * r2);
    ctx.lineTo(sunX + Math.cos(angle + 0.15) * r1, sunY + Math.sin(angle + 0.15) * r1);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  ctx.fillStyle = PALETTE.SUN_YELLOW;
  ctx.beginPath();
  ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Sun Face
  ctx.fillStyle = PALETTE.BLACK;
  ctx.beginPath();
  ctx.arc(sunX - 10, sunY - 4, 3.5, 0, Math.PI * 2);
  ctx.arc(sunX + 10, sunY - 4, 3.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#FF8A80';
  ctx.beginPath();
  ctx.arc(sunX - 16, sunY + 4, 5, 0, Math.PI * 2);
  ctx.arc(sunX + 16, sunY + 4, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = PALETTE.SUN_FACE;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(sunX, sunY + 3, 14, 0.1 * Math.PI, 0.9 * Math.PI);
  ctx.stroke();

  // Far Hills
  ctx.fillStyle = PALETTE.HILL_FAR;
  ctx.strokeStyle = PALETTE.HILL_OUTLINE;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, height * 0.65);
  ctx.quadraticCurveTo(width * 0.35, height * 0.45, width * 0.75, height * 0.6);
  ctx.quadraticCurveTo(width * 0.9, height * 0.65, width, height * 0.62);
  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Near Grass Lawn
  ctx.fillStyle = PALETTE.GRASS_LAWN;
  ctx.strokeStyle = PALETTE.GRASS_OUTLINE;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(0, height * 0.75);
  ctx.quadraticCurveTo(width * 0.4, height * 0.7, width, height * 0.76);
  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}
