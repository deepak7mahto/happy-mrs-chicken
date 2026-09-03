/**
 * Mode 4: Dad's Kitchen Dash (Hyper-Speed Frenzy Test)
 * Adventures of Trishu 8-Game Suite
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
import { drawDad } from '../graphics/characters/dadRenderer';

export class DadKitchenScene extends BaseScene {
  public time: number = 0;
  public fever: number = 0;
  public timer: number = 20.0; // Preserved for compatibility
  public multiplier: number = 1;
  public itemsStacked: number = 0;
  public celebrationTimer: number = 0;
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
    this.itemsStacked = 0;
    this.celebrationTimer = 0;
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
    const isPortrait = this.game.display.isPortrait;
    const dadX = isPortrait ? this.game.display.vWidth / 2 : this.game.display.vWidth * 0.72;
    const dadY = isPortrait ? this.game.display.vHeight * 0.38 : 240;

    if (this.celebrationTimer > 0) {
      // Tapping during celebration restarts the stack immediately
      this.celebrationTimer = 0;
      this.fever = 0;
      this.isOverheating = false;
    }

    this.itemsStacked++;
    this.fever = Math.min(100, this.fever + 6);
    this.multiplier = this.fever >= 90 ? 5 : (this.fever >= 60 ? 3 : (this.fever >= 30 ? 2 : 1));
    const earned = 10 * this.multiplier;
    this.score += earned;

    soundEngine.playSFX('eggPop');
    soundEngine.playSFX('cluck');
    Haptics.tap();

    if (this.fever >= 60) {
      this.particles.spawnSparkles(dadX, dadY - 20, 4);
    }

    // FEAST CELEBRATION at 100%!
    if (this.fever >= 100) {
      this.isOverheating = false; // Never freeze
      this.celebrationTimer = 2.5;
      this.score += 250;
      soundEngine.playSFX('fanfare');
      soundEngine.playSFX('toddlerGiggle');
      Haptics.fanfare();
      this.particles.spawnConfetti(dadX, dadY, 30);
      this.particles.spawnSparkles(dadX, dadY - 40, 15);
      this.game.storage.saveHighScore('daddyPig', this.score);
    }
  }

  update(dt: number, input: InputManager): void {
    this.time += dt;

    if (this.celebrationTimer > 0) {
      this.celebrationTimer -= dt;
      if (this.celebrationTimer <= 0) {
        this.fever = 0;
      }
    } else {
      // Gentle decay only if idle for a long time
      this.fever = Math.max(0, this.fever - 2.5 * dt);
      this.multiplier = this.fever >= 90 ? 5 : (this.fever >= 60 ? 3 : (this.fever >= 30 ? 2 : 1));
    }

    // Toddler Tap anywhere on screen triggers rapid stacking!
    if (input.isActionJustPressed()) {
      this.tap();
    }

    this.particles.update(dt);
  }

  render(ctx: CanvasRenderingContext2D, _alpha: number, display: DisplayManager): void {
    const isPortrait = display.isPortrait;
    const vWidth = display.vWidth;
    const vHeight = display.vHeight;

    // Happy Feast Celebration Screen
    if (this.celebrationTimer > 0) {
      drawLandscapeSkyHills(ctx, vWidth, vHeight, this.time);

      // Celebration banner
      ctx.fillStyle = 'rgba(255, 238, 88, 0.92)';
      ctx.strokeStyle = '#F57F17';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(vWidth * 0.08, vHeight * 0.15, vWidth * 0.84, vHeight * 0.45, 24);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#BF360C';
      ctx.font = `bold ${isPortrait ? '26px' : '32px'} "Comic Sans MS", sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('🥞 PANCAKE TOWER FEAST! 🥞', vWidth / 2, vHeight * 0.26);

      ctx.font = 'bold 22px "Comic Sans MS", sans-serif';
      ctx.fillStyle = '#1B5E20';
      ctx.fillText(`Yummy! +250 Bonus! Score: ${this.score}`, vWidth / 2, vHeight * 0.35);

      ctx.fillStyle = '#3E2723';
      ctx.font = '18px "Comic Sans MS", sans-serif';
      ctx.fillText('Dad loved the pancakes! 😋', vWidth / 2, vHeight * 0.43);

      this.particles.render(ctx);

      ctx.fillStyle = '#FFE600';
      ctx.font = '900 22px "Comic Sans MS", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('👉 TAP TO STACK MORE! 👈', vWidth / 2, vHeight * 0.72);
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

    // Kitchen Counter & Setup
    const deskX = isPortrait ? vWidth / 2 : vWidth * 0.72;
    const deskY = isPortrait ? vHeight * 0.44 : 280;

    // Kitchen counter
    ctx.fillStyle = '#8D6E63';
    ctx.strokeStyle = '#5D4037';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(deskX - 110, deskY + 30, 220, 36, 8);
    ctx.fill();
    ctx.stroke();

    // Toaster / Kitchen Appliance
    ctx.fillStyle = '#CFD8DC';
    ctx.strokeStyle = '#37474F';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(deskX - 85, deskY - 20, 60, 50, 6);
    ctx.fill();
    ctx.stroke();

    // Appliance glow changing with fever
    const screenColor = this.fever >= 90 ? (Math.sin(this.time * 20) > 0 ? '#F44336' : '#FFEB3B') : (this.fever >= 65 ? '#FFA000' : '#4CAF50');
    ctx.fillStyle = screenColor;
    ctx.beginPath();
    ctx.roundRect(deskX - 80, deskY - 16, 50, 38, 4);
    ctx.fill();

    // Dad Character
    const dadX = isPortrait ? vWidth / 2 : vWidth * 0.72;
    const dadY = isPortrait ? vHeight * 0.38 : 240;
    drawDad(ctx, dadX, dadY, isPortrait ? 1.25 : 1.1, {
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
    ctx.fillText(`🥞 Stacked: ${this.itemsStacked}  |  ★ ${this.score}`, scoreX, scoreY + badgeH / 2);
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

export const DaddyPigScene = DadKitchenScene;
