/**
 * Adventures of Trishu — Modular Game Suite
 * Shared Score & Multiplier / Combo Tracker
 */

export interface ScoreComboOptions {
  baseMultiplier?: number;
  maxMultiplier?: number;
  comboTimeout?: number;
  multiplierDecayRate?: number;
}

export class ScoreComboTracker {
  public score: number = 0;
  public combo: number = 0;
  public multiplier: number = 1;
  public comboTimer: number = 0;
  public totalEvents: number = 0;

  private maxMultiplier: number;
  private comboTimeout: number;
  private decayRate: number;

  constructor(options: ScoreComboOptions = {}) {
    this.multiplier = options.baseMultiplier ?? 1;
    this.maxMultiplier = options.maxMultiplier ?? 5;
    this.comboTimeout = options.comboTimeout ?? 2.5;
    this.decayRate = options.multiplierDecayRate ?? 0;
  }

  public reset(): void {
    this.score = 0;
    this.combo = 0;
    this.multiplier = 1;
    this.comboTimer = 0;
    this.totalEvents = 0;
  }

  /**
   * Add base points scaled by the current combo multiplier.
   * Returns the total points awarded.
   */
  public addPoints(basePoints: number, incrementMultiplier: boolean = true): number {
    const earned = basePoints * this.multiplier;
    this.score += earned;
    this.totalEvents++;
    this.combo++;
    this.comboTimer = this.comboTimeout;

    if (incrementMultiplier && this.multiplier < this.maxMultiplier) {
      this.multiplier++;
    }

    return earned;
  }

  /**
   * Directly award a flat bonus without scaling by multiplier.
   */
  public addFlatBonus(bonus: number): void {
    this.score += bonus;
  }

  /**
   * Update combo timer and decay logic.
   */
  public update(dt: number): void {
    if (this.comboTimer > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) {
        this.combo = 0;
        this.multiplier = 1;
      }
    } else if (this.decayRate > 0 && this.multiplier > 1) {
      this.multiplier = Math.max(1, this.multiplier - this.decayRate * dt);
    }
  }

  public isMilestone(interval: number = 10): boolean {
    return this.totalEvents > 0 && this.totalEvents % interval === 0;
  }
}
