/**
 * Mode 5: Leo's Balloon Pop (Dinosaur Balloon Pop)
 * Adventures of Trishu 8-Game Suite
 * Strictly under 500 Lines of Code
 */

import { BaseScene } from '../base/BaseScene';
import { GameEngine } from '../../engine/GameEngine';
import { InputManager } from '../../engine/InputManager';
import { DisplayManager } from '../../engine/DisplayManager';
import { BalloonEntity } from '../../types/game';
import { CharacterAnimState } from '../../types/characters';
import { ParticleEngine } from '../../engine/ParticleEngine';
import { soundEngine } from '../../engine/SoundEngine';
import { Haptics } from '../../engine/Haptics';
import { drawLandscapeSkyHills } from '../../graphics/environmentRenderer';
import { drawLeo } from '../../graphics/characters/leoRenderer';
import {
  createCharacterAnimState,
  updateCharacterAnimState,
  getJawRotationAngle,
  getBalloonPopReaction
} from '../../graphics/animations';
import { PALETTE } from '../../graphics/palette';

const BALLOON_COLORS = [
  '#4CAF50', '#2196F3', '#FF5722', '#E91E63',
  '#9C27B0', '#FF9800', '#00BCD4', '#8BC34A'
];

export class DinosaurBalloonScene extends BaseScene {
  public time: number = 0;
  public combo: number = 1;
  public comboTimer: number = 0;
  public balloons: BalloonEntity[] = [];
  public particles: ParticleEngine;
  public animState: CharacterAnimState;
  public chompTimer: number = 0;
  public popTimer: number = 0;
  public poppedCount: number = 0;
  private spawnTimer: number = 0;

  constructor(game: GameEngine) {
    super(game);
    this.particles = new ParticleEngine(150);
    this.animState = createCharacterAnimState();
  }

  enter(): void {
    this.score = 0;
    this.combo = 1;
    this.comboTimer = 0;
    this.balloons = [];
    this.particles.clear();
    this.time = 0;
    this.spawnTimer = 0;
    this.chompTimer = 0;
    this.popTimer = 0;
    this.poppedCount = 0;
    this.animState = createCharacterAnimState();

    const vHeight = this.game.display.vHeight;
    // Spawn 4 initial balloons at staggered heights
    for (let i = 0; i < 4; i++) {
      this.spawnBalloon(vHeight * 0.3 + i * (vHeight * 0.18));
    }
  }

  exit(): void {
    this.particles.clear();
  }

