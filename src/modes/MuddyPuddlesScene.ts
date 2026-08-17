/**
 * Mode 2: Muddy Puddles
 * Peppa Pig: Happy Mrs Chicken 8-Game Deluxe Expansion Suite
 * Strictly under 500 Lines of Code
 */

import { BaseScene } from './BaseScene';
import { GameEngine } from '../engine/GameEngine';
import { InputManager } from '../engine/InputManager';
import { DisplayManager } from '../engine/DisplayManager';
import { PuddleEntity } from '../types/game';
import { CharacterAnimState } from '../types/characters';
import { ParticleEngine } from '../engine/ParticleEngine';
import { soundEngine } from '../engine/SoundEngine';
import { Haptics } from '../engine/Haptics';
import { drawLandscapeSkyHills, drawMuddyPuddle } from '../graphics/environmentRenderer';
import { drawPeppaPig } from '../graphics/characters/peppaRenderer';
import { createCharacterAnimState, updateCharacterAnimState } from '../graphics/animations';

export class MuddyPuddlesScene extends BaseScene {
  public time: number = 0;
  public timer: number = 60.0;
  public puddles: PuddleEntity[] = [];
  public particles: ParticleEngine;
  public animState: CharacterAnimState;
  public peppa = { x: 270, y: 410, vx: 0, jumpY: 0, isJumping: false, jumpV: 0, squish: 1.0 };
  public multiplier: number = 1;
  public muddyBootsTimer: number = 0;
  private spawnTimer: number = 0;

  constructor(game: GameEngine) {
    super(game);
    this.particles = new ParticleEngine(150);
    this.animState = createCharacterAnimState();
  }

  enter(): void {
    this.score = 0;
    this.timer = 60.0;
    this.multiplier = 1;
    this.muddyBootsTimer = 0;
    this.puddles = [];
    this.particles.clear();
    this.animState = createCharacterAnimState();

    const isPortrait = this.game.display.isPortrait;
    const groundY = isPortrait ? this.game.display.vHeight - 150 : this.game.display.vHeight - 90;
    this.peppa = {
      x: this.game.display.vWidth / 2,
      y: groundY,
      vx: 0,
      jumpY: 0,
      isJumping: false,
      jumpV: 0,
      squish: 1.0
    };
    this.spawnPuddle();
    this.spawnPuddle();
  }

  exit(): void {
    this.particles.clear();
    if (this.score > 0) {
      this.game.storage.saveHighScore('MUDDY_PUDDLES', this.score);
    }
  }

  spawnPuddle(): void {
    if (this.puddles.length >= 5) return;
    const isPortrait = this.game.display.isPortrait;
    const isGolden = Math.random() < 0.15;
    const minX = 70;
    const maxX = this.game.display.vWidth - 70;
    const groundY = isPortrait ? this.game.display.vHeight - 150 : this.game.display.vHeight - 90;

    this.puddles.push({
      x: minX + Math.random() * (maxX - minX),
      y: groundY - 20 + Math.random() * 40,
      rx: isGolden ? 52 : 44 + Math.random() * 16,
      ry: isGolden ? 26 : 22 + Math.random() * 8,
      type: isGolden ? 'GOLDEN' : 'STANDARD',
      lifetime: 8.0,
      ripplePhase: 0
    });
  }

  jump(): void {
    if (this.peppa.isJumping) return;
    this.peppa.isJumping = true;
    this.peppa.jumpV = -460;
    this.peppa.squish = 1.25;
    Haptics.tap();
  }

