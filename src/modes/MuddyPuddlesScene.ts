/**
 * Mode 2: Muddy Puddles (Puddle Splash Adventure)
 * Adventures of Trishu 8-Game Suite
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
import { drawTrishu } from '../graphics/characters/trishuRenderer';
import { createCharacterAnimState, updateCharacterAnimState } from '../graphics/animations';

export class MuddyPuddlesScene extends BaseScene {
  public time: number = 0;
  public timer: number = 60.0; // Preserved for state compatibility
  public splashesCount: number = 0;
  public puddles: PuddleEntity[] = [];
  public particles: ParticleEngine;
  public animState: CharacterAnimState;
  public trishu = { x: 270, y: 410, vx: 0, jumpY: 0, isJumping: false, jumpV: 0, squish: 1.0 };
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
    this.splashesCount = 0;
    this.multiplier = 1;
    this.muddyBootsTimer = 0;
    this.puddles = [];
    this.particles.clear();
    this.animState = createCharacterAnimState();

    const isPortrait = this.game.display.isPortrait;
    const groundY = isPortrait ? this.game.display.vHeight - 150 : this.game.display.vHeight - 90;
    this.trishu = {
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
    this.spawnPuddle();
  }

  exit(): void {
    this.particles.clear();
    if (this.score > 0) {
      this.game.storage.saveHighScore('MUDDY_PUDDLES', this.score);
    }
  }

  spawnPuddle(): void {
    if (this.puddles.length >= 6) return;
    const isPortrait = this.game.display.isPortrait;
    const isGolden = Math.random() < 0.25;
    const minX = 70;
    const maxX = this.game.display.vWidth - 70;
    const groundY = isPortrait ? this.game.display.vHeight - 150 : this.game.display.vHeight - 90;

    this.puddles.push({
      x: minX + Math.random() * (maxX - minX),
      y: groundY - 20 + Math.random() * 40,
      rx: isGolden ? 55 : 46 + Math.random() * 16,
      ry: isGolden ? 28 : 23 + Math.random() * 8,
      type: isGolden ? 'GOLDEN' : 'STANDARD',
      lifetime: 14.0,
      ripplePhase: 0
    });
  }

  jump(): void {
    if (this.trishu.isJumping) return;
    this.trishu.isJumping = true;
    this.trishu.jumpV = -460;
    this.trishu.squish = 1.25;
    Haptics.tap();
  }

  update(dt: number, input: InputManager): void {
    this.time += dt;
    if (this.muddyBootsTimer > 0) {
      this.muddyBootsTimer = Math.max(0, this.muddyBootsTimer - dt);
    }

    updateCharacterAnimState(this.animState, dt);

    const isPortrait = this.game.display.isPortrait;
    const groundY = isPortrait ? this.game.display.vHeight - 150 : this.game.display.vHeight - 90;
    this.trishu.y = groundY;

    // Spawner
    this.spawnTimer += dt;
    if (this.spawnTimer >= 1.5) {
      this.spawnTimer = 0;
      this.spawnPuddle();
    }

    // Keyboard controls
    if (input.isKeyDown('ArrowLeft') || input.isKeyDown('KeyA')) {
      this.trishu.vx = -240;
    } else if (input.isKeyDown('ArrowRight') || input.isKeyDown('KeyD')) {
      this.trishu.vx = 240;
    } else {
      this.trishu.vx = 0;
    }

    // Toddler Tap / Jump
    if (input.isActionJustPressed()) {
      const p = input.primaryPointer;
      if (p.inside && p.y > 80) {
        this.trishu.x = p.x;
      }
      this.jump();
    } else {
      for (const ptr of input.pointers.values()) {
        if (ptr.justPressed && ptr.inside && ptr.y > 80) {
          this.trishu.x = ptr.x;
          this.jump();
          break;
        }
      }
    }

    // Trishu Jump Physics
    const minTrishuX = 50;
    const maxTrishuX = this.game.display.vWidth - 50;
    this.trishu.x = Math.max(minTrishuX, Math.min(maxTrishuX, this.trishu.x + this.trishu.vx * dt));

    if (this.trishu.isJumping) {
      this.trishu.jumpV += 1400 * dt;
      this.trishu.jumpY += this.trishu.jumpV * dt;

      if (this.trishu.jumpY >= 0) {
        this.trishu.jumpY = 0;
        this.trishu.isJumping = false;
        this.trishu.squish = 0.7;

        // Check collision with puddles
        let hit = false;
        for (let i = this.puddles.length - 1; i >= 0; i--) {
          const pud = this.puddles[i];
          const dx = (this.trishu.x - pud.x) / pud.rx;
          const dy = (groundY - pud.y) / pud.ry;
          const dNorm = Math.sqrt(dx * dx + dy * dy);

          if (dNorm <= 1.25) { // Generous toddler hit radius
            hit = true;
            this.splashesCount++;
            this.muddyBootsTimer = 4.0;
            pud.ripplePhase = 0.01;
            const pts = pud.type === 'GOLDEN' ? 100 : 30;
            const totalEarned = pts * this.multiplier;
            this.score += totalEarned;
            this.multiplier = Math.min(5, this.multiplier + 1);

            if (pud.type === 'GOLDEN' || this.splashesCount % 10 === 0) {
              this.particles.spawnSparkles(pud.x, pud.y, 14);
              this.particles.spawnConfetti(pud.x, pud.y - 40, 16);
              soundEngine.playSFX('fanfare');
            }

            this.particles.spawnMudSplash(pud.x, pud.y, 22, pud.type === 'GOLDEN');
            this.particles.spawnScorePopup(
              pud.x,
              pud.y - 30,
              `+${totalEarned}${this.multiplier > 1 ? ` (x${this.multiplier})` : ''}`
            );
            soundEngine.playSFX('splash');
            soundEngine.playSFX('toddlerGiggle');
            Haptics.heavy();
            this.game.storage.saveHighScore('MUDDY_PUDDLES', this.score);
            this.puddles.splice(i, 1);
            break;
          }
        }

        if (!hit) {
          // Even a ground stomp gives a mini-splash!
          this.particles.spawnMudSplash(this.trishu.x, groundY, 8, false);
          soundEngine.playSFX('splash');
          this.score += 10;
        }
      }
    }

    this.trishu.squish += (1.0 - this.trishu.squish) * (dt * 12);
    this.animState.jumpY = this.trishu.jumpY;
    this.animState.squash = this.trishu.squish;

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

    // Trishu Character
    drawTrishu(ctx, this.trishu.x, this.trishu.y, isPortrait ? 1.15 : 1.0, {
      animState: this.animState,
      jumpY: this.trishu.jumpY,
      squish: this.trishu.squish,
      squash: this.trishu.squish,
      armWave: this.time * 8,
      eyeBlink: this.animState.isBlinking,
      muddyBoots: this.muddyBootsTimer > 0,
      expression: 'excited'
    });

    this.particles.render(ctx);

    // Score & Toddler Splashes Badge (Positioned below HUD in portrait)
    const scoreX = display.vWidth / 2;
    const scoreY = isPortrait ? 76 : Math.max(18, display.vHeight * 0.035);
    const badgeW = isPortrait ? 310 : 290;
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
      `💦 Splashes: ${this.splashesCount}  |  ★ ${this.score}`,
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
