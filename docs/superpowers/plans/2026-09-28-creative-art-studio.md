# Creative Art Studio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy the "Creative Art Studio" hub featuring an Interactive Animated Sticker World (30+ stickers across 5 scenic backgrounds) and a Magic Coloring Book (6 line-art sheets with Magic Color swipe-fill and Free Crayon) with parent photo export and print sharing.

**Architecture:** A unified `StudioScene` registered in `GameEngine` with decoupled sub-delegates (`StickerLogic`/`StickerRenderer` and `ColoringLogic`/`ColoringRenderer`), procedural audio SFX in `PreschoolSFX.ts`, responsive canvas scaling, and storage persistence in `localStorage`.

**Tech Stack:** TypeScript (strict mode), HTML5 Canvas 2D, Web Audio API procedural synthesis, Web Speech API (`VoiceNarrator`), Web Share API / Canvas DataURL export, Vite.

## Global Constraints
- Every file in `src/` must be strictly under 500 lines of code.
- Pure Canvas 2D rendering at 60fps; zero external CDN dependencies.
- Zero canvas context save/restore state leaks.
- All 97 existing tests plus all new tests must pass cleanly.
- Full offline PWA support with Service Worker precaching.

---

### Task 1: Types, Audio Recipes & Storage Foundation

**Files:**
- Create: `src/games/studio/types.ts`
- Create: `src/games/studio/studioStorage.ts`
- Modify: `src/types/game.ts`
- Modify: `src/engine/audio/PreschoolSFX.ts`
- Modify: `src/engine/audio/SoundSynthesizer.ts`
- Create: `tests/studio_foundation.test.ts`

**Interfaces:**
- Consumes: `SoundSynthesizer`, `AudioContextHolder`, `PALETTE`.
- Produces:
  - `SceneKey = 'MENU' | 'STUDIO' | ActiveGameModeId`
  - Types: `StickerInstance`, `ScenicBackgroundId`, `ColoringSheetId`, `ColoringMode`, `CrayonColor`
  - Audio SFX: `stickerPop`, `crayonScribble`, `magicChime`, `cameraShutter`
  - `StudioStorage`: `loadStickers(sceneId)`, `saveStickers(sceneId, stickers)`, `loadColoring(sheetId)`, `saveColoring(sheetId, data)`, `saveSnapshotPhoto(dataUrl, title)`

- [ ] **Step 1: Write failing foundation test**

```typescript
// tests/studio_foundation.test.ts
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { StudioStorage } from '../src/games/studio/studioStorage.js';
import { soundEngine } from '../src/engine/audio/SoundEngine.js';

describe('Studio Foundation & Audio Recipes', () => {
  it('StudioStorage saves and loads stickers for a scenic background', () => {
    const sceneId = 'farm';
    const sampleStickers = [
      { id: 'clucky', x: 200, y: 300, scale: 1.0, rotation: 0, z: 1 }
    ];
    StudioStorage.saveStickers(sceneId, sampleStickers);
    const loaded = StudioStorage.loadStickers(sceneId);
    assert.equal(loaded.length, 1);
    assert.equal(loaded[0].id, 'clucky');
  });

  it('SoundEngine synthesizes studio audio recipes without throwing', () => {
    assert.doesNotThrow(() => soundEngine.playSFX('stickerPop'));
    assert.doesNotThrow(() => soundEngine.playSFX('crayonScribble'));
    assert.doesNotThrow(() => soundEngine.playSFX('magicChime'));
    assert.doesNotThrow(() => soundEngine.playSFX('cameraShutter'));
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `$env:__TSX_ACTIVE__="1"; npx tsx --test tests/studio_foundation.test.ts`
Expected: FAIL (modules missing)

- [ ] **Step 3: Implement `types.ts`, `studioStorage.ts`, and studio sound recipes**

Create `src/games/studio/types.ts`:
```typescript
export type ScenicBackgroundId = 'farm' | 'puddles' | 'castle' | 'bedtime' | 'meadow';

export interface StickerCatalogItem {
  id: string;
  name: string;
  category: 'character' | 'treat' | 'nature' | 'sparkle';
  characterId?: string;
  emoji?: string;
  iconBg: string;
}

export interface PlacedSticker {
  uid: string;
  id: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  z: number;
  wiggleTimer: number;
}

export type ColoringSheetId = 'clucky_nest' | 'peppa_puddle' | 'leo_picnic' | 'mimi_balloon' | 'train_ride' | 'sleepy_barn';
export type ColoringToolMode = 'magic' | 'crayon';

export interface ColoringRegion {
  id: string;
  name: string;
  colorCanon: string;
  path: Array<{ x: number; y: number }>;
}

export interface CrayonStroke {
  color: string;
  points: Array<{ x: number; y: number }>;
  width: number;
}

