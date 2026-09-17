/**
 * Menu Card Grid Renderer
 * Adventures of Trishu Mini-Game Suite
 * Modernized with Fredoka Typography & Responsive Mobile Pill Badges
 * Strictly under 500 Lines of Code
 */

import { DisplayManager } from '../../engine/DisplayManager';
import { GameEngine } from '../../engine/GameEngine';
import { ModeCardDef } from '../../types/game';
import { MENU_CARDS, renderMenuCharacterPreview } from './menuData';
import { FONTS } from '../../graphics/typography';

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
  const topPad = isPortrait ? 62 : 54;

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

    // Modern card background soft drop shadow
    ctx.shadowColor = 'rgba(26, 35, 126, 0.12)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 4;

    ctx.fillStyle = card.color;
    ctx.strokeStyle = info ? info.borderColor : '#BDBDBD';
    ctx.lineWidth = 3.5;

    ctx.beginPath();
    ctx.roundRect(-card.w / 2, -card.h / 2, card.w, card.h, 20);
    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.stroke();

    if (isPortrait) {
      // --- 2-COLUMN PORTRAIT (MOBILE) LAYOUT ---
      // Left Center: Character Vector Preview (scale and centered vertically)
      const previewX = -card.w * 0.28;
      const previewSize = Math.min(card.w * 0.44, card.h * 0.72);
      renderMenuCharacterPreview(ctx, card.id, previewX, 2, previewSize, time);

      // Dynamic right side bounds
      const rightStartX = -card.w * 0.05;
      const rightEndX = card.w / 2 - 12;
      const rightWidth = rightEndX - rightStartX;

      // Right Top: Category Badge & Best Score Badge
      const badgeY = -card.h / 2 + 18;

      // Category Pill
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.beginPath();
      ctx.roundRect(rightStartX, badgeY - 9, 54, 18, 9);
      ctx.fill();

      ctx.font = FONTS.BADGE;
      ctx.fillStyle = '#37474F';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(card.badge, rightStartX + 27, badgeY);

      // Best Score Pill
      const scorePillW = 56;
      const scorePillX = rightEndX - scorePillW;
      ctx.fillStyle = '#E53935';
      ctx.strokeStyle = '#B71C1C';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.roundRect(scorePillX, badgeY - 9, scorePillW, 18, 9);
      ctx.fill();
      ctx.stroke();

      ctx.font = FONTS.SCORE_BADGE;
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`★ ${bestScore}`, scorePillX + scorePillW / 2, badgeY);

      // Right Center: Title (modern crisp Fredoka)
      ctx.font = FONTS.TITLE_CARD;
      ctx.fillStyle = '#212121';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(card.title, rightStartX, -4, rightWidth);

      // Right Bottom: Subtitle
      ctx.font = FONTS.SUBTITLE;
      ctx.fillStyle = '#546E7A';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';

      if (ctx.measureText(card.sub).width <= rightWidth) {
        ctx.fillText(card.sub, rightStartX, 22);
      } else {
        const words = card.sub.split(' ');
        let line1 = '';
        let line2 = '';
        for (const w of words) {
          if (!line2 && (line1 ? line1 + ' ' + w : w).length <= 14) {
            line1 = line1 ? line1 + ' ' + w : w;
          } else {
            line2 = line2 ? line2 + ' ' + w : w;
          }
        }
        ctx.fillText(line1, rightStartX, 16, rightWidth);
        if (line2) {
          ctx.fillText(line2, rightStartX, 30, rightWidth);
        }
      }
    } else {
      // --- 4-COLUMN LANDSCAPE LAYOUT ---
      renderMenuCharacterPreview(ctx, card.id, -card.w * 0.28, 0, card.w * 0.55, time);

      // Badges
      const badgeY = -card.h / 2 + 15;
      
      // Category Badge
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.beginPath();
      ctx.roundRect(card.w / 2 - 122, badgeY - 9, 56, 18, 9);
      ctx.fill();
      ctx.font = FONTS.BADGE;
      ctx.fillStyle = '#37474F';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(card.badge, card.w / 2 - 94, badgeY);

      // Best Score Badge
      ctx.fillStyle = '#E53935';
      ctx.strokeStyle = '#B71C1C';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.roundRect(card.w / 2 - 60, badgeY - 9, 54, 18, 9);
      ctx.fill();
      ctx.stroke();
      ctx.font = FONTS.SCORE_BADGE;
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`★ ${bestScore}`, card.w / 2 - 33, badgeY);

      // Title & Subtitle
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = FONTS.TITLE_CARD_LANDSCAPE;
      ctx.fillStyle = '#212121';
      ctx.fillText(card.title, card.w * 0.16, -2, card.w * 0.6);

      ctx.font = FONTS.SUBTITLE_SMALL;
      ctx.fillStyle = '#546E7A';
      ctx.fillText(card.sub, card.w * 0.16, 20, card.w * 0.6);
    }

    // Focus Ring (Keyboard / Gamepad)
    if (i === focusedCardIndex) {
      ctx.save();
      ctx.strokeStyle = '#FFD54F';
      ctx.lineWidth = 4;
      ctx.shadowColor = 'rgba(255, 213, 79, 0.8)';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.roundRect(-card.w / 2 - 2, -card.h / 2 - 2, card.w + 4, card.h + 4, 20);
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  }

  ctx.restore();
  ctx.restore();
}
