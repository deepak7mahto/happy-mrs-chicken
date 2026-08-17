/**
 * Character Vector Graphics Barrel & Dispatcher
 * Adventures of Trishu 8-Game Suite
 */

import { CharacterId, CharacterRenderFunc, CharacterRenderOptions } from '../../types/characters';
import { drawMrsClucky, drawMrsChicken, renderChicken, renderMrsChicken, renderMrsClucky, drawChicken } from './chickenRenderer';
import { drawTrishu, renderTrishu, drawTrishuGirl } from './trishuRenderer';
import { drawLeo, renderLeo, drawLeoBoy } from './leoRenderer';
import { drawDad, renderDad, drawDadFather } from './dadRenderer';
import { drawMom, renderMom, drawMomMother } from './momRenderer';
import { drawGrandpa, renderGrandpa, drawGrandpaGardener } from './grandpaRenderer';
import { drawMimi, renderMimi, drawMimiBunny } from './mimiRenderer';
import { drawBabyChick, renderChick, renderBabyChick, drawChick } from './chickRenderer';

// Individual Renderer Function Exports
export {
  drawMrsClucky,
  drawMrsChicken,
  renderChicken,
  renderMrsChicken,
  renderMrsClucky,
  drawChicken,
  drawTrishu,
  renderTrishu,
  drawTrishuGirl,
  drawLeo,
  renderLeo,
  drawLeoBoy,
  drawDad,
  renderDad,
  drawDadFather,
  drawMom,
  renderMom,
  drawMomMother,
  drawGrandpa,
  renderGrandpa,
  drawGrandpaGardener,
  drawMimi,
  renderMimi,
  drawMimiBunny,
  drawBabyChick,
  renderChick,
  renderBabyChick,
  drawChick
};

// Character Roster Registry Map
export const CHARACTER_RENDERERS: Record<CharacterId, CharacterRenderFunc<any>> = {
  chicken: drawMrsClucky,
  trishu: drawTrishu,
  leo: drawLeo,
  dad: drawDad,
  mom: drawMom,
  grandpa: drawGrandpa,
  mimi: drawMimi,
  chick: drawBabyChick
};

/**
 * Universal polymorphic character renderer dispatcher.
 * Delegates rendering to the corresponding procedural vector renderer for characterId.
 */
export function renderCharacter(
  id: CharacterId,
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number = 1.0,
  options?: CharacterRenderOptions
): void {
  const renderer = CHARACTER_RENDERERS[id];
  if (renderer) {
    renderer(ctx, x, y, scale, options);
  }
}

// Re-export Character Types
export * from '../../types/characters';
