/**
 * Adventures of Trishu — Mode 2: Muddy Puddles
 * Pure Game Simulation Logic (Headless & Testable)
 */

import { PuddleEntity, TrishuJumpState, MuddyFootprint } from './types';
import { ScoreComboTracker } from '../common/ScoreComboTracker';

export interface MuddyPuddlesEvents {
  onPuddleHit?: (puddle: PuddleEntity, totalEarned: number, multiplier: number) => void;
  onGroundStomp?: (x: number, y: number) => void;
}

export class MuddyPuddlesLogic {
  public puddles: PuddleEntity[] = [];
  public footprints: MuddyFootprint[] = [];
  public trishu: TrishuJumpState = {
    x: 270,
    y: 410,
    vx: 0,
    jumpY: 0,
    isJumping: false,
    jumpV: 0,
    squish: 1.0,
    targetX: 270
  };
  public timer: number = 60.0;
  public splashesCount: number = 0;
  public muddyBootsTimer: number = 0;
  public scoreTracker: ScoreComboTracker;

  private spawnTimer: number = 0;

  constructor() {
    this.scoreTracker = new ScoreComboTracker({
      baseMultiplier: 1,
      maxMultiplier: 5,
      comboTimeout: 3.5
    });
  }

  public get score(): number { return this.scoreTracker.score; }
  public set score(val: number) { this.scoreTracker.score = val; }

  public get multiplier(): number { return this.scoreTracker.multiplier; }
  public set multiplier(val: number) { this.scoreTracker.multiplier = val; }

  public reset(startX: number, groundY: number): void {
    this.puddles = [];
    this.footprints = [];
    this.timer = 60.0;
    this.splashesCount = 0;
    this.muddyBootsTimer = 0;
    this.spawnTimer = 0;
    this.scoreTracker.reset();

    this.trishu = {
      x: startX,
      y: groundY,
      vx: 0,
      jumpY: 0,
      isJumping: false,
      jumpV: 0,
      squish: 1.0,
      targetX: startX
    };

    this.spawnPuddle(startX - 120, groundY);
    this.spawnPuddle(startX, groundY);
    this.spawnPuddle(startX + 120, groundY);
  }

  public spawnPuddle(customX?: number, groundY: number = 410): void {
    if (this.puddles.length >= 6) return;
    const isGolden = Math.random() < 0.25;
    const minX = 70;
    const maxX = 470;
    const px = customX !== undefined ? customX : minX + Math.random() * (maxX - minX);

    this.puddles.push({
      x: px,
      y: groundY - 20 + Math.random() * 40,
      rx: isGolden ? 55 : 46 + Math.random() * 16,
      ry: isGolden ? 28 : 23 + Math.random() * 8,
      type: isGolden ? 'GOLDEN' : 'STANDARD',
      lifetime: 14.0,
      ripplePhase: 0
    });
  }

  public jump(targetX?: number): void {
    if (this.trishu.isJumping) {
      if (targetX !== undefined) {
        this.trishu.targetX = targetX;
      }
      return;
    }

    this.trishu.isJumping = true;
    this.trishu.jumpV = -460;
    this.trishu.squish = 1.25;

    if (targetX !== undefined) {
      this.trishu.targetX = targetX;
      // Calculate smooth horizontal velocity to arrive at targetX right as jump finishes
      const airTime = (2 * 460) / 1400; // ~0.65s
      this.trishu.vx = (targetX - this.trishu.x) / airTime;
    }
  }

  public update(dt: number, groundY: number, vWidth: number, events?: MuddyPuddlesEvents): void {
    this.scoreTracker.update(dt);

    if (this.muddyBootsTimer > 0) {
      this.muddyBootsTimer = Math.max(0, this.muddyBootsTimer - dt);
    }

    this.trishu.y = groundY;

    // Spawner
    this.spawnTimer += dt;
    if (this.spawnTimer >= 1.5) {
      this.spawnTimer = 0;
      this.spawnPuddle(undefined, groundY);
    }

    // Footprints fade
    for (let i = this.footprints.length - 1; i >= 0; i--) {
      this.footprints[i].life -= dt * 0.4;
      if (this.footprints[i].life <= 0) {
        this.footprints.splice(i, 1);
      }
    }

    // Horizontal position update
    const minTrishuX = 50;
    const maxTrishuX = vWidth - 50;
    this.trishu.x = Math.max(minTrishuX, Math.min(maxTrishuX, this.trishu.x + this.trishu.vx * dt));

    // Jump Physics
    if (this.trishu.isJumping) {
      this.trishu.jumpV += 1400 * dt;
      this.trishu.jumpY += this.trishu.jumpV * dt;

      if (this.trishu.jumpY >= 0) {
        this.trishu.jumpY = 0;
        this.trishu.isJumping = false;
        this.trishu.jumpV = 0;
        this.trishu.vx = 0;
        this.trishu.squish = 0.7;

        // Add fading footprint decal
        this.footprints.push({
          x: this.trishu.x,
          y: groundY + 12,
          life: 1.0,
          rotation: (Math.random() - 0.5) * 0.3
        });

        // Check collision with puddles
        let hit = false;
        for (let i = this.puddles.length - 1; i >= 0; i--) {
          const pud = this.puddles[i];
          const dx = (this.trishu.x - pud.x) / pud.rx;
          const dy = (groundY - pud.y) / pud.ry;
          const dNorm = Math.sqrt(dx * dx + dy * dy);

          if (dNorm <= 1.25) {
            hit = true;
            this.splashesCount++;
            this.muddyBootsTimer = 4.0;
            pud.ripplePhase = 0.01;

            const basePts = pud.type === 'GOLDEN' ? 100 : 30;
            const earned = this.scoreTracker.addPoints(basePts, true);

            if (events?.onPuddleHit) {
              events.onPuddleHit(pud, earned, this.multiplier);
            }

            this.puddles.splice(i, 1);
            break;
          }
        }

        if (!hit) {
          this.scoreTracker.addFlatBonus(10);
          if (events?.onGroundStomp) {
            events.onGroundStomp(this.trishu.x, groundY);
          }
        }
      }
    }

    this.trishu.squish += (1.0 - this.trishu.squish) * (dt * 12);

    // Update puddles
    for (let i = this.puddles.length - 1; i >= 0; i--) {
      const pud = this.puddles[i];
      pud.lifetime -= dt;
      if (pud.ripplePhase > 0) pud.ripplePhase += dt * 2.0;
      if (pud.lifetime <= 0) this.puddles.splice(i, 1);
    }
  }
}
