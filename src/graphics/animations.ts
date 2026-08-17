export const AnimMath = {
  easeOutBack(t: number, overshoot: number = 1.70158): number {
    const p = t - 1;
    return p * p * ((overshoot + 1) * p + overshoot) + 1;
  },
  easeOutElastic(t: number): number {
    if (t === 0 || t === 1) return t;
    return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1;
  },
  easeInOutQuad(t: number): number {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  },
  preserveVolume(squashY: number): { scaleX: number; scaleY: number } {
    const clampedY = Math.max(0.2, squashY);
    const scaleX = 1.0 / Math.sqrt(clampedY);
    return { scaleX, scaleY: clampedY };
  }
};
