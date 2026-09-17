/**
 * Avatar Particle Aura & Magic Effects Renderer
 * Adventures of Trishu Preschool Suite
 * Strictly under 500 lines (T4.02)
 */

export type AuraType = 'sparkle' | 'rainbow' | 'stars' | 'hearts' | 'bubbles';

export function renderAvatarAura(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number = 40,
  auraType: AuraType = 'sparkle',
  time: number = 0
): void {
  ctx.save();

  if (auraType === 'rainbow') {
    // Shimmering rainbow circular halo
    const numBands = 4;
    const bandColors = ['#FF8A80', '#FFD54F', '#81C784', '#80D8FF'];
    for (let b = 0; b < numBands; b++) {
      const r = radius + 6 + b * 4.5 + Math.sin(time * 3 + b) * 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = bandColors[b];
      ctx.lineWidth = 3.5;
      ctx.globalAlpha = 0.45 + Math.sin(time * 2 + b) * 0.2;
      ctx.stroke();
    }
  } else if (auraType === 'stars') {
    // Twinkling golden stars floating around character
    const numStars = 6;
    for (let i = 0; i < numStars; i++) {
      const angle = (i / numStars) * Math.PI * 2 + time * 1.2;
      const orbitR = radius + 10 + Math.sin(time * 3 + i) * 6;
      const sx = cx + Math.cos(angle) * orbitR;
      const sy = cy + Math.sin(angle) * (orbitR * 0.8) - 4;
      const starScale = 0.8 + Math.sin(time * 5 + i * 2) * 0.3;

      ctx.save();
      ctx.translate(sx, sy);
      ctx.scale(starScale, starScale);
      ctx.globalAlpha = 0.75 + Math.sin(time * 4 + i) * 0.25;

      // 4-pointed sparkle star
      ctx.beginPath();
      ctx.moveTo(0, -6);
      ctx.quadraticCurveTo(0, 0, 6, 0);
      ctx.quadraticCurveTo(0, 0, 0, 6);
      ctx.quadraticCurveTo(0, 0, -6, 0);
      ctx.quadraticCurveTo(0, 0, 0, -6);
      ctx.closePath();
      ctx.fillStyle = '#FFD700';
      ctx.fill();

      // Bright center core
      ctx.beginPath();
      ctx.arc(0, 0, 1.8, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.restore();
    }
  } else if (auraType === 'hearts') {
    // Floating gentle pink hearts
    const numHearts = 5;
    for (let i = 0; i < numHearts; i++) {
      const tOffset = (time * 0.8 + (i / numHearts)) % 1;
      const hx = cx + Math.sin(i * 1.7 + time) * (radius * 0.9);
      const hy = cy + radius * 0.5 - tOffset * (radius * 1.3);
      const hScale = (1 - Math.abs(tOffset - 0.5) * 1.5) * 0.9;

      if (hScale > 0.1) {
        ctx.save();
        ctx.translate(hx, hy);
        ctx.scale(hScale, hScale);
        ctx.globalAlpha = Math.min(1, Math.sin(tOffset * Math.PI) * 0.85);

        ctx.beginPath();
        ctx.moveTo(0, 3);
        ctx.bezierCurveTo(-5, -3, -7, -7, 0, -10);
        ctx.bezierCurveTo(7, -7, 5, -3, 0, 3);
        ctx.fillStyle = '#FF4081';
        ctx.fill();
        ctx.restore();
      }
    }
  } else if (auraType === 'bubbles') {
    // Iridescent floating mini bubbles
    const numBubbles = 6;
    for (let i = 0; i < numBubbles; i++) {
      const tOffset = (time * 0.6 + (i / numBubbles)) % 1;
      const bx = cx + Math.cos(i * 2.1 + time) * (radius * 0.95);
      const by = cy + radius * 0.6 - tOffset * (radius * 1.4);
      const bRad = 4 + (i % 3) * 2;
      const alpha = Math.sin(tOffset * Math.PI) * 0.65;

      ctx.save();
      ctx.beginPath();
      ctx.arc(bx, by, bRad, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(178, 235, 242, 0.4)';
      ctx.fill();
      ctx.strokeStyle = `rgba(0, 188, 212, ${alpha})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Gloss highlight
      ctx.beginPath();
      ctx.arc(bx - bRad * 0.35, by - bRad * 0.35, bRad * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha + 0.2})`;
      ctx.fill();
      ctx.restore();
    }
  } else {
    // Default 'sparkle'
    const numSparkles = 6;
    for (let i = 0; i < numSparkles; i++) {
      const angle = (i / numSparkles) * Math.PI * 2 + time * 1.5;
      const dist = radius + Math.sin(time * 4 + i) * 6;
      const sx = cx + Math.cos(angle) * dist;
      const sy = cy + Math.sin(angle) * dist;
      const pulse = 0.5 + Math.sin(time * 6 + i * 1.8) * 0.5;

      ctx.beginPath();
      ctx.arc(sx, sy, 2 + pulse * 2.5, 0, Math.PI * 2);
      ctx.fillStyle = i % 2 === 0 ? '#FFE082' : '#80D8FF';
      ctx.globalAlpha = 0.4 + pulse * 0.5;
      ctx.fill();
    }
  }

  ctx.restore();
}
