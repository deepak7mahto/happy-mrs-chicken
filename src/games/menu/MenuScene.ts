/**
 * Mode 0: Main Menu / Story Journey & Arcade Free Play Suite
 * Adventures of Trishu Mini-Game Suite
 * Strictly under 500 Lines of Code
 */

import { BaseScene } from '../base/BaseScene';
import { GameEngine } from '../../engine/GameEngine';
import { InputManager } from '../../engine/InputManager';
import { DisplayManager } from '../../engine/DisplayManager';
import { ModeCardDef } from '../../types/game';
import { soundEngine } from '../../engine/SoundEngine';
import { Haptics } from '../../engine/Haptics';
import { drawLandscapeSkyHills } from '../../graphics/environmentRenderer';
import { MENU_CARDS } from './menuData';
import { renderMenuCardGrid } from './menuGridRenderer';
import { StoryMapRenderer } from '../../story/storyMapRenderer';
import { STORY_STOPS } from '../../story/storyData';

export class MenuScene extends BaseScene {
  public time: number = 0;
  public scrollY: number = 0;
  public scrollVy: number = 0;
  public focusedCardIndex: number = 0;
  public storyMap: StoryMapRenderer = new StoryMapRenderer();

  private isDragging: boolean = false;
  private dragStartY: number = 0;
  private dragStartX: number = 0;
  private dragStartScrollY: number = 0;
  private lastPointerY: number = 0;
  private lastPointerTime: number = 0;

  private cachedCards: ModeCardDef[] = [];
  private lastVWidth: number = -1;
  private lastVHeight: number = -1;
  private lastIsPortrait: boolean = false;

  constructor(game: GameEngine) {
    super(game);
  }

  enter(): void {
    this.score = 0;
    this.scrollY = 0;
    this.scrollVy = 0;
    this.isDragging = false;
    soundEngine.setTrack('classic');
    soundEngine.unlock().then(() => {
      if (soundEngine.sequencer) {
        soundEngine.sequencer.start();
      }
    });

    // In journey mode, auto-scroll to keep active stop in view
    if (this.game.storyViewMode === 'journey') {
      const activeIdx = this.game.storyProgress.currentStopIndex;
      if (activeIdx > 2) {
        const stepY = this.game.display.isPortrait ? 155 : 140;
        this.scrollY = -Math.max(0, (activeIdx - 1) * stepY);
      }
    }
  }

  get viewMode(): 'journey' | 'grid' {
    return this.game.storyViewMode;
  }

  private getContentHeight(display: DisplayManager): number {
    if (this.viewMode === 'journey') {
      return this.storyMap.getTotalContentHeight(display);
    }
    if (display.isPortrait) {
      const cards = this.getModeCards(display);
      if (cards.length > 0) {
        const last = cards[cards.length - 1];
        return last.y + last.h / 2 + 30;
      }
    }
    return display.vHeight + 40;
  }

  getModeCards(display: DisplayManager): ModeCardDef[] {
    const isPortrait = display.isPortrait;
    const vWidth = display.vWidth;
    const vHeight = display.vHeight;

    if (
      this.cachedCards.length === MENU_CARDS.length &&
      this.lastVWidth === vWidth &&
      this.lastVHeight === vHeight &&
      this.lastIsPortrait === isPortrait
    ) {
      return this.cachedCards;
    }

    const cards: ModeCardDef[] = [];
    const cols = isPortrait ? 2 : 4;
    const gapX = isPortrait ? 16 : 12;
    const gapY = isPortrait ? 12 : 8;
    const topPad = isPortrait ? 108 : 74;
    const cardW = isPortrait ? 240 : (vWidth - 40 - 3 * gapX) / 4;
    const cardH = isPortrait ? 144 : (vHeight - topPad - 10 - 3 * gapY) / 4;
    const padX = isPortrait ? Math.round((vWidth - (2 * cardW + gapX)) / 2) : 20;

    for (let i = 0; i < MENU_CARDS.length; i++) {
      const info = MENU_CARDS[i];
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = padX + cardW / 2 + col * (cardW + gapX);
      const y = topPad + cardH / 2 + row * (cardH + gapY);
      cards.push({ id: info.id, title: info.title, sub: info.sub, badge: info.badge, color: info.color, x, y, w: cardW, h: cardH });
    }

    this.lastVWidth = vWidth;
    this.lastVHeight = vHeight;
    this.lastIsPortrait = isPortrait;
    this.cachedCards = cards;
    return cards;
  }

