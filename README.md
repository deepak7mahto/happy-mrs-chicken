# 🐔 Peppa Pig: Happy Mrs Chicken — 8-Game Deluxe Expansion Suite

A faithful, interactive, zero-dependency browser recreation of the iconic **Happy Mrs Chicken** game from *Peppa Pig*, featuring 8 distinct playable mini-game modes, show-accurate procedural vector character art, procedural Web Audio sound synthesis, fluid Canvas/SVG animations, and local high score tracking!

🎮 **Play Online**: [https://deepak7mahto.github.io/happy-mrs-chicken/](https://deepak7mahto.github.io/happy-mrs-chicken/)

---

## 🕹️ 8 Playable Mini-Game Modes

1. **Happy Mrs Chicken (Classic Egg-Laying Mode)**
   * Tap screen or press **Spacebar** to make Mrs. Chicken lay eggs with squash-and-stretch animation.
   * Eggs bounce with restitution physics and stack in the nest.
   * Reaching capacity triggers multi-stage egg-cracking and spawns chirping baby chicks that scamper off-screen.

2. **Muddy Puddles Mode**
   * Jump into randomly spawning puddles (Small, Medium, Mega, and Golden bonus puddles) with show-accurate Peppa Pig vector avatar.
   * Center-accuracy splash scoring multipliers (*"Perfect Splash!"*), mud particle bursts, and a 60s countdown timer.

3. **Chick Maze / Sorting Mode**
   * Top-down garden maze featuring Reynolds Boids flocking AI for wandering baby chicks.
   * Place corn seed trails and use whistle alerts to lure chicks safely back to the hen coop.

4. **Daddy Pig High Score Challenge**
   * Rapid-fire egg-laying reaction mode with combo fever meters and rainbow bonus eggs.
   * 4-stage escalating Daddy Pig panic animations leading up to the iconic *"Computer Overheat / Daddy Pig Crash"* cutscene!

5. **George's Dinosaur Balloon Pop**
   * Float through colorful balloons with sinusoidal wobble physics.
   * Tap to pop balloons, trigger confetti explosions, and hear George's dinosaur roar!

6. **Mummy Pig's Pancake Flipper**
   * Master pan flipping rhythm, airborne parabolic trajectory, and cook detection (*Raw, Golden, Overcooked*).
   * Stack delicious golden pancakes on the plate with maple syrup particle drips.

7. **Grandpa Pig's Vegetable Harvest**
   * Pull carrots, cabbages, and giant boss pumpkins from garden soil mounds with elastic spring tension.
   * Collect bountiful harvests into Grandpa's wheelbarrow with rich mud bursting effects.

8. **Suzy Sheep's Hopscotch & Bubbles**
   * Tap shimmering soap bubbles with glockenspiel chimes to guide Suzy along the 10-step hopscotch path.
   * Reach the picnic basket for victory fanfare and celebration!

---

## 🎨 Vector Graphics & Character Models

* **Show-Accurate Cartoon Geometry**: 100% procedural HTML5 Canvas 2D vector art with authentic Astley Baker Davies proportions, smooth Bézier silhouettes, canonical hairdryer snout curves, curly pig tails, and rain wellies.
* **Procedural Character Roster**: Peppa Pig, George Pig (with articulated Mr. Dinosaur), Daddy Pig, Mummy Pig, Grandpa Pig, Suzy Sheep, Mrs. Chicken, and Baby Chicks.
* **Volume Preservation & Animations**: Physics-based squash & stretch, stochastic blinking intervals, breathing cycles, and dynamic facial expressions.

---

## 🚀 Features & Architecture

* **100% Zero-Dependency Standalone**: Pure TypeScript + React 19 + Vite. No external CDN dependencies, fully offline-capable with PWA Service Worker caching.
* **Procedural Web Audio Engine**: All 18 sound effects and 128 BPM multi-track nursery background music are dynamically synthesized via the Web Audio API.
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

The game includes an automated test harness covering unit, E2E headless browser, and stress test suites:

```bash
npm test
# or: node tests/e2e_runner.mjs
```

---

## 📄 License
MIT License
