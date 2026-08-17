# 🐔 Peppa Pig: Happy Mrs Chicken — Standalone Browser Game Suite

A faithful, interactive, zero-dependency browser recreation of the iconic **Happy Mrs Chicken** game from *Peppa Pig*, featuring 4 distinct playable mini-game modes, procedural Web Audio sound effects, fluid Canvas/SVG animations, and high score tracking!

🎮 **Play Online**: [https://deepak7mahto.github.io/happy-mrs-chicken/](https://deepak7mahto.github.io/happy-mrs-chicken/)

---

## 🕹️ Mini-Game Modes

1. **Happy Mrs Chicken (Classic Egg-Laying Mode)**
   * Tap screen or press **Spacebar** to make Mrs. Chicken lay eggs with squash-and-stretch animation.
   * Eggs bounce with restitution physics and stack in the nest.
   * Reaching capacity triggers egg-cracking and spawns chirping baby chicks that scamper off-screen.

2. **Muddy Puddles Mode**
   * Jump into randomly spawning puddles (Small, Medium, Mega, and Golden bonus puddles).
   * Center-accuracy splash scoring multipliers (*"Perfect Splash!"*), mud particle bursts, and a 60s countdown timer.

3. **Chick Maze / Sorting Mode**
   * Top-down garden maze featuring Reynolds Boids flocking AI for lost wandering chicks.
   * Place corn seed trails and use whistle alerts to lure chicks safely back to the hen coop.

4. **Daddy Pig High Score Challenge**
   * Rapid-fire egg-laying reaction mode with combo fever meters and rainbow bonus eggs.
   * 4-stage escalating Daddy Pig panic animations leading up to the iconic *"Computer Overheat / Daddy Pig Crash"* cutscene!

---

## 🚀 Features & Architecture

* **100% Zero-Dependency Standalone**: Pure single-file HTML5/CSS/Canvas/JavaScript. No build steps, no external CDN dependencies, runs completely offline.
* **Procedural Web Audio Engine**: All sound effects (clucks, egg pops, cracks, chirps, splashes, fanfare, crash jingle) and 128 BPM multi-track background music are synthesized dynamically in-browser via the Web Audio API.
* **Responsive Controls**: Full support for desktop (Keyboard / Mouse) and mobile/tablets (Touch / Swipe) with responsive 16:9 canvas scaling.
* **Persistent High Scores**: High scores for all modes are saved locally via `localStorage`.

---

## 📦 Local Installation & Running

Simply clone the repository and open `index.html` in any web browser:

```bash
git clone https://github.com/deepak7mahto/happy-mrs-chicken.git
cd happy-mrs-chicken
open index.html
```

---

## 🧪 Testing

The game includes an automated test harness covering unit, E2E headless browser, and stress test suites:

```bash
node tests/e2e_runner.mjs
```

---

## 📄 License
MIT License
