/**
 * PWA UI Manager (Install Modal, Offline Pill, Update Toast)
 * Adventures of Trishu Mini-Game Suite
 * Pure Vanilla TypeScript - Zero React
 * Strictly under 500 lines
 */

import { pwaManager } from '../pwa/PwaManager';
import { soundEngine } from '../engine/SoundEngine';
import { Haptics } from '../engine/Haptics';

export class PwaUI {
  private modalEl: HTMLElement | null = null;
  private offlinePillEl: HTMLElement | null = null;
  private updateToastEl: HTMLElement | null = null;

  constructor(parent: HTMLElement = document.body) {
    this.setupOfflinePill(parent);
    this.setupUpdateToast(parent);
  }

  private setupOfflinePill(parent: HTMLElement): void {
    const pill = document.createElement('div');
    pill.className = 'offline-pill';
    pill.setAttribute('role', 'status');
    pill.setAttribute('aria-live', 'polite');
    pill.innerHTML = `
      <span class="offline-pill-dot"></span>
      <span>Offline Mode — All 16 Games Ready!</span>
    `;
    pill.style.display = pwaManager.isOnline() ? 'none' : 'flex';
    parent.appendChild(pill);
    this.offlinePillEl = pill;

    pwaManager.on('connectionChange', (online: boolean) => {
      if (this.offlinePillEl) {
        this.offlinePillEl.style.display = online ? 'none' : 'flex';
      }
    });
  }

  private setupUpdateToast(parent: HTMLElement): void {
    const toast = document.createElement('div');
    toast.className = 'update-toast';
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.style.display = 'none';

    toast.innerHTML = `
      <div class="update-toast-content">
        <span class="update-toast-emoji">✨</span>
        <div class="update-toast-text">
          <div class="update-toast-title">Update Ready!</div>
          <div class="update-toast-subtitle">New adventures are available</div>
        </div>
        <button type="button" class="update-toast-btn" id="pwa-update-btn">
          Refresh
        </button>
      </div>
    `;

    const refreshBtn = toast.querySelector('#pwa-update-btn') as HTMLButtonElement;
    refreshBtn.onclick = () => {
      soundEngine.playSFX('click');
      pwaManager.skipWaitingAndReload();
    };

    parent.appendChild(toast);
    this.updateToastEl = toast;

    pwaManager.on('updateAvailable', () => {
      if (this.updateToastEl) {
        this.updateToastEl.style.display = 'block';
        soundEngine.playSFX('fanfare');
      }
    });
  }

  public openInstallModal(parent: HTMLElement = document.body, onClose?: () => void): void {
    if (this.modalEl) return;

    const isInstallable = pwaManager.isInstallable();
    const isIOS = pwaManager.isIOS();

    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.setAttribute('role', 'dialog');
    backdrop.setAttribute('aria-modal', 'true');
    backdrop.setAttribute('aria-label', 'Install Trishu App');

    backdrop.innerHTML = `
      <div class="modal-card">
        <button type="button" class="modal-close-btn" aria-label="Close dialog">✕</button>
        <div class="modal-hero-badge">
          <img src="./icons/icon-192.png" alt="Trishu App Icon" class="modal-hero-img" />
        </div>
        <h2 id="install-modal-title" class="modal-title">
          Install Trishu App!
        </h2>
        <p class="modal-subtitle">
          Play fullscreen with instant launching and 100% offline play anytime!
        </p>

        ${isInstallable ? `
          <div>
            <button type="button" class="modal-primary-btn" id="btn-pwa-install">
              <span style="font-size: 1.25rem;">⬇️</span>
              <span>Install to Home Screen</span>
            </button>
          </div>
        ` : isIOS ? `
          <div class="ios-instructions-box">
            <div style="font-weight: 900; font-size: 0.85rem; margin-bottom: 2px;">
              🍎 Safari iOS Quick Install:
            </div>
            <div class="ios-step-row">
              <span class="ios-step-badge">1</span>
              <span>Tap the <strong>Share button</strong> (⎋ with arrow) in Safari.</span>
            </div>
            <div class="ios-step-row">
              <span class="ios-step-badge">2</span>
              <span>Scroll down and select <strong>"Add to Home Screen"</strong> (➕).</span>
            </div>
            <div class="ios-step-row">
              <span class="ios-step-badge">3</span>
              <span>Tap <strong>"Add"</strong> in top right to start playing!</span>
            </div>
          </div>
        ` : `
          <div class="ios-instructions-box" style="text-align: center;">
            To install, open your browser menu (⋮) and choose "Install App" or "Add to Home screen".
          </div>
        `}

        <button type="button" class="modal-link-btn" id="btn-pwa-later">
          Maybe Later
        </button>
      </div>
    `;

    const closeHandler = () => {
      soundEngine.playSFX('click');
      Haptics.tap();
      if (backdrop.parentNode) {
        backdrop.parentNode.removeChild(backdrop);
      }
      this.modalEl = null;
      if (onClose) onClose();
    };

    backdrop.onclick = (e) => {
      if (e.target === backdrop) closeHandler();
    };
    (backdrop.querySelector('.modal-close-btn') as HTMLElement).onclick = closeHandler;
    (backdrop.querySelector('#btn-pwa-later') as HTMLElement).onclick = closeHandler;

    const installBtn = backdrop.querySelector('#btn-pwa-install') as HTMLButtonElement | null;
    if (installBtn) {
      installBtn.onclick = async () => {
        soundEngine.playSFX('click');
        Haptics.tap();
        const outcome = await pwaManager.promptInstall();
        if (outcome === 'accepted') {
          soundEngine.playSFX('fanfare');
          closeHandler();
        }
      };
    }

    parent.appendChild(backdrop);
    this.modalEl = backdrop;
  }
}