  update(dt: number, input: InputManager): void {
    this.time += dt;
    if (this.timer > 0) {
      this.timer = Math.max(0, this.timer - dt);
    }
    if (this.muddyBootsTimer > 0) {
      this.muddyBootsTimer = Math.max(0, this.muddyBootsTimer - dt);
    }

    updateCharacterAnimState(this.animState, dt);

    const isPortrait = this.game.display.isPortrait;
    const groundY = isPortrait ? this.game.display.vHeight - 150 : this.game.display.vHeight - 90;
    this.peppa.y = groundY;

    // Spawner
    this.spawnTimer += dt;
    if (this.spawnTimer >= 1.5) {
      this.spawnTimer = 0;
      this.spawnPuddle();
    }

    // Keyboard controls
    if (input.isKeyDown('ArrowLeft') || input.isKeyDown('KeyA')) {
      this.peppa.vx = -240;
    } else if (input.isKeyDown('ArrowRight') || input.isKeyDown('KeyD')) {
      this.peppa.vx = 240;
    } else {
      this.peppa.vx = 0;
    }

    // Toddler Tap / Jump
    if (input.isActionJustPressed()) {
      const p = input.primaryPointer;
      if (p.inside && p.y > 80 && input.pointers.size > 0) {
        this.peppa.x = p.x;
        this.jump();
      } else {
        this.jump();
      }
    }

    // Peppa Jump Physics
    const minPeppaX = 50;
    const maxPeppaX = this.game.display.vWidth - 50;
    this.peppa.x = Math.max(minPeppaX, Math.min(maxPeppaX, this.peppa.x + this.peppa.vx * dt));

    if (this.peppa.isJumping) {
      this.peppa.jumpV += 1400 * dt;
      this.peppa.jumpY += this.peppa.jumpV * dt;

      if (this.peppa.jumpY >= 0) {
        this.peppa.jumpY = 0;
        this.peppa.isJumping = false;
        this.peppa.squish = 0.7;

        // Check collision with puddles
        let hit = false;
        for (let i = this.puddles.length - 1; i >= 0; i--) {
          const pud = this.puddles[i];
          const dx = (this.peppa.x - pud.x) / pud.rx;
          const dy = (groundY - pud.y) / pud.ry;
          const dNorm = Math.sqrt(dx * dx + dy * dy);

          if (dNorm <= 1.0) {
            hit = true;
            this.muddyBootsTimer = 3.5;
            pud.ripplePhase = 0.01;
            const pts = pud.type === 'GOLDEN' ? 100 : 25;
            const centerBonus = dNorm <= 0.4 ? 2 : 1;
            const totalEarned = pts * centerBonus * this.multiplier;
            this.score += totalEarned;
            this.multiplier = Math.min(5, this.multiplier + 1);

            if (pud.type === 'GOLDEN') {
              this.timer = Math.min(60, this.timer + 3.0);
              this.particles.spawnSparkles(pud.x, pud.y, 12);
              soundEngine.playSFX('fanfare');
            }

            this.particles.spawnMudSplash(pud.x, pud.y, 20, pud.type === 'GOLDEN');
            this.particles.spawnScorePopup(
              pud.x,
              pud.y - 30,
              `+${totalEarned}${this.multiplier > 1 ? ` (x${this.multiplier})` : ''}`
            );
            soundEngine.playSFX('splash');
            if (this.multiplier >= 3) {
              soundEngine.playSFX('toddlerGiggle');
            }
            Haptics.heavy();
            this.game.storage.saveHighScore('MUDDY_PUDDLES', this.score);
            this.puddles.splice(i, 1);
            break;
          }
        }

        if (!hit) {
          this.multiplier = 1;
        }
      }
    }

    this.peppa.squish += (1.0 - this.peppa.squish) * (dt * 12);
    this.animState.jumpY = this.peppa.jumpY;
    this.animState.squash = this.peppa.squish;

    // Update puddles
    for (let i = this.puddles.length - 1; i >= 0; i--) {
      const pud = this.puddles[i];
      pud.lifetime -= dt;
      if (pud.ripplePhase > 0) pud.ripplePhase += dt * 2.0;
      if (pud.lifetime <= 0) this.puddles.splice(i, 1);
    }

    this.particles.update(dt);
  }

  render(ctx: CanvasRenderingContext2D, _alpha: number, display: DisplayManager): void {
    const isPortrait = display.isPortrait;
    drawLandscapeSkyHills(ctx, display.vWidth, display.vHeight, this.time);

    // Puddles
    for (const pud of this.puddles) {
      drawMuddyPuddle(ctx, pud.x, pud.y, pud.rx, pud.ry, { type: pud.type, ripplePhase: pud.ripplePhase });
    }

    // Peppa Pig
    drawPeppaPig(ctx, this.peppa.x, this.peppa.y, isPortrait ? 1.15 : 1.0, {
      animState: this.animState,
      jumpY: this.peppa.jumpY,
      squish: this.peppa.squish,
      squash: this.peppa.squish,
      armWave: this.time * 8,
      eyeBlink: this.animState.isBlinking,
      muddyBoots: this.muddyBootsTimer > 0,
      expression: this.multiplier >= 3 ? 'excited' : 'happy'
    });

    this.particles.render(ctx);

    // Score & Timer Badge (Positioned below HUD in portrait)
    const scoreX = display.vWidth / 2;
    const scoreY = isPortrait ? 76 : Math.max(18, display.vHeight * 0.035);
    const badgeW = isPortrait ? 300 : 280;
    const badgeH = 46;

    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.roundRect(scoreX - badgeW / 2, scoreY, badgeW, badgeH, 23);
    ctx.fill();
    ctx.strokeStyle = '#FFCDD2';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 20px "Comic Sans MS", cursive, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(
      `Score: ${this.score}  |  ⏱ ${this.timer.toFixed(1)}s${this.multiplier > 1 ? `  (x${this.multiplier})` : ''}`,
      scoreX,
      scoreY + badgeH / 2
    );
    ctx.restore();
  }

  override getEntities(): Record<string, unknown> {
    return {
      eggs: [],
      chicks: [],
      puddles: this.puddles.map(p => ({ x: p.x, y: p.y, type: p.type, size: p.rx, rx: p.rx, ry: p.ry })),
      puddlesCount: this.puddles.length,
      seeds: [],
      particles: this.particles.active
    };
  }

  override getModeState(): Record<string, unknown> {
    return { timer: this.timer, feverMeter: 0, multiplier: this.multiplier, coopSavedCount: 0, isOverheating: false };
  }
}
