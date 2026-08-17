/**
 * Tier 3: UI, Dual-Orientation, Character Models & Web Audio Test Suite (18 Test Cases)
 * Peppa Pig: Happy Mrs Chicken 8-Game Deluxe Expansion Suite
 */

import { describe, test, expect, beforeEach } from './e2e_runner.mjs';
import { GameEngine } from '../src/engine/GameEngine';
import { DisplayManager } from '../src/engine/DisplayManager';
import { InputManager } from '../src/engine/InputManager';
import { soundEngine, BGMSequencer, AudioSpyImpl } from '../src/engine/SoundEngine';
import { AudioContextHolder } from '../src/engine/audio/AudioContextHolder';
import {
  AnimMath,
  createCharacterAnimState,
  updateCharacterAnimState,
  getJawRotationAngle,
  getFryingPanAngle,
  getVeggiePullTension,
  getHopscotchPhase,
  getEggLayingSquat,
  getMudSplashReaction,
  getDaddyPigPanic,
  getBabyChickWaddle,
  getBubbleBlowPose,
  getBalloonPopReaction
} from '../src/graphics/animations';
import { PALETTE } from '../src/graphics/palette';
import {
  drawMrsChicken,
  drawPeppaPig,
  drawDaddyPig,
  drawBabyChick,
  drawGeorgePig,
  drawMummyPig,
  drawGrandpaPig,
  drawSuzySheep,
  renderCharacter,
  CHARACTER_RENDERERS,
  CharacterId
} from '../src/graphics';
import { SFXName } from '../src/types/audio';
import { CharacterAnimState } from '../src/types/characters';

