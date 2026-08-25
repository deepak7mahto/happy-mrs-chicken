/**
 * Modular Character Body Parts Barrel & Composite Renderer
 * Mix & Match / Body Shuffler Studio (Mode 9)
 * Strictly under 500 Lines of Code
 */

import { CharacterAnimState } from '../../types/characters';
import { drawHeadPart } from './modularHeadParts';
import { drawTorsoPart } from './modularTorsoParts';
import { drawLegsPart } from './modularLegsParts';

export { drawHeadPart } from './modularHeadParts';
export { drawTorsoPart } from './modularTorsoParts';
export { drawLegsPart } from './modularLegsParts';

export interface CharacterPartMetadata {
  name: string;
  character: string;
  accentColor: string;
}

export const CHARACTER_PARTS: {
  heads: CharacterPartMetadata[];
  torsos: CharacterPartMetadata[];
  legs: CharacterPartMetadata[];
} = {
  heads: [
    { name: 'Twin Pigtails & Bows', character: 'Trishu', accentColor: '#FF6B6B' },
    { name: 'Playful Spiky Hair', character: 'Leo', accentColor: '#42A5F5' },
    { name: 'Glasses & Friendly Smile', character: 'Dad', accentColor: '#26A69A' },
    { name: 'Floral Hairclip & Lashes', character: 'Mom', accentColor: '#FF7043' },
    { name: 'Straw Sun Hat & Stubble', character: 'Grandpa', accentColor: '#FFC107' },
    { name: 'Fluffy Bunny Ears', character: 'Mimi', accentColor: '#FF80AB' },
    { name: 'Proud Red Comb & Beak', character: 'Mrs Clucky', accentColor: '#E53935' }
  ],
  torsos: [
    { name: 'Lavender Dungarees', character: 'Trishu', accentColor: '#B388FF' },
    { name: 'Blue Striped Shirt & Dino', character: 'Leo', accentColor: '#42A5F5' },
    { name: 'Teal Polo Shirt', character: 'Dad', accentColor: '#26A69A' },
    { name: 'Coral Floral Dress', character: 'Mom', accentColor: '#FF7043' },
    { name: 'Gardener Overalls & Plaid', character: 'Grandpa', accentColor: '#7E57C2' },
    { name: 'Pink Ribbon Dress & Wand', character: 'Mimi', accentColor: '#F48FB1' },
    { name: 'Fluffy White Feathers', character: 'Mrs Clucky', accentColor: '#FFFDE7' }
  ],
  legs: [
    { name: 'Red High-Top Sneakers', character: 'Trishu', accentColor: '#E53935' },
    { name: 'Blue Shorts & Green Boots', character: 'Leo', accentColor: '#4CAF50' },
    { name: 'Classic Brown Slacks & Shoes', character: 'Dad', accentColor: '#5D4037' },
    { name: 'Coral Hem & Red Flats', character: 'Mom', accentColor: '#D32F2F' },
    { name: 'Forest Green Wellies', character: 'Grandpa', accentColor: '#2E7D32' },
    { name: 'Fluffy Hopping Bunny Paws', character: 'Mimi', accentColor: '#FAFAFA' },
    { name: 'Golden 3-Toed Hen Feet', character: 'Mrs Clucky', accentColor: '#FFA000' }
  ]
};

export function drawCompositeCharacter(
  ctx: CanvasRenderingContext2D,
  headIdx: number,
  torsoIdx: number,
  legsIdx: number,
  x: number,
  y: number,
  scale: number = 1.0,
  animState?: CharacterAnimState
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  // Bottom to Top layer rendering
  drawLegsPart(ctx, legsIdx, 0, 42, 1.0, animState);
  drawTorsoPart(ctx, torsoIdx, 0, 8, 1.0, animState);
  drawHeadPart(ctx, headIdx, 0, -32, 1.0, animState);

  ctx.restore();
}
