/**
 * Character Articulation & Pose Math Helpers for 8 Mini-Games
 * Adventures of Trishu 8-Game Suite
 */

import {
  clamp,
  lerp,
  easeInQuad,
  easeOutQuad,
  easeInOutQuad,
  easeOutBack,
  easeOutElastic
} from './animations';

/** Mode 5: Leo & Plush Dinosaur Chomping Jaw Angle (0 to 30 deg / 0.52 rad) */
export function getJawRotationAngle(chompTimer: number, maxAngleRad: number = 0.52): number {
  if (chompTimer <= 0) return 0;
  return Math.abs(Math.sin(chompTimer * 10)) * maxAngleRad;
}

/** Mode 6: Mom Frying Pan Flip Articulation */
export function getFryingPanAngle(
  flipPhase: number,
  flipIntensity: number = 1.0
): { panAngle: number; armOffset: number; wristAngle: number } {
  const t = clamp(flipPhase, 0, 1);
  if (t === 0) return { panAngle: 0, armOffset: 0, wristAngle: 0 };
  if (t < 0.2) {
    const dip = easeInQuad(t / 0.2);
    return { panAngle: -0.15 * dip * flipIntensity, armOffset: 4 * dip, wristAngle: -0.1 * dip };
  } else if (t < 0.5) {
    const snap = easeOutQuad((t - 0.2) / 0.3);
    return {
      panAngle: lerp(-0.15, 0.65 * flipIntensity, snap),
      armOffset: lerp(4, -12, snap),
      wristAngle: lerp(-0.1, 0.45 * flipIntensity, snap)
    };
  } else if (t < 0.8) {
    const settle = easeInOutQuad((t - 0.5) / 0.3);
    return {
      panAngle: lerp(0.65 * flipIntensity, 0.08, settle),
      armOffset: lerp(-12, 0, settle),
      wristAngle: lerp(0.45 * flipIntensity, 0.05, settle)
    };
  } else {
    const rest = easeOutQuad((t - 0.8) / 0.2);
    return { panAngle: lerp(0.08, 0, rest), armOffset: 0, wristAngle: lerp(0.05, 0, rest) };
  }
}

/** Mode 7: Grandpa Vegetable Harvest Pull Tension */
export function getVeggiePullTension(
  tension: number,
  time: number = 0
): { pullY: number; strainAngle: number; strainTremor: number; sweatCount: number } {
  const t = clamp(tension, 0, 1);
  const pullY = -easeInQuad(t) * 22;
  const strainAngle = -t * 0.22;
  const strainTremor = t > 0.5 ? Math.sin(time * 36) * (t - 0.5) * 3.5 : 0;
  const sweatCount = t > 0.65 ? Math.min(3, Math.floor((t - 0.65) * 8) + 1) : 0;
  return { pullY, strainAngle, strainTremor, sweatCount };
}

/** Mode 8: Mimi the Bunny Hopscotch Jumping & Fluffy Ears */
export function getHopscotchPhase(
  hopPhase: number
): { hopY: number; squashY: number; legSpread: number; earFlap: number } {
  const t = clamp(hopPhase, 0, 1);
  if (t === 0 || t === 1) return { hopY: 0, squashY: 1.0, legSpread: 0, earFlap: 0 };
  const parabolic = 4 * t * (1 - t);
  const hopY = -parabolic * 36;
  let squashY = 1.0;
  if (t < 0.15) squashY = 1.0 - (0.15 - t) * 1.5;
  else if (t > 0.85) squashY = 1.0 - (t - 0.85) * 1.5;
  else squashY = 1.0 + (parabolic - 0.5) * 0.12;
  const legSpread = Math.sin(t * Math.PI) * 0.35;
  const earFlap = Math.sin(t * Math.PI * 2 - 0.4) * 0.3;
  return { hopY, squashY, legSpread, earFlap };
}

