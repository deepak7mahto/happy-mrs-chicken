# Preschool Evolution & 4-Game Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand the Adventures of Trishu game suite from 16 to 20 mini-games tailored for a 3-year-old toddler, integrating a zero-dependency Web Speech voice narrator, distraction-free in-game HUD with Parental Gate, and 4 new zero-fail sandbox modes (`ANIMAL_FEEDING`, `ANIMAL_BAND`, `FINGER_PAINT`, `BEDTIME_BARN`).

**Architecture:** 
- Modular 3-tier game structure (`types.ts`, `[Game]Logic.ts`, `[Game]Renderer.ts`, `[Game]Scene.ts`) for all 4 new modes strictly under 500 lines of code.
- Native Web Speech API integration in `VoiceNarrator.ts` coupled to `SoundEngine` with automatic BGM ducking.
- In-game HUD distraction-free mode hiding secondary controls during gameplay and child-proofing settings behind a 3-second hold Parental Gate.
- Zero external CDNs; 100% offline Canvas 2D and procedural Web Audio synthesis precached via Vite + Service Worker.

**Tech Stack:** TypeScript 5.7, Vite 6.1, HTML5 Canvas 2D, Web Audio API, Web Speech API, Service Worker PWA.

## Global Constraints
- Every source file in `src/` must remain strictly under 500 lines of code (T4.02 quality gate).
- Zero external CDN network dependencies; all assets procedural or local woff2 fonts.
- Zero canvas context save/restore state leaks (`ctx.save()` must balance `ctx.restore()`).
- High scores and settings backward-compatibility: existing saves in `localStorage` must not be corrupted.
- Responsive dual orientation: portrait (9:16) and landscape (16:9) supported across all modes.

---

### Task 1: Core Preschool Engine — VoiceNarrator & Audio Recipes

**Files:**
- Create: `src/engine/audio/VoiceNarrator.ts`
- Modify: `src/types/audio.ts`
- Modify: `src/engine/audio/SoundSynthesizer.ts`
- Modify: `src/engine/audio/index.ts`
- Test: `tests/preschool_engine.test.ts`

**Interfaces:**
- Produces: `voiceNarrator: VoiceNarrator` singleton with `speak(phrase: string, options?: { pitch?: number; rate?: number }): void`, `setEnabled(val: boolean): void`, `isEnabled(): boolean`.
- Produces in `SoundSynthesizer`: `playFoodChomp()`, `playTummyRub()`, `playXylophoneChime(freq: number)`, `playDrumThump()`, `playMaracaShake()`, `playPaintSplat()`, `playMusicBoxStar(pitchIndex?: number)`, `playSleepyYawn()`.

- [ ] **Step 1: Write failing unit test for VoiceNarrator and new audio recipes**

