/**
 * Adventures of Trishu — Mode 1: Happy Mrs Clucky
 * Pure Game Simulation Logic (Headless & Testable)
 */

import { EggEntity, ChickEntity, ChickenState } from './types';

export interface EggLayingEvents {
  onEggLaid?: (x: number, y: number, isGolden: boolean) => void;
  onEggCrack?: (x: number, y: number) => void;
  onEggHatch?: (x: number, y: number, newChick: ChickEntity) => void;
  onChickHopped?: (chick: ChickEntity) => void;
  onBroodStart?: (x: number, y: number) => void;
}

export class EggLayingLogic {
  public eggs: EggEntity[] = [];
  public chicks: ChickEntity[] = [];
  public chicken: ChickenState = {
    x: 270,
    y: 200,
    targetX: 270,
    targetY: 200,
    facingLeft: false,
    squash: 1.0,
    squawk: 0,
    flap: 0
  };
  public score: number = 0;
  public totalEggsLaid: number = 0;
  public totalChicksHatched: number = 0;

  private lastLayTime: number = 0;
  private roamTimer: number = 0;
  private lastUserTapTime: number = 0;

  public reset(startX: number, startY: number): void {
    this.eggs = [];
    this.chicks = [];
    this.score = 0;
    this.totalEggsLaid = 0;
    this.totalChicksHatched = 0;
    this.lastLayTime = 0;
    this.roamTimer = 0;
    this.lastUserTapTime = 0;
    this.chicken = {
      x: startX,
      y: startY,
      targetX: startX,
      targetY: startY,
      facingLeft: false,
      squash: 1.0,
      squawk: 0,
      flap: 0
    };
  }

  public layEggAt(x: number, y: number, events?: EggLayingEvents): boolean {
    const now = performance.now();
    if (now - this.lastLayTime < 50) return false;
    this.lastLayTime = now;

    this.totalEggsLaid++;
    this.score++;

    // Vertical egg stack check: if close horizontally to existing resting egg, stack atop it
    let stackOffset = 0;
    for (const other of this.eggs) {
      if (other.state === 'INCUBATING' && Math.abs(other.x - x) < 24) {
        stackOffset += 22;
      }
    }

    const egg: EggEntity = {
      x: x + (Math.random() * 12 - 6),
      y: y + 25,
      vx: (Math.random() - 0.5) * 40,
      vy: 40 + Math.random() * 20,
      rotation: Math.random() * 0.4 - 0.2,
      vRot: (Math.random() - 0.5) * 0.1,
      state: 'FALLING',
      timer: 0,
      crackStage: 0
    };

    (egg as any).targetGroundOffsetY = stackOffset;
    this.eggs.push(egg);

    this.chicken.squash = 0.72;
    this.chicken.squawk = 1.0;

    const isGolden = this.totalEggsLaid % 6 === 0;
    if (events?.onEggLaid) {
      events.onEggLaid(x, y, isGolden);
    }

    // Brood Mode Trigger: 5+ eggs in cluster
    let clusterCount = 0;
    for (const other of this.eggs) {
      if (other.state === 'INCUBATING' && Math.abs(other.x - x) < 36) {
        clusterCount++;
      }
    }
    if (clusterCount >= 5 && !this.chicken.isBrooding) {
      this.chicken.isBrooding = true;
      this.chicken.broodTimer = 2.2;
      this.chicken.targetX = x;
      this.chicken.targetY = y - 10;
      if (events?.onBroodStart) {
        events.onBroodStart(x, y);
      }
    }

    return isGolden;
  }

  public tapChick(x: number, y: number, events?: EggLayingEvents): boolean {
    for (const chick of this.chicks) {
      const dx = chick.x - x;
      const dy = chick.y - y;
      if (dx * dx + dy * dy < 1600) {
        chick.state = 'HOPPING';
        chick.vy = -220;
        chick.vx = (Math.random() - 0.5) * 130;
        chick.flutterTimer = 0.65;
        chick.isTapped = true;
        chick.walkCycle += 6;
        if (events?.onChickHopped) {
          events.onChickHopped(chick);
        }
        return true;
      }
    }
    return false;
  }

  public registerUserTap(targetX: number, targetY: number): void {
    this.lastUserTapTime = performance.now();
    this.chicken.targetX = targetX;
    this.chicken.targetY = targetY;
    this.chicken.facingLeft = this.chicken.targetX < this.chicken.x;
  }

