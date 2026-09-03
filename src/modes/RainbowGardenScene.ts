/**
 * Mode 15: Rainbow Flower Garden
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
import { drawGrandpa } from '../graphics/characters';

interface FlowerMound {
  x: number;
  y: number;
  growth: number; // 0 (seed) -> 1.0 (bloomed)
  color: string;
  type: 'sunflower' | 'tulip' | 'daisy' | 'rose';
  bloomed: boolean;
}

export class RainbowGardenScene extends BaseScene {
  public time: number = 0;
  private mounds: FlowerMound[] = [];
  private totalBloomed: number = 0;
  private wateringCanX: number = 200;
  private isWatering: boolean = false;
  private rainbowTimer: number = 0;
  private butterflies: Array<{ x: number; y: number; color: string; phase: number }> = [];

  constructor(game: GameEngine) {
    super(game);
  }

  enter(): void {
    this.score = 0;
    this.totalBloomed = 0;
    this.isWatering = false;
    this.rainbowTimer = 0;
    this.initMounds();
    this.initButterflies();
    soundEngine.unlock();
  }

  private initMounds(): void {
    const vWidth = this.game.display.vWidth;
    const vHeight = this.game.display.vHeight;
    const groundY = vHeight - 110;
    const spacing = vWidth / 5;

    this.mounds = [
      { x: spacing * 1, y: groundY, growth: 0, color: '#FFD600', type: 'sunflower', bloomed: false },
      { x: spacing * 2, y: groundY, growth: 0, color: '#FF4081', type: 'tulip', bloomed: false },
      { x: spacing * 3, y: groundY, growth: 0, color: '#448AFF', type: 'daisy', bloomed: false },
      { x: spacing * 4, y: groundY, growth: 0, color: '#FF5722', type: 'rose', bloomed: false }
    ];
  }

  private initButterflies(): void {
    this.butterflies = [
      { x: 120, y: 160, color: '#E040FB', phase: 0 },
      { x: 380, y: 140, color: '#FFEB3B', phase: 2 }
    ];
  }

  waterMound(mound: FlowerMound): void {
    if (mound.bloomed) {
      // Petal tickle
      soundEngine.playSFX('bunnySqueak');
      Haptics.tap();
      this.game.particles.spawnSparkles(mound.x, mound.y - 60, 6);
      return;
    }

    mound.growth += 0.55;
    this.wateringCanX = mound.x;
    this.isWatering = true;
    soundEngine.playSFX('splash');
    Haptics.tap();

    if (mound.growth >= 1.0) {
      mound.bloomed = true;
      mound.growth = 1.0;
      this.totalBloomed++;
      this.score += 25;
      this.game.storage.saveHighScore('rainbowGarden', this.score);
      soundEngine.playSFX('veggiePop');
      this.game.particles.spawnSparkles(mound.x, mound.y - 50, 10);

      // Check if all 4 flowers are in bloom!
      const unbloomed = this.mounds.filter(m => !m.bloomed).length;
      if (unbloomed === 0) {
        this.rainbowTimer = 2.5;
        this.score += 100;
        this.game.storage.saveHighScore('rainbowGarden', this.score);
        soundEngine.playSFX('fanfare');
        soundEngine.playSFX('toddlerGiggle');
        Haptics.success();

        // Reset mounds after celebration
        setTimeout(() => {
          for (const m of this.mounds) {
            m.growth = 0;
            m.bloomed = false;
          }
        }, 2200);
      }
    }
  }

  update(dt: number, input: InputManager): void {
    this.time += dt;

    if (this.rainbowTimer > 0) {
      this.rainbowTimer -= dt;
    }

    // Update fluttery butterflies
    for (const b of this.butterflies) {
      b.x += Math.sin(this.time * 2 + b.phase) * 35 * dt;
      b.y += Math.cos(this.time * 1.5 + b.phase) * 20 * dt;
    }

    const checkTap = (x: number, y: number) => {
      for (const m of this.mounds) {
        if (Math.hypot(x - m.x, y - m.y) <= 55 || (Math.abs(x - m.x) < 45 && y > m.y - 90)) {
          this.waterMound(m);
          return;
        }
      }
      // Tap anywhere else to water closest mound
      let closest = this.mounds[0];
      let minDist = Infinity;
      for (const m of this.mounds) {
        const d = Math.abs(x - m.x);
        if (d < minDist) {
          minDist = d;
          closest = m;
        }
      }
      this.waterMound(closest);
    };

    if (input.actionJustReleased) {
      checkTap(input.primaryPointer.x, input.primaryPointer.y);
    }
    for (const ptr of input.pointers.values()) {
      if (ptr.justPressed) {
        checkTap(ptr.x, ptr.y);
        break;
      }
    }
  }

  render(ctx: CanvasRenderingContext2D, _alpha: number, display: DisplayManager): void {
    const vWidth = display.vWidth;
    const vHeight = display.vHeight;
    const groundY = vHeight - 110;

    drawLandscapeSkyHills(ctx, vWidth, vHeight, this.time);

    // Rainbow celebration in sky
    if (this.rainbowTimer > 0) {
      ctx.save();
      const rainbowColors = ['#FF1744', '#FF9100', '#FFEA00', '#00E676', '#2979FF', '#AA00FF'];
      const cx = vWidth / 2;
      const cy = vHeight - 30;
      for (let i = 0; i < rainbowColors.length; i++) {
        ctx.strokeStyle = rainbowColors[i];
        ctx.lineWidth = 9;
        ctx.beginPath();
        ctx.arc(cx, cy, 220 + i * 9, Math.PI, 0);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Butterflies
    for (const b of this.butterflies) {
      ctx.save();
      ctx.translate(b.x, b.y);
      const wingFlap = Math.sin(this.time * 12 + b.phase);

      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.ellipse(-6, 0, 8, 12 * Math.abs(wingFlap), -0.2, 0, Math.PI * 2);
      ctx.ellipse(6, 0, 8, 12 * Math.abs(wingFlap), 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Body
      ctx.fillStyle = '#212121';
      ctx.beginPath();
      ctx.ellipse(0, 0, 2, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Grandpa on Far Left
    drawGrandpa(ctx, 60, groundY - 20, 0.42, {
      pullTension: 0,
      eyeBlink: Math.sin(this.time * 2) > 0.85
    });

    // Soil Mounds and Flowers
    for (const m of this.mounds) {
      ctx.save();
      ctx.translate(m.x, m.y);

      // Dark Rich Soil Mound
      ctx.fillStyle = '#4E342E';
      ctx.beginPath();
      ctx.ellipse(0, 10, 36, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      // Stem Growing
      if (m.growth > 0) {
        const stemHeight = m.growth * 58;
        ctx.strokeStyle = '#2E7D32';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(0, 8);
        ctx.lineTo(0, -stemHeight);
        ctx.stroke();

        // Little Green Leaves
        ctx.fillStyle = '#43A047';
        ctx.beginPath();
        ctx.ellipse(-12, -stemHeight * 0.5, 10, 5, -0.4, 0, Math.PI * 2);
        ctx.ellipse(12, -stemHeight * 0.6, 10, 5, 0.4, 0, Math.PI * 2);
        ctx.fill();

        // Giant Cartoon Flower Head
        const flowerY = -stemHeight;
        const petalScale = Math.min(1.0, m.growth * 1.2);
        const wobble = Math.sin(this.time * 4 + m.x) * 0.08;

        ctx.save();
        ctx.translate(0, flowerY);
        ctx.rotate(wobble);
        ctx.scale(petalScale, petalScale);

        // Petals
        const petalCount = m.type === 'sunflower' ? 8 : 6;
        for (let p = 0; p < petalCount; p++) {
          const angle = (p * Math.PI * 2) / petalCount;
          ctx.fillStyle = m.color;
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.ellipse(
            Math.cos(angle) * 18,
            Math.sin(angle) * 18,
            12,
            8,
            angle,
            0,
            Math.PI * 2
          );
          ctx.fill();
          ctx.stroke();
        }

        // Flower Center Face
        ctx.fillStyle = '#FFB300';
        ctx.strokeStyle = '#F57F17';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, 0, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Smiling Face on Flower
        ctx.fillStyle = '#3E2723';
        ctx.beginPath();
        ctx.arc(-4, -2, 2, 0, Math.PI * 2);
        ctx.arc(4, -2, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#3E2723';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 2, 4, 0, Math.PI);
        ctx.stroke();

        ctx.restore();
      }

      ctx.restore();
    }

    // Cute Blue Watering Can
    ctx.save();
    ctx.translate(this.wateringCanX + 15, groundY - 70);
    ctx.rotate(this.isWatering ? -0.25 : 0);

    ctx.fillStyle = '#29B6F6';
    ctx.strokeStyle = '#0288D1';
    ctx.lineWidth = 2.5;
    // Can Body
    ctx.beginPath();
    ctx.roundRect(-16, -12, 32, 24, 6);
    ctx.fill();
    ctx.stroke();
    // Spout
    ctx.beginPath();
    ctx.moveTo(-16, 2);
    ctx.lineTo(-32, -10);
    ctx.stroke();
    // Handle
    ctx.beginPath();
    ctx.arc(18, 0, 10, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();

    // Water droplets if watering
    if (this.isWatering) {
      ctx.fillStyle = '#4FC3F7';
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(-34 - i * 4, 2 + i * 8, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();

    // Tap Prompt
    ctx.save();
    ctx.font = 'bold 15px "Comic Sans MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#37474F';
    ctx.fillText('🌸 Tap mounds to water & grow flowers!', vWidth / 2, vHeight - 30);

    // Top HUD
    ctx.font = 'bold 18px "Comic Sans MS", sans-serif';
    ctx.fillStyle = '#2E7D32';
    ctx.textAlign = 'left';
    ctx.fillText(`🌻 Bloomed: ${this.totalBloomed}`, 22, 38);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#D81B60';
    ctx.fillText(`★ Score: ${this.score}`, vWidth - 22, 38);
    ctx.restore();
  }
}
