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

    soundEngine.playSFX('trainWhistle');
    soundEngine.playSFX('whoosh');
    soundEngine.playSFX('toddlerGiggle');
    Haptics.medium();

    this.game.storage.saveHighScore('littleTrain', this.score);
  }

  public cycleThrottle(): void {
    const level = this.logic.cycleThrottle();
    this.syncFromLogic();

    soundEngine.playTone(280 + level * 70, 0.14, 'sine', 0.22);
    soundEngine.playSFX('click');
    Haptics.tap();

    const vWidth = this.game.display.vWidth;
    const vHeight = this.game.display.vHeight;
    const throttleLabels = ['🐢 Slow Chug!', '🚂 Cruising!', '⚡ Full Steam!'];
    this.game.particles.spawnScorePopup(vWidth - 85, vHeight - 75, throttleLabels[level - 1]);
  }

  update(dt: number, input: InputManager): void {
    const vWidth = this.game.display.vWidth;
    const vHeight = this.game.display.vHeight;
    const { pickedUpPassenger, enteredTunnel } = this.logic.update(dt, vHeight);
    this.syncFromLogic();

    if (enteredTunnel) {
      soundEngine.playSFX('trainWhistle');
      soundEngine.playSFX('toddlerGiggle');
      Haptics.medium();
      this.game.particles.spawnScorePopup(vWidth / 2, vHeight * 0.4, '⛰️ Tunnel Echo! +30');
      this.game.storage.saveHighScore('littleTrain', this.score);
    }

    if (pickedUpPassenger) {
      this.checkStoryGoal(this.logic.passengers.length);
      this.game.storage.saveHighScore('littleTrain', this.score);
      soundEngine.playSFX('fanfare');
      soundEngine.playSFX('bunnySqueak');
      Haptics.success();
      this.game.particles.spawnSparkles(220, vHeight - 140, 12);
    }

    if (input.actionJustReleased) {
      const ptr = input.primaryPointer;
      const throttleX = vWidth - 65;
      const throttleY = vHeight - 48;
      if (Math.hypot(ptr.x - throttleX, ptr.y - throttleY) <= 55) {
        this.cycleThrottle();
      } else {
        this.blowWhistle();
      }
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
