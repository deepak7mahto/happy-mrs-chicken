/**
 * Mode: Emojis - Scene Coordinator
 * Adventures of Trishu Mini-Game Suite
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
import { EmojisLogic } from './EmojisLogic';
import { EmojisRenderer } from './EmojisRenderer';
import { EmotionType } from './types';

export class EmojisScene extends BaseScene {
  public logic: EmojisLogic;
  public renderer: EmojisRenderer;
  public particles: ParticleEngine;

  constructor(game: GameEngine) {
    super(game);
    this.logic = new EmojisLogic();
    this.renderer = new EmojisRenderer();
    this.particles = new ParticleEngine(80);
  }

  public override enter(): void {
    super.enter();
    soundEngine.setTrack('gentle');
    this.particles.clear();
    const w = this.game.display ? this.game.display.vWidth : 960;
    const h = this.game.display ? this.game.display.vHeight : 540;
    this.logic.reset(w, h);
    voiceNarrator.speak('Tap the feeling faces and watch emojis bounce!');
  }

  public override exit(): void {
    super.exit();
    if (this.game && this.game.storage) {
      this.game.storage.saveHighScore('EMOJIS', this.score);
    }
  }

  public override update(dt: number, input: InputManager): void {
    const w = this.game.display ? this.game.display.vWidth : 960;
    const h = this.game.display ? this.game.display.vHeight : 540;
    if (this.logic.width !== w || this.logic.height !== h) {
      this.logic.layout(w, h);
    }

    if (input.wasJustPressed()) {
      const pos = input.getPointerPos();

      // 1. Check Party Button
      if (this.logic.isPartyButtonHit(pos.x, pos.y)) {
        this.handlePartyTap();
      } else {
        // 2. Check 4 Major Emotion Buttons
        const emotionHit = this.logic.findMajorButtonAt(pos.x, pos.y);
        if (emotionHit) {
          this.handleEmotionTap(emotionHit);
        } else {
          // 3. Check Small Emoji Tray
          const smallIdx = this.logic.findSmallEmojiAt(pos.x, pos.y);
          if (smallIdx >= 0) {
            this.handleSmallEmojiTap(smallIdx);
          } else {
            // 4. Check if tapping a bouncing emoji in air
            const popped = this.logic.popEntityAt(pos.x, pos.y);
            if (popped) {
              soundEngine.playSFX('magicChime', { pitch: 1.2 });
              Haptics.tap();
            } else {
              // Tap on stage launches random active emoji
              this.handleStageTap(pos.x, pos.y);
            }
          }
        }
      }
    }

    this.logic.update(dt);
    this.particles.update(dt);
    this.score = this.logic.score;
  }

  private handleEmotionTap(emotion: EmotionType): void {
    this.logic.selectEmotion(emotion);
    Haptics.success();

    switch (emotion) {
      case 'HAPPY':
        soundEngine.playSFX('toddlerGiggle');
        soundEngine.playTone(659.25, 0.15, 'sine', 0.18);
        voiceNarrator.speak('Happy!');
        break;
      case 'SAD':
        soundEngine.playSFX('sleepyYawn');
        soundEngine.playTone(392.0, 0.25, 'triangle', 0.15);
        voiceNarrator.speak('Sad');
        break;
      case 'ANGRY':
        soundEngine.playSFX('drumThump');
        soundEngine.playSFX('mudThud');
        voiceNarrator.speak('Grrr, angry!');
        break;
      case 'SURPRISE':
        soundEngine.playSFX('whoosh');
        soundEngine.playSFX('bubblePop', { pitch: 1.4 });
        voiceNarrator.speak('Surprise!');
        break;
    }

    this.particles.emit({
      x: this.logic.stageCenterX,
      y: this.logic.stageCenterY,
      count: 14,
      color: emotion === 'HAPPY' ? '#FFD54F' : emotion === 'SAD' ? '#64B5F6' : emotion === 'ANGRY' ? '#EF5350' : '#BA68C8',
      speedMin: 60,
      speedMax: 180,
      sizeMin: 4,
      sizeMax: 8,
      lifetime: 0.6
    });

    this.checkStoryGoal(this.logic.totalSmiles, 8);
  }

  private handleSmallEmojiTap(index: number): void {
    const entity = this.logic.tapSmallEmoji(index);
    if (!entity) return;

    Haptics.tap();
    const pitches = [1.0, 1.15, 1.25, 1.35, 1.5];
    const pitch = pitches[index % pitches.length];
    soundEngine.playSFX('stickerPop', { pitch });

    this.particles.emit({
      x: entity.x,
      y: entity.y,
      count: 6,
      color: '#FFEE58',
      speedMin: 40,
      speedMax: 120,
      sizeMin: 3,
      sizeMax: 6,
      lifetime: 0.4
    });

    this.checkStoryGoal(this.logic.emojisSpawned, 12);
  }

  private handleStageTap(x: number, y: number): void {
    // Stage tap spawns an emoji matching the active emotion
    const emojiMap: Record<EmotionType, string> = {
      HAPPY: '😊',
      SAD: '😢',
      ANGRY: '😡',
      SURPRISE: '😲'
    };
    this.logic.spawnEmojiEntity(emojiMap[this.logic.currentEmotion], x, y);
    soundEngine.playSFX('bubblePop', { pitch: 1.1 });
    Haptics.tap();
  }

  private handlePartyTap(): void {
    this.logic.triggerParty();
    soundEngine.playSFX('fanfare');
    Haptics.success();
    voiceNarrator.speak('Party time! Emojis everywhere!');

    this.particles.emit({
      x: this.logic.width * 0.5,
      y: this.logic.height * 0.4,
      count: 24,
      color: '#FF4081',
      speedMin: 100,
      speedMax: 260,
      sizeMin: 4,
      sizeMax: 9,
      lifetime: 0.9
    });
  }

  public override render(ctx: CanvasRenderingContext2D, _alpha: number, display: DisplayManager): void {
    this.renderer.render(ctx, this.logic, display.vWidth, display.vHeight);
    this.particles.render(ctx);
  }

  public override getEntities(): Record<string, unknown> {
    return {
      bouncingEntities: this.logic.bouncingEntities,
      smallEmojis: this.logic.smallEmojis,
      majorButtons: this.logic.majorButtons,
      sparkles: this.logic.sparkles
    };
  }

  public override getModeState(): Record<string, unknown> {
    return {
      score: this.score,
      currentEmotion: this.logic.currentEmotion,
      totalSmiles: this.logic.totalSmiles,
      emojisSpawned: this.logic.emojisSpawned
    };
  }
}
