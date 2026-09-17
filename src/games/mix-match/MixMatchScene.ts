/**
 * Mode 9: Trishu's Mix & Match Funny Studio
 * Adventures of Trishu Mini-Game Suite
 * Strictly under 500 Lines of Code
 */

import { BaseScene } from '../base/BaseScene';
import { GameEngine } from '../../engine/GameEngine';
import { InputManager } from '../../engine/InputManager';
import { DisplayManager } from '../../engine/DisplayManager';
import { CharacterAnimState } from '../../types/characters';
import { ParticleEngine } from '../../engine/ParticleEngine';
import { soundEngine } from '../../engine/SoundEngine';
import { Haptics } from '../../engine/Haptics';
import { createCharacterAnimState, updateCharacterAnimState } from '../../graphics/animations';
import { MixMatchLogic } from './MixMatchLogic';
import { MixMatchRenderer } from './MixMatchRenderer';

export class MixMatchScene extends BaseScene {
  public logic: MixMatchLogic;
  public renderer: MixMatchRenderer;
  public particles: ParticleEngine;
  public animState: CharacterAnimState;

  // Forwarded properties for test compatibility
  public headIdx: number = 0;
  public torsoIdx: number = 0;
  public legsIdx: number = 0;
  public isShuffling: boolean = false;
  public isDancing: boolean = false;
  public photoFlashTimer: number = 0;
  public photosSnapped: number = 0;
  public currentTitle: string = 'Trishu The Explorer';

  constructor(game: GameEngine) {
    super(game);
    this.logic = new MixMatchLogic();
    this.renderer = new MixMatchRenderer();
    this.particles = new ParticleEngine(150);
    this.animState = createCharacterAnimState();
  }

  enter(): void {
    soundEngine.setTrack('classic');
    this.logic.reset();
    this.particles.clear();
    this.animState = createCharacterAnimState();
    this.syncFromLogic();
  }

  exit(): void {
    this.particles.clear();
  }

  private syncFromLogic(): void {
    this.headIdx = this.logic.headIdx;
    this.torsoIdx = this.logic.torsoIdx;
    this.legsIdx = this.logic.legsIdx;
    this.isShuffling = this.logic.isShuffling;
    this.isDancing = this.logic.isDancing;
    this.photoFlashTimer = this.logic.photoFlashTimer;
    this.photosSnapped = this.logic.photosSnapped;
    this.currentTitle = this.logic.currentTitle;
    this.score = this.logic.score;
  }

  public shuffle(): void {
    this.logic.shuffle();
    this.syncFromLogic();
    soundEngine.playSFX('whoosh');
    Haptics.medium();
  }

  public nextHead(dir: number = 1): void {
    this.logic.nextHead(dir);
    this.syncFromLogic();
    this.game.storage.saveHighScore('mixMatch', this.score);
    soundEngine.playSFX('click');
    Haptics.tap();
  }

  public nextTorso(dir: number = 1): void {
    this.logic.nextTorso(dir);
    this.syncFromLogic();
    this.game.storage.saveHighScore('mixMatch', this.score);
    soundEngine.playSFX('click');
    Haptics.tap();
  }

  public nextLegs(dir: number = 1): void {
    this.logic.nextLegs(dir);
    this.syncFromLogic();
    this.game.storage.saveHighScore('mixMatch', this.score);
    soundEngine.playSFX('click');
    Haptics.tap();
  }

  public triggerDance(): void {
    this.logic.triggerDance();
    this.syncFromLogic();
    this.game.storage.saveHighScore('mixMatch', this.score);

    soundEngine.playSFX('toddlerGiggle');
    if (this.headIdx === 6 || this.torsoIdx === 6 || this.legsIdx === 6) soundEngine.playSFX('cluck');
    if (this.headIdx === 5 || this.torsoIdx === 5 || this.legsIdx === 5) soundEngine.playSFX('bunnySqueak');
    Haptics.medium();

    const vW = this.game.display.vWidth;
    const vH = this.game.display.vHeight;
    this.particles.spawnSparkles(vW / 2, vH * 0.45, 16);
    this.particles.spawnScorePopup(vW / 2, vH * 0.35, '✨ Funny Dance! +50');
  }

