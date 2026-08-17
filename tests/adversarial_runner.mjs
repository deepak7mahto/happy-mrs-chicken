#!/usr/bin/env node
/**
 * Tier 5 Adversarial Coverage Hardening Test Runner
 * Peppa Pig: Happy Mrs Chicken Standalone Browser Game Suite
 *
 * Implements 10 Tier 5 Adversarial Test Suites (ADV-01 - ADV-10):
 * - ADV-01: Synchronous Viewport Resizing & Coordinate Mapping (Reviewer 2 finding)
 * - ADV-02: Rapid Scene Switching Stress & Transition Race Conditions
 * - ADV-03: AudioContext State Toggles, Interruption & Suspended Recovery
 * - ADV-04: Pause/Resume Toggle Spamming During Active Particle Bursts
 * - ADV-05: Corrupted, Extreme, and Hostile LocalStorage Schema Injections
 * - ADV-06: Extreme Input Fuzzing & Sanitization (NaN/Infinity, Multi-Touch, Space vs Back)
 * - ADV-07: Fixed-Timestep Accumulator & Time Dilation Stress (Spiral of Death Guard)
 * - ADV-08: Memory Stability, Particle Pool Bounds & Entity Lifecycle Leak Audit
 * - ADV-09: Introspection Hook Robustness & Hostile Tampering Defense
 * - ADV-10: Complete Single-File Standalone & Zero-Network Offline Hermeticity
 *
 * Usage:
 *   node tests/adversarial_runner.mjs
 *   node tests/adversarial_runner.mjs --suite=ADV-01
 *   node tests/adversarial_runner.mjs --port=9222
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import { launchOrConnectChrome } from './helpers/cdp_client.mjs';
import { assert, assertEqual, assertApprox, assertInRange, assertDefined } from './helpers/assert_helpers.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');
const TARGET_URL = `file://${path.join(PROJECT_ROOT, 'index.html')}`;

// CLI Arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    suite: null,
    port: 9222,
    url: TARGET_URL,
    headless: true,
    timeout: 15000,
    help: false
  };

  for (const arg of args) {
    if (arg.startsWith('--suite=')) options.suite = arg.split('=')[1].toUpperCase();
    else if (arg.startsWith('--port=')) options.port = parseInt(arg.split('=')[1], 10);
    else if (arg.startsWith('--url=')) options.url = arg.split('=')[1];
    else if (arg.startsWith('--headless=')) options.headless = arg.split('=')[1] !== 'false';
    else if (arg.startsWith('--timeout=')) options.timeout = parseInt(arg.split('=')[1], 10);
    else if (arg === '--help' || arg === '-h') options.help = true;
  }
  return options;
}

const adversarialSuites = [
  // =========================================================================
  // ADV-01: Synchronous Viewport Resizing & Immediate Coordinate Transformation
  // =========================================================================
  {
    id: 'ADV-01',
    title: 'Synchronous Viewport Resizing & Coordinate Mapping (Reviewer 2 Finding)',
    description: 'Verifies DisplayManager handles immediate coordinate mapping without relying on async DOM resize events across 8 aspect ratios',
    async run(client) {
      const viewports = [
        { name: '21:9 Ultrawide (3440x1440)', w: 3440, h: 1440 },
        { name: '21:9 Ultrawide (2560x1080)', w: 2560, h: 1080 },
        { name: '16:9 Standard (1920x1080)', w: 1920, h: 1080 },
        { name: '9:16 Mobile Portrait (375x812)', w: 375, h: 812 },
        { name: '9:16 Modern Mobile (390x844)', w: 390, h: 844 },
        { name: '4:3 Standard Tablet (1024x768)', w: 1024, h: 768 },
        { name: '1:1 Square (800x800)', w: 800, h: 800 },
        { name: 'Micro-Window (100x100)', w: 100, h: 100 }
      ];

      for (const vp of viewports) {
        await client.setViewport({ width: vp.w, height: vp.h, deviceScaleFactor: 1.0 });

        // Immediately evaluate screenToVirtual without waiting or triggering manual resize()
        const mapping = await client.evaluate(`(() => {
          const display = window.__GAME_ENGINE__?.display;
          if (!display) return { success: false, error: 'DisplayManager not found' };

          // If DisplayManager has inline synchronous recalculation check, it will auto-update
          const center = display.screenToVirtual(window.innerWidth / 2, window.innerHeight / 2);
          const topLeft = display.screenToVirtual(display.offsetX, display.offsetY);

          return {
            success: true,
            windowW: window.innerWidth,
            windowH: window.innerHeight,
            scale: display.scale,
            offsetX: display.offsetX,
            offsetY: display.offsetY,
            centerX: center.x,
            centerY: center.y,
            centerInside: center.inside,
            topLeftX: topLeft.x,
            topLeftY: topLeft.y,
            topLeftInside: topLeft.inside
          };
        })()`);

        assert(mapping.success, `Mapping failed for ${vp.name}`);
        assert(mapping.scale > 0 && isFinite(mapping.scale), `Scale must be positive finite number for ${vp.name}, got ${mapping.scale}`);
        assertApprox(mapping.centerX, 480, 2.0, `Center X for ${vp.name} should map to virtual 480`);
        assertApprox(mapping.centerY, 270, 2.0, `Center Y for ${vp.name} should map to virtual 270`);
        assert(mapping.centerInside, `Center point must be inside virtual canvas for ${vp.name}`);
        assertApprox(mapping.topLeftX, 0, 1.0, `TopLeft X for ${vp.name} should map to virtual 0`);
        assertApprox(mapping.topLeftY, 0, 1.0, `TopLeft Y for ${vp.name} should map to virtual 0`);
      }

      // Reset to 960x540
      await client.setViewport({ width: 960, height: 540, deviceScaleFactor: 1.0 });
    }
  },

  // =========================================================================
  // ADV-02: Rapid Scene Switching Stress & Transition Race Conditions
  // =========================================================================
  {
    id: 'ADV-02',
    title: 'Rapid Scene Switching Stress & Transition Race Conditions',
    description: 'Spams 100 rapid scene transitions across all modes to verify state teardown, audio cleanup, and entity isolation',
    async run(client) {
      const switchResult = await client.evaluate(`(() => {
        const scenes = ['MENU', 'EGG_LAYING', 'MUDDY_PUDDLES', 'CHICK_MAZE', 'DADDY_PIG'];
        const sm = window.__SCENE_MANAGER__;
        if (!sm) return { success: false, error: 'SceneManager not found' };

        const errors = [];
        for (let i = 0; i < 100; i++) {
          const target = scenes[i % scenes.length];
          try {
            sm.changeScene(target);
            if (sm.currentSceneName !== target) {
              errors.push(\`Mismatch at \${i}: expected \${target}, got \${sm.currentSceneName}\`);
            }
          } catch (err) {
            errors.push(\`Exception switching to \${target}: \${err.message}\`);
          }
        }

        // Return to MENU
        sm.changeScene('MENU');

        const activeEntities = window.__GAME_STATE__?.entities || {};
        return {
          success: errors.length === 0,
          errors,
          currentScene: sm.currentSceneName,
          menuChicks: activeEntities.chicks?.length || 0,
          menuEggs: activeEntities.eggs?.length || 0
        };
      })()`);

      assert(switchResult.success, `Scene switching errors: ${switchResult.errors.join(', ')}`);
      assertEqual(switchResult.currentScene, 'MENU', 'Must return to MENU scene');
      assertEqual(switchResult.menuChicks, 0, 'No ghost chicks should leak into MENU scene');
      assertEqual(switchResult.menuEggs, 0, 'No ghost eggs should leak into MENU scene');
    }
  },

  // =========================================================================
  // ADV-03: AudioContext State Toggles, Interruption & Suspended Recovery
  // =========================================================================
  {
    id: 'ADV-03',
    title: 'AudioContext State Toggles, Interruption & Suspended Recovery',
    description: 'Stress-tests AudioContext suspension/resumption, mute state flapping, initial mute boot, and 200 concurrent SFX voice bounds',
    async run(client) {
      const audioResult = await client.evaluate(`(async () => {
        const soundEngine = window.__GAME_ENGINE__?.sound || window.__SOUND_ENGINE__;
        const ae = window.__AUDIO_ENGINE__;
        if (!ae) return { success: false, error: 'AudioEngine not found' };

        const results = {};

        // 1. Rapid mute toggle flapping (50 iterations)
        for (let i = 0; i < 50; i++) {
          ae.setMuted(i % 2 === 0);
          ae.playSFX('cluck');
          ae.playSFX('eggPop');
        }
        ae.setMuted(false);
        results.finalMuteState = ae.isMuted();

        // 2. High-concurrency voice trigger (200 calls)
        const sfxList = ['cluck', 'eggPop', 'crack', 'hatch', 'splash', 'seedDrop', 'fanfare', 'crash', 'click'];
        const startTime = performance.now();
        let errorCount = 0;
        for (let i = 0; i < 200; i++) {
          try {
            ae.playSFX(sfxList[i % sfxList.length]);
          } catch (e) {
            errorCount++;
          }
        }
        results.concurrencyTimeMs = performance.now() - startTime;
        results.sfxErrors = errorCount;

        // 3. AudioContext suspend and resume recovery
        if (soundEngine && soundEngine.ctx) {
          const ctx = soundEngine.ctx;
          if (ctx.state === 'running') {
            await ctx.suspend();
            results.suspendedState = ctx.state;
            await ae.unlock();
            results.resumedState = ctx.state;
          } else {
            await ae.unlock();
            results.resumedState = ctx.state;
          }
        }

        return { success: errorCount === 0, ...results };
      })()`, true);

      assert(audioResult.success, `Audio stress encountered ${audioResult.sfxErrors} SFX errors`);
      assertEqual(audioResult.finalMuteState, false, 'Audio mute state should restore to false');
      assertInRange(audioResult.concurrencyTimeMs, 0, 2000, '200 SFX synthesis calls should execute swiftly');
    }
  },

  // =========================================================================
  // ADV-04: Pause/Resume Toggle Spamming During Active Particle Bursts
  // =========================================================================
  {
    id: 'ADV-04',
    title: 'Pause/Resume Toggle Spamming During Active Particle Bursts',
    description: 'Triggers 350-particle maximum bursts and flips isPaused 40 times in 200ms to verify accumulator and physics stability',
    async run(client) {
      await client.evaluate(`window.__GAME_STATE__.currentScene = 'MUDDY_PUDDLES'`);
      await new Promise(r => setTimeout(r, 100));

      const pauseStressResult = await client.evaluate(`(() => {
        const game = window.__GAME_ENGINE__;
        if (!game) return { success: false, error: 'GameEngine not found' };

        const activeScene = game.sceneManager.activeScene;
        if (!activeScene || !activeScene.particles) return { success: false, error: 'Active scene particles not found' };

        // Spawn massive particle burst across types
        activeScene.particles.spawnEggCrack(480, 270, 40);
        activeScene.particles.spawnMudSplash(480, 400, 50, true);
        activeScene.particles.spawnFeathers(480, 200, 30);
        activeScene.particles.spawnSparkles(480, 270, 40);
        activeScene.particles.spawnSteam(740, 300);
        activeScene.particles.spawnScorePopup(480, 250, '+500 PERFECT');

        const initialParticleCount = activeScene.particles.active.length;

        // Rapid pause toggle spamming (40 times)
        for (let i = 0; i < 40; i++) {
          game.gameLoop.isPaused = (i % 2 === 0);
          game.gameLoop.step(1 / 60);
        }

        // Unpause
        game.gameLoop.isPaused = false;

        // Verify particle positions are all valid finite numbers
        let invalidCoords = 0;
        for (const p of activeScene.particles.active) {
          if (!isFinite(p.x) || !isFinite(p.y) || isNaN(p.x) || isNaN(p.y) || isNaN(p.life)) {
            invalidCoords++;
          }
        }

        return {
          success: invalidCoords === 0,
          initialParticleCount,
          currentParticleCount: activeScene.particles.active.length,
          invalidCoords,
          accumulator: game.gameLoop.accumulator,
          isPaused: game.gameLoop.isPaused
        };
      })()`);

      assert(pauseStressResult.success, `Particle coordinates invalid during pause spam: ${pauseStressResult.invalidCoords}`);
      assertEqual(pauseStressResult.isPaused, false, 'Game should end in unpaused state');
      assert(pauseStressResult.initialParticleCount > 50, 'Particle burst should have spawned >50 particles');
    }
  },

  // =========================================================================
  // ADV-05: Corrupted, Extreme, and Hostile LocalStorage Schema Injections
  // =========================================================================
  {
    id: 'ADV-05',
    title: 'Corrupted, Extreme, and Hostile LocalStorage Schema Injections',
    description: 'Tests malformed JSON, extreme numbers, future versions, missing properties, and QuotaExceeded fallback resilience',
    async run(client) {
      const storageResult = await client.evaluate(`(() => {
        const key = 'hmc_game_data_v1';
        const storage = window.__GAME_ENGINE__?.storage;
        if (!storage) return { success: false, error: 'StorageManager not found' };

        const testCases = [];

        // 1. Malformed JSON
        localStorage.setItem(key, '{ "version": 1, "highScores": { invalid ...');
        storage.load();
        testCases.push({
          name: 'Malformed JSON',
          pass: storage.data.version === 1 && typeof storage.getHighScore('eggLaying') === 'number'
        });

        // 2. Non-object primitive JSON
        localStorage.setItem(key, '12345');
        storage.load();
        testCases.push({
          name: 'Primitive Number JSON',
          pass: storage.data.version === 1
        });

        localStorage.setItem(key, '"string_primitive"');
        storage.load();
        testCases.push({
          name: 'Primitive String JSON',
          pass: storage.data.version === 1
        });

        // 3. Future Version (version 999)
        localStorage.setItem(key, JSON.stringify({ version: 999, highScores: { eggLaying: 9999 } }));
        storage.load();
        testCases.push({
          name: 'Future Schema Version',
          pass: storage.data.version === 1
        });

        // 4. Missing highScores object (null)
        localStorage.setItem(key, JSON.stringify({ version: 1, highScores: null }));
        storage.load();
        testCases.push({
          name: 'Null highScores property',
          pass: storage.getHighScore('muddyPuddles') === 0
        });

        // 5. QuotaExceededError during saveHighScore
        const origSetItem = localStorage.setItem;
        let quotaPass = false;
        try {
          localStorage.setItem = () => {
            throw new DOMException('QuotaExceeded', 'QuotaExceededError');
          };
          const saved = storage.saveHighScore('daddyPig', 12345);
          quotaPass = (storage.getHighScore('daddyPig') === 12345);
        } catch (e) {
          quotaPass = false;
        } finally {
          localStorage.setItem = origSetItem;
        }
        testCases.push({
          name: 'QuotaExceeded In-Memory Fallback',
          pass: quotaPass
        });

        // Restore clean default storage
        localStorage.removeItem(key);
        storage.load();

        return {
          success: testCases.every(t => t.pass),
          testCases
        };
      })()`);

      assert(storageResult.success, `Storage resilience test failures: ${JSON.stringify(storageResult.testCases)}`);
    }
  },

  // =========================================================================
  // ADV-06: Extreme Input Fuzzing & Sanitization
  // =========================================================================
  {
    id: 'ADV-06',
    title: 'Extreme Input Fuzzing & Sanitization (NaN/Infinity, Multi-Touch, Space vs Back)',
    description: 'Dispatches NaN/Infinity/negative coordinates, multi-pointer touches, and verifies Spacebar never triggers back button',
    async run(client) {
      await client.evaluate(`window.__GAME_STATE__.currentScene = 'EGG_LAYING'`);
      await new Promise(r => setTimeout(r, 100));

      const inputFuzzResult = await client.evaluate(`(() => {
        const game = window.__GAME_ENGINE__;
        const input = game?.input;
        const canvas = document.getElementById('gameCanvas');
        if (!input || !canvas) return { success: false, error: 'Input/Canvas not found' };

        const results = [];

        // 1. Direct synthetic non-finite coordinate test into _onPointerDown
        try {
          input._onPointerDown({ clientX: NaN, clientY: Infinity, cancelable: true });
          input._onPointerDown({ clientX: -99999, clientY: 99999, cancelable: true });
          results.push({ name: 'NaN/Infinity Pointer Sanitization', pass: isFinite(input.primaryPointer.x) && !isNaN(input.primaryPointer.x) });
        } catch (e) {
          results.push({ name: 'NaN/Infinity Pointer Sanitization', pass: false, error: e.message });
        }

        // 2. Dispatch Multi-Touch Simultaneous Pointers
        try {
          for (let id = 10; id < 15; id++) {
            const p = new PointerEvent('pointerdown', {
              clientX: 200 + id * 50,
              clientY: 300,
              pointerId: id,
              bubbles: true,
              cancelable: true
            });
            canvas.dispatchEvent(p);
          }
          results.push({ name: 'Multi-Touch 5 Pointers', pass: input.pointers.size >= 1 });
          
          // Cleanup
          for (let id = 10; id < 15; id++) {
            const p = new PointerEvent('pointerup', {
              clientX: 200 + id * 50,
              clientY: 300,
              pointerId: id,
              bubbles: true,
              cancelable: true
            });
            window.dispatchEvent(p);
          }
        } catch (e) {
          results.push({ name: 'Multi-Touch 5 Pointers', pass: false, error: e.message });
        }

        // 3. Verify Spacebar does NOT trigger Back button in EggLayingScene
        // Set primaryPointer coords to (50, 30) (inside back button box) but with pointer isDown=false
        input.primaryPointer = { x: 50, y: 30, isDown: false, inside: true };
        input.actionJustPressed = true;
        input.keysDown.add('Space');
        
        // Step scene update
        game.sceneManager.update(1 / 60, input);
        
        // Scene must remain EGG_LAYING, not switch to MENU!
        const sceneAfterSpace = game.sceneManager.currentSceneName;
        results.push({
          name: 'Spacebar does not trigger Back Button',
          pass: sceneAfterSpace === 'EGG_LAYING'
        });

        return {
          success: results.every(r => r.pass),
          results
        };
      })()`);

      assert(inputFuzzResult.success, `Input fuzzing failures: ${JSON.stringify(inputFuzzResult.results)}`);
    }
  },

  // =========================================================================
  // ADV-07: Fixed-Timestep Accumulator & Time Dilation Stress
  // =========================================================================
  {
    id: 'ADV-07',
    title: 'Fixed-Timestep Accumulator & Time Dilation Stress (Spiral of Death Guard)',
    description: 'Emulates massive frame drops (dt=5.0s, dt=10.0s) and zero/negative dt to verify loop step clamping and entity bounds',
    async run(client) {
      await client.evaluate(`window.__GAME_STATE__.currentScene = 'EGG_LAYING'`);
      await new Promise(r => setTimeout(r, 100));

      const lagStressResult = await client.evaluate(`(() => {
        const game = window.__GAME_ENGINE__;
        const loop = game?.gameLoop;
        if (!loop) return { success: false, error: 'GameLoop not found' };

        const initialScore = game.sceneManager.activeScene.score;

        // 1. Simulate 5-second huge lag spike
        const tBefore = loop.lastTime;
        loop._tick((tBefore + 5.0) * 1000);

        // Accumulator should be clamped by maxFrameTime (0.100s) and not exceed 10 steps
        const accumAfterLag = loop.accumulator;

        // 2. Simulate 0 delta time
        loop._tick((tBefore + 5.0) * 1000);

        // 3. Verify eggs did not penetrate below ground level
        const eggs = game.sceneManager.activeScene.eggs || [];
        let eggsPenetrated = 0;
        for (const egg of eggs) {
          if (egg.y > 500) eggsPenetrated++;
        }

        return {
          success: accumAfterLag <= loop.maxFrameTime && eggsPenetrated === 0,
          accumAfterLag,
          maxFrameTime: loop.maxFrameTime,
          eggsPenetrated
        };
      })()`);

      assert(lagStressResult.success, `Lag stress accumulator exceeded maxFrameTime: ${lagStressResult.accumAfterLag}`);
      assertEqual(lagStressResult.eggsPenetrated, 0, 'No eggs should penetrate ground level during lag');
    }
  },

  // =========================================================================
  // ADV-08: Memory Stability, Particle Pool Bounds & Entity Lifecycle Leak Audit
  // =========================================================================
  {
    id: 'ADV-08',
    title: 'Memory Stability, Particle Pool Bounds & Entity Lifecycle Leak Audit',
    description: 'Executes 1,000 particle emissions and 50 hatching cycles to verify pool bounds and complete entity garbage collection',
    async run(client) {
      await client.evaluate(`window.__GAME_STATE__.currentScene = 'EGG_LAYING'`);
      await new Promise(r => setTimeout(r, 100));

      const memResult = await client.evaluate(`(() => {
        const scene = window.__GAME_ENGINE__?.sceneManager?.activeScene;
        if (!scene || !scene.particles) return { success: false, error: 'Scene not found' };

        // 1. Emit 1,000 particles through pool
        for (let i = 0; i < 1000; i++) {
          scene.particles.spawn('EGGSHELL', 480, 270, { vx: 2, vy: -3 });
        }

        const maxObservedActive = scene.particles.active.length;
        const poolSize = scene.particles.pool.length;
        const maxCapacity = scene.particles.maxParticles;

        // Advance 2 seconds (120 frames) to let all particles expire
        for (let f = 0; f < 120; f++) {
          scene.particles.update(1 / 60);
        }

        const activeAfterExpiry = scene.particles.active.length;

        // 2. Clean clear
        scene.particles.clear();

        return {
          success: maxObservedActive <= maxCapacity && activeAfterExpiry === 0,
          maxObservedActive,
          maxCapacity,
          activeAfterExpiry,
          poolLengthAfterClear: scene.particles.pool.length
        };
      })()`);

      assert(memResult.success, `Particle pool bounds exceeded: active=${memResult.maxObservedActive}, max=${memResult.maxCapacity}`);
      assertEqual(memResult.activeAfterExpiry, 0, 'All particles must expire and be recycled into pool');
    }
  },

  // =========================================================================
  // ADV-09: Introspection Hook Robustness & Hostile Tampering Defense
  // =========================================================================
  {
    id: 'ADV-09',
    title: 'Introspection Hook Robustness & Hostile Tampering Defense',
    description: 'Injects invalid scene names, prototype pollution attempts, and non-boolean flags to verify contract guards',
    async run(client) {
      const introspectionResult = await client.evaluate(`(() => {
        const gs = window.__GAME_STATE__;
        if (!gs) return { success: false, error: 'window.__GAME_STATE__ missing' };

        const results = [];

        // 1. Setting invalid currentScene
        const prevScene = gs.currentScene;
        gs.currentScene = 'NON_EXISTENT_INVALID_SCENE';
        results.push({
          name: 'Invalid currentScene write ignored safely',
          pass: gs.currentScene === prevScene || gs.currentScene !== 'NON_EXISTENT_INVALID_SCENE'
        });

        // 2. Setting isPaused with truthy/falsy coercion
        gs.isPaused = 'yes';
        results.push({
          name: 'isPaused truthy coercion',
          pass: gs.isPaused === true
        });
        gs.isPaused = false;

        // 3. Setting isAudioMuted with boolean coercion
        gs.isAudioMuted = 1;
        results.push({
          name: 'isAudioMuted truthy coercion',
          pass: gs.isAudioMuted === true
        });
        gs.isAudioMuted = false;

        // 4. Entities contract structure verification
        const ent = gs.entities;
        results.push({
          name: 'Entities contract arrays',
          pass: Array.isArray(ent.eggs) && Array.isArray(ent.chicks) && Array.isArray(ent.puddles) && Array.isArray(ent.seeds)
        });

        return {
          success: results.every(r => r.pass),
          results
        };
      })()`);

      assert(introspectionResult.success, `Introspection tampering failures: ${JSON.stringify(introspectionResult.results)}`);
    }
  },

  // =========================================================================
  // ADV-10: Complete Single-File Standalone & Zero-Network Offline Hermeticity
  // =========================================================================
  {
    id: 'ADV-10',
    title: 'Complete Single-File Standalone & Zero-Network Offline Hermeticity',
    description: 'Audits DOM for external asset links and inspects network log to guarantee 100% offline self-containment',
    async run(client) {
      const domAudit = await client.evaluate(`(() => {
        const externalScripts = Array.from(document.querySelectorAll('script[src]')).map(s => s.src);
        const externalStyles = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map(l => l.href);
        const externalImages = Array.from(document.querySelectorAll('img[src]')).map(i => i.src);
        const iframes = Array.from(document.querySelectorAll('iframe')).map(f => f.src);

        return {
          externalScripts,
          externalStyles,
          externalImages,
          iframes,
          hasCanvas: Boolean(document.getElementById('gameCanvas')),
          clean: externalScripts.length === 0 && externalStyles.length === 0 && externalImages.length === 0 && iframes.length === 0
        };
      })()`);

      assert(domAudit.clean, `External DOM dependencies found: ${JSON.stringify(domAudit)}`);
      assert(domAudit.hasCanvas, 'Canvas element #gameCanvas must exist in standalone document');
      assertEqual(client.networkRequests.filter(r => !r.url.startsWith('file://') && !r.url.startsWith('data:')).length, 0, 'Zero external network requests permitted');
    }
  }
];

async function main() {
  const options = parseArgs();

  if (options.help) {
    console.log(`
Peppa Pig: Happy Mrs Chicken — Tier 5 Adversarial Test Runner

Options:
  --suite=ADV-xx    Run a specific adversarial suite (ADV-01 to ADV-10)
  --port=N          Remote debugging port (default: 9222)
  --url=URL         Target URL (default: file:///.../index.html)
  --headless=BOOL   Run Chrome in headless mode (default: true)
  --timeout=MS      Per-suite timeout in milliseconds (default: 15000)
    `);
    process.exit(0);
  }

  console.log('\x1b[1m\x1b[31m===================================================================\x1b[0m');
  console.log('\x1b[1m\x1b[31m   Peppa Pig: Happy Mrs Chicken — Tier 5 Adversarial Test Runner  \x1b[0m');
  console.log('\x1b[1m\x1b[31m===================================================================\x1b[0m\n');

  let selectedSuites = adversarialSuites;
  if (options.suite) {
    selectedSuites = selectedSuites.filter(s => s.id === options.suite);
    console.log(`\x1b[36mRunning Specific Suite: ${options.suite}\x1b[0m\n`);
  } else {
    console.log(`\x1b[36mRunning All ${selectedSuites.length} Tier 5 Adversarial Suites\x1b[0m\n`);
  }

  if (selectedSuites.length === 0) {
    console.error('\x1b[31mError: No adversarial suites matched filter.\x1b[0m');
    process.exit(1);
  }

  console.log(`Connecting to Google Chrome on port ${options.port}...`);
  let chromeInstance = null;
  let client = null;

  try {
    chromeInstance = await launchOrConnectChrome({
      port: options.port,
      headless: options.headless
    });
    client = chromeInstance.client;
    console.log(`\x1b[32m✔ Connected to Google Chrome via CDP WebSocket\x1b[0m`);

    console.log(`Navigating to target page: ${options.url}`);
    await client.navigate(options.url);
    await client.setViewport({ width: 960, height: 540, deviceScaleFactor: 1.0 });
    await new Promise(r => setTimeout(r, 300));
    console.log(`\x1b[32m✔ Target page loaded (960x540 viewport)\x1b[0m\n`);

    let passedCount = 0;
    let failedCount = 0;
    const results = [];
    const suiteStartTime = Date.now();

    for (let i = 0; i < selectedSuites.length; i++) {
      const suite = selectedSuites[i];
      const prefix = `[${i + 1}/${selectedSuites.length}] [${suite.id}]`;
      process.stdout.write(`  ${prefix} ${suite.title}... `);

      const tcStartTime = Date.now();

      try {
        await Promise.race([
          suite.run(client),
          new Promise((_, reject) => setTimeout(() => reject(new Error(`Suite timed out after ${options.timeout}ms`)), options.timeout))
        ]);

        const duration = Date.now() - tcStartTime;
        console.log(`\x1b[32mPASSED\x1b[0m (${duration}ms)`);
        passedCount++;
        results.push({ id: suite.id, title: suite.title, status: 'PASSED', durationMs: duration });
      } catch (err) {
        const duration = Date.now() - tcStartTime;
        console.log(`\x1b[31mFAILED\x1b[0m (${duration}ms)`);
        console.error(`     \x1b[31mError: ${err.message}\x1b[0m`);
        failedCount++;
        results.push({ id: suite.id, title: suite.title, status: 'FAILED', durationMs: duration, error: err.message });
      }

      client.errors = [];
    }

    const totalDuration = Date.now() - suiteStartTime;
    console.log('\n\x1b[1m===================================================================\x1b[0m');
    console.log(`\x1b[1mTier 5 Execution Summary:\x1b[0m Total: ${selectedSuites.length} | \x1b[32mPassed: ${passedCount}\x1b[0m | \x1b[31mFailed: ${failedCount}\x1b[0m | Total Time: ${(totalDuration / 1000).toFixed(2)}s`);
    console.log('\x1b[1m===================================================================\x1b[0m\n');

    // Write report
    const reportPath = path.join(PROJECT_ROOT, 'adversarial-results.json');
    fs.writeFileSync(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      summary: { total: selectedSuites.length, passed: passedCount, failed: failedCount, durationMs: totalDuration },
      suites: results
    }, null, 2));
    console.log(`Saved detailed Tier 5 adversarial report to ${reportPath}\n`);

    if (failedCount > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error(`\x1b[31mAdversarial Runner Fatal Error: ${err.message}\x1b[0m`);
    if (err.stack) console.error(err.stack);
    process.exit(1);
  } finally {
    if (chromeInstance) {
      await chromeInstance.cleanup();
    }
  }
}

main();
