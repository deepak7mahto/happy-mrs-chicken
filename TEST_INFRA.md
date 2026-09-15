# E2E Test Infra: Adventures of Trishu 16-Game Suite

## Test Philosophy
- Lean, fast execution (< 0.1 second).
- Comprehensive coverage of engine lifecycle, all 16 mini-game scenes, character renderers, procedural audio recipes, canvas state balance, and quality gates.
- Execution: `npm test` or `node tests/e2e_runner.mjs`.

## Test Architecture
- Test runner: `tests/e2e_runner.mjs`
- Test suite: `tests/smoke.test.ts`
  - Suite 1: Smoke & Initialization (Engine instantiation, scenes, display manager, storage, particle pool, menu grid)
  - Suite 2: Mini-Game Mechanics (All 16 game modes: Happy Mrs Clucky, Puddle Splash, Fluffy Chick Trail, Dad's Kitchen Dash, Balloon Pop, Golden Pancake Flipper, Grandpa's Veggie Harvest, Rainbow Bubble Hopscotch, Mix & Match, Peek-a-Boo, Ice Cream Van, Little Train, Car Wash, Windy Kite, Rainbow Garden, Picnic Ducks)
  - Suite 3: Audio & Character Roster (20 procedural SFX, BGM sequencer, modular character renderers)
  - Suite 4: Quality Gates (TypeScript check, <500 LOC/file, zero external CDN dependencies, zero canvas save/restore leaks)
  - Suite 5: Heavy PWA & Native Capabilities (PwaManager, wake lock, online/offline, service worker updates)
