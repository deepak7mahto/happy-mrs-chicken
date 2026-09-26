/**
 * Mode 17: Hungry Farmyard Friends - Scene Coordinator
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
import { AnimalFeedingLogic } from './AnimalFeedingLogic';
import { AnimalFeedingRenderer } from './AnimalFeedingRenderer';

export class AnimalFeedingScene extends BaseScene {
  public logic: AnimalFeedingLogic;
  public renderer: AnimalFeedingRenderer;
  public particles: ParticleEngine;
  private selectedSnackIndex: number = -1;

  constructor(game: GameEngine) {
    super(game);
    this.logic = new AnimalFeedingLogic();
    this.renderer = new AnimalFeedingRenderer();
    this.particles = new ParticleEngine(80);
  }

  public enter(): void {
    super.enter();
    soundEngine.setTrack('waltz');
    this.particles.clear();
    const w = this.game.canvas ? this.game.canvas.width : 960;
    const h = this.game.canvas ? this.game.canvas.height : 540;
    this.logic.reset(w, h);
    voiceNarrator.speak("Let's feed our hungry friends!");
  }

  public update(dt: number, input: InputManager): void {
    const w = this.game.canvas ? this.game.canvas.width : 960;
    const h = this.game.canvas ? this.game.canvas.height : 540;
    if (this.logic.width !== w || this.logic.height !== h) {
      this.logic.layout(w, h);
    }

    // Process pointer input
    if (input.wasJustPressed()) {
      const pos = input.getPointerPos();
      const animalIdx = this.logic.findAnimalAt(pos.x, pos.y);
      if (animalIdx >= 0) {
        // Toddler stroked animal tummy!
        this.logic.rubTummy(animalIdx);
        soundEngine.playSFX('tummyRub');
        Haptics.light();
        const animal = this.logic.animals[animalIdx];
        voiceNarrator.speak(`${animal.name} is giggling!`);
      } else {
        const snackIdx = this.logic.findSnackAt(pos.x, pos.y);
        if (snackIdx >= 0) {
          this.selectedSnackIndex = snackIdx;
          // Launch food to hungry animal
          this.launchFood(snackIdx);
        } else if (pos.y > h * 0.65) {
          // Toddler tapped tray anywhere: launch random snack!
          const randomSnack = Math.floor(Math.random() * this.logic.snacks.length);
          this.launchFood(randomSnack);
        }
      }
    }

    // Logic update
    const arrivals = this.logic.update(dt);
    for (const arrival of arrivals) {
      soundEngine.playSFX('foodChomp');
      Haptics.success();
      const animal = this.logic.animals[arrival.animalIndex];

      // Spawn yummy crumb particles
      this.particles.emit({
        x: animal.mouthX,
        y: animal.mouthY,
        count: 14,
        color: '#FFB300',
        speedMin: 60,
        speedMax: 180,
        sizeMin: 3,
        sizeMax: 7,
        lifetime: 0.6
      });

      if (arrival.favored) {
        voiceNarrator.speak(`Yummy! ${animal.name} loves that!`);
      } else {
        voiceNarrator.speak('Munch munch! So good!');
      }

      this.score = this.logic.score;
      this.checkStoryGoal(this.logic.totalFed, 5);
    }

    this.particles.update(dt);
  }

  private launchFood(snackIndex: number): void {
    soundEngine.playSFX('swoosh');
    Haptics.light();
    this.logic.launchSnack(snackIndex);
  }

  public render(ctx: CanvasRenderingContext2D, _alpha: number, display: DisplayManager): void {
    this.renderer.render(ctx, this.logic, display.width, display.height);
    this.particles.render(ctx);
  }

  public override getEntities(): Record<string, unknown> {
    return {
      animals: this.logic.animals,
      snacks: this.logic.snacks,
      activeFood: this.logic.activeFlyingFood
    };
  }

  public override getModeState(): Record<string, unknown> {
    return {
      score: this.score,
      totalFed: this.logic.totalFed
    };
  }
}
