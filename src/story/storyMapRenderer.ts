/**
 * Procedural Adventure Map & Winding Trail Renderer
 * Adventures of Trishu — The Grand Story Journey
 * Strictly under 500 Lines of Code
 */

import { DisplayManager } from '../engine/DisplayManager';
import { GameEngine } from '../engine/GameEngine';
import { STORY_CHAPTERS, STORY_STOPS } from './storyData';
import { StoryStopDef } from '../types/story';
import { renderCharacter } from '../graphics/characters';

export interface StoryNodeLayout {
  index: number;
  def: StoryStopDef;
  x: number;
  y: number;
  radius: number;
  isCompleted: boolean;
  isCurrent: boolean;
  isUnlocked: boolean;
  stars: number;
}

export class StoryMapRenderer {
  private cachedLayout: StoryNodeLayout[] = [];
  private lastWidth: number = -1;
  private lastHeight: number = -1;
  private lastIsPortrait: boolean = false;
  private lastCurrentIndex: number = -1;

  public getNodeLayout(display: DisplayManager, engine: GameEngine): StoryNodeLayout[] {
    const vWidth = display.vWidth;
    const vHeight = display.vHeight;
    const isPortrait = display.isPortrait;
    const progress = engine.storyProgress;
    const currentIndex = progress.currentStopIndex;

    if (
      this.cachedLayout.length === STORY_STOPS.length &&
      this.lastWidth === vWidth &&
      this.lastHeight === vHeight &&
      this.lastIsPortrait === isPortrait &&
      this.lastCurrentIndex === currentIndex
    ) {
      return this.cachedLayout;
    }

    const layouts: StoryNodeLayout[] = [];
    const nodeRadius = isPortrait ? 38 : 44;
    const startY = isPortrait ? 180 : 160;
    const stepY = isPortrait ? 165 : 150;
    const amplitude = isPortrait ? Math.min(100, vWidth * 0.28) : Math.min(180, vWidth * 0.22);
    const centerX = vWidth / 2;

    for (let i = 0; i < STORY_STOPS.length; i++) {
      const def = STORY_STOPS[i];
      // Serpentine curve: alternating left and right
      const wave = Math.sin(i * 1.1) * amplitude;
      const x = centerX + wave;
      const y = startY + i * stepY;

      const stopProgress = progress.completedStops[def.id];
      const isCompleted = Boolean(stopProgress?.completed);
      const isCurrent = i === currentIndex;
      const isUnlocked = i <= currentIndex;
      const stars = stopProgress?.stars || (isCompleted ? 3 : 0);

      layouts.push({
        index: i,
        def,
        x,
        y,
        radius: nodeRadius,
        isCompleted,
        isCurrent,
        isUnlocked,
        stars
      });
    }

    this.lastWidth = vWidth;
    this.lastHeight = vHeight;
    this.lastIsPortrait = isPortrait;
    this.lastCurrentIndex = currentIndex;
    this.cachedLayout = layouts;
    return layouts;
  }

  public getTotalContentHeight(display: DisplayManager): number {
    const isPortrait = display.isPortrait;
    const startY = isPortrait ? 180 : 160;
    const stepY = isPortrait ? 165 : 150;
    return startY + STORY_STOPS.length * stepY + 140;
  }

  public render(
    ctx: CanvasRenderingContext2D,
    display: DisplayManager,
    engine: GameEngine,
    scrollY: number,
    time: number
  ): void {
    const nodes = this.getNodeLayout(display, engine);
    const vWidth = display.vWidth;
    const vHeight = display.vHeight;

    ctx.save();

    // 1. Draw Biome Background Bands
    this.drawBiomeBackgrounds(ctx, vWidth, scrollY);

    // 2. Draw Winding Path
    this.drawWindingPath(ctx, nodes, scrollY, time);

    // 3. Draw Chapter Banners & Landscape Scenery
    this.drawChapterLandmarks(ctx, display, nodes, scrollY);

    // 4. Draw Milestone Stop Nodes
    for (const node of nodes) {
      const screenY = node.y + scrollY;
      // Viewport culling
      if (screenY + node.radius + 60 < 0 || screenY - node.radius > vHeight) {
        continue;
      }
      this.drawNode(ctx, node, screenY, engine, time);
    }

    // 5. Floating Bottom "Continue Adventure" Banner
    this.drawContinueBanner(ctx, display, engine, nodes, time);

    ctx.restore();
  }

  private drawBiomeBackgrounds(ctx: CanvasRenderingContext2D, w: number, scrollY: number): void {
    // 5 Chapter biomes rendered as smooth vertical gradients
    const heights = [460, 440, 440, 440, 600];
    let curY = scrollY;

    for (let c = 0; c < STORY_CHAPTERS.length; c++) {
      const chapter = STORY_CHAPTERS[c];
      const h = heights[c];
      const grad = ctx.createLinearGradient(0, curY, 0, curY + h);
      grad.addColorStop(0, chapter.bgGradient[0]);
      grad.addColorStop(1, chapter.bgGradient[1]);
      ctx.fillStyle = grad;
      ctx.fillRect(0, curY, w, h + 2);
      curY += h;
    }
  }