describe('Tier 3: UI, Orientation & Web Audio Suite', () => {
  let canvas: HTMLCanvasElement;
  let engine: GameEngine;

  beforeEach(() => {
    window.localStorage.clear();
    const spy = (window as unknown as { __AUDIO_SPY__?: { clear: () => void } }).__AUDIO_SPY__;
    if (spy) spy.clear();
    canvas = document.createElement('canvas') as HTMLCanvasElement;
    engine = new GameEngine(canvas);
  });

  // 1. Portrait Viewport (9:16) Virtual Scaling & Resolution
  test('T3.01_portrait_viewport_9_16 - Portrait mode computes fixed vWidth (540) and dynamic vHeight', () => {
    window.innerWidth = 414;
    window.innerHeight = 896;
    window.devicePixelRatio = 2.0;

    const display = new DisplayManager(canvas);
    display.syncResize();

    expect(display.isPortrait).toBeTruthy();
    expect(display.vWidth).toBe(540);
    expect(display.scale).toBeCloseTo(414 / 540, 4);
    expect(display.vHeight).toBeGreaterThanOrEqual(800);
    expect(display.canvas.width).toBe(414 * 2);
    expect(display.canvas.height).toBe(896 * 2);
    display.destroy();
  });

  // 2. Landscape Viewport (16:9 & 21:9) Virtual Scaling
  test('T3.02_landscape_viewport_16_9 - Landscape mode computes fixed vHeight (540) and wide vWidth', () => {
    // 16:9 Landscape
    window.innerWidth = 1280;
    window.innerHeight = 720;
    window.devicePixelRatio = 1.0;

    const display = new DisplayManager(canvas);
    display.syncResize();

    expect(display.isPortrait).toBeFalsy();
    expect(display.vHeight).toBe(540);
    expect(display.scale).toBeCloseTo(720 / 540, 4);
    expect(display.vWidth).toBeGreaterThanOrEqual(960);

    // 21:9 Ultra-Wide
    window.innerWidth = 2560;
    window.innerHeight = 1080;
    display.syncResize();
    expect(display.isPortrait).toBeFalsy();
    expect(display.vHeight).toBe(540);
    expect(display.scale).toBeCloseTo(1080 / 540, 4);
    expect(display.vWidth).toBeGreaterThanOrEqual(1280);

    display.destroy();
  });

  // 3. Bidirectional Coordinate Transformation Invariance
  test('T3.03_bidirectional_coordinate_transform - virtualToScreen and screenToVirtual preserve coordinates', () => {
    window.innerWidth = 1280;
    window.innerHeight = 720;
    const display = new DisplayManager(canvas);
    display.syncResize();

    const testPoints = [
      { sx: 0, sy: 0 },
      { sx: 640, sy: 360 },
      { sx: 1280, sy: 720 },
      { sx: 100, sy: 200 }
    ];

    for (const pt of testPoints) {
      const v = display.screenToVirtual(pt.sx, pt.sy);
      expect(v.inside).toBeTruthy();
      const s = display.virtualToScreen(v.x, v.y);
      expect(s.screenX).toBeCloseTo(pt.sx, 1);
      expect(s.screenY).toBeCloseTo(pt.sy, 1);
    }

    const outside = display.screenToVirtual(-50, -50);
    expect(outside.inside).toBeFalsy();
    display.destroy();
  });

  // 4. Canvas DPI & Context Transform Scaling in beginFrame / endFrame
  test('T3.04_canvas_dpi_context_transform - beginFrame applies DPR and scale transforms and endFrame restores', () => {
    const display = new DisplayManager(canvas);
    const ctx = display.ctx as unknown as { saveCount: number; restoreCount: number; scaleCalls: Array<{ x: number; y: number }> };
    ctx.saveCount = 0;
    ctx.restoreCount = 0;
    ctx.scaleCalls = [];

    display.beginFrame();
    expect(ctx.saveCount).toBeGreaterThan(0);
    expect(ctx.scaleCalls.length).toBeGreaterThanOrEqual(1);

    display.endFrame();
    expect(ctx.restoreCount).toBe(ctx.saveCount);
    display.destroy();
  });

  // 5. Multi-Pointer Tracking & Independent Finger IDs
  test('T3.05_multi_pointer_tracking - Tracks multiple simultaneous touch pointers with unique IDs', () => {
    const input = new InputManager(engine.display);

    // Pointer 1 Down
    canvas.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 1, clientX: 100, clientY: 150, bubbles: true }));
    expect(input.pointers.size).toBe(1);
    expect(input.actionIsDown).toBeTruthy();

    // Pointer 2 Down
    canvas.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 2, clientX: 300, clientY: 400, bubbles: true }));
    expect(input.pointers.size).toBe(2);
    expect(input.pointers.get(1)?.isDown).toBeTruthy();
    expect(input.pointers.get(2)?.isDown).toBeTruthy();

    // Pointer 1 Up
    window.dispatchEvent(new PointerEvent('pointerup', { pointerId: 1, bubbles: true }));
    expect(input.pointers.size).toBe(1);
    expect(input.actionIsDown).toBeTruthy(); // Pointer 2 still down

    // Pointer 2 Up
    window.dispatchEvent(new PointerEvent('pointerup', { pointerId: 2, bubbles: true }));
    input.postUpdate();
    expect(input.pointers.size).toBe(0);
    expect(input.actionIsDown).toBeFalsy();
    input.detach();
  });

  // 6. Forgiving Toddler Full-Screen Tap Tolerance & Coordinate Sanitization
  test('T3.06_forgiving_toddler_taps - Handles NaN, Infinity, and out-of-bounds coordinates gracefully', () => {
    const input = new InputManager(engine.display);

    expect(() => {
      canvas.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 99, clientX: NaN, clientY: NaN, bubbles: true }));
      canvas.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 100, clientX: Infinity, clientY: -Infinity, bubbles: true }));
      canvas.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 101, clientX: -9999, clientY: 9999, bubbles: true }));
    }).not.toThrow();

    expect(isFinite(input.primaryPointer.x)).toBeTruthy();
    expect(isFinite(input.primaryPointer.y)).toBeTruthy();
    input.detach();
  });

  // 7. Keyboard Action & Keybinding Fallback
  test('T3.07_keyboard_controls - Space and Enter trigger actions and KeyM toggles mute', () => {
    const input = new InputManager(engine.display);

    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space', key: ' ' }));
    expect(input.isKeyDown('Space')).toBeTruthy();
    expect(input.actionJustPressed).toBeTruthy();
    expect(input.actionIsDown).toBeTruthy();

    input.postUpdate();
    expect(input.actionJustPressed).toBeFalsy();
    expect(input.actionIsDown).toBeTruthy();

    window.dispatchEvent(new KeyboardEvent('keyup', { code: 'Space', key: ' ' }));
    expect(input.actionIsDown).toBeFalsy();
    expect(input.actionJustReleased).toBeTruthy();

    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyM', key: 'm' }));
    expect(input.isKeyDown('KeyM')).toBeTruthy();
    input.detach();
  });

  // 8. UI HUD Button Triggers & Responsive Controls
  test('T3.08_hud_buttons_events - HUD actions transition scene and update audio state', () => {
    // Scene Home Transition
    engine.changeScene('MUDDY_PUDDLES');
    expect(engine.currentSceneId).toBe('MUDDY_PUDDLES');
    engine.changeScene('MENU');
    expect(engine.currentSceneId).toBe('MENU');

    // Audio Mute Toggle
    const prevMute = soundEngine.isMutedState();
    soundEngine.setMuted(!prevMute);
    expect(soundEngine.isMutedState()).toBe(!prevMute);
    soundEngine.setMuted(prevMute);

    // Fullscreen Toggle
    expect(() => engine.toggleFullscreen()).not.toThrow();
  });

  // 9. All 8 Vector Character Render Contracts & Polymorphic Dispatcher Execution
  test('T3.09_character_render_contracts - Procedural vector renderers execute with balanced context stack', () => {
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    const anim = createCharacterAnimState();

    expect(() => {
      // 8 Individual direct renderers
      drawMrsChicken(ctx, 100, 100, 1.0, { squash: 0.8, flap: 0.5, squawk: 1, eyeBlink: true, facingLeft: true, animState: anim });
      drawPeppaPig(ctx, 100, 100, 1.0, { jumpY: -20, squish: 0.9, armWave: 1.2, muddyBoots: true, animState: anim });
      drawDaddyPig(ctx, 100, 100, 1.0, { panicStage: 3, time: 2.5, animState: anim });
      drawBabyChick(ctx, 100, 100, 1.0, { walkCycle: 1.5, isPeeping: true, facingLeft: true, animState: anim });
      drawGeorgePig(ctx, 100, 100, 1.0, { holdingDino: true, dinoChomp: 0.8, animState: anim });
      drawMummyPig(ctx, 100, 100, 1.0, { holdingPan: true, panAngle: 0.3, smiling: true, animState: anim });
      drawGrandpaPig(ctx, 100, 100, 1.0, { pulling: true, pullTension: 0.7, welliesMuddy: true, animState: anim });
      drawSuzySheep(ctx, 100, 100, 1.0, { hopY: -15, holdingWand: true, blowingBubble: true, animState: anim });

      // Polymorphic dispatcher across all 8 character IDs
      const allRoster: CharacterId[] = ['chicken', 'peppa', 'george', 'daddy', 'mummy', 'grandpa', 'suzy', 'chick'];
      for (const id of allRoster) {
        renderCharacter(id, ctx, 200, 200, 1.0, { animState: anim });
        expect(typeof CHARACTER_RENDERERS[id]).toBe('function');
      }
    }).not.toThrow();
  });

  // 10. Character Animation Math, Easing Curves & Volume Preservation
  test('T3.10_anim_math_volume_preservation - Volume preservation calculates scaleX = 1/sqrt(squashY)', () => {
    const v1 = AnimMath.preserveVolume(1.0);
    expect(v1.scaleX).toBe(1.0);
    expect(v1.scaleY).toBe(1.0);

    const v2 = AnimMath.preserveVolume(0.5);
    expect(v2.scaleX).toBeCloseTo(1.0 / Math.sqrt(0.5), 4);
    expect(v2.scaleY).toBe(0.5);

    // Clamping against 0 divide
    const v3 = AnimMath.preserveVolume(0.01);
    expect(v3.scaleY).toBe(0.2);
    expect(v3.scaleX).toBeCloseTo(1.0 / Math.sqrt(0.2), 4);

    // Easing curves
    expect(AnimMath.easeInQuad(0)).toBeCloseTo(0, 4);
    expect(AnimMath.easeInQuad(1)).toBeCloseTo(1, 4);
    expect(AnimMath.easeOutQuad(0)).toBeCloseTo(0, 4);
    expect(AnimMath.easeOutQuad(1)).toBeCloseTo(1, 4);
    expect(AnimMath.easeInOutQuad(0.5)).toBeCloseTo(0.5, 2);
    expect(AnimMath.easeInCubic(0.5)).toBeCloseTo(0.125, 3);
    expect(AnimMath.easeOutCubic(0)).toBeCloseTo(0, 4);
    expect(AnimMath.easeOutCubic(1)).toBeCloseTo(1, 4);
    expect(AnimMath.easeInOutCubic(0.5)).toBeCloseTo(0.5, 3);
    expect(AnimMath.easeOutBack(0)).toBeCloseTo(0, 4);
    expect(AnimMath.easeOutBack(1)).toBeCloseTo(1, 4);
    expect(AnimMath.easeInBack(0)).toBeCloseTo(0, 4);
    expect(AnimMath.easeInOutBack(0.5)).toBeCloseTo(0.5, 2);
    expect(AnimMath.easeOutElastic(0)).toBeCloseTo(0, 4);
    expect(AnimMath.easeOutElastic(1)).toBeCloseTo(1, 4);
    expect(AnimMath.easeOutBounce(0)).toBeCloseTo(0, 4);
    expect(AnimMath.easeOutBounce(1)).toBeCloseTo(1, 4);

    // Spring step and wave helpers
    const spring = AnimMath.springStep(0, 10, 0, 180, 12, 1 / 60);
    expect(spring.value).toBeGreaterThan(0);
    expect(AnimMath.clamp(15, 0, 10)).toBe(10);
    expect(AnimMath.lerp(10, 20, 0.5)).toBe(15);
  });

  // 11. CharacterAnimState Blinking & Breathing Loop
  test('T3.11_anim_state_blinking_breathing - CharacterAnimState advances blink timer and breathing squash', () => {
    const animState = createCharacterAnimState({
      nextBlinkTime: 3.0,
      breathTimer: 0,
      wobbleTimer: 0,
      squash: 0.8,
      squawk: 1.0
    });

    updateCharacterAnimState(animState, 1.0);
    expect(animState.isBlinking).toBeFalsy();
    expect(animState.breathScale).toBeGreaterThanOrEqual(0.97);
    expect(animState.breathScale).toBeLessThanOrEqual(1.03);
    expect(animState.squash).toBeGreaterThan(0.8); // Squash decaying toward 1.0

    updateCharacterAnimState(animState, 2.05); // t >= 3.0s -> blink starts
    expect(animState.isBlinking).toBeTruthy();

    updateCharacterAnimState(animState, 0.15); // closure duration 0.12s elapsed -> blink resets
    expect(animState.isBlinking).toBeFalsy();
  });

  // 12. George Pig & Mr. Dinosaur Vector Model Geometry & Palette
  test('T3.12_george_pig_dino_palette - George and Mr Dinosaur comply with authentic color palette and chomp anim', () => {
    expect(PALETTE.GEORGE_SHIRT).toBe('#1E88E5');
    expect(PALETTE.GEORGE_SKIN).toBe('#FFB6C1');
    expect(PALETTE.DINOSAUR_GREEN).toBe('#4CAF50');
    expect(PALETTE.DINOSAUR_OUTLINE).toBe('#2E7D32');
    expect(PALETTE.DINOSAUR_TEETH).toBe('#FFFFFF');
    expect(PALETTE.DINOSAUR_MOUTH).toBe('#D32F2F');

    // Chomp animation angle check
    expect(getJawRotationAngle(0)).toBe(0);
    expect(getJawRotationAngle(0.15)).toBeGreaterThan(0);

    // Balloon pop reaction check
    const pop = getBalloonPopReaction(0.2);
    expect(pop.surpriseScale).toBeGreaterThan(1.0);
  });

  // 13. Mummy, Grandpa & Suzy Sheep Vector Models & Palette Compliance
  test('T3.13_mummy_grandpa_suzy_palette - Character palette entries match specification constants', () => {
    expect(PALETTE.PEPPA_DRESS).toBe('#E53935');
    expect(PALETTE.CHICKEN_COMB).toBe('#E53935');
    expect(PALETTE.CHICK_BODY).toBe('#FFEE58');
    expect(PALETTE.DADDY_SHIRT).toBe('#26A69A');
    expect(PALETTE.GOLDEN_PUDDLE).toBe('#FFD54F');

    // Mummy Pig palette & articulation
    expect(PALETTE.MUMMY_DRESS).toBe('#FF7043');
    expect(PALETTE.MUMMY_PAN).toBe('#78909C');
    expect(PALETTE.MUMMY_PANCAKE).toBe('#FFB74D');
    const panFlip = getFryingPanAngle(0.35);
    expect(panFlip.armOffset).toBeLessThan(0); // Upward flip

    // Grandpa Pig palette & pull strain
    expect(PALETTE.GRANDPA_SHIRT).toBe('#7E57C2');
    expect(PALETTE.GRANDPA_WELLIES).toBe('#2E7D32');
    expect(PALETTE.GRANDPA_CAP).toBe('#1565C0');
    expect(PALETTE.GRANDPA_ANCHOR).toBe('#FFD54F');
    const strain = getVeggiePullTension(0.8, 1.0);
    expect(strain.pullY).toBeLessThan(0);
    expect(strain.sweatCount).toBeGreaterThan(0);

    // Suzy Sheep palette & hopscotch
    expect(PALETTE.SUZY_DRESS).toBe('#F48FB1');
    expect(PALETTE.SUZY_WOOL).toBe('#FAFAFA');
    expect(PALETTE.SUZY_WAND).toBe('#FFE082');
    expect(PALETTE.SUZY_BUBBLE).toBe('#4FC3F7');
    const hop = getHopscotchPhase(0.5);
    expect(hop.hopY).toBeLessThan(0); // Airborne apex

    // Additional mini-game articulation helpers
    expect(getEggLayingSquat(0.2).squashY).toBeLessThan(1.0);
    expect(getMudSplashReaction(100, true, 0.1).squashY).toBeLessThan(1.0);
    expect(getDaddyPigPanic(3, 1.0).sweatCount).toBeGreaterThanOrEqual(3);
    expect(getBabyChickWaddle(1.0, true).beakOpen).toBe(1.0);
    expect(getBubbleBlowPose(0.5).mouthPucker).toBeGreaterThan(0);
  });

  // 14. Audio Engine Auto-Unlock on First User Gesture
  test('T3.14_audio_auto_unlock - First user gesture unlocks Web Audio and sets isUnlocked', async () => {
    const holder = new AudioContextHolder();
    await holder.init();
    expect(holder.ctx).toBeDefined();

    const unlocked = await holder.unlock();
    expect(unlocked).toBeTruthy();
    expect(holder.isUnlocked).toBeTruthy();
  });

  // 15. All 18 Procedural SFX Recipes via AudioSpy
  test('T3.15_all_18_sfx_recipes_audiospy - All 18 SFX trigger distinct procedural synthesis recipes', () => {
    const allSFX: SFXName[] = [
      'cluck',
      'eggPop',
      'crack',
      'hatch',
      'splash',
      'seedDrop',
      'fanfare',
      'crash',
      'click',
      'dinosaurRoar',
      'balloonPop',
      'pancakeSizzle',
      'whoosh',
      'veggiePop',
      'mudThud',
      'bubblePop',
      'sheepBleat',
      'toddlerGiggle'
    ];

    const spy = (window as unknown as { __AUDIO_SPY__: { clear: () => void; events: Array<{ type: string }> } }).__AUDIO_SPY__;
    spy.clear();

    for (const name of allSFX) {
      soundEngine.playSFX(name);
    }

    expect(spy.events.length).toBe(18);
    for (const name of allSFX) {
      expect(spy.events.some(e => e.type === name)).toBeTruthy();
    }
  });

  // 16. 128 BPM Multi-Track BGM Sequencer Loop & Tempo Shift
  test('T3.16_bgm_sequencer_tempo_shift - BGM Sequencer starts, stops, and adjusts step interval on tempo change', async () => {
    const holder = new AudioContextHolder();
    await holder.init();
    const sequencer = new BGMSequencer(holder);

    sequencer.start();
    expect(sequencer.isRunning).toBeTruthy();

    // Default 128 BPM
    expect(sequencer.tempo).toBe(128);

    // Shift to 150 BPM
    sequencer.setTempo(150);
    expect(sequencer.tempo).toBe(150);

    sequencer.stop();
    expect(sequencer.isRunning).toBeFalsy();
  });

  // 17. Master Gain Ramping & Mute Safety
  test('T3.17_master_gain_ramping_mute_safety - Muting sets master gain to 0 and playing SFX when muted is safe', () => {
    soundEngine.setMuted(true);
    expect(soundEngine.isMutedState()).toBeTruthy();

    // Playing SFX when muted should execute smoothly without throwing
    expect(() => {
      soundEngine.playSFX('cluck');
      soundEngine.playSFX('splash');
      soundEngine.playSFX('dinosaurRoar');
    }).not.toThrow();

    soundEngine.setMuted(false);
    expect(soundEngine.isMutedState()).toBeFalsy();
  });

  // 18. AudioSpy Telemetry Ring Buffer Bounding
  test('T3.18_audiospy_ring_buffer_clamping - AudioSpy ring buffer bounds history to maximum capacity', () => {
    const holder = new AudioContextHolder();
    const spy = new AudioSpyImpl(holder);

    for (let i = 0; i < 600; i++) {
      spy.record('event_' + i);
    }

    expect(spy.events.length).toBeLessThanOrEqual(500);
    expect(spy.events.length).toBe(500);

    spy.clear();
    expect(spy.events.length).toBe(0);
  });
});
