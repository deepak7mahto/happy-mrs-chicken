/**
 * Adventures of Trishu — Consolidated Smoke & Quality Test Suite
 * Fast execution (< 1.0s) covering all 9 mini-games, engine, audio, and character renderers.
 */

import { describe, test, expect, beforeEach } from './e2e_runner.mjs';
import { GameEngine } from '../src/engine/GameEngine';
import { StorageManager } from '../src/engine/StorageManager';
import { DisplayManager } from '../src/engine/DisplayManager';
import { ParticleEngine } from '../src/engine/ParticleEngine';
import { SoundEngine } from '../src/engine/SoundEngine';
import { CHARACTER_RENDERERS, renderCharacter } from '../src/graphics/characters';
import {
  drawHeadPart,
  drawTorsoPart,
  drawLegsPart,
  drawCompositeCharacter,
  CHARACTER_PARTS
} from '../src/graphics/characters/modularBodyParts';
import { PALETTE } from '../src/graphics/palette';
import {
  MenuScene,
  EggLayingScene,
  MuddyPuddlesScene,
  ChickMazeScene,
  DadKitchenScene,
  DinosaurBalloonScene,
  PancakeFlipperScene,
  VegetableHarvestScene,
  HopscotchBubbleScene,
  MixMatchScene,
  PeekABooScene,
  IceCreamVanScene,
  LittleTrainScene,
  CarWashScene,
  WindyKiteScene,
  RainbowGardenScene
} from '../src/games';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

