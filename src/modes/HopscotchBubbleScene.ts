/**
 * Mode 8: Rainbow Bubble Hopscotch (Mimi & Trishu)
 * Adventures of Trishu 8-Game Suite
 * Strictly under 500 Lines of Code
 */

import { BaseScene } from './BaseScene';
import { GameEngine } from '../engine/GameEngine';
import { InputManager } from '../engine/InputManager';
import { DisplayManager } from '../engine/DisplayManager';
import { BubbleEntity } from '../types/game';
import { CharacterAnimState } from '../types/characters';
import { ParticleEngine } from '../engine/ParticleEngine';
import { soundEngine } from '../engine/SoundEngine';
import { Haptics } from '../engine/Haptics';
import { drawLandscapeSkyHills } from '../graphics/environmentRenderer';
import { drawMimi } from '../graphics/characters/mimiRenderer';
import { drawTrishu } from '../graphics/characters/trishuRenderer';
import {
  createCharacterAnimState,
  updateCharacterAnimState,
  getHopscotchPhase
} from '../graphics/animations';

interface HopscotchTile {
  index: number;
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
}

const CHALK_COLORS = [
  '#FF80AB', '#80D8FF', '#B388FF', '#FFD180', '#CCFF90',
  '#FFE57F', '#FF8A80', '#A7FFEB', '#EA80FC', '#FFD54F'
];

export class HopscotchBubbleScene extends BaseScene {
  public time: number = 0;
  public bubblesPoppedCount: number = 0;
  public isCelebrating: boolean = false;
  public celebrationTimer: number = 0;
  public bubbles: BubbleEntity[] = [];
  public tiles: HopscotchTile[] = [];
  public particles: ParticleEngine;
  public animState: CharacterAnimState;
  public trishuAnimState: CharacterAnimState;

  public mimi = {
    x: 100, y: 400, currentSquare: 1, targetSquare: 1,
    isHopping: false, hopTimer: 0, hopDuration: 0.38,
    startX: 100, startY: 400, targetX: 100, targetY: 400
  };

  // Backward compatibility alias for suzy
  public get suzy() { return this.mimi; }

  private spawnTimer: number = 0;

  constructor(game: GameEngine) {
    super(game);
    this.particles = new ParticleEngine(150);
    this.animState = createCharacterAnimState();
    this.trishuAnimState = createCharacterAnimState();
  }

  enter(): void {
    this.score = 0;
    this.bubblesPoppedCount = 0;
    this.time = 0;
    this.isCelebrating = false;
    this.celebrationTimer = 0;
    this.bubbles = [];
    this.particles.clear();
    this.animState = createCharacterAnimState();
    this.trishuAnimState = createCharacterAnimState();

    this.initTiles();
    this.resetMimiPosition();

    const vHeight = this.game.display.vHeight;
    for (let i = 0; i < 6; i++) {
      this.spawnBubble(vHeight * 0.2 + i * (vHeight * 0.12));
    }
  }

  exit(): void {
    this.particles.clear();
  }

  private initTiles(): void {
    const isPortrait = this.game.display.isPortrait;
    const vWidth = this.game.display.vWidth;
    const vHeight = this.game.display.vHeight;
    this.tiles = [];
    const totalTiles = 10;

    if (isPortrait) {
      const startY = vHeight * 0.82;
      const endY = vHeight * 0.28;
      const stepY = (startY - endY) / (totalTiles - 1);
      for (let i = 1; i <= totalTiles; i++) {
        const row = i - 1;
        const y = startY - row * stepY;
        let x = vWidth * 0.5;
        let w = 70;
        const h = Math.min(50, stepY * 0.85);

        if (i === 4 || i === 7) x = vWidth * 0.38;
        else if (i === 5 || i === 8) x = vWidth * 0.62;
        if (i === 4 || i === 5 || i === 7 || i === 8) w = 62;

        this.tiles.push({ index: i, x, y, w, h, color: CHALK_COLORS[(i - 1) % CHALK_COLORS.length] });
      }
    } else {
      const startX = vWidth * 0.14;
      const endX = vWidth * 0.72;
      const stepX = (endX - startX) / (totalTiles - 1);
      const baseGroundY = vHeight * 0.74;
      for (let i = 1; i <= totalTiles; i++) {
        const col = i - 1;
        const x = startX + col * stepX;
        let y = baseGroundY;
        const w = Math.min(64, stepX * 0.88);
        let h = 58;

        if (i === 4 || i === 7) y = baseGroundY - 24;
        else if (i === 5 || i === 8) y = baseGroundY + 24;
        if (i === 4 || i === 5 || i === 7 || i === 8) h = 48;

        this.tiles.push({ index: i, x, y, w, h, color: CHALK_COLORS[(i - 1) % CHALK_COLORS.length] });
      }
    }
  }

