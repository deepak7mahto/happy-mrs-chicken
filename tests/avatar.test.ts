import { describe, test, expect } from './e2e_runner.mjs';
import { StorageManager } from '../src/engine/StorageManager';
import { GameEngine } from '../src/engine/GameEngine';
import { soundEngine } from '../src/engine/SoundEngine';
import { AVATAR_ROSTER, CharacterId } from '../src/types/characters';
import { CHARACTER_RENDERERS, renderCharacter } from '../src/graphics/characters';
import { ACCESSORIES_CATALOG, CHARACTER_ANCHORS, DEFAULT_UNLOCKED_ACCESSORIES } from '../src/types/accessories';

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

  test('T8.07: ACCESSORIES_CATALOG defines 10 accessories with valid slots, descriptions, and default unlocks', () => {
    expect(ACCESSORIES_CATALOG.length).toBe(10);
    const validSlots = ['head', 'face', 'back', 'feet'];

    for (const acc of ACCESSORIES_CATALOG) {
      expect(acc.id.length).toBeGreaterThan(0);
      expect(acc.name.length).toBeGreaterThan(0);
      expect(acc.emoji.length).toBeGreaterThan(0);
      expect(acc.description.length).toBeGreaterThan(0);
      expect(validSlots.includes(acc.slot)).toBe(true);
    }

    expect(DEFAULT_UNLOCKED_ACCESSORIES.length).toBe(3);
    expect(DEFAULT_UNLOCKED_ACCESSORIES.includes('partyCone')).toBe(true);
    expect(DEFAULT_UNLOCKED_ACCESSORIES.includes('flowerWreath')).toBe(true);
    expect(DEFAULT_UNLOCKED_ACCESSORIES.includes('sparkleGlasses')).toBe(true);
  });

  test('T8.08: CHARACTER_ANCHORS defines anchor positions (head, face, back, feet) for all 15 characters', () => {
    const expectedIds: CharacterId[] = [
      'peppa', 'george', 'daddyPig', 'mummyPig', 'grandpaPig', 'suzySheep',
      'trishu', 'leo', 'dad', 'mom', 'grandpa', 'mimi',
      'chicken', 'chick', 'duck'
    ];

    for (const id of expectedIds) {
      const anchor = CHARACTER_ANCHORS[id];
      expect(Boolean(anchor)).toBe(true);
      expect(typeof anchor.head.x).toBe('number');
      expect(typeof anchor.head.y).toBe('number');
      expect(anchor.head.scale).toBeGreaterThan(0);

      expect(typeof anchor.face.x).toBe('number');
      expect(typeof anchor.face.y).toBe('number');

      expect(typeof anchor.back.x).toBe('number');
      expect(typeof anchor.back.y).toBe('number');

      expect(typeof anchor.feet.x).toBe('number');
      expect(typeof anchor.feet.y).toBe('number');
    }
  });

  test('T8.09: StorageManager equips, unequips, and persists accessories across slots', () => {
    const storage = new StorageManager();
    storage.resetAll();

    // Starter accessories are unlocked
    expect(storage.isAccessoryUnlocked('partyCone')).toBe(true);
    expect(storage.isAccessoryUnlocked('flowerWreath')).toBe(true);
    expect(storage.isAccessoryUnlocked('sparkleGlasses')).toBe(true);
    expect(storage.isAccessoryUnlocked('crown')).toBe(false);

    // Equip party cone
    storage.equipAccessory('partyCone', 'head');
    expect(storage.getEquippedAccessory('head')).toBe('partyCone');

    // Equip glasses
    storage.equipAccessory('sparkleGlasses', 'face');
    expect(storage.getEquippedAccessory('face')).toBe('sparkleGlasses');

    const equipped = storage.getEquippedAccessories();
    expect(equipped.head).toBe('partyCone');
    expect(equipped.face).toBe('sparkleGlasses');

    // Unequip
    storage.unequipAccessory('head');
    expect(storage.getEquippedAccessory('head')).toBe('none');
    expect(storage.getEquippedAccessory('face')).toBe('sparkleGlasses');

    // Unlock crown and equip
    const unlocked = storage.unlockAccessory('crown');
    expect(unlocked).toBe(true);
    expect(storage.isAccessoryUnlocked('crown')).toBe(true);
    storage.equipAccessory('crown', 'head');
    expect(storage.getEquippedAccessory('head')).toBe('crown');
  });

  test('T8.10: renderCharacter layers accessories (cape behind, hats/glasses/boots in front) and auras without throwing', () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    for (const item of AVATAR_ROSTER) {
      expect(() => {
        renderCharacter(item.id, ctx, 80, 80, 0.8, {
          accessories: {
            head: 'crown',
            face: 'sparkleGlasses',
            back: 'superCape',
            feet: 'goldenWellies'
          },
          aura: 'rainbow',
          pointerGaze: { x: 0.5, y: -0.3 },
          time: 1.5
        });
      }).not.toThrow();
    }
  });

  test('T8.11: Story Mode stop completion awards unlocked accessories', () => {
    const storage = new StorageManager();
    storage.resetAll();

    // Stop index 1 is Puddle Splash Adventure -> unlocks goldenWellies
    expect(storage.isAccessoryUnlocked('goldenWellies')).toBe(false);
    const res = storage.completeStoryStop(1, 100, 3);
    expect(storage.isAccessoryUnlocked('goldenWellies')).toBe(true);
    expect(res.unlockedAccessory).toBe('Golden Wellies');
    storage.resetAll();
  });
});
