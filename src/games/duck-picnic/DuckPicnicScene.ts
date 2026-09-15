/**
 * Mode 16: Picnic Ducks (Feed the Ducks & Celebration Dance)
 * Adventures of Trishu Mini-Game Suite
 * Strictly under 500 Lines of Code
 */

import { BaseScene } from '../base/BaseScene';
import { GameEngine } from '../../engine/GameEngine';
import { InputManager } from '../../engine/InputManager';
import { DisplayManager } from '../../engine/DisplayManager';
import { DuckEntity, PicnicFoodEntity, PicnicFoodType } from '../../types/game';
import { ParticleEngine } from '../../engine/ParticleEngine';
import { soundEngine } from '../../engine/SoundEngine';
import { Haptics } from '../../engine/Haptics';
import {
  renderPicnicEnvironment,
  renderPicnicBlanketAndBasket,
  renderPicnicFoods,
  renderPicnicDucks
} from './duckPicnicRenderer';

export class DuckPicnicScene extends BaseScene {
  public time: number = 0;
  public ducks: DuckEntity[] = [];
  public foods: PicnicFoodEntity[] = [];
  public particles: ParticleEngine;
  public round: number = 1;
  public isDancing: boolean = false;
  public danceTimer: number = 0;
  public nextFoodId: number = 1;
  public basketBounce: number = 0;
  private treatCycleIndex: number = 0;

  constructor(game: GameEngine) {
    super(game);
    this.particles = new ParticleEngine(150);
  }

  enter(): void {
    this.score = 0;
    this.round = 1;
    this.time = 0;
    this.isDancing = false;
    this.danceTimer = 0;
    this.foods = [];
    this.particles.clear();
    this.initDucks();
  }

  exit(): void {
    this.particles.clear();
    if (this.score > 0) {
      this.game.storage.saveHighScore('duckPicnic', this.score);
    }
  }

  private initDucks(): void {
    const isPortrait = this.game.display.isPortrait;
    const vWidth = this.game.display.vWidth;
    const vHeight = this.game.display.vHeight;
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

  public tossFood(targetX: number, targetY: number, type: PicnicFoodType = 'BREAD_CRUMB'): void {
    if (this.foods.length >= 8) this.foods.shift();

    const startX = targetX + (Math.random() - 0.5) * 40;
    const startY = targetY - 70;
    const points = type === 'BREAD_CRUMB' ? 15 : (type === 'GOLDEN_CRUST' ? 20 : (type === 'STRAWBERRY' ? 25 : 30));

    this.foods.push({
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
    });

    soundEngine.playSFX('eggPop');
    Haptics.tap();
  }

  public flingFromBasket(): void {
    const isPortrait = this.game.display.isPortrait;
    const vWidth = this.game.display.vWidth;
    const vHeight = this.game.display.vHeight;
    const basketPos = isPortrait ? { x: vWidth * 0.5, y: vHeight * 0.42 } : { x: vWidth * 0.32, y: vHeight * 0.42 };

    const treatTypes: PicnicFoodType[] = ['GOLDEN_CRUST', 'STRAWBERRY', 'CAKE_SLICE'];
    const selectedTreat = treatTypes[this.treatCycleIndex % treatTypes.length];
    this.treatCycleIndex++;

    const targetX = isPortrait
      ? 60 + Math.random() * (vWidth - 120)
      : vWidth * 0.35 + Math.random() * (vWidth * 0.55);
    const targetY = (isPortrait ? vHeight * 0.58 : vHeight * 0.56) + Math.random() * 120;

    this.basketBounce = 1.0;
    this.tossFood(targetX, targetY, selectedTreat);
    this.particles.spawnSparkles(basketPos.x, basketPos.y, 8);
    soundEngine.playSFX('whoosh');
  }

  update(dt: number, input: InputManager): void {
    this.time += dt;
    if (this.basketBounce > 0) this.basketBounce = Math.max(0, this.basketBounce - dt * 3.5);

    const isPortrait = this.game.display.isPortrait;
    const vWidth = this.game.display.vWidth;
    const vHeight = this.game.display.vHeight;
    const basketPos = isPortrait ? { x: vWidth * 0.5, y: vHeight * 0.42 } : { x: vWidth * 0.32, y: vHeight * 0.42 };
    const blanketPos = isPortrait ? { x: vWidth * 0.5, y: vHeight * 0.48 } : { x: vWidth * 0.34, y: vHeight * 0.50 };

    // Input Handling
    if (input.isActionJustPressed()) {
      const p = input.primaryPointer;
      if (p.inside && p.y > 60) {
        const dxBasket = p.x - basketPos.x;
        const dyBasket = p.y - basketPos.y;
        if (Math.sqrt(dxBasket * dxBasket + dyBasket * dyBasket) < 55) {
          this.flingFromBasket();
        } else {
          const clampedY = Math.max(vHeight * 0.45, Math.min(vHeight - 70, p.y));
          this.tossFood(p.x, clampedY, 'BREAD_CRUMB');
        }
      }
    }

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
        this.particles.spawnSparkles(blanketPos.x, blanketPos.y, 25);
        soundEngine.playSFX('toddlerGiggle');
      }
    }

