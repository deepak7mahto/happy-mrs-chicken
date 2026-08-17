# Project: Peppa Pig — Happy Mrs Chicken 8-Game Deluxe Expansion

## Architecture
A modular, high-performance HTML5 Canvas 2D game engine built with React 19, TypeScript, and Vite.
- **Engine Core (`src/engine/`)**: 60 FPS fixed-timestep game loop, dual-orientation dynamic viewport manager (`DisplayManager.ts`), multi-touch gesture input manager (`InputManager.ts`), particle pool (`ParticleEngine.ts`), local storage persistence (`StorageManager.ts`), and procedural audio suite (`src/engine/audio/`).
- **Procedural Web Audio (`src/engine/audio/`)**: Zero-asset audio synthesis using native Web Audio API oscillators, noise buffers, biquad filters, and an algorithmic 128 BPM multi-track nursery BGM sequencer.
- **Vector Character Rendering (`src/graphics/characters/`)**: Procedural Canvas 2D vector art for all 7 characters (Mrs Chicken, Peppa Pig, George Pig with Mr. Dinosaur, Daddy Pig, Mummy Pig, Grandpa Pig, Suzy Sheep, and Baby Chicks) with shared animation controllers for blinking, squashing, wobbling, and facial expressions.
- **Mini-Game Modes (`src/modes/`)**: 8 standalone mini-game scenes implementing the `BaseScene` / `MiniGame` contract (`init`, `enter`, `update`, `render`, `handleInput`, `resize`, `exit`, `destroy`, `getEntities`, `getModeState`).
- **UI & PWA (`src/components/`, `src/pwa/`)**: Responsive HUD, toddler multi-touch tap ripple feedback, and Service Worker offline caching.

## Feature Inventory
Every feature from the Survey phase is mapped to an implementation milestone below:

| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Master Types & Schema Expansion | `GameModeId` (8 modes), `SFXName` (16 sfx), `HighScores` (8 modes), Character anim types | M1 | Survey (R1, R4) |
| 2 | Modular Audio Engine (<500 LOC) | Decompose into `AudioContextHolder`, `SoundSynthesizer`, `BGMSequencer`, `AudioSpy`, `index.ts` | M1 | Survey (R3, R4) |
| 3 | 16 Procedural SFX Recipes | Synthesize all 16 sound effects (roars, sizzle, whoosh, veggie pop, bubble pop, clucks, splashes, fanfare) | M1 | Survey (R3) |
| 4 | Algorithmic BGM Sequencer | 128 BPM multi-track nursery music generator with dynamic tempo control | M1 | Survey (R3) |
| 5 | Extended Particle Engine | Support confetti, soap bubbles, pancake syrup drips, mud clods, and sparkles | M1 | Survey (R1) |
| 6 | Storage Manager 8-Mode Persistence | LocalStorage schema for all 8 high scores with fallback safety | M1 | Survey (R4) |
| 7 | Shared Character Animation Controller | `CharacterAnimState` helper for eye blinks, breathing squash, wobbles, volume preservation | M2 | Survey (R2) |
| 8 | George Pig & Mr. Dinosaur Model | Procedural George Pig holding Mr. Dinosaur with animated chomping jaw | M2 | Survey (R2) |
| 9 | Mummy Pig Model | Procedural Mummy Pig with eyelashes, mascara, orange dress, and frying pan | M2 | Survey (R2) |
| 10 | Grandpa Pig Model | Procedural Grandpa Pig with sailing cap, beard stubble, purple shirt, wellies | M2 | Survey (R2) |
| 11 | Suzy Sheep Model | Procedural Suzy Sheep with pink dress and fluffy scalloped wool ears | M2 | Survey (R2) |
| 12 | Existing Character Model Upgrades | Enhance Mrs Chicken, Peppa Pig, Daddy Pig, Baby Chicks with facial animations & blinking | M2 | Survey (R2) |
| 13 | Mode 5: Dinosaur Balloon Pop | George's dinosaur balloon pop with rising balloons, confetti bursts, roars, giggles | M3 | Survey (R1.5) |
| 14 | Mode 6: Mummy Pig Pancake Flipper | Pancake frying pan flip timing, parabolic flight, golden detection, plate stacking | M3 | Survey (R1.6) |
| 15 | Mode 7: Grandpa Pig Vegetable Harvest | Garden vegetable pulling with elastic tension resistance, mud pops, wheelbarrow counter | M3 | Survey (R1.7) |
| 16 | Mode 8: Suzy Sheep Hopscotch & Bubbles | Shimmering soap bubbles, glockenspiel pop chimes, hopscotch path to picnic | M3 | Survey (R1.8) |
| 17 | Existing 4 Mini-Games Refactor | Update Mode 1–4 scenes to leverage modular audio, character models, and animation state | M4 | Survey (R1.1-1.4) |
| 18 | 8-Game Arcade Menu Scene | Responsive paginated / grid menu with live preview animations and high score badges | M4 | Survey (R1, R4) |
| 19 | Dual-Orientation Viewport & HUD | Responsive fill for Portrait 9:16 and Landscape 16:9 with zero letterbox distortion | M4 | Survey (R4) |
| 20 | PWA Offline Integrity & Service Worker | Service Worker caching in `public/sw.js`, zero external CDN dependencies | M4 | Survey (R4) |
| 21 | E2E Testing Suite (Tiers 1-4) | Comprehensive opaque-box test runner and 80 test cases covering all 8 modes | E2E Track | Survey (§4.8) |
| 22 | Final E2E Suite Pass & Adversarial Hardening | 100% test pass on Tiers 1-4 + Tier 5 white-box challenger adversarial testing | M5 (Final) | Survey & Spec |

