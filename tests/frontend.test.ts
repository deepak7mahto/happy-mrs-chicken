/**
 * Automated Unit & Integration Tests for HUD, Modals, Settings, Deep Linking & Haptics
 * Adventures of Trishu — Frontend Architecture Tests
 */

import { describe, test, expect, beforeEach, afterEach } from './e2e_runner.mjs';
import { resolveHashToModeId } from '../src/App';
import { StorageManager, storageManager } from '../src/engine/StorageManager';
import { Haptics } from '../src/engine/Haptics';
import { GameEngine } from '../src/engine/GameEngine';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('Tier 6: Frontend Architecture, Deep Linking & Controls', () => {
  const root = resolve(process.cwd());

  test('T6.01: resolveHashToModeId resolves slugs and canonical mode hashes', () => {
    // Canonical mode IDs
    expect(resolveHashToModeId('#egg_laying')).toBe('EGG_LAYING');
    expect(resolveHashToModeId('#EGG_LAYING')).toBe('EGG_LAYING');
    expect(resolveHashToModeId('#classic')).toBe('EGG_LAYING');
    expect(resolveHashToModeId('#car-wash')).toBe('CAR_WASH');
    expect(resolveHashToModeId('#car_wash')).toBe('CAR_WASH');
    expect(resolveHashToModeId('#duck-picnic')).toBe('DUCK_PICNIC');
    expect(resolveHashToModeId('#duck_picnic')).toBe('DUCK_PICNIC');
    expect(resolveHashToModeId('#dinosaur_balloon')).toBe('DINOSAUR_BALLOON');
    expect(resolveHashToModeId('#balloon-pop')).toBe('DINOSAUR_BALLOON');
    expect(resolveHashToModeId('#muddy_puddles')).toBe('MUDDY_PUDDLES');
    expect(resolveHashToModeId('#mud-puddle')).toBe('MUDDY_PUDDLES');
    expect(resolveHashToModeId('#seed-sort')).toBe('CHICK_MAZE');
    expect(resolveHashToModeId('#dino-maze')).toBe('DADDY_PIG');
    expect(resolveHashToModeId('#pancake-flip')).toBe('PANCAKE_FLIPPER');
    expect(resolveHashToModeId('#egg-tap')).toBe('VEGETABLE_HARVEST');
    expect(resolveHashToModeId('#chick-catch')).toBe('HOPSCOTCH_BUBBLE');
    expect(resolveHashToModeId('#mix-match')).toBe('MIX_MATCH');
    expect(resolveHashToModeId('#peek-a-boo')).toBe('PEEK_A_BOO');
    expect(resolveHashToModeId('#ice-cream-van')).toBe('ICE_CREAM_VAN');
    expect(resolveHashToModeId('#little-train')).toBe('LITTLE_TRAIN');
    expect(resolveHashToModeId('#windy-kite')).toBe('WINDY_KITE');
    expect(resolveHashToModeId('#rainbow-garden')).toBe('RAINBOW_GARDEN');

    // Stripped forms
    expect(resolveHashToModeId('#egglaying')).toBe('EGG_LAYING');
    expect(resolveHashToModeId('#muddypuddles')).toBe('MUDDY_PUDDLES');
    expect(resolveHashToModeId('#muddycarwash')).toBe('CAR_WASH');

    // Invalid or Menu
    expect(resolveHashToModeId('')).toBe(null);
    expect(resolveHashToModeId('#menu')).toBe(null);
    expect(resolveHashToModeId('#MENU')).toBe(null);
    expect(resolveHashToModeId('#unknown_game_xyz')).toBe(null);
  });

  test('T6.02: StorageManager handles BGM, SFX, Toddler Lock and Haptics settings', () => {
    const storage = new StorageManager();

    // Default settings
    expect(storage.getBgmVolume()).toBeGreaterThan(0);
    expect(storage.getSfxVolume()).toBeGreaterThan(0);
    expect(storage.isHapticsEnabled()).toBe(true);
    expect(storage.isToddlerLockEnabled()).toBe(false);

    // Set BGM volume
    storage.setBgmVolume(0.45);
    expect(storage.getBgmVolume()).toBe(0.45);

    // Set SFX volume
    storage.setSfxVolume(0.8);
    expect(storage.getSfxVolume()).toBe(0.8);

    // Toggle Haptics
    storage.setHapticsEnabled(false);
    expect(storage.isHapticsEnabled()).toBe(false);
    storage.setHapticsEnabled(true);
    expect(storage.isHapticsEnabled()).toBe(true);

    // Toggle Toddler Lock
    storage.setToddlerLockEnabled(true);
    expect(storage.isToddlerLockEnabled()).toBe(true);
    storage.setToddlerLockEnabled(false);
    expect(storage.isToddlerLockEnabled()).toBe(false);

    // Reset High Scores
    storage.saveHighScore('eggLaying', 100);
    expect(storage.getHighScore('eggLaying')).toBe(100);
    storage.resetHighScores();
    expect(storage.getHighScore('eggLaying')).toBe(0);
  });

  test('T6.03: Haptics checks storageManager.data.settings.hapticsEnabled', () => {
    let vibrateCount = 0;
    const origVibrate = navigator.vibrate;
    (navigator as any).vibrate = () => {
      vibrateCount++;
      return true;
    };

    try {
      // With haptics enabled
      storageManager.setHapticsEnabled(true);
      vibrateCount = 0;
      Haptics.tap();
      expect(vibrateCount).toBe(1);

      Haptics.medium();
      expect(vibrateCount).toBe(2);

      Haptics.heavy();
      expect(vibrateCount).toBe(3);

      Haptics.fanfare();
      expect(vibrateCount).toBe(4);

      // With haptics disabled
      storageManager.setHapticsEnabled(false);
      vibrateCount = 0;
      Haptics.tap();
      Haptics.medium();
      Haptics.heavy();
      Haptics.fanfare();
      expect(vibrateCount).toBe(0);
    } finally {
      (navigator as any).vibrate = origVibrate;
      storageManager.setHapticsEnabled(true);
    }
  });

  test('T6.04: GameEngine modesAvailable returns all 16 mode IDs', () => {
    const canvas = document.createElement('canvas');
    const engine = new GameEngine(canvas);
    engine.setupIntrospectionHooks();

    const gameState = (window as any).__GAME_STATE__;
    expect(gameState).toBeDefined();
    const modes = gameState.modesAvailable;
    expect(modes.length).toBe(16);

    const expectedModes = [
      'EGG_LAYING',
      'MUDDY_PUDDLES',
      'CHICK_MAZE',
      'DADDY_PIG',
      'DINOSAUR_BALLOON',
      'PANCAKE_FLIPPER',
      'VEGETABLE_HARVEST',
      'HOPSCOTCH_BUBBLE',
      'MIX_MATCH',
      'PEEK_A_BOO',
      'ICE_CREAM_VAN',
      'LITTLE_TRAIN',
      'CAR_WASH',
      'WINDY_KITE',
      'RAINBOW_GARDEN',
      'DUCK_PICNIC'
    ];

    for (const m of expectedModes) {
      expect(modes.includes(m)).toBe(true);
    }
  });

  test('T6.05: manifest.json contains 16-game description and valid shortcut hashes', () => {
    const manifestPath = resolve(root, 'public/manifest.json');
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));

    expect(manifest.description).toContain('16-game');
    expect(manifest.shortcuts.length).toBeGreaterThanOrEqual(4);

    const shortcutUrls = manifest.shortcuts.map((s: any) => s.url);
    expect(shortcutUrls.some((u: string) => u.includes('#egg_laying'))).toBe(true);
    expect(shortcutUrls.some((u: string) => u.includes('#dinosaur_balloon'))).toBe(true);
    expect(shortcutUrls.some((u: string) => u.includes('#muddy_puddles'))).toBe(true);
    expect(shortcutUrls.some((u: string) => u.includes('#car_wash'))).toBe(true);
  });

  test('T6.06: hud.css defines all required CSS classes for tactile UI', () => {
    const cssPath = resolve(root, 'src/styles/hud.css');
    const css = readFileSync(cssPath, 'utf8');

    const requiredClasses = [
      '.modal-backdrop',
      '.modal-card',
      '.offline-pill',
      '.update-toast',
      '.tap-feedback-overlay',
      '.tap-feedback-emoji',
      '.settings-modal',
      '.volume-slider',
      '.hud-btn-settings',
      '.toddler-lock-progress'
    ];

    for (const cls of requiredClasses) {
      expect(css.includes(cls)).toBe(true);
    }
  });
});
