/**
 * Mode 20: Sleepy Bedtime Barn - Scene Coordinator
 * Adventures of Trishu Preschool Suite
 * Strictly under 500 lines
 */

import { BaseScene } from '../base/BaseScene';
import { GameEngine } from '../../engine/GameEngine';
import { InputManager } from '../../engine/InputManager';
import { DisplayManager } from '../../engine/DisplayManager';
import { ParticleEngine } from '../../engine/ParticleEngine';
import { soundEngine } from '../../engine/SoundEngine';
import { voiceNarrator } from '../../engine/audio';
import { Haptics } from '../../engine/Haptics';
import { BedtimeBarnLogic } from './BedtimeBarnLogic';
import { BedtimeBarnRenderer } from './BedtimeBarnRenderer';

export class BedtimeBarnScene extends BaseScene {
  public logic: BedtimeBarnLogic;
  public renderer: BedtimeBarnRenderer;
  public particles: ParticleEngine;
  private musicBoxPitches: number[] = [880, 1046, 1174, 1318, 1567];
  private pitchIndex: number = 0;

  constructor(game: GameEngine) {
    super(game);
    this.logic = new BedtimeBarnLogic();
    this.renderer = new BedtimeBarnRenderer();
    this.particles = new ParticleEngine(80);
  }

  public enter(): void {
    super.enter();
    soundEngine.setTrack('gentle');
    this.particles.clear();
    const w = this.game.display ? this.game.display.vWidth : 960;
    const h = this.game.display ? this.game.display.vHeight : 540;
    this.logic.reset(w, h);
    voiceNarrator.speak('Sleepy Bedtime Barn. Time to tuck in our friends!');
  }

  public update(dt: number, input: InputManager): void {
    const w = this.game.display ? this.game.display.vWidth : 960;
    const h = this.game.display ? this.game.display.vHeight : 540;
    if (this.logic.width !== w || this.logic.height !== h) {
      this.logic.layout(w, h);
    }

    if (input.wasJustPressed()) {
      const pos = input.getPointerPos();

      // Check moon tap
      if (this.logic.isMoonAt(pos.x, pos.y)) {
        this.logic.winkMoon();
        soundEngine.playSFX('musicBoxStar');
        Haptics.tap();
        voiceNarrator.speak('Goodnight, smiling moon!');
      } else {
        // Check star tap
        const starId = this.logic.findStarAt(pos.x, pos.y);
        if (starId >= 0) {
          this.catchStar(starId, pos.x, pos.y);
        } else {
          // Check animal stall tap
          const stallIdx = this.logic.findStallAt(pos.x, pos.y);
          if (stallIdx >= 0) {
            this.tuckInStall(stallIdx);
          } else if (pos.y < h * 0.45 && this.logic.stars.length > 0) {
            // Toddler tapped upper sky: catch nearest star!
            const nearestStar = this.logic.stars[0];
            this.catchStar(nearestStar.id, nearestStar.x, nearestStar.y);
          }
        }
      }
    }

    this.logic.update(dt);
    this.particles.update(dt);
    this.score = this.logic.score;
  }

  private catchStar(starId: number, x: number, y: number): void {
    this.logic.catchStar(starId);
    const freq = this.musicBoxPitches[this.pitchIndex % this.musicBoxPitches.length];
    this.pitchIndex++;
    soundEngine.playSFX('musicBoxStar', { pitch: freq });
    Haptics.tap();

    this.particles.emit({
      x,
      y,
      count: 10,
      color: '#FFF59D',
      speedMin: 40,
      speedMax: 120,
      sizeMin: 2,
      sizeMax: 6,
      lifetime: 0.6
    });

    this.checkStoryGoal(this.logic.starsCollected, 5);
  }

  private tuckInStall(stallIdx: number): void {
    const res = this.logic.tuckInAnimal(stallIdx);
    if (!res.tucked) return;

    soundEngine.playSFX('sleepyYawn');
    Haptics.medium();

    this.particles.emit({
      x: res.stall.x,
      y: res.stall.y,
      count: 8,
      color: res.stall.quiltColor,
      speedMin: 30,
      speedMax: 80,
      sizeMin: 3,
      sizeMax: 5,
      lifetime: 0.5
    });

    if (this.logic.allTuckedIn) {
      voiceNarrator.speak('Shh... sweet dreams, everyone!');
      this.checkStoryGoal(4, 4);
    } else {
      voiceNarrator.speak(`Night-night, ${res.stall.name}!`);
      this.checkStoryGoal(this.logic.stalls.filter(s => s.isAsleep).length, 4);
    }
  }

  public render(ctx: CanvasRenderingContext2D, _alpha: number, display: DisplayManager): void {
    this.renderer.render(ctx, this.logic, display.vWidth, display.vHeight);
    this.particles.render(ctx);
  }

  public override getEntities(): Record<string, unknown> {
    return {
      stalls: this.logic.stalls,
      stars: this.logic.stars,
      moon: this.logic.moon
    };
  }

  public override getModeState(): Record<string, unknown> {
    return {
      score: this.score,
      starsCollected: this.logic.starsCollected,
      allTuckedIn: this.logic.allTuckedIn
    };
  }
}