Create `tests/preschool_engine.test.ts`:
```typescript
import { describe, it, expect } from './e2e_runner.mjs';
import { voiceNarrator } from '../src/engine/audio/VoiceNarrator';
import { soundEngine } from '../src/engine/SoundEngine';

describe('Preschool Engine: VoiceNarrator & Audio Recipes', () => {
  it('T-PE.01: VoiceNarrator initializes enabled and allows toggling', () => {
    expect(voiceNarrator.isEnabled()).toBe(true);
    voiceNarrator.setEnabled(false);
    expect(voiceNarrator.isEnabled()).toBe(false);
    voiceNarrator.setEnabled(true);
    expect(voiceNarrator.isEnabled()).toBe(true);
  });

  it('T-PE.02: VoiceNarrator.speak executes without throwing and ducks BGM', () => {
    expect(() => {
      voiceNarrator.speak('Let us feed the animals!');
    }).not.toThrow();
  });

  it('T-PE.03: soundEngine synthesizes all 8 preschool sound recipes without throwing', () => {
    expect(() => {
      soundEngine.playSFX('foodChomp' as any);
      soundEngine.playSFX('tummyRub' as any);
      soundEngine.playSFX('xylophoneChime' as any);
      soundEngine.playSFX('drumThump' as any);
      soundEngine.playSFX('maracaShake' as any);
      soundEngine.playSFX('paintSplat' as any);
      soundEngine.playSFX('musicBoxStar' as any);
      soundEngine.playSFX('sleepyYawn' as any);
    }).not.toThrow();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `$env:__TSX_ACTIVE__="1"; npx tsx tests/e2e_runner.mjs --filter="Preschool Engine"`
Expected: FAIL due to missing `VoiceNarrator.ts` and missing audio recipes.

- [ ] **Step 3: Implement `src/types/audio.ts` update**

Add the 8 new preschool SFX names to `SFXName`:
```typescript
export type SFXName =
  | 'cluck'
  | 'eggPop'
  | 'hatch'
  | 'splash'
  | 'click'
  | 'fanfare'
  | 'crack'
  | 'whoosh'
  | 'sizzle'
  | 'bounce'
  | 'rooster'
  | 'pigOink'
  | 'dinoRoar'
  | 'veggiePop'
  | 'bubblePop'
  | 'bunnySqueak'
  | 'mudThud'
  | 'toddlerGiggle'
  | 'duckQuack'
  | 'duckFanfare'
  | 'trainWhistle'
  | 'waterHoseSpray'
  | 'coneMunch'
  | 'dinoBite'
  | 'foodChomp'
  | 'tummyRub'
  | 'xylophoneChime'
  | 'drumThump'
  | 'maracaShake'
  | 'paintSplat'
  | 'musicBoxStar'
  | 'sleepyYawn';
```

- [ ] **Step 4: Implement `src/engine/audio/VoiceNarrator.ts`**

```typescript
/**
 * Zero-Dependency Spoken Voice Narrator
 * Uses native Web Speech API (window.speechSynthesis)
 * Adventures of Trishu Preschool Suite
 * Strictly under 500 lines
 */

import { soundEngine } from './index';

export class VoiceNarrator {
  private enabled: boolean = true;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      // Warm up synthesis if available
      window.speechSynthesis.getVoices?.();
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public setEnabled(val: boolean): void {
    this.enabled = val;
    if (!val && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // Safe fallback
      }
    }
  }

  public speak(phrase: string, options: { pitch?: number; rate?: number; volume?: number } = {}): void {
    if (!this.enabled || !phrase) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(phrase);
      utterance.pitch = options.pitch ?? 1.15;
      utterance.rate = options.rate ?? 0.92;
      utterance.volume = options.volume ?? soundEngine.getSfxVolume();

      // Duck BGM while speaking
      soundEngine.duckBGM(0.35);

      utterance.onend = () => {
        soundEngine.duckBGM(1.0);
        this.currentUtterance = null;
      };

      utterance.onerror = () => {
        soundEngine.duckBGM(1.0);
        this.currentUtterance = null;
      };

      this.currentUtterance = utterance;
      window.speechSynthesis.speak(utterance);
    } catch {
      soundEngine.duckBGM(1.0);
    }
  }

  public stop(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // Safe fallback
      }
    }
    soundEngine.duckBGM(1.0);
  }
}

