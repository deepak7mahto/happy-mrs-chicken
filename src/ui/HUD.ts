/**
 * Heads-Up Display (HUD) Controller
 * Adventures of Trishu Mini-Game Suite
 * Pure Vanilla TypeScript - Zero React
 * Strictly under 500 lines
 */

import { GameEngine } from '../engine/GameEngine';
import { storageManager } from '../engine/StorageManager';
import { soundEngine } from '../engine/SoundEngine';
import { Haptics } from '../engine/Haptics';
import { AVATAR_ROSTER } from '../types/characters';
import { GameModeId } from '../types/game';

const HOLD_DURATION_MS = 3000;

export interface HUDCallbacks {
  onGoHome: () => void;
  onToggleMute: () => void;
  onToggleFullscreen: () => void;
  onOpenSettings: () => void;
  onOpenAvatarSelect: () => void;
  onOpenPassport: () => void;
  onOpenInstall: () => void;
}

export class HUD {
  private el: HTMLElement;
  private engine: GameEngine;
  private callbacks: HUDCallbacks;

  private holdTimer: number | null = null;
  private holdStartTime: number = 0;
  private isHoldingHome: boolean = false;
  private hintTimeout: number | null = null;

  constructor(engine: GameEngine, callbacks: HUDCallbacks, parent: HTMLElement = document.body) {
    this.engine = engine;
    this.callbacks = callbacks;

    this.el = document.createElement('header');
    this.el.className = 'hud-layer hud-menu-layer';
    parent.appendChild(this.el);

    this.render();
  }

  public updateMode(modeId: GameModeId): void {
    const isMenu = modeId === 'MENU';
    this.el.className = `hud-layer ${isMenu ? 'hud-menu-layer' : 'hud-game-layer'}`;
    this.render();
  }

  public render(): void {
    const isMenu = this.engine.currentSceneId === 'MENU';
    const viewMode = this.engine.storyViewMode;
    const selectedAvatarId = this.engine.selectedAvatar;
    const avatarInfo = AVATAR_ROSTER.find(a => a.id === selectedAvatarId);
    const avatarEmoji = avatarInfo?.emoji || '🐷';
    const isMuted = this.engine.storage.isMuted();
    const isToddlerLocked = this.engine.storage.isToddlerLockEnabled();

    this.el.innerHTML = `
      <div class="hud-top-bar">
        ${isMenu ? `
          <div class="hud-brand">
            <span class="hud-brand-sparkle">🌟</span>
            <span class="hud-brand-title">Adventures of Trishu</span>
          </div>
        ` : `
          <div class="hud-home-wrapper">
            <button type="button" class="hud-btn-home" id="hud-btn-home" aria-label="Back to Menu">
              <span style="font-size: 1.2rem; line-height: 1;">🏠</span>
              <span>Home ${isToddlerLocked ? '🔒' : ''}</span>
              <div class="toddler-lock-progress" id="toddler-progress" style="display: none;">
                <div class="toddler-lock-progress-fill" id="toddler-progress-fill" style="width: 0%;"></div>
              </div>
            </button>
            <div class="toddler-lock-tooltip" id="toddler-hint" style="display: none;">
              Hold 3s to exit 🔒
            </div>
          </div>
        `}

        ${isMenu ? `
          <div class="hud-mode-toggle hud-mode-toggle-desktop" role="tablist" aria-label="Game Mode">
            <button type="button" role="tab" class="hud-mode-pill ${viewMode === 'journey' ? 'active' : ''}" id="tab-journey-dt">
              🗺️ Story Journey
            </button>
            <button type="button" role="tab" class="hud-mode-pill ${viewMode === 'grid' ? 'active' : ''}" id="tab-grid-dt">
              🎮 Free Play
            </button>
          </div>
        ` : ''}

        <div class="hud-controls-right">
          ${isMenu ? `
            <button type="button" aria-label="Install App" class="hud-btn-icon hud-btn-install" id="hud-btn-install">
              📲
            </button>
            <button type="button" aria-label="Open Adventure Passport" class="hud-btn-icon hud-btn-passport" id="hud-btn-passport">
              📖
            </button>
          ` : ''}
          <button type="button" aria-label="Select Avatar Hero" class="hud-btn-icon hud-btn-avatar" id="hud-btn-avatar">
            ${avatarEmoji}
          </button>
          <button type="button" aria-label="Open Settings" class="hud-btn-icon hud-btn-settings" id="hud-btn-settings">
            ⚙️
          </button>
          <button type="button" aria-label="Toggle Fullscreen" class="hud-btn-icon hud-btn-fs" id="hud-btn-fs">
            ⛶
          </button>
          <button type="button" aria-label="Toggle Audio" class="hud-btn-icon hud-btn-audio" id="hud-btn-audio">
            ${isMuted ? '🔇' : '🔊'}
          </button>
        </div>
      </div>

      ${isMenu ? `
        <div class="hud-mode-row-mobile">
          <div class="hud-mode-toggle" role="tablist" aria-label="Game Mode">
            <button type="button" role="tab" class="hud-mode-pill ${viewMode === 'journey' ? 'active' : ''}" id="tab-journey-mb">
              🗺️ Story Journey
            </button>
            <button type="button" role="tab" class="hud-mode-pill ${viewMode === 'grid' ? 'active' : ''}" id="tab-grid-mb">
              🎮 Free Play
            </button>
          </div>
        </div>
      ` : ''}
    `;

    this.bindEvents(isMenu, isToddlerLocked);
  }

