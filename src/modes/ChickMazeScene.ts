import { BaseScene } from './BaseScene';
import { GameEngine } from '../engine/GameEngine';
import { InputManager } from '../engine/InputManager';
import { DisplayManager } from '../engine/DisplayManager';
import { ChickEntity, SeedEntity } from '../types/game';
import { ParticleEngine } from '../engine/ParticleEngine';
import { soundEngine } from '../engine/SoundEngine';
import { Haptics } from '../engine/Haptics';
import { drawBabyChick } from '../graphics/chickRenderer';
import { PALETTE } from '../graphics/palette';

export class ChickMazeScene extends BaseScene {
  public time: number = 0;
  public chicks: ChickEntity[] = [];
  public seeds: SeedEntity[] = [];
  public coopSavedCount: number = 0;
  public particles: ParticleEngine;

  constructor(game: GameEngine) {
    super(game);
    this.particles = new ParticleEngine(150);
  }

  enter(): void {
    this.score = 0;
    this.coopSavedCount = 0;
    this.seeds = [];
    this.particles.clear();
    this.time = 0;
    this.chicks = [];
    const isPortrait = this.game.display.isPortrait;

    for (let i = 0; i < 5; i++) {
      this.chicks.push({
        x: isPortrait ? 100 + Math.random() * 340 : 100 + Math.random() * 200,
        y: isPortrait ? 400 + Math.random() * 420 : 200 + Math.random() * 220,
        vx: (Math.random() - 0.5) * 35,
        vy: (Math.random() - 0.5) * 35,
        walkCycle: 0,
        state: 'WANDERING'
      });
    }
  }

  dropSeed(x: number, y: number): void {
    if (this.seeds.length >= 6) this.seeds.shift();
    this.seeds.push({ x, y, remaining: 1 });
    soundEngine.playSFX('seedDrop');
    Haptics.tap();
  }

  update(dt: number, input: InputManager): void {
    this.time += dt;
    const isPortrait = this.game.display.isPortrait;
    const coopDoor = isPortrait ? { x: 270, y: 180, r: 50 } : { x: 810, y: 160, r: 45 };

    // Header Back button (only if pointer physically pressed in top-left)
    const ptr = input.primaryPointer;
    if (ptr && ptr.isDown && input.isActionJustPressed() && input.pointers.size > 0 && ptr.x <= 120 && ptr.y <= 70) {
      this.game.storage.saveHighScore('chickMaze', this.coopSavedCount);
      Haptics.tap();
      this.game.changeScene('MENU');
      return;
    }

    // Tap to drop seed
    if (input.isActionJustPressed()) {
      const p = input.primaryPointer;
      if (p.inside && p.y > 80) {
        this.dropSeed(p.x, p.y);
      }
    }

    // Update chicks (Boids & Seed Attraction)
    for (let i = this.chicks.length - 1; i >= 0; i--) {
      const chick = this.chicks[i];

      // 1. Seed attraction
      let targetSeed: SeedEntity | null = null;
      let minSeedDist = 200;
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
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        chick.vx += (dx / dist) * 75 * dt;
        chick.vy += (dy / dist) * 75 * dt;

        // Eat seed
        if (dist < 14) {
          const sIdx = this.seeds.indexOf(targetSeed);
          if (sIdx !== -1) {
            this.seeds.splice(sIdx, 1);
            this.particles.spawnSparkles(targetSeed.x, targetSeed.y, 4);
          }
        }
      } else {
        chick.vx += (Math.random() - 0.5) * 40 * dt;
        chick.vy += (Math.random() - 0.5) * 40 * dt;
      }

      const speed = Math.sqrt(chick.vx * chick.vx + chick.vy * chick.vy);
      if (speed > 70) {
        chick.vx = (chick.vx / speed) * 70;
        chick.vy = (chick.vy / speed) * 70;
      }

      chick.x += chick.vx * dt;
      chick.y += chick.vy * dt;
      chick.walkCycle += dt * 10;
      chick.facingLeft = chick.vx < 0;

      const minX = 60;
      const maxX = isPortrait ? 480 : 900;
      const minY = 120;
      const maxY = isPortrait ? 900 : 500;
      chick.x = Math.max(minX, Math.min(maxX, chick.x));
      chick.y = Math.max(minY, Math.min(maxY, chick.y));

      // Coop Entry
      const cdx = chick.x - coopDoor.x;
      const cdy = chick.y - coopDoor.y;
      if (cdx * cdx + cdy * cdy <= coopDoor.r * coopDoor.r) {
        this.coopSavedCount++;
        this.score += 100;
        this.particles.spawnSparkles(coopDoor.x, coopDoor.y, 12);
        soundEngine.playSFX('fanfare');
        Haptics.medium();
        this.chicks.splice(i, 1);

        if (this.chicks.length === 0) {
          this.enter();
        }
      }
    }

