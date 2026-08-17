import { BaseScene } from './BaseScene';
import { GameEngine } from '../engine/GameEngine';
import { InputManager } from '../engine/InputManager';
import { DisplayManager } from '../engine/DisplayManager';
import { ParticleEngine } from '../engine/ParticleEngine';
import { soundEngine } from '../engine/SoundEngine';
import { Haptics } from '../engine/Haptics';
import { drawLandscapeSkyHills } from '../graphics/environmentRenderer';
import { drawDaddyPig } from '../graphics/daddyPigRenderer';

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
    const pigX = isPortrait ? this.game.display.vWidth / 2 : this.game.display.vWidth * 0.75;
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

    drawLandscapeSkyHills(ctx, vWidth, vHeight, this.time);

    // Overheat Blue Screen Cutscene
    if (this.isOverheating) {
      ctx.fillStyle = '#0D47A1';
      ctx.fillRect(0, 0, vWidth, vHeight);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = `bold ${isPortrait ? '28px' : '36px'} "Comic Sans MS", sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('💻 COMPUTER CRASH! 💥', vWidth / 2, vHeight * 0.35);

      ctx.font = 'bold 22px "Comic Sans MS", sans-serif';
      ctx.fillStyle = '#FFEB3B';
      ctx.fillText(`Final High Score: ${this.score}!`, vWidth / 2, vHeight * 0.46);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '16px "Comic Sans MS", sans-serif';
      ctx.fillText('Daddy Pig broke the computer again!', vWidth / 2, vHeight * 0.54);

      // Back to Menu Button
      ctx.fillStyle = '#E53935';
      ctx.beginPath();
      ctx.roundRect(vWidth / 2 - 100, vHeight * 0.64, 200, 50, 15);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 20px "Comic Sans MS", sans-serif';
      ctx.fillText('Play Again', vWidth / 2, vHeight * 0.64 + 32);
      return;
    }

    // Daddy Pig Character
    const pigX = isPortrait ? vWidth / 2 : vWidth * 0.75;
    const pigY = isPortrait ? vHeight * 0.38 : 260;
    const panicStage = this.fever >= 90 ? 3 : (this.fever >= 65 ? 2 : (this.fever >= 35 ? 1 : 0));
    drawDaddyPig(ctx, pigX, pigY, isPortrait ? 1.25 : 1.1, { panicStage, time: this.time });

    this.particles.render(ctx);

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
    ctx.fillText(`⚡ FRENZY: ${this.multiplier}x MULTIPLIER ⚡`, barX + barW / 2, barY + 20);
    ctx.restore();

    // Tap Prompt for Kids
    if (isPortrait) {
      ctx.fillStyle = '#FFE600';
      ctx.font = '900 24px "Comic Sans MS", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('👉 TAP RAPIDLY! 👈', vWidth / 2, Math.min(vHeight - 50, barY + 70));
    }

    // Score Badge
    const scoreX = vWidth / 2;
    const scoreY = Math.max(20, Math.min(30, vHeight * 0.03));
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.roundRect(scoreX - 120, scoreY, 240, 42, 21);
    ctx.fill();
    ctx.fillStyle = '#FFD54F';
    ctx.font = 'bold 18px "Comic Sans MS", cursive, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`Score: ${this.score}  |  ⏱ ${this.timer.toFixed(1)}s`, scoreX, scoreY + 22);
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

