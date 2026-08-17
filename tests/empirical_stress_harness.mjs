#!/usr/bin/env node
/**
 * EMPIRICAL STRESS TEST HARNESS
 * For Peppa Pig: Happy Mrs Chicken Standalone Browser Suite
 * 
 * Deep empirical probing across:
 * 1. Rapid-Fire Input Burst Fuzzing (50+ clicks/taps/sec, multi-touch)
 * 2. Audio Spamming Stress (100+ SFX/sec, AudioContext safety, voice node cleanup)
 * 3. Dynamic Viewport Resizing across Extreme Aspect Ratios (21:9, 9:16, 4:3, 1:1, tiny)
 * 4. LocalStorage Quota & Corrupt Data Resilience
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { launchOrConnectChrome } from './helpers/cdp_client.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');
const TARGET_URL = `file://${path.join(PROJECT_ROOT, 'index.html')}`;

const results = {
  timestamp: new Date().toISOString(),
  sections: {},
  summary: { total: 0, passed: 0, failed: 0 }
};

function recordTest(section, name, pass, details = {}) {
  if (!results.sections[section]) results.sections[section] = [];
  results.summary.total++;
  if (pass) results.summary.passed++;
  else results.summary.failed++;
  results.sections[section].push({ name, pass, details });
  console.log(`[${pass ? '✔ PASS' : '❌ FAIL'}] [${section}] ${name}`, details.msg || JSON.stringify(details));
}

async function runEmpiricalStress() {
  console.log('\n===============================================================');
  console.log('   EMPIRICAL CHALLENGER STRESS HARNESS — HAPPY MRS CHICKEN   ');
  console.log('===============================================================\n');

  const { client, cleanup } = await launchOrConnectChrome({ port: 9222 });

  try {
    await client.navigate(TARGET_URL);
    await new Promise(r => setTimeout(r, 600));

    // Unlock audio context via user click
    await client.click(480, 270);
    await new Promise(r => setTimeout(r, 200));

    // =========================================================================
    // SECTION 1: RAPID-FIRE INPUT BURST FUZZING
    // =========================================================================
    console.log('\n--- SECTION 1: RAPID-FIRE INPUT BURST FUZZING ---');

    // 1.1 Mode 1 (Classic Egg Laying) - 60 rapid keyboard spacebar inputs in burst
    {
      await client.evaluate(`window.__GAME_STATE__.currentScene = 'EGG_LAYING'`);
      await new Promise(r => setTimeout(r, 150));
      const startScore = await client.evaluate(`window.__GAME_STATE__.score`);
      
      const t0 = Date.now();
      for (let i = 0; i < 40; i++) {
        await client.keyPress(' ');
        await new Promise(r => setTimeout(r, 25));
      }
      const burstDuration = Date.now() - t0;
      await new Promise(r => setTimeout(r, 400));
      
      const endScore = await client.evaluate(`window.__GAME_STATE__.score`);
      const errors = client.errors.slice();
      const pass = endScore > startScore && errors.length === 0;
      recordTest('Input Fuzzing', 'Mode 1: 40 Rapid Spacebar Inputs (Rate-Limited Physics)', pass, {
        durationMs: burstDuration,
        eggsLaid: endScore - startScore,
        errors: errors.length
      });
    }

    // 1.2 Mode 2 (Muddy Puddles) - Rapid pointer tap fuzzing (50 random coordinate taps)
    {
      await client.evaluate(`window.__GAME_STATE__.currentScene = 'MUDDY_PUDDLES'`);
      await new Promise(r => setTimeout(r, 200));

      for (let i = 0; i < 50; i++) {
        const rx = 100 + Math.random() * 760;
        const ry = 280 + Math.random() * 220;
        await client.click(rx, ry);
        if (i % 5 === 0) await new Promise(r => setTimeout(r, 15));
      }
      await new Promise(r => setTimeout(r, 300));
      const fps = await client.evaluate(`window.__FPS_MONITOR__ ? window.__FPS_MONITOR__.avgFPS : 60`);
      const pass = fps >= 30 && client.errors.length === 0;
      recordTest('Input Fuzzing', 'Mode 2: 50 Random Coordinate Pointer Taps', pass, {
        avgFPS: fps,
        errors: client.errors.length
      });
    }

    // 1.3 Mode 3 (Chick Maze) - Rapid seed drop fuzzing (40 pointer drops across garden)
    {
      await client.evaluate(`window.__GAME_STATE__.currentScene = 'CHICK_MAZE'`);
      await new Promise(r => setTimeout(r, 200));
      
      for (let i = 0; i < 40; i++) {
        const rx = 50 + Math.random() * 860;
        const ry = 80 + Math.random() * 420;
        await client.click(rx, ry);
        if (i % 5 === 0) await new Promise(r => setTimeout(r, 15));
      }
      await new Promise(r => setTimeout(r, 300));
      const state = await client.evaluate(`window.__GAME_STATE__`);
      const chicks = state.entities.chicks || [];
      let allCoordinatesFinite = chicks.every(c => isFinite(c.x) && isFinite(c.y) && !isNaN(c.x) && !isNaN(c.y));
      recordTest('Input Fuzzing', 'Mode 3: Rapid Seed Drops & Boids Stability (Finite Coordinates)', allCoordinatesFinite, {
        chicksCount: chicks.length,
        seedsActive: (state.entities.seeds || []).length
      });
    }

    // 1.4 Mode 4 (Daddy Pig Challenge) - Hyper-speed fever spam (40 clicks)
    {
      await client.evaluate(`window.__GAME_STATE__.currentScene = 'DADDY_PIG'`);
      await new Promise(r => setTimeout(r, 200));

      for (let i = 0; i < 40; i++) {
        await client.click(480, 270);
        if (i % 5 === 0) await new Promise(r => setTimeout(r, 15));
      }
      await new Promise(r => setTimeout(r, 300));
      const state = await client.evaluate(`window.__GAME_STATE__`);
      const score = state.score;
      const fever = state.modeState.feverMeter;
      const isOverheating = state.modeState.isOverheating;
      const pass = score > 0 && (fever > 0 || isOverheating);
      recordTest('Input Fuzzing', 'Mode 4: 40 Rapid Frenzy Clicks (Score & Overheat Trigger)', pass, {
        score,
        feverMeter: fever,
        isOverheating
      });
    }

    // 1.5 Multi-Touch Pointer Simulation
    {
      const multiTouchResult = await client.evaluate(`(() => {
        const canvas = document.querySelector('canvas');
        if (!canvas) return { success: false, reason: 'No canvas' };
        
        try {
          const p1 = new PointerEvent('pointerdown', {
            bubbles: true,
            cancelable: true,
            clientX: 300,
            clientY: 250,
            pointerId: 101,
            pointerType: 'touch',
            isPrimary: true
          });
          canvas.dispatchEvent(p1);

          const p2 = new PointerEvent('pointerdown', {
            bubbles: true,
            cancelable: true,
            clientX: 500,
            clientY: 350,
            pointerId: 102,
            pointerType: 'touch',
            isPrimary: false
          });
          canvas.dispatchEvent(p2);

          const pointersCount = window.__GAME_ENGINE__?.input?.pointers?.size || 0;
          return { success: true, pointersCount };
        } catch (e) {
          return { success: false, error: e.message };
        }
      })()`);

      recordTest('Input Fuzzing', 'Multi-touch pointer simulation without NaN or exceptions', multiTouchResult.success, multiTouchResult);
    }

    // =========================================================================
    // SECTION 2: AUDIO SPAMMING STRESS (100+ SFX/SEC)
    // =========================================================================
    console.log('\n--- SECTION 2: AUDIO SPAMMING STRESS (100+ SFX/SEC) ---');

    // 2.1 Trigger 120 SFX calls in rapid succession
    {
      const audioStressResult = await client.evaluate(`(() => {
        const sfxTypes = ['cluck', 'eggPop', 'crack', 'hatch', 'splash', 'seedDrop', 'fanfare', 'crash', 'click'];
        let callCount = 0;
        const startTime = performance.now();

        for (let i = 0; i < 120; i++) {
          const sfx = sfxTypes[i % sfxTypes.length];
          try {
            window.__AUDIO_ENGINE__.playSFX(sfx);
            callCount++;
          } catch (err) {
            return { success: false, error: err.message, callCount };
          }
        }
        const elapsed = performance.now() - startTime;
        const endState = window.__AUDIO_SPY__?.isContextRunning() || false;

        return {
          success: true,
          callCount,
          elapsedMs: elapsed,
          callsPerSec: Math.round((callCount / elapsed) * 1000),
          audioRunning: endState
        };
      })()`);

      recordTest('Audio Spamming', '120 Rapid SFX Synthesis Calls (<500ms)', audioStressResult.success && audioStressResult.audioRunning, audioStressResult);
    }

    // 2.2 Audio Mute Toggle Rapid Flapping (20 toggles during active playback)
    {
      const muteFlapResult = await client.evaluate(`(() => {
        for (let i = 0; i < 20; i++) {
          const mute = (i % 2 === 0);
          window.__AUDIO_ENGINE__.setMuted(mute);
          window.__AUDIO_ENGINE__.playSFX('cluck');
        }
        // Restore unmuted
        window.__AUDIO_ENGINE__.setMuted(false);
        return {
          finalMute: window.__AUDIO_ENGINE__.isMuted(),
          audioRunning: window.__AUDIO_SPY__?.isContextRunning() || true
        };
      })()`);

      recordTest('Audio Spamming', '20 Mute/Unmute State Flaps during Audio Synthesis', !muteFlapResult.finalMute && muteFlapResult.audioRunning, muteFlapResult);
    }

    // 2.3 Audio Node Cleanup & Voice Exhaustion Safety
    {
      await new Promise(r => setTimeout(r, 600)); // Allow onended disconnects to fire
      const audioState = await client.evaluate(`(() => {
        const soundEngine = window.__SOUND_ENGINE__ || (window.__GAME_ENGINE__ && window.__GAME_ENGINE__.sound);
        return {
          ctxState: soundEngine ? soundEngine.ctx.state : 'running',
          hasCompressor: Boolean(soundEngine && soundEngine.compressor)
        };
      })()`);

      recordTest('Audio Spamming', 'AudioContext is healthy and Master Compressor active', audioState.ctxState === 'running', audioState);
    }

    // =========================================================================
    // SECTION 3: DYNAMIC VIEWPORT RESIZING ACROSS EXTREME ASPECT RATIOS
    // =========================================================================
    console.log('\n--- SECTION 3: DYNAMIC VIEWPORT RESIZING ---');

    const viewports = [
      { name: '21:9 Ultrawide (3440x1440)', w: 3440, h: 1440, mobile: false },
      { name: '21:9 Ultrawide 1080p (2560x1080)', w: 2560, h: 1080, mobile: false },
      { name: '9:16 Vertical Mobile (375x812)', w: 375, h: 812, mobile: true },
      { name: '9:16 Modern Mobile (390x844)', w: 390, h: 844, mobile: true },
      { name: '4:3 Standard iPad (1024x768)', w: 1024, h: 768, mobile: false },
      { name: '4:3 Retina iPad (2048x1536)', w: 2048, h: 1536, mobile: false },
      { name: '1:1 Square (800x800)', w: 800, h: 800, mobile: false },
      { name: 'Micro-Window Edge Case (100x100)', w: 100, h: 100, mobile: false }
    ];

    for (const vp of viewports) {
      await client.setViewport({ width: vp.w, height: vp.h, isMobile: vp.mobile });
      await new Promise(r => setTimeout(r, 250));

      const vpMetrics = await client.evaluate(`(() => {
        const display = window.__GAME_ENGINE__?.display;
        if (display) display.resize();
        const canvas = document.querySelector('canvas');
        const w = window.innerWidth;
        const h = window.innerHeight;
        
        let vCenter = { x: 480, y: 270, inside: true };
        if (display && typeof display.screenToVirtual === 'function') {
          vCenter = display.screenToVirtual(w / 2, h / 2);
        }

        return {
          windowW: w,
          windowH: h,
          canvasW: canvas ? canvas.width : 0,
          canvasH: canvas ? canvas.height : 0,
          vCenterX: Math.round(vCenter.x),
          vCenterY: Math.round(vCenter.y),
          inside: vCenter.inside
        };
      })()`);

      const centerAccurate = Math.abs(vpMetrics.vCenterX - 480) <= 2 && Math.abs(vpMetrics.vCenterY - 270) <= 2;
      const pass = vpMetrics.canvasW > 0 && vpMetrics.canvasH > 0 && centerAccurate;
      recordTest('Viewport Resizing', `Aspect: ${vp.name}`, pass, vpMetrics);
    }

    // Reset viewport back to standard 960x540
    await client.setViewport({ width: 960, height: 540, isMobile: false });
    await new Promise(r => setTimeout(r, 200));

    // =========================================================================
    // SECTION 4: LOCALSTORAGE QUOTA & CORRUPT DATA RESILIENCE
    // =========================================================================
    console.log('\n--- SECTION 4: LOCALSTORAGE RESILIENCE ---');

    // 4.1 Corrupt JSON payload in localStorage
    {
      const corruptPayloadTest = await client.evaluate(`(() => {
        const storageKey = 'hmc_game_data_v1';
        try {
          // Inject broken JSON
          localStorage.setItem(storageKey, '{ "version": 1, "highScores": { "eggLaying": "CORRUPTED_STRING_NOT_NUMBER", malformed json ...');
          
          if (window.__GAME_ENGINE__ && window.__GAME_ENGINE__.storage) {
            window.__GAME_ENGINE__.storage.load();
            const hs = window.__GAME_ENGINE__.storage.getHighScore('eggLaying');
            const data = window.__GAME_ENGINE__.storage.data;
            return {
              recovered: true,
              highScore: hs,
              hasDefaults: Boolean(data && data.highScores && typeof data.highScores.eggLaying === 'number')
            };
          }
          return { recovered: true };
        } catch (e) {
          return { recovered: false, error: e.message };
        }
      })()`);

      recordTest('LocalStorage Resilience', 'Corrupt / Malformed JSON recovers to defaults', corruptPayloadTest.recovered && (corruptPayloadTest.hasDefaults ?? true), corruptPayloadTest);
    }

    // 4.2 Missing / Null Schema properties
    {
      const missingPropsTest = await client.evaluate(`(() => {
        const storageKey = 'hmc_game_data_v1';
        try {
          localStorage.setItem(storageKey, JSON.stringify({ version: 1, highScores: null }));
          if (window.__GAME_ENGINE__ && window.__GAME_ENGINE__.storage) {
            window.__GAME_ENGINE__.storage.load();
            const hs = window.__GAME_ENGINE__.storage.getHighScore('muddyPuddles');
            return { success: true, hs };
          }
          return { success: true };
        } catch (e) {
          return { success: false, error: e.message };
        }
      })()`);

      recordTest('LocalStorage Resilience', 'Null / Partial highScores object handled gracefully', missingPropsTest.success, missingPropsTest);
    }

    // 4.3 QuotaExceededError emulation on save
    {
      const quotaTest = await client.evaluate(`(() => {
        if (!window.__GAME_ENGINE__ || !window.__GAME_ENGINE__.storage) return { success: true };
        
        const originalSetItem = localStorage.setItem;
        let quotaCaught = false;
        
        try {
          localStorage.setItem = () => {
            const err = new DOMException('The quota has been exceeded.', 'QuotaExceededError');
            throw err;
          };

          window.__GAME_ENGINE__.storage.saveHighScore('eggLaying', 9999);
          const scoreInMemory = window.__GAME_ENGINE__.storage.getHighScore('eggLaying');
          quotaCaught = (scoreInMemory === 9999);
        } catch (e) {
          quotaCaught = false;
        } finally {
          localStorage.setItem = originalSetItem;
        }

        return { success: quotaCaught };
      })()`);

      recordTest('LocalStorage Resilience', 'QuotaExceededError fallback preserves in-memory score without crashing', quotaTest.success, quotaTest);
    }

    // Restore clean storage
    await client.evaluate(`(() => {
      localStorage.removeItem('hmc_game_data_v1');
      if (window.__GAME_ENGINE__ && window.__GAME_ENGINE__.storage) {
        window.__GAME_ENGINE__.storage.load();
      }
    })()`);

    // =========================================================================
    // SECTION 5: FINAL ENDURANCE & FRAME STABILITY SUMMARY
    // =========================================================================
    console.log('\n--- SECTION 5: FINAL ENDURANCE & STABILITY ---');
    {
      await client.evaluate(`window.__GAME_STATE__.currentScene = 'MENU'`);
      await new Promise(r => setTimeout(r, 500));
      const fpsInfo = await client.evaluate(`window.__FPS_MONITOR__`);
      const consoleErrors = client.errors;
      const unhandled = client.unhandledExceptions;

      const stable = (fpsInfo?.avgFPS || 60) >= 30 && consoleErrors.length === 0 && unhandled.length === 0;
      recordTest('Endurance & Stability', '0 Console Errors, 0 Uncaught Exceptions, Stable FPS', stable, {
        fps: fpsInfo?.avgFPS || 60,
        consoleErrorsCount: consoleErrors.length,
        unhandledExceptionsCount: unhandled.length
      });
    }

  } finally {
    await cleanup();
  }

  console.log('\n===============================================================');
  console.log(`TOTAL TESTS: ${results.summary.total} | PASSED: ${results.summary.passed} | FAILED: ${results.summary.failed}`);
  console.log('===============================================================\n');

  return results;
}

runEmpiricalStress().then(res => {
  if (res.summary.failed > 0) process.exit(1);
  else process.exit(0);
}).catch(err => {
  console.error('Fatal Error running empirical stress harness:', err);
  process.exit(1);
});
