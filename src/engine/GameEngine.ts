import { DisplayManager } from './DisplayManager';
import { InputManager } from './InputManager';
import { StorageManager } from './StorageManager';
import { GameLoop } from './GameLoop';
import { soundEngine } from './SoundEngine';
import { BaseScene } from '../modes/BaseScene';
import { MenuScene } from '../modes/MenuScene';
import { EggLayingScene } from '../modes/EggLayingScene';
import { MuddyPuddlesScene } from '../modes/MuddyPuddlesScene';
import { ChickMazeScene } from '../modes/ChickMazeScene';
import { DaddyPigScene } from '../modes/DaddyPigScene';
import { GameModeId } from '../types/game';

export class GameEngine {
  public display: DisplayManager;
  public input: InputManager;
  public storage: StorageManager;
  public gameLoop: GameLoop;
  public scenes: Map<GameModeId, BaseScene> = new Map();
  public currentSceneId: GameModeId = 'MENU';
  public onSceneChangeCallback?: (mode: GameModeId) => void;

  constructor(canvas: HTMLCanvasElement) {
    this.storage = new StorageManager();
    this.display = new DisplayManager(canvas);
    this.input = new InputManager(this.display);

    this.scenes.set('MENU', new MenuScene(this));
    this.scenes.set('EGG_LAYING', new EggLayingScene(this));
    this.scenes.set('MUDDY_PUDDLES', new MuddyPuddlesScene(this));
    this.scenes.set('CHICK_MAZE', new ChickMazeScene(this));
    this.scenes.set('DADDY_PIG', new DaddyPigScene(this));

    this.gameLoop = new GameLoop(
      (dt, isPaused) => this.update(dt, isPaused),
      (alpha) => this.render(alpha)
    );

    this.setupIntrospectionHooks();
  }

  get activeScene(): BaseScene | undefined {
    return this.scenes.get(this.currentSceneId);
  }

  changeScene(sceneId: GameModeId): void {
    if (this.activeScene) {
      this.activeScene.exit();
    }
    this.currentSceneId = sceneId;
    const next = this.scenes.get(sceneId);
    if (next) {
      next.enter();
    }
    if (this.onSceneChangeCallback) {
      this.onSceneChangeCallback(sceneId);
    }
  }

  start(): void {
    this.display.syncResize();
    const active = this.activeScene;
    if (active) active.enter();
    this.gameLoop.start();
  }

  destroy(): void {
    this.gameLoop.stop();
    this.input.detach();
    this.display.destroy();
  }

  toggleFullscreen(): void {
    try {
      if (!document.fullscreenElement && !(document as unknown as { webkitFullscreenElement: Element }).webkitFullscreenElement) {
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else if ((document.documentElement as unknown as { webkitRequestFullscreen: () => void }).webkitRequestFullscreen) {
          (document.documentElement as unknown as { webkitRequestFullscreen: () => void }).webkitRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        } else if ((document as unknown as { webkitExitFullscreen: () => void }).webkitExitFullscreen) {
          (document as unknown as { webkitExitFullscreen: () => void }).webkitExitFullscreen();
        }
      }
    } catch (_) {}
  }

  update(dt: number, isPaused: boolean = false): void {
    if (this.input.isKeyJustPressed('KeyM')) {
      const newMute = !this.storage.isMuted();
      this.storage.setMuted(newMute);
      soundEngine.setMuted(newMute);
    }

    if (this.input.isKeyJustPressed('Escape') || this.input.isKeyJustPressed('KeyP')) {
      if (this.currentSceneId !== 'MENU') {
        this.gameLoop.isPaused = !this.gameLoop.isPaused;
      }
    }

    if (!isPaused && this.activeScene) {
      this.activeScene.update(dt, this.input);
    }
    this.input.postUpdate();
  }

  render(alpha: number): void {
    this.display.beginFrame();
    if (this.activeScene) {
      this.activeScene.render(this.display.ctx, alpha, this.display);
    }
    this.display.endFrame();
  }

  setupIntrospectionHooks(): void {
    const self = this;
    const existingScene = (window as unknown as { __GAME_STATE__?: { currentScene?: GameModeId } }).__GAME_STATE__?.currentScene;
    if (existingScene && existingScene !== 'MENU' && self.scenes.has(existingScene)) {
      self.changeScene(existingScene);
    }

    (window as unknown as { __GAME_STATE__: unknown }).__GAME_STATE__ = {
      get currentScene() { return self.currentSceneId; },
      set currentScene(v: GameModeId) { self.changeScene(v); },
      get currentMode() { return self.currentSceneId; },
      set currentMode(v: GameModeId) { self.changeScene(v); },
      get scene() { return self.currentSceneId; },
      set scene(v: GameModeId) { self.changeScene(v); },
      get modesAvailable() { return ['EGG_LAYING', 'MUDDY_PUDDLES', 'CHICK_MAZE', 'DADDY_PIG']; },
      get subState() {
        if (!self.activeScene) return 'IDLE';
        const st = self.activeScene.getModeState() as { isOverheating?: boolean; timer?: number };
        if (st.isOverheating || (st.timer !== undefined && st.timer <= 0)) return 'GAME_OVER';
        return 'PLAYING';
      },
      get score() {
        return self.activeScene ? self.activeScene.score : 0;
      },
      set score(v: number) {
        if (self.activeScene) self.activeScene.score = v;
      },
      get highScores() { return self.storage.data.highScores; },
      get isPaused() { return self.gameLoop.isPaused; },
      set isPaused(v: boolean) { self.gameLoop.isPaused = Boolean(v); },
      get isAudioMuted() { return self.storage.isMuted(); },
      set isAudioMuted(v: boolean) {
        self.storage.setMuted(v);
        soundEngine.setMuted(v);
      },
      get audioMuted() { return self.storage.isMuted(); },
      set audioMuted(v: boolean) {
        self.storage.setMuted(v);
        soundEngine.setMuted(v);
      },
      get entities() {
        return self.activeScene ? self.activeScene.getEntities() : { eggs: [], chicks: [], puddles: [], seeds: [], particles: [] };
      },
      get modeState() {
        return self.activeScene ? self.activeScene.getModeState() : { timer: 0, feverMeter: 0, multiplier: 1, coopSavedCount: 0, isOverheating: false };
      }
    };

    Object.defineProperty(window, '__FPS_MONITOR__', {
      get: () => ({
        currentFPS: self.gameLoop.fpsMonitor.currentFPS,
        avgFPS: self.gameLoop.fpsMonitor.avgFPS,
        averageFps: self.gameLoop.fpsMonitor.avgFPS,
        minFps: self.gameLoop.fpsMonitor.minFps,
        droppedFrames: self.gameLoop.fpsMonitor.droppedFrames,
        history: [...self.gameLoop.fpsMonitor.history]
      }),
      configurable: true,
      enumerable: true
    });

    (window as unknown as { __GAME_ENGINE__: GameEngine }).__GAME_ENGINE__ = self;
    (window as unknown as { __SCENE_MANAGER__: { changeScene: (id: GameModeId) => void; switchScene: (id: GameModeId) => void } }).__SCENE_MANAGER__ = {
      changeScene: (id: GameModeId) => self.changeScene(id),
      switchScene: (id: GameModeId) => self.changeScene(id)
    };
    (window as unknown as { __DISPLAY_MANAGER__: DisplayManager }).__DISPLAY_MANAGER__ = self.display;
  }
}
