# Project Plan: Game Improvements & Modular Architecture Refactor

> **Slug**: `games-modularity-plan.md`  
> **Project**: Adventures of Trishu (16-Game Mini-Game Suite)  
> **Status**: COMPLETE (All 16 Mini-Games Modularized & Verified)  
> **Target**: Pure Vanilla TypeScript, HTML5 Canvas 2D, Zero React Footprint

---

## 1. Overview & Architectural Vision

The *Adventures of Trishu* suite contains 16 interactive toddler games. Currently, many scenes have grown into monolithic files (350–500 LOC) that intertwine Canvas 2D drawing routines, entity simulation physics, input handling, audio triggers, and score tracking in a single class. Furthermore, several scenes contain logic bugs (e.g. Mode 3 Chick Maze resetting total score to 0 on round completion, Mode 1 Egg Laying overwriting score when chicks hatch, Mode 2 teleporting Trishu across the screen, Mode 6 hardcoding cook state, Mode 10 having static non-shuffling characters, and Mode 11 playing frying pan sizzle audio for ice cream).

This plan establishes:
1. **Clean Code & Modularity Principles**: Separation of Concerns (SoC) by decomposing every game into a clean 3-part triad:
   - `[Game]Logic.ts`: Pure mathematical game state, collision, entity physics (100% Canvas-agnostic, unit-testable).
   - `[Game]Renderer.ts`: Isolated Canvas 2D drawing with strict `ctx.save()` / `ctx.restore()` stack integrity.
   - `[Game]Scene.ts`: Lightweight glue extending `BaseScene` (<200 LOC) coordinating logic, rendering, and inputs.
2. **Shared Common Game Engine Infrastructure (`src/games/common/`)**: Reusable controllers for combo tracking, round transitions, gesture controls, and haptics/audio helpers to eliminate copy-paste code across games.
3. **Targeted Game-by-Game Improvements**: Fixing all identified scoring/gameplay bugs and implementing the tactile improvements proposed in the audit.

---

## 2. Project Type & Tech Stack

* **Project Type**: `WEB` (HTML5 Canvas 2D Game Suite)
* **Language & Runtime**: Pure Vanilla TypeScript (Strict typechecking, zero `any`)
* **Build Tooling**: Vite 5.x, Vitest (Unit & Integration tests), Playwright (E2E Browser tests)
* **Audio**: Native Web Audio API (Zero external mp3 assets, pure algorithmic synthesis)
* **Design & Typography**: Canvas 2D Vector Path Art + Local Fredoka fonts
* **Persistence**: LocalStorage with schema versioning & fallback safety

---

## 3. Success Criteria (Measurable)

- [x] **Modularity & File Size**: Zero game scene files exceeding 250 LOC; all rendering extracted into dedicated renderers.
- [x] **Pure Logic Decoupling**: All 16 games have a pure logic class runnable in headless Node/Vitest tests without DOM/Canvas mocks.
- [x] **Critical Bugs Resolved**:
  - Mode 1: Hatching chicks no longer overwrites egg-laying score.
  - Mode 2: Trishu uses a smooth leap trajectory with squash & stretch rather than instant X-coordinate teleportation.
  - Mode 3: Completing a round of chick rescues increments round counter and accumulates score instead of resetting to 0; fence collisions active.
  - Mode 6: Dynamic cooking state (pale batter -> golden brown -> crispy) with interactive swipe flip.
  - Mode 10: Characters shuffle randomly behind 4 hiding spots with animated ear/feather/tail hints.
  - Mode 11: Munching ice cream plays crunchy waffle-cone munch audio instead of frying pan sizzle.
  - Mode 14: Avatar scale normalized from tiny `0.45` to `0.9` with running animation along the hill.
- [x] **Test Coverage**: 100% pass rate across existing unit tests, new logic tests, and Playwright E2E suites (76/76 passing).
- [x] **Performance**: Stable 60 FPS (frame budget <= 16.6ms) with zero garbage collection spikes from object pooling.

---

