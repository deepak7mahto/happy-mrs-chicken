/**
 * Main Application Bootstrap
 * Adventures of Trishu — 16-Game Preschool Suite
 * Pure Vanilla TypeScript & PixiJS v8 Ready
 * Strictly under 500 lines
 */

import './styles/main.css';
import { GameEngine } from './engine/GameEngine';
import { UIManager } from './ui/UIManager';
import { Router } from './engine/Router';
import { pwaManager } from './pwa/PwaManager';
import { soundEngine } from './engine/SoundEngine';

function initApp(): void {
  const root = document.getElementById('root') || document.body;

  let gameContainer = document.getElementById('game-container');
  if (!gameContainer) {
    gameContainer = document.createElement('div');
    gameContainer.id = 'game-container';
    root.appendChild(gameContainer);
  }

  let canvas = document.getElementById('gameCanvas') as HTMLCanvasElement | null;
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'gameCanvas';
    gameContainer.appendChild(canvas);
  }

  let uiContainer = document.getElementById('ui-overlay');
  if (!uiContainer) {
    uiContainer = document.createElement('div');
    uiContainer.id = 'ui-overlay';
    root.appendChild(uiContainer);
  }

  // 1. Initialize Engine
  const engine = new GameEngine(canvas);

  // 2. Initialize UI Manager (HUD, Modals, Tap Feedback)
  const uiManager = new UIManager(engine, uiContainer);

  // 3. Initialize URL Router
  const router = new Router((modeId) => {
    if (engine.currentSceneId !== modeId) {
      engine.changeScene(modeId);
    }
  });

  const origSceneChange = engine.onSceneChangeCallback;
  engine.onSceneChangeCallback = (modeId) => {
    router.setRoute(modeId);
    if (origSceneChange) origSceneChange(modeId);
  };

  // Initial route
  const initialMode = router.getInitialMode();
  if (initialMode !== 'MENU') {
    engine.changeScene(initialMode);
  }

  // 4. Start Engine Game Loop
  engine.start();

  // 5. Unlock Web Audio on first user interaction
  const unlockAudio = () => {
    soundEngine.unlock();
    pwaManager.requestWakeLock();
    window.removeEventListener('pointerdown', unlockAudio);
    window.removeEventListener('keydown', unlockAudio);
  };
  window.addEventListener('pointerdown', unlockAudio, { passive: true });
  window.addEventListener('keydown', unlockAudio, { passive: true });

  // 6. Request Screen Wake Lock & manage audio on visibility changes / app switching
  pwaManager.requestWakeLock();

  const handleAppHidden = () => {
    soundEngine.pauseAll();
  };

  const handleAppVisible = () => {
    pwaManager.requestWakeLock();
    soundEngine.resumeAll();
  };

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      handleAppHidden();
    } else if (document.visibilityState === 'visible') {
      handleAppVisible();
    }
  });

  window.addEventListener('pagehide', handleAppHidden);
  window.addEventListener('pageshow', handleAppVisible);

  // Ensure canvas updates when custom fonts are ready
  if (typeof document !== 'undefined' && 'fonts' in document) {
    document.fonts.ready.then(() => {
      engine.display.syncResize();
    }).catch(() => {});
  }

  // Expose global for debugging & tests
  (window as unknown as { __GAME_ENGINE__?: GameEngine }).__GAME_ENGINE__ = engine;
  (window as unknown as { __UI_MANAGER__?: UIManager }).__UI_MANAGER__ = uiManager;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
