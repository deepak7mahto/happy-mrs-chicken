import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ColoringLogic } from '../src/games/studio/coloring/ColoringLogic.js';
import { COLORING_SHEETS } from '../src/games/studio/coloring/ColoringSheets.js';

describe('Coloring Book Logic', () => {
  it('provides 6 preschool line-art coloring sheets with closed vector regions', () => {
    assert.equal(COLORING_SHEETS.length, 6);
    for (const sheet of COLORING_SHEETS) {
      assert.ok(sheet.regions.length >= 5);
      for (const r of sheet.regions) {
        assert.ok(r.polygon.length >= 3);
        assert.ok(r.colorCanon.startsWith('#'));
      }
    }
  });

  it('Magic Color fills regions upon touch intersection', () => {
    const logic = new ColoringLogic();
    logic.layout(960, 540);
    logic.clearSheet();
    logic.setToolMode('magic');

    // Pick top-left sky corner (0.1, 0.1) which is only in sky region
    const cx = 0.1 * 960;
    const cy = 0.1 * 540;
    const hitRegion = logic.hitTestRegion(cx, cy);
    assert.ok(hitRegion);

    const revealed = logic.handleTouchMove(cx, cy);
    assert.equal(revealed, true);
    assert.equal(logic.isRegionFilled(hitRegion.id), true);
    assert.equal(logic.getRegionColor(hitRegion.id), hitRegion.colorCanon);
  });

  it('Free Crayon records strokes and supports undo', () => {
    const logic = new ColoringLogic();
    logic.layout(960, 540);
    logic.clearSheet();
    logic.setToolMode('crayon');
    logic.setColor('#FF4B4B');
    logic.startStroke(100, 100);
    logic.addStrokePoint(110, 110);
    logic.endStroke();

    assert.equal(logic.strokes.length, 1);
    logic.undo();
    assert.equal(logic.strokes.length, 0);
  });

  it('Tap-to-fill colors clicked region in crayon mode', () => {
    const logic = new ColoringLogic();
    logic.layout(960, 540);
    logic.clearSheet();
    logic.setToolMode('crayon');
    logic.setColor('#42A5F5');

    const region = logic.activeSheet.regions[1]; // comb
    const cx = region.polygon.reduce((acc, p) => acc + p.x, 0) / region.polygon.length * 960;
    const cy = region.polygon.reduce((acc, p) => acc + p.y, 0) / region.polygon.length * 540;

    const filled = logic.handleTap(cx, cy);
    assert.equal(filled, true);
    assert.equal(logic.getRegionColor(region.id), '#42A5F5');
  });

  it('cycles sheets and preserves coloring progress', () => {
    const logic = new ColoringLogic();
    logic.layout(960, 540);
    assert.equal(logic.sheetIndex, 0);
    logic.nextSheet();
    assert.equal(logic.sheetIndex, 1);
    logic.prevSheet();
    assert.equal(logic.sheetIndex, 0);
  });
});