export const voiceNarrator = new VoiceNarrator();
```

- [ ] **Step 5: Implement 8 new sound recipes in `src/engine/audio/SoundSynthesizer.ts`**

Add recipes:
- `playFoodChomp()`: Two quick triangle bites (750 Hz to 240 Hz) and lowpass thud.
- `playTummyRub()`: 110 Hz FM modulated sine wave wobble.
- `playXylophoneChime(freq = 523.2)`: High-Q bandpass sine ping with exponential decay.
- `playDrumThump()`: Punchy 160 Hz -> 42 Hz pitch sweep + white noise attack.
- `playMaracaShake()`: Filtered 3600 Hz highpass pink noise burst (80ms).
- `playPaintSplat()`: 620 Hz -> 140 Hz liquid bubble pop.
- `playMusicBoxStar(pitchIndex = 0)`: Crystalline pure sine tone (880 Hz, 1046 Hz, 1318 Hz).
- `playSleepyYawn()`: 320 Hz -> 180 Hz gentle descending sine sweep + breathy filter.

Dispatch all 8 recipes from `SoundEngine.playSFX`.

- [ ] **Step 6: Run test to verify it passes**

Run: `$env:__TSX_ACTIVE__="1"; npx tsx tests/e2e_runner.mjs --filter="Preschool Engine"`
Expected: PASS (all 3 tests pass in < 5ms).

- [ ] **Step 7: Commit**

```bash
git add src/types/audio.ts src/engine/audio/VoiceNarrator.ts src/engine/audio/SoundSynthesizer.ts src/engine/audio/index.ts tests/preschool_engine.test.ts
git commit -m "feat(audio): add VoiceNarrator and 8 preschool Web Audio procedural recipes"
```

---

### Task 2: Distraction-Free In-Game HUD, Parental Gate & Edge Palm Rejection

**Files:**
- Modify: `src/ui/HUD.ts`
- Modify: `src/ui/SettingsModal.ts`
- Modify: `src/engine/InputManager.ts`
- Modify: `src/styles/hud.css`
- Test: `tests/hud_preschool.test.ts`

**Interfaces:**
- `HUD.ts`: In game mode (`modeId !== 'MENU'`), automatically hide `#hud-btn-avatar`, `#hud-btn-settings`, `#hud-btn-fs`, `#hud-btn-audio`. Only show `#hud-btn-home` with Toddler Lock.
- `SettingsModal.ts`: Add Parental Gate requiring 3-second hold before exposing volume controls & score reset. Add `Voice Narrator` toggle.
- `InputManager.ts`: Filter out static pointer touches within 18px of canvas edges (`isBezelContact`).

- [ ] **Step 1: Write failing test for Distraction-Free HUD and Parental Gate**

Create `tests/hud_preschool.test.ts`:
```typescript
import { describe, it, expect } from './e2e_runner.mjs';
import { GameEngine } from '../src/engine/GameEngine';
import { HUD } from '../src/ui/HUD';
import { SettingsModal } from '../src/ui/SettingsModal';

describe('Preschool UI: Distraction-Free HUD & Parental Gate', () => {
  it('T-PHUD.01: In-game HUD hides settings, avatar, fullscreen, and audio buttons', () => {
    const engine = new GameEngine();
    const hud = new HUD(engine, {
      onGoHome: () => {},
      onToggleMute: () => {},
      onToggleFullscreen: () => {},
      onOpenSettings: () => {},
      onOpenAvatarSelect: () => {},
      onOpenPassport: () => {},
      onOpenInstall: () => {}
    });

    hud.updateMode('EGG_LAYING');
    const settingsBtn = (hud as any).el.querySelector('#hud-btn-settings');
    expect(settingsBtn).toBeNull();

    const homeBtn = (hud as any).el.querySelector('#hud-btn-home');
    expect(homeBtn).not.toBeNull();
  });

  it('T-PHUD.02: SettingsModal exposes Parental Gate state', () => {
    const modal = new SettingsModal();
    expect(typeof (modal as any).isUnlocked).toBe('boolean');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `$env:__TSX_ACTIVE__="1"; npx tsx tests/e2e_runner.mjs --filter="Preschool UI"`
Expected: FAIL due to settings button still being rendered in game mode.

- [ ] **Step 3: Update `src/ui/HUD.ts`**

In `render()` of `HUD.ts`:
Condition the rendering of `#hud-btn-avatar`, `#hud-btn-settings`, `#hud-btn-fs`, and `#hud-btn-audio` to `isMenu ? ... : ''`.
When in active mini-game mode, ONLY the `hud-home-wrapper` with `#hud-btn-home` is rendered on the top bar!

- [ ] **Step 4: Update `src/ui/SettingsModal.ts`**