## 4. Target Directory Layout

```
src/
├── games/
│   ├── base/
│   │   ├── BaseScene.ts
│   │   └── index.ts
│   ├── common/                          # [NEW] Reusable Modular Building Blocks
│   │   ├── ScoreComboTracker.ts         # Multiplier, combo decay, milestone fanfare logic
│   │   ├── RoundManager.ts              # Non-destructive round progression & celebration timer
│   │   ├── BoundaryPhysics.ts           # Entity clamping, screen wrapping, lawn boundaries
│   │   ├── GestureController.ts         # Toddler-safe tap debouncing & drag-and-drop helpers
│   │   └── index.ts
│   ├── egg-laying/                      # Mode 1
│   │   ├── EggLayingScene.ts            # Lightweight coordinator (<180 LOC)
│   │   ├── EggLayingLogic.ts            # Egg drop physics, incubation, chick dispersion
│   │   ├── EggLayingRenderer.ts         # Nest, egg wobble, chick drawing
│   │   └── types.ts
│   ├── muddy-puddles/                   # Mode 2
│   │   ├── MuddyPuddlesScene.ts
│   │   ├── MuddyPuddlesLogic.ts
│   │   ├── MuddyPuddlesRenderer.ts
│   │   └── types.ts
│   ├── chick-maze/                      # Mode 3
│   │   ├── ChickMazeScene.ts
│   │   ├── ChickMazeLogic.ts
│   │   ├── ChickMazeRenderer.ts
│   │   └── types.ts
│   ├── dad-kitchen/                     # Mode 4 (Sandwich Tower Dash)
│   ├── dinosaur-balloon/                # Mode 5
│   ├── pancake-flipper/                 # Mode 6
│   ├── vegetable-harvest/               # Mode 7
│   ├── hopscotch-bubble/                # Mode 8
│   ├── mix-match/                       # Mode 9
│   ├── peek-a-boo/                      # Mode 10
│   ├── ice-cream-van/                   # Mode 11
│   ├── little-train/                    # Mode 12
│   ├── car-wash/                        # Mode 13
│   ├── windy-kite/                      # Mode 14
│   ├── rainbow-garden/                  # Mode 15
│   └── duck-picnic/                     # Mode 16
```

---

## 5. Detailed Task Breakdown

### Phase 1: Shared Core Game Infrastructure & Modular Foundation

#### Task 1.1: Shared Score & Combo Manager
- **Agent**: `frontend-specialist`
- **Skill**: `clean-code`
- **Priority**: P0
- **File**: `src/games/common/ScoreComboTracker.ts`
- **INPUT**: Current duplicated multiplier and combo handling in `MuddyPuddlesScene`, `DinosaurBalloonScene`, `PancakeFlipperScene`, `HopscotchBubbleScene`.
- **OUTPUT**: `ScoreComboTracker` class managing points, multipliers (`x1` to `x5`), combo timeout decay, milestone fanfares, and high-score synchronization.
- **VERIFY**: Unit test verifying multiplier step-ups, combo expiration, and score calculation.

#### Task 1.2: Shared Round Manager & Boundary Physics
- **Agent**: `game-developer`
- **Skill**: `game-development`
- **Priority**: P0
- **Files**: `src/games/common/RoundManager.ts`, `src/games/common/BoundaryPhysics.ts`
- **INPUT**: Need for seamless multi-round loops without resetting total scores or leaking state.
- **OUTPUT**:
  - `RoundManager`: Tracks current round, goal thresholds, celebration banners, and clean round transitions.
  - `BoundaryPhysics`: Clamps and wraps entities, calculates 2D roam targets and bounce collisions.
- **VERIFY**: Unit tests for round rollover and entity boundary bounces.

