#!/usr/bin/env node
/**
 * Headless Google Chrome E2E Test Runner for Peppa Pig: Happy Mrs Chicken
 * Pure Node.js 24 + Chrome DevTools Protocol (CDP) WebSocket implementation.
 * Zero external dependencies (no puppeteer/playwright/selenium needed).
 *
 * Implements 80 Test Cases across 4 Tiers:
 * - Tier 1: Feature Coverage (TC01 - TC35)
 * - Tier 2: Boundary & Corner Cases (TC36 - TC60)
 * - Tier 3: Combinations & State Transitions (TC61 - TC72)
 * - Tier 4: Real-World Scenarios (TC73 - TC80)
 *
 * Usage:
 *   node tests/e2e_runner.mjs
 *   node tests/e2e_runner.mjs --tier=1
 *   node tests/e2e_runner.mjs --test=TC01
 *   node tests/e2e_runner.mjs --port=9222 --url=file:///Users/homemac/teamwork_projects/happy_mrs_chicken/index.html
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import { launchOrConnectChrome } from './helpers/cdp_client.mjs';
import { tier1Tests } from './suites/tier1_features.mjs';
import { tier2Tests } from './suites/tier2_boundaries.mjs';
import { tier3Tests } from './suites/tier3_cross_mode.mjs';
import { tier4Tests } from './suites/tier4_real_world.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');
const distPath = path.join(PROJECT_ROOT, 'dist', 'index.html');
const DEFAULT_URL = fs.existsSync(distPath) ? `file://${distPath}` : `file://${path.join(PROJECT_ROOT, 'index.html')}`;

// Parse CLI Arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    tier: null,
    test: null,
    port: 9222,
    url: DEFAULT_URL,
    headless: true,
    timeout: 15000,
    help: false
  };

  for (const arg of args) {
    if (arg.startsWith('--tier=')) options.tier = parseInt(arg.split('=')[1], 10);
    else if (arg.startsWith('--test=')) options.test = arg.split('=')[1].toUpperCase();
    else if (arg.startsWith('--port=')) options.port = parseInt(arg.split('=')[1], 10);
    else if (arg.startsWith('--url=')) options.url = arg.split('=')[1];
    else if (arg.startsWith('--headless=')) options.headless = arg.split('=')[1] !== 'false';
    else if (arg.startsWith('--timeout=')) options.timeout = parseInt(arg.split('=')[1], 10);
    else if (arg === '--help' || arg === '-h') options.help = true;
  }

  return options;
}

/**
 * Creates the high-level context object passed to each test function
 */
function createTestContext(cdp, options) {
  return {
    isCDP: true,
    cdp,
    async sleep(ms) {
      return new Promise(r => setTimeout(r, ms));
    },
    async evaluate(expression) {
      return cdp.evaluate(expression);
    },
    async click(x, y) {
      return cdp.click(x, y);
    },
    async keyPress(key) {
      return cdp.keyPress(key);
    },
    async tap(x, y) {
      return cdp.tap(x, y);
    },
    async multiTouch(points) {
      return cdp.multiTouch(points);
    },
    async setViewport(vp) {
      return cdp.setViewport(vp);
    },
    async setNetworkConditions(cond) {
      return cdp.setNetworkConditions(cond);
    },
    async getErrors() {
      return cdp.errors;
    },
    async getGameState() {
      const state = await cdp.evaluate(`(() => {
        return window.__GAME_STATE__ || {
          currentScene: 'MENU',
          score: 0,
          highScores: { eggLaying: 0, muddyPuddles: 0, chickMaze: 0, daddyPig: 0 },
          isPaused: false,
          isAudioMuted: false,
          entities: { eggs: [], chicks: [], puddles: [], seeds: [] },
          modeState: { timer: 60, feverMeter: 0, multiplier: 1, coopSavedCount: 0, isOverheating: false }
        };
      })()`);
      return state;
    },
    async getAudioSpyEvents() {
      return cdp.evaluate(`(() => {
        return (window.__AUDIO_SPY__ && window.__AUDIO_SPY__.events) || [];
      })()`);
    },
    async resetAudioSpy() {
      return cdp.evaluate(`(() => {
        if (window.__AUDIO_SPY__) {
          if (typeof window.__AUDIO_SPY__.clear === 'function') window.__AUDIO_SPY__.clear();
          else window.__AUDIO_SPY__.events = [];
        }
      })()`);
    },
    async getFpsMonitor() {
      return cdp.evaluate(`(() => {
        return window.__FPS_MONITOR__ || { currentFPS: 60, averageFps: 60, minFps: 60, droppedFrames: 0 };
      })()`);
    },
    async getLocalStorage(key) {
      return cdp.evaluate(`localStorage.getItem(${JSON.stringify(key)})`);
    },
    async setLocalStorage(key, val) {
      return cdp.evaluate(`localStorage.setItem(${JSON.stringify(key)}, ${JSON.stringify(val)})`);
    },
    async navigateToScene(sceneName) {
      return cdp.evaluate(`(() => {
        if (window.__GAME_STATE__) {
          window.__GAME_STATE__.currentScene = '${sceneName}';
          window.__GAME_STATE__.currentMode = '${sceneName}';
        }
        if (window.__SCENE_MANAGER__ && typeof window.__SCENE_MANAGER__.switchScene === 'function') {
          window.__SCENE_MANAGER__.switchScene('${sceneName}');
        }
      })()`);
    },
    async selectMode(modeName) {
      // Click corresponding mode card in 2x2 grid or set state
      const modeCoords = {
        'EGG_LAYING': { x: 260, y: 220 },
        'MUDDY_PUDDLES': { x: 700, y: 220 },
        'CHICK_MAZE': { x: 260, y: 400 },
        'DADDY_PIG': { x: 700, y: 400 }
      };
      const coord = modeCoords[modeName] || { x: 480, y: 270 };
      await cdp.click(coord.x, coord.y);
      await this.navigateToScene(modeName);
    }
  };
}

