import { BaseScene } from './BaseScene';
import { GameEngine } from '../engine/GameEngine';
import { InputManager } from '../engine/InputManager';
import { DisplayManager } from '../engine/DisplayManager';
import { PuddleEntity } from '../types/game';
import { ParticleEngine } from '../engine/ParticleEngine';
import { soundEngine } from '../engine/SoundEngine';
import { Haptics } from '../engine/Haptics';
import { drawLandscapeSkyHills, drawMuddyPuddle } from '../graphics/environmentRenderer';
import { drawPeppaPig } from '../graphics/peppaRenderer';

export class MuddyPuddlesScene extends BaseScene {
  public time: number = 0;
  public timer: number = 60.0;
  public puddles: PuddleEntity[] = [];
  public particles: ParticleEngine;
  public peppa = { x: 480, y: 410, vx: 0, jumpY: 0, isJumping: false, jumpV: 0, squish: 1.0 };
  public multiplier: number = 1;
  private spawnTimer: number = 0;

  constructor(game: GameEngine) {
    super(game);
    this.particles = new ParticleEngine(150);
  }

  enter(): void {
    this.score = 0;
    this.timer = 60.0;
    this.multiplier = 1;
    this.puddles = [];
    this.particles.clear();
    const isPortrait = this.game.display.isPortrait;
    this.peppa = {
      x: isPortrait ? 270 : 480,
      y: isPortrait ? 780 : 410,
      vx: 0,
      jumpY: 0,
      isJumping: false,
      jumpV: 0,
      squish: 1.0
    };
    this.spawnPuddle();
    this.spawnPuddle();
  }

  spawnPuddle(): void {
    if (this.puddles.length >= 5) return;
    const isPortrait = this.game.display.isPortrait;
    const isGolden = Math.random() < 0.15;
    const minX = isPortrait ? 80 : 150;
    const maxX = isPortrait ? 460 : 810;
    const groundY = isPortrait ? 780 : 410;

    this.puddles.push({
      x: minX + Math.random() * (maxX - minX),
      y: groundY - 30 + Math.random() * 60,
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
    const isPortrait = this.game.display.isPortrait;
    const groundY = isPortrait ? 780 : 410;
    this.peppa.y = groundY;

    // Header Back button tap (only on physical deliberate pointer click)
    const ptr = input.primaryPointer;
    if (ptr && ptr.isDown && input.isActionJustPressed() && input.pointers.size > 0 && ptr.x <= 120 && ptr.y <= 70) {
      this.game.storage.saveHighScore('muddyPuddles', this.score);
      Haptics.tap();
      this.game.changeScene('MENU');
      return;
    }

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
      if (p.inside && p.y > 100 && input.pointers.size > 0) {
        this.peppa.x = p.x;
        this.jump();
      } else {
        this.jump();
      }
    }

    // Peppa Jump Physics
    const minPeppaX = isPortrait ? 60 : 80;
    const maxPeppaX = isPortrait ? 480 : 880;
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
            pud.ripplePhase = 0.01;
            const pts = pud.type === 'GOLDEN' ? 100 : 25;
            const centerBonus = dNorm <= 0.4 ? 2 : 1;
            this.score += pts * centerBonus * this.multiplier;
            this.multiplier = Math.min(5, this.multiplier + 1);

            if (pud.type === 'GOLDEN') {
              this.timer = Math.min(60, this.timer + 3.0);
              this.particles.spawnSparkles(pud.x, pud.y, 10);
            }

            this.particles.spawnMudSplash(pud.x, pud.y, 20, pud.type === 'GOLDEN');
            this.particles.spawnScorePopup(pud.x, pud.y - 30, `+${pts * centerBonus * this.multiplier}`);
            soundEngine.playSFX('splash');
            Haptics.heavy();
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
      jumpY: this.peppa.jumpY,
      squish: this.peppa.squish,
      armWave: this.time * 8
    });

    this.particles.render(ctx);

    // HUD
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
    ctx.roundRect(scoreX - 120, 15, 240, 40, 15);
    ctx.fill();
    ctx.fillStyle = '#FFD54F';
    ctx.font = 'bold 20px "Comic Sans MS", sans-serif';
    ctx.fillText(`Score: ${this.score}  |  ⏱ ${this.timer.toFixed(1)}s`, scoreX, 42);
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
