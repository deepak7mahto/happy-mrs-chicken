/**
 * Adventures of Trishu — Mode 16: Picnic Ducks
 * Pure Game Simulation Logic (Headless & Testable)
 */

import { DuckEntity, PicnicFoodEntity, PicnicFoodType } from '../../types/game';

export interface DuckPicnicEvents {
  onFoodTossed?: (food: PicnicFoodEntity) => void;
  onDuckFed?: (duck: DuckEntity, food: PicnicFoodEntity) => void;
  onDanceCelebration?: () => void;
}

export class DuckPicnicLogic {
  public ducks: DuckEntity[] = [];
  public foods: PicnicFoodEntity[] = [];
  public score: number = 0;
  public round: number = 1;
  public isDancing: boolean = false;
  public danceTimer: number = 0;
  public nextFoodId: number = 1;
  public basketBounce: number = 0;
  public foodsFedCount: number = 0;
  public frog = { x: 0, y: 0, radius: 18, tongueTimer: 0 };
  private treatCycleIndex: number = 0;

  public reset(vWidth: number, vHeight: number, isPortrait: boolean): void {
    this.score = 0;
    this.round = 1;
    this.isDancing = false;
    this.danceTimer = 0;
    this.foodsFedCount = 0;
    this.foods = [];
    this.basketBounce = 0;

    const hillY = isPortrait ? vHeight * 0.46 : vHeight * 0.44;
    const pondX = isPortrait ? vWidth - 40 : vWidth - 80;
    const pondY = hillY + 30;
    this.frog = { x: pondX - 20, y: pondY + 5, radius: 18, tongueTimer: 0 };

    this.initDucks(vWidth, vHeight, isPortrait);
  }

  public snapFrogTongue(): boolean {
    this.frog.tongueTimer = 0.45;
    this.score += 25;
    return true;
  }

  public findHitDuck(x: number, y: number): DuckEntity | null {
    for (const d of this.ducks) {
      if (Math.hypot(x - d.x, y - d.y) <= 35 * d.scale) {
        return d;
      }
    }
    return null;
  }

  public findHitFrog(x: number, y: number): boolean {
    return Math.hypot(x - this.frog.x, y - this.frog.y) <= this.frog.radius + 14;
  }

  public initDucks(vWidth: number, vHeight: number, isPortrait: boolean): void {
    const baseY = isPortrait ? vHeight * 0.65 : vHeight * 0.62;
    this.ducks = [
      {
        id: 0,
        name: 'Mama Ducky',
        x: isPortrait ? vWidth * 0.3 : vWidth * 0.28,
        y: baseY - 20,
        vx: 0,
        vy: 0,
        scale: 1.15,
        hunger: 0,
        maxHunger: 3,
        walkCycle: 0,
        facingLeft: false,
        state: 'WANDERING',
        stateTimer: 2,
        peckTimer: 0,
        wiggleTimer: 0,
        quackTimer: 1.5,
        dancePhase: 0,
        danceSpin: 0,
        isHappy: false,
        featherTuft: true
      },
      {
        id: 1,
        name: 'Pip',
        x: isPortrait ? vWidth * 0.68 : vWidth * 0.52,
        y: baseY + 30,
        vx: 0,
        vy: 0,
        scale: 0.95,
        hunger: 0,
        maxHunger: 3,
        walkCycle: 1,
        facingLeft: true,
        state: 'WANDERING',
        stateTimer: 1.8,
        peckTimer: 0,
        wiggleTimer: 0,
        quackTimer: 2.2,
        dancePhase: 0,
        danceSpin: 0,
        isHappy: false,
        featherTuft: false
      },
      {
        id: 2,
        name: 'Baby Squeak',
        x: isPortrait ? vWidth * 0.48 : vWidth * 0.72,
        y: baseY + 15,
        vx: 0,
        vy: 0,
        scale: 0.76,
        hunger: 0,
        maxHunger: 3,
        walkCycle: 2,
        facingLeft: false,
        state: 'WANDERING',
        stateTimer: 1.5,
        peckTimer: 0,
        wiggleTimer: 0,
        quackTimer: 1.0,
        dancePhase: 0,
        danceSpin: 0,
        isHappy: false,
        featherTuft: false
      }
    ];
  }

