/**
 * Shared Animation Controller & Procedural Vector Easing Suite
 * Peppa Pig: Happy Mrs Chicken 8-Game Deluxe Expansion Suite
 */

import { CharacterAnimState } from '../types/characters';

export interface AnimUpdateOptions {
  blinkMin?: number;      // Min seconds between blinks (default: 2.5)
  blinkMax?: number;      // Max seconds between blinks (default: 4.0)
  blinkDuration?: number; // Duration of blink closure (default: 0.12)
  breathSpeed?: number;   // Breathing frequency (default: 2.1 rad/s)
  breathAmp?: number;     // Breathing amplitude (default: 0.03)
  wobbleSpeed?: number;   // Wobble frequency (default: 2.5 rad/s)
  wobbleAmp?: number;     // Wobble amplitude in radians (default: 0.04 rad)
  decaySquash?: boolean;  // Automatically decay squash back to 1.0 (default: true)
  decaySquawk?: boolean;  // Automatically decay squawk back to 0.0 (default: true)
}

/**
 * Creates an initialized CharacterAnimState with randomized phase offsets.
 */
export function createCharacterAnimState(initial?: Partial<CharacterAnimState>): CharacterAnimState {
  const minBlink = 2.5;
  const maxBlink = 4.0;
  return {
    blinkTimer: 0,
    isBlinking: false,
    nextBlinkTime: minBlink + Math.random() * (maxBlink - minBlink),
    breathTimer: Math.random() * Math.PI * 2,
    breathScale: 1.0,
    wobbleTimer: Math.random() * Math.PI * 2,
    wobbleAngle: 0,
    walkCycle: 0,
    jumpY: 0,
    squash: 1.0,
    squawk: 0,
    panicStage: 0,
    armWave: 0,
    facingLeft: false,
    chompingJaw: 0,
    flipperAngle: 0,
    pullTension: 0,
    hopY: 0,
    customTimer: 0,
    customPhase: 0,
    ...initial
  };
}

/**
 * Updates character animation timers, blinking state machine, and breathing cycles.
 */
export function updateCharacterAnimState(
  state: CharacterAnimState,
  dt: number,
  options: AnimUpdateOptions = {}
): CharacterAnimState {
  const blinkMin = options.blinkMin ?? 2.5;
  const blinkMax = options.blinkMax ?? 4.0;
  const blinkDuration = options.blinkDuration ?? 0.12;
  const breathSpeed = options.breathSpeed ?? 2.1;
  const breathAmp = options.breathAmp ?? 0.03;
  const wobbleSpeed = options.wobbleSpeed ?? 2.5;
  const wobbleAmp = options.wobbleAmp ?? 0.04;
  const decaySquash = options.decaySquash ?? true;
  const decaySquawk = options.decaySquawk ?? true;

  // 1. Sinusoidal Breathing & Idle Wobble
  state.breathTimer += dt * breathSpeed;
  state.breathScale = 1.0 + Math.sin(state.breathTimer) * breathAmp;
  state.wobbleTimer += dt * wobbleSpeed;
  state.wobbleAngle = Math.sin(state.wobbleTimer) * wobbleAmp;

  // 2. Stochastic Eye Blinking
  if (state.nextBlinkTime === undefined) {
    state.nextBlinkTime = blinkMin + Math.random() * (blinkMax - blinkMin);
  }
  state.blinkTimer += dt;
  if (!state.isBlinking) {
    if (state.blinkTimer >= state.nextBlinkTime) {
      state.isBlinking = true;
      state.blinkTimer = 0;
    }
  } else {
    if (state.blinkTimer >= blinkDuration) {
      state.isBlinking = false;
      state.blinkTimer = 0;
      state.nextBlinkTime = blinkMin + Math.random() * (blinkMax - blinkMin);
    }
  }

  // 3. Elastic Decay of Dynamic State
  if (decaySquash && state.squash !== undefined && state.squash !== 1.0) {
    state.squash = lerp(state.squash, 1.0, clamp(dt * 8.0, 0, 1));
    if (Math.abs(state.squash - 1.0) < 0.001) state.squash = 1.0;
  }
  if (decaySquawk && state.squawk !== undefined && state.squawk > 0) {
    state.squawk = Math.max(0, state.squawk - dt * 4.0);
  }
  if (state.customTimer !== undefined) {
    state.customTimer += dt;
  }
  return state;
}

/* ========================================================================== */
/* Mathematical Easing & Volume Preservation Suite                            */
/* ========================================================================== */

export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function easeInQuad(t: number): number {
  return t * t;
}

export function easeOutQuad(t: number): number {
  return t * (2 - t);
}

export function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

export function easeInCubic(t: number): number {
  return t * t * t;
}

export function easeOutCubic(t: number): number {
  const p = t - 1;
  return p * p * p + 1;
}

export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function easeOutBack(t: number, overshoot: number = 1.70158): number {
  const p = t - 1;
  return p * p * ((overshoot + 1) * p + overshoot) + 1;
}

export function easeInBack(t: number, overshoot: number = 1.70158): number {
  return t * t * ((overshoot + 1) * t - overshoot);
}

export function easeInOutBack(t: number, overshoot: number = 1.70158): number {
  const s = overshoot * 1.525;
  return t < 0.5
    ? (Math.pow(2 * t, 2) * ((s + 1) * 2 * t - s)) / 2
    : (Math.pow(2 * t - 2, 2) * ((s + 1) * (t * 2 - 2) + s) + 2) / 2;
}

export function easeOutElastic(t: number): number {
  if (t === 0 || t === 1) return t;
  return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1;
}

export function easeOutBounce(t: number): number {
  const n1 = 7.5625;
  const d1 = 2.75;
  if (t < 1 / d1) {
    return n1 * t * t;
  } else if (t < 2 / d1) {
    const p = t - 1.5 / d1;
    return n1 * p * p + 0.75;
  } else if (t < 2.5 / d1) {
    const p = t - 2.25 / d1;
    return n1 * p * p + 0.9375;
  } else {
    const p = t - 2.625 / d1;
    return n1 * p * p + 0.984375;
  }
}

/**
 * Calculates volume-preserving X and Y scale factors. scaleX = 1 / sqrt(clampedY), clamped at 0.2.
 */
export function preserveVolume(squashY: number): { scaleX: number; scaleY: number } {
  const clampedY = Math.max(0.2, squashY);
  const scaleX = 1.0 / Math.sqrt(clampedY);
  return { scaleX, scaleY: clampedY };
}

export function sinWave(timer: number, frequency: number, amplitude: number, offset: number = 0): number {
  return Math.sin(timer * frequency + offset) * amplitude;
}

export function cosWave(timer: number, frequency: number, amplitude: number, offset: number = 0): number {
  return Math.cos(timer * frequency + offset) * amplitude;
}

export function springStep(
  current: number,
  target: number,
  velocity: number,
  stiffness: number = 180,
  damping: number = 12,
  dt: number = 1 / 60
): { value: number; velocity: number } {
  const force = -stiffness * (current - target);
  const dampingForce = -damping * velocity;
  const acceleration = force + dampingForce;
  const newVelocity = velocity + acceleration * dt;
  const newValue = current + newVelocity * dt;
  return { value: newValue, velocity: newVelocity };
}

/**
 * Backward-compatible object facade matching existing test expectations.
 */
export const AnimMath = {
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
  preserveVolume,
  sinWave,
  cosWave,
  springStep
};

/* ========================================================================== */
/* Re-export Character Articulation & Pose Math Helpers                       */
/* ========================================================================== */

export * from './characterPoses';

