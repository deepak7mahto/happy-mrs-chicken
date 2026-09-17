/**
 * Adventure Passport & Collectible Stamp Album Modal
 * Adventures of Trishu — Pure Vanilla TypeScript
 * Strictly under 500 lines
 */

import { STORY_STOPS } from '../story/storyData';
import { StorageManager, storageManager } from '../engine/StorageManager';
import { soundEngine } from '../engine/SoundEngine';
import { Haptics } from '../engine/Haptics';

export class PassportModal {
  private el: HTMLElement | null = null;
  private storage: StorageManager;
  private onCloseCallback?: () => void;
  private onSelectStopCallback?: (stopIndex: number) => void;

  constructor(storage: StorageManager = storageManager) {
    this.storage = storage;
  }

  public open(
    parent: HTMLElement = document.body,
    onSelectStop?: (stopIndex: number) => void,
    onClose?: () => void
  ): void {
    if (this.el) return;
    this.onSelectStopCallback = onSelectStop;
    this.onCloseCallback = onClose;

    const progress = this.storage.getStoryProgress();
    const stamps = progress.passportStamps;
    const totalStamps = stamps.length;
    const isAllComplete = totalStamps >= STORY_STOPS.length;

    let totalStars = 0;
    for (const s of Object.values(progress.completedStops)) {
      totalStars += s.stars || 0;
    }

    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.setAttribute('role', 'dialog');
    backdrop.setAttribute('aria-modal', 'true');
    backdrop.setAttribute('aria-label', 'Adventure Passport');

    backdrop.innerHTML = `
      <div class="modal-card passport-modal-card">
        <button type="button" class="modal-close-btn passport-close-btn" aria-label="Close Passport">✕</button>
        <h2 style="font-size: 1.5rem; font-weight: 900; color: #E65100; margin: 4px 0 6px;">
          Adventure Passport 📖
        </h2>
        <div style="font-size: 0.95rem; font-weight: 800; color: #5D4037; margin-bottom: 12px;">
          Stamps: ${totalStamps} / ${STORY_STOPS.length} • Stars: ⭐ ${totalStars}
        </div>

        ${isAllComplete ? `
          <div style="background: linear-gradient(90deg, #FFD54F 0%, #FFB300 100%); border: 2.5px solid #FF8F00; border-radius: 16px; padding: 8px 12px; color: #3E2723; font-weight: 900; font-size: 0.9rem; margin-bottom: 10px;">
            🏆 Grand Master Explorer Trophy Unlocked! 🏆
          </div>
        ` : ''}

        <div class="passport-grid" id="passport-grid"></div>
      </div>
    `;

    backdrop.onclick = (e) => {
      if (e.target === backdrop) this.close();
    };
    const closeBtn = backdrop.querySelector('.passport-close-btn') as HTMLButtonElement;
    closeBtn.onclick = () => this.close();

    const grid = backdrop.querySelector('#passport-grid') as HTMLElement;
    STORY_STOPS.forEach((stop, idx) => {
      const isUnlocked = stamps.includes(stop.stampId);
      const stopProgress = progress.completedStops[stop.id];
      const stars = stopProgress?.stars || (isUnlocked ? 3 : 0);

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `passport-slot ${isUnlocked ? 'unlocked' : 'locked'}`;
      btn.setAttribute('aria-label', `Stop ${idx + 1}: ${stop.title}. ${isUnlocked ? 'Unlocked' : 'Locked'}`);
      btn.innerHTML = `
        <div class="passport-slot-emoji">${isUnlocked ? stop.stampEmoji : '🔒'}</div>
        <div class="passport-slot-name">${isUnlocked ? stop.stampName : `Stop ${idx + 1}`}</div>
        <div class="passport-slot-stars">${isUnlocked ? '⭐'.repeat(stars) : '• • •'}</div>
      `;

      btn.onclick = () => {
        soundEngine.playSFX('click');
        Haptics.tap();
        this.close();
        if (this.onSelectStopCallback) {
          this.onSelectStopCallback(idx);
        }
      };

      grid.appendChild(btn);
    });

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
