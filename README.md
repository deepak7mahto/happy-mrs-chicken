# 🌟 Adventures of Trishu — 16-Game Kids Mini-Game Suite

A joyful, interactive, zero-dependency browser mini-game suite featuring **Trishu**, her family, and their animal friends! Packed with **16 distinct playable mini-game modes** arranged in a responsive single-screen arcade grid, original procedural vector character art, procedural Web Audio sound synthesis, fluid Canvas/SVG animations, heavy PWA offline capabilities, and local high score tracking.

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
   * Shuffle and randomize character heads, torsos, and legs across all characters.
   * Big bouncy **"🎲 SHUFFLE"** button, interactive character wiggle & dance reactions, and **"📸 SNAP PHOTO"** photo booth album!

10. **Peek-a-Boo Barnyard (Sensory Toddler Mode)**
    * 4 large, tactile hiding spots: Barn Door, Garden Bush, Hay Bale, and Apple Barrel.
    * Wiggling hints (feathers, bunny ears, dino tail, red bows). Tap any spot to trigger joyful popups with Mrs. Clucky, Mimi, Leo, and Trishu with animal sounds, giggles, and celebration confetti!

11. **Miss Bunny's Ice Cream Van**
    * Scoop towering ice cream cones with strawberry, mint, mango, blueberry, and chocolate flavors!
    * Top off with a bright red cherry and tap the cone to trigger a happy munching feast!

12. **Grandpa's Little Train**
    * Drive the little red steam engine along the countryside rails with whistling steam puffs.
    * Pull up to station platforms to pick up cheering family passengers in colorful carriages!

13. **Muddy Car Wash**
    * Scrub the family car sparkling clean with bubbly soap suds!
    * Tap and drag across mud splats to scrub them away and reveal a gleaming shine with starry sparkles.

14. **Windy Castle Kite**
    * Swoop a colorful diamond kite across the windy skies with real-time touch and drag controls.
    * Collect shimmering stars, trailing rainbow bow ribbons behind the kite tail!

15. **Rainbow Flower Garden**
    * Water mounds with a shiny watering can to sprout colorful buds.
    * Watch giant smiling flowers bloom into a rainbow celebration with fluttery butterflies!

16. **Picnic Ducks**
    * Feed Mama Ducky, Pip, and Baby Squeak with tossed bread crumbs and treats from the picnic basket.
    * Features Boids separation physics to prevent duck stacking, individual hunger meters, and a synchronized celebratory duck dance with pirouettes and confetti!

---

## 🎨 Vector Graphics & Character Roster

* **Original Procedural Vector Art**: 100% procedural HTML5 Canvas 2D vector art with warm proportions, smooth Bézier curves, expressive facial features, and colorful clothing.
* **Character Roster**:
  * **Trishu**: Cheerful protagonist girl with dark twin pigtails, red bows, lavender dungarees, and sneakers.
  * **Leo**: Curious little brother in blue overalls holding a green plush dinosaur with chomping jaw.
  * **Dad**: Warm father figure in teal polo and glasses.
  * **Mom**: Caring mother in coral dress with flower hairclip and frying pan.
  * **Grandpa**: Friendly gardener with straw sun hat, garden overalls, and rubber boots.
  * **Mimi the Bunny**: Cute white bunny with pink inner ears, floral dress, and bubble wand.
  * **Mrs Clucky & Baby Chicks**: Farm hen and fluffy yellow chicks with peep & waddle animations.
  * **The Picnic Ducks**: Mama Ducky (flower tuft), Pip (nimble scrambler), and Baby Squeak (peep hops).
* **Volume Preservation & Animations**: Physics-based squash & stretch, stochastic blinking intervals, breathing cycles, and dynamic facial expressions.

---

## 🚀 Features & Architecture

* **Single-Screen 4×4 Responsive Grid**: All 16 games fit neatly onto a single screen in both portrait (4×4 tiles) and landscape (4×4 / 8×2 cards) orientations without mandatory vertical scrolling.
* **100% Zero-Dependency Standalone**: Pure TypeScript + React 19 + Vite. Zero external CDN dependencies; all code, vector art, and audio synthesis run 100% offline.
* **Canvas State Safety**: Rigorous canvas context stack balancing ensures zero `ctx.save()` / `ctx.restore()` state leaks across all 17 scenes.
* **Tactile Centered HUD**: Non-overlapping pill score badges centered cleanly away from the Home and audio/fullscreen controls.
* **Rock-Solid Navigation**: Instant Home navigation directly via the engine state machine with immediate pointer-up response on touchscreens.
* **Heavy PWA & Automated Precache Pipeline**: Build-time injection (`scripts/generate-sw.mjs`) captures 100% of Vite hashed chunks, HTML, and assets into `dist/sw.js` Cache Storage for reliable, instant offline launch.
* **Screen Wake Lock API**: Automatically locks the screen awake during active mini-gameplay so toddler play sessions are never interrupted by display dimming or sleep.
* **Tactile In-App Install Experience**: Kid-friendly HUD install button with native `beforeinstallprompt` flow for Android/Chrome/Desktop and a step-by-step visual install guide for iOS Safari.
* **Procedural Web Audio Engine**: All 20 procedural sound effects and 128 BPM multi-track background music are dynamically synthesized via the Web Audio API.
* **Responsive Dual-Orientation Viewport**: Full support for desktop and mobile/tablets with responsive Portrait (9:16) and Landscape (16:9) scaling.
* **Persistent High Scores**: High scores for all modes are stored locally via `localStorage`.

---

## 📦 Local Installation & Development

```bash
# Clone the repository
git clone https://github.com/deepak7mahto.github.io/happy-mrs-chicken.git happy-mrs-chicken
cd happy-mrs-chicken

# Install dependencies
npm install

# Start local development server
npm run dev

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

41 unit, integration, and E2E simulation tests execute in < 0.1s.

---

## 📄 License
MIT License
