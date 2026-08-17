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

* **100% Zero-Dependency Standalone**: Pure TypeScript + React 19 + Vite. No external CDN dependencies, fully offline-capable with PWA Service Worker caching.
* **Procedural Web Audio Engine**: All 18 sound effects and 128 BPM multi-track background music are dynamically synthesized via the Web Audio API.
* **Responsive Dual-Orientation Viewport**: Full support for desktop and mobile/tablets with responsive Portrait (9:16) and Landscape (16:9) scaling.
* **Persistent High Scores**: High scores for all 8 modes are stored locally via `localStorage`.

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
