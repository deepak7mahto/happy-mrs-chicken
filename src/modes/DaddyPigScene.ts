/**
 * Mode 4: Daddy Pig Challenge (Hyper-Speed Frenzy Test)
 * Peppa Pig: Happy Mrs Chicken 8-Game Deluxe Expansion Suite
 * Strictly under 500 Lines of Code
 */

import { BaseScene } from './BaseScene';
import { GameEngine } from '../engine/GameEngine';
import { InputManager } from '../engine/InputManager';
import { DisplayManager } from '../engine/DisplayManager';
import { ParticleEngine } from '../engine/ParticleEngine';
import { soundEngine } from '../engine/SoundEngine';
import { Haptics } from '../engine/Haptics';
import { drawLandscapeSkyHills } from '../graphics/environmentRenderer';
import { drawDaddyPig } from '../graphics/characters/daddyPigRenderer';

export class DaddyPigScene extends BaseScene {
  public time: number = 0;
  public fever: number = 0;
  public timer: number = 20.0;
  public multiplier: number = 1;
  public particles: ParticleEngine;
  public isOverheating: boolean = false;

  constructor(game: GameEngine) {
    super(game);
    this.particles = new ParticleEngine(150);
  }

  enter(): void {
    this.score = 0;
    this.fever = 0;
    this.timer = 20.0;
    this.multiplier = 1;
    this.isOverheating = false;
    this.particles.clear();
    this.time = 0;
  }

  exit(): void {
    this.particles.clear();
    if (this.score > 0) {
      this.game.storage.saveHighScore('daddyPig', this.score);
    }
  }

  tap(): void {
    if (this.isOverheating) return;
    this.fever = Math.min(100, this.fever + 4.5);
    this.multiplier = this.fever >= 95 ? 10 : (this.fever >= 70 ? 5 : (this.fever >= 40 ? 2 : 1));
    this.score += 10 * this.multiplier;
    this.timer = Math.min(25.0, this.timer + 0.18);

    soundEngine.playSFX('cluck');
    soundEngine.playSFX('eggPop');
    Haptics.tap();

    const isPortrait = this.game.display.isPortrait;
    const pigX = isPortrait ? this.game.display.vWidth / 2 : this.game.display.vWidth * 0.72;
    const pigY = isPortrait ? this.game.display.vHeight * 0.38 : 240;

    if (this.fever >= 65) {
      this.particles.spawnSteam(pigX, pigY);
    }
    if (this.fever >= 95) {
      this.particles.spawnSparkles(pigX, pigY, 6);
    }

    if (this.fever >= 100 && !this.isOverheating) {
      this.isOverheating = true;
      soundEngine.playSFX('crash');
      Haptics.fanfare();
      this.particles.spawnConfetti(pigX, pigY, 25);
      this.particles.spawnSteam(pigX, pigY);
      this.game.storage.saveHighScore('daddyPig', this.score);
    }
  }

  update(dt: number, input: InputManager): void {
    this.time += dt;
    if (!this.isOverheating && this.timer > 0) {
      this.timer = Math.max(0, this.timer - dt);
      const decayRate = 6.5 + 0.05 * Math.sqrt(this.score);
      this.fever = Math.max(0, this.fever - decayRate * dt);
      this.multiplier = this.fever >= 95 ? 10 : (this.fever >= 70 ? 5 : (this.fever >= 40 ? 2 : 1));
    }

    // Toddler Tap anywhere on screen triggers rapid frenzy
    if (input.isActionJustPressed()) {
      if (this.isOverheating) {
        this.enter();
      } else {
        this.tap();
      }
    }

    this.particles.update(dt);
  }

