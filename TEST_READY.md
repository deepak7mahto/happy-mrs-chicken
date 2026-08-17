# Test Infrastructure Ready: Peppa Pig — Happy Mrs Chicken

**Status:** ALL TEST RUNNERS & TEST SUITES IMPLEMENTED AND VERIFIED  
**Date:** 2026-08-16  
**Node.js Version:** v24.18.0 (Native WebSocket & Zero Dependencies)  
**Browser Target:** Google Chrome (Headless CDP & Interactive)  

---

## 1. Test Architecture & Runners Overview

The testing suite for *Peppa Pig: Happy Mrs Chicken* is delivered with zero external third-party dependencies (no npm installs needed), featuring triple-runner capabilities:

1. **`tests/e2e_runner.mjs` (Headless Chrome CDP E2E Runner)**:
   - Connects directly to Google Chrome via native Chrome DevTools Protocol (CDP) WebSocket over port `9222`.
   - Automatically executes all 80 test cases across 4 tiers with pass/fail reporting, execution timing, and JSON output generation.
2. **`tests/unit_runner.mjs` (Fast Headless Node.js Unit Runner)**:
   - Validates viewport letterbox coordinate mathematics, Euler physics integration, restitution bounce, 8-state egg hatching state machines, Muddy Puddles jump trajectories, Boids flocking vectors, obstacle collision resolution, Daddy Pig fever meter decay formulas, Web Audio note lookahead tables, and LocalStorage JSON schema validation.
   - Executes in $< 10$ milliseconds.
3. **`tests/test_harness.html` (Interactive In-Browser Visual Test Dashboard)**:
   - Interactive standalone HTML test harness that embeds `index.html` in an `<iframe>`.
   - Supports step-by-step interactive test running, tier filters, live telemetry inspector (`__GAME_STATE__`, `__AUDIO_SPY__`, `__FPS_MONITOR__`), and failure diff diagnostics.

---

## 2. Test Execution Commands

### Fast Unit Test Suite
```bash
# Run unit tests directly via Node.js
node tests/unit_runner.mjs

# Or via npm script
npm test
```

### Full Headless E2E Test Suite (All 80 TCs)
```bash
# Run full 80-test matrix against standalone index.html
node tests/e2e_runner.mjs

# Or via npm script
npm run test:e2e
```

### Run by Specific Tier or Test Case
```bash
# Tier 1 (35 Feature Coverage Tests)
node tests/e2e_runner.mjs --tier=1

# Tier 2 (25 Boundary & Corner Case Tests)
node tests/e2e_runner.mjs --tier=2

# Tier 3 (12 Cross-Feature Combination Tests)
node tests/e2e_runner.mjs --tier=3

# Tier 4 (8 Real-World Scenario Playthroughs)
node tests/e2e_runner.mjs --tier=4

# Run specific test case by ID
node tests/e2e_runner.mjs --test=TC01
```

### Interactive In-Browser Visual Harness
```bash
# Open test harness in Google Chrome or default browser
open tests/test_harness.html
```

---

## 3. Test Matrix & Inventory Checklist (80 Test Cases)

