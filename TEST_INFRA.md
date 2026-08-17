# E2E Test Infra: Adventures of Trishu 8-Game Suite

## Test Philosophy
- Lean, fast execution (< 1.0 second).
- Comprehensive coverage of engine lifecycle, all 8 mini-game scenes, character renderers, procedural audio recipes, and quality gates.
- Execution: `npm test` or `node tests/e2e_runner.mjs`.

## Test Architecture
- Test runner: `tests/e2e_runner.mjs`
- Test suite: `tests/smoke.test.ts`
  - Suite 1: Smoke & Initialization (Engine instantiation, scenes, display manager, storage, particle pool)
  - Suite 2: Mini-Game Mechanics (All 8 game modes: Happy Mrs Clucky, Puddle Splash, Fluffy Chick Trail, Dad's Kitchen Dash, Balloon Pop, Golden Pancake Flipper, Grandpa's Veggie Harvest, Rainbow Bubble Hopscotch)
  - Suite 3: Audio & Character Roster (18 procedural SFX, BGM sequencer, 8 character renderers)
  - Suite 4: Quality Gates (TypeScript check, <500 LOC/file, zero external CDN dependencies)