Add Parental Gate:
```typescript
export class SettingsModal {
  public isUnlocked: boolean = false;
  // ...
  // When opened, if !isUnlocked: show "Grown-ups only! Hold 3s to open 🔒"
  // After 3-second hold, isUnlocked = true and full settings are displayed.
}
```
Add Voice Narrator toggle row in `SettingsModal`:
```typescript
<div class="settings-row settings-toggle-row">
  <span class="settings-toggle-label">🗣️ Spoken Voice Prompts</span>
  <button type="button" class="settings-toggle-btn ${voiceEnabled ? 'active' : ''}" id="toggle-voice">
    ${voiceEnabled ? 'ON ✅' : 'OFF ❌'}
  </button>
</div>
```

- [ ] **Step 5: Update `src/engine/InputManager.ts`**

In `_onPointerDown(e: PointerEvent)`:
```typescript
// Edge palm rejection: ignore touches within 18px of bezel
const isBezelContact = (
  e.clientX < 18 ||
  e.clientX > window.innerWidth - 18 ||
  e.clientY < 18 ||
  e.clientY > window.innerHeight - 18
);
if (isBezelContact && !e.isPrimary) {
  return;
}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `$env:__TSX_ACTIVE__="1"; npx tsx tests/e2e_runner.mjs --filter="Preschool UI"`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/ui/HUD.ts src/ui/SettingsModal.ts src/engine/InputManager.ts tests/hud_preschool.test.ts
git commit -m "feat(ui): implement distraction-free in-game HUD, parental gate, and edge palm rejection"
```

---

### Task 3: Mode 17: Hungry Farmyard Friends (`ANIMAL_FEEDING`)

**Files:**
- Create: `src/games/animal-feeding/types.ts`
- Create: `src/games/animal-feeding/AnimalFeedingLogic.ts`
- Create: `src/games/animal-feeding/AnimalFeedingRenderer.ts`
- Create: `src/games/animal-feeding/AnimalFeedingScene.ts`
- Create: `src/games/animal-feeding/index.ts`
- Test: `tests/animal_feeding.test.ts`

**Interfaces:**
- `AnimalFeedingLogic`: Manages 3 seated animals (`leo`, `clucky`, `mimi`), 5 snack items (`CARROT`, `WATERMELON`, `APPLE`, `COOKIE`, `BERRY`), parabolic flight physics, mouth opening detection, chewing timer, crumb particles, tummy rub celebrations.
- `AnimalFeedingScene`: Connects touch inputs, launches food on tap/drag, invokes `soundEngine.playSFX('foodChomp')`, `voiceNarrator.speak('Yummy!')`.

- [ ] **Step 1: Write failing test for AnimalFeedingLogic**

Create `tests/animal_feeding.test.ts`:
```typescript
import { describe, it, expect } from './e2e_runner.mjs';
import { AnimalFeedingLogic } from '../src/games/animal-feeding/AnimalFeedingLogic';

describe('Mode 17: Hungry Farmyard Friends Logic', () => {
  it('T17.01: Initializes with 3 hungry animals and 5 snacks', () => {
    const logic = new AnimalFeedingLogic();
    logic.reset(960, 540);
    expect(logic.animals.length).toBe(3);
    expect(logic.snacks.length).toBe(5);
    expect(logic.totalFed).toBe(0);
  });

  it('T17.02: Tapping snack launches food flight toward targeted animal', () => {
    const logic = new AnimalFeedingLogic();
    logic.reset(960, 540);
    const launched = logic.launchSnack(0, 1); // Launch snack 0 to animal 1
    expect(launched).toBe(true);
    expect(logic.activeFlyingFood.length).toBe(1);
  });

  it('T17.03: Food arrival triggers chomp, increments score and totalFed', () => {
    const logic = new AnimalFeedingLogic();
    logic.reset(960, 540);
    logic.launchSnack(0, 0);
    // Simulate flight completion
    logic.update(1.0);
    expect(logic.totalFed).toBe(1);
    expect(logic.score).toBeGreaterThanOrEqual(25);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `$env:__TSX_ACTIVE__="1"; npx tsx tests/e2e_runner.mjs --filter="Mode 17"`
Expected: FAIL due to missing files.

- [ ] **Step 3: Implement `src/games/animal-feeding/types.ts`**

Define types for `SnackType`, `SnackItem`, `SeatedAnimal`, `FlyingFood`, and `AnimalFeedingState`.

- [ ] **Step 4: Implement `src/games/animal-feeding/AnimalFeedingLogic.ts`**

Headless simulation of snack launch, trajectory calculation, mouth opening, munching timer, and tummy rub reward.

- [ ] **Step 5: Implement `src/games/animal-feeding/AnimalFeedingRenderer.ts`**

Pure Canvas 2D vector renderer with table, wooden tray, food snacks, seated animals, mouth chewing, and crumb particles.

- [ ] **Step 6: Implement `src/games/animal-feeding/AnimalFeedingScene.ts` and `index.ts`**

Scene coordinator under 200 lines wired to `soundEngine`, `voiceNarrator`, and touch inputs.

- [ ] **Step 7: Run test to verify it passes**

Run: `$env:__TSX_ACTIVE__="1"; npx tsx tests/e2e_runner.mjs --filter="Mode 17"`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/games/animal-feeding/ tests/animal_feeding.test.ts
git commit -m "feat(mode17): implement Hungry Farmyard Friends mini-game"
```

