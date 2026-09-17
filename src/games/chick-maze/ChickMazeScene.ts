/**
 * Mode 3: Chick Trail (Chick Maze / Sorting)
 * Adventures of Trishu — Modular Architecture
 * Strictly under 200 Lines of Code
 */

import { BaseScene } from '../base/BaseScene';
import { GameEngine } from '../../engine/GameEngine';
import { InputManager } from '../../engine/InputManager';
import { DisplayManager } from '../../engine/DisplayManager';
import { ParticleEngine } from '../../engine/ParticleEngine';
import { soundEngine } from '../../engine/SoundEngine';
import { Haptics } from '../../engine/Haptics';
import { ChickMazeLogic } from './ChickMazeLogic';
import { ChickMazeRenderer } from './ChickMazeRenderer';
import { ChickEntity, SeedEntity } from './types';

export class ChickMazeScene extends BaseScene {
  public time: number = 0;
  public particles: ParticleEngine;
  public logic: ChickMazeLogic;

  constructor(game: GameEngine) {
    super(game);
    this.particles = new ParticleEngine(150);
    this.logic = new ChickMazeLogic();
  }

  // Public state proxies for 100% test compatibility
  public get chicks(): ChickEntity[] { return this.logic.chicks; }
  public set chicks(val: ChickEntity[]) { this.logic.chicks = val; }

  public get seeds(): SeedEntity[] { return this.logic.seeds; }
  public set seeds(val: SeedEntity[]) { this.logic.seeds = val; }

  public get coopSavedCount(): number { return this.logic.coopSavedCount; }
  public set coopSavedCount(val: number) { this.logic.coopSavedCount = val; }

  enter(): void {
    soundEngine.setTrack('classic');
    this.time = 0;
    this.particles.clear();
    this.logic.reset(this.game.display.vWidth, this.game.display.vHeight, this.game.display.isPortrait);
    this.score = this.logic.score;
  }

  exit(): void {
    this.particles.clear();
    if (this.score > 0) {
      this.game.storage.saveHighScore('chickMaze', this.score);
    }
  }

  dropSeed(x: number, y: number): void {
    this.logic.dropSeed(x, y);
    soundEngine.playSFX('seedDrop');
    Haptics.tap();
  }

  update(dt: number, input: InputManager): void {
    this.time += dt;

    // Tap to drop seed or trigger cluck call when tapping near coop
    if (input.isActionJustPressed()) {
      const p = input.primaryPointer;
      if (p.inside && p.y > 60) {
        const coopDoor = this.logic.getCoopDoor(this.game.display.vWidth, this.game.display.isPortrait);
        const cdx = p.x - coopDoor.x;
        const cdy = p.y - coopDoor.y;
        if (cdx * cdx + cdy * cdy < 4900) {
          this.logic.triggerCluckCall(coopDoor.x, coopDoor.y);
          soundEngine.playSFX('cluck');
          soundEngine.playSFX('bunnySqueak');
          this.particles.spawnSparkles(coopDoor.x, coopDoor.y - 30, 14);
          Haptics.heavy();
        } else {
          this.dropSeed(p.x, p.y);
        }
      }
    }

    // Step pure flocking simulation
    this.logic.update(
      dt,
      this.game.display.vWidth,
      this.game.display.vHeight,
      this.game.display.isPortrait,
      {
        onSeedEaten: (sx, sy) => {
          this.particles.spawnSparkles(sx, sy, 8);
          this.particles.spawnScorePopup(sx, sy - 15, '✨ Nom! +20');
          soundEngine.playSFX('eggPop');
          soundEngine.playSFX('toddlerGiggle');
          this.score = this.logic.score;
        },
        onChickSaved: (cx, cy, totalSaved) => {
          this.checkStoryGoal(totalSaved);
          this.particles.spawnConfetti(cx, cy, 25);
          this.particles.spawnSparkles(cx, cy, 14);
          this.particles.spawnScorePopup(cx, cy - 25, '+100');
          soundEngine.playSFX('fanfare');
          Haptics.medium();
          this.score = this.logic.score;
          this.game.storage.saveHighScore('chickMaze', this.score);
        },
        onRoundComplete: (newRound) => {
          const vW = this.game.display.vWidth;
          const vH = this.game.display.vHeight;
          this.particles.spawnConfetti(vW / 2, vH * 0.4, 35);
          this.particles.spawnScorePopup(vW / 2, vH * 0.35, `🌟 ROUND ${newRound}! +200`);
          soundEngine.playSFX('fanfare');
          soundEngine.playSFX('toddlerGiggle');
          Haptics.heavy();
          this.score = this.logic.score;
        }
      }
    );

    this.score = this.logic.score;
    this.particles.update(dt);
  }

  render(ctx: CanvasRenderingContext2D, _alpha: number, display: DisplayManager): void {
    const isPortrait = display.isPortrait;
    const vWidth = display.vWidth;
    const vHeight = display.vHeight;
    const fences = this.logic.getFences(vWidth, vHeight, isPortrait);
    const coopDoor = this.logic.getCoopDoor(vWidth, isPortrait);

    ChickMazeRenderer.renderScene(
      ctx,
      display,
      this.time,
      this.logic.chicks,
      this.logic.seeds,
      fences,
      coopDoor,
      this.score,
      this.logic.round,
      this.logic.coopSavedCount,
      this.logic.cluckCallTimer,
      this.logic.cluckCallOrigin
    );

    this.particles.render(ctx);
  }
}
