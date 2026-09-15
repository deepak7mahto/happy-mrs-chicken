# Picnic Ducks Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a brand new 16th mini-game called **"Picnic Ducks"** (`DUCK_PICNIC`, slug `duck-picnic`) where players feed 3 yellow ducks (tossing bread or flinging from a picnic basket) who scamper around and perform a celebration dance once full.

**Architecture:** Pure HTML5 Canvas 2D + Web Audio synthesis within the existing *Adventures of Trishu* engine. Follows the `BaseScene` lifecycle, zero external assets, procedural vector rendering, responsive layout, and strict `< 500 LOC` per file constraint.

**Tech Stack:** TypeScript, Canvas 2D, Web Audio API, React 19, Vite.

**Spec:** `docs/superpowers/specs/2026-09-15-picnic-ducks-design.md`

## Global Constraints
- Every file in `src/` must be strictly under 500 lines of code.
- Zero copyrighted Peppa Pig character references in code (`peppaPigRenderer`, `daddyPigRenderer`, etc.).
- Zero external CDN dependencies.
- Total test suite execution must remain under 1.0s.

---

### Task 1: Character Renderer & Audio Synthesis

**Files:**
- Create: `src/graphics/characters/duckRenderer.ts`
- Modify: `src/graphics/characters/index.ts`
- Modify: `src/types/audio.ts`
- Modify: `src/engine/audio/SoundSynthesizer.ts`
- Modify: `src/engine/audio/index.ts`

- [ ] **Step 1:** Create `duckRenderer.ts` with `drawYellowDuck` procedural vector renderer.
- [ ] **Step 2:** Export `drawYellowDuck` from `src/graphics/characters/index.ts`.
- [ ] **Step 3:** Add `'duckQuack'` and `'duckFanfare'` to `SFXName` in `src/types/audio.ts`.
- [ ] **Step 4:** Implement `playDuckQuack` and `playDuckFanfare` in `SoundSynthesizer.ts` and expose through `SoundEngine`.

---

### Task 2: Game Types, Modes & Scene Scaffolding

**Files:**
- Modify: `src/types/game.ts`
- Modify: `src/types/storage.ts`
- Create: `src/games/duck-picnic/DuckPicnicScene.ts`
- Create: `src/games/duck-picnic/index.ts`
- Modify: `src/games/index.ts`
- Modify: `src/engine/GameEngine.ts`
- Modify: `src/games/menu/menuData.ts`

- [ ] **Step 1:** Add `DUCK_PICNIC` to `ActiveGameModeId`, `GameModeSlug`, and high scores in `src/types/game.ts` and `storage.ts`.
- [ ] **Step 2:** Build `DuckPicnicScene.ts` with:
  - 3 Yellow Ducks (Mama, Pip, Squeak) with distinct sizes and wander/seek AI
  - Ground tap bread toss physics
  - Picnic blanket and clickable/draggable picnic basket treat flinging
  - Immediate eating wiggle reaction, quack audio, and hunger meters (3 dots)
  - Synchronized grand duck celebration dance sequence with pirouette spins, hops, confetti, and fanfare
- [ ] **Step 3:** Export scene and register in `GameEngine.ts`.
- [ ] **Step 4:** Add 16th menu card in `menuData.ts` with duck preview rendering.

---

### Task 3: Quality Gates & Verification

**Files:**
- Modify: `tests/smoke.test.ts`

- [ ] **Step 1:** Update `smoke.test.ts` to expect 17 scenes and add test coverage for duck feeding, basket interaction, and dance triggers.
- [ ] **Step 2:** Run `npm test` and verify 100% test pass.
- [ ] **Step 3:** Run `npx tsc --noEmit` and verify 0 type errors.
- [ ] **Step 4:** Run `npm run build` to verify production bundle builds cleanly.
