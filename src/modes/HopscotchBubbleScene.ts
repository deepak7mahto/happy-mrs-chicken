/**
 * Mode 8: Rainbow Bubble Hopscotch (Mimi & Trishu)
 * Adventures of Trishu — Enhanced Sensory Child Bubble Popping Experience
 * Strictly under 500 Lines of Code
 */

import { BaseScene } from './BaseScene';
import { GameEngine } from '../engine/GameEngine';
import { InputManager } from '../engine/InputManager';
import { DisplayManager } from '../engine/DisplayManager';
import { BubbleEntity, BubbleType } from '../types/game';
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
import {
  HopscotchTileDef,
  ParachutingChickDef,
  CHALK_COLORS,
  createHopscotchTiles,
  drawChalkSquare,
  drawPicnicBlanket,
  drawParachutingChick,
  drawBubbleEntity,
  drawBubbleBlowerBtn,
  drawBubbleGameHUD
} from '../graphics/bubbleGameRenderer';

const PENTATONIC_PITCHES = [1.0, 1.122, 1.26, 1.498, 1.682, 2.0];
const COMBO_WORDS = ['Pop! 🫧', 'Super Pop! ⭐', 'Mega Pop! 🌈', 'Bubble Magic! ✨', 'Pop-tastic! 🎉'];

export class HopscotchBubbleScene extends BaseScene {
  public time: number = 0;
  public bubblesPoppedCount: number = 0;
  public isCelebrating: boolean = false;
  public celebrationTimer: number = 0;
  public bubbles: BubbleEntity[] = [];
  public tiles: HopscotchTileDef[] = [];
  public parachutingChicks: ParachutingChickDef[] = [];
  public particles: ParticleEngine;
  public animState: CharacterAnimState;
  public trishuAnimState: CharacterAnimState;

  public combo: number = 0;
  public comboTimer: number = 0;
  private noteIndex: number = 0;
  private spawnTimer: number = 0;
  private bubbleWandPulse: number = 0;

  public mimi = {
    x: 100, y: 400, currentSquare: 1, targetSquare: 1,
    isHopping: false, hopTimer: 0, hopDuration: 0.38,
    startX: 100, startY: 400, targetX: 100, targetY: 400
  };

  public get suzy() { return this.mimi; }

  constructor(game: GameEngine) {
    super(game);
    this.particles = new ParticleEngine(180);
    this.animState = createCharacterAnimState();
    this.trishuAnimState = createCharacterAnimState();
  }

  enter(): void {
    this.score = 0;
    this.bubblesPoppedCount = 0;
    this.time = 0;
    this.combo = 0;
    this.comboTimer = 0;
    this.noteIndex = 0;
    this.isCelebrating = false;
    this.celebrationTimer = 0;
    this.bubbles = [];
    this.parachutingChicks = [];
    this.particles.clear();
    this.animState = createCharacterAnimState();
    this.trishuAnimState = createCharacterAnimState();

    this.tiles = createHopscotchTiles(this.game.display.vWidth, this.game.display.vHeight, this.game.display.isPortrait);
    this.resetMimiPosition();

    const vHeight = this.game.display.vHeight;
    for (let i = 0; i < 9; i++) {
      this.spawnBubble(vHeight * 0.15 + i * (vHeight * 0.09));
    }
  }

