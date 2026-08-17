/**
 * Mobile Vibration & Tactile Feedback Subsystem
 */
export const Haptics = {
  tap(): void {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(10);
      } catch (_) {}
    }
  },
  medium(): void {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(22);
      } catch (_) {}
    }
  },
  heavy(): void {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(35);
      } catch (_) {}
    }
  },
  fanfare(): void {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate([20, 40, 20, 40, 30]);
      } catch (_) {}
    }
  }
};
