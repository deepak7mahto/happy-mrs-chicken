/**
 * Mode 6: Golden Pancake Flipper
 * Adventures of Trishu — Modular Architecture
 * Strictly under 200 Lines of Code
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
import { PancakeFlipperLogic } from './PancakeFlipperLogic';
import { PancakeFlipperRenderer } from './PancakeFlipperRenderer';
import { ActivePancakeState, StackedPancakeItem } from './types';

export class PancakeFlipperScene extends BaseScene {
  public time: number = 0;
  public particles: ParticleEngine;
  public animState: CharacterAnimState;
  public logic: PancakeFlipperLogic;

  constructor(game: GameEngine) {
    super(game);
    this.particles = new ParticleEngine(150);
    this.animState = createCharacterAnimState();
    this.logic = new PancakeFlipperLogic();
  }

  // Public state proxies for 100% test compatibility
  public get stackCount(): number { return this.logic.stackCount; }
  public set stackCount(val: number) { this.logic.stackCount = val; }

  public get multiplier(): number { return this.logic.multiplier; }
  public set multiplier(val: number) { this.logic.multiplier = val; }

  public get isAirborne(): boolean { return this.logic.isAirborne; }
  public set isAirborne(val: boolean) { this.logic.isAirborne = val; }

  public get flipPhase(): number { return this.logic.flipPhase; }
  public set flipPhase(val: number) { this.logic.flipPhase = val; }

  public get stackWobbleTimer(): number { return this.logic.stackWobbleTimer; }
  public set stackWobbleTimer(val: number) { this.logic.stackWobbleTimer = val; }

  public get activePancake(): ActivePancakeState { return this.logic.activePancake; }
  public set activePancake(val: ActivePancakeState) { this.logic.activePancake = val; }

  public get stackedPancakes(): StackedPancakeItem[] { return this.logic.stackedPancakes; }
  public set stackedPancakes(val: StackedPancakeItem[]) { this.logic.stackedPancakes = val; }

  enter(): void {
    soundEngine.setTrack('classic');
    this.particles.clear();
    this.time = 0;
    this.animState = createCharacterAnimState();

    const isPortrait = this.game.display.isPortrait;
    const vWidth = this.game.display.vWidth;
    const vHeight = this.game.display.vHeight;
    const panX = isPortrait ? vWidth * 0.38 : vWidth * 0.36;
    const panY = isPortrait ? vHeight * 0.62 : vHeight * 0.65;
    this.logic.reset(panX, panY);
    this.score = this.logic.score;
  }

  exit(): void {
    this.particles.clear();
    if (this.score > 0) {
      this.game.storage.saveHighScore('pancakeFlipper', this.score);
    }
  }

  flipPancake(): void {
    const flipped = this.logic.flipPancake();
    if (flipped) {
      soundEngine.playSFX('whoosh');
      Haptics.tap();
    }
  }

  update(dt: number, input: InputManager): void {
    this.time += dt;
    this.animState = updateCharacterAnimState(this.animState, dt);

    const isPortrait = this.game.display.isPortrait;
    const vWidth = this.game.display.vWidth;
    const vHeight = this.game.display.vHeight;
    const panX = isPortrait ? vWidth * 0.38 : vWidth * 0.36;
    const panY = isPortrait ? vHeight * 0.62 : vHeight * 0.65;
    const plateX = isPortrait ? vWidth * 0.75 : vWidth * 0.72;
    const plateBaseY = isPortrait ? vHeight * 0.65 : vHeight * 0.68;

    let userTriggered = input.actionJustPressed || input.isKeyJustPressed('Space') || input.isKeyJustPressed('ArrowUp');
    if (!userTriggered) {
      for (const ptr of input.pointers.values()) {
        if (ptr.justPressed) { userTriggered = true; break; }
      }
    }
    if (userTriggered) {
      this.flipPancake();
    }

    // Step pure pancake physics
    this.logic.update(dt, panX, panY, plateX, plateBaseY, {
      onSizzle: () => {
        soundEngine.playSFX('pancakeSizzle');
        this.particles.spawnSteam(panX, panY - 8);
      },
      onPancakeLanded: (stack, pts, isSuper) => {
        this.checkStoryGoal(stack);
        this.score = this.logic.score;
        this.game.storage.saveHighScore('pancakeFlipper', this.score);

        soundEngine.playSFX('fanfare');
        soundEngine.playSFX('toddlerGiggle');
        Haptics.heavy();
        const topY = plateBaseY - stack * 12;
        this.particles.spawnPancakeSyrup(plateX, topY, 10);
        this.particles.spawnSparkles(plateX, topY, 14);

        if (isSuper) {
          this.particles.spawnConfetti(plateX, topY - 40, 20);
          this.particles.spawnScorePopup(plateX, topY - 40, `🥞 SUPER TOWER! +${pts * 2}`);
        } else {
          this.particles.spawnScorePopup(plateX, topY - 30, `GOLDEN FLIP! ✨ +${pts}`);
        }
      }
    });

    this.score = this.logic.score;
    this.particles.update(dt);
  }

  render(ctx: CanvasRenderingContext2D, _alpha: number, display: DisplayManager): void {
    PancakeFlipperRenderer.renderScene(
      ctx,
      display,
      this.time,
      this.logic.flipPhase,
      this.logic.activePancake,
      this.logic.stackedPancakes,
      this.logic.stackCount,
      this.logic.stackWobbleTimer,
      this.logic.isAirborne,
      this.logic.newPancakeDelay,
      this.animState,
      this.game.selectedAvatar,
      this.score,
      this.logic.multiplier
    );

    this.particles.render(ctx);
  }
}