  spawnBalloon(customY?: number): void {
    const vWidth = this.game.display.vWidth;
    const vHeight = this.game.display.vHeight;
    const isGolden = Math.random() < 0.15;
    const shape: 'DINO' | 'ROUND' = Math.random() < 0.65 ? 'DINO' : 'ROUND';
    const color = isGolden
      ? '#FFD700'
      : BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)];

    const margin = 70;
    const x = margin + Math.random() * (vWidth - margin * 2);
    const y = customY !== undefined ? customY : vHeight + 45;
    const radius = isGolden ? 38 : (shape === 'DINO' ? 36 : 32) + Math.random() * 4;
    const vy = -(42 + Math.random() * 25); // Gentle float speed for toddler eyes and hands

    this.balloons.push({
      x,
      y,
      vx: 0,
      vy,
      radius,
      color,
      shape,
      popped: false,
      wobblePhase: Math.random() * Math.PI * 2
    });
  }

  popBalloon(index: number, ptrX: number, ptrY: number): void {
    const b = this.balloons[index];
    if (!b || b.popped) return;
    b.popped = true;
    this.poppedCount++;

    const isGolden = b.color === '#FFD700' || b.color === '#FFC107';
    const basePts = isGolden ? 100 : 50;
    const pts = basePts * this.combo;
    this.score += pts;

    this.comboTimer = 2.2;
    this.combo = Math.min(10, this.combo + 1);

    // Audio & Haptic Feedback
    soundEngine.playSFX('balloonPop');
    if (isGolden) {
      soundEngine.playSFX('dinosaurRoar');
      Haptics.heavy();
    } else if (this.combo >= 3) {
      soundEngine.playSFX('toddlerGiggle');
      Haptics.medium();
    } else {
      if (Math.random() < 0.3) soundEngine.playSFX('dinosaurRoar');
      Haptics.tap();
    }

    // Particle Emitters
    this.particles.spawnConfetti(b.x, b.y, isGolden ? 25 : 20);
    this.particles.spawnSparkles(b.x, b.y, isGolden ? 15 : 8);
    const popupText = isGolden
      ? `+${pts} GOLDEN! 🦖`
      : (this.combo > 2 ? `+${pts} (${this.combo - 1}x)!` : `+${pts}`);
    this.particles.spawnScorePopup(b.x, b.y - 25, popupText);

    // Leo Reaction
    this.chompTimer = 0.45;
    this.popTimer = 0.35;

    // Save High Score
    this.game.storage.saveHighScore('dinosaurBalloon', this.score);
  }

  update(dt: number, input: InputManager): void {
    this.time += dt;
    this.spawnTimer += dt;
    this.animState = updateCharacterAnimState(this.animState, dt);

    if (this.chompTimer > 0) this.chompTimer = Math.max(0, this.chompTimer - dt);
    if (this.popTimer > 0) this.popTimer = Math.max(0, this.popTimer - dt);

    if (this.comboTimer > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) this.combo = 1;
    }

    // Balloon Spawning
    const maxBalloons = this.game.display.isPortrait ? 7 : 8;
    const activeCount = this.balloons.filter(b => !b.popped).length;
    if (activeCount < maxBalloons && this.spawnTimer >= 0.9) {
      this.spawnBalloon();
      this.spawnTimer = 0;
    }

    // Update Balloons Physics
    for (let i = 0; i < this.balloons.length; i++) {
      const b = this.balloons[i];
      if (b.popped) continue;
      b.y += b.vy * dt;
      b.wobblePhase += 2.2 * dt;
      b.x += Math.sin(b.wobblePhase) * 22 * dt;
    }

    // Filter out popped and off-screen balloons
    this.balloons = this.balloons.filter(b => !b.popped && b.y > -70);

    // Hit Testing & Input Processing
    const pointersToCheck: Array<{ x: number; y: number }> = [];
    for (const ptr of input.pointers.values()) {
      if (ptr.justPressed || ptr.isDown) {
        pointersToCheck.push({ x: ptr.x, y: ptr.y });
      }
    }
    if (input.actionJustPressed) {
      pointersToCheck.push({ x: input.primaryPointer.x, y: input.primaryPointer.y });
    }

    for (const pt of pointersToCheck) {
      for (let i = this.balloons.length - 1; i >= 0; i--) {
        const b = this.balloons[i];
        if (b.popped) continue;
        const dist = Math.hypot(pt.x - b.x, pt.y - b.y);
        if (dist <= b.radius + 26) {
          this.popBalloon(i, pt.x, pt.y);
          break;
        }
      }
    }

    // Keyboard Spacebar Pop Lowest Balloon
    if (input.isKeyJustPressed('Space') || input.isKeyJustPressed('Enter')) {
      let lowestIdx = -1;
      let lowestY = -9999;
      for (let i = 0; i < this.balloons.length; i++) {
        if (!this.balloons[i].popped && this.balloons[i].y > lowestY) {
          lowestY = this.balloons[i].y;
          lowestIdx = i;
        }
      }
      if (lowestIdx >= 0) {
        const b = this.balloons[lowestIdx];
        this.popBalloon(lowestIdx, b.x, b.y);
      }
    }

    this.particles.update(dt);
  }

  render(ctx: CanvasRenderingContext2D, alpha: number, display: DisplayManager): void {
    const vWidth = display.vWidth;
    const vHeight = display.vHeight;
    const isPortrait = display.isPortrait;

    drawLandscapeSkyHills(ctx, vWidth, vHeight, this.time);

    // Draw Balloons
    for (const b of this.balloons) {
      if (b.popped) continue;
      this.drawBalloon(ctx, b);
    }

    // Leo & Plush Dinosaur
    const leoX = isPortrait ? vWidth * 0.76 : 140;
    const leoY = isPortrait ? vHeight - 145 : vHeight - 110;
    const leoScale = isPortrait ? 1.25 : 1.15;
    const jawAngle = getJawRotationAngle(this.chompTimer);
    const popReaction = getBalloonPopReaction(this.popTimer);

    drawLeo(ctx, leoX, leoY, leoScale, {
      holdingDino: true,
      dinoChomp: jawAngle > 0 ? jawAngle / (Math.PI / 6) : 0,
      squash: popReaction.surpriseScale,
      eyeBlink: this.animState.isBlinking,
      facingLeft: isPortrait,
      animState: this.animState
    });

    this.particles.render(ctx);

    // Score & Combo HUD Badge
    this.renderHUD(ctx, display);
  }

  private drawBalloon(ctx: CanvasRenderingContext2D, b: BalloonEntity): void {
    ctx.save();
    ctx.translate(b.x, b.y);

    const isGolden = b.color === '#FFD700' || b.color === '#FFC107';
    const r = b.radius;

    // String
    ctx.strokeStyle = 'rgba(100, 100, 100, 0.65)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, r + 4);
    const wave = Math.sin(b.wobblePhase * 1.5) * 6;
    ctx.quadraticCurveTo(wave, r + 24, -wave * 0.5, r + 42);
    ctx.stroke();

    // Balloon Knot
    ctx.fillStyle = isGolden ? '#FFA000' : b.color;
    ctx.beginPath();
    ctx.moveTo(-4, r + 2);
    ctx.lineTo(4, r + 2);
    ctx.lineTo(0, r + 7);
    ctx.closePath();
    ctx.fill();

    // Golden Sparkle Aura
    if (isGolden) {
      ctx.strokeStyle = '#FFE082';
      ctx.lineWidth = 3.5;
      ctx.shadowColor = '#FFD54F';
      ctx.shadowBlur = 12;
    } else {
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.lineWidth = 2.5;
    }

    ctx.fillStyle = b.color;

    if (b.shape === 'DINO') {
      // Dinosaur Silhouette Balloon
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 0.95, r * 1.1, 0, 0, Math.PI * 2);
      // Snout protrusion
      ctx.arc(r * 0.65, -r * 0.35, r * 0.42, 0, Math.PI * 2);
      // Tail bump
      ctx.arc(-r * 0.7, r * 0.35, r * 0.32, 0, Math.PI * 2);
      // Back ridges
      ctx.arc(-r * 0.3, -r * 0.85, r * 0.22, 0, Math.PI * 2);
      ctx.arc(r * 0.1, -r * 0.9, r * 0.22, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Dino Eye on Balloon
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(r * 0.55, -r * 0.45, 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(r * 0.62, -r * 0.45, 2.8, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Classic Oval Balloon
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 0.88, r * 1.12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    // Specular Highlight Glint
    ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.beginPath();
    ctx.ellipse(-r * 0.35, -r * 0.45, r * 0.25, r * 0.45, -0.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  private renderHUD(ctx: CanvasRenderingContext2D, display: DisplayManager): void {
    const isPortrait = display.isPortrait;
    const scoreX = display.vWidth / 2;
    const scoreY = isPortrait ? 76 : Math.max(18, display.vHeight * 0.035);
    const badgeW = isPortrait ? 270 : 240;
    const badgeH = 46;

    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.roundRect(scoreX - badgeW / 2, scoreY, badgeW, badgeH, 23);
    ctx.fill();
    ctx.strokeStyle = '#81C784';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Dinosaur Balloon Icon
    ctx.fillStyle = '#4CAF50';
    ctx.beginPath();
    ctx.arc(scoreX - badgeW / 2 + 28, scoreY + badgeH / 2, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 20px "Comic Sans MS", cursive, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    const comboText = this.combo > 1 ? ` (${this.combo}x)` : '';
    ctx.fillText(`Score: ${this.score}${comboText}`, scoreX - badgeW / 2 + 48, scoreY + badgeH / 2 + 1);
    ctx.restore();
  }

  override getEntities(): Record<string, unknown> {
    return {
      balloons: this.balloons.filter(b => !b.popped),
      balloonsCount: this.balloons.filter(b => !b.popped).length,
      eggs: [],
      chicks: [],
      puddles: [],
      seeds: [],
      particles: this.particles.active
    };
  }

  override getModeState(): Record<string, unknown> {
    return {
      score: this.score,
      combo: this.combo,
      balloonsPopped: this.poppedCount,
      timer: this.time,
      multiplier: this.combo,
      feverMeter: 0,
      coopSavedCount: 0,
      isOverheating: false
    };
  }
}
