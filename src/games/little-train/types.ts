/**
 * Types for Mode 12: Grandpa's Little Train
 */

export type PassengerType = 'mimi' | 'trishu' | 'leo' | 'chick';

export interface PassengerStation {
  x: number;
  type: PassengerType;
  pickedUp: boolean;
}

export interface SteamPuff {
  x: number;
  y: number;
  radius: number;
  life: number;
}
