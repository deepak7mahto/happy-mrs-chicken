/**
 * Mode 8: Rainbow Bubble Hopscotch (Mimi & Trishu)
 * Adventures of Trishu — Enhanced Sensory Child Bubble Popping Experience
 * Strictly under 500 Lines of Code
 */

import { BaseScene } from '../base/BaseScene';
import { GameEngine } from '../../engine/GameEngine';
import { InputManager } from '../../engine/InputManager';
import { DisplayManager } from '../../engine/DisplayManager';
import { BubbleEntity, BubbleType, HopscotchTileDef, ParachutingChickDef, MimiState } from './types';
import { CharacterAnimState } from '../../types/characters';
import { ParticleEngine } from '../../engine/ParticleEngine';
import { soundEngine } from '../../engine/SoundEngine';
import { Haptics } from '../../engine/Haptics';
import { createCharacterAnimState, updateCharacterAnimState } from '../../graphics/animations';
import { HopscotchLogic } from './HopscotchLogic';
import { HopscotchRenderer } from './HopscotchRenderer';

export class HopscotchBubbleScene extends BaseScene {
  public logic: HopscotchLogic;
  public renderer: HopscotchRenderer;
  public particles: ParticleEngine;
  public animState: CharacterAnimState;
  public trishuAnimState: CharacterAnimState;

  // Forwarded properties for test compatibility
  public time: number = 0;
  public bubblesPoppedCount: number = 0;
  public isCelebrating: boolean = false;
  public celebrationTimer: number = 0;
  public bubbles: BubbleEntity[] = [];
  public tiles: HopscotchTileDef[] = [];
  public parachutingChicks: ParachutingChickDef[] = [];
  public combo: number = 0;
  public comboTimer: number = 0;

  public get mimi(): MimiState {
    return this.logic.mimi;
  }
  public get suzy(): MimiState {
    return this.logic.mimi;
  }

  constructor(game: GameEngine) {
    super(game);
    this.logic = new HopscotchLogic();
    this.renderer = new HopscotchRenderer();
    this.particles = new ParticleEngine(180);
    this.animState = createCharacterAnimState();
    this.trishuAnimState = createCharacterAnimState();
  }

  enter(): void {
    super.enter();
    soundEngine.setTrack('gentle');
    this.particles.clear();
    this.animState = createCharacterAnimState();
    this.trishuAnimState = createCharacterAnimState();

    const vWidth = this.game.display.vWidth;
    const vHeight = this.game.display.vHeight;
    const isPortrait = this.game.display.isPortrait;
    this.logic.reset(vWidth, vHeight, isPortrait);
    this.syncFromLogic();
  }

  exit(): void {
    this.particles.clear();
    this.logic.parachutingChicks = [];
    this.syncFromLogic();
  }

  private syncFromLogic(): void {
    this.time = this.logic.time;
    this.bubblesPoppedCount = this.logic.bubblesPoppedCount;
    this.isCelebrating = this.logic.isCelebrating;
    this.celebrationTimer = this.logic.celebrationTimer;
    this.bubbles = this.logic.bubbles;
    this.tiles = this.logic.tiles;
    this.parachutingChicks = this.logic.parachutingChicks;
    this.combo = this.logic.combo;
    this.comboTimer = this.logic.comboTimer;
    this.score = this.logic.score;
  }

  public resetMimiPosition(): void {
    this.logic.resetMimiPosition();
    this.syncFromLogic();
  }

  public resetSuzyPosition(): void {
    this.resetMimiPosition();
  }

  public spawnBubble(initialY?: number, forcedType?: BubbleType, spawnX?: number, radiusOverride?: number): void {
    const vWidth = this.game.display.vWidth;
    const vHeight = this.game.display.vHeight;
    this.logic.spawnBubble(vWidth, vHeight, initialY, forcedType, spawnX, radiusOverride);
    this.syncFromLogic();
  }

