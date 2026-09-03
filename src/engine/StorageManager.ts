/**
 * StorageManager - LocalStorage persistence for 8-Game Mini-Game Suite
 * Adventures of Trishu 8-Game Suite
 */

import { StorageData, HighScores, IStorageManager } from '../types/storage';

const STORAGE_KEY = 'hmc_game_data_v1';

const DEFAULT_HIGH_SCORES: HighScores = {
  eggLaying: 0,
  muddyPuddles: 0,
  chickMaze: 0,
  daddyPig: 0,
  dinosaurBalloon: 0,
  pancakeFlipper: 0,
  vegetableHarvest: 0,
  hopscotchBubble: 0,
  mixMatch: 0,
  peekABoo: 0
};

const MODE_TO_SCORE_KEY: Record<string, keyof HighScores> = {
  // Enum Uppercase
  EGG_LAYING: 'eggLaying',
  MUDDY_PUDDLES: 'muddyPuddles',
  CHICK_MAZE: 'chickMaze',
  DADDY_PIG: 'daddyPig',
  DINOSAUR_BALLOON: 'dinosaurBalloon',
  PANCAKE_FLIPPER: 'pancakeFlipper',
  VEGETABLE_HARVEST: 'vegetableHarvest',
  HOPSCOTCH_BUBBLE: 'hopscotchBubble',
  MIX_MATCH: 'mixMatch',
  PEEK_A_BOO: 'peekABoo',

  // Kebab-case Slugs
  'classic': 'eggLaying',
  'egg-tap': 'vegetableHarvest',
  'chick-catch': 'hopscotchBubble',
  'mud-puddle': 'muddyPuddles',
  'pancake-flip': 'pancakeFlipper',
  'balloon-pop': 'dinosaurBalloon',
  'seed-sort': 'chickMaze',
  'dino-maze': 'daddyPig',
  'mix-match': 'mixMatch',
  'peek-a-boo': 'peekABoo',

  // CamelCase Keys
  eggLaying: 'eggLaying',
  muddyPuddles: 'muddyPuddles',
  chickMaze: 'chickMaze',
  daddyPig: 'daddyPig',
  dinosaurBalloon: 'dinosaurBalloon',
  pancakeFlipper: 'pancakeFlipper',
  vegetableHarvest: 'vegetableHarvest',
  hopscotchBubble: 'hopscotchBubble',
  mixMatch: 'mixMatch',
  peekABoo: 'peekABoo'
};

export class StorageManager implements IStorageManager {
  private key: string = STORAGE_KEY;
  public data: StorageData;

  constructor() {
    this.data = this.load();
  }

  private normalizeKey(modeOrKey: keyof HighScores | string): string {
    const str = String(modeOrKey);
    return (MODE_TO_SCORE_KEY[str] as string) || str;
  }

  load(): StorageData {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = localStorage.getItem(this.key);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === 'object') {
            const rawScores = parsed.highScores || {};
            const highScores: HighScores = {
              eggLaying: Number(rawScores.eggLaying) || 0,
              muddyPuddles: Number(rawScores.muddyPuddles) || 0,
              chickMaze: Number(rawScores.chickMaze) || 0,
              daddyPig: Number(rawScores.daddyPig) || 0,
              dinosaurBalloon: Number(rawScores.dinosaurBalloon) || 0,
              pancakeFlipper: Number(rawScores.pancakeFlipper) || 0,
              vegetableHarvest: Number(rawScores.vegetableHarvest) || 0,
              hopscotchBubble: Number(rawScores.hopscotchBubble) || 0,
              mixMatch: Number(rawScores.mixMatch) || 0,
              peekABoo: Number(rawScores.peekABoo) || 0
            };

            const rawSettings = parsed.settings || {};
            const settings = {
              soundMuted: Boolean(rawSettings.soundMuted),
              musicMuted: Boolean(rawSettings.musicMuted),
              volume: typeof rawSettings.volume === 'number' ? Math.max(0, Math.min(1, rawSettings.volume)) : 1.0,
              hapticsEnabled: rawSettings.hapticsEnabled !== undefined ? Boolean(rawSettings.hapticsEnabled) : true
            };

            return { highScores, settings, version: 1, lastSaved: Date.now() };
          }
        }
      }
    } catch (e) {
      console.warn('StorageManager load error (falling back to defaults):', e);
    }

    return {
      highScores: { ...DEFAULT_HIGH_SCORES },
      settings: { soundMuted: false, musicMuted: false, volume: 1.0, hapticsEnabled: true },
      version: 1,
      lastSaved: Date.now()
    };
  }

  save(): boolean {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        this.data.lastSaved = Date.now();
        localStorage.setItem(this.key, JSON.stringify(this.data));
        return true;
      }
    } catch (e) {
      console.warn('StorageManager save error:', e);
    }
    return false;
  }

  getHighScore(modeOrKey: keyof HighScores | string): number {
    const key = this.normalizeKey(modeOrKey);
    return this.data.highScores[key] || 0;
  }

  saveHighScore(modeOrKey: keyof HighScores | string, score: number): boolean {
    const key = this.normalizeKey(modeOrKey);
    const current = this.data.highScores[key] || 0;
    if (score > current) {
      this.data.highScores[key] = score;
      this.save();
      return true;
    }
    return false;
  }

  isMuted(): boolean {
    return Boolean(this.data.settings.soundMuted);
  }

  setMuted(muted: boolean): void {
    this.data.settings.soundMuted = Boolean(muted);
    this.save();
  }

  isMusicMuted(): boolean {
    return Boolean(this.data.settings.musicMuted);
  }

  setMusicMuted(muted: boolean): void {
    this.data.settings.musicMuted = Boolean(muted);
    this.save();
  }

  getVolume(): number {
    return this.data.settings.volume;
  }

  setVolume(volume: number): void {
    this.data.settings.volume = Math.max(0, Math.min(1, volume));
    this.save();
  }

  resetAll(): void {
    this.data = {
      highScores: { ...DEFAULT_HIGH_SCORES },
      settings: { soundMuted: false, musicMuted: false, volume: 1.0, hapticsEnabled: true },
      version: 1,
      lastSaved: Date.now()
    };
    this.save();
  }
}
