/**
 * Mode 17: Hungry Farmyard Friends - Simulation Logic
 * Headless simulation for toddler animal feeding
 * Strictly under 500 lines
 */

import { SnackType, SnackItem, SeatedAnimal, FlyingFood } from './types';

export interface FeedingArrivalEvent {
  animalIndex: number;
  snackType: SnackType;
  favored: boolean;
}

export class AnimalFeedingLogic {
  public animals: SeatedAnimal[] = [];
  public snacks: SnackItem[] = [];
  public activeFlyingFood: FlyingFood[] = [];
  public score: number = 0;
  public totalFed: number = 0;
  public width: number = 960;
  public height: number = 540;
  private nextFoodId: number = 1;

  public reset(w: number = 960, h: number = 540): void {
    this.width = w;
    this.height = h;
    this.score = 0;
    this.totalFed = 0;
    this.activeFlyingFood = [];
    this.nextFoodId = 1;

    this.animals = [
      {
        id: 'leo',
        name: 'Leo',
        x: 0,
        y: 0,
        width: 140,
        height: 160,
        mouthX: 0,
        mouthY: 0,
        mouthOpen: 0,
        chewTimer: 0,
        tummyRubTimer: 0,
        favSnack: 'COOKIE',
        fedCount: 0,
        chewCycle: 0
      },
      {
        id: 'chicken',
        name: 'Clucky',
        x: 0,
        y: 0,
        width: 130,
        height: 150,
        mouthX: 0,
        mouthY: 0,
        mouthOpen: 0,
        chewTimer: 0,
        tummyRubTimer: 0,
        favSnack: 'BERRY',
        fedCount: 0,
        chewCycle: 0
      },
      {
        id: 'mimi',
        name: 'Mimi',
        x: 0,
        y: 0,
        width: 130,
        height: 160,
        mouthX: 0,
        mouthY: 0,
        mouthOpen: 0,
        chewTimer: 0,
        tummyRubTimer: 0,
        favSnack: 'CARROT',
        fedCount: 0,
        chewCycle: 0
      }
    ];

    const snackDefs: { type: SnackType; name: string; emoji: string; color: string }[] = [
      { type: 'CARROT', name: 'Carrot', emoji: '🥕', color: '#FF7043' },
      { type: 'WATERMELON', name: 'Watermelon', emoji: '🍉', color: '#4CAF50' },
      { type: 'APPLE', name: 'Apple', emoji: '🍎', color: '#E53935' },
      { type: 'COOKIE', name: 'Cookie', emoji: '🍪', color: '#D7CCC8' },
      { type: 'BERRY', name: 'Berry', emoji: '🍓', color: '#E91E63' }
    ];

    this.snacks = snackDefs.map((def, idx) => ({
      id: idx + 1,
      type: def.type,
      name: def.name,
      emoji: def.emoji,
      color: def.color,
      x: 0,
      y: 0,
      radius: 36
    }));

    this.layout(w, h);
  }

  public layout(w: number, h: number): void {
    this.width = w;
    this.height = h;

    const isPortrait = h > w;
    const animalY = isPortrait ? h * 0.32 : h * 0.36;
    const animalSpacing = w / (this.animals.length + 1);

    this.animals.forEach((animal, i) => {
      animal.x = animalSpacing * (i + 1);
      animal.y = animalY;
      animal.mouthX = animal.x;
      animal.mouthY = animal.y - (animal.height * 0.1);
    });

    const snackY = isPortrait ? h * 0.84 : h * 0.82;
    const snackSpacing = w / (this.snacks.length + 1);

    this.snacks.forEach((snack, i) => {
      snack.x = snackSpacing * (i + 1);
      snack.y = snackY;
    });
  }

