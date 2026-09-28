import { describe, it, expect } from './e2e_runner.mjs';
import { GameEngine } from '../src/engine/GameEngine.js';
import { StudioScene } from '../src/games/studio/StudioScene.js';

describe('Creative Art Studio: Scene & Engine Integration', () => {
  it('T-STU.14: StudioScene switches between sticker and coloring tabs', () => {
    const engine = {
      display: { vWidth: 960, vHeight: 540 },
      storage: { get: () => null, set: () => {} }
    } as any;
    const studio = new StudioScene(engine);
    expect(studio.activeTab).toBe('stickers');
    studio.switchTab('coloring');
    expect(studio.activeTab).toBe('coloring');
    studio.switchTab('stickers');
    expect(studio.activeTab).toBe('stickers');
  });

  it('T-STU.15: GameEngine registers STUDIO scene in its scene map', () => {
    const canvas = document.createElement('canvas');
    const engine = new GameEngine(canvas);
    const studio = engine.scenes.get('STUDIO');
    expect(Boolean(studio)).toBe(true);
    expect(studio instanceof StudioScene).toBe(true);
  });
});
