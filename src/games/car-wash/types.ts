export type VehicleType = 'CAR' | 'BOAT' | 'COPTER';

export interface WaterDroplet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  radius: number;
}

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
