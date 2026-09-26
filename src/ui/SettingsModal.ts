/**
 * Settings Modal Dialog with Parental Gate
 * Adventures of Trishu Preschool Suite
 * Pure Vanilla TypeScript - Zero React
 * Strictly under 500 lines
 */

import { StorageManager, storageManager } from '../engine/StorageManager';
import { soundEngine } from '../engine/SoundEngine';
import { voiceNarrator } from '../engine/audio/VoiceNarrator';
import { Haptics } from '../engine/Haptics';

export class SettingsModal {
  private el: HTMLElement | null = null;
  private storage: StorageManager;
  private onCloseCallback?: () => void;
  public isUnlocked: boolean = false;
  private unlockHoldTimer: number | null = null;
  private unlockHoldStart: number = 0;

  constructor(storage: StorageManager = storageManager) {
    this.storage = storage;
  }

  public open(parent: HTMLElement = document.body, onClose?: () => void): void {
    if (this.el) return;
    this.onCloseCallback = onClose;

    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.setAttribute('role', 'dialog');
    backdrop.setAttribute('aria-modal', 'true');
    backdrop.setAttribute('aria-label', 'Game Settings');

    backdrop.onclick = (e) => {
      if (e.target === backdrop) this.close();
    };

    parent.appendChild(backdrop);
    this.el = backdrop;

    this.renderContent();
  }

