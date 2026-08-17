# E2E Test Infra: Peppa Pig — Happy Mrs Chicken

## Test Philosophy
- **Opaque-box & Requirement-Driven**: Tests interact with the standalone `index.html` via native DOM events, pointer/touch clicks, keyboard triggers, and evaluate visual state, audio triggers, localStorage, and performance metrics via non-invasive introspection hooks.
- **Zero External Dependencies**: Test runner executes in native Node.js 24 using native WebSockets communicating directly with Google Chrome via the Chrome DevTools Protocol (CDP). No npm install required.
- **Methodology**: Category-Partition + Boundary Value Analysis + Pairwise Combinatorial Testing + Real-World Workload Sessions.

## Feature Inventory Coverage

| # | Feature | Source (Requirement) | Tier 1 | Tier 2 | Tier 3 | Tier 4 |
|---|---------|----------------------|:------:|:------:|:------:|:------:|
| 1 | High-DPI 16:9 Viewport Scaling | R3 / Visual Polish | 5 | 5 | ✓ | ✓ |
| 2 | 60 FPS Fixed-Step Loop Stability | R3 / Performance | 5 | 5 | ✓ | ✓ |
| 3 | Unified Desktop & Touch Input | R3 / Controls | 5 | 5 | ✓ | ✓ |
| 4 | Procedural Web Audio SFX | R2 / Web Audio | 5 | 5 | ✓ | ✓ |
| 5 | Algorithmic 128 BPM BGM Sequencer | R2 / Web Audio | 5 | 5 | ✓ | ✓ |
| 6 | Arcade Main Menu Navigation | R1 / Game Suite | 5 | 5 | ✓ | ✓ |
| 7 | LocalStorage High Score Persistence | R3 / Storage | 5 | 5 | ✓ | ✓ |
| 8 | Mode 1: Egg Laying Physics & Stack | R1.1 / Classic Mode | 5 | 5 | ✓ | ✓ |
| 9 | Mode 1: 8-State Hatching Lifecycle | R1.1 / Classic Mode | 5 | 5 | ✓ | ✓ |
| 10 | Mode 2: Muddy Puddles Spawning | R1.2 / Muddy Puddles | 5 | 5 | ✓ | ✓ |
| 11 | Mode 2: Jump Trajectory & Splash | R1.2 / Muddy Puddles | 5 | 5 | ✓ | ✓ |
| 12 | Mode 2: Countdown Timer & Recap | R1.2 / Muddy Puddles | 5 | 5 | ✓ | ✓ |
| 13 | Mode 3: Garden Maze & Obstacles | R1.3 / Chick Maze | 5 | 5 | ✓ | ✓ |
| 14 | Mode 3: Flocking AI & Seed Trails | R1.3 / Chick Maze | 5 | 5 | ✓ | ✓ |
| 15 | Mode 3: Coop Sorting & Progression | R1.3 / Chick Maze | 5 | 5 | ✓ | ✓ |
| 16 | Mode 4: Rapid-Fire Laying & Fever | R1.4 / Daddy Pig | 5 | 5 | ✓ | ✓ |
| 17 | Mode 4: Daddy Pig Panic Stages | R1.4 / Daddy Pig | 5 | 5 | ✓ | ✓ |
| 18 | Mode 4: Overheat Crash Cutscene | R1.4 / Daddy Pig | 5 | 5 | ✓ | ✓ |
| 19 | Standalone Zero-CDN Offline File | R2 / Architecture | 5 | 5 | ✓ | ✓ |

## Test Architecture

- **Test Runners**:
  1. `tests/e2e_runner.mjs`: Native Node.js 24 + Chrome DevTools Protocol (CDP) headless runner.
  2. `tests/unit_runner.mjs`: Fast headless Node.js unit test runner for math, boids, and physics logic.
  3. `tests/test_harness.html`: In-browser interactive test harness with visual test runner UI.
- **Pass/Fail Semantics**: Process exits with code 0 if all test assertions pass; non-zero on any failure or unhandled exception. Zero browser console errors required.

## Test Tiers & Matrix (80 Test Cases)

### Tier 1: Feature Coverage (35 Test Cases)
- **Menu & System (TC01 - TC07)**:
  - TC01: Initial load displays arcade menu with 4 mode cards.
  - TC02: Audio toggle button flips mute state in `window.__GAME_STATE__` and localStorage.
  - TC03: Selecting Mode 1 transitions scene to `EGG_LAYING`.
  - TC04: Selecting Mode 2 transitions scene to `MUDDY_PUDDLES`.
  - TC05: Selecting Mode 3 transitions scene to `CHICK_MAZE`.
  - TC06: Selecting Mode 4 transitions scene to `DADDY_PIG`.
  - TC07: Standalone `index.html` loads with zero 404 network requests and zero console errors.
