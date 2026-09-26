/**
 * Mode 19: Rainbow Splat & Stamp Studio Types
 * Adventures of Trishu Preschool Suite
 * Strictly under 500 lines
 */

export type FingerPaintTool = 'SPLAT' | 'STAMP' | 'SQUEEGEE';
export type StampType = 'PAW' | 'STAR' | 'HEART';

export interface PaintColor {
  id: string;
  name: string;
  hex: string;
  darkHex: string;
  lightHex: string;
  x: number;
  y: number;
  radius: number;
}

export interface SplatDroplet {
  offsetX: number;
  offsetY: number;
  radius: number;
}

export interface PaintSplatItem {
  id: number;
  x: number;
  y: number;
  radius: number;
  color: string;
  darkColor: string;
  type: 'SPLAT' | 'STAMP';
  stampType?: StampType;
  droplets: SplatDroplet[];
  scale: number;
}
