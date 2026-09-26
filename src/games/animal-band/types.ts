/**
 * Mode 18: Farmyard Animal Band Types
 * Adventures of Trishu Preschool Suite
 * Strictly under 500 lines
 */

import { CharacterId } from '../../types/characters';

export type InstrumentType = 'xylophone' | 'drums' | 'maracas' | 'accordion' | 'bass';

export interface BandMember {
  id: string;
  name: string;
  characterId: CharacterId;
  instrument: InstrumentType;
  instrumentName: string;
  notePitch: number;
  noteName: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isBouncing: boolean;
  bounceTimer: number;
  hopY: number;
  playCount: number;
  color: string;
}

export interface MusicNoteItem {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  glyph: string;
  alpha: number;
  color: string;
  scale: number;
}
