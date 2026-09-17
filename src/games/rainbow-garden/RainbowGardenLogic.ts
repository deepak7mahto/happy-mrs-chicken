/**
 * Adventures of Trishu — Mode 15: Rainbow Flower Garden
 * Pure Game Simulation Logic (Headless & Testable)
 */

import { FlowerMound, GardenButterfly } from './types';

export interface RainbowGardenEvents {
  onPetalTickle?: (x: number, y: number) => void;
  onWaterSprayed?: (x: number, y: number) => void;
  onFlowerBloomed?: (mound: FlowerMound) => void;
  onAllBloomed?: () => void;
}

export class RainbowGardenLogic {
  public mounds: FlowerMound[] = [];
  public butterflies: GardenButterfly[] = [];
  public totalBloomed: number = 0;
  public score: number = 0;
  public wateringCanX: number = 200;
  public isWatering: boolean = false;
  public rainbowTimer: number = 0;

  public reset(vWidth: number, vHeight: number): void {
    this.score = 0;
    this.totalBloomed = 0;
    this.isWatering = false;
    this.rainbowTimer = 0;
    this.initMounds(vWidth, vHeight);
    this.initButterflies();
  }

  public initMounds(vWidth: number, vHeight: number): void {
    const groundY = vHeight - 110;
    const spacing = vWidth / 5;

    this.mounds = [
      { x: spacing * 1, y: groundY, growth: 0, color: '#FFD600', type: 'sunflower', bloomed: false },
      { x: spacing * 2, y: groundY, growth: 0, color: '#FF4081', type: 'tulip', bloomed: false },
      { x: spacing * 3, y: groundY, growth: 0, color: '#448AFF', type: 'daisy', bloomed: false },
      { x: spacing * 4, y: groundY, growth: 0, color: '#FF5722', type: 'rose', bloomed: false }
    ];
  }

  public initButterflies(): void {
    this.butterflies = [
      { x: 120, y: 160, color: '#E040FB', phase: 0 },
      { x: 380, y: 140, color: '#FFEB3B', phase: 2 }
    ];
  }

  public waterMound(mound: FlowerMound, events?: RainbowGardenEvents): void {
    if (mound.bloomed) {
      if (events?.onPetalTickle) events.onPetalTickle(mound.x, mound.y);
      return;
    }

    mound.growth += 0.55;
    this.wateringCanX = mound.x;
    this.isWatering = true;
    if (events?.onWaterSprayed) events.onWaterSprayed(mound.x, mound.y);

    if (mound.growth >= 1.0) {
      mound.bloomed = true;
      mound.growth = 1.0;
      this.totalBloomed++;
      this.score += 25;

      if (events?.onFlowerBloomed) events.onFlowerBloomed(mound);

      const unbloomed = this.mounds.filter(m => !m.bloomed).length;
      if (unbloomed === 0) {
        this.rainbowTimer = 2.5;
        this.score += 100;
        if (events?.onAllBloomed) events.onAllBloomed();
      }
    }
  }

  public update(dt: number, time: number): void {
    if (this.rainbowTimer > 0) {
      this.rainbowTimer -= dt;
      if (this.rainbowTimer <= 0) {
        // Reset mounds after celebration
        for (const m of this.mounds) {
          m.growth = 0;
          m.bloomed = false;
        }
      }
    }

    // Update fluttery butterflies
    for (const b of this.butterflies) {
      b.x += Math.sin(time * 2 + b.phase) * 35 * dt;
      b.y += Math.cos(time * 1.5 + b.phase) * 20 * dt;
    }
  }
}