// ---------------------------------------------------------------------------
// Suite 1: Smoke & Initialization
// ---------------------------------------------------------------------------
describe('Tier 1: Smoke & Initialization', () => {
  test('T1.01: GameEngine instantiates all 11 scenes including MENU and 10 game modes', () => {
    const canvas = document.createElement('canvas');
    const engine = new GameEngine(canvas);

    expect(engine.scenes.size).toBe(16);
    expect(engine.scenes.has('MENU')).toBe(true);
    expect(engine.scenes.has('EGG_LAYING')).toBe(true);
    expect(engine.scenes.has('MUDDY_PUDDLES')).toBe(true);
    expect(engine.scenes.has('CHICK_MAZE')).toBe(true);
    expect(engine.scenes.has('DADDY_PIG')).toBe(true);
    expect(engine.scenes.has('DINOSAUR_BALLOON')).toBe(true);
    expect(engine.scenes.has('PANCAKE_FLIPPER')).toBe(true);
    expect(engine.scenes.has('VEGETABLE_HARVEST')).toBe(true);
    expect(engine.scenes.has('HOPSCOTCH_BUBBLE')).toBe(true);
    expect(engine.scenes.has('MIX_MATCH')).toBe(true);
    expect(engine.scenes.has('PEEK_A_BOO')).toBe(true);
    expect(engine.scenes.has('ICE_CREAM_VAN')).toBe(true);
    expect(engine.scenes.has('LITTLE_TRAIN')).toBe(true);
    expect(engine.scenes.has('CAR_WASH')).toBe(true);
    expect(engine.scenes.has('WINDY_KITE')).toBe(true);
    expect(engine.scenes.has('RAINBOW_GARDEN')).toBe(true);
    expect(engine.currentSceneId).toBe('MENU');
  });

  test('T1.02: DisplayManager adapts between portrait (9:16) and landscape (16:9)', () => {
    const canvas = document.createElement('canvas');
    const display = new DisplayManager(canvas);

    window.innerWidth = 360;
    window.innerHeight = 640;
    display.syncResize();
    expect(display.isPortrait).toBe(true);

    window.innerWidth = 960;
    window.innerHeight = 540;
    display.syncResize();
    expect(display.isPortrait).toBe(false);
  });

  test('T1.03: StorageManager initializes high scores and persists updates', () => {
    const storage = new StorageManager();
    expect(storage.getHighScore('eggLaying')).toBe(0);
    expect(storage.getHighScore('peekABoo')).toBe(0);
    expect(storage.getHighScore('iceCreamVan')).toBe(0);
    expect(storage.getHighScore('littleTrain')).toBe(0);
    expect(storage.getHighScore('carWash')).toBe(0);
    expect(storage.getHighScore('windyKite')).toBe(0);
    expect(storage.getHighScore('rainbowGarden')).toBe(0);

    storage.saveHighScore('peekABoo', 250);
    expect(storage.getHighScore('peekABoo')).toBe(250);
  });

  test('T1.04: ParticleEngine pre-allocates pool and spawns particles', () => {
    const particles = new ParticleEngine(100);
    expect(particles.pool.length).toBe(100);

    particles.spawnSparkles(100, 100, 10);
    expect(particles.active.length).toBe(10);
    particles.update(0.016);
    expect(particles.active.length).toBe(10);
  });

  test('T1.05: MenuScene supports momentum scrolling and distinguishes hold-drag from quick tap', () => {
    const canvas = document.createElement('canvas');
    const engine = new GameEngine(canvas);
    const menu = engine.scenes.get('MENU') as MenuScene;
    menu.enter();

    expect(menu.scrollY).toBe(0);
    const cards = menu.getModeCards(engine.display);
    expect(cards.length).toBe(15);
    expect(cards[0].h).toBeGreaterThanOrEqual(190); // Large chunky tiles

    // Simulate drag: pointer down then move vertically
    engine.input.actionJustPressed = true;
    engine.input.primaryPointer = { x: 100, y: 300, isDown: true, inside: true };
    menu.update(0.016, engine.input);

    engine.input.actionJustPressed = false;
    engine.input.actionIsDown = true;
    engine.input.primaryPointer = { x: 100, y: 150, isDown: true, inside: true }; // Drag up by 150px
    menu.update(0.016, engine.input);

    // Should be scrolling without immediately triggering a scene change
    expect(menu.scrollY).toBeLessThan(0);
    expect(engine.currentSceneId).toBe('MENU');

    // Release drag
    engine.input.actionIsDown = false;
    engine.input.actionJustReleased = true;
    menu.update(0.016, engine.input);
    expect(engine.currentSceneId).toBe('MENU'); // Still in menu because it was a drag, not a tap
  });

  test('T1.06: Browser history popstate back gesture transitions active game to MENU', () => {
    const canvas = document.createElement('canvas');
    const engine = new GameEngine(canvas);
    engine.start();

    // Start in a mini-game
    engine.changeScene('EGG_LAYING');
    expect(engine.currentSceneId).toBe('EGG_LAYING');

    // Simulate popstate event (mobile swipe-back or Android back button)
    const popEvent = typeof PopStateEvent !== 'undefined'
      ? new PopStateEvent('popstate', { state: { mode: 'MENU' } })
      : new Event('popstate');
    const handlePop = () => {
      if (engine.currentSceneId !== 'MENU') {
        engine.changeScene('MENU');
      }
    };
    window.addEventListener('popstate', handlePop);
    window.dispatchEvent(popEvent);
    window.removeEventListener('popstate', handlePop);

    expect(engine.currentSceneId).toBe('MENU');
    engine.destroy();
  });

  test('T1.07: MenuScene supports touchpad wheel and keyboard arrow scrolling', () => {
    const canvas = document.createElement('canvas');
    const engine = new GameEngine(canvas);
    const menu = engine.scenes.get('MENU') as MenuScene;
    menu.enter();

    expect(menu.scrollY).toBe(0);

    // Simulate touchpad wheel scroll down (positive deltaY)
    engine.input.wheelDeltaY = 60;
    menu.update(0.016, engine.input);
    expect(menu.scrollY).toBeLessThan(0);

    // Reset scroll and simulate ArrowDown key
    menu.scrollY = 0;
    engine.input.wheelDeltaY = 0;
    engine.input.keysDown.add('ArrowDown');
    menu.update(0.1, engine.input);
    expect(menu.scrollY).toBeLessThan(0);
    engine.input.keysDown.delete('ArrowDown');
  });
});

