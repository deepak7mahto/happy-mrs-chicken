/**
 * Mode 0: Main Menu / 8-Game Arcade Selection Suite
 * Peppa Pig: Happy Mrs Chicken 8-Game Deluxe Expansion Suite
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
  drawMrsChicken,
  drawPeppaPig,
  drawBabyChick,
  drawDaddyPig,
  drawGeorgePig,
  drawMummyPig,
  drawGrandpaPig,
  drawSuzySheep
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
  { id: 'EGG_LAYING', title: 'Mrs Chicken', sub: 'Lay & hatch eggs!', badge: 'Classic', color: '#FFF9C4', borderColor: '#FBC02D', scoreKey: 'eggLaying' },
  { id: 'MUDDY_PUDDLES', title: 'Muddy Puddles', sub: 'Jump & splash mud!', badge: 'Splash', color: '#FFCDD2', borderColor: '#E57373', scoreKey: 'muddyPuddles' },
  { id: 'CHICK_MAZE', title: 'Chick Maze', sub: 'Guide lost chicks!', badge: 'Puzzle', color: '#C8E6C9', borderColor: '#81C784', scoreKey: 'chickMaze' },
  { id: 'DADDY_PIG', title: 'Daddy Pig', sub: 'Speed frenzy test!', badge: 'Frenzy', color: '#B2EBF2', borderColor: '#4DD0E1', scoreKey: 'daddyPig' },
  { id: 'DINOSAUR_BALLOON', title: 'Dino Balloons', sub: 'Pop dino balloons!', badge: 'Pop', color: '#D1C4E9', borderColor: '#9575CD', scoreKey: 'dinosaurBalloon' },
  { id: 'PANCAKE_FLIPPER', title: 'Pancake Flip', sub: 'Flip & stack high!', badge: 'Chef', color: '#FFE0B2', borderColor: '#FFB74D', scoreKey: 'pancakeFlipper' },
  { id: 'VEGETABLE_HARVEST', title: 'Garden Harvest', sub: 'Pull giant veggies!', badge: 'Garden', color: '#DCEDC8', borderColor: '#AED581', scoreKey: 'vegetableHarvest' },
  { id: 'HOPSCOTCH_BUBBLE', title: 'Suzy Hopscotch', sub: 'Hop & pop bubbles!', badge: 'Bubbles', color: '#F8BBD0', borderColor: '#F06292', scoreKey: 'hopscotchBubble' }
];

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
    const cards: ModeCardDef[] = [];

    if (isPortrait) {
      // 2 columns x 4 rows
      const padX = 14;
      const gapX = 12;
      const cardW = (vWidth - padX * 2 - gapX) / 2;
      const titleAreaH = Math.max(70, Math.min(90, vHeight * 0.09));
      const bottomPad = 20;
      const gridH = vHeight - titleAreaH - bottomPad;
      const gapY = 10;
      const cardH = (gridH - 3 * gapY) / 4;

      for (let i = 0; i < MENU_CARDS.length; i++) {
        const info = MENU_CARDS[i];
        const col = i % 2;
        const row = Math.floor(i / 2);
        const x = padX + cardW / 2 + col * (cardW + gapX);
        const y = titleAreaH + cardH / 2 + row * (cardH + gapY);
        cards.push({
          id: info.id,
          title: info.title,
          sub: info.sub,
          badge: info.badge,
          color: info.color,
          x,
          y,
          w: cardW,
          h: cardH
        });
      }
    } else {
      // 4 columns x 2 rows (Landscape 16:9)
      const padX = 20;
      const gapX = 14;
      const cardW = (vWidth - padX * 2 - 3 * gapX) / 4;
      const titleAreaH = 68;
      const bottomPad = 18;
      const gridH = vHeight - titleAreaH - bottomPad;
      const gapY = 12;
      const cardH = (gridH - gapY) / 2;

      for (let i = 0; i < MENU_CARDS.length; i++) {
        const info = MENU_CARDS[i];
        const col = i % 4;
        const row = Math.floor(i / 4);
        const x = padX + cardW / 2 + col * (cardW + gapX);
        const y = titleAreaH + cardH / 2 + row * (cardH + gapY);
        cards.push({
          id: info.id,
          title: info.title,
          sub: info.sub,
          badge: info.badge,
          color: info.color,
          x,
          y,
          w: cardW,
          h: cardH
        });
      }
    }

    return cards;
  }

  handleTap(x: number, y: number): boolean {
    const cards = this.getModeCards(this.game.display);
    for (const card of cards) {
      if (
        x >= card.x - card.w / 2 - 6 &&
        x <= card.x + card.w / 2 + 6 &&
        y >= card.y - card.h / 2 - 6 &&
        y <= card.y + card.h / 2 + 6
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

  private renderCharacterPreview(
    ctx: CanvasRenderingContext2D,
    modeId: GameModeId,
    cx: number,
    cy: number,
    cardW: number
  ): void {
    const time = this.time;
    const charScale = Math.min(0.42, Math.max(0.32, cardW / 560));

    if (modeId === 'EGG_LAYING') {
      // Mini straw nest & golden egg
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

      drawMrsChicken(ctx, cx - 4, cy, charScale * 0.95, {
        squash: 1.0 + Math.sin(time * 4) * 0.1,
        flap: Math.sin(time * 6) * 0.22,
        headBob: Math.sin(time * 3) * 2,
        eyeBlink: Math.sin(time * 1.8) > 0.88
      });
    } else if (modeId === 'MUDDY_PUDDLES') {
      const jumpPhase = Math.abs(Math.sin(time * 4.5));
      const jumpY = -jumpPhase * 16;
      const squish = jumpPhase < 0.12 ? 0.82 : 1.0 + (1 - jumpPhase) * 0.12;

      ctx.fillStyle = '#6D4C41';
      ctx.beginPath();
      ctx.ellipse(cx, cy + 22, 22, 7, 0, 0, Math.PI * 2);
      ctx.fill();

      if (jumpPhase < 0.25) {
        ctx.fillStyle = '#795548';
        ctx.beginPath();
        ctx.arc(cx - 15, cy + 16, 2.5, 0, Math.PI * 2);
        ctx.arc(cx + 15, cy + 15, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      drawPeppaPig(ctx, cx, cy, charScale * 0.95, {
        jumpY,
        squish,
        squash: squish,
        muddyBoots: true,
        armWave: Math.sin(time * 5) * 0.3,
        eyeBlink: Math.sin(time * 2) > 0.85
      });
    } else if (modeId === 'CHICK_MAZE') {
      ctx.fillStyle = '#FDD835';
      ctx.beginPath();
      ctx.arc(cx - 16, cy + 18, 2.5, 0, Math.PI * 2);
      ctx.arc(cx - 8, cy + 20, 2.0, 0, Math.PI * 2);
      ctx.arc(cx + 14, cy + 19, 2.2, 0, Math.PI * 2);
      ctx.fill();

      drawBabyChick(ctx, cx, cy, charScale * 1.3, {
        walkCycle: time * 8,
        isPeeping: Math.sin(time * 3.5) > 0.3,
        hopY: Math.sin(time * 8) * 2.5,
        eyeBlink: Math.sin(time * 1.7) > 0.9
      });
    } else if (modeId === 'DADDY_PIG') {
      const panic = Math.floor((time * 0.7) % 4);
      drawDaddyPig(ctx, cx, cy - 4, charScale * 0.9, {
        panicStage: panic,
        time,
        sweatCount: panic > 0 ? panic * 2 : 0,
        eyeBlink: Math.sin(time * 2.2) > 0.85
      });
    } else if (modeId === 'DINOSAUR_BALLOON') {
      const dinoChomp = Math.abs(Math.sin(time * 5.5));
      const balloonBob = Math.sin(time * 3) * 5;

      ctx.save();
      ctx.fillStyle = '#4CAF50';
      ctx.strokeStyle = '#2E7D32';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(cx + 22, cy - 18 + balloonBob, 9, 11, 0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.beginPath();
      ctx.arc(cx + 19, cy - 21 + balloonBob, 2.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#81C784';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(cx + 22, cy - 7 + balloonBob);
      ctx.quadraticCurveTo(cx + 26, cy + 6, cx + 16, cy + 12);
      ctx.stroke();
      ctx.restore();

      drawGeorgePig(ctx, cx - 6, cy, charScale * 0.95, {
        holdingDino: true,
        dinoChomp,
        jumpY: Math.sin(time * 3.5) * 3,
        expression: 'happy',
        eyeBlink: Math.sin(time * 2) > 0.88
      });
    } else if (modeId === 'PANCAKE_FLIPPER') {
      const flipCycle = (time * 2.2) % (Math.PI * 2);
      const pancakeFlight = Math.sin(flipCycle);
      const panAngle = pancakeFlight > 0 ? pancakeFlight * 0.25 : 0;

      drawMummyPig(ctx, cx - 10, cy, charScale * 0.9, {
        holdingPan: true,
        panAngle,
        smiling: true,
        eyeBlink: Math.sin(time * 1.6) > 0.85
      });

      if (pancakeFlight > 0.05) {
        ctx.save();
        ctx.translate(cx + 22, cy - 8 - pancakeFlight * 26);
        ctx.rotate(flipCycle * 2.5);
        ctx.fillStyle = '#FFA726';
        ctx.strokeStyle = '#E65100';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(0, 0, 10, 3.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
    } else if (modeId === 'VEGETABLE_HARVEST') {
      const pullTension = (Math.sin(time * 3.2) + 1) * 0.5;

      ctx.fillStyle = '#5D4037';
      ctx.beginPath();
      ctx.ellipse(cx + 20, cy + 22, 16, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#43A047';
      ctx.beginPath();
      ctx.arc(cx + 20, cy + 16 - pullTension * 6, 4, 0, Math.PI * 2);
      ctx.fill();

      drawGrandpaPig(ctx, cx - 8, cy, charScale * 0.88, {
        pulling: true,
        pullTension,
        welliesMuddy: true,
        eyeBlink: Math.sin(time * 2.1) > 0.85
      });
    } else if (modeId === 'HOPSCOTCH_BUBBLE') {
      const hopCycle = (time * 4) % (Math.PI * 2);
      const hopY = -Math.abs(Math.sin(hopCycle)) * 12;
      const bubBob = Math.sin(time * 3) * 5;

      ctx.save();
      ctx.fillStyle = 'rgba(187, 222, 251, 0.45)';
      ctx.strokeStyle = 'rgba(33, 150, 243, 0.85)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx + 24, cy - 14 + bubBob, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(cx + 21, cy - 17 + bubBob, 2.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      drawSuzySheep(ctx, cx - 6, cy, charScale * 0.92, {
        hopY,
        earFlap: Math.sin(hopCycle) * 0.28,
        holdingWand: true,
        blowingBubble: true,
        eyeBlink: Math.sin(time * 1.9) > 0.85
      });
    }
  }

  render(ctx: CanvasRenderingContext2D, _alpha: number, display: DisplayManager): void {
    const isPortrait = display.isPortrait;
    const vWidth = display.vWidth;
    const vHeight = display.vHeight;

    drawLandscapeSkyHills(ctx, vWidth, vHeight, this.time);

    // Title Banner
    ctx.save();
    const titleBob = Math.sin(this.time * 2.5) * 3;
    const titleX = vWidth / 2;
    const titleY = (isPortrait ? Math.max(34, vHeight * 0.045) : 34) + titleBob;
    ctx.translate(titleX, titleY);
    ctx.font = `900 ${isPortrait ? '26px' : '32px'} "Comic Sans MS", cursive, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = isPortrait ? 5 : 6;
    ctx.strokeText('Peppa Pig: Happy Mrs Chicken', 0, 0);
    ctx.fillStyle = '#FFE600';
    ctx.fillText('Peppa Pig: Happy Mrs Chicken', 0, 0);
    ctx.restore();

    // Mode Cards Grid
    const cards = this.getModeCards(display);
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      const info = MENU_CARDS[i];
      const bestScore = this.game.storage.getHighScore(info.scoreKey);

      ctx.save();
      ctx.translate(card.x, card.y);

      // Drop Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
      ctx.beginPath();
      ctx.roundRect(-card.w / 2, -card.h / 2 + 4, card.w, card.h, 16);
      ctx.fill();

      // Card Background
      ctx.fillStyle = card.color;
      ctx.strokeStyle = info.borderColor;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.roundRect(-card.w / 2, -card.h / 2, card.w, card.h, 16);
      ctx.fill();
      ctx.stroke();

      // Category Badge (Top-Left)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.beginPath();
      ctx.roundRect(-card.w / 2 + 8, -card.h / 2 + 6, 56, 18, 9);
      ctx.fill();
      ctx.font = 'bold 10px "Comic Sans MS", sans-serif';
      ctx.fillStyle = '#37474F';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(card.badge, -card.w / 2 + 36, -card.h / 2 + 15);

      // Best Score Badge (Top-Right)
      ctx.fillStyle = '#E53935';
      ctx.strokeStyle = '#B71C1C';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(card.w / 2 - 76, -card.h / 2 + 6, 68, 18, 9);
      ctx.fill();
      ctx.stroke();

      ctx.font = 'bold 10px "Comic Sans MS", sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`★ ${bestScore}`, card.w / 2 - 42, -card.h / 2 + 15);

      // Character Preview (Center)
      const previewY = -card.h * 0.06;
      this.renderCharacterPreview(ctx, card.id, 0, previewY, card.w);

      // Title & Subtitle Labels (Bottom)
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = 'bold 15px "Comic Sans MS", cursive, sans-serif';
      ctx.fillStyle = '#212121';
      ctx.fillText(card.title, 0, card.h / 2 - 28);

      ctx.font = '11px "Comic Sans MS", sans-serif';
      ctx.fillStyle = '#546E7A';
      ctx.fillText(card.sub, 0, card.h / 2 - 13);

      ctx.restore();
    }
  }
}