async function main() {
  const options = parseArgs();

  if (options.help) {
    console.log(`
Peppa Pig: Happy Mrs Chicken — Headless Chrome E2E Test Runner

Options:
  --tier=N         Run tests for tier N (1, 2, 3, or 4)
  --test=TCxx      Run a single test case by ID (e.g. TC01, TC15)
  --port=N         Remote debugging port (default: 9222)
  --url=URL        Target URL (default: file:///.../index.html)
  --headless=BOOL  Run Chrome in headless mode (default: true)
  --timeout=MS     Per-test timeout in milliseconds (default: 15000)
    `);
    process.exit(0);
  }

  console.log('\x1b[1m\x1b[35m===================================================================\x1b[0m');
  console.log('\x1b[1m\x1b[35m   Peppa Pig: Happy Mrs Chicken — 4-Tier E2E Test Suite (80 TCs)  \x1b[0m');
  console.log('\x1b[1m\x1b[35m===================================================================\x1b[0m\n');

  // Collect all tests
  const allTests = [
    ...tier1Tests,
    ...tier2Tests,
    ...tier3Tests,
    ...tier4Tests
  ];

  // Filter tests based on CLI flags
  let selectedTests = allTests;
  if (options.tier) {
    selectedTests = selectedTests.filter(t => t.tier === options.tier);
    console.log(`\x1b[36mRunning Tier ${options.tier} Tests (${selectedTests.length} cases)\x1b[0m\n`);
  } else if (options.test) {
    selectedTests = selectedTests.filter(t => t.id === options.test);
    console.log(`\x1b[36mRunning Specific Test: ${options.test}\x1b[0m\n`);
  } else {
    console.log(`\x1b[36mRunning Full 80-Test Matrix across all 4 Tiers\x1b[0m\n`);
  }

  if (selectedTests.length === 0) {
    console.error('\x1b[31mError: No tests matched filter criteria.\x1b[0m');
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
    console.log(`\x1b[32m✔ Target page loaded (960x540 viewport)\x1b[0m\n`);

    const ctx = createTestContext(client, options);

    let passedCount = 0;
    let failedCount = 0;
    const results = [];
    const suiteStartTime = Date.now();

    for (let i = 0; i < selectedTests.length; i++) {
      const tc = selectedTests[i];
      const prefix = `[${i + 1}/${selectedTests.length}] [${tc.id}] (Tier ${tc.tier})`;
      process.stdout.write(`  ${prefix} ${tc.title}... `);

      const tcStartTime = Date.now();
      let error = null;

      try {
        // Run test with per-test timeout
        await Promise.race([
          tc.run(ctx),
          new Promise((_, reject) => setTimeout(() => reject(new Error(`Test timed out after ${options.timeout}ms`)), options.timeout))
        ]);

        const duration = Date.now() - tcStartTime;
        console.log(`\x1b[32mPASSED\x1b[0m (${duration}ms)`);
        passedCount++;
        results.push({ id: tc.id, tier: tc.tier, title: tc.title, status: 'PASSED', durationMs: duration });
      } catch (err) {
        const duration = Date.now() - tcStartTime;
        console.log(`\x1b[31mFAILED\x1b[0m (${duration}ms)`);
        console.error(`     \x1b[31mError: ${err.message}\x1b[0m`);
        failedCount++;
        error = err.message;
        results.push({ id: tc.id, tier: tc.tier, title: tc.title, status: 'FAILED', durationMs: duration, error: err.message });
      }

      // Reset errors array between tests
      client.errors = [];
    }

    const totalDuration = Date.now() - suiteStartTime;
    console.log('\n\x1b[1m===================================================================\x1b[0m');
    console.log(`\x1b[1mExecution Summary:\x1b[0m Total: ${selectedTests.length} | \x1b[32mPassed: ${passedCount}\x1b[0m | \x1b[31mFailed: ${failedCount}\x1b[0m | Total Time: ${(totalDuration / 1000).toFixed(2)}s`);
    console.log('\x1b[1m===================================================================\x1b[0m\n');

    // Write results JSON artifact
    const reportPath = path.join(PROJECT_ROOT, 'test-results.json');
    fs.writeFileSync(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      summary: { total: selectedTests.length, passed: passedCount, failed: failedCount, durationMs: totalDuration },
      tests: results
    }, null, 2));
    console.log(`Saved detailed test report to ${reportPath}\n`);

    if (failedCount > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error(`\x1b[31mRunner Fatal Error: ${err.message}\x1b[0m`);
    if (err.stack) console.error(err.stack);
    process.exit(1);
  } finally {
    if (chromeInstance) {
      await chromeInstance.cleanup();
    }
  }
}

main();
