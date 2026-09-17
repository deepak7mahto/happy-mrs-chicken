/**
 * Adventures of Trishu — Mode 7: Grandpa's Veggie Harvest
 * Pure Game Simulation Logic (Headless & Testable)
 */

import { ActiveVeggie, GardenMoundItem, SPRING_K, BREAKOUT_THRESHOLDS, VEGGIE_POINTS } from './types';

export interface VeggieHarvestEvents {
  onVeggiePop?: (x: number, y: number) => void;
  onPumpkinTug?: (x: number, y: number) => void;
  onVeggieLanded?: (veg: ActiveVeggie, earned: number) => void;
}

export class VegetableHarvestLogic {
  public mounds: GardenMoundItem[] = [];
  public harvestedCount: number = 0;
  public pumpkinTugs: number = 0;
  public currentPullTension: number = 0;
  public currentPullProgress: number = 0;
  public score: number = 0;
  public activePullMoundIdx: number = -1;
  public wheelbarrowBounce: number = 0;

  private pullStartY: number = 0;

  public reset(vWidth: number, vHeight: number, isPortrait: boolean): void {
    this.score = 0;
    this.harvestedCount = 0;
    this.pumpkinTugs = 0;
    this.currentPullTension = 0;
    this.currentPullProgress = 0;
    this.activePullMoundIdx = -1;
    this.wheelbarrowBounce = 0;
    this.initMounds(vWidth, vHeight, isPortrait);
  }

  public initMounds(vWidth: number, vHeight: number, isPortrait: boolean): void {
    this.mounds = [];
    if (isPortrait) {
      const positions = [
        { x: vWidth * 0.32, y: vHeight * 0.58 },
        { x: vWidth * 0.72, y: vHeight * 0.58 },
        { x: vWidth * 0.32, y: vHeight * 0.76 },
        { x: vWidth * 0.72, y: vHeight * 0.76 }
      ];
      positions.forEach((pos, idx) => {
        this.mounds.push({
          id: `mound_${idx}`,
          x: pos.x,
          y: pos.y,
          vegetable: this.spawnVegetable(pos.x, pos.y, idx),
          respawnTimer: 0
        });
      });
    } else {
      const spacing = (vWidth - 320) / 4;
      for (let i = 0; i < 4; i++) {
        const mx = 240 + i * spacing;
        const my = vHeight * 0.72;
        this.mounds.push({
          id: `mound_${i}`,
          x: mx,
          y: my,
          vegetable: this.spawnVegetable(mx, my, i),
          respawnTimer: 0
        });
      }
    }
  }

  public spawnVegetable(x: number, y: number, index: number): ActiveVeggie {
    const rand = Math.random();
    const type: 'CARROT' | 'CABBAGE' | 'PUMPKIN' = rand < 0.45 ? 'CARROT' : (rand < 0.8 ? 'CABBAGE' : 'PUMPKIN');
    return {
      id: `veg_${index}_${Date.now()}`,
      type,
      x,
      y,
      startY: y,
      pullProgress: 0,
      pullOffsetY: 0,
      springK: SPRING_K[type],
      breakoutThreshold: BREAKOUT_THRESHOLDS[type],
      points: VEGGIE_POINTS[type],
      isHarvested: false,
      isFlying: false,
      flightTimer: 0,
      flightDuration: 0.65,
      flightStartX: x,
      flightStartY: y,
      flightVy: 0,
      rotation: 0,
      vRot: (Math.random() - 0.5) * 8
    };
  }

  public handleTap(ptrX: number, ptrY: number, wbX: number, wbY: number, events?: VeggieHarvestEvents): boolean {
    for (let i = 0; i < this.mounds.length; i++) {
      const m = this.mounds[i];
      if (m.vegetable && !m.vegetable.isHarvested && !m.vegetable.isFlying) {
        if (Math.hypot(ptrX - m.x, ptrY - m.y) <= 75) {
          m.vegetable.pullOffsetY += m.vegetable.breakoutThreshold * 0.6;
          m.vegetable.pullProgress = Math.min(1.0, m.vegetable.pullOffsetY / m.vegetable.breakoutThreshold);

          if (events?.onVeggiePop) events.onVeggiePop(m.x, m.y);

          if (m.vegetable.pullOffsetY >= m.vegetable.breakoutThreshold) {
            this.triggerVegetableHarvest(m.vegetable, wbX, wbY);
            this.activePullMoundIdx = -1;
          } else {
            this.activePullMoundIdx = i;
            this.pullStartY = ptrY;
          }
          return true;
        }
      }
    }
    return false;
  }

