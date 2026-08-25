# Design Spec: Mix & Match Funny Body Shuffler (Mode 9)

**Date**: 2026-08-25  
**Project**: Adventures of Trishu  
**Feature**: 9th Mini-Game — "Trishu's Mix & Match Funny Studio" (`MIX_MATCH`)

---

## 1. Overview & Goals

Introduce a new mini-game mode where players can mix, match, and shuffle character heads, torsos, and legs across all 7 main characters (Trishu, Leo, Dad, Mom, Grandpa, Mimi the Bunny, and Mrs Clucky) to create hilarious combinations.

Key goals:
- Creative freedom: Players can cycle individual parts (Head, Torso, Legs) independently with left/right touch buttons or drag swipe.
- One-tap Randomizer: Big bouncy "🎲 SHUFFLE" button that rapidly spins the parts with slot-machine sound effects.
- Interactive Reactions: Tapping the created character triggers animated dances, giggles, squawks, and particle bursts.
- Photo Booth: "📸 SNAP" button with camera shutter effect and gallery frame with funny generated names (e.g. "Grandpa Bunny Hen").
- Responsive: Seamless on portrait (9:16) and landscape (16:9) mobile and desktop displays.
- Strict Constraints: Every file < 500 lines, 100% offline PWA, 0 TypeScript errors, test suite execution < 1.0s.

---

## 2. Character Part Matrix

7 Characters decomposed into 3 distinct modular slices:

| Character | Head / Face | Torso / Outfit | Legs / Feet |
|---|---|---|---|
| **0: Trishu** | Dark twin pigtails, coral bows, rosy cheeks | Lavender dungarees, white tee | Red sneakers, striped socks |
| **1: Leo** | Short dark hair, playful grin, freckles | Blue overalls, blue tee | Green boots, short pants |
| **2: Dad** | Teal glasses, rounded jaw, friendly smile | Teal polo shirt, round belly | Dark trousers, brown shoes |
| **3: Mom** | Floral hairclip, curled eyelashes, smile | Coral dress, floral print | Red flats, neat ankles |
| **4: Grandpa** | Straw sun hat, white beard stubble | Purple gardener overalls, plaid shirt | Forest green rubber wellies |
| **5: Mimi** | White bunny head, pink inner ears, cute nose | Pink floral dress, white bib | Fluffy bunny feet, hopping paws |
| **6: Mrs Clucky** | White hen head, red comb, yellow beak | White feathered body, flapping wings | Orange chicken feet / spurs |

---

## 3. Architecture & New Components

1. **`src/graphics/characters/modularBodyParts.ts`**:
   - `drawHeadPart(ctx, characterIndex, x, y, scale, animState)`
   - `drawTorsoPart(ctx, characterIndex, x, y, scale, animState)`
   - `drawLegsPart(ctx, characterIndex, x, y, scale, animState)`
   - `drawCompositeCharacter(ctx, headIdx, torsoIdx, legsIdx, x, y, scale, animState)`

2. **`src/modes/MixMatchScene.ts`**:
   - Implements `BaseScene`
   - Manages carousel slots (`headIdx`, `torsoIdx`, `legsIdx`), shuffling animations, photo flash effect, funny title generator, and HUD controls.
   - Strictly < 500 LOC.

3. **Engine & Types Expansion**:
   - `src/types/game.ts`: Add `'MIX_MATCH'` to `GameModeId`.
   - `src/types/storage.ts`: Add `mixMatch: number` to `HighScores`.
   - `src/modes/MenuScene.ts`: Add 9th menu card with colorful icon and high score badge.
   - `src/engine/GameEngine.ts`: Wire up `MIX_MATCH` scene.

4. **Testing & Verification**:
   - `tests/smoke.test.ts`: Test `MIX_MATCH` lifecycle, part shuffling, randomizer, photo snap, and composite rendering.

---

## 4. Verification Plan

1. `npx tsc --noEmit` $\to$ 0 errors
2. `npm test` $\to$ all tests pass in < 0.05s
3. `npm run build` $\to$ clean bundle in `dist/`
4. `npm run deploy` $\to$ deployed to GitHub Pages