  public update(
    dt: number,
    time: number,
    groundY: number,
    vWidth: number,
    vHeight: number,
    events?: EggLayingEvents
  ): void {
    this.roamTimer += dt;

    if (this.chicken.isBrooding) {
      this.chicken.broodTimer = (this.chicken.broodTimer ?? 2.2) - dt;
      this.chicken.squash = 0.64;
      this.chicken.flap = 0;
      if (this.chicken.broodTimer <= 0) {
        this.chicken.isBrooding = false;
        this.chicken.squawk = 1.0;
        this.chicken.squash = 1.35;
        // Multi-hatch all eggs in cluster
        for (const egg of this.eggs) {
          if (Math.abs(egg.x - this.chicken.x) < 48 && egg.state !== 'HATCH_BURST') {
            egg.state = 'HATCH_BURST';
            this.totalChicksHatched++;
            this.score += 25;
            const chick: ChickEntity = {
              x: egg.x,
              y: egg.y - 10,
              vx: (Math.random() > 0.5 ? 1 : -1) * (70 + Math.random() * 90),
              vy: -170 - Math.random() * 70,
              walkCycle: Math.random() * 10,
              facingLeft: Math.random() > 0.5,
              state: 'HOPPING',
              flutterTimer: 0.6
            };
            this.chicks.push(chick);
            if (events?.onEggHatch) {
              events.onEggHatch(egg.x, egg.y, chick);
            }
          }
        }
      }
    } else {
      // Autonomous roaming when idle
      const dx = this.chicken.targetX - this.chicken.x;
      const dy = this.chicken.targetY - this.chicken.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      const timeSinceTap = (performance.now() - this.lastUserTapTime) / 1000;
      if (timeSinceTap > 1.2 && (dist < 25 || this.roamTimer >= 3.5)) {
        this.roamTimer = 0;
        this.chicken.targetX = 70 + Math.random() * (vWidth - 140);
        this.chicken.targetY = 80 + Math.random() * (groundY - 170);
      }

      if (dist > 6) {
        const speed = Math.min(550, dist * 6 + 140);
        this.chicken.x += (dx / dist) * speed * dt;
        this.chicken.y += (dy / dist) * speed * dt;
        this.chicken.flap = Math.sin(time * 18) * 0.4;
        this.chicken.facingLeft = dx < 0;
      } else {
        this.chicken.flap = Math.sin(time * 6) * 0.15;
        this.chicken.y += Math.sin(time * 3.2) * 0.6;
      }
    }

    this.chicken.squash += (1.0 - this.chicken.squash) * (dt * 15);
    this.chicken.squawk += (0 - this.chicken.squawk) * (dt * 12);

    // Update Eggs Physics & Incubation
    for (let i = 0; i < this.eggs.length; i++) {
      const egg = this.eggs[i];
      const targetGround = groundY - ((egg as any).targetGroundOffsetY ?? 0);

      if (egg.state === 'FALLING') {
        egg.vy += 980 * dt;
        egg.x += egg.vx * dt;
        egg.y += egg.vy * dt;
        egg.rotation += egg.vRot;

        if (egg.y >= targetGround) {
          egg.y = targetGround;
          egg.vy = -egg.vy * 0.38;
          egg.vx *= 0.94;
          if (Math.abs(egg.vy) < 30) {
            egg.vy = 0;
            egg.state = 'INCUBATING';
          }
        }
      } else if (egg.state === 'INCUBATING') {
        egg.timer += dt;
        if (egg.timer >= 2.2 || this.eggs.length > 8) {
          egg.state = 'CRACK_1';
          egg.crackStage = 1;
          egg.timer = 0;
          if (events?.onEggCrack) events.onEggCrack(egg.x, egg.y);
        }
      } else if (egg.state === 'CRACK_1') {
        egg.timer += dt;
        egg.rotation = Math.sin(time * 25) * 0.15;
        if (egg.timer >= 0.45) {
          egg.state = 'CRACK_2';
          egg.crackStage = 3;
          egg.timer = 0;
          if (events?.onEggCrack) events.onEggCrack(egg.x, egg.y);
        }
      } else if (egg.state === 'CRACK_2') {
        egg.timer += dt;
        if (egg.timer >= 0.35) {
          egg.state = 'HATCH_BURST';
          this.totalChicksHatched++;
          // Cumulative score reward: hatching grants bonus points instead of overwriting score
          this.score += 20;

          const chick: ChickEntity = {
            x: egg.x,
            y: egg.y - 10,
            vx: (Math.random() > 0.5 ? 1 : -1) * (60 + Math.random() * 80),
            vy: (Math.random() - 0.5) * 70,
            walkCycle: Math.random() * 10,
            facingLeft: Math.random() > 0.5,
            state: 'SCAMPERING'
          };
          this.chicks.push(chick);

          if (events?.onEggHatch) {
            events.onEggHatch(egg.x, egg.y, chick);
          }
        }
      }
    }

    this.eggs = this.eggs.filter(e => e.state !== 'HATCH_BURST');

    // Update baby chicks roaming & boids separation
    const minChickX = 25;
    const maxChickX = vWidth - 25;
    const minChickY = Math.max(80, groundY - 260);
    const maxChickY = vHeight - 20;

    for (let i = 0; i < this.chicks.length; i++) {
      const chick = this.chicks[i];
      if (chick.flutterTimer && chick.flutterTimer > 0) {
        chick.flutterTimer -= dt;
        chick.vy += 440 * dt;
        chick.walkCycle += dt * 25;
        if (chick.flutterTimer <= 0) {
          chick.state = 'WANDERING';
          chick.isTapped = false;
        }
      }
      chick.x += chick.vx * dt;
      chick.y += chick.vy * dt;
      chick.walkCycle += dt * 12;

      for (let j = i + 1; j < this.chicks.length; j++) {
        const other = this.chicks[j];
        const cdx = other.x - chick.x;
        const cdy = other.y - chick.y;
        const distSq = cdx * cdx + cdy * cdy;
        if (distSq < 784 && distSq > 0.1) {
          const d = Math.sqrt(distSq);
          const push = (28 - d) * 35 * dt;
          chick.vx -= (cdx / d) * push;
          chick.vy -= (cdy / d) * push;
          other.vx += (cdx / d) * push;
          other.vy += (cdy / d) * push;
        }
      }

      if (chick.x < minChickX) { chick.x = minChickX; chick.vx = Math.abs(chick.vx); }
      if (chick.x > maxChickX) { chick.x = maxChickX; chick.vx = -Math.abs(chick.vx); }
      if (chick.y < minChickY) { chick.y = minChickY; chick.vy = Math.abs(chick.vy); }
      if (chick.y > maxChickY) { chick.y = maxChickY; chick.vy = -Math.abs(chick.vy); }

      chick.facingLeft = chick.vx < 0;
    }

    // Maintain sorted chicks by Y for depth layering (required by test T7.08)
    this.chicks.sort((a, b) => a.y - b.y);
  }
}
