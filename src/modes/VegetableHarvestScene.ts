/**
 * Mode 7: Grandpa Pig's Vegetable Harvest
 * Peppa Pig: Happy Mrs Chicken 8-Game Deluxe Expansion Suite
 * Strictly under 500 Lines of Code
 */

import { BaseScene } from './BaseScene';
import { GameEngine } from '../engine/GameEngine';
import { InputManager } from '../engine/InputManager';
import { DisplayManager } from '../engine/DisplayManager';
import { VegetableEntity } from '../types/game';
import { CharacterAnimState } from '../types/characters';
import { ParticleEngine } from '../engine/ParticleEngine';
import { soundEngine } from '../engine/SoundEngine';
import { Haptics } from '../engine/Haptics';
import { drawLandscapeSkyHills } from '../graphics/environmentRenderer';
import { drawGrandpaPig } from '../graphics/characters/grandpaPigRenderer';
import {
  createCharacterAnimState,
  updateCharacterAnimState,
  getVeggiePullTension
} from '../graphics/animations';

interface GardenMoundItem {
  id: string;
  x: number;
  y: number;
  vegetable: ActiveVeggie | null;
  respawnTimer: number;
}

interface ActiveVeggie extends VegetableEntity {
  springK: number;
  breakoutThreshold: number;
  points: number;
  startY: number;
  pullOffsetY: number;
  isFlying: boolean;
  flightTimer: number;
  flightDuration: number;
  flightStartX: number;
  flightStartY: number;
  flightVy: number;
  rotation: number;
  vRot: number;
}

const SPRING_K = { CARROT: 1.2, CABBAGE: 2.4, PUMPKIN: 4.0 };
const BREAKOUT_THRESHOLDS = { CARROT: 50, CABBAGE: 60, PUMPKIN: 75 };
const VEGGIE_POINTS = { CARROT: 20, CABBAGE: 50, PUMPKIN: 100 };

export class VegetableHarvestScene extends BaseScene {
  public time: number = 0;
  public harvestedCount: number = 0;
  public pumpkinTugs: number = 0;
  public currentPullTension: number = 0;
  public currentPullProgress: number = 0;
  public mounds: GardenMoundItem[] = [];
  public particles: ParticleEngine;
  public animState: CharacterAnimState;
  private activePullMoundIdx: number = -1;
  private pullStartY: number = 0;
  private wheelbarrowBounce: number = 0;

  constructor(game: GameEngine) {
    super(game);
    this.particles = new ParticleEngine(150);
    this.animState = createCharacterAnimState();
  }

  enter(): void {
    this.score = 0;
    this.harvestedCount = 0;
    this.pumpkinTugs = 0;
    this.currentPullTension = 0;
    this.currentPullProgress = 0;
    this.time = 0;
    this.activePullMoundIdx = -1;
    this.wheelbarrowBounce = 0;
    this.particles.clear();
    this.animState = createCharacterAnimState();
    this.initMounds();
  }

  exit(): void {
    this.particles.clear();
  }

  private initMounds(): void {
    const isPortrait = this.game.display.isPortrait;
    const vWidth = this.game.display.vWidth;
    const vHeight = this.game.display.vHeight;
    this.mounds = [];

    if (isPortrait) {
      const positions = [
        { x: vWidth * 0.32, y: vHeight * 0.58 }, { x: vWidth * 0.72, y: vHeight * 0.58 },
        { x: vWidth * 0.32, y: vHeight * 0.76 }, { x: vWidth * 0.72, y: vHeight * 0.76 }
      ];
      positions.forEach((pos, idx) => {
        this.mounds.push({ id: `mound_${idx}`, x: pos.x, y: pos.y, vegetable: this.spawnVegetable(pos.x, pos.y, idx), respawnTimer: 0 });
      });
    } else {
      const spacing = (vWidth - 320) / 4;
      for (let i = 0; i < 4; i++) {
        const mx = 240 + i * spacing;
        const my = vHeight * 0.72;
        this.mounds.push({ id: `mound_${i}`, x: mx, y: my, vegetable: this.spawnVegetable(mx, my, i), respawnTimer: 0 });
      }
    }
  }

