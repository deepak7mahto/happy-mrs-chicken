/**
 * Menu Arcade Data & Character Preview Renderers
 * Adventures of Trishu Mini-Game Suite (15 Games)
 * Strictly under 500 Lines of Code
 */

import { GameModeId } from '../types/game';
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

export interface MenuCardInfo {
  id: GameModeId;
  title: string;
  sub: string;
  badge: string;
  color: string;
  borderColor: string;
  scoreKey: string;
}

export const MENU_CARDS: MenuCardInfo[] = [
  { id: 'EGG_LAYING', title: 'Mrs Clucky', sub: 'Lay & hatch eggs!', badge: 'Classic', color: '#FFF9C4', borderColor: '#FBC02D', scoreKey: 'eggLaying' },
  { id: 'MUDDY_PUDDLES', title: 'Puddle Splash', sub: 'Jump & splash!', badge: 'Splash', color: '#FFCDD2', borderColor: '#E57373', scoreKey: 'muddyPuddles' },
  { id: 'CHICK_MAZE', title: 'Chick Trail', sub: 'Guide lost chicks!', badge: 'Puzzle', color: '#C8E6C9', borderColor: '#81C784', scoreKey: 'chickMaze' },
  { id: 'DADDY_PIG', title: "Dad's Kitchen", sub: 'Breakfast frenzy!', badge: 'Frenzy', color: '#B2EBF2', borderColor: '#4DD0E1', scoreKey: 'daddyPig' },
  { id: 'DINOSAUR_BALLOON', title: 'Balloon Pop', sub: 'Pop all balloons!', badge: 'Pop', color: '#D1C4E9', borderColor: '#9575CD', scoreKey: 'dinosaurBalloon' },
  { id: 'PANCAKE_FLIPPER', title: 'Pancake Flip', sub: 'Flip & stack high!', badge: 'Chef', color: '#FFE0B2', borderColor: '#FFB74D', scoreKey: 'pancakeFlipper' },
  { id: 'VEGETABLE_HARVEST', title: 'Veggie Harvest', sub: 'Pull giant veggies!', badge: 'Garden', color: '#DCEDC8', borderColor: '#AED581', scoreKey: 'vegetableHarvest' },
  { id: 'HOPSCOTCH_BUBBLE', title: 'Bubble Hop', sub: 'Hop & pop bubbles!', badge: 'Bubbles', color: '#F8BBD0', borderColor: '#F06292', scoreKey: 'hopscotchBubble' },
  { id: 'MIX_MATCH', title: 'Body Shuffler', sub: 'Mix funny bodies!', badge: 'Funny', color: '#E1BEE7', borderColor: '#BA68C8', scoreKey: 'mixMatch' },
  { id: 'PEEK_A_BOO', title: 'Peek-a-Boo', sub: 'Find cute friends!', badge: 'Toddler', color: '#E8F5E9', borderColor: '#66BB6A', scoreKey: 'peekABoo' },
  { id: 'ICE_CREAM_VAN', title: 'Ice Cream Van', sub: 'Scoop sweet towers!', badge: 'Sweet', color: '#FCE4EC', borderColor: '#F06292', scoreKey: 'iceCreamVan' },
  { id: 'LITTLE_TRAIN', title: 'Little Train', sub: 'Choo-choo rides!', badge: 'Train', color: '#E3F2FD', borderColor: '#42A5F5', scoreKey: 'littleTrain' },
  { id: 'CAR_WASH', title: 'Car Wash', sub: 'Scrub bubbles clean!', badge: 'Bubbles', color: '#E0F7FA', borderColor: '#26C6DA', scoreKey: 'carWash' },
  { id: 'WINDY_KITE', title: 'Windy Kite', sub: 'Swoop through clouds!', badge: 'Breeze', color: '#FFF8E1', borderColor: '#FFA726', scoreKey: 'windyKite' },
  { id: 'RAINBOW_GARDEN', title: 'Rainbow Garden', sub: 'Water giant flowers!', badge: 'Nature', color: '#F1F8E9', borderColor: '#7CB342', scoreKey: 'rainbowGarden' }
];