### Tier 1: Feature Coverage (35 Test Cases)
- [x] **TC01**: Initial load displays arcade menu with 4 mode cards (`MENU`).
- [x] **TC02**: Audio toggle button flips mute state in `window.__GAME_STATE__` and localStorage.
- [x] **TC03**: Selecting Mode 1 transitions scene to `EGG_LAYING`.
- [x] **TC04**: Selecting Mode 2 transitions scene to `MUDDY_PUDDLES`.
- [x] **TC05**: Selecting Mode 3 transitions scene to `CHICK_MAZE`.
- [x] **TC06**: Selecting Mode 4 transitions scene to `DADDY_PIG`.
- [x] **TC07**: Standalone `index.html` loads with zero 404 network requests and zero console errors.
- [x] **TC08**: Spacebar triggers egg laying and records `cluck` and `eggPop` audio events.
- [x] **TC09**: Mouse click / screen tap triggers egg laying.
- [x] **TC10**: Eggs experience gravity and bounce with restitution on ground.
- [x] **TC11**: Eggs stack when falling onto existing settled eggs.
- [x] **TC12**: Reaching nest capacity triggers hatching state on settled eggs.
- [x] **TC13**: Hatching egg progresses through cracking stages and emits `crack` and `hatch` audio events.
- [x] **TC14**: Hatched baby chick scampers off-screen and is cleanly removed from entity pool.
- [x] **TC15**: Puddles spawn dynamically over time with valid positions and sizes.
- [x] **TC16**: Spacebar / tap initiates character jump with parabolic velocity curve.
- [x] **TC17**: Landing inside a puddle creates splash particles and fires `splash` audio event.
- [x] **TC18**: Center-hit landing grants bonus splash multiplier points.
- [x] **TC19**: Landing on golden puddle awards $+3\text{s}$ time extension.
- [x] **TC20**: 60-second timer decrements smoothly in real-time.
- [x] **TC21**: Timer expiring at 0 triggers game over modal with score summary.
- [x] **TC22**: Garden maze initializes with fence obstacles and wandering chicks.
- [x] **TC23**: Clicking/tapping on garden grid drops a corn seed entity.
- [x] **TC24**: Seed placement emits `seedDrop` audio chime.
- [x] **TC25**: Nearby wandering chicks steer toward active corn seed.
- [x] **TC26**: Chicks consume seed upon arrival, causing seed entity to disappear.
- [x] **TC27**: Guiding chick into coop increments `coopSavedCount` and triggers cheer effect.
- [x] **TC28**: Saving all required chicks completes stage and advances to next garden layout.
- [x] **TC29**: Rapid tapping increments score and fills fever meter.
- [x] **TC30**: Fever meter reaching threshold activates rainbow egg multiplier ($\ge \times 2$).
- [x] **TC31**: Sustained rapid input triggers visual panic stages (sweat, shake, steam).
- [x] **TC32**: Fever decay occurs when tapping slows down.
- [x] **TC33**: Reaching maximum frenzy / high score threshold triggers computer smoke particles.
- [x] **TC34**: Humorous "Computer Overheat / Blue Screen" cutscene triggers with crash audio jingle.
- [x] **TC35**: New high score is persisted to `localStorage` under `hmc_game_data_v1`.

### Tier 2: Boundary & Corner Cases (25 Test Cases)
- [x] **TC36**: Burst spamming 50 taps/sec does not softlock or freeze canvas.
- [x] **TC37**: Simultaneous multi-touch taps register without NaN coordinates.
- [x] **TC38**: Rapid mode switching spam cleanly unmounts previous mode state.
- [x] **TC39**: Continuous key holding does not flood runaway entities.
- [x] **TC40**: Rapid mute button spamming maintains synchronized audio state.
- [x] **TC41**: Ultra-wide desktop ($21:9$ / $3440\times 1440$) maintains letterboxing.
- [x] **TC42**: Ultra-narrow mobile portrait ($9:16$ / $375\times 812$) scales down proportionally.
- [x] **TC43**: High-DPI / Retina Screen ($\text{DPR} = 3.0$) internal buffer scaling.
- [x] **TC44**: Dynamic orientation flip adapts canvas within 1 animation frame.
- [x] **TC45**: Minimal dimension window ($100\times 100$) clamps without division by zero.
- [x] **TC46**: 100 SFX triggers in 1 second does not clip or exhaust voices.
- [x] **TC47**: Background tab audio throttling / `visibilitychange` handling.
- [x] **TC48**: Zero volume gain ramp safety avoids audio pop artifacts.
- [x] **TC49**: Audio context resume on user gesture unlocks sound without delay.
- [x] **TC50**: Active voice count stays bounded during rapid gameplay.
- [x] **TC51**: Chicks bumping into outer garden walls deflect without tunneling.
- [x] **TC52**: Screen boundary clamping keeps all interactive entities in view.
- [x] **TC53**: 100% of spawned puddles lie within playable lawn bounds.
- [x] **TC54**: Idle player in Mode 1 maintains 60 FPS and idle breathing animation.
- [x] **TC55**: Idle player in Mode 2 lets timer expire cleanly to Game Over.
- [x] **TC56**: Extreme score value ($999,999+$) renders formatted without UI overflow.
- [x] **TC57**: Zero score game over displays cleanly without overwriting higher high score.
- [x] **TC58**: Maximum particle cap limit recycles oldest particles to prevent OOM.
- [x] **TC59**: Negative time prevention clamps timer at $0.00\text{s}$.
- [x] **TC60**: Infinity / NaN coordinate input sanitization guard.

