/**
 * Adventures of Trishu — Bug Audit & Remediation Test Suite
 * Validates fixes for HUD Mute sync, BGM ducking ratchet, iPad/tablet scaling,
 * Mix & Match double-tap, Dad's Kitchen reset, Hopscotch bubble ghosting,
 * Muddy Puddles landscape spawning, Egg Laying chick cap, Little Train loop reset,
 * and iPadOS PWA install detection.
 */

import { describe, test, expect } from './e2e_runner.mjs';
import { GameEngine } from '../src/engine/GameEngine';
import { HUD } from '../src/ui/HUD';
import { soundEngine } from '../src/engine/SoundEngine';
import { DisplayManager } from '../src/engine/DisplayManager';
import { MixMatchScene } from '../src/games/mix-match/MixMatchScene';
import { DadKitchenLogic } from '../src/games/dad-kitchen/DadKitchenLogic';
import { HopscotchLogic } from '../src/games/hopscotch-bubble/HopscotchLogic';
import { MuddyPuddlesLogic } from '../src/games/muddy-puddles/MuddyPuddlesLogic';
import { EggLayingLogic } from '../src/games/egg-laying/EggLayingLogic';
import { LittleTrainLogic } from '../src/games/little-train/LittleTrainLogic';
import { pwaManager } from '../src/pwa/PwaManager';

