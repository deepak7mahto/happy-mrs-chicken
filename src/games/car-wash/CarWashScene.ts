/**
 * Mode 13: Muddy Car Wash
 * Adventures of Trishu Mini-Game Suite
 * Strictly under 500 Lines of Code
 */

import { BaseScene } from '../base/BaseScene';
import { GameEngine } from '../../engine/GameEngine';
import { InputManager } from '../../engine/InputManager';
import { DisplayManager } from '../../engine/DisplayManager';
import { soundEngine } from '../../engine/SoundEngine';
import { Haptics } from '../../engine/Haptics';
import { drawDad } from '../../graphics/characters';

interface MudSpot {
  x: number;
  y: number;
  radius: number;
  cleaned: boolean;
  sudsLevel: number;
}

export class CarWashScene extends BaseScene {
  public time: number = 0;
  private mudSpots: MudSpot[] = [];
  private cleanCarsCount: number = 0;
  private celebrationTimer: number = 0;
  private bubbles: Array<{ x: number; y: number; r: number; vy: number; color: string; life: number }> = [];

  constructor(game: GameEngine) {
    super(game);
  }

  enter(): void {
    this.score = 0;
    this.cleanCarsCount = 0;
    this.celebrationTimer = 0;
    this.bubbles = [];
    this.spawnMud();
    soundEngine.unlock();
  }

  private spawnMud(): void {
    const vWidth = this.game.display.vWidth;
    const vHeight = this.game.display.vHeight;
    const cx = vWidth / 2;
    const cy = vHeight / 2 + 30;

    this.mudSpots = [
      { x: cx - 110, y: cy - 20, radius: 28, cleaned: false, sudsLevel: 0 }, // Hood
      { x: cx - 50, y: cy - 65, radius: 24, cleaned: false, sudsLevel: 0 },  // Windshield
      { x: cx + 40, y: cy - 65, radius: 26, cleaned: false, sudsLevel: 0 },  // Roof/Window
      { x: cx - 10, y: cy + 10, radius: 32, cleaned: false, sudsLevel: 0 },  // Door
      { x: cx + 85, y: cy + 15, radius: 28, cleaned: false, sudsLevel: 0 },  // Rear
      { x: cx - 80, y: cy + 60, radius: 25, cleaned: false, sudsLevel: 0 }   // Front Wheel
    ];
  }

  cleanSpot(spot: MudSpot): void {
    if (spot.cleaned) return;

    spot.sudsLevel += 0.55;
    soundEngine.playSFX('bubblePop');
    Haptics.tap();

    // Spawn rich soap bubbles
    const colors = ['#E1F5FE', '#B3E5FC', '#FFF9C4', '#F8BBD0'];
    for (let i = 0; i < 5; i++) {
      this.bubbles.push({
        x: spot.x + (Math.random() - 0.5) * 30,
        y: spot.y + (Math.random() - 0.5) * 30,
        r: 10 + Math.random() * 16,
        vy: -40 - Math.random() * 50,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1.0
      });
    }

    if (spot.sudsLevel >= 1.0) {
      spot.cleaned = true;
      this.score += 20;
      this.game.storage.saveHighScore('carWash', this.score);
      soundEngine.playSFX('splash');
      this.game.particles.spawnSparkles(spot.x, spot.y, 8);

      // Check if all spots are cleaned!
      const remaining = this.mudSpots.filter(s => !s.cleaned).length;
      if (remaining === 0) {
        this.cleanCarsCount++;
        this.score += 100;
        this.game.storage.saveHighScore('carWash', this.score);
        this.celebrationTimer = 2.0;
        soundEngine.playSFX('fanfare');
        soundEngine.playSFX('toddlerGiggle');
        Haptics.success();
      }
    }
  }

  update(dt: number, input: InputManager): void {
    this.time += dt;

    if (this.celebrationTimer > 0) {
      this.celebrationTimer -= dt;
      if (this.celebrationTimer <= 0) {
        soundEngine.playSFX('mudThud');
        this.spawnMud();
      }
    }

    // Update soap bubbles
    for (let i = this.bubbles.length - 1; i >= 0; i--) {
      const b = this.bubbles[i];
      b.y += b.vy * dt;
      b.life -= dt * 0.9;
      if (b.life <= 0) {
        this.bubbles.splice(i, 1);
      }
    }

    // Check taps and drags across mud spots
    const checkCoords = (x: number, y: number) => {
      for (const m of this.mudSpots) {
        if (!m.cleaned && Math.hypot(x - m.x, y - m.y) <= m.radius + 15) {
          this.cleanSpot(m);
          break;
        }
      }
    };

    if (input.isActionDown() || input.actionJustReleased) {
      checkCoords(input.primaryPointer.x, input.primaryPointer.y);
    }
    for (const ptr of input.pointers.values()) {
      if (ptr.isDown || ptr.justPressed) {
        checkCoords(ptr.x, ptr.y);
      }
    }
  }

