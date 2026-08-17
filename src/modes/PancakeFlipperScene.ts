/**
 * Mode 6: Golden Pancake Flipper
 * Adventures of Trishu 8-Game Suite
 * Strictly under 500 Lines of Code
 */

import { BaseScene } from './BaseScene';
import { GameEngine } from '../engine/GameEngine';
import { InputManager } from '../engine/InputManager';
import { DisplayManager } from '../engine/DisplayManager';
import { PancakeEntity } from '../types/game';
import { CharacterAnimState } from '../types/characters';
import { ParticleEngine } from '../engine/ParticleEngine';
import { soundEngine } from '../engine/SoundEngine';
import { Haptics } from '../engine/Haptics';
import { drawLandscapeSkyHills } from '../graphics/environmentRenderer';
import { drawMom } from '../graphics/characters/momRenderer';
import {
  createCharacterAnimState,
  updateCharacterAnimState,
  getFryingPanAngle
} from '../graphics/animations';

interface StackedPancakeItem {
  y: number;
  state: 'RAW' | 'PERFECT_GOLDEN' | 'OVERCOOKED';
  butter: boolean;
}

export class PancakeFlipperScene extends BaseScene {
  public time: number = 0;
  public isAirborne: boolean = false;
  public stackCount: number = 0;
  public multiplier: number = 1;
  public stackWobbleTimer: number = 0;
  public flipPhase: number = 0;
  public activePancake: PancakeEntity & { cookTimer: number; startX: number; startY: number };
  public stackedPancakes: StackedPancakeItem[] = [];
  public particles: ParticleEngine;
  public animState: CharacterAnimState;
  private sizzleIntervalTimer: number = 0;
  private newPancakeDelay: number = 0;

  constructor(game: GameEngine) {
    super(game);
    this.particles = new ParticleEngine(150);
    this.animState = createCharacterAnimState();
    this.activePancake = {
      x: 270, y: 350, startX: 270, startY: 350,
      vy: 0, rotation: 0, vRot: 0, flipCount: 0,
      isCooked: false, isStacked: false, cookTimer: 0
    };
  }

  enter(): void {
    this.score = 0;
    this.stackCount = 0;
    this.multiplier = 1;
    this.time = 0;
    this.isAirborne = false;
    this.flipPhase = 0;
    this.stackWobbleTimer = 0;
    this.sizzleIntervalTimer = 0;
    this.newPancakeDelay = 0;
    this.stackedPancakes = [];
    this.particles.clear();
    this.animState = createCharacterAnimState();
    this.resetPanPancake();
  }

  exit(): void {
    this.particles.clear();
  }

  private resetPanPancake(): void {
    const isPortrait = this.game.display.isPortrait;
    const vWidth = this.game.display.vWidth;
    const vHeight = this.game.display.vHeight;
    const panX = isPortrait ? vWidth * 0.38 : vWidth * 0.36;
    const panY = isPortrait ? vHeight * 0.62 : vHeight * 0.65;
    this.isAirborne = false;
    this.flipPhase = 0;
    this.activePancake = {
      x: panX, y: panY, startX: panX, startY: panY,
      vy: 0, rotation: 0, vRot: 0, flipCount: 0,
      isCooked: false, isStacked: false, cookTimer: 0
    };
  }

  flipPancake(): void {
    if (this.isAirborne || this.newPancakeDelay > 0) return;
    this.isAirborne = true;
    this.flipPhase = 0.05;
    this.activePancake.vy = -550;
    this.activePancake.vRot = Math.PI * 3.5;
    this.activePancake.flipCount++;
    soundEngine.playSFX('whoosh');
    Haptics.tap();
  }

