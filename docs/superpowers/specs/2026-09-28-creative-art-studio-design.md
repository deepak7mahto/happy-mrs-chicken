# Creative Art Studio Design Specification: Sticker Album & Magic Coloring Book

**Date**: 2026-09-28  
**Target Audience**: 3-year-old toddler / preschooler  
**Status**: Approved by User  
**Scope**: Creative Art Studio Hub with Interactive Animated Sticker World & Magic Coloring Book with Parent Print/Export  

---

## 1. Executive Summary & Product Goals

The *Creative Art Studio* expands the *Adventures of Trishu* suite beyond active mini-games into open-ended creative play tailored specifically for 3-year-old toddlers. It introduces two zero-frustration creative environments:
1. **Interactive Sticker World**: An animated sticker album where toddlers drag, drop, scale, and tickle 30+ talking characters and props across 5 scenic farm, playground, and bedtime environments.
2. **Magic Coloring Book**: A 6-sheet preschool coloring book featuring two toddler-optimized coloring mechanics: **Magic Color** (swiping anywhere auto-fills sections with radiant colors and fairy sparkles) and **Free Crayon & Tap-to-Fill** (12 jumbo crayon pots, boundary fill, and textured crayon strokes).
3. **Parent Print & Share Integration**: 1-tap snapshot feature saving high-res artwork to local gallery (`hmc_saved_photos`), native device sharing (`navigator.share`), and printable PNG downloads.

---

## 2. Architecture & Scene Flow

