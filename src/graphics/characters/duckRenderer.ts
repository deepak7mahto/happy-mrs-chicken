/**
 * Procedural Vector Yellow Duck Renderer
 * Adventures of Trishu — Mode 16: Picnic Ducks
 * Strictly under 150 Lines of Code
 */

export interface DuckRenderOptions {
  walkCycle?: number;
  facingLeft?: boolean;
  hopY?: number;
  rotation?: number;
  peckTimer?: number;
  wiggleTimer?: number;
  dancePhase?: number;
  isQuacking?: boolean;
  eyeBlink?: boolean;
  featherTuft?: boolean;
  wingFlap?: number;
  isHappy?: boolean;
}

export function drawYellowDuck(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number = 1.0,
  options: DuckRenderOptions = {}
): void {
  const walk = options.walkCycle ?? 0;
  const facingLeft = options.facingLeft ?? false;
  const hopY = options.hopY ?? 0;
  const rotation = options.rotation ?? 0;
  const peck = options.peckTimer ?? 0;
  const wiggle = options.wiggleTimer ?? 0;
  const isQuack = options.isQuacking ?? false;
  const eyeBlink = options.eyeBlink ?? false;
  const tuft = options.featherTuft ?? false;
  const isHappy = options.isHappy ?? false;

  const wiggleOffset = wiggle > 0 ? Math.sin(wiggle * 28) * 3.5 : 0;
  const headPeckY = peck > 0 ? Math.sin(peck * Math.PI) * 7 : 0;
  const wingAngle = options.wingFlap ?? (Math.sin(walk * 2.2) * 0.25);

  ctx.save();
  ctx.translate(x + wiggleOffset, y + hopY);
  if (rotation !== 0) ctx.rotate(rotation);
  ctx.scale(facingLeft ? -scale : scale, scale);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // 1. Webbed Feet (waddling)
  ctx.fillStyle = '#F57C00';
  ctx.strokeStyle = '#BF360C';
  ctx.lineWidth = 2.2;
  const legSwingL = Math.sin(walk) * 5;
  const legSwingR = Math.sin(walk + Math.PI) * 5;

  // Left Foot
  ctx.beginPath();
  ctx.moveTo(-6, 12);
  ctx.lineTo(-6 - legSwingL, 20);
  ctx.lineTo(-12 - legSwingL, 22);
  ctx.lineTo(-2 - legSwingL, 22);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Right Foot
  ctx.beginPath();
  ctx.moveTo(7, 12);
  ctx.lineTo(7 + legSwingR, 20);
  ctx.lineTo(1 + legSwingR, 22);
  ctx.lineTo(13 + legSwingR, 22);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 2. Duck Body & Upcurled Tail
  ctx.fillStyle = '#FFD54F';
  ctx.strokeStyle = '#E65100';
  ctx.lineWidth = 3.2;

  ctx.beginPath();
  ctx.moveTo(-16, 2);
  ctx.quadraticCurveTo(-26, -3, -24, -10); // Pointy upturned tail
  ctx.quadraticCurveTo(-18, -4, -8, -1);
  ctx.quadraticCurveTo(8, -1, 16, 4);
  ctx.quadraticCurveTo(18, 14, 2, 16);
  ctx.quadraticCurveTo(-14, 16, -16, 2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Body Plumage highlight
  ctx.fillStyle = '#FFF59D';
  ctx.beginPath();
  ctx.ellipse(-2, 5, 9, 6, -0.1, 0, Math.PI * 2);
  ctx.fill();

  // 3. Duck Wing
  ctx.save();
  ctx.translate(-4, 4);
  ctx.rotate(wingAngle);
  ctx.fillStyle = '#FFCA28';
  ctx.strokeStyle = '#E65100';
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.ellipse(0, 0, 11, 7, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // 4. Duck Head & Neck
  ctx.save();
  ctx.translate(8, -8 + headPeckY);

  // Head circle
  ctx.fillStyle = '#FFD54F';
  ctx.strokeStyle = '#E65100';
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  ctx.arc(0, 0, 13.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Feather Tuft or Mama flower
  if (tuft) {
    ctx.fillStyle = '#FF4081';
    ctx.beginPath();
    ctx.arc(-2, -15, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFEB3B';
    ctx.beginPath();
    ctx.arc(-2, -15, 1.8, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Cute single feather crest
    ctx.strokeStyle = '#E65100';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(-2, -13);
    ctx.quadraticCurveTo(-4, -18, -1, -19);
    ctx.stroke();
  }

  // Rosy Cheek
  ctx.fillStyle = 'rgba(255, 138, 128, 0.65)';
  ctx.beginPath();
  ctx.arc(-1, 3, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // Duck Beak (rounded, cute duck bill)
  ctx.fillStyle = '#FF9800';
  ctx.strokeStyle = '#BF360C';
  ctx.lineWidth = 2.4;

  const beakOpen = isQuack ? 5 : (peck > 0 ? 3 : 0);
  ctx.beginPath();
  ctx.moveTo(8, -3);
  ctx.quadraticCurveTo(18, -5, 20, -1);
  ctx.quadraticCurveTo(16, 2, 8, 3);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  if (beakOpen > 0) {
    // Lower beak bill
    ctx.beginPath();
    ctx.moveTo(8, 2);
    ctx.quadraticCurveTo(16, 2 + beakOpen, 18, 5 + beakOpen);
    ctx.quadraticCurveTo(12, 6 + beakOpen, 8, 4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // Eye
  if (eyeBlink) {
    ctx.strokeStyle = '#212121';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(1, -4);
    ctx.lineTo(6, -4);
    ctx.stroke();
  } else if (isHappy) {
    // Joyful arc eye
    ctx.strokeStyle = '#212121';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(3.5, -3, 3, Math.PI, Math.PI * 2);
    ctx.stroke();
  } else {
    ctx.fillStyle = '#212121';
    ctx.beginPath();
    ctx.arc(3.5, -4, 2.6, 0, Math.PI * 2);
    ctx.fill();
    // Eye shine dot
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(4.5, -5, 0.9, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore(); // Head
  ctx.restore(); // Duck
}

export const renderYellowDuck = drawYellowDuck;
