/**
 * Game Logic & Physics Engine for Mode: Emojis
 * Adventures of Trishu Mini-Game Suite
 * Strictly under 500 lines
 */

import { EmotionType, MajorEmotionDef, SmallEmojiItem, BouncingEmojiEntity, EmojiSparkleParticle } from './types';

const SMALL_EMOJI_LIST: { emoji: string; name: string }[] = [
  { emoji: '🐶', name: 'Puppy' }, { emoji: '🐱', name: 'Kitty' },
  { emoji: '🦄', name: 'Unicorn' }, { emoji: '🐰', name: 'Bunny' },
  { emoji: '🐼', name: 'Panda' }, { emoji: '🐸', name: 'Froggy' },
  { emoji: '🐥', name: 'Chick' }, { emoji: '🦁', name: 'Lion' },
  { emoji: '🚀', name: 'Rocket' }, { emoji: '⭐', name: 'Star' },
  { emoji: '🌈', name: 'Rainbow' }, { emoji: '🍕', name: 'Pizza' },
  { emoji: '🍦', name: 'Ice Cream' }, { emoji: '🍩', name: 'Donut' },
  { emoji: '🎈', name: 'Balloon' }, { emoji: '🎉', name: 'Party' },
  { emoji: '🎸', name: 'Guitar' }, { emoji: '⚽', name: 'Soccer' },
  { emoji: '🦖', name: 'Dino' }, { emoji: '💖', name: 'Heart' },
  { emoji: '🍭', name: 'Lollipop' }, { emoji: '🍓', name: 'Berry' }
];

export class EmojisLogic {
  public width: number = 960;
  public height: number = 540;
  public score: number = 0;
  public totalSmiles: number = 0;
  public emojisSpawned: number = 0;
  public currentEmotion: EmotionType = 'HAPPY';
  public emotionTimer: number = 0;
  public emotionReactionTimer: number = 0;

  public stageCenterX: number = 480;
  public stageCenterY: number = 210;
  public stageRadius: number = 85;

  public majorButtons: MajorEmotionDef[] = [];
  public smallEmojis: SmallEmojiItem[] = [];
  public bouncingEntities: BouncingEmojiEntity[] = [];
  public sparkles: EmojiSparkleParticle[] = [];

  public partyBtnX: number = 0;
  public partyBtnY: number = 0;
  public partyBtnW: number = 100;
  public partyBtnH: number = 38;
  public partyScale: number = 1.0;

  private nextEntityId: number = 1;

  constructor() {
    this.initMajorButtons();
    this.initSmallEmojis();
  }

  private initMajorButtons(): void {
    this.majorButtons = [
      {
        id: 'HAPPY', label: 'Happy', subLabel: 'Joyful & Bright', emoji: '😊',
        color: '#FFF9C4', activeColor: '#FFEE58', borderColor: '#FBC02D',
        x: 0, y: 0, w: 120, h: 56, scale: 1.0, pulseTimer: 0
      },
      {
        id: 'SAD', label: 'Sad', subLabel: 'Gentle Tears', emoji: '😢',
        color: '#E1F5FE', activeColor: '#81D4FA', borderColor: '#0288D1',
        x: 0, y: 0, w: 120, h: 56, scale: 1.0, pulseTimer: 0.5
      },
      {
        id: 'ANGRY', label: 'Angry', subLabel: 'Puff of Steam', emoji: '😡',
        color: '#FFEBEE', activeColor: '#FF8A80', borderColor: '#D32F2F',
        x: 0, y: 0, w: 120, h: 56, scale: 1.0, pulseTimer: 1.0
      },
      {
        id: 'SURPRISE', label: 'Surprise', subLabel: 'Wide Eyes Wow', emoji: '😲',
        color: '#F3E5F5', activeColor: '#CE93D8', borderColor: '#7B1FA2',
        x: 0, y: 0, w: 120, h: 56, scale: 1.0, pulseTimer: 1.5
      }
    ];
  }

