/**
 * Adventures of Trishu — Mode 6: Golden Pancake Flipper
 * Pure Game Simulation Logic (Headless & Testable)
 */

import { ActivePancakeState, StackedPancakeItem } from './types';

export interface PancakeFlipperEvents {
  onSizzle?: () => void;
  onPancakeLanded?: (stackCount: number, earned: number, isSuperTower: boolean) => void;
  onSyrupDrizzled?: () => void;
  onCeilingStick?: () => void;
}

export class PancakeFlipperLogic {
  public score: number = 0;
  public stackCount: number = 0;
  public multiplier: number = 1;
  public isAirborne: boolean = false;
  public flipPhase: number = 0;
  public stackWobbleTimer: number = 0;
  public sizzleIntervalTimer: number = 0;
  public newPancakeDelay: number = 0;
  public stackedPancakes: StackedPancakeItem[] = [];
  public activePancake: ActivePancakeState = {
    x: 270,
    y: 350,
    startX: 270,
    startY: 350,
    vy: 0,
    rotation: 0,
    vRot: 0,
    flipCount: 0,
    isCooked: false,
    isStacked: false,
    cookTimer: 0
  };

  public reset(panX: number, panY: number): void {
    this.score = 0;
    this.stackCount = 0;
    this.multiplier = 1;
    this.isAirborne = false;
    this.flipPhase = 0;
    this.stackWobbleTimer = 0;
    this.sizzleIntervalTimer = 0;
    this.newPancakeDelay = 0;
    this.stackedPancakes = [];
    this.resetPanPancake(panX, panY);
  }

  public resetPanPancake(panX: number, panY: number): void {
    this.isAirborne = false;
    this.flipPhase = 0;
    this.activePancake = {
      x: panX,
      y: panY,
      startX: panX,
      startY: panY,
      vy: 0,
      rotation: 0,
      vRot: 0,
      flipCount: 0,
      isCooked: false,
      isStacked: false,
      cookTimer: 0
    };
  }

  public addSyrup(events?: PancakeFlipperEvents): boolean {
    if (this.stackedPancakes.length === 0) return false;
    for (const p of this.stackedPancakes) {
      p.syrup = true;
      p.butter = true;
    }
    this.score += 50;
    if (events?.onSyrupDrizzled) {
      events.onSyrupDrizzled();
    }
    return true;
  }

  public flipPancake(events?: PancakeFlipperEvents): boolean {
    if (this.isAirborne || this.newPancakeDelay > 0) return false;
    this.isAirborne = true;
    this.flipPhase = 0.05;
    this.activePancake.vy = -550;
    this.activePancake.vRot = Math.PI * 3.5;
    this.activePancake.flipCount++;

    if (Math.random() < 0.22) {
      this.activePancake.isCeilingStuck = true;
      this.activePancake.ceilingTimer = 1.1;
      if (events?.onCeilingStick) {
        events.onCeilingStick();
      }
    }
    return true;
  }

  public catchPancakeOnPlate(plateX: number, plateBaseY: number, events?: PancakeFlipperEvents): void {
    this.isAirborne = false;
    this.stackCount++;
    const topY = plateBaseY - this.stackCount * 12;

    const cookState: 'RAW' | 'PERFECT_GOLDEN' | 'OVERCOOKED' =
      this.activePancake.cookTimer < 0.6 ? 'RAW' :
      (this.activePancake.cookTimer <= 3.2 ? 'PERFECT_GOLDEN' : 'OVERCOOKED');

    const basePts = cookState === 'PERFECT_GOLDEN' ? 100 : (cookState === 'RAW' ? 40 : 60);
    const pts = basePts * this.multiplier;
    this.score += pts;
    this.multiplier = Math.min(10, this.multiplier + 1);

    const isSuperTower = this.stackCount % 5 === 0;
    if (isSuperTower) {
      this.score += pts;
    }

    this.stackedPancakes.push({ y: topY, state: cookState, butter: true });
    this.stackWobbleTimer = 0;
    this.newPancakeDelay = 0.45;

    if (events?.onPancakeLanded) {
      events.onPancakeLanded(this.stackCount, pts, isSuperTower);
    }
  }

  public update(
    dt: number,
    panX: number,
    panY: number,
    plateX: number,
    plateBaseY: number,
    events?: PancakeFlipperEvents
  ): void {
    this.stackWobbleTimer += dt;
    const targetTopY = plateBaseY - (this.stackCount + 1) * 12;

    if (this.flipPhase > 0) {
      this.flipPhase = Math.min(1.0, this.flipPhase + dt * 2.5);
      if (this.flipPhase >= 1.0) this.flipPhase = 0;
    }

    if (this.newPancakeDelay > 0) {
      this.newPancakeDelay -= dt;
      if (this.newPancakeDelay <= 0) {
        this.resetPanPancake(panX, panY);
      }
    } else if (!this.isAirborne) {
      this.activePancake.x = panX;
      this.activePancake.y = panY;
      this.activePancake.cookTimer += dt;
      this.sizzleIntervalTimer += dt;
      if (this.sizzleIntervalTimer >= 0.6) {
        this.sizzleIntervalTimer = 0;
        if (events?.onSizzle) events.onSizzle();
      }
    } else if (this.activePancake.isCeilingStuck) {
      this.activePancake.ceilingTimer = (this.activePancake.ceilingTimer ?? 1.1) - dt;
      this.activePancake.y = 52;
      this.activePancake.rotation = Math.sin(this.stackWobbleTimer * 8) * 0.12;
      if (this.activePancake.ceilingTimer <= 0) {
        this.activePancake.isCeilingStuck = false;
        this.activePancake.vy = 220;
      }
    } else {
      // Airborne Parabola
      const g = 900;
      this.activePancake.vy += g * dt;
      this.activePancake.y += this.activePancake.vy * dt;
      this.activePancake.rotation += this.activePancake.vRot * dt;

      const initialVy = -550;
      const totalAirTime = (2 * Math.abs(initialVy)) / g;
      const elapsedAirTime = (this.activePancake.vy - initialVy) / g;
      const progress = Math.min(1.0, Math.max(0, elapsedAirTime / totalAirTime));
      this.activePancake.x = panX + (plateX - panX) * progress;

      if (this.activePancake.vy > 0 && this.activePancake.y >= targetTopY) {
        this.catchPancakeOnPlate(plateX, plateBaseY, events);
      }
    }
  }
}
