/**
 * Creative Art Studio Scene Coordinator
 * Adventures of Trishu Preschool Suite
 * Strictly under 500 lines
 */

import { BaseScene } from '../base/BaseScene';
import { GameEngine } from '../../engine/GameEngine';
import { InputManager } from '../../engine/InputManager';
import { DisplayManager } from '../../engine/DisplayManager';
import { ParticleEngine } from '../../engine/ParticleEngine';
import { soundEngine } from '../../engine/audio';
import { voiceNarrator } from '../../engine/audio';
import { Haptics } from '../../engine/Haptics';
import { StudioTab } from './types';
import { StudioStorage } from './studioStorage';
import { StickerLogic } from './stickers/StickerLogic';
import { StickerRenderer } from './stickers/StickerRenderer';
import { STICKER_CATALOG } from './stickers/StickerCatalog';
import { ColoringLogic } from './coloring/ColoringLogic';
import { ColoringRenderer } from './coloring/ColoringRenderer';
import { CRAYON_PALETTE } from './coloring/ColoringSheets';

export class StudioScene extends BaseScene {
  public activeTab: StudioTab = 'stickers';
  public stickerLogic: StickerLogic;
  public stickerRenderer: StickerRenderer;
  public coloringLogic: ColoringLogic;
  public coloringRenderer: ColoringRenderer;
  public particles: ParticleEngine;

  private time: number = 0;
  private flashAlpha: number = 0;

  constructor(game: GameEngine) {
    super(game);
    this.stickerLogic = new StickerLogic();
    this.stickerRenderer = new StickerRenderer();
    this.coloringLogic = new ColoringLogic();
    this.coloringRenderer = new ColoringRenderer();
    this.particles = new ParticleEngine(80);
  }

  public enter(): void {
    super.enter();
    soundEngine.setTrack('waltz');
    this.particles.clear();
    const w = this.game.display ? this.game.display.vWidth : 960;
    const h = this.game.display ? this.game.display.vHeight : 540;
    this.stickerLogic.layout(w, h);
    this.coloringLogic.layout(w, h);
    voiceNarrator.speak('Welcome to the Art Studio! What shall we make today?');
  }

  public switchTab(tab: StudioTab): void {
    if (this.activeTab === tab) return;
    this.activeTab = tab;
    soundEngine.playSFX('click');
    Haptics.tap();
    if (tab === 'stickers') {
      voiceNarrator.speak('Sticker World!');
    } else {
      voiceNarrator.speak('Coloring Book!');
    }
  }

  public update(dt: number, input: InputManager): void {
    this.time += dt;
    this.particles.update(dt);
    if (this.flashAlpha > 0) {
      this.flashAlpha = Math.max(0, this.flashAlpha - dt * 2.5);
    }

    const w = this.game.display ? this.game.display.vWidth : 960;
    const h = this.game.display ? this.game.display.vHeight : 540;
    if (this.stickerLogic.width !== w || this.stickerLogic.height !== h) {
      this.stickerLogic.layout(w, h);
      this.coloringLogic.layout(w, h);
    }

    this.stickerLogic.update(dt);

    if (input.wasJustPressed() || input.isPointerDown()) {
      const pos = input.getPointerPos();

      // Top Header Controls (y <= 50)
      if (pos.y <= 50) {
        if (input.wasJustPressed()) {
          this.handleHeaderTap(pos.x, pos.y, w);
        }
        return;
      }

      // Delegate to Active Tab
      if (this.activeTab === 'stickers') {
        this.updateStickers(input, pos, w, h);
      } else {
        this.updateColoring(input, pos, w, h);
      }
    } else {
      // Touch release
      if (this.activeTab === 'stickers' && this.stickerLogic.draggedUid) {
        this.stickerLogic.endDrag();
      } else if (this.activeTab === 'coloring' && this.coloringLogic.currentStroke) {
        this.coloringLogic.endStroke();
      }
    }
  }

  private getTabRects(w: number): { sX: number; cX: number; tabW: number } {
    if (w < 700) {
      const startX = 174;
      const avail = Math.max(200, w - 126 - startX);
      const tabW = Math.floor((avail - 8) / 2);
      return { sX: startX, cX: startX + tabW + 8, tabW };
    }
    const midX = w / 2;
    return { sX: midX - 165, cX: midX + 10, tabW: 155 };
  }