#### Task 1.3: Extended Procedural Audio Recipes
- **Agent**: `game-developer`
- **Skill**: `clean-code`
- **Priority**: P0
- **File**: `src/engine/audio/SoundSynthesizer.ts`, `src/types/game.ts`
- **INPUT**: Missing sound effects identified in audit (`trainWhistle`, `waterHoseSpray`, `coneMunch`, `dinoBite`).
- **OUTPUT**: Procedural Web Audio API oscillator/filter synthesis recipes for all missing SFX without external audio files.
- **VERIFY**: Test calling `soundEngine.playSFX()` with new SFX names without error.

---

### Phase 2: Refactor & Upgrade Tier 1 (Farm & Nature Games)

#### Task 2.1: Mode 1 - Happy Mrs Clucky (`egg-laying`)
- **Agent**: `game-developer`
- **Skills**: `game-development`, `clean-code`
- **Priority**: P1
- **Files**: `src/games/egg-laying/` (`types.ts`, `EggLayingLogic.ts`, `EggLayingRenderer.ts`, `EggLayingScene.ts`)
- **Changes**:
  - Fix score overwrite bug (score now counts total eggs and bonus hatched chicks cumulatively).
  - Implement vertical egg-nest stacking when laying consecutively in place.
  - Separate simulation into `EggLayingLogic.ts` and drawing into `EggLayingRenderer.ts`.
- **INPUT**: Existing monolithic `EggLayingScene.ts`.
- **OUTPUT**: Modular triad, egg stacking feature, bug fix.
- **VERIFY**: Unit test logic; verify score accumulates monotonically.

#### Task 2.2: Mode 2 - Puddle Splash Adventure (`muddy-puddles`)
- **Agent**: `game-developer`
- **Skills**: `game-development`, `clean-code`
- **Priority**: P1
- **Files**: `src/games/muddy-puddles/` (`types.ts`, `MuddyPuddlesLogic.ts`, `MuddyPuddlesRenderer.ts`, `MuddyPuddlesScene.ts`)
- **Changes**:
  - Replace instant X teleportation with smooth leap arc + squash & stretch impact.
  - Add mud boot print splat decals that fade gently.
  - Integrate `ScoreComboTracker` for dynamic multiplier handling.
- **INPUT**: Existing `MuddyPuddlesScene.ts`.
- **OUTPUT**: Modular triad, smooth jump trajectory.
- **VERIFY**: Leap trajectory math test; visual test of jump arc.

#### Task 2.3: Mode 3 - Fluffy Chick Trail (`chick-maze`)
- **Agent**: `game-developer`
- **Skills**: `game-development`, `clean-code`
- **Priority**: P1
- **Files**: `src/games/chick-maze/` (`types.ts`, `ChickMazeLogic.ts`, `ChickMazeRenderer.ts`, `ChickMazeScene.ts`)
- **Changes**:
  - **CRITICAL BUG FIX**: Prevent calling `this.enter()` which erases score on completing chick rescues; integrate `RoundManager` for continuous round score progression.
  - Implement pasture fence collision bounce so chicks navigate around obstacles.
  - Add Mama Hen escort leader mechanic.
- **INPUT**: Existing `ChickMazeScene.ts`.
- **OUTPUT**: Modular triad, score preservation, fence collision.
- **VERIFY**: Unit test rescuing all chicks: score must persist and increment into Round 2.

#### Task 2.4: Mode 7 - Grandpa's Veggie Harvest (`vegetable-harvest`)
- **Agent**: `game-developer`
- **Skills**: `game-development`, `clean-code`
- **Priority**: P1
- **Files**: `src/games/vegetable-harvest/` (`types.ts`, `VegetableHarvestLogic.ts`, `VegetableHarvestRenderer.ts`, `VegetableHarvestScene.ts`)
- **Changes**:
  - Extract 487-line monolith into logic and renderer.
  - Animate Grandpa running to the active mound and straining with dirt kickup.
  - Add giant pumpkin family tug-of-war moment and golden turnip surprises.
- **INPUT**: Existing `VegetableHarvestScene.ts`.
- **OUTPUT**: Sub-200 line scene, clean renderer, family tug animation.
- **VERIFY**: Tug tension test; check zero canvas context state leaks.

