# Project: Adventures of Trishu — 16-Game Mini-Game Suite

## Architecture
A modular, high-performance HTML5 Canvas 2D game engine built with React 19, TypeScript, and Vite.
- **Engine Core (`src/engine/`)**: 60 FPS fixed-timestep game loop, dual-orientation dynamic viewport manager (`DisplayManager.ts`), multi-touch gesture input manager (`InputManager.ts`), particle pool (`ParticleEngine.ts`), local storage persistence (`StorageManager.ts`), and procedural audio suite (`src/engine/audio/`).
- **Procedural Web Audio (`src/engine/audio/`)**: Zero-asset audio synthesis using native Web Audio API oscillators, noise buffers, biquad filters, and an algorithmic 128 BPM multi-track nursery BGM sequencer.
- **Vector Character Rendering (`src/graphics/characters/`)**: Procedural Canvas 2D vector art for all characters (Trishu, Leo with Plush Dino, Dad, Mom, Grandpa, Mimi the Bunny, Mrs Clucky, Baby Chicks, and Yellow Ducks) with shared animation controllers for blinking, squashing, wobbling, and facial expressions.
- **Mini-Game Modes (`src/games/`)**: 16 standalone mini-game scenes implementing the `BaseScene` contract (`enter`, `update`, `render`, `exit`, `getEntities`, `getModeState`).
- **UI & Heavy PWA (`src/components/`, `src/pwa/`)**: Responsive HUD with centered score pill badges, toddler multi-touch tap ripple feedback, PwaManager singleton, Screen Wake Lock API, in-app install modal with iOS guide, update toast, and build-time Service Worker precaching.

## Feature Inventory