  private resetMimiPosition(): void {
    if (this.tiles.length > 0) {
      const t1 = this.tiles[0];
      this.mimi.x = t1.x;
      this.mimi.y = t1.y - 12;
      this.mimi.startX = this.mimi.x;
      this.mimi.startY = this.mimi.y;
      this.mimi.targetX = this.mimi.x;
      this.mimi.targetY = this.mimi.y;
      this.mimi.currentSquare = 1;
      this.mimi.targetSquare = 1;
      this.mimi.isHopping = false;
      this.mimi.hopTimer = 0;
    }
  }

  public resetSuzyPosition(): void {
    this.resetMimiPosition();
  }

  private spawnBubble(initialY?: number): void {
    const vWidth = this.game.display.vWidth;
    const vHeight = this.game.display.vHeight;
    const radius = 16 + Math.random() * 16;
    const minX = radius + 20;
    const maxX = vWidth - radius - 20;
    const x = minX + Math.random() * (maxX - minX);
    const y = initialY !== undefined ? initialY : vHeight + radius + 10;
    const vy = -(35 + Math.random() * 45);

    this.bubbles.push({
      x,
      y,
      radius,
      vy,
      wobbleOffset: Math.random() * Math.PI * 2,
      popped: false
    });
  }

  private popBubble(idx: number): void {
    if (idx < 0 || idx >= this.bubbles.length) return;
    const b = this.bubbles[idx];
    if (b.popped) return;
    b.popped = true;
    this.bubblesPoppedCount++;
    this.score += 50;

    soundEngine.playSFX('bubblePop');
    soundEngine.playSFX('bunnySqueak');
    Haptics.tap();

    this.particles.spawnSoapBubbles(b.x, b.y, 8);
    this.particles.spawnSparkles(b.x, b.y, 6);
    this.particles.spawnScorePopup(b.x, b.y - 20, '+50 🫧');
    this.game.storage.saveHighScore('hopscotchBubble', this.score);
  }

  public advanceMimi(): void {
    if (this.mimi.isHopping || this.isCelebrating) return;
    const nextSquare = this.mimi.currentSquare + 1;

    if (nextSquare <= this.tiles.length) {
      const targetTile = this.tiles[nextSquare - 1];
      this.mimi.isHopping = true;
      this.mimi.hopTimer = 0;
      this.mimi.targetSquare = nextSquare;
      this.mimi.startX = this.mimi.x;
      this.mimi.startY = this.mimi.y;
      this.mimi.targetX = targetTile.x;
      this.mimi.targetY = targetTile.y - 12;

      soundEngine.playSFX('click');
      Haptics.medium();

      if (nextSquare === this.tiles.length) {
        this.isCelebrating = true;
        this.celebrationTimer = 3.8;
        this.score += 500;
        soundEngine.playSFX('fanfare');
        soundEngine.playSFX('toddlerGiggle');
        Haptics.fanfare();
        const vWidth = this.game.display.vWidth;
        const vHeight = this.game.display.vHeight;
        this.particles.spawnConfetti(vWidth / 2, vHeight / 2, 40);
        this.particles.spawnSparkles(vWidth / 2, vHeight / 2, 20);
        this.particles.spawnScorePopup(vWidth / 2, vHeight * 0.4, '🧺 Picnic Party! 🎉 +500');
        this.game.storage.saveHighScore('hopscotchBubble', this.score);
      }
    } else {
      this.resetMimiPosition();
    }
  }

  public advanceSuzy(): void {
    this.advanceMimi();
  }

