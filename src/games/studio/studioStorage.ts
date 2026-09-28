/**
 * Creative Art Studio Storage & Export Manager
 * Adventures of Trishu Preschool Suite
 * Strictly under 500 lines
 */

import { PlacedSticker, SheetSaveData } from './types';

export interface SavedPhotoEntry {
  id: string;
  timestamp: number;
  dataUrl: string;
  title: string;
}

export class StudioStorage {
  private static readonly STICKERS_PREFIX = 'hmc_studio_stickers_';
  private static readonly COLORING_PREFIX = 'hmc_studio_coloring_';
  private static readonly PHOTOS_KEY = 'hmc_saved_photos';

  // In-memory memory fallback for Node.js test environments
  private static memoryStore: Map<string, string> = new Map();

  private static getItem(key: string): string | null {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch {
      // Fallback
    }
    return this.memoryStore.get(key) || null;
  }

  private static setItem(key: string, value: string): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
        return;
      }
    } catch {
      // Fallback
    }
    this.memoryStore.set(key, value);
  }

  public static loadStickers(sceneId: string): PlacedSticker[] {
    const raw = this.getItem(`${this.STICKERS_PREFIX}${sceneId}`);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map((item: any) => ({
          uid: String(item.uid || `stk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`),
          id: String(item.id || ''),
          x: Number(item.x) || 0,
          y: Number(item.y) || 0,
          scale: Number(item.scale) || 1.0,
          rotation: Number(item.rotation) || 0,
          z: Number(item.z) || 1,
          wiggleTimer: 0
        }));
      }
    } catch {
      // Return empty on parse error
    }
    return [];
  }

  public static saveStickers(sceneId: string, stickers: PlacedSticker[]): void {
    try {
      const clean = stickers.map(s => ({
        uid: s.uid,
        id: s.id,
        x: Math.round(s.x),
        y: Math.round(s.y),
        scale: Number(s.scale.toFixed(2)),
        rotation: Number(s.rotation.toFixed(2)),
        z: s.z
      }));
      this.setItem(`${this.STICKERS_PREFIX}${sceneId}`, JSON.stringify(clean));
    } catch (e) {
      console.warn('Failed to save studio stickers to storage', e);
    }
  }

  public static loadColoring(sheetId: string): SheetSaveData {
    const defaultData: SheetSaveData = { filledRegions: {}, strokes: [] };
    const raw = this.getItem(`${this.COLORING_PREFIX}${sheetId}`);
    if (!raw) return defaultData;
    try {
      const parsed = JSON.parse(raw);
      return {
        filledRegions: parsed.filledRegions && typeof parsed.filledRegions === 'object' ? parsed.filledRegions : {},
        strokes: Array.isArray(parsed.strokes) ? parsed.strokes : []
      };
    } catch {
      return defaultData;
    }
  }

  public static saveColoring(sheetId: string, data: SheetSaveData): void {
    try {
      this.setItem(`${this.COLORING_PREFIX}${sheetId}`, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to save coloring sheet progress', e);
    }
  }

  public static saveSnapshotPhoto(dataUrl: string, title: string = 'Art Studio Creation'): boolean {
    try {
      const photos: SavedPhotoEntry[] = this.loadSnapshotPhotos();
      const newEntry: SavedPhotoEntry = {
        id: `photo_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        timestamp: Date.now(),
        dataUrl,
        title
      };
      // Keep up to 24 photos
      photos.unshift(newEntry);
      if (photos.length > 24) photos.pop();
      this.setItem(this.PHOTOS_KEY, JSON.stringify(photos));
      return true;
    } catch (e) {
      console.warn('Failed to save snapshot photo to gallery', e);
      return false;
    }
  }

  public static loadSnapshotPhotos(): SavedPhotoEntry[] {
    const raw = this.getItem(this.PHOTOS_KEY);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
}
