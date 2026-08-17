/**
 * Mode 8: Suzy Sheep's Hopscotch & Bubble Trail
 * Peppa Pig: Happy Mrs Chicken 8-Game Deluxe Expansion Suite
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
import { drawSuzySheep } from '../graphics/characters/suzySheepRenderer';
import { drawPeppaPig } from '../graphics/characters/peppaRenderer';
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
  public peppaAnimState: CharacterAnimState;

  public suzy = {
    x: 100, y: 400, currentSquare: 1, targetSquare: 1,
    isHopping: false, hopTimer: 0, hopDuration: 0.38,
    startX: 100, startY: 400, targetX: 100, targetY: 400
  };

  private spawnTimer: number = 0;

  constructor(game: GameEngine) {
    super(game);
    this.particles = new ParticleEngine(150);
    this.animState = createCharacterAnimState();
    this.peppaAnimState = createCharacterAnimState();
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
    this.peppaAnimState = createCharacterAnimState();

    this.initTiles();
    this.resetSuzyPosition();

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
        const offset = Math.sin((i - 1) * 0.8) * 80;
        this.tiles.push({
          index: i,
          x: vWidth * 0.5 + offset,
          y: startY - (i - 1) * stepY,
          w: 52, h: 46,
          color: CHALK_COLORS[(i - 1) % CHALK_COLORS.length]
        });
      }
    } else {
      const startX = 140;
      const endX = vWidth - 220;
      const stepX = (endX - startX) / (totalTiles - 1);
      const baseY = vHeight * 0.72;
      for (let i = 1; i <= totalTiles; i++) {
        const offset = Math.sin((i - 1) * 0.9) * 35;
        this.tiles.push({
          index: i,
          x: startX + (i - 1) * stepX,
          y: baseY + offset,
          w: 50, h: 46,
          color: CHALK_COLORS[(i - 1) % CHALK_COLORS.length]
        });
      }
    }
  }

  private resetSuzyPosition(): void {
    const firstTile = this.tiles[0];
    const x = firstTile ? firstTile.x : 100;
    const y = firstTile ? firstTile.y : 400;
    this.suzy.currentSquare = 1;
    this.suzy.targetSquare = 1;
    this.suzy.isHopping = false;
    this.suzy.hopTimer = 0;
    this.suzy.x = x;
    this.suzy.y = y;
    this.suzy.startX = x;
    this.suzy.startY = y;
    this.suzy.targetX = x;
    this.suzy.targetY = y;
  }

  private spawnBubble(customY?: number): void {
    const vWidth = this.game.display.vWidth;
    const vHeight = this.game.display.vHeight;
    const margin = 50;
    const x = margin + Math.random() * (vWidth - margin * 2);
    const y = customY !== undefined ? customY : vHeight + 35;
    const radius = 22 + Math.random() * 12;
    const vy = -(30 + Math.random() * 25);
    this.bubbles.push({
      x, y, radius, vy,
      wobbleOffset: Math.random() * Math.PI * 2,
      popped: false
    });
  }

  public advanceSuzy(): void {
    if (this.suzy.isHopping || this.suzy.currentSquare >= 10) return;
    const nextIdx = this.suzy.currentSquare + 1;
    const targetTile = this.tiles.find(t => t.index === nextIdx);
    if (!targetTile) return;

    this.suzy.isHopping = true;
    this.suzy.hopTimer = 0;
    this.suzy.targetSquare = nextIdx;
    this.suzy.startX = this.suzy.x;
    this.suzy.startY = this.suzy.y;
    this.suzy.targetX = targetTile.x;
    this.suzy.targetY = targetTile.y;
    soundEngine.playSFX('sheepBleat');
    Haptics.tap();
  }

  private popBubble(index: number): void {
    const b = this.bubbles[index];
    if (!b || b.popped) return;
    b.popped = true;
    this.bubblesPoppedCount++;
    this.score += 50;
    soundEngine.playSFX('bubblePop');
    soundEngine.playSFX('sheepBleat');
    Haptics.tap();
    this.particles.spawnSoapBubbles(b.x, b.y, 8);
    this.particles.spawnSparkles(b.x, b.y, 6);
    this.particles.spawnScorePopup(b.x, b.y - 20, '+50 🫧');
    this.advanceSuzy();
  }

  private triggerPicnicCelebration(): void {
    this.isCelebrating = true;
    this.celebrationTimer = 0;
    this.score += 500;
    soundEngine.playSFX('fanfare');
    soundEngine.playSFX('sheepBleat');
    soundEngine.playSFX('toddlerGiggle');
    Haptics.fanfare();

    const isPortrait = this.game.display.isPortrait;
    const vWidth = this.game.display.vWidth;
    const vHeight = this.game.display.vHeight;
    const picnicX = isPortrait ? vWidth * 0.5 : vWidth - 110;
    const picnicY = isPortrait ? vHeight * 0.18 : vHeight * 0.7;
    this.particles.spawnConfetti(picnicX, picnicY, 35);
    this.particles.spawnSparkles(picnicX, picnicY, 15);
    this.particles.spawnScorePopup(picnicX, picnicY - 35, '🧺 Picnic Party! 🎉 +500');
    this.game.storage.saveHighScore('hopscotchBubble', this.score);
  }

  update(dt: number, input: InputManager): void {
    this.time += dt;
    this.spawnTimer += dt;
    this.animState = updateCharacterAnimState(this.animState, dt);
    this.peppaAnimState = updateCharacterAnimState(this.peppaAnimState, dt);

    if (this.isCelebrating) {
      this.celebrationTimer += dt;
      if (this.celebrationTimer >= 3.8) {
        this.isCelebrating = false;
        this.resetSuzyPosition();
      }
    }

    if (this.suzy.isHopping) {
      this.suzy.hopTimer += dt;
      const u = Math.min(1.0, this.suzy.hopTimer / this.suzy.hopDuration);
      this.suzy.x = this.suzy.startX + (this.suzy.targetX - this.suzy.startX) * u;
      this.suzy.y = this.suzy.startY + (this.suzy.targetY - this.suzy.startY) * u;
      if (u >= 1.0) {
        this.suzy.isHopping = false;
        this.suzy.currentSquare = this.suzy.targetSquare;
        this.particles.spawnSparkles(this.suzy.x, this.suzy.y + 20, 5);
        if (this.suzy.currentSquare >= 10 && !this.isCelebrating) {
          this.triggerPicnicCelebration();
        }
      }
    }

    if (this.bubbles.filter(b => !b.popped).length < 8 && this.spawnTimer >= 0.8) {
      this.spawnBubble();
      this.spawnTimer = 0;
    }

    for (let i = 0; i < this.bubbles.length; i++) {
      const b = this.bubbles[i];
      if (b.popped) continue;
      b.y += b.vy * dt;
      b.wobbleOffset += 2.4 * dt;
      b.x += Math.sin(b.wobbleOffset) * 18 * dt;
    }
    this.bubbles = this.bubbles.filter(b => !b.popped && b.y > -60);

    const pointersToCheck: Array<{ x: number; y: number }> = [];
    for (const ptr of input.pointers.values()) {
      if (ptr.justPressed) pointersToCheck.push({ x: ptr.x, y: ptr.y });
    }
    if (input.actionJustPressed) {
      pointersToCheck.push({ x: input.primaryPointer.x, y: input.primaryPointer.y });
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
      if (!hitBubble && !this.suzy.isHopping) this.advanceSuzy();
    }

    if (input.isKeyJustPressed('Space') || input.isKeyJustPressed('ArrowRight')) {
      if (this.bubbles.length > 0 && !this.bubbles[0].popped) this.popBubble(0);
      else this.advanceSuzy();
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

    const peppaX = isPortrait ? picnicX + 65 : picnicX + 45;
    const peppaY = isPortrait ? picnicY - 20 : picnicY - 35;
    drawPeppaPig(ctx, peppaX, peppaY, isPortrait ? 1.05 : 1.0, {
      expression: this.isCelebrating ? 'excited' : 'happy',
      eyeBlink: this.peppaAnimState.isBlinking,
      facingLeft: true,
      animState: this.peppaAnimState
    });

    const hopProgress = this.suzy.isHopping ? this.suzy.hopTimer / this.suzy.hopDuration : 0;
    const hopArt = getHopscotchPhase(hopProgress);
    drawSuzySheep(ctx, this.suzy.x, this.suzy.y + hopArt.hopY, isPortrait ? 1.15 : 1.1, {
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

    ctx.fillStyle = '#8D6E63';
    ctx.beginPath();
    ctx.roundRect(-24, -10, 48, 22, 4);
    ctx.fill();

    ctx.fillStyle = '#FF4081';
    ctx.beginPath();
    ctx.arc(-8, -14, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#76FF03';
    ctx.beginPath();
    ctx.arc(8, -14, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  private drawBubble(ctx: CanvasRenderingContext2D, b: BubbleEntity): void {
    ctx.save();
    ctx.translate(b.x, b.y);
    const r = b.radius;
    const grad = ctx.createRadialGradient(-r * 0.2, -r * 0.2, r * 0.1, 0, 0, r);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
    grad.addColorStop(0.5, 'rgba(128, 216, 255, 0.45)');
    grad.addColorStop(0.8, 'rgba(234, 128, 252, 0.4)');
    grad.addColorStop(1, 'rgba(255, 128, 171, 0.55)');

    ctx.fillStyle = grad;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.beginPath();
    ctx.ellipse(-r * 0.38, -r * 0.38, r * 0.25, r * 0.15, -Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  private renderHUD(ctx: CanvasRenderingContext2D, display: DisplayManager): void {
    const isPortrait = display.isPortrait;
    const scoreX = display.vWidth / 2;
    const scoreY = isPortrait ? 76 : Math.max(18, display.vHeight * 0.035);
    const badgeW = isPortrait ? 300 : 270;
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
    ctx.fillText(`🫧 Tile: ${this.suzy.currentSquare}/10  |  Score: ${this.score}`, scoreX, scoreY + badgeH / 2);

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
      suzy: { x: this.suzy.x, y: this.suzy.y },
      currentTile: this.suzy.currentSquare,
      totalTiles: 10,
      isHopping: this.suzy.isHopping,
      isCelebrating: this.isCelebrating,
      eggs: [], chicks: [], puddles: [], seeds: [],
      particles: this.particles.active
    };
  }

  override getModeState(): Record<string, unknown> {
    return {
      score: this.score,
      currentTile: this.suzy.currentSquare,
      targetTile: this.suzy.targetSquare,
      totalTiles: 10,
      isHopping: this.suzy.isHopping,
      isCelebrating: this.isCelebrating,
      reachedPicnic: this.suzy.currentSquare >= 10,
      bubblesPopped: this.bubblesPoppedCount,
      timer: this.time,
      multiplier: 1,
      feverMeter: 0,
      coopSavedCount: 0,
      isOverheating: false
    };
  }
}