### Tier 3: Cross-Feature Combinations (12 Test Cases)
- [x] **TC61**: Switching game modes while BGM is active preserves clean audio playback without overlap.
- [x] **TC62**: Mode switch mid-particle burst clears particles without residual rendering on Menu.
- [x] **TC63**: Pausing game mid-timer preserves exact remaining time and resumes accurately.
- [x] **TC64**: Return to Menu mid-game cleanly cancels mode loops and resets active state.
- [x] **TC65**: Muting audio during intense particle bursts preserves 60 FPS rendering.
- [x] **TC66**: Keyboard + touch hybrid input simultaneously registers valid inputs.
- [x] **TC67**: LocalStorage quota exceeded / disabled fallback maintains in-memory score.
- [x] **TC68**: Fever mode decay in Daddy Pig smoothly transitions multiplier back to 1x.
- [x] **TC69**: Chick Maze continuous drag pointer creates connected seed trail.
- [x] **TC70**: AudioContext interrupted/suspended recovery resumes without exception.
- [x] **TC71**: Beating high scores across 2 different modes sequentially updates storage.
- [x] **TC72**: Rapid Game Over -> Restart loop (10 iterations) executes cleanly.

### Tier 4: Real-World Scenarios (8 Test Cases)
- [x] **TC73**: Complete Mode 1 Playthrough: Lay 15 eggs, observe hatching, chicks scamper off.
- [x] **TC74**: Complete Mode 2 Playthrough: Multi-puddle splash sequence to game over recap.
- [x] **TC75**: Complete Mode 3 Playthrough: Garden seed trail guiding chicks into coop.
- [x] **TC76**: Complete Mode 4 Playthrough: Daddy Pig high-speed fever to crash cutscene.
- [x] **TC77**: Mobile Touch Emulation: TouchStart, TouchMove, and TouchEnd across all modes.
- [x] **TC78**: Endurance & Stability: Continuous 60 FPS rendering with zero memory leaks.
- [x] **TC79**: Offline Isolation: Zero outbound CDN network requests and 100% offline execution.
- [x] **TC80**: The Grand Tour: Menu -> Mode 1 -> Menu -> Mode 2 -> Menu -> Mode 3 -> Menu -> Mode 4 -> Menu.

---

## 4. Introspection Contracts Implemented

The test runners inspect and verify application behavior through the standardized non-invasive introspection hooks:

```javascript
// State Snapshot
window.__GAME_STATE__ = {
  currentScene: 'MENU' | 'EGG_LAYING' | 'MUDDY_PUDDLES' | 'CHICK_MAZE' | 'DADDY_PIG',
  score: number,
  highScores: { eggLaying: number, muddyPuddles: number, chickMaze: number, daddyPig: number },
  isPaused: boolean,
  isAudioMuted: boolean,
  entities: {
    eggs: Array<{ x: number, y: number, state: string }>,
    chicks: Array<{ x: number, y: number, state: string }>,
    puddles: Array<{ x: number, y: number, type: string, size: number }>,
    seeds: Array<{ x: number, y: number, remaining: number }>
  },
  modeState: {
    timer: number,
    feverMeter: number,
    multiplier: number,
    coopSavedCount: number,
    isOverheating: boolean
  }
};

// Audio Telemetry Spy
window.__AUDIO_SPY__ = {
  events: Array<{ type: string, timestamp: number, params: object }>,
  clear: () => void,
  isContextRunning: () => boolean
};

// FPS & Performance Monitor
window.__FPS_MONITOR__ = {
  currentFPS: number,
  averageFps: number,
  minFps: number,
  droppedFrames: number
};
```
