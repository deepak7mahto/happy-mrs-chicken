/**
 * Mode 10: Peek-a-Boo Barnyard (Sensory Toddler Delight)
 * Adventures of Trishu Mini-Game Suite
 * Strictly under 500 Lines of Code
 */

import { BaseScene } from '../base/BaseScene';
import { GameEngine } from '../../engine/GameEngine';
import { InputManager } from '../../engine/InputManager';
import { DisplayManager } from '../../engine/DisplayManager';
import { ParticleEngine } from '../../engine/ParticleEngine';
import { soundEngine } from '../../engine/SoundEngine';
import { Haptics } from '../../engine/Haptics';
import { drawLandscapeSkyHills } from '../../graphics/environmentRenderer';
import { drawMrsClucky } from '../../graphics/characters/chickenRenderer';
import { drawMimi } from '../../graphics/characters/mimiRenderer';
import { drawLeo } from '../../graphics/characters/leoRenderer';
import { drawTrishu } from '../../graphics/characters/trishuRenderer';

interface HidingSpot {
  id: string;
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  type: 'BARN' | 'BUSH' | 'HAY' | 'BARREL';
  isOpen: boolean;
  openProgress: number; // 0 to 1
  peekTimer: number;    // time left revealed
  hintWobble: number;
  foundCount: number;
}

export class PeekABooScene extends BaseScene {
  public time: number = 0;
  public peekFoundCount: number = 0;
  public spots: HidingSpot[] = [];
  public particles: ParticleEngine;
  public celebrationTimer: number = 0;

  constructor(game: GameEngine) {
    super(game);
    this.particles = new ParticleEngine(150);
  }

  enter(): void {
    this.score = 0;
    this.peekFoundCount = 0;
    this.time = 0;
    this.celebrationTimer = 0;
    this.particles.clear();
    this.initSpots();
  }

  exit(): void {
    this.particles.clear();
    if (this.score > 0) {
      this.game.storage.saveHighScore('peekABoo', this.score);
    }
  }

  private initSpots(): void {
    const isPortrait = this.game.display.isPortrait;
    const vW = this.game.display.vWidth;
    const vH = this.game.display.vHeight;

    this.spots = [];
    if (isPortrait) {
      // 2x2 Grid in lower two-thirds of the screen
      const col1 = vW * 0.28;
      const col2 = vW * 0.72;
      const row1 = vH * 0.42;
      const row2 = vH * 0.70;
      const spotW = vW * 0.40;
      const spotH = vH * 0.22;

      this.spots.push(
        { id: 'spot_barn', name: 'Mrs Clucky', x: col1, y: row1, w: spotW, h: spotH, type: 'BARN', isOpen: false, openProgress: 0, peekTimer: 0, hintWobble: 0, foundCount: 0 },
        { id: 'spot_bush', name: 'Mimi Bunny', x: col2, y: row1, w: spotW, h: spotH, type: 'BUSH', isOpen: false, openProgress: 0, peekTimer: 0, hintWobble: 0, foundCount: 0 },
        { id: 'spot_hay', name: 'Leo & Dino', x: col1, y: row2, w: spotW, h: spotH, type: 'HAY', isOpen: false, openProgress: 0, peekTimer: 0, hintWobble: 0, foundCount: 0 },
        { id: 'spot_barrel', name: 'Trishu', x: col2, y: row2, w: spotW, h: spotH, type: 'BARREL', isOpen: false, openProgress: 0, peekTimer: 0, hintWobble: 0, foundCount: 0 }
      );
    } else {
      // Landscape: 4 across along the ground
      const spacing = vW / 5;
      const baseY = vH * 0.65;
      const spotW = Math.min(180, spacing * 0.9);
      const spotH = 140;

      this.spots.push(
        { id: 'spot_barn', name: 'Mrs Clucky', x: spacing * 1, y: baseY, w: spotW, h: spotH, type: 'BARN', isOpen: false, openProgress: 0, peekTimer: 0, hintWobble: 0, foundCount: 0 },
        { id: 'spot_bush', name: 'Mimi Bunny', x: spacing * 2, y: baseY, w: spotW, h: spotH, type: 'BUSH', isOpen: false, openProgress: 0, peekTimer: 0, hintWobble: 0, foundCount: 0 },
        { id: 'spot_hay', name: 'Leo & Dino', x: spacing * 3, y: baseY, w: spotW, h: spotH, type: 'HAY', isOpen: false, openProgress: 0, peekTimer: 0, hintWobble: 0, foundCount: 0 },
        { id: 'spot_barrel', name: 'Trishu', x: spacing * 4, y: baseY, w: spotW, h: spotH, type: 'BARREL', isOpen: false, openProgress: 0, peekTimer: 0, hintWobble: 0, foundCount: 0 }
      );
    }
  }