| # | Feature | Description | Status |
|---|---------|-------------|--------|
| 1 | Master Types & Schema | `GameModeId` (16 modes), `SFXName` (20 sfx), `HighScores` (16 modes), Character anim types | DONE |
| 2 | Modular Audio Engine (<500 LOC) | `AudioContextHolder`, `SoundSynthesizer`, `BGMSequencer`, `AudioSpy`, `index.ts` | DONE |
| 3 | 20 Procedural SFX Recipes | Synthesize all 20 sound effects (roars, sizzle, whoosh, duck quack, fanfare, giggles, splashes, etc.) | DONE |
| 4 | Algorithmic BGM Sequencer | 128 BPM multi-track nursery music generator with dynamic tempo control | DONE |
| 5 | Extended Particle Engine | Support confetti, soap bubbles, pancake syrup drips, mud clods, and sparkles | DONE |
| 6 | Storage Manager 16-Mode Persistence | LocalStorage schema for all 16 high scores with fallback safety | DONE |
| 7 | Shared Character Animation Controller | `CharacterAnimState` helper for eye blinks, breathing squash, wobbles, volume preservation | DONE |
| 8 | Leo & Plush Dinosaur Model | Procedural Leo holding green dinosaur with animated chomping jaw | DONE |
| 9 | Mom Model | Procedural Mom with eyelashes, floral hairclip, coral dress, and frying pan | DONE |
| 10 | Grandpa Model | Procedural Grandpa with straw sun hat, purple shirt, garden boots, pull tension | DONE |
| 11 | Mimi the Bunny Model | Procedural Mimi with pink inner ears, floral dress, and bubble wand | DONE |
| 12 | Trishu, Mrs Clucky & Chick Models | Trishu with twin pigtails & red bows, Mrs Clucky, Baby Chicks with peep & waddle | DONE |
| 13 | Yellow Ducks Character Model | Mama Ducky (flower tuft), Pip, and Baby Squeak with waddling legs and head bobs | DONE |
| 14 | Mode 1: Happy Mrs Clucky | Classic egg laying, nest stacking, and hatching chicks | DONE |
| 15 | Mode 2: Puddle Splash Adventure | Muddy puddles jumping with Trishu, scoring multipliers, 60s timer | DONE |
| 16 | Mode 3: Fluffy Chick Trail | Top-down garden trail with Reynolds Boids flocking AI for baby chicks | DONE |
| 17 | Mode 4: Dad's Kitchen Dash | Rapid-fire frenzy test with Dad panic escalation and kitchen sizzle cutscene | DONE |
| 18 | Mode 5: Balloon Pop | Leo's balloon pop with rising balloons, confetti bursts, dino chomp | DONE |
| 19 | Mode 6: Golden Pancake Flipper | Pancake frying pan flip timing, parabolic flight, golden detection, plate stacking | DONE |
| 20 | Mode 7: Grandpa's Veggie Harvest | Garden vegetable pulling with elastic tension resistance, mud pops, wheelbarrow counter | DONE |
| 21 | Mode 8: Rainbow Bubble Hopscotch | Shimmering soap bubbles, glockenspiel pop chimes, hopscotch path to picnic blanket | DONE |
| 22 | Mode 9: Mix & Match Funny Studio | Body shuffler, customizable character chimera combinations, and photo album | DONE |
| 23 | Mode 10: Peek-a-Boo Barnyard | 4 tactile farm hiding spots with animal sounds, surprise reveals, and giggles | DONE |
| 24 | Mode 11: Miss Bunny's Ice Cream Van | Multi-flavor scoop stacking, waffle cone physics, and feast celebration | DONE |
| 25 | Mode 12: Grandpa's Little Train | Countryside rail chugging, whistle steam puffs, and carriage passenger collection | DONE |
| 26 | Mode 13: Muddy Car Wash | Tactile soap scrub, mud removal, and sparkling car polish finish | DONE |
| 27 | Mode 14: Windy Castle Kite | Parabolic swoops, continuous drag-to-fly touch tracking, star ribbons, and tail bows | DONE |
| 28 | Mode 15: Rainbow Flower Garden | Mound watering, flower blooming, and rainbow celebration with fluttery butterflies | DONE |
| 29 | Mode 16: Picnic Ducks | Feeding hungry ducks, duck separation repulsion, food reservation, and celebration dance | DONE |
| 30 | Single-Screen 4×4 Arcade Menu | All 16 games accessible without vertical scrolling in portrait and landscape grids | DONE |
| 31 | Canvas State Safety | Balanced `ctx.save()` / `ctx.restore()` across all 17 scenes preventing stack overflow | DONE |
| 32 | Centered HUD Pill Badges | Non-overlapping score badges centered cleanly away from Home and audio buttons | DONE |
| 33 | Instant Home Button Navigation | Direct state machine navigation with touch-responsive debounced pointerup | DONE |
| 34 | Heavy PWA Precache Pipeline | Build-time chunk scanning and multi-tier Service Worker caching in `dist/sw.js` | DONE |
| 35 | Native Device & Screen Wake Lock | `PwaManager` keeping display awake during toddler play sessions | DONE |
| 36 | Consolidated Test Suite | 41 automated tests verifying engine, all 16 modes, audio, and canvas safety (<0.1s) | DONE |

## Character Mapping

| Character | Role | Color Key |
|---|---|---|
| Trishu | Protagonist girl | Lavender / Coral / Red Bows |
| Leo | Little brother | Blue Overalls / Green Plush Dino |
| Dad | Father | Teal Polo / Glasses |
| Mom | Mother | Coral Dress / Floral Hairclip |
| Grandpa | Gardener | Purple Overalls / Straw Sun Hat |
| Mimi | Bunny friend | White Fur / Pink Inner Ears / Pink Dress |
| Mrs Clucky | Farm hen | Cream Body / Red Comb |
| Baby Chicks | Chicks | Fluffy Yellow |
| Mama Ducky | Duck mother | Yellow / Orange Bill / Flower Tuft |
| Pip | Duck child | Bright Yellow / Nimble Waddle |
| Baby Squeak | Baby duckling | Soft Yellow / Bouncy Hops |
