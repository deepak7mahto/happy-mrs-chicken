import { storageManager } from './StorageManager';

/**
 * Mobile Vibration & Tactile Feedback Subsystem
 */
export const Haptics = {
  tap(): void {
    if (!storageManager.data.settings.hapticsEnabled) return;
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(10);
      } catch (_) {}
    }
  },
  medium(): void {
    if (!storageManager.data.settings.hapticsEnabled) return;
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(22);
      } catch (_) {}
    }
  },
  heavy(): void {
    if (!storageManager.data.settings.hapticsEnabled) return;
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(35);
      } catch (_) {}
    }
  },
  fanfare(): void {
    if (!storageManager.data.settings.hapticsEnabled) return;
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate([20, 40, 20, 40, 30]);
      } catch (_) {}
    }
  },
  success(): void {
    this.fanfare();
  }
};
