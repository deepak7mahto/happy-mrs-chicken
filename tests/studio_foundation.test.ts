import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { StudioStorage } from '../src/games/studio/studioStorage.js';
import { soundEngine } from '../src/engine/audio/index.js';

describe('Studio Foundation & Audio Recipes', () => {
  it('StudioStorage saves and loads stickers for a scenic background', () => {
    const sceneId = 'farm';
    const sampleStickers = [
      { uid: 's1', id: 'clucky', x: 200, y: 300, scale: 1.0, rotation: 0, z: 1, wiggleTimer: 0 }
    ];
    StudioStorage.saveStickers(sceneId, sampleStickers);
    const loaded = StudioStorage.loadStickers(sceneId);
    assert.equal(loaded.length, 1);
    assert.equal(loaded[0].id, 'clucky');
  });

  it('StudioStorage saves and loads coloring sheet state', () => {
    const sheetId = 'clucky_nest';
    const sampleData = {
      filledRegions: { 'r1': '#FF4B4B' },
      strokes: [{ color: '#4B88FF', points: [{ x: 10, y: 20 }], width: 8 }]
    };
    StudioStorage.saveColoring(sheetId, sampleData);
    const loaded = StudioStorage.loadColoring(sheetId);
    assert.equal(loaded.filledRegions['r1'], '#FF4B4B');
    assert.equal(loaded.strokes.length, 1);
  });

  it('SoundEngine synthesizes studio audio recipes without throwing', () => {
    assert.doesNotThrow(() => soundEngine.playSFX('stickerPop'));
    assert.doesNotThrow(() => soundEngine.playSFX('crayonScribble'));
    assert.doesNotThrow(() => soundEngine.playSFX('magicChime'));
    assert.doesNotThrow(() => soundEngine.playSFX('cameraShutter'));
  });
});
