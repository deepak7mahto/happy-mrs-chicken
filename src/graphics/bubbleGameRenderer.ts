/**
 * Bubble Game & Hopscotch Vector Renderers
 * Adventures of Trishu — Kids Mini-Game Suite
 */

import { BubbleEntity } from '../types/game';
import { drawBabyChick } from './characters/chickRenderer';
import { DisplayManager } from '../engine/DisplayManager';

export interface HopscotchTileDef {
  index: number;
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
}

export interface ParachutingChickDef {
  x: number;
  y: number;
  vx: number;
  vy: number;
  swayPhase: number;
  parachuteColor: string;
  landed: boolean;
  life: number;
}

export const CHALK_COLORS = [
  '#FF80AB', '#80D8FF', '#B388FF', '#FFD180', '#CCFF90',
  '#FFE57F', '#FF8A80', '#A7FFEB', '#EA80FC', '#FFD54F'
];

export function createHopscotchTiles(vWidth: number, vHeight: number, isPortrait: boolean): HopscotchTileDef[] {
  const tiles: HopscotchTileDef[] = [];
  const totalTiles = 10;
  if (isPortrait) {
    const startY = vHeight * 0.82, endY = vHeight * 0.28;
    const stepY = (startY - endY) / (totalTiles - 1);
    for (let i = 1; i <= totalTiles; i++) {
      const y = startY - (i - 1) * stepY;
      let x = vWidth * 0.5, w = 70, h = Math.min(50, stepY * 0.85);
      if (i === 4 || i === 7) { x = vWidth * 0.38; w = 62; }
      else if (i === 5 || i === 8) { x = vWidth * 0.62; w = 62; }
      tiles.push({ index: i, x, y, w, h, color: CHALK_COLORS[(i - 1) % CHALK_COLORS.length] });
    }
  } else {
    const startX = vWidth * 0.14, endX = vWidth * 0.72;
    const stepX = (endX - startX) / (totalTiles - 1);
    const baseGroundY = vHeight * 0.74;
    for (let i = 1; i <= totalTiles; i++) {
      const x = startX + (i - 1) * stepX;
      let y = baseGroundY, w = Math.min(64, stepX * 0.88), h = 58;
      if (i === 4 || i === 7) { y = baseGroundY - 24; h = 48; }
      else if (i === 5 || i === 8) { y = baseGroundY + 24; h = 48; }
      tiles.push({ index: i, x, y, w, h, color: CHALK_COLORS[(i - 1) % CHALK_COLORS.length] });
    }
  }
  return tiles;
}

export function drawChalkSquare(ctx: CanvasRenderingContext2D, tile: HopscotchTileDef): void {
  ctx.save();
  ctx.translate(tile.x, tile.y);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
  ctx.strokeStyle = tile.color;
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.roundRect(-tile.w / 2, -tile.h / 2, tile.w, tile.h, 6);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 22px "Comic Sans MS", cursive, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${tile.index}`, 0, 1);
  ctx.restore();
}

export function drawPicnicBlanket(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = '#E53935';
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(0, 10, 65, 30, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#8D6E63';
  ctx.beginPath();
  ctx.roundRect(-16, -10, 32, 22, 4);
  ctx.fill();
  ctx.fillStyle = '#FF4081';
  ctx.beginPath();
  ctx.arc(0, -10, 14, Math.PI, 0);
  ctx.fill();
  ctx.restore();
}

export function drawParachutingChick(ctx: CanvasRenderingContext2D, c: ParachutingChickDef): void {
  ctx.save();
  ctx.translate(c.x, c.y);
  ctx.fillStyle = c.parachuteColor;
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, -22, 20, Math.PI, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(-18, -22); ctx.lineTo(0, -4);
  ctx.moveTo(18, -22); ctx.lineTo(0, -4);
  ctx.stroke();

  drawBabyChick(ctx, 0, 4, 0.65, { hopY: 0, isPeeping: true });
  ctx.restore();
}

export function drawBubbleEntity(ctx: CanvasRenderingContext2D, b: BubbleEntity): void {
  ctx.save();
  ctx.translate(b.x, b.y);

  const grad = ctx.createRadialGradient(-b.radius * 0.3, -b.radius * 0.3, b.radius * 0.1, 0, 0, b.radius);
  if (b.type === 'STAR') {
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    grad.addColorStop(0.5, 'rgba(255, 215, 0, 0.45)');
    grad.addColorStop(1, 'rgba(255, 179, 0, 0.75)');
  } else if (b.type === 'CHICK') {
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    grad.addColorStop(0.5, 'rgba(255, 241, 118, 0.4)');
    grad.addColorStop(1, 'rgba(255, 138, 128, 0.7)');
  } else {
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.88)');
    grad.addColorStop(0.35, 'rgba(179, 136, 255, 0.35)');
    grad.addColorStop(0.7, 'rgba(100, 200, 250, 0.45)');
    grad.addColorStop(1, 'rgba(255, 128, 171, 0.68)');
  }

  ctx.fillStyle = grad;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.lineWidth = b.type === 'GIANT' ? 3.0 : 2.0;
  ctx.beginPath();
  ctx.arc(0, 0, b.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  if (b.type === 'CHICK') {
    drawBabyChick(ctx, 0, 2, 0.48, { hopY: 0, isPeeping: false });
  } else if (b.type === 'STAR') {
    ctx.fillStyle = '#FFEE58';
    ctx.font = `bold ${Math.floor(b.radius * 0.9)}px "Comic Sans MS", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⭐', 0, 0);
  }

  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(-b.radius * 0.35, -b.radius * 0.35, b.radius * 0.26, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawBubbleBlowerBtn(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = 'rgba(255, 64, 129, 0.9)';
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(0, 0, 26, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.font = '22px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🫧', 0, 1);
  ctx.restore();
}

export function drawBubbleGameHUD(
  ctx: CanvasRenderingContext2D,
  display: DisplayManager,
  bubblesPoppedCount: number,
  score: number,
  isCelebrating: boolean
): void {
  const isPortrait = display.isPortrait;
  const scoreX = display.vWidth / 2;
  const scoreY = isPortrait ? 76 : Math.max(18, display.vHeight * 0.035);
  const badgeW = isPortrait ? 310 : 290;
  const badgeH = 46;

  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.48)';
  ctx.beginPath();
  ctx.roundRect(scoreX - badgeW / 2, scoreY, badgeW, badgeH, 23);
  ctx.fill();
  ctx.strokeStyle = '#B388FF';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 19px "Comic Sans MS", cursive, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`🫧 Popped: ${bubblesPoppedCount}  |  Score: ${score}`, scoreX, scoreY + badgeH / 2);

  if (isCelebrating) {
    ctx.fillStyle = 'rgba(255, 64, 129, 0.95)';
    ctx.beginPath();
    ctx.roundRect(scoreX - 140, scoreY + 54, 280, 44, 22);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 22px "Comic Sans MS", cursive, sans-serif';
    ctx.fillText('🧺 Picnic Party! 🎉', scoreX, scoreY + 76);
  }
  ctx.restore();
}
