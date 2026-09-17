/**
 * Mode 8: Rainbow Bubble Hopscotch - Pure Game Logic
 * Adventures of Trishu Mini-Game Suite
 */

import { BubbleEntity, BubbleType, HopscotchTileDef, ParachutingChickDef, MimiState, CHALK_COLORS, PENTATONIC_PITCHES, COMBO_WORDS } from './types';
import { createHopscotchTiles } from '../../graphics/bubbleGameRenderer';

export class HopscotchLogic {
  public time: number = 0;
  public bubblesPoppedCount: number = 0;
  public isCelebrating: boolean = false;
  public celebrationTimer: number = 0;
  public bubbles: BubbleEntity[] = [];
  public tiles: HopscotchTileDef[] = [];
  public parachutingChicks: ParachutingChickDef[] = [];
  public combo: number = 0;
  public comboTimer: number = 0;
  public score: number = 0;
  public bubbleWandPulse: number = 0;
  private noteIndex: number = 0;
  private spawnTimer: number = 0;

  public mimi: MimiState = {
    x: 100, y: 400, currentSquare: 1, targetSquare: 1,
    isHopping: false, hopTimer: 0, hopDuration: 0.38,
    startX: 100, startY: 400, targetX: 100, targetY: 400
  };

  public reset(vWidth: number, vHeight: number, isPortrait: boolean): void {
    this.score = 0;
    this.bubblesPoppedCount = 0;
    this.time = 0;
    this.combo = 0;
    this.comboTimer = 0;
    this.noteIndex = 0;
    this.isCelebrating = false;
    this.celebrationTimer = 0;
    this.bubbleWandPulse = 0;
    this.bubbles = [];
    this.parachutingChicks = [];

    this.tiles = createHopscotchTiles(vWidth, vHeight, isPortrait);
    this.resetMimiPosition();

    for (let i = 0; i < 9; i++) {
      this.spawnBubble(vWidth, vHeight, vHeight * 0.15 + i * (vHeight * 0.09));
    }
  }

  public resetMimiPosition(): void {
    if (this.tiles.length > 0) {
      const t1 = this.tiles[0];
      this.mimi.x = t1.x;
      this.mimi.y = t1.y - 12;
      this.mimi.startX = this.mimi.x;
      this.mimi.startY = this.mimi.y;
      this.mimi.targetX = this.mimi.x;
      this.mimi.targetY = this.mimi.y;
      this.mimi.currentSquare = 1;
      this.mimi.targetSquare = 1;
      this.mimi.isHopping = false;
      this.mimi.hopTimer = 0;
    }
  }

  public spawnBubble(
    vWidth: number,
    vHeight: number,
    initialY?: number,
    forcedType?: BubbleType,
    spawnX?: number,
    radiusOverride?: number
  ): BubbleEntity {
    const roll = Math.random();
    const type: BubbleType = forcedType ?? (roll < 0.5 ? 'RAINBOW' : roll < 0.72 ? 'GIANT' : roll < 0.88 ? 'CHICK' : 'STAR');
    const radius = radiusOverride ?? (type === 'GIANT' ? 34 + Math.random() * 12 : 18 + Math.random() * 14);
    const minX = radius + 20;
    const maxX = vWidth - radius - 20;
    const x = spawnX !== undefined ? spawnX : minX + Math.random() * (maxX - minX);
    const y = initialY !== undefined ? initialY : vHeight + radius + 10;
    const vy = -(32 + Math.random() * 40);

    const bubble: BubbleEntity = {
      x, y, radius, vy,
      wobbleOffset: Math.random() * Math.PI * 2,
      popped: false,
      type,
      hue: Math.floor(Math.random() * 360)
    };
    this.bubbles.push(bubble);
    return bubble;
  }

  public blowBubbleBurst(count: number = 5, vWidth: number, vHeight: number): Array<{ x: number; y: number }> {
    this.bubbleWandPulse = 0.6;
    const originX = this.mimi.x + 20;
    const originY = this.mimi.y - 15;
    const spawnedPositions: Array<{ x: number; y: number }> = [];

    for (let i = 0; i < count; i++) {
      const bX = originX + (Math.random() - 0.5) * 30;
      const bY = originY + (Math.random() - 0.5) * 20;
      const forced = i === 0 ? 'GIANT' : i === 1 ? 'CHICK' : 'RAINBOW';
      this.spawnBubble(vWidth, vHeight, bY, forced, bX, 18 + Math.random() * 12);
      spawnedPositions.push({ x: bX, y: bY });
    }
    return spawnedPositions;
  }

