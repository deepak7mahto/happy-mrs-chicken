# Adventures of Trishu — Design Specification

## 1. Overview & Vision
Transform the existing HTML5 Canvas game suite into **"Adventures of Trishu"**, an original, joyful, and completely self-contained browser game designed for toddlers and young children.

The protagonist is **Trishu**, a cheerful, curious young girl who explores the barnyard, kitchen, park, and garden with her family, friends, and friendly farm animals.

---

## 2. Character Roster & Procedural Vector Renderers

All characters are drawn purely using HTML5 Canvas 2D vector primitives (`arc`, `bezierCurveTo`, `fill`, `stroke`) without external bitmap images.

### 2.1 Trishu (Hero / Protagonist)
* **Visuals**:
  * Hairstyle: Cute twin pigtails with red/pink hair bows.
  * Face: Large expressive cartoon eyes with blinking animation, rosy cheeks, joyful smile.
  * Outfit: Bright yellow/lilac explorer dungarees with white inner tee and red sneakers.
* **Animation States**:
  * Idle: Breathing bounce and gentle hair ribbon wobble.
  * Jumping: Squash-and-stretch on take-off and landing.
  * Win/Celebration: Arms raised in excitement with star eyes.

### 2.2 Leo (Little Brother / Companion)
* **Visuals**: Toddler boy in blue overalls holding a friendly green plush toy dinosaur.
* **Animation States**: Gentle wobble, excited jumps.

### 2.3 Mrs. Clucky & Baby Chicks
* **Mrs. Clucky**: Plump white/cream hen with red comb, yellow beak, and animated wing flaps.
* **Baby Chicks**: Golden-yellow fluffy chicks with scurrying foot animations.

### 2.4 Dad & Mom
* **Dad**: Round, cheerful father figure in teal polo and glasses.
* **Mom**: Warm, smiling mother figure in coral dress with flower hairclip.

### 2.5 Grandpa
* **Grandpa**: Gardening grandfather with straw sun hat, garden overalls, and rubber boots.

### 2.6 Mimi the Bunny
* **Mimi**: Fluffy white bunny with pink inner ears, cute nose twitch, and floral dress.

---

## 3. Visual Palette & Environment

### 3.1 Color Palette (`src/graphics/palette.ts`)
* Sky Cyan: `#64C8FA`
* Meadow Green: `#7ED957` / `#5CB836`
* Sunbeam Yellow: `#FFD13B`
* Trishu Coral / Pink: `#FF6B6B` / `#FF8DA1`
* Lavender Purple: `#B388FF`
* Cloud White: `#FFFFFF`
* Earth Brown: `#8D6E63` / `#6D4C41`
* Soft Shadow: `rgba(0, 0, 0, 0.12)`

### 3.2 Environments (`src/graphics/environment/`)
* **Sky & Hills**: Layered parallax green hills, smiling sunshine, drifting clouds.
* **Barnyard**: Cozy wooden coop, straw hay nest, golden grain trails.
* **Garden & Kitchen**: Mud puddles, vegetable garden patch, kitchen counter with waffle/pancake grill.
* **Park Trail**: Hopscotch chalk squares, rainbow flower beds, and sunny picnic blanket.

---

## 4. The 8 Mini-Game Modes

Each mini-game implements the unified `BaseScene` interface (`init`, `enter`, `update`, `render`, `handleInput`, `resize`, `exit`, `destroy`, `getEntities`, `getModeState`).

| # | Scene File | Game Title | Core Mechanics |
|---|------------|------------|----------------|
| 1 | `EggLayingScene.ts` | **Happy Mrs. Clucky** | Tap to lay eggs in nest; eggs stack, crack, and hatch into animated chirping chicks. |
| 2 | `MuddyPuddlesScene.ts` | **Puddle Splash Adventure** | Trishu jumps into garden rain puddles with splash particles and score combo multiplier. |
| 3 | `ChickMazeScene.ts` | **Fluffy Chick Trail** | Drop seed trails to guide lost baby chicks safely around garden obstacles back to the coop. |
| 4 | `DaddyPigScene.ts` | **Dad's Kitchen Dash** | Fast-paced reaction challenge catching toast & breakfast items with combo milestones. |
| 5 | `DinosaurBalloonScene.ts` | **Trishu's Balloon Pop** | Tap rising star, heart, and animal balloons with confetti bursts and cheerful laughter. |
| 6 | `PancakeFlipperScene.ts` | **Golden Pancake Flipper** | Pan flip timing with parabolic flight, golden-brown crust detection, and syrup stacking. |
| 7 | `VegetableHarvestScene.ts` | **Grandpa's Veggie Harvest** | Pull giant carrots, turnips, and pumpkins from soil with elastic mud resistance into the cart. |
| 8 | `HopscotchBubbleScene.ts` | **Rainbow Bubble Hopscotch** | Pop shimmering soap bubbles along a garden path to guide Trishu & Mimi to the picnic. |

---

## 5. Procedural Web Audio Engine

* **Synthesizer**: Web Audio API native oscillator nodes, noise generators, and biquad filters.
* **Sound Recipes (16 SFX)**:
  * `cluck`, `chirp`, `eggPop`, `crack`, `hatch`, `splash`, `seedDrop`, `balloonPop`, `pancakeSizzle`, `whoosh`, `veggiePop`, `mudThud`, `bubblePop`, `fanfare`, `boing`, `giggle`.
* **Algorithmic BGM**:
  * 128 BPM multi-track cheerful nursery tune (Pentatonic flute lead, Marimba chords, rhythmic bass).
  * Global instant mute toggle with local storage persistence.

---

## 6. Architecture, UI & Lean Test Strategy

### 6.1 Code Limits & Standards
* Every source file in `src/` must remain strictly **under 500 lines of code**.
* 100% strict TypeScript with zero `any` leaks.

### 6.2 Responsive UI & PWA
* Dual-orientation responsive viewport (Portrait 9:16 & Landscape 16:9).
* Fullscreen and touch ripple feedback for young kids.
* Standalone offline PWA with service worker caching in `dist/`.

### 6.3 Fast Test Suite (`tests/`)
* Streamlined test suite executing in **< 1.0 second**:
  * **Smoke & Init Test**: Scene creation, DisplayManager resize, StorageManager defaults.
  * **Mini-Game Mechanics Test**: Verifies input & state transitions across all 8 modes.
  * **Audio Synthesis Test**: SoundSynthesizer and BGMSequencer method verification.
  * **Quality & Limits Test**: TypeScript compile check and file length (<500 lines) enforcement.
