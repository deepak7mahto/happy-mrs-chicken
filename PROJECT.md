# Project: Peppa Pig — Happy Mrs Chicken Standalone Browser Game Suite

## Architecture

### High-Level System Architecture
The application is structured as a self-contained, zero-external-dependency HTML5 application delivered in `index.html` with modular JavaScript subsystems communicating via strict state interfaces:

```
+-----------------------------------------------------------------------------------+
|                                    index.html                                     |
|  +-----------------------------------------------------------------------------+  |
|  | CSS Styles: Responsive Viewport, High-DPI Canvas Letterboxing, HUD Overlays |  |
|  +-----------------------------------------------------------------------------+  |
|  | HTML Structure: Viewport Container, #gameCanvas, UI Overlays, Audio Unlock   |  |
|  +-----------------------------------------------------------------------------+  |
|  | JS Engine:                                                                  |  |
|  |  [InputManager] ----> [SceneManager] <----> [StorageManager]                |  |
|  |         |                    |                       |                      |  |
|  |         v                    v                       v                      |  |
|  |  [SoundSynthesizer]   [Active Game Mode]     [LocalStorage]                 |  |
|  |  (Web Audio BGM/SFX)  - Menu                 (High Scores & Settings)       |  |
|  |                       - Mode 1: Egg Laying                                  |  |
|  |                       - Mode 2: Muddy Puddles                               |  |
|  |                       - Mode 3: Chick Maze                                  |  |
|  |                       - Mode 4: Daddy Pig                                   |  |
|  |                              |                                              |  |
|  |                              v                                              |  |
|  |                     [CartoonRenderer2D] <--- [ParticleSystem]               |  |
|  |                              |                                              |  |
|  |                              v                                              |  |
|  |                   [Testing Introspection Hooks]                             |  |
|  |                   (window.__GAME_STATE__, __AUDIO_SPY__, __FPS_MONITOR__)   |  |
|  +-----------------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------------+
```

### Module Boundaries & Responsibilities
1. **Core Engine & Canvas Pipeline**:
   - High-DPI Canvas scaling preserving 16:9 virtual aspect ratio ($960 \times 540$).
   - 60 FPS fixed-timestep accumulator game loop (`dt = 1/60s`) with rendering interpolation.
   - Unified Input Manager capturing pointer/mouse, multi-touch taps, and keyboard (Space, Arrows, ESC, M).
2. **Procedural Web Audio Engine**:
   - Zero audio assets / CDN dependencies. 100% synthesized via Web Audio API.
   - Master Gain, compressor/limiter, mute toggle, and unlocked AudioContext gate.
   - Synthesizer recipes: Clucks/Bawks, Egg Pop, Crack & Hatch, Mud Splashes, Corn Seed Chime, Victory Fanfare, Computer Crash Jingle.
   - Algorithmic 128 BPM multi-track nursery BGM sequencer (Melody, Bass, Chords, Percussion).
3. **Procedural Cartoon 2D Graphics & Particle Engine**:
   - Procedural vector character rendering: Mrs Chicken (squash & stretch), Peppa Pig (boots), George Pig, Daddy Pig (glasses, panic states, crash), Baby Chicks, Coop, Nest, Fence, Mud Puddles, Farm landscape.
   - Particle Engine: Eggshells, mud droplets, feathers, sparkles, steam/smoke, combo popups.
4. **Arcade Menu & State Management**:
   - Animated selection cards for 4 modes with live mini-previews, high score badges, audio toggle, and instruction overlays.
5. **Game Mode 1: Happy Mrs Chicken (Classic Egg-Laying)**:
   - Egg laying physics, stacking & restitution, nest capacity threshold, 8-state cracking & hatching, chirping baby chicks scampering off-screen, egg counter.
6. **Game Mode 2: Muddy Puddles**:
   - Dynamic tiered puddle spawner (Small, Medium, Mega, Golden +3s), jump trajectory, center-accuracy splash scoring, dual-layer mud particles, 60s countdown timer.
