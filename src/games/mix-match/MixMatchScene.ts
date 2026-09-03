/**
 * Mode 9: Trishu's Mix & Match Funny Studio
 * Adventures of Trishu Mini-Game Suite
 * Strictly under 500 Lines of Code
 */

import { BaseScene } from '../base/BaseScene';
import { GameEngine } from '../../engine/GameEngine';
import { InputManager } from '../../engine/InputManager';
import { DisplayManager } from '../../engine/DisplayManager';
import { CharacterAnimState } from '../../types/characters';
import { ParticleEngine } from '../../engine/ParticleEngine';
import { soundEngine } from '../../engine/SoundEngine';
import { Haptics } from '../../engine/Haptics';
import { drawLandscapeSkyHills } from '../../graphics/environmentRenderer';
import {
  CHARACTER_PARTS,
  drawCompositeCharacter,
  drawHeadPart,
  drawTorsoPart,
  drawLegsPart
} from '../../graphics/characters/modularBodyParts';
import {
  createCharacterAnimState,
  updateCharacterAnimState
} from '../../graphics/animations';

const FUNNY_ADJECTIVES = [
  'Wacky', 'Super', 'Giggly', 'Speedy', 'Magical', 'Clucky', 'Disco', 'Jumping'
];

export class MixMatchScene extends BaseScene {
  public time: number = 0;
  public headIdx: number = 0;
  public torsoIdx: number = 0;
  public legsIdx: number = 0;

  public isShuffling: boolean = false;
  public shuffleTimer: number = 0;
  public shuffleTickTimer: number = 0;

  public isDancing: boolean = false;
  public danceTimer: number = 0;

  public photoFlashTimer: number = 0;
  public photosSnapped: number = 0;
  public currentTitle: string = 'Trishu The Explorer';

  public particles: ParticleEngine;
  public animState: CharacterAnimState;

  constructor(game: GameEngine) {
    super(game);
    this.particles = new ParticleEngine(150);
    this.animState = createCharacterAnimState();
  }

  enter(): void {
    this.time = 0;
    this.headIdx = 0;
    this.torsoIdx = 0;
    this.legsIdx = 0;
    this.isShuffling = false;
    this.isDancing = false;
    this.photoFlashTimer = 0;
    this.photosSnapped = 0;
    this.score = 0;
    this.particles.clear();
    this.animState = createCharacterAnimState();
    this.updateTitle();
  }

  exit(): void {
    this.particles.clear();
  }

  public shuffle(): void {
    this.isShuffling = true;
    this.shuffleTimer = 1.2;
    this.shuffleTickTimer = 0;
    soundEngine.playSFX('whoosh');
    Haptics.medium();
  }

  public nextHead(dir: number = 1): void {
    this.headIdx = (this.headIdx + dir + 7) % 7;
    soundEngine.playSFX('click');
    Haptics.tap();
    this.triggerPartChange();
  }

  public nextTorso(dir: number = 1): void {
    this.torsoIdx = (this.torsoIdx + dir + 7) % 7;
    soundEngine.playSFX('click');
    Haptics.tap();
    this.triggerPartChange();
  }

  public nextLegs(dir: number = 1): void {
    this.legsIdx = (this.legsIdx + dir + 7) % 7;
    soundEngine.playSFX('click');
    Haptics.tap();
    this.triggerPartChange();
  }

  private triggerPartChange(): void {
    this.score += 10;
    this.game.storage.saveHighScore('mixMatch', this.score);
    this.updateTitle();
  }

  public triggerDance(): void {
    this.isDancing = true;
    this.danceTimer = 2.2;
    this.score += 50;
    this.game.storage.saveHighScore('mixMatch', this.score);

    soundEngine.playSFX('toddlerGiggle');
    if (this.headIdx === 6 || this.torsoIdx === 6 || this.legsIdx === 6) {
      soundEngine.playSFX('cluck');
    }
    if (this.headIdx === 5 || this.torsoIdx === 5 || this.legsIdx === 5) {
      soundEngine.playSFX('bunnySqueak');
    }
    Haptics.medium();

    const vW = this.game.display.vWidth;
    const vH = this.game.display.vHeight;
    this.particles.spawnSparkles(vW / 2, vH * 0.45, 16);
    this.particles.spawnScorePopup(vW / 2, vH * 0.35, '✨ Funny Dance! +50');
  }

