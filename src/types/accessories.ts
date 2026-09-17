/**
 * Avatar Accessory System Types & Metadata
 * Adventures of Trishu Mini-Game Suite
 * Strictly under 500 lines
 */

import { CharacterId } from './characters';

export type AccessorySlot = 'head' | 'face' | 'back' | 'feet';

export type AccessoryId =
  | 'none'
  | 'crown'
  | 'chefHat'
  | 'partyCone'
  | 'flowerWreath'
  | 'pirateHat'
  | 'sunHat'
  | 'sparkleGlasses'
  | 'bubbleGoggles'
  | 'superCape'
  | 'goldenWellies';

export interface AccessoryDef {
  id: AccessoryId;
  slot: AccessorySlot;
  name: string;
  emoji: string;
  description: string;
  unlockedByDefault: boolean;
  unlockStoryStopIndex?: number;
  unlockHint?: string;
}

export const ACCESSORIES_CATALOG: AccessoryDef[] = [
  // Headwear
  {
    id: 'partyCone',
    slot: 'head',
    name: 'Party Cone',
    emoji: '🥳',
    description: 'Festive polka-dot birthday cone with fluffy pom-pom!',
    unlockedByDefault: true
  },
  {
    id: 'flowerWreath',
    slot: 'head',
    name: 'Flower Wreath',
    emoji: '🌸',
    description: 'Pastel garden blossoms and leafy garland!',
    unlockedByDefault: true
  },
  {
    id: 'chefHat',
    slot: 'head',
    name: 'Chef Toque',
    emoji: '👨‍🍳',
    description: 'Fluffy white tall baker hat for kitchen masters!',
    unlockedByDefault: false,
    unlockStoryStopIndex: 3,
    unlockHint: "Beat Dad's Kitchen Dash in Story Mode!"
  },
  {
    id: 'pirateHat',
    slot: 'head',
    name: 'Pirate Tricorn',
    emoji: '🏴‍☠️',
    description: 'Ahoy! Feathered pirate hat with jolly gold trim!',
    unlockedByDefault: false,
    unlockStoryStopIndex: 6,
    unlockHint: 'Beat Veggie Harvest in Story Mode!'
  },
  {
    id: 'sunHat',
    slot: 'head',
    name: 'Garden Sun Hat',
    emoji: '👒',
    description: 'Cheerful straw sun hat with woven green ribbon!',
    unlockedByDefault: false,
    unlockStoryStopIndex: 14,
    unlockHint: 'Beat Rainbow Flower Garden in Story Mode!'
  },
  {
    id: 'crown',
    slot: 'head',
    name: 'Royal Crown',
    emoji: '👑',
    description: 'Solid gold crown studded with sparkling rubies!',
    unlockedByDefault: false,
    unlockStoryStopIndex: 15,
    unlockHint: 'Complete the Grand Story Journey!'
  },

  // Eyewear / Face
  {
    id: 'sparkleGlasses',
    slot: 'face',
    name: 'Star Shades',
    emoji: '🕶️',
    description: 'Glittery magenta star-shaped party sunglasses!',
    unlockedByDefault: true
  },
  {
    id: 'bubbleGoggles',
    slot: 'face',
    name: 'Bubble Goggles',
    emoji: '🥽',
    description: 'Squeaky-clean aqua swim goggles for splash adventures!',
    unlockedByDefault: false,
    unlockStoryStopIndex: 12,
    unlockHint: 'Beat Muddy Car Wash in Story Mode!'
  },

  // Back / Capes
  {
    id: 'superCape',
    slot: 'back',
    name: 'Hero Cape',
    emoji: '🦸',
    description: 'Bright red fluttering cape that swoops with motion!',
    unlockedByDefault: false,
    unlockStoryStopIndex: 13,
    unlockHint: 'Beat Windy Castle Kite in Story Mode!'
  },

  // Footwear
  {
    id: 'goldenWellies',
    slot: 'feet',
    name: 'Golden Wellies',
    emoji: '🥾',
    description: 'Shiny yellow rubber boots ready for mega puddle splashes!',
    unlockedByDefault: false,
    unlockStoryStopIndex: 1,
    unlockHint: 'Beat Puddle Splash in Story Mode!'
  }
];

export const DEFAULT_UNLOCKED_ACCESSORIES: AccessoryId[] = [
  'partyCone',
  'flowerWreath',
  'sparkleGlasses'
];

