/**
 * 3D Muddy Kart Scene Coordinator
 * Adventures of Trishu - Mode 17
 * Strictly under 500 Lines of Code
 */

import { BaseScene } from '../base/BaseScene';
import { GameEngine } from '../../engine/GameEngine';
import { InputManager } from '../../engine/InputManager';
import { DisplayManager } from '../../engine/DisplayManager';
import { soundEngine } from '../../engine/SoundEngine';
import { MuddyKartLogic } from './MuddyKartLogic';
import { MuddyKartRenderer } from './MuddyKartRenderer';
import { typesafeRacing, RacingTrophyTitle } from './typesafeRacing';

export class MuddyKartScene extends BaseScene {
  public logic: MuddyKartLogic;
  public renderer: MuddyKartRenderer;
  private time: number = 0;
  private currentSteer: number = 0;
  private speechPrompt: string = 'Steer into the muddy puddles!';
  private trophyTitle: RacingTrophyTitle | '' = '';
  private trophyModalOpen: boolean = false;

  constructor(game: GameEngine) {
    super(game);
    this.logic = new MuddyKartLogic();
    this.renderer = new MuddyKartRenderer();
    this.setupLogicEvents();
  }

  private setupLogicEvents(): void {
    this.logic.onMudSplash = () => {
      soundEngine.playSFX('splash');
      this.game.particles.spawnMudSplash(
        this.game.display.vWidth / 2,
        this.game.display.vHeight * 0.85,
        14
      );
      this.speechPrompt = typesafeRacing.getEncouragementPrompt(
        this.game.selectedAvatar,
        this.logic.stats.mudSplashes
      );
    };

    this.logic.onStarCollect = (combo) => {
      soundEngine.playSFX('bubblePop');
      this.game.particles.spawnSparkles(
        this.game.display.vWidth / 2,
        this.game.display.vHeight * 0.8,
        16
      );
      if (combo > 3) {
        soundEngine.playSFX('fanfare');
      }
    };

    this.logic.onBoostRamp = () => {
      soundEngine.playSFX('whoosh');
      this.game.particles.spawnSparkles(
        this.game.display.vWidth / 2,
        this.game.display.vHeight * 0.82,
        20
      );
    };

    this.logic.onHayBaleBump = () => {
      soundEngine.playSFX('bunnySqueak');
      this.game.particles.spawnMudSplash(
        this.game.display.vWidth / 2,
        this.game.display.vHeight * 0.85,
        8
      );
    };

    this.logic.onLapComplete = (lap) => {
      if (lap >= 2 && !this.trophyModalOpen) {
        this.trophyModalOpen = true;
        // Use TypeSafe System One Choice primitive to award personalized title
        const trophyResult = typesafeRacing.evaluateTrophy({
          avatar: this.game.selectedAvatar,
          stats: this.logic.stats
        });
        this.trophyTitle = trophyResult.choice;
        this.logic.stats.titleAwarded = this.trophyTitle;
        soundEngine.playSFX('fanfare');

        // Check story goal if active
        this.checkStoryGoal(this.logic.stats.mudSplashes, 4);

        // Persist high score
        this.game.storage.saveHighScore('muddyKart', this.logic.stats.score);
      }
    };
  }

  public override enter(): void {
    super.enter();
    this.logic.reset();
    this.time = 0;
    this.trophyModalOpen = false;
    this.trophyTitle = '';
    this.currentSteer = 0;
    this.speechPrompt = 'Steer into the muddy puddles!';
    this.score = 0;

    // Set cheerful classic countryside BGM
    soundEngine.setTrack('classic');
  }

  public override exit(): void {
    super.exit();
    this.trophyModalOpen = false;
  }

  public override update(dt: number, input: InputManager): void {
    this.time += dt * 1000;

    // Handle touch/pointer steering
    let targetSteer = 0;
    const w = this.game.display.vWidth;

    if (input.primaryPointer.isDown) {
      // Touch on left/right half or direct drag offset
      const touchX = input.primaryPointer.x;
      const normalizedTouch = (touchX - w / 2) / (w * 0.38);
      targetSteer = Math.max(-1, Math.min(1, normalizedTouch));
    }

    // Keyboard support
    if (input.isKeyDown('ArrowLeft') || input.isKeyDown('KeyA')) {
      targetSteer = -1;
    } else if (input.isKeyDown('ArrowRight') || input.isKeyDown('KeyD')) {
      targetSteer = 1;
    }

    // Smooth steering interpolation
    this.currentSteer += (targetSteer - this.currentSteer) * Math.min(1, dt * 10);

    // Update headless logic
    this.logic.update(dt, this.currentSteer);
    this.score = this.logic.stats.score;

    // Check Story mode goal (e.g. 5 mud splashes)
    this.checkStoryGoal(this.logic.stats.mudSplashes, 5);

    // If trophy modal is open, tap anywhere to restart or continue
    if (this.trophyModalOpen && input.isActionJustPressed()) {
      this.trophyModalOpen = false;
      this.logic.reset();
    }
  }

