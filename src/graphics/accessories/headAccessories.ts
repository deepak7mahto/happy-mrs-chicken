/**
 * Headwear Vector Accessories
 * Adventures of Trishu Preschool Suite
 * Strictly under 500 lines (T4.02)
 */

export function drawPartyCone(ctx: CanvasRenderingContext2D, time: number = 0): void {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(-16, 0);
  ctx.quadraticCurveTo(0, 4, 16, 0);
  ctx.lineTo(0, -38);
  ctx.closePath();

  ctx.fillStyle = '#FF4081'; // Bright magenta
  ctx.fill();
  ctx.strokeStyle = '#2c3e50';
  ctx.lineWidth = 2.5;
  ctx.lineJoin = 'round';
  ctx.stroke();

  // Stripes
  ctx.save();
  ctx.clip();
  ctx.fillStyle = '#FFEB3B';
  ctx.beginPath();
  ctx.moveTo(-20, -10); ctx.lineTo(20, -20); ctx.lineTo(20, -14); ctx.lineTo(-20, -4);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#00E5FF';
  ctx.beginPath();
  ctx.moveTo(-20, -22); ctx.lineTo(20, -32); ctx.lineTo(20, -26); ctx.lineTo(-20, -16);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  ctx.stroke();

  // Pom-pom
  const wobble = Math.sin(time * 6) * 1.5;
  ctx.beginPath();
  ctx.arc(0, -40 + wobble, 6.5, 0, Math.PI * 2);
  ctx.fillStyle = '#FFD600';
  ctx.fill();
  ctx.strokeStyle = '#2c3e50';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(-2, -42 + wobble, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawFlowerWreath(ctx: CanvasRenderingContext2D): void {
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(0, 2, 22, 9, 0, Math.PI, Math.PI * 2);
  ctx.strokeStyle = '#4CAF50';
  ctx.lineWidth = 4;
  ctx.stroke();

  const leafAngles = [-0.85, -0.5, 0, 0.5, 0.85];
  for (const angle of leafAngles) {
    const lx = Math.sin(angle) * 21;
    const ly = -Math.cos(angle) * 7 + 2;
    ctx.beginPath();
    ctx.ellipse(lx, ly, 4, 2, angle, 0, Math.PI * 2);
    ctx.fillStyle = '#81C784';
    ctx.fill();
    ctx.strokeStyle = '#388E3C';
    ctx.lineWidth = 1.2;
    ctx.stroke();
  }

  const blossoms = [
    { x: -18, y: 1, c: '#FF80AB', s: 4.5 },
    { x: -9, y: -4, c: '#FFF59D', s: 5.5 },
    { x: 0, y: -6, c: '#EA80FC', s: 6 },
    { x: 9, y: -4, c: '#80D8FF', s: 5.5 },
    { x: 18, y: 1, c: '#FF8A80', s: 4.5 }
  ];

  for (const b of blossoms) {
    for (let p = 0; p < 5; p++) {
      const a = (p / 5) * Math.PI * 2;
      const px = b.x + Math.cos(a) * (b.s * 0.7);
      const py = b.y + Math.sin(a) * (b.s * 0.7);
      ctx.beginPath();
      ctx.arc(px, py, b.s * 0.45, 0, Math.PI * 2);
      ctx.fillStyle = b.c;
      ctx.fill();
    }
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.s * 0.35, 0, Math.PI * 2);
    ctx.fillStyle = '#FFD54F';
    ctx.fill();
    ctx.strokeStyle = '#2c3e50';
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  ctx.restore();
}

export function drawChefHat(ctx: CanvasRenderingContext2D): void {
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(-18, -6, 36, 9, 3);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.strokeStyle = '#2c3e50';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(-10, -5); ctx.lineTo(-10, 2);
  ctx.moveTo(0, -5); ctx.lineTo(0, 2);
  ctx.moveTo(10, -5); ctx.lineTo(10, 2);
  ctx.strokeStyle = '#CFD8DC';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(-16, -6);
  ctx.quadraticCurveTo(-26, -18, -18, -26);
  ctx.quadraticCurveTo(-20, -40, -6, -38);
  ctx.quadraticCurveTo(0, -46, 6, -38);
  ctx.quadraticCurveTo(20, -40, 18, -26);
  ctx.quadraticCurveTo(26, -18, 16, -6);
  ctx.closePath();

  ctx.fillStyle = '#FAFAFA';
  ctx.fill();
  ctx.strokeStyle = '#2c3e50';
  ctx.lineWidth = 2.5;
  ctx.lineJoin = 'round';
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(-6, -36); ctx.quadraticCurveTo(-5, -20, -6, -6);
  ctx.moveTo(6, -36); ctx.quadraticCurveTo(5, -20, 6, -6);
  ctx.strokeStyle = '#ECEFF1';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
}

export function drawPirateHat(ctx: CanvasRenderingContext2D): void {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(-28, -6);
  ctx.quadraticCurveTo(-18, -28, 0, -22);
  ctx.quadraticCurveTo(18, -28, 28, -6);
  ctx.quadraticCurveTo(14, 2, 0, 0);
  ctx.quadraticCurveTo(-14, 2, -28, -6);
  ctx.closePath();

  ctx.fillStyle = '#263238';
  ctx.fill();
  ctx.strokeStyle = '#2c3e50';
  ctx.lineWidth = 2.5;
  ctx.lineJoin = 'round';
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(-28, -6);
  ctx.quadraticCurveTo(-18, -28, 0, -22);
  ctx.quadraticCurveTo(18, -28, 28, -6);
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(0, -11, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.roundRect(-2.5, -9, 5, 4, 1);
  ctx.fill();

  ctx.fillStyle = '#263238';
  ctx.beginPath();
  ctx.arc(-1.5, -11.5, 1, 0, Math.PI * 2);
  ctx.arc(1.5, -11.5, 1, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(-4, -6); ctx.lineTo(4, -14);
  ctx.moveTo(4, -6); ctx.lineTo(-4, -14);
  ctx.stroke();
  ctx.restore();
}

export function drawSunHat(ctx: CanvasRenderingContext2D): void {
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(0, 1, 28, 9, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#FFE082';
  ctx.fill();
  ctx.strokeStyle = '#FFA000';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(0, -7, 16, 11, 0, Math.PI, Math.PI * 2);
  ctx.closePath();
  ctx.fillStyle = '#FFD54F';
  ctx.fill();
  ctx.strokeStyle = '#FFA000';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(0, -4, 16.5, 5, 0, 0, Math.PI);
  ctx.strokeStyle = '#FF5252';
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.fillStyle = '#FF5252';
  ctx.beginPath();
  ctx.arc(14, -4, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(14, -4);
  ctx.lineTo(21, -1);
  ctx.lineTo(19, 5);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export function drawCrown(ctx: CanvasRenderingContext2D): void {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(-18, 0);
  ctx.lineTo(-20, -18);
  ctx.lineTo(-10, -10);
  ctx.lineTo(-6, -24);
  ctx.lineTo(0, -12);
  ctx.lineTo(0, -28);
  ctx.lineTo(0, -12);
  ctx.lineTo(6, -24);
  ctx.lineTo(10, -10);
  ctx.lineTo(20, -18);
  ctx.lineTo(18, 0);
  ctx.closePath();

  ctx.fillStyle = '#FFD700';
  ctx.fill();
  ctx.strokeStyle = '#E65100';
  ctx.lineWidth = 2.5;
  ctx.lineJoin = 'round';
  ctx.stroke();

  ctx.beginPath();
  ctx.roundRect(-18, -3, 36, 6, 2);
  ctx.fillStyle = '#FFC107';
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(0, -18, 3.5, 0, Math.PI * 2);
  ctx.fillStyle = '#FF1744';
  ctx.fill();
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(-11, -7, 2.5, 0, Math.PI * 2);
  ctx.fillStyle = '#00E676';
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(11, -7, 2.5, 0, Math.PI * 2);
  ctx.fillStyle = '#2979FF';
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}
