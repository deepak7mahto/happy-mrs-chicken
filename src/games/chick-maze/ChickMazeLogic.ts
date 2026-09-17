/**
 * Adventures of Trishu — Mode 3: Fluffy Chick Trail
 * Pure Game Simulation Logic (Headless & Testable)
 */

import { ChickEntity, SeedEntity, PastureFence, CoopDoor } from './types';
import { RoundManager } from '../common/RoundManager';

export interface ChickMazeEvents {
  onSeedEaten?: (x: number, y: number) => void;
  onChickSaved?: (x: number, y: number, totalSaved: number) => void;
  onRoundComplete?: (round: number) => void;
}

export class ChickMazeLogic {
  public chicks: ChickEntity[] = [];
  public seeds: SeedEntity[] = [];
  public score: number = 0;
  public coopSavedCount: number = 0;
  public roundManager: RoundManager;
  public cluckCallTimer: number = 0;
  public cluckCallOrigin: { x: number; y: number } = { x: 0, y: 0 };

  constructor() {
    this.roundManager = new RoundManager({
      initialRound: 1,
      baseTargetCount: 5,
      targetCountIncrement: 1,
      celebrationDuration: 2.0
    });
  }

  public get round(): number { return this.roundManager.round; }

  public reset(vWidth: number, vHeight: number, isPortrait: boolean): void {
    this.score = 0;
    this.coopSavedCount = 0;
    this.seeds = [];
    this.roundManager.reset();
    this.spawnChickWave(vWidth, vHeight, isPortrait, 5);
  }

  public spawnChickWave(vWidth: number, vHeight: number, isPortrait: boolean, count: number): void {
    this.chicks = [];
    for (let i = 0; i < count; i++) {
      this.chicks.push({
        x: isPortrait ? 80 + Math.random() * (vWidth - 160) : 100 + Math.random() * 200,
        y: isPortrait ? 360 + Math.random() * (vHeight - 460) : 200 + Math.random() * 220,
        vx: (Math.random() - 0.5) * 35,
        vy: (Math.random() - 0.5) * 35,
        walkCycle: Math.random() * 10,
        facingLeft: Math.random() > 0.5,
        state: 'WANDERING'
      });
    }
  }

  public dropSeed(x: number, y: number): void {
    if (this.seeds.length >= 6) {
      this.seeds.shift();
    }
    this.seeds.push({ x, y, remaining: 1 });
  }

  public triggerCluckCall(x: number, y: number): void {
    this.cluckCallTimer = 3.2;
    this.cluckCallOrigin = { x, y };
  }

  public getFences(vWidth: number, vHeight: number, isPortrait: boolean): PastureFence[] {
    if (isPortrait) {
      return [
        { x: 40, y: vHeight * 0.38, w: vWidth * 0.45, h: 16 },
        { x: vWidth * 0.52, y: vHeight * 0.62, w: vWidth * 0.44, h: 16 }
      ];
    } else {
      return [
        { x: 250, y: 150, w: 20, h: 230 },
        { x: 520, y: 200, w: 20, h: 280 }
      ];
    }
  }

  public getCoopDoor(vWidth: number, isPortrait: boolean): CoopDoor {
    return isPortrait
      ? { x: vWidth / 2, y: 180, r: 50 }
      : { x: vWidth - 150, y: 160, r: 45 };
  }

  public update(
    dt: number,
    vWidth: number,
    vHeight: number,
    isPortrait: boolean,
    events?: ChickMazeEvents
  ): void {
    // Handle round progression celebration without score wipeout
    this.roundManager.update(dt, (newRound) => {
      const nextCount = Math.min(8, 4 + newRound);
      this.spawnChickWave(vWidth, vHeight, isPortrait, nextCount);
      if (events?.onRoundComplete) {
        events.onRoundComplete(newRound);
      }
    });

    const coopDoor = this.getCoopDoor(vWidth, isPortrait);
    const fences = this.getFences(vWidth, vHeight, isPortrait);

    if (this.cluckCallTimer > 0) {
      this.cluckCallTimer -= dt;
    }

    // Update Chicks
    for (let i = this.chicks.length - 1; i >= 0; i--) {
      const chick = this.chicks[i];

      // 1. Seed attraction
      let targetSeed: SeedEntity | null = null;
      let minSeedDist = 240;
      for (const s of this.seeds) {
        const dx = s.x - chick.x;
        const dy = s.y - chick.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < minSeedDist) {
          minSeedDist = dist;
          targetSeed = s;
        }
      }

      if (targetSeed) {
        const dx = targetSeed.x - chick.x;
        const dy = targetSeed.y - chick.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 1) {
          chick.vx += (dx / dist) * 110 * dt;
          chick.vy += (dy / dist) * 110 * dt;
        }

        // Eat seed
        if (dist < 18) {
          const sIdx = this.seeds.indexOf(targetSeed);
          if (sIdx !== -1) {
            this.seeds.splice(sIdx, 1);
            this.score += 20;
            if (events?.onSeedEaten) {
              events.onSeedEaten(targetSeed.x, targetSeed.y);
            }
          }
        }
      } else {
        chick.vx += (Math.random() - 0.5) * 50 * dt;
        chick.vy += (Math.random() - 0.5) * 50 * dt;
      }

