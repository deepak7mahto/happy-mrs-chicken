# Original User Request (Historical Archive)

> **Note**: This project has been rebranded to **Adventures of Trishu** — an original intellectual property with custom character designs and mini-game themes.

## Initial Request — 2026-08-16T12:10:53+05:30

Build a comprehensive, self-contained browser-playable recreation of the *Peppa Pig: Happy Mrs Chicken* game in HTML5, CSS, Canvas, and JavaScript with complete mini-game modes, procedural Web Audio sound effects, fluid animations, and high score tracking.

Working directory: ~/teamwork_projects/happy_mrs_chicken
Integrity mode: development

## Requirements

### R1. Game Suite & Modes
Provide an arcade-style game selection menu leading to 4 distinct playable modes:
1. **Happy Mrs Chicken (Classic Egg-Laying Mode):** Player taps screen or presses Spacebar to make Mrs Chicken lay eggs. Eggs bounce, stack dynamically, and upon reaching the nest threshold, crack and hatch into animated baby chicks that chirp and scamper off-screen.
2. **Muddy Puddles Mode:** Players control characters jumping into randomly appearing muddy puddles to splash mud and earn points against a countdown timer.
3. **Chick Maze / Sorting Mode:** Guide lost wandering chicks safely back to the coop using seed trails or steering controls while navigating simple garden obstacles.
4. **Daddy Pig High Score Challenge:** An endless, accelerating reaction mode with rapid-fire egg laying, multiplier combos, and humorous "Computer Overheat / Daddy Pig Crash" visual cutscenes when beating high scores.

### R2. Self-Contained Architecture & Zero-Dependency Delivery
- Deliver the entire game as a standalone `index.html` file with embedded CSS, Canvas/SVG rendering, and procedural Web Audio API synthesis for all sound effects (clucks, egg pops, hatching squeaks, puddle splashes, fanfare, and cheerful background music).
- Must run immediately in modern web browsers (Chrome, Safari, Firefox, Edge) without requiring any build step, npm install, or external CDN network requests.

### R3. Responsive Controls & Visual Polish
- Support both desktop (mouse clicks, spacebar, keyboard arrows) and mobile/touch (tap, multi-touch, swipe).
- Smooth 60 FPS animation loop with particle effects (splashes, feathers, eggshells, sparkles), cheerful cartoon farm visuals, animated scoreboards, local storage high scores, and audio mute/unmute toggle.

## Acceptance Criteria

### Playability & Mini-Game Modes
- [ ] All 4 mini-game modes are accessible from the main menu and can be completed/played repeatedly without JavaScript errors or softlocks.
- [ ] Egg Laying mode correctly registers inputs, creates egg physics objects, triggers cracking/hatching sequences, and spawns wandering chicks.
- [ ] Muddy Puddles mode features dynamic puddle spawning, collision/jump detection, splash particle animations, and a countdown timer.
- [ ] Chick Sorting/Maze mode contains functional pathfinding/navigation mechanics and win conditions when chicks reach the coop.
- [ ] Daddy Pig Challenge mode increments score, tracks local storage high scores, and displays game-over / high-score celebrations.

### Technical & Quality Guardrails
- [ ] Standalone file opens and runs completely offline in a standard browser with zero console errors.
- [ ] Web Audio API successfully synthesizes distinct sound effects for egg drop, hatch, splash, button clicks, and background music without audio clipping or delay.
- [ ] Visual UI adapts responsively to desktop and mobile viewport sizes.

## Follow-up — 2026-08-17T17:47:53+05:30

Expand the *Peppa Pig: Happy Mrs Chicken* browser game suite from 4 to 8 distinct toddler-friendly mini-games, featuring a complete roster of upgraded procedural vector characters (George Pig with Mr. Dinosaur, Mummy Pig, Grandpa Pig, Suzy Sheep) with lively facial animations, procedural Web Audio, and responsive dual-orientation mobile layouts.

Working directory: `~/teamwork_projects/happy_mrs_chicken`
Integrity mode: `development`

## Requirements

