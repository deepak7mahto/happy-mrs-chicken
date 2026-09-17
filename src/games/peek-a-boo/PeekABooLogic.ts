/**
 * Mode 10: Peek-a-Boo Barnyard - Pure Game Logic
 * Adventures of Trishu Mini-Game Suite
 */

import { HidingSpot } from './types';

export class PeekABooLogic {
  public time: number = 0;
  public peekFoundCount: number = 0;
  public score: number = 0;
  public spots: HidingSpot[] = [];

  public initSpots(isPortrait: boolean, vW: number, vH: number): void {
    this.spots = [];
    if (isPortrait) {
      const col1 = vW * 0.28;
      const col2 = vW * 0.72;
      const row1 = vH * 0.42;
      const row2 = vH * 0.70;
      const spotW = vW * 0.40;
      const spotH = vH * 0.22;

      this.spots.push(
        { id: 'spot_barn', name: 'Mrs Clucky', x: col1, y: row1, w: spotW, h: spotH, type: 'BARN', isOpen: false, openProgress: 0, peekTimer: 0, hintWobble: 0, foundCount: 0 },
        { id: 'spot_bush', name: 'Mimi Bunny', x: col2, y: row1, w: spotW, h: spotH, type: 'BUSH', isOpen: false, openProgress: 0, peekTimer: 0, hintWobble: 0, foundCount: 0 },
        { id: 'spot_hay', name: 'Leo & Dino', x: col1, y: row2, w: spotW, h: spotH, type: 'HAY', isOpen: false, openProgress: 0, peekTimer: 0, hintWobble: 0, foundCount: 0 },
        { id: 'spot_barrel', name: 'Trishu', x: col2, y: row2, w: spotW, h: spotH, type: 'BARREL', isOpen: false, openProgress: 0, peekTimer: 0, hintWobble: 0, foundCount: 0 }
      );
    } else {
      const spacing = vW / 5;
      const baseY = vH * 0.65;
      const spotW = Math.min(180, spacing * 0.9);
      const spotH = 140;

      this.spots.push(
        { id: 'spot_barn', name: 'Mrs Clucky', x: spacing * 1, y: baseY, w: spotW, h: spotH, type: 'BARN', isOpen: false, openProgress: 0, peekTimer: 0, hintWobble: 0, foundCount: 0 },
        { id: 'spot_bush', name: 'Mimi Bunny', x: spacing * 2, y: baseY, w: spotW, h: spotH, type: 'BUSH', isOpen: false, openProgress: 0, peekTimer: 0, hintWobble: 0, foundCount: 0 },
        { id: 'spot_hay', name: 'Leo & Dino', x: spacing * 3, y: baseY, w: spotW, h: spotH, type: 'HAY', isOpen: false, openProgress: 0, peekTimer: 0, hintWobble: 0, foundCount: 0 },
        { id: 'spot_barrel', name: 'Trishu', x: spacing * 4, y: baseY, w: spotW, h: spotH, type: 'BARREL', isOpen: false, openProgress: 0, peekTimer: 0, hintWobble: 0, foundCount: 0 }
      );
    }
  }

  public reset(isPortrait: boolean, vW: number, vH: number): void {
    this.time = 0;
    this.peekFoundCount = 0;
    this.score = 0;
    this.initSpots(isPortrait, vW, vH);
  }

  public tapSpot(spot: HidingSpot): { tapped: boolean; isMilestone: boolean; isFriendGiggle?: boolean } {
    if (spot.isOpen) {
      spot.peekTimer = Math.min(3.5, spot.peekTimer + 1.2);
      this.score += 20;
      return { tapped: true, isMilestone: false, isFriendGiggle: true };
    }

    spot.isOpen = true;
    spot.openProgress = 1.0;
    spot.peekTimer = 2.4;
    spot.foundCount++;
    this.peekFoundCount++;
    this.score += 50;

    const isMilestone = this.peekFoundCount % 4 === 0;
    return { tapped: true, isMilestone, isFriendGiggle: false };
  }

  public findSpotAt(x: number, y: number): HidingSpot | null {
    for (const spot of this.spots) {
      const halfW = spot.w / 2 + 20;
      const halfH = spot.h / 2 + 20;
      if (
        x >= spot.x - halfW &&
        x <= spot.x + halfW &&
        y >= spot.y - halfH &&
        y <= spot.y + halfH
      ) {
        return spot;
      }
    }
    return null;
  }

  public update(dt: number): void {
    this.time += dt;

    for (const spot of this.spots) {
      spot.hintWobble = Math.sin(this.time * 4 + spot.x * 0.05);

      if (spot.isOpen) {
        spot.peekTimer -= dt;
        if (spot.peekTimer <= 0) {
          spot.isOpen = false;
          spot.openProgress = Math.max(0, spot.openProgress - dt * 3);
        } else {
          spot.openProgress = Math.min(1.0, spot.openProgress + dt * 5);
        }
      } else if (spot.openProgress > 0) {
        spot.openProgress = Math.max(0, spot.openProgress - dt * 3);
      }
    }
  }
}
