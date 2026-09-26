/**
 * Zero-Dependency Spoken Voice Narrator
 * Uses native Web Speech API (window.speechSynthesis)
 * Adventures of Trishu Preschool Suite
 * Strictly under 500 lines
 */

import { soundEngine } from './index';

export class VoiceNarrator {
  private enabled: boolean = true;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.getVoices?.();
      } catch {
        // Safe fallback
      }
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public setEnabled(val: boolean): void {
    this.enabled = val;
    if (!val && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // Safe fallback
      }
    }
  }

  public speak(phrase: string, options: { pitch?: number; rate?: number; volume?: number } = {}): void {
    if (!this.enabled || !phrase) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    try {
      if (typeof window.speechSynthesis.cancel === 'function') {
        window.speechSynthesis.cancel();
      }

      const SpeechCtor = (window as any).SpeechSynthesisUtterance || (globalThis as any).SpeechSynthesisUtterance;
      if (!SpeechCtor) return;

      const utterance = new SpeechCtor(phrase);
      utterance.pitch = options.pitch ?? 1.15;
      utterance.rate = options.rate ?? 0.92;
      utterance.volume = options.volume ?? (soundEngine.holder ? soundEngine.holder.volume : 1.0);

      // Duck BGM while speaking
      soundEngine.duckBGM(0.4);

      utterance.onend = () => {
        soundEngine.duckBGM(1.0);
        this.currentUtterance = null;
      };

      utterance.onerror = () => {
        soundEngine.duckBGM(1.0);
        this.currentUtterance = null;
      };

      this.currentUtterance = utterance;
      window.speechSynthesis.speak(utterance);
    } catch {
      soundEngine.duckBGM(1.0);
    }
  }

  public stop(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // Safe fallback
      }
    }
    soundEngine.duckBGM(1.0);
  }
}

export const voiceNarrator = new VoiceNarrator();