  private initSmallEmojis(): void {
    this.smallEmojis = SMALL_EMOJI_LIST.map((item, idx) => ({
      id: `emoji_${idx}`,
      emoji: item.emoji,
      name: item.name,
      x: 0, y: 0, size: 44, scale: 1.0, bounceTimer: 0
    }));
  }

  public reset(w: number, h: number): void {
    this.width = w;
    this.height = h;
    this.score = 0;
    this.totalSmiles = 0;
    this.emojisSpawned = 0;
    this.currentEmotion = 'HAPPY';
    this.emotionTimer = 0;
    this.emotionReactionTimer = 1.0;
    this.bouncingEntities = [];
    this.sparkles = [];
    this.layout(w, h);
  }

  public layout(w: number, h: number): void {
    this.width = w;
    this.height = h;
    const isPortrait = h > w;

    if (isPortrait) {
      this.stageCenterX = w * 0.5;
      this.stageCenterY = h * 0.28;
      this.stageRadius = Math.min(w * 0.22, 90);

      const btnW = Math.min(w * 0.42, 160);
      const btnH = 58;
      const startY = h * 0.48;
      const gapX = 14;
      const gapY = 12;

      this.majorButtons[0].w = btnW; this.majorButtons[0].h = btnH;
      this.majorButtons[0].x = w * 0.5 - btnW - gapX * 0.5; this.majorButtons[0].y = startY;

      this.majorButtons[1].w = btnW; this.majorButtons[1].h = btnH;
      this.majorButtons[1].x = w * 0.5 + gapX * 0.5; this.majorButtons[1].y = startY;

      this.majorButtons[2].w = btnW; this.majorButtons[2].h = btnH;
      this.majorButtons[2].x = w * 0.5 - btnW - gapX * 0.5; this.majorButtons[2].y = startY + btnH + gapY;

      this.majorButtons[3].w = btnW; this.majorButtons[3].h = btnH;
      this.majorButtons[3].x = w * 0.5 + gapX * 0.5; this.majorButtons[3].y = startY + btnH + gapY;

      this.partyBtnW = 120; this.partyBtnH = 38;
      this.partyBtnX = w * 0.5 - this.partyBtnW * 0.5;
      this.partyBtnY = startY + (btnH + gapY) * 2 + 8;

      const trayY = h * 0.74;
      const itemSize = Math.min(w / 8, 48);
      const perRow = Math.floor((w - 24) / itemSize);
      for (let i = 0; i < this.smallEmojis.length; i++) {
        const row = Math.floor(i / perRow);
        const col = i % perRow;
        const totalInRow = Math.min(this.smallEmojis.length - row * perRow, perRow);
        const rowStartX = (w - totalInRow * itemSize) * 0.5;
        this.smallEmojis[i].size = itemSize - 6;
        this.smallEmojis[i].x = rowStartX + col * itemSize + (itemSize - 6) * 0.5;
        this.smallEmojis[i].y = trayY + row * itemSize + (itemSize - 6) * 0.5;
      }
    } else {
      this.stageCenterX = w * 0.5;
      this.stageCenterY = h * 0.38;
      this.stageRadius = 90;

      const btnW = Math.min(w * 0.17, 150);
      const btnH = 54;
      const btnSpacing = 16;
      const totalBtnW = 4 * btnW + 3 * btnSpacing;
      const btnStartX = (w - totalBtnW) * 0.5;
      const btnY = h * 0.68;

      for (let i = 0; i < 4; i++) {
        this.majorButtons[i].w = btnW; this.majorButtons[i].h = btnH;
        this.majorButtons[i].x = btnStartX + i * (btnW + btnSpacing);
        this.majorButtons[i].y = btnY;
      }

      this.partyBtnW = 110; this.partyBtnH = 36;
      this.partyBtnX = w - this.partyBtnW - 20; this.partyBtnY = 16;

      const trayY = h * 0.88;
      const itemW = Math.min((w - 32) / this.smallEmojis.length, 48);
      const startX = (w - this.smallEmojis.length * itemW) * 0.5;

      for (let i = 0; i < this.smallEmojis.length; i++) {
        this.smallEmojis[i].size = Math.min(itemW - 4, 40);
        this.smallEmojis[i].x = startX + i * itemW + itemW * 0.5;
        this.smallEmojis[i].y = trayY;
      }
    }
  }

