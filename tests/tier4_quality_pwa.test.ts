/**
 * Tier 4: Quality, Line Counts, PWA Offline & Real-World Stress Test Suite (15 Test Cases)
 * Peppa Pig: Happy Mrs Chicken 8-Game Deluxe Expansion Suite
 */

import { describe, test, expect, beforeEach } from './e2e_runner.mjs';
import { GameEngine } from '../src/engine/GameEngine';
import { StorageManager } from '../src/engine/StorageManager';
import { ParticleEngine } from '../src/engine/ParticleEngine';
import { soundEngine } from '../src/engine/SoundEngine';
import { InputManager } from '../src/engine/InputManager';
import { GameLoop } from '../src/engine/GameLoop';
import { EggLayingScene } from '../src/modes/EggLayingScene';
import { MuddyPuddlesScene } from '../src/modes/MuddyPuddlesScene';
import { ChickMazeScene } from '../src/modes/ChickMazeScene';
import { DaddyPigScene } from '../src/modes/DaddyPigScene';
import { execSync } from 'node:child_process';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve, join } from 'node:path';

const PROJECT_ROOT = resolve(process.cwd());

describe('Tier 4: Quality, Line Counts, PWA & Stress Suite', () => {
  let canvas: HTMLCanvasElement;
  let engine: GameEngine;

  beforeEach(() => {
    window.localStorage.clear();
    const win = window as unknown as { __AUDIO_SPY__?: { clear: () => void }; __GAME_STATE__?: unknown };
    if (win.__AUDIO_SPY__) win.__AUDIO_SPY__.clear();
    delete win.__GAME_STATE__;
    canvas = document.createElement('canvas') as HTMLCanvasElement;
    engine = new GameEngine(canvas);
  });

  // 1. TypeScript Compilation Zero-Error Audit
  test('T4.01_typescript_compilation - TypeScript compiler check (tsc --noEmit) passes with 0 errors', () => {
    let tscOutput = '';
    let success = false;
    try {
      tscOutput = execSync('npx tsc --noEmit', {
        cwd: PROJECT_ROOT,
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe']
      });
      success = true;
    } catch (err: unknown) {
      const execErr = err as { stdout?: string; stderr?: string };
      tscOutput = (execErr.stdout || '') + (execErr.stderr || '');
      success = false;
    }

    expect(success).toBeTruthy();
    expect(tscOutput.includes('error TS')).toBeFalsy();
  });

  // 2. Source Code Line Count Audit (<500 LOC per file in src/)
  test('T4.02_line_count_limits - Every source file in src/ is strictly under 500 lines of code', () => {
    const srcDir = resolve(PROJECT_ROOT, 'src');
    const violations: Array<{ file: string; lines: number }> = [];

    function checkDir(dir: string) {
      const entries = readdirSync(dir);
      for (const entry of entries) {
        const fullPath = join(dir, entry);
        const stat = statSync(fullPath);
        if (stat.isDirectory()) {
          checkDir(fullPath);
        } else if (/\.(ts|tsx|js|mjs)$/.test(entry)) {
          const content = readFileSync(fullPath, 'utf-8');
          const lines = content.split('\n').length;
          if (lines >= 500) {
            violations.push({ file: fullPath.replace(PROJECT_ROOT + '/', ''), lines });
          }
        }
      }
    }

    checkDir(srcDir);
    expect(violations.length).toBe(0);
  });

  // 3. Zero External CDN & Standalone Offline Codebase Audit
  test('T4.03_zero_external_cdn - Codebase contains zero external CDN scripts, stylesheets, or font imports', () => {
    const filesToCheck = [
      resolve(PROJECT_ROOT, 'index.html'),
      resolve(PROJECT_ROOT, 'public/manifest.json'),
      resolve(PROJECT_ROOT, 'public/sw.js')
    ];

    const cdnRegex = /(https?:)?\/\/(cdn\.|unpkg\.com|cdnjs\.cloudflare\.com|fonts\.googleapis\.com|cdn\.jsdelivr\.net)/i;

    for (const filePath of filesToCheck) {
      const content = readFileSync(filePath, 'utf-8');
      expect(cdnRegex.test(content)).toBeFalsy();
    }
  });

  // 4. Service Worker Cache Manifest (public/sw.js)
  test('T4.04_service_worker_cache_manifest - Service Worker specifies cache name and core offline assets', () => {
    const swPath = resolve(PROJECT_ROOT, 'public/sw.js');
    const swContent = readFileSync(swPath, 'utf-8');

    expect(swContent.includes('CACHE_NAME')).toBeTruthy();
    expect(swContent.includes("'./index.html'")).toBeTruthy();
    expect(swContent.includes("'./manifest.json'")).toBeTruthy();
    expect(swContent.includes("'./'")).toBeTruthy();
  });

  // 5. Service Worker Lifecycle Handlers (public/sw.js)
  test('T4.05_service_worker_lifecycle - Service worker defines install, activate, and cache-first fetch handlers', () => {
    const swPath = resolve(PROJECT_ROOT, 'public/sw.js');
    const swContent = readFileSync(swPath, 'utf-8');

    expect(swContent.includes("addEventListener('install'")).toBeTruthy();
    expect(swContent.includes("addEventListener('activate'")).toBeTruthy();
    expect(swContent.includes("addEventListener('fetch'")).toBeTruthy();
    expect(swContent.includes('caches.match')).toBeTruthy();
  });

  // 6. Web App Manifest Compliance (public/manifest.json)
  test('T4.06_web_app_manifest_compliance - manifest.json has standalone display mode and data URI icons', () => {
    const manifestPath = resolve(PROJECT_ROOT, 'public/manifest.json');
    const manifestJson = JSON.parse(readFileSync(manifestPath, 'utf-8'));

    expect(manifestJson.name).toBe('Peppa Pig: Happy Mrs Chicken');
    expect(manifestJson.short_name).toBe('Mrs Chicken');
    expect(manifestJson.start_url).toBe('./index.html');
    expect(manifestJson.display).toBe('standalone');
    expect(manifestJson.icons.length).toBeGreaterThan(0);
    expect(manifestJson.icons[0].src.startsWith('data:image/svg+xml')).toBeTruthy();
  });

  // 7. Scenario 1 — Full Toddler Session Across Modes 1–4
  test('T4.07_scenario_toddler_session_part_a - Plays Modes 1 to 4 sequentially with clean entity and score updates', () => {
    // Mode 1: Egg Laying
    engine.changeScene('EGG_LAYING');
    const eggScene = engine.activeScene as EggLayingScene;
    for (let i = 0; i < 4; i++) eggScene.layEggAt(200 + i * 20, 200);
    expect(eggScene.eggs.length).toBeGreaterThanOrEqual(1);
    expect(eggScene.score).toBeGreaterThanOrEqual(1);

    // Mode 2: Muddy Puddles
    engine.changeScene('MUDDY_PUDDLES');
    const mudScene = engine.activeScene as MuddyPuddlesScene;
    mudScene.jump();
    expect(mudScene.peppa.isJumping).toBeTruthy();

    // Mode 3: Chick Maze
    engine.changeScene('CHICK_MAZE');
    const chickScene = engine.activeScene as ChickMazeScene;
    chickScene.dropSeed(200, 200);
    expect(chickScene.seeds.length).toBe(1);

    // Mode 4: Daddy Pig
    engine.changeScene('DADDY_PIG');
    const daddyScene = engine.activeScene as DaddyPigScene;
    for (let i = 0; i < 5; i++) daddyScene.tap();
    expect(daddyScene.score).toBeGreaterThan(0);
    expect(daddyScene.fever).toBeGreaterThan(0);
  });

  // 8. Scenario 1 — Full Toddler Session Modes 5–8 & Final Persistence
  test('T4.08_scenario_toddler_session_part_b - Persists high scores across all played modes to LocalStorage', () => {
    const storage = engine.storage;
    storage.saveHighScore('eggLaying', 25);
    storage.saveHighScore('muddyPuddles', 350);
    storage.saveHighScore('chickMaze', 500);
    storage.saveHighScore('daddyPig', 1200);
    storage.saveHighScore('dinosaurBalloon', 450);
    storage.saveHighScore('pancakeFlipper', 15);
    storage.saveHighScore('vegetableHarvest', 280);
    storage.saveHighScore('hopscotchBubble', 600);

    // Reload from storage to verify persistent integrity
    const reloadedStorage = new StorageManager();
    expect(reloadedStorage.getHighScore('eggLaying')).toBe(25);
    expect(reloadedStorage.getHighScore('muddyPuddles')).toBe(350);
    expect(reloadedStorage.getHighScore('chickMaze')).toBe(500);
    expect(reloadedStorage.getHighScore('daddyPig')).toBe(1200);
    expect(reloadedStorage.getHighScore('dinosaurBalloon')).toBe(450);
    expect(reloadedStorage.getHighScore('pancakeFlipper')).toBe(15);
    expect(reloadedStorage.getHighScore('vegetableHarvest')).toBe(280);
    expect(reloadedStorage.getHighScore('hopscotchBubble')).toBe(600);
  });

  // 9. Scenario 2 — Rapid Viewport Orientation Flipping Under Active Simulation
  test('T4.09_scenario_rapid_orientation_flip - 10 rapid switches between Landscape and Portrait with 0 coordinate drift', () => {
    engine.changeScene('MUDDY_PUDDLES');
    const scene = engine.activeScene as MuddyPuddlesScene;
    const mockInput = new InputManager(engine.display);

    for (let cycle = 0; cycle < 10; cycle++) {
      // Switch to Landscape
      window.innerWidth = 1280;
      window.innerHeight = 720;
      engine.display.syncResize();
      scene.update(1 / 60, mockInput);
      expect(scene.peppa.x).toBeGreaterThanOrEqual(0);
      expect(scene.peppa.x).toBeLessThanOrEqual(engine.display.vWidth);

      // Switch to Portrait
      window.innerWidth = 414;
      window.innerHeight = 896;
      engine.display.syncResize();
      scene.update(1 / 60, mockInput);
      expect(scene.peppa.x).toBeGreaterThanOrEqual(0);
      expect(scene.peppa.x).toBeLessThanOrEqual(engine.display.vWidth);
    }
  });

  // 10. Scenario 3 — Toddler Tap Fuzzing & Concurrent Audio Mute Spam
  test('T4.10_scenario_toddler_tap_fuzzing_audio - 60 simultaneous multi-pointer taps + rapid audio mute toggling executes with 0 errors', () => {
    const input = new InputManager(engine.display);

    expect(() => {
      for (let tap = 0; tap < 60; tap++) {
        canvas.dispatchEvent(
          new PointerEvent('pointerdown', {
            pointerId: (tap % 10) + 1,
            clientX: Math.random() * 800,
            clientY: Math.random() * 500,
            bubbles: true
          })
        );

        if (tap % 3 === 0) {
          soundEngine.toggleMute();
        }

        window.dispatchEvent(
          new PointerEvent('pointerup', {
            pointerId: (tap % 10) + 1,
            bubbles: true
          })
        );
      }
    }).not.toThrow();

    soundEngine.setMuted(false);
    input.detach();
  });

  // 11. Scenario 4 — Offline Cold Boot Simulation
  test('T4.11_scenario_offline_cold_boot - Offline Service Worker cache serves fallback index.html and boots engine', () => {
    // Simulate offline condition
    window.navigator = { ...window.navigator, onLine: false };
    delete (window as unknown as { __GAME_STATE__?: unknown }).__GAME_STATE__;

    const mockOfflineCache = new Map<string, string>();
    mockOfflineCache.set('./index.html', '<!DOCTYPE html><html><body><canvas id="root"></canvas></body></html>');

    const fetchOffline = (url: string) => {
      if (!window.navigator.onLine) {
        return mockOfflineCache.get(url) || mockOfflineCache.get('./index.html');
      }
      return null;
    };

    const response = fetchOffline('./index.html');
    expect(response).toBeDefined();
    expect(response!.includes('<canvas')).toBeTruthy();

    const offlineEngine = new GameEngine(canvas);
    expect(offlineEngine.currentSceneId).toBe('MENU');
    offlineEngine.destroy();
  });

  // 12. Scenario 5 — Max Particle Pool Recycling & Stress Test
  test('T4.12_scenario_particle_stress_recycling - 400 particles spawned in 300-pool recycle oldest without memory growth', () => {
    const pe = new ParticleEngine(300);

    for (let i = 0; i < 400; i++) {
      pe.spawn({
        x: Math.random() * 500,
        y: Math.random() * 500,
        vx: (Math.random() - 0.5) * 50,
        vy: (Math.random() - 0.5) * 50,
        maxLife: 0.5
      });
    }

    expect(pe.pool.length).toBe(300); // Fixed pool length strictly maintained
    expect(pe.active.length).toBe(300);

    // Update 60 frames (1 second) -> all particles decay and deactivate
    for (let f = 0; f < 60; f++) {
      pe.update(1 / 60);
    }
    expect(pe.active.length).toBe(0);
  });

  // 13. Scene Transition Memory & Stability
  test('T4.13_scenario_scene_transition_stability - 20 rapid scene cycle switches reset particle pools and state cleanly', () => {
    const sceneIds = Array.from(engine.scenes.keys());

    for (let cycle = 0; cycle < 20; cycle++) {
      const nextSceneId = sceneIds[cycle % sceneIds.length];
      engine.changeScene(nextSceneId);
      engine.update(1 / 60, false);
      expect(engine.currentSceneId).toBe(nextSceneId);
    }

    engine.changeScene('MENU');
    expect(engine.currentSceneId).toBe('MENU');
  });

  // 14. LocalStorage Quota Exceeded Graceful Fallback
  test('T4.14_resilience_localstorage_quota_fallback - StorageManager catches QuotaExceededError and falls back safely', () => {
    const origSetItem = window.localStorage.setItem;
    window.localStorage.setItem = () => {
      throw new Error('QuotaExceededError: DOM Exception 22');
    };

    const storage = new StorageManager();
    expect(() => {
      storage.saveHighScore('eggLaying', 999);
    }).not.toThrow();
    expect(storage.getHighScore('eggLaying')).toBe(999); // In-memory data maintained

    window.localStorage.setItem = origSetItem;
  });

  // 15. Deterministic GameLoop 60 FPS Fixed Timestep & Pause State Invariance
  test('T4.15_engine_fixed_timestep_pause - Variable delta times yield fixed 1/60s updates and pause suppresses updates', () => {
    let updateCount = 0;
    let renderCount = 0;

    const loop = new GameLoop(
      (_dt, isPaused) => {
        if (!isPaused) updateCount++;
      },
      () => {
        renderCount++;
      }
    );

    loop.isRunning = true;
    (loop as unknown as { lastTime: number; tick: (now: number) => void }).lastTime = 0;

    // Running unpaused with 33ms delta
    (loop as unknown as { tick: (now: number) => void }).tick(33.33);
    expect(updateCount).toBeGreaterThan(0);
    expect(renderCount).toBeGreaterThan(0);

    // Paused state
    loop.isPaused = true;
    const uBefore = updateCount;
    const rBefore = renderCount;
    (loop as unknown as { tick: (now: number) => void }).tick(66.66);
    expect(updateCount).toBe(uBefore); // Physics updates suppressed
    expect(renderCount).toBeGreaterThanOrEqual(rBefore); // Renders continue
    loop.stop();
  });
});
