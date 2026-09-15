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
  * **Yellow Ducks**: Mama Ducky (flower head tuft), Pip (nimble quacker), and Baby Squeak (bouncy peep).
* **Volume Preservation & Animations**: Physics-based squash & stretch, stochastic blinking intervals, breathing cycles, and dynamic facial expressions.

---

## 🚀 Features & Architecture

* **100% Zero-Dependency Standalone**: Pure TypeScript + React 19 + Vite. Zero external CDN dependencies; all code, vector art, and audio synthesis run 100% offline.
* **Single-Screen 4×4 Responsive Menu**: Adaptive arcade grid fitting all 16 mini-games on a single screen without requiring scrolling across desktop and mobile.
* **Standardized Centered HUD Badges**: All 16 games feature responsive centered pill badges that prevent overlap with the on-screen Home button and audio/fullscreen controls.
* **Instant Touch Home Navigation**: Touchscreen-optimized pointer handling with 250ms debouncing ensures instant and reliable return to the menu across standalone PWAs, bookmarks, and mobile browsers.
* **Heavy PWA & Automated Precache Pipeline**: Build-time injection (`scripts/generate-sw.mjs`) captures 100% of Vite hashed chunks, HTML, and assets into `dist/sw.js` Cache Storage for reliable, instant offline launch.
* **Screen Wake Lock API**: Automatically locks the screen awake during active mini-gameplay so toddler play sessions are never interrupted by display dimming or sleep.
* **Tactile In-App Install Experience**: Kid-friendly HUD install button with native `beforeinstallprompt` flow for Android/Chrome/Desktop and a step-by-step visual install guide for iOS Safari.
* **Procedural Web Audio Engine**: All 20 sound effects (including roars, sizzles, whooshes, veggie pops, bubble pops, duck quacks, and dance fanfares) and 128 BPM multi-track background music are dynamically synthesized via the Web Audio API.
* **Persistent High Scores**: High scores for all modes are stored locally via `localStorage`.

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

# Run automated tests
npm test

# Build production bundle
npm run build

# Deploy to GitHub Pages
npm run deploy
```

---

## 🧪 Testing

```bash
npm test
```

All 41 tests across 5 quality tiers pass in <0.05s:
- **Tier 1**: Smoke & Initialization (Engine, Display, Storage, Particle pool, Menu navigation)
- **Tier 2**: 16 Mini-Game Simulations & Mechanics
- **Tier 3**: Audio Synthesis (20 SFX recipes) & Character Renderers
- **Tier 4**: Quality Gates, LOC limit (<500 LOC per file), Branding, and Canvas State Balance (0 leaks)
- **Tier 5**: Heavy PWA & Native Capabilities (Service Worker precache, Wake Lock, Installability)

---

## 📄 License
MIT License
