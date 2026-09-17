/**
 * Story Victory & Stamp Award Modal
 * Adventures of Trishu — The Grand Story Journey
 * Pure Vanilla TypeScript - Zero React
 * Strictly under 500 lines
 */

import { StoryStopDef } from '../types/story';
import { soundEngine } from '../engine/SoundEngine';
import { Haptics } from '../engine/Haptics';

export class StoryVictoryModal {
  private el: HTMLElement | null = null;
  private onNextCallback?: () => void;
  private onReplayCallback?: () => void;
  private onBackToMapCallback?: () => void;

  public open(
    stopDef: StoryStopDef,
    _score: number,
    stars: number,
    isNewStamp: boolean,
    hasNext: boolean,
    parent: HTMLElement = document.body,
    callbacks?: {
      onNext?: () => void;
      onReplay?: () => void;
      onBackToMap?: () => void;
    },
    unlockedAccessory?: string
  ): void {
    if (this.el) return;
    this.onNextCallback = callbacks?.onNext;
    this.onReplayCallback = callbacks?.onReplay;
    this.onBackToMapCallback = callbacks?.onBackToMap;

    soundEngine.playVictoryFanfare();
    Haptics.fanfare();

    const starString = '⭐'.repeat(Math.max(1, Math.min(3, stars)));

    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.setAttribute('role', 'dialog');
    backdrop.setAttribute('aria-modal', 'true');
    backdrop.setAttribute('aria-label', 'Story Victory Dialog');

    backdrop.innerHTML = `
      <div class="modal-card story-victory-card">
        <h2 style="font-size: 1.5rem; font-weight: 900; color: #E65100; margin: 4px 0;">
          Stop Complete! 🎉
        </h2>

        <div class="story-victory-stamp-box" aria-hidden="true">
          ${stopDef.stampEmoji}
        </div>

        <div class="story-victory-stamp-name">
          ${isNewStamp ? '🌟 New Passport Stamp! 🌟' : 'Stamp Collected!'}
        </div>
        <div style="font-size: 1rem; font-weight: 800; color: #37474F; margin-bottom: 8px;">
          ${stopDef.stampName}
        </div>
        ${unlockedAccessory ? `
          <div style="margin: 6px auto; padding: 6px 14px; background: #FFF3E0; border: 2px dashed #FF9800; border-radius: 12px; font-size: 0.95rem; font-weight: 800; color: #E65100; display: inline-block;">
            👒 Wardrobe Unlock: ${unlockedAccessory}!
          </div>
        ` : ''}

        <div class="story-victory-stars" aria-label="${stars} stars">
          ${starString}
        </div>

        <p class="story-victory-blurb">
          ${stopDef.victoryBlurb}
        </p>

        <div class="story-victory-actions">
          ${hasNext ? `
            <button type="button" class="story-victory-next-btn" id="victory-next-btn">
              Next Adventure! ➡️
            </button>
          ` : `
            <button type="button" class="story-victory-next-btn" id="victory-next-btn" style="background: linear-gradient(180deg, #FFB300 0%, #F57F17 100%); border-color: #E65100;">
              🏆 Complete Grand Journey! 🏆
            </button>
          `}

          <div class="story-victory-sub-btns">
            <button type="button" class="story-victory-sub-btn" id="victory-replay-btn">
              🔄 Play Again
            </button>
            <button type="button" class="story-victory-sub-btn" id="victory-map-btn">
              🗺️ Story Map
            </button>
          </div>
        </div>
      </div>
    `;

    backdrop.onclick = (e) => {
      if (e.target === backdrop) this.close(this.onBackToMapCallback);
    };

    const nextBtn = backdrop.querySelector('#victory-next-btn') as HTMLButtonElement;
    nextBtn.onclick = () => {
      soundEngine.playSFX('fanfare');
      Haptics.medium();
      this.close(hasNext ? this.onNextCallback : this.onBackToMapCallback);
    };

    const replayBtn = backdrop.querySelector('#victory-replay-btn') as HTMLButtonElement;
    replayBtn.onclick = () => {
      soundEngine.playSFX('click');
      Haptics.tap();
      this.close(this.onReplayCallback);
    };

    const mapBtn = backdrop.querySelector('#victory-map-btn') as HTMLButtonElement;
    mapBtn.onclick = () => {
      soundEngine.playSFX('click');
      Haptics.tap();
      this.close(this.onBackToMapCallback);
    };

    parent.appendChild(backdrop);
    this.el = backdrop;
  }

  public close(callback?: () => void): void {
    if (!this.el) return;
    if (this.el.parentNode) {
      this.el.parentNode.removeChild(this.el);
    }
    this.el = null;
    if (callback) {
      callback();
    }
  }

  public isOpen(): boolean {
    return this.el !== null;
  }
}
