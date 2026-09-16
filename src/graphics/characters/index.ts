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
import { drawYellowDuck, renderYellowDuck } from './duckRenderer';
import { drawPeppaPig, renderPeppaPig, drawPeppa, renderPeppa } from './peppaRenderer';
import { drawGeorgePig, renderGeorgePig, drawGeorge, renderGeorge } from './georgeRenderer';
import { drawDaddyPig, renderDaddyPig, drawDaddy, renderDaddy } from './daddyPigRenderer';
import { drawMummyPig, renderMummyPig, drawMummy, renderMummy } from './mummyPigRenderer';
import { drawGrandpaPig, renderGrandpaPig } from './grandpaPigRenderer';
import { drawSuzySheep, renderSuzySheep, drawSuzy, renderSuzy } from './suzySheepRenderer';

// Individual Renderer Function Exports
export {
  drawYellowDuck,
  renderYellowDuck,
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
  drawChick,
  drawPeppaPig,
  renderPeppaPig,
  drawPeppa,
  renderPeppa,
  drawGeorgePig,
  renderGeorgePig,
  drawGeorge,
  renderGeorge,
  drawDaddyPig,
  renderDaddyPig,
  drawDaddy,
  renderDaddy,
  drawMummyPig,
  renderMummyPig,
  drawMummy,
  renderMummy,
  drawGrandpaPig,
  renderGrandpaPig,
  drawSuzySheep,
  renderSuzySheep,
  drawSuzy,
  renderSuzy
};

// Character Roster Registry Map (All 15 Characters)
export const CHARACTER_RENDERERS: Record<CharacterId, CharacterRenderFunc<any>> = {
  // Peppa Pig & Friends
  peppa: drawPeppaPig,
  george: drawGeorgePig,
  daddyPig: drawDaddyPig,
  mummyPig: drawMummyPig,
  grandpaPig: drawGrandpaPig,
  suzySheep: drawSuzySheep,
  // Adventures of Trishu
  trishu: drawTrishu,
  leo: drawLeo,
  dad: drawDad,
  mom: drawMom,
  grandpa: drawGrandpa,
  mimi: drawMimi,
  // Farmyard Friends
  chicken: drawMrsClucky,
  chick: drawBabyChick,
  duck: drawYellowDuck
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

// Re-export Character Types & Modular Body Parts
export * from '../../types/characters';
export * from './modularBodyParts';