## Milestones

| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| E2E | E2E Testing Track | Test infra, headless test runner, Tiers 1–4 test suite (80 test scenarios), `TEST_READY.md` | none | DONE |
| M1 | Core Types, Audio Engine & Foundation | Types expansion (`src/types/`), modular Audio Engine (`src/engine/audio/`), ParticleEngine expansion, StorageManager update | none | DONE |
| M2 | Character Models & Procedural Vector Graphics | Animation controller (`animations.ts`), George+Dino, Mummy Pig, Grandpa Pig, Suzy Sheep, existing character upgrades | M1 | DONE |
| M3 | 4 New Mini-Game Scenes | `DinosaurBalloonScene`, `PancakeFlipperScene`, `VegetableHarvestScene`, `HopscotchBubbleScene` | M1, M2 | DONE |
| M4 | Existing Scenes Refactor, 8-Game Menu & PWA | Refactor Modes 1–4, 8-Game `MenuScene`, HUD, GameEngine wiring, PWA `sw.js` | M1, M2, M3 | DONE |
| M5 | Final E2E Test Pass & Adversarial Hardening | Phase 1: 100% E2E test pass (Tiers 1-4). Phase 2: Tier 5 adversarial testing & Forensic Audit | M4, E2E | DONE |

## Interface Contracts

### 1. Game Mode Lifecycle (`src/types/game.ts` & `src/modes/BaseScene.ts`)
```typescript
export type GameModeId =
  | 'MENU'
  | 'EGG_LAYING'
  | 'MUDDY_PUDDLES'
  | 'CHICK_MAZE'
  | 'DADDY_PIG'
  | 'DINOSAUR_BALLOON'
  | 'PANCAKE_FLIPPER'
  | 'VEGETABLE_HARVEST'
  | 'HOPSCOTCH_BUBBLE';

export interface MiniGame {
  readonly modeId: GameModeId;
  score: number;
  highScoreKey: string;
  enter(params?: Record<string, unknown>): void;
  exit(): void;
  update(dt: number, input: InputManager): void;
  render(ctx: CanvasRenderingContext2D, alpha: number, display: DisplayManager): void;
  handleInput?(input: InputManager): void;
  resize?(display: DisplayManager): void;
  pause?(): void;
  resume?(): void;
  destroy?(): void;
  getEntities(): Record<string, unknown>;
  getModeState(): Record<string, unknown>;
}
```

### 2. Procedural Audio Engine (`src/engine/audio/index.ts`)
```typescript
export type SFXName =
  | 'cluck'
  | 'eggPop'
  | 'crack'
  | 'hatch'
  | 'splash'
  | 'seedDrop'
  | 'fanfare'
  | 'crash'
  | 'click'
  | 'dinosaurRoar'
  | 'balloonPop'
  | 'pancakeSizzle'
  | 'whoosh'
  | 'veggiePop'
  | 'mudThud'
  | 'bubblePop'
  | 'sheepBleat'
  | 'toddlerGiggle';

export interface ISoundEngine {
  init(): Promise<void>;
  unlock(): Promise<void>;
  playSFX(name: SFXName, options?: { playbackRate?: number; volume?: number }): void;
  startBGM(): void;
  stopBGM(): void;
  setBGMTempo(bpm: number): void;
  toggleMute(): boolean;
  setVolume(volume: number): void;
  isMuted: boolean;
}
```

### 3. Character Animation & Rendering Contracts (`src/graphics/animations.ts` & `src/graphics/characters/`)
```typescript
export interface CharacterAnimState {
  blinkTimer: number;
  isBlinking: boolean;
  breathTimer: number;
  breathScale: number;
  wobbleTimer: number;
  wobbleAngle: number;
}

export function drawMrsChicken(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, options?: ChickenOptions): void;
export function drawPeppaPig(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, options?: PeppaOptions): void;
export function drawGeorgePig(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, options?: GeorgeOptions): void;
export function drawDaddyPig(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, options?: DaddyPigOptions): void;
export function drawMummyPig(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, options?: MummyPigOptions): void;
export function drawGrandpaPig(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, options?: GrandpaPigOptions): void;
export function drawSuzySheep(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, options?: SuzySheepOptions): void;
export function drawBabyChick(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, options?: ChickOptions): void;
```

