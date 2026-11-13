/**
 * Zero-Dependency Spoken Voice Narrator
 * Uses native Web Speech API (window.speechSynthesis)
 * Adventures of Trishu Preschool Suite
 * Strictly under 500 lines
 */

import { soundEngine } from './index';

export interface VoiceNarratorOptions {
  pitch?: number;
  rate?: number;
  volume?: number;
  kidVoice?: boolean;
}

export class VoiceNarrator {
  private enabled: boolean = true;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.getVoices?.();
        if (typeof window.speechSynthesis.addEventListener === 'function') {
          window.speechSynthesis.addEventListener('voiceschanged', () => {
            try {
              window.speechSynthesis.getVoices?.();
            } catch {
              // Safe fallback
            }
          });
        }
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

  private findKidVoice(): SpeechSynthesisVoice | null {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
    try {
      const voices = window.speechSynthesis.getVoices?.();
      if (!voices || voices.length === 0) return null;
      const en = voices.filter(v => v.lang && v.lang.toLowerCase().startsWith('en'));
      const pool = en.length > 0 ? en : voices;
      const matched = pool.find(v => {
        const n = (v.name || '').toLowerCase();
        return n.includes('child') || n.includes('kid') || n.includes('junior') ||
               n.includes('samantha') || n.includes('victoria') || n.includes('karen') ||
               n.includes('moira') || n.includes('tessa') || n.includes('female');
      });
      return matched || pool[0] || null;
    } catch {
      return null;
    }
  }

  public speak(phrase: string, options: VoiceNarratorOptions = {}): void {
    if (!this.enabled || !phrase) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    try {
      if (typeof window.speechSynthesis.cancel === 'function') {
        window.speechSynthesis.cancel();
      }

      const SpeechCtor = (window as any).SpeechSynthesisUtterance || (globalThis as any).SpeechSynthesisUtterance;
      if (!SpeechCtor) return;

      const utterance = new SpeechCtor(phrase);
      if (options.kidVoice) {
        utterance.pitch = options.pitch ?? 1.45;
        utterance.rate = options.rate ?? 0.95;
        const voice = this.findKidVoice();
        if (voice) {
          utterance.voice = voice;
        }
      } else {
        utterance.pitch = options.pitch ?? 1.15;
        utterance.rate = options.rate ?? 0.92;
      }
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

  public speakKids(word: string, options: VoiceNarratorOptions = {}): void {
    this.speak(word, {
      ...options,
      kidVoice: true
    });
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
