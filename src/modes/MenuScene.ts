import { BaseScene } from './BaseScene';
import { GameEngine } from '../engine/GameEngine';
import { InputManager } from '../engine/InputManager';
import { DisplayManager } from '../engine/DisplayManager';
import { ModeCardDef } from '../types/game';
import { soundEngine } from '../engine/SoundEngine';
import { Haptics } from '../engine/Haptics';
import { drawLandscapeSkyHills } from '../graphics/environmentRenderer';
import { drawMrsChicken } from '../graphics/chickenRenderer';
import { drawPeppaPig } from '../graphics/peppaRenderer';
import { drawBabyChick } from '../graphics/chickRenderer';
import { drawDaddyPig } from '../graphics/daddyPigRenderer';

export class MenuScene extends BaseScene {
  public time: number = 0;

  constructor(game: GameEngine) {
    super(game);
  }

  enter(): void {
    this.score = 0;
    soundEngine.unlock().then(() => {
      if (soundEngine.sequencer) {
        soundEngine.sequencer.start();
      }
    });
  }

  getModeCards(display: DisplayManager): ModeCardDef[] {
    const isPortrait = display.isPortrait;
    const vWidth = display.vWidth;
    const vHeight = display.vHeight;

    if (isPortrait) {
      const cardW = Math.min(480, vWidth - 40);
      const titleY = Math.max(80, Math.min(110, vHeight * 0.12));
      const startY = titleY + 75;
      const availableHeight = vHeight - startY - 40;
      const cardH = Math.min(130, Math.max(95, availableHeight / 4.4));
      const gap = Math.min(24, (availableHeight - cardH * 4) / 3);

      return [
        { id: 'EGG_LAYING', title: 'Happy Mrs Chicken', sub: 'Tap anywhere to fly & lay eggs!', x: vWidth / 2, y: startY + cardH * 0.5, w: cardW, h: cardH, color: '#FFF9C4', badge: 'Classic' },
        { id: 'MUDDY_PUDDLES', title: 'Muddy Puddles', sub: 'Jump & splash with Peppa!', x: vWidth / 2, y: startY + cardH * 1.5 + gap, w: cardW, h: cardH, color: '#FFCDD2', badge: 'Splash' },
        { id: 'CHICK_MAZE', title: 'Chick Maze', sub: 'Guide baby chicks to the coop!', x: vWidth / 2, y: startY + cardH * 2.5 + gap * 2, w: cardW, h: cardH, color: '#C8E6C9', badge: 'Puzzle' },
        { id: 'DADDY_PIG', title: 'Daddy Pig Challenge', sub: 'Hyper-speed egg frenzy test!', x: vWidth / 2, y: startY + cardH * 3.5 + gap * 3, w: cardW, h: cardH, color: '#B2EBF2', badge: 'Frenzy' }
      ];
    }

    const cardW = 390;
    const cardH = 140;
    const cx1 = vWidth * 0.28;
    const cx2 = vWidth * 0.72;
    return [
      { id: 'EGG_LAYING', title: 'Happy Mrs Chicken', sub: 'Tap anywhere to fly & lay eggs!', x: cx1, y: 220, w: cardW, h: cardH, color: '#FFF9C4', badge: 'Classic' },
      { id: 'MUDDY_PUDDLES', title: 'Muddy Puddles', sub: 'Jump & splash with Peppa!', x: cx2, y: 220, w: cardW, h: cardH, color: '#FFCDD2', badge: 'Splash' },
      { id: 'CHICK_MAZE', title: 'Chick Maze', sub: 'Guide baby chicks to the coop!', x: cx1, y: 395, w: cardW, h: cardH, color: '#C8E6C9', badge: 'Puzzle' },
      { id: 'DADDY_PIG', title: 'Daddy Pig Challenge', sub: 'Hyper-speed egg frenzy test!', x: cx2, y: 395, w: cardW, h: cardH, color: '#B2EBF2', badge: 'Frenzy' }
    ];
  }

