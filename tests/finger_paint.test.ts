import { describe, it, expect } from './e2e_runner.mjs';
import { FingerPaintLogic } from '../src/games/finger-paint/FingerPaintLogic';

describe('Mode 19: Rainbow Splat & Stamp Studio Logic', () => {
  it('T19.01: Initializes with clean canvas and 5 color pots', () => {
    const logic = new FingerPaintLogic();
    logic.reset(960, 540);
    expect(logic.splats.length).toBe(0);
    expect(logic.colorPots.length).toBe(5);
    expect(logic.activeTool).toBe('SPLAT');
  });

  it('T19.02: Adding splat records position, color, and size', () => {
    const logic = new FingerPaintLogic();
    logic.reset(960, 540);
    logic.addSplat(200, 300);
    expect(logic.splats.length).toBe(1);
    expect(logic.splats[0].x).toBe(200);
    expect(logic.splats[0].y).toBe(300);
  });

  it('T19.03: Squeegee wipe clears splats and triggers bubbles', () => {
    const logic = new FingerPaintLogic();
    logic.reset(960, 540);
    logic.addSplat(100, 100);
    logic.triggerSqueegee();
    expect(logic.isSqueegeeActive).toBe(true);
    logic.update(1.5);
    expect(logic.splats.length).toBe(0);
  });
});