  public override render(
    ctx: CanvasRenderingContext2D,
    _alpha: number,
    display: DisplayManager
  ): void {
    const w = display.vWidth;
    const h = display.vHeight;

    // 1. Render 3D World & Kart
    this.renderer.render(ctx, this.logic, display, this.game.selectedAvatar, this.time);

    // 2. Render Tactile HUD
    this.renderHUD(ctx, w, h);

    // 3. Render TypeSafe Trophy Modal if finished lap
    if (this.trophyModalOpen) {
      this.renderTrophyModal(ctx, w, h);
    }
  }

  private renderHUD(ctx: CanvasRenderingContext2D, w: number, _h: number): void {
    ctx.save();

    // Top Bar Container: Mud Splashes & Golden Stars
    const pillY = 18;

    // Mud Splashes Pill
    ctx.fillStyle = 'rgba(93, 64, 55, 0.88)';
    ctx.beginPath();
    ctx.roundRect(16, pillY, 110, 38, 19);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 17px Fredoka, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`💦 ${this.logic.stats.mudSplashes}`, 28, pillY + 25);

    // Golden Stars Pill
    ctx.fillStyle = 'rgba(251, 192, 45, 0.92)';
    ctx.beginPath();
    ctx.roundRect(134, pillY, 105, 38, 19);
    ctx.fill();
    ctx.fillStyle = '#3E2723';
    ctx.font = 'bold 17px Fredoka, sans-serif';
    ctx.fillText(`⭐ ${this.logic.stats.starsCollected}`, 146, pillY + 25);

    // Score Pill (Top Right)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.beginPath();
    ctx.roundRect(w - 126, pillY, 110, 38, 19);
    ctx.fill();
    ctx.fillStyle = '#FFEB3B';
    ctx.textAlign = 'right';
    ctx.font = 'bold 18px Fredoka, sans-serif';
    ctx.fillText(`${this.score}`, w - 30, pillY + 25);

    // Combo Pill
    if (this.logic.stats.combo > 1) {
      ctx.fillStyle = '#E91E63';
      ctx.beginPath();
      ctx.roundRect(w - 126, pillY + 44, 110, 26, 13);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 13px Fredoka, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${this.logic.stats.combo}x COMBO!`, w - 71, pillY + 62);
    }

    // TypeSafe Prompt Bubble (Top Center)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
    ctx.strokeStyle = '#81C784';
    ctx.lineWidth = 3;
    const bubbleW = Math.min(340, w * 0.72);
    const bubbleX = (w - bubbleW) / 2;
    ctx.beginPath();
    ctx.roundRect(bubbleX, pillY + 48, bubbleW, 30, 15);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#2E7D32';
    ctx.font = '600 13px Fredoka, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(this.speechPrompt, w / 2, pillY + 68);

    ctx.restore();
  }

  private renderTrophyModal(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    ctx.save();

    // Dark backdrop
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.fillRect(0, 0, w, h);

    // Modal Card
    const cardW = Math.min(360, w * 0.88);
    const cardH = 260;
    const cardX = (w - cardW) / 2;
    const cardY = (h - cardH) / 2;

    ctx.fillStyle = '#FFF9C4';
    ctx.strokeStyle = '#FBC02D';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, 24);
    ctx.fill();
    ctx.stroke();

    // Header
    ctx.fillStyle = '#E65100';
    ctx.font = 'bold 24px Fredoka, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🏆 Lap Finished! 🏆', w / 2, cardY + 46);

    // Subtitle
    ctx.fillStyle = '#5D4037';
    ctx.font = '600 16px Fredoka, sans-serif';
    ctx.fillText('TypeSafe AI Awarded Title:', w / 2, cardY + 80);

    // Golden Title Banner
    ctx.fillStyle = '#FFB300';
    ctx.beginPath();
    ctx.roundRect(cardX + 20, cardY + 98, cardW - 40, 48, 24);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 18px Fredoka, sans-serif';
    ctx.fillText(this.trophyTitle || 'The Mud Puddle Champion', w / 2, cardY + 128);

    // Stats row
    ctx.fillStyle = '#4E342E';
    ctx.font = '500 15px Fredoka, sans-serif';
    ctx.fillText(
      `💦 ${this.logic.stats.mudSplashes} Splashes   ⭐ ${this.logic.stats.starsCollected} Stars`,
      w / 2,
      cardY + 180
    );

    // Tap to Continue
    ctx.fillStyle = '#43A047';
    ctx.font = 'bold 16px Fredoka, sans-serif';
    ctx.fillText('Tap to Race Again! 🏁', w / 2, cardY + 226);

    ctx.restore();
  }
}