#### Task 2.5: Mode 15 & Mode 16 - Rainbow Garden & Picnic Ducks
- **Agent**: `game-developer`
- **Skills**: `game-development`, `clean-code`
- **Priority**: P1
- **Files**: `src/games/rainbow-garden/`, `src/games/duck-picnic/`
- **Changes**:
  - Mode 15: Continuous watering can stream, persistent bloomed garden with musical harp petal taps, and seed planting.
  - Mode 16: Shoreline swimming vs walking states, bread crumb tearing physics, follow-the-leader duck waddle dance.
- **INPUT**: Existing scenes.
- **OUTPUT**: Modular logic and renderers for Mode 15 & 16.
- **VERIFY**: Plant-to-bloom state cycle; duck feeding boids logic test.

---

### Phase 3: Refactor & Upgrade Tier 2 (Kitchen & Creative Studio)

#### Task 3.1: Mode 4 - Dad's Kitchen Dash (`dad-kitchen`)
- **Agent**: `game-developer`
- **Skills**: `game-development`, `clean-code`
- **Priority**: P2
- **Files**: `src/games/dad-kitchen/` (`types.ts`, `DadKitchenLogic.ts`, `DadKitchenRenderer.ts`, `DadKitchenScene.ts`)
- **Changes**:
  - Retheme from duplicate pancake stacking to "Sandwich Tower Dash" (toast, cheese, lettuce, tomato, cucumber).
  - Falling ingredient catching mechanics with Dad's reaching hands and balancing physics.
  - Dynamic fever meter with rapid chopping beat.
- **INPUT**: Existing tap-spam `DadKitchenScene.ts`.
- **OUTPUT**: Differentiated, highly engaging sandwich builder mini-game.
- **VERIFY**: Catch collision test and fever calculation test.

#### Task 3.2: Mode 6 - Golden Pancake Flipper (`pancake-flipper`)
- **Agent**: `game-developer`
- **Skills**: `game-development`, `clean-code`
- **Priority**: P2
- **Files**: `src/games/pancake-flipper/` (`types.ts`, `PancakeFlipperLogic.ts`, `PancakeFlipperRenderer.ts`, `PancakeFlipperScene.ts`)
- **Changes**:
  - Remove hardcoded `cookState = 'PERFECT_GOLDEN'`; implement dynamic cooking color transitions (pale batter -> golden brown -> crispy).
  - Swipe/flick upward pan physics for flip power.
  - Interactive syrup drizzle and berry topping decorator.
- **INPUT**: Existing `PancakeFlipperScene.ts`.
- **OUTPUT**: Modular triad with authentic cooking timing and physics.
- **VERIFY**: Cooking timer state machine test (RAW -> GOLDEN -> OVERCOOKED).

#### Task 3.3: Mode 9 & 10 - Mix & Match Studio & Peek-a-Boo Barnyard
- **Agent**: `game-developer`
- **Skills**: `game-development`, `clean-code`
- **Priority**: P2
- **Files**: `src/games/mix-match/`, `src/games/peek-a-boo/`
- **Changes**:
  - Mode 9: In-game polaroid photo album gallery viewer + hybrid character voice mashups.
  - Mode 10: Randomized shuffling hiding spots with peeking ear/feather/tail hints and guest animals.
- **INPUT**: Monolithic `PeekABooScene.ts` (491 LOC) and `MixMatchScene.ts` (479 LOC).
- **OUTPUT**: Modular logic/renderers with true randomized peek-a-boo mystery.
- **VERIFY**: Shuffling algorithm test ensuring no duplicate characters in spots.

#### Task 3.4: Mode 11 - Miss Bunny's Ice Cream Van (`ice-cream-van`)
- **Agent**: `game-developer`
- **Skills**: `game-development`, `clean-code`
- **Priority**: P2
- **Files**: `src/games/ice-cream-van/` (`types.ts`, `IceCreamLogic.ts`, `IceCreamRenderer.ts`, `IceCreamVanScene.ts`)
- **Changes**:
  - Replace sizzle SFX with crunchy cone munch and nom sound effect.
  - Customer visual order speech bubbles (matching requested flavor gives bonus stars).
  - Rainbow sprinkle shaker tool.
