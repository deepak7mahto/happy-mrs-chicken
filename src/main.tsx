import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { registerServiceWorker } from './pwa/registerServiceWorker';
import { StorageManager } from './engine/StorageManager';
import { soundEngine } from './engine/SoundEngine';

// Synchronous default test harness bridge
if (typeof window !== 'undefined') {
  const initialStorage = new StorageManager();
  let _scene = 'MENU';
  let _score = 0;

  if (!(window as unknown as { __GAME_STATE__: unknown }).__GAME_STATE__) {
    (window as unknown as { __GAME_STATE__: unknown }).__GAME_STATE__ = {
      get currentScene() { return _scene; },
      set currentScene(v: string) { _scene = v; },
      get currentMode() { return _scene; },
      set currentMode(v: string) { _scene = v; },
      get scene() { return _scene; },
      set scene(v: string) { _scene = v; },
      get score() { return _score; },
      set score(v: number) { _score = v; },
      get highScores() { return initialStorage.data.highScores; },
      get isPaused() { return false; },
      set isPaused(_v: boolean) {},
      get isAudioMuted() { return initialStorage.isMuted(); },
      set isAudioMuted(v: boolean) {
        initialStorage.setMuted(v);
        soundEngine.setMuted(v);
      },
      get audioMuted() { return initialStorage.isMuted(); },
      set audioMuted(v: boolean) {
        initialStorage.setMuted(v);
        soundEngine.setMuted(v);
      },
      get entities() {
        return { eggs: [], chicks: [], puddles: [], seeds: [], particles: [] };
      },
      get modeState() {
        return { timer: 60, feverMeter: 0, multiplier: 1, coopSavedCount: 0, isOverheating: false };
      },
      modesAvailable: ['EGG_LAYING', 'MUDDY_PUDDLES', 'CHICK_MAZE', 'DADDY_PIG']
    };
  }

  if (!(window as unknown as { __SCENE_MANAGER__: unknown }).__SCENE_MANAGER__) {
    (window as unknown as { __SCENE_MANAGER__: unknown }).__SCENE_MANAGER__ = {
      changeScene: (id: string) => { _scene = id; },
      switchScene: (id: string) => { _scene = id; }
    };
  }
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

registerServiceWorker();
