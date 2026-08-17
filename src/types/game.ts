/**
 * Master Game Types & Mode Interfaces
 * Peppa Pig: Happy Mrs Chicken 8-Game Deluxe Expansion
 */

import { HighScores } from './storage';

// Re-export sub-domain types for 100% backward compatibility
export * from './audio';
export * from './storage';
export * from './characters';
export * from './particles';

// Canonical 8 Active Mini-Game Modes
export type ActiveGameModeId =
  | 'EGG_LAYING'
  | 'MUDDY_PUDDLES'
  | 'CHICK_MAZE'
  | 'DADDY_PIG'
  | 'DINOSAUR_BALLOON'
  | 'PANCAKE_FLIPPER'
  | 'VEGETABLE_HARVEST'
  | 'HOPSCOTCH_BUBBLE';

// Full Scene ID Union (including MENU and slug aliases)
export type GameModeId =
  | 'MENU'
  | ActiveGameModeId
  | 'classic'
  | 'egg-tap'
  | 'chick-catch'
  | 'mud-puddle'
  | 'pancake-flip'
  | 'balloon-pop'
  | 'seed-sort'
  | 'dino-maze';

export type GameModeSlug =
  | 'classic'
  | 'mud-puddle'
  | 'seed-sort'
  | 'dino-maze'
  | 'balloon-pop'
  | 'pancake-flip'
  | 'egg-tap'
  | 'chick-catch';

export interface GameModeMetadata {
  id: ActiveGameModeId;
  slug: GameModeSlug;
  title: string;
  subtitle: string;
  description: string;
  character: string;
  badge: string;
  cardColor: string;
  accentColor: string;
  highScoreKey: keyof HighScores;
  order: number;
}

export const GAME_MODES_LIST: readonly ActiveGameModeId[] = [
  'EGG_LAYING',
  'MUDDY_PUDDLES',
  'CHICK_MAZE',
  'DADDY_PIG',
  'DINOSAUR_BALLOON',
  'PANCAKE_FLIPPER',
  'VEGETABLE_HARVEST',
  'HOPSCOTCH_BUBBLE'
] as const;

export const MODE_ID_TO_SLUG: Record<ActiveGameModeId, GameModeSlug> = {
  EGG_LAYING: 'classic',
  MUDDY_PUDDLES: 'mud-puddle',
  CHICK_MAZE: 'seed-sort',
  DADDY_PIG: 'dino-maze',
  DINOSAUR_BALLOON: 'balloon-pop',
  PANCAKE_FLIPPER: 'pancake-flip',
  VEGETABLE_HARVEST: 'egg-tap',
  HOPSCOTCH_BUBBLE: 'chick-catch'
};

export const SLUG_TO_MODE_ID: Record<GameModeSlug, ActiveGameModeId> = {
  'classic': 'EGG_LAYING',
  'mud-puddle': 'MUDDY_PUDDLES',
  'seed-sort': 'CHICK_MAZE',
  'dino-maze': 'DADDY_PIG',
  'balloon-pop': 'DINOSAUR_BALLOON',
  'pancake-flip': 'PANCAKE_FLIPPER',
  'egg-tap': 'VEGETABLE_HARVEST',
  'chick-catch': 'HOPSCOTCH_BUBBLE'
};

export interface MiniGame {
  readonly modeId: GameModeId;
  score: number;
  highScoreKey?: string;
  init?(game?: unknown): void;
  enter(params?: Record<string, unknown>): void;
  exit(): void;
  update(dt: number, input?: unknown): void;
  render(ctx: CanvasRenderingContext2D, alpha?: number, display?: unknown): void;
  handleClick?(x: number, y: number): void;
  handleTouch?(x: number, y: number, id?: number): void;
  handleInput?(input: unknown): void;
  resize?(display: unknown): void;
  pause?(): void;
  resume?(): void;
  destroy?(): void;
  getScore(): number;
  isGameOver(): boolean;
  getEntities(): Record<string, unknown>;
  getModeState(): Record<string, unknown>;
}

export interface ModeCardDef {
  id: GameModeId;
  title: string;
  sub: string;
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  badge: string;
  icon?: string;
}

export interface PointerData {
  id: number;
  screenX: number;
  screenY: number;
  x: number;
  y: number;
  inside: boolean;
  isDown: boolean;
  justPressed: boolean;
  justReleased: boolean;
}

// Mode-Specific Gameplay Entities
export interface EggEntity {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  vRot: number;
  state: 'FALLING' | 'INCUBATING' | 'CRACK_1' | 'CRACK_2' | 'HATCH_BURST';
  timer: number;
  crackStage: number;
}

export interface ChickEntity {
  x: number;
  y: number;
  vx: number;
  vy: number;
  walkCycle: number;
  facingLeft?: boolean;
  state?: 'WANDERING' | 'SCAMPERING';
}

export interface PuddleEntity {
  x: number;
  y: number;
  rx: number;
  ry: number;
  type: 'STANDARD' | 'GOLDEN';
  lifetime: number;
  ripplePhase: number;
}

export interface SeedEntity {
  x: number;
  y: number;
  remaining: number;
}

export interface BalloonEntity {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  shape: 'DINO' | 'ROUND';
  popped: boolean;
  wobblePhase: number;
}

export interface PancakeEntity {
  x: number;
  y: number;
  vy: number;
  rotation: number;
  vRot: number;
  flipCount: number;
  isCooked: boolean;
  isStacked: boolean;
}

export interface VegetableEntity {
  id: string;
  type: 'CARROT' | 'CABBAGE' | 'PUMPKIN';
  x: number;
  y: number;
  pullProgress: number; // 0.0 to 1.0
  isHarvested: boolean;
}

export interface BubbleEntity {
  x: number;
  y: number;
  radius: number;
  vy: number;
  wobbleOffset: number;
  popped: boolean;
}