## Code Layout
Every file in `src/` must remain strictly **under 500 lines of code**.

```
src/
├── types/
│   ├── game.ts                    # GameModeId, MiniGame interface, mode config
│   ├── characters.ts              # Character animation state & options
│   ├── audio.ts                   # SFX names, BGM types, synth interfaces
│   ├── particles.ts               # Particle interface, shape enums
│   └── storage.ts                 # HighScores, GameSettings, StorageData
├── engine/
│   ├── GameEngine.ts              # Master game orchestrator & scene manager
│   ├── DisplayManager.ts          # Dual orientation (9:16 portrait, 16:9 landscape)
│   ├── InputManager.ts            # Pointer, touch, keyboard, gesture tracking
│   ├── GameLoop.ts                # Deterministic 60 FPS loop + FPS monitor
│   ├── StorageManager.ts          # LocalStorage persistence (8 high scores)
│   ├── Haptics.ts                 # Vibration API wrapper
│   ├── ParticleEngine.ts          # Particle pooling (confetti, bubbles, mud, feathers)
│   └── audio/
│       ├── AudioContextHolder.ts  # Web Audio context & master gain management
│       ├── SoundSynthesizer.ts    # Procedural sound recipes for 16 SFX
│       ├── BGMSequencer.ts        # Algorithmic 128 BPM nursery music
│       ├── AudioSpy.ts            # Introspection telemetry for test validation
│       └── index.ts               # SoundEngine facade
├── graphics/
│   ├── palette.ts                 # Peppa Pig color palette
│   ├── animations.ts              # Shared procedural animation math & easing
│   ├── characters/
│   │   ├── chickenRenderer.ts     # Mrs Chicken vector model
│   │   ├── peppaRenderer.ts       # Peppa Pig vector model
│   │   ├── daddyPigRenderer.ts    # Daddy Pig vector model
│   │   ├── georgeRenderer.ts      # George Pig & Mr. Dinosaur vector model
│   │   ├── mummyPigRenderer.ts    # Mummy Pig & frying pan vector model
│   │   ├── grandpaPigRenderer.ts  # Grandpa Pig, sailing cap & wellies
│   │   ├── suzySheepRenderer.ts   # Suzy Sheep & fluffy wool ears
│   │   └── chickRenderer.ts       # Baby chick vector model
│   ├── environment/
│   │   ├── skyAndHills.ts         # Cartoon sky, smiling sun, hills
│   │   ├── farmAssets.ts          # Hay nest, egg, hen coop
│   │   └── gardenAssets.ts        # Mud puddles, garden soil mounds, vegetables
│   └── index.ts                   # Unified graphics barrel
├── modes/
│   ├── BaseScene.ts               # Abstract base scene class
│   ├── MenuScene.ts               # 8-game responsive grid / arcade menu
│   ├── EggLayingScene.ts          # Mode 1: Happy Mrs Chicken
│   ├── MuddyPuddlesScene.ts       # Mode 2: Muddy Puddles
│   ├── ChickMazeScene.ts          # Mode 3: Chick Maze / Sorting
│   ├── DaddyPigScene.ts           # Mode 4: Daddy Pig Reaction Challenge
│   ├── DinosaurBalloonScene.ts    # Mode 5: George's Dinosaur Balloon Pop
│   ├── PancakeFlipperScene.ts     # Mode 6: Mummy Pig's Pancake Flipper
│   ├── VegetableHarvestScene.ts   # Mode 7: Grandpa Pig's Vegetable Harvest
│   └── HopscotchBubbleScene.ts    # Mode 8: Suzy Sheep's Hopscotch & Bubble Trail
├── components/
│   ├── GameCanvas.tsx             # React canvas wrapper
│   ├── HUD.tsx                    # Top navigation, Home, Mute, Fullscreen
│   └── ToddlerTapFeedback.tsx     # Tap ripple overlay
├── pwa/
│   └── registerServiceWorker.ts   # Offline Service Worker registration
├── App.tsx                        # Root React layout
└── main.tsx                       # React DOM root entry
tests/
├── e2e_runner.mjs                 # Headless automated E2E test runner
├── tier1_smoke.test.ts            # Tier 1: Smoke, Initialization & Lifecycle tests
├── tier2_mechanics.test.ts        # Tier 2: 8 Mini-Game core mechanics tests
├── tier3_ui_audio.test.ts         # Tier 3: UI, Dual-orientation & Audio tests
└── tier4_quality_pwa.test.ts      # Tier 4: TypeScript, Line count, Offline PWA tests
```
