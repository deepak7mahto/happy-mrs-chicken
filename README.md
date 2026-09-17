# 🌟 Adventures of Trishu — 16-Game Kids Mini-Game Suite

A joyful, interactive, zero-dependency browser mini-game suite featuring **Trishu**, her family, and friends! Packed with **16 distinct playable mini-game modes**, original procedural vector character art, procedural Web Audio sound synthesis, fluid Canvas animations, responsive dual-orientation viewport, and offline Heavy PWA support.

🎮 **Play Online**: [https://deepak7mahto.github.io/happy-mrs-chicken/](https://deepak7mahto.github.io/happy-mrs-chicken/)

---

## 🕹️ 16 Playable Mini-Game Modes

1. **Happy Mrs Clucky (Classic Egg-Laying Mode)**
   * Tap screen or press **Spacebar** to make Mrs. Clucky lay eggs with squash-and-stretch animation.
   * Eggs bounce with restitution physics and stack in the nest.
   * Reaching capacity triggers multi-stage egg-cracking and spawns chirping baby chicks that scamper off-screen.

2. **Puddle Splash Adventure**
   * Jump into randomly spawning puddles (Small, Medium, Mega, and Golden bonus puddles) with Trishu's vector avatar.
   * Center-accuracy splash scoring multipliers (*"Perfect Splash!"*), mud particle bursts, and a 60s countdown timer.

3. **Fluffy Chick Trail**
   * Top-down garden trail featuring Reynolds Boids flocking AI for wandering baby chicks.
   * Place corn seed trails and use whistle alerts to lure chicks safely back to the coop.

4. **Dad's Kitchen Dash**
   * Rapid-fire reaction mode with combo fever meters and multiplier bonuses.
   * 4-stage escalating panic animations leading up to the funny *"Kitchen Sizzle Crash"* cutscene!

5. **Trishu & Leo's Balloon Pop**
   * Float through colorful balloons with sinusoidal wobble physics.
   * Tap to pop balloons, trigger confetti explosions, and hear playful sound effects with Leo and his green plush dinosaur!

6. **Golden Pancake Flipper**
   * Master pan flipping rhythm, airborne parabolic trajectory, and cook detection (*Raw, Golden, Overcooked*).
   * Stack delicious golden pancakes on the plate with butter and maple syrup particle drips.

7. **Grandpa's Veggie Harvest**
   * Pull carrots, cabbages, and giant boss pumpkins from garden soil mounds with elastic spring tension.
   * Collect bountiful harvests into Grandpa's wheelbarrow with rich mud bursting effects.

8. **Rainbow Bubble Hopscotch**
   * Tap shimmering soap bubbles with glockenspiel chimes to guide Mimi the Bunny along the 10-step hopscotch path.
   * Reach the picnic blanket with Trishu for victory fanfare and celebration!

9. **Trishu's Mix & Match Funny Studio**
   * Shuffle and randomize character heads, torsos, and legs across all 7 characters.
   * Big bouncy **"🎲 SHUFFLE"** button, interactive character wiggle & dance reactions, and **"📸 SNAP PHOTO"** photo booth album!

10. **Peek-a-Boo Barnyard (Sensory Toddler Mode)**
    * 4 large, tactile hiding spots: Barn Door, Garden Bush, Hay Bale, and Apple Barrel.
    * Wiggling hints (feathers, bunny ears, dino tail, red bows). Tap any spot to trigger joyful popups with Mrs. Clucky, Mimi, Leo, and Trishu with animal sounds, giggles, and celebration confetti!

11. **Miss Bunny's Ice Cream Van**
    * Stack delicious scoops of ice cream (strawberry, mint chocolate, blueberry, mango, cherry) into towering waffle cones with Miss Bunny.
    * Feast on your giant ice cream creations with satisfying munching sound effects!

12. **Grandpa's Little Train**
    * Drive Grandpa's cheerful steam locomotive along rolling hills.
    * Pull into stations, toot the loud train whistle with steam puffs, and pick up happy animal and family passengers!

13. **Muddy Car Wash**
    * Scrub away mud splats on the family car using sudsy soap bubbles and a tactile sponge.
    * Reveal a sparkling, squeaky-clean car finish with gleaming star sparkles!

14. **Windy Castle Kite**
    * Fly a vibrant diamond kite across windy skies with dynamic wind swaying and fluttering tail bows.
    * Real-time finger/mouse drag tracking to swoop and collect floating rainbow stars.

15. **Rainbow Flower Garden**
    * Water thirsty garden mounds with Grandpa's watering can.
    * Watch seeds sprout and bloom into giant smiling rainbow flowers with fluttery butterflies.

16. **Picnic Ducks (Feed the Ducks & Celebration Dance)**
    * Inspired by classic countryside picnics with Mama Ducky, Pip, and Baby Squeak.
    * Toss bread crumbs on the grass or tap the picnic basket to fling golden crusts, strawberries, and cake slices!
    * Ducks feature anti-stacking Boids separation, distinct wandering sectors, belly wiggles, cute quacks, and a synchronized 360° pirouette celebration dance when full.

---

## 🎨 Vector Graphics & Character Roster

* **100% Procedural Vector Art**: Pure HTML5 Canvas 2D vector art with warm proportions, smooth Bézier curves, expressive facial features, and colorful clothing.
* **Character Roster**:
  * **Trishu**: Cheerful protagonist girl with dark twin pigtails, red bows, lavender dungarees, and sneakers.
  * **Leo**: Curious little brother in blue overalls holding a green plush dinosaur with chomping jaw.
  * **Dad**: Warm father figure in teal polo and glasses.
  * **Mom**: Caring mother in coral dress with flower hairclip and frying pan.
  * **Grandpa**: Friendly gardener with straw sun hat, garden overalls, and rubber boots.
  * **Mimi the Bunny**: Cute white bunny with pink inner ears, floral dress, and bubble wand.
  * **Mrs Clucky & Baby Chicks**: Proud farm hen and fluffy yellow chicks that peep and waddle.
  * **Peppa Pig & Friends**: Peppa Pig, George Pig (with toy dino), Daddy Pig, Mummy Pig, Grandpa Pig (naval sailor cap & wellies), and Suzy Sheep (nurse outfit).
  * **Yellow Ducks**: Mama Ducky (flower head tuft), Pip (nimble quacker), and Baby Squeak (bouncy peep).
* **Volume Preservation & Animations**: Physics-based squash & stretch, stochastic blinking intervals, breathing cycles, and dynamic facial expressions.

---

## 🚀 Features & Architecture

* **⚡ Pure Vanilla TypeScript Architecture**: Zero React virtual DOM overhead. Built with high-performance modular TypeScript, PixiJS v8 ready graphics, and pure DOM HUD/modals (`src/ui/`).
* **🎨 Modern Playful Typography (Fredoka)**: Clean, friendly rounded typography using local `@fontsource/fredoka` (weights 400, 500, 600, 700). 100% offline with zero external Google Fonts or CDN network requests.
* **🧸 3D Tactile "Toy Button" Cards**: Landing page cards feature a 3D extruded bottom bevel (+5px), subtle vertical surface gradient, top specular gloss sheen, and warm golden star achievement badges (`★ Best Score`).
* **✨ Character Pedestal Spotlights**: Every character preview on the landing page is scaled up for mobile and framed within a soft, luminous circular spotlight disc.
* **🔇 Background Audio Suspension Lifecycle**: Integrated Web Audio hardware lifecycle management (`AudioContext.suspend()` and `resume()`) wired to `visibilitychange` and `pagehide` to ensure zero sound leakage when switching apps or locking the phone.
* **👒 Dress-Up Wardrobe & Vector Accessories**: Multi-slot styling across `head`, `face`, `back`, and `feet` (Party Cone, Flower Wreath, Sparkle Glasses, Chef Toque, Pirate Bicorne, Sun Hat, Royal Crown, Bubble Goggles, Hero Cape, Golden Wellies) with normalized anchor maps for all 15 characters.
* **👀 Interactive Mannequin & Reactive Gaze**: Real-time touch/pointer eye-tracking where characters look at the child's touch, hop with delight, giggle with their signature voice, and celebrate new outfits.
* **🏆 Story Mode Wardrobe Progression**: Beating story milestones automatically unlocks special accessories (Golden Wellies at Puddle Splash, Chef Toque at Pancake Flip, Bubble Goggles at Car Wash, Hero Cape at Windy Castle, Royal Crown at Grand Finale).
* **✨ Particle Auras & Magic Effects**: Procedural ambient particle auras (`rainbow`, `stars`, `sparkle`, `hearts`, `bubbles`) framing the avatar during preview and victory celebrations.
* **🗺️ Continuous Story Journey Mode**: The 16 mini-games are woven together into a continuous 5-chapter narrative adventure from morning to sunset. Features an interactive procedural winding canvas map, milestone nodes, active avatar position beacons, and bite-sized toddler goals.
* **📖 16-Stamp Adventure Passport Album**: Complete each story stop to earn a collectible gold stamp and star ratings. Collecting all 16 stamps awards the Grand Master Explorer Trophy (🏆).
* **🐷 Universal 15-Character Avatar Selector**: Choose from 15 vector-rendered characters (Peppa Pig & friends, Trishu family, and farmyard animals) that seamlessly propagate across all 16 mini-games.
* **🎵 4 Procedural BGM Mood Tracks & Dynamic Ducking**: Includes Classic (128 BPM), Frenzy (144 BPM), Waltz (108 BPM), and Gentle (92 BPM) procedural tracks with dynamic volume ducking on celebratory fanfares.
* **🎛️ Dual-Mode Menu Switcher**: Effortlessly switch between `[ 🎮 Free Play ]` (default responsive 2-column portrait / 4-column landscape card grid) and `[ 🗺️ Story Journey ]`.
* **100% Zero-Dependency Standalone**: Pure TypeScript + Vite. Zero external CDN dependencies; all code, vector art, fonts, and audio synthesis run 100% offline.
* **Heavy PWA & Automated Precache Pipeline**: Build-time injection (`scripts/generate-sw.mjs`) captures 100% of Vite hashed chunks, HTML, font files, and assets into `dist/sw.js` Cache Storage for reliable, instant offline launch.
* **Screen Wake Lock API**: Automatically locks the screen awake during active mini-gameplay so toddler play sessions are never interrupted by display dimming or sleep.
* **Tactile In-App Install Experience**: Kid-friendly HUD install button with native `beforeinstallprompt` flow for Android/Chrome/Desktop and a step-by-step visual install guide for iOS Safari.
* **Persistent State & Safe Toddler Lock**: Story progress, passport stamps, selected avatar, and audio settings are safely persisted in `localStorage`. Includes a 3-second hold toddler lock for the Home button.

---

## 📦 Local Installation & Development

```bash
# Clone the repository
git clone https://github.com/deepak7mahto/happy-mrs-chicken.git
cd happy-mrs-chicken

# Install dependencies
npm install

# Start local development server
npm run dev

# Run automated tests (76 tests in <0.05s)
npm test

# Run Playwright mobile & desktop browser E2E tests (31 tests)
python3 tests/browser_e2e.py

# Run full project audit checklist
python3 .agents/scripts/checklist.py .

# Build production bundle
npm run build

# Deploy to GitHub Pages
npm run deploy
```

---

## 🧪 Testing & Quality Gates

The codebase is protected by **107 automated tests**:

### 1. Automated Test Runner (`npm test` — 76 tests in <0.05s)
- **Tier 1**: Smoke & Initialization (Engine, Display, Storage, Particle pool, Menu navigation)
- **Tier 2**: 16 Mini-Game Simulations & Mechanics
- **Tier 3**: Audio Engine (20 SFX recipes, BGM sequencer, background suspension/resumption) & Character Renderers
- **Tier 4**: Quality Gates (<500 LOC/file, zero external CDN dependencies, branding verification, and 0 canvas state leaks)
- **Tier 5**: Heavy PWA & Native Capabilities (Service Worker precache, Wake Lock, Installability)
- **Tier 6**: Frontend Architecture, Deep Linking Router & Controls
- **Tier 7**: Menu 2-Column Portrait, Gamepad API, BGM Moods & Snapshots
- **Tier 8**: Universal 15-Character Avatar Selector & Dress-Up Wardrobe System
- **Tier 10**: Story Journey Narrative & Adventure Map Engine

### 2. Playwright Headless Browser E2E (`tests/browser_e2e.py` — 31 tests)
- **Mobile iPhone 14 (390×844)**: Default Free Play view, clearance check, modal dialogs, and audio mute toggle.
- **Android Samsung Galaxy (360×800)**: Narrow viewport horizontal clearance and touch targets.
- **Google Pixel (412×915)**: Dynamic display scaling and modal responsiveness.
- **Desktop Landscape (1280×720)**: 4-column card grid, header spacing, and deep linking URL hashes.

---

## 📄 License
MIT License