  exit(): void {
    this.particles.clear();
    this.parachutingChicks = [];
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

  public spawnBubble(initialY?: number, forcedType?: BubbleType, spawnX?: number, radiusOverride?: number): void {
    const vWidth = this.game.display.vWidth;
    const vHeight = this.game.display.vHeight;

    const roll = Math.random();
    const type: BubbleType = forcedType ?? (roll < 0.5 ? 'RAINBOW' : roll < 0.72 ? 'GIANT' : roll < 0.88 ? 'CHICK' : 'STAR');
    const radius = radiusOverride ?? (type === 'GIANT' ? 34 + Math.random() * 12 : 18 + Math.random() * 14);
    const minX = radius + 20;
    const maxX = vWidth - radius - 20;
    const x = spawnX !== undefined ? spawnX : minX + Math.random() * (maxX - minX);
    const y = initialY !== undefined ? initialY : vHeight + radius + 10;
    const vy = -(32 + Math.random() * 40);

    this.bubbles.push({
      x, y, radius, vy,
      wobbleOffset: Math.random() * Math.PI * 2,
      popped: false,
      type,
      hue: Math.floor(Math.random() * 360)
    });
  }

  public blowBubbleBurst(count: number = 5): void {
    this.bubbleWandPulse = 0.6;
    soundEngine.playSFX('whoosh');
    soundEngine.playSFX('bunnySqueak');
    Haptics.medium();

    const originX = this.mimi.x + 20;
    const originY = this.mimi.y - 15;
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        if (!this.bubbles) return;
        const bX = originX + (Math.random() - 0.5) * 30;
        const bY = originY + (Math.random() - 0.5) * 20;
        this.spawnBubble(bY, i === 0 ? 'GIANT' : i === 1 ? 'CHICK' : 'RAINBOW', bX, 18 + Math.random() * 12);
        this.particles.spawnSoapBubbles(bX, bY, 3);
      }, i * 70);
    }
  }

  public popBubble(idx: number): void {
    if (idx < 0 || idx >= this.bubbles.length) return;
    const b = this.bubbles[idx];
    if (b.popped) return;
    b.popped = true;

    this.bubblesPoppedCount++;
    this.combo++;
    this.comboTimer = 2.2;

    const pitch = PENTATONIC_PITCHES[this.noteIndex % PENTATONIC_PITCHES.length];
    this.noteIndex++;

    let points = 50;
    if (b.type === 'GIANT') {
      points = 120;
      soundEngine.playSFX('bubblePop', { pitch: 0.65, volume: 1.2 });
      this.particles.spawnSoapBubbles(b.x, b.y, 14);
      this.particles.spawnSparkles(b.x, b.y, 10);
      this.spawnBubble(b.y - 10, 'RAINBOW', b.x - 22, 16);
      this.spawnBubble(b.y - 10, 'RAINBOW', b.x + 22, 16);
    } else if (b.type === 'CHICK') {
      points = 150;
      soundEngine.playSFX('bubblePop', { pitch: 1.3 });
      soundEngine.playSFX('cluck', { type: 'high' });
      this.particles.spawnSoapBubbles(b.x, b.y, 10);
      this.particles.spawnSparkles(b.x, b.y, 8);
      this.parachutingChicks.push({
        x: b.x, y: b.y,
        vx: (Math.random() - 0.5) * 20, vy: 35 + Math.random() * 20,
        swayPhase: Math.random() * Math.PI * 2,
        parachuteColor: CHALK_COLORS[Math.floor(Math.random() * CHALK_COLORS.length)],
        landed: false, life: 4.5
      });
    } else if (b.type === 'STAR') {
      points = 100;
      soundEngine.playSFX('bubblePop', { pitch: 1.8 });
      soundEngine.playSFX('fanfare');
      this.particles.spawnSparkles(b.x, b.y, 16);
      this.particles.spawnConfetti(b.x, b.y, 14);
    } else {
      soundEngine.playSFX('bubblePop', { pitch });
      this.particles.spawnSoapBubbles(b.x, b.y, 8);
      this.particles.spawnSparkles(b.x, b.y, 6);
    }

    Haptics.tap();
    this.score += points;
    const comboText = this.combo > 3 ? COMBO_WORDS[Math.min(COMBO_WORDS.length - 1, Math.floor(this.combo / 3))] : `+${points} 🫧`;
    this.particles.spawnScorePopup(b.x, b.y - 20, comboText);
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
        this.particles.spawnConfetti(vWidth / 2, vHeight / 2, 45);
        this.particles.spawnSparkles(vWidth / 2, vHeight / 2, 25);
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
    if (this.bubbleWandPulse > 0) this.bubbleWandPulse -= dt;
    updateCharacterAnimState(this.animState, dt);
    updateCharacterAnimState(this.trishuAnimState, dt);

    if (this.comboTimer > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) this.combo = 0;
    }

    if (this.isCelebrating) {
      this.celebrationTimer -= dt;
      if (this.celebrationTimer <= 0) {
        this.isCelebrating = false;
        this.resetMimiPosition();
      }
    }

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

    this.spawnTimer += dt;
    if (this.spawnTimer >= 0.9) {
      this.spawnTimer = 0;
      if (this.bubbles.length < 16) this.spawnBubble();
    }

    for (let i = this.bubbles.length - 1; i >= 0; i--) {
      const b = this.bubbles[i];
      b.y += b.vy * dt;
      b.x += Math.sin(this.time * 2.5 + b.wobbleOffset) * 26 * dt;
      if (b.y < -b.radius - 20) this.bubbles.splice(i, 1);
    }

    for (let i = this.parachutingChicks.length - 1; i >= 0; i--) {
      const c = this.parachutingChicks[i];
      c.life -= dt;
      c.y += c.vy * dt;
      c.x += Math.sin(this.time * 3 + c.swayPhase) * 20 * dt;
      if (c.life <= 0 || c.y > this.game.display.vHeight * 0.88) {
        this.particles.spawnSparkles(c.x, c.y, 4);
        this.parachutingChicks.splice(i, 1);
      }
    }

    const pointersToCheck: Array<{ x: number; y: number; isJustPressed: boolean }> = [];
    if (input.isActionJustPressed()) {
      pointersToCheck.push({ x: input.primaryPointer.x, y: input.primaryPointer.y, isJustPressed: true });
    } else if (input.isActionDown()) {
      pointersToCheck.push({ x: input.primaryPointer.x, y: input.primaryPointer.y, isJustPressed: false });
    }
    for (const ptr of input.pointers.values()) {
      if (ptr.justPressed || ptr.isDown) {
        pointersToCheck.push({ x: ptr.x, y: ptr.y, isJustPressed: ptr.justPressed });
      }
    }

    for (const pt of pointersToCheck) {
      let hitBubble = false;
      for (let i = this.bubbles.length - 1; i >= 0; i--) {
        const b = this.bubbles[i];
        if (b.popped) continue;
        if (Math.hypot(pt.x - b.x, pt.y - b.y) <= b.radius + 28) {
          this.popBubble(i);
          hitBubble = true;
          break;
        }
      }

      for (let i = this.parachutingChicks.length - 1; i >= 0; i--) {
        const c = this.parachutingChicks[i];
        if (Math.hypot(pt.x - c.x, pt.y - c.y) <= 28) {
          soundEngine.playSFX('cluck', { type: 'high' });
          this.score += 80;
          this.particles.spawnScorePopup(c.x, c.y - 15, '🐥 Peep! +80');
          this.particles.spawnSparkles(c.x, c.y, 8);
          this.parachutingChicks.splice(i, 1);
          hitBubble = true;
          break;
        }
      }

      if (pt.isJustPressed && Math.hypot(pt.x - this.mimi.x, pt.y - this.mimi.y) <= 45) {
        this.blowBubbleBurst(4);
        hitBubble = true;
      }

      const blowerX = this.game.display.vWidth - 50;
      const blowerY = this.game.display.vHeight - 48;
      if (pt.isJustPressed && Math.hypot(pt.x - blowerX, pt.y - blowerY) <= 38) {
        this.blowBubbleBurst(6);
        hitBubble = true;
      }

      if (!hitBubble && pt.isJustPressed && !this.mimi.isHopping) {
        this.advanceMimi();
      }
    }

    if (input.isKeyJustPressed('Space') || input.isKeyJustPressed('ArrowRight')) {
      if (this.bubbles.length > 0 && !this.bubbles[0].popped) this.popBubble(0);
      else this.advanceMimi();
    } else if (input.isKeyJustPressed('KeyB')) {
      this.blowBubbleBurst(5);
    }

    this.particles.update(dt);
  }

  render(ctx: CanvasRenderingContext2D, alpha: number, display: DisplayManager): void {
    const vWidth = display.vWidth;
    const vHeight = display.vHeight;
    const isPortrait = display.isPortrait;
    drawLandscapeSkyHills(ctx, vWidth, vHeight, this.time);

    for (const tile of this.tiles) drawChalkSquare(ctx, tile);

    const picnicX = isPortrait ? vWidth * 0.5 : vWidth - 110;
    const picnicY = isPortrait ? vHeight * 0.18 : vHeight * 0.7;
    drawPicnicBlanket(ctx, picnicX, picnicY);

    const trishuX = isPortrait ? picnicX + 65 : picnicX + 45;
    const trishuY = isPortrait ? picnicY - 20 : picnicY - 35;
    drawTrishu(ctx, trishuX, trishuY, isPortrait ? 1.05 : 1.0, {
      expression: this.isCelebrating || this.combo >= 4 ? 'excited' : 'happy',
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
      blowingBubble: this.bubbleWandPulse > 0,
      eyeBlink: this.animState.isBlinking,
      animState: this.animState
    });

    for (const c of this.parachutingChicks) drawParachutingChick(ctx, c);
    for (const b of this.bubbles) {
      if (!b.popped) drawBubbleEntity(ctx, b);
    }

    drawBubbleBlowerBtn(ctx, vWidth - 50, vHeight - 48);
    this.particles.render(ctx);
    drawBubbleGameHUD(ctx, display, this.bubblesPoppedCount, this.score, this.isCelebrating);
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
