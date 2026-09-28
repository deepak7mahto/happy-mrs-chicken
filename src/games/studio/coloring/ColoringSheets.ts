/**
 * Preschool Line-Art Coloring Sheets
 * 6 sheets with normalized polygon vector regions
 * Strictly under 500 lines
 */

import { ColoringSheetId, ColoringRegion } from '../types';

export interface ColoringSheetDefinition {
  id: ColoringSheetId;
  title: string;
  character: string;
  regions: ColoringRegion[];
}

export const COLORING_SHEETS: ColoringSheetDefinition[] = [
  // Sheet 1: Happy Mrs Clucky Nest
  {
    id: 'clucky_nest',
    title: 'Happy Mrs Clucky',
    character: 'chicken',
    regions: [
      {
        id: 'sky',
        name: 'Sky',
        colorCanon: '#B3E5FC',
        polygon: [{ x: 0.05, y: 0.08 }, { x: 0.95, y: 0.08 }, { x: 0.95, y: 0.65 }, { x: 0.05, y: 0.65 }]
      },
      {
        id: 'comb',
        name: 'Red Comb',
        colorCanon: '#E53935',
        polygon: [{ x: 0.45, y: 0.16 }, { x: 0.55, y: 0.16 }, { x: 0.58, y: 0.24 }, { x: 0.42, y: 0.24 }]
      },
      {
        id: 'beak',
        name: 'Golden Beak',
        colorCanon: '#FFA000',
        polygon: [{ x: 0.55, y: 0.28 }, { x: 0.65, y: 0.32 }, { x: 0.55, y: 0.36 }]
      },
      {
        id: 'body',
        name: 'Chicken Feather Body',
        colorCanon: '#FFFDE7',
        polygon: [{ x: 0.36, y: 0.25 }, { x: 0.62, y: 0.25 }, { x: 0.68, y: 0.52 }, { x: 0.32, y: 0.52 }]
      },
      {
        id: 'wing',
        name: 'Soft Wing',
        colorCanon: '#FFF59D',
        polygon: [{ x: 0.38, y: 0.35 }, { x: 0.52, y: 0.34 }, { x: 0.50, y: 0.48 }, { x: 0.36, y: 0.46 }]
      },
      {
        id: 'nest',
        name: 'Straw Nest',
        colorCanon: '#FFB74D',
        polygon: [{ x: 0.24, y: 0.52 }, { x: 0.76, y: 0.52 }, { x: 0.70, y: 0.68 }, { x: 0.30, y: 0.68 }]
      },
      {
        id: 'eggs',
        name: 'Nest Eggs',
        colorCanon: '#FFE082',
        polygon: [{ x: 0.40, y: 0.50 }, { x: 0.60, y: 0.50 }, { x: 0.58, y: 0.58 }, { x: 0.42, y: 0.58 }]
      },
      {
        id: 'ground',
        name: 'Green Barn Ground',
        colorCanon: '#81C784',
        polygon: [{ x: 0.05, y: 0.65 }, { x: 0.95, y: 0.65 }, { x: 0.95, y: 0.88 }, { x: 0.05, y: 0.88 }]
      }
    ]
  },

  // Sheet 2: Peppa Muddy Puddle
  {
    id: 'peppa_puddle',
    title: 'Peppa in Muddy Puddle',
    character: 'peppa',
    regions: [
      {
        id: 'sky',
        name: 'Sunny Sky',
        colorCanon: '#81D4FA',
        polygon: [{ x: 0.05, y: 0.08 }, { x: 0.95, y: 0.08 }, { x: 0.95, y: 0.58 }, { x: 0.05, y: 0.58 }]
      },
      {
        id: 'sun',
        name: 'Golden Sun',
        colorCanon: '#FFEE58',
        polygon: [{ x: 0.75, y: 0.12 }, { x: 0.90, y: 0.12 }, { x: 0.90, y: 0.26 }, { x: 0.75, y: 0.26 }]
      },
      {
        id: 'head',
        name: 'Piggy Head',
        colorCanon: '#FFB6C1',
        polygon: [{ x: 0.38, y: 0.18 }, { x: 0.62, y: 0.18 }, { x: 0.64, y: 0.36 }, { x: 0.36, y: 0.36 }]
      },
      {
        id: 'dress',
        name: 'Red Dress',
        colorCanon: '#E53935',
        polygon: [{ x: 0.40, y: 0.36 }, { x: 0.60, y: 0.36 }, { x: 0.66, y: 0.56 }, { x: 0.34, y: 0.56 }]
      },
      {
        id: 'boots',
        name: 'Yellow Rainboots',
        colorCanon: '#FDD835',
        polygon: [{ x: 0.38, y: 0.56 }, { x: 0.62, y: 0.56 }, { x: 0.64, y: 0.66 }, { x: 0.36, y: 0.66 }]
      },
      {
        id: 'puddle',
        name: 'Muddy Splash Puddle',
        colorCanon: '#8D6E63',
        polygon: [{ x: 0.25, y: 0.64 }, { x: 0.75, y: 0.64 }, { x: 0.78, y: 0.78 }, { x: 0.22, y: 0.78 }]
      },
      {
        id: 'grass',
        name: 'Lush Grass',
        colorCanon: '#66BB6A',
        polygon: [{ x: 0.05, y: 0.58 }, { x: 0.95, y: 0.58 }, { x: 0.95, y: 0.88 }, { x: 0.05, y: 0.88 }]
      }
    ]
  },

  // Sheet 3: Leo Picnic Cake
  {
    id: 'leo_picnic',
    title: "Leo's Picnic Party",
    character: 'leo',
    regions: [
      {
        id: 'sky',
        name: 'Park Sky',
        colorCanon: '#B3E5FC',
        polygon: [{ x: 0.05, y: 0.08 }, { x: 0.95, y: 0.08 }, { x: 0.95, y: 0.60 }, { x: 0.05, y: 0.60 }]
      },
      {
        id: 'mane',
        name: 'Lion Mane',
        colorCanon: '#FFB74D',
        polygon: [{ x: 0.26, y: 0.16 }, { x: 0.54, y: 0.16 }, { x: 0.56, y: 0.44 }, { x: 0.24, y: 0.44 }]
      },
      {
        id: 'face',
        name: 'Lion Face',
        colorCanon: '#FFE082',
        polygon: [{ x: 0.32, y: 0.22 }, { x: 0.48, y: 0.22 }, { x: 0.48, y: 0.38 }, { x: 0.32, y: 0.38 }]
      },
      {
        id: 'hat',
        name: 'Party Cone Hat',
        colorCanon: '#AB47BC',
        polygon: [{ x: 0.36, y: 0.10 }, { x: 0.44, y: 0.10 }, { x: 0.42, y: 0.20 }, { x: 0.38, y: 0.20 }]
      },
      {
        id: 'cake',
        name: 'Sweet Birthday Cake',
        colorCanon: '#FF80AB',
        polygon: [{ x: 0.62, y: 0.40 }, { x: 0.82, y: 0.40 }, { x: 0.84, y: 0.58 }, { x: 0.60, y: 0.58 }]
      },
      {
        id: 'table',
        name: 'Picnic Table',
        colorCanon: '#A1887F',
        polygon: [{ x: 0.50, y: 0.56 }, { x: 0.92, y: 0.56 }, { x: 0.90, y: 0.72 }, { x: 0.52, y: 0.72 }]
      },
      {
        id: 'ground',
        name: 'Picnic Lawn',
        colorCanon: '#81C784',
        polygon: [{ x: 0.05, y: 0.60 }, { x: 0.95, y: 0.60 }, { x: 0.95, y: 0.88 }, { x: 0.05, y: 0.88 }]
      }
    ]
  },

  // Sheet 4: Mimi Bunny Rainbow Balloon
  {
    id: 'mimi_balloon',
    title: 'Mimi & Rainbow Balloon',
    character: 'mimi',
    regions: [
      {
        id: 'sky',
        name: 'Magical Sky',
        colorCanon: '#E1BEE7',
        polygon: [{ x: 0.05, y: 0.08 }, { x: 0.95, y: 0.08 }, { x: 0.95, y: 0.62 }, { x: 0.05, y: 0.62 }]
      },
      {
        id: 'rainbow',
        name: 'Rainbow Arch',
        colorCanon: '#FF8A80',
        polygon: [{ x: 0.10, y: 0.10 }, { x: 0.90, y: 0.10 }, { x: 0.90, y: 0.28 }, { x: 0.10, y: 0.28 }]
      },
      {
        id: 'balloon',
        name: 'Big Heart Balloon',
        colorCanon: '#FF5252',
        polygon: [{ x: 0.62, y: 0.24 }, { x: 0.84, y: 0.24 }, { x: 0.82, y: 0.46 }, { x: 0.64, y: 0.46 }]
      },
      {
        id: 'ears',
        name: 'Bunny Ears',
        colorCanon: '#F8BBD0',
        polygon: [{ x: 0.34, y: 0.20 }, { x: 0.50, y: 0.20 }, { x: 0.50, y: 0.36 }, { x: 0.34, y: 0.36 }]
      },
      {
        id: 'dress',
        name: 'Blue Bunny Dress',
        colorCanon: '#42A5F5',
        polygon: [{ x: 0.32, y: 0.42 }, { x: 0.52, y: 0.42 }, { x: 0.56, y: 0.66 }, { x: 0.28, y: 0.66 }]
      },
      {
        id: 'grass',
        name: 'Meadow Garden',
        colorCanon: '#81C784',
        polygon: [{ x: 0.05, y: 0.62 }, { x: 0.95, y: 0.62 }, { x: 0.95, y: 0.88 }, { x: 0.05, y: 0.88 }]
      }
    ]
  },

  // Sheet 5: Little Train Ride
  {
    id: 'train_ride',
    title: 'Grandpa Pig Little Train',
    character: 'grandpa_pig',
    regions: [
      {
        id: 'sky',
        name: 'Morning Sky',
        colorCanon: '#90CAF9',
        polygon: [{ x: 0.05, y: 0.08 }, { x: 0.95, y: 0.08 }, { x: 0.95, y: 0.58 }, { x: 0.05, y: 0.58 }]
      },
      {
        id: 'cabin',
        name: 'Train Cabin',
        colorCanon: '#FDD835',
        polygon: [{ x: 0.54, y: 0.28 }, { x: 0.78, y: 0.28 }, { x: 0.78, y: 0.56 }, { x: 0.54, y: 0.56 }]
      },
      {
        id: 'boiler',
        name: 'Red Engine Boiler',
        colorCanon: '#E53935',
        polygon: [{ x: 0.24, y: 0.38 }, { x: 0.54, y: 0.38 }, { x: 0.54, y: 0.56 }, { x: 0.24, y: 0.56 }]
      },
      {
        id: 'chimney',
        name: 'Smoke Funnel',
        colorCanon: '#424242',
        polygon: [{ x: 0.30, y: 0.24 }, { x: 0.38, y: 0.24 }, { x: 0.38, y: 0.38 }, { x: 0.30, y: 0.38 }]
      },
      {
        id: 'wheels',
        name: 'Iron Chug Wheels',
        colorCanon: '#263238',
        polygon: [{ x: 0.22, y: 0.56 }, { x: 0.80, y: 0.56 }, { x: 0.80, y: 0.70 }, { x: 0.22, y: 0.70 }]
      },
      {
        id: 'tracks',
        name: 'Railway Track',
        colorCanon: '#795548',
        polygon: [{ x: 0.05, y: 0.68 }, { x: 0.95, y: 0.68 }, { x: 0.95, y: 0.76 }, { x: 0.05, y: 0.76 }]
      },
      {
        id: 'hills',
        name: 'Countryside Hills',
        colorCanon: '#66BB6A',
        polygon: [{ x: 0.05, y: 0.58 }, { x: 0.95, y: 0.58 }, { x: 0.95, y: 0.88 }, { x: 0.05, y: 0.88 }]
      }
    ]
  },

  // Sheet 6: Sleepy Barn
  {
    id: 'sleepy_barn',
    title: 'Sleepy Bedtime Barn',
    character: 'chick',
    regions: [
      {
        id: 'night_sky',
        name: 'Deep Twilight Sky',
        colorCanon: '#1A237E',
        polygon: [{ x: 0.05, y: 0.08 }, { x: 0.95, y: 0.08 }, { x: 0.95, y: 0.55 }, { x: 0.05, y: 0.55 }]
      },
      {
        id: 'moon',
        name: 'Smiling Golden Moon',
        colorCanon: '#FFEE58',
        polygon: [{ x: 0.74, y: 0.12 }, { x: 0.88, y: 0.12 }, { x: 0.88, y: 0.28 }, { x: 0.74, y: 0.28 }]
      },
      {
        id: 'roof',
        name: 'Red Barn Roof',
        colorCanon: '#B71C1C',
        polygon: [{ x: 0.20, y: 0.32 }, { x: 0.80, y: 0.32 }, { x: 0.86, y: 0.44 }, { x: 0.14, y: 0.44 }]
      },
      {
        id: 'quilt',
        name: 'Patchwork Blanket',
        colorCanon: '#7E57C2',
        polygon: [{ x: 0.28, y: 0.54 }, { x: 0.72, y: 0.54 }, { x: 0.74, y: 0.74 }, { x: 0.26, y: 0.74 }]
      },
      {
        id: 'lantern',
        name: 'Warm Paper Lantern',
        colorCanon: '#FFCA28',
        polygon: [{ x: 0.46, y: 0.42 }, { x: 0.54, y: 0.42 }, { x: 0.54, y: 0.52 }, { x: 0.46, y: 0.52 }]
      },
      {
        id: 'floor',
        name: 'Wooden Barn Floor',
        colorCanon: '#5D4037',
        polygon: [{ x: 0.05, y: 0.72 }, { x: 0.95, y: 0.72 }, { x: 0.95, y: 0.88 }, { x: 0.05, y: 0.88 }]
      }
    ]
  }
];

export const CRAYON_PALETTE = [
  '#FF4B4B', // Cherry Red
  '#FF9800', // Carrot Orange
  '#FFEB3B', // Buttercup Yellow
  '#4CAF50', // Grass Green
  '#29B6F6', // Sky Blue
  '#7E57C2', // Royal Purple
  '#EC407A', // Bubblegum Pink
  '#8D6E63', // Chocolate Brown
  '#FFD700', // Golden Sun
  '#FFCCBC', // Soft Peach
  '#CE93D8', // Lilac
  '#80CBC4'  // Mint
];
