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

    // 1. Tactile 3D bottom edge (chunky bevel depth)
    const bevelColor = info ? info.borderColor : '#BDBDBD';
    ctx.fillStyle = bevelColor;
    ctx.beginPath();
    ctx.roundRect(-card.w / 2, -card.h / 2 + 5, card.w, card.h, 20);
    ctx.fill();

    // 2. Card surface with soft vertical gradient for depth
    const cardGrad = ctx.createLinearGradient(0, -card.h / 2, 0, card.h / 2);
    cardGrad.addColorStop(0, '#FFFFFF');
    cardGrad.addColorStop(0.18, card.color);
    cardGrad.addColorStop(1, card.color);
    ctx.fillStyle = cardGrad;
    ctx.strokeStyle = bevelColor;
    ctx.lineWidth = 3.5;

    ctx.beginPath();
    ctx.roundRect(-card.w / 2, -card.h / 2, card.w, card.h, 20);
    ctx.fill();
    ctx.stroke();

    // 3. Inner gloss top highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.beginPath();
    ctx.roundRect(-card.w / 2 + 5, -card.h / 2 + 5, card.w - 10, (card.h - 10) * 0.38, [15, 15, 6, 6]);
    ctx.fill();

    if (isPortrait) {
      // --- 2-COLUMN PORTRAIT (MOBILE) LAYOUT ---
      // Left Center: Character Vector Preview (scaled and centered vertically)
      const previewX = -card.w * 0.28;
      const previewSize = Math.min(card.w * 0.44, card.h * 0.72);
      renderMenuCharacterPreview(ctx, card.id, previewX, 2, previewSize, time);

      // Dynamic right side bounds
      const rightStartX = -card.w * 0.05;
      const rightEndX = card.w / 2 - 10;
      const rightWidth = rightEndX - rightStartX;

      // Right Top: Category Badge & Best Score Badge
      const badgeY = -card.h / 2 + 18;

      // Category Pill
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.beginPath();
      ctx.roundRect(rightStartX, badgeY - 10, 56, 20, 10);
      ctx.fill();

      ctx.font = FONTS.BADGE;
      ctx.fillStyle = '#263238';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(card.badge, rightStartX + 28, badgeY);

      // Best Score Pill (Warm Golden Star Achievement Badge)
      const scorePillW = 58;
      const scorePillX = rightEndX - scorePillW;
      ctx.fillStyle = '#FFA000';
      ctx.strokeStyle = '#FF6F00';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.roundRect(scorePillX, badgeY - 10, scorePillW, 20, 10);
      ctx.fill();
      ctx.stroke();

      ctx.font = FONTS.SCORE_BADGE;
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`★ ${bestScore}`, scorePillX + scorePillW / 2, badgeY);

      // Right Center: Title (modern crisp Fredoka)
      ctx.font = FONTS.TITLE_CARD;
      ctx.fillStyle = '#1A237E';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(card.title, rightStartX, -4, rightWidth);

      // Right Bottom: Subtitle
      ctx.font = FONTS.SUBTITLE;
      ctx.fillStyle = '#455A64';
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
      ctx.roundRect(card.w / 2 - 128, badgeY - 10, 58, 20, 10);
      ctx.fill();
      ctx.font = FONTS.BADGE;
      ctx.fillStyle = '#263238';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(card.badge, card.w / 2 - 99, badgeY);

      // Best Score Badge (Warm Golden Star Achievement Badge)
      ctx.fillStyle = '#FFA000';
      ctx.strokeStyle = '#FF6F00';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.roundRect(card.w / 2 - 64, badgeY - 10, 58, 20, 10);
      ctx.fill();
      ctx.stroke();
      ctx.font = FONTS.SCORE_BADGE;
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`★ ${bestScore}`, card.w / 2 - 35, badgeY);

      // Title & Subtitle
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = FONTS.TITLE_CARD_LANDSCAPE;
      ctx.fillStyle = '#1A237E';
      ctx.fillText(card.title, card.w * 0.16, -2, card.w * 0.6);

      ctx.font = FONTS.SUBTITLE_SMALL;
      ctx.fillStyle = '#455A64';
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