  public handleDrag(pointerY: number, wbX: number, wbY: number, events?: VeggieHarvestEvents): void {
    if (this.activePullMoundIdx < 0) return;
    const mound = this.mounds[this.activePullMoundIdx];
    const veg = mound ? mound.vegetable : null;
    if (veg && !veg.isHarvested && !veg.isFlying) {
      const rawPull = Math.max(0, this.pullStartY - pointerY);
      veg.pullOffsetY = Math.min(veg.breakoutThreshold * 1.2, rawPull / veg.springK);
      veg.pullProgress = Math.min(1.0, veg.pullOffsetY / veg.breakoutThreshold);
      this.currentPullTension = veg.pullProgress;
      this.currentPullProgress = veg.pullProgress;

      if (veg.pullOffsetY >= veg.breakoutThreshold) {
        if (veg.type === 'PUMPKIN' && this.pumpkinTugs < 2) {
          this.pumpkinTugs++;
          if (events?.onPumpkinTug) events.onPumpkinTug(veg.x, veg.y);
          veg.pullOffsetY = veg.breakoutThreshold * 0.4;
          veg.pullProgress = 0.4;
          this.pullStartY = pointerY + (veg.breakoutThreshold * 0.4 * veg.springK);
        } else {
          this.triggerVegetableHarvest(veg, wbX, wbY);
          this.activePullMoundIdx = -1;
        }
      }
    }
  }

  public triggerVegetableHarvest(veg: ActiveVeggie, wbX: number, wbY: number): void {
    veg.isFlying = true;
    veg.flightTimer = 0;
    veg.flightStartX = veg.x;
    veg.flightStartY = veg.startY - veg.pullOffsetY;
    veg.flightVy = -500;
    this.currentPullTension = 0;
    this.currentPullProgress = 0;
    this.pumpkinTugs = 0;
  }

  public releasePull(): void {
    this.currentPullTension = 0;
    this.currentPullProgress = 0;
    this.activePullMoundIdx = -1;
  }

  public update(dt: number, wbX: number, wbY: number, events?: VeggieHarvestEvents): void {
    if (this.wheelbarrowBounce > 0) {
      this.wheelbarrowBounce = Math.max(0, this.wheelbarrowBounce - dt * 4);
    }

    // Vegetable Flight & Respawn
    for (let i = 0; i < this.mounds.length; i++) {
      const m = this.mounds[i];
      const veg = m.vegetable;

      if (veg && veg.isFlying) {
        veg.flightTimer += dt;
        const t = veg.flightTimer / veg.flightDuration;
        if (t >= 1.0) {
          veg.isFlying = false;
          veg.isHarvested = true;
          this.harvestedCount++;
          this.score += veg.points;
          this.wheelbarrowBounce = 1.0;
          m.respawnTimer = 1.8;

          if (events?.onVeggieLanded) {
            events.onVeggieLanded(veg, veg.points);
          }
        } else {
          veg.x = veg.flightStartX + (wbX - veg.flightStartX) * t;
          const arcY = Math.sin(t * Math.PI) * 140;
          veg.y = veg.flightStartY + (wbY - veg.flightStartY) * t - arcY;
          veg.rotation += veg.vRot * dt;
        }
      } else if (m.vegetable && m.vegetable.isHarvested) {
        m.respawnTimer -= dt;
        if (m.respawnTimer <= 0) {
          m.vegetable = this.spawnVegetable(m.x, m.y, i);
        }
      } else if (veg && !veg.isFlying && !veg.isHarvested && this.activePullMoundIdx !== i && veg.pullOffsetY > 0) {
        veg.pullOffsetY = Math.max(0, veg.pullOffsetY - dt * 280);
        veg.pullProgress = veg.pullOffsetY / veg.breakoutThreshold;
      }
    }
  }
}
