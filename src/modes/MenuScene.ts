/**
 * Mode 0: Main Menu / 15-Game Arcade Selection Suite
 * Adventures of Trishu Mini-Game Suite
 * Strictly under 500 Lines of Code
 */

import { BaseScene } from './BaseScene';
import { GameEngine } from '../engine/GameEngine';
import { InputManager } from '../engine/InputManager';
import { DisplayManager } from '../engine/DisplayManager';
import { ModeCardDef } from '../types/game';
import { soundEngine } from '../engine/SoundEngine';
import { Haptics } from '../engine/Haptics';
import { drawLandscapeSkyHills } from '../graphics/environmentRenderer';
import { MENU_CARDS, renderMenuCharacterPreview } from './menuData';

export class MenuScene extends BaseScene {
  public time: number = 0;
  public scrollY: number = 0;
  public scrollVy: number = 0;
  private isDragging: boolean = false;
  private dragStartY: number = 0;
  private dragStartX: number = 0;
  private dragStartScrollY: number = 0;
  private lastPointerY: number = 0;
  private lastPointerTime: number = 0;

  constructor(game: GameEngine) {
    super(game);
  }

  enter(): void {
    this.score = 0;
    this.scrollY = 0;
    this.scrollVy = 0;
    this.isDragging = false;
    soundEngine.unlock().then(() => {
      if (soundEngine.sequencer) {
        soundEngine.sequencer.start();
      }
    });
  }

  private getContentHeight(display: DisplayManager): number {
    const isPortrait = display.isPortrait;
    const cardH = isPortrait ? 200 : 190;
    const gapY = 14;
    const rows = isPortrait ? 8 : 5; // 2 cols in portrait (8 rows), 3 cols in landscape (5 rows)
    const topPad = isPortrait ? 85 : 70;
    const bottomPad = 40;
    return topPad + rows * (cardH + gapY) + bottomPad;
  }

  getModeCards(display: DisplayManager): ModeCardDef[] {
    const isPortrait = display.isPortrait;
    const vWidth = display.vWidth;
    const cards: ModeCardDef[] = [];
    const topPad = isPortrait ? 85 : 70;

    if (isPortrait) {
      const padX = 14;
      const gapX = 12;
      const gapY = 14;
      const cardW = (vWidth - padX * 2 - gapX) / 2;
      const cardH = 200;

      for (let i = 0; i < MENU_CARDS.length; i++) {
        const info = MENU_CARDS[i];
        const col = i % 2;
        const row = Math.floor(i / 2);
        const x = padX + cardW / 2 + col * (cardW + gapX);
        const y = topPad + cardH / 2 + row * (cardH + gapY);
        cards.push({ id: info.id, title: info.title, sub: info.sub, badge: info.badge, color: info.color, x, y, w: cardW, h: cardH });
      }
    } else {
      const padX = 24;
      const gapX = 16;
      const gapY = 14;
      const cols = 3;
      const cardW = (vWidth - padX * 2 - (cols - 1) * gapX) / cols;
      const cardH = 190;

      for (let i = 0; i < MENU_CARDS.length; i++) {
        const info = MENU_CARDS[i];
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = padX + cardW / 2 + col * (cardW + gapX);
        const y = topPad + cardH / 2 + row * (cardH + gapY);
        cards.push({ id: info.id, title: info.title, sub: info.sub, badge: info.badge, color: info.color, x, y, w: cardW, h: cardH });
      }
    }

    return cards;
  }

  handleTap(x: number, y: number): boolean {
    const titleAreaH = this.game.display.isPortrait ? 78 : 62;
    if (y < titleAreaH) return false;

    const cards = this.getModeCards(this.game.display);
    for (const card of cards) {
      const curY = card.y + this.scrollY;
      if (
        x >= card.x - card.w / 2 - 8 &&
        x <= card.x + card.w / 2 + 8 &&
        y >= curY - card.h / 2 - 8 &&
        y <= curY + card.h / 2 + 8
      ) {
        soundEngine.playSFX('click');
        Haptics.medium();
        this.game.changeScene(card.id);
        return true;
      }
    }
    return false;
  }

  update(dt: number, input: InputManager): void {
    this.time += dt;

    const display = this.game.display;
    const vHeight = display.vHeight;
    const contentH = this.getContentHeight(display);
    const maxScroll = Math.max(0, contentH - vHeight);

    const ptr = input.primaryPointer;
    const isActionDown = input.isActionDown();

    if (input.isActionJustPressed()) {
      this.dragStartY = ptr.y;
      this.dragStartX = ptr.x;
      this.dragStartScrollY = this.scrollY;
      this.lastPointerY = ptr.y;
      this.lastPointerTime = performance.now();
      this.isDragging = false;
      this.scrollVy = 0;
    } else if (isActionDown) {
      const dy = ptr.y - this.dragStartY;
      const dx = ptr.x - this.dragStartX;
      const dist = Math.hypot(dx, dy);

      if (!this.isDragging && dist > 10) {
        this.isDragging = true;
      }

      if (this.isDragging) {
        const now = performance.now();
        const dtMs = Math.max(1, now - this.lastPointerTime);
        const instVy = ((ptr.y - this.lastPointerY) / dtMs) * 1000;
        this.scrollVy = this.scrollVy * 0.4 + instVy * 0.6;
        this.lastPointerY = ptr.y;
        this.lastPointerTime = now;

        let newScroll = this.dragStartScrollY + dy;
        if (newScroll > 0) {
          newScroll = newScroll * 0.35;
        } else if (newScroll < -maxScroll) {
          const over = newScroll + maxScroll;
          newScroll = -maxScroll + over * 0.35;
        }
        this.scrollY = newScroll;
      }
    } else {
      if (input.actionJustReleased) {
        if (!this.isDragging) {
          this.handleTap(ptr.x, ptr.y);
        }
        this.isDragging = false;
      }
    }

    // Touchpad / mouse wheel scrolling
    if (Math.abs(input.wheelDeltaY) > 0.01) {
      this.scrollY -= input.wheelDeltaY;
      this.scrollVy = -input.wheelDeltaY * 6;
      this.isDragging = false;
    }

    // Keyboard arrow keys scrolling
    if (input.isKeyDown('ArrowDown') || input.isKeyDown('PageDown')) {
      this.scrollY -= 400 * dt;
    } else if (input.isKeyDown('ArrowUp') || input.isKeyDown('PageUp')) {
      this.scrollY += 400 * dt;
    }

    if (!isActionDown) {
      if (Math.abs(this.scrollVy) > 15) {
        this.scrollY += this.scrollVy * dt;
        this.scrollVy *= Math.pow(0.04, dt);
      } else {
        this.scrollVy = 0;
      }

      if (this.scrollY > 0) {
        this.scrollY = Math.max(0, this.scrollY - this.scrollY * 14 * dt);
        this.scrollVy = 0;
      } else if (this.scrollY < -maxScroll) {
        const diff = -maxScroll - this.scrollY;
        this.scrollY = Math.min(-maxScroll, this.scrollY + diff * 14 * dt);
        this.scrollVy = 0;
      }
    }
  }

