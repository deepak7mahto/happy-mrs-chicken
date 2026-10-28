/**
 * Canvas 2D Renderer for Mode: Emojis
 * Adventures of Trishu Mini-Game Suite
 * Strictly under 500 lines
 */

import { EmojisLogic } from './EmojisLogic';
import { EmotionType } from './types';

export class EmojisRenderer {
  public render(ctx: CanvasRenderingContext2D, logic: EmojisLogic, w: number, h: number): void {
    ctx.save();
    this.renderBackground(ctx, w, h, logic.currentEmotion);
    this.renderEmotionStage(ctx, logic);
    this.renderMajorButtons(ctx, logic);
    this.renderSmallEmojiTray(ctx, logic, w, h);
    this.renderBouncingEmojis(ctx, logic);
    this.renderSparkles(ctx, logic);
    this.renderHUD(ctx, logic, w, h);
    ctx.restore();
  }

  private renderBackground(ctx: CanvasRenderingContext2D, w: number, h: number, emotion: EmotionType): void {
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    if (emotion === 'HAPPY') {
      bg.addColorStop(0, '#FFFDE7'); bg.addColorStop(1, '#FFF59D');
    } else if (emotion === 'SAD') {
      bg.addColorStop(0, '#E1F5FE'); bg.addColorStop(1, '#B3E5FC');
    } else if (emotion === 'ANGRY') {
      bg.addColorStop(0, '#FFEBEE'); bg.addColorStop(1, '#FFCDD2');
    } else {
      bg.addColorStop(0, '#F3E5F5'); bg.addColorStop(1, '#E1BEE7');
    }
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // Soft floating circles
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    const t = Date.now() * 0.001;
    for (let i = 0; i < 5; i++) {
      const bx = (w * (i * 0.2 + 0.1) + Math.sin(t + i) * 18) % w;
      const by = (h * (i * 0.18 + 0.1) + Math.cos(t * 0.8 + i) * 12) % h;
      ctx.beginPath();
      ctx.arc(bx, by, 32 + i * 8, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  private renderEmotionStage(ctx: CanvasRenderingContext2D, logic: EmojisLogic): void {
    const cx = logic.stageCenterX;
    const cy = logic.stageCenterY;
    const r = logic.stageRadius;
    const t = logic.emotionTimer;
    const react = logic.emotionReactionTimer;

    ctx.save();
    // Spotlight pedestal
    const spot = ctx.createRadialGradient(cx, cy, r * 0.2, cx, cy, r * 1.5);
    spot.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    spot.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = spot;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Ground shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + r * 1.05, r * 0.95, r * 0.22, 0, 0, Math.PI * 2);
    ctx.fill();

    // Squash & stretch reaction
    const squash = 1.0 + Math.sin(t * 6) * 0.04 + react * 0.22;
    const stretch = 1.0 - Math.sin(t * 6) * 0.04 - react * 0.14;
    const jumpY = Math.abs(Math.sin(t * 5)) * 6 + (react > 0 ? Math.sin(react * Math.PI) * 14 : 0);

    ctx.translate(cx, cy - jumpY);
    ctx.scale(squash, stretch);

    // Head base
    const base = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r);
    if (logic.currentEmotion === 'ANGRY') {
      base.addColorStop(0, '#FFE082'); base.addColorStop(0.5, '#FF8A65'); base.addColorStop(1, '#E64A19');
    } else if (logic.currentEmotion === 'SAD') {
      base.addColorStop(0, '#FFF9C4'); base.addColorStop(0.5, '#FFE082'); base.addColorStop(1, '#81D4FA');
    } else {
      base.addColorStop(0, '#FFF59D'); base.addColorStop(0.65, '#FDD835'); base.addColorStop(1, '#F57F17');
    }

    ctx.fillStyle = base;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = logic.currentEmotion === 'ANGRY' ? '#BF360C' : '#F57F17';
    ctx.lineWidth = 3.5;
    ctx.stroke();

    // Specular highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.beginPath();
    ctx.ellipse(-r * 0.32, -r * 0.38, r * 0.25, r * 0.13, -Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();

    // Expressions
    if (logic.currentEmotion === 'HAPPY') this.renderHappy(ctx, r, t);
    else if (logic.currentEmotion === 'SAD') this.renderSad(ctx, r, t);
    else if (logic.currentEmotion === 'ANGRY') this.renderAngry(ctx, r, t);
    else this.renderSurprise(ctx, r, t);

    ctx.restore();
  }

  private renderHappy(ctx: CanvasRenderingContext2D, r: number, t: number): void {
    // Blushing cheeks
    ctx.fillStyle = `rgba(255, 64, 129, ${0.45 + Math.sin(t * 4) * 0.15})`;
    ctx.beginPath();
    ctx.ellipse(-r * 0.52, r * 0.18, r * 0.2, r * 0.12, 0, 0, Math.PI * 2);
    ctx.ellipse(r * 0.52, r * 0.18, r * 0.2, r * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Arch Smiling Eyes
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(-r * 0.36, -r * 0.1, r * 0.22, Math.PI * 1.15, Math.PI * 1.85);
    if (Math.sin(t * 1.8) > 0.85) {
      ctx.moveTo(r * 0.18, -r * 0.05); ctx.lineTo(r * 0.54, -r * 0.05);
    } else {
      ctx.moveTo(r * 0.58, -r * 0.1);
      ctx.arc(r * 0.36, -r * 0.1, r * 0.22, Math.PI * 1.15, Math.PI * 1.85);
    }
    ctx.stroke();

    // Big smile + tongue
    ctx.fillStyle = '#C2185B';
    ctx.beginPath();
    ctx.arc(0, r * 0.12, r * 0.44, 0.1, Math.PI - 0.1);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#FF80AB';
    ctx.beginPath();
    ctx.arc(0, r * 0.38, r * 0.22, 0, Math.PI);
    ctx.fill();
  }

  private renderSad(ctx: CanvasRenderingContext2D, r: number, t: number): void {
    ctx.fillStyle = '#3E2723';
    ctx.beginPath();
    ctx.ellipse(-r * 0.35, -r * 0.12, r * 0.16, r * 0.22, 0.1, 0, Math.PI * 2);
    ctx.ellipse(r * 0.35, -r * 0.12, r * 0.16, r * 0.22, -0.1, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(-r * 0.38, -r * 0.18, r * 0.06, 0, Math.PI * 2);
    ctx.arc(r * 0.32, -r * 0.18, r * 0.06, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#4E342E';
    ctx.lineWidth = 4.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-r * 0.52, -r * 0.42);
    ctx.quadraticCurveTo(-r * 0.35, -r * 0.32, -r * 0.18, -r * 0.38);
    ctx.moveTo(r * 0.18, -r * 0.38);
    ctx.quadraticCurveTo(r * 0.35, -r * 0.32, r * 0.52, -r * 0.42);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, r * 0.48 + Math.sin(t * 12) * 2, r * 0.28, Math.PI * 1.25, Math.PI * 1.75);
    ctx.stroke();

    // Tears
    const tearY = (t * 70) % (r * 0.7);
    ctx.fillStyle = '#03A9F4';
    ctx.beginPath();
    ctx.arc(-r * 0.42, r * 0.12 + tearY, 6, 0, Math.PI * 2);
    ctx.arc(r * 0.42, r * 0.18 + ((t * 70 + 20) % (r * 0.7)), 6, 0, Math.PI * 2);
    ctx.fill();
  }

  private renderAngry(ctx: CanvasRenderingContext2D, r: number, t: number): void {
    ctx.strokeStyle = '#212121';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-r * 0.55, -r * 0.45); ctx.lineTo(-r * 0.14, -r * 0.22);
    ctx.moveTo(r * 0.55, -r * 0.45); ctx.lineTo(r * 0.14, -r * 0.22);
    ctx.stroke();

    ctx.fillStyle = '#212121';
    ctx.beginPath();
    ctx.ellipse(-r * 0.32, -r * 0.08, r * 0.15, r * 0.16, -0.2, 0, Math.PI * 2);
    ctx.ellipse(r * 0.32, -r * 0.08, r * 0.15, r * 0.16, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Shaking mouth
    ctx.save();
    ctx.translate(Math.sin(t * 30) * 2, 0);
    ctx.fillStyle = '#D32F2F';
    ctx.beginPath();
    ctx.roundRect(-r * 0.35, r * 0.24, r * 0.7, r * 0.24, 6);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-r * 0.3, r * 0.36); ctx.lineTo(r * 0.3, r * 0.36);
    ctx.stroke();
    ctx.restore();

    // Steam puffs
    ctx.fillStyle = `rgba(255, 255, 255, ${0.7 + Math.sin(t * 8) * 0.25})`;
    ctx.beginPath();
    ctx.arc(-r * 1.05, -r * 0.35, 12, 0, Math.PI * 2);
    ctx.arc(-r * 1.25, -r * 0.5, 16, 0, Math.PI * 2);
    ctx.arc(r * 1.05, -r * 0.35, 12, 0, Math.PI * 2);
    ctx.arc(r * 1.25, -r * 0.5, 16, 0, Math.PI * 2);
    ctx.fill();
  }

  private renderSurprise(ctx: CanvasRenderingContext2D, r: number, t: number): void {
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(-r * 0.35, -r * 0.42, r * 0.24, Math.PI * 1.2, Math.PI * 1.8);
    ctx.arc(r * 0.35, -r * 0.42, r * 0.24, Math.PI * 1.2, Math.PI * 1.8);
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(-r * 0.35, -r * 0.1, r * 0.24, 0, Math.PI * 2);
    ctx.arc(r * 0.35, -r * 0.1, r * 0.24, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    const pupil = r * 0.11 + Math.sin(t * 10) * (r * 0.02);
    ctx.fillStyle = '#212121';
    ctx.beginPath();
    ctx.arc(-r * 0.35, -r * 0.1, pupil, 0, Math.PI * 2);
    ctx.arc(r * 0.35, -r * 0.1, pupil, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#3E2723';
    ctx.beginPath();
    ctx.ellipse(0, r * 0.36, r * 0.19, r * 0.26, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  private renderMajorButtons(ctx: CanvasRenderingContext2D, logic: EmojisLogic): void {
    for (const btn of logic.majorButtons) {
      const isActive = logic.currentEmotion === btn.id;
      ctx.save();
      const cx = btn.x + btn.w * 0.5;
      const cy = btn.y + btn.h * 0.5;
      ctx.translate(cx, cy);

      const idle = Math.sin(btn.pulseTimer) * 0.03;
      const scale = btn.scale * (isActive ? 1.05 + idle : 1.0 + idle);
      ctx.scale(scale, scale);

      // Card shadow & body
      ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
      ctx.beginPath();
      ctx.roundRect(-btn.w * 0.5, -btn.h * 0.5 + 4, btn.w, btn.h, 16);
      ctx.fill();

      ctx.fillStyle = isActive ? btn.activeColor : btn.color;
      ctx.beginPath();
      ctx.roundRect(-btn.w * 0.5, -btn.h * 0.5, btn.w, btn.h, 16);
      ctx.fill();
      ctx.strokeStyle = isActive ? btn.borderColor : 'rgba(0, 0, 0, 0.12)';
      ctx.lineWidth = isActive ? 3.5 : 2;
      ctx.stroke();

      // Icon & Labels
      ctx.font = '28px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const offX = -btn.w * 0.28;
      ctx.fillText(btn.emoji, offX, 1);

      ctx.textAlign = 'left';
      ctx.font = 'bold 16px "Fredoka", sans-serif';
      ctx.fillStyle = '#212121';
      ctx.fillText(btn.label, offX + 22, -6);
      ctx.font = '10px "Fredoka", sans-serif';
      ctx.fillStyle = '#616161';
      ctx.fillText(btn.subLabel, offX + 22, 10);
      ctx.restore();
    }
  }

  private renderSmallEmojiTray(ctx: CanvasRenderingContext2D, logic: EmojisLogic, w: number, h: number): void {
    ctx.save();
    const isPortrait = h > w;
    const trayY = isPortrait ? h * 0.72 : h * 0.82;
    const trayH = isPortrait ? h * 0.25 : h * 0.16;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.82)';
    ctx.beginPath();
    ctx.roundRect(14, trayY, w - 28, trayH, 20);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    for (const item of logic.smallEmojis) {
      ctx.save();
      ctx.translate(item.x, item.y);
      ctx.scale(item.scale, item.scale);

      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(0, 0, item.size * 0.48, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.font = `${Math.round(item.size * 0.58)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(item.emoji, 0, 1);
      ctx.restore();
    }
    ctx.restore();
  }

  private renderBouncingEmojis(ctx: CanvasRenderingContext2D, logic: EmojisLogic): void {
    for (const e of logic.bouncingEntities) {
      ctx.save();
      ctx.translate(e.x, e.y);
      ctx.rotate(e.rotation);
      ctx.scale(e.scale, e.scale);
      ctx.globalAlpha = e.alpha;
      ctx.font = '36px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(e.emoji, 0, 0);
      ctx.restore();
    }
  }

  private renderSparkles(ctx: CanvasRenderingContext2D, logic: EmojisLogic): void {
    for (const p of logic.sparkles) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.globalAlpha = p.alpha;
      if (p.symbol) {
        ctx.font = `${Math.round(p.size)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.symbol, 0, 0);
      } else {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  private renderHUD(ctx: CanvasRenderingContext2D, logic: EmojisLogic, _w: number, _h: number): void {
    ctx.save();
    // Title
    ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
    ctx.beginPath();
    ctx.roundRect(16, 14, 140, 38, 14);
    ctx.roundRect(166, 14, 120, 38, 14);
    ctx.fill();
    ctx.strokeStyle = '#FBC02D';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = 'bold 17px "Fredoka", sans-serif';
    ctx.fillStyle = '#E65100';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Emojis ✨', 86, 33);

    ctx.font = 'bold 15px "Fredoka", sans-serif';
    ctx.fillStyle = '#F57F17';
    ctx.fillText(`⭐ ${logic.score}`, 226, 33);

    // Party Button
    ctx.save();
    const px = logic.partyBtnX + logic.partyBtnW * 0.5;
    const py = logic.partyBtnY + logic.partyBtnH * 0.5;
    ctx.translate(px, py);
    ctx.scale(logic.partyScale, logic.partyScale);
    ctx.fillStyle = '#FF4081';
    ctx.beginPath();
    ctx.roundRect(-logic.partyBtnW * 0.5, -logic.partyBtnH * 0.5, logic.partyBtnW, logic.partyBtnH, 14);
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = 'bold 14px "Fredoka", sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🎉 Party!', 0, 1);
    ctx.restore();

    ctx.restore();
  }
}