  private handleHeaderTap(x: number, _y: number, w: number): void {
    const { sX, cX, tabW } = this.getTabRects(w);
    if (x >= sX && x <= sX + tabW) {
      this.switchTab('stickers');
      return;
    }
    if (x >= cX && x <= cX + tabW) {
      this.switchTab('coloring');
      return;
    }

    // Camera Snapshot Button
    if (x >= w - 120 && x <= w - 68) {
      this.takeSnapshot(w);
      return;
    }

    // Clear Button
    if (x >= w - 62 && x <= w - 16) {
      this.clearCurrentTab();
    }
  }

  private updateStickers(input: InputManager, pos: { x: number; y: number }, w: number, h: number): void {
    if (input.wasJustPressed()) {
      // Check Scene Arrow Buttons
      const arrowY = h * 0.45;
      if (Math.hypot(pos.x - 44, pos.y - arrowY) < 32) {
        this.stickerLogic.prevBackground();
        soundEngine.playSFX('whoosh');
        Haptics.tap();
        return;
      }
      if (Math.hypot(pos.x - (w - 44), pos.y - arrowY) < 32) {
        this.stickerLogic.nextBackground();
        soundEngine.playSFX('whoosh');
        Haptics.tap();
        return;
      }

      // Check Bottom Tray Tap
      const trayIdx = this.stickerRenderer.getTappedTrayIndex(pos.x, pos.y, w, h);
      if (trayIdx >= 0) {
        const item = STICKER_CATALOG[trayIdx];
        const spawned = this.stickerLogic.spawnSticker(item.id);
        soundEngine.playSFX('stickerPop');
        Haptics.tap();
        if (item.sound) {
          setTimeout(() => soundEngine.playSFX(item.sound as any), 120);
        }
        this.particles.spawnSparkles(spawned.x, spawned.y, 14);
        return;
      }

      // Check Existing Sticker Tap or Drag
      const hit = this.stickerLogic.tapSticker(pos.x, pos.y);
      if (hit) {
        const catalogItem = STICKER_CATALOG.find(c => c.id === hit.id);
        if (catalogItem?.sound) {
          soundEngine.playSFX(catalogItem.sound as any);
        } else {
          soundEngine.playSFX('stickerPop');
        }
        Haptics.tap();
        this.stickerLogic.startDrag(pos.x, pos.y);
        return;
      }
    }

    if (input.isPointerDown() && this.stickerLogic.draggedUid) {
      this.stickerLogic.updateDrag(pos.x, pos.y);
    }
  }

  private updateColoring(input: InputManager, pos: { x: number; y: number }, w: number, h: number): void {
    const action = this.coloringRenderer.getTappedAction(pos.x, pos.y, w, h);

    if (input.wasJustPressed()) {
      if (action === 'toggle') {
        const nextMode = this.coloringLogic.toolMode === 'magic' ? 'crayon' : 'magic';
        this.coloringLogic.setToolMode(nextMode);
        soundEngine.playSFX('click');
        Haptics.tap();
        return;
      }
      if (action === 'undo') {
        const didUndo = this.coloringLogic.undo();
        if (didUndo) {
          soundEngine.playSFX('click');
          Haptics.tap();
        }
        return;
      }
      if (action === 'clear') {
        this.coloringLogic.clearSheet();
        soundEngine.playSFX('whoosh');
        Haptics.tap();
        voiceNarrator.speak('Clean page ready!');
        return;
      }
      if (action === 'prevSheet') {
        this.coloringLogic.prevSheet();
        soundEngine.playSFX('whoosh');
        Haptics.tap();
        return;
      }
      if (action === 'nextSheet') {
        this.coloringLogic.nextSheet();
        soundEngine.playSFX('whoosh');
        Haptics.tap();
        return;
      }
      if (typeof action === 'number' && action >= 0) {
        // Crayon color selected
        this.coloringLogic.setColor(CRAYON_PALETTE[action]);
        soundEngine.playSFX('click');
        Haptics.tap();
        return;
      }
    }

    // Inside Drawing Canvas Area (y: 50 .. h - 76)
    if (pos.y > 50 && pos.y < h - 76) {
      if (this.coloringLogic.toolMode === 'magic') {
        const revealed = this.coloringLogic.handleTouchMove(pos.x, pos.y);
        if (revealed) {
          soundEngine.playSFX('magicChime');
          Haptics.tap();
          this.particles.spawnSparkles(pos.x, pos.y, 16);
        }
      } else {
        // Crayon Mode
        if (input.wasJustPressed()) {
          const filled = this.coloringLogic.handleTap(pos.x, pos.y);
          if (filled) {
            soundEngine.playSFX('paintSplat');
            Haptics.tap();
            this.particles.emit({ x: pos.x, y: pos.y, count: 12, color: this.coloringLogic.selectedColor });
          } else {
            this.coloringLogic.startStroke(pos.x, pos.y);
          }
        } else if (input.isPointerDown()) {
          this.coloringLogic.addStrokePoint(pos.x, pos.y);
          if (Math.random() < 0.15) {
            soundEngine.playSFX('crayonScribble');
          }
        }
      }
    }
  }