  public selectEmotion(emotion: EmotionType): { previous: EmotionType; changed: boolean } {
    const prev = this.currentEmotion;
    this.currentEmotion = emotion;
    this.emotionReactionTimer = 1.0;
    this.score += 2;
    this.totalSmiles++;

    const btn = this.majorButtons.find((b) => b.id === emotion);
    if (btn) btn.scale = 1.25;

    this.emitEmotionSparkles(this.stageCenterX, this.stageCenterY, emotion);
    return { previous: prev, changed: prev !== emotion };
  }

  public tapSmallEmoji(index: number): BouncingEmojiEntity | null {
    if (index < 0 || index >= this.smallEmojis.length) return null;
    const item = this.smallEmojis[index];
    item.scale = 1.45;
    item.bounceTimer = 0.4;

    const entity = this.spawnEmojiEntity(item.emoji, item.x, item.y);
    this.score += 1;
    this.emojisSpawned++;
    return entity;
  }

  public spawnEmojiEntity(emoji: string, startX?: number, startY?: number): BouncingEmojiEntity {
    const x = startX !== undefined ? startX : this.stageCenterX;
    const y = startY !== undefined ? startY : this.stageCenterY + 40;

    const angle = -Math.PI * 0.5 + (Math.random() - 0.5) * 1.1;
    const speed = 280 + Math.random() * 220;
    const isPortrait = this.height > this.width;
    const groundLimit = isPortrait ? this.height * 0.70 : this.height * 0.82;

    const entity: BouncingEmojiEntity = {
      id: this.nextEntityId++,
      emoji,
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      rotation: (Math.random() - 0.5) * 0.4,
      vRot: (Math.random() - 0.5) * 6,
      scale: 0.3,
      targetScale: 1.0 + Math.random() * 0.3,
      wobble: 0,
      life: 6.0,
      maxLife: 6.0,
      groundY: groundLimit - 20 - Math.random() * 25,
      bounces: 0,
      alpha: 1.0
    };

    if (this.bouncingEntities.length >= 30) this.bouncingEntities.shift();
    this.bouncingEntities.push(entity);
    this.emitMiniBurst(x, y, ['✨', '⭐', '💫']);
    return entity;
  }

  public popEntityAt(x: number, y: number): boolean {
    for (let i = this.bouncingEntities.length - 1; i >= 0; i--) {
      const e = this.bouncingEntities[i];
      if (Math.hypot(e.x - x, e.y - y) < 40 * e.scale) {
        this.emitMiniBurst(e.x, e.y, ['✨', '💖', '⭐', '🎉']);
        this.bouncingEntities.splice(i, 1);
        this.score += 3;
        return true;
      }
    }
    return false;
  }

  public triggerParty(): void {
    this.partyScale = 1.3;
    this.score += 10;
    for (let i = 0; i < 8; i++) {
      const rEmoji = this.smallEmojis[Math.floor(Math.random() * this.smallEmojis.length)];
      if (rEmoji) {
        this.spawnEmojiEntity(rEmoji.emoji, this.width * 0.2 + Math.random() * (this.width * 0.6), this.height * 0.7);
      }
    }
    this.emitEmotionSparkles(this.stageCenterX, this.stageCenterY, 'HAPPY');
  }

  public emitEmotionSparkles(cx: number, cy: number, emotion: EmotionType): void {
    const symbols = emotion === 'HAPPY' ? ['💖', '⭐', '✨', '🌸']
      : emotion === 'SAD' ? ['💧', '🫧', '💙']
      : emotion === 'ANGRY' ? ['💨', '🔥', '⚡', '💢']
      : ['❗', '❓', '🌟', '💥'];
    const col = emotion === 'HAPPY' ? '#FFD54F' : emotion === 'SAD' ? '#64B5F6' : emotion === 'ANGRY' ? '#EF5350' : '#BA68C8';

    for (let i = 0; i < 14; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 60 + Math.random() * 140;
      this.sparkles.push({
        x: cx + Math.cos(ang) * 40, y: cy + Math.sin(ang) * 40,
        vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd,
        size: 16 + Math.random() * 12, color: col,
        symbol: symbols[Math.floor(Math.random() * symbols.length)],
        life: 0.8 + Math.random() * 0.4, maxLife: 1.2, alpha: 1.0
      });
    }
  }