  update(dt: number, input: InputManager): void {
    this.time += dt;
    updateCharacterAnimState(this.animState, dt);
    updateCharacterAnimState(this.trishuAnimState, dt);

    if (this.isCelebrating) {
      this.celebrationTimer -= dt;
      if (this.celebrationTimer <= 0) {
        this.isCelebrating = false;
        this.resetMimiPosition();
      }
    }

    // Mimi Hop Update
    if (this.mimi.isHopping) {
      this.mimi.hopTimer += dt;
      const progress = Math.min(1.0, this.mimi.hopTimer / this.mimi.hopDuration);
      this.mimi.x = this.mimi.startX + (this.mimi.targetX - this.mimi.startX) * progress;
      this.mimi.y = this.mimi.startY + (this.mimi.targetY - this.mimi.startY) * progress;

      if (progress >= 1.0) {
        this.mimi.isHopping = false;
        this.mimi.currentSquare = this.mimi.targetSquare;
        this.mimi.x = this.mimi.targetX;
        this.mimi.y = this.mimi.targetY;
      }
    }

    // Bubbles update
    this.spawnTimer += dt;
    if (this.spawnTimer >= 1.4) {
      this.spawnTimer = 0;
      if (this.bubbles.length < 12) this.spawnBubble();
    }

    for (let i = this.bubbles.length - 1; i >= 0; i--) {
      const b = this.bubbles[i];
      b.y += b.vy * dt;
      b.x += Math.sin(this.time * 2.5 + b.wobbleOffset) * 24 * dt;
      if (b.y < -b.radius - 20) this.bubbles.splice(i, 1);
    }

    // Pointer Taps
    const pointersToCheck: Array<{ x: number; y: number }> = [];
    if (input.isActionJustPressed()) {
      pointersToCheck.push({ x: input.primaryPointer.x, y: input.primaryPointer.y });
    }
    for (const ptr of input.pointers.values()) {
      if (ptr.justPressed) pointersToCheck.push({ x: ptr.x, y: ptr.y });
    }

    for (const pt of pointersToCheck) {
      let hitBubble = false;
      for (let i = this.bubbles.length - 1; i >= 0; i--) {
        const b = this.bubbles[i];
        if (b.popped) continue;
        if (Math.hypot(pt.x - b.x, pt.y - b.y) <= b.radius + 12) {
          this.popBubble(i);
          hitBubble = true;
          break;
        }
      }
      if (!hitBubble && !this.mimi.isHopping) this.advanceMimi();
    }

    if (input.isKeyJustPressed('Space') || input.isKeyJustPressed('ArrowRight')) {
      if (this.bubbles.length > 0 && !this.bubbles[0].popped) this.popBubble(0);
      else this.advanceMimi();
    }

    this.particles.update(dt);
  }

  render(ctx: CanvasRenderingContext2D, alpha: number, display: DisplayManager): void {
    const vWidth = display.vWidth;
    const vHeight = display.vHeight;
    const isPortrait = display.isPortrait;
    drawLandscapeSkyHills(ctx, vWidth, vHeight, this.time);

    for (const tile of this.tiles) this.drawChalkSquare(ctx, tile);

    const picnicX = isPortrait ? vWidth * 0.5 : vWidth - 110;
    const picnicY = isPortrait ? vHeight * 0.18 : vHeight * 0.7;
    this.drawPicnicBlanket(ctx, picnicX, picnicY);

    const trishuX = isPortrait ? picnicX + 65 : picnicX + 45;
    const trishuY = isPortrait ? picnicY - 20 : picnicY - 35;
    drawTrishu(ctx, trishuX, trishuY, isPortrait ? 1.05 : 1.0, {
      expression: this.isCelebrating ? 'excited' : 'happy',
      eyeBlink: this.trishuAnimState.isBlinking,
      facingLeft: true,
      animState: this.trishuAnimState
    });

    const hopProgress = this.mimi.isHopping ? this.mimi.hopTimer / this.mimi.hopDuration : 0;
    const hopArt = getHopscotchPhase(hopProgress);
    drawMimi(ctx, this.mimi.x, this.mimi.y + hopArt.hopY, isPortrait ? 1.15 : 1.1, {
      hopY: hopArt.hopY,
      earFlap: hopArt.earFlap,
      holdingWand: true,
      eyeBlink: this.animState.isBlinking,
      animState: this.animState
    });

    for (const b of this.bubbles) {
      if (b.popped) continue;
      this.drawBubble(ctx, b);
    }

    this.particles.render(ctx);
    this.renderHUD(ctx, display);
  }