  public tapSpot(spot: HidingSpot): void {
    if (spot.isOpen && spot.peekTimer > 0.8) return; // Already revealed

    spot.isOpen = true;
    spot.openProgress = 1.0;
    spot.peekTimer = 2.4;
    spot.foundCount++;
    this.peekFoundCount++;
    this.score += 50;

    // Trigger surprise SFX & Delight based on character
    if (spot.type === 'BARN') {
      soundEngine.playSFX('cluck', { type: 'high' });
      soundEngine.playSFX('toddlerGiggle');
      this.particles.spawnFeathers(spot.x, spot.y - 20, 8);
      this.particles.spawnSparkles(spot.x, spot.y - 40, 10);
    } else if (spot.type === 'BUSH') {
      soundEngine.playSFX('bunnySqueak');
      soundEngine.playSFX('bubblePop', { pitch: 1.4 });
      this.particles.spawnSoapBubbles(spot.x, spot.y - 30, 8);
      this.particles.spawnSparkles(spot.x, spot.y - 30, 8);
    } else if (spot.type === 'HAY') {
      soundEngine.playSFX('dinosaurRoar');
      soundEngine.playSFX('toddlerGiggle');
      this.particles.spawnSparkles(spot.x, spot.y - 30, 12);
    } else if (spot.type === 'BARREL') {
      soundEngine.playSFX('fanfare');
      soundEngine.playSFX('toddlerGiggle');
      this.particles.spawnConfetti(spot.x, spot.y - 40, 20);
      this.particles.spawnSparkles(spot.x, spot.y - 30, 12);
    }

    Haptics.heavy();
    this.particles.spawnScorePopup(spot.x, spot.y - spot.h * 0.5 - 20, `Peek-a-boo! 🌟 +50`);
    this.game.storage.saveHighScore('peekABoo', this.score);

    // Milestone celebration every 4 found
    if (this.peekFoundCount % 4 === 0) {
      soundEngine.playSFX('fanfare');
      const vW = this.game.display.vWidth;
      const vH = this.game.display.vHeight;
      this.particles.spawnConfetti(vW / 2, vH * 0.4, 35);
    }
  }