- **INPUT**: Existing `IceCreamVanScene.ts`.
- **OUTPUT**: Modular triad, order matching system, correct audio.
- **VERIFY**: Order validation logic test and scoop stacking height calculation.

---

### Phase 4: Refactor & Upgrade Tier 3 (Action & Outdoor Adventure)

#### Task 4.1: Mode 5 - Leo's Balloon Pop (`dinosaur-balloon`)
- **Agent**: `game-developer`
- **Skills**: `game-development`, `clean-code`
- **Priority**: P3
- **Files**: `src/games/dinosaur-balloon/` (`types.ts`, `DinosaurBalloonLogic.ts`, `DinosaurBalloonRenderer.ts`, `DinosaurBalloonScene.ts`)
- **Changes**:
  - Active dino jumping and biting mechanic when balloons drift nearby.
  - Character balloons (Piggy, Bunny, Clucky) and letter/number educational balloons.
  - Rocket balloons that spiral with funny whistling sound.
- **INPUT**: Existing `DinosaurBalloonScene.ts` (391 LOC).
- **OUTPUT**: Modular triad with active dinosaur interaction.
- **VERIFY**: Balloon pop radius test and dino chomp trigger test.

#### Task 4.2: Mode 8 - Rainbow Bubble Hopscotch (`hopscotch-bubble`)
- **Agent**: `game-developer`
- **Skills**: `game-development`, `clean-code`
- **Priority**: P3
- **Files**: `src/games/hopscotch-bubble/` (`types.ts`, `HopscotchLogic.ts`, `HopscotchRenderer.ts`, `HopscotchBubbleScene.ts`)
- **Changes**:
  - Fix accidental advance bug: only advance Mimi when tapping directly on next tile or Mimi.
  - Continuous bubble wand stream on drag.
  - Bubble merging when floating bubbles touch.
- **INPUT**: Existing `HopscotchBubbleScene.ts` (456 LOC).
- **OUTPUT**: Modular triad with precise touch discrimination.
- **VERIFY**: Touch target test ensuring misses do NOT advance hopscotch position.

#### Task 4.3: Mode 12, 13 & 14 - Train, Car Wash & Kite
- **Agent**: `game-developer`
- **Skills**: `game-development`, `clean-code`
- **Priority**: P3
- **Files**: `src/games/little-train/`, `src/games/car-wash/`, `src/games/windy-kite/`
- **Changes**:
  - Mode 12: Train stops at platforms; toddlers tap waiting passengers to board; brass whistle pull cord; track animal crossings.
  - Mode 13: 3-stage wash (Foam sponge -> Water hose spray -> Towel shine) across Dad's car and Grandpa's tractor.
  - Mode 14: Fix scale 0.45 bug (normalize to 0.9); Trishu runs along hill; circular swipe loop-the-loop gesture.
- **INPUT**: Existing scenes.
- **OUTPUT**: Modular logic and renderers for Modes 12, 13, 14.
- **VERIFY**: Passenger boarding test, 3-stage car wash state test, avatar scale inspection.

---

## 6. Phase X: Final Verification & Quality Gate

- [ ] **Typecheck & Build**:
  ```bash
  npm run build
  ```
  Must compile with zero TypeScript errors and zero warnings.
- [ ] **Unit & Integration Tests**:
  ```bash
  npm test
  ```
  Must pass all existing unit tests and new logic unit tests.
- [ ] **E2E Playwright Browser Tests**:
  ```bash
  npm run test:e2e
  ```
  Must verify that all 16 game modes boot, accept input, play audio, and exit cleanly to the menu.
- [ ] **Canvas State Stack Integrity**:
  Verify zero `ctx.save()` / `ctx.restore()` state leaks across all renderers.
- [ ] **File Size Compliance**:
  Verify all game files comply with the <250 LOC budget.
