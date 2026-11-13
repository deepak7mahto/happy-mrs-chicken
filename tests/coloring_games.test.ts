import { describe, it, expect } from './e2e_runner.mjs';
import { GameEngine } from '../src/engine/GameEngine';
import { MENU_CARDS } from '../src/games/menu/menuData';
import { ColoringBookScene } from '../src/games/coloring-book';
import { MagicScratchLogic, SCRATCH_PICTURES } from '../src/games/magic-scratch/MagicScratchLogic';
import { MagicScratchScene } from '../src/games/magic-scratch';
import { ColorByShapeLogic, SHAPE_PICTURES } from '../src/games/color-by-shape/ColorByShapeLogic';
import { ColorByShapeScene } from '../src/games/color-by-shape';

describe('Coloring Games Suite & Top-of-Menu Placement', () => {
  it('C01: All 4 coloring & art games are placed at the very top of MENU_CARDS', () => {
    expect(MENU_CARDS[0].id).toBe('COLORING_BOOK');
    expect(MENU_CARDS[1].id).toBe('MAGIC_SCRATCH');
    expect(MENU_CARDS[2].id).toBe('COLOR_BY_SHAPE');
    expect(MENU_CARDS[3].id).toBe('FINGER_PAINT');
  });

  it('C02: ColoringBookScene initializes, colors regions, and updates score', () => {
    const canvas = document.createElement('canvas');
    const engine = new GameEngine(canvas);
    const scene = engine.scenes.get('COLORING_BOOK') as ColoringBookScene;
    expect(scene).toBeDefined();

    scene.enter();
    expect(scene.logic.toolMode).toBe('crayon');
    const sheet = scene.logic.activeSheet;
    expect(sheet.regions.length).toBeGreaterThan(0);

    // Tap center of first region
    const poly = sheet.regions[0].polygon;
    const cx = (poly.reduce((s, p) => s + p.x, 0) / poly.length) * scene.logic.width;
    const cy = (poly.reduce((s, p) => s + p.y, 0) / poly.length) * scene.logic.height;
    const filled = scene.logic.handleTap(cx, cy);
    expect(filled).toBe(true);
    scene.exit();
    engine.destroy();
  });

  it('C03: MagicScratchLogic tracks reveal percentage and completes at >=75%', () => {
    const logic = new MagicScratchLogic();
    logic.reset(960, 540);
    expect(logic.revealPercent).toBe(0);
    expect(logic.isCompleted).toBe(false);

    const box = logic.getPaperBounds();
    logic.startScratch(box.x + box.w / 2, box.y + box.h / 2);
    expect(logic.revealPercent).toBeGreaterThan(0);

    // Scratch across the entire paper in steps
    for (let y = box.y + 20; y < box.y + box.h; y += 40) {
      for (let x = box.x + 20; x < box.x + box.w; x += 40) {
        logic.moveScratch(x, y);
      }
    }
    logic.endScratch();
    expect(logic.revealPercent).toBeGreaterThanOrEqual(75);
    expect(logic.isCompleted).toBe(true);

    logic.nextPicture();
    expect(logic.pictureIndex).toBe(1 % SCRATCH_PICTURES.length);
    expect(logic.revealPercent).toBe(0);
    expect(logic.isCompleted).toBe(false);
  });

  it('C04: MagicScratchScene integrates cleanly with GameEngine', () => {
    const canvas = document.createElement('canvas');
    const engine = new GameEngine(canvas);
    const scene = engine.scenes.get('MAGIC_SCRATCH') as MagicScratchScene;
    expect(scene).toBeDefined();

    scene.enter();
    scene.update(0.016, engine.input);
    expect(scene.getModeState().revealPercent).toBe(0);
    scene.exit();
    engine.destroy();
  });

  it('C05: ColorByShapeLogic matches shapes to colors and completes picture', () => {
    const logic = new ColorByShapeLogic();
    logic.layout(960, 540);
    const box = logic.getPaperBounds();

    // Fill every piece using its matching kind
    for (const p of logic.pieces) {
      logic.selectedKind = p.kind;
      const px = box.x + p.nx * box.w;
      const py = box.y + p.ny * box.h;
      const res = logic.tryTapPiece(px, py);
      expect(res.hit).toBe(true);
      expect(res.matched).toBe(true);
    }

    expect(logic.isCompleted).toBe(true);
    expect(logic.score).toBeGreaterThan(0);

    logic.nextPicture();
    expect(logic.pictureIndex).toBe(1 % SHAPE_PICTURES.length);
    expect(logic.isCompleted).toBe(false);
  });

  it('C06: ColorByShapeScene integrates cleanly with GameEngine', () => {
    const canvas = document.createElement('canvas');
    const engine = new GameEngine(canvas);
    const scene = engine.scenes.get('COLOR_BY_SHAPE') as ColorByShapeScene;
    expect(scene).toBeDefined();

    scene.enter();
    scene.update(0.016, engine.input);
    expect(scene.getModeState().isCompleted).toBe(false);
    scene.exit();
    engine.destroy();
  });
});
