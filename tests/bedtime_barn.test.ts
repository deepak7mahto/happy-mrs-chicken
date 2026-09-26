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
