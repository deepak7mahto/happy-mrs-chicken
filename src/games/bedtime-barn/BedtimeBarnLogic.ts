/**
 * Mode 20: Sleepy Bedtime Barn - Simulation Logic
 * Headless toddler bedtime wind-down simulation
 * Strictly under 500 lines
 */

import { SleepyStall, DriftingStar, MoonState, ZzzBubble } from './types';

export class BedtimeBarnLogic {
  public stalls: SleepyStall[] = [];
  public stars: DriftingStar[] = [];
  public moon: MoonState = { x: 0, y: 0, radius: 45, isWinking: false, winkTimer: 0 };
  public zzzBubbles: ZzzBubble[] = [];
  public starsCollected: number = 0;
  public score: number = 0;
  public width: number = 960;
  public height: number = 540;
  private nextStarId: number = 1;
  private nextZzzId: number = 1;

  public get allTuckedIn(): boolean {
    return this.stalls.length > 0 && this.stalls.every(s => s.isAsleep);
  }

  public reset(w: number = 960, h: number = 540): void {
    this.width = w;
    this.height = h;
    this.starsCollected = 0;
    this.score = 0;
    this.zzzBubbles = [];
    this.nextStarId = 1;
    this.nextZzzId = 1;

    // 4 Sleepy Animal Stalls
    this.stalls = [
      {
        id: 'clucky',
        name: 'Clucky',
        characterId: 'chicken',
        x: 0,
        y: 0,
        width: 130,
        height: 150,
        isAsleep: false,
        blanketHeight: 0,
        lanternLit: true,
        yawnTimer: 0,
        quiltColor: '#FFD54F',
        zzzTimer: 0
      },
      {
        id: 'george',
        name: 'George',
        characterId: 'george',
        x: 0,
        y: 0,
        width: 120,
        height: 140,
        isAsleep: false,
        blanketHeight: 0,
        lanternLit: true,
        yawnTimer: 0,
        quiltColor: '#81D4FA',
        zzzTimer: 0
      },
      {
        id: 'mimi',
        name: 'Mimi',
        characterId: 'mimi',
        x: 0,
        y: 0,
        width: 120,
        height: 150,
        isAsleep: false,
        blanketHeight: 0,
        lanternLit: true,
        yawnTimer: 0,
        quiltColor: '#F48FB1',
        zzzTimer: 0
      },
      {
        id: 'chick',
        name: 'Baby Chick',
        characterId: 'chick',
        x: 0,
        y: 0,
        width: 100,
        height: 120,
        isAsleep: false,
        blanketHeight: 0,
        lanternLit: true,
        yawnTimer: 0,
        quiltColor: '#A5D6A7',
        zzzTimer: 0
      }
    ];

    // Initialize 6 drifting stars
    this.stars = [];
    for (let i = 0; i < 6; i++) {
      this.spawnStar(w, h, true);
    }

    this.layout(w, h);
  }

  public layout(w: number, h: number): void {
    this.width = w;
    this.height = h;

    const isPortrait = h > w;
    // Moon in top right
    this.moon.x = w * 0.84;
    this.moon.y = h * 0.14;
    this.moon.radius = isPortrait ? 38 : 46;

    // Stalls in a warm row across lower half
    const stallY = isPortrait ? h * 0.58 : h * 0.62;
    const spacing = w / (this.stalls.length + 1);

    this.stalls.forEach((stall, i) => {
      stall.x = spacing * (i + 1);
      stall.y = stallY;
    });
  }

  private spawnStar(w: number, h: number, initialSpread: boolean = false): void {
    const starColors = ['#FFF9C4', '#FFE082', '#FFFFFF', '#E1F5FE'];
    this.stars.push({
      id: this.nextStarId++,
      x: initialSpread ? Math.random() * w : -30,
      y: 30 + Math.random() * (h * 0.3),
      radius: 12 + Math.random() * 8,
      speed: 15 + Math.random() * 25,
      twinklePhase: Math.random() * Math.PI * 2,
      alpha: 0.8 + Math.random() * 0.2,
      color: starColors[Math.floor(Math.random() * starColors.length)]
    });
  }

  public tuckInAnimal(index: number): { tucked: boolean; stall: SleepyStall } {
    if (index < 0 || index >= this.stalls.length) {
      return { tucked: false, stall: this.stalls[0] };
    }

    const stall = this.stalls[index];
    stall.isAsleep = true;
    stall.lanternLit = false;
    stall.yawnTimer = 1.0;
    this.score += 25;

    return { tucked: true, stall };
  }

  public catchStar(id: number): boolean {
    const idx = this.stars.findIndex(s => s.id === id);
    if (idx < 0) return false;

    this.stars.splice(idx, 1);
    this.starsCollected++;
    this.score += 15;

    // Respawn a star so the sky stays lively
    this.spawnStar(this.width, this.height, false);
    return true;
  }

  public winkMoon(): void {
    this.moon.isWinking = true;
    this.moon.winkTimer = 1.0;
    this.score += 10;
  }

  public findStallAt(x: number, y: number): number {
    return this.stalls.findIndex(s => {
      const halfW = s.width * 0.6;
      const halfH = s.height * 0.6;
      return Math.abs(x - s.x) <= halfW && Math.abs(y - s.y) <= halfH;
    });
  }

  public findStarAt(x: number, y: number): number {
    const star = this.stars.find(s => {
      const dx = s.x - x;
      const dy = s.y - y;
      return Math.hypot(dx, dy) <= s.radius * 2.2;
    });
    return star ? star.id : -1;
  }

  public isMoonAt(x: number, y: number): boolean {
    const dx = this.moon.x - x;
    const dy = this.moon.y - y;
    return Math.hypot(dx, dy) <= this.moon.radius * 1.5;
  }

  public update(dt: number): void {
    // Drifting stars
    for (let i = this.stars.length - 1; i >= 0; i--) {
      const star = this.stars[i];
      star.x += star.speed * dt;
      star.twinklePhase += dt * 3;
      if (star.x > this.width + 40) {
        this.stars.splice(i, 1);
        this.spawnStar(this.width, this.height, false);
      }
    }

    // Moon wink
    if (this.moon.winkTimer > 0) {
      this.moon.winkTimer -= dt;
      if (this.moon.winkTimer <= 0) {
        this.moon.winkTimer = 0;
        this.moon.isWinking = false;
      }
    }

    // Stalls & Blankets & Zzz bubbles
    for (const stall of this.stalls) {
      if (stall.isAsleep) {
        stall.blanketHeight = Math.min(1.0, stall.blanketHeight + dt * 2.5);
        stall.zzzTimer += dt;
        if (stall.zzzTimer >= 1.6) {
          stall.zzzTimer = 0;
          this.zzzBubbles.push({
            id: this.nextZzzId++,
            x: stall.x + (Math.random() - 0.5) * 20,
            y: stall.y - stall.height * 0.4,
            alpha: 1.0,
            scale: 0.8
          });
        }
      }

      if (stall.yawnTimer > 0) {
        stall.yawnTimer -= dt;
        if (stall.yawnTimer <= 0) {
          stall.yawnTimer = 0;
        }
      }
    }

    // Update Zzz bubbles
    for (let i = this.zzzBubbles.length - 1; i >= 0; i--) {
      const zzz = this.zzzBubbles[i];
      zzz.y -= 25 * dt;
      zzz.x += Math.sin(zzz.y * 0.05) * 10 * dt;
      zzz.alpha -= dt * 0.5;
      zzz.scale += dt * 0.2;
      if (zzz.alpha <= 0) {
        this.zzzBubbles.splice(i, 1);
      }
    }
  }
}