---

### Task 4: Mode 18: Farmyard Animal Band (`ANIMAL_BAND`)

**Files:**
- Create: `src/games/animal-band/types.ts`
- Create: `src/games/animal-band/AnimalBandLogic.ts`
- Create: `src/games/animal-band/AnimalBandRenderer.ts`
- Create: `src/games/animal-band/AnimalBandScene.ts`
- Create: `src/games/animal-band/index.ts`
- Test: `tests/animal_band.test.ts`

**Interfaces:**
- `AnimalBandLogic`: 5 band members (`clucky_xylophone`, `dino_drums`, `mimi_maracas`, `duck_accordion`, `dad_bass`), C-major pentatonic scale frequencies, bounce animations, tutti ensemble chorus.
- `AnimalBandScene`: Instant multi-touch chord playing, dancing hops, musical note particles.

- [ ] **Step 1: Write failing test for AnimalBandLogic**

Create `tests/animal_band.test.ts`:
```typescript
import { describe, it, expect } from './e2e_runner.mjs';
import { AnimalBandLogic } from '../src/games/animal-band/AnimalBandLogic';

describe('Mode 18: Farmyard Animal Band Logic', () => {
  it('T18.01: Initializes 5 animal band members with pentatonic instruments', () => {
    const logic = new AnimalBandLogic();
    logic.reset(960, 540);
    expect(logic.members.length).toBe(5);
    expect(logic.tuttiTimer).toBe(0);
  });

  it('T18.02: Tapping a member triggers hop, note pitch, and score', () => {
    const logic = new AnimalBandLogic();
    logic.reset(960, 540);
    const result = logic.playMember(0);
    expect(result.played).toBe(true);
    expect(result.pitch).toBeCloseTo(523.25, 1);
    expect(logic.members[0].isBouncing).toBe(true);
  });

  it('T18.03: Triggering Tutti activates full band chorus dance', () => {
    const logic = new AnimalBandLogic();
    logic.reset(960, 540);
    logic.triggerTutti();
    expect(logic.isTuttiActive).toBe(true);
    expect(logic.score).toBeGreaterThanOrEqual(50);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `$env:__TSX_ACTIVE__="1"; npx tsx tests/e2e_runner.mjs --filter="Mode 18"`
Expected: FAIL due to missing files.

- [ ] **Step 3: Implement `src/games/animal-band/types.ts`**

Define `BandMemberId`, `InstrumentType`, `BandMember`, `PentatonicNote`.

- [ ] **Step 4: Implement `src/games/animal-band/AnimalBandLogic.ts`**

Pentatonic frequency mapping (`[523.25, 587.33, 659.25, 783.99, 880.00]`), member bounce physics, and tutti timer.

- [ ] **Step 5: Implement `src/games/animal-band/AnimalBandRenderer.ts`**

Stage spotlights, wooden planks, animal band characters with instruments, floating music note glyphs.

- [ ] **Step 6: Implement `src/games/animal-band/AnimalBandScene.ts` and `index.ts`**

Dispatches `xylophoneChime`, `drumThump`, `maracaShake`, `duckQuack`, and chord harmonies on touch.

- [ ] **Step 7: Run test to verify it passes**

Run: `$env:__TSX_ACTIVE__="1"; npx tsx tests/e2e_runner.mjs --filter="Mode 18"`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/games/animal-band/ tests/animal_band.test.ts
git commit -m "feat(mode18): implement Farmyard Animal Band mini-game"
```

