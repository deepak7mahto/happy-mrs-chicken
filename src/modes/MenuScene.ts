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

  getModeCards(isPortrait: boolean): ModeCardDef[] {
    if (isPortrait) {
      return [
        { id: 'EGG_LAYING', title: 'Happy Mrs Chicken', sub: 'Lay eggs & hatch cute chicks!', x: 270, y: 250, w: 460, h: 120, color: '#FFF9C4', badge: 'Classic' },
        { id: 'MUDDY_PUDDLES', title: 'Muddy Puddles', sub: 'Jump & splash with Peppa!', x: 270, y: 395, w: 460, h: 120, color: '#FFCDD2', badge: 'Splash' },
        { id: 'CHICK_MAZE', title: 'Chick Maze', sub: 'Guide baby chicks to the coop!', x: 270, y: 540, w: 460, h: 120, color: '#C8E6C9', badge: 'Puzzle' },
        { id: 'DADDY_PIG', title: 'Daddy Pig Challenge', sub: 'Hyper-speed egg frenzy test!', x: 270, y: 685, w: 460, h: 120, color: '#B2EBF2', badge: 'Frenzy' }
      ];
    }

    return [
      { id: 'EGG_LAYING', title: 'Happy Mrs Chicken', sub: 'Lay eggs & hatch cute chicks!', x: 260, y: 220, w: 380, h: 140, color: '#FFF9C4', badge: 'Classic' },
      { id: 'MUDDY_PUDDLES', title: 'Muddy Puddles', sub: 'Jump & splash with Peppa!', x: 700, y: 220, w: 380, h: 140, color: '#FFCDD2', badge: 'Splash' },
      { id: 'CHICK_MAZE', title: 'Chick Maze', sub: 'Guide baby chicks to the coop!', x: 260, y: 400, w: 380, h: 140, color: '#C8E6C9', badge: 'Puzzle' },
      { id: 'DADDY_PIG', title: 'Daddy Pig Challenge', sub: 'Hyper-speed egg frenzy test!', x: 700, y: 400, w: 380, h: 140, color: '#B2EBF2', badge: 'Frenzy' }
    ];
  }

  handleTap(x: number, y: number): boolean {
    const isPortrait = this.game.display.isPortrait;
    const cards = this.getModeCards(isPortrait);

    // Audio Button Hitbox
    const audioX = isPortrait ? 480 : 910;
    const audioY = isPortrait ? 45 : 35;
    const adx = x - audioX;
    const ady = y - audioY;
    if (adx * adx + ady * ady <= 50 * 50) {
      const newMute = !this.game.storage.isMuted();
      this.game.storage.setMuted(newMute);
      soundEngine.setMuted(newMute);
      soundEngine.playSFX('click');
      Haptics.tap();
      return true;
    }

    // Fullscreen Button Hitbox
    const fsX = isPortrait ? 415 : 845;
    const fsY = isPortrait ? 45 : 35;
    const fdx = x - fsX;
    const fdy = y - fsY;
    if (fdx * fdx + fdy * fdy <= 35 * 35) {
      this.game.toggleFullscreen();
      soundEngine.playSFX('click');
      Haptics.tap();
      return true;
    }

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
    const titleX = isPortrait ? 270 : 480;
    const titleY = (isPortrait ? 110 : 75) + titleBob;
    ctx.translate(titleX, titleY);
    ctx.font = `900 ${isPortrait ? '32px' : '44px'} "Comic Sans MS", cursive, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = isPortrait ? 6 : 8;
    ctx.strokeText('Peppa Pig: Happy Mrs Chicken', 0, 0);
    ctx.fillStyle = '#FFE600';
    ctx.fillText('Peppa Pig: Happy Mrs Chicken', 0, 0);
    ctx.restore();

    // Mode Cards
    const cards = this.getModeCards(isPortrait);
    for (const card of cards) {
      ctx.save();
      ctx.translate(card.x, card.y);

      // Card Background
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
      ctx.roundRect(card.w / 2 - 110, -card.h / 2 - 12, 100, 26, 13);
      ctx.fill();
      ctx.strokeStyle = '#B71C1C';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.font = 'bold 12px "Comic Sans MS", sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.fillText(`Best: ${bestScore}`, card.w / 2 - 60, -card.h / 2 + 3);

      // Text Labels
      ctx.textAlign = 'left';
      ctx.font = 'bold 22px "Comic Sans MS", sans-serif';
      ctx.fillStyle = '#212121';
      ctx.fillText(card.title, -card.w / 2 + 20, -10);

      ctx.font = '14px "Comic Sans MS", sans-serif';
      ctx.fillStyle = '#455A64';
      ctx.fillText(card.sub, -card.w / 2 + 20, 18);

      // Character Preview Icons
      if (card.id === 'EGG_LAYING') {
        drawMrsChicken(ctx, card.w / 2 - 50, 10, 0.45, {
          squash: 1.0 + Math.sin(this.time * 4) * 0.1,
          flap: Math.sin(this.time * 6) * 0.2
        });
      } else if (card.id === 'MUDDY_PUDDLES') {
        drawPeppaPig(ctx, card.w / 2 - 45, 10, 0.45, { jumpY: Math.sin(this.time * 5) * 8 });
      } else if (card.id === 'CHICK_MAZE') {
        drawBabyChick(ctx, card.w / 2 - 45, 15, 0.65, {
          walkCycle: this.time * 8,
          isPeeping: Math.sin(this.time * 3) > 0.5
        });
      } else if (card.id === 'DADDY_PIG') {
        drawDaddyPig(ctx, card.w / 2 - 45, 0, 0.45, {
          panicStage: Math.floor(this.time % 4),
          time: this.time
        });
      }

      ctx.restore();
    }

    // Audio & Fullscreen Buttons
    const audioX = isPortrait ? 480 : 910;
    const audioY = isPortrait ? 45 : 35;
    ctx.save();
    ctx.translate(audioX, audioY);
    ctx.fillStyle = '#FFD54F';
    ctx.strokeStyle = '#FFA000';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#212121';
    ctx.font = 'bold 20px "Comic Sans MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.game.storage.isMuted() ? '🔇' : '🔊', 0, 2);
    ctx.restore();

    const fsX = isPortrait ? 415 : 845;
    const fsY = isPortrait ? 45 : 35;
    ctx.save();
    ctx.translate(fsX, fsY);
    ctx.fillStyle = '#81D4FA';
    ctx.strokeStyle = '#0288D1';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#01579B';
    ctx.font = 'bold 18px "Comic Sans MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⛶', 0, 1);
    ctx.restore();
  }
}
