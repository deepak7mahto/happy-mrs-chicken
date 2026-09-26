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
    const launched = logic.launchSnack(0, 1);
    expect(launched).toBe(true);
    expect(logic.activeFlyingFood.length).toBe(1);
  });

  it('T17.03: Food arrival triggers chomp, increments score and totalFed', () => {
    const logic = new AnimalFeedingLogic();
    logic.reset(960, 540);
    logic.launchSnack(0, 0);
    // Simulate flight completion (duration ~0.6-0.8s)
    logic.update(1.0);
    expect(logic.totalFed).toBe(1);
    expect(logic.score).toBeGreaterThanOrEqual(25);
  });
});