---

### Task 5: Mode 19: Rainbow Splat & Stamp Studio (`FINGER_PAINT`)

**Files:**
- Create: `src/games/finger-paint/types.ts`
- Create: `src/games/finger-paint/FingerPaintLogic.ts`
- Create: `src/games/finger-paint/FingerPaintRenderer.ts`
- Create: `src/games/finger-paint/FingerPaintScene.ts`
- Create: `src/games/finger-paint/index.ts`
- Test: `tests/finger_paint.test.ts`

**Interfaces:**
- `FingerPaintLogic`: Manages canvas paint strokes, wet color splotches, stamp placements (`PAW`, `STAR`, `HEART`), active color selection, and rubber duck squeegee wipe animation.
- `FingerPaintScene`: Continuous touch drawing, squishy splat sound effects, and sticker photo album persistence.

- [ ] **Step 1: Write failing test for FingerPaintLogic**

Create `tests/finger_paint.test.ts`:
```typescript
import { describe, it, expect } from './e2e_runner.mjs';
import { FingerPaintLogic } from '../src/games/finger-paint/FingerPaintLogic';

describe('Mode 19: Rainbow Splat & Stamp Studio Logic', () => {
  it('T19.01: Initializes with clean canvas and 5 color pots', () => {
    const logic = new FingerPaintLogic();
    logic.reset(960, 540);
    expect(logic.splats.length).toBe(0);
    expect(logic.colorPots.length).toBe(5);
    expect(logic.activeTool).toBe('SPLAT');
  });

  it('T19.02: Adding splat records position, color, and size', () => {
    const logic = new FingerPaintLogic();
    logic.reset(960, 540);
    logic.addSplat(200, 300);
    expect(logic.splats.length).toBe(1);
    expect(logic.splats[0].x).toBe(200);
    expect(logic.splats[0].y).toBe(300);
  });

  it('T19.03: Squeegee wipe clears splats and triggers bubbles', () => {
    const logic = new FingerPaintLogic();
    logic.reset(960, 540);
    logic.addSplat(100, 100);
    logic.triggerSqueegee();
    expect(logic.isSqueegeeActive).toBe(true);
    logic.update(1.5);
    expect(logic.splats.length).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `$env:__TSX_ACTIVE__="1"; npx tsx tests/e2e_runner.mjs --filter="Mode 19"`
Expected: FAIL.

- [ ] **Step 3: Implement `src/games/finger-paint/types.ts`**

Define `PaintColor`, `PaintSplatItem`, `PaintStroke`, `StampType`, `FingerPaintTool`.

- [ ] **Step 4: Implement `src/games/finger-paint/FingerPaintLogic.ts`**

Logic for splats, drag trails, stamps, tool selection, and squeegee progress.

- [ ] **Step 5: Implement `src/games/finger-paint/FingerPaintRenderer.ts`**

Easel border, paper texture, vibrant splatters with drip circles, stamp vector shapes, color jars, rubber duck squeegee.

- [ ] **Step 6: Implement `src/games/finger-paint/FingerPaintScene.ts` and `index.ts`**

Integrates pointer moves, taps, `paintSplat` and `bubblePop` sound effects.

- [ ] **Step 7: Run test to verify it passes**

Run: `$env:__TSX_ACTIVE__="1"; npx tsx tests/e2e_runner.mjs --filter="Mode 19"`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/games/finger-paint/ tests/finger_paint.test.ts
git commit -m "feat(mode19): implement Rainbow Splat & Stamp Studio mini-game"
```

---

### Task 6: Mode 20: Sleepy Bedtime Barn (`BEDTIME_BARN`)

