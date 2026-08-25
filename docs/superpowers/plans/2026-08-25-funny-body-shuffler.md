# Mix & Match Funny Body Shuffler Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the 9th mini-game mode "Trishu's Mix & Match Funny Studio" (`MIX_MATCH`) allowing players to independently shuffle and randomize character heads, torsos, and legs with animations, sound reactions, and photo snap booth.

**Architecture:** Decompose character renderers into modular reusable body slices (`modularBodyParts.ts`), create `MixMatchScene.ts` inheriting from `BaseScene`, integrate into `GameEngine` and `MenuScene` (9-game grid), and update test coverage.

**Tech Stack:** TypeScript, React 19, Canvas 2D, Web Audio API, Vite.

**Spec:** `docs/superpowers/specs/2026-08-25-funny-body-shuffler-design.md`

## Global Constraints
- Every file in `src/` must remain strictly under 500 lines of code.
- Zero TypeScript errors (`npx tsc --noEmit`).
- Fast test execution (`npm test` < 1.0s).
- Zero external CDN dependencies (100% offline PWA).

---

### Task 1: Master Types & Storage Expansion

**Files:**
- Modify: `src/types/game.ts`
- Modify: `src/types/storage.ts`
- Modify: `src/engine/StorageManager.ts`

- [ ] **Step 1: Update `GameModeId` union with `'MIX_MATCH'`**
- [ ] **Step 2: Update `HighScores` and `StorageData` interfaces with `mixMatch: number`**
- [ ] **Step 3: Update `DEFAULT_HIGH_SCORES` in `StorageManager.ts`**
- [ ] **Step 4: Verify with `npx tsc --noEmit`**

---

### Task 2: Modular Body Parts Vector Renderer

**Files:**
- Create: `src/graphics/characters/modularBodyParts.ts`
- Modify: `src/graphics/characters/index.ts`
- Modify: `src/graphics/index.ts`

- [ ] **Step 1: Implement `drawHeadPart`, `drawTorsoPart`, `drawLegsPart` for all 7 characters**
- [ ] **Step 2: Implement `drawCompositeCharacter` with squash/stretch and wobble animations**
- [ ] **Step 3: Export from character and graphics barrels**
- [ ] **Step 4: Verify with `npx tsc --noEmit`**

---

### Task 3: MixMatchScene Mini-Game Implementation

**Files:**
- Create: `src/modes/MixMatchScene.ts`
- Modify: `src/modes/index.ts`
- Modify: `src/engine/GameEngine.ts`

- [ ] **Step 1: Implement `MixMatchScene` with carousel selectors, shuffle spin animation, photo booth flash, funny title generator, and character dance interaction**
- [ ] **Step 2: Register `MixMatchScene` in `modes/index.ts` and `GameEngine.ts`**
- [ ] **Step 3: Keep file under 500 lines**
- [ ] **Step 4: Verify with `npx tsc --noEmit`**

---

### Task 4: 9-Game Menu Scene & UI Update

**Files:**
- Modify: `src/modes/MenuScene.ts`
- Modify: `README.md`
- Modify: `PROJECT.md`

- [ ] **Step 1: Add 9th card to `MenuScene.ts` for "Mix & Match Studio"**
- [ ] **Step 2: Update documentation (README, PROJECT)**
- [ ] **Step 3: Verify menu navigation in portrait and landscape modes**

---

### Task 5: Lean Automated Tests & Verification

**Files:**
- Modify: `tests/smoke.test.ts`

- [ ] **Step 1: Add test assertions for `MIX_MATCH` scene lifecycle, modular body parts rendering, randomizer, and photo snap**
- [ ] **Step 2: Run `npm test` and verify 100% pass in < 0.05s**
- [ ] **Step 3: Verify line count limit < 500 for all files**

---

### Task 6: Production Build & GitHub Pages Deployment

- [ ] **Step 1: Run `npm run build`**
- [ ] **Step 2: Deploy to GitHub Pages with `npm run deploy`**
- [ ] **Step 3: Commit and push all changes to `origin/main`**