  public snapPhoto(): void {
    this.logic.snapPhoto(this.animState);
    this.syncFromLogic();
    this.checkStoryGoal(this.photosSnapped);
    this.game.storage.saveHighScore('mixMatch', this.score);

    soundEngine.playSFX('click');
    soundEngine.playSFX('fanfare');
    Haptics.heavy();

    const vW = this.game.display.vWidth;
    const vH = this.game.display.vHeight;
    this.particles.spawnConfetti(vW / 2, vH * 0.45, 30);
    this.particles.spawnScorePopup(vW / 2, vH * 0.3, '📸 PHOTO SAVED! +100');
  }

  update(dt: number, input: InputManager): void {
    updateCharacterAnimState(this.animState, dt);
    const { ticked, finishedShuffle } = this.logic.update(dt, this.animState);
    this.syncFromLogic();

    if (ticked) {
      soundEngine.playSFX('click');
    }
    if (finishedShuffle) {
      soundEngine.playSFX('toddlerGiggle');
      const vW = this.game.display.vWidth;
      const vH = this.game.display.vHeight;
      this.particles.spawnSparkles(vW / 2, vH * 0.45, 16);
      this.particles.spawnScorePopup(vW / 2, vH * 0.35, '✨ Funny Dance! +50');
    }

    this.handleSceneInput(input);
    this.particles.update(dt);
  }

  private handleSceneInput(input: InputManager): void {
    if (this.isShuffling) return;

    const pointers: Array<{ x: number; y: number }> = [];
    if (input.isActionJustPressed()) {
      pointers.push({ x: input.primaryPointer.x, y: input.primaryPointer.y });
    }
    for (const ptr of input.pointers.values()) {
      if (ptr.justPressed) pointers.push({ x: ptr.x, y: ptr.y });
    }

    const isPortrait = this.game.display.isPortrait;
    const vW = this.game.display.vWidth;
    const vH = this.game.display.vHeight;
    const cx = vW / 2;
    const cy = isPortrait ? vH * 0.44 : vH * 0.48;

    for (const pt of pointers) {
      if (Math.hypot(pt.x - cx, pt.y - cy) < 90) {
        this.triggerDance();
        continue;
      }

      const rowYHead = cy - 65;
      const rowYTorso = cy;
      const rowYLegs = cy + 65;
      const arrowLeftX = cx - 110;
      const arrowRightX = cx + 110;

      if (Math.hypot(pt.x - arrowLeftX, pt.y - rowYHead) < 28) this.nextHead(-1);
      else if (Math.hypot(pt.x - arrowRightX, pt.y - rowYHead) < 28) this.nextHead(1);
      else if (Math.hypot(pt.x - arrowLeftX, pt.y - rowYTorso) < 28) this.nextTorso(-1);
      else if (Math.hypot(pt.x - arrowRightX, pt.y - rowYTorso) < 28) this.nextTorso(1);
      else if (Math.hypot(pt.x - arrowLeftX, pt.y - rowYLegs) < 28) this.nextLegs(-1);
      else if (Math.hypot(pt.x - arrowRightX, pt.y - rowYLegs) < 28) this.nextLegs(1);

      const btnY = isPortrait ? vH * 0.84 : vH * 0.86;
      const shuffleX = cx - 90;
      const photoX = cx + 90;

      if (Math.hypot(pt.x - shuffleX, pt.y - btnY) < 42) {
        this.shuffle();
      } else if (Math.hypot(pt.x - photoX, pt.y - btnY) < 42) {
        this.snapPhoto();
      }
    }

    if (input.isKeyJustPressed('Space') || input.isKeyJustPressed('Enter')) {
      this.shuffle();
    }
  }

  render(ctx: CanvasRenderingContext2D, alpha: number, display: DisplayManager): void {
    this.renderer.render(ctx, this.logic, this.animState, display);
    this.particles.render(ctx);
  }

  override getEntities(): Record<string, unknown> {
    return {
      headIdx: this.headIdx, torsoIdx: this.torsoIdx, legsIdx: this.legsIdx,
      title: this.currentTitle, photosSnapped: this.photosSnapped,
      isShuffling: this.isShuffling, isDancing: this.isDancing,
      particles: this.particles.active
    };
  }

  override getModeState(): Record<string, unknown> {
    return {
      score: this.score, headIdx: this.headIdx, torsoIdx: this.torsoIdx, legsIdx: this.legsIdx,
      title: this.currentTitle, photosSnapped: this.photosSnapped, timer: this.logic.time,
      multiplier: 1, feverMeter: 0, coopSavedCount: 0, isOverheating: false
    };
  }
}