  update(dt: number, input: InputManager): void {
    this.time += dt;

    // Update spots
    for (const spot of this.spots) {
      spot.hintWobble = Math.sin(this.time * 4 + spot.x * 0.05);

      if (spot.isOpen) {
        spot.peekTimer -= dt;
        if (spot.peekTimer <= 0) {
          spot.isOpen = false;
          spot.openProgress = Math.max(0, spot.openProgress - dt * 3);
        } else {
          spot.openProgress = Math.min(1.0, spot.openProgress + dt * 5);
        }
      } else if (spot.openProgress > 0) {
        spot.openProgress = Math.max(0, spot.openProgress - dt * 3);
      }
    }

    // Toddler Tap Processing - Huge forgiving touch targets!
    const pointersToCheck: Array<{ x: number; y: number }> = [];
    if (input.actionJustPressed) {
      pointersToCheck.push({ x: input.primaryPointer.x, y: input.primaryPointer.y });
    }
    for (const ptr of input.pointers.values()) {
      if (ptr.justPressed) pointersToCheck.push({ x: ptr.x, y: ptr.y });
    }

    for (const pt of pointersToCheck) {
      for (const spot of this.spots) {
        const halfW = spot.w / 2 + 20;
        const halfH = spot.h / 2 + 20;
        if (
          pt.x >= spot.x - halfW &&
          pt.x <= spot.x + halfW &&
          pt.y >= spot.y - halfH &&
          pt.y <= spot.y + halfH
        ) {
          this.tapSpot(spot);
          break;
        }
      }
    }

    // Keyboard trigger: Spacebar
    if (input.isKeyJustPressed('Space')) {
      const closedSpots = this.spots.filter(s => !s.isOpen);
      if (closedSpots.length > 0) {
        this.tapSpot(closedSpots[Math.floor(Math.random() * closedSpots.length)]);
      }
    }

    this.particles.update(dt);
  }

  render(ctx: CanvasRenderingContext2D, _alpha: number, display: DisplayManager): void {
    const vW = display.vWidth;
    const vH = display.vHeight;
    const isPortrait = display.isPortrait;

    drawLandscapeSkyHills(ctx, vW, vH, this.time);

    // Render Hiding Spots
    for (const spot of this.spots) {
      ctx.save();
      ctx.translate(spot.x, spot.y);

      // 1. Draw Peek Hint (if closed) or Character (if open)
      if (spot.isOpen || spot.openProgress > 0) {
        ctx.save();
        const popScale = Math.min(1.0, spot.openProgress * 1.15);
        ctx.scale(popScale, popScale);
        const charY = -spot.h * 0.42 * spot.openProgress;

        if (spot.type === 'BARN') {
          drawMrsClucky(ctx, 0, charY, 0.95, {
            squash: 1.0 + Math.sin(this.time * 6) * 0.08,
            flap: Math.sin(this.time * 10) * 0.3,
            headBob: Math.sin(this.time * 5) * 3,
            eyeBlink: Math.sin(this.time * 2) > 0.85
          });
        } else if (spot.type === 'BUSH') {
          drawMimi(ctx, 0, charY, 0.95, {
            hopY: Math.sin(this.time * 8) * 3,
            earFlap: Math.sin(this.time * 6) * 0.25,
            holdingWand: true,
            blowingBubble: true,
            eyeBlink: Math.sin(this.time * 2) > 0.85
          });
        } else if (spot.type === 'HAY') {
          drawLeo(ctx, 0, charY, 0.95, {
            holdingDino: true,
            dinoChomp: Math.abs(Math.sin(this.time * 8)),
            jumpY: Math.sin(this.time * 6) * 3,
            expression: 'excited',
            eyeBlink: Math.sin(this.time * 2) > 0.85
          });
        } else if (spot.type === 'BARREL') {
          drawTrishu(ctx, 0, charY, 0.95, {
            jumpY: Math.sin(this.time * 8) * 4,
            squish: 1.0,
            squash: 1.0,
            armWave: Math.sin(this.time * 7) * 0.4,
            eyeBlink: Math.sin(this.time * 2) > 0.85,
            expression: 'excited'
          });
        }
        ctx.restore();
      } else {
        // Peek Hint (ears, tail, feathers wiggling out)
        this.renderPeekHint(ctx, spot);
      }

      // 2. Draw the Front Covering Object
      if (spot.type === 'BARN') {
        this.drawBarnDoor(ctx, spot);
      } else if (spot.type === 'BUSH') {
        this.drawGardenBush(ctx, spot);
      } else if (spot.type === 'HAY') {
        this.drawHayBale(ctx, spot);
      } else if (spot.type === 'BARREL') {
        this.drawAppleBarrel(ctx, spot);
      }

      ctx.restore();
    }

    this.particles.render(ctx);

    // Score Badge
    const scoreX = vW / 2;
    const scoreY = isPortrait ? 76 : Math.max(18, vH * 0.035);
    const badgeW = isPortrait ? 320 : 300;
    const badgeH = 46;

    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.roundRect(scoreX - badgeW / 2, scoreY, badgeW, badgeH, 23);
    ctx.fill();
    ctx.strokeStyle = '#81C784';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 20px "Comic Sans MS", cursive, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`🙈 Friends Found: ${this.peekFoundCount}  |  ★ ${this.score}`, scoreX, scoreY + badgeH / 2);
    ctx.restore();

