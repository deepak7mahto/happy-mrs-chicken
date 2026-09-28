/**
 * Sticker Catalog Data
 * 32 curated toddler stickers across 4 categories
 * Strictly under 500 lines
 */

import { StickerCatalogItem } from '../types';

export const STICKER_CATALOG: StickerCatalogItem[] = [
  // Characters
  { id: 'clucky', name: 'Happy Clucky', category: 'character', characterId: 'chicken', sound: 'cluck', badgeColor: '#FFFDE7' },
  { id: 'chick', name: 'Baby Chick', category: 'character', characterId: 'chick', sound: 'bunnySqueak', badgeColor: '#FFEE58' },
  { id: 'peppa', name: 'Peppa Pig', category: 'character', characterId: 'peppa', sound: 'pigOink', badgeColor: '#FFB6C1' },
  { id: 'george', name: 'George Pig', category: 'character', characterId: 'george', sound: 'dinosaurRoar', badgeColor: '#90CAF9' },
  { id: 'mimi', name: 'Mimi Bunny', category: 'character', characterId: 'mimi', sound: 'bunnySqueak', badgeColor: '#F8BBD0' },
  { id: 'leo', name: 'Leo Lion', category: 'character', characterId: 'leo', sound: 'toddlerGiggle', badgeColor: '#FFE082' },
  { id: 'grandpa_pig', name: 'Grandpa Pig', category: 'character', characterId: 'grandpa_pig', sound: 'trainWhistle', badgeColor: '#C8E6C9' },
  { id: 'daddy_pig', name: 'Daddy Pig', category: 'character', characterId: 'daddy_pig', sound: 'pigOink', badgeColor: '#80CBC4' },
  { id: 'mummy_pig', name: 'Mummy Pig', category: 'character', characterId: 'mummy_pig', sound: 'pigOink', badgeColor: '#FFCCBC' },
  { id: 'suzy', name: 'Suzy Sheep', category: 'character', characterId: 'suzy', sound: 'toddlerGiggle', badgeColor: '#E1BEE7' },

  // Treats & Food
  { id: 'apple', name: 'Crunchy Apple', category: 'treat', emoji: '🍎', sound: 'foodChomp', badgeColor: '#FFCDD2' },
  { id: 'carrot', name: 'Sweet Carrot', category: 'treat', emoji: '🥕', sound: 'veggiePop', badgeColor: '#FFE0B2' },
  { id: 'cookie', name: 'Choco Cookie', category: 'treat', emoji: '🍪', sound: 'foodChomp', badgeColor: '#D7CCC8' },
  { id: 'pancake', name: 'Golden Pancake', category: 'treat', emoji: '🥞', sound: 'pancakeSizzle', badgeColor: '#FFF9C4' },
  { id: 'balloon', name: 'Party Balloon', category: 'treat', emoji: '🎈', sound: 'balloonPop', badgeColor: '#EF9A9A' },
  { id: 'ice_cream', name: 'Ice Cream Cone', category: 'treat', emoji: '🍦', sound: 'coneMunch', badgeColor: '#F8BBD0' },
  { id: 'cake', name: 'Birthday Cake', category: 'treat', emoji: '🎂', sound: 'foodChomp', badgeColor: '#FFCCBC' },
  { id: 'watermelon', name: 'Watermelon Slice', category: 'treat', emoji: '🍉', sound: 'foodChomp', badgeColor: '#C8E6C9' },

  // Nature & Props
  { id: 'watering_can', name: 'Garden Plant', category: 'nature', emoji: '🪴', sound: 'waterHoseSpray', badgeColor: '#A5D6A7' },
  { id: 'kite', name: 'Sky Kite', category: 'nature', emoji: '🪁', sound: 'whoosh', badgeColor: '#B3E5FC' },
  { id: 'dinosaur', name: 'Toy Dinosaur', category: 'nature', emoji: '🦖', sound: 'dinoBite', badgeColor: '#C8E6C9' },
  { id: 'duck_toy', name: 'Rubber Duck', category: 'nature', emoji: '🦆', sound: 'duckQuack', badgeColor: '#FFF59D' },
  { id: 'sun', name: 'Smiling Sun', category: 'nature', emoji: '☀️', sound: 'magicChime', badgeColor: '#FFF9C4' },
  { id: 'cloud', name: 'Fluffy Cloud', category: 'nature', emoji: '☁️', sound: 'whoosh', badgeColor: '#E0F7FA' },
  { id: 'rainbow', name: 'Rainbow Arch', category: 'nature', emoji: '🌈', sound: 'magicChime', badgeColor: '#E1BEE7' },
  { id: 'flower', name: 'Pink Flower', category: 'nature', emoji: '🌸', sound: 'click', badgeColor: '#FCE4EC' },

  // Sparkles & Atmosphere
  { id: 'golden_star', name: 'Golden Star', category: 'sparkle', emoji: '⭐', sound: 'musicBoxStar', badgeColor: '#FFF59D' },
  { id: 'sparkling_heart', name: 'Glitter Heart', category: 'sparkle', emoji: '💖', sound: 'magicChime', badgeColor: '#F8BBD0' },
  { id: 'crown', name: 'Golden Crown', category: 'sparkle', emoji: '👑', sound: 'fanfare', badgeColor: '#FFE082' },
  { id: 'music_note', name: 'Music Note', category: 'sparkle', emoji: '🎵', sound: 'xylophoneChime', badgeColor: '#B39DDB' },
  { id: 'mud_splat', name: 'Muddy Splash', category: 'sparkle', emoji: '🟤', sound: 'splash', badgeColor: '#D7CCC8' },
  { id: 'bedtime_moon', name: 'Sleepy Moon', category: 'sparkle', emoji: '🌙', sound: 'sleepyYawn', badgeColor: '#C5CAE9' }
];

export const BACKGROUND_LIST: { id: string; name: string }[] = [
  { id: 'farm', name: 'Sunny Farmyard' },
  { id: 'puddles', name: 'Muddy Puddles' },
  { id: 'castle', name: 'Windy Castle' },
  { id: 'bedtime', name: 'Sleepy Barn' },
  { id: 'meadow', name: 'Rainbow Meadow' }
];
