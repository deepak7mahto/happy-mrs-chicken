export type GameModeId = 'MENU' | 'EGG_LAYING' | 'MUDDY_PUDDLES' | 'CHICK_MAZE' | 'DADDY_PIG';

export type SFXName =
  | 'cluck'
  | 'eggPop'
  | 'crack'
  | 'hatch'
  | 'splash'
  | 'seedDrop'
  | 'fanfare'
  | 'crash'
  | 'click';

export interface HighScores {
  eggLaying: number;
  muddyPuddles: number;
  chickMaze: number;
  daddyPig: number;
  [key: string]: number;
}

export interface GameSettings {
  soundMuted: boolean;
  musicMuted: boolean;
  volume: number;
}

export interface StorageData {
  highScores: HighScores;
  settings: GameSettings;
  version: number;
}

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

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  maxLife: number;
  life: number;
  shape: 'CIRCLE' | 'SQUARE' | 'STAR' | 'FEATHER' | 'TEXT';
  text?: string;
  rotation?: number;
  vRot?: number;
  active: boolean;
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
}
