import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { setupMockEnvironment } from './e2e_runner.mjs';
import { GameEngine } from '../src/engine/GameEngine.js';
import { StudioScene } from '../src/games/studio/StudioScene.js';

setupMockEnvironment();

describe('Studio Scene Integration', () => {
  it('StudioScene switches between sticker and coloring tabs', () => {
    const engine = {
      display: { vWidth: 960, vHeight: 540 },
      storage: { get: () => null, set: () => {} }
    } as any;
    const studio = new StudioScene(engine);
    assert.equal(studio.activeTab, 'stickers');
    studio.switchTab('coloring');
    assert.equal(studio.activeTab, 'coloring');
    studio.switchTab('stickers');
    assert.equal(studio.activeTab, 'stickers');
  });

  it('GameEngine registers STUDIO scene in its scene map', () => {
    const canvas = document.createElement('canvas');
    const engine = new GameEngine(canvas);
    const studio = engine.scenes.get('STUDIO');
    assert.ok(studio);
    assert.ok(studio instanceof StudioScene);
  });
});