  private drawWindingPath(
    ctx: CanvasRenderingContext2D,
    nodes: StoryNodeLayout[],
    scrollY: number,
    time: number
  ): void {
    if (nodes.length < 2) return;

    // Outer shadow path
    ctx.save();
    ctx.lineWidth = 26;
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(nodes[0].x, nodes[0].y + scrollY + 4);
    for (let i = 1; i < nodes.length; i++) {
      const p0 = nodes[i - 1];
      const p1 = nodes[i];
      const midY = (p0.y + p1.y) / 2 + scrollY + 4;
      ctx.bezierCurveTo(p0.x, midY, p1.x, midY, p1.x, p1.y + scrollY + 4);
    }
    ctx.stroke();

    // Main cobblestone path
    ctx.lineWidth = 22;
    ctx.strokeStyle = '#FFE082';
    ctx.beginPath();
    ctx.moveTo(nodes[0].x, nodes[0].y + scrollY);
    for (let i = 1; i < nodes.length; i++) {
      const p0 = nodes[i - 1];
      const p1 = nodes[i];
      const midY = (p0.y + p1.y) / 2 + scrollY;
      ctx.bezierCurveTo(p0.x, midY, p1.x, midY, p1.x, p1.y + scrollY);
    }
    ctx.stroke();

    // Inner dashed trail
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#FFA000';
    if (typeof ctx.setLineDash === 'function') {
      ctx.setLineDash([10, 10]);
    }
    ctx.lineDashOffset = -time * 20;
    ctx.beginPath();
    ctx.moveTo(nodes[0].x, nodes[0].y + scrollY);
    for (let i = 1; i < nodes.length; i++) {
      const p0 = nodes[i - 1];
      const p1 = nodes[i];
      const midY = (p0.y + p1.y) / 2 + scrollY;
      ctx.bezierCurveTo(p0.x, midY, p1.x, midY, p1.x, p1.y + scrollY);
    }
    ctx.stroke();
    if (typeof ctx.setLineDash === 'function') {
      ctx.setLineDash([]);
    }
    ctx.restore();
  }

  private drawChapterLandmarks(
    ctx: CanvasRenderingContext2D,
    display: DisplayManager,
    nodes: StoryNodeLayout[],
    scrollY: number
  ): void {
    const isPortrait = display.isPortrait;
    const bannerW = isPortrait ? 240 : 320;
    const bannerH = 34;

    for (let c = 0; c < STORY_CHAPTERS.length; c++) {
      const chapter = STORY_CHAPTERS[c];
      const firstStopIdx = chapter.stopIndices[0];
      const firstNode = nodes[firstStopIdx];
      if (!firstNode) continue;

      const prevNode = firstStopIdx > 0 ? nodes[firstStopIdx - 1] : null;
      const bannerY = prevNode
        ? (prevNode.y + firstNode.y) / 2 + scrollY + 8
        : firstNode.y + scrollY - 82;
      const bannerX = display.vWidth / 2 - bannerW / 2;

      // Viewport culling
      if (bannerY + bannerH < 0 || bannerY > display.vHeight) continue;

      // Chapter badge pill
      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.12)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 3;
      ctx.beginPath();
      ctx.roundRect(bannerX, bannerY, bannerW, bannerH, 17);
      ctx.fill();
      ctx.shadowColor = 'transparent';

      ctx.strokeStyle = chapter.pathColor;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Chapter title text
      ctx.fillStyle = '#37474F';
      ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${chapter.emoji} Chapter ${chapter.id}: ${chapter.title}`, display.vWidth / 2, bannerY + bannerH / 2);
      ctx.restore();
    }
  }

  private drawNode(
    ctx: CanvasRenderingContext2D,
    node: StoryNodeLayout,
    screenY: number,
    engine: GameEngine,
    time: number
  ): void {
    const { x, radius, def, isCompleted, isCurrent, isUnlocked, stars } = node;

    ctx.save();

    // 1. Current stop glowing pulsing beacon
    if (isCurrent) {
      const pulse = 6 + Math.sin(time * 5) * 5;
      ctx.strokeStyle = '#4FC3F7';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(x, screenY, radius + pulse, 0, Math.PI * 2);
      ctx.stroke();

      // Glowing outer halo
      ctx.fillStyle = 'rgba(79, 195, 247, 0.25)';
      ctx.beginPath();
      ctx.arc(x, screenY, radius + pulse + 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. Node drop shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.18)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 4;

    // 3. Node circle fill
    ctx.fillStyle = isUnlocked ? def.nodeBgColor : '#ECEFF1';
    ctx.beginPath();
    ctx.arc(x, screenY, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowColor = 'transparent';

    // 4. Node Border
    ctx.lineWidth = isCurrent ? 4.5 : 3.5;
    ctx.strokeStyle = isCurrent ? '#0288D1' : isCompleted ? '#FBC02D' : isUnlocked ? def.stampColor : '#B0BEC5';
    ctx.stroke();

    // 5. Center content: Stamp Emoji or Lock
    if (isUnlocked) {
      ctx.font = `${Math.round(radius * 0.9)}px system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(def.stampEmoji, x, screenY);

      // Stop Index pill badge in top-right
      ctx.fillStyle = isCurrent ? '#0288D1' : '#5D4037';
      ctx.beginPath();
      ctx.arc(x + radius * 0.72, screenY - radius * 0.72, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 11px system-ui, sans-serif';
      ctx.fillText(String(def.index + 1), x + radius * 0.72, screenY - radius * 0.72);
    } else {
      ctx.font = '22px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🔒', x, screenY);
    }

