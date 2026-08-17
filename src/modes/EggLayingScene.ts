/**
 * Mode 1: Happy Mrs Chicken (Classic Egg-Laying Mode)
 * Peppa Pig: Happy Mrs Chicken 8-Game Deluxe Expansion Suite
 * Strictly under 500 Lines of Code
 */

import { BaseScene } from './BaseScene';
import { GameEngine } from '../engine/GameEngine';
import { InputManager } from '../engine/InputManager';
import { DisplayManager } from '../engine/DisplayManager';
import { EggEntity, ChickEntity } from '../types/game';
import { CharacterAnimState } from '../types/characters';
import { ParticleEngine } from '../engine/ParticleEngine';
import { soundEngine } from '../engine/SoundEngine';
import { Haptics } from '../engine/Haptics';
import { drawLandscapeSkyHills, drawHayNest, drawEgg } from '../graphics/environmentRenderer';
import { drawMrsChicken } from '../graphics/characters/chickenRenderer';
import { drawBabyChick } from '../graphics/characters/chickRenderer';
import { createCharacterAnimState, updateCharacterAnimState } from '../graphics/animations';

export class EggLayingScene extends BaseScene {
  public time: number = 0;
  public eggs: EggEntity[] = [];
  public chicks: ChickEntity[] = [];
  public particles: ParticleEngine;
  public animState: CharacterAnimState;
  public chicken = {
    x: 270,
    y: 200,
    targetX: 270,
    targetY: 200,
    facingLeft: false,
    squash: 1.0,
    squawk: 0,
    flap: 0
  };
  private lastLayTime: number = 0;
  private lastUserTapTime: number = 0;
  private roamTimer: number = 0;

  constructor(game: GameEngine) {
    super(game);
    this.particles = new ParticleEngine(150);
    this.animState = createCharacterAnimState();
  }

  enter(): void {
    this.score = 0;
    this.eggs = [];
    this.chicks = [];
    this.particles.clear();
    this.time = 0;
    this.roamTimer = 0;
    this.lastUserTapTime = 0;
    this.animState = createCharacterAnimState();

    const isPortrait = this.game.display.isPortrait;
    const startX = this.game.display.vWidth / 2;
    const startY = isPortrait ? 220 : 160;
    this.chicken.x = startX;
    this.chicken.y = startY;
    this.chicken.targetX = startX;
    this.chicken.targetY = startY;
  }

  exit(): void {
    this.particles.clear();
    if (this.score > 0) {
      this.game.storage.saveHighScore('EGG_LAYING', this.score);
    }
  }

  layEggAt(x: number, y: number): void {
    const now = performance.now();
    if (now - this.lastLayTime < 50) return;
    this.lastLayTime = now;

    this.eggs.push({
      x: x + (Math.random() * 16 - 8),
      y: y + 25,
      vx: (Math.random() - 0.5) * 60,
      vy: 40 + Math.random() * 30,
      rotation: Math.random() * 0.4 - 0.2,
      vRot: (Math.random() - 0.5) * 0.1,
      state: 'FALLING',
      timer: 0,
      crackStage: 0
    });

    this.score++;
    this.chicken.squash = 0.72;
    this.chicken.squawk = 1.0;
    this.animState.squash = 0.72;
    this.animState.squawk = 1.0;

    soundEngine.playSFX('cluck');
    soundEngine.playSFX('eggPop');
    Haptics.tap();
    this.particles.spawnFeathers(x, y, 3);
    this.game.storage.saveHighScore('EGG_LAYING', this.score);

    // Milestone fanfare every 10 eggs
    if (this.score > 0 && this.score % 10 === 0) {
      soundEngine.playSFX('fanfare');
      this.particles.spawnSparkles(x, y, 10);
    }
  }