export function renderMenuCharacterPreview(
  ctx: CanvasRenderingContext2D,
  modeId: GameModeId,
  cx: number,
  cy: number,
  cardW: number,
  time: number
): void {
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
  } else if (modeId === 'ICE_CREAM_VAN') {
    // Mini Ice Cream Cone Preview
    ctx.fillStyle = '#FFB74D';
    ctx.beginPath();
    ctx.moveTo(cx - 14, cy + 6);
    ctx.lineTo(cx + 14, cy + 6);
    ctx.lineTo(cx, cy + 30);
    ctx.closePath();
    ctx.fill();
    // Scoops
    ctx.fillStyle = '#FF80AB';
    ctx.beginPath();
    ctx.arc(cx, cy, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFEE58';
    ctx.beginPath();
    ctx.arc(cx, cy - 12, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#D50000';
    ctx.beginPath();
    ctx.arc(cx, cy - 23, 4, 0, Math.PI * 2);
    ctx.fill();
  } else if (modeId === 'LITTLE_TRAIN') {
    // Little Train Preview
    ctx.fillStyle = '#E53935';
    ctx.strokeStyle = '#B71C1C';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(cx - 24, cy - 10, 48, 26, 6);
    ctx.fill();
    ctx.stroke();
    // Smokestack & puffs
    ctx.fillStyle = '#424242';
    ctx.fillRect(cx + 10, cy - 20, 8, 12);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.arc(cx + 14, cy - 25, 6, 0, Math.PI * 2);
    ctx.fill();
    // Wheels
    ctx.fillStyle = '#212121';
    ctx.beginPath();
    ctx.arc(cx - 12, cy + 18, 8, 0, Math.PI * 2);
    ctx.arc(cx + 12, cy + 18, 8, 0, Math.PI * 2);
    ctx.fill();
  } else if (modeId === 'CAR_WASH') {
    // Red car with soap bubbles preview
    ctx.fillStyle = '#E53935';
    ctx.beginPath();
    ctx.roundRect(cx - 25, cy - 4, 50, 20, 6);
    ctx.fill();
    ctx.fillStyle = '#B3E5FC';
    ctx.beginPath();
    ctx.roundRect(cx - 14, cy - 16, 28, 14, 4);
    ctx.fill();
    // Bubbles
    ctx.strokeStyle = '#4FC3F7';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx - 12, cy - 20, 6, 0, Math.PI * 2);
    ctx.arc(cx + 10, cy - 22, 7, 0, Math.PI * 2);
    ctx.stroke();
  } else if (modeId === 'WINDY_KITE') {
    // Diamond Kite with Bows Preview
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(Math.sin(time * 3) * 0.15);
    ctx.fillStyle = '#FF1744';
    ctx.beginPath();
    ctx.moveTo(0, -18);
    ctx.lineTo(14, 0);
    ctx.lineTo(0, 18);
    ctx.lineTo(-14, 0);
    ctx.closePath();
    ctx.fill();
    // Tail
    ctx.strokeStyle = '#FFD600';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 18);
    ctx.lineTo(6, 26);
    ctx.lineTo(-4, 34);
    ctx.stroke();
    ctx.restore();
  } else if (modeId === 'RAINBOW_GARDEN') {
    // Giant Smiling Flower Preview
    ctx.save();
    ctx.translate(cx, cy);
    const petals = 6;
    for (let p = 0; p < petals; p++) {
      const a = (p * Math.PI * 2) / petals;
      ctx.fillStyle = '#FF4081';
      ctx.beginPath();
      ctx.arc(Math.cos(a) * 12, Math.sin(a) * 12, 7, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#FFD600';
    ctx.beginPath();
    ctx.arc(0, 0, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