  private catchPancakeOnPlate(): void {
    const isPortrait = this.game.display.isPortrait;
    const vWidth = this.game.display.vWidth;
    const vHeight = this.game.display.vHeight;
    const plateX = isPortrait ? vWidth * 0.75 : vWidth * 0.72;
    const plateBaseY = isPortrait ? vHeight * 0.65 : vHeight * 0.68;
    this.isAirborne = false;
    this.stackCount++;
    const topY = plateBaseY - this.stackCount * 12;

    const cookT = this.activePancake.cookTimer;
    const cookState: 'RAW' | 'PERFECT_GOLDEN' | 'OVERCOOKED' =
      cookT >= 1.2 && cookT <= 2.8 ? 'PERFECT_GOLDEN' : (cookT > 2.8 ? 'OVERCOOKED' : 'RAW');

    if (cookState === 'PERFECT_GOLDEN') {
      const pts = 100 * this.multiplier;
      this.score += pts;
      this.multiplier = Math.min(10, this.multiplier + 1);
      soundEngine.playSFX('fanfare');
      Haptics.heavy();
      this.particles.spawnPancakeSyrup(plateX, topY, 8);
      this.particles.spawnSparkles(plateX, topY, 12);
      this.particles.spawnScorePopup(plateX, topY - 30, `PERFECT FLIP! ✨ +${pts}`);
    } else if (cookState === 'RAW') {
      this.score += 25;
      soundEngine.playSFX('eggPop');
      Haptics.tap();
      this.particles.spawnPancakeSyrup(plateX, topY, 4);
      this.particles.spawnScorePopup(plateX, topY - 20, '+25 (Raw)');
    } else {
      this.score += 10;
      this.multiplier = 1;
      soundEngine.playSFX('splash');
      Haptics.medium();
      this.particles.spawnMudSplash(plateX, topY, 6);
      this.particles.spawnScorePopup(plateX, topY - 20, '+10 (Burnt)');
    }

    this.stackedPancakes.push({ y: topY, state: cookState, butter: cookState === 'PERFECT_GOLDEN' });
    this.stackWobbleTimer = 0;
    this.newPancakeDelay = 0.45;
    this.game.storage.saveHighScore('pancakeFlipper', this.score);
  }

  update(dt: number, input: InputManager): void {
    this.time += dt;
    this.stackWobbleTimer += dt;
    this.animState = updateCharacterAnimState(this.animState, dt);

    const isPortrait = this.game.display.isPortrait;
    const vWidth = this.game.display.vWidth;
    const vHeight = this.game.display.vHeight;
    const panX = isPortrait ? vWidth * 0.38 : vWidth * 0.36;
    const panY = isPortrait ? vHeight * 0.62 : vHeight * 0.65;
    const plateX = isPortrait ? vWidth * 0.75 : vWidth * 0.72;
    const plateBaseY = isPortrait ? vHeight * 0.65 : vHeight * 0.68;
    const targetTopY = plateBaseY - (this.stackCount + 1) * 12;

    if (this.flipPhase > 0) {
      this.flipPhase = Math.min(1.0, this.flipPhase + dt * 2.5);
      if (this.flipPhase >= 1.0) this.flipPhase = 0;
    }

    if (this.newPancakeDelay > 0) {
      this.newPancakeDelay -= dt;
      if (this.newPancakeDelay <= 0) this.resetPanPancake();
    } else if (!this.isAirborne) {
      this.activePancake.x = panX;
      this.activePancake.y = panY;
      this.activePancake.cookTimer += dt;
      this.sizzleIntervalTimer += dt;
      if (this.sizzleIntervalTimer >= 0.6) {
        soundEngine.playSFX('pancakeSizzle');
        this.particles.spawnSteam(panX, panY - 8);
        this.sizzleIntervalTimer = 0;
      }
    } else {
      const g = 900;
      this.activePancake.vy += g * dt;
      this.activePancake.y += this.activePancake.vy * dt;
      this.activePancake.rotation += this.activePancake.vRot * dt;

      const initialVy = -550;
      const totalAirTime = (2 * Math.abs(initialVy)) / g;
      const elapsedAirTime = (this.activePancake.vy - initialVy) / g;
      const progress = Math.min(1.0, Math.max(0, elapsedAirTime / totalAirTime));
      this.activePancake.x = panX + (plateX - panX) * progress;

      if (this.activePancake.vy > 0 && this.activePancake.y >= targetTopY) {
        this.catchPancakeOnPlate();
      }
    }

    let userTriggered = input.actionJustPressed || input.isKeyJustPressed('Space') || input.isKeyJustPressed('ArrowUp');
    if (!userTriggered) {
      for (const ptr of input.pointers.values()) {
        if (ptr.justPressed) { userTriggered = true; break; }
      }
    }
    if (userTriggered) this.flipPancake();

    this.particles.update(dt);
  }

