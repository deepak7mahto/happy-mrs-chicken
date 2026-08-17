import { IParticle, IParticleSpawnOptions, IParticleSystem, ParticleType } from '../types/particles';
import { PALETTE } from '../graphics/palette';

const PALETTE_CONFETTI = ['#FF4081', '#29B6F6', '#FFEB3B', '#66BB6A', '#FF9800', '#AB47BC', '#E91E63', '#00E676'];
const PALETTE_SPARKLE = ['#FFEE58', '#FFF59D', '#FFD54F', '#FFFFFF', '#FF80AB', '#80D8FF'];
const PALETTE_FEATHER = [PALETTE.WHITE, '#FFF9C4', '#ECEFF1'];
const PALETTE_EGG_SHELL = [PALETTE.EGG_SHELL, '#FFE082', '#FFF59D', PALETTE.EGG_OUTLINE];
const PALETTE_SOAP_BUBBLE = ['rgba(255, 128, 171, 0.65)', 'rgba(128, 216, 255, 0.65)', 'rgba(234, 128, 252, 0.65)', 'rgba(185, 246, 202, 0.65)'];
const PALETTE_SYRUP = ['#D84315', '#FF8F00', '#FFA000', '#FFB300'];
const PALETTE_MUD = [PALETTE.MUD_DARK, PALETTE.MUD_LIGHT, '#4E342E', PALETTE.MUD_OUTLINE];
const PALETTE_GOLDEN_MUD = [PALETTE.GOLDEN_PUDDLE, '#FF8F00', '#FFD54F'];
const PALETTE_WATER_BUBBLE = ['rgba(129, 212, 250, 0.75)', 'rgba(79, 195, 247, 0.65)'];

export class ParticleEngine implements IParticleSystem {
  public maxParticles: number;
  public pool: IParticle[];

  constructor(maxParticles: number = 300) {
    this.maxParticles = maxParticles;
    this.pool = new Array(this.maxParticles);
    for (let i = 0; i < this.maxParticles; i++) {
      this.pool[i] = {
        x: 0, y: 0, vx: 0, vy: 0, ax: 0, ay: 0, drag: 1, color: '#FFFFFF',
        size: 5, initialSize: 5, alpha: 1, maxLife: 1, life: 0,
        type: 'sparkle', shape: 'CIRCLE', rotation: 0, vRot: 0, scaleX: 1, phase: 0, active: false
      };
    }
  }

  get active(): IParticle[] { return this.pool.filter(p => p.active); }

  clear(): void {
    for (let i = 0; i < this.maxParticles; i++) this.pool[i].active = false;
  }

  spawn(opt: Partial<IParticle> | IParticleSpawnOptions): IParticle {
    let p: IParticle | null = null;
    for (let i = 0; i < this.maxParticles; i++) {
      if (!this.pool[i].active) { p = this.pool[i]; break; }
    }
    if (!p) {
      let oldestIdx = 0, minR = 2.0;
      for (let i = 0; i < this.maxParticles; i++) {
        const r = this.pool[i].life / this.pool[i].maxLife;
        if (r < minR) { minR = r; oldestIdx = i; }
      }
      p = this.pool[oldestIdx];
    }
    p.x = opt.x ?? 0; p.y = opt.y ?? 0; p.vx = opt.vx ?? 0; p.vy = opt.vy ?? 0;
    p.ax = opt.ax ?? 0; p.ay = opt.ay ?? 0; p.drag = opt.drag ?? 1;
    p.color = opt.color ?? '#FFFFFF'; p.size = opt.size ?? 6; p.initialSize = p.size;
    p.maxLife = opt.maxLife ?? 0.8; p.life = p.maxLife; p.alpha = 1.0;
    p.type = (opt.type as ParticleType) || 'sparkle'; p.shape = opt.shape ?? 'CIRCLE';
    p.rotation = opt.rotation ?? 0; p.vRot = opt.vRot ?? 0; p.scaleX = opt.scaleX ?? 1;
    p.phase = opt.phase ?? Math.random() * Math.PI * 2; p.text = opt.text; p.active = true;
    return p;
  }

  spawnFeathers(x: number, y: number, count = 3): void {
    for (let i = 0; i < count; i++) {
      this.spawn({
        x: x + (Math.random() - 0.5) * 30, y: y + (Math.random() - 0.5) * 20,
        vx: (Math.random() - 0.5) * 60, vy: -30 - Math.random() * 40, ay: 35, drag: 0.98,
        color: PALETTE_FEATHER[Math.floor(Math.random() * PALETTE_FEATHER.length)],
        size: 8 + Math.random() * 6, maxLife: 0.9 + Math.random() * 0.5,
        type: 'feather', shape: 'FEATHER', rotation: Math.random() * Math.PI, vRot: (Math.random() - 0.5) * 3
      });
    }
  }

