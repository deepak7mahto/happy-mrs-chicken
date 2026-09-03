/**
 * Mode 14: Windy Castle Kite
 * Adventures of Trishu Mini-Game Suite
 * Strictly under 500 Lines of Code
 */

import { BaseScene } from '../base/BaseScene';
import { GameEngine } from '../../engine/GameEngine';
import { InputManager } from '../../engine/InputManager';
import { DisplayManager } from '../../engine/DisplayManager';
import { soundEngine } from '../../engine/SoundEngine';
import { Haptics } from '../../engine/Haptics';
import { drawLandscapeSkyHills } from '../../graphics/environmentRenderer';
import { drawTrishu } from '../../graphics/characters';

interface RainbowRibbon {
  x: number;
  y: number;
  color: string;
  collected: boolean;
}

export class WindyKiteScene extends BaseScene {
  public time: number = 0;
  private kiteX: number = 240;
  private kiteY: number = 180;
  private targetKiteX: number = 240;
  private targetKiteY: number = 180;
  private ribbons: RainbowRibbon[] = [];
  private ribbonBows: string[] = ['#FF4081', '#FFD700', '#00E676', '#448AFF'];
  private collectedCount: number = 0;
  private loopTimer: number = 0;

  constructor(game: GameEngine) {
    super(game);
  }

  enter(): void {
    this.score = 0;
    this.collectedCount = 0;
    this.loopTimer = 0;
    this.ribbons = [];
    this.spawnRibbons();
    soundEngine.unlock();
  }

  private spawnRibbons(): void {
    const vWidth = this.game.display.vWidth;
    const colors = ['#FF5252', '#FFD740', '#69F0AE', '#40C4FF', '#E040FB'];
    this.ribbons = [];
    for (let i = 0; i < 5; i++) {
      this.ribbons.push({
        x: 80 + Math.random() * (vWidth - 160),
        y: 90 + Math.random() * 180,
        color: colors[i % colors.length],
        collected: false
      });
    }
  }

  swoopKite(tx: number, ty: number): void {
    this.targetKiteX = tx;
    this.targetKiteY = Math.max(70, Math.min(320, ty));
    this.loopTimer = 0.6;
    soundEngine.playSFX('whoosh');
    Haptics.medium();
  }

  update(dt: number, input: InputManager): void {
    this.time += dt;

    if (this.loopTimer > 0) {
      this.loopTimer -= dt;
    }

    // Smooth kite movement towards target with gentle wind sway
    const windSwayX = Math.sin(this.time * 2.5) * 22;
    const windSwayY = Math.cos(this.time * 2.0) * 14;
    this.kiteX += (this.targetKiteX + windSwayX - this.kiteX) * dt * 4;
    this.kiteY += (this.targetKiteY + windSwayY - this.kiteY) * dt * 4;

    // Check ribbon collection
    for (const r of this.ribbons) {
      if (!r.collected && Math.hypot(this.kiteX - r.x, this.kiteY - r.y) <= 45) {
        r.collected = true;
        this.collectedCount++;
        this.ribbonBows.push(r.color);
        this.score += 25;
        this.game.storage.saveHighScore('windyKite', this.score);
        soundEngine.playSFX('bubblePop');
        Haptics.tap();
        this.game.particles.spawnSparkles(r.x, r.y, 8);

        // All collected? Respawn with celebration!
        const remaining = this.ribbons.filter(rib => !rib.collected).length;
        if (remaining === 0) {
          soundEngine.playSFX('fanfare');
          soundEngine.playSFX('toddlerGiggle');
          Haptics.success();
          this.score += 75;
          this.game.storage.saveHighScore('windyKite', this.score);
          setTimeout(() => this.spawnRibbons(), 400);
        }
      }
    }

    if (input.actionJustReleased) {
      this.swoopKite(input.primaryPointer.x, input.primaryPointer.y);
    }
    for (const ptr of input.pointers.values()) {
      if (ptr.justPressed) {
        this.swoopKite(ptr.x, ptr.y);
        break;
      }
    }
  }