    // Update Foods
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
          if (f.bounceCount <= 2) {
            f.vz = 2.2 / f.bounceCount;
            f.vx *= 0.6;
          } else {
            f.vz = 0;
            f.vx = 0;
            f.vy = 0;
          }
        }
      }

      if (f.eaten) {
        this.foods.splice(i, 1);
      }
    }

    // Update Ducks
    let allFull = true;

    // Allocate food to hungry ducks (one food per duck to avoid dogpiling)
    const availableFoods = this.foods.filter(f => !f.eaten);
    const claimedFoodIds = new Set<number>();
    const duckFoodTargets: Map<number, PicnicFoodEntity> = new Map();

    for (const d of this.ducks) {
      if (d.hunger >= d.maxHunger || this.isDancing) continue;
      let closestFood: PicnicFoodEntity | null = null;
      let minDist = 380;
      for (const f of availableFoods) {
        if (claimedFoodIds.has(f.id)) continue;
        const dx = f.x - d.x;
        const dy = f.y - d.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < minDist) {
          minDist = dist;
          closestFood = f;
        }
      }
      if (closestFood) {
        claimedFoodIds.add(closestFood.id);
        duckFoodTargets.set(d.id, closestFood);
      }
    }

    for (let i = 0; i < this.ducks.length; i++) {
      const d = this.ducks[i];
      if (d.hunger < d.maxHunger) allFull = false;

      d.peckTimer = Math.max(0, d.peckTimer - dt);
      d.wiggleTimer = Math.max(0, d.wiggleTimer - dt);
      d.quackTimer -= dt;

      if (d.quackTimer <= 0 && !this.isDancing) {
        const pitch = d.id === 0 ? 0.85 : (d.id === 1 ? 1.05 : 1.35);
        soundEngine.playSFX('duckQuack', { pitch });
        d.quackTimer = 3 + Math.random() * 4;
      }

      if (this.isDancing) {
        const targetOffsets = [{ x: -50, y: 10 }, { x: 0, y: -20 }, { x: 50, y: 10 }];
        const dest = { x: blanketPos.x + targetOffsets[d.id].x, y: blanketPos.y + targetOffsets[d.id].y };
        d.x += (dest.x - d.x) * Math.min(1.0, dt * 4);
        d.y += (dest.y - d.y) * Math.min(1.0, dt * 4);
        d.walkCycle += dt * 14;
        d.dancePhase += dt * 8;
        d.danceSpin += dt * 7;
        d.isHappy = true;

        if (Math.random() < 0.1) {
          this.particles.spawnSparkles(d.x, d.y - 25, 2);
        }
        continue;
      }

      // Feeding & Wander AI
      const targetFood = duckFoodTargets.get(d.id) || null;

      if (targetFood && d.hunger < d.maxHunger) {
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
          d.peckTimer = 0.35;
          d.wiggleTimer = 0.55;
          d.isHappy = true;
          this.score += targetFood.points;

          const pitch = d.id === 0 ? 0.9 : (d.id === 1 ? 1.1 : 1.4);
          soundEngine.playSFX('duckQuack', { pitch });
          soundEngine.playSFX('eggPop');
          Haptics.medium();

          this.particles.spawnSparkles(targetFood.x, targetFood.y, 10);
          this.particles.spawnScorePopup(d.x, d.y - 30, `+${targetFood.points} ✨`);
        }
      } else {
        d.state = 'WANDERING';
        d.stateTimer -= dt;
        if (d.stateTimer <= 0) {
          d.stateTimer = 1.4 + Math.random() * 2.6;
          // Sector-based wandering so ducks naturally stay spaced across the glade
          if (d.id === 0) {
            d.targetX = 40 + Math.random() * (vWidth * 0.32);
          } else if (d.id === 1) {
            d.targetX = vWidth * 0.35 + Math.random() * (vWidth * 0.30);
          } else {
            d.targetX = vWidth * 0.65 + Math.random() * (vWidth * 0.30 - 45);
          }
          d.targetY = (isPortrait ? vHeight * 0.54 : vHeight * 0.52) + Math.random() * (isPortrait ? 160 : 120);
        }

        if (d.targetX !== undefined && d.targetY !== undefined) {
          const dx = d.targetX - d.x;
          const dy = d.targetY - d.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > 10) {
            const speed = 35 * dt;
            d.x += (dx / dist) * speed;
            d.y += (dy / dist) * speed;
            d.facingLeft = dx < 0;
            d.walkCycle += dt * 5;
          }
        }
      }

      // Clamp duck positions inside field
      d.x = Math.max(35, Math.min(vWidth - 35, d.x));
      d.y = Math.max(vHeight * 0.48, Math.min(vHeight - 45, d.y));
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

    // Check Trigger for Grand Duck Dance
    if (allFull && !this.isDancing) {
      this.isDancing = true;
      this.danceTimer = 4.2;
      this.score += 150;
      soundEngine.playSFX('duckFanfare');
      this.particles.spawnScorePopup(blanketPos.x, blanketPos.y - 50, '🎉 DUCK DANCE FEAST! +150');
      this.particles.spawnSparkles(blanketPos.x, blanketPos.y, 30);
      Haptics.success();
    }

    this.particles.update(dt);
  }

  render(ctx: CanvasRenderingContext2D, _alpha: number, display: DisplayManager): void {
    const isPortrait = display.isPortrait;
    const vWidth = display.vWidth;
    const vHeight = display.vHeight;

    const blanketPos = isPortrait ? { x: vWidth * 0.5, y: vHeight * 0.48 } : { x: vWidth * 0.34, y: vHeight * 0.50 };
    const basketPos = isPortrait ? { x: vWidth * 0.5, y: vHeight * 0.42 } : { x: vWidth * 0.32, y: vHeight * 0.42 };
    const bW = isPortrait ? 180 : 210;
    const bH = isPortrait ? 95 : 110;

    renderPicnicEnvironment(ctx, vWidth, vHeight, isPortrait);
    renderPicnicBlanketAndBasket(ctx, blanketPos, basketPos, bW, bH, this.basketBounce, this.time, this.foods.length > 0, this.isDancing);
    renderPicnicFoods(ctx, this.foods);
    renderPicnicDucks(ctx, this.ducks, this.isDancing);

    this.particles.render(ctx);

    // Centered Top HUD Pill Badge (never overlaps HUD Home or controls)
    const scoreX = vWidth / 2;
    const scoreY = isPortrait ? 76 : Math.max(18, vHeight * 0.035);
    const badgeW = isPortrait ? 270 : 250;
    const badgeH = 46;

    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.48)';
    ctx.beginPath();
    ctx.roundRect(scoreX - badgeW / 2, scoreY, badgeW, badgeH, 23);
    ctx.fill();
    ctx.strokeStyle = '#FFE082';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 19px "Comic Sans MS", cursive, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`🦆 Round: ${this.round}  |  ★ ${this.score}`, scoreX, scoreY + badgeH / 2);

    if (this.isDancing) {
      ctx.fillStyle = 'rgba(216, 27, 96, 0.95)';
      ctx.beginPath();
      ctx.roundRect(scoreX - 150, scoreY + 54, 300, 44, 22);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 20px "Comic Sans MS", cursive, sans-serif';
      ctx.fillText('🎶 DUCK PICNIC DANCE! 🎶', scoreX, scoreY + 76);
    }
    ctx.restore();
  }

  getEntities(): Record<string, unknown> {
    return {
      ducks: this.ducks,
      foods: this.foods,
      round: this.round,
      isDancing: this.isDancing
    };
  }

  getModeState(): Record<string, unknown> {
    return {
      score: this.score,
      round: this.round,
      isDancing: this.isDancing,
      ducksFullCount: this.ducks.filter(d => d.hunger >= d.maxHunger).length
    };
  }
}