      // 2. Reynolds Flocking Separation & Cohesion
      for (let j = 0; j < this.chicks.length; j++) {
        if (i === j) continue;
        const other = this.chicks[j];
        const cdx = chick.x - other.x;
        const cdy = chick.y - other.y;
        const cDist = Math.sqrt(cdx * cdx + cdy * cdy);
        if (cDist < 28 && cDist > 0.5) {
          chick.vx += (cdx / cDist) * 80 * dt;
          chick.vy += (cdy / cDist) * 80 * dt;
        } else if (cDist < 90 && !targetSeed) {
          chick.vx += (other.vx - chick.vx) * 0.1 * dt;
          chick.vy += (other.vy - chick.vy) * 0.1 * dt;
        }
      }

      // 3. Coop door gentle attraction when nearby
      const toCoopDx = coopDoor.x - chick.x;
      const toCoopDy = coopDoor.y - chick.y;
      const distToCoop = Math.sqrt(toCoopDx * toCoopDx + toCoopDy * toCoopDy);
      if (distToCoop < 160 && distToCoop > 2 && !targetSeed) {
        chick.vx += (toCoopDx / distToCoop) * 60 * dt;
        chick.vy += (toCoopDy / distToCoop) * 60 * dt;
      }

      // 4. Cluck call conga line attraction
      if (this.cluckCallTimer > 0 && !targetSeed) {
        const cdx = this.cluckCallOrigin.x - chick.x;
        const cdy = this.cluckCallOrigin.y - chick.y;
        const cDist = Math.sqrt(cdx * cdx + cdy * cdy);
        if (cDist > 20) {
          chick.vx += (cdx / cDist) * 110 * dt;
          chick.vy += (cdy / cDist) * 110 * dt;
        }
      }

      // Speed clamp
      const speed = Math.sqrt(chick.vx * chick.vx + chick.vy * chick.vy);
      if (speed > 80) {
        chick.vx = (chick.vx / speed) * 80;
        chick.vy = (chick.vy / speed) * 80;
      }

      chick.x += chick.vx * dt;
      chick.y += chick.vy * dt;
      chick.walkCycle += dt * 10;
      if (Math.abs(chick.vx) > 2) {
        chick.facingLeft = chick.vx < 0;
      }

      // Pasture Fence Collision Obstacle Avoidance
      for (const f of fences) {
        if (
          chick.x >= f.x - 12 &&
          chick.x <= f.x + f.w + 12 &&
          chick.y >= f.y - 12 &&
          chick.y <= f.y + f.h + 12
        ) {
          // Bounce off nearest edge
          const fromLeft = Math.abs(chick.x - (f.x - 12));
          const fromRight = Math.abs(chick.x - (f.x + f.w + 12));
          const fromTop = Math.abs(chick.y - (f.y - 12));
          const fromBottom = Math.abs(chick.y - (f.y + f.h + 12));
          const minEdge = Math.min(fromLeft, fromRight, fromTop, fromBottom);

          if (minEdge === fromLeft) { chick.x = f.x - 12; chick.vx = -Math.abs(chick.vx); }
          else if (minEdge === fromRight) { chick.x = f.x + f.w + 12; chick.vx = Math.abs(chick.vx); }
          else if (minEdge === fromTop) { chick.y = f.y - 12; chick.vy = -Math.abs(chick.vy); }
          else { chick.y = f.y + f.h + 12; chick.vy = Math.abs(chick.vy); }
        }
      }

      // Screen edge bounds
      const minX = 40;
      const maxX = vWidth - 40;
      const minY = 120;
      const maxY = vHeight - 40;
      chick.x = Math.max(minX, Math.min(maxX, chick.x));
      chick.y = Math.max(minY, Math.min(maxY, chick.y));

      // Coop Entry Detection
      const cdx = chick.x - coopDoor.x;
      const cdy = chick.y - coopDoor.y;
      if (cdx * cdx + cdy * cdy <= coopDoor.r * coopDoor.r) {
        this.coopSavedCount++;
        this.score += 100;
        this.chicks.splice(i, 1);

        if (events?.onChickSaved) {
          events.onChickSaved(coopDoor.x, coopDoor.y, this.coopSavedCount);
        }

        // When wave is cleared, advance round WITHOUT resetting score
        if (this.chicks.length === 0) {
          this.score += 200; // Round clear bonus
          this.roundManager.triggerRoundVictory();
        }
      }
    }
  }
}