  private spawnVegetable(x: number, y: number, index: number): ActiveVeggie {
    const rand = Math.random();
    const type: 'CARROT' | 'CABBAGE' | 'PUMPKIN' = rand < 0.45 ? 'CARROT' : (rand < 0.8 ? 'CABBAGE' : 'PUMPKIN');
    return {
      id: `veg_${index}_${Date.now()}`, type, x, y, startY: y, pullProgress: 0, pullOffsetY: 0,
      springK: SPRING_K[type], breakoutThreshold: BREAKOUT_THRESHOLDS[type], points: VEGGIE_POINTS[type],
      isHarvested: false, isFlying: false, flightTimer: 0, flightDuration: 0.65,
      flightStartX: x, flightStartY: y, flightVy: 0, rotation: 0, vRot: (Math.random() - 0.5) * 8
    };
  }

  update(dt: number, input: InputManager): void {
    this.time += dt;
    this.animState = updateCharacterAnimState(this.animState, dt);
    if (this.wheelbarrowBounce > 0) this.wheelbarrowBounce = Math.max(0, this.wheelbarrowBounce - dt * 4);

    const isPortrait = this.game.display.isPortrait;
    const vWidth = this.game.display.vWidth;
    const vHeight = this.game.display.vHeight;
    const wbX = isPortrait ? vWidth * 0.22 : 120;
    const wbY = isPortrait ? vHeight * 0.38 : vHeight * 0.72;

    let isAnyPointerDown = false;
    let pointerY = 0;

    for (const ptr of input.pointers.values()) {
      if (ptr.isDown) {
        isAnyPointerDown = true;
        pointerY = ptr.y;
        if (ptr.justPressed && this.activePullMoundIdx === -1) {
          for (let i = 0; i < this.mounds.length; i++) {
            const m = this.mounds[i];
            if (m.vegetable && !m.vegetable.isHarvested && !m.vegetable.isFlying) {
              if (Math.hypot(ptr.x - m.x, ptr.y - m.y) <= 55) {
                this.activePullMoundIdx = i;
                this.pullStartY = ptr.y;
                break;
              }
            }
          }
        }
      }
    }

    if (input.isKeyJustPressed('Space') || input.isKeyJustPressed('Enter')) {
      for (let i = 0; i < this.mounds.length; i++) {
        const m = this.mounds[i];
        if (m.vegetable && !m.vegetable.isHarvested && !m.vegetable.isFlying) {
          this.triggerVegetableHarvest(m.vegetable, wbX, wbY);
          break;
        }
      }
    }

    if (this.activePullMoundIdx >= 0 && isAnyPointerDown) {
      const mound = this.mounds[this.activePullMoundIdx];
      const veg = mound ? mound.vegetable : null;
      if (veg && !veg.isHarvested && !veg.isFlying) {
        const rawPull = Math.max(0, this.pullStartY - pointerY);
        veg.pullOffsetY = Math.min(veg.breakoutThreshold * 1.2, rawPull / veg.springK);
        veg.pullProgress = Math.min(1.0, veg.pullOffsetY / veg.breakoutThreshold);
        this.currentPullTension = veg.pullProgress;
        this.currentPullProgress = veg.pullProgress;

        if (veg.pullOffsetY >= veg.breakoutThreshold) {
          if (veg.type === 'PUMPKIN' && this.pumpkinTugs < 2) {
            this.pumpkinTugs++;
            soundEngine.playSFX('seedDrop');
            this.particles.spawnSteam(veg.x, veg.y - 30);
            Haptics.medium();
            veg.pullOffsetY = veg.breakoutThreshold * 0.4;
            veg.pullProgress = 0.4;
            this.pullStartY = pointerY + (veg.breakoutThreshold * 0.4 * veg.springK);
          } else {
            this.triggerVegetableHarvest(veg, wbX, wbY);
            this.activePullMoundIdx = -1;
          }
        }
      }
    } else {
      this.currentPullTension = 0;
      this.currentPullProgress = 0;
      this.activePullMoundIdx = -1;
      for (const m of this.mounds) {
        const v = m.vegetable;
        if (v && !v.isHarvested && !v.isFlying && v.pullOffsetY > 0) {
          v.pullOffsetY = Math.max(0, v.pullOffsetY - dt * 280);
          v.pullProgress = v.pullOffsetY / v.breakoutThreshold;
        }
      }
    }

    for (const m of this.mounds) {
      const veg = m.vegetable;
      if (veg && veg.isFlying) {
        veg.flightTimer += dt;
        const t = veg.flightTimer / veg.flightDuration;
        if (t >= 1.0) {
          veg.isFlying = false;
          veg.isHarvested = true;
          this.harvestedCount++;
          this.score += veg.points;
          this.wheelbarrowBounce = 1.0;
          this.pumpkinTugs = 0;

          soundEngine.playSFX('mudThud');
          soundEngine.playSFX('toddlerGiggle');
          Haptics.heavy();
          this.particles.spawnMudSplash(wbX, wbY, 12);
          this.particles.spawnScorePopup(wbX, wbY - 30, `+${veg.points} Harvested!`);
          this.game.storage.saveHighScore('vegetableHarvest', this.score);

          m.vegetable = null;
          m.respawnTimer = 1.5;
        } else {
          const g = 980;
          veg.x = veg.flightStartX + (wbX - veg.flightStartX) * t;
          veg.y = veg.flightStartY + veg.flightVy * veg.flightTimer + 0.5 * g * veg.flightTimer * veg.flightTimer;
          veg.rotation += veg.vRot * dt;
        }
      }

      if (!m.vegetable) {
        m.respawnTimer -= dt;
        if (m.respawnTimer <= 0) {
          m.vegetable = this.spawnVegetable(m.x, m.y, this.mounds.indexOf(m));
        }
      }
    }

    this.particles.update(dt);
  }