### 2.1 Scene Registration & State Machine
* Add `STUDIO` to `SceneKey` in [`src/types/game.ts`](file:///f:/PROJECTS/happy-mrs-chicken/src/types/game.ts):
  ```typescript
  export type SceneKey = 'MENU' | 'STUDIO' | ActiveGameModeId;
  ```
* Register `StudioScene` in [`src/engine/GameEngine.ts`](file:///f:/PROJECTS/happy-mrs-chicken/src/engine/GameEngine.ts).
* URL Hash / Route support:
  * `#studio` or `?mode=studio` opens the studio directly.
  * Browser back navigation (`popstate`) and HUD back arrow cleanly transition back to `MENU`.

### 2.2 Menu Integration (`MenuScene.ts`)
* A prominent golden, rainbow-bordered header button labeled **"🎨 Art Studio"** positioned in the upper portion of the menu.
* Dimensions: 220px × 54px touch target, floating gently with a wobble animation and sparkle stars.
* Tapping triggers voice narration: *"Art Studio! Let's make something beautiful!"*

### 2.3 Studio Hub Structure (`src/games/studio/`)
To maintain strict adherence to project quality gates (< 500 lines of code per file), the studio is split into clear decoupled modules:
* `src/games/studio/StudioScene.ts` (< 250 LOC): Scene lifecycle, top tab bar, camera snapshot, clean wipe, audio triggers.
* `src/games/studio/types.ts` (< 100 LOC): Data interfaces for stickers, coloring sheets, stroke buffers, and studio persistence.
* `src/games/studio/stickers/StickerLogic.ts` (< 350 LOC): Sticker inventory, placement, dragging, z-index sorting, hit testing, squish/wiggle state, and deletion bin.
* `src/games/studio/stickers/StickerRenderer.ts` (< 400 LOC): Background landscapes (Farm, Puddles, Castle, Bedtime, Meadow), sticker rendering with drop-shadows and wiggle transforms, bottom sticker carousel.
* `src/games/studio/coloring/ColoringLogic.ts` (< 350 LOC): Sheet registry, vector region detection, Magic Color swipe auto-fill, Tap-to-Fill, crayon stroke recording, undo stack.
* `src/games/studio/coloring/ColoringRenderer.ts` (< 450 LOC): High-contrast vector line-art sheets, color fills, crayon wax texture effects, crayon pot selector, squeegee wipe animation.
* `src/games/studio/studioStorage.ts` (< 150 LOC): Persistence to `localStorage` for sticker placements and coloring progress, plus export utilities.

---

## 3. Interactive Sticker World Specification

### 3.1 Five Themed Background Environments
1. **Sunny Farmyard**: Red wooden barn with open Dutch doors, white picket fence, blooming giant sunflowers, rolling green hills, and blue skies with puffy clouds.
2. **Muddy Puddles Playground**: Rolling green hillocks, leafy oak trees, and three glistening muddy puddles for character splashing.
3. **Windy Castle Hill**: High mountaintop with stone castle battlements, billowing banners, and panoramic mountain peaks.
4. **Bedtime Barn**: Cozy barn interior at twilight under a deep navy starlit sky, glowing paper lanterns, and a smiling crescent moon.
5. **Rainbow Flower Meadow**: Gentle pastel hills, a calm duck pond with lily pads, and colorful wildflower beds.

*Background Switching*: Large left/right bouncing cloud buttons at mid-screen height allow 1-tap switching between backgrounds.

### 3.2 30+ Preschool Sticker Catalog
Stickers are organized in a bottom scrollable tray with high-contrast circular badges:
* **Characters**: Happy Mrs Clucky, Yellow Chick, Peppa Pig, George Pig, Mimi Bunny, Leo Lion, Grandpa Pig, Daddy Pig, Miss Rabbit, Pedro Pony.
* **Food & Treats**: Crunchy Apple, Sweet Carrot, Chocolate Chip Cookie, Golden Fluffy Pancake, Helium Balloon, Strawberry Ice Cream Cone, Slice of Cake, Watermelon Slice.
* **Nature & Props**: Water Can, Flying Kite, Toy Dinosaur, Rubber Duck, Sun, Smiling Cloud, Rainbow, Twinkling Star, Mud Splat, Flower Bloom.
* **Special Sparkle Stickers**: Golden Trophy Chick, Sparkle Rainbow Star, Crown, Party Horn (unlocked immediately or earned as bonus souvenirs).

### 3.3 Tactile Toddler Interactions
* **Tap-to-Spawn**: Tapping any badge in the bottom tray drops the sticker into the center of the active canvas with a buoyant "pop!" and sparkle burst.
* **Drag-and-Drop**: Immediate 60fps single-touch dragging with elastic pick-up scale (+10% size) and soft drop shadow.
* **Tickle & Wiggle**: Tapping an already placed sticker makes it squish (`scaleX: 1.15, scaleY: 0.85`), bounce back, and trigger its signature procedural sound (e.g. Clucky cluck, Peppa snort, drum thump, trumpet blast).
* **Resize Controls**: Selected sticker features gentle (+) and (–) mushroom buttons, as well as two-finger pinch-to-scale.
* **Trash Recycler**: Bottom-right cheerful animated dustbin. Dragging a sticker near the bin opens the lid; releasing drops it in with a soft swoosh.

---

## 4. Magic Coloring Book Specification

### 4.1 Six Curated Line-Art Sheets
All sheets are rendered using thick, bold, rounded vector strokes (stroke width 6–10px) designed for easy visual legibility:
1. **Sheet 1**: Happy Mrs Clucky sitting happily on her straw nest with her chicks.
2. **Sheet 2**: Peppa Pig in her yellow boots jumping joyfully in a muddy puddle.
3. **Sheet 3**: Leo Lion enjoying a slice of birthday cake at the picnic table.
4. **Sheet 4**: Mimi Bunny holding a big heart balloon under a smiling sun and rainbow.
5. **Sheet 5**: Grandpa Pig driving his Little Chug Train along the green tracks.
6. **Sheet 6**: Sleepy Barn Animals tucked under a patchwork quilt under the stars.

### 4.2 Dual Coloring Modes
A prominent toggle button (Magic Wand 🪄 vs Jumbo Crayon 🖍️) selects the active mode:

#### Mode A: Magic Color (Auto-Section Reveal)
* Designed for preschoolers who want immediate visual reward without needing fine motor boundary precision.
* The toddler swiping or scribbling anywhere across the screen casts "fairy dust".
* When their touch intersects an outlined vector region (e.g., Peppa's dress, Clucky's comb, tree foliage, train wheels), that entire region smoothly blooms into its vibrant canon color.
* Spawns a cascade of golden star particles and plays a melodic pentatonic chime.

#### Mode B: Free Crayon & Tap-to-Fill
* **12 Jumbo Crayon Pots**: Cherry Red, Carrot Orange, Buttercup Yellow, Grass Green, Ocean Blue, Royal Purple, Bubblegum Pink, Chocolate Brown, Golden Sun, Soft Peach, Lilac, Mint.
* **Tap-to-Fill**: Tapping inside any vector region floods that region with the chosen crayon color.
* **Free Scribble**: Dragging draws organic, waxy textured crayon strokes with responsive audio feedback (`crayonScribble`).
* **Tools**:
  * Undo button (one step back).
  * Sparkle Squeegee (clears current sheet with squeegee wipe sound).

---

## 5. Audio, Storage & Parent Export

### 5.1 Voice Narrator & Audio Recipes
* **Voice Prompts (`VoiceNarrator.ts`)**:
  * Welcome: *"Welcome to the Art Studio! What shall we make today?"*
  * Sticker World: *"Sticker World! Pick a sticker!"*
  * Coloring Book: *"Coloring Book! Tap or swipe to color!"*
  * Encouragements: *"So pretty!"*, *"Look at those colors!"*, *"You are a wonderful artist!"*
  * Camera Snap: *"Say cheese! 1, 2, 3... Click!"*
* **Procedural Sound Recipes (`SoundEngine.ts` / `PreschoolSFX.ts`)**:
  * `stickerPop`: Soft buoyant frequency jump (240Hz -> 680Hz).
  * `crayonScribble`: Bandpass filtered pink noise simulating wax pencil friction.
  * `magicChime`: Pentatonic glockenspiel arpeggio (C5, E5, G5, C6).
  * `cameraShutter`: Crisp mechanical click with spring echo.

### 5.2 Storage Schema
* `localStorage` keys:
  * `hmc_studio_stickers`: Array of `{ sceneId: string, stickers: Array<{ id: string, x: number, y: number, scale: number, rotation: number, z: number }> }`
  * `hmc_studio_coloring`: Map of `sheetId -> { filledRegions: Record<string, string>, strokes: Array<{ color: string, points: Array<{x: number, y: number}> }> }`
  * `hmc_saved_photos`: Array of `{ id: string, timestamp: number, dataUrl: string, title: string }`

### 5.3 Parent Print & Mobile Share
* **Snapshot Pipeline**:
  * Offscreen canvas renders scene at 1920×1080 without UI overlays.
  * Generates high-quality PNG.
  * Saved to `hmc_saved_photos`.
  * If `navigator.share` is supported (iOS Safari, Android Chrome), presents native share sheet (AirDrop, Save Image, WhatsApp).
  * Fallback: triggers immediate download as `Adventures_of_Trishu_Art_<timestamp>.png`.

---

## 6. Quality Gates & Non-Functional Requirements
1. **Modularity**: All newly created files strictly under 500 lines of code.
2. **Performance**: Consistent 60fps rendering on mobile devices; zero canvas context save/restore state leaks.
3. **PWA & Offline**: 100% vector-procedural graphics; zero external images or font dependencies; completely functional offline.
4. **TypeScript & Testing**: Clean `npx tsc --noEmit` compile; comprehensive automated unit and integration tests added to `tests/e2e_runner.mjs`.