    // Toddler Tap Cue at Bottom
    ctx.save();
    const promptBob = Math.sin(this.time * 4) * 3;
    ctx.fillStyle = '#FFE600';
    ctx.font = `900 ${isPortrait ? '21px' : '23px'} "Comic Sans MS", cursive, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 4;
    const promptY = isPortrait ? Math.min(vH - 35, vH * 0.94) + promptBob : vH - 35 + promptBob;
    ctx.strokeText('👉 TAP TO FIND FRIENDS! 👈', vW / 2, promptY);
    ctx.fillText('👉 TAP TO FIND FRIENDS! 👈', vW / 2, promptY);
    ctx.restore();
  }

  private renderPeekHint(ctx: CanvasRenderingContext2D, spot: HidingSpot): void {
    const wobble = spot.hintWobble * 4;
    ctx.save();
    ctx.translate(wobble, 0);

    if (spot.type === 'BARN') {
      // Red chicken comb peeking
      ctx.fillStyle = '#E53935';
      ctx.beginPath();
      ctx.arc(0, -spot.h * 0.38, 12, 0, Math.PI * 2);
      ctx.arc(-8, -spot.h * 0.34, 9, 0, Math.PI * 2);
      ctx.arc(8, -spot.h * 0.34, 9, 0, Math.PI * 2);
      ctx.fill();
    } else if (spot.type === 'BUSH') {
      // Bunny ears peeking
      ctx.fillStyle = '#FAFAFA';
      ctx.strokeStyle = '#E0E0E0';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(-10, -spot.h * 0.42, 6, 18, -0.15, 0, Math.PI * 2);
      ctx.ellipse(10, -spot.h * 0.42, 6, 18, 0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#F8BBD0';
      ctx.beginPath();
      ctx.ellipse(-10, -spot.h * 0.42, 3.5, 12, -0.15, 0, Math.PI * 2);
      ctx.ellipse(10, -spot.h * 0.42, 3.5, 12, 0.15, 0, Math.PI * 2);
      ctx.fill();
    } else if (spot.type === 'HAY') {
      // Green dino tail peeking
      ctx.fillStyle = '#4CAF50';
      ctx.strokeStyle = '#2E7D32';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(25, -spot.h * 0.2);
      ctx.quadraticCurveTo(45 + wobble, -spot.h * 0.38, 38, -spot.h * 0.45);
      ctx.quadraticCurveTo(30, -spot.h * 0.35, 18, -spot.h * 0.15);
      ctx.fill();
      ctx.stroke();
    } else if (spot.type === 'BARREL') {
      // Red bows peeking
      ctx.fillStyle = '#E53935';
      ctx.beginPath();
      ctx.arc(-14, -spot.h * 0.34, 7, 0, Math.PI * 2);
      ctx.arc(14, -spot.h * 0.34, 7, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  private drawBarnDoor(ctx: CanvasRenderingContext2D, spot: HidingSpot): void {
    const hw = spot.w * 0.45;
    const hh = spot.h * 0.45;
    const openOffset = spot.openProgress * (hw * 0.7);

    // Barn Door Frame
    ctx.fillStyle = '#C62828';
    ctx.strokeStyle = '#5D4037';
    ctx.lineWidth = 4;

    // Left Door
    ctx.save();
    ctx.translate(-openOffset, 0);
    ctx.beginPath();
    ctx.roundRect(-hw, -hh, hw, hh * 2, 8);
    ctx.fill();
    ctx.stroke();
    // Cross brace
    ctx.strokeStyle = '#B71C1C';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-hw + 6, -hh + 6); ctx.lineTo(-6, hh - 6);
    ctx.moveTo(-6, -hh + 6); ctx.lineTo(-hw + 6, hh - 6);
    ctx.stroke();
    ctx.restore();

    // Right Door
    ctx.save();
    ctx.translate(openOffset, 0);
    ctx.beginPath();
    ctx.roundRect(0, -hh, hw, hh * 2, 8);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = '#B71C1C';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(6, -hh + 6); ctx.lineTo(hw - 6, hh - 6);
    ctx.moveTo(hw - 6, -hh + 6); ctx.lineTo(6, hh - 6);
    ctx.stroke();
    ctx.restore();
  }

  private drawGardenBush(ctx: CanvasRenderingContext2D, spot: HidingSpot): void {
    const hw = spot.w * 0.44;
    const hh = spot.h * 0.38;
    ctx.fillStyle = '#43A047';
    ctx.strokeStyle = '#2E7D32';
    ctx.lineWidth = 3.5;

    ctx.beginPath();
    ctx.arc(-hw * 0.5, 0, hh * 0.75, 0, Math.PI * 2);
    ctx.arc(hw * 0.5, 0, hh * 0.75, 0, Math.PI * 2);
    ctx.arc(0, -hh * 0.3, hh * 0.85, 0, Math.PI * 2);
    ctx.arc(0, hh * 0.2, hh * 0.85, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Flowers on bush
    ctx.fillStyle = '#FFF59D';
    ctx.beginPath();
    ctx.arc(-hw * 0.3, -hh * 0.2, 5, 0, Math.PI * 2);
    ctx.arc(hw * 0.35, -hh * 0.1, 5, 0, Math.PI * 2);
    ctx.arc(0, hh * 0.25, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawHayBale(ctx: CanvasRenderingContext2D, spot: HidingSpot): void {
    const hw = spot.w * 0.45;
    const hh = spot.h * 0.36;
    ctx.fillStyle = '#FDD835';
    ctx.strokeStyle = '#F57F17';
    ctx.lineWidth = 3.5;

    ctx.beginPath();
    ctx.roundRect(-hw, -hh, hw * 2, hh * 2, 12);
    ctx.fill();
    ctx.stroke();

    // Hay Twine
    ctx.strokeStyle = '#D84315';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-hw * 0.4, -hh); ctx.lineTo(-hw * 0.4, hh);
    ctx.moveTo(hw * 0.4, -hh); ctx.lineTo(hw * 0.4, hh);
    ctx.stroke();
  }

  private drawAppleBarrel(ctx: CanvasRenderingContext2D, spot: HidingSpot): void {
    const hw = spot.w * 0.38;
    const hh = spot.h * 0.42;
    ctx.fillStyle = '#795548';
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 3.5;

    ctx.beginPath();
    ctx.roundRect(-hw, -hh, hw * 2, hh * 2, 10);
    ctx.fill();
    ctx.stroke();

    // Metal barrel hoops
    ctx.strokeStyle = '#455A64';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-hw, -hh * 0.5); ctx.lineTo(hw, -hh * 0.5);
    ctx.moveTo(-hw, hh * 0.5); ctx.lineTo(hw, hh * 0.5);
    ctx.stroke();
  }

  override getEntities(): Record<string, unknown> {
    return {
      spots: this.spots.map(s => ({ id: s.id, type: s.type, isOpen: s.isOpen, name: s.name })),
      particles: this.particles.active
    };
  }

  override getModeState(): Record<string, unknown> {
    return {
      timer: 0,
      feverMeter: 0,
      multiplier: 1,
      coopSavedCount: 0,
      isOverheating: false,
      peekFoundCount: this.peekFoundCount
    };
  }
}