  private clearCurrentTab(): void {
    if (this.activeTab === 'stickers') {
      this.stickerLogic.clearCurrentScene();
      soundEngine.playSFX('whoosh');
      Haptics.tap();
      voiceNarrator.speak('All clean!');
    } else {
      this.coloringLogic.clearSheet();
      soundEngine.playSFX('whoosh');
      Haptics.tap();
      voiceNarrator.speak('Clean page ready!');
    }
  }

  private takeSnapshot(w: number): void {
    soundEngine.playSFX('cameraShutter');
    Haptics.tap();
    voiceNarrator.speak('Say cheese! Click!');
    this.flashAlpha = 1.0;
    this.particles.spawnConfetti(w / 2, 270, 36);

    // Capture canvas
    try {
      if (this.game.display?.canvas) {
        const dataUrl = this.game.display.canvas.toDataURL('image/png');
        const title = this.activeTab === 'stickers'
          ? `Sticker World - ${this.stickerLogic.currentBackground}`
          : `Coloring - ${this.coloringLogic.activeSheet.title}`;
        StudioStorage.saveSnapshotPhoto(dataUrl, title);
      }
    } catch (e) {
      console.warn('Snapshot capture failed', e);
    }
  }

  public render(ctx: CanvasRenderingContext2D, _alpha: number, display: DisplayManager): void {
    const w = display.vWidth;
    const h = display.vHeight;

    // Render Delegate
    if (this.activeTab === 'stickers') {
      this.stickerRenderer.render(ctx, this.stickerLogic, w, h, this.time);
    } else {
      this.coloringRenderer.render(ctx, this.coloringLogic, w, h, this.time);
    }

    // Confetti Particles
    this.particles.render(ctx);

    // Camera Flash Overlay
    if (this.flashAlpha > 0) {
      ctx.fillStyle = `rgba(255, 255, 255, ${this.flashAlpha})`;
      ctx.fillRect(0, 0, w, h);
    }

    // Top Header Navigation Bar
    this.renderHeader(ctx, w, h);
  }

  private renderHeader(ctx: CanvasRenderingContext2D, w: number, _h: number): void {
    ctx.save();
    // Glassmorphic top bar
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.beginPath();
    ctx.roundRect(12, 6, w - 24, 44, 16);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Center Tabs Switcher (positioned to clear DOM Home button on left and action buttons on right)
    const { sX, cX, tabW } = this.getTabRects(w);
    const isStickers = this.activeTab === 'stickers';
    const isCompact = w < 700;

    ctx.font = isCompact ? 'bold 13px sans-serif' : 'bold 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Stickers tab
    ctx.fillStyle = isStickers ? '#4B88FF' : '#ECEFF1';
    ctx.beginPath();
    ctx.roundRect(sX, 10, tabW, 36, 12);
    ctx.fill();
    ctx.fillStyle = isStickers ? '#FFFFFF' : '#546E7A';
    ctx.fillText(isCompact ? '🌟 Stickers' : '🌟 Sticker World', sX + tabW / 2, 28);

    // Coloring tab
    ctx.fillStyle = !isStickers ? '#9C27B0' : '#ECEFF1';
    ctx.beginPath();
    ctx.roundRect(cX, 10, tabW, 36, 12);
    ctx.fill();
    ctx.fillStyle = !isStickers ? '#FFFFFF' : '#546E7A';
    ctx.fillText(isCompact ? '🖍️ Coloring' : '🖍️ Coloring Book', cX + tabW / 2, 28);

    // 3. Camera Snapshot Button
    ctx.fillStyle = '#FFB300';
    ctx.beginPath();
    ctx.roundRect(w - 118, 10, 50, 36, 12);
    ctx.fill();
    ctx.font = '20px sans-serif';
    ctx.fillText('📸', w - 93, 28);

    // 4. Clean Wipe Squeegee Button
    ctx.fillStyle = '#90A4AE';
    ctx.beginPath();
    ctx.roundRect(w - 62, 10, 48, 36, 12);
    ctx.fill();
    ctx.fillText('🧼', w - 38, 28);

    ctx.restore();
  }
}