/** Mode 1: Happy Mrs Clucky Egg Laying Squat */
export function getEggLayingSquat(
  squatProgress: number
): { squashY: number; wingFlap: number; squawkMouth: number; headBob: number } {
  const t = clamp(squatProgress, 0, 1);
  if (t === 0 || t === 1) return { squashY: 1.0, wingFlap: 0, squawkMouth: 0, headBob: 0 };
  if (t < 0.3) {
    const sq = easeInQuad(t / 0.3);
    return { squashY: lerp(1.0, 0.72, sq), wingFlap: lerp(0, 0.85, sq), squawkMouth: lerp(0, 1.0, sq), headBob: lerp(0, 8, sq) };
  } else if (t < 0.7) {
    const p = (t - 0.3) / 0.4;
    const reb = easeOutBack(p, 2.0);
    return { squashY: lerp(0.72, 1.12, reb), wingFlap: lerp(0.85, 0.2, p), squawkMouth: lerp(1.0, 0.3, p), headBob: lerp(8, -4, reb) };
  } else {
    const set = easeOutQuad((t - 0.7) / 0.3);
    return { squashY: lerp(1.12, 1.0, set), wingFlap: lerp(0.2, 0, set), squawkMouth: lerp(0.3, 0, set), headBob: lerp(-4, 0, set) };
  }
}

/** Mode 2: Trishu Muddy Puddle Splash Reaction */
export function getMudSplashReaction(
  jumpVelocity: number,
  isLanding: boolean,
  landingTimer: number = 0
): { squashY: number; armWave: number; dressSway: number } {
  if (isLanding) {
    const t = clamp(landingTimer / 0.25, 0, 1);
    return {
      squashY: 0.68 + 0.32 * easeOutQuad(t),
      armWave: Math.sin(landingTimer * 20) * 0.8 * (1 - t),
      dressSway: Math.sin(landingTimer * 15) * 6 * (1 - t)
    };
  }
  const squashY = clamp(1.0 - jumpVelocity * 0.0008, 0.85, 1.25);
  const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
  return { squashY, armWave: Math.sin(now * 0.01) * 0.4, dressSway: 0 };
}

/** Mode 4: Dad Overheat Reaction & Crash Panic */
export function getDaddyPigPanic(
  panicStage: number,
  time: number
): { shakeX: number; shakeY: number; eyeRadius: number; sweatCount: number; bellyBounce: number } {
  const stage = clamp(panicStage, 0, 4);
  if (stage === 0) return { shakeX: 0, shakeY: 0, eyeRadius: 3.0, sweatCount: 0, bellyBounce: 0 };
  const intensity = stage * 2.2;
  const shakeX = (Math.sin(time * 45) + Math.cos(time * 33)) * intensity * 0.5;
  const shakeY = (Math.cos(time * 50) + Math.sin(time * 28)) * intensity * 0.5;
  const eyeRadius = stage >= 3 ? 4.8 : stage >= 1 ? 3.8 : 3.0;
  const sweatCount = stage >= 3 ? 4 : stage >= 2 ? 2 : 1;
  const bellyBounce = Math.sin(time * (10 + stage * 5)) * stage * 2.0;
  return { shakeX, shakeY, eyeRadius, sweatCount, bellyBounce };
}

export const getDadPanic = getDaddyPigPanic;

/** Mode 3: Baby Chick Waddle & Peep */
export function getBabyChickWaddle(
  walkCycle: number,
  isPeeping: boolean = false
): { legAngle: number; headBob: number; wingAngle: number; beakOpen: number } {
  return {
    legAngle: Math.sin(walkCycle * 8) * 0.35,
    headBob: Math.abs(Math.sin(walkCycle * 8)) * 3,
    wingAngle: Math.sin(walkCycle * 16) * 0.25,
    beakOpen: isPeeping ? 1.0 : 0
  };
}

/** Mode 8: Mimi the Bunny Bubble Blowing Pose */
export function getBubbleBlowPose(
  blowTimer: number
): { mouthPucker: number; armAngle: number; wandAngle: number; wandScale: number } {
  const t = clamp(blowTimer, 0, 1);
  const pucker = Math.sin(t * Math.PI);
  const armAngle = easeInOutQuad(pucker) * 0.45;
  return { mouthPucker: pucker, armAngle, wandAngle: armAngle * 1.1, wandScale: 1.0 + Math.sin(t * Math.PI * 4) * 0.05 * pucker };
}

/** Mode 5: Leo Balloon Pop Startle Reaction */
export function getBalloonPopReaction(
  popTimer: number
): { surpriseScale: number; eyeWiden: number; dinoJump: number } {
  const t = clamp(popTimer / 0.4, 0, 1);
  if (t === 0 || t === 1) return { surpriseScale: 1.0, eyeWiden: 1.0, dinoJump: 0 };
  const bounce = easeOutElastic(1 - t);
  return { surpriseScale: 1.0 + bounce * 0.18, eyeWiden: 1.0 + bounce * 0.4, dinoJump: -bounce * 15 };
}