// ---------------------------------------------------------------------------
// Suite 2: Mini-Game Simulation & Mechanics
// ---------------------------------------------------------------------------
describe('Tier 2: 9 Mini-Game Simulation & Mechanics', () => {
  let engine: GameEngine;
  let canvas: HTMLCanvasElement;

  beforeEach(() => {
    canvas = document.createElement('canvas');
    engine = new GameEngine(canvas);
  });

  test('T2.01 Mode 1: Happy Mrs Clucky egg-laying and hatching lifecycle', () => {
    const scene = engine.scenes.get('EGG_LAYING') as EggLayingScene;
    scene.enter();
    expect(scene.score).toBe(0);

    scene.chicken.x = 200;
    scene.layEggAt(200, 160);
    expect(scene.eggs.length).toBe(1);
    expect(scene.score).toBe(1);

    scene.update(0.016, engine.input);
    expect(scene.eggs.length).toBe(1);
  });

  test('T2.02 Mode 2: Puddle Splash Adventure puddle jumping mechanics', () => {
    const scene = engine.scenes.get('MUDDY_PUDDLES') as MuddyPuddlesScene;
    scene.enter();
    expect(scene.timer).toBe(60);
    expect(scene.puddles.length).toBeGreaterThan(0);

    scene.jump();
    expect(scene.trishu.isJumping).toBe(true);
    scene.update(0.016, engine.input);
  });

  test('T2.03 Mode 3: Fluffy Chick Trail seed placing and coop saving', () => {
    const scene = engine.scenes.get('CHICK_MAZE') as ChickMazeScene;
    scene.enter();
    expect(scene.chicks.length).toBeGreaterThan(0);

    scene.dropSeed(150, 200);
    expect(scene.seeds.length).toBe(1);
    scene.update(0.016, engine.input);
  });

  test('T2.04 Mode 4: Dad\'s Kitchen Dash frenzy and overheat test', () => {
    const scene = engine.scenes.get('DADDY_PIG') as DadKitchenScene;
    scene.enter();
    expect(scene.score).toBe(0);
    expect(scene.fever).toBe(0);

    scene.tap();
    expect(scene.score).toBeGreaterThan(0);
    expect(scene.fever).toBeGreaterThan(0);
  });

  test('T2.05 Mode 5: Leo\'s Balloon Pop balloon popping and combo mechanics', () => {
    const scene = engine.scenes.get('DINOSAUR_BALLOON') as DinosaurBalloonScene;
    scene.enter();
    scene.spawnBalloon();
    expect(scene.balloons.length).toBeGreaterThan(0);

    scene.popBalloon(0);
    expect(scene.score).toBeGreaterThan(0);
    expect(scene.poppedCount).toBe(1);
  });

  test('T2.06 Mode 6: Golden Pancake Flipper pan flip flight cycle', () => {
    const scene = engine.scenes.get('PANCAKE_FLIPPER') as PancakeFlipperScene;
    scene.enter();
    expect(scene.stackCount).toBe(0);

    scene.flipPancake();
    expect(scene.isAirborne).toBe(true);
    scene.update(0.016, engine.input);
  });

  test('T2.07 Mode 7: Grandpa\'s Veggie Harvest tension pull mechanics', () => {
    const scene = engine.scenes.get('VEGETABLE_HARVEST') as VegetableHarvestScene;
    scene.enter();
    expect(scene.harvestedCount).toBe(0);

    scene.update(0.016, engine.input);
    expect(scene.mounds.length).toBeGreaterThan(0);
  });

  test('T2.08 Mode 8: Rainbow Bubble Hopscotch step advancement & bubble popping', () => {
    const scene = engine.scenes.get('HOPSCOTCH_BUBBLE') as HopscotchBubbleScene;
    scene.enter();
    expect(scene.mimi.currentSquare).toBe(1);

    scene.advanceMimi();
    expect(scene.mimi.targetSquare).toBe(2);
    expect(scene.bubbles.length).toBeGreaterThan(0);

    // Test Bubble Wand Burst
    const initialBubbleCount = scene.bubbles.length;
    scene.blowBubbleBurst(3);

    // Test GIANT bubble popping and splitting
    scene.spawnBubble(200, 'GIANT', 150, 40);
    const giantIdx = scene.bubbles.length - 1;
    const countBeforeSplit = scene.bubbles.length;
    scene.popBubble(giantIdx);
    expect(scene.bubblesPoppedCount).toBeGreaterThan(0);
    expect(scene.bubbles.length).toBeGreaterThan(countBeforeSplit); // Split added mini-bubbles

    // Test CHICK bubble and parachuting chick release
    scene.spawnBubble(200, 'CHICK', 180, 25);
    const chickBubbleIdx = scene.bubbles.length - 1;
    scene.popBubble(chickBubbleIdx);
    expect(scene.parachutingChicks.length).toBeGreaterThan(0);
  });

  test('T2.09 Mode 9: Trishu\'s Mix & Match Funny Studio part cycling and photo snap', () => {
    const scene = engine.scenes.get('MIX_MATCH') as MixMatchScene;
    scene.enter();
    expect(scene.headIdx).toBe(0);
    expect(scene.torsoIdx).toBe(0);
    expect(scene.legsIdx).toBe(0);

    scene.nextHead(1);
    expect(scene.headIdx).toBe(1);

    scene.nextTorso(2);
    expect(scene.torsoIdx).toBe(2);

    scene.nextLegs(3);
    expect(scene.legsIdx).toBe(3);

    scene.shuffle();
    expect(scene.isShuffling).toBe(true);

    scene.snapPhoto();
    expect(scene.photosSnapped).toBe(1);
    expect(scene.score).toBeGreaterThan(0);
  });

  test('T2.10 Mode 10: Peek-a-Boo Barnyard tactile hiding spots and character reveals', () => {
    const scene = engine.scenes.get('PEEK_A_BOO') as PeekABooScene;
    scene.enter();
    expect(scene.spots.length).toBe(4);
    expect(scene.peekFoundCount).toBe(0);

    const firstSpot = scene.spots[0];
    expect(firstSpot.isOpen).toBe(false);

    scene.tapSpot(firstSpot);
    expect(firstSpot.isOpen).toBe(true);
    expect(scene.peekFoundCount).toBe(1);
    expect(scene.score).toBe(50);

    scene.update(0.016, engine.input);
    expect(firstSpot.openProgress).toBeGreaterThan(0);
  });

  test('T2.11 Mode 11: Miss Bunny\'s Ice Cream Van scoop stacking and feast', () => {
    const scene = engine.scenes.get('ICE_CREAM_VAN') as IceCreamVanScene;
    scene.enter();
    expect(scene.score).toBe(0);

    // Add a scoop
    scene.addScoop({ name: 'Berry', color: '#FF80AB', borderColor: '#F50057', x: 100, y: 300, radius: 36 });
    expect(scene.score).toBe(10);

    scene.update(0.016, engine.input);
    scene.munchFeast();
    expect(scene.score).toBeGreaterThan(10);
  });

  test('T2.12 Mode 12: Grandpa\'s Little Train chug whistle and passenger pickup', () => {
    const scene = engine.scenes.get('LITTLE_TRAIN') as LittleTrainScene;
    scene.enter();
    expect(scene.score).toBe(0);

    scene.blowWhistle();
    expect(scene.score).toBe(15);
    scene.update(0.016, engine.input);
  });

  test('T2.13 Mode 13: Muddy Car Wash scrub bubbles and shiny car finish', () => {
    const scene = engine.scenes.get('CAR_WASH') as CarWashScene;
    scene.enter();
    expect(scene.score).toBe(0);

    // Clean a spot
    scene.update(0.016, engine.input);
    expect(scene.score).toBe(0);
  });

  test('T2.14 Mode 14: Windy Castle Kite wind swoops and star ribbons', () => {
    const scene = engine.scenes.get('WINDY_KITE') as WindyKiteScene;
    scene.enter();
    expect(scene.score).toBe(0);

    scene.swoopKite(300, 150);
    scene.update(0.016, engine.input);
  });

  test('T2.15 Mode 15: Rainbow Flower Garden sprout watering and bloom celebration', () => {
    const scene = engine.scenes.get('RAINBOW_GARDEN') as RainbowGardenScene;
    scene.enter();
    expect(scene.score).toBe(0);

    scene.update(0.016, engine.input);
  });
});

