import { BaseScene } from './BaseScene';
import { GameEngine } from '../engine/GameEngine';
import { InputManager } from '../engine/InputManager';
import { DisplayManager } from '../engine/DisplayManager';
import { EggEntity, ChickEntity } from '../types/game';
import { ParticleEngine } from '../engine/ParticleEngine';
import { soundEngine } from '../engine/SoundEngine';
import { Haptics } from '../engine/Haptics';
import { drawLandscapeSkyHills, drawHayNest, drawEgg } from '../graphics/environmentRenderer';
import { drawMrsChicken } from '../graphics/chickenRenderer';
import { drawBabyChick } from '../graphics/chickRenderer';

export class EggLayingScene extends BaseScene {
  public time: number = 0;
  public eggs: EggEntity[] = [];
  public chicks: ChickEntity[] = [];
  public particles: ParticleEngine;
  public chicken = { x: 480, y: 150, squash: 1.0, squawk: 0, flap: 0 };
  private lastLayTime: number = 0;

  constructor(game: GameEngine) {
    super(game);
    this.particles = new ParticleEngine(150);
  }

  enter(): void {
    this.score = 0;
    this.eggs = [];
    this.chicks = [];
    this.particles.clear();
    this.time = 0;
  }

  layEgg(): void {
    const now = performance.now();
    if (now - this.lastLayTime < 45) return;
    this.lastLayTime = now;

    this.eggs.push({
      x: this.chicken.x + (Math.random() * 20 - 10),
      y: this.chicken.y + 25,
      vx: (Math.random() - 0.5) * 80,
      vy: 60 + Math.random() * 30,
      rotation: Math.random() * 0.4 - 0.2,
      vRot: (Math.random() - 0.5) * 0.1,
      state: 'FALLING',
      timer: 0,
      crackStage: 0
    });

    this.score++;
    this.chicken.squash = 0.75;
    this.chicken.squawk = 1.0;

    soundEngine.playSFX('cluck');
    soundEngine.playSFX('eggPop');
    Haptics.tap();
    this.particles.spawnFeathers(this.chicken.x, this.chicken.y, 2);
  }

