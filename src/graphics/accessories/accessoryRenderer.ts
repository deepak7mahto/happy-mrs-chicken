/**
 * Procedural Vector Accessory Renderer
 * Adventures of Trishu Preschool Suite
 * Strictly under 500 lines (T4.02)
 */

import { CharacterId } from '../../types/characters';
import { AccessoryId, AccessorySlot, CHARACTER_ANCHORS } from '../../types/accessories';
import {
  drawPartyCone,
  drawFlowerWreath,
  drawChefHat,
  drawPirateHat,
  drawSunHat,
  drawCrown
} from './headAccessories';

export {
  drawPartyCone,
  drawFlowerWreath,
  drawChefHat,
  drawPirateHat,
  drawSunHat,
  drawCrown
};

// --- HELPER DRAWING PRIMITIVES ---

function drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number): void {
  let rot = (Math.PI / 2) * 3;
  const step = Math.PI / spikes;
  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);
  for (let i = 0; i < spikes; i++) {
    let x = cx + Math.cos(rot) * outerRadius;
    let y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;
    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
}

// --- FACEWEAR ACCESSORIES ---

export function drawSparkleGlasses(ctx: CanvasRenderingContext2D): void {
  ctx.save();
  ctx.fillStyle = 'rgba(233, 30, 99, 0.7)';
  ctx.strokeStyle = '#FF4081';
  ctx.lineWidth = 2.5;

  drawStar(ctx, -13, 0, 5, 11, 5);
  ctx.fill();
  ctx.stroke();

  drawStar(ctx, 13, 0, 5, 11, 5);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(-4, 0);
  ctx.quadraticCurveTo(0, -3, 4, 0);
  ctx.strokeStyle = '#FF4081';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(-15, -4, 1.8, 0, Math.PI * 2);
  ctx.arc(11, -4, 1.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawBubbleGoggles(ctx: CanvasRenderingContext2D): void {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(-24, 0);
  ctx.lineTo(24, 0);
  ctx.strokeStyle = '#0097A7';
  ctx.lineWidth = 3;
  ctx.stroke();

  const cups = [-12, 12];
  for (const cx of cups) {
    ctx.beginPath();
    ctx.roundRect(cx - 10, -8, 20, 16, 8);
    ctx.fillStyle = 'rgba(128, 222, 234, 0.6)';
    ctx.fill();
    ctx.strokeStyle = '#00ACC1';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx - 2, -1, 5, -Math.PI * 0.8, -Math.PI * 0.2);
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.stroke();
  }

  ctx.beginPath();
  ctx.moveTo(-2, 0);
  ctx.lineTo(2, 0);
  ctx.strokeStyle = '#00838F';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.restore();
}

// --- BACK ACCESSORIES ---

export function drawSuperCape(ctx: CanvasRenderingContext2D, time: number = 0): void {
  ctx.save();
  const flutter = Math.sin(time * 5) * 5;
  const flutter2 = Math.cos(time * 4) * 4;

  ctx.beginPath();
  ctx.moveTo(-16, -10);
  ctx.quadraticCurveTo(-26 + flutter, 20, -28 + flutter2, 44);
  ctx.quadraticCurveTo(-10, 48, 0, 43);
  ctx.quadraticCurveTo(10, 48, 28 - flutter2, 44);
  ctx.quadraticCurveTo(26 - flutter, 20, 16, -10);
  ctx.closePath();

  ctx.fillStyle = '#E53935';
  ctx.fill();
  ctx.strokeStyle = '#B71C1C';
  ctx.lineWidth = 2.5;
  ctx.lineJoin = 'round';
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(-13, -8, 3.5, 0, Math.PI * 2);
  ctx.arc(13, -8, 3.5, 0, Math.PI * 2);
  ctx.fillStyle = '#FFD700';
  ctx.fill();
  ctx.strokeStyle = '#2c3e50';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();
}

// --- FEET ACCESSORIES ---

export function drawGoldenWellies(ctx: CanvasRenderingContext2D): void {
  ctx.save();
  const boots = [
    { x: -14, dir: -1 },
    { x: 14, dir: 1 }
  ];

  for (const b of boots) {
    ctx.save();
    ctx.translate(b.x, 0);
    ctx.beginPath();
    ctx.moveTo(-5 * b.dir, -10);
    ctx.lineTo(-5 * b.dir, 4);
    ctx.quadraticCurveTo(-8 * b.dir, 6, -10 * b.dir, 8);
    ctx.lineTo(8 * b.dir, 8);
    ctx.quadraticCurveTo(10 * b.dir, 5, 8 * b.dir, 2);
    ctx.lineTo(4 * b.dir, 0);
    ctx.lineTo(4 * b.dir, -10);
    ctx.closePath();

    ctx.fillStyle = '#FFEB3B';
    ctx.fill();
    ctx.strokeStyle = '#F57F17';
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-10 * b.dir, 7);
    ctx.lineTo(8 * b.dir, 7);
    ctx.strokeStyle = '#E65100';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(3 * b.dir, -6);
    ctx.lineTo(5 * b.dir, 2);
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}

// --- DISPATCHER MAPPINGS ---

export const ACCESSORY_DRAW_FUNCS: Record<AccessoryId, (ctx: CanvasRenderingContext2D, time: number) => void> = {
  none: () => {},
  partyCone: (ctx, t) => drawPartyCone(ctx, t),
  flowerWreath: (ctx) => drawFlowerWreath(ctx),
  chefHat: (ctx) => drawChefHat(ctx),
  pirateHat: (ctx) => drawPirateHat(ctx),
  sunHat: (ctx) => drawSunHat(ctx),
  crown: (ctx) => drawCrown(ctx),
  sparkleGlasses: (ctx) => drawSparkleGlasses(ctx),
  bubbleGoggles: (ctx) => drawBubbleGoggles(ctx),
  superCape: (ctx, t) => drawSuperCape(ctx, t),
  goldenWellies: (ctx) => drawGoldenWellies(ctx)
};

/**
 * Render background-layer accessories (e.g. superhero cape)
 */
export function renderBackAccessories(
  ctx: CanvasRenderingContext2D,
  characterId: CharacterId,
  equipped?: Partial<Record<AccessorySlot, AccessoryId>>,
  time: number = 0
): void {
  if (!equipped) return;
  const backId = equipped.back;
  if (!backId || backId === 'none') return;

  const anchors = CHARACTER_ANCHORS[characterId] || CHARACTER_ANCHORS.peppa;
  const backAnchor = anchors.back;
  const drawFunc = ACCESSORY_DRAW_FUNCS[backId];
  if (!drawFunc) return;

  ctx.save();
  ctx.translate(backAnchor.x, backAnchor.y);
  ctx.scale(backAnchor.scale, backAnchor.scale);
  drawFunc(ctx, time);
  ctx.restore();
}

/**
 * Render foreground-layer accessories (headwear, glasses, shoes)
 */
export function renderFrontAccessories(
  ctx: CanvasRenderingContext2D,
  characterId: CharacterId,
  equipped?: Partial<Record<AccessorySlot, AccessoryId>>,
  time: number = 0
): void {
  if (!equipped) return;
  const anchors = CHARACTER_ANCHORS[characterId] || CHARACTER_ANCHORS.peppa;

  // 1. Feet
  const feetId = equipped.feet;
  if (feetId && feetId !== 'none' && ACCESSORY_DRAW_FUNCS[feetId]) {
    ctx.save();
    ctx.translate(anchors.feet.x, anchors.feet.y);
    ctx.scale(anchors.feet.scale, anchors.feet.scale);
    ACCESSORY_DRAW_FUNCS[feetId](ctx, time);
    ctx.restore();
  }

  // 2. Face
  const faceId = equipped.face;
  if (faceId && faceId !== 'none' && ACCESSORY_DRAW_FUNCS[faceId]) {
    ctx.save();
    ctx.translate(anchors.face.x, anchors.face.y);
    ctx.scale(anchors.face.scale, anchors.face.scale);
    ACCESSORY_DRAW_FUNCS[faceId](ctx, time);
    ctx.restore();
  }

  // 3. Head
  const headId = equipped.head;
  if (headId && headId !== 'none' && ACCESSORY_DRAW_FUNCS[headId]) {
    ctx.save();
    ctx.translate(anchors.head.x, anchors.head.y);
    ctx.scale(anchors.head.scale, anchors.head.scale);
    if (anchors.head.rotation) {
      ctx.rotate(anchors.head.rotation);
    }
    ACCESSORY_DRAW_FUNCS[headId](ctx, time);
    ctx.restore();
  }
}

/**
 * Helper to render an isolated accessory for modal / inventory icon previews
 */
export function renderAccessoryIcon(
  ctx: CanvasRenderingContext2D,
  accessoryId: AccessoryId,
  x: number,
  y: number,
  scale: number = 1.0,
  time: number = 0
): void {
  const drawFunc = ACCESSORY_DRAW_FUNCS[accessoryId];
  if (!drawFunc || accessoryId === 'none') return;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  drawFunc(ctx, time);
  ctx.restore();
}
