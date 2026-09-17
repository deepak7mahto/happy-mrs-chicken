/**
 * Mode 16: Picnic Ducks Procedural Canvas Scenery & Food Renderer
 * Adventures of Trishu Mini-Game Suite
 * Strictly under 300 Lines of Code
 */

import { DuckEntity, PicnicFoodEntity } from '../../types/game';
import { drawYellowDuck } from '../../graphics/characters/duckRenderer';

export function renderPicnicEnvironment(
  ctx: CanvasRenderingContext2D,
  vWidth: number,
  vHeight: number,
  isPortrait: boolean,
  frogTongueTimer: number = 0
): void {
  // Sky Gradient
  const skyGrad = ctx.createLinearGradient(0, 0, 0, vHeight * 0.6);
  skyGrad.addColorStop(0, '#64C8FA');
  skyGrad.addColorStop(1, '#B3E5FC');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, vWidth, vHeight);

  // Sun
  ctx.fillStyle = '#FFEE58';
  ctx.beginPath();
  ctx.arc(isPortrait ? vWidth - 60 : vWidth - 100, 70, 36, 0, Math.PI * 2);
  ctx.fill();

  // Clouds
  ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
  const clouds = [{ x: 80, y: 80 }, { x: vWidth * 0.5, y: 55 }, { x: vWidth - 120, y: 110 }];
  for (const c of clouds) {
    ctx.beginPath();
    ctx.arc(c.x, c.y, 20, 0, Math.PI * 2);
    ctx.arc(c.x + 18, c.y - 8, 24, 0, Math.PI * 2);
    ctx.arc(c.x + 36, c.y, 18, 0, Math.PI * 2);
    ctx.fill();
  }

  // Rolling Green Hills
  const hillY = isPortrait ? vHeight * 0.46 : vHeight * 0.44;
  ctx.fillStyle = '#81C784';
  ctx.beginPath();
  ctx.moveTo(0, hillY);
  ctx.bezierCurveTo(vWidth * 0.35, hillY - 35, vWidth * 0.7, hillY + 25, vWidth, hillY - 15);
  ctx.lineTo(vWidth, vHeight);
  ctx.lineTo(0, vHeight);
  ctx.closePath();
  ctx.fill();

  // Foreground Lush Grass
  ctx.fillStyle = '#66BB6A';
  ctx.beginPath();
  ctx.moveTo(0, hillY + 40);
  ctx.bezierCurveTo(vWidth * 0.4, hillY + 15, vWidth * 0.75, hillY + 60, vWidth, hillY + 30);
  ctx.lineTo(vWidth, vHeight);
  ctx.lineTo(0, vHeight);
  ctx.closePath();
  ctx.fill();

  // Pond on upper-right edge
  const pondX = isPortrait ? vWidth - 40 : vWidth - 80;
  const pondY = hillY + 30;
  ctx.fillStyle = '#4FC3F7';
  ctx.strokeStyle = '#29B6F6';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(pondX, pondY, 70, 32, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Lily Pad & Friendly Frog
  const frogX = pondX - 20;
  const frogY = pondY + 5;
  ctx.fillStyle = '#43A047';
  ctx.beginPath();
  ctx.arc(frogX, frogY, 15, 0.3, Math.PI * 1.85);
  ctx.lineTo(frogX, frogY);
  ctx.closePath();
  ctx.fill();

  // Frog Body
  ctx.save();
  ctx.fillStyle = '#66BB6A';
  ctx.strokeStyle = '#2E7D32';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(frogX, frogY - 4, 11, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Frog Big Eyes
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(frogX - 5, frogY - 11, 4.5, 0, Math.PI * 2);
  ctx.arc(frogX + 5, frogY - 11, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(frogX - 5, frogY - 11, 2, 0, Math.PI * 2);
  ctx.arc(frogX + 5, frogY - 11, 2, 0, Math.PI * 2);
  ctx.fill();

  // Frog Smile
  ctx.strokeStyle = '#1B5E20';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(frogX, frogY - 4, 6, 0.2, Math.PI - 0.2);
  ctx.stroke();

  // Tongue Snap
  if (frogTongueTimer > 0) {
    ctx.strokeStyle = '#FF4081';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(frogX, frogY - 2);
    ctx.quadraticCurveTo(frogX - 25, frogY - 15, frogX - 45, frogY - 8);
    ctx.stroke();
    ctx.fillStyle = '#E91E63';
    ctx.beginPath();
    ctx.arc(frogX - 45, frogY - 8, 4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export function renderPicnicBlanketAndBasket(
  ctx: CanvasRenderingContext2D,
  blanketPos: { x: number; y: number },
  basketPos: { x: number; y: number },
  bW: number,
  bH: number,
  basketBounce: number,
  time: number,
  hasFood: boolean,
  isDancing: boolean
): void {
  // 1. Blanket
  ctx.save();
  ctx.translate(blanketPos.x, blanketPos.y);

  ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
  ctx.beginPath();
  ctx.ellipse(0, 10, bW * 0.52, bH * 0.52, 0, 0, Math.PI * 2);
  ctx.fill();

  // Gingham Tiles
  ctx.beginPath();
  ctx.rect(-bW / 2, -bH / 2, bW, bH);
  ctx.clip();
  const tileSize = 20;
  for (let r = -bH / 2; r < bH / 2; r += tileSize) {
    for (let c = -bW / 2; c < bW / 2; c += tileSize) {
      const isRed = ((Math.floor((r + bH / 2) / tileSize) + Math.floor((c + bW / 2) / tileSize)) % 2 === 0);
      ctx.fillStyle = isRed ? '#EF5350' : '#FFFFFF';
      ctx.fillRect(c, r, tileSize, tileSize);
    }
  }
  ctx.strokeStyle = '#D32F2F';
  ctx.lineWidth = 3;
  ctx.strokeRect(-bW / 2, -bH / 2, bW, bH);
  ctx.restore();

  // 2. Picnic Basket
  const bounceOffset = Math.sin(basketBounce * Math.PI) * 12;
  ctx.save();
  ctx.translate(basketPos.x, basketPos.y - bounceOffset);

  ctx.fillStyle = '#8D6E63';
  ctx.strokeStyle = '#5D4037';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.ellipse(0, 8, 26, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#D7CCC8';
  ctx.beginPath();
  ctx.ellipse(0, -2, 28, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = '#5D4037';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, -6, 20, Math.PI, 0);
  ctx.stroke();

  if (!hasFood && !isDancing) {
    const wobble = Math.sin(time * 5) * 3;
    ctx.fillStyle = '#FF9800';
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.5;
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.beginPath();
    ctx.roundRect(-42, -38 + wobble, 84, 20, 10);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('🧺 Tap Basket!', 0, -28 + wobble);
  }
  ctx.restore();
}

export function renderPicnicFoods(ctx: CanvasRenderingContext2D, foods: PicnicFoodEntity[]): void {
  for (const f of foods) {
    if (f.eaten) continue;
    // Ground Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
    ctx.beginPath();
    ctx.ellipse(f.x, f.groundY, 7, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Food Item
    ctx.save();
    ctx.translate(f.x, f.y - f.z);
    ctx.rotate(f.rotation);

    if (f.type === 'BREAD_CRUMB') {
      ctx.fillStyle = '#FFE082';
      ctx.strokeStyle = '#FFA000';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(-6, -5, 12, 10, 3);
      ctx.fill();
      ctx.stroke();
    } else if (f.type === 'GOLDEN_CRUST') {
      ctx.fillStyle = '#FFB74D';
      ctx.strokeStyle = '#E65100';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.ellipse(0, 0, 9, 6, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (f.type === 'STRAWBERRY') {
      ctx.fillStyle = '#E53935';
      ctx.beginPath();
      ctx.arc(0, 2, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#43A047';
      ctx.beginPath();
      ctx.arc(0, -5, 4, 0, Math.PI);
      ctx.fill();
    } else {
      ctx.fillStyle = '#F48FB1';
      ctx.strokeStyle = '#D81B60';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-7, 6);
      ctx.lineTo(7, 6);
      ctx.lineTo(0, -8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }
}

export function renderPicnicDucks(
  ctx: CanvasRenderingContext2D,
  ducks: DuckEntity[],
  isDancing: boolean
): void {
  const sortedDucks = [...ducks].sort((a, b) => a.y - b.y);
  for (const d of sortedDucks) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.16)';
    ctx.beginPath();
    ctx.ellipse(d.x, d.y + 18, 16 * d.scale, 7 * d.scale, 0, 0, Math.PI * 2);
    ctx.fill();

    const danceHop = isDancing ? -Math.abs(Math.sin(d.dancePhase)) * 26 : 0;
    const danceRot = isDancing ? d.danceSpin : 0;

    drawYellowDuck(ctx, d.x, d.y + danceHop, d.scale, {
      walkCycle: d.walkCycle,
      facingLeft: d.facingLeft,
      peckTimer: d.peckTimer,
      wiggleTimer: d.wiggleTimer,
      rotation: danceRot,
      featherTuft: d.featherTuft,
      isQuacking: d.quackTimer < 0.25 || isDancing,
      isHappy: d.isHappy
    });

    if (!isDancing) {
      const meterY = d.y - 38 * d.scale;
      for (let dot = 0; dot < d.maxHunger; dot++) {
        const dotX = d.x - 14 + dot * 14;
        const isFilled = dot < d.hunger;
        ctx.fillStyle = isFilled ? '#FFB300' : 'rgba(255, 255, 255, 0.7)';
        ctx.strokeStyle = '#E65100';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(dotX, meterY, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    }
  }
}