    this.particles.update(dt);
  }

  render(ctx: CanvasRenderingContext2D, _alpha: number, display: DisplayManager): void {
    const isPortrait = display.isPortrait;
    ctx.fillStyle = '#81C784';
    ctx.fillRect(0, 0, display.vWidth, display.vHeight);

    // Fences
    ctx.fillStyle = PALETTE.FENCE_WOOD;
    ctx.strokeStyle = PALETTE.FENCE_OUTLINE;
    ctx.lineWidth = 3;
    if (isPortrait) {
      ctx.beginPath();
      ctx.roundRect(60, 360, 240, 16, 6);
      ctx.roundRect(240, 580, 240, 16, 6);
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.roundRect(250, 150, 20, 230, 8);
      ctx.roundRect(520, 200, 20, 280, 8);
      ctx.fill();
      ctx.stroke();
    }

    // Hen Coop
    const coopX = isPortrait ? 270 : 810;
    const coopY = isPortrait ? 180 : 160;
    ctx.save();
    ctx.translate(coopX, coopY);
    ctx.fillStyle = PALETTE.COOP_WALL;
    ctx.strokeStyle = PALETTE.COOP_DOOR;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(-45, -35, 90, 70, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = PALETTE.COOP_ROOF;
    ctx.beginPath();
    ctx.moveTo(-55, -30);
    ctx.lineTo(0, -65);
    ctx.lineTo(55, -30);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#4E342E';
    ctx.beginPath();
    ctx.arc(0, 15, 18, Math.PI, 0);
    ctx.fill();
    ctx.restore();

    // Seeds
    for (const seed of this.seeds) {
      ctx.fillStyle = PALETTE.SEED_CORN;
      ctx.strokeStyle = PALETTE.SEED_OUTLINE;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(seed.x, seed.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    // Chicks
    for (const chick of this.chicks) {
      drawBabyChick(ctx, chick.x, chick.y, isPortrait ? 1.15 : 1.0, {
        walkCycle: chick.walkCycle,
        facingLeft: chick.facingLeft
      });
    }

    this.particles.render(ctx);

    // Top HUD
    ctx.save();
    ctx.fillStyle = '#E53935';
    ctx.beginPath();
    ctx.roundRect(20, 15, 75, 38, 12);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 16px "Comic Sans MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⬅ Home', 57, 40);

    const scoreX = isPortrait ? 270 : 480;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.roundRect(scoreX - 100, 15, 200, 40, 15);
    ctx.fill();
    ctx.fillStyle = '#FFD54F';
    ctx.font = 'bold 20px "Comic Sans MS", sans-serif';
    ctx.fillText(`Saved: ${this.coopSavedCount}`, scoreX, 42);
    ctx.restore();
  }

  override getEntities(): Record<string, unknown> {
    return {
      eggs: [],
      chicks: this.chicks.map(c => ({ x: c.x, y: c.y, state: c.state })),
      chicksCount: this.chicks.length,
      puddles: [],
      seeds: this.seeds.map(s => ({ x: s.x, y: s.y, remaining: s.remaining })),
      particles: this.particles.active
    };
  }

  override getModeState(): Record<string, unknown> {
    return { timer: 0, feverMeter: 0, multiplier: 1, coopSavedCount: this.coopSavedCount, isOverheating: false };
  }
}