  handleTap(x: number, y: number): boolean {
    const cards = this.getModeCards(this.game.display);

    // Mode Card Tap Detection
    for (const card of cards) {
      if (
        x >= card.x - card.w / 2 &&
        x <= card.x + card.w / 2 &&
        y >= card.y - card.h / 2 &&
        y <= card.y + card.h / 2
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
    if (input.isActionJustPressed()) {
      this.handleTap(input.primaryPointer.x, input.primaryPointer.y);
    }
  }

  render(ctx: CanvasRenderingContext2D, _alpha: number, display: DisplayManager): void {
    const isPortrait = display.isPortrait;
    drawLandscapeSkyHills(ctx, display.vWidth, display.vHeight, this.time);

    // Title Banner
    ctx.save();
    const titleBob = Math.sin(this.time * 2.5) * 4;
    const titleX = display.vWidth / 2;
    const titleY = (isPortrait ? Math.max(70, Math.min(100, display.vHeight * 0.1)) : 70) + titleBob;
    ctx.translate(titleX, titleY);
    ctx.font = `900 ${isPortrait ? '32px' : '42px'} "Comic Sans MS", cursive, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = isPortrait ? 6 : 8;
    ctx.strokeText('Happy Mrs Chicken', 0, 0);
    ctx.fillStyle = '#FFE600';
    ctx.fillText('Happy Mrs Chicken', 0, 0);
    ctx.restore();

    // Mode Cards
    const cards = this.getModeCards(display);
    for (const card of cards) {
      ctx.save();
      ctx.translate(card.x, card.y);

      // Card Background with drop shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.beginPath();
      ctx.roundRect(-card.w / 2, -card.h / 2 + 5, card.w, card.h, 20);
      ctx.fill();

      ctx.fillStyle = card.color;
      ctx.strokeStyle = '#37474F';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(-card.w / 2, -card.h / 2, card.w, card.h, 20);
      ctx.fill();
      ctx.stroke();

      // Best Score Badge
      let bestScore = 0;
      if (card.id === 'EGG_LAYING') bestScore = this.game.storage.getHighScore('eggLaying');
      else if (card.id === 'MUDDY_PUDDLES') bestScore = this.game.storage.getHighScore('muddyPuddles');
      else if (card.id === 'CHICK_MAZE') bestScore = this.game.storage.getHighScore('chickMaze');
      else if (card.id === 'DADDY_PIG') bestScore = this.game.storage.getHighScore('daddyPig');

      ctx.fillStyle = '#E53935';
      ctx.beginPath();
      ctx.roundRect(card.w / 2 - 110, -card.h / 2 - 10, 100, 24, 12);
      ctx.fill();
      ctx.strokeStyle = '#B71C1C';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.font = 'bold 12px "Comic Sans MS", sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.fillText(`Best: ${bestScore}`, card.w / 2 - 60, -card.h / 2 + 5);

      // Text Labels
      ctx.textAlign = 'left';
      ctx.font = 'bold 20px "Comic Sans MS", cursive, sans-serif';
      ctx.fillStyle = '#212121';
      ctx.fillText(card.title, -card.w / 2 + 18, -10);

      ctx.font = '13px "Comic Sans MS", sans-serif';
      ctx.fillStyle = '#455A64';
      ctx.fillText(card.sub, -card.w / 2 + 18, 16);

      // Character Preview Icons
      if (card.id === 'EGG_LAYING') {
        drawMrsChicken(ctx, card.w / 2 - 45, 8, 0.45, {
          squash: 1.0 + Math.sin(this.time * 4) * 0.1,
          flap: Math.sin(this.time * 6) * 0.2
        });
      } else if (card.id === 'MUDDY_PUDDLES') {
        drawPeppaPig(ctx, card.w / 2 - 42, 8, 0.45, { jumpY: Math.sin(this.time * 5) * 8 });
      } else if (card.id === 'CHICK_MAZE') {
        drawBabyChick(ctx, card.w / 2 - 42, 12, 0.65, {
          walkCycle: this.time * 8,
          isPeeping: Math.sin(this.time * 3) > 0.5
        });
      } else if (card.id === 'DADDY_PIG') {
        drawDaddyPig(ctx, card.w / 2 - 42, 0, 0.45, {
          panicStage: Math.floor(this.time % 4),
          time: this.time
        });
      }

      ctx.restore();
    }
  }
}

