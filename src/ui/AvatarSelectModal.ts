/**
 * Avatar Selection Modal Dialog
 * Adventures of Trishu Mini-Game Suite
 * Pure Vanilla TypeScript - Zero React
 * Strictly under 500 lines
 */

import { GameEngine } from '../engine/GameEngine';
import { storageManager } from '../engine/StorageManager';
import { soundEngine } from '../engine/SoundEngine';
import { Haptics } from '../engine/Haptics';
import { CharacterId, AvatarInfo, AvatarCategory, AVATAR_ROSTER } from '../types/characters';
import { renderCharacter } from '../graphics/characters';

const CATEGORY_TABS: Array<{ id: 'all' | AvatarCategory; label: string }> = [
  { id: 'all', label: 'All 🌟' },
  { id: 'peppa', label: 'Peppa Pig 🐷' },
  { id: 'trishu', label: 'Trishu Family 👧' },
  { id: 'farm', label: 'Farmyard 🐔' }
];

export class AvatarSelectModal {
  private el: HTMLElement | null = null;
  private engine: GameEngine | null;
  private activeCategory: 'all' | AvatarCategory = 'all';
  private onCloseCallback?: () => void;
  private onAvatarChangeCallback?: (avatar: CharacterId) => void;

  constructor(engine: GameEngine | null = null) {
    this.engine = engine;
  }

  public open(
    parent: HTMLElement = document.body,
    onAvatarChange?: (avatar: CharacterId) => void,
    onClose?: () => void
  ): void {
    if (this.el) return;
    this.onAvatarChangeCallback = onAvatarChange;
    this.onCloseCallback = onClose;

    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.setAttribute('role', 'dialog');
    backdrop.setAttribute('aria-modal', 'true');
    backdrop.setAttribute('aria-label', 'Choose Your Hero');

    backdrop.innerHTML = `
      <div class="modal-card avatar-modal-card">
        <div class="avatar-modal-header">
          <div>
            <h2 class="avatar-modal-title">Choose Your Hero! 🌟</h2>
            <p class="avatar-modal-subtitle">Pick who plays in all the games!</p>
          </div>
          <button type="button" class="avatar-close-btn modal-close-btn" aria-label="Close Avatar Selection">✕</button>
        </div>

        <div class="avatar-category-pills" id="avatar-category-pills"></div>

        <div class="avatar-grid-scroll">
          <div class="avatar-grid" id="avatar-grid"></div>
        </div>

        <div class="avatar-modal-footer">
          <button type="button" class="avatar-confirm-btn" id="avatar-confirm-btn">
            Let's Play! 🌟
          </button>
        </div>
      </div>
    `;

    backdrop.onclick = (e) => {
      if (e.target === backdrop) this.close();
    };
    const closeBtn = backdrop.querySelector('.avatar-close-btn') as HTMLButtonElement;
    closeBtn.onclick = () => this.close();
    const confirmBtn = backdrop.querySelector('#avatar-confirm-btn') as HTMLButtonElement;
    confirmBtn.onclick = () => this.close();

    parent.appendChild(backdrop);
    this.el = backdrop;

    this.renderCategoryPills();
    this.renderGrid();
  }

  private renderCategoryPills(): void {
    if (!this.el) return;
    const container = this.el.querySelector('#avatar-category-pills') as HTMLElement;
    if (!container) return;
    container.innerHTML = '';

    CATEGORY_TABS.forEach(tab => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `avatar-pill-btn ${this.activeCategory === tab.id ? 'active' : ''}`;
      btn.textContent = tab.label;
      btn.onclick = () => {
        soundEngine.playSFX('click');
        Haptics.tap();
        this.activeCategory = tab.id;
        this.renderCategoryPills();
        this.renderGrid();
      };
      container.appendChild(btn);
    });
  }

  private renderGrid(): void {
    if (!this.el) return;
    const grid = this.el.querySelector('#avatar-grid') as HTMLElement;
    if (!grid) return;
    grid.innerHTML = '';

    const currentSelected = this.engine?.selectedAvatar || storageManager.getSelectedAvatar();
    const filtered = this.activeCategory === 'all'
      ? AVATAR_ROSTER
      : AVATAR_ROSTER.filter(a => a.category === this.activeCategory);

    filtered.forEach(info => {
      const isSelected = currentSelected === info.id;
      const card = document.createElement('button');
      card.type = 'button';
      card.className = `avatar-card ${isSelected ? 'selected' : ''}`;
      card.style.backgroundColor = isSelected ? '#FFFFFF' : '#FAFAFA';
      card.style.borderColor = isSelected ? '#4CAF50' : info.borderColor;
      card.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
      card.setAttribute('aria-label', `Select ${info.name}`);

      const previewWrapper = document.createElement('div');
      previewWrapper.className = 'avatar-card-preview-wrapper';
      previewWrapper.style.backgroundColor = info.bgColor;

      const canvas = document.createElement('canvas');
      canvas.width = 76;
      canvas.height = 76;
      canvas.className = 'avatar-canvas-preview';
      this.drawAvatarPreview(canvas, info.id, isSelected);

      previewWrapper.appendChild(canvas);

      if (isSelected) {
        const badge = document.createElement('span');
        badge.className = 'avatar-card-selected-badge';
        badge.textContent = '⭐';
        previewWrapper.appendChild(badge);
      }

      const details = document.createElement('div');
      details.className = 'avatar-card-details';
      details.innerHTML = `
        <span class="avatar-card-name">${info.emoji} ${info.name}</span>
        <span class="avatar-card-subtitle">${info.subtitle}</span>
      `;

      card.appendChild(previewWrapper);
      card.appendChild(details);

      card.onclick = () => this.handleSelectAvatar(info);

      grid.appendChild(card);
    });
  }

  private drawAvatarPreview(canvas: HTMLCanvasElement, avatarId: CharacterId, isSelected: boolean): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let scale = 0.42;
    let offsetY = 50;
    let offsetX = 38;

    if (avatarId === 'peppa' || avatarId === 'george') {
      scale = 0.38; offsetY = 52;
    } else if (avatarId === 'daddyPig' || avatarId === 'mummyPig' || avatarId === 'grandpaPig') {
      scale = 0.28; offsetY = 55;
    } else if (avatarId === 'suzySheep') {
      scale = 0.34; offsetY = 52;
    } else if (avatarId === 'trishu' || avatarId === 'leo') {
      scale = 0.38; offsetY = 52;
    } else if (avatarId === 'dad' || avatarId === 'mom' || avatarId === 'grandpa') {
      scale = 0.28; offsetY = 54;
    } else if (avatarId === 'mimi') {
      scale = 0.34; offsetY = 52;
    } else if (avatarId === 'chicken' || avatarId === 'duck') {
      scale = 0.45; offsetY = 48;
    } else if (avatarId === 'chick') {
      scale = 0.65; offsetY = 46;
    }

    try {
      renderCharacter(avatarId, ctx, offsetX, offsetY, scale, {
        expression: isSelected ? 'excited' : 'happy',
        muddyBoots: true,
        holdingDino: avatarId === 'george' || avatarId === 'leo'
      });
    } catch (_) {}
  }

  private handleSelectAvatar(info: AvatarInfo): void {
    if (this.engine) {
      this.engine.setSelectedAvatar(info.id);
    } else {
      storageManager.setSelectedAvatar(info.id);
    }

    if (info.sound) {
      soundEngine.playSFX(info.sound);
    }
    Haptics.medium();

    if (this.onAvatarChangeCallback) {
      this.onAvatarChangeCallback(info.id);
    }
    this.renderGrid();
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