7. **Game Mode 3: Chick Maze / Sorting**:
   - Top-down garden maze with obstacles (fences, flowers, mud slows), Reynolds Boids wandering chicks, corn seed trail placement, whistle call, coop scoring zone.
8. **Game Mode 4: Daddy Pig High Score Challenge**:
   - Rapid-fire accelerating egg laying, fever meter & multipliers ($\times 1 \to \times 10$), escalating Daddy Pig panic/smoke, computer overheat blue screen / crash cutscene, local storage leaderboard.

---

## Feature Inventory

| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | High-DPI 16:9 Canvas Viewport | Virtual $960 \times 540$ rendering with auto-scaling and letterboxing | M1 | Survey |
| 2 | 60 FPS Fixed-Step Game Loop | Delta-time accumulator loop ensuring deterministic physics and fluid animation | M1 | Survey |
| 3 | Unified Input System | Pointer, touch tap/swipe, and keyboard (Space, Arrows, ESC, M) abstraction | M1 | Survey |
| 4 | Procedural SFX Synthesizer | Web Audio oscillators, noise buffers, and filters for all game SFX | M1 | Survey |
| 5 | Algorithmic Nursery BGM Sequencer | Multi-track cheerful 128 BPM background music generator with zero external files | M1 | Survey |
| 6 | Procedural Cartoon Art System | Vector drawing routines for Mrs Chicken, Peppa, Daddy Pig, chicks, farm assets | M1 | Survey |
| 7 | Particle & FX Subsystem | Dynamic particles (mud, eggshells, feathers, sparkles, smoke) with pooling | M1 | Survey |
| 8 | Opaque-Box Introspection Hooks | `window.__GAME_STATE__`, `window.__AUDIO_SPY__`, `window.__FPS_MONITOR__` | M1 | Survey |
| 9 | Arcade Game Selection Menu | 4 interactive mode cards with live preview animations and high score badges | M2 | Survey |
| 10 | LocalStorage Data Persistence | Schema `hmc_game_data_v1` saving high scores, stats, and audio settings | M2 | Survey |
| 11 | Mrs Chicken Egg-Laying Physics | Squash & stretch chicken animation, egg ejection velocity, ground/egg restitution | M2 | Survey |
| 12 | Egg Stacking & Nest Threshold | Stacking physics and nest threshold trigger triggering hatching phase | M2 | Survey |
| 13 | 8-State Cracking & Hatching Cycle | Wobble, fissure lines, shell burst, chick emergence, chirp, scamper off-screen | M2 | Survey |
| 14 | Dynamic Puddle Spawning System | Tiered sizes (Small/Med/Mega/Golden), dynamic placement, ripples, lifetime decay | M3 | Survey |
| 15 | Muddy Puddles Jump & Splash | Parabolic jump physics, center-hit detection, splash particles, multiplier scoring | M3 | Survey |
| 16 | Muddy Puddles Timer & Scoreboard | 60s countdown timer with golden puddle extensions, game over recap | M3 | Survey |
| 17 | Chick Maze Garden Environment | Top-down garden grid with fences, flowerbeds, mud slowing zones, and coop | M3 | Survey |
| 18 | Autonomous Chick Flocking AI | Reynolds Boids (cohesion, separation, alignment, wandering noise) | M3 | Survey |
| 19 | Corn Seed Trail & Guiding Controls | Tap/click to drop corn seeds attracting nearby chicks, whistle call assist | M3 | Survey |
| 20 | Chick Coop Sorting & Victory Flow | Coop entry detection, chick counter, multi-stage garden progression | M3 | Survey |
| 21 | Daddy Pig Rapid-Fire Egg Laying | Accelerated egg laying input, fever meter (+4.5%/tap), combo multipliers | M4 | Survey |
| 22 | Daddy Pig Panic & Smoke Escalation | 4-stage visual escalation (calm, focused, sweating/shaking, smoke/sparks) | M4 | Survey |
| 23 | Overheat Crash Cutscene & BSOD | Comedic computer smoke, blue screen cutscene, high score celebration | M4 | Survey |
| 24 | Mobile Touch Controls & UI Polish | Responsive HUD overlays, pause menu, audio mute button, help dialog | M4 | Survey |
| 25 | Standalone Offline Single-File Pack | Bundled self-contained `index.html` with zero external requests/CDNs | M4 | Survey |
| 26 | 100% Pass of 4-Tier E2E Test Suite | Headless Chrome CDP & visual harness verifying 80+ test cases | M5 | Testing |
| 27 | Adversarial Hardening (Tier 5) | White-box stress testing, memory leak audit, rapid input fuzzing | M5 | Testing |