  pickRandomRoamTarget(): void {
    const isPortrait = this.game.display.isPortrait;
    const groundY = isPortrait ? this.game.display.vHeight - 140 : this.game.display.vHeight - 80;
    const minX = 70;
    const maxX = this.game.display.vWidth - 70;
    const minY = 80;
    const maxY = groundY - 90;

    this.chicken.targetX = minX + Math.random() * (maxX - minX);
    this.chicken.targetY = minY + Math.random() * (maxY - minY);
  }

  update(dt: number, input: InputManager): void {
    this.time += dt;
    this.roamTimer += dt;
    updateCharacterAnimState(this.animState, dt);

    const isPortrait = this.game.display.isPortrait;
    const groundY = isPortrait ? this.game.display.vHeight - 140 : this.game.display.vHeight - 80;
    const minChickenY = 80;
    const maxChickenY = groundY - 80;

    // Handle Tap to Fly and Lay Eggs wherever user touches
    if (input.isActionJustPressed()) {
      this.lastUserTapTime = performance.now();
      const ptr = input.primaryPointer;
      if (ptr && ptr.inside && ptr.y > 60) {
        this.chicken.targetX = Math.max(50, Math.min(this.game.display.vWidth - 50, ptr.x));
        this.chicken.targetY = Math.max(minChickenY, Math.min(maxChickenY, ptr.y - 20));
        this.chicken.facingLeft = this.chicken.targetX < this.chicken.x;
        this.layEggAt(this.chicken.targetX, this.chicken.targetY);
      } else {
        this.layEggAt(this.chicken.x, this.chicken.y);
      }
    }

    // Smooth Flying Movement towards target
    const dx = this.chicken.targetX - this.chicken.x;
    const dy = this.chicken.targetY - this.chicken.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Autonomous whole-screen roaming when idle
    const timeSinceTap = (performance.now() - this.lastUserTapTime) / 1000;
    if (timeSinceTap > 1.2 && (dist < 25 || this.roamTimer >= 3.5)) {
      this.roamTimer = 0;
      this.pickRandomRoamTarget();
    }

    if (dist > 6) {
      const speed = Math.min(550, dist * 6 + 140);
      this.chicken.x += (dx / dist) * speed * dt;
      this.chicken.y += (dy / dist) * speed * dt;
      this.chicken.flap = Math.sin(this.time * 18) * 0.4;
      this.chicken.facingLeft = dx < 0;
    } else {
      this.chicken.flap = Math.sin(this.time * 6) * 0.15;
      this.chicken.y += Math.sin(this.time * 3.2) * 0.6;
    }

    // Recover squash and squawk
    this.chicken.squash += (1.0 - this.chicken.squash) * (dt * 15);
    this.chicken.squawk += (0 - this.chicken.squawk) * (dt * 12);
    this.animState.facingLeft = this.chicken.facingLeft;
    this.animState.armWave = this.chicken.flap;

    // Egg Physics across lawn
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
        if (egg.timer >= 2.2 || this.eggs.length > 8) {
          egg.state = 'CRACK_1';
          egg.crackStage = 1;
          egg.timer = 0;
          soundEngine.playSFX('crack');
        }
      } else if (egg.state === 'CRACK_1') {
        egg.timer += dt;
        egg.rotation = Math.sin(this.time * 25) * 0.15;
        if (egg.timer >= 0.45) {
          egg.state = 'CRACK_2';
          egg.crackStage = 3;
          egg.timer = 0;
          soundEngine.playSFX('crack');
        }
      } else if (egg.state === 'CRACK_2') {
        egg.timer += dt;
        if (egg.timer >= 0.35) {
          egg.state = 'HATCH_BURST';
          this.particles.spawnEggCrack(egg.x, egg.y, 8);
          soundEngine.playSFX('hatch');
          Haptics.heavy();

          this.chicks.push({
            x: egg.x,
            y: egg.y - 10,
            vx: (Math.random() > 0.5 ? 1 : -1) * (60 + Math.random() * 80),
            vy: (Math.random() - 0.5) * 70,
            walkCycle: Math.random() * 10,
            facingLeft: Math.random() > 0.5,
            state: 'SCAMPERING'
          });
        }
      }
    }

    this.eggs = this.eggs.filter(e => e.state !== 'HATCH_BURST');

    // Update baby chicks - 2D whole-yard roaming and natural dispersion
    const minChickX = 25;
    const maxChickX = this.game.display.vWidth - 25;
    const minChickY = Math.max(80, groundY - 260);
    const maxChickY = this.game.display.vHeight - 20;

    for (let i = 0; i < this.chicks.length; i++) {
      const chick = this.chicks[i];
      chick.x += chick.vx * dt;
      chick.y += chick.vy * dt;
      chick.walkCycle += dt * 12;

      for (let j = i + 1; j < this.chicks.length; j++) {
        const other = this.chicks[j];
        const cdx = other.x - chick.x;
        const cdy = other.y - chick.y;
        const distSq = cdx * cdx + cdy * cdy;
        if (distSq < 32 * 32 && distSq > 0.1) {
          const dist = Math.sqrt(distSq);
          const push = (32 - dist) * 1.5 * dt;
          const nx = cdx / dist;
          const ny = cdy / dist;
          chick.x -= nx * push;
          chick.y -= ny * push;
          other.x += nx * push;
          other.y += ny * push;
        }
      }

      if (Math.random() < 0.015) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 50 + Math.random() * 70;
        chick.vx = Math.cos(angle) * speed;
        chick.vy = Math.sin(angle) * (speed * 0.6);
      }

      if (chick.x <= minChickX) { chick.x = minChickX; chick.vx = Math.abs(chick.vx) || 70; }
      else if (chick.x >= maxChickX) { chick.x = maxChickX; chick.vx = -Math.abs(chick.vx) || -70; }
      if (chick.y <= minChickY) { chick.y = minChickY; chick.vy = Math.abs(chick.vy) || 50; }
      else if (chick.y >= maxChickY) { chick.y = maxChickY; chick.vy = -Math.abs(chick.vy) || -50; }

      chick.facingLeft = chick.vx < 0;
    }

    this.particles.update(dt);
  }

  render(ctx: CanvasRenderingContext2D, _alpha: number, display: DisplayManager): void {
    const isPortrait = display.isPortrait;
    const nestX = display.vWidth / 2;
    const nestY = isPortrait ? display.vHeight - 120 : display.vHeight - 60;
    const nestW = isPortrait ? 280 : 260;

    drawLandscapeSkyHills(ctx, display.vWidth, display.vHeight, this.time);
    drawHayNest(ctx, nestX, nestY, nestW, 80);

    for (const egg of this.eggs) {
      drawEgg(ctx, egg.x, egg.y, 1.0, egg.rotation, egg.crackStage);
    }

    const sortedChicks = [...this.chicks].sort((a, b) => a.y - b.y);
    for (const chick of sortedChicks) {
      drawBabyChick(ctx, chick.x, chick.y, 1.0, {
        walkCycle: chick.walkCycle,
        facingLeft: chick.facingLeft,
        isPeeping: (chick.walkCycle * 2) % 4 < 1.2
      });
    }

    drawMrsChicken(ctx, this.chicken.x, this.chicken.y, isPortrait ? 1.2 : 1.1, {
      animState: this.animState,
      squash: this.chicken.squash,
      squawk: this.chicken.squawk,
      flap: this.chicken.flap,
      facingLeft: this.chicken.facingLeft
    });

    this.particles.render(ctx);

    // Score Badge
    const scoreX = display.vWidth / 2;
    const scoreY = Math.max(20, Math.min(30, display.vHeight * 0.03));
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.roundRect(scoreX - 85, scoreY, 170, 42, 21);
    ctx.fill();
    ctx.strokeStyle = '#FFE082';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.fillStyle = '#FFF9C4';
    ctx.beginPath();
    ctx.ellipse(scoreX - 52, scoreY + 21, 9, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#E0BA60';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 20px "Comic Sans MS", cursive, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`Eggs: ${this.score}`, scoreX - 32, scoreY + 22);
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