  render(ctx: CanvasRenderingContext2D, alpha: number, display: DisplayManager): void {
    const vWidth = display.vWidth;
    const vHeight = display.vHeight;
    const isPortrait = display.isPortrait;
    drawLandscapeSkyHills(ctx, vWidth, vHeight, this.time);

    const mummyX = isPortrait ? vWidth * 0.2 : vWidth * 0.18;
    const mummyY = isPortrait ? vHeight * 0.62 : vHeight * 0.65;
    const panX = isPortrait ? vWidth * 0.38 : vWidth * 0.36;
    const panY = isPortrait ? vHeight * 0.62 : vHeight * 0.65;
    const plateX = isPortrait ? vWidth * 0.75 : vWidth * 0.72;
    const plateBaseY = isPortrait ? vHeight * 0.65 : vHeight * 0.68;

    // Kitchen Counter Base
    const counterY = isPortrait ? vHeight * 0.68 : vHeight * 0.72;
    ctx.save();
    ctx.fillStyle = '#8D6E63';
    ctx.fillRect(0, counterY, vWidth, vHeight - counterY);
    ctx.fillStyle = '#D7CCC8';
    ctx.fillRect(0, counterY - 14, vWidth, 14);
    ctx.restore();

    // Mom Character
    const panArt = getFryingPanAngle(this.flipPhase);
    drawMom(ctx, mummyX, mummyY, isPortrait ? 1.2 : 1.15, {
      holdingPan: true,
      panAngle: panArt.panAngle,
      eyeBlink: this.animState.isBlinking,
      animState: this.animState
    });

    // Frying Pan & Stove
    ctx.save();
    ctx.translate(panX, panY);
    ctx.fillStyle = '#424242';
    ctx.beginPath();
    ctx.ellipse(0, 10, 36, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.rotate(panArt.panAngle);
    ctx.fillStyle = '#212121';
    ctx.beginPath();
    ctx.ellipse(0, 0, 34, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    if (!this.isAirborne && this.newPancakeDelay <= 0) {
      this.drawPancake(ctx, panX, panY - 4, this.activePancake.cookTimer, 0, 1.0);
    }

    this.drawPlateAndStack(ctx, plateX, plateBaseY);

    if (this.isAirborne) {
      this.drawPancake(ctx, this.activePancake.x, this.activePancake.y, this.activePancake.cookTimer, this.activePancake.rotation, 1.08);
    }

    this.particles.render(ctx);
    this.renderHUD(ctx, display);
  }

  private drawPancake(ctx: CanvasRenderingContext2D, x: number, y: number, cookTimer: number, rotation: number, scale: number): void {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.scale(scale, scale);

    const isGolden = cookTimer >= 1.2 && cookTimer <= 2.8;
    const isBurnt = cookTimer > 2.8;
    ctx.fillStyle = isGolden ? '#FFB74D' : (isBurnt ? '#4E342E' : '#FFF9C4');
    ctx.strokeStyle = isGolden ? '#FFA000' : (isBurnt ? '#212121' : '#FFE082');
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(0, 0, 26, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    if (isGolden) {
      ctx.fillStyle = '#FFF59D';
      ctx.beginPath();
      ctx.roundRect(-5, -4, 10, 7, 2);
      ctx.fill();
    }
    ctx.restore();
  }

  private drawPlateAndStack(ctx: CanvasRenderingContext2D, plateX: number, plateBaseY: number): void {
    ctx.save();
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#B0BEC5';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.ellipse(plateX, plateBaseY, 65, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    const N = Math.max(1, this.stackedPancakes.length);
    const A0 = Math.min(18, 4 + N * 1.2);
    const wobbleBase = A0 * Math.exp(-2.4 * this.stackWobbleTimer) * Math.cos(8.5 * this.stackWobbleTimer);

    for (let i = 0; i < this.stackedPancakes.length; i++) {
      const p = this.stackedPancakes[i];
      const wobbleX = wobbleBase * ((i + 1) / N);
      this.drawPancake(ctx, plateX + wobbleX, p.y, p.state === 'PERFECT_GOLDEN' ? 2.0 : (p.state === 'RAW' ? 0.5 : 3.5), 0, 1.0);
    }
    ctx.restore();
  }

  private renderHUD(ctx: CanvasRenderingContext2D, display: DisplayManager): void {
    const isPortrait = display.isPortrait;
    const scoreX = display.vWidth / 2;
    const scoreY = isPortrait ? 76 : Math.max(18, display.vHeight * 0.035);
    const badgeW = isPortrait ? 310 : 280;
    const badgeH = 46;

    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.roundRect(scoreX - badgeW / 2, scoreY, badgeW, badgeH, 23);
    ctx.fill();
    ctx.strokeStyle = '#FFA726';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 20px "Comic Sans MS", cursive, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const multText = this.multiplier > 1 ? ` (${this.multiplier}x)` : '';
    ctx.fillText(`🥞 Stack: ${this.stackCount}  |  Score: ${this.score}${multText}`, scoreX, scoreY + badgeH / 2);
    ctx.restore();
  }

  override getEntities(): Record<string, unknown> {
    return {
      activePancake: this.activePancake,
      stackedPancakes: this.stackedPancakes,
      stackCount: this.stackCount,
      eggs: [], chicks: [], puddles: [], seeds: [],
      particles: this.particles.active
    };
  }

  override getModeState(): Record<string, unknown> {
    return {
      score: this.score,
      stackCount: this.stackCount,
      cookTimer: this.activePancake.cookTimer,
      multiplier: this.multiplier,
      timer: this.time,
      isAirborne: this.isAirborne,
      feverMeter: 0,
      coopSavedCount: 0,
      isOverheating: false
    };
  }
}
