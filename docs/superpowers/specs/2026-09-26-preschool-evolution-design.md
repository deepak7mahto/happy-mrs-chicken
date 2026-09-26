# Adventures of Trishu — Preschool Evolution & 4-Game Expansion Design Specification

**Date:** 2026-09-26  
**Target Audience:** 3-Year-Old Preschoolers / Toddlers  
**Architecture:** HTML5 Canvas 2D + Pure Vanilla TypeScript + Procedural Web Audio API + Heavy PWA Precache  
**Repository:** `happy-mrs-chicken`

---

## 1. Executive Summary

This specification outlines the comprehensive preschool adaptation and 4-game expansion of the **Adventures of Trishu** suite, growing the total playable mini-game roster from 16 to **20 distinct modes**. The design centers on the developmental capabilities of a 3-year-old child: pre-literate visual communication, broad multi-touch ergonomics with edge-palm rejection, no-fail sensory cause-and-effect loops, distraction-free in-game navigation with Parental Gates, and a zero-dependency spoken voice narrator utilizing the native browser Web Speech API.

---

## 2. Core Preschool Engine & Ergonomics Enhancements

### 2.1 Zero-Dependency Spoken Voice Narrator (`VoiceNarrator.ts`)
* **Location:** `src/engine/audio/VoiceNarrator.ts`
* **Technology:** Native browser `window.speechSynthesis` and `SpeechSynthesisUtterance`. Zero external network requests, zero bundle weight.
* **Acoustics & Tuning:** 
  * Pitch: `1.15` (bright, gentle)
  * Speech Rate: `0.92` (measured, friendly cadence)
  * Volume: Linked to master SFX volume.
* **Automatic Music Ducking:** Calls `soundEngine.duckBGM(0.3)` during spoken utterances, smoothly restoring nursery BGM volume upon utterance completion.
* **Spoken Vocabulary:**
  * Scene introductions: e.g., *"Let's feed our hungry farm friends!"*, *"Let's make music together!"*, *"Time for finger painting!"*, *"Night-night, time for bed!"*.
  * Positive reinforcement on celebrations: *"Yummy in the tummy!"*, *"Listen to that music!"*, *"Look at those beautiful colors!"*, *"Sleep tight!"*.
  * Setting toggle in `SettingsModal`: `🗣️ Spoken Voice Prompts: ON / OFF` (default: ON).

### 2.2 Distraction-Free In-Game HUD & Parental Gate
* **In-Game Distraction-Free Mode:**
  * During active gameplay within any mini-game scene, the top-right button cluster (`⚙️ Settings`, `🐷 Avatar`, `⛶ Fullscreen`, `🔊 Mute`) is hidden from the DOM to eliminate accidental edge taps and bezel grip misclicks.
  * The only visible navigation control is the top-left `🏠 Home` button, protected by the **3-Second Hold Toddler Lock** with an animated circular progress indicator.
* **Parental Gate for Settings:**
  * Opening the `SettingsModal` or tapping "Reset High Scores" triggers a child-proof Parental Gate modal (*"Grown-ups only: Hold for 3 seconds to unlock"*), protecting application volume and progress from accidental toddler modification.

### 2.3 Pre-Literacy Visual Communication & Pictorial Goals
* **Ice Cream Van:** Replaces 11px textual customer requests with a vibrant speech bubble displaying a large, bouncing ice cream scoop matching the exact target flavor color and an animated directional arrow pointing toward the matching tub.
* **Story Intro & Victory Modals:** Replaces text-heavy narrative paragraphs with high-contrast pictorial badges, animated star meters, and large 64px character celebration emojis.
* **Edge-Palm Rejection:** Updates `src/engine/InputManager.ts` to filter out stationary bezel contacts within 18px of the viewport boundaries, preventing accidental touches from fingers resting on the tablet bezel.

---

## 3. Four New Toddler Mini-Games Specifications (Modes 17–20)

Each new mini-game is structured using the modular 3-tier pattern (`types.ts`, `[Game]Logic.ts`, `[Game]Renderer.ts`, `[Game]Scene.ts`) strictly under 500 lines of code.