export interface CharacterAnchor {
  head: { x: number; y: number; scale: number; rotation?: number };
  face: { x: number; y: number; scale: number };
  back: { x: number; y: number; scale: number };
  feet: { x: number; y: number; scale: number };
}

export const CHARACTER_ANCHORS: Record<CharacterId, CharacterAnchor> = {
  peppa: {
    head: { x: 3, y: -26, scale: 0.95 },
    face: { x: -6, y: -16, scale: 0.85 },
    back: { x: 18, y: 10, scale: 1.0 },
    feet: { x: 0, y: 38, scale: 1.0 }
  },
  george: {
    head: { x: 3, y: -20, scale: 0.82 },
    face: { x: -5, y: -12, scale: 0.75 },
    back: { x: 14, y: 8, scale: 0.88 },
    feet: { x: 0, y: 30, scale: 0.88 }
  },
  daddyPig: {
    head: { x: 5, y: -36, scale: 1.25 },
    face: { x: -8, y: -20, scale: 1.15 },
    back: { x: 26, y: 15, scale: 1.3 },
    feet: { x: 0, y: 52, scale: 1.25 }
  },
  mummyPig: {
    head: { x: 4, y: -30, scale: 1.1 },
    face: { x: -6, y: -18, scale: 1.0 },
    back: { x: 22, y: 12, scale: 1.15 },
    feet: { x: 0, y: 44, scale: 1.1 }
  },
  grandpaPig: {
    head: { x: 6, y: -34, scale: 1.2 },
    face: { x: -7, y: -22, scale: 1.1 },
    back: { x: 24, y: 14, scale: 1.25 },
    feet: { x: 0, y: 50, scale: 1.2 }
  },
  suzySheep: {
    head: { x: 2, y: -28, scale: 0.95 },
    face: { x: -4, y: -14, scale: 0.85 },
    back: { x: 16, y: 10, scale: 1.0 },
    feet: { x: 0, y: 38, scale: 1.0 }
  },
  trishu: {
    head: { x: 0, y: -28, scale: 1.0 },
    face: { x: 0, y: -16, scale: 0.95 },
    back: { x: 0, y: 8, scale: 1.0 },
    feet: { x: 0, y: 36, scale: 1.0 }
  },
  leo: {
    head: { x: 0, y: -22, scale: 0.88 },
    face: { x: 0, y: -12, scale: 0.82 },
    back: { x: 0, y: 6, scale: 0.9 },
    feet: { x: 0, y: 28, scale: 0.9 }
  },
  dad: {
    head: { x: 0, y: -38, scale: 1.2 },
    face: { x: 0, y: -24, scale: 1.1 },
    back: { x: 0, y: 14, scale: 1.25 },
    feet: { x: 0, y: 52, scale: 1.2 }
  },
  mom: {
    head: { x: 0, y: -32, scale: 1.1 },
    face: { x: 0, y: -20, scale: 1.0 },
    back: { x: 0, y: 12, scale: 1.15 },
    feet: { x: 0, y: 44, scale: 1.1 }
  },
  grandpa: {
    head: { x: 0, y: -36, scale: 1.2 },
    face: { x: 0, y: -22, scale: 1.1 },
    back: { x: 0, y: 14, scale: 1.25 },
    feet: { x: 0, y: 50, scale: 1.2 }
  },
  mimi: {
    head: { x: 0, y: -32, scale: 0.95 },
    face: { x: 0, y: -16, scale: 0.88 },
    back: { x: 0, y: 8, scale: 1.0 },
    feet: { x: 0, y: 36, scale: 0.95 }
  },
  chicken: {
    head: { x: 2, y: -20, scale: 0.85 },
    face: { x: 8, y: -16, scale: 0.75 },
    back: { x: -14, y: 4, scale: 0.9 },
    feet: { x: 0, y: 24, scale: 0.85 }
  },
  chick: {
    head: { x: 0, y: -14, scale: 0.65 },
    face: { x: 4, y: -10, scale: 0.6 },
    back: { x: -8, y: 2, scale: 0.7 },
    feet: { x: 0, y: 16, scale: 0.65 }
  },
  duck: {
    head: { x: 3, y: -22, scale: 0.88 },
    face: { x: 9, y: -18, scale: 0.8 },
    back: { x: -14, y: 6, scale: 0.95 },
    feet: { x: 0, y: 26, scale: 0.9 }
  }
};