export interface SheetSaveData {
  filledRegions: Record<string, string>;
  strokes: CrayonStroke[];
}
```

Create `src/games/studio/studioStorage.ts` with clean localStorage fallbacks for Node.js tests.
Update `src/types/game.ts` to include `'STUDIO'` in `SceneKey`.
Update `src/engine/audio/PreschoolSFX.ts` and `SoundSynthesizer.ts` with `stickerPop`, `crayonScribble`, `magicChime`, and `cameraShutter`.

- [ ] **Step 4: Run test to verify it passes**

Run: `$env:__TSX_ACTIVE__="1"; npx tsx --test tests/studio_foundation.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/types/game.ts src/games/studio/types.ts src/games/studio/studioStorage.ts src/engine/audio/ tests/studio_foundation.test.ts
git commit -m "feat(studio): add types, storage helpers, and audio recipes for Art Studio"
```

---

### Task 2: Interactive Sticker World Logic & Renderer

**Files:**
- Create: `src/games/studio/stickers/StickerCatalog.ts`
- Create: `src/games/studio/stickers/StickerLogic.ts`
- Create: `src/games/studio/stickers/StickerRenderer.ts`
- Create: `tests/sticker_world.test.ts`

**Interfaces:**
- Consumes: `StickerCatalogItem`, `PlacedSticker`, `ScenicBackgroundId`, `renderCharacter`, `PALETTE`.
- Produces:
  - `StickerLogic`: `spawnSticker(id)`, `startDrag(x, y)`, `updateDrag(x, y)`, `endDrag()`, `tapSticker(x, y)`, `removeSticker(uid)`, `switchBackground(direction)`
  - `StickerRenderer`: `render(ctx, logic, width, height, time)`

- [ ] **Step 1: Write failing sticker world test**

```typescript
// tests/sticker_world.test.ts
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { StickerLogic } from '../src/games/studio/stickers/StickerLogic.js';

