/**
 * Mode 5: Leo's Balloon Pop (Dinosaur Balloon Pop)
 * Adventures of Trishu Mini-Game Suite
 * Strictly under 500 Lines of Code
 */

import { BaseScene } from '../base/BaseScene';
import { GameEngine } from '../../engine/GameEngine';
import { InputManager } from '../../engine/InputManager';
import { DisplayManager } from '../../engine/DisplayManager';
import { BalloonEntity } from './types';
import { CharacterAnimState } from '../../types/characters';
import { ParticleEngine } from '../../engine/ParticleEngine';
import { soundEngine } from '../../engine/SoundEngine';
import { Haptics } from '../../engine/Haptics';
import { createCharacterAnimState, updateCharacterAnimState } from '../../graphics/animations';
import { DinosaurBalloonLogic } from './DinosaurBalloonLogic';
import { DinosaurBalloonRenderer } from './DinosaurBalloonRenderer';

export class DinosaurBalloonScene extends BaseScene {
  public logic: DinosaurBalloonLogic;
  public renderer: DinosaurBalloonRenderer;
  public particles: ParticleEngine;
  public animState: CharacterAnimState;

  // Forwarded properties for test compatibility
  public time: number = 0;
  public combo: number = 1;
  public comboTimer: number = 0;
  public balloons: BalloonEntity[] = [];
  public chompTimer: number = 0;
  public popTimer: number = 0;
  public poppedCount: number = 0;

  constructor(game: GameEngine) {
    super(game);
    this.logic = new DinosaurBalloonLogic();
    this.renderer = new DinosaurBalloonRenderer();
    this.particles = new ParticleEngine(150);
    this.animState = createCharacterAnimState();
  }

  enter(): void {
    soundEngine.setTrack('frenzy');
    this.particles.clear();
    this.animState = createCharacterAnimState();
    const vWidth = this.game.display.vWidth;
    const vHeight = this.game.display.vHeight;
    this.logic.reset(vWidth, vHeight);
    this.syncFromLogic();
  }

  exit(): void {
    this.particles.clear();
  }

  private syncFromLogic(): void {
    this.time = this.logic.time;
    this.combo = this.logic.combo;
    this.comboTimer = this.logic.comboTimer;
    this.balloons = this.logic.balloons;
    this.chompTimer = this.logic.chompTimer;
    this.popTimer = this.logic.popTimer;
    this.poppedCount = this.logic.poppedCount;
    this.score = this.logic.score;
  }

  public spawnBalloon(customY?: number): void {
    const vWidth = this.game.display.vWidth;
    const vHeight = this.game.display.vHeight;
    this.logic.spawnBalloon(vWidth, vHeight, customY);
    this.syncFromLogic();
  }

  public popBalloon(index: number, _ptrX?: number, _ptrY?: number): void {
    const res = this.logic.popBalloon(index);
    if (!res) return;

    this.syncFromLogic();
    this.checkStoryGoal(this.poppedCount);

    const { isGolden, pts, balloon: b } = res;

    soundEngine.playSFX('balloonPop');
    soundEngine.playTone(320 + Math.min(8, this.combo) * 55, 0.12, 'sine', 0.18);

    if (b.shape === 'DINO') {
      soundEngine.playSFX('dinoBite');
    }

    if (isGolden) {
      soundEngine.playSFX('dinosaurRoar');
      Haptics.heavy();
    } else if (this.combo >= 3) {
      soundEngine.playSFX('toddlerGiggle');
      Haptics.medium();
    } else {
      if (Math.random() < 0.25) soundEngine.playSFX('dinosaurRoar');
      Haptics.tap();
    }

    this.particles.spawnConfetti(b.x, b.y, isGolden ? 25 : 20);
    this.particles.spawnSparkles(b.x, b.y, isGolden ? 15 : 8);
    const shapeEmoji = b.shape === 'DINO' ? '🦖' : b.shape === 'STAR' ? '⭐' : b.shape === 'HEART' ? '💖' : '🎈';
    const popupText = isGolden
      ? `+${pts} GOLDEN ${shapeEmoji}!`
      : (this.combo > 2 ? `+${pts} (${this.combo - 1}x ${shapeEmoji})!` : `+${pts}`);
    this.particles.spawnScorePopup(b.x, b.y - 25, popupText);

    this.game.storage.saveHighScore('dinosaurBalloon', this.score);
  }

  update(dt: number, input: InputManager): void {
    this.animState = updateCharacterAnimState(this.animState, dt);
    const vWidth = this.game.display.vWidth;
    const vHeight = this.game.display.vHeight;
    const isPortrait = this.game.display.isPortrait;

    this.logic.update(dt, vWidth, vHeight, isPortrait);
    this.syncFromLogic();

    const pointersToCheck: Array<{ x: number; y: number }> = [];
    for (const ptr of input.pointers.values()) {
      if (ptr.justPressed || ptr.isDown) {
        pointersToCheck.push({ x: ptr.x, y: ptr.y });
      }
    }
    if (input.actionJustPressed) {
      pointersToCheck.push({ x: input.primaryPointer.x, y: input.primaryPointer.y });
    }

    for (const pt of pointersToCheck) {
      const hitIdx = this.logic.findHitBalloon(pt.x, pt.y);
      if (hitIdx >= 0) {
        this.popBalloon(hitIdx, pt.x, pt.y);
      }
    }

    if (input.isKeyJustPressed('Space') || input.isKeyJustPressed('Enter')) {
      const lowestIdx = this.logic.findLowestBalloonIndex();
      if (lowestIdx >= 0) {
        const b = this.balloons[lowestIdx];
        this.popBalloon(lowestIdx, b.x, b.y);
      }
    }

    this.particles.update(dt);
  }

  render(ctx: CanvasRenderingContext2D, _alpha: number, display: DisplayManager): void {
    this.renderer.render(ctx, this.logic, this.animState, display, this.game.selectedAvatar);
    this.particles.render(ctx);
  }

  override getEntities(): Record<string, unknown> {
    return {
      balloons: this.balloons.filter(b => !b.popped),
      balloonsCount: this.balloons.filter(b => !b.popped).length,
      eggs: [],
      chicks: [],
      puddles: [],
      seeds: [],
      particles: this.particles.active
    };
  }

  override getModeState(): Record<string, unknown> {
    return {
      score: this.score,
      combo: this.combo,
      balloonsPopped: this.poppedCount,
      timer: this.time,
      multiplier: this.combo,
      feverMeter: 0,
      coopSavedCount: 0,
      isOverheating: false
    };
  }
}
