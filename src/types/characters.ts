/**
 * Character Roster & Animation Types
 * Adventures of Trishu 8-Game Suite
 */

export type CharacterId =
  | 'chicken'
  | 'trishu'
  | 'leo'
  | 'dad'
  | 'mom'
  | 'grandpa'
  | 'mimi'
  | 'chick';

export interface CharacterAnimState {
  blinkTimer: number;
  isBlinking: boolean;
  nextBlinkTime?: number;
  breathTimer: number;
  breathScale: number;
  wobbleTimer: number;
  wobbleAngle: number;
  walkCycle?: number;
  jumpY?: number;
  squash?: number;
  squawk?: number;
  panicStage?: number;
  armWave?: number;
  facingLeft?: boolean;
  chompingJaw?: number;
  flipperAngle?: number;
  pullTension?: number;
  hopY?: number;
  customTimer?: number;
  customPhase?: number;
}

export interface ChickenOptions {
  squash?: number;
  flap?: number;
  squawk?: number;
  eyeBlink?: boolean;
  facingLeft?: boolean;
  headBob?: number;
  animState?: CharacterAnimState;
}

export interface TrishuOptions {
  jumpY?: number;
  squish?: number;
  squash?: number;
  armWave?: number;
  eyeBlink?: boolean;
  facingLeft?: boolean;
  muddyBoots?: boolean;
  expression?: 'happy' | 'excited' | 'surprised' | 'focused' | 'proud' | 'neutral' | 'laughing';
  animState?: CharacterAnimState;
}

export interface LeoOptions {
  jumpY?: number;
  squish?: number;
  squash?: number;
  armWave?: number;
  eyeBlink?: boolean;
  facingLeft?: boolean;
  holdingDino?: boolean;
  dinoChomp?: number;
  isCrying?: boolean;
  expression?: 'happy' | 'excited' | 'surprised' | 'crying' | 'laughing';
  animState?: CharacterAnimState;
}

export interface DadOptions {
  panicStage?: number;
  time?: number;
  eyeBlink?: boolean;
  sweatCount?: number;
  squish?: number;
  squash?: number;
  animState?: CharacterAnimState;
}

export interface MomOptions {
  eyeBlink?: boolean;
  armWave?: number;
  holdingPan?: boolean;
  panAngle?: number;
  dressSway?: number;
  smiling?: boolean;
  expression?: 'happy' | 'focused' | 'proud' | 'surprised';
  animState?: CharacterAnimState;
}

export interface GrandpaOptions {
  eyeBlink?: boolean;
  pulling?: boolean;
  pullTension?: number;
  welliesMuddy?: boolean;
  hatTilt?: number;
  expression?: 'happy' | 'straining' | 'proud';
  animState?: CharacterAnimState;
}

export interface MimiOptions {
  eyeBlink?: boolean;
  hopY?: number;
  earFlap?: number;
  earFluff?: number;
  woolPuff?: number;
  dressSway?: number;
  holdingWand?: boolean;
  blowingBubble?: boolean;
  expression?: 'happy' | 'excited' | 'blowing' | 'laughing';
  animState?: CharacterAnimState;
}

export interface ChickOptions {
  walkCycle?: number;
  isPeeping?: boolean;
  facingLeft?: boolean;
  hopY?: number;
  eyeBlink?: boolean;
  wingFlap?: number;
  animState?: CharacterAnimState;
}

export interface CharacterRenderOptions {
  scale?: number;
  rotation?: number;
  flipX?: boolean;
  facingLeft?: boolean;
  squash?: number;
  squish?: number;
  jumpY?: number;
  hopY?: number;
  eyeBlink?: boolean;
  armWave?: number;
  walkCycle?: number;
  panicStage?: number;
  time?: number;
  holdingDino?: boolean;
  dinoChomp?: number;
  holdingPan?: boolean;
  panAngle?: number;
  pulling?: boolean;
  pullTension?: number;
  holdingWand?: boolean;
  blowingBubble?: boolean;
  expression?: string;
  pose?: string;
  customParam?: number;
  animState?: CharacterAnimState;
  [key: string]: unknown;
}

export type CharacterRenderFunc<T = Record<string, unknown>> = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale?: number,
  options?: T
) => void;
