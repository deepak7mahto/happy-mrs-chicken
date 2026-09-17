/**
 * Mode 11: Miss Bunny's Ice Cream Van - Pure Game Logic
 * Adventures of Trishu Mini-Game Suite
 */

import { FlavorTub, Scoop } from './types';

export class IceCreamVanLogic {
  public time: number = 0;
  public scoops: Scoop[] = [];
  public totalScooped: number = 0;
  public celebrationTimer: number = 0;
  public munchTimer: number = 0;
  public customerIdx: number = 0;
  public score: number = 0;

  public reset(): void {
    this.score = 0;
    this.totalScooped = 0;
    this.scoops = [];
    this.celebrationTimer = 0;
    this.munchTimer = 0;
    this.customerIdx = 0;
    this.time = 0;
  }

  public getFlavors(vWidth: number, vHeight: number): FlavorTub[] {
    const tubY = vHeight - 55;
    const spacing = vWidth / 5;
    return [
      { name: 'Berry', color: '#FF80AB', borderColor: '#F50057', x: spacing * 1, y: tubY, radius: 36 },
      { name: 'Banana', color: '#FFEE58', borderColor: '#FBC02D', x: spacing * 2, y: tubY, radius: 36 },
      { name: 'Choco', color: '#8D6E63', borderColor: '#5D4037', x: spacing * 3, y: tubY, radius: 36 },
      { name: 'Mint', color: '#69F0AE', borderColor: '#00E676', x: spacing * 4, y: tubY, radius: 36 }
    ];
  }

  public addScoop(flavor: FlavorTub): { added: boolean; isCelebration: boolean } {
    if (this.munchTimer > 0) return { added: false, isCelebration: false };

    const isCelebration = (this.scoops.length + 1) % 5 === 0;
    this.scoops.push({
      color: flavor.color,
      borderColor: flavor.borderColor,
      wobblePhase: Math.random() * Math.PI,
      scale: 0.1,
      hasCherry: isCelebration
    });

    this.totalScooped++;
    this.score += isCelebration ? 50 : 10;
    if (isCelebration) {
      this.celebrationTimer = 2.0;
    }
    return { added: true, isCelebration };
  }

  public munchFeast(): boolean {
    if (this.scoops.length === 0 || this.munchTimer > 0) return false;
    this.munchTimer = 1.2;
    this.score += 30;
    return true;
  }

  public update(dt: number): { customerServed: boolean } {
    this.time += dt;
    let customerServed = false;

    if (this.celebrationTimer > 0) {
      this.celebrationTimer -= dt;
    }

    if (this.munchTimer > 0) {
      this.munchTimer -= dt;
      if (this.munchTimer <= 0) {
        this.scoops = [];
        this.customerIdx = (this.customerIdx + 1) % 2;
        customerServed = true;
      }
    }

    for (const s of this.scoops) {
      if (s.scale < 1.0) {
        s.scale = Math.min(1.0, s.scale + dt * 6);
      }
    }

    return { customerServed };
  }
}
