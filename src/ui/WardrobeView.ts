/**
 * Wardrobe View & Interactive Mannequin Component
 * Adventures of Trishu Preschool Suite
 * Pure Vanilla TypeScript - Zero React
 * Strictly under 500 lines (T4.02)
 */

import { storageManager } from '../engine/StorageManager';
import { soundEngine } from '../engine/SoundEngine';
import { Haptics } from '../engine/Haptics';
import { CharacterId, AVATAR_ROSTER } from '../types/characters';
import { AccessoryDef, AccessorySlot, ACCESSORIES_CATALOG } from '../types/accessories';
import { renderCharacter } from '../graphics/characters';

type WardrobeFilter = 'all' | AccessorySlot;

const FILTER_TABS: Array<{ id: WardrobeFilter; label: string }> = [
  { id: 'all', label: 'All ✨' },
  { id: 'head', label: 'Hats 👒' },
  { id: 'face', label: 'Face 👓' },
  { id: 'back', label: 'Capes 🦸' },
  { id: 'feet', label: 'Boots 🥾' }
];

export class WardrobeView {
  private container: HTMLElement;
  private activeFilter: WardrobeFilter = 'all';
  private mannequinCanvas: HTMLCanvasElement | null = null;
  private animFrameId: number | null = null;
  private pointerGaze = { x: 0, y: 0 };
  private hopTimer: number = 0;
  private hopVelocity: number = 0;
  private hopY: number = 0;
  private startTime: number = Date.now();
  private onEquipChange?: () => void;

  constructor(container: HTMLElement, onEquipChange?: () => void) {
    this.container = container;
    this.onEquipChange = onEquipChange;
  }

  public render(): void {
    this.container.innerHTML = `
      <div class="wardrobe-container">
        <!-- Live Interactive Mannequin Stage -->
        <div class="wardrobe-mannequin-stage">
          <div class="wardrobe-mannequin-bubble" id="mannequin-box" title="Tap me to hop and play!">
            <canvas id="wardrobe-mannequin-canvas" width="160" height="160" class="wardrobe-canvas"></canvas>
            <div class="wardrobe-mannequin-hint">👆 Tap me!</div>
          </div>
          <div class="wardrobe-mannequin-info">
            <div class="wardrobe-avatar-name" id="wardrobe-avatar-name"></div>
            <button type="button" class="wardrobe-clear-btn" id="wardrobe-clear-btn" title="Remove all accessories">
              🔄 Clear Outfit
            </button>
          </div>
        </div>

        <!-- Slot Filter Pills -->
        <div class="avatar-category-pills wardrobe-filter-pills" id="wardrobe-filter-pills"></div>

        <!-- Accessories Grid -->
        <div class="avatar-grid-scroll wardrobe-grid-scroll">
          <div class="wardrobe-grid" id="wardrobe-grid"></div>
        </div>
      </div>
    `;

    this.mannequinCanvas = this.container.querySelector('#wardrobe-mannequin-canvas');
    this.setupMannequinInteractions();
    this.renderFilterPills();
    this.renderAccessoryGrid();
    this.updateAvatarLabel();

    const clearBtn = this.container.querySelector('#wardrobe-clear-btn') as HTMLButtonElement;
    if (clearBtn) {
      clearBtn.onclick = () => this.handleClearOutfit();
    }

    this.startMannequinLoop();
  }

  private updateAvatarLabel(): void {
    const label = this.container.querySelector('#wardrobe-avatar-name');
    if (!label) return;
    const avatarId = storageManager.getSelectedAvatar();
    const info = AVATAR_ROSTER.find(a => a.id === avatarId);
    label.textContent = info ? `${info.emoji} Dressing up ${info.name}` : 'Dressing up hero';
  }