  render(ctx: CanvasRenderingContext2D, _alpha: number, display: DisplayManager): void {
    const vWidth = display.vWidth;
    const vHeight = display.vHeight;
    const cx = vWidth / 2;
    const cy = vHeight / 2 + 30;

    // Driveway & Sky
    ctx.save();
    ctx.fillStyle = '#B3E5FC';
    ctx.fillRect(0, 0, vWidth, vHeight);

    // Green Grass Garden
    ctx.fillStyle = '#81C784';
    ctx.fillRect(0, cy + 85, vWidth, vHeight - (cy + 85));

    // Driveway Pavement
    ctx.fillStyle = '#B0BEC5';
    ctx.fillRect(30, cy + 70, vWidth - 60, 30);
    ctx.restore();

    // Dad Watching on Left
    ctx.save();
    drawDad(ctx, 70, cy + 20, 0.45, {
      panicStage: 0,
      time: this.time,
      eyeBlink: Math.sin(this.time * 2) > 0.85
    });
    ctx.restore();

    // Family Car Shadow
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 80, 160, 22, 0, 0, Math.PI * 2);
    ctx.fill();

    // Car Body (Classic Bright Red)
    ctx.fillStyle = '#E53935';
    ctx.strokeStyle = '#B71C1C';
    ctx.lineWidth = 4;

    // Main Chassis
    ctx.beginPath();
    ctx.roundRect(cx - 145, cy - 10, 290, 75, 18);
    ctx.fill();
    ctx.stroke();

    // Cabin Dome
    ctx.beginPath();
    ctx.moveTo(cx - 95, cy - 10);
    ctx.lineTo(cx - 65, cy - 85);
    ctx.lineTo(cx + 65, cy - 85);
    ctx.lineTo(cx + 105, cy - 10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Windows (Light Blue)
    ctx.fillStyle = '#E1F5FE';
    ctx.strokeStyle = '#0288D1';
    ctx.lineWidth = 2.5;

    // Front Window
    ctx.beginPath();
    ctx.moveTo(cx - 85, cy - 12);
    ctx.lineTo(cx - 60, cy - 78);
    ctx.lineTo(cx - 5, cy - 78);
    ctx.lineTo(cx - 5, cy - 12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Rear Window
    ctx.beginPath();
    ctx.moveTo(cx + 5, cy - 12);
    ctx.lineTo(cx + 5, cy - 78);
    ctx.lineTo(cx + 58, cy - 78);
    ctx.lineTo(cx + 92, cy - 12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Headlights (Yellow)
    ctx.fillStyle = '#FFEE58';
    ctx.strokeStyle = '#FBC02D';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(cx - 142, cy + 12, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Wheels (Chunky Black with Hubcaps)
    const drawWheel = (wx: number, wy: number) => {
      ctx.fillStyle = '#212121';
      ctx.strokeStyle = '#BDBDBD';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(wx, wy, 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#EEEEEE';
      ctx.beginPath();
      ctx.arc(wx, wy, 12, 0, Math.PI * 2);
      ctx.fill();
    };

    drawWheel(cx - 85, cy + 68);
    drawWheel(cx + 85, cy + 68);

    // Mud Spots Overlay
    for (const m of this.mudSpots) {
      if (!m.cleaned) {
        ctx.save();
        ctx.translate(m.x, m.y);

        // Brown Mud Splat
        ctx.fillStyle = '#5D4037';
        ctx.beginPath();
        ctx.arc(0, 0, m.radius, 0, Math.PI * 2);
        // Little mud lobes
        ctx.arc(-m.radius * 0.7, -m.radius * 0.4, m.radius * 0.5, 0, Math.PI * 2);
        ctx.arc(m.radius * 0.6, -m.radius * 0.5, m.radius * 0.45, 0, Math.PI * 2);
        ctx.arc(m.radius * 0.5, m.radius * 0.6, m.radius * 0.55, 0, Math.PI * 2);
        ctx.fill();

        // Suds on top if scrubbed
        if (m.sudsLevel > 0) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
          ctx.beginPath();
          ctx.arc(0, 0, m.radius * m.sudsLevel, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }
    }

    // Render Soap Bubbles
    for (const b of this.bubbles) {
      ctx.save();
      ctx.fillStyle = b.color;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // Celebration Sparkling Finish
    if (this.celebrationTimer > 0) {
      ctx.save();
      ctx.font = '900 36px "Comic Sans MS", cursive, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#FFD600';
      ctx.strokeStyle = '#E65100';
      ctx.lineWidth = 5;
      ctx.strokeText('✨ ALL CLEAN! ✨', cx, cy - 110);
      ctx.fillText('✨ ALL CLEAN! ✨', cx, cy - 110);
      ctx.restore();
    }

    // Interactive Instruction Pill
    ctx.save();
    ctx.font = 'bold 15px "Comic Sans MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#37474F';
    ctx.fillText('🧽 Tap & scrub the mud away!', cx, vHeight - 30);

    // Top HUD
    ctx.font = 'bold 18px "Comic Sans MS", sans-serif';
    ctx.fillStyle = '#1565C0';
    ctx.textAlign = 'left';
    ctx.fillText(`🚗 Cleaned: ${this.cleanCarsCount}`, 22, 38);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#D81B60';
    ctx.fillText(`★ Score: ${this.score}`, vWidth - 22, 38);
    ctx.restore();
  }
}
