/**
 * StorageManager - LocalStorage persistence for 8-Game Mini-Game Suite
 * Adventures of Trishu 8-Game Suite
 */

import { StorageData, HighScores, IStorageManager, SettingsState } from '../types/storage';
import { CharacterId } from '../types/characters';
import { StoryProgress } from '../types/story';
import { STORY_STOPS } from '../story/storyData';

const STORAGE_KEY = 'hmc_game_data_v1';

const VALID_AVATARS: Set<string> = new Set([
  'peppa', 'george', 'daddyPig', 'mummyPig', 'grandpaPig', 'suzySheep',
  'trishu', 'leo', 'dad', 'mom', 'grandpa', 'mimi',
  'chicken', 'chick', 'duck'
]);

const DEFAULT_STORY_PROGRESS: StoryProgress = {
  currentStopIndex: 0,
  completedStops: {},
  passportStamps: [],
  viewMode: 'grid',
  hasCompletedGrandFinale: false
};

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
  peekABoo: 0,
  iceCreamVan: 0,
  littleTrain: 0,
  carWash: 0,
  windyKite: 0,
  rainbowGarden: 0,
  duckPicnic: 0
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
  ICE_CREAM_VAN: 'iceCreamVan',
  LITTLE_TRAIN: 'littleTrain',
  CAR_WASH: 'carWash',
  WINDY_KITE: 'windyKite',
  RAINBOW_GARDEN: 'rainbowGarden',
  DUCK_PICNIC: 'duckPicnic',

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
  'ice-cream-van': 'iceCreamVan',
  'little-train': 'littleTrain',
  'car-wash': 'carWash',
  'windy-kite': 'windyKite',
  'rainbow-garden': 'rainbowGarden',
  'duck-picnic': 'duckPicnic',

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
  peekABoo: 'peekABoo',
  iceCreamVan: 'iceCreamVan',
  littleTrain: 'littleTrain',
  carWash: 'carWash',
  windyKite: 'windyKite',
  rainbowGarden: 'rainbowGarden',
  duckPicnic: 'duckPicnic'
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
              peekABoo: Number(rawScores.peekABoo) || 0,
              iceCreamVan: Number(rawScores.iceCreamVan) || 0,
              littleTrain: Number(rawScores.littleTrain) || 0,
              carWash: Number(rawScores.carWash) || 0,
              windyKite: Number(rawScores.windyKite) || 0,
              rainbowGarden: Number(rawScores.rainbowGarden) || 0,
              duckPicnic: Number(rawScores.duckPicnic) || 0
            };

            const rawSettings = parsed.settings || {};
            const settings: SettingsState = {
              soundMuted: Boolean(rawSettings.soundMuted),
              musicMuted: Boolean(rawSettings.musicMuted),
              volume: typeof rawSettings.volume === 'number' ? Math.max(0, Math.min(1, rawSettings.volume)) : 1.0,
              bgmVolume: typeof rawSettings.bgmVolume === 'number' ? Math.max(0, Math.min(1, rawSettings.bgmVolume)) : 0.7,
              sfxVolume: typeof rawSettings.sfxVolume === 'number' ? Math.max(0, Math.min(1, rawSettings.sfxVolume)) : 0.9,
              hapticsEnabled: rawSettings.hapticsEnabled !== undefined ? Boolean(rawSettings.hapticsEnabled) : true,
              toddlerLock: Boolean(rawSettings.toddlerLock),
              selectedAvatar: (rawSettings.selectedAvatar && VALID_AVATARS.has(rawSettings.selectedAvatar))
                ? (rawSettings.selectedAvatar as CharacterId)
                : 'peppa'
            };

            const rawStory = parsed.storyProgress || {};
            const storyProgress: StoryProgress = {
              currentStopIndex: typeof rawStory.currentStopIndex === 'number'
                ? Math.max(0, Math.min(15, rawStory.currentStopIndex))
                : 0,
              completedStops: typeof rawStory.completedStops === 'object' && rawStory.completedStops
                ? rawStory.completedStops
                : {},
              passportStamps: Array.isArray(rawStory.passportStamps)
                ? rawStory.passportStamps
                : [],
              viewMode: rawStory.viewMode === 'journey' ? 'journey' : 'grid',
              hasCompletedGrandFinale: Boolean(rawStory.hasCompletedGrandFinale)
            };

            return { highScores, settings, storyProgress, version: 1, lastSaved: Date.now() };
          }
        }
      }
    } catch (e) {
      console.warn('StorageManager load error (falling back to defaults):', e);
    }

    return {
      highScores: { ...DEFAULT_HIGH_SCORES },
      settings: {
        soundMuted: false,
        musicMuted: false,
        volume: 1.0,
        bgmVolume: 0.7,
        sfxVolume: 0.9,
        hapticsEnabled: true,
        toddlerLock: false,
        selectedAvatar: 'peppa'
      },
      storyProgress: { ...DEFAULT_STORY_PROGRESS, completedStops: {} },
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

  getBgmVolume(): number {
    return typeof this.data.settings.bgmVolume === 'number' ? this.data.settings.bgmVolume : 0.7;
  }

  setBgmVolume(volume: number): void {
    this.data.settings.bgmVolume = Math.max(0, Math.min(1, volume));
    this.save();
  }

  getSfxVolume(): number {
    return typeof this.data.settings.sfxVolume === 'number' ? this.data.settings.sfxVolume : 0.9;
  }

  setSfxVolume(volume: number): void {
    this.data.settings.sfxVolume = Math.max(0, Math.min(1, volume));
    this.save();
  }

  isHapticsEnabled(): boolean {
    return this.data.settings.hapticsEnabled !== false;
  }

  setHapticsEnabled(enabled: boolean): void {
    this.data.settings.hapticsEnabled = Boolean(enabled);
    this.save();
  }

  isToddlerLockEnabled(): boolean {
    return Boolean(this.data.settings.toddlerLock);
  }

  setToddlerLockEnabled(enabled: boolean): void {
    this.data.settings.toddlerLock = Boolean(enabled);
    this.save();
  }

  getSelectedAvatar(): CharacterId {
    return this.data.settings.selectedAvatar || 'peppa';
  }

  setSelectedAvatar(avatar: CharacterId): void {
    if (VALID_AVATARS.has(avatar)) {
      this.data.settings.selectedAvatar = avatar;
      this.save();
    }
  }

  resetHighScores(): void {
    this.data.highScores = { ...DEFAULT_HIGH_SCORES };
    this.save();
  }

  getStoryProgress(): StoryProgress {
    if (!this.data.storyProgress) {
      this.data.storyProgress = { ...DEFAULT_STORY_PROGRESS, completedStops: {} };
    }
    return this.data.storyProgress;
  }

  saveStoryProgress(progress: StoryProgress): boolean {
    this.data.storyProgress = progress;
    return this.save();
  }

  getStoryViewMode(): 'journey' | 'grid' {
    return this.getStoryProgress().viewMode || 'grid';
  }

  setStoryViewMode(mode: 'journey' | 'grid'): void {
    const progress = this.getStoryProgress();
    progress.viewMode = mode;
    this.save();
  }

  getCurrentStoryStopIndex(): number {
    return this.getStoryProgress().currentStopIndex;
  }

  setCurrentStoryStopIndex(index: number): void {
    const progress = this.getStoryProgress();
    progress.currentStopIndex = Math.max(0, Math.min(15, index));
    this.save();
  }

  completeStoryStop(stopIndex: number, score: number, stars: number = 3): { unlockedNext: boolean; newStamp?: string } {
    const progress = this.getStoryProgress();
    const stop = STORY_STOPS[stopIndex];
    if (!stop) return { unlockedNext: false };

    const existing = progress.completedStops[stop.id];
    const prevStars = existing?.stars || 0;
    const prevScore = existing?.bestScore || 0;

    progress.completedStops[stop.id] = {
      completed: true,
      stars: Math.max(stars, prevStars),
      bestScore: Math.max(score, prevScore),
      timestamp: Date.now()
    };

    let newStamp: string | undefined;
    if (!progress.passportStamps.includes(stop.stampId)) {
      progress.passportStamps.push(stop.stampId);
      newStamp = stop.stampId;
    }

    let unlockedNext = false;
    if (progress.currentStopIndex <= stopIndex && stopIndex < 15) {
      progress.currentStopIndex = stopIndex + 1;
      unlockedNext = true;
    } else if (stopIndex === 15) {
      progress.hasCompletedGrandFinale = true;
    }

    this.save();
    return { unlockedNext, newStamp };
  }

  hasPassportStamp(stampId: string): boolean {
    return this.getStoryProgress().passportStamps.includes(stampId);
  }

  resetAll(): void {
    this.data = {
      highScores: { ...DEFAULT_HIGH_SCORES },
      settings: {
        soundMuted: false,
        musicMuted: false,
        volume: 1.0,
        bgmVolume: 0.7,
        sfxVolume: 0.9,
        hapticsEnabled: true,
        toddlerLock: false,
        selectedAvatar: 'peppa'
      },
      storyProgress: { ...DEFAULT_STORY_PROGRESS, completedStops: {} },
      version: 1,
      lastSaved: Date.now()
    };
    this.save();
  }
}

export const storageManager = new StorageManager();
