# E2E Test Infra: Adventures of Trishu 16-Game Suite

## Test Philosophy
- Lean, ultra-fast execution (< 0.05s unit runner, comprehensive multi-device browser coverage).
- Zero flakiness: deterministic game loop ticks, full Mock Audio API, and DOM isolation.
- Comprehensive coverage of engine lifecycle, all 16 mini-game scenes, 15-character avatar roster, procedural audio recipes, background audio suspension, canvas state balance, and PWA capabilities.
- Execution: `npm test` or `node tests/e2e_runner.mjs`.

## Test Architecture

### 1. Headless Automated Test Runner (`tests/e2e_runner.mjs` — 76 tests across 9 suites in <0.05s)
- **Tier 1**: Smoke & Initialization (Engine instantiation, 17 scenes, dual-orientation display manager, storage, particle pool, menu drag/wheel navigation)
- **Tier 2**: Mini-Game Mechanics (All 16 game modes: Happy Mrs Clucky, Puddle Splash, Fluffy Chick Trail, Dad's Kitchen Dash, Balloon Pop, Golden Pancake Flipper, Grandpa's Veggie Harvest, Rainbow Bubble Hopscotch, Mix & Match, Peek-a-Boo, Miss Bunny's Ice Cream Van, Grandpa's Little Train, Muddy Car Wash, Windy Castle Kite, Rainbow Flower Garden, Picnic Ducks)
- **Tier 3**: Audio & Character Roster (24 procedural SFX recipes, BGM sequencer, character vector renderers, modular body parts, `pauseAll()` and `resumeAll()` background suspension)
- **Tier 4**: Quality Gates (TypeScript check, <500 LOC/file, zero external CDN dependencies, zero Peppa Pig copyrighted strings, zero canvas save/restore leaks)
- **Tier 5**: Heavy PWA & Native Capabilities (PwaManager singleton, Service Worker precache updates, beforeinstallprompt, Screen Wake Lock API, online/offline detection)
- **Tier 6**: Frontend Architecture, Deep Linking Router & Controls (Slug and hash resolution, storage settings, haptics, manifest shortcuts, HUD classes)
- **Tier 7**: Menu 2-Column Portrait, Gamepad, BGM Moods & Snapshots (Portrait cols=2 rows=8 layout, GC cache, arrow navigation, Gamepad polling, procedural mood tracks)
- **Tier 8**: Universal Avatar Selection System & Dress-Up Wardrobe (15-character roster metadata, storage synchronization, vector rendering without throwing, mini-game scene propagation, 10 vector accessories, character anchors completeness, storage equip/unequip persistence, layered rendering, and story progression accessory unlocks)
- **Tier 10**: Story Journey Narrative & Adventure Map (5 chapters, 16 stops, progress tracking, view mode switching, tap hit testing, goal verification)

### 2. Playwright Headless Browser E2E (`tests/browser_e2e.py` — 31 tests)
- **Test 1**: Mobile iPhone 14 (390×844) — Free Play default view mode, brand and controls horizontal clearance, mode toggle placement.
- **Test 2**: Mobile Touch Mini-Game Launch & Return Home — Egg Laying launch, Home button presence, and return to Menu.
- **Test 3**: Mobile Mode Switching — Switching between Free Play grid and Story Journey map.
- **Test 4**: Mobile Action Buttons & Modals — Avatar selector modal, Settings modal with Toddler Lock toggle, Adventure Passport modal, and Audio Mute button toggle.
- **Test 5**: Android Viewports — Samsung Galaxy (360×800) and Google Pixel (412×915) clearance and responsiveness.
- **Test 6**: Desktop / Tablet Landscape (1280×720) — 4-column card grid, header spacing, and full controls.
- **Test 7**: Deep Linking URL Hash Navigation — Direct scene launching via `#duck-picnic` hash route.
