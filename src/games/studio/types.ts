/**
 * Creative Art Studio Types & Interfaces
 * Adventures of Trishu Preschool Suite
 * Strictly under 500 lines
 */

export type ScenicBackgroundId = 'farm' | 'puddles' | 'castle' | 'bedtime' | 'meadow';

export interface StickerCatalogItem {
  id: string;
  name: string;
  category: 'character' | 'treat' | 'nature' | 'sparkle';
  characterId?: string;
  emoji?: string;
  sound?: string;
  badgeColor: string;
}

export interface PlacedSticker {
  uid: string;
  id: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  z: number;
  wiggleTimer: number;
}

export type ColoringSheetId =
  | 'clucky_nest'
  | 'peppa_puddle'
  | 'leo_picnic'
  | 'mimi_balloon'
  | 'train_ride'
  | 'sleepy_barn';

export type ColoringToolMode = 'magic' | 'crayon';

export interface ColoringRegion {
  id: string;
  name: string;
  colorCanon: string;
  polygon: Array<{ x: number; y: number }>;
}

export interface CrayonStroke {
  color: string;
  points: Array<{ x: number; y: number }>;
  width: number;
}

export interface SheetSaveData {
  filledRegions: Record<string, string>;
  strokes: CrayonStroke[];
}

export type StudioTab = 'stickers' | 'coloring';
