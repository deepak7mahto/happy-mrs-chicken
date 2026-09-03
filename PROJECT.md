# Project: Adventures of Trishu — 8-Game Mini-Game Suite

## Architecture
A modular, high-performance HTML5 Canvas 2D game engine built with React 19, TypeScript, and Vite.
- **Engine Core (`src/engine/`)**: 60 FPS fixed-timestep game loop, dual-orientation dynamic viewport manager (`DisplayManager.ts`), multi-touch gesture input manager (`InputManager.ts`), particle pool (`ParticleEngine.ts`), local storage persistence (`StorageManager.ts`), and procedural audio suite (`src/engine/audio/`).
- **Procedural Web Audio (`src/engine/audio/`)**: Zero-asset audio synthesis using native Web Audio API oscillators, noise buffers, biquad filters, and an algorithmic 128 BPM multi-track nursery BGM sequencer.
- **Vector Character Rendering (`src/graphics/characters/`)**: Procedural Canvas 2D vector art for all 8 characters (Trishu, Leo with Plush Dino, Dad, Mom, Grandpa, Mimi the Bunny, Mrs Clucky, and Baby Chicks) with shared animation controllers for blinking, squashing, wobbling, and facial expressions.
- **Mini-Game Modes (`src/modes/`)**: 8 standalone mini-game scenes implementing the `BaseScene` / `MiniGame` contract (`init`, `enter`, `update`, `render`, `handleInput`, `resize`, `exit`, `destroy`, `getEntities`, `getModeState`).
- **UI & PWA (`src/components/`, `src/pwa/`)**: Responsive HUD, toddler multi-touch tap ripple feedback, and Service Worker offline caching.

## Feature Inventory

| # | Feature | Description | Status |
|---|---------|-------------|--------|
| 1 | Master Types & Schema | `GameModeId` (8 modes), `SFXName` (18 sfx), `HighScores` (8 modes), Character anim types | DONE |
| 2 | Modular Audio Engine (<500 LOC) | `AudioContextHolder`, `SoundSynthesizer`, `BGMSequencer`, `AudioSpy`, `index.ts` | DONE |
| 3 | 18 Procedural SFX Recipes | Synthesize all 18 sound effects (roars, sizzle, whoosh, veggie pop, bubble pop, clucks, splashes, fanfare, squeak) | DONE |
| 4 | Algorithmic BGM Sequencer | 128 BPM multi-track nursery music generator with dynamic tempo control | DONE |
| 5 | Extended Particle Engine | Support confetti, soap bubbles, pancake syrup drips, mud clods, and sparkles | DONE |
| 6 | Storage Manager 8-Mode Persistence | LocalStorage schema for all 8 high scores with fallback safety | DONE |
| 7 | Shared Character Animation Controller | `CharacterAnimState` helper for eye blinks, breathing squash, wobbles, volume preservation | DONE |
| 8 | Leo & Plush Dinosaur Model | Procedural Leo holding green dinosaur with animated chomping jaw | DONE |
| 9 | Mom Model | Procedural Mom with eyelashes, floral hairclip, coral dress, and frying pan | DONE |
| 10 | Grandpa Model | Procedural Grandpa with straw sun hat, purple shirt, garden boots, pull tension | DONE |
| 11 | Mimi the Bunny Model | Procedural Mimi with pink inner ears, floral dress, and bubble wand | DONE |
| 12 | Trishu, Mrs Clucky & Chick Models | Trishu with twin pigtails & red bows, Mrs Clucky, Baby Chicks with peep & waddle | DONE |
| 13 | Mode 1: Happy Mrs Clucky | Classic egg laying, nest stacking, and hatching chicks | DONE |
| 14 | Mode 2: Puddle Splash Adventure | Muddy puddles jumping with Trishu, scoring multipliers, 60s timer | DONE |
| 15 | Mode 3: Fluffy Chick Trail | Top-down garden trail with Reynolds Boids flocking AI for baby chicks | DONE |
| 16 | Mode 4: Dad's Kitchen Dash | Rapid-fire frenzy test with Dad panic escalation and kitchen sizzle cutscene | DONE |
| 17 | Mode 5: Balloon Pop | Leo's balloon pop with rising balloons, confetti bursts, dino chomp | DONE |
| 18 | Mode 6: Golden Pancake Flipper | Pancake frying pan flip timing, parabolic flight, golden detection, plate stacking | DONE |
| 19 | Mode 7: Grandpa's Veggie Harvest | Garden vegetable pulling with elastic tension resistance, mud pops, wheelbarrow counter | DONE |
| 20 | Mode 8: Rainbow Bubble Hopscotch | Shimmering soap bubbles, glockenspiel pop chimes, hopscotch path to picnic blanket | DONE |
| 21 | Mode 9: Mix & Match Funny Studio | Body shuffler, customizable character chimera combinations, and photo album | DONE |
| 22 | Mode 10: Peek-a-Boo Barnyard | 4 tactile farm hiding spots with animal sounds, surprise reveals, and giggles | DONE |
| 23 | 10-Game Arcade Menu Scene | Responsive symmetric grid menu with live preview animations and high score badges | DONE |
| 22 | Dual-Orientation Viewport & HUD | Responsive fill for Portrait 9:16 and Landscape 16:9 with zero letterbox distortion | DONE |
| 23 | PWA Offline Integrity & Service Worker | Service Worker caching in `public/sw.js`, zero external CDN dependencies | DONE |
| 24 | Lean Test Suite | Ultra-fast consolidated test suite (<1s execution) | DONE |

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
