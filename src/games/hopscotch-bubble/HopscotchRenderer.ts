/**
 * Mode 8: Rainbow Bubble Hopscotch - Pure Canvas Renderer
 * Adventures of Trishu Mini-Game Suite
 */

import { DisplayManager } from '../../engine/DisplayManager';
import { drawLandscapeSkyHills } from '../../graphics/environmentRenderer';
import { renderCharacter } from '../../graphics/characters';
import { drawTrishu } from '../../graphics/characters/trishuRenderer';
import { CharacterAnimState, CharacterId } from '../../types/characters';
import { getHopscotchPhase } from '../../graphics/animations';
import {
  drawChalkSquare,
  drawPicnicBlanket,
  drawParachutingChick,
  drawBubbleEntity,
  drawBubbleBlowerBtn,
  drawBubbleGameHUD
} from '../../graphics/bubbleGameRenderer';
import { HopscotchLogic } from './HopscotchLogic';

export class HopscotchRenderer {
  public render(
    ctx: CanvasRenderingContext2D,
    logic: HopscotchLogic,
    animState: CharacterAnimState,
    trishuAnimState: CharacterAnimState,
    display: DisplayManager,
    selectedAvatar: CharacterId
  ): void {
    const vWidth = display.vWidth;
    const vHeight = display.vHeight;
    const isPortrait = display.isPortrait;

    drawLandscapeSkyHills(ctx, vWidth, vHeight, logic.time);

    // Chalk Squares
    for (const tile of logic.tiles) {
      drawChalkSquare(ctx, tile);
    }

    // Picnic Blanket
    const picnicX = isPortrait ? vWidth * 0.5 : vWidth - 110;
    const picnicY = isPortrait ? vHeight * 0.18 : vHeight * 0.7;

    // Celebration Rainbow Arc Slide
    if (logic.isCelebrating && logic.tiles.length > 0) {
      ctx.save();
      const lastTile = logic.tiles[logic.tiles.length - 1];
      const rColors = ['#FF1744', '#FF9100', '#FFEA00', '#00E676', '#00E5FF', '#D500F9'];
      for (let i = 0; i < rColors.length; i++) {
        ctx.strokeStyle = rColors[i];
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(lastTile.x - 15, lastTile.y - 12 + i * 3);
        ctx.quadraticCurveTo(
          (lastTile.x + picnicX) / 2,
          Math.min(lastTile.y, picnicY) - 45 + i * 3,
          picnicX,
          picnicY - 10 + i * 3
        );
        ctx.stroke();
      }
      ctx.restore();
    }

    drawPicnicBlanket(ctx, picnicX, picnicY);

    // Trishu Character on picnic blanket
    const trishuX = isPortrait ? picnicX + 65 : picnicX + 45;
    const trishuY = isPortrait ? picnicY - 20 : picnicY - 35;
    drawTrishu(ctx, trishuX, trishuY, isPortrait ? 1.05 : 1.0, {
      expression: logic.isCelebrating || logic.combo >= 4 ? 'excited' : 'happy',
      eyeBlink: trishuAnimState.isBlinking,
      facingLeft: true,
      animState: trishuAnimState
    });

    // Player Avatar Character
    const hopProgress = logic.mimi.isHopping ? logic.mimi.hopTimer / logic.mimi.hopDuration : 0;
    const hopArt = getHopscotchPhase(hopProgress);
    renderCharacter(selectedAvatar, ctx, logic.mimi.x, logic.mimi.y + hopArt.hopY, isPortrait ? 1.15 : 1.1, {
      hopY: hopArt.hopY,
      earFlap: hopArt.earFlap,
      holdingWand: true,
      blowingBubble: logic.bubbleWandPulse > 0,
      eyeBlink: animState.isBlinking,
      animState,
      expression: 'happy'
    });

    // Parachuting Chicks
    for (const c of logic.parachutingChicks) {
      drawParachutingChick(ctx, c);
    }

    // Floating Bubbles
    for (const b of logic.bubbles) {
      if (!b.popped) drawBubbleEntity(ctx, b);
    }

    // Bubble Blower Button
    drawBubbleBlowerBtn(ctx, vWidth - 50, vHeight - 48);

    // HUD Badge
    drawBubbleGameHUD(ctx, display, logic.bubblesPoppedCount, logic.score, logic.isCelebrating);
  }
}
