/**
 * Mode 13: Muddy Car Wash - Pure Game Logic
 * Adventures of Trishu Mini-Game Suite
 */

import { MudSpot, CarWashBubble, VehicleType, WaterDroplet } from './types';

export class CarWashLogic {
  public time: number = 0;
  public mudSpots: MudSpot[] = [];
  public cleanCarsCount: number = 0;
  public celebrationTimer: number = 0;
  public bubbles: CarWashBubble[] = [];
  public waterDrops: WaterDroplet[] = [];
  public vehicleType: VehicleType = 'CAR';
  public score: number = 0;

  public reset(cx: number, cy: number): void {
    this.score = 0;
    this.cleanCarsCount = 0;
    this.celebrationTimer = 0;
    this.bubbles = [];
    this.waterDrops = [];
    this.vehicleType = 'CAR';
    this.time = 0;
    this.spawnMud(cx, cy);
  }

  public nextVehicle(): VehicleType {
    if (this.vehicleType === 'CAR') this.vehicleType = 'BOAT';
    else if (this.vehicleType === 'BOAT') this.vehicleType = 'COPTER';
    else this.vehicleType = 'CAR';
    return this.vehicleType;
  }

  public sprayHose(x: number, y: number): void {
    for (let i = 0; i < 4; i++) {
      this.waterDrops.push({
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 20,
        vx: (Math.random() - 0.5) * 90,
        vy: -45 - Math.random() * 65,
        life: 0.65,
        radius: 3 + Math.random() * 4
      });
    }
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
    this.sprayHose(spot.x, spot.y);
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
        this.nextVehicle();
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

    for (let i = this.waterDrops.length - 1; i >= 0; i--) {
      const d = this.waterDrops[i];
      d.x += d.vx * dt;
      d.y += d.vy * dt;
      d.vy += 120 * dt; // gentle gravity
      d.life -= dt * 1.5;
      if (d.life <= 0) {
        this.waterDrops.splice(i, 1);
      }
    }

    return { shouldRespawnMud };
  }
}
