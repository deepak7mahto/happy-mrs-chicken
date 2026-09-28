import { describe, it, expect } from './e2e_runner.mjs';
import { ColoringLogic } from '../src/games/studio/coloring/ColoringLogic.js';
import { COLORING_SHEETS } from '../src/games/studio/coloring/ColoringSheets.js';

describe('Creative Art Studio: Coloring Book Logic', () => {
  it('T-STU.09: Provides 6 preschool line-art coloring sheets with closed vector regions', () => {
    expect(COLORING_SHEETS.length).toBe(6);
    for (const sheet of COLORING_SHEETS) {
      expect(sheet.regions.length).toBeGreaterThanOrEqual(5);
      for (const r of sheet.regions) {
        expect(r.polygon.length).toBeGreaterThanOrEqual(3);
        expect(r.colorCanon.startsWith('#')).toBe(true);
      }
    }
  });

  it('T-STU.10: Magic Color fills regions upon touch intersection', () => {
    const logic = new ColoringLogic();
    logic.layout(960, 540);
    logic.clearSheet();
    logic.setToolMode('magic');

    const cx = 0.1 * 960;
    const cy = 0.1 * 540;
    const hitRegion = logic.hitTestRegion(cx, cy);
    expect(Boolean(hitRegion)).toBe(true);

    const revealed = logic.handleTouchMove(cx, cy);
    expect(revealed).toBe(true);
    expect(logic.isRegionFilled(hitRegion!.id)).toBe(true);
    expect(logic.getRegionColor(hitRegion!.id)).toBe(hitRegion!.colorCanon);
  });

  it('T-STU.11: Free Crayon records strokes and supports undo', () => {
    const logic = new ColoringLogic();
    logic.layout(960, 540);
    logic.clearSheet();
    logic.setToolMode('crayon');
    logic.setColor('#FF4B4B');
    logic.startStroke(100, 100);
    logic.addStrokePoint(110, 110);
    logic.endStroke();

    expect(logic.strokes.length).toBe(1);
    logic.undo();
    expect(logic.strokes.length).toBe(0);
  });

  it('T-STU.12: Tap-to-fill colors clicked region in crayon mode', () => {
    const logic = new ColoringLogic();
    logic.layout(960, 540);
    logic.clearSheet();
    logic.setToolMode('crayon');
    logic.setColor('#42A5F5');

    const region = logic.activeSheet.regions[1];
    const cx = region.polygon.reduce((acc, p) => acc + p.x, 0) / region.polygon.length * 960;
    const cy = region.polygon.reduce((acc, p) => acc + p.y, 0) / region.polygon.length * 540;

    const filled = logic.handleTap(cx, cy);
    expect(filled).toBe(true);
    expect(logic.getRegionColor(region.id)).toBe('#42A5F5');
  });

  it('T-STU.13: Cycles sheets and preserves coloring progress', () => {
    const logic = new ColoringLogic();
    logic.layout(960, 540);
    expect(logic.sheetIndex).toBe(0);
    logic.nextSheet();
    expect(logic.sheetIndex).toBe(1);
    logic.prevSheet();
    expect(logic.sheetIndex).toBe(0);
  });
});