  private renderContent(): void {
    if (!this.el) return;

    if (!this.isUnlocked) {
      this.el.innerHTML = `
        <div class="modal-card settings-modal">
          <button type="button" class="modal-close-btn" id="modal-close-gate" aria-label="Close settings">✕</button>
          <h2 class="modal-title">🔒 Grown-Ups Only</h2>
          <p style="text-align: center; color: #546E7A; font-size: 1.05rem; margin: 16px 0; font-weight: 600;">
            Hold the button for 3 seconds to open settings:
          </p>
          <div style="text-align: center; margin: 20px 0;">
            <button type="button" class="settings-reset-btn" id="btn-parental-unlock" style="background: linear-gradient(180deg, #FFB300 0%, #FB8C00 100%); border-color: #E65100; font-size: 1.15rem; padding: 14px 28px; width: 100%; max-width: 260px; position: relative; overflow: hidden;">
              Hold 3s to Unlock 🔓
              <div id="parental-progress" style="position: absolute; bottom: 0; left: 0; height: 5px; background: #FFFFFF; width: 0%; transition: width 0.05s linear;"></div>
            </button>
          </div>
        </div>
      `;

      const closeBtn = this.el.querySelector('#modal-close-gate') as HTMLElement;
      if (closeBtn) closeBtn.onclick = () => this.close();

      const unlockBtn = this.el.querySelector('#btn-parental-unlock') as HTMLElement;
      if (unlockBtn) {
        unlockBtn.onpointerdown = () => this.startUnlockHold();
        unlockBtn.onpointerup = () => this.cancelUnlockHold();
        unlockBtn.onpointercancel = () => this.cancelUnlockHold();
        unlockBtn.onpointerleave = () => this.cancelUnlockHold();
      }
      return;
    }

    const bgmVal = this.storage.getBgmVolume();
    const sfxVal = this.storage.getSfxVolume();
    const haptics = this.storage.isHapticsEnabled();
    const toddlerLock = this.storage.isToddlerLockEnabled();
    const voiceEnabled = voiceNarrator.isEnabled();

    this.el.innerHTML = `
      <div class="modal-card settings-modal">
        <button type="button" class="modal-close-btn" id="modal-close-settings" aria-label="Close settings">✕</button>
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
          <span class="settings-toggle-label">🗣️ Spoken Voice Prompts</span>
          <button type="button" class="settings-toggle-btn ${voiceEnabled ? 'active' : ''}" id="toggle-voice">
            ${voiceEnabled ? 'ON ✅' : 'OFF ❌'}
          </button>
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

    const closeBtn = this.el.querySelector('#modal-close-settings') as HTMLButtonElement;
    if (closeBtn) closeBtn.onclick = () => this.close();

    const bgmInput = this.el.querySelector('#setting-bgm') as HTMLInputElement;
    const bgmText = this.el.querySelector('#bgm-val-text') as HTMLElement;
    if (bgmInput) {
      bgmInput.oninput = () => {
        const val = parseFloat(bgmInput.value);
        bgmText.textContent = `${Math.round(val * 100)}%`;
        this.storage.setBgmVolume(val);
        soundEngine.setBgmVolume(val);
      };
    }

    const sfxInput = this.el.querySelector('#setting-sfx') as HTMLInputElement;
    const sfxText = this.el.querySelector('#sfx-val-text') as HTMLElement;
    if (sfxInput) {
      sfxInput.oninput = () => {
        const val = parseFloat(sfxInput.value);
        sfxText.textContent = `${Math.round(val * 100)}%`;
        this.storage.setSfxVolume(val);
        soundEngine.setSfxVolume(val);
      };
    }

    const voiceBtn = this.el.querySelector('#toggle-voice') as HTMLButtonElement;
    if (voiceBtn) {
      voiceBtn.onclick = () => {
        const next = !voiceNarrator.isEnabled();
        voiceNarrator.setEnabled(next);
        voiceBtn.className = `settings-toggle-btn ${next ? 'active' : ''}`;
        voiceBtn.textContent = next ? 'ON ✅' : 'OFF ❌';
        soundEngine.playSFX('click');
        if (next) voiceNarrator.speak('Voice prompts on!');
      };
    }

    const hapticsBtn = this.el.querySelector('#toggle-haptics') as HTMLButtonElement;
    if (hapticsBtn) {
      hapticsBtn.onclick = () => {
        const next = !this.storage.isHapticsEnabled();
        this.storage.setHapticsEnabled(next);
        hapticsBtn.className = `settings-toggle-btn ${next ? 'active' : ''}`;
        hapticsBtn.textContent = next ? 'ON ✅' : 'OFF ❌';
        soundEngine.playSFX('click');
        if (next) Haptics.tap();
      };
    }

    const toddlerBtn = this.el.querySelector('#toggle-toddler-lock') as HTMLButtonElement;
    if (toddlerBtn) {
      toddlerBtn.onclick = () => {
        const next = !this.storage.isToddlerLockEnabled();
        this.storage.setToddlerLockEnabled(next);
        toddlerBtn.className = `settings-toggle-btn ${next ? 'active' : ''}`;
        toddlerBtn.textContent = next ? 'ON ✅' : 'OFF ❌';
        soundEngine.playSFX('click');
        Haptics.tap();
      };
    }

    const resetBtn = this.el.querySelector('#btn-reset-scores') as HTMLButtonElement;
    const feedback = this.el.querySelector('#reset-feedback') as HTMLElement;
    if (resetBtn && feedback) {
      resetBtn.onclick = () => {
        this.storage.resetHighScores();
        soundEngine.playSFX('fanfare');
        Haptics.heavy();
        feedback.style.display = 'block';
        setTimeout(() => {
          if (feedback) feedback.style.display = 'none';
        }, 2500);
      };
    }
  }

  private startUnlockHold(): void {
    this.cancelUnlockHold();
    this.unlockHoldStart = Date.now();
    soundEngine.playSFX('click');
    Haptics.tap();

    this.unlockHoldTimer = window.setInterval(() => {
      const elapsed = Date.now() - this.unlockHoldStart;
      const progressPct = Math.min(100, (elapsed / 3000) * 100);
      const bar = this.el?.querySelector('#parental-progress') as HTMLElement | null;
      if (bar) bar.style.width = `${progressPct}%`;

      if (elapsed >= 3000) {
        this.cancelUnlockHold();
        this.isUnlocked = true;
        soundEngine.playSFX('fanfare');
        Haptics.success();
        this.renderContent();
      }
    }, 50);
  }

  private cancelUnlockHold(): void {
    if (this.unlockHoldTimer !== null) {
      clearInterval(this.unlockHoldTimer);
      this.unlockHoldTimer = null;
    }
    const bar = this.el?.querySelector('#parental-progress') as HTMLElement | null;
    if (bar) bar.style.width = '0%';
  }

  public close(): void {
    this.cancelUnlockHold();
    this.isUnlocked = false;
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
