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
  public requestedFlavor: string = 'Rainbow';
  public sprinkleShaker = { x: 0, y: 0, radius: 26, shakeTimer: 0 };

  public reset(): void {
    this.score = 0;
    this.totalScooped = 0;
    this.scoops = [];
    this.celebrationTimer = 0;
    this.munchTimer = 0;
    this.customerIdx = 0;
    this.time = 0;
    this.requestedFlavor = 'Rainbow';
    this.sprinkleShaker.shakeTimer = 0;
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

  public addScoop(flavor: FlavorTub): { added: boolean; isCelebration: boolean; isOrderMatch: boolean } {
    if (this.munchTimer > 0) return { added: false, isCelebration: false, isOrderMatch: false };

    const isCelebration = (this.scoops.length + 1) % 5 === 0;
    const isOrderMatch = this.totalScooped > 0 && flavor.name === this.requestedFlavor;

    this.scoops.push({
      color: flavor.color,
      borderColor: flavor.borderColor,
      wobblePhase: Math.random() * Math.PI,
      scale: 0.1,
      hasCherry: isCelebration
    });

    this.totalScooped++;
    let pts = isCelebration ? 50 : 10;
    if (isOrderMatch) pts += 25;
    this.score += pts;

    if (isCelebration) {
      this.celebrationTimer = 2.0;
    }

    // Pick next requested flavor from the menu
    const flavorNames = ['Berry', 'Banana', 'Choco', 'Mint'];
    this.requestedFlavor = flavorNames[Math.floor(Math.random() * flavorNames.length)];

    return { added: true, isCelebration, isOrderMatch };
  }

  public addSprinkles(): boolean {
    if (this.scoops.length === 0 || this.munchTimer > 0) return false;
    const top = this.scoops[this.scoops.length - 1];
    if (!top.sprinkles) top.sprinkles = [];
    const colors = ['#FF1744', '#FFEA00', '#00E676', '#00E5FF', '#D500F9', '#FFFFFF'];
    for (let i = 0; i < 8; i++) {
      top.sprinkles.push({
        x: (Math.random() - 0.5) * 36,
        y: (Math.random() - 0.5) * 22 - 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI
      });
    }
    this.sprinkleShaker.shakeTimer = 0.45;
    this.score += 15;
    return true;
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

    if (this.sprinkleShaker.shakeTimer > 0) {
      this.sprinkleShaker.shakeTimer = Math.max(0, this.sprinkleShaker.shakeTimer - dt);
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
