# E2E Test Infra: Peppa Pig — Happy Mrs Chicken 8-Game Suite

## Test Philosophy
- Opaque-box, requirement-driven testing. No reliance on internal module private state.
- Methodology: Category-Partition + Boundary Value Analysis (BVA) + Pairwise Interaction + Workload Testing.
- Execution: Direct node-based runner (`tests/e2e_runner.mjs` or `npm test`) exercising engine lifecycle, all 8 game scenes, character renderers, procedural audio synthesis recipes, dual-orientation resizing, and offline PWA compliance.

## Feature Inventory
| # | Feature | Source (requirement) | Tier 1 | Tier 2 | Tier 3 | Tier 4 |
|---|---------|---------------------|:------:|:------:|:------:|:------:|
| 1 | 8-Game Menu Selection | ORIGINAL_REQUEST §1 | 2 | 2 | 2 | 1 |
| 2 | Mode 1: Happy Mrs Chicken | ORIGINAL_REQUEST §1.1 | 2 | 4 | 2 | 1 |
| 3 | Mode 2: Muddy Puddles | ORIGINAL_REQUEST §1.2 | 2 | 4 | 2 | 1 |
| 4 | Mode 3: Chick Maze / Sorting | ORIGINAL_REQUEST §1.3 | 2 | 4 | 2 | 1 |
| 5 | Mode 4: Daddy Pig Challenge | ORIGINAL_REQUEST §1.4 | 2 | 4 | 2 | 1 |
| 6 | Mode 5: Dinosaur Balloon Pop | ORIGINAL_REQUEST §1.5 | 2 | 4 | 2 | 1 |
| 7 | Mode 6: Mummy Pig Pancake Flipper | ORIGINAL_REQUEST §1.6 | 2 | 4 | 2 | 1 |
| 8 | Mode 7: Grandpa Pig Vegetable Harvest | ORIGINAL_REQUEST §1.7 | 2 | 4 | 2 | 1 |
| 9 | Mode 8: Suzy Sheep Hopscotch & Bubbles | ORIGINAL_REQUEST §1.8 | 2 | 4 | 2 | 1 |
| 10 | 7 Procedural Vector Characters | ORIGINAL_REQUEST §2 | 2 | 4 | 4 | 2 |
| 11 | 16 Procedural SFX & Nursery BGM | ORIGINAL_REQUEST §3 | 2 | 4 | 4 | 1 |
| 12 | Dual Orientation & Responsive Scaling | ORIGINAL_REQUEST §4 | 2 | 2 | 4 | 2 |
| 13 | TypeScript, <500 LOC & PWA Offline | ORIGINAL_REQUEST §4 | 2 | 2 | 2 | 4 |

## Test Architecture
- Test runner: `tests/e2e_runner.mjs` running via `node tests/e2e_runner.mjs` or `npm test`.
- Test case format: Structured assertions validating simulation state, entity updates, audio triggers via `window.__AUDIO_SPY__`, screen coordinate projections, and build artifacts.
- Directory layout:
  - `tests/e2e_runner.mjs`: Test runner harness and reporter.
  - `tests/tier1_smoke.test.ts` (or `.js`): Smoke, Initialization, and Lifecycle.
  - `tests/tier2_mechanics.test.ts`: 8 Mini-Game mechanics & edge cases.
  - `tests/tier3_ui_audio.test.ts`: Responsive dual orientation & audio synthesis.
  - `tests/tier4_quality_pwa.test.ts`: TypeScript check, line count limit (<500), PWA offline caching.

## Real-World Application Scenarios (Tier 4)
| # | Scenario | Features Exercised | Complexity |
|---|----------|--------------------|------------|
| 1 | Full Toddler Play Session | Menu $\to$ 8 Games sequentially $\to$ High Scores stored | High |
| 2 | Rapid Orientation Flipping | Portrait $\leftrightarrow$ Landscape in active gameplay | Medium |
| 3 | Audio Mute & Multi-Touch Fuzzing | Rapid multi-touch pointer taps with audio toggle | Medium |
| 4 | Offline PWA Cold Boot | Service Worker cache boot with zero network access | High |
| 5 | Continuous 60 FPS Particle Stress | Max particles across balloons, splashes, and confetti | High |

## Coverage Thresholds
- Tier 1: $\ge 15$ test cases (smoke, initialization, lifecycle)
- Tier 2: $\ge 32$ test cases (4 per mini-game mode across all 8 modes)
- Tier 3: $\ge 18$ test cases (orientation, audio synthesis, multi-touch, character anim)
- Tier 4: $\ge 15$ test cases (build verification, line counts, PWA offline, stress scenarios)
- **Total Suite: $\ge 80$ test cases**