---

## Milestones

| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| E2E | E2E Testing Suite & Harness | Headless Chrome CDP runner, browser test harness, 80 test cases across 4 tiers | none | DONE |
| M1 | Core Engine, Web Audio & Cartoon Renderer | Viewport, 60fps loop, input, Web Audio SFX & BGM, vector graphics, particles, testing hooks | none | DONE |
| M2 | Arcade Menu & Classic Egg-Laying Mode | Main menu, mode cards, local storage, egg laying physics, stacking, 8-state hatching, scampering chicks | M1 | DONE |
| M3 | Muddy Puddles & Chick Maze Modes | Dynamic puddles, jump & splash scoring, timer, garden maze, boids flocking AI, seed trail, coop | M1, M2 | DONE |
| M4 | Daddy Pig Challenge & Complete UI Polish | Rapid-fire fever meter, Daddy Pig panic/crash cutscene, high score leaderboard, mobile HUD, single-file bundle | M1, M2, M3 | DONE |
| M5 | Final Verification & Adversarial Hardening | Pass 100% E2E test suite (Tiers 1-4) followed by Tier 5 adversarial stress testing & coverage hardening | E2E, M4 | DONE |

---

## Interface Contracts

### Audio Engine Interface (`window.__AUDIO_ENGINE__`)
```javascript
{
  init: () => Promise<boolean>,
  unlock: () => Promise<boolean>,
  setMuted: (isMuted: boolean) => void,
  isMuted: () => boolean,
  playSFX: (sfxName: 'cluck'|'eggPop'|'crack'|'hatch'|'splash'|'seedDrop'|'fanfare'|'crash'|'click', options?: object) => void,
  startBGM: () => void,
  stopBGM: () => void,
  setBGMTempo: (bpm: number) => void
}
```

### Scene Manager & Game State Interface (`window.__GAME_STATE__`)
```javascript
{
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
}
```

### Testing & Verification Spy Contract (`window.__AUDIO_SPY__` & `window.__FPS_MONITOR__`)
```javascript
window.__AUDIO_SPY__ = {
  events: Array<{ type: string, timestamp: number, params: object }>,
  clear: () => void
};
window.__FPS_MONITOR__ = {
  currentFPS: number,
  avgFPS: number,
  droppedFrames: number,
  history: number[]
};
```

---

## Code Layout

```
/Users/homemac/teamwork_projects/happy_mrs_chicken/
├── index.html                  # Standalone self-contained game suite (HTML + embedded CSS + embedded JS)
├── ORIGINAL_REQUEST.md         # Immutable original user request
├── PROJECT.md                  # Master project architecture, feature inventory, milestones, contracts
├── TEST_INFRA.md               # E2E Test Suite specification and 4-tier matrix
├── TEST_READY.md               # Signal published when E2E test runner and test cases are ready
├── tests/
│   ├── e2e_runner.mjs          # Zero-dependency Headless Chrome CDP test runner (Node 24 native)
│   ├── unit_runner.mjs         # Fast headless node unit test runner for math, boids, and state logic
│   └── test_harness.html       # Visual in-browser interactive test harness & test suite runner
└── .agents/                    # Agent metadata, briefings, handoffs (NO source code here)
```
