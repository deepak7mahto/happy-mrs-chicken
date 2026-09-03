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
      // 2 columns x 5 rows
      const padX = 14;
      const gapX = 10;
      const cardW = (vWidth - padX * 2 - gapX) / 2;
      const titleAreaH = Math.max(65, Math.min(85, vHeight * 0.08));
      const bottomPad = 12;
      const gridH = vHeight - titleAreaH - bottomPad;
      const gapY = 8;
      const cardH = (gridH - 4 * gapY) / 5;

      for (let i = 0; i < MENU_CARDS.length; i++) {
        const info = MENU_CARDS[i];
        const col = i % 2;
        const row = Math.floor(i / 2);
        const x = padX + cardW / 2 + col * (cardW + gapX);
        const y = titleAreaH + cardH / 2 + row * (cardH + gapY);
        cards.push({ id: info.id, title: info.title, sub: info.sub, badge: info.badge, color: info.color, x, y, w: cardW, h: cardH });
      }
    } else {
      // 5 columns x 2 rows (Landscape 16:9)
      const padX = 20;
      const gapX = 12;
      const cols = 5;
      const rows = 2;
      const cardW = (vWidth - padX * 2 - (cols - 1) * gapX) / cols;
      const titleAreaH = 55;
      const bottomPad = 14;
      const gridH = vHeight - titleAreaH - bottomPad;
      const gapY = 12;
      const cardH = (gridH - (rows - 1) * gapY) / rows;

      for (let i = 0; i < MENU_CARDS.length; i++) {
        const info = MENU_CARDS[i];
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = padX + cardW / 2 + col * (cardW + gapX);
        const y = titleAreaH + cardH / 2 + row * (cardH + gapY);
        cards.push({ id: info.id, title: info.title, sub: info.sub, badge: info.badge, color: info.color, x, y, w: cardW, h: cardH });
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
      const jumpPhase = Math.abs(Math.sin(time * 4.5));
      const jumpY = -jumpPhase * 16;
      const squish = jumpPhase < 0.12 ? 0.82 : 1.0 + (1 - jumpPhase) * 0.12;

      ctx.fillStyle = '#6D4C41';
      ctx.beginPath();
      ctx.ellipse(cx, cy + 22, 22, 7, 0, 0, Math.PI * 2);
      ctx.fill();

      drawTrishu(ctx, cx, cy, charScale * 0.95, {
        jumpY,
        squish,
        squash: squish,
        muddyBoots: true,
        armWave: Math.sin(time * 5) * 0.3,
        eyeBlink: Math.sin(time * 2) > 0.85
      });
    } else if (modeId === 'CHICK_MAZE') {
      drawBabyChick(ctx, cx, cy, charScale * 1.3, {
        walkCycle: time * 8,
        isPeeping: Math.sin(time * 3.5) > 0.3,
        hopY: Math.sin(time * 8) * 2.5,
        eyeBlink: Math.sin(time * 1.7) > 0.9
      });
    } else if (modeId === 'DADDY_PIG') {
      const panic = Math.floor((time * 0.7) % 4);
      drawDad(ctx, cx, cy - 4, charScale * 0.9, {
        panicStage: panic,
        time,
        sweatCount: panic > 0 ? panic * 2 : 0,
        eyeBlink: Math.sin(time * 2.2) > 0.85
      });
    } else if (modeId === 'DINOSAUR_BALLOON') {
      drawLeo(ctx, cx - 6, cy, charScale * 0.95, {
        holdingDino: true,
        dinoChomp: Math.abs(Math.sin(time * 5.5)),
        jumpY: Math.sin(time * 3.5) * 3,
        expression: 'happy',
        eyeBlink: Math.sin(time * 2) > 0.88
      });
    } else if (modeId === 'PANCAKE_FLIPPER') {
      const flipCycle = (time * 2.2) % (Math.PI * 2);
      const pancakeFlight = Math.sin(flipCycle);
      drawMom(ctx, cx - 10, cy, charScale * 0.9, {
        holdingPan: true,
        panAngle: pancakeFlight > 0 ? pancakeFlight * 0.25 : 0,
        smiling: true,
        eyeBlink: Math.sin(time * 1.6) > 0.85
      });
    } else if (modeId === 'VEGETABLE_HARVEST') {
      drawGrandpa(ctx, cx - 8, cy, charScale * 0.88, {
        pulling: true,
        pullTension: (Math.sin(time * 3.2) + 1) * 0.5,
        welliesMuddy: true,
        eyeBlink: Math.sin(time * 2.1) > 0.85
      });
    } else if (modeId === 'HOPSCOTCH_BUBBLE') {
      const hopCycle = (time * 4) % (Math.PI * 2);
      drawMimi(ctx, cx - 6, cy, charScale * 0.92, {
        hopY: -Math.abs(Math.sin(hopCycle)) * 12,
        earFlap: Math.sin(hopCycle) * 0.28,
        holdingWand: true,
        blowingBubble: true,
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
      // Mini bush covering
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

    drawLandscapeSkyHills(ctx, vWidth, vHeight, this.time);

    // Title Banner
    ctx.save();
    const titleBob = Math.sin(this.time * 2.5) * 3;
    const titleX = vWidth / 2;
    const titleY = (isPortrait ? Math.max(34, vHeight * 0.042) : 30) + titleBob;
    ctx.translate(titleX, titleY);
    ctx.font = `900 ${isPortrait ? '28px' : '34px'} "Comic Sans MS", cursive, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = isPortrait ? 5 : 6;
    ctx.strokeText('Adventures of Trishu', 0, 0);
    ctx.fillStyle = '#FFE600';
    ctx.fillText('Adventures of Trishu', 0, 0);
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
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.roundRect(-card.w / 2, -card.h / 2, card.w, card.h, 16);
      ctx.fill();
      ctx.stroke();

      // Category Badge (Top-Left)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.09)';
      ctx.beginPath();
      ctx.roundRect(-card.w / 2 + 6, -card.h / 2 + 5, 58, 20, 10);
      ctx.fill();
      ctx.font = 'bold 11px "Comic Sans MS", sans-serif';
      ctx.fillStyle = '#37474F';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(card.badge, -card.w / 2 + 35, -card.h / 2 + 15);

      // Best Score Badge (Top-Right)
      ctx.fillStyle = '#E53935';
      ctx.strokeStyle = '#B71C1C';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(card.w / 2 - 76, -card.h / 2 + 5, 70, 20, 10);
      ctx.fill();
      ctx.stroke();

      ctx.font = 'bold 12px "Comic Sans MS", sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`★ ${bestScore}`, card.w / 2 - 41, -card.h / 2 + 15);

      // Character Preview (Center)
      const previewY = -card.h * 0.06;
      this.renderCharacterPreview(ctx, card.id, 0, previewY, card.w);

      // Title & Subtitle Labels (Bottom)
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `bold ${isPortrait ? '17px' : '16px'} "Comic Sans MS", cursive, sans-serif`;
      ctx.fillStyle = '#212121';
      ctx.fillText(card.title, 0, card.h / 2 - 26);

      ctx.font = `bold ${isPortrait ? '12px' : '11px'} "Comic Sans MS", sans-serif`;
      ctx.fillStyle = '#455A64';
      ctx.fillText(card.sub, 0, card.h / 2 - 11);

      ctx.restore();
    }
  }
}
