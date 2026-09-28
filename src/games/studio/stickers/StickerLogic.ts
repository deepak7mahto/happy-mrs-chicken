/**
 * Interactive Sticker World Simulation Logic
 * Adventures of Trishu Preschool Suite
 * Strictly under 500 lines
 */

import { PlacedSticker, ScenicBackgroundId } from '../types';
import { StudioStorage } from '../studioStorage';
import { STICKER_CATALOG, BACKGROUND_LIST } from './StickerCatalog';

export class StickerLogic {
  public width: number = 960;
  public height: number = 540;
  public stickers: PlacedSticker[] = [];
  public currentBackground: ScenicBackgroundId = 'farm';
  public backgroundIndex: number = 0;

  public draggedUid: string | null = null;
  public selectedUid: string | null = null;
  public isHoveringTrash: boolean = false;

  private dragOffsetX: number = 0;
  private dragOffsetY: number = 0;
  private maxZ: number = 1;

  constructor() {
    this.loadCurrentBackground();
  }

  public layout(w: number, h: number): void {
    this.width = w;
    this.height = h;
  }

  public loadCurrentBackground(): void {
    this.stickers = StudioStorage.loadStickers(this.currentBackground);
    if (this.stickers.length > 0) {
      this.maxZ = Math.max(...this.stickers.map(s => s.z), 1);
    } else {
      this.maxZ = 1;
    }
  }

  public saveCurrentBackground(): void {
    StudioStorage.saveStickers(this.currentBackground, this.stickers);
  }

  public nextBackground(): void {
    this.saveCurrentBackground();
    this.backgroundIndex = (this.backgroundIndex + 1) % BACKGROUND_LIST.length;
    this.currentBackground = BACKGROUND_LIST[this.backgroundIndex].id as ScenicBackgroundId;
    this.draggedUid = null;
    this.selectedUid = null;
    this.loadCurrentBackground();
  }

  public prevBackground(): void {
    this.saveCurrentBackground();
    this.backgroundIndex = (this.backgroundIndex - 1 + BACKGROUND_LIST.length) % BACKGROUND_LIST.length;
    this.currentBackground = BACKGROUND_LIST[this.backgroundIndex].id as ScenicBackgroundId;
    this.draggedUid = null;
    this.selectedUid = null;
    this.loadCurrentBackground();
  }

  public spawnSticker(id: string): PlacedSticker {
    const catalogItem = STICKER_CATALOG.find(c => c.id === id);
    const scale = catalogItem?.category === 'character' ? 0.9 : 0.75;
    this.maxZ++;

    // Add gentle randomness to drop position near center
    const cx = this.width / 2 + (Math.random() - 0.5) * 60;
    const cy = this.height * 0.45 + (Math.random() - 0.5) * 40;

    const sticker: PlacedSticker = {
      uid: `stk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      id,
      x: cx,
      y: cy,
      scale,
      rotation: 0,
      z: this.maxZ,
      wiggleTimer: 0.35
    };

    this.stickers.push(sticker);
    this.selectedUid = sticker.uid;
    this.saveCurrentBackground();
    return sticker;
  }

  public getStickerRadius(sticker: PlacedSticker): number {
    return 48 * sticker.scale;
  }

  public hitTestSticker(x: number, y: number): PlacedSticker | null {
    // Check in descending z-order (topmost first)
    const sorted = [...this.stickers].sort((a, b) => b.z - a.z);
    for (const s of sorted) {
      const radius = this.getStickerRadius(s);
      const dx = x - s.x;
      const dy = y - s.y;
      if (dx * dx + dy * dy <= radius * radius) {
        return s;
      }
    }
    return null;
  }

  public isOverTrash(x: number, y: number): boolean {
    const trashX = this.width - 60;
    const trashY = this.height - 120;
    const dx = x - trashX;
    const dy = y - trashY;
    return (dx * dx + dy * dy) <= (50 * 50);
  }

  public startDrag(x: number, y: number): boolean {
    const hit = this.hitTestSticker(x, y);
    if (hit) {
      this.draggedUid = hit.uid;
      this.selectedUid = hit.uid;
      this.dragOffsetX = hit.x - x;
      this.dragOffsetY = hit.y - y;
      this.maxZ++;
      hit.z = this.maxZ;
      return true;
    }
    return false;
  }

  public updateDrag(x: number, y: number): void {
    if (!this.draggedUid) return;
    const sticker = this.stickers.find(s => s.uid === this.draggedUid);
    if (!sticker) return;

    sticker.x = Math.max(30, Math.min(this.width - 30, x + this.dragOffsetX));
    sticker.y = Math.max(50, Math.min(this.height - 90, y + this.dragOffsetY));
    this.isHoveringTrash = this.isOverTrash(x, y);
  }

  public endDrag(): void {
    if (!this.draggedUid) return;
    const uid = this.draggedUid;
    const sticker = this.stickers.find(s => s.uid === uid);

    if (sticker && this.isHoveringTrash) {
      this.removeSticker(uid);
    } else {
      this.saveCurrentBackground();
    }

    this.draggedUid = null;
    this.isHoveringTrash = false;
  }

  public tapSticker(x: number, y: number): PlacedSticker | null {
    const hit = this.hitTestSticker(x, y);
    if (hit) {
      hit.wiggleTimer = 0.35;
      this.maxZ++;
      hit.z = this.maxZ;
      this.selectedUid = hit.uid;
      return hit;
    }
    return null;
  }

  public scaleSelected(delta: number): void {
    if (!this.selectedUid) return;
    const s = this.stickers.find(stk => stk.uid === this.selectedUid);
    if (s) {
      s.scale = Math.max(0.4, Math.min(2.2, s.scale + delta));
      this.saveCurrentBackground();
    }
  }

  public removeSticker(uid: string): void {
    this.stickers = this.stickers.filter(s => s.uid !== uid);
    if (this.selectedUid === uid) this.selectedUid = null;
    if (this.draggedUid === uid) this.draggedUid = null;
    this.saveCurrentBackground();
  }

  public clearCurrentScene(): void {
    this.stickers = [];
    this.selectedUid = null;
    this.draggedUid = null;
    this.saveCurrentBackground();
  }

  public update(dt: number): void {
    for (const s of this.stickers) {
      if (s.wiggleTimer > 0) {
        s.wiggleTimer = Math.max(0, s.wiggleTimer - dt);
      }
    }
  }
}
