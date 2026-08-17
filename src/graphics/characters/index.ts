/**
 * Character Vector Graphics Barrel & Dispatcher
 * Peppa Pig: Happy Mrs Chicken 8-Game Deluxe Expansion Suite
 */

import { CharacterId, CharacterRenderFunc, CharacterRenderOptions } from '../../types/characters';
import { drawMrsChicken, renderChicken, renderMrsChicken, drawChicken } from './chickenRenderer';
import { drawPeppaPig, renderPeppa, renderPeppaPig, drawPeppa } from './peppaRenderer';
import { drawGeorgePig, renderGeorge, renderGeorgePig, drawGeorge } from './georgeRenderer';
import { drawDaddyPig, renderDaddyPig, renderDaddy, drawDaddy } from './daddyPigRenderer';
import { drawMummyPig, renderMummyPig, renderMummy, drawMummy } from './mummyPigRenderer';
import { drawGrandpaPig, renderGrandpaPig, renderGrandpa, drawGrandpa } from './grandpaPigRenderer';
import { drawSuzySheep, renderSuzySheep, renderSuzy, drawSuzy } from './suzySheepRenderer';
import { drawBabyChick, renderChick, renderBabyChick, drawChick } from './chickRenderer';

// Individual Renderer Function Exports
export {
  drawMrsChicken,
  renderChicken,
  renderMrsChicken,
  drawChicken,
  drawPeppaPig,
  renderPeppa,
  renderPeppaPig,
  drawPeppa,
  drawGeorgePig,
  renderGeorge,
  renderGeorgePig,
  drawGeorge,
  drawDaddyPig,
  renderDaddyPig,
  renderDaddy,
  drawDaddy,
  drawMummyPig,
  renderMummyPig,
  renderMummy,
  drawMummy,
  drawGrandpaPig,
  renderGrandpaPig,
  renderGrandpa,
  drawGrandpa,
  drawSuzySheep,
  renderSuzySheep,
  renderSuzy,
  drawSuzy,
  drawBabyChick,
  renderChick,
  renderBabyChick,
  drawChick
};

// Character Roster Registry Map
export const CHARACTER_RENDERERS: Record<CharacterId, CharacterRenderFunc<any>> = {
  chicken: drawMrsChicken,
  peppa: drawPeppaPig,
  george: drawGeorgePig,
  daddy: drawDaddyPig,
  mummy: drawMummyPig,
  grandpa: drawGrandpaPig,
  suzy: drawSuzySheep,
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