  public emitMiniBurst(cx: number, cy: number, symbols: string[]): void {
    for (let i = 0; i < 6; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 40 + Math.random() * 90;
      this.sparkles.push({
        x: cx, y: cy, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd,
        size: 14 + Math.random() * 10, color: '#FFD700',
        symbol: symbols[Math.floor(Math.random() * symbols.length)],
        life: 0.6, maxLife: 0.6, alpha: 1.0
      });
    }
  }

  public findMajorButtonAt(x: number, y: number): EmotionType | null {
    for (const btn of this.majorButtons) {
      if (x >= btn.x && x <= btn.x + btn.w && y >= btn.y && y <= btn.y + btn.h) return btn.id;
    }
    return null;
  }

  public findSmallEmojiAt(x: number, y: number): number {
    for (let i = 0; i < this.smallEmojis.length; i++) {
      if (Math.hypot(this.smallEmojis[i].x - x, this.smallEmojis[i].y - y) <= this.smallEmojis[i].size * 0.6) return i;
    }
    return -1;
  }

  public isPartyButtonHit(x: number, y: number): boolean {
    return x >= this.partyBtnX && x <= this.partyBtnX + this.partyBtnW && y >= this.partyBtnY && y <= this.partyBtnY + this.partyBtnH;
  }

  public update(dt: number): void {
    const clampedDt = Math.min(dt, 0.1);
    this.emotionTimer += clampedDt;
    if (this.emotionReactionTimer > 0) {
      this.emotionReactionTimer = Math.max(0, this.emotionReactionTimer - clampedDt * 2);
    }

    for (const btn of this.majorButtons) {
      btn.pulseTimer += clampedDt * 3;
      if (btn.scale > 1.0) btn.scale = Math.max(1.0, btn.scale - clampedDt * 2.0);
    }

    for (const item of this.smallEmojis) {
      if (item.bounceTimer > 0) {
        item.bounceTimer -= clampedDt;
        item.scale = Math.max(1.0, item.scale - clampedDt * 2.5);
      } else {
        item.scale = 1.0;
      }
    }

    if (this.partyScale > 1.0) this.partyScale = Math.max(1.0, this.partyScale - clampedDt * 1.8);

    const gravity = 580;
    for (let i = this.bouncingEntities.length - 1; i >= 0; i--) {
      const e = this.bouncingEntities[i];
      e.life -= clampedDt;
      if (e.scale < e.targetScale) e.scale = Math.min(e.targetScale, e.scale + clampedDt * 3.5);

      e.vy += gravity * clampedDt;
      e.x += e.vx * clampedDt;
      e.y += e.vy * clampedDt;
      e.rotation += e.vRot * clampedDt;
      e.wobble += clampedDt * 8;

      if (e.y >= e.groundY && e.vy > 0) {
        e.y = e.groundY;
        e.vy = -e.vy * 0.65;
        e.vx *= 0.85;
        e.vRot *= 0.8;
        e.bounces++;
      }

      if (e.x < 30 && e.vx < 0) { e.x = 30; e.vx = -e.vx * 0.7; }
      else if (e.x > this.width - 30 && e.vx > 0) { e.x = this.width - 30; e.vx = -e.vx * 0.7; }

      if (e.life < 1.0) e.alpha = Math.max(0, e.life);
      if (e.life <= 0) this.bouncingEntities.splice(i, 1);
    }

    for (let i = this.sparkles.length - 1; i >= 0; i--) {
      const p = this.sparkles[i];
      p.life -= clampedDt;
      p.x += p.vx * clampedDt;
      p.y += p.vy * clampedDt;
      p.vy += 80 * clampedDt;
      p.alpha = Math.max(0, p.life / p.maxLife);
      if (p.life <= 0) this.sparkles.splice(i, 1);
    }
  }
}