describe('Sticker World Logic', () => {
  it('spawns a sticker and tracks dragging', () => {
    const logic = new StickerLogic();
    logic.layout(960, 540);
    logic.spawnSticker('peppa');
    assert.equal(logic.stickers.length, 1);
    const placed = logic.stickers[0];
    assert.equal(placed.id, 'peppa');

    // Dragging
    const hit = logic.startDrag(placed.x, placed.y);
    assert.equal(hit, true);
    logic.updateDrag(placed.x + 50, placed.y + 30);
    assert.equal(placed.x, 960 / 2 + 50);

    logic.endDrag();
    assert.equal(logic.draggedSticker, null);
  });

  it('cycles backgrounds and persists state', () => {
    const logic = new StickerLogic();
    logic.layout(960, 540);
    assert.equal(logic.currentBackground, 'farm');
    logic.nextBackground();
    assert.equal(logic.currentBackground, 'puddles');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `$env:__TSX_ACTIVE__="1"; npx tsx --test tests/sticker_world.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement StickerCatalog, StickerLogic, and StickerRenderer**

- `StickerCatalog.ts`: list of 30+ stickers with identifiers, categories, and sound triggers.
- `StickerLogic.ts`: full drag hit-testing, z-sorting, tap squish timer, trash can collision detection, scene switching.
- `StickerRenderer.ts`: 5 procedural vector scenic backgrounds (farm, puddles, castle, bedtime, meadow), bottom horizontal carousel, sticker rendering with drop-shadows and squish/stretch matrices, trash bin.

- [ ] **Step 4: Run test to verify it passes**

Run: `$env:__TSX_ACTIVE__="1"; npx tsx --test tests/sticker_world.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/games/studio/stickers/ tests/sticker_world.test.ts
git commit -m "feat(studio): implement Interactive Sticker World logic and renderer"
```

---

### Task 3: Magic Coloring Book Logic & Vector Line Art Renderer

**Files:**
- Create: `src/games/studio/coloring/ColoringSheets.ts`
- Create: `src/games/studio/coloring/ColoringLogic.ts`
- Create: `src/games/studio/coloring/ColoringRenderer.ts`
- Create: `tests/coloring_book.test.ts`

**Interfaces:**
- Consumes: `ColoringSheet`, `ColoringRegion`, `CrayonStroke`, `PALETTE`.
- Produces:
  - `ColoringLogic`: `activeSheet`, `toolMode`, `selectedColor`, `handleTouchMove(x, y)`, `handleTap(x, y)`, `undo()`, `clear()`, `nextSheet()`, `prevSheet()`
  - `ColoringRenderer`: `render(ctx, logic, width, height, time)`

- [ ] **Step 1: Write failing coloring book test**

```typescript
// tests/coloring_book.test.ts
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ColoringLogic } from '../src/games/studio/coloring/ColoringLogic.js';

describe('Coloring Book Logic', () => {
  it('Magic Color fills regions upon touch intersection', () => {
    const logic = new ColoringLogic();
    logic.layout(960, 540);
    logic.setToolMode('magic');
    const sheet = logic.activeSheet;
    assert.ok(sheet.regions.length > 0);

    const firstRegion = sheet.regions[0];
    const testPoint = firstRegion.path[0];
    const revealed = logic.handleTouchMove(testPoint.x, testPoint.y);
    assert.equal(revealed, true);
    assert.equal(logic.isRegionFilled(firstRegion.id), true);
  });

  it('Free Crayon records strokes and supports undo', () => {
    const logic = new ColoringLogic();
    logic.layout(960, 540);
    logic.setToolMode('crayon');
    logic.setColor('#FF4B4B');
    logic.startStroke(100, 100);
    logic.addStrokePoint(110, 110);
    logic.endStroke();

    assert.equal(logic.strokes.length, 1);
    logic.undo();
    assert.equal(logic.strokes.length, 0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `$env:__TSX_ACTIVE__="1"; npx tsx --test tests/coloring_book.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement ColoringSheets, ColoringLogic, and ColoringRenderer**

- `ColoringSheets.ts`: 6 preschool line-art sheets defined as vector closed regions (polygon/curve points) with `colorCanon`.
- `ColoringLogic.ts`: point-in-polygon hit-testing, Magic swipe intersection detection, crayon stroke recording, undo stack, squeegee wipe.
- `ColoringRenderer.ts`: vector outline rendering with thick rounded strokes, filled region rendering, wax crayon texture simulation, 12 jumbo crayon pots, animated squeegee wipe.

- [ ] **Step 4: Run test to verify it passes**

Run: `$env:__TSX_ACTIVE__="1"; npx tsx --test tests/coloring_book.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/games/studio/coloring/ tests/coloring_book.test.ts
git commit -m "feat(studio): implement Magic Coloring Book logic and line-art renderer"
```

---

### Task 4: Studio Scene Controller & Menu Header Integration

**Files:**
- Create: `src/games/studio/StudioScene.ts`
- Create: `src/games/studio/index.ts`
- Modify: `src/engine/GameEngine.ts`
- Modify: `src/games/menu/MenuScene.ts`
- Create: `tests/studio_integration.test.ts`

**Interfaces:**
- Consumes: `StickerLogic`, `StickerRenderer`, `ColoringLogic`, `ColoringRenderer`, `VoiceNarrator`, `SoundEngine`, `DisplayManager`.
- Produces:
  - `StudioScene`: full scene lifecycle (`enter`, `update`, `render`, `exit`), top tab switcher, snapshot capture.
  - `GameEngine`: registers `STUDIO` key to `StudioScene`.
  - `MenuScene`: renders "🎨 Art Studio" banner button, click hit-testing navigates to `STUDIO`.

- [ ] **Step 1: Write failing integration test**

```typescript
// tests/studio_integration.test.ts
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { GameEngine } from '../src/engine/GameEngine.js';
import { StudioScene } from '../src/games/studio/StudioScene.js';

describe('Studio Scene Integration', () => {
  it('GameEngine registers STUDIO scene', () => {
    const canvas = {
      getContext: () => ({}),
      addEventListener: () => {},
      removeEventListener: () => {},
      width: 960,
      height: 540,
      style: {}
    } as any;
    const engine = new GameEngine(canvas);
    const studio = engine.getScene('STUDIO');
    assert.ok(studio instanceof StudioScene);
  });

  it('StudioScene switches between sticker and coloring tabs', () => {
    const engine = {} as any;
    const studio = new StudioScene(engine);
    assert.equal(studio.activeTab, 'stickers');
    studio.switchTab('coloring');
    assert.equal(studio.activeTab, 'coloring');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `$env:__TSX_ACTIVE__="1"; npx tsx --test tests/studio_integration.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement StudioScene and wire up GameEngine & MenuScene**

- `StudioScene.ts`: renders top tab bar, back button, camera snapshot button, dustbin/squeegee, coordinates active delegate (`StickerLogic` vs `ColoringLogic`), ducks BGM for voice prompts.
- `GameEngine.ts`: register `STUDIO` with `new StudioScene(this)`.
- `MenuScene.ts`: add "🎨 Art Studio" banner at header with wobble animation and tap navigation.

- [ ] **Step 4: Run test to verify it passes**

Run: `$env:__TSX_ACTIVE__="1"; npx tsx --test tests/studio_integration.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/games/studio/ src/engine/GameEngine.ts src/games/menu/MenuScene.ts tests/studio_integration.test.ts
git commit -m "feat(studio): integrate StudioScene into GameEngine and Main Menu"
```

---

### Task 5: Quality Gates, E2E Runner, Production Build & Deployment

**Files:**
- Modify: `tests/e2e_runner.mjs`
- Build: `dist/`

- [ ] **Step 1: Integrate new tests into `tests/e2e_runner.mjs`**
Add `Studio Foundation`, `Sticker World`, `Coloring Book`, and `Studio Integration` test suites to `tests/e2e_runner.mjs`.

- [ ] **Step 2: Run full test suite and verify 100% pass**
Run: `$env:__TSX_ACTIVE__="1"; npx tsx tests/e2e_runner.mjs`
Expected: ALL tests PASS.

- [ ] **Step 3: Run TypeScript compiler check**
Run: `npx tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 4: Run production build**
Run: `npm run build`
Expected: Vite build succeeds, service worker precache generated.

- [ ] **Step 5: Commit and Deploy to GitHub Pages**
```bash
git add .
git commit -m "feat: complete Creative Art Studio with Sticker Album and Coloring Book"
npm run deploy
```
Expected: Published to GitHub Pages successfully.