  public blowBubbleBurst(count: number = 5): void {
    const vWidth = this.game.display.vWidth;
    const vHeight = this.game.display.vHeight;
    const positions = this.logic.blowBubbleBurst(count, vWidth, vHeight);
    this.syncFromLogic();

    soundEngine.playSFX('whoosh');
    soundEngine.playSFX('bunnySqueak');
    Haptics.medium();

    for (const pos of positions) {
      this.particles.spawnSoapBubbles(pos.x, pos.y, 3);
    }
  }

  public popBubble(idx: number): void {
    const res = this.logic.popBubble(idx);
    if (!res) return;

    this.syncFromLogic();
    const { bubble: b, points, pitch, comboText } = res;

    if (b.type === 'GIANT') {
      soundEngine.playSFX('bubblePop', { pitch: 0.65, volume: 1.2 });
      this.particles.spawnSoapBubbles(b.x, b.y, 14);
      this.particles.spawnSparkles(b.x, b.y, 10);
    } else if (b.type === 'CHICK') {
      soundEngine.playSFX('bubblePop', { pitch: 1.3 });
      soundEngine.playSFX('cluck', { type: 'high' });
      this.particles.spawnSoapBubbles(b.x, b.y, 10);
      this.particles.spawnSparkles(b.x, b.y, 8);
    } else if (b.type === 'STAR') {
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
    this.particles.spawnScorePopup(b.x, b.y - 20, comboText);
    this.game.storage.saveHighScore('hopscotchBubble', this.score);
  }

  public hopToSquare(targetSquare: number): void {
    const { advanced, celebrated } = this.logic.hopToSquare(targetSquare);
    this.syncFromLogic();

    if (advanced) {
      soundEngine.playTone(220 + targetSquare * 35, 0.14, 'triangle', 0.22);
      soundEngine.playSFX('click');
      Haptics.medium();
      this.particles.spawnSparkles(this.mimi.targetX, this.mimi.targetY, 8);
    }
    if (celebrated) {
      soundEngine.playSFX('fanfare');
      soundEngine.playSFX('toddlerGiggle');
      Haptics.fanfare();
      const vWidth = this.game.display.vWidth;
      const vHeight = this.game.display.vHeight;
      this.particles.spawnConfetti(vWidth / 2, vHeight / 2, 45);
      this.particles.spawnSparkles(vWidth / 2, vHeight / 2, 25);
      this.particles.spawnScorePopup(vWidth / 2, vHeight * 0.4, '🧺 Picnic Party! 🎉 +500');
      this.game.storage.saveHighScore('hopscotchBubble', this.score);
      this.checkStoryGoal(1, 1);
    }
  }

  public advanceMimi(): void {
    const nextSquare = this.mimi.currentSquare + 1;
    if (nextSquare <= this.tiles.length) {
      this.hopToSquare(nextSquare);
    } else {
      this.resetMimiPosition();
    }
  }

  public advanceSuzy(): void {
    this.advanceMimi();
  }

  update(dt: number, input: InputManager): void {
    updateCharacterAnimState(this.animState, dt);
    updateCharacterAnimState(this.trishuAnimState, dt);

    const vWidth = this.game.display.vWidth;
    const vHeight = this.game.display.vHeight;
    const { reachedGroundChicks } = this.logic.update(dt, vWidth, vHeight);
    this.syncFromLogic();

    for (const c of reachedGroundChicks) {
      this.particles.spawnSparkles(c.x, c.y, 4);
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

      const blowerX = vWidth - 50;
      const blowerY = vHeight - 48;
      if (pt.isJustPressed && Math.hypot(pt.x - blowerX, pt.y - blowerY) <= 38) {
        this.blowBubbleBurst(6);
        hitBubble = true;
      }

      if (!hitBubble && pt.isJustPressed && !this.mimi.isHopping) {
        const hitTile = this.logic.findHitTile(pt.x, pt.y);
        if (hitTile > 0 && hitTile !== this.mimi.currentSquare) {
          this.hopToSquare(hitTile);
        } else {
          this.advanceMimi();
        }
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

  render(ctx: CanvasRenderingContext2D, _alpha: number, display: DisplayManager): void {
    this.renderer.render(ctx, this.logic, this.animState, this.trishuAnimState, display, this.game.selectedAvatar);
    this.particles.render(ctx);
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
