/**
 * Types for Mode 13: Muddy Car Wash
 */

export interface MudSpot {
  x: number;
  y: number;
  radius: number;
  cleaned: boolean;
  sudsLevel: number;
}

export interface CarWashBubble {
  x: number;
  y: number;
  r: number;
  vy: number;
  color: string;
  life: number;
}