  private renderFilterPills(): void {
    const pillsContainer = this.container.querySelector('#wardrobe-filter-pills');
    if (!pillsContainer) return;
    pillsContainer.innerHTML = '';

    FILTER_TABS.forEach(tab => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `avatar-pill-btn ${this.activeFilter === tab.id ? 'active' : ''}`;
      btn.textContent = tab.label;
      btn.onclick = () => {
        soundEngine.playSFX('click');
        Haptics.tap();
        this.activeFilter = tab.id;
        this.renderFilterPills();
        this.renderAccessoryGrid();
      };
      pillsContainer.appendChild(btn);
    });
  }

  private renderAccessoryGrid(): void {
    const grid = this.container.querySelector('#wardrobe-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const equipped = storageManager.getEquippedAccessories();
    const items = this.activeFilter === 'all'
      ? ACCESSORIES_CATALOG
      : ACCESSORIES_CATALOG.filter(a => a.slot === this.activeFilter);

    items.forEach(acc => {
      const isUnlocked = storageManager.isAccessoryUnlocked(acc.id);
      const isEquipped = equipped[acc.slot] === acc.id;

      const card = document.createElement('button');
      card.type = 'button';
      card.className = `wardrobe-card ${isEquipped ? 'equipped' : ''} ${!isUnlocked ? 'locked' : ''}`;
      card.setAttribute('aria-label', `${acc.name} ${isEquipped ? '(Equipped)' : ''}`);

      if (isUnlocked) {
        card.innerHTML = `
          <div class="wardrobe-card-emoji">${acc.emoji}</div>
          <div class="wardrobe-card-title">${acc.name}</div>
          <div class="wardrobe-card-slot">${acc.slot.toUpperCase()}</div>
          ${isEquipped ? '<span class="wardrobe-equipped-badge">✓ Worn</span>' : ''}
        `;
        card.onclick = () => this.handleToggleAccessory(acc, isEquipped);
      } else {
        card.innerHTML = `
          <div class="wardrobe-card-emoji">🔒</div>
          <div class="wardrobe-card-title">${acc.name}</div>
          <div class="wardrobe-lock-hint">${acc.unlockHint || 'Unlock in Story Mode!'}</div>
        `;
        card.onclick = () => this.handleLockedClick(acc);
      }

      grid.appendChild(card);
    });
  }

  private handleToggleAccessory(acc: AccessoryDef, currentlyEquipped: boolean): void {
    if (currentlyEquipped) {
      storageManager.unequipAccessory(acc.slot);
      soundEngine.playSFX('whoosh');
    } else {
      storageManager.equipAccessory(acc.id, acc.slot);
      soundEngine.playSFX('eggPop');
    }
    Haptics.medium();
    this.triggerHop();

    if (this.onEquipChange) {
      this.onEquipChange();
    }
    this.renderAccessoryGrid();
  }

  private handleLockedClick(acc: AccessoryDef): void {
    soundEngine.playSFX('crash');
    Haptics.tap();
    const hint = acc.unlockHint || 'Complete Story Mode levels to unlock this outfit!';
    alert(`🔒 ${acc.name} is locked!\n\n${hint}`);
  }

  private handleClearOutfit(): void {
    storageManager.unequipAccessory('head');
    storageManager.unequipAccessory('face');
    storageManager.unequipAccessory('back');
    storageManager.unequipAccessory('feet');
    soundEngine.playSFX('whoosh');
    Haptics.tap();
    this.triggerHop();

    if (this.onEquipChange) {
      this.onEquipChange();
    }
    this.renderAccessoryGrid();
  }

  private setupMannequinInteractions(): void {
    const box = this.container.querySelector('#mannequin-box') as HTMLElement;
    if (!box) return;

    // Gaze tracking on pointermove
    box.onpointermove = (e: PointerEvent) => {
      const rect = box.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      this.pointerGaze.x = Math.max(-1, Math.min(1, (e.clientX - cx) / (rect.width * 0.4)));
      this.pointerGaze.y = Math.max(-1, Math.min(1, (e.clientY - cy) / (rect.height * 0.4)));
    };

    box.onpointerleave = () => {
      this.pointerGaze.x = 0;
      this.pointerGaze.y = 0;
    };

    // Tap/Click to celebrate and hop
    box.onclick = () => {
      this.triggerHop();
      const avatarId = storageManager.getSelectedAvatar();
      const info = AVATAR_ROSTER.find(a => a.id === avatarId);
      if (info && info.sound) {
        soundEngine.playSFX(info.sound);
      } else {
        soundEngine.playSFX('toddlerGiggle');
      }
      Haptics.success();
    };
  }

  private triggerHop(): void {
    this.hopVelocity = -8;
  }

  private startMannequinLoop(): void {
    this.stopMannequinLoop();

    const loop = () => {
      this.updateMannequinPhysics();
      this.drawMannequin();
      this.animFrameId = requestAnimationFrame(loop);
    };
    this.animFrameId = requestAnimationFrame(loop);
  }

  private updateMannequinPhysics(): void {
    // Apply gravity to hop
    if (this.hopVelocity !== 0 || this.hopY < 0) {
      this.hopY += this.hopVelocity;
      this.hopVelocity += 0.6; // Gravity
      if (this.hopY >= 0) {
        this.hopY = 0;
        this.hopVelocity = 0;
      }
    }
  }

  private drawMannequin(): void {
    if (!this.mannequinCanvas) return;
    const ctx = this.mannequinCanvas.getContext('2d');
    if (!ctx) return;

    const w = this.mannequinCanvas.width;
    const h = this.mannequinCanvas.height;
    ctx.clearRect(0, 0, w, h);

    const now = Date.now();
    const t = (now - this.startTime) / 1000;
    const avatarId = storageManager.getSelectedAvatar();

    // Calculate scale and center coordinates
    const scale = avatarId === 'chicken' || avatarId === 'duck' ? 0.8 : (avatarId === 'chick' ? 1.0 : 0.68);
    const cx = w / 2;
    const cy = h / 2 + 10 + this.hopY;

    // Squish on landing or idle breath
    const squash = this.hopY < -1 ? 1.08 : (1.0 + Math.sin(t * 3.5) * 0.03);

    renderCharacter(avatarId, ctx, cx, cy, scale, {
      squash,
      jumpY: 0,
      time: t,
      pointerGaze: this.pointerGaze,
      expression: this.hopY < -2 ? 'excited' : 'happy',
      aura: 'sparkle',
      showAccessories: true
    });
  }

  public stopMannequinLoop(): void {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  public destroy(): void {
    this.stopMannequinLoop();
  }
}
