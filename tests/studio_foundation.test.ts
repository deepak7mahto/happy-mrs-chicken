import { describe, it, expect } from './e2e_runner.mjs';
import { StudioStorage } from '../src/games/studio/studioStorage.js';
import { soundEngine } from '../src/engine/audio/index.js';

describe('Creative Art Studio: Foundation & Audio Recipes', () => {
  it('T-STU.01: StudioStorage saves and loads stickers for a scenic background', () => {
    const sceneId = 'farm';
    const sampleStickers = [
      { uid: 's1', id: 'clucky', x: 200, y: 300, scale: 1.0, rotation: 0, z: 1, wiggleTimer: 0 }
    ];
    StudioStorage.saveStickers(sceneId, sampleStickers);
    const loaded = StudioStorage.loadStickers(sceneId);
    expect(loaded.length).toBe(1);
    expect(loaded[0].id).toBe('clucky');
  });

  it('T-STU.02: StudioStorage saves and loads coloring sheet state', () => {
    const sheetId = 'clucky_nest';
    const sampleData = {
      filledRegions: { 'r1': '#FF4B4B' },
      strokes: [{ color: '#4B88FF', points: [{ x: 10, y: 20 }], width: 8 }]
    };
    StudioStorage.saveColoring(sheetId, sampleData);
    const loaded = StudioStorage.loadColoring(sheetId);
    expect(loaded.filledRegions['r1']).toBe('#FF4B4B');
    expect(loaded.strokes.length).toBe(1);
  });

  it('T-STU.03: SoundEngine synthesizes studio audio recipes without throwing', () => {
    expect(() => soundEngine.playSFX('stickerPop')).not.toThrow();
    expect(() => soundEngine.playSFX('crayonScribble')).not.toThrow();
    expect(() => soundEngine.playSFX('magicChime')).not.toThrow();
    expect(() => soundEngine.playSFX('cameraShutter')).not.toThrow();
  });
});