  render(ctx: CanvasRenderingContext2D, _alpha: number, display: DisplayManager): void {
    const isPortrait = display.isPortrait;
    const vWidth = display.vWidth;
    const vHeight = display.vHeight;

    // Overheat Blue Screen Cutscene
    if (this.isOverheating) {
      ctx.fillStyle = '#0D47A1';
      ctx.fillRect(0, 0, vWidth, vHeight);

      // Cartoon cracked monitor glow
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.beginPath();
      ctx.roundRect(vWidth * 0.1, vHeight * 0.12, vWidth * 0.8, vHeight * 0.76, 24);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = `bold ${isPortrait ? '28px' : '36px'} "Comic Sans MS", sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('💻 COMPUTER CRASH! 💥', vWidth / 2, vHeight * 0.32);

      ctx.font = 'bold 24px "Comic Sans MS", sans-serif';
      ctx.fillStyle = '#FFEB3B';
      ctx.fillText(`Final High Score: ${this.score}!`, vWidth / 2, vHeight * 0.44);

      ctx.fillStyle = '#E0E0E0';
      ctx.font = '16px "Comic Sans MS", sans-serif';
      ctx.fillText('Daddy Pig broke the computer again!', vWidth / 2, vHeight * 0.52);

      // High Score Record
      const best = this.game.storage.getHighScore('daddyPig');
      ctx.fillStyle = '#FFF59D';
      ctx.font = 'bold 15px "Comic Sans MS", sans-serif';
      ctx.fillText(`🏆 All-Time Best: ${best}`, vWidth / 2, vHeight * 0.59);

      // Play Again Button
      const btnW = Math.min(220, vWidth - 60);
      const btnH = 52;
      const btnX = (vWidth - btnW) / 2;
      const btnY = vHeight * 0.66;
      ctx.fillStyle = '#E53935';
      ctx.strokeStyle = '#B71C1C';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(btnX, btnY, btnW, btnH, 16);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 20px "Comic Sans MS", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Play Again 🔄', vWidth / 2, btnY + btnH / 2);
      return;
    }

    const panicStage = this.fever >= 90 ? 3 : (this.fever >= 65 ? 2 : (this.fever >= 35 ? 1 : 0));
    const shakeAmount = panicStage === 3 ? 4 : (panicStage === 2 ? 2 : (panicStage === 1 ? 0.6 : 0));
    const shakeX = Math.sin(this.time * 45) * shakeAmount;
    const shakeY = Math.cos(this.time * 40) * shakeAmount;

    ctx.save();
    if (shakeAmount > 0) {
      ctx.translate(shakeX, shakeY);
    }

    drawLandscapeSkyHills(ctx, vWidth, vHeight, this.time);

    // Office Desk & Computer Setup
    const deskX = isPortrait ? vWidth / 2 : vWidth * 0.72;
    const deskY = isPortrait ? vHeight * 0.44 : 280;

    // Wooden desk
    ctx.fillStyle = '#8D6E63';
    ctx.strokeStyle = '#5D4037';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(deskX - 110, deskY + 30, 220, 36, 8);
    ctx.fill();
    ctx.stroke();

    // CRT Monitor
    ctx.fillStyle = '#CFD8DC';
    ctx.strokeStyle = '#37474F';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(deskX - 85, deskY - 20, 60, 50, 6);
    ctx.fill();
    ctx.stroke();

    // Monitor screen color changing with fever
    const screenColor = this.fever >= 90 ? (Math.sin(this.time * 20) > 0 ? '#F44336' : '#FFEB3B') : (this.fever >= 65 ? '#FFA000' : '#4CAF50');
    ctx.fillStyle = screenColor;
    ctx.beginPath();
    ctx.roundRect(deskX - 80, deskY - 16, 50, 38, 4);
    ctx.fill();

    // Daddy Pig Character
    const pigX = isPortrait ? vWidth / 2 : vWidth * 0.72;
    const pigY = isPortrait ? vHeight * 0.38 : 240;
    drawDaddyPig(ctx, pigX, pigY, isPortrait ? 1.25 : 1.1, {
      panicStage,
      time: this.time,
      sweatCount: panicStage > 0 ? panicStage * 2 : 0
    });

    this.particles.render(ctx);
    ctx.restore();

    // Fever Bar
    const barW = Math.min(420, vWidth - 60);
    const barX = (vWidth - barW) / 2;
    const barY = isPortrait ? vHeight * 0.62 : 470;
    const barH = 30;

    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.roundRect(barX, barY, barW, barH, 15);
    ctx.fill();

    const feverGrad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
    feverGrad.addColorStop(0, '#4CAF50');
    feverGrad.addColorStop(0.6, '#FFEB3B');
    feverGrad.addColorStop(1, '#F44336');

    ctx.fillStyle = feverGrad;
    ctx.beginPath();
    ctx.roundRect(barX + 3, barY + 3, Math.max(0, (barW - 6) * (this.fever / 100)), barH - 6, 12);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 14px "Comic Sans MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`⚡ FRENZY: ${this.multiplier}x MULTIPLIER ⚡`, barX + barW / 2, barY + barH / 2);
    ctx.restore();

    // Tap Prompt for Toddlers
    if (isPortrait) {
      ctx.fillStyle = '#FFE600';
      ctx.font = '900 22px "Comic Sans MS", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('👉 TAP RAPIDLY! 👈', vWidth / 2, Math.min(vHeight - 45, barY + 68));
    }

    // Score Badge (Positioned below HUD in portrait)
    const scoreX = vWidth / 2;
    const scoreY = isPortrait ? 76 : Math.max(18, vHeight * 0.035);
    const badgeW = isPortrait ? 290 : 260;
    const badgeH = 46;

    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.roundRect(scoreX - badgeW / 2, scoreY, badgeW, badgeH, 23);
    ctx.fill();
    ctx.strokeStyle = '#4DD0E1';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.fillStyle = '#FFD54F';
    ctx.font = 'bold 20px "Comic Sans MS", cursive, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`Score: ${this.score}  |  ⏱ ${this.timer.toFixed(1)}s`, scoreX, scoreY + badgeH / 2);
    ctx.restore();
  }

  override getModeState(): Record<string, unknown> {
    return {
      timer: this.timer,
      feverMeter: this.fever,
      fever: this.fever,
      multiplier: this.multiplier,
      coopSavedCount: 0,
      isOverheating: this.isOverheating,
      panicStage: this.fever >= 90 ? 3 : (this.fever >= 65 ? 2 : (this.fever >= 35 ? 1 : 0))
    };
  }

  override getEntities(): Record<string, unknown> {
    return {
      eggs: [],
      chicks: [],
      puddles: [],
      seeds: [],
      particles: this.particles.active
    };
  }
}