- **Mode 1: Happy Mrs Chicken (TC08 - TC14)**:
  - TC08: Spacebar triggers egg laying and records `cluck` and `eggPop` audio events.
  - TC09: Mouse click / screen tap triggers egg laying.
  - TC10: Eggs experience gravity and bounce with restitution on ground.
  - TC11: Eggs stack when falling onto existing settled eggs.
  - TC12: Reaching nest capacity triggers hatching state on settled eggs.
  - TC13: Hatching egg progresses through cracking stages and emits `crack` and `hatch` audio events.
  - TC14: Hatched baby chick scampers off-screen and is cleanly removed from entity pool.
- **Mode 2: Muddy Puddles (TC15 - TC21)**:
  - TC15: Puddles spawn dynamically over time with valid positions and sizes.
  - TC16: Spacebar / tap initiates character jump with parabolic velocity curve.
  - TC17: Landing inside a puddle creates splash particles and fires `splash` audio event.
  - TC18: Center-hit landing grants bonus splash multiplier points.
  - TC19: Landing on golden puddle awards $+3\text{s}$ time extension.
  - TC20: 60-second timer decrements smoothly in real-time.
  - TC21: Timer expiring at 0 triggers game over modal with score summary.
- **Mode 3: Chick Maze / Sorting (TC22 - TC28)**:
  - TC22: Garden maze initializes with fence obstacles and wandering chicks.
  - TC23: Clicking/tapping on garden grid drops a corn seed entity.
  - TC24: Seed placement emits `seedDrop` audio chime.
  - TC25: Nearby wandering chicks steer toward active corn seed.
  - TC26: Chicks consume seed upon arrival, causing seed entity to disappear.
  - TC27: Guiding chick into coop increments `coopSavedCount` and triggers cheer effect.
  - TC28: Saving all required chicks completes stage and advances to next garden layout.
- **Mode 4: Daddy Pig Challenge (TC29 - TC35)**:
  - TC29: Rapid tapping increments score and fills fever meter.
  - TC30: Fever meter reaching threshold activates rainbow egg multiplier ($\ge \times 2$).
  - TC31: Sustained rapid input triggers visual panic stages (sweat, shake, steam).
  - TC32: Fever decay occurs when tapping slows down.
  - TC33: Reaching maximum frenzy / high score threshold triggers computer smoke particles.
  - TC34: Humorous "Computer Overheat / Blue Screen" cutscene triggers with crash audio jingle.
  - TC35: New high score is persisted to `localStorage` under `hmc_game_data_v1`.

### Tier 2: Boundary & Corner Cases (25 Test Cases)
- TC36 - TC40: Input stress: 50 taps/sec burst spamming does not softlock or crash.
- TC41 - TC45: Extreme viewport resize (ultra-wide $21:9$, narrow mobile portrait $9:16$, $4:3$) maintains correct canvas letterboxing.
- TC46 - TC50: Audio spam: 100 SFX triggers in 1 second does not clip, crash AudioContext, or exhaust voices.
- TC51 - TC55: Boundary collisions: Chicks bumping into outer garden maze walls deflect smoothly without tunneling.
- TC56 - TC60: Zero-timer edge conditions: Jump landing at exactly $t=0.00\text{s}$ correctly registers final splash before game over.

### Tier 3: Cross-Feature Combinations (12 Test Cases)
- TC61 - TC64: Switching game modes while BGM is active preserves clean audio playback without overlap.
- TC65 - TC68: Muting audio during intense particle bursts preserves particle rendering and sets volume to 0.
- TC69 - TC72: High score persistence across multiple sequential games across all 4 modes.

### Tier 4: Real-World Scenarios (8 Test Cases)
- TC73: Complete Mode 1 playthrough (15 eggs laid, 5 chicks hatched, scampered off).
- TC74: Complete Mode 2 playthrough (60s timer run, 10 puddles splashed, game over screen reached).
- TC75: Complete Mode 3 playthrough (Level 1 + Level 2 coop sorting victory).
- TC76: Complete Mode 4 playthrough (Reaching $1000+$ pts, fever multiplier $\times 5$, crash cutscene).
- TC77: Mobile touch event simulation (TouchStart, TouchMove, TouchEnd across all modes).
- TC78: 5-minute endurance test: continuous rendering maintaining $>55\text{ FPS}$ with zero memory leaks.
- TC79: Offline execution test (network disabled, zero CDN requests).
- TC80: Complete full arcade suite journey (Menu -> Mode 1 -> Menu -> Mode 2 -> Menu -> Mode 3 -> Menu -> Mode 4 -> Menu).

## Coverage Thresholds
- Tier 1: $\ge 35$ feature tests
- Tier 2: $\ge 25$ boundary tests
- Tier 3: $\ge 12$ cross-feature tests
- Tier 4: $\ge 8$ real-world scenario tests
- **Total: 80 Test Cases**