  public snapPhoto(): void {
    this.photoFlashTimer = 0.35;
    this.photosSnapped++;
    this.score += 100;
    this.game.storage.saveHighScore('mixMatch', this.score);

    soundEngine.playSFX('click');
    soundEngine.playSFX('fanfare');
    Haptics.heavy();

    const vW = this.game.display.vWidth;
    const vH = this.game.display.vHeight;
    this.particles.spawnConfetti(vW / 2, vH * 0.45, 30);
    this.particles.spawnScorePopup(vW / 2, vH * 0.3, '📸 PHOTO SAVED! +100');
  }

  private updateTitle(): void {
    const hChar = CHARACTER_PARTS.heads[this.headIdx].character;
    const tChar = CHARACTER_PARTS.torsos[this.torsoIdx].character;
    const lChar = CHARACTER_PARTS.legs[this.legsIdx].character;

    if (this.headIdx === this.torsoIdx && this.torsoIdx === this.legsIdx) {
      this.currentTitle = `Classic ${hChar}!`;
    } else {
      const adj = FUNNY_ADJECTIVES[(this.headIdx + this.torsoIdx + this.legsIdx) % FUNNY_ADJECTIVES.length];
      this.currentTitle = `${adj} ${hChar}-${tChar} ${lChar}!`;
    }
  }

  update(dt: number, input: InputManager): void {
    this.time += dt;
    updateCharacterAnimState(this.animState, dt);

    if (this.photoFlashTimer > 0) {
      this.photoFlashTimer -= dt;
    }

    if (this.isDancing) {
      this.danceTimer -= dt;
      this.animState.headBob = Math.sin(this.time * 24) * 6;
      this.animState.wobbleAngle = Math.sin(this.time * 18) * 0.15;
      if (this.danceTimer <= 0) {
        this.isDancing = false;
        this.animState.headBob = 0;
        this.animState.wobbleAngle = 0;
      }
    }

    if (this.isShuffling) {
      this.shuffleTimer -= dt;
      this.shuffleTickTimer += dt;
      if (this.shuffleTickTimer >= 0.08) {
        this.shuffleTickTimer = 0;
        this.headIdx = Math.floor(Math.random() * 7);
        this.torsoIdx = Math.floor(Math.random() * 7);
        this.legsIdx = Math.floor(Math.random() * 7);
        soundEngine.playSFX('click');
      }

      if (this.shuffleTimer <= 0) {
        this.isShuffling = false;
        this.updateTitle();
        this.triggerDance();
      }
    }

    // Input Handling
    this.handleSceneInput(input);
    this.particles.update(dt);
  }

  private handleSceneInput(input: InputManager): void {
    if (this.isShuffling) return;

    const pointers = [];
    if (input.isActionJustPressed()) {
      pointers.push({ x: input.primaryPointer.x, y: input.primaryPointer.y });
    }
    for (const ptr of input.pointers.values()) {
      if (ptr.justPressed) pointers.push({ x: ptr.x, y: ptr.y });
    }

    const isPortrait = this.game.display.isPortrait;
    const vW = this.game.display.vWidth;
    const vH = this.game.display.vHeight;
    const cx = vW / 2;
    const cy = isPortrait ? vH * 0.44 : vH * 0.48;

    for (const pt of pointers) {
      // Check Center Character Tap (triggers Dance)
      if (Math.hypot(pt.x - cx, pt.y - cy) < 90) {
        this.triggerDance();
        continue;
      }

      // Slot Arrow Buttons
      const rowYHead = cy - 65;
      const rowYTorso = cy;
      const rowYLegs = cy + 65;

      const arrowLeftX = cx - 110;
      const arrowRightX = cx + 110;

      // Head Arrows
      if (Math.hypot(pt.x - arrowLeftX, pt.y - rowYHead) < 28) this.nextHead(-1);
      else if (Math.hypot(pt.x - arrowRightX, pt.y - rowYHead) < 28) this.nextHead(1);

      // Torso Arrows
      else if (Math.hypot(pt.x - arrowLeftX, pt.y - rowYTorso) < 28) this.nextTorso(-1);
      else if (Math.hypot(pt.x - arrowRightX, pt.y - rowYTorso) < 28) this.nextTorso(1);

      // Legs Arrows
      else if (Math.hypot(pt.x - arrowLeftX, pt.y - rowYLegs) < 28) this.nextLegs(-1);
      else if (Math.hypot(pt.x - arrowRightX, pt.y - rowYLegs) < 28) this.nextLegs(1);

      // Shuffle Button (Bottom Left)
      const btnY = isPortrait ? vH * 0.84 : vH * 0.86;
      const shuffleX = cx - 90;
      const photoX = cx + 90;

      if (Math.hypot(pt.x - shuffleX, pt.y - btnY) < 42) {
        this.shuffle();
      } else if (Math.hypot(pt.x - photoX, pt.y - btnY) < 42) {
        this.snapPhoto();
      }
    }

    if (input.isKeyJustPressed('Space') || input.isKeyJustPressed('Enter')) {
      this.shuffle();
    }
  }