### 3.1 Mode 17: Hungry Farmyard Friends (`ANIMAL_FEEDING` / `hungry-friends`)
* **Theme:** Feeding snacks to hungry cartoon animals.
* **Hosts:** Leo holding Mr. Dinosaur, Mrs. Clucky, and Mimi Bunny seated around a picnic table.
* **Snack Tray:** 5 vibrant snacks along the bottom tray:
  1. Crunchy Carrot 🥕 (orange with leafy greens)
  2. Watermelon Slice 🍉 (pink wedge with black seeds and green rind)
  3. Sweet Red Apple 🍎 (glossy red with leaf stem)
  4. Chocolate Chip Cookie 🍪 (golden brown with chips)
  5. Dinosaur Berry 🫐 (sparkling violet berries)
* **Mechanics:**
  * Tapping or dragging any snack launches it in a smooth parabolic arc toward an animal.
  * Targeted animal opens their mouth wide (`mouthOpen = 1.0`), catches the food, and exhibits an exaggerated munch animation with flying crumbs.
  * Triggers procedural `foodChomp` sound effect and flying heart/sparkle particles.
  * Every 3 snacks fed, the animal rubs their tummy, lets out a cute giggle (`toddlerGiggle` SFX), and awards +25 celebration points.
* **Preschool Accessibility:** Zero wrong choices—every animal gladly munches any snack. No countdown timer, infinite play.

### 3.2 Mode 18: Farmyard Animal Band (`ANIMAL_BAND` / `animal-band`)
* **Theme:** Musical toddler xylophone and stage percussion jam.
* **Hosts & Instruments:** 5 adorable animals on a bright cartoon stage:
  1. **Mrs. Clucky on Xylophone:** 5 rainbow wooden bars tuned to the C-Major Pentatonic scale (C5, D5, E5, G5, A5).
  2. **Leo & Dino on Snare Drum:** Dinosaur strikes the drum with bouncy sticks ("Thump thump!").
  3. **Mimi Bunny on Maracas:** Shaking bright pink rattle maracas with rhythmic sizzles.
  4. **Mama Duck on Accordion:** Squeezing a pastel green accordion with quacking chimes.
  5. **Daddy Pig on Bass:** Plucking a warm double bass with deep bouncy plucks.
* **Harmonic Pentatonic Guarantee:** Every note played belongs strictly to the C-major pentatonic scale (`C - D - E - G - A`). Any combination of random toddler finger smacks produces harmonious, melodic music without dissonance.
* **Interaction:** Tapping any band member plays their instrument note, triggers a happy squash-and-stretch jump, and emits floating musical notes (`♪`, `♫`, `✨`). Tapping the center "Tutti" bell triggers a full ensemble dance with confetti.

### 3.3 Mode 19: Rainbow Splat & Stamp Studio (`FINGER_PAINT` / `splat-stamp`)
* **Theme:** Mess-free finger painting, color splats, and stamp art.
* **Palette & Tools:**
  * 5 oversized paint tubs at the bottom: Strawberry Red (`#FF1744`), Sunshine Yellow (`#FFEA00`), Meadow Green (`#00E676`), Ocean Cyan (`#00E5FF`), Bubblegum Pink (`#F50057`).
  * 3 Shape Stamp buttons: Puppy Paw 🐾, Twinkle Star ⭐, Cheerful Heart 💖.
* **Mechanics:**
  * **Splat & Draw:** Tapping anywhere slaps a colorful paint splotch with realistic drip splatters and a squishy `paintSplat` sound. Dragging paints continuous fluid rainbow ribbons.
  * **Stamping:** Selected stamp places crisp vector icons with sparkling bursts.
  * **Rubber Duck Squeegee Button:** Tapping the rubber duck in the top corner glides a soapy water squeegee across the entire canvas, popping bubbles (`bubblePop` SFX) and wiping the canvas squeaky clean.
  * **Photo Snap:** Saves their masterpiece to the in-game photo album with a camera flash animation.

