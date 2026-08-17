/**
 * Tier 5: Empirical Character Models & Procedural Vector Graphics Stress Suite
 * Milestone M2 Empirical Challenger Verification Suite
 * Peppa Pig: Happy Mrs Chicken 8-Game Deluxe Expansion Suite
 */

import { describe, test, expect } from './e2e_runner.mjs';
import {
  preserveVolume,
  createCharacterAnimState,
  updateCharacterAnimState,
  clamp,
  lerp,
  easeInQuad,
  easeOutQuad,
  easeInOutQuad,
  easeInCubic,
  easeOutCubic,
  easeInOutCubic,
  easeOutBack,
  easeInBack,
  easeInOutBack,
  easeOutElastic,
  easeOutBounce,
  springStep,
  AnimMath,
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
import {
  drawMrsChicken,
  drawPeppaPig,
  drawGeorgePig,
  drawDaddyPig,
  drawMummyPig,
  drawGrandpaPig,
  drawSuzySheep,
  drawBabyChick,
  CHARACTER_RENDERERS,
  renderCharacter
} from '../src/graphics/characters/index';
import { CharacterId } from '../src/types/characters';

export class StackTrackingMockCanvasContext {
  public saveCount = 0;
  public restoreCount = 0;
  public stackDepth = 0;
  public minStackDepth = 0;
  public methodCalls: Record<string, number> = {};
  public stateStack: Array<Record<string, any>> = [];

  public fillStyle: string | CanvasGradient | CanvasPattern = '#000000';
  public strokeStyle: string | CanvasGradient | CanvasPattern = '#000000';
  public lineWidth = 1;
  public lineCap: CanvasLineCap = 'butt';
  public lineJoin: CanvasLineJoin = 'miter';
  public miterLimit = 10;
  public globalAlpha = 1.0;
  public globalCompositeOperation: GlobalCompositeOperation = 'source-over';

  private record(m: string) { this.methodCalls[m] = (this.methodCalls[m] || 0) + 1; }

  save(): void {
    this.record('save');
    this.saveCount++;
    this.stackDepth++;
    this.stateStack.push({ fillStyle: this.fillStyle, strokeStyle: this.strokeStyle, lineWidth: this.lineWidth });
  }

  restore(): void {
    this.record('restore');
    this.restoreCount++;
    this.stackDepth--;
    if (this.stackDepth < this.minStackDepth) this.minStackDepth = this.stackDepth;
    const s = this.stateStack.pop();
    if (s) { this.fillStyle = s.fillStyle; this.strokeStyle = s.strokeStyle; this.lineWidth = s.lineWidth; }
  }

  translate(x: number, y: number): void { this.record('translate'); }
  scale(x: number, y: number): void { this.record('scale'); }
  rotate(angle: number): void { this.record('rotate'); }
  transform(...args: number[]): void { this.record('transform'); }
  setTransform(...args: any[]): void { this.record('setTransform'); }
  resetTransform(): void { this.record('resetTransform'); }
  beginPath(): void { this.record('beginPath'); }
  closePath(): void { this.record('closePath'); }
  moveTo(x: number, y: number): void { this.record('moveTo'); }
  lineTo(x: number, y: number): void { this.record('lineTo'); }
  arc(x: number, y: number, r: number, s: number, e: number, cc?: boolean): void { this.record('arc'); }
  arcTo(x1: number, y1: number, x2: number, y2: number, r: number): void { this.record('arcTo'); }
  ellipse(x: number, y: number, rx: number, ry: number, rot: number, sa: number, ea: number, cc?: boolean): void { this.record('ellipse'); }
  bezierCurveTo(c1x: number, c1y: number, c2x: number, c2y: number, x: number, y: number): void { this.record('bezierCurveTo'); }
  quadraticCurveTo(cx: number, cy: number, x: number, y: number): void { this.record('quadraticCurveTo'); }
  rect(x: number, y: number, w: number, h: number): void { this.record('rect'); }
  roundRect(x: number, y: number, w: number, h: number, r?: any): void { this.record('roundRect'); }
  fill(rule?: CanvasFillRule): void { this.record('fill'); }
  stroke(): void { this.record('stroke'); }
  clip(rule?: CanvasFillRule): void { this.record('clip'); }
  clearRect(x: number, y: number, w: number, h: number): void { this.record('clearRect'); }
  fillRect(x: number, y: number, w: number, h: number): void { this.record('fillRect'); }
  strokeRect(x: number, y: number, w: number, h: number): void { this.record('strokeRect'); }
  drawImage(...args: any[]): void { this.record('drawImage'); }
}

describe('Tier 5: Character Models & Procedural Graphics Empirical Stress Suite', () => {

  test('T5.01_preserve_volume_edge_cases - Volume preservation maintains mass conservation and safe clamping across edge inputs', () => {
    const normalCases = [0.2, 0.5, 0.8, 1.0, 1.25, 1.5, 2.0, 4.0];
    for (const squash of normalCases) {
      const res = preserveVolume(squash);
      expect(res.scaleY).toBe(squash);
      expect(res.scaleX).toBeCloseTo(1.0 / Math.sqrt(squash), 5);
      expect(res.scaleX * Math.sqrt(res.scaleY)).toBeCloseTo(1.0, 5);
    }

    const clampedCases = [0.19, 0.1, 0.01, 0.0, -0.5, -5.0, -1000, -Infinity];
    for (const squash of clampedCases) {
      const res = preserveVolume(squash);
      expect(res.scaleY).toBe(0.2);
      expect(res.scaleX).toBeCloseTo(1.0 / Math.sqrt(0.2), 5);
      expect(Number.isFinite(res.scaleX)).toBe(true);
      expect(Number.isFinite(res.scaleY)).toBe(true);
    }

    const infRes = preserveVolume(Infinity);
    expect(infRes.scaleY).toBe(Infinity);
    expect(infRes.scaleX).toBe(0);
    expect(AnimMath.preserveVolume(0.8).scaleX).toBeCloseTo(preserveVolume(0.8).scaleX, 6);
  });

  test('T5.02_easing_suite_numerical_stability - All 11 easing functions satisfy mathematical bounds without NaN across domain', () => {
    const easingFuncs = [
      { name: 'easeInQuad', fn: easeInQuad }, { name: 'easeOutQuad', fn: easeOutQuad },
      { name: 'easeInOutQuad', fn: easeInOutQuad }, { name: 'easeInCubic', fn: easeInCubic },
      { name: 'easeOutCubic', fn: easeOutCubic }, { name: 'easeInOutCubic', fn: easeInOutCubic },
      { name: 'easeOutBack', fn: easeOutBack }, { name: 'easeInBack', fn: easeInBack },
      { name: 'easeInOutBack', fn: easeInOutBack }, { name: 'easeOutElastic', fn: easeOutElastic },
      { name: 'easeOutBounce', fn: easeOutBounce }
    ];

    for (const { fn } of easingFuncs) {
      expect(Math.abs(fn(0))).toBeLessThan(0.001);
      expect(Math.abs(fn(1) - 1.0)).toBeLessThan(0.001);
      for (let i = 0; i <= 100; i++) {
        const res = fn(i / 100);
        expect(Number.isFinite(res)).toBe(true);
        expect(Number.isNaN(res)).toBe(false);
      }
      for (const t of [-100, -1, 1.5, 2, 100]) {
        const res = fn(t);
        expect(Number.isFinite(res)).toBe(true);
        expect(Number.isNaN(res)).toBe(false);
      }
    }

    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-5, 0, 10)).toBe(0);
    expect(clamp(15, 0, 10)).toBe(10);
    expect(lerp(10, 20, 0)).toBe(10);
    expect(lerp(10, 20, 1)).toBe(20);
    expect(lerp(10, 20, 0.5)).toBe(15);
    expect(lerp(10, 20, -1)).toBe(0);

    let spring = { value: 0, velocity: 0 };
    for (let i = 0; i < 60; i++) spring = springStep(spring.value, 1.0, spring.velocity, 180, 12, 1 / 60);
    expect(Math.abs(spring.value - 1.0)).toBeLessThan(0.05);
  });

  test('T5.03_anim_state_update_edge_cases - updateCharacterAnimState handles dt=0, dt=-1, dt=1000 and decay stably', () => {
    const state = createCharacterAnimState({ squash: 1.5, squawk: 1.0 });
    const prevBreath = state.breathTimer;
    const prevWobble = state.wobbleTimer;
    updateCharacterAnimState(state, 0);
    expect(state.breathTimer).toBe(prevBreath);
    expect(state.wobbleTimer).toBe(prevWobble);

    expect(() => updateCharacterAnimState(state, -1)).not.toThrow();
    expect(() => updateCharacterAnimState(state, 1000)).not.toThrow();
    expect(Number.isFinite(state.breathScale)).toBe(true);
    expect(Number.isFinite(state.wobbleAngle)).toBe(true);

    state.squash = 1.8;
    state.squawk = 1.0;
    for (let i = 0; i < 120; i++) updateCharacterAnimState(state, 1 / 60);
    expect(state.squash).toBe(1.0);
    expect(state.squawk).toBe(0);
  });

  test('T5.04_stochastic_blinking_distribution - 10,000 simulated steps confirm natural biological eye blinking (2.5s-4.0s interval, ~0.12s duration)', () => {
    const state = createCharacterAnimState();
    const dt = 1 / 60;
    const TOTAL_STEPS = 10000;
    interface BlinkEvent { startTime: number; endTime: number; duration: number; intervalFromPrev: number; }
    const blinkEvents: BlinkEvent[] = [];
    let wasBlinking = state.isBlinking;
    let currentBlinkStart = 0;
    let lastBlinkEnd = 0;
    let totalSimTime = 0;
    let totalBlinkTime = 0;

    for (let step = 0; step < TOTAL_STEPS; step++) {
      totalSimTime += dt;
      updateCharacterAnimState(state, dt, { blinkMin: 2.5, blinkMax: 4.0, blinkDuration: 0.12 });
      if (state.isBlinking) totalBlinkTime += dt;
      if (!wasBlinking && state.isBlinking) currentBlinkStart = totalSimTime;
      if (wasBlinking && !state.isBlinking) {
        const duration = totalSimTime - currentBlinkStart;
        const interval = lastBlinkEnd > 0 ? currentBlinkStart - lastBlinkEnd : 0;
        blinkEvents.push({ startTime: currentBlinkStart, endTime: totalSimTime, duration, intervalFromPrev: interval });
        lastBlinkEnd = totalSimTime;
      }
      wasBlinking = state.isBlinking;
    }

    expect(blinkEvents.length).toBeGreaterThan(35);
    expect(blinkEvents.length).toBeLessThan(65);

    for (const b of blinkEvents) {
      expect(b.duration).toBeGreaterThan(0.10);
      expect(b.duration).toBeLessThan(0.16);
    }

    const validIntervals = blinkEvents.slice(1).map(b => b.intervalFromPrev);
    expect(validIntervals.length).toBeGreaterThan(30);
    for (const interval of validIntervals) {
      expect(interval).toBeGreaterThan(2.45);
      expect(interval).toBeLessThan(4.10);
    }

    const sumIntervals = validIntervals.reduce((acc, v) => acc + v, 0);
    const meanInterval = sumIntervals / validIntervals.length;
    expect(meanInterval).toBeGreaterThan(2.8);
    expect(meanInterval).toBeLessThan(3.7);

    const variance = validIntervals.reduce((acc, v) => acc + Math.pow(v - meanInterval, 2), 0) / validIntervals.length;
    const stdDev = Math.sqrt(variance);
    expect(stdDev).toBeGreaterThan(0.20);
    expect(stdDev).toBeLessThan(0.65);

    const dutyCycle = totalBlinkTime / totalSimTime;
    expect(dutyCycle).toBeGreaterThan(0.02);
    expect(dutyCycle).toBeLessThan(0.06);
  });

  test('T5.05_canvas_render_stress_1000_configs - 1,000 randomized configurations across all 8 characters execute with 0 errors and perfect context stack balance', () => {
    const mockCtx = new StackTrackingMockCanvasContext();
    const ctx = mockCtx as unknown as CanvasRenderingContext2D;
    const allCharacterIds: CharacterId[] = ['chicken', 'peppa', 'george', 'daddy', 'mummy', 'grandpa', 'suzy', 'chick'];
    const expressions = ['happy', 'excited', 'surprised', 'focused', 'proud', 'neutral', 'laughing', 'crying', 'blowing'];
    const poses = ['idle', 'walking', 'jumping', 'holding_dinosaur', 'flipping_pan', 'pulling_veggie', 'blowing_bubbles'];
    let totalRenders = 0;
    const NUM_ITERATIONS = 1000;

    for (let i = 0; i < NUM_ITERATIONS; i++) {
      const animState = createCharacterAnimState({
        breathScale: 0.8 + Math.random() * 0.4,
        wobbleAngle: (Math.random() - 0.5) * 0.2,
        wobbleTimer: Math.random() * 10,
        jumpY: (Math.random() - 0.5) * 60,
        squash: 0.5 + Math.random() * 1.5,
        squawk: Math.random() > 0.5 ? Math.random() : 0,
        panicStage: Math.floor(Math.random() * 5),
        armWave: Math.random() * 2,
        facingLeft: Math.random() > 0.5,
        chompingJaw: Math.random() * 2,
        flipperAngle: Math.random(),
        pullTension: Math.random(),
        hopY: Math.random(),
        customTimer: Math.random() * 10,
        isBlinking: Math.random() > 0.7
      });

      const x = -200 + Math.random() * 1400;
      const y = -200 + Math.random() * 1400;
      const scale = (Math.random() - 0.3) * 3;
      const expression = expressions[Math.floor(Math.random() * expressions.length)] as any;
      const pose = poses[Math.floor(Math.random() * poses.length)];

      for (const charId of allCharacterIds) {
        const stackBefore = mockCtx.stackDepth;
        const savesBefore = mockCtx.saveCount;
        const restoresBefore = mockCtx.restoreCount;

        const options: any = {
          x, y, scale, expression, pose, animState,
          facingLeft: Math.random() > 0.5,
          eyeBlink: Math.random() > 0.7,
          squash: 0.4 + Math.random() * 1.6,
          squish: 0.4 + Math.random() * 1.6,
          holdingDino: Math.random() > 0.3,
          dinoChomp: Math.random(),
          isCrying: Math.random() > 0.7,
          holdingPan: Math.random() > 0.3,
          panAngle: (Math.random() - 0.5) * 1.5,
          smiling: Math.random() > 0.2,
          dressSway: (Math.random() - 0.5) * 10,
          pulling: Math.random() > 0.4,
          pullTension: Math.random(),
          welliesMuddy: Math.random() > 0.5,
          hatTilt: (Math.random() - 0.5) * 0.5,
          holdingWand: Math.random() > 0.4,
          blowingBubble: Math.random() > 0.5,
          hopY: (Math.random() - 0.5) * 30,
          earFlap: (Math.random() - 0.5) * 0.5,
          flap: Math.random(),
          wingFlap: Math.random(),
          squawk: Math.random(),
          muddyBoots: Math.random() > 0.5,
          panicStage: Math.floor(Math.random() * 5),
          time: Math.random() * 10,
          sweatCount: Math.floor(Math.random() * 5),
          walkCycle: Math.random() * 20,
          isPeeping: Math.random() > 0.5
        };

        switch (charId) {
          case 'chicken': drawMrsChicken(ctx, x, y, scale, options); break;
          case 'peppa': drawPeppaPig(ctx, x, y, scale, options); break;
          case 'george': drawGeorgePig(ctx, x, y, scale, options); break;
          case 'daddy': drawDaddyPig(ctx, x, y, scale, options); break;
          case 'mummy': drawMummyPig(ctx, x, y, scale, options); break;
          case 'grandpa': drawGrandpaPig(ctx, x, y, scale, options); break;
          case 'suzy': drawSuzySheep(ctx, x, y, scale, options); break;
          case 'chick': drawBabyChick(ctx, x, y, scale, options); break;
        }

        expect(mockCtx.stackDepth).toBe(stackBefore);
        expect(mockCtx.saveCount - savesBefore).toBeGreaterThan(0);
        expect(mockCtx.saveCount - savesBefore).toBe(mockCtx.restoreCount - restoresBefore);

        const savesPoly = mockCtx.saveCount;
        const restoresPoly = mockCtx.restoreCount;
        renderCharacter(charId, ctx, x, y, scale, options);
        expect(mockCtx.stackDepth).toBe(stackBefore);
        expect(mockCtx.saveCount - savesPoly).toBe(mockCtx.restoreCount - restoresPoly);

        totalRenders += 2;
      }
    }

    expect(totalRenders).toBe(16000);
    expect(mockCtx.stackDepth).toBe(0);
    expect(mockCtx.minStackDepth).toBe(0);
    expect(mockCtx.saveCount).toBe(mockCtx.restoreCount);
    expect(mockCtx.saveCount).toBeGreaterThan(16000);
    expect(mockCtx.methodCalls['save']).toBeGreaterThan(16000);
    expect(mockCtx.methodCalls['restore']).toBeGreaterThan(16000);
    expect(mockCtx.methodCalls['beginPath']).toBeGreaterThan(50000);
    expect(mockCtx.methodCalls['stroke']).toBeGreaterThan(30000);
    expect(mockCtx.methodCalls['fill']).toBeGreaterThan(30000);
    expect(mockCtx.methodCalls['ellipse'] || mockCtx.methodCalls['arc']).toBeGreaterThan(30000);
  });

  test('T5.06_mini_game_articulation_math_stress - Mini-game pose articulation math yields continuous bounded values', () => {
    expect(getJawRotationAngle(0)).toBe(0);
    expect(getJawRotationAngle(-1)).toBe(0);
    for (let t = 0; t <= 5; t += 0.1) {
      const angle = getJawRotationAngle(t, 0.52);
      expect(angle).toBeGreaterThanOrEqual(0);
      expect(angle).toBeLessThanOrEqual(0.52 + 1e-5);
    }

    const panAt0 = getFryingPanAngle(0);
    expect(panAt0.panAngle).toBe(0);
    const panAtDip = getFryingPanAngle(0.1);
    expect(panAtDip.panAngle).toBeLessThan(0);
    const panAtSnap = getFryingPanAngle(0.35);
    expect(panAtSnap.panAngle).toBeGreaterThan(0.3);
    const panAtRest = getFryingPanAngle(1.0);
    expect(Math.abs(panAtRest.panAngle)).toBeLessThan(0.01);

    const pull0 = getVeggiePullTension(0);
    expect(pull0.pullY).toBeCloseTo(0, 5);
    expect(pull0.sweatCount).toBe(0);
    const pullHigh = getVeggiePullTension(0.9, 1.5);
    expect(pullHigh.pullY).toBeLessThan(-15);
    expect(pullHigh.sweatCount).toBeGreaterThanOrEqual(2);
    expect(Number.isFinite(pullHigh.strainTremor)).toBe(true);

    const hop0 = getHopscotchPhase(0);
    expect(hop0.hopY).toBe(0);
    expect(hop0.squashY).toBe(1.0);
    const hopMid = getHopscotchPhase(0.5);
    expect(hopMid.hopY).toBeLessThan(-30);

    const squat0 = getEggLayingSquat(0);
    expect(squat0.squashY).toBe(1.0);
    const squatDeep = getEggLayingSquat(0.3);
    expect(squatDeep.squashY).toBeLessThan(0.75);

    const splashLanding = getMudSplashReaction(200, true, 0.05);
    expect(splashLanding.squashY).toBeLessThan(0.85);

    const panic0 = getDaddyPigPanic(0, 0);
    expect(panic0.shakeX).toBe(0);
    expect(panic0.sweatCount).toBe(0);
    const panicMax = getDaddyPigPanic(4, 2.0);
    expect(panicMax.sweatCount).toBe(4);
    expect(panicMax.eyeRadius).toBeGreaterThan(4.0);

    const waddle = getBabyChickWaddle(1.2, true);
    expect(waddle.beakOpen).toBe(1.0);
    expect(Number.isFinite(waddle.legAngle)).toBe(true);

    const bubblePose = getBubbleBlowPose(0.5);
    expect(bubblePose.mouthPucker).toBeCloseTo(1.0, 4);

    const popReaction = getBalloonPopReaction(0.05);
    expect(popReaction.surpriseScale).toBeGreaterThan(1.0);
    expect(popReaction.eyeWiden).toBeGreaterThan(1.0);
  });

  test('T5.07_extreme_pathological_scale_and_nan_inputs - Renderers survive scale=0, scale=-5, scale=NaN, infinity without unhandled exceptions or stack corruption', () => {
    const mockCtx = new StackTrackingMockCanvasContext();
    const ctx = mockCtx as unknown as CanvasRenderingContext2D;
    const pathologicalScales = [0, -0, -1, -5, 0.0000001, 1000000, NaN, Infinity, -Infinity];
    const allCharacterIds: CharacterId[] = ['chicken', 'peppa', 'george', 'daddy', 'mummy', 'grandpa', 'suzy', 'chick'];

    for (const scale of pathologicalScales) {
      for (const charId of allCharacterIds) {
        const stackBefore = mockCtx.stackDepth;
        const savesBefore = mockCtx.saveCount;
        const restoresBefore = mockCtx.restoreCount;

        expect(() => {
          renderCharacter(charId, ctx, 100, 100, scale, {
            squash: NaN,
            jumpY: Infinity,
            armWave: -Infinity,
            panicStage: 999,
            dinoChomp: 999,
            panAngle: NaN,
            pullTension: -999,
            hopY: NaN
          });
        }).not.toThrow();

        expect(mockCtx.stackDepth).toBe(stackBefore);
        expect(mockCtx.saveCount - savesBefore).toBe(mockCtx.restoreCount - restoresBefore);
      }
    }
  });

  test('T5.08_roster_registry_and_polymorphic_parity - CHARACTER_RENDERERS contains exactly all 8 characters matching individual render functions', () => {
    const expectedIds: CharacterId[] = ['chicken', 'peppa', 'george', 'daddy', 'mummy', 'grandpa', 'suzy', 'chick'];
    expect(Object.keys(CHARACTER_RENDERERS).sort()).toEqual(expectedIds.sort());

    for (const id of expectedIds) {
      expect(typeof CHARACTER_RENDERERS[id]).toBe('function');
    }

    const mockCtx = new StackTrackingMockCanvasContext();
    const ctx = mockCtx as unknown as CanvasRenderingContext2D;

    const directRenderers = {
      chicken: drawMrsChicken,
      peppa: drawPeppaPig,
      george: drawGeorgePig,
      daddy: drawDaddyPig,
      mummy: drawMummyPig,
      grandpa: drawGrandpaPig,
      suzy: drawSuzySheep,
      chick: drawBabyChick
    };

    for (const id of expectedIds) {
      expect(CHARACTER_RENDERERS[id]).toBe(directRenderers[id]);
      const initialSaves = mockCtx.saveCount;
      renderCharacter(id, ctx, 50, 50, 1.0);
      expect(mockCtx.saveCount).toBeGreaterThan(initialSaves);
      expect(mockCtx.stackDepth).toBe(0);
    }
  });
});