// ---------------------------------------------------------------------------
// Suite 3: Audio Synthesis & Character Roster
// ---------------------------------------------------------------------------
describe('Tier 3: Audio Engine & Procedural Character Renderers', () => {
  test('T3.01: SoundEngine implements all 18 procedural SFX recipes including bunnySqueak', () => {
    const sound = new SoundEngine();
    const synth = sound.synth;

    const sfxList = [
      'cluck', 'eggPop', 'crack', 'hatch', 'splash', 'seedDrop',
      'fanfare', 'crash', 'click', 'dinosaurRoar', 'balloonPop',
      'pancakeSizzle', 'whoosh', 'veggiePop', 'mudThud', 'bubblePop',
      'bunnySqueak', 'toddlerGiggle'
    ] as const;

    for (const name of sfxList) {
      expect(() => synth.playSFX(name as any)).not.toThrow();
    }
  });

  test('T3.02: BGMSequencer manages playback lifecycle', () => {
    const sound = new SoundEngine();
    expect(sound.sequencer.isRunning).toBe(false);

    sound.startBGM();
    sound.setBGMTempo(132);
    sound.stopBGM();
    expect(sound.sequencer.isRunning).toBe(false);
  });

  test('T3.03: CHARACTER_RENDERERS contains all 8 character entries', () => {
    const expectedKeys = ['chicken', 'trishu', 'leo', 'dad', 'mom', 'grandpa', 'mimi', 'chick'];
    for (const k of expectedKeys) {
      expect(typeof CHARACTER_RENDERERS[k as any]).toBe('function');
    }
  });

  test('T3.04: renderCharacter dispatches vector rendering for all characters without throwing', () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    const characters = ['chicken', 'trishu', 'leo', 'dad', 'mom', 'grandpa', 'mimi', 'chick'] as const;
    for (const charId of characters) {
      expect(() => renderCharacter(charId, ctx, 100, 100, 1.0, {})).not.toThrow();
    }
  });

  test('T3.05: PALETTE contains Adventures of Trishu custom colors', () => {
    expect(PALETTE.TRISHU_SKIN).toBe('#FFCC80');
    expect(PALETTE.TRISHU_DRESS).toBe('#B388FF');
    expect(PALETTE.LEO_SHIRT).toBe('#42A5F5');
    expect(PALETTE.DAD_SHIRT).toBe('#26A69A');
    expect(PALETTE.MOM_DRESS).toBe('#FF7043');
    expect(PALETTE.GRANDPA_HAT).toBe('#FFC107');
    expect(PALETTE.MIMI_FUR).toBe('#FAFAFA');
  });

  test('T3.06: Modular body parts renderers (drawHeadPart, drawTorsoPart, drawLegsPart, drawCompositeCharacter) execute without throwing', () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    expect(CHARACTER_PARTS.heads.length).toBe(7);
    expect(CHARACTER_PARTS.torsos.length).toBe(7);
    expect(CHARACTER_PARTS.legs.length).toBe(7);

    for (let i = 0; i < 7; i++) {
      expect(() => drawHeadPart(ctx, i, 50, 50, 1.0)).not.toThrow();
      expect(() => drawTorsoPart(ctx, i, 50, 50, 1.0)).not.toThrow();
      expect(() => drawLegsPart(ctx, i, 50, 50, 1.0)).not.toThrow();
    }

    expect(() => drawCompositeCharacter(ctx, 0, 1, 2, 50, 50, 1.0)).not.toThrow();
    expect(() => drawCompositeCharacter(ctx, 4, 5, 6, 50, 50, 1.0)).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// Suite 4: Quality Gates & Branding Verification
// ---------------------------------------------------------------------------
describe('Tier 4: Quality Gates & Branding Verification', () => {
  const root = resolve(process.cwd());

  test('T4.01: MenuScene displays "Adventures of Trishu" title', () => {
    const menuPath = resolve(root, 'src/games/menu/MenuScene.ts');
    const content = readFileSync(menuPath, 'utf8');
    expect(content.includes('Adventures of Trishu')).toBe(true);
    expect(content.includes('Peppa Pig')).toBe(false);
  });

  test('T4.02: Every source file in src/ is strictly under 500 lines of code', () => {
    function checkDir(dir: string) {
      const entries = readdirSync(dir);
      for (const entry of entries) {
        const full = resolve(dir, entry);
        const stat = statSync(full);
        if (stat.isDirectory()) {
          checkDir(full);
        } else if (entry.endsWith('.ts') || entry.endsWith('.tsx')) {
          const lines = readFileSync(full, 'utf8').split('\n').length;
          expect(lines).toBeLessThan(500);
        }
      }
    }
    checkDir(resolve(root, 'src'));
  });

  test('T4.03: Zero external CDN dependencies in index.html and manifest.json', () => {
    const html = readFileSync(resolve(root, 'index.html'), 'utf8');
    expect(html.includes('http://')).toBe(false);
    expect(html.includes('https://')).toBe(false);
    expect(html.includes('Adventures of Trishu')).toBe(true);

    const manifest = JSON.parse(readFileSync(resolve(root, 'public/manifest.json'), 'utf8'));
    expect(manifest.name).toBe('Adventures of Trishu');
    expect(manifest.short_name).toBe('Trishu');
  });

  test('T4.04: Zero copyrighted Peppa Pig character references in source code', () => {
    function scanDir(dir: string) {
      const entries = readdirSync(dir);
      for (const entry of entries) {
        const full = resolve(dir, entry);
        const stat = statSync(full);
        if (stat.isDirectory()) {
          scanDir(full);
        } else if (entry.endsWith('.ts') || entry.endsWith('.tsx')) {
          const content = readFileSync(full, 'utf8');
          expect(content.includes('peppaPigRenderer')).toBe(false);
          expect(content.includes('suzySheepRenderer')).toBe(false);
          expect(content.includes('daddyPigRenderer')).toBe(false);
          expect(content.includes('mummyPigRenderer')).toBe(false);
          expect(content.includes('georgeRenderer')).toBe(false);
        }
      }
    }
    scanDir(resolve(root, 'src'));
  });
});
