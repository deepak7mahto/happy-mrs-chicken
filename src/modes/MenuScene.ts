/**
 * Mode 0: Main Menu / 9-Game Arcade Selection Suite
 * Adventures of Trishu Mini-Game Suite
 * Strictly under 500 Lines of Code
 */

import { BaseScene } from './BaseScene';
import { GameEngine } from '../engine/GameEngine';
import { InputManager } from '../engine/InputManager';
import { DisplayManager } from '../engine/DisplayManager';
import { ModeCardDef, GameModeId } from '../types/game';
import { soundEngine } from '../engine/SoundEngine';
import { Haptics } from '../engine/Haptics';
import { drawLandscapeSkyHills } from '../graphics/environmentRenderer';
import {
  drawMrsClucky,
  drawTrishu,
  drawBabyChick,
  drawDad,
  drawLeo,
  drawMom,
  drawGrandpa,
  drawMimi,
  drawCompositeCharacter
} from '../graphics/characters';

interface MenuCardInfo {
  id: GameModeId;
  title: string;
  sub: string;
  badge: string;
  color: string;
  borderColor: string;
  scoreKey: string;
}

const MENU_CARDS: MenuCardInfo[] = [
  { id: 'EGG_LAYING', title: 'Mrs Clucky', sub: 'Lay & hatch eggs!', badge: 'Classic', color: '#FFF9C4', borderColor: '#FBC02D', scoreKey: 'eggLaying' },
  { id: 'MUDDY_PUDDLES', title: 'Puddle Splash', sub: 'Jump & splash!', badge: 'Splash', color: '#FFCDD2', borderColor: '#E57373', scoreKey: 'muddyPuddles' },
  { id: 'CHICK_MAZE', title: 'Chick Trail', sub: 'Guide lost chicks!', badge: 'Puzzle', color: '#C8E6C9', borderColor: '#81C784', scoreKey: 'chickMaze' },
  { id: 'DADDY_PIG', title: "Dad's Kitchen", sub: 'Breakfast frenzy!', badge: 'Frenzy', color: '#B2EBF2', borderColor: '#4DD0E1', scoreKey: 'daddyPig' },
  { id: 'DINOSAUR_BALLOON', title: 'Balloon Pop', sub: 'Pop all balloons!', badge: 'Pop', color: '#D1C4E9', borderColor: '#9575CD', scoreKey: 'dinosaurBalloon' },
  { id: 'PANCAKE_FLIPPER', title: 'Pancake Flip', sub: 'Flip & stack high!', badge: 'Chef', color: '#FFE0B2', borderColor: '#FFB74D', scoreKey: 'pancakeFlipper' },
  { id: 'VEGETABLE_HARVEST', title: 'Veggie Harvest', sub: 'Pull giant veggies!', badge: 'Garden', color: '#DCEDC8', borderColor: '#AED581', scoreKey: 'vegetableHarvest' },
  { id: 'HOPSCOTCH_BUBBLE', title: 'Bubble Hop', sub: 'Hop & pop bubbles!', badge: 'Bubbles', color: '#F8BBD0', borderColor: '#F06292', scoreKey: 'hopscotchBubble' },
  { id: 'MIX_MATCH', title: 'Body Shuffler', sub: 'Mix funny bodies!', badge: 'Funny', color: '#E1BEE7', borderColor: '#BA68C8', scoreKey: 'mixMatch' },
  { id: 'PEEK_A_BOO', title: 'Peek-a-Boo', sub: 'Find cute friends!', badge: 'Toddler', color: '#E8F5E9', borderColor: '#66BB6A', scoreKey: 'peekABoo' }
];

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
    const rows = isPortrait ? 5 : 4; 
    const topPad = isPortrait ? 85 : 70;
    const bottomPad = 35;
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

  private renderCharacterPreview(
    ctx: CanvasRenderingContext2D,
    modeId: GameModeId,
    cx: number,
    cy: number,
    cardW: number
  ): void {
    const time = this.time;
    const charScale = Math.min(0.48, Math.max(0.36, cardW / 520));

    if (modeId === 'EGG_LAYING') {
      ctx.fillStyle = '#D7CCC8';
      ctx.beginPath();
      ctx.ellipse(cx, cy + 22, 22, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFE082';
      ctx.strokeStyle = '#FFA000';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(cx + 10, cy + 18, 5.5, 7.5, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      drawMrsClucky(ctx, cx - 4, cy, charScale * 0.95, {
        squash: 1.0 + Math.sin(time * 4) * 0.1,
        flap: Math.sin(time * 6) * 0.22,
        headBob: Math.sin(time * 3) * 2,
        eyeBlink: Math.sin(time * 1.8) > 0.88
      });
    } else if (modeId === 'MUDDY_PUDDLES') {
      ctx.fillStyle = '#6D4C41';
      ctx.beginPath();
      ctx.ellipse(cx, cy + 28, 28, 9, 0, 0, Math.PI * 2);
      ctx.fill();

      drawTrishu(ctx, cx, cy, charScale, {
        jumpY: Math.sin(time * 5) * 6,
        squish: 1.0,
        squash: 1.0,
        armWave: Math.sin(time * 6) * 0.2,
        eyeBlink: Math.sin(time * 2) > 0.85,
        expression: 'excited'
      });
    } else if (modeId === 'CHICK_MAZE') {
      const chickOff = Math.sin(time * 6) * 4;
      drawBabyChick(ctx, cx - 14, cy + 14 + chickOff, charScale * 0.85, {
        isPeeping: Math.sin(time * 8) > 0.5,
        facingLeft: false,
        walkCycle: time * 8
      });
      drawBabyChick(ctx, cx + 14, cy + 14 - chickOff, charScale * 0.85, {
        isPeeping: Math.sin(time * 8) <= 0.5,
        facingLeft: true,
        walkCycle: time * 8 + 2
      });
    } else if (modeId === 'DADDY_PIG') {
      drawDad(ctx, cx, cy + 2, charScale * 0.88, {
        panicStage: Math.floor((time * 0.7) % 4),
        eyeBlink: Math.sin(time * 2) > 0.85,
        time
      });
    } else if (modeId === 'DINOSAUR_BALLOON') {
      drawLeo(ctx, cx, cy + 4, charScale * 0.95, {
        holdingDino: true,
        dinoChomp: Math.abs(Math.sin(time * 8)),
        jumpY: Math.sin(time * 6) * 3,
        expression: 'excited',
        eyeBlink: Math.sin(time * 2.2) > 0.85
      });
    } else if (modeId === 'PANCAKE_FLIPPER') {
      drawMom(ctx, cx, cy + 2, charScale * 0.92, {
        armWave: Math.sin(time * 6) * 0.15,
        holdingPan: true,
        panAngle: Math.sin(time * 8) * 0.18,
        expression: 'happy',
        eyeBlink: Math.sin(time * 2) > 0.85
      });
    } else if (modeId === 'VEGETABLE_HARVEST') {
      drawGrandpa(ctx, cx, cy + 2, charScale * 0.92, {
        pulling: true,
        pullTension: 0.35,
        welliesMuddy: true,
        eyeBlink: Math.sin(time * 2.1) > 0.85
      });
    } else if (modeId === 'HOPSCOTCH_BUBBLE') {
      drawMimi(ctx, cx, cy, charScale * 0.95, {
        hopY: Math.abs(Math.sin(time * 6)) * 8,
        earFlap: Math.sin(time * 8) * 0.25,
        holdingWand: true,
        blowingBubble: Math.sin(time * 3) > 0.3,
        eyeBlink: Math.sin(time * 1.9) > 0.85
      });
    } else if (modeId === 'MIX_MATCH') {
      const cycle = Math.floor(time * 1.2);
      drawCompositeCharacter(
        ctx,
        (cycle + 4) % 7,
        (cycle + 2) % 7,
        cycle % 7,
        cx,
        cy,
        charScale * 0.85,
        {
          blinkTimer: 0,
          isBlinking: Math.sin(time * 2) > 0.88,
          breathTimer: 0,
          breathScale: 1.0,
          wobbleTimer: 0,
          wobbleAngle: Math.sin(time * 6) * 0.1,
          headBob: Math.sin(time * 12) * 2
        }
      );
    } else if (modeId === 'PEEK_A_BOO') {
      const peek = Math.abs(Math.sin(time * 3));
      drawMimi(ctx, cx, cy - peek * 10, charScale * 0.9, {
        hopY: 0,
        earFlap: Math.sin(time * 6) * 0.22,
        holdingWand: false,
        blowingBubble: false,
        eyeBlink: Math.sin(time * 1.8) > 0.85
      });
      ctx.fillStyle = '#43A047';
      ctx.beginPath();
      ctx.arc(cx - 12, cy + 14, 12, 0, Math.PI * 2);
      ctx.arc(cx + 12, cy + 14, 12, 0, Math.PI * 2);
      ctx.arc(cx, cy + 10, 15, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  render(ctx: CanvasRenderingContext2D, _alpha: number, display: DisplayManager): void {
    const isPortrait = display.isPortrait;
    const vWidth = display.vWidth;
    const vHeight = display.vHeight;
    const topPad = isPortrait ? 78 : 64;

    drawLandscapeSkyHills(ctx, vWidth, vHeight, this.time);

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

      ctx.fillStyle = 'rgba(0, 0, 0, 0.14)';
      ctx.beginPath();
      ctx.roundRect(-card.w / 2, -card.h / 2 + 5, card.w, card.h, 20);
      ctx.fill();

      ctx.fillStyle = card.color;
      ctx.strokeStyle = info.borderColor;
      ctx.lineWidth = 3.6;
      ctx.beginPath();
      ctx.roundRect(-card.w / 2, -card.h / 2, card.w, card.h, 20);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = 'rgba(0, 0, 0, 0.09)';
      ctx.beginPath();
      ctx.roundRect(-card.w / 2 + 8, -card.h / 2 + 7, 62, 22, 11);
      ctx.fill();
      ctx.font = 'bold 12px "Comic Sans MS", sans-serif';
      ctx.fillStyle = '#37474F';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(card.badge, -card.w / 2 + 39, -card.h / 2 + 18);

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

      const previewY = -card.h * 0.06;
      this.renderCharacterPreview(ctx, card.id, 0, previewY, card.w);

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

    const contentH = this.getContentHeight(display);
    const maxScroll = Math.max(0, contentH - vHeight);
    if (maxScroll > 20) {
      const scrollRatio = Math.max(0, Math.min(1, -this.scrollY / maxScroll));
      const trackH = vHeight - topPad - 30;
      const barH = Math.max(35, trackH * (vHeight / contentH));
      const barY = topPad + 15 + scrollRatio * (trackH - barH);
      const barX = vWidth - 8;

      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
      ctx.beginPath();
      ctx.roundRect(barX - 4, barY, 6, barH, 3);
      ctx.fill();
      ctx.restore();
    }

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
