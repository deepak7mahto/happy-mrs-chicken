/**
 * Types for Mode 11: Miss Bunny's Ice Cream Van
 */

export interface FlavorTub {
  name: string;
  color: string;
  borderColor: string;
  x: number;
  y: number;
  radius: number;
}

export interface Scoop {
  color: string;
  borderColor: string;
  wobblePhase: number;
  scale: number;
  hasCherry?: boolean;
}
