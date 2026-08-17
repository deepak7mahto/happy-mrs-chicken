import { Particle } from '../types/game';
import { PALETTE } from '../graphics/palette';

export class ParticleEngine {
  private maxParticles: number;
  public pool: Particle[];

  constructor(maxParticles: number = 250) {
    this.maxParticles = maxParticles;
    this.pool = [];
    for (let i = 0; i < this.maxParticles; i++) {
      this.pool.push({
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        color: '#FFFFFF',
        size: 5,
        alpha: 1,
        maxLife: 1,
        life: 1,
        shape: 'CIRCLE',
        active: false
      });
    }
  }

  get active(): Particle[] {
    return this.pool.filter(p => p.active);
  }

  clear(): void {
    for (const p of this.pool) {
      p.active = false;
    }
  }

  spawn(params: Partial<Particle>): Particle | null {
    let p = this.pool.find(item => !item.active);
    if (!p) {
      // Recycle oldest particle
      let oldestIdx = 0;
      let minLifeFrac = 2.0;
      for (let i = 0; i < this.pool.length; i++) {
        const frac = this.pool[i].life / this.pool[i].maxLife;
        if (frac < minLifeFrac) {
          minLifeFrac = frac;
          oldestIdx = i;
        }
      }
      p = this.pool[oldestIdx];
    }

    p.x = params.x || 0;
    p.y = params.y || 0;
    p.vx = params.vx || 0;
    p.vy = params.vy || 0;
    p.color = params.color || '#FFFFFF';
    p.size = params.size || 6;
    p.maxLife = params.maxLife || 0.8;
    p.life = p.maxLife;
    p.alpha = 1.0;
    p.shape = params.shape || 'CIRCLE';
    p.text = params.text;
    p.rotation = params.rotation || 0;
    p.vRot = params.vRot || 0;
    p.active = true;
    return p;
  }

  spawnMudSplash(x: number, y: number, count: number = 20, isGolden: boolean = false): void {
    for (let i = 0; i < count; i++) {
      const angle = -Math.PI * (0.15 + Math.random() * 0.7);
      const speed = 120 + Math.random() * 280;
      this.spawn({
        x: x + (Math.random() - 0.5) * 40,
        y: y + (Math.random() - 0.5) * 15,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: isGolden ? PALETTE.GOLDEN_PUDDLE : (Math.random() > 0.4 ? PALETTE.MUD_DARK : PALETTE.MUD_LIGHT),
        size: 5 + Math.random() * 8,
        maxLife: 0.6 + Math.random() * 0.4,
        shape: 'CIRCLE'
      });
    }
  }

  spawnEggCrack(x: number, y: number, count: number = 8): void {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 120;
      this.spawn({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 60,
        color: PALETTE.EGG_SHELL,
        size: 6 + Math.random() * 6,
        maxLife: 0.5 + Math.random() * 0.3,
        shape: 'SQUARE',
        rotation: Math.random() * Math.PI,
        vRot: (Math.random() - 0.5) * 8
      });
    }
  }

  spawnFeathers(x: number, y: number, count: number = 3): void {
    for (let i = 0; i < count; i++) {
      this.spawn({
        x: x + (Math.random() - 0.5) * 30,
        y: y + (Math.random() - 0.5) * 20,
        vx: (Math.random() - 0.5) * 60,
        vy: -40 - Math.random() * 40,
        color: PALETTE.WHITE,
        size: 8 + Math.random() * 6,
        maxLife: 0.8 + Math.random() * 0.4,
        shape: 'FEATHER',
        rotation: Math.random() * Math.PI,
        vRot: (Math.random() - 0.5) * 4
      });
    }
  }

  spawnSparkles(x: number, y: number, count: number = 10): void {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 100;
      this.spawn({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: ['#FFEE58', '#FFF59D', '#FFD54F', '#FFFFFF'][Math.floor(Math.random() * 4)],
        size: 4 + Math.random() * 5,
        maxLife: 0.4 + Math.random() * 0.3,
        shape: 'STAR'
      });
    }
  }

  spawnSteam(x: number, y: number): void {
    this.spawn({
      x: x + (Math.random() - 0.5) * 20,
      y,
      vx: (Math.random() - 0.5) * 30,
      vy: -90 - Math.random() * 60,
      color: PALETTE.STEAM_WHITE,
      size: 12 + Math.random() * 10,
      maxLife: 0.7 + Math.random() * 0.3,
      shape: 'CIRCLE'
    });
  }

  spawnScorePopup(x: number, y: number, text: string): void {
    this.spawn({
      x,
      y,
      vx: 0,
      vy: -55,
      color: '#FFD700',
      size: 20,
      maxLife: 0.9,
      shape: 'TEXT',
      text
    });
  }

  update(dt: number): void {
    for (const p of this.pool) {
      if (!p.active) continue;
      p.life -= dt;
      if (p.life <= 0) {
        p.active = false;
        continue;
      }

      p.alpha = Math.max(0, p.life / p.maxLife);
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      if (p.shape === 'CIRCLE' || p.shape === 'SQUARE') {
        p.vy += 450 * dt; // Gravity
      } else if (p.shape === 'FEATHER') {
        p.vy += 30 * dt; // Slow feather float
        p.vx += Math.sin(p.life * 10) * 15 * dt;
      }

      if (p.vRot) p.rotation = (p.rotation || 0) + p.vRot * dt;
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    for (const p of this.pool) {
      if (!p.active) continue;
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.translate(p.x, p.y);

      if (p.rotation) ctx.rotate(p.rotation);

      if (p.shape === 'CIRCLE') {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.shape === 'SQUARE') {
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      } else if (p.shape === 'FEATHER') {
        ctx.fillStyle = p.color;
        ctx.strokeStyle = '#CFD8DC';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size * 0.4, p.size, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else if (p.shape === 'STAR') {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const a = (i * Math.PI * 2) / 5 - Math.PI / 2;
          const r1 = p.size;
          const r2 = p.size * 0.4;
          const a2 = a + Math.PI / 5;
          if (i === 0) ctx.moveTo(Math.cos(a) * r1, Math.sin(a) * r1);
          else ctx.lineTo(Math.cos(a) * r1, Math.sin(a) * r1);
          ctx.lineTo(Math.cos(a2) * r2, Math.sin(a2) * r2);
        }
        ctx.closePath();
        ctx.fill();
      } else if (p.shape === 'TEXT' && p.text) {
        ctx.font = `bold ${p.size}px "Comic Sans MS", cursive, sans-serif`;
        ctx.fillStyle = p.color;
        ctx.strokeStyle = '#3E2723';
        ctx.lineWidth = 3;
        ctx.textAlign = 'center';
        ctx.strokeText(p.text, 0, 0);
        ctx.fillText(p.text, 0, 0);
      }
      ctx.restore();
    }
    ctx.restore();
  }
}
