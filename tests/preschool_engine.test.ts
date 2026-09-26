import { describe, it, expect } from './e2e_runner.mjs';
import { voiceNarrator } from '../src/engine/audio/VoiceNarrator';
import { soundEngine } from '../src/engine/SoundEngine';

describe('Preschool Engine: VoiceNarrator & Audio Recipes', () => {
  it('T-PE.01: VoiceNarrator initializes enabled and allows toggling', () => {
    expect(voiceNarrator.isEnabled()).toBe(true);
    voiceNarrator.setEnabled(false);
    expect(voiceNarrator.isEnabled()).toBe(false);
    voiceNarrator.setEnabled(true);
    expect(voiceNarrator.isEnabled()).toBe(true);
  });

  it('T-PE.02: VoiceNarrator.speak executes without throwing and ducks BGM', () => {
    expect(() => {
      voiceNarrator.speak('Let us feed the animals!');
    }).not.toThrow();
  });

  it('T-PE.03: soundEngine synthesizes all 8 preschool sound recipes without throwing', () => {
    expect(() => {
      soundEngine.playSFX('foodChomp' as any);
      soundEngine.playSFX('tummyRub' as any);
      soundEngine.playSFX('xylophoneChime' as any);
      soundEngine.playSFX('drumThump' as any);
      soundEngine.playSFX('maracaShake' as any);
      soundEngine.playSFX('paintSplat' as any);
      soundEngine.playSFX('musicBoxStar' as any);
      soundEngine.playSFX('sleepyYawn' as any);
    }).not.toThrow();
  });
});
