/**
 * Mode 11: Miss Bunny's Ice Cream Van
 * Adventures of Trishu Mini-Game Suite
 * Strictly under 500 Lines of Code
 */

import { BaseScene } from './BaseScene';
import { GameEngine } from '../engine/GameEngine';
import { InputManager } from '../engine/InputManager';
import { DisplayManager } from '../engine/DisplayManager';
import { soundEngine } from '../engine/SoundEngine';
import { Haptics } from '../engine/Haptics';
import { drawLandscapeSkyHills } from '../graphics/environmentRenderer';
import { drawMimi, drawTrishu } from '../graphics/characters';

interface FlavorTub {
  name: string;
  color: string;
  borderColor: string;
  x: number;
  y: number;
  radius: number;
}

interface Scoop {
  color: string;
  borderColor: string;
  wobblePhase: number;
  scale: number;
  hasCherry?: boolean;
}

export class IceCreamVanScene extends BaseScene {
  public time: number = 0;
  private scoops: Scoop[] = [];
  private totalScooped: number = 0;
  private celebrationTimer: number = 0;
  private munchTimer: number = 0;
  private customerIdx: number = 0;

  constructor(game: GameEngine) {
    super(game);
  }

  enter(): void {
    this.score = 0;
    this.totalScooped = 0;
    this.scoops = [];
    this.celebrationTimer = 0;
    this.munchTimer = 0;
    soundEngine.unlock();
  }

  private getFlavors(vWidth: number, vHeight: number): FlavorTub[] {
    const tubY = vHeight - 55;
    const spacing = vWidth / 5;
    return [
      { name: 'Berry', color: '#FF80AB', borderColor: '#F50057', x: spacing * 1, y: tubY, radius: 36 },
      { name: 'Banana', color: '#FFEE58', borderColor: '#FBC02D', x: spacing * 2, y: tubY, radius: 36 },
      { name: 'Choco', color: '#8D6E63', borderColor: '#5D4037', x: spacing * 3, y: tubY, radius: 36 },
      { name: 'Mint', color: '#69F0AE', borderColor: '#00E676', x: spacing * 4, y: tubY, radius: 36 }
    ];
  }

  addScoop(flavor: FlavorTub): void {
    if (this.munchTimer > 0) return;

    soundEngine.playSFX('eggPop');
    Haptics.tap();

    const isCelebration = (this.scoops.length + 1) % 5 === 0;
    this.scoops.push({
      color: flavor.color,
      borderColor: flavor.borderColor,
      wobblePhase: Math.random() * Math.PI,
      scale: 0.1,
      hasCherry: isCelebration
    });

    this.totalScooped++;
    this.score += isCelebration ? 50 : 10;
    this.game.storage.saveHighScore('iceCreamVan', this.score);

    const vWidth = this.game.display.vWidth;
    const vHeight = this.game.display.vHeight;
    this.game.particles.spawnSparkles(vWidth / 2, vHeight - 160 - this.scoops.length * 28, 8);

    if (isCelebration) {
      soundEngine.playSFX('fanfare');
      soundEngine.playSFX('toddlerGiggle');
      Haptics.success();
      this.celebrationTimer = 2.0;
    }
  }

  munchFeast(): void {
    if (this.scoops.length === 0 || this.munchTimer > 0) return;
    this.munchTimer = 1.2;
    soundEngine.playSFX('pancakeSizzle');
    soundEngine.playSFX('toddlerGiggle');
    Haptics.medium();
    this.score += 30;
    this.game.storage.saveHighScore('iceCreamVan', this.score);
  }

  update(dt: number, input: InputManager): void {
    this.time += dt;

    if (this.celebrationTimer > 0) {
      this.celebrationTimer -= dt;
    }

    if (this.munchTimer > 0) {
      this.munchTimer -= dt;
      if (this.munchTimer <= 0) {
        this.scoops = [];
        this.customerIdx = (this.customerIdx + 1) % 2;
      }
    }

    // Grow scoops smoothly
    for (const s of this.scoops) {
      if (s.scale < 1.0) {
        s.scale = Math.min(1.0, s.scale + dt * 6);
      }
    }

    // Handle touch inputs
    const vWidth = this.game.display.vWidth;
    const vHeight = this.game.display.vHeight;
    const flavors = this.getFlavors(vWidth, vHeight);

    const checkTap = (x: number, y: number) => {
      // Check flavor tubs
      for (const f of flavors) {
        if (Math.hypot(x - f.x, y - f.y) <= f.radius + 12) {
          this.addScoop(f);
          return;
        }
      }

      // Check center cone / customer to munch
      const coneX = vWidth / 2;
      const coneY = vHeight - 150;
      if (Math.hypot(x - coneX, y - coneY) <= 80 || y < coneY) {
        if (this.scoops.length >= 3) {
          this.munchFeast();
        } else {
          this.addScoop(flavors[Math.floor(Math.random() * flavors.length)]);
        }
      }
    };

    if (input.actionJustReleased) {
      checkTap(input.primaryPointer.x, input.primaryPointer.y);
    }
  }