  private drawChalkSquare(ctx: CanvasRenderingContext2D, tile: HopscotchTile): void {
    ctx.save();
    ctx.translate(tile.x, tile.y);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
    ctx.strokeStyle = tile.color;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.roundRect(-tile.w / 2, -tile.h / 2, tile.w, tile.h, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 22px "Comic Sans MS", cursive, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${tile.index}`, 0, 1);
    ctx.restore();
  }

  private drawPicnicBlanket(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = '#E53935';
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(0, 10, 65, 30, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Basket
    ctx.fillStyle = '#8D6E63';
    ctx.beginPath();
    ctx.roundRect(-16, -10, 32, 22, 4);
    ctx.fill();
    ctx.fillStyle = '#FF4081';
    ctx.beginPath();
    ctx.arc(0, -10, 14, Math.PI, 0);
    ctx.fill();
    ctx.restore();
  }

  private drawBubble(ctx: CanvasRenderingContext2D, b: BubbleEntity): void {
    ctx.save();
    ctx.translate(b.x, b.y);
    const grad = ctx.createRadialGradient(-b.radius * 0.3, -b.radius * 0.3, b.radius * 0.1, 0, 0, b.radius);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
    grad.addColorStop(0.4, 'rgba(179, 136, 255, 0.35)');
    grad.addColorStop(0.8, 'rgba(100, 200, 250, 0.45)');
    grad.addColorStop(1, 'rgba(255, 128, 171, 0.65)');

    ctx.fillStyle = grad;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.arc(0, 0, b.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Specular Highlight
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(-b.radius * 0.35, -b.radius * 0.35, b.radius * 0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  private renderHUD(ctx: CanvasRenderingContext2D, display: DisplayManager): void {
    const isPortrait = display.isPortrait;
    const scoreX = display.vWidth / 2;
    const scoreY = isPortrait ? 76 : Math.max(18, display.vHeight * 0.035);
    const badgeW = isPortrait ? 300 : 280;
    const badgeH = 46;

    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.roundRect(scoreX - badgeW / 2, scoreY, badgeW, badgeH, 23);
    ctx.fill();
    ctx.strokeStyle = '#B388FF';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 20px "Comic Sans MS", cursive, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`🫧 Tile: ${this.mimi.currentSquare}/10  |  Score: ${this.score}`, scoreX, scoreY + badgeH / 2);

    if (this.isCelebrating) {
      ctx.fillStyle = 'rgba(255, 64, 129, 0.95)';
      ctx.beginPath();
      ctx.roundRect(scoreX - 140, scoreY + 54, 280, 44, 22);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 22px "Comic Sans MS", cursive, sans-serif';
      ctx.fillText('🧺 Picnic Party! 🎉', scoreX, scoreY + 76);
    }
    ctx.restore();
  }

  override getEntities(): Record<string, unknown> {
    return {
      bubbles: this.bubbles.filter(b => !b.popped),
      bubblesCount: this.bubbles.filter(b => !b.popped).length,
      mimi: { x: this.mimi.x, y: this.mimi.y },
      suzy: { x: this.mimi.x, y: this.mimi.y },
      currentTile: this.mimi.currentSquare,
      totalTiles: 10,
      isHopping: this.mimi.isHopping,
      isCelebrating: this.isCelebrating,
      eggs: [], chicks: [], puddles: [], seeds: [],
      particles: this.particles.active
    };
  }

  override getModeState(): Record<string, unknown> {
    return {
      score: this.score,
      currentTile: this.mimi.currentSquare,
      targetTile: this.mimi.targetSquare,
      totalTiles: 10,
      isHopping: this.mimi.isHopping,
      isCelebrating: this.isCelebrating,
      reachedPicnic: this.mimi.currentSquare >= 10,
      bubblesPopped: this.bubblesPoppedCount,
      timer: this.time,
      multiplier: 1,
      feverMeter: 0,
      coopSavedCount: 0,
      isOverheating: false
    };
  }
}
