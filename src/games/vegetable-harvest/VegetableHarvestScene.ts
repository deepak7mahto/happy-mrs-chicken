/**
 * Mode 7: Grandpa's Veggie Harvest
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
import { CharacterAnimState } from '../../types/characters';
import { createCharacterAnimState, updateCharacterAnimState } from '../../graphics/animations';
import { VegetableHarvestLogic } from './VegetableHarvestLogic';
import { VegetableHarvestRenderer } from './VegetableHarvestRenderer';
import { GardenMoundItem } from './types';

export class VegetableHarvestScene extends BaseScene {
  public time: number = 0;
  public particles: ParticleEngine;
  public animState: CharacterAnimState;
  public logic: VegetableHarvestLogic;

  constructor(game: GameEngine) {
    super(game);
    this.particles = new ParticleEngine(150);
    this.animState = createCharacterAnimState();
    this.logic = new VegetableHarvestLogic();
  }

  // Public state proxies for 100% test compatibility
  public get mounds(): GardenMoundItem[] { return this.logic.mounds; }
  public set mounds(val: GardenMoundItem[]) { this.logic.mounds = val; }

  public get harvestedCount(): number { return this.logic.harvestedCount; }
  public set harvestedCount(val: number) { this.logic.harvestedCount = val; }

  enter(): void {
    soundEngine.setTrack('classic');
    this.particles.clear();
    this.time = 0;
    this.animState = createCharacterAnimState();

    const isPortrait = this.game.display.isPortrait;
    this.logic.reset(this.game.display.vWidth, this.game.display.vHeight, isPortrait);
    this.score = this.logic.score;
  }

  exit(): void {
    this.particles.clear();
    if (this.score > 0) {
      this.game.storage.saveHighScore('vegetableHarvest', this.score);
    }
  }

  update(dt: number, input: InputManager): void {
    this.time += dt;
    this.animState = updateCharacterAnimState(this.animState, dt);

    const isPortrait = this.game.display.isPortrait;
    const vWidth = this.game.display.vWidth;
    const vHeight = this.game.display.vHeight;
    const wbX = isPortrait ? vWidth * 0.22 : 120;
    const wbY = isPortrait ? vHeight * 0.38 : vHeight * 0.72;

    let isAnyPointerDown = false;
    let pointerY = 0;

    for (const ptr of input.pointers.values()) {
      if (ptr.isDown || ptr.justPressed) {
        if (ptr.isDown) {
          isAnyPointerDown = true;
          pointerY = ptr.y;
        }
        if (ptr.justPressed) {
          this.logic.handleTap(ptr.x, ptr.y, wbX, wbY, {
            onVeggiePop: (vx, vy) => {
              soundEngine.playSFX('veggiePop');
              this.particles.spawnMudSplash(vx, vy, 6, false);
              Haptics.tap();
            }
          });
        }
      }
    }

    // Keyboard Space / Enter
    if (input.isKeyJustPressed('Space') || input.isKeyJustPressed('Enter')) {
      for (const m of this.logic.mounds) {
        if (m.vegetable && !m.vegetable.isHarvested && !m.vegetable.isFlying) {
          this.logic.triggerVegetableHarvest(m.vegetable, wbX, wbY);
          break;
        }
      }
    }

    // Dragging
    if (this.logic.activePullMoundIdx >= 0 && isAnyPointerDown) {
      this.logic.handleDrag(pointerY, wbX, wbY, {
        onPumpkinTug: (px, py) => {
          soundEngine.playSFX('seedDrop');
          this.particles.spawnSteam(px, py - 30);
          Haptics.medium();
        }
      });
    } else {
      this.logic.releasePull();
    }

    // Step physics & flying vegetables
    this.logic.update(dt, wbX, wbY, {
      onVeggieLanded: (veg, earned) => {
        this.checkStoryGoal(this.logic.harvestedCount);
        this.score = this.logic.score;
        this.game.storage.saveHighScore('vegetableHarvest', this.score);

        soundEngine.playSFX('veggiePop');
        soundEngine.playSFX('mudThud');
        Haptics.heavy();
        this.particles.spawnMudSplash(wbX, wbY, 18);
        this.particles.spawnSparkles(wbX, wbY - 20, 12);
        this.particles.spawnScorePopup(wbX, wbY - 35, `+${earned} ${veg.type}! 🥕`);
      }
    });

    this.score = this.logic.score;
    this.particles.update(dt);
  }

  render(ctx: CanvasRenderingContext2D, _alpha: number, display: DisplayManager): void {
    VegetableHarvestRenderer.renderScene(
      ctx,
      display,
      this.time,
      this.logic.mounds,
      this.logic.harvestedCount,
      this.logic.currentPullTension,
      this.logic.activePullMoundIdx,
      this.logic.wheelbarrowBounce,
      this.animState,
      this.game.selectedAvatar,
      this.score
    );

    this.particles.render(ctx);
  }
}
