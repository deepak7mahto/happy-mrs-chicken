import { describe, test, expect } from './e2e_runner.mjs';
import { StorageManager } from '../src/engine/StorageManager';
import { GameEngine } from '../src/engine/GameEngine';
import { soundEngine } from '../src/engine/SoundEngine';
import { AVATAR_ROSTER, CharacterId } from '../src/types/characters';
import { CHARACTER_RENDERERS, renderCharacter } from '../src/graphics/characters';

describe('Tier 8: Universal Avatar Selection System & Peppa Roster', () => {
  test('T8.01: AVATAR_ROSTER contains all 15 characters with complete metadata', () => {
    expect(AVATAR_ROSTER.length).toBe(15);
    const expectedIds: CharacterId[] = [
      'peppa', 'george', 'daddyPig', 'mummyPig', 'grandpaPig', 'suzySheep',
      'trishu', 'leo', 'dad', 'mom', 'grandpa', 'mimi',
      'chicken', 'chick', 'duck'
    ];

    for (const id of expectedIds) {
      const found = AVATAR_ROSTER.find(a => a.id === id);
      expect(Boolean(found)).toBe(true);
      expect(found!.name.length).toBeGreaterThan(0);
      expect(found!.emoji.length).toBeGreaterThan(0);
      expect(found!.sound.length).toBeGreaterThan(0);
      expect(['peppa', 'trishu', 'farm'].includes(found!.category)).toBe(true);
    }
  });

  test('T8.02: StorageManager handles avatar persistence and defaults to peppa', () => {
    const storage = new StorageManager();
    expect(storage.getSelectedAvatar()).toBe('peppa');

    storage.setSelectedAvatar('george');
    expect(storage.getSelectedAvatar()).toBe('george');

    storage.setSelectedAvatar('trishu');
    expect(storage.getSelectedAvatar()).toBe('trishu');

    storage.setSelectedAvatar('duck');
    expect(storage.getSelectedAvatar()).toBe('duck');
  });

  test('T8.03: GameEngine exposes selectedAvatar and synchronizes with storage', () => {
    const canvas = document.createElement('canvas');
    const engine = new GameEngine(canvas);

    engine.setSelectedAvatar('daddyPig');
    expect(engine.selectedAvatar).toBe('daddyPig');
    expect(engine.storage.getSelectedAvatar()).toBe('daddyPig');

    engine.setSelectedAvatar('mimi');
    expect(engine.selectedAvatar).toBe('mimi');
  });

  test('T8.04: All 15 characters in CHARACTER_RENDERERS render without throwing', () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    for (const item of AVATAR_ROSTER) {
      expect(typeof CHARACTER_RENDERERS[item.id]).toBe('function');
      expect(() => {
        renderCharacter(item.id, ctx, 100, 100, 1.0, {
          expression: 'excited',
          jumpY: 5,
          squash: 1.1,
          muddyBoots: true,
          holdingDino: true,
          holdingPan: true,
          pulling: true
        });
      }).not.toThrow();
    }
  });

  test('T8.05: SoundEngine plays pigOink sound without throwing', () => {
    expect(() => soundEngine.playPigOink()).not.toThrow();
    expect(() => soundEngine.playSFX('pigOink')).not.toThrow();
  });

  test('T8.06: Mini-game scenes render with chosen selectedAvatar', () => {
    const canvas = document.createElement('canvas');
    const engine = new GameEngine(canvas);
    const ctx = canvas.getContext('2d')!;

    engine.setSelectedAvatar('peppa');

    // Test entering and rendering scenes that use selectedAvatar
    const testScenes = [
      'MUDDY_PUDDLES',
      'WINDY_KITE',
      'HOPSCOTCH_BUBBLE',
      'DINOSAUR_BALLOON',
      'PANCAKE_FLIPPER',
      'VEGETABLE_HARVEST',
      'CAR_WASH',
      'DADDY_PIG',
      'RAINBOW_GARDEN',
      'LITTLE_TRAIN',
      'ICE_CREAM_VAN',
      'EGG_LAYING'
    ] as const;

    for (const sceneId of testScenes) {
      engine.changeScene(sceneId);
      const scene = engine.activeScene!;
      expect(() => scene.render(ctx, 1.0, engine.display)).not.toThrow();
    }
  });
});
