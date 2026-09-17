# Project: Adventures of Trishu — 16-Game Mini-Game Suite

## Architecture
A modular, high-performance HTML5 Canvas 2D game engine built with Pure Vanilla TypeScript, PixiJS v8 readiness, and Vite (Zero React footprint).
- **Engine Core (`src/engine/`)**: 60 FPS fixed-timestep game loop (`GameEngine.ts`), dual-orientation dynamic viewport manager (`DisplayManager.ts`), multi-touch gesture input manager (`InputManager.ts`), URL hash router (`Router.ts`), particle pool (`ParticleEngine.ts`), local storage persistence (`StorageManager.ts`), and procedural audio suite (`src/engine/audio/`).
- **Procedural Web Audio (`src/engine/audio/`)**: Zero-asset audio synthesis using native Web Audio API oscillators, noise buffers, biquad filters, dynamic volume ducking, background hardware suspension/resumption (`visibilitychange` / `pagehide`), and an algorithmic 128 BPM multi-track nursery BGM sequencer with 20 procedural SFX recipes.
- **Vector Character Rendering (`src/graphics/characters/`)**: Procedural Canvas 2D vector art for 15 characters (Trishu family, Mimi the Bunny, Mrs Clucky, Baby Chicks, Yellow Ducks, and Peppa Pig & Friends roster) with shared animation controllers for blinking, squashing, wobbling, and facial expressions.
- **Mini-Game Modes (`src/games/`)**: 16 standalone mini-game scenes implementing the `BaseScene` contract (`enter`, `exit`, `update`, `render`, `getEntities`, `getModeState`).
- **Tactile UI & Heavy PWA (`src/ui/`, `src/pwa/`)**: Pure TypeScript DOM UI layer (`HUD.ts`, `SettingsModal.ts`, `AvatarSelectModal.ts`, `PassportModal.ts`, `StoryIntroModal.ts`, `StoryVictoryModal.ts`, `PwaModal.ts`), 3D tactile cards with bottom bevels and character spotlights, PwaManager singleton, Screen Wake Lock API, and build-time Service Worker precaching (`dist/sw.js`).

## Feature Inventory