  render(ctx: CanvasRenderingContext2D, _alpha: number, display: DisplayManager): void {
    const vWidth = display.vWidth;
    const vHeight = display.vHeight;
    const isPortrait = display.isPortrait;

    drawLandscapeSkyHills(ctx, vWidth, vHeight, this.time);

    // Ice Cream Van Awning & Counter
    ctx.save();
    ctx.fillStyle = '#FFF9C4';
    ctx.beginPath();
    ctx.roundRect(16, 60, vWidth - 32, 100, 16);
    ctx.fill();

    // Striped Awning
    const stripeW = (vWidth - 32) / 8;
    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = i % 2 === 0 ? '#E91E63' : '#FFFFFF';
      ctx.beginPath();
      ctx.roundRect(16 + i * stripeW, 60, stripeW, 26, [8, 8, 4, 4]);
      ctx.fill();
    }

    // Van Signboard
    ctx.font = '900 22px "Comic Sans MS", cursive, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#C2185B';
    ctx.fillText("🍦 Miss Bunny's Ice Cream 🍦", vWidth / 2, 114);
    ctx.restore();

    // Miss Bunny Host on Left
    ctx.save();
    drawMimi(ctx, 65, isPortrait ? 230 : 200, 0.45, {
      earFlap: Math.sin(this.time * 4) * 0.15,
      hopY: Math.abs(Math.sin(this.time * 5)) * 6,
      holdingWand: false,
      blowingBubble: false,
      eyeBlink: Math.sin(this.time * 2) > 0.85
    });
    ctx.restore();

    // Customer on Right
    ctx.save();
    const custX = vWidth - 65;
    const custY = isPortrait ? 235 : 205;
    drawTrishu(ctx, custX, custY, 0.45, {
      jumpY: this.celebrationTimer > 0 ? Math.abs(Math.sin(this.time * 8)) * 10 : 0,
      squish: 1.0,
      squash: 1.0,
      armWave: Math.sin(this.time * 5) * 0.25,
      eyeBlink: Math.sin(this.time * 2.2) > 0.85,
      expression: 'happy'
    });
    ctx.restore();

    // Big Waffle Cone in Center
    const coneX = vWidth / 2;
    const coneY = vHeight - 145;

    ctx.save();
    // Cone Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.14)';
    ctx.beginPath();
    ctx.ellipse(coneX, coneY + 12, 38, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Waffle Triangle
    ctx.fillStyle = '#FFB74D';
    ctx.strokeStyle = '#E65100';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(coneX - 32, coneY - 10);
    ctx.lineTo(coneX + 32, coneY - 10);
    ctx.lineTo(coneX, coneY + 58);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Waffle Crosshatch Pattern
    ctx.strokeStyle = '#F57C00';
    ctx.lineWidth = 1.5;
    for (let i = -20; i <= 20; i += 10) {
      ctx.beginPath();
      ctx.moveTo(coneX + i, coneY - 8);
      ctx.lineTo(coneX + i / 2, coneY + 50);
      ctx.stroke();
    }
    ctx.restore();

    // Stacked Scoops
    const baseScoopY = coneY - 22;
    for (let i = 0; i < this.scoops.length; i++) {
      const s = this.scoops[i];
      const wobble = Math.sin(this.time * 4 + s.wobblePhase) * Math.min(8, (i + 1) * 1.5);
      const scoopY = baseScoopY - i * 28;

      ctx.save();
      ctx.translate(coneX + wobble, scoopY);
      ctx.scale(s.scale, s.scale);

      // Scoop Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.beginPath();
      ctx.arc(0, 4, 30, 0, Math.PI * 2);
      ctx.fill();

      // Scoop Body
      ctx.fillStyle = s.color;
      ctx.strokeStyle = s.borderColor;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(0, 0, 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Drippy Ruffles on Bottom
      ctx.beginPath();
      ctx.arc(-18, 18, 10, 0, Math.PI * 2);
      ctx.arc(0, 20, 11, 0, Math.PI * 2);
      ctx.arc(18, 18, 10, 0, Math.PI * 2);
      ctx.fill();

      // Cherry on Top (if 5th scoop)
      if (s.hasCherry) {
        ctx.fillStyle = '#D50000';
        ctx.strokeStyle = '#B71C1C';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, -28, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = '#33691E';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(0, -38);
        ctx.quadraticCurveTo(8, -48, 12, -44);
        ctx.stroke();
      }

      ctx.restore();
    }

    // Munching Effect Callout
    if (this.munchTimer > 0) {
      ctx.save();
      ctx.font = '900 36px "Comic Sans MS", cursive, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#E91E63';
      ctx.fillText('YUM YUM! 😋', vWidth / 2, coneY - 90);
      ctx.restore();
    }

    // Flavor Tubs (Bottom Interactive Bar)
    const flavors = this.getFlavors(vWidth, vHeight);
    for (const f of flavors) {
      ctx.save();
      ctx.translate(f.x, f.y);

      // Tub shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.16)';
      ctx.beginPath();
      ctx.ellipse(0, f.radius + 2, f.radius, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      // Tub Body
      ctx.fillStyle = f.color;
      ctx.strokeStyle = f.borderColor;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, f.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // White inner ring highlight
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, -4, f.radius * 0.65, 0, Math.PI * 2);
      ctx.stroke();

      // Label
      ctx.font = 'bold 12px "Comic Sans MS", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#37474F';
      ctx.fillText(f.name, 0, 2);
      ctx.restore();
    }

    // Top HUD Stats
    ctx.save();
    ctx.font = 'bold 18px "Comic Sans MS", sans-serif';
    ctx.fillStyle = '#2E7D32';
    ctx.textAlign = 'left';
    ctx.fillText(`🍨 Scoops: ${this.totalScooped}`, 22, 38);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#C2185B';
    ctx.fillText(`★ Score: ${this.score}`, vWidth - 22, 38);
    ctx.restore();
  }
}