### 3.4 Mode 20: Sleepy Bedtime Barn (`BEDTIME_BARN` / `sleepy-barn`)
* **Theme:** Calming twilight stars, music-box lullaby, and bedtime tuck-in.
* **Atmosphere:** Deep indigo night sky (`#1A237E` to `#0D47A1`), glowing crescent moon, floating constellation stars, and cozy wooden stalls.
* **Hosts:** 4 sleepy friends: Baby Chicks in a nest, Mrs. Clucky on a roost, Mimi Bunny in a hammock, and Leo in a cozy cot.
* **Mechanics:**
  * **Catching Twinkle Stars:** Floating glowing stars drift gently across the sky. Tapping a star draws it into the glowing Bedtime Jar with a pure crystalline music box chime (`musicBoxStar` SFX).
  * **Tucking In Friends:** Tapping an awake animal pulls a cozy patchwork quilt over them, turns down their warm night lantern, and triggers a gentle cartoon yawn and floating sleepy `Zzz` bubbles.
  * **Smiling Moon:** Tapping the crescent moon plays a soft lullaby chord and showers dreamy stardust sparkles over the barn.
* **Preschool Accessibility:** Specifically designed with low-tempo audio (60 BPM Brahms / Twinkle motif) and relaxing visual rhythms to assist bedtime transition routines.

---

## 4. Procedural Audio Synthesis Recipes (`SoundSynthesizer.ts`)

To uphold the zero-dependency, 100% offline standard, 8 new procedural sound effect recipes are added using the Web Audio API:
1. `foodChomp`: Rapid alternating triangle clicks (750 Hz to 220 Hz) + lowpass bite thud.
2. `tummyRub`: Warm low-frequency FM modulation wobble (110 Hz).
3. `xylophoneChime`: High-Q resonant bandpass sine impulses with exponential decay (pentatonic scale: 523.2 Hz, 587.3 Hz, 659.3 Hz, 783.9 Hz, 880.0 Hz).
4. `drumThump`: Punchy downward frequency sweep (160 Hz -> 42 Hz) with short white noise attack buffer.
5. `maracaShake`: Filtered highpass burst of pink noise (3600 Hz, 85ms).
6. `paintSplat`: Squishy liquid pop with resonance drop (620 Hz -> 140 Hz).
7. `musicBoxStar`: Crystalline pure sine tone with subtle chorus detune (880 Hz, 1046 Hz, 1318 Hz).
8. `sleepyYawn`: Warm descending sine sweep (320 Hz -> 180 Hz) paired with gentle breathy lowpass noise.

---

## 5. Menu, Storage & Architecture Integration

### 5.1 Mode Registration & Constants
* **`src/types/game.ts`:**
  * `ActiveGameModeId` union extended with: `'ANIMAL_FEEDING' | 'ANIMAL_BAND' | 'FINGER_PAINT' | 'BEDTIME_BARN'`.
  * `GAME_MODES_LIST` updated to contain all 20 modes.
  * `MODE_ID_TO_SLUG` and `SLUG_TO_MODE_ID` mappings updated with `hungry-friends`, `animal-band`, `splat-stamp`, `sleepy-barn`.

### 5.2 Storage Schema & High Scores
* **`src/types/storage.ts`:**
  * `HighScores` interface extended with: `animalFeeding: number; animalBand: number; fingerPaint: number; bedtimeBarn: number;`.
  * `StorageManager` safe initialization and default state migration ensuring 0 data loss for previous 16-game player profiles.

### 5.3 Responsive Menu Layout (20 Mini-Games)
* **Landscape:** 4 columns × 5 rows of 3D tactile toy cards with momentum scrolling and gamepad/keyboard navigation.
* **Portrait:** 2 columns × 10 rows with oversized card touch targets (card height >= 92px) and generous touch padding.

---

## 6. Quality Assurance & Verification Plan

1. **Automated E2E & Unit Test Suites:**
   * Extend `tests/game_features.test.ts` to test all 4 new modes' logic engines (`AnimalFeedingLogic`, `AnimalBandLogic`, `FingerPaintLogic`, `BedtimeBarnLogic`).
   * Extend `tests/smoke.test.ts` to verify initialization, scene transitions, and rendering of all 20 mini-games without exceptions.
   * Verify Canvas state stack integrity (`0` save/restore leaks across all 21 scenes including MENU).
   * Verify file length limit: every single new file strictly `< 500` lines of code.
2. **Build & PWA Verification:**
   * `npx tsc --noEmit` passes with 0 TypeScript compilation errors.
   * `npm run build` succeeds, generating updated production chunks and service worker cache precache manifest in `dist/sw.js`.
3. **Deployment:**
   * Deploy updated production bundle via `gh-pages` / repository build pipeline.
