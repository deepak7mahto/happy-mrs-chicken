# 🌟 Adventures of Trishu — 8-Game Kids Mini-Game Suite

A joyful, interactive, zero-dependency browser mini-game suite featuring **Trishu** and her family and friends! Packed with 8 distinct playable mini-game modes, original procedural vector character art, procedural Web Audio sound synthesis, fluid Canvas/SVG animations, and local high score tracking.

🎮 **Play Online**: [https://deepak7mahto.github.io/happy-mrs-chicken/](https://deepak7mahto.github.io/happy-mrs-chicken/)

---

## 🕹️ 8 Playable Mini-Game Modes

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
  * **Mrs Clucky**: The proud farm hen.
  * **Baby Chicks**: Fluffy yellow chicks that peep and waddle.
* **Volume Preservation & Animations**: Physics-based squash & stretch, stochastic blinking intervals, breathing cycles, and dynamic facial expressions.

---

## 🚀 Features & Architecture

* **100% Zero-Dependency Standalone**: Pure TypeScript + React 19 + Vite. Zero external CDN dependencies; all code, vector art, and audio synthesis run 100% offline.
* **Heavy PWA & Automated Precache Pipeline**: Build-time injection (`scripts/generate-sw.mjs`) captures 100% of Vite hashed chunks, HTML, and assets into `dist/sw.js` Cache Storage for reliable, instant offline launch.
* **Screen Wake Lock API**: Automatically locks the screen awake during active mini-gameplay so toddler play sessions are never interrupted by display dimming or sleep.
* **Tactile In-App Install Experience**: Kid-friendly HUD install button with native `beforeinstallprompt` flow for Android/Chrome/Desktop and a step-by-step visual install guide for iOS Safari.
* **Rich Manifest & App Shortcuts**: High-res icons (192x192, 512x512, maskable, apple-touch-icon), home screen shortcuts to jump straight into favorite mini-games, and `display_override: ["fullscreen", "standalone"]`.
* **Update Notification & Offline Badge**: Friendly update toast banner ("New Adventure Ready!") with instant activation, plus real-time offline status indicator.
* **Procedural Web Audio Engine**: All 18 sound effects and 128 BPM multi-track background music are dynamically synthesized via the Web Audio API.
* **Responsive Dual-Orientation Viewport**: Full support for desktop and mobile/tablets with responsive Portrait (9:16) and Landscape (16:9) scaling.
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

---

## 📄 License
MIT License
