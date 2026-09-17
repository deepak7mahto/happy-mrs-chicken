/**
 * Adventures of Trishu — Modular Game Suite
 * Shared Round Manager for Multi-Round Continuity
 */

export interface RoundManagerOptions {
  initialRound?: number;
  celebrationDuration?: number;
  targetCountIncrement?: number;
  baseTargetCount?: number;
}

export class RoundManager {
  public round: number = 1;
  public celebrationTimer: number = 0;
  public isCelebrating: boolean = false;
  public completedCount: number = 0;
  public targetCount: number = 5;

  private celebrationDuration: number;
  private targetIncrement: number;

  constructor(options: RoundManagerOptions = {}) {
    this.round = options.initialRound ?? 1;
    this.celebrationDuration = options.celebrationDuration ?? 2.5;
    this.targetCount = options.baseTargetCount ?? 5;
    this.targetIncrement = options.targetCountIncrement ?? 1;
  }

  public reset(): void {
    this.round = 1;
    this.celebrationTimer = 0;
    this.isCelebrating = false;
    this.completedCount = 0;
  }

  public incrementCompleted(): boolean {
    this.completedCount++;
    if (this.completedCount >= this.targetCount) {
      this.triggerRoundVictory();
      return true;
    }
    return false;
  }

  public triggerRoundVictory(): void {
    this.isCelebrating = true;
    this.celebrationTimer = this.celebrationDuration;
  }

  /**
   * Updates celebration timer. When celebration expires, advances to next round.
   * Calls onNextRound callback when ready for next round spawning.
   */
  public update(dt: number, onNextRound?: (newRound: number) => void): boolean {
    if (this.isCelebrating) {
      this.celebrationTimer -= dt;
      if (this.celebrationTimer <= 0) {
        this.isCelebrating = false;
        this.round++;
        this.completedCount = 0;
        this.targetCount += this.targetIncrement;
        if (onNextRound) {
          onNextRound(this.round);
        }
        return true; // Advanced to next round
      }
    }
    return false;
  }
}