  public popBubble(idx: number): {
    bubble: BubbleEntity;
    points: number;
    pitch: number;
    comboText: string;
  } | null {
    if (idx < 0 || idx >= this.bubbles.length) return null;
    const b = this.bubbles[idx];
    if (b.popped) return null;
    b.popped = true;

    this.bubblesPoppedCount++;
    this.combo++;
    this.comboTimer = 2.2;

    const pitch = PENTATONIC_PITCHES[this.noteIndex % PENTATONIC_PITCHES.length];
    this.noteIndex++;

    let points = 50;
    if (b.type === 'GIANT') {
      points = 120;
      // Split into two smaller rainbow bubbles
      this.bubbles.push({
        x: b.x - 22, y: b.y - 10, radius: 16, vy: -(32 + Math.random() * 40),
        wobbleOffset: Math.random() * Math.PI * 2, popped: false, type: 'RAINBOW', hue: 120
      });
      this.bubbles.push({
        x: b.x + 22, y: b.y - 10, radius: 16, vy: -(32 + Math.random() * 40),
        wobbleOffset: Math.random() * Math.PI * 2, popped: false, type: 'RAINBOW', hue: 240
      });
    } else if (b.type === 'CHICK') {
      points = 150;
      this.parachutingChicks.push({
        x: b.x, y: b.y,
        vx: (Math.random() - 0.5) * 20, vy: 35 + Math.random() * 20,
        swayPhase: Math.random() * Math.PI * 2,
        parachuteColor: CHALK_COLORS[Math.floor(Math.random() * CHALK_COLORS.length)],
        landed: false, life: 4.5
      });
    } else if (b.type === 'STAR') {
      points = 100;
    }

    this.score += points;
    const comboText = this.combo > 3
      ? COMBO_WORDS[Math.min(COMBO_WORDS.length - 1, Math.floor(this.combo / 3))]
      : `+${points} 🫧`;

    return { bubble: b, points, pitch, comboText };
  }

  public findHitTile(x: number, y: number): number {
    for (const t of this.tiles) {
      if (Math.abs(x - t.x) <= t.w / 2 + 10 && Math.abs(y - t.y) <= t.h / 2 + 10) {
        return t.index;
      }
    }
    return -1;
  }

  public hopToSquare(targetSquare: number): { advanced: boolean; celebrated: boolean } {
    if (this.mimi.isHopping || this.isCelebrating) return { advanced: false, celebrated: false };
    if (targetSquare < 1 || targetSquare > this.tiles.length || targetSquare === this.mimi.currentSquare) {
      return { advanced: false, celebrated: false };
    }

    const targetTile = this.tiles[targetSquare - 1];
    this.mimi.isHopping = true;
    this.mimi.hopTimer = 0;
    this.mimi.targetSquare = targetSquare;
    this.mimi.startX = this.mimi.x;
    this.mimi.startY = this.mimi.y;
    this.mimi.targetX = targetTile.x;
    this.mimi.targetY = targetTile.y - 12;

    let celebrated = false;
    if (targetSquare === this.tiles.length) {
      this.isCelebrating = true;
      this.celebrationTimer = 3.8;
      this.score += 500;
      celebrated = true;
    }
    return { advanced: true, celebrated };
  }

  public advanceMimi(): { advanced: boolean; celebrated: boolean } {
    if (this.mimi.isHopping || this.isCelebrating) return { advanced: false, celebrated: false };
    const nextSquare = this.mimi.currentSquare + 1;

    if (nextSquare <= this.tiles.length) {
      return this.hopToSquare(nextSquare);
    } else {
      this.resetMimiPosition();
      return { advanced: false, celebrated: false };
    }
  }

  public update(dt: number, vWidth: number, vHeight: number): { reachedGroundChicks: ParachutingChickDef[] } {
    this.time += dt;
    if (this.bubbleWandPulse > 0) this.bubbleWandPulse -= dt;

    if (this.comboTimer > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) this.combo = 0;
    }

    if (this.isCelebrating) {
      this.celebrationTimer -= dt;
      if (this.celebrationTimer <= 0) {
        this.isCelebrating = false;
        this.resetMimiPosition();
      }
    }

    if (this.mimi.isHopping) {
      this.mimi.hopTimer += dt;
      const progress = Math.min(1.0, this.mimi.hopTimer / this.mimi.hopDuration);
      this.mimi.x = this.mimi.startX + (this.mimi.targetX - this.mimi.startX) * progress;
      this.mimi.y = this.mimi.startY + (this.mimi.targetY - this.mimi.startY) * progress;
      if (progress >= 1.0) {
        this.mimi.isHopping = false;
        this.mimi.currentSquare = this.mimi.targetSquare;
        this.mimi.x = this.mimi.targetX;
        this.mimi.y = this.mimi.targetY;
      }
    }

    this.spawnTimer += dt;
    if (this.spawnTimer >= 0.9) {
      this.spawnTimer = 0;
      if (this.bubbles.length < 16) this.spawnBubble(vWidth, vHeight);
    }

    for (let i = this.bubbles.length - 1; i >= 0; i--) {
      const b = this.bubbles[i];
      b.y += b.vy * dt;
      b.x += Math.sin(this.time * 2.5 + b.wobbleOffset) * 26 * dt;
      if (b.y < -b.radius - 20) this.bubbles.splice(i, 1);
    }

    const reachedGroundChicks: ParachutingChickDef[] = [];
    for (let i = this.parachutingChicks.length - 1; i >= 0; i--) {
      const c = this.parachutingChicks[i];
      c.life -= dt;
      c.y += c.vy * dt;
      c.x += Math.sin(this.time * 3 + c.swayPhase) * 20 * dt;
      if (c.life <= 0 || c.y > vHeight * 0.88) {
        reachedGroundChicks.push(c);
        this.parachutingChicks.splice(i, 1);
      }
    }

    return { reachedGroundChicks };
  }
}
