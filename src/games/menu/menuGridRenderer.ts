/**
 * Menu Card Grid Renderer
 * Adventures of Trishu Mini-Game Suite
 * Strictly under 500 Lines of Code
 */

import { DisplayManager } from '../../engine/DisplayManager';
import { GameEngine } from '../../engine/GameEngine';
import { ModeCardDef } from '../../types/game';
import { MENU_CARDS, renderMenuCharacterPreview } from './menuData';

export function renderMenuCardGrid(
  ctx: CanvasRenderingContext2D,
  cards: ModeCardDef[],
  scrollY: number,
  display: DisplayManager,
  game: GameEngine,
  time: number,
  focusedCardIndex: number
): void {
  const isPortrait = display.isPortrait;
  const vWidth = display.vWidth;
  const vHeight = display.vHeight;
  const topPad = isPortrait ? 60 : 54;

  ctx.save();
  ctx.beginPath();
  ctx.rect(0, topPad, vWidth, vHeight - topPad);
  ctx.clip();

  ctx.save();
  ctx.translate(0, scrollY);

  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    const cardTop = card.y - card.h / 2 + scrollY;
    const cardBottom = card.y + card.h / 2 + scrollY;
    if (cardBottom < topPad - 10 || cardTop > vHeight + 10) {
      continue;
    }

    const info = MENU_CARDS[i];
    const bestScore = game.storage.getHighScore(info ? info.scoreKey : card.id);

    ctx.save();
    ctx.translate(card.x, card.y);

    // Card background drop shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 4;

    ctx.fillStyle = card.color;
    ctx.strokeStyle = info ? info.borderColor : '#BDBDBD';
    ctx.lineWidth = 3.5;

    ctx.beginPath();
    ctx.roundRect(-card.w / 2, -card.h / 2, card.w, card.h, 16);
    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.stroke();

    if (isPortrait) {
      // --- 2-COLUMN PORTRAIT LAYOUT ---
      // Left Center: Character Vector Preview
      renderMenuCharacterPreview(ctx, card.id, -card.w * 0.26, 4, card.w * 0.46, time);

      // Right Top: Category Badge
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.beginPath();
      ctx.roundRect(-card.w / 2 + 108, -card.h / 2 + 10, 50, 18, 9);
      ctx.fill();
      ctx.font = 'bold 9.5px "Comic Sans MS", sans-serif';
      ctx.fillStyle = '#37474F';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(card.badge, -card.w / 2 + 133, -card.h / 2 + 19);

      // Right Top: Best Score Badge
      ctx.fillStyle = '#E53935';
      ctx.strokeStyle = '#B71C1C';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.roundRect(card.w / 2 - 62, -card.h / 2 + 10, 52, 18, 9);
      ctx.fill();
      ctx.stroke();
      ctx.font = 'bold 10px "Comic Sans MS", sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`★ ${bestScore}`, card.w / 2 - 36, -card.h / 2 + 19);

      // Right Center: Title
      ctx.font = 'bold 15px "Comic Sans MS", cursive, sans-serif';
      ctx.fillStyle = '#212121';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(card.title, -4, -6, card.w / 2 - 4);

      // Right Bottom: Subtitle
      ctx.font = 'bold 10px "Comic Sans MS", sans-serif';
      ctx.fillStyle = '#455A64';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      const rightWidth = card.w / 2 - 6;
      if (ctx.measureText(card.sub).width <= rightWidth) {
        ctx.fillText(card.sub, -4, 22);
      } else {
        const words = card.sub.split(' ');
        let line1 = '';
        let line2 = '';
        for (const w of words) {
          if (!line2 && (line1 ? line1 + ' ' + w : w).length <= 13) {
            line1 = line1 ? line1 + ' ' + w : w;
          } else {
            line2 = line2 ? line2 + ' ' + w : w;
          }
        }
        ctx.fillText(line1, -4, 16, rightWidth);
        if (line2) {
          ctx.fillText(line2, -4, 30, rightWidth);
        }
      }
    } else {
      // --- 4-COLUMN LANDSCAPE LAYOUT ---
      renderMenuCharacterPreview(ctx, card.id, -card.w * 0.28, 0, card.w * 0.55, time);

      // Category Badge
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.beginPath();
      ctx.roundRect(card.w / 2 - 115, -card.h / 2 + 5, 52, 17, 8);
      ctx.fill();
      ctx.font = 'bold 9.5px "Comic Sans MS", sans-serif';
      ctx.fillStyle = '#37474F';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(card.badge, card.w / 2 - 89, -card.h / 2 + 13.5);

      // Best Score Badge
      ctx.fillStyle = '#E53935';
      ctx.strokeStyle = '#B71C1C';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.roundRect(card.w / 2 - 58, -card.h / 2 + 5, 52, 17, 8);
      ctx.fill();
      ctx.stroke();
      ctx.font = 'bold 10px "Comic Sans MS", sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`★ ${bestScore}`, card.w / 2 - 32, -card.h / 2 + 13.5);

      // Title & Subtitle
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = 'bold 13.5px "Comic Sans MS", cursive, sans-serif';
      ctx.fillStyle = '#212121';
      ctx.fillText(card.title, card.w * 0.16, 0);

      ctx.font = 'bold 10px "Comic Sans MS", sans-serif';
      ctx.fillStyle = '#455A64';
      ctx.fillText(card.sub, card.w * 0.16, 20);
    }

    // Focus Ring
    if (i === focusedCardIndex) {
      ctx.save();
      ctx.strokeStyle = '#FFD54F';
      ctx.lineWidth = 4;
      ctx.shadowColor = 'rgba(255, 213, 79, 0.8)';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.roundRect(-card.w / 2 - 2, -card.h / 2 - 2, card.w + 4, card.h + 4, 16);
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  }

  ctx.restore();
  ctx.restore();
}
