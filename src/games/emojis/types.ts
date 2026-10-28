/**
 * Types & Interfaces for Mode: Emojis
 * Adventures of Trishu Mini-Game Suite
 * Strictly under 500 lines
 */

export type EmotionType = 'HAPPY' | 'SAD' | 'ANGRY' | 'SURPRISE';

export interface MajorEmotionDef {
  id: EmotionType;
  label: string;
  emoji: string;
  subLabel: string;
  color: string;
  activeColor: string;
  borderColor: string;
  x: number;
  y: number;
  w: number;
  h: number;
  scale: number;
  pulseTimer: number;
}

export interface SmallEmojiItem {
  id: string;
  emoji: string;
  name: string;
  x: number;
  y: number;
  size: number;
  scale: number;
  bounceTimer: number;
}

export interface BouncingEmojiEntity {
  id: number;
  emoji: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  vRot: number;
  scale: number;
  targetScale: number;
  wobble: number;
  life: number;
  maxLife: number;
  groundY: number;
  bounces: number;
  alpha: number;
}

export interface EmojiSparkleParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  symbol?: string;
  life: number;
  maxLife: number;
  alpha: number;
}
