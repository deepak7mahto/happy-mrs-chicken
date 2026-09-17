/**
 * Mode 13: Muddy Car Wash - Pure Game Logic
 * Adventures of Trishu Mini-Game Suite
 */

import { MudSpot, CarWashBubble } from './types';

export class CarWashLogic {
  public time: number = 0;
  public mudSpots: MudSpot[] = [];
  public cleanCarsCount: number = 0;
  public celebrationTimer: number = 0;
  public bubbles: CarWashBubble[] = [];
  public score: number = 0;

  public reset(cx: number, cy: number): void {
    this.score = 0;
    this.cleanCarsCount = 0;
    this.celebrationTimer = 0;
    this.bubbles = [];
    this.time = 0;
    this.spawnMud(cx, cy);
  }

  public spawnMud(cx: number, cy: number): void {
    this.mudSpots = [
      { x: cx - 110, y: cy - 20, radius: 28, cleaned: false, sudsLevel: 0 },
      { x: cx - 50, y: cy - 65, radius: 24, cleaned: false, sudsLevel: 0 },
      { x: cx + 40, y: cy - 65, radius: 26, cleaned: false, sudsLevel: 0 },
      { x: cx - 10, y: cy + 10, radius: 32, cleaned: false, sudsLevel: 0 },
      { x: cx + 85, y: cy + 15, radius: 28, cleaned: false, sudsLevel: 0 },
      { x: cx - 80, y: cy + 60, radius: 25, cleaned: false, sudsLevel: 0 }
    ];
  }

  public cleanSpot(spot: MudSpot): {
    cleaned: boolean;
    allCleaned: boolean;
    newBubbles: CarWashBubble[];
  } {
    if (spot.cleaned) {
      return { cleaned: false, allCleaned: false, newBubbles: [] };
    }

    spot.sudsLevel += 0.55;
    const colors = ['#E1F5FE', '#B3E5FC', '#FFF9C4', '#F8BBD0'];
    const newBubbles: CarWashBubble[] = [];

    for (let i = 0; i < 5; i++) {
      const b: CarWashBubble = {
        x: spot.x + (Math.random() - 0.5) * 30,
        y: spot.y + (Math.random() - 0.5) * 30,
        r: 10 + Math.random() * 16,
        vy: -40 - Math.random() * 50,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1.0
      };
      this.bubbles.push(b);
      newBubbles.push(b);
    }

    let cleaned = false;
    let allCleaned = false;

    if (spot.sudsLevel >= 1.0) {
      spot.cleaned = true;
      cleaned = true;
      this.score += 20;

      const remaining = this.mudSpots.filter(s => !s.cleaned).length;
      if (remaining === 0) {
        this.cleanCarsCount++;
        this.score += 100;
        this.celebrationTimer = 2.0;
        allCleaned = true;
      }
    }

    return { cleaned, allCleaned, newBubbles };
  }

  public findSpotAt(x: number, y: number): MudSpot | null {
    for (const m of this.mudSpots) {
      if (!m.cleaned && Math.hypot(x - m.x, y - m.y) <= m.radius + 15) {
        return m;
      }
    }
    return null;
  }

  public update(dt: number): { shouldRespawnMud: boolean } {
    this.time += dt;
    let shouldRespawnMud = false;

    if (this.celebrationTimer > 0) {
      this.celebrationTimer -= dt;
      if (this.celebrationTimer <= 0) {
        shouldRespawnMud = true;
      }
    }

    for (let i = this.bubbles.length - 1; i >= 0; i--) {
      const b = this.bubbles[i];
      b.y += b.vy * dt;
      b.life -= dt * 0.9;
      if (b.life <= 0) {
        this.bubbles.splice(i, 1);
      }
    }

    return { shouldRespawnMud };
  }
}