  private scrollCardIntoView(card: ModeCardDef, display: DisplayManager): void {
    const topPad = display.isPortrait ? 108 : 74;
    const vHeight = display.vHeight;
    const contentH = this.getContentHeight(display);
    const maxScroll = Math.max(0, contentH - vHeight);

    const cardTop = card.y - card.h / 2;
    const cardBottom = card.y + card.h / 2;

    if (cardTop + this.scrollY < topPad + 10) {
      this.scrollY = topPad + 10 - cardTop;
    } else if (cardBottom + this.scrollY > vHeight - 12) {
      this.scrollY = vHeight - 12 - cardBottom;
    }

    if (this.scrollY > 0) this.scrollY = 0;
    if (this.scrollY < -maxScroll) this.scrollY = -maxScroll;
  }

  private handleModeToggleTap(x: number, y: number, display: DisplayManager): boolean {
    const isPortrait = display.isPortrait;
    const topH = isPortrait ? 88 : 70;
    if (y > topH) return false;

    const toggleW = isPortrait ? 270 : 310;
    const toggleH = 34;
    const toggleX = display.vWidth / 2 - toggleW / 2;
    const toggleY = isPortrait ? 44 : 32;

    if (x >= toggleX && x <= toggleX + toggleW && y >= toggleY && y <= toggleY + toggleH) {
      const clickSide = x < toggleX + toggleW / 2 ? 'journey' : 'grid';
      if (this.game.storyViewMode !== clickSide) {
        soundEngine.playSFX('click');
        Haptics.tap();
        this.game.setStoryViewMode(clickSide);
        this.scrollY = 0;
        this.scrollVy = 0;
      }
      return true;
    }
    return false;
  }

