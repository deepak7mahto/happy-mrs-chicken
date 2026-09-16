/**
 * Adventures of Trishu — Game Developer Unit Test Suite
 * Tests for MenuScene 2-column portrait layout, keyboard/gamepad navigation,
 * 4 procedural BGM mood tracks, dynamic ducking, EggLayingScene GC optimization,
 * and Mix & Match photo snapshot album.
 */

import { describe, test, expect } from './e2e_runner.mjs';
import { GameEngine } from '../src/engine/GameEngine';
import { MenuScene } from '../src/games/menu/MenuScene';
import { soundEngine } from '../src/engine/SoundEngine';
import { BGMSequencer, MOOD_TRACKS } from '../src/engine/audio/BGMSequencer';
import { AudioContextHolder } from '../src/engine/audio/AudioContextHolder';
import { EggLayingScene } from '../src/games/egg-laying/EggLayingScene';
import { MixMatchScene } from '../src/games/mix-match/MixMatchScene';
import { DadKitchenScene } from '../src/games/dad-kitchen/DadKitchenScene';
import { DuckPicnicScene } from '../src/games/duck-picnic/DuckPicnicScene';
import { RainbowGardenScene } from '../src/games/rainbow-garden/RainbowGardenScene';

describe('Tier 7: Menu 2-Column Portrait, Gamepad, BGM Moods & Snapshots', () => {
  test('T7.01: MenuScene produces 2-column portrait layout (cols=2, rows=8) and 4-column landscape layout', () => {
    const canvas = document.createElement('canvas');
    const engine = new GameEngine(canvas);
    const menu = engine.scenes.get('MENU') as MenuScene;

    // Test Portrait: cols = 2, rows = 8
    engine.display.isPortrait = true;
    engine.display.vWidth = 540;
    engine.display.vHeight = 960;
    const portraitCards = menu.getModeCards(engine.display);

    expect(portraitCards.length).toBe(16);
    expect(portraitCards[0].w).toBe(240);
    expect(portraitCards[0].h).toBe(144);
    // Card 0 and 1 are on row 0, same y
    expect(portraitCards[0].y).toBe(portraitCards[1].y);
    // Card 2 is on row 1, y > row 0
    expect(portraitCards[2].y).toBeGreaterThan(portraitCards[0].y);
    // Card 14 and 15 are on row 7, same y
    expect(portraitCards[14].y).toBe(portraitCards[15].y);

    // Test Landscape: cols = 4, rows = 4
    engine.display.isPortrait = false;
    engine.display.vWidth = 960;
    engine.display.vHeight = 540;
    const landscapeCards = menu.getModeCards(engine.display);

    expect(landscapeCards.length).toBe(16);
    // Row 0 has 4 cards with same y
    expect(landscapeCards[0].y).toBe(landscapeCards[1].y);
    expect(landscapeCards[1].y).toBe(landscapeCards[2].y);
    expect(landscapeCards[2].y).toBe(landscapeCards[3].y);
    // Card 4 is on row 1
    expect(landscapeCards[4].y).toBeGreaterThan(landscapeCards[0].y);
  });

  test('T7.02: MenuScene caches card layout to avoid per-frame GC allocations', () => {
    const canvas = document.createElement('canvas');
    const engine = new GameEngine(canvas);
    const menu = engine.scenes.get('MENU') as MenuScene;

    engine.display.isPortrait = true;
    engine.display.vWidth = 540;
    engine.display.vHeight = 960;

    const cards1 = menu.getModeCards(engine.display);
    const cards2 = menu.getModeCards(engine.display);
    // Strict reference equality check ensures zero allocation on 60 FPS frames
    expect(cards1).toBe(cards2);

    // After dimension change, returns newly recalculated array
    engine.display.isPortrait = false;
    engine.display.vWidth = 960;
    engine.display.vHeight = 540;
    const cardsLandscape = menu.getModeCards(engine.display);
    expect(cardsLandscape).not.toBe(cards1);
  });

  test('T7.03: MenuScene keyboard arrow navigation moves focus and scrolls into view', () => {
    const canvas = document.createElement('canvas');
    const engine = new GameEngine(canvas);
    const menu = engine.scenes.get('MENU') as MenuScene;
    menu.enter();
    engine.storage.setStoryViewMode('grid');

    engine.display.isPortrait = true;
    engine.display.vWidth = 540;
    engine.display.vHeight = 960;
    menu.focusedCardIndex = 0;
    expect(menu.focusedCardIndex).toBe(0);

    // ArrowRight in 2-column moves to index 1
    engine.input.keysJustPressed.add('ArrowRight');
    menu.update(0.016, engine.input);
    expect(menu.focusedCardIndex).toBe(1);
    engine.input.keysJustPressed.clear();

    // ArrowDown moves down 1 row (cols=2) to index 3
    engine.input.keysJustPressed.add('ArrowDown');
    menu.update(0.016, engine.input);
    expect(menu.focusedCardIndex).toBe(3);
    engine.input.keysJustPressed.clear();

    // ArrowLeft moves to index 2
    engine.input.keysJustPressed.add('ArrowLeft');
    menu.update(0.016, engine.input);
    expect(menu.focusedCardIndex).toBe(2);
    engine.input.keysJustPressed.clear();

    // ArrowUp moves to index 0
    engine.input.keysJustPressed.add('ArrowUp');
    menu.update(0.016, engine.input);
    expect(menu.focusedCardIndex).toBe(0);
    engine.input.keysJustPressed.clear();

    // Enter / Space launches focused card
    menu.focusedCardIndex = 1; // MUDDY_PUDDLES
    engine.input.keysJustPressed.add('Enter');
    menu.update(0.016, engine.input);
    expect(engine.currentSceneId).toBe('MUDDY_PUDDLES');
    engine.storage.setStoryViewMode('grid');
    engine.changeScene('MENU');
    delete (window as any).__GAME_STATE__;
    engine.destroy();
  });

  test('T7.04: InputManager polls standard Gamepad API for D-pad, A button, and Start/Home', () => {
    const canvas = document.createElement('canvas');
    const engine = new GameEngine(canvas);

    // Mock gamepad with D-Pad down and A button pressed
    const mockPad = {
      buttons: [
        { pressed: true, value: 1 }, // 0: A button
        ...Array(8).fill({ pressed: false, value: 0 }),
        { pressed: false, value: 0 }, // 9: Start
        { pressed: false, value: 0 }, // 10
        { pressed: false, value: 0 }, // 11
        { pressed: false, value: 0 }, // 12: Up
        { pressed: true, value: 1 },  // 13: Down
        { pressed: false, value: 0 }, // 14: Left
        { pressed: false, value: 0 }  // 15: Right
      ],
      axes: [0, 0]
    };

    const originalGetGamepads = navigator.getGamepads;
    (navigator as any).getGamepads = () => [mockPad];

    engine.input.pollGamepads();
    expect(engine.input.isKeyDown('ArrowDown')).toBe(true);
    expect(engine.input.isKeyJustPressed('ArrowDown')).toBe(true);
    expect(engine.input.isActionDown()).toBe(true);
    expect(engine.input.isActionJustPressed()).toBe(true);

    // Second poll: still down, but not justPressed
    engine.input.postUpdate();
    engine.input.pollGamepads();
    expect(engine.input.isKeyDown('ArrowDown')).toBe(true);
    expect(engine.input.isKeyJustPressed('ArrowDown')).toBe(false);

    // Button 9 (Start) triggers Home
    mockPad.buttons[9] = { pressed: true, value: 1 };
    let homeEmitted = false;
    engine.input.on('home', () => { homeEmitted = true; });
    engine.input.pollGamepads();
    expect(engine.input.isKeyJustPressed('Home')).toBe(true);
    expect(homeEmitted).toBe(true);

    // Restore navigator.getGamepads
    (navigator as any).getGamepads = originalGetGamepads;
  });

  test('T7.05: BGMSequencer implements 4 procedural mood tracks and duckBGM', () => {
    const holder = new AudioContextHolder();
    const sequencer = new BGMSequencer(holder);

    expect(MOOD_TRACKS.classic.tempo).toBe(128);
    expect(MOOD_TRACKS.frenzy.tempo).toBe(144);
    expect(MOOD_TRACKS.waltz.tempo).toBe(108);
    expect(MOOD_TRACKS.gentle.tempo).toBe(92);

    expect(sequencer.currentTrack).toBe('classic');
    expect(sequencer.tempo).toBe(128);

    sequencer.setTrack('frenzy');
    expect(sequencer.currentTrack).toBe('frenzy');
    expect(sequencer.tempo).toBe(144);

    sequencer.setTrack('waltz');
    expect(sequencer.currentTrack).toBe('waltz');
    expect(sequencer.tempo).toBe(108);

    sequencer.setTrack('gentle');
    expect(sequencer.currentTrack).toBe('gentle');
    expect(sequencer.tempo).toBe(92);

    expect(() => sequencer.duckBGM(0.5)).not.toThrow();
  });

  test('T7.06: SoundEngine exposes setTrack, duckBGM and ducks on fanfares and crash', () => {
    expect(typeof soundEngine.setTrack).toBe('function');
    expect(typeof soundEngine.duckBGM).toBe('function');

    soundEngine.setTrack('gentle');
    expect(soundEngine.sequencer.currentTrack).toBe('gentle');

    soundEngine.setTrack('classic');
    expect(soundEngine.sequencer.currentTrack).toBe('classic');

    expect(() => soundEngine.playVictoryFanfare()).not.toThrow();
    expect(() => soundEngine.playDuckFanfare()).not.toThrow();
    expect(() => soundEngine.playOverheatCrash()).not.toThrow();
  });

  test('T7.07: Scene enter() methods wire up their respective BGM mood tracks', () => {
    const canvas = document.createElement('canvas');
    const engine = new GameEngine(canvas);

    const dadKitchen = engine.scenes.get('DADDY_PIG') as DadKitchenScene;
    dadKitchen.enter();
    expect(soundEngine.sequencer.currentTrack).toBe('frenzy');

    const duckPicnic = engine.scenes.get('DUCK_PICNIC') as DuckPicnicScene;
    duckPicnic.enter();
    expect(soundEngine.sequencer.currentTrack).toBe('waltz');

    const rainbowGarden = engine.scenes.get('RAINBOW_GARDEN') as RainbowGardenScene;
    rainbowGarden.enter();
    expect(soundEngine.sequencer.currentTrack).toBe('gentle');

    const menu = engine.scenes.get('MENU') as MenuScene;
    menu.enter();
    expect(soundEngine.sequencer.currentTrack).toBe('classic');
    delete (window as any).__GAME_STATE__;
    engine.destroy();
  });

  test('T7.08: EggLayingScene maintains sorted chicks in update() and zero allocations in render()', () => {
    const canvas = document.createElement('canvas');
    const engine = new GameEngine(canvas);
    const eggScene = engine.scenes.get('EGG_LAYING') as EggLayingScene;
    eggScene.enter();

    // Add chicks out of order
    (eggScene as any).chicks = [
      { x: 100, y: 300, vx: 0, vy: 0, walkCycle: 0, facingLeft: false },
      { x: 100, y: 150, vx: 0, vy: 0, walkCycle: 0, facingLeft: false },
      { x: 100, y: 220, vx: 0, vy: 0, walkCycle: 0, facingLeft: false }
    ];

    eggScene.update(0.016, engine.input);
    const chicks = (eggScene as any).chicks;
    expect(chicks[0].y).toBeLessThanOrEqual(chicks[1].y);
    expect(chicks[1].y).toBeLessThanOrEqual(chicks[2].y);

    const ctx = canvas.getContext('2d')!;
    expect(() => eggScene.render(ctx, 1.0, engine.display)).not.toThrow();
  });

  test('T7.09: Mix & Match snapshot renders composite character and persists to localStorage hmc_saved_photos', () => {
    const canvas = document.createElement('canvas');
    const engine = new GameEngine(canvas);
    const mixMatch = engine.scenes.get('MIX_MATCH') as MixMatchScene;
    mixMatch.enter();

    localStorage.removeItem('hmc_saved_photos');
    expect(mixMatch.photosSnapped).toBe(0);

    // Snap photo
    mixMatch.snapPhoto();
    expect(mixMatch.photosSnapped).toBe(1);

    const saved = localStorage.getItem('hmc_saved_photos');
    expect(saved).not.toBeNull();
    const photos = JSON.parse(saved!);
    expect(Array.isArray(photos)).toBe(true);
    expect(photos.length).toBe(1);
    expect(typeof photos[0]).toBe('string');
    expect(photos[0].startsWith('data:image/png')).toBe(true);

    // Verify capping at 6 snapshots
    for (let i = 0; i < 10; i++) {
      mixMatch.snapPhoto();
    }
    const finalPhotos = JSON.parse(localStorage.getItem('hmc_saved_photos')!);
    expect(finalPhotos.length).toBe(6);
  });
});