  render(ctx: CanvasRenderingContext2D, alpha: number, display: DisplayManager): void {
    const vW = display.vWidth;
    const vH = display.vHeight;
    const isPortrait = display.isPortrait;
    const cx = vW / 2;
    const cy = isPortrait ? vH * 0.44 : vH * 0.48;

    drawLandscapeSkyHills(ctx, vW, vH, this.time);

    // Studio Stage Platform
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(cx, cy + 95, 120, 36, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Studio Frame Background Card
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.strokeStyle = '#FFD54F';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(cx - 145, cy - 130, 290, 240, 24);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Render Center Composite Character
    drawCompositeCharacter(
      ctx,
      this.headIdx,
      this.torsoIdx,
      this.legsIdx,
      cx,
      cy,
      isPortrait ? 1.45 : 1.35,
      this.animState
    );

    // Render Interactive Arrow Selectors
    this.renderSlotArrows(ctx, cx, cy);

    // Render Bottom Buttons (Shuffle & Photo)
    this.renderBottomButtons(ctx, display, cx);

    // Render Title & HUD Badge
    this.renderHUD(ctx, display, cx);

    // Particles
    this.particles.render(ctx);

    // Photo Flash Effect
    if (this.photoFlashTimer > 0) {
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1.0, this.photoFlashTimer * 3.5)})`;
      ctx.fillRect(0, 0, vW, vH);
    }
  }

  private renderSlotArrows(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
    const rows = [
      { y: cy - 65, label: 'HEAD' },
      { y: cy, label: 'TORSO' },
      { y: cy + 65, label: 'LEGS' }
    ];

    for (const r of rows) {
      // Left Arrow
      this.drawArrowBtn(ctx, cx - 110, r.y, true);
      // Right Arrow
      this.drawArrowBtn(ctx, cx + 110, r.y, false);
    }
  }

  private drawArrowBtn(ctx: CanvasRenderingContext2D, x: number, y: number, isLeft: boolean): void {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = '#FF4081';
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    if (isLeft) {
      ctx.moveTo(4, -8); ctx.lineTo(-6, 0); ctx.lineTo(4, 8);
    } else {
      ctx.moveTo(-4, -8); ctx.lineTo(6, 0); ctx.lineTo(-4, 8);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  private renderBottomButtons(ctx: CanvasRenderingContext2D, display: DisplayManager, cx: number): void {
    const isPortrait = display.isPortrait;
    const vH = display.vHeight;
    const btnY = isPortrait ? vH * 0.84 : vH * 0.86;

    // 1. Shuffle Button
    const shuffleX = cx - 90;
    this.drawActionButton(ctx, shuffleX, btnY, '🎲 SHUFFLE', '#4CAF50', '#2E7D32');

    // 2. Snap Photo Button
    const photoX = cx + 90;
    this.drawActionButton(ctx, photoX, btnY, '📸 PHOTO', '#FF9800', '#E65100');
  }

  private drawActionButton(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    label: string,
    color: string,
    strokeColor: string
  ): void {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = color;
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(-70, -26, 140, 52, 26);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 18px "Comic Sans MS", cursive, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, 0, 1);
    ctx.restore();
  }

  private renderHUD(ctx: CanvasRenderingContext2D, display: DisplayManager, cx: number): void {
    const isPortrait = display.isPortrait;
    const hudY = isPortrait ? 76 : Math.max(18, display.vHeight * 0.035);

    ctx.save();
    // Title Card
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.strokeStyle = '#FFD54F';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(cx - 170, hudY, 340, 48, 24);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 20px "Comic Sans MS", cursive, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`✨ ${this.currentTitle}`, cx, hudY + 24);
    ctx.restore();
  }

  override getEntities(): Record<string, unknown> {
    return {
      headIdx: this.headIdx,
      torsoIdx: this.torsoIdx,
      legsIdx: this.legsIdx,
      title: this.currentTitle,
      photosSnapped: this.photosSnapped,
      isShuffling: this.isShuffling,
      isDancing: this.isDancing,
      particles: this.particles.active
    };
  }

  override getModeState(): Record<string, unknown> {
    return {
      score: this.score,
      headIdx: this.headIdx,
      torsoIdx: this.torsoIdx,
      legsIdx: this.legsIdx,
      title: this.currentTitle,
      photosSnapped: this.photosSnapped,
      timer: this.time,
      multiplier: 1,
      feverMeter: 0,
      coopSavedCount: 0,
      isOverheating: false
    };
  }
}
