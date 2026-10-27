/**
 * 3D Muddy Kart Racing Types & Interfaces
 * Adventures of Trishu - Mode 17
 * Strictly under 500 Lines of Code
 */

export type RoadPropType =
  | 'MUD_PUDDLE'
  | 'GOLDEN_STAR'
  | 'BOOST_RAMP'
  | 'HAY_BALE'
  | 'TREE'
  | 'BUSH'
  | 'FLOWER';

export interface RoadProp {
  id: number;
  type: RoadPropType;
  offset: number; // -1 to 1 on road; > 1.2 or < -1.2 on roadside
  collected: boolean;
  scale: number;
  wobble: number;
}

export interface SegmentColors {
  road: string;
  grass: string;
  rumble: string;
  lane: string;
}

export interface TrackPoint3D {
  x: number;
  y: number;
  z: number;
}

export interface ProjectedPoint2D {
  x: number;
  y: number;
  w: number;
  scale: number;
}

export interface TrackSegment {
  index: number;
  p1: { world: TrackPoint3D; screen: ProjectedPoint2D };
  p2: { world: TrackPoint3D; screen: ProjectedPoint2D };
  curve: number;
  clip: number;
  colors: SegmentColors;
  props: RoadProp[];
}

export interface KartPlayer {
  x: number;          // Normalized road X: -1.0 left edge, 0 center, +1.0 right edge
  z: number;          // Position along track loop
  speed: number;      // Current forward speed
  maxSpeed: number;   // Normal max speed
  steer: number;      // Steer factor (-1 to +1)
  airY: number;       // Elevation during boost ramp jumps
  airVy: number;      // Vertical velocity for jump arc
  turboTimer: number; // Boost duration remaining
  mudTimer: number;   // Mud splash visual feedback timer
  bumpTimer: number;  // Hay bale bump wobble timer
  distance: number;   // Cumulative distance driven
  lap: number;        // Lap counter
}

export interface RaceSessionStats {
  score: number;
  starsCollected: number;
  mudSplashes: number;
  combo: number;
  maxCombo: number;
  offRoadCount: number;
  boostCount: number;
  elapsedTime: number;
  titleAwarded: string;
}