  private triggerVegetableHarvest(veg: ActiveVeggie, wbX: number, wbY: number): void {
    veg.isFlying = true;
    veg.flightTimer = 0;
    veg.flightStartX = veg.x;
    veg.flightStartY = veg.startY - veg.pullOffsetY;
    const g = 980;
    const T = veg.flightDuration;
    veg.flightVy = (wbY - veg.flightStartY - 0.5 * g * T * T) / T;

    soundEngine.playSFX('veggiePop');
    soundEngine.playSFX('mudThud');
    Haptics.heavy();
    this.particles.spawnMudSplash(veg.x, veg.startY, 18);
  }

  render(ctx: CanvasRenderingContext2D, alpha: number, display: DisplayManager): void {
    const vWidth = display.vWidth;
    const vHeight = display.vHeight;
    const isPortrait = display.isPortrait;
    drawLandscapeSkyHills(ctx, vWidth, vHeight, this.time);

    // Soil bed
    const bedY = isPortrait ? vHeight * 0.52 : vHeight * 0.65;
    ctx.save();
    ctx.fillStyle = '#5D4037';
    ctx.fillRect(0, bedY, vWidth, vHeight - bedY);
    ctx.fillStyle = '#4E342E';
    ctx.fillRect(0, bedY - 12, vWidth, 12);
    ctx.restore();

    // Mounds and Vegetables
    for (const m of this.mounds) {
      ctx.save();
      ctx.fillStyle = '#6D4C41';
      ctx.strokeStyle = '#3E2723';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(m.x, m.y + 12, 45, 18, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      const veg = m.vegetable;
      if (veg && !veg.isFlying && !veg.isHarvested) {
        this.drawVegetableSprite(ctx, m.x, m.y - veg.pullOffsetY, veg.type, 0, 1.0);
      }
      ctx.restore();
    }

    // Wheelbarrow & Grandpa Pig
    const wbX = isPortrait ? vWidth * 0.22 : 120;
    const wbY = isPortrait ? vHeight * 0.38 : vHeight * 0.72;
    const grandpaX = isPortrait ? vWidth * 0.52 : 95;
    const grandpaY = isPortrait ? vHeight * 0.38 : vHeight * 0.62;

    this.drawWheelbarrow(ctx, wbX, wbY, this.harvestedCount);

    const pullArt = getVeggiePullTension(this.currentPullTension, this.time);
    drawGrandpaPig(ctx, grandpaX, grandpaY + pullArt.pullY, isPortrait ? 1.15 : 1.1, {
      pulling: this.activePullMoundIdx >= 0,
      pullTension: this.currentPullTension,
      welliesMuddy: true,
      eyeBlink: this.animState.isBlinking,
      animState: this.animState
    });

    for (const m of this.mounds) {
      const veg = m.vegetable;
      if (veg && veg.isFlying) {
        this.drawVegetableSprite(ctx, veg.x, veg.y, veg.type, veg.rotation, 1.15);
      }
    }

    this.particles.render(ctx);
    this.renderHUD(ctx, display);
  }

  private drawVegetableSprite(ctx: CanvasRenderingContext2D, x: number, y: number, type: 'CARROT' | 'CABBAGE' | 'PUMPKIN', rotation: number, scale: number): void {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.scale(scale, scale);

    if (type === 'CARROT') {
      ctx.fillStyle = '#4CAF50';
      ctx.beginPath();
      ctx.ellipse(-6, -24, 4, 12, -0.3, 0, Math.PI * 2);
      ctx.ellipse(0, -28, 4, 14, 0, 0, Math.PI * 2);
      ctx.ellipse(6, -24, 4, 12, 0.3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FF9800';
      ctx.strokeStyle = '#E65100';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-10, -12);
      ctx.lineTo(10, -12);
      ctx.lineTo(0, 20);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (type === 'CABBAGE') {
      ctx.fillStyle = '#81C784';
      ctx.strokeStyle = '#2E7D32';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, -5, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#4CAF50';
      ctx.beginPath();
      ctx.arc(0, -5, 12, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = '#2E7D32';
      ctx.fillRect(-4, -28, 8, 10);
      ctx.fillStyle = '#FF6D00';
      ctx.strokeStyle = '#BF360C';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(-14, -8, 14, 20, -0.15, 0, Math.PI * 2);
      ctx.ellipse(14, -8, 14, 20, 0.15, 0, Math.PI * 2);
      ctx.ellipse(0, -8, 16, 22, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }

  private drawWheelbarrow(ctx: CanvasRenderingContext2D, x: number, y: number, count: number): void {
    ctx.save();
    ctx.translate(x, y - this.wheelbarrowBounce * 6);
    ctx.fillStyle = '#424242';
    ctx.beginPath();
    ctx.arc(28, 22, 14, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#E53935';
    ctx.strokeStyle = '#B71C1C';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(-35, -5);
    ctx.lineTo(25, -5);
    ctx.lineTo(15, 20);
    ctx.lineTo(-25, 20);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = '#757575';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(-35, 5);
    ctx.lineTo(-50, 0);
    ctx.moveTo(-20, 20);
    ctx.lineTo(-25, 32);
    ctx.stroke();

    if (count > 0) {
      ctx.fillStyle = '#FF9800';
      ctx.beginPath();
      ctx.arc(-10, -8, 8, 0, Math.PI * 2);
      ctx.arc(6, -10, 9, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  private renderHUD(ctx: CanvasRenderingContext2D, display: DisplayManager): void {
    const isPortrait = display.isPortrait;
    const scoreX = display.vWidth / 2;
    const scoreY = isPortrait ? 76 : Math.max(18, display.vHeight * 0.035);
    const badgeW = isPortrait ? 300 : 270;
    const badgeH = 46;

    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.roundRect(scoreX - badgeW / 2, scoreY, badgeW, badgeH, 23);
    ctx.fill();
    ctx.strokeStyle = '#8D6E63';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 20px "Comic Sans MS", cursive, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`🥕 Harvest: ${this.harvestedCount}  |  Score: ${this.score}`, scoreX, scoreY + badgeH / 2);
    ctx.restore();
  }

  get vegetables(): VegetableEntity[] {
    return this.mounds
      .map(m => m.vegetable)
      .filter((v): v is ActiveVeggie => v !== null)
      .map(v => ({ id: v.id, type: v.type, x: v.x, y: v.y, pullProgress: v.pullProgress, isHarvested: v.isHarvested }));
  }

  override getEntities(): Record<string, unknown> {
    return {
      vegetables: this.vegetables,
      vegetablesCount: this.vegetables.length,
      wheelbarrowCount: this.harvestedCount,
      harvestedCount: this.harvestedCount,
      eggs: [], chicks: [], puddles: [], seeds: [],
      particles: this.particles.active
    };
  }

  override getModeState(): Record<string, unknown> {
    return {
      score: this.score,
      harvestedCount: this.harvestedCount,
      currentPullTension: this.currentPullTension,
      pumpkinTugs: this.pumpkinTugs,
      pullProgress: this.currentPullProgress,
      timer: this.time,
      multiplier: 1,
      feverMeter: 0,
      coopSavedCount: 0,
      isOverheating: false
    };
  }
}