**Files:**
- Create: `src/games/bedtime-barn/types.ts`
- Create: `src/games/bedtime-barn/BedtimeBarnLogic.ts`
- Create: `src/games/bedtime-barn/BedtimeBarnRenderer.ts`
- Create: `src/games/bedtime-barn/BedtimeBarnScene.ts`
- Create: `src/games/bedtime-barn/index.ts`
- Test: `tests/bedtime_barn.test.ts`

**Interfaces:**
- `BedtimeBarnLogic`: 4 cozy animal stalls, drifting twinkle stars, star jar counter, tuck-in quilt state, smiling moon, bedtime lullaby motif.
- `BedtimeBarnScene`: Gentle music box chimes on star taps, soft snores on animal taps, stardust particles.

- [ ] **Step 1: Write failing test for BedtimeBarnLogic**

Create `tests/bedtime_barn.test.ts`:
```typescript
import { describe, it, expect } from './e2e_runner.mjs';
import { BedtimeBarnLogic } from '../src/games/bedtime-barn/BedtimeBarnLogic';

describe('Mode 20: Sleepy Bedtime Barn Logic', () => {
  it('T20.01: Initializes 4 sleepy animal stalls and drifting stars', () => {
    const logic = new BedtimeBarnLogic();
    logic.reset(960, 540);
    expect(logic.stalls.length).toBe(4);
    expect(logic.stars.length).toBeGreaterThanOrEqual(4);
    expect(logic.starsCollected).toBe(0);
  });

  it('T20.02: Tapping an animal stall tucks them in and dims lantern', () => {
    const logic = new BedtimeBarnLogic();
    logic.reset(960, 540);
    const result = logic.tuckInAnimal(0);
    expect(result.tucked).toBe(true);
    expect(logic.stalls[0].isAsleep).toBe(true);
  });

  it('T20.03: Catching star adds to jar and emits chime pitch', () => {
    const logic = new BedtimeBarnLogic();
    logic.reset(960, 540);
    const star = logic.stars[0];
    const caught = logic.catchStar(star.id);
    expect(caught).toBe(true);
    expect(logic.starsCollected).toBe(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `$env:__TSX_ACTIVE__="1"; npx tsx tests/e2e_runner.mjs --filter="Mode 20"`
Expected: FAIL.

- [ ] **Step 3: Implement `src/games/bedtime-barn/types.ts`**

Define `SleepyStall`, `DriftingStar`, `MoonState`, `BedtimeState`.

- [ ] **Step 4: Implement `src/games/bedtime-barn/BedtimeBarnLogic.ts`**

Star floating motion, tuck-in state machine, lantern glow, moon winks, and stars jar score.

- [ ] **Step 5: Implement `src/games/bedtime-barn/BedtimeBarnRenderer.ts`**

Twilight sky gradient, crescent moon, hay stalls with patchwork quilts, glowing lanterns, and soft `Zzz` bubbles.

- [ ] **Step 6: Implement `src/games/bedtime-barn/BedtimeBarnScene.ts` and `index.ts`**

Integrates `musicBoxStar` chimes, `sleepyYawn`, gentle BGM ducking, and `voiceNarrator.speak('Night-night!')`.

- [ ] **Step 7: Run test to verify it passes**

Run: `$env:__TSX_ACTIVE__="1"; npx tsx tests/e2e_runner.mjs --filter="Mode 20"`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/games/bedtime-barn/ tests/bedtime_barn.test.ts
git commit -m "feat(mode20): implement Sleepy Bedtime Barn mini-game"
```

---

### Task 7: Master Suite Integration & Menu / Storage Expansion (20 Games)

**Files:**
- Modify: `src/types/game.ts`
- Modify: `src/types/storage.ts`
- Modify: `src/engine/GameEngine.ts`
- Modify: `src/games/menu/menuData.ts`
- Modify: `src/games/menu/menuGridRenderer.ts`
- Modify: `tests/smoke.test.ts`
- Modify: `tests/game_features.test.ts`
- Modify: `tests/e2e_runner.mjs`

