/**
 * Mode 5: Leo's Balloon Pop - Pure Game Logic
 * Adventures of Trishu Mini-Game Suite
 */

import { BalloonEntity, BALLOON_COLORS } from './types';

export class DinosaurBalloonLogic {
  public time: number = 0;
  public combo: number = 1;
  public comboTimer: number = 0;
  public balloons: BalloonEntity[] = [];
  public chompTimer: number = 0;
  public popTimer: number = 0;
  public poppedCount: number = 0;
  public score: number = 0;
  public spawnTimer: number = 0;

  public reset(vWidth: number, vHeight: number): void {
    this.score = 0;
    this.combo = 1;
    this.comboTimer = 0;
    this.balloons = [];
    this.time = 0;
    this.spawnTimer = 0;
    this.chompTimer = 0;
    this.popTimer = 0;
    this.poppedCount = 0;

    for (let i = 0; i < 4; i++) {
      this.spawnBalloon(vWidth, vHeight, vHeight * 0.3 + i * (vHeight * 0.18));
    }
  }

  public spawnBalloon(vWidth: number, vHeight: number, customY?: number): BalloonEntity {
    const isGolden = Math.random() < 0.15;
    const randShape = Math.random();
    let shape: 'DINO' | 'ROUND' | 'STAR' | 'HEART' = 'ROUND';
    if (randShape < 0.4) shape = 'DINO';
    else if (randShape < 0.65) shape = 'ROUND';
    else if (randShape < 0.82) shape = 'STAR';
    else shape = 'HEART';

    const color = isGolden
      ? '#FFD700'
      : BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)];

    const margin = 70;
    const x = margin + Math.random() * (vWidth - margin * 2);
    const y = customY !== undefined ? customY : vHeight + 45;
    const radius = isGolden ? 38 : (shape === 'DINO' ? 36 : 32) + Math.random() * 4;
    const vy = -(42 + Math.random() * 25);

    const balloon: BalloonEntity = {
      x,
      y,
      vx: 0,
      vy,
      radius,
      color,
      shape,
      popped: false,
      wobblePhase: Math.random() * Math.PI * 2
    };

    this.balloons.push(balloon);
    return balloon;
  }

  public popBalloon(index: number): { isGolden: boolean; pts: number; balloon: BalloonEntity } | null {
    const b = this.balloons[index];
    if (!b || b.popped) return null;

    b.popped = true;
    this.poppedCount++;

    const isGolden = b.color === '#FFD700' || b.color === '#FFC107';
    const basePts = isGolden ? 100 : 50;
    const pts = basePts * this.combo;
    this.score += pts;

    this.comboTimer = 2.2;
    this.combo = Math.min(10, this.combo + 1);

    this.chompTimer = 0.45;
    this.popTimer = 0.35;

    return { isGolden, pts, balloon: b };
  }

  public findHitBalloon(x: number, y: number): number {
    for (let i = this.balloons.length - 1; i >= 0; i--) {
      const b = this.balloons[i];
      if (b.popped) continue;
      const dist = Math.hypot(x - b.x, y - b.y);
      if (dist <= b.radius + 26) {
        return i;
      }
    }
    return -1;
  }

  public findLowestBalloonIndex(): number {
    let lowestIdx = -1;
    let lowestY = -9999;
    for (let i = 0; i < this.balloons.length; i++) {
      if (!this.balloons[i].popped && this.balloons[i].y > lowestY) {
        lowestY = this.balloons[i].y;
        lowestIdx = i;
      }
    }
    return lowestIdx;
  }

  public update(dt: number, vWidth: number, vHeight: number, isPortrait: boolean): void {
    this.time += dt;
    this.spawnTimer += dt;

    if (this.chompTimer > 0) this.chompTimer = Math.max(0, this.chompTimer - dt);
    if (this.popTimer > 0) this.popTimer = Math.max(0, this.popTimer - dt);

    if (this.comboTimer > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) this.combo = 1;
    }

    const maxBalloons = isPortrait ? 7 : 8;
    const activeCount = this.balloons.filter(b => !b.popped).length;
    if (activeCount < maxBalloons && this.spawnTimer >= 0.9) {
      this.spawnBalloon(vWidth, vHeight);
      this.spawnTimer = 0;
    }

    for (let i = 0; i < this.balloons.length; i++) {
      const b = this.balloons[i];
      if (b.popped) continue;
      b.y += b.vy * dt;
      b.wobblePhase += 2.2 * dt;
      b.x += Math.sin(b.wobblePhase) * 22 * dt;
    }

    this.balloons = this.balloons.filter(b => !b.popped && b.y > -70);
  }
}
