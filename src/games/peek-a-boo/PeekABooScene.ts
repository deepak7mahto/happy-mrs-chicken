/**
 * Mode 10: Peek-a-Boo Barnyard (Sensory Toddler Delight)
 * Adventures of Trishu Mini-Game Suite
 * Strictly under 500 Lines of Code
 */

import { BaseScene } from '../base/BaseScene';
import { GameEngine } from '../../engine/GameEngine';
import { InputManager } from '../../engine/InputManager';
import { DisplayManager } from '../../engine/DisplayManager';
import { ParticleEngine } from '../../engine/ParticleEngine';
import { soundEngine } from '../../engine/SoundEngine';
import { Haptics } from '../../engine/Haptics';
import { HidingSpot } from './types';
import { PeekABooLogic } from './PeekABooLogic';
import { PeekABooRenderer } from './PeekABooRenderer';

export class PeekABooScene extends BaseScene {
  public logic: PeekABooLogic;
  public renderer: PeekABooRenderer;
  public particles: ParticleEngine;
  public celebrationTimer: number = 0;

  // Forwarded properties for test compatibility
  public time: number = 0;
  public peekFoundCount: number = 0;
  public spots: HidingSpot[] = [];

  constructor(game: GameEngine) {
    super(game);
    this.logic = new PeekABooLogic();
    this.renderer = new PeekABooRenderer();
    this.particles = new ParticleEngine(150);
  }

  enter(): void {
    super.enter();
    soundEngine.setTrack('classic');
    const isPortrait = this.game.display.isPortrait;
    const vW = this.game.display.vWidth;
    const vH = this.game.display.vHeight;
    this.logic.reset(isPortrait, vW, vH);
    this.celebrationTimer = 0;
    this.particles.clear();
    this.syncFromLogic();
  }

  exit(): void {
    this.particles.clear();
    if (this.score > 0) {
      this.game.storage.saveHighScore('peekABoo', this.score);
    }
  }

  private syncFromLogic(): void {
    this.time = this.logic.time;
    this.peekFoundCount = this.logic.peekFoundCount;
    this.spots = this.logic.spots;
    this.score = this.logic.score;
  }

  public tapSpot(spot: HidingSpot): void {
    const { tapped, isMilestone, isFriendGiggle } = this.logic.tapSpot(spot);
    if (!tapped) return;

    this.syncFromLogic();
    this.checkStoryGoal(this.peekFoundCount, 4);

    if (isFriendGiggle) {
      soundEngine.playSFX('toddlerGiggle');
      if (spot.type === 'BARN') soundEngine.playSFX('cluck');
      else if (spot.type === 'BUSH') soundEngine.playSFX('bunnySqueak');
      else if (spot.type === 'HAY') soundEngine.playSFX('dinoBite');
      else if (spot.type === 'BARREL') soundEngine.playSFX('click');

      Haptics.tap();
      this.particles.spawnSparkles(spot.x, spot.y - 30, 8);
      this.particles.spawnScorePopup(spot.x, spot.y - spot.h * 0.5 - 20, 'Giggle! 💖 +20');
      this.game.storage.saveHighScore('peekABoo', this.score);
      return;
    }

    if (spot.type === 'BARN') {
      soundEngine.playSFX('cluck', { type: 'high' });
      soundEngine.playSFX('toddlerGiggle');
      this.particles.spawnFeathers(spot.x, spot.y - 20, 8);
      this.particles.spawnSparkles(spot.x, spot.y - 40, 10);
    } else if (spot.type === 'BUSH') {
      soundEngine.playSFX('bunnySqueak');
      soundEngine.playSFX('bubblePop', { pitch: 1.4 });
      this.particles.spawnSoapBubbles(spot.x, spot.y - 30, 8);
      this.particles.spawnSparkles(spot.x, spot.y - 30, 8);
    } else if (spot.type === 'HAY') {
      soundEngine.playSFX('dinosaurRoar');
      soundEngine.playSFX('toddlerGiggle');
      this.particles.spawnSparkles(spot.x, spot.y - 30, 12);
    } else if (spot.type === 'BARREL') {
      soundEngine.playSFX('fanfare');
      soundEngine.playSFX('toddlerGiggle');
      this.particles.spawnConfetti(spot.x, spot.y - 40, 20);
      this.particles.spawnSparkles(spot.x, spot.y - 30, 12);
    }

    Haptics.heavy();
    this.particles.spawnScorePopup(spot.x, spot.y - spot.h * 0.5 - 20, 'Peek-a-boo! 🌟 +50');
    this.game.storage.saveHighScore('peekABoo', this.score);

    if (isMilestone) {
      soundEngine.playSFX('fanfare');
      const vW = this.game.display.vWidth;
      const vH = this.game.display.vHeight;
      this.particles.spawnConfetti(vW / 2, vH * 0.4, 35);
    }
  }

  update(dt: number, input: InputManager): void {
    this.logic.update(dt);
    this.syncFromLogic();

    const pointersToCheck: Array<{ x: number; y: number }> = [];
    if (input.actionJustPressed) {
      pointersToCheck.push({ x: input.primaryPointer.x, y: input.primaryPointer.y });
    }
    for (const ptr of input.pointers.values()) {
      if (ptr.justPressed) pointersToCheck.push({ x: ptr.x, y: ptr.y });
    }

    for (const pt of pointersToCheck) {
      const hitSpot = this.logic.findSpotAt(pt.x, pt.y);
      if (hitSpot) {
        this.tapSpot(hitSpot);
        break;
      }
    }

    if (input.isKeyJustPressed('Space')) {
      const closedSpots = this.spots.filter(s => !s.isOpen);
      if (closedSpots.length > 0) {
        this.tapSpot(closedSpots[Math.floor(Math.random() * closedSpots.length)]);
      }
    }

    this.particles.update(dt);
  }

  render(ctx: CanvasRenderingContext2D, _alpha: number, display: DisplayManager): void {
    this.renderer.render(ctx, this.logic, display);
    this.particles.render(ctx);
  }

  override getEntities(): Record<string, unknown> {
    return {
      spots: this.spots.map(s => ({ id: s.id, type: s.type, isOpen: s.isOpen, name: s.name })),
      particles: this.particles.active
    };
  }

  override getModeState(): Record<string, unknown> {
    return {
      timer: 0,
      feverMeter: 0,
      multiplier: 1,
      coopSavedCount: 0,
      isOverheating: false,
      peekFoundCount: this.peekFoundCount
    };
  }
}
