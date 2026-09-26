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
