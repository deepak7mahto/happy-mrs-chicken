/**
 * Mode 12: Grandpa's Little Train
 * Adventures of Trishu Mini-Game Suite
 * Strictly under 500 Lines of Code
 */

import { BaseScene } from '../base/BaseScene';
import { GameEngine } from '../../engine/GameEngine';
import { InputManager } from '../../engine/InputManager';
import { DisplayManager } from '../../engine/DisplayManager';
import { soundEngine } from '../../engine/SoundEngine';
import { Haptics } from '../../engine/Haptics';
import { PassengerStation, PassengerType, SteamPuff } from './types';
import { LittleTrainLogic } from './LittleTrainLogic';
import { LittleTrainRenderer } from './LittleTrainRenderer';

export class LittleTrainScene extends BaseScene {
  public logic: LittleTrainLogic;
  public renderer: LittleTrainRenderer;

  // Forwarded properties for test & state compatibility
  public time: number = 0;
  public get trainX(): number { return this.logic.trainX; }
  public get trainSpeed(): number { return this.logic.trainSpeed; }
  public get whistleTimer(): number { return this.logic.whistleTimer; }
  public get passengers(): PassengerType[] { return this.logic.passengers; }
  public get stations(): PassengerStation[] { return this.logic.stations; }
  public get steamPuffs(): SteamPuff[] { return this.logic.steamPuffs; }

  constructor(game: GameEngine) {
    super(game);
    this.logic = new LittleTrainLogic();
    this.renderer = new LittleTrainRenderer();
  }

  enter(): void {
    super.enter();
    soundEngine.setTrack('waltz');
    this.logic.reset();
    this.syncFromLogic();
    soundEngine.unlock();
  }

  private syncFromLogic(): void {
    this.time = this.logic.time;
    this.score = this.logic.score;
  }

  public blowWhistle(): void {
    const vHeight = this.game.display.vHeight;
    this.logic.blowWhistle(vHeight);
    this.syncFromLogic();

    soundEngine.playSFX('trainWhistle' as any);
    soundEngine.playSFX('whoosh');
    soundEngine.playSFX('toddlerGiggle');
    Haptics.medium();

    this.game.storage.saveHighScore('littleTrain', this.score);
  }

  update(dt: number, input: InputManager): void {
    const vHeight = this.game.display.vHeight;
    const { pickedUpPassenger } = this.logic.update(dt, vHeight);
    this.syncFromLogic();

    if (pickedUpPassenger) {
      this.checkStoryGoal(this.logic.passengers.length);
      this.game.storage.saveHighScore('littleTrain', this.score);
      soundEngine.playSFX('fanfare');
      soundEngine.playSFX('bunnySqueak');
      Haptics.success();
      this.game.particles.spawnSparkles(220, vHeight - 140, 12);
    }

    if (input.actionJustReleased) {
      this.blowWhistle();
    }
  }

  render(ctx: CanvasRenderingContext2D, _alpha: number, display: DisplayManager): void {
    this.renderer.render(ctx, this.logic, display, this.game.selectedAvatar);
  }

  override getEntities(): Record<string, unknown> {
    return {
      trainX: this.trainX,
      passengersCount: this.passengers.length,
      stationsRemaining: this.stations.filter(s => !s.pickedUp).length
    };
  }

  override getModeState(): Record<string, unknown> {
    return {
      score: this.score,
      trainX: this.trainX,
      trainSpeed: this.trainSpeed,
      passengersCount: this.passengers.length,
      timer: this.time,
      feverMeter: 0,
      multiplier: 1,
      coopSavedCount: 0,
      isOverheating: false
    };
  }
}
