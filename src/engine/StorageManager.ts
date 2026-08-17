import { StorageData, HighScores } from '../types/game';

export class StorageManager {
  private key: string = 'hmc_game_data_v1';
  public data: StorageData;

  constructor() {
    this.data = this.load();
  }

  load(): StorageData {
    try {
      const raw = localStorage.getItem(this.key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          return {
            highScores: {
              eggLaying: Number(parsed.highScores?.eggLaying) || 0,
              muddyPuddles: Number(parsed.highScores?.muddyPuddles) || 0,
              chickMaze: Number(parsed.highScores?.chickMaze) || 0,
              daddyPig: Number(parsed.highScores?.daddyPig) || 0
            },
            settings: {
              soundMuted: Boolean(parsed.settings?.soundMuted),
              musicMuted: Boolean(parsed.settings?.musicMuted),
              volume: typeof parsed.settings?.volume === 'number' ? parsed.settings.volume : 1.0
            },
            version: 1
          };
        }
      }
    } catch (e) {
      console.warn('Storage read fallback:', e);
    }

    return {
      highScores: { eggLaying: 0, muddyPuddles: 0, chickMaze: 0, daddyPig: 0 },
      settings: { soundMuted: false, musicMuted: false, volume: 1.0 },
      version: 1
    };
  }

  save(): boolean {
    try {
      localStorage.setItem(this.key, JSON.stringify(this.data));
      return true;
    } catch (e) {
      console.warn('Storage save fallback:', e);
      return false;
    }
  }

  getHighScore(modeKey: keyof HighScores): number {
    return this.data.highScores[modeKey] || 0;
  }

  saveHighScore(modeKey: keyof HighScores, score: number): boolean {
    if (score > this.getHighScore(modeKey)) {
      this.data.highScores[modeKey] = score;
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
}