  public tossFood(targetX: number, targetY: number, type: PicnicFoodType = 'BREAD_CRUMB', events?: DuckPicnicEvents): PicnicFoodEntity {
    if (this.foods.length >= 8) this.foods.shift();

    const startX = targetX + (Math.random() - 0.5) * 40;
    const startY = targetY - 70;
    const points = type === 'BREAD_CRUMB' ? 15 : (type === 'GOLDEN_CRUST' ? 20 : (type === 'STRAWBERRY' ? 25 : 30));

    const food: PicnicFoodEntity = {
      id: this.nextFoodId++,
      x: startX,
      y: startY,
      groundY: targetY,
      z: 60,
      vz: 4,
      vx: (Math.random() - 0.5) * 30,
      vy: 20,
      type,
      points,
      bounceCount: 0,
      rotation: Math.random() * Math.PI,
      vRot: (Math.random() - 0.5) * 6,
      eaten: false,
      age: 0
    };

    this.foods.push(food);
    if (events?.onFoodTossed) events.onFoodTossed(food);
    return food;
  }

  public flingFromBasket(vWidth: number, vHeight: number, isPortrait: boolean, events?: DuckPicnicEvents): void {
    const treatTypes: PicnicFoodType[] = ['GOLDEN_CRUST', 'STRAWBERRY', 'CAKE_SLICE'];
    const selectedTreat = treatTypes[this.treatCycleIndex % treatTypes.length];
    this.treatCycleIndex++;

    const targetX = isPortrait
      ? 60 + Math.random() * (vWidth - 120)
      : vWidth * 0.35 + Math.random() * (vWidth * 0.55);
    const targetY = (isPortrait ? vHeight * 0.58 : vHeight * 0.56) + Math.random() * 120;

    this.basketBounce = 1.0;
    this.tossFood(targetX, targetY, selectedTreat, events);
  }

