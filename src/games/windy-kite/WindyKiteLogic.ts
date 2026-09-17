/**
 * Mode 14: Windy Castle Kite - Pure Game Logic
 * Adventures of Trishu Mini-Game Suite
 */

import { RainbowRibbon } from './types';

export class WindyKiteLogic {
  public time: number = 0;
  public kiteX: number = 240;
  public kiteY: number = 180;
  public targetKiteX: number = 240;
  public targetKiteY: number = 180;
  public ribbons: RainbowRibbon[] = [];
  public ribbonBows: string[] = ['#FF4081', '#FFD700', '#00E676', '#448AFF'];
  public collectedCount: number = 0;
  public loopTimer: number = 0;
  public score: number = 0;

  public reset(vWidth: number, vHeight: number, isPortrait: boolean): void {
    this.score = 0;
    this.collectedCount = 0;
    this.loopTimer = 0;
    this.kiteX = vWidth * 0.5;
    this.kiteY = 180;
    this.targetKiteX = vWidth * 0.5;
    this.targetKiteY = 180;
    this.ribbonBows = ['#FF4081', '#FFD700', '#00E676', '#448AFF'];
    this.ribbons = [];
    this.time = 0;
    this.spawnRibbons(vWidth, vHeight, isPortrait);
  }

  public spawnRibbons(vWidth: number, vHeight: number, isPortrait: boolean): void {
    const colors = ['#FF5252', '#FFD740', '#69F0AE', '#40C4FF', '#E040FB'];
    this.ribbons = [];
    const skyMinY = isPortrait ? 130 : 80;
    const skyMaxY = Math.min(vHeight - 160, isPortrait ? 400 : 290);
    for (let i = 0; i < 5; i++) {
      this.ribbons.push({
        x: 60 + Math.random() * (vWidth - 120),
        y: skyMinY + Math.random() * (skyMaxY - skyMinY),
        color: colors[i % colors.length],
        collected: false
      });
    }
  }

  public swoopKite(tx: number, ty: number, vWidth: number, vHeight: number): void {
    this.targetKiteX = Math.max(50, Math.min(vWidth - 50, tx));
    this.targetKiteY = Math.max(70, Math.min(vHeight - 140, ty));
    this.loopTimer = 0.5;
  }

  public update(dt: number, vWidth: number, vHeight: number, isPortrait: boolean): {
    collectedRibbon?: RainbowRibbon;
    allCollected: boolean;
  } {
    this.time += dt;

    if (this.loopTimer > 0) {
      this.loopTimer -= dt;
    }

    const speed = Math.min(1.0, dt * 7.5);
    const windSwayX = Math.sin(this.time * 2.5) * 18;
    const windSwayY = Math.cos(this.time * 2.0) * 12;
    this.kiteX += (this.targetKiteX + windSwayX - this.kiteX) * speed;
    this.kiteY += (this.targetKiteY + windSwayY - this.kiteY) * speed;

    let collectedRibbon: RainbowRibbon | undefined;
    let allCollected = false;

    for (const r of this.ribbons) {
      if (!r.collected && Math.hypot(this.kiteX - r.x, this.kiteY - r.y) <= 45) {
        r.collected = true;
        this.collectedCount++;
        this.ribbonBows.push(r.color);
        this.score += 25;
        collectedRibbon = r;

        const remaining = this.ribbons.filter(rib => !rib.collected).length;
        if (remaining === 0) {
          allCollected = true;
          this.score += 75;
        }
        break;
      }
    }

    return { collectedRibbon, allCollected };
  }
}