### R1. Mini-Game Suite Expansion (Total 8 Playable Modes)
Expand the main arcade menu with pagination/grid navigation to support 8 distinct playable mini-games:
1. **Happy Mrs Chicken (Classic Egg-Laying)**: Existing mode with egg physics, hatching chicks, and nest stacking.
2. **Muddy Puddles**: Existing jumping & splash combo mode with Peppa.
3. **Chick Maze / Sorting**: Existing flocking AI & seed trail guidance mode.
4. **Daddy Pig High Score Challenge**: Existing rapid-fire reaction & computer crash cutscene mode.
5. **George's Dinosaur Balloon Pop**: Floating colorful dinosaur-shaped balloons that toddlers tap to pop with confetti particles, dinosaur roars, and George's joyful giggles.
6. **Mummy Pig's Pancake Flipper**: Tap or swipe to flip pancakes in a frying pan, stacking them onto a towering plate with buttery syrup effects.
7. **Grandpa Pig's Vegetable Harvest**: Tap and pull giant cartoon carrots, cabbages, and pumpkins out of the garden soil with mud splashes and wheelbarrow collection.
8. **Suzy Sheep's Hopscotch & Bubble Trail**: Blow and pop shimmering soap bubbles along a garden hopscotch trail to guide Suzy Sheep and Peppa to a picnic basket.

### R2. Upgraded & Expanded Procedural Vector Character Models
Provide procedural 2D Canvas vector character renderers with authentic cartoon colors and animations:
- **George Pig**: Blue shirt, snout, smiling/crying states, and green **Mr. Dinosaur** toy held in hand with animated chomping jaw.
- **Mummy Pig**: Orange dress, eyelashes, mascara, authentic snout, and gentle blinking animations.
- **Grandpa Pig**: Purple shirt, sailing cap, beard stubble, and garden boots.
- **Suzy Sheep**: Pink dress, fluffy wool ears, snout, and hopscotch jumping animations.
- **Enhanced Facial & Idle Animations**: Eye blinking intervals, smiling cheeks, squawking open beaks, panic sweat drops, and natural breathing/wobble idle loops across all characters and menu previews.

### R3. Procedural Web Audio Synthesis & Toddler Soundboard
Expand the zero-dependency Web Audio synthesizer with new procedural SFX and musical motifs:
- Dinosaur roar oscillator sweeps (`"Grrr... Dinosaur!"`)
- Pancake sizzle and airy whoosh flip sounds
- Vegetable earth pop and mud thud sounds
- Shimmering soap bubble pop chimes
- Happy toddler giggles and cheerful musical melodies

### R4. Architectural Modularity, Full TypeScript, & PWA Offline Integrity
- **Full TypeScript**: Strict type definitions for all new game modes, character states, and particle systems.
- **Hard File Length Limit**: Every single file must stay strictly under **500 lines** of code.
- **Responsive Dual Orientation**: Full viewport fill in both Portrait (9:16) and Landscape (16:9) modes without letterbox distortion.
- **PWA & Offline Execution**: Zero external asset/CDN dependencies, running 100% offline with Service Worker caching.
- **Toddler-Friendly UX**: Forgiving full-screen tap mechanics, large colorful home/audio buttons, and haptic feedback.

## Acceptance Criteria

### Playability & Mini-Game Modes
- [ ] All 8 mini-games are accessible from the main menu, can be played repeatedly without errors or memory leaks, and persist high scores to localStorage.
- [ ] George's Balloon Pop spawns rising balloons with pop physics and dinosaur sound effects.
- [ ] Mummy Pig's Pancake Flipper implements realistic flip trajectories and pancake stacking.
- [ ] Grandpa Pig's Harvest features progressive pull resistance and vegetable collection into the wheelbarrow.
- [ ] Suzy Sheep's Bubble mode allows interactive bubble popping and character path progression.

### Character Art & Visual Polish
- [ ] All 7 character models (Mrs. Chicken, Peppa, George + Mr. Dinosaur, Daddy Pig, Mummy Pig, Grandpa Pig, Suzy Sheep) render crisp and authentic at any DPI scale.
- [ ] Characters exhibit natural eye blinks, squash-and-stretch on jump/land, and idle breathing animations.

### Technical & Quality Guardrails
- [ ] TypeScript check (`npx tsc --noEmit`) passes with 0 errors.
- [ ] Production build (`npm run build`) generates clean chunked bundles in `dist/`.
- [ ] Every source file in `src/` is strictly under 500 lines.
- [ ] Automated test suite verifies all 8 modes, orientation resizing, audio triggers, and 100% offline execution.