  spawnSparkles(x: number, y: number, count = 10): void {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2, spd = 40 + Math.random() * 110;
      this.spawn({
        x, y, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd, ay: 20, drag: 0.92,
        color: PALETTE_SPARKLE[Math.floor(Math.random() * PALETTE_SPARKLE.length)],
        size: 4 + Math.random() * 5, maxLife: 0.4 + Math.random() * 0.3, type: 'sparkle', shape: 'STAR'
      });
    }
  }

  spawnEggCrack(x: number, y: number, count = 8): void {
    for (let i = 0; i < count; i++) {
      const a = -Math.PI * (0.15 + Math.random() * 0.7), spd = 70 + Math.random() * 140;
      this.spawn({
        x, y, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd, ay: 520, drag: 0.99,
        color: PALETTE_EGG_SHELL[Math.floor(Math.random() * PALETTE_EGG_SHELL.length)],
        size: 5 + Math.random() * 6, maxLife: 0.5 + Math.random() * 0.4,
        type: 'eggShell', shape: 'EGG_SHELL', rotation: Math.random() * Math.PI, vRot: (Math.random() - 0.5) * 12
      });
    }
  }

  spawnBubbles(x: number, y: number, count = 6): void {
    for (let i = 0; i < count; i++) {
      this.spawn({
        x: x + (Math.random() - 0.5) * 30, y, vx: (Math.random() - 0.5) * 40,
        vy: -40 - Math.random() * 60, ay: -50, drag: 0.97,
        color: PALETTE_WATER_BUBBLE[Math.floor(Math.random() * PALETTE_WATER_BUBBLE.length)],
        size: 6 + Math.random() * 8, maxLife: 0.8 + Math.random() * 0.8, type: 'bubble', shape: 'BUBBLE'
      });
    }
  }

  spawnConfetti(x: number, y: number, count = 25): void {
    for (let i = 0; i < count; i++) {
      const a = -Math.PI * 0.1 - Math.random() * Math.PI * 0.8, spd = 110 + Math.random() * 260;
      this.spawn({
        x, y, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd, ay: 230, drag: 0.96,
        color: PALETTE_CONFETTI[Math.floor(Math.random() * PALETTE_CONFETTI.length)],
        size: 6 + Math.random() * 6, maxLife: 1.3 + Math.random() * 0.9,
        type: 'confetti', shape: 'CONFETTI', rotation: Math.random() * Math.PI * 2, vRot: (Math.random() - 0.5) * 10
      });
    }
  }

  spawnSoapBubbles(x: number, y: number, count = 8): void {
    for (let i = 0; i < count; i++) {
      this.spawn({
        x: x + (Math.random() - 0.5) * 40, y: y + (Math.random() - 0.5) * 20,
        vx: (Math.random() - 0.5) * 35, vy: -20 - Math.random() * 30, ay: -15, drag: 0.98,
        color: PALETTE_SOAP_BUBBLE[Math.floor(Math.random() * PALETTE_SOAP_BUBBLE.length)],
        size: 10 + Math.random() * 12, maxLife: 1.8 + Math.random() * 1.2, type: 'soapBubble', shape: 'SOAP_BUBBLE'
      });
    }
  }

  spawnPancakeSyrup(x: number, y: number, count = 6): void {
    for (let i = 0; i < count; i++) {
      this.spawn({
        x: x + (Math.random() - 0.5) * 25, y, vx: (Math.random() - 0.5) * 30,
        vy: 20 + Math.random() * 80, ay: 650, drag: 0.99,
        color: PALETTE_SYRUP[Math.floor(Math.random() * PALETTE_SYRUP.length)],
        size: 4 + Math.random() * 5, maxLife: 0.6 + Math.random() * 0.4, type: 'pancakeSyrup', shape: 'PANCAKE_SYRUP'
      });
    }
  }

  spawnMudSplash(x: number, y: number, count = 20, isGolden = false): void {
    const pal = isGolden ? PALETTE_GOLDEN_MUD : PALETTE_MUD;
    for (let i = 0; i < count; i++) {
      const a = -Math.PI * (0.15 + Math.random() * 0.7), spd = 120 + Math.random() * 280;
      this.spawn({
        x: x + (Math.random() - 0.5) * 40, y: y + (Math.random() - 0.5) * 15,
        vx: Math.cos(a) * spd, vy: Math.sin(a) * spd, ay: 480, drag: 0.98,
        color: pal[Math.floor(Math.random() * pal.length)], size: 5 + Math.random() * 8,
        maxLife: 0.6 + Math.random() * 0.4, type: 'mudClod', shape: 'MUD_CLOD', vRot: (Math.random() - 0.5) * 6
      });
    }
  }

  spawnMudClods(x: number, y: number, count = 12, isGolden = false): void {
    this.spawnMudSplash(x, y, count, isGolden);
  }

  spawnSteam(x: number, y: number): void {
    this.spawn({
      x: x + (Math.random() - 0.5) * 20, y, vx: (Math.random() - 0.5) * 30,
      vy: -90 - Math.random() * 60, color: PALETTE.STEAM_WHITE,
      size: 12 + Math.random() * 10, maxLife: 0.7 + Math.random() * 0.3, type: 'steam', shape: 'CIRCLE'
    });
  }

  spawnScorePopup(x: number, y: number, text: string): void {
    this.spawn({ x, y, vx: 0, vy: -55, color: PALETTE.UI_GOLD, size: 20, maxLife: 0.9, type: 'text', shape: 'TEXT', text });
  }

  update(dt: number): void {
    for (let i = 0; i < this.maxParticles; i++) {
      const p = this.pool[i];
      if (!p.active) continue;
      p.life -= dt;
      if (p.life <= 0) { p.active = false; continue; }
      p.alpha = Math.max(0, p.life / p.maxLife);
      if (p.drag && p.drag !== 1) { const f = Math.pow(p.drag, dt * 60); p.vx *= f; p.vy *= f; }
      if (p.ax) p.vx += p.ax * dt;
      if (p.ay) p.vy += p.ay * dt;
      if (p.type === 'feather') p.vx += Math.sin(p.life * 8 + (p.phase || 0)) * 35 * dt;
      else if (p.type === 'confetti') p.scaleX = Math.cos(p.life * 10 + (p.phase || 0));
      else if (p.type === 'soapBubble' || p.type === 'bubble') p.vx += Math.sin(p.life * 5 + (p.phase || 0)) * 18 * dt;
      else if (p.type === 'sparkle') p.size = (p.initialSize || 5) * Math.sin((p.life / p.maxLife) * Math.PI);
      p.x += p.vx * dt; p.y += p.vy * dt;
      if (p.vRot) p.rotation = (p.rotation || 0) + p.vRot * dt;
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    for (let i = 0; i < this.maxParticles; i++) {
      const p = this.pool[i];
      if (!p.active) continue;
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.translate(p.x, p.y);
      if (p.rotation) ctx.rotate(p.rotation);
      if (p.type === 'feather' || p.shape === 'FEATHER') {
        ctx.fillStyle = p.color; ctx.strokeStyle = '#CFD8DC'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.ellipse(0, 0, p.size * 0.38, p.size, 0, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
      } else if (p.type === 'sparkle' || p.shape === 'STAR') {
        ctx.fillStyle = p.color; ctx.beginPath();
        for (let s = 0; s < 5; s++) {
          const a = (s * Math.PI * 2) / 5 - Math.PI / 2, r1 = p.size, r2 = p.size * 0.38;
          if (s === 0) ctx.moveTo(Math.cos(a) * r1, Math.sin(a) * r1);
          else ctx.lineTo(Math.cos(a) * r1, Math.sin(a) * r1);
          ctx.lineTo(Math.cos(a + Math.PI / 5) * r2, Math.sin(a + Math.PI / 5) * r2);
        }
        ctx.closePath(); ctx.fill();
      } else if (p.type === 'confetti' || p.shape === 'CONFETTI') {
        ctx.fillStyle = p.color; ctx.scale(p.scaleX ?? 1, 1);
        ctx.fillRect(-p.size * 0.6, -p.size * 0.35, p.size * 1.2, p.size * 0.7);
      } else if (p.type === 'soapBubble' || p.shape === 'SOAP_BUBBLE') {
        ctx.fillStyle = p.color; ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(0, 0, p.size, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#FFFFFF'; ctx.beginPath();
        ctx.arc(-p.size * 0.35, -p.size * 0.35, p.size * 0.22, 0, Math.PI * 2); ctx.fill();
      } else if (p.type === 'bubble' || p.shape === 'BUBBLE') {
        ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(0, 0, p.size, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'; ctx.beginPath();
        ctx.arc(-p.size * 0.3, -p.size * 0.3, p.size * 0.25, 0, Math.PI * 2); ctx.fill();
      } else if (p.type === 'pancakeSyrup' || p.shape === 'PANCAKE_SYRUP') {
        ctx.fillStyle = p.color; ctx.beginPath(); ctx.ellipse(0, 0, p.size * 0.6, p.size * 1.2, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#FFE082'; ctx.beginPath(); ctx.arc(-p.size * 0.15, -p.size * 0.3, p.size * 0.2, 0, Math.PI * 2); ctx.fill();
      } else if (p.type === 'eggShell' || p.shape === 'EGG_SHELL' || p.shape === 'SQUARE') {
        ctx.fillStyle = p.color; ctx.strokeStyle = PALETTE.EGG_OUTLINE; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(-p.size * 0.5, -p.size * 0.5); ctx.lineTo(p.size * 0.6, -p.size * 0.2);
        ctx.lineTo(p.size * 0.2, p.size * 0.6); ctx.lineTo(-p.size * 0.4, p.size * 0.3); ctx.closePath(); ctx.fill(); ctx.stroke();
      } else if (p.type === 'text' && p.text) {
        ctx.font = `bold ${p.size}px "Comic Sans MS", cursive, sans-serif`;
        ctx.fillStyle = p.color; ctx.strokeStyle = PALETTE.MUD_OUTLINE; ctx.lineWidth = 3;
        ctx.textAlign = 'center'; ctx.strokeText(p.text, 0, 0); ctx.fillText(p.text, 0, 0);
      } else {
        ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(0, 0, p.size, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
    }
    ctx.restore();
  }
}