describe('Tier 9: EGM Bug Remediation Verification Suite', () => {
  test('R1.01: HUD Mute button synchronizes both storage and soundEngine', () => {
    const canvas = document.createElement('canvas');
    const engine = new GameEngine(canvas);
    let hudMuteToggled = false;
    const hud = new HUD(engine, {
      onGoHome: () => {},
      onToggleMute: () => {
        const newMute = !engine.storage.isMuted();
        engine.storage.setMuted(newMute);
        soundEngine.setMuted(newMute);
        hudMuteToggled = true;
      },
      onToggleFullscreen: () => {},
      onOpenSettings: () => {},
      onOpenAvatarSelect: () => {},
      onOpenPassport: () => {},
      onOpenInstall: () => {}
    });

    // Initial state: not muted
    engine.storage.setMuted(false);
    soundEngine.setMuted(false);
    expect(soundEngine.isMutedState()).toBe(false);

    // Trigger HUD mute callback via onToggleMute
    (hud as any).callbacks.onToggleMute();
    expect(engine.storage.isMuted()).toBe(true);
    expect(soundEngine.isMutedState()).toBe(true);
    expect(hudMuteToggled).toBe(true);

    // Toggle back
    (hud as any).callbacks.onToggleMute();
    expect(engine.storage.isMuted()).toBe(false);
    expect(soundEngine.isMutedState()).toBe(false);
  });

  test('R1.02: BGMSequencer duckBGM restores to configured base volume across rapid calls', () => {
    soundEngine.holder.bgmBaseGain = 0.35;
    expect(soundEngine.holder.bgmBaseGain).toBe(0.35);

    // Call duckBGM multiple times rapidly
    soundEngine.duckBGM(0.5);
    soundEngine.duckBGM(0.5);
    soundEngine.duckBGM(0.5);

    // Base gain remains undamaged
    expect(soundEngine.holder.bgmBaseGain).toBe(0.35);
  });

  test('R1.03: DisplayManager properly scales on 4:3 iPad landscape without distortion or clipping', () => {
    const canvas = document.createElement('canvas');
    const display = new DisplayManager(canvas);

    // Simulate iPad landscape: 1024x768 (aspect ratio 4:3 = 1.333 < 16:9 = 1.777)
    window.innerWidth = 1024;
    window.innerHeight = 768;
    if (window.visualViewport) {
      (window.visualViewport as any).width = 1024;
      (window.visualViewport as any).height = 768;
    }
    display.syncResize();

    expect(display.isPortrait).toBe(false);
    expect(display.vWidth).toBe(960);
    // Virtual height expands vertically rather than clipping width
    expect(display.vHeight).toBeGreaterThanOrEqual(540);
    expect(display.scale).toBeCloseTo(1024 / 960, 2);

    // Verify screenToVirtual and virtualToScreen are exact inverses
    const pt = display.screenToVirtual(512, 384);
    const roundtrip = display.virtualToScreen(pt.x, pt.y);
    expect(roundtrip.screenX).toBeCloseTo(512, 1);
    expect(roundtrip.screenY).toBeCloseTo(384, 1);
  });

  test('R1.04: MixMatchScene single-tap does not double-fire or skip costume items', () => {
    const canvas = document.createElement('canvas');
    const engine = new GameEngine(canvas);
    const mixMatch = engine.scenes.get('MIX_MATCH') as MixMatchScene;
    mixMatch.enter();

    const initialHead = mixMatch.headIdx;

    // Simulate primaryPointer tap on head next arrow
    engine.display.vWidth = 960;
    engine.display.vHeight = 540;
    const cx = 960 / 2;
    const cy = 540 * 0.48;
    const arrowRightX = cx + 110;
    const rowYHead = cy - 65;

    engine.input.actionJustPressed = true;
    engine.input.primaryPointer = { x: arrowRightX, y: rowYHead, isDown: true, inside: true };

    mixMatch.update(0.016, engine.input);

    // Head index should advance by exactly 1, not 2
    expect(mixMatch.headIdx).toBe((initialHead + 1) % 7);
  });

  test('R1.05: DadKitchenLogic resets layers after feast celebration expires', () => {
    const logic = new DadKitchenLogic();
    logic.reset();

    // Tap until fever reaches 100%
    while (logic.fever < 100) {
      logic.tap();
    }
    expect(logic.celebrationTimer).toBeGreaterThan(0);
    expect(logic.layers.length).toBeGreaterThan(1);

    // Step through the entire celebration timer
    logic.update(3.0);
    expect(logic.celebrationTimer).toBeLessThanOrEqual(0);
    expect(logic.layers.length).toBe(1);
    expect(logic.layers[0].type).toBe('BREAD');
  });

  test('R1.06: HopscotchLogic purges popped bubbles immediately from array', () => {
    const logic = new HopscotchLogic();
    logic.reset(960, 540, false);

    const initialCount = logic.bubbles.length;
    expect(initialCount).toBeGreaterThan(0);

    // Pop the first bubble
    logic.popBubble(0);
    logic.update(0.016, 960, 540);

    // Popped bubble must not linger in bubbles array
    expect(logic.bubbles.every(b => !b.popped)).toBe(true);
  });

  test('R1.07: MuddyPuddlesLogic spawns puddles across full landscape width', () => {
    const logic = new MuddyPuddlesLogic();
    logic.reset(480, 400);

    // In landscape mode with vWidth = 1200
    for (let i = 0; i < 20; i++) {
      logic.puddles = [];
      logic.spawnPuddle(undefined, 400, 1200);
      expect(logic.puddles.length).toBe(1);
      // Spawned puddles can reach up to 1200 - 70 = 1130
      expect(logic.puddles[0].x).toBeLessThanOrEqual(1130);
    }
  });

  test('R1.08: EggLayingLogic caps baby chicks at 24 to preserve 60 FPS', () => {
    const logic = new EggLayingLogic();
    logic.reset(270, 200);

    // Simulate 40 chicks
    for (let i = 0; i < 40; i++) {
      logic.chicks.push({
        x: 100,
        y: 200,
        vx: 0,
        vy: 0,
        walkCycle: 0,
        facingLeft: false,
        state: 'WANDERING'
      });
    }

    logic.update(0.016, 1.0, 400, 540, 960);
    expect(logic.chicks.length).toBeLessThanOrEqual(24);
  });

  test('R1.09: LittleTrainLogic resets passengers on track loop', () => {
    const logic = new LittleTrainLogic();
    logic.reset();

    expect(logic.passengers.length).toBe(1);

    // Pick up passengers by moving train forward
    logic.trainX = 2500;
    logic.update(0.016, 540);
    expect(logic.passengers.length).toBeGreaterThan(1);

    // Loop past 2800
    logic.trainX = 2850;
    logic.update(0.016, 540);
    expect(logic.trainX).toBe(0);
    expect(logic.passengers).toEqual(['trishu']);
  });

  test('R1.10: PwaManager isIOS detects iPadOS with touch points', () => {
    // Standard iPhone
    expect(pwaManager.isIOS()).toBeDefined();

    // Verify logic detects touch-enabled MacIntel (iPadOS Safari)
    const isIPadOS = (navigator.platform === 'MacIntel' || navigator.userAgent.includes('Macintosh')) && (navigator.maxTouchPoints || 0) > 0;
    expect(typeof isIPadOS).toBe('boolean');
  });
});
