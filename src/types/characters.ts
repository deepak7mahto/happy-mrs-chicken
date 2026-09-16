/**
 * Character Roster & Animation Types
 * Adventures of Trishu 8-Game Suite
 */

import type { SFXName } from './audio';

export type CharacterId =
  // Peppa Pig & Friends
  | 'peppa'
  | 'george'
  | 'daddyPig'
  | 'mummyPig'
  | 'grandpaPig'
  | 'suzySheep'
  // Adventures of Trishu
  | 'trishu'
  | 'leo'
  | 'dad'
  | 'mom'
  | 'grandpa'
  | 'mimi'
  // Farmyard Friends
  | 'chicken'
  | 'chick'
  | 'duck';

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
  headBob?: number;
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

export interface PeppaOptions {
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

export interface GeorgeOptions {
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

export interface DaddyPigOptions {
  panicStage?: number;
  time?: number;
  eyeBlink?: boolean;
  sweatCount?: number;
  squish?: number;
  squash?: number;
  animState?: CharacterAnimState;
}

export interface MummyPigOptions {
  eyeBlink?: boolean;
  armWave?: number;
  holdingPan?: boolean;
  panAngle?: number;
  dressSway?: number;
  smiling?: boolean;
  expression?: 'happy' | 'focused' | 'proud' | 'surprised';
  animState?: CharacterAnimState;
}

export interface GrandpaPigOptions {
  eyeBlink?: boolean;
  pulling?: boolean;
  pullTension?: number;
  welliesMuddy?: boolean;
  hatTilt?: number;
  expression?: 'happy' | 'straining' | 'proud';
  animState?: CharacterAnimState;
}

export interface SuzySheepOptions {
  eyeBlink?: boolean;
  hopY?: number;
  earFlap?: number;
  dressSway?: number;
  holdingWand?: boolean;
  blowingBubble?: boolean;
  expression?: 'happy' | 'excited' | 'laughing' | 'blowing';
  animState?: CharacterAnimState;
}

export interface DuckOptions {
  walkCycle?: number;
  facingLeft?: boolean;
  hopY?: number;
  rotation?: number;
  peckTimer?: number;
  wiggleTimer?: number;
  dancePhase?: number;
  isQuacking?: boolean;
  eyeBlink?: boolean;
  featherTuft?: boolean;
  wingFlap?: number;
  isHappy?: boolean;
  animState?: CharacterAnimState;
}

export type AvatarCategory = 'peppa' | 'trishu' | 'farm';

export interface AvatarInfo {
  id: CharacterId;
  name: string;
  subtitle: string;
  category: AvatarCategory;
  emoji: string;
  sound: SFXName;
  bgColor: string;
  borderColor: string;
}

export const AVATAR_ROSTER: AvatarInfo[] = [
  // Peppa Pig & Friends
  {
    id: 'peppa',
    name: 'Peppa Pig',
    subtitle: 'Muddy Puddle Queen',
    category: 'peppa',
    emoji: '🐷',
    sound: 'pigOink',
    bgColor: '#FFCDD2',
    borderColor: '#E53935'
  },
  {
    id: 'george',
    name: 'George Pig',
    subtitle: 'Dinosaur Explorer',
    category: 'peppa',
    emoji: '🦖',
    sound: 'pigOink',
    bgColor: '#BBDEFB',
    borderColor: '#1E88E5'
  },
  {
    id: 'daddyPig',
    name: 'Daddy Pig',
    subtitle: 'Puddle Jump Champion',
    category: 'peppa',
    emoji: '👓',
    sound: 'pigOink',
    bgColor: '#B2DFDB',
    borderColor: '#00897B'
  },
  {
    id: 'mummyPig',
    name: 'Mummy Pig',
    subtitle: 'Kind & Sweet Baker',
    category: 'peppa',
    emoji: '👗',
    sound: 'pigOink',
    bgColor: '#FFE0B2',
    borderColor: '#FB8C00'
  },
  {
    id: 'grandpaPig',
    name: 'Grandpa Pig',
    subtitle: 'Sailing Train Engineer',
    category: 'peppa',
    emoji: '⚓',
    sound: 'pigOink',
    bgColor: '#D1C4E9',
    borderColor: '#5E35B1'
  },
  {
    id: 'suzySheep',
    name: 'Suzy Sheep',
    subtitle: 'Bouncy Best Friend',
    category: 'peppa',
    emoji: '🐑',
    sound: 'bunnySqueak',
    bgColor: '#F8BBD0',
    borderColor: '#EC407A'
  },
  // Adventures of Trishu
  {
    id: 'trishu',
    name: 'Trishu',
    subtitle: 'Little Adventurer',
    category: 'trishu',
    emoji: '👧',
    sound: 'toddlerGiggle',
    bgColor: '#E1BEE7',
    borderColor: '#8E24AA'
  },
  {
    id: 'leo',
    name: 'Leo',
    subtitle: 'Playful Brother',
    category: 'trishu',
    emoji: '👦',
    sound: 'dinosaurRoar',
    bgColor: '#B3E5FC',
    borderColor: '#0288D1'
  },
  {
    id: 'dad',
    name: 'Dad',
    subtitle: 'Kitchen Dash Chef',
    category: 'trishu',
    emoji: '👨',
    sound: 'whoosh',
    bgColor: '#C8E6C9',
    borderColor: '#388E3C'
  },
  {
    id: 'mom',
    name: 'Mom',
    subtitle: 'Golden Pancake Maker',
    category: 'trishu',
    emoji: '👩',
    sound: 'pancakeSizzle',
    bgColor: '#FFCCBC',
    borderColor: '#E64A19'
  },
  {
    id: 'grandpa',
    name: 'Grandpa',
    subtitle: 'Little Train Engineer',
    category: 'trishu',
    emoji: '👴',
    sound: 'veggiePop',
    bgColor: '#FFF59D',
    borderColor: '#FBC02D'
  },
  {
    id: 'mimi',
    name: 'Mimi Bunny',
    subtitle: 'Rainbow Bubble Hopper',
    category: 'trishu',
    emoji: '🐰',
    sound: 'bunnySqueak',
    bgColor: '#FCE4EC',
    borderColor: '#F06292'
  },
  // Farmyard Friends
  {
    id: 'chicken',
    name: 'Mrs. Clucky',
    subtitle: 'Happy Egg Layer',
    category: 'farm',
    emoji: '🐔',
    sound: 'cluck',
    bgColor: '#FFF9C4',
    borderColor: '#FBC02D'
  },
  {
    id: 'chick',
    name: 'Baby Chick',
    subtitle: 'Fluffy Little Peeper',
    category: 'farm',
    emoji: '🐣',
    sound: 'toddlerGiggle',
    bgColor: '#FFFDE7',
    borderColor: '#FDD835'
  },
  {
    id: 'duck',
    name: 'Yellow Duck',
    subtitle: 'Picnic Quacker',
    category: 'farm',
    emoji: '🦆',
    sound: 'duckQuack',
    bgColor: '#E0F7FA',
    borderColor: '#00ACC1'
  }
];

