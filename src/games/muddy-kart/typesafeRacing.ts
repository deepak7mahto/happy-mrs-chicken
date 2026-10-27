/**
 * TypeSafe AI Racing Intelligence & Semantic Primitives
 * Adventures of Trishu - Mode 17: Grandpa's Muddy Kart 3D
 *
 * Implements System One typed judgments:
 * - Noul: Probability that toddler player needs gentle magnetic steering assist
 * - Choice: Selects calibrated toddler trophy title & victory fanfare based on playstyle
 *
 * Strictly under 500 Lines of Code
 */

import { CharacterId } from '../../types/characters';
import { RaceSessionStats } from './types';

export interface TypeSafeNoulResult {
  primitive: 'noul';
  condition: string;
  probability: number; // 0.0 to 1.0
  suggestedAction?: string;
}

export interface TypeSafeChoiceResult<T extends string> {
  primitive: 'choice';
  question: string;
  choice: T;
  confidence: number;
  distribution: Record<T, number>;
}

export type RacingTrophyTitle =
  | 'The Mud Puddle Champion'
  | 'Super Star Collector'
  | 'Speedy Rainbow Racer'
  | 'Gentle Countryside Cruiser'
  | 'Master of Happy Drifting';

export interface AssistInputState {
  offRoadDurationSec: number;
  recentSteerJitter: number;
  missedCollectibles: number;
  averageSpeed: number;
  toddlerAgeBand: string;
}

export interface TrophyInputState {
  avatar: CharacterId;
  stats: RaceSessionStats;
}

export class TypeSafeRacingAdvisor {
  /**
   * TypeSafe Noul Primitive:
   * Evaluates if the toddler requires gentle road-centering steering assistance.
   */
  public evaluateSteeringAssist(state: AssistInputState): TypeSafeNoulResult {
    // Calibrated System One probability calculation based on telemetry state
    let prob = 0.15;

    if (state.offRoadDurationSec > 1.2) {
      prob += Math.min(0.5, state.offRoadDurationSec * 0.25);
    }
    if (state.recentSteerJitter > 2.5) {
      prob += 0.25;
    }
    if (state.averageSpeed < 30) {
      prob += 0.15;
    }

    const clampedProb = Math.max(0.05, Math.min(0.95, prob));

    return {
      primitive: 'noul',
      condition: 'player_needs_steering_centering_assist',
      probability: Number(clampedProb.toFixed(2)),
      suggestedAction: clampedProb > 0.65 ? 'APPLY_GENTLE_ROAD_MAGNET' : 'MAINTAIN_NORMAL_PHYSICS'
    };
  }

  /**
   * TypeSafe Choice Primitive:
   * Selects the most celebratory toddler trophy title based on race metrics.
   */
  public evaluateTrophy(state: TrophyInputState): TypeSafeChoiceResult<RacingTrophyTitle> {
    const { stats } = state;
    const scores: Record<RacingTrophyTitle, number> = {
      'The Mud Puddle Champion': Math.max(0.1, stats.mudSplashes * 2.5),
      'Super Star Collector': Math.max(0.1, stats.starsCollected * 2.0),
      'Speedy Rainbow Racer': Math.max(0.1, stats.boostCount * 3.0),
      'Master of Happy Drifting': Math.max(0.1, stats.maxCombo * 2.2),
      'Gentle Countryside Cruiser': Math.max(0.2, (60 - Math.min(50, stats.elapsedTime)) * 0.1)
    };

    let total = 0;
    for (const key of Object.keys(scores) as RacingTrophyTitle[]) {
      total += scores[key];
    }

    let bestTitle: RacingTrophyTitle = 'Gentle Countryside Cruiser';
    let maxProb = 0;
    const distribution: Record<RacingTrophyTitle, number> = {} as Record<RacingTrophyTitle, number>;

    for (const key of Object.keys(scores) as RacingTrophyTitle[]) {
      const p = Number((scores[key] / total).toFixed(2));
      distribution[key] = p;
      if (p > maxProb) {
        maxProb = p;
        bestTitle = key;
      }
    }

    return {
      primitive: 'choice',
      question: 'Which celebratory racing archetype best honors this toddler play session?',
      choice: bestTitle,
      confidence: maxProb,
      distribution
    };
  }

  /**
   * TypeSafe Choice Primitive:
   * Selects an encouraging speech bubble prompt from family members during gameplay.
   */
  public getEncouragementPrompt(avatar: CharacterId, mudCount: number): string {
    const cheers = [
      'Wheee! Watch out for the big mud splash!',
      'Honk honk! You are doing so great!',
      'Splish splash! Grandpa loves the muddy road!',
      'Look at all the shiny golden stars!'
    ];
    if (mudCount >= 5) {
      return 'Mega Mud Splashes! Splish, splash, splosh!';
    }
    return cheers[mudCount % cheers.length];
  }
}

export const typesafeRacing = new TypeSafeRacingAdvisor();