  private bindEvents(isMenu: boolean, isToddlerLocked: boolean): void {
    if (!isMenu) {
      const homeBtn = this.el.querySelector('#hud-btn-home') as HTMLElement;
      if (homeBtn) {
        if (!isToddlerLocked) {
          homeBtn.onclick = (e) => {
            e.stopPropagation();
            this.callbacks.onGoHome();
          };
        } else {
          homeBtn.onpointerdown = (e) => this.handleHomePointerDown(e);
          homeBtn.onpointerup = (e) => this.handleHomePointerUp(e);
          homeBtn.onpointercancel = (e) => this.handleHomePointerCancel(e);
          homeBtn.onpointerleave = (e) => this.handleHomePointerCancel(e);
        }
      }
    } else {
      const switchMode = (m: 'journey' | 'grid') => {
        if (this.engine.storyViewMode === m) return;
        this.engine.setStoryViewMode(m);
        const menuScene = this.engine.scenes.get('MENU') as { scrollY?: number; scrollVy?: number } | undefined;
        if (menuScene) {
          menuScene.scrollY = 0;
          menuScene.scrollVy = 0;
        }
        soundEngine.playSFX('click');
        Haptics.tap();
        this.render();
      };

      const jDt = this.el.querySelector('#tab-journey-dt') as HTMLElement | null;
      if (jDt) jDt.onclick = () => switchMode('journey');
      const gDt = this.el.querySelector('#tab-grid-dt') as HTMLElement | null;
      if (gDt) gDt.onclick = () => switchMode('grid');
      const jMb = this.el.querySelector('#tab-journey-mb') as HTMLElement | null;
      if (jMb) jMb.onclick = () => switchMode('journey');
      const gMb = this.el.querySelector('#tab-grid-mb') as HTMLElement | null;
      if (gMb) gMb.onclick = () => switchMode('grid');

      const installBtn = this.el.querySelector('#hud-btn-install') as HTMLElement | null;
      if (installBtn) installBtn.onclick = () => this.callbacks.onOpenInstall();
      const passportBtn = this.el.querySelector('#hud-btn-passport') as HTMLElement | null;
      if (passportBtn) passportBtn.onclick = () => this.callbacks.onOpenPassport();
    }

    const avatarBtn = this.el.querySelector('#hud-btn-avatar') as HTMLElement;
    if (avatarBtn) avatarBtn.onclick = () => this.callbacks.onOpenAvatarSelect();
    const settingsBtn = this.el.querySelector('#hud-btn-settings') as HTMLElement;
    if (settingsBtn) settingsBtn.onclick = () => this.callbacks.onOpenSettings();
    const fsBtn = this.el.querySelector('#hud-btn-fs') as HTMLElement;
    if (fsBtn) fsBtn.onclick = () => this.callbacks.onToggleFullscreen();
    const audioBtn = this.el.querySelector('#hud-btn-audio') as HTMLElement;
    if (audioBtn) audioBtn.onclick = () => this.callbacks.onToggleMute();
  }

  private clearHoldTimer(): void {
    if (this.holdTimer !== null) {
      clearInterval(this.holdTimer);
      this.holdTimer = null;
    }
    this.isHoldingHome = false;
    const prog = this.el.querySelector('#toddler-progress') as HTMLElement | null;
    if (prog) prog.style.display = 'none';
  }

  private handleHomePointerDown(e: PointerEvent): void {
    e.stopPropagation();
    this.clearHoldTimer();
    this.isHoldingHome = true;
    this.holdStartTime = Date.now();

    const prog = this.el.querySelector('#toddler-progress') as HTMLElement | null;
    const progFill = this.el.querySelector('#toddler-progress-fill') as HTMLElement | null;
    if (prog) prog.style.display = 'block';

    this.holdTimer = window.setInterval(() => {
      const elapsed = Date.now() - this.holdStartTime;
      const progress = Math.min(1, elapsed / HOLD_DURATION_MS);
      if (progFill) progFill.style.width = `${Math.round(progress * 100)}%`;

      if (progress >= 1) {
        this.clearHoldTimer();
        soundEngine.playSFX('fanfare');
        Haptics.heavy();
        this.callbacks.onGoHome();
      }
    }, 30);
  }

  private handleHomePointerUp(e: PointerEvent): void {
    e.stopPropagation();
    if (this.isHoldingHome) {
      const elapsed = Date.now() - this.holdStartTime;
      this.clearHoldTimer();
      if (elapsed < HOLD_DURATION_MS) {
        const hint = this.el.querySelector('#toddler-hint') as HTMLElement | null;
        if (hint) {
          hint.style.display = 'block';
          if (this.hintTimeout !== null) clearTimeout(this.hintTimeout);
          this.hintTimeout = window.setTimeout(() => {
            if (hint) hint.style.display = 'none';
          }, 2000);
        }
      }
    }
  }

  private handleHomePointerCancel(e: PointerEvent): void {
    e.stopPropagation();
    this.clearHoldTimer();
  }

  public destroy(): void {
    this.clearHoldTimer();
    if (this.hintTimeout !== null) clearTimeout(this.hintTimeout);
    if (this.el.parentNode) {
      this.el.parentNode.removeChild(this.el);
    }
  }
}