| # | Feature | Description | Status |
|---|---------|-------------|--------|
| 1 | Master Types & Schema | `GameModeId` (16 modes), `SFXName` (20 sfx), `HighScores` (16 modes), Character anim types | DONE |
| 2 | Modular Audio Engine (<500 LOC) | `AudioContextHolder`, `SoundSynthesizer`, `BGMSequencer`, `AudioSpy`, `index.ts` | DONE |
| 3 | 20 Procedural SFX Recipes | Synthesize all 20 sound effects (roars, sizzle, whoosh, veggie pop, bubble pop, clucks, splashes, fanfare, squeak, duckQuack, duckFanfare) | DONE |
| 4 | Algorithmic BGM Sequencer | 128 BPM multi-track nursery music generator with dynamic tempo control | DONE |
| 5 | Extended Particle Engine | Support confetti, soap bubbles, pancake syrup drips, mud clods, score popups, and sparkles | DONE |
| 6 | Storage Manager 16-Mode Persistence | LocalStorage schema for all 16 high scores with fallback safety | DONE |
| 7 | Shared Character Animation Controller | `CharacterAnimState` helper for eye blinks, breathing squash, wobbles, volume preservation | DONE |
| 8 | Leo & Plush Dinosaur Model | Procedural Leo holding green dinosaur with animated chomping jaw | DONE |
| 9 | Mom Model | Procedural Mom with eyelashes, floral hairclip, coral dress, and frying pan | DONE |
| 10 | Grandpa Model | Procedural Grandpa with straw sun hat, purple shirt, garden boots, pull tension | DONE |
| 11 | Mimi the Bunny Model | Procedural Mimi with pink inner ears, floral dress, and bubble wand | DONE |
| 12 | Trishu, Mrs Clucky & Chick Models | Trishu with twin pigtails & red bows, Mrs Clucky, Baby Chicks with peep & waddle | DONE |
| 13 | Yellow Duck Models | Mama Ducky (flower head tuft), Pip, and Baby Squeak with quacks & waddles | DONE |
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
| 24 | Mode 11: Miss Bunny's Ice Cream Van | Scoop stacking, flavor cycling, and feast cutscene | DONE |
| 25 | Mode 12: Grandpa's Little Train | Steam engine, whistle steam puffs, and passenger pickups | DONE |
| 26 | Mode 13: Muddy Car Wash | Mud splats scrubbing, soap foam bubbles, and sparkling car finish | DONE |
| 27 | Mode 14: Windy Castle Kite | Touch-drag kite flight, wind sway, tail ribbons, and star collection | DONE |
| 28 | Mode 15: Rainbow Flower Garden | Water mound sprouts, rainbow sky celebration, and blooming flowers | DONE |
| 29 | Mode 16: Picnic Ducks | Feed the ducks with bread & basket treats, Boids separation, and grand celebration dance | DONE |
| 30 | Responsive Dual-Orientation Menu | Free Play responsive 2-column portrait / 4-column landscape 3D card grid | DONE |
| 31 | Tactile 3D "Toy Button" Cards | 3D bottom bevel (+5px), surface gradient, top gloss sheen, golden score pills | DONE |
| 32 | Character Spotlight Pedestals | Scaled up character previews framed by soft glowing white circular pedestal discs | DONE |
| 33 | Continuous Story Journey Mode | 5 chapters, 16 stops, milestone nodes, avatar position beacons, and toddler goals | DONE |
| 34 | Universal 15-Character Avatar Selector | Full roster with Peppa Pig & Friends, Trishu family, and farmyard animals | DONE |
| 35 | 16-Stamp Adventure Passport | Collectible passport album with gold stamps, star ratings, and trophy unlock | DONE |
| 36 | Mobile Web Audio Suspension | Automatic `suspend()`/`resume()` on `visibilitychange` & `pagehide` preventing audio leak | DONE |
| 37 | Modern Playful Typography (Fredoka) | Local `@fontsource/fredoka` with zero external CDN requests & scaled mobile font sizes | DONE |
| 38 | Instant Touch Home Navigation | Debounced pointer/touch handling with 3-second hold safe Toddler Lock | DONE |
| 39 | Canvas State Stack Integrity | 0 `ctx.save()` / `ctx.restore()` state leaks verified across all 17 scenes | DONE |
| 40 | Heavy PWA Precache Pipeline | Build-time chunk scanning and multi-tier Service Worker caching in `dist/sw.js` | DONE |
| 41 | Native Device & Screen Wake Lock | `PwaManager` keeping display awake during toddler play sessions | DONE |
| 42 | Tactile In-App Install & iOS Guide | Kid-friendly install prompt, native prompt trigger, and Safari 3-step guide | DONE |
| 43 | Dress-Up Wardrobe & Procedural Accessories | 10 vector accessories across head, face, back, and feet slots with normalized character anchors | DONE |
| 44 | Interactive Mannequin & Reactive Gaze | Live animated mannequin with touch/pointer eye tracking, hop celebrations, and outfit clear | DONE |
| 45 | Story Progression Accessory Unlocks | Automatic wardrobe unlocks on Story Stop victories (Wellies, Chef Hat, Goggles, Cape, Crown) | DONE |
| 46 | Particle Auras & Signature Audio | Rainbow, stars, sparkle, hearts, and bubbles particle aura renderer + character voice reactions | DONE |
| 47 | 107 Automated Tests Suite | 76 unit/integration tests (<0.05s) across 9 tiers + 31 Playwright browser E2E tests | DONE |

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
| Yellow Ducks | Mama, Pip, Baby Squeak | Bright Yellow / Orange Bill |

