/**
 * Settings Modal Dialog
 * Adventures of Trishu Mini-Game Suite
 * Pure Vanilla TypeScript - Zero React
 * Strictly under 500 lines
 */

import { StorageManager, storageManager } from '../engine/StorageManager';
import { soundEngine } from '../engine/SoundEngine';
import { Haptics } from '../engine/Haptics';

export class SettingsModal {
  private el: HTMLElement | null = null;
  private storage: StorageManager;
  private onCloseCallback?: () => void;

  constructor(storage: StorageManager = storageManager) {
    this.storage = storage;
  }

  public open(parent: HTMLElement = document.body, onClose?: () => void): void {
    if (this.el) return;
    this.onCloseCallback = onClose;

    const bgmVal = this.storage.getBgmVolume();
    const sfxVal = this.storage.getSfxVolume();
    const haptics = this.storage.isHapticsEnabled();
    const toddlerLock = this.storage.isToddlerLockEnabled();

    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.setAttribute('role', 'dialog');
    backdrop.setAttribute('aria-modal', 'true');
    backdrop.setAttribute('aria-label', 'Game Settings');

    backdrop.innerHTML = `
      <div class="modal-card settings-modal">
        <button type="button" class="modal-close-btn" aria-label="Close settings">✕</button>
        <h2 class="modal-title">⚙️ Game Settings</h2>
        
        <div class="settings-group">
          <label class="settings-label" for="setting-bgm">
            <span>🎵 Music Volume</span>
            <span class="settings-val-badge" id="bgm-val-text">${Math.round(bgmVal * 100)}%</span>
          </label>
          <input type="range" id="setting-bgm" class="volume-slider" min="0" max="1" step="0.05" value="${bgmVal}">
        </div>

        <div class="settings-group">
          <label class="settings-label" for="setting-sfx">
            <span>🔊 Sound Effects</span>
            <span class="settings-val-badge" id="sfx-val-text">${Math.round(sfxVal * 100)}%</span>
          </label>
          <input type="range" id="setting-sfx" class="volume-slider" min="0" max="1" step="0.05" value="${sfxVal}">
        </div>

        <div class="settings-row settings-toggle-row">
          <span class="settings-toggle-label">📳 Vibration / Haptics</span>
          <button type="button" class="settings-toggle-btn ${haptics ? 'active' : ''}" id="toggle-haptics">
            ${haptics ? 'ON ✅' : 'OFF ❌'}
          </button>
        </div>

        <div class="settings-row settings-toggle-row">
          <span class="settings-toggle-label">🔒 Toddler Lock (Hold Home 3s)</span>
          <button type="button" class="settings-toggle-btn ${toddlerLock ? 'active' : ''}" id="toggle-toddler-lock">
            ${toddlerLock ? 'ON ✅' : 'OFF ❌'}
          </button>
        </div>

        <div class="settings-danger-zone">
          <button type="button" class="settings-reset-btn" id="btn-reset-scores">
            🏆 Reset High Scores
          </button>
          <div class="settings-reset-feedback" id="reset-feedback" style="display: none;">
            Scores have been reset! ✨
          </div>
        </div>
      </div>
    `;

    // Bind event listeners
    const closeBtn = backdrop.querySelector('.modal-close-btn') as HTMLButtonElement;
    closeBtn.onclick = () => this.close();

    backdrop.onclick = (e) => {
      if (e.target === backdrop) this.close();
    };

    const bgmInput = backdrop.querySelector('#setting-bgm') as HTMLInputElement;
    const bgmText = backdrop.querySelector('#bgm-val-text') as HTMLElement;
    bgmInput.oninput = () => {
      const val = parseFloat(bgmInput.value);
      bgmText.textContent = `${Math.round(val * 100)}%`;
      this.storage.setBgmVolume(val);
      soundEngine.setBgmVolume(val);
    };

    const sfxInput = backdrop.querySelector('#setting-sfx') as HTMLInputElement;
    const sfxText = backdrop.querySelector('#sfx-val-text') as HTMLElement;
    sfxInput.oninput = () => {
      const val = parseFloat(sfxInput.value);
      sfxText.textContent = `${Math.round(val * 100)}%`;
      this.storage.setSfxVolume(val);
      soundEngine.setSfxVolume(val);
    };

    const hapticsBtn = backdrop.querySelector('#toggle-haptics') as HTMLButtonElement;
    hapticsBtn.onclick = () => {
      const next = !this.storage.isHapticsEnabled();
      this.storage.setHapticsEnabled(next);
      hapticsBtn.className = `settings-toggle-btn ${next ? 'active' : ''}`;
      hapticsBtn.textContent = next ? 'ON ✅' : 'OFF ❌';
      soundEngine.playSFX('click');
      if (next) Haptics.tap();
    };

    const toddlerBtn = backdrop.querySelector('#toggle-toddler-lock') as HTMLButtonElement;
    toddlerBtn.onclick = () => {
      const next = !this.storage.isToddlerLockEnabled();
      this.storage.setToddlerLockEnabled(next);
      toddlerBtn.className = `settings-toggle-btn ${next ? 'active' : ''}`;
      toddlerBtn.textContent = next ? 'ON ✅' : 'OFF ❌';
      soundEngine.playSFX('click');
      Haptics.tap();
    };

    const resetBtn = backdrop.querySelector('#btn-reset-scores') as HTMLButtonElement;
    const feedback = backdrop.querySelector('#reset-feedback') as HTMLElement;
    resetBtn.onclick = () => {
      this.storage.resetHighScores();
      soundEngine.playSFX('fanfare');
      Haptics.heavy();
      feedback.style.display = 'block';
      setTimeout(() => {
        if (feedback) feedback.style.display = 'none';
      }, 2500);
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
