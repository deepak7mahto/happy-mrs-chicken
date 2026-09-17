/**
 * Story Intro Modal Dialog
 * Adventures of Trishu — The Grand Story Journey
 * Pure Vanilla TypeScript - Zero React
 * Strictly under 500 lines
 */

import { StoryStopDef } from '../types/story';
import { getChapterByStopIndex } from '../story/storyData';
import { soundEngine } from '../engine/SoundEngine';
import { Haptics } from '../engine/Haptics';

export class StoryIntroModal {
  private el: HTMLElement | null = null;
  private onStartCallback?: () => void;
  private onCloseCallback?: () => void;

  public open(
    stopDef: StoryStopDef,
    parent: HTMLElement = document.body,
    onStart?: () => void,
    onClose?: () => void
  ): void {
    if (this.el) return;
    this.onStartCallback = onStart;
    this.onCloseCallback = onClose;

    const chapter = getChapterByStopIndex(stopDef.index);

    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.setAttribute('role', 'dialog');
    backdrop.setAttribute('aria-modal', 'true');
    backdrop.setAttribute('aria-label', 'Story Intro');

    backdrop.innerHTML = `
      <div class="modal-card story-intro-card">
        <button type="button" class="modal-close-btn story-intro-close-btn" aria-label="Close Story Intro">✕</button>
        ${chapter ? `
          <div class="story-intro-chapter-pill">
            ${chapter.emoji} Chapter ${chapter.id}: ${chapter.title}
          </div>
        ` : ''}

        <div class="story-intro-emoji-banner" aria-hidden="true">
          ${stopDef.stampEmoji}
        </div>

        <h2 class="story-intro-title">
          Stop ${stopDef.index + 1}: ${stopDef.title}
        </h2>

        <p class="story-intro-blurb">
          ${stopDef.storyBlurb}
        </p>

        <div class="story-intro-goal-box">
          <span>🎯</span>
          <span>Goal: <strong>${stopDef.goalDescription}</strong></span>
        </div>

        <button type="button" class="story-intro-start-btn" id="story-intro-start">
          Let's Play! 🚀
        </button>
      </div>
    `;

    backdrop.onclick = (e) => {
      if (e.target === backdrop) this.close();
    };

    const closeBtn = backdrop.querySelector('.story-intro-close-btn') as HTMLButtonElement;
    closeBtn.onclick = () => this.close();

    const startBtn = backdrop.querySelector('#story-intro-start') as HTMLButtonElement;
    startBtn.onclick = () => {
      soundEngine.playSFX('fanfare');
      Haptics.medium();
      this.close();
      if (this.onStartCallback) {
        this.onStartCallback();
      }
    };

    parent.appendChild(backdrop);
    this.el = backdrop;
  }

  public close(): void {
    if (!this.el) return;
    soundEngine.playSFX('click');
    Haptics.tap();
    if (this.el.parentNode) {
      this.el.parentNode.removeChild(this.el);
    }
    this.el = null;
    if (this.onCloseCallback) {
      this.onCloseCallback();
    }
  }

  public isOpen(): boolean {
    return this.el !== null;
  }
}
