/**
 * Mode 3: Chick Trail (Chick Maze / Sorting)
 * Adventures of Trishu 8-Game Suite
 * Strictly under 500 Lines of Code
 */

import { BaseScene } from './BaseScene';
import { GameEngine } from '../engine/GameEngine';
import { InputManager } from '../engine/InputManager';
import { DisplayManager } from '../engine/DisplayManager';
import { ChickEntity, SeedEntity } from '../types/game';
import { ParticleEngine } from '../engine/ParticleEngine';
import { soundEngine } from '../engine/SoundEngine';
import { Haptics } from '../engine/Haptics';
import { drawBabyChick } from '../graphics/characters/chickRenderer';
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
    const vWidth = this.game.display.vWidth;
    const vHeight = this.game.display.vHeight;

    for (let i = 0; i < 5; i++) {
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

  exit(): void {
    this.particles.clear();
    if (this.score > 0) {
      this.game.storage.saveHighScore('chickMaze', this.score);
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
    const vWidth = this.game.display.vWidth;
    const vHeight = this.game.display.vHeight;
    const coopDoor = isPortrait ? { x: vWidth / 2, y: 180, r: 50 } : { x: vWidth - 150, y: 160, r: 45 };

    // Tap to drop seed
    if (input.isActionJustPressed()) {
      const p = input.primaryPointer;
      if (p.inside && p.y > 60) {
        this.dropSeed(p.x, p.y);
      }
    }

    // Update chicks (Boids & Seed Attraction)
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
          const sIdx = this.seeds.indexOf(targetSeed);
          if (sIdx !== -1) {
            this.seeds.splice(sIdx, 1);
            this.score += 20;
            this.particles.spawnSparkles(targetSeed.x, targetSeed.y, 8);
            this.particles.spawnScorePopup(targetSeed.x, targetSeed.y - 15, '✨ Nom! +20');
            soundEngine.playSFX('eggPop');
            soundEngine.playSFX('toddlerGiggle');
          }
      } else {
        // Natural wandering noise
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
          // Separation
          chick.vx += (cdx / cDist) * 80 * dt;
          chick.vy += (cdy / cDist) * 80 * dt;
        } else if (cDist < 90 && !targetSeed) {
          // Alignment / soft cohesion
          chick.vx += (other.vx - chick.vx) * 0.1 * dt;
          chick.vy += (other.vy - chick.vy) * 0.1 * dt;
        }
      }

      // 3. Coop gentle attraction when nearby
      const toCoopDx = coopDoor.x - chick.x;
      const toCoopDy = coopDoor.y - chick.y;
      const distToCoop = Math.sqrt(toCoopDx * toCoopDx + toCoopDy * toCoopDy);
      if (distToCoop < 160 && distToCoop > 2 && !targetSeed) {
        chick.vx += (toCoopDx / distToCoop) * 60 * dt;
        chick.vy += (toCoopDy / distToCoop) * 60 * dt;
      }

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
        this.particles.spawnConfetti(coopDoor.x, coopDoor.y, 25);
        this.particles.spawnSparkles(coopDoor.x, coopDoor.y, 14);
        this.particles.spawnScorePopup(coopDoor.x, coopDoor.y - 25, '+100');
        soundEngine.playSFX('fanfare');
        Haptics.medium();
        this.game.storage.saveHighScore('chickMaze', this.score);
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
    const vWidth = display.vWidth;
    const vHeight = display.vHeight;

    // Grass Background
    ctx.fillStyle = '#81C784';
    ctx.fillRect(0, 0, vWidth, vHeight);

    // Subtle grass texture clovers
    ctx.fillStyle = '#66BB6A';
    for (let gx = 60; gx < vWidth - 40; gx += 90) {
      for (let gy = 140; gy < vHeight - 40; gy += 100) {
        ctx.beginPath();
        ctx.arc(gx, gy, 3.5, 0, Math.PI * 2);
        ctx.arc(gx + 4, gy + 3, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Wooden Pasture Fences
    ctx.fillStyle = PALETTE.FENCE_WOOD;
    ctx.strokeStyle = PALETTE.FENCE_OUTLINE;
    ctx.lineWidth = 3;
    if (isPortrait) {
      ctx.beginPath();
      ctx.roundRect(40, vHeight * 0.38, vWidth * 0.45, 16, 6);
      ctx.roundRect(vWidth * 0.52, vHeight * 0.62, vWidth * 0.44, 16, 6);
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
    const coopX = isPortrait ? vWidth / 2 : vWidth - 150;
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

    // Red Pitch Roof
    ctx.fillStyle = PALETTE.COOP_ROOF;
    ctx.beginPath();
    ctx.moveTo(-55, -30);
    ctx.lineTo(0, -65);
    ctx.lineTo(55, -30);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Arched Doorway
    ctx.fillStyle = '#4E342E';
    ctx.beginPath();
    ctx.arc(0, 15, 18, Math.PI, 0);
    ctx.fill();
    ctx.restore();

    // Seeds with golden shimmer
    for (let sIdx = 0; sIdx < this.seeds.length; sIdx++) {
      const seed = this.seeds[sIdx];
      ctx.save();
      if (sIdx === this.seeds.length - 1) {
        const pulse = Math.sin(this.time * 6) * 4;
        ctx.strokeStyle = 'rgba(255, 235, 59, 0.4)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(seed.x, seed.y, 9 + pulse, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.fillStyle = PALETTE.SEED_CORN;
      ctx.strokeStyle = PALETTE.SEED_OUTLINE;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(seed.x, seed.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // Chicks
    for (const chick of this.chicks) {
      drawBabyChick(ctx, chick.x, chick.y, isPortrait ? 1.15 : 1.0, {
        walkCycle: chick.walkCycle,
        facingLeft: chick.facingLeft,
        isPeeping: (chick.walkCycle * 2) % 4 < 1.2,
        hopY: Math.sin(chick.walkCycle) * 2
      });
    }

    this.particles.render(ctx);

    // Score Badge (Positioned below HUD in portrait)
    const scoreX = vWidth / 2;
    const scoreY = isPortrait ? 76 : Math.max(18, vHeight * 0.035);
    const badgeW = isPortrait ? 270 : 240;
    const badgeH = 46;

    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.roundRect(scoreX - badgeW / 2, scoreY, badgeW, badgeH, 23);
    ctx.fill();
    ctx.strokeStyle = '#C8E6C9';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 20px "Comic Sans MS", cursive, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`Saved Chicks: ${this.coopSavedCount}  |  ★ ${this.score}`, scoreX, scoreY + badgeH / 2);
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