  render(ctx: CanvasRenderingContext2D, _alpha: number, display: DisplayManager): void {
    const vWidth = display.vWidth;
    const vHeight = display.vHeight;

    drawLandscapeSkyHills(ctx, vWidth, vHeight, this.time);

    // Floating Rainbow Ribbons (Stars)
    for (const r of this.ribbons) {
      if (!r.collected) {
        const floatY = r.y + Math.sin(this.time * 3 + r.x) * 8;
        ctx.save();
        ctx.translate(r.x, floatY);

        // Golden Star / Ribbon Glow
        ctx.fillStyle = r.color;
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, 0, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.font = 'bold 13px "Comic Sans MS", sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('★', 0, 1);
        ctx.restore();
      }
    }

    // Trishu on Ground
    const trishuX = 85;
    const trishuY = vHeight - 110;
    drawTrishu(ctx, trishuX, trishuY, 0.45, {
      armWave: Math.sin(this.time * 4) * 0.25,
      eyeBlink: Math.sin(this.time * 2.2) > 0.85,
      jumpY: this.loopTimer > 0 ? 8 : 0,
      expression: 'excited'
    });

    // Kite String from Trishu's Hand to Kite
    ctx.save();
    ctx.strokeStyle = '#ECEFF1';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(trishuX + 18, trishuY - 20);
    // Cathead curve for wind sag
    const midX = (trishuX + this.kiteX) / 2;
    const midY = (trishuY + this.kiteY) / 2 + 25;
    ctx.quadraticCurveTo(midX, midY, this.kiteX, this.kiteY + 28);
    ctx.stroke();
    ctx.restore();

    // The Flying Kite
    ctx.save();
    ctx.translate(this.kiteX, this.kiteY);
    const loopAngle = this.loopTimer > 0 ? Math.sin(this.loopTimer * 10) * 0.4 : Math.sin(this.time * 2) * 0.12;
    ctx.rotate(loopAngle);

    // Kite Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
    ctx.beginPath();
    ctx.moveTo(0, -32 + 6);
    ctx.lineTo(26, 0 + 6);
    ctx.lineTo(0, 32 + 6);
    ctx.lineTo(-26, 0 + 6);
    ctx.closePath();
    ctx.fill();

    // 4 Quadrants of the Diamond Kite
    const drawFacet = (p1x: number, p1y: number, p2x: number, p2y: number, color: string) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(p1x, p1y);
      ctx.lineTo(p2x, p2y);
      ctx.closePath();
      ctx.fill();
    };

    drawFacet(0, -32, 26, 0, '#FF1744');
    drawFacet(26, 0, 0, 32, '#FFEA00');
    drawFacet(0, 32, -26, 0, '#00E676');
    drawFacet(-26, 0, 0, -32, '#2979FF');

    // Diamond Border & Cross Spars
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, -32);
    ctx.lineTo(26, 0);
    ctx.lineTo(0, 32);
    ctx.lineTo(-26, 0);
    ctx.closePath();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, -32);
    ctx.lineTo(0, 32);
    ctx.moveTo(-26, 0);
    ctx.lineTo(26, 0);
    ctx.stroke();

    // Fluttering Tail Ribbons
    ctx.strokeStyle = '#37474F';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 32);
    for (let i = 1; i <= Math.min(6, this.ribbonBows.length); i++) {
      const tailX = Math.sin(this.time * 6 + i * 0.8) * (14 + i * 4);
      const tailY = 32 + i * 18;
      ctx.lineTo(tailX, tailY);
    }
    ctx.stroke();

    // Bow ties on the tail
    for (let i = 1; i <= Math.min(6, this.ribbonBows.length); i++) {
      const bowX = Math.sin(this.time * 6 + i * 0.8) * (14 + i * 4);
      const bowY = 32 + i * 18;
      ctx.fillStyle = this.ribbonBows[i % this.ribbonBows.length];
      ctx.beginPath();
      ctx.ellipse(bowX, bowY, 8, 4, Math.sin(this.time * 4) * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Tap Prompt
    ctx.save();
    ctx.font = 'bold 15px "Comic Sans MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#37474F';
    ctx.fillText('🪁 Tap anywhere to swoop the kite!', vWidth / 2, vHeight - 30);

    // Top HUD
    ctx.font = 'bold 18px "Comic Sans MS", sans-serif';
    ctx.fillStyle = '#1565C0';
    ctx.textAlign = 'left';
    ctx.fillText(`✨ Stars: ${this.collectedCount}`, 22, 38);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#D81B60';
    ctx.fillText(`★ Score: ${this.score}`, vWidth - 22, 38);
    ctx.restore();
  }
}
