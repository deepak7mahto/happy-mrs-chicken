# E2E Test Infra: Adventures of Trishu 16-Game Suite

## Test Philosophy
- Lean, ultra-fast execution (< 0.05s).
- Comprehensive coverage of engine lifecycle, all 16 mini-game scenes, character renderers, procedural audio recipes, canvas state balance, and PWA capabilities.
- Execution: `npm test` or `node tests/e2e_runner.mjs`.

## Test Architecture
- Test runner: `tests/e2e_runner.mjs`
- Test suite: `tests/smoke.test.ts`
  - Tier 1: Smoke & Initialization (Engine instantiation, 17 scenes, dual-orientation display manager, storage, particle pool, menu drag/wheel navigation)
  - Tier 2: Mini-Game Mechanics (All 16 game modes: Happy Mrs Clucky, Puddle Splash, Fluffy Chick Trail, Dad's Kitchen Dash, Balloon Pop, Golden Pancake Flipper, Grandpa's Veggie Harvest, Rainbow Bubble Hopscotch, Mix & Match, Peek-a-Boo, Miss Bunny's Ice Cream Van, Grandpa's Little Train, Muddy Car Wash, Windy Castle Kite, Rainbow Flower Garden, Picnic Ducks)
  - Tier 3: Audio & Character Roster (20 procedural SFX recipes, BGM sequencer, character vector renderers, modular body parts)
  - Tier 4: Quality Gates (TypeScript check, <500 LOC/file, zero external CDN dependencies, zero Peppa Pig copyrighted strings, zero canvas save/restore leaks)
  - Tier 5: Heavy PWA & Native Capabilities (PwaManager singleton, Service Worker precache updates, beforeinstallprompt, Screen Wake Lock API, online/offline detection)