  update(dt: number, input: InputManager): void {
    this.time += dt;
    const isPortrait = this.game.display.isPortrait;
    const chickenCenterX = isPortrait ? 270 : 480;
    const chickenCenterY = isPortrait ? 180 : 150;
    const groundY = isPortrait ? 820 : 460;

    // Header back button tap
    const ptr = input.primaryPointer;
    if (ptr && ptr.isDown && input.isActionJustPressed() && input.pointers.size > 0 && ptr.x <= 120 && ptr.y <= 70) {
      this.game.storage.saveHighScore('eggLaying', this.score);
      Haptics.tap();
      this.game.changeScene('MENU');
      return;
    }

    // Lay egg on Space or full-screen toddler tap
    if (input.isActionJustPressed()) {
      this.layEgg();
    }

    // Chicken Animation Recovery
    this.chicken.x = chickenCenterX;
    this.chicken.y = chickenCenterY + Math.sin(this.time * 3.2) * 6;
    this.chicken.squash += (1.0 - this.chicken.squash) * (dt * 15);
    this.chicken.squawk += (0 - this.chicken.squawk) * (dt * 12);
    this.chicken.flap = Math.sin(this.time * 6) * 0.15;

    // Egg Physics & Nest Stacking
    for (let i = 0; i < this.eggs.length; i++) {
      const egg = this.eggs[i];

      if (egg.state === 'FALLING') {
        egg.vy += 980 * dt;
        egg.x += egg.vx * dt;
        egg.y += egg.vy * dt;
        egg.rotation += egg.vRot;

        if (egg.y >= groundY) {
          egg.y = groundY;
          egg.vy = -egg.vy * 0.38;
          egg.vx *= 0.94;
          if (Math.abs(egg.vy) < 30) {
            egg.vy = 0;
            egg.state = 'INCUBATING';
          }
        }
      } else if (egg.state === 'INCUBATING') {
        egg.timer += dt;
        if (egg.timer >= 2.5 || this.eggs.length > 8) {
          egg.state = 'CRACK_1';
          egg.crackStage = 1;
          egg.timer = 0;
          soundEngine.playSFX('crack');
        }
      } else if (egg.state === 'CRACK_1') {
        egg.timer += dt;
        egg.rotation = Math.sin(this.time * 25) * 0.15;
        if (egg.timer >= 0.5) {
          egg.state = 'CRACK_2';
          egg.crackStage = 3;
          egg.timer = 0;
          soundEngine.playSFX('crack');
        }
      } else if (egg.state === 'CRACK_2') {
        egg.timer += dt;
        if (egg.timer >= 0.4) {
          egg.state = 'HATCH_BURST';
          this.particles.spawnEggCrack(egg.x, egg.y, 8);
          soundEngine.playSFX('hatch');
          Haptics.heavy();

          // Spawn scampering baby chick
          this.chicks.push({
            x: egg.x,
            y: egg.y - 5,
            vx: Math.random() > 0.5 ? 120 : -120,
            vy: 0,
            walkCycle: 0,
            facingLeft: Math.random() > 0.5,
            state: 'SCAMPERING'
          });
        }
      }
    }

    // Clean up hatched eggs
    this.eggs = this.eggs.filter(e => e.state !== 'HATCH_BURST');

    // Update baby chicks
    for (let i = this.chicks.length - 1; i >= 0; i--) {
      const chick = this.chicks[i];
      chick.x += chick.vx * dt;
      chick.walkCycle += dt * 12;
      chick.facingLeft = chick.vx < 0;

      const maxX = isPortrait ? 580 : 1000;
      if (chick.x < -60 || chick.x > maxX) {
        this.chicks.splice(i, 1);
      }
    }

    this.particles.update(dt);
  }

  render(ctx: CanvasRenderingContext2D, _alpha: number, display: DisplayManager): void {
    const isPortrait = display.isPortrait;
    const groundY = isPortrait ? 820 : 460;
    const nestX = isPortrait ? 270 : 480;
    const nestY = isPortrait ? 840 : 480;
    const nestW = isPortrait ? 320 : 260;

    drawLandscapeSkyHills(ctx, display.vWidth, display.vHeight, this.time);
    drawHayNest(ctx, nestX, nestY, nestW, 90);

    // Eggs & Chicks
    for (const egg of this.eggs) {
      drawEgg(ctx, egg.x, egg.y, 1.0, egg.rotation, egg.crackStage);
    }
    for (const chick of this.chicks) {
      drawBabyChick(ctx, chick.x, chick.y, 1.0, {
        walkCycle: chick.walkCycle,
        facingLeft: chick.facingLeft
      });
    }

    // Mrs Chicken
    drawMrsChicken(ctx, this.chicken.x, this.chicken.y, isPortrait ? 1.25 : 1.15, {
      squash: this.chicken.squash,
      squawk: this.chicken.squawk,
      flap: this.chicken.flap
    });

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

    // Score Badge
    const scoreX = isPortrait ? 270 : 480;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.roundRect(scoreX - 80, 15, 160, 40, 15);
    ctx.fill();
    ctx.fillStyle = '#FFD54F';
    ctx.font = 'bold 22px "Comic Sans MS", sans-serif';
    ctx.fillText(`Eggs: ${this.score}`, scoreX, 42);
    ctx.restore();
  }

  override getEntities(): Record<string, unknown> {
    return {
      eggs: this.eggs.map(e => ({ x: e.x, y: e.y, state: e.state })),
      eggsCount: this.eggs.length,
      chicks: this.chicks.map(c => ({ x: c.x, y: c.y, state: 'SCAMPERING' })),
      chicksCount: this.chicks.length,
      puddles: [],
      seeds: [],
      particles: this.particles.active
    };
  }
}