  public update(
    dt: number,
    time: number,
    vWidth: number,
    vHeight: number,
    isPortrait: boolean,
    events?: DuckPicnicEvents
  ): void {
    if (this.basketBounce > 0) this.basketBounce = Math.max(0, this.basketBounce - dt * 3.5);
    if (this.frog.tongueTimer > 0) this.frog.tongueTimer = Math.max(0, this.frog.tongueTimer - dt);

    // Dance Mode State
    if (this.isDancing) {
      this.danceTimer -= dt;
      if (this.danceTimer <= 0) {
        this.isDancing = false;
        this.round++;
        for (const d of this.ducks) {
          d.hunger = 0;
          d.state = 'WANDERING';
          d.stateTimer = 1 + Math.random() * 2;
        }
      }
    }

    // Update Foods Physics
    for (let i = this.foods.length - 1; i >= 0; i--) {
      const f = this.foods[i];
      f.age += dt;
      f.rotation += f.vRot * dt;

      if (f.z > 0) {
        f.vz -= 9.8 * dt * 4;
        f.z += f.vz;
        f.x += f.vx * dt;
        f.y += f.vy * dt;

        if (f.z <= 0) {
          f.z = 0;
          f.bounceCount++;
          if (f.bounceCount < 2) {
            f.vz = 2.5 / f.bounceCount;
            f.vx *= 0.5;
            f.vy *= 0.5;
          } else {
            f.vz = 0;
            f.vx = 0;
            f.vy = 0;
          }
        }
      }

      if (f.age > 16.0 || f.eaten) {
        this.foods.splice(i, 1);
      }
    }

    // Update Ducks
    const pondMinY = isPortrait ? vHeight * 0.52 : vHeight * 0.46;
    const pondMaxY = vHeight - 45;

    // Check if all ducks are satisfied to trigger dance
    const allFull = this.ducks.length > 0 && this.ducks.every(duck => duck.hunger >= duck.maxHunger);
    if (allFull && !this.isDancing) {
      this.isDancing = true;
      this.danceTimer = 4.2;
      this.score += 150;
      if (events?.onDanceCelebration) events.onDanceCelebration();
    }

    for (let i = 0; i < this.ducks.length; i++) {
      const d = this.ducks[i];
      d.walkCycle += dt * 8;

      if (d.peckTimer > 0) d.peckTimer -= dt;
      if (d.wiggleTimer > 0) d.wiggleTimer -= dt;

      // Find nearest food
      let targetFood: PicnicFoodEntity | null = null;
      let minFoodDist = Infinity;
      for (const f of this.foods) {
        if (f.eaten) continue;
        const dist = Math.hypot(f.x - d.x, f.y - d.y);
        if (dist < minFoodDist) {
          minFoodDist = dist;
          targetFood = f;
        }
      }

      if (this.isDancing) {
        d.dancePhase += dt * 4;
        d.danceSpin += dt * 3.5;
        d.vx = Math.sin(d.dancePhase) * 40 * dt;
        d.vy = Math.cos(d.dancePhase * 0.8) * 20 * dt;
        d.x += d.vx;
        d.y += d.vy;
      } else if (targetFood && minFoodDist < 300) {
        d.state = 'SEEKING';
        const dx = targetFood.x - d.x;
        const dy = targetFood.y - d.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 18) {
          const speed = 115 * dt;
          d.vx = (dx / dist) * speed;
          d.vy = (dy / dist) * speed;
          d.x += d.vx;
          d.y += d.vy;
          d.facingLeft = dx < 0;
          d.walkCycle += dt * 12;
        } else {
          targetFood.eaten = true;
          d.hunger = Math.min(d.maxHunger, d.hunger + 1);
          this.foodsFedCount++;
          d.peckTimer = 0.35;
          d.wiggleTimer = 0.55;
          d.isHappy = true;
          this.score += targetFood.points;

          if (events?.onDuckFed) events.onDuckFed(d, targetFood);
        }
      } else {
        d.state = 'WANDERING';
        d.stateTimer -= dt;
        if (d.stateTimer <= 0) {
          d.stateTimer = 1.4 + Math.random() * 2.6;
          d.vx = (Math.random() - 0.5) * 45 * dt;
          d.vy = (Math.random() - 0.5) * 35 * dt;
          d.facingLeft = d.vx < 0;
        }
        d.x += d.vx;
        d.y += d.vy;
      }

      // Clamp duck positions
      d.x = Math.max(35, Math.min(vWidth - 35, d.x));
      d.y = Math.max(pondMinY, Math.min(pondMaxY, d.y));
    }

    // Duck-to-Duck Separation Force (prevents stacking & keeps meter bars distinct)
    const minSeparation = 56;
    for (let i = 0; i < this.ducks.length; i++) {
      for (let j = i + 1; j < this.ducks.length; j++) {
        const d1 = this.ducks[i];
        const d2 = this.ducks[j];
        let dx = d1.x - d2.x;
        let dy = d1.y - d2.y;
        let dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < minSeparation) {
          if (dist < 0.001) {
            dx = (i - j) * 4;
            dy = (i - j) * 4;
            dist = Math.sqrt(dx * dx + dy * dy);
          }
          const overlap = (minSeparation - dist) / dist;
          const pushX = dx * overlap * 0.5;
          const pushY = dy * overlap * 0.5;
          const pushFactor = Math.min(1.0, dt * 7);
          d1.x += pushX * pushFactor;
          d1.y += pushY * pushFactor;
          d2.x -= pushX * pushFactor;
          d2.y -= pushY * pushFactor;
        }
      }
    }
  }
}