    // 6. Title and Subtitle Below Node
    ctx.fillStyle = isUnlocked ? '#263238' : '#78909C';
    ctx.font = 'bold 13.5px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(def.title, x, screenY + radius + 8);

    ctx.fillStyle = isUnlocked ? '#546E7A' : '#90A4AE';
    ctx.font = '11.5px system-ui, -apple-system, sans-serif';
    ctx.fillText(def.goalDescription, x, screenY + radius + 26);

    // 7. Star ratings under title for completed stops
    if (isCompleted) {
      const starStr = '⭐'.repeat(Math.max(1, Math.min(3, stars)));
      ctx.font = '13px system-ui, sans-serif';
      ctx.fillText(starStr, x, screenY + radius + 42);
    }

    // 8. Selected Avatar Standing Atop Active Node!
    if (isCurrent) {
      const avatar = engine.selectedAvatar;
      const bobY = Math.sin(time * 4) * 3;
      renderCharacter(avatar, ctx, x, screenY - radius - 26 + bobY, 0.45, {
        jumpY: bobY,
        eyeBlink: Math.sin(time * 2) > 0.88,
        expression: 'happy'
      });
    }

    ctx.restore();
  }

  private drawContinueBanner(
    ctx: CanvasRenderingContext2D,
    display: DisplayManager,
    engine: GameEngine,
    nodes: StoryNodeLayout[],
    time: number
  ): void {
    const vWidth = display.vWidth;
    const vHeight = display.vHeight;
    const isPortrait = display.isPortrait;
    const progress = engine.storyProgress;
    const currentStop = STORY_STOPS[progress.currentStopIndex] || STORY_STOPS[0];

    const cardW = isPortrait ? Math.min(340, vWidth - 32) : 380;
    const cardH = 58;
    const cardX = (vWidth - cardW) / 2;
    const cardY = vHeight - cardH - 16;

    ctx.save();
    // Drop shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.28)';
    ctx.shadowBlur = 14;
    ctx.shadowOffsetY = 5;

    // Button gradient: Green play button
    const grad = ctx.createLinearGradient(cardX, cardY, cardX, cardY + cardH);
    grad.addColorStop(0, '#66BB6A');
    grad.addColorStop(1, '#43A047');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, 29);
    ctx.fill();
    ctx.shadowColor = 'transparent';

    ctx.strokeStyle = '#2E7D32';
    ctx.lineWidth = 3.5;
    ctx.stroke();

    // Subtle pulsing border
    const pulseAlpha = (Math.sin(time * 5) + 1) * 0.25;
    ctx.strokeStyle = `rgba(255, 255, 255, ${pulseAlpha})`;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(cardX + 3, cardY + 3, cardW - 6, cardH - 6, 26);
    ctx.stroke();

    // Content: Emoji + Title + Play Icon
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 15.5px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${currentStop.stampEmoji} Stop ${currentStop.index + 1}: ${currentStop.title}`, cardX + 22, cardY + 20);

    ctx.fillStyle = '#E8F5E9';
    ctx.font = '12px system-ui, -apple-system, sans-serif';
    ctx.fillText(`Tap to Play • Goal: ${currentStop.goalDescription}`, cardX + 22, cardY + 40);

    // Big play icon on right
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 20px system-ui, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('▶️', cardX + cardW - 20, cardY + cardH / 2);

    ctx.restore();
  }

  public handleTap(
    x: number,
    y: number,
    display: DisplayManager,
    engine: GameEngine,
    scrollY: number
  ): boolean {
    const vWidth = display.vWidth;
    const vHeight = display.vHeight;
    const isPortrait = display.isPortrait;
    const progress = engine.storyProgress;

    // Check Continue Banner tap
    const cardW = isPortrait ? Math.min(340, vWidth - 32) : 380;
    const cardH = 58;
    const cardX = (vWidth - cardW) / 2;
    const cardY = vHeight - cardH - 16;

    if (x >= cardX && x <= cardX + cardW && y >= cardY && y <= cardY + cardH) {
      engine.launchStoryStop(progress.currentStopIndex, true);
      return true;
    }

    // Check individual stop nodes tap
    const nodes = this.getNodeLayout(display, engine);
    for (const node of nodes) {
      const nodeScreenY = node.y + scrollY;
      const dx = x - node.x;
      const dy = y - nodeScreenY;
      const distSq = dx * dx + dy * dy;

      if (distSq <= (node.radius + 14) * (node.radius + 14)) {
        if (node.isUnlocked) {
          engine.launchStoryStop(node.index, true);
          return true;
        }
      }
    }

    return false;
  }
}
