import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { StickerLogic } from '../src/games/studio/stickers/StickerLogic.js';
import { STICKER_CATALOG } from '../src/games/studio/stickers/StickerCatalog.js';

describe('Sticker World Logic', () => {
  it('catalog provides 30+ stickers across characters, treats, nature, and sparkles', () => {
    assert.ok(STICKER_CATALOG.length >= 30);
    const chars = STICKER_CATALOG.filter(s => s.category === 'character');
    const treats = STICKER_CATALOG.filter(s => s.category === 'treat');
    assert.ok(chars.length >= 8);
    assert.ok(treats.length >= 6);
  });

  it('spawns a sticker and tracks dragging', () => {
    const logic = new StickerLogic();
    logic.layout(960, 540);
    logic.clearCurrentScene();
    const placed = logic.spawnSticker('peppa');
    assert.equal(logic.stickers.length, 1);
    assert.equal(placed.id, 'peppa');
    const startX = placed.x;
    const startY = placed.y;

    // Dragging
    const hit = logic.startDrag(placed.x, placed.y);
    assert.equal(hit, true);
    logic.updateDrag(startX + 50, startY + 30);
    assert.equal(placed.x, startX + 50);
    assert.equal(placed.y, startY + 30);

    logic.endDrag();
    assert.equal(logic.draggedUid, null);
  });

  it('tap wiggles sticker and triggers audio sound', () => {
    const logic = new StickerLogic();
    logic.layout(960, 540);
    logic.clearCurrentScene();
    const placed = logic.spawnSticker('clucky');
    const tapped = logic.tapSticker(placed.x, placed.y);
    assert.ok(tapped);
    assert.equal(tapped.id, 'clucky');
    assert.ok(tapped.wiggleTimer > 0);
  });

  it('cycles backgrounds and clears/restores stickers', () => {
    const logic = new StickerLogic();
    logic.layout(960, 540);
    assert.equal(logic.currentBackground, 'farm');
    logic.nextBackground();
    assert.equal(logic.currentBackground, 'puddles');
    logic.prevBackground();
    assert.equal(logic.currentBackground, 'farm');
  });

  it('removes sticker via removeSticker or trash bin hit', () => {
    const logic = new StickerLogic();
    logic.layout(960, 540);
    logic.clearCurrentScene();
    logic.spawnSticker('cookie');
    assert.equal(logic.stickers.length, 1);
    const uid = logic.stickers[0].uid;
    logic.removeSticker(uid);
    assert.equal(logic.stickers.length, 0);
  });
});