**Interfaces:**
- `GAME_MODES_LIST` contains 20 modes:
  `EGG_LAYING`, `MUDDY_PUDDLES`, `CHICK_MAZE`, `DADDY_PIG`, `DINOSAUR_BALLOON`, `PANCAKE_FLIPPER`, `VEGETABLE_HARVEST`, `HOPSCOTCH_BUBBLE`, `MIX_MATCH`, `PEEK_A_BOO`, `ICE_CREAM_VAN`, `LITTLE_TRAIN`, `CAR_WASH`, `WINDY_KITE`, `RAINBOW_GARDEN`, `DUCK_PICNIC`, `ANIMAL_FEEDING`, `ANIMAL_BAND`, `FINGER_PAINT`, `BEDTIME_BARN`.
- Menu card grid formats all 20 cards responsively: 4 columns × 5 rows in landscape, 2 columns × 10 rows in portrait.

- [ ] **Step 1: Update `src/types/game.ts`**

Add `'ANIMAL_FEEDING' | 'ANIMAL_BAND' | 'FINGER_PAINT' | 'BEDTIME_BARN'` to `ActiveGameModeId` and slugs `hungry-friends`, `animal-band`, `splat-stamp`, `sleepy-barn`.

- [ ] **Step 2: Update `src/types/storage.ts` and `src/engine/StorageManager.ts`**

Add `animalFeeding`, `animalBand`, `fingerPaint`, `bedtimeBarn` to `HighScores` schema with fallback defaults.

- [ ] **Step 3: Register all 4 new scenes in `src/engine/GameEngine.ts`**

Import and instantiate `AnimalFeedingScene`, `AnimalBandScene`, `FingerPaintScene`, and `BedtimeBarnScene` in `initScenes()`.

- [ ] **Step 4: Update `src/games/menu/menuData.ts` and `menuGridRenderer.ts`**

Add 4 new 3D toy button card definitions with custom pastel badges and character spotlights.

- [ ] **Step 5: Update tests in `tests/smoke.test.ts` and `tests/e2e_runner.mjs`**

Verify that `GameEngine.modesAvailable` returns all 20 mode IDs and all 20 mini-games render without errors or canvas leaks.

- [ ] **Step 6: Run full test suite**

Run: `$env:__TSX_ACTIVE__="1"; npx tsx tests/e2e_runner.mjs`
Expected: ALL tests PASS (target: 95+ passing tests).

- [ ] **Step 7: Commit**

```bash
git add src/types/game.ts src/types/storage.ts src/engine/GameEngine.ts src/games/menu/ tests/
git commit -m "feat(suite): integrate 20-game preschool roster with updated menu and storage"
```

---

### Task 8: Quality Gates, Production Build & Deployment

**Files:**
- Modify: `scripts/generate-sw.mjs` (sync precache manifest)
- Verify: `dist/sw.js`, `dist/index.html`

- [ ] **Step 1: Verify TypeScript clean compile**

Run: `npx tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 2: Verify File Length Quality Gate (<500 LOC per file)**

Run: `node -e "const fs = require('fs'); const check = (dir) => fs.readdirSync(dir, {withFileTypes: true}).forEach(d => { const p = dir + '/' + d.name; if(d.isDirectory()) check(p); else if(p.endsWith('.ts') && fs.readFileSync(p, 'utf8').split('\n').length > 500) console.error('OVER 500 LOC:', p); }); check('src'); console.log('Checked all files for 500 LOC gate.');"`
Expected: Clean pass with 0 files over 500 LOC.

- [ ] **Step 3: Build production bundle & service worker precache**

Run: `npm run build`
Expected: Vite bundle builds cleanly, `scripts/generate-sw.mjs` writes updated asset hashes to `dist/sw.js`.

- [ ] **Step 4: Deploy to GitHub Pages**

Run: `npm run deploy`
Expected: `dist` branch published to GitHub Pages.

- [ ] **Step 5: Final Git commit & status check**

```bash
git status
git commit -am "chore(release): complete preschool evolution suite with 20 mini-games and deploy"
```
