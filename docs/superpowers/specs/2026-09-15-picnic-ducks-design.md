# Design Spec: Picnic Ducks Feeding & Celebration Dance (Mode 16)

**Date**: 2026-09-15  
**Project**: Adventures of Trishu  
**Feature**: 16th Mini-Game — "Picnic Ducks" (`DUCK_PICNIC`, slug: `duck-picnic`)

---

## 1. Overview & Inspiration

Inspired by the beloved *Peppa Pig* episode "The Picnic", where the family has a picnic on a hill and three hungry ducks waddle over for bread.

This mini-game combines all three gameplay preferences:
1. **Interactive Ground Tapping**: Tapping or clicking anywhere tosses bread crumbs that arc, land, and bounce on the picnic grass.
2. **Picnic Basket Treat Flinging**: Tapping or swiping the checkered picnic blanket basket flings premium treats (cake slices, strawberries, golden crusts) across the screen with sparkle trails.
3. **3 Running Yellow Ducks**: Three distinct yellow ducks (Mama Ducky, Pip, and Baby Squeak) with scampering AI, waddling feet, bobbing heads, and hunger meters.
4. **Immediate Reactions**: Whenever any duck reaches and gulps a treat, it does an immediate happy wiggle with a cute quack and floating heart/star score popup (`✨ Nom! +15`).
5. **The Grand Celebration Duck Dance**: Once all three ducks reach full bellies (3 treats each), they honk an energetic fanfare, gather on the picnic blanket, and perform a synchronized 360° spin, wing-flapping, rhythmic bouncy duck dance with confetti and music!

---

## 2. Duck Characters & Visuals

The duck trio features procedural vector rendering in `src/graphics/characters/duckRenderer.ts`:

| Duck | Size / Scale | Personality / Appearance | Pitch |
|---|---|---|---|
| **Mama Ducky** | Scale 1.15 | Calm, protective, cute little daisy/feather tuft | Low Quack (380 Hz) |
| **Pip** | Scale 0.95 | Energetic, speedy scrambler, inquisitive eyes | Mid Quack (520 Hz) |
| **Baby Squeak**| Scale 0.75 | Tiny, bouncy, rapid flutter wings, rosy cheeks | High Peep/Quack (740 Hz) |

### Visual Design Elements
- **Body**: Chubby golden-yellow oval body (`#FFD54F`), warm plumage shading (`#FFCA28`).
- **Head & Beak**: Rounded head, rounded bright orange bill (`#FF9800`) with pecking mouth animation.
- **Wings & Feet**: Wing flap rotations during run and dance; orange webbed feet (`#F57C00`) with walking pivot.
- **Animations**:
  - `walkCycle`: Alternating foot steps and gentle body rocking.
  - `peckTimer`: Lowers head to grab food from ground.
  - `wiggleTimer`: Rapid side-to-side belly shake after eating.
  - `dancePhase`: Choreographed jumping, 360° spin rotation, and synchronous wing flapping.
- **Picnic Scene Setting**:
  - Rolling green grassy hills (`#81C784` and `#66BB6A`).
  - Gingham red-and-white checkered picnic mat (`#EF5350` and `#FFFFFF`).
  - Woven wicker picnic basket with handle and checkered cloth lid.
  - Scenic blue pond in the upper-right corner with floating lily pads and reeds.
  - Fluffy storybook clouds drifting gently across a bright blue sky (`#81D4FA`).

---

## 3. Gameplay Mechanics & State Flow

### Food Entities (`PicnicFoodEntity`)
- `x, y, vx, vy, z, vz, groundY`: Parabolic arc physics with bounce damping.
- `type`: `'BREAD_CRUMB' | 'GOLDEN_CRUST' | 'STRAWBERRY' | 'CAKE_SLICE'`.
- `points`: 10 to 30 points.
- `eaten`: Disappears into particle burst on duck consumption.

### Duck AI States (`DuckEntity`)
- **WANDERING**: Waddle around randomly on the grass, occasionally pausing to quack or peck the grass.
- **SEEKING_FOOD**: Targets the nearest food item within sensing range, turns facing direction, and scampers toward it at high speed.
- **EATING**: Pecks food, displays heart reaction bubble, plays quack sound, triggers belly wiggle.
- **CELEBRATING / DANCING**: Runs to picnic blanket center formation, executes synchronized 4-second dance routine with spins, leaps, and wing flaps.

### Round & Progression Loop
1. **Feeding Phase**: All 3 ducks roam with 0/3 food in belly meters.
2. **Player Action**: Tap ground to toss bread, or tap/fling picnic basket to release bonus picnic treats.
3. **Belly Meters**: 3 mini bread icons hover above each duck showing progress (0/3 $\to$ 3/3).
4. **Grand Duck Dance**: Triggered when all 3 ducks reach 3/3.
   - Camera focuses slightly on blanket.
   - Ducks dance in sync for ~4 seconds with fanfare and particle burst.
   - Score popup: `🎉 DUCK DANCE FEAST! +150`.
5. **Next Wave**: Round increments, hunger meters reset with a burst of confetti, and ducks joyfully scatter to start the next picnic round!

---

## 4. Audio Engine Integration

In `src/engine/audio/SoundSynthesizer.ts`:
- Add `playDuckQuack(pitch?: number)`:
  - Formant synthesized dual-oscillator triangle + bandpass filter (sweep 400Hz to 600Hz down to 300Hz with fast envelope) producing an instantly recognizable, authentic cartoon duck quack.
- Add `playDuckDanceFanfare()`:
  - Upbeat bouncy arpeggio with rhythmic quack pulses celebrating the completion of the dance.

---

## 5. Architectural Components & Strict Constraints

1. **Strict Line Count**:
   - `src/graphics/characters/duckRenderer.ts` < 150 LOC.
   - `src/games/duck-picnic/DuckPicnicScene.ts` < 400 LOC.
   - All files strictly < 500 LOC (meets test rule T4.02).
2. **Zero Copyright Violations**:
   - Uses original yellow ducks (Mama Ducky, Pip, Squeak) in the Adventures of Trishu art style (meets test rule T4.04).
3. **Zero External CDN Dependencies**:
   - 100% vector canvas and Web Audio synthesis (meets test rule T4.03).
4. **Scene & Mode Registry**:
   - Register `DUCK_PICNIC` in `src/types/game.ts` (total 16 mini-game modes).
   - Register in `src/types/storage.ts` (`duckPicnic: number`).
   - Register 16th card in `src/games/menu/menuData.ts`.
   - Wire into `src/engine/GameEngine.ts`.
5. **Testing**:
   - Update `tests/smoke.test.ts` to verify 17 scenes (MENU + 16 games) and duck picnic mechanics.