  public launchSnack(snackIndex: number, targetAnimalIndex?: number): boolean {
    if (snackIndex < 0 || snackIndex >= this.snacks.length) return false;
    const snack = this.snacks[snackIndex];

    let targetIdx: number;
    if (targetAnimalIndex !== undefined && targetAnimalIndex >= 0 && targetAnimalIndex < this.animals.length) {
      targetIdx = targetAnimalIndex;
    } else {
      // Pick animal who likes this snack or has lowest fedCount
      const favIdx = this.animals.findIndex(a => a.favSnack === snack.type);
      if (favIdx >= 0) {
        targetIdx = favIdx;
      } else {
        targetIdx = Math.floor(Math.random() * this.animals.length);
      }
    }

    const targetAnimal = this.animals[targetIdx];
    const duration = 0.65;

    const flying: FlyingFood = {
      id: this.nextFoodId++,
      snackType: snack.type,
      emoji: snack.emoji,
      color: snack.color,
      startX: snack.x,
      startY: snack.y,
      targetX: targetAnimal.mouthX,
      targetY: targetAnimal.mouthY,
      currentX: snack.x,
      currentY: snack.y,
      progress: 0,
      duration,
      targetAnimalIndex: targetIdx,
      rotation: 0
    };

    this.activeFlyingFood.push(flying);
    return true;
  }

  public rubTummy(animalIndex: number): boolean {
    if (animalIndex < 0 || animalIndex >= this.animals.length) return false;
    const animal = this.animals[animalIndex];
    animal.tummyRubTimer = 0.8;
    this.score += 10;
    return true;
  }

  public findSnackAt(x: number, y: number): number {
    return this.snacks.findIndex(s => {
      const dx = s.x - x;
      const dy = s.y - y;
      return Math.hypot(dx, dy) <= s.radius * 1.5;
    });
  }

  public findAnimalAt(x: number, y: number): number {
    return this.animals.findIndex(a => {
      const halfW = a.width * 0.6;
      const halfH = a.height * 0.6;
      return Math.abs(x - a.x) <= halfW && Math.abs(y - a.y) <= halfH;
    });
  }

  public update(dt: number): FeedingArrivalEvent[] {
    const arrivals: FeedingArrivalEvent[] = [];

    // Update flying snacks
    for (let i = this.activeFlyingFood.length - 1; i >= 0; i--) {
      const food = this.activeFlyingFood[i];
      food.progress += dt / food.duration;
      food.rotation += dt * 4.0;

      const p = Math.min(1.0, food.progress);
      // Parabolic flight arc
      const arcHeight = -130 * Math.sin(p * Math.PI);
      food.currentX = food.startX + (food.targetX - food.startX) * p;
      food.currentY = food.startY + (food.targetY - food.startY) * p + arcHeight;

      // Animal mouth anticipation when food is near
      const target = this.animals[food.targetAnimalIndex];
      if (target) {
        if (p > 0.4 && p < 1.0) {
          target.mouthOpen = Math.min(1.0, target.mouthOpen + dt * 4.0);
        }
      }

      if (food.progress >= 1.0) {
        // Food arrived!
        this.activeFlyingFood.splice(i, 1);
        if (target) {
          target.mouthOpen = 0;
          target.chewTimer = 1.2;
          target.fedCount++;
          this.totalFed++;

          const isFav = target.favSnack === food.snackType;
          const points = isFav ? 50 : 25;
          this.score += points;

          arrivals.push({
            animalIndex: food.targetAnimalIndex,
            snackType: food.snackType,
            favored: isFav
          });
        }
      }
    }

    // Update animals
    for (const animal of this.animals) {
      if (animal.chewTimer > 0) {
        animal.chewTimer -= dt;
        animal.chewCycle += dt * 10;
        if (animal.chewTimer <= 0) {
          animal.chewTimer = 0;
        }
      }
      if (animal.tummyRubTimer > 0) {
        animal.tummyRubTimer -= dt;
        if (animal.tummyRubTimer <= 0) {
          animal.tummyRubTimer = 0;
        }
      }
      if (this.activeFlyingFood.length === 0 && animal.chewTimer <= 0) {
        animal.mouthOpen = Math.max(0, animal.mouthOpen - dt * 3.0);
      }
    }

    return arrivals;
  }
}