  handleTap(x: number, y: number): boolean {
    if (this.handleModeToggleTap(x, y, this.game.display)) {
      return true;
    }

    const titleAreaH = this.game.display.isPortrait ? 88 : 64;
    if (y < titleAreaH) return false;

    if (this.viewMode === 'journey') {
      if (this.storyMap.handleTap(x, y, this.game.display, this.game, this.scrollY)) {
        soundEngine.playSFX('click');
        Haptics.medium();
        return true;
      }
      return false;
    }

    // Grid tap handling
    const cards = this.getModeCards(this.game.display);
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      const curY = card.y + this.scrollY;
      if (
        x >= card.x - card.w / 2 - 4 &&
        x <= card.x + card.w / 2 + 4 &&
        y >= curY - card.h / 2 - 4 &&
        y <= curY + card.h / 2 + 4
      ) {
        this.focusedCardIndex = i;
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
    const contentH = this.getContentHeight(display);
    const maxScroll = Math.max(0, contentH - display.vHeight);

    // Continuous keyboard arrow scrolling for accessibility
    if (input.isKeyDown('ArrowDown')) {
      this.scrollY -= 350 * dt;
      this.scrollVy = 0;
    } else if (input.isKeyDown('ArrowUp')) {
      this.scrollY += 350 * dt;
      this.scrollVy = 0;
    }

    // Keyboard & Gamepad focus navigation
    const cards = this.getModeCards(display);
    const cols = display.isPortrait ? 2 : 4;
    const totalCards = cards.length;

    let nextIndex = this.focusedCardIndex;
    if (input.isKeyJustPressed('ArrowRight')) {
      if (nextIndex + 1 < totalCards) nextIndex++;
    } else if (input.isKeyJustPressed('ArrowLeft')) {
      if (nextIndex - 1 >= 0) nextIndex--;
    } else if (input.isKeyJustPressed('ArrowDown')) {
      if (nextIndex + cols < totalCards) nextIndex += cols;
    } else if (input.isKeyJustPressed('ArrowUp')) {
      if (nextIndex - cols >= 0) nextIndex -= cols;
    }

    if (nextIndex !== this.focusedCardIndex) {
      this.focusedCardIndex = nextIndex;
      soundEngine.playSFX('click');
      Haptics.tap();
      if (cards[nextIndex]) {
        this.scrollCardIntoView(cards[nextIndex], display);
      }
      if (this.viewMode === 'journey') {
        const nextStop = Math.min(STORY_STOPS.length - 1, nextIndex);
        this.game.storage.setCurrentStoryStopIndex(nextStop);
      }
    }

    if (input.isKeyJustPressed('Enter') || input.isKeyJustPressed('Space')) {
      if (this.viewMode === 'journey') {
        this.game.launchStoryStop(this.game.storyProgress.currentStopIndex, true);
      } else if (cards[this.focusedCardIndex]) {
        soundEngine.playSFX('click');
        Haptics.medium();
        this.game.changeScene(cards[this.focusedCardIndex].id);
      }
      return;
    }

    // Touchpad wheel scrolling
    const wheelY = input.wheelDeltaY;
    if (Math.abs(wheelY) > 0.5) {
      this.scrollY -= wheelY * 0.85;
      this.scrollVy = 0;
    }

    // Touch & Drag gestures
    const ptr = input.primaryPointer;
    if (input.actionJustPressed) {
      this.isDragging = true;
      this.dragStartY = ptr.y;
      this.dragStartX = ptr.x;
      this.dragStartScrollY = this.scrollY;
      this.lastPointerY = ptr.y;
      this.lastPointerTime = performance.now();
      this.scrollVy = 0;
    } else if (this.isDragging && input.actionIsDown) {
      const dy = ptr.y - this.dragStartY;
      this.scrollY = this.dragStartScrollY + dy;

      const now = performance.now();
      const dtPointer = Math.max(1, now - this.lastPointerTime);
      this.scrollVy = ((ptr.y - this.lastPointerY) / dtPointer) * 16.67;
      this.lastPointerY = ptr.y;
      this.lastPointerTime = now;
    } else if (this.isDragging && !input.actionIsDown) {
      this.isDragging = false;
      const totalDist = Math.hypot(ptr.x - this.dragStartX, ptr.y - this.dragStartY);
      if (totalDist < 12) {
        this.handleTap(ptr.x, ptr.y);
      }
    }

    // Apply scroll inertia
    if (!this.isDragging) {
      if (Math.abs(this.scrollVy) > 0.1) {
        this.scrollY += this.scrollVy;
        this.scrollVy *= 0.92;
      } else {
        this.scrollVy = 0;
      }

      // Elastic bounce-back limits
      if (this.scrollY > 0) {
        this.scrollY += (0 - this.scrollY) * 0.22;
      } else if (this.scrollY < -maxScroll) {
        this.scrollY += (-maxScroll - this.scrollY) * 0.22;
      }
    }
  }

  render(ctx: CanvasRenderingContext2D, _alpha: number, display: DisplayManager): void {
    const vWidth = display.vWidth;
    const vHeight = display.vHeight;
    const isPortrait = display.isPortrait;
    const contentH = this.getContentHeight(display);

    if (this.viewMode === 'journey') {
      this.storyMap.render(ctx, display, this.game, this.scrollY, this.time);
    } else {
      drawLandscapeSkyHills(ctx, vWidth, vHeight, this.time);
      const cards = this.getModeCards(display);
      renderMenuCardGrid(ctx, cards, this.scrollY, display, this.game, this.time, this.focusedCardIndex);
    }

    // Scroll Indicator Pill (Right Edge)
    const maxScrollPill = Math.max(0, contentH - vHeight);
    if (maxScrollPill > 15) {
      const scrollRatio = Math.max(0, Math.min(1, -this.scrollY / maxScrollPill));
      const trackH = vHeight - (isPortrait ? 96 : 78) - 20;
      const barH = Math.max(25, trackH * (vHeight / contentH));
      const barY = (isPortrait ? 96 : 78) + 10 + scrollRatio * (trackH - barH);
      const barX = vWidth - 6;

      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
      ctx.beginPath();
      ctx.roundRect(barX - 3, barY, 5, barH, 2.5);
      ctx.fill();
      ctx.restore();
    }
  }
}
