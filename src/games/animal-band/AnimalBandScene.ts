/**
 * Mode 18: Farmyard Animal Band - Scene Coordinator
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
import { AnimalBandLogic } from './AnimalBandLogic';
import { AnimalBandRenderer } from './AnimalBandRenderer';

export class AnimalBandScene extends BaseScene {
  public logic: AnimalBandLogic;
  public renderer: AnimalBandRenderer;
  public particles: ParticleEngine;

  constructor(game: GameEngine) {
    super(game);
    this.logic = new AnimalBandLogic();
    this.renderer = new AnimalBandRenderer();
    this.particles = new ParticleEngine(80);
  }

  public enter(): void {
    super.enter();
    soundEngine.setTrack('frenzy');
    this.particles.clear();
    const w = this.game.canvas ? this.game.canvas.width : 960;
    const h = this.game.canvas ? this.game.canvas.height : 540;
    this.logic.reset(w, h);
    voiceNarrator.speak('Welcome to the Farmyard Band! Tap to play music!');
  }

  public update(dt: number, input: InputManager): void {
    const w = this.game.canvas ? this.game.canvas.width : 960;
    const h = this.game.canvas ? this.game.canvas.height : 540;
    if (this.logic.width !== w || this.logic.height !== h) {
      this.logic.layout(w, h);
    }

    if (input.wasJustPressed()) {
      const pos = input.getPointerPos();
      const isPortrait = h > w;
      const tuttiY = isPortrait ? h * 0.86 : h * 0.86;

      // Check Tutti button tap (centered at w/2, tuttiY with 200x50 box)
      if (Math.abs(pos.x - w / 2) < 110 && Math.abs(pos.y - tuttiY) < 32) {
        this.triggerTuttiChorus();
      } else {
        const memberIdx = this.logic.findMemberAt(pos.x, pos.y);
        if (memberIdx >= 0) {
          this.playBandMember(memberIdx);
        } else {
          // Tap anywhere else plays random or nearest member
          const nearest = this.getNearestMember(pos.x);
          this.playBandMember(nearest);
        }
      }
    }

    this.logic.update(dt);
    this.particles.update(dt);
    this.score = this.logic.score;
  }

  private playBandMember(index: number): void {
    const res = this.logic.playMember(index);
    if (!res.played) return;

    Haptics.light();
    const m = res.member;

    switch (m.instrument) {
      case 'xylophone':
        soundEngine.playSFX('xylophoneChime', { pitch: res.pitch });
        break;
      case 'drums':
        soundEngine.playSFX('drumThump');
        break;
      case 'maracas':
        soundEngine.playSFX('maracaShake');
        break;
      case 'accordion':
        soundEngine.playSFX('duckQuack');
        break;
      case 'bass':
        soundEngine.playSFX('hornHonk');
        break;
    }

    this.particles.emit({
      x: m.x,
      y: m.y - m.height * 0.4,
      count: 8,
      color: m.color,
      speedMin: 50,
      speedMax: 140,
      sizeMin: 3,
      sizeMax: 6,
      lifetime: 0.5
    });

    this.checkStoryGoal(this.logic.totalNotesPlayed, 10);
  }

  private triggerTuttiChorus(): void {
    this.logic.triggerTutti();
    Haptics.success();
    soundEngine.playSFX('fanfare');

    const w = this.game.canvas ? this.game.canvas.width : 960;
    const h = this.game.canvas ? this.game.canvas.height : 540;

    // Burst confetti particles across stage
    this.particles.emit({
      x: w / 2,
      y: h * 0.4,
      count: 35,
      color: '#FF4081',
      speedMin: 120,
      speedMax: 320,
      sizeMin: 4,
      sizeMax: 9,
      lifetime: 1.2
    });

    voiceNarrator.speak('Bravo! What a wonderful band!');
    this.checkStoryGoal(this.logic.totalNotesPlayed + 10, 10);
  }

  private getNearestMember(x: number): number {
    let nearestIdx = 0;
    let minDist = Infinity;
    for (let i = 0; i < this.logic.members.length; i++) {
      const dist = Math.abs(this.logic.members[i].x - x);
      if (dist < minDist) {
        minDist = dist;
        nearestIdx = i;
      }
    }
    return nearestIdx;
  }

  public render(ctx: CanvasRenderingContext2D, _alpha: number, display: DisplayManager): void {
    this.renderer.render(ctx, this.logic, display.width, display.height);
    this.particles.render(ctx);
  }

  public override getEntities(): Record<string, unknown> {
    return {
      members: this.logic.members,
      notes: this.logic.notes
    };
  }

  public override getModeState(): Record<string, unknown> {
    return {
      score: this.score,
      totalNotesPlayed: this.logic.totalNotesPlayed,
      isTuttiActive: this.logic.isTuttiActive
    };
  }
}
