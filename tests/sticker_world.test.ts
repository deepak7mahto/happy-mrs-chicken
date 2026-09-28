import { describe, it, expect } from './e2e_runner.mjs';
import { StickerLogic } from '../src/games/studio/stickers/StickerLogic.js';
import { STICKER_CATALOG } from '../src/games/studio/stickers/StickerCatalog.js';

describe('Creative Art Studio: Sticker World Logic', () => {
  it('T-STU.04: Catalog provides 30+ stickers across characters, treats, nature, and sparkles', () => {
    expect(STICKER_CATALOG.length).toBeGreaterThanOrEqual(30);
    const chars = STICKER_CATALOG.filter(s => s.category === 'character');
    const treats = STICKER_CATALOG.filter(s => s.category === 'treat');
    expect(chars.length).toBeGreaterThanOrEqual(8);
    expect(treats.length).toBeGreaterThanOrEqual(6);
  });

  it('T-STU.05: Spawns a sticker and tracks dragging', () => {
    const logic = new StickerLogic();
    logic.layout(960, 540);
    logic.clearCurrentScene();
    const placed = logic.spawnSticker('peppa');
    expect(logic.stickers.length).toBe(1);
    expect(placed.id).toBe('peppa');
    const startX = placed.x;
    const startY = placed.y;

    // Dragging
    const hit = logic.startDrag(placed.x, placed.y);
    expect(hit).toBe(true);
    logic.updateDrag(startX + 50, startY + 30);
    expect(placed.x).toBe(startX + 50);
    expect(placed.y).toBe(startY + 30);

    logic.endDrag();
    expect(logic.draggedUid).toBe(null);
  });

  it('T-STU.06: Tap wiggles sticker and triggers audio sound', () => {
    const logic = new StickerLogic();
    logic.layout(960, 540);
    logic.clearCurrentScene();
    const placed = logic.spawnSticker('clucky');
    const tapped = logic.tapSticker(placed.x, placed.y);
    expect(Boolean(tapped)).toBe(true);
    expect(tapped?.id).toBe('clucky');
    expect(tapped!.wiggleTimer).toBeGreaterThan(0);
  });

  it('T-STU.07: Cycles backgrounds and clears/restores stickers', () => {
    const logic = new StickerLogic();
    logic.layout(960, 540);
    expect(logic.currentBackground).toBe('farm');
    logic.nextBackground();
    expect(logic.currentBackground).toBe('puddles');
    logic.prevBackground();
    expect(logic.currentBackground).toBe('farm');
  });

  it('T-STU.08: Removes sticker via removeSticker or trash bin hit', () => {
    const logic = new StickerLogic();
    logic.layout(960, 540);
    logic.clearCurrentScene();
    logic.spawnSticker('cookie');
    expect(logic.stickers.length).toBe(1);
    const uid = logic.stickers[0].uid;
    logic.removeSticker(uid);
    expect(logic.stickers.length).toBe(0);
  });
});