  render(ctx: CanvasRenderingContext2D, _alpha: number, display: DisplayManager): void {
    const isPortrait = display.isPortrait;
    const vWidth = display.vWidth;
    const vHeight = display.vHeight;
    const topPad = isPortrait ? 78 : 64;

    drawLandscapeSkyHills(ctx, vWidth, vHeight, this.time);

    // Clipped Scroll Area
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, topPad, vWidth, vHeight - topPad);
    ctx.clip();

    ctx.save();
    ctx.translate(0, this.scrollY);

    const cards = this.getModeCards(display);
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      const curY = card.y + this.scrollY;
      if (curY < -card.h || curY > vHeight + card.h) continue;

      const info = MENU_CARDS[i];
      const bestScore = this.game.storage.getHighScore(info.scoreKey);

      ctx.save();
      ctx.translate(card.x, card.y);

      // Card Drop Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.14)';
      ctx.beginPath();
      ctx.roundRect(-card.w / 2, -card.h / 2 + 5, card.w, card.h, 20);
      ctx.fill();

      // Card Background
      ctx.fillStyle = card.color;
      ctx.strokeStyle = info.borderColor;
      ctx.lineWidth = 3.6;
      ctx.beginPath();
      ctx.roundRect(-card.w / 2, -card.h / 2, card.w, card.h, 20);
      ctx.fill();
      ctx.stroke();

      // Category Badge (Top-Left)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.09)';
      ctx.beginPath();
      ctx.roundRect(-card.w / 2 + 8, -card.h / 2 + 7, 62, 22, 11);
      ctx.fill();
      ctx.font = 'bold 12px "Comic Sans MS", sans-serif';
      ctx.fillStyle = '#37474F';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(card.badge, -card.w / 2 + 39, -card.h / 2 + 18);

      // Best Score Badge (Top-Right)
      ctx.fillStyle = '#E53935';
      ctx.strokeStyle = '#B71C1C';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(card.w / 2 - 80, -card.h / 2 + 7, 74, 22, 11);
      ctx.fill();
      ctx.stroke();

      ctx.font = 'bold 13px "Comic Sans MS", sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`★ ${bestScore}`, card.w / 2 - 43, -card.h / 2 + 18);

      // Character Preview (Center)
      const previewY = -card.h * 0.06;
      renderMenuCharacterPreview(ctx, card.id, 0, previewY, card.w, this.time);

      // Title & Subtitle Labels (Bottom)
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `bold ${isPortrait ? '19px' : '18px'} "Comic Sans MS", cursive, sans-serif`;
      ctx.fillStyle = '#212121';
      ctx.fillText(card.title, 0, card.h / 2 - 32);

      ctx.font = `bold ${isPortrait ? '13px' : '12px'} "Comic Sans MS", sans-serif`;
      ctx.fillStyle = '#455A64';
      ctx.fillText(card.sub, 0, card.h / 2 - 13);

      ctx.restore();
    }
    ctx.restore();
    ctx.restore();

    // Scroll Indicator Pill (Right Edge)
    const contentH = this.getContentHeight(display);
    const maxScroll = Math.max(0, contentH - vHeight);
    if (maxScroll > 20) {
      const scrollRatio = Math.max(0, Math.min(1, -this.scrollY / maxScroll));
      const trackH = vHeight - topPad - 30;
      const barH = Math.max(30, trackH * (vHeight / contentH));
      const barY = topPad + 15 + scrollRatio * (trackH - barH);
      const barX = vWidth - 8;

      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
      ctx.beginPath();
      ctx.roundRect(barX - 4, barY, 6, barH, 3);
      ctx.fill();
      ctx.restore();
    }

    // Fixed Title Banner (Top)
    ctx.save();
    const titleBob = Math.sin(this.time * 2.5) * 2.5;
    const titleX = vWidth / 2;
    const titleY = (isPortrait ? Math.max(34, vHeight * 0.042) : 28) + titleBob;
    ctx.translate(titleX, titleY);
    ctx.font = `900 ${isPortrait ? '28px' : '32px'} "Comic Sans MS", cursive, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = isPortrait ? 5 : 6;
    ctx.strokeText('Adventures of Trishu', 0, 0);
    ctx.fillStyle = '#FFE600';
    ctx.fillText('Adventures of Trishu', 0, 0);
    ctx.restore();
  }
}
