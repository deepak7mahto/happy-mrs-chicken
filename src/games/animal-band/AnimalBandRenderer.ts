/**
 * Mode 18: Farmyard Animal Band - Canvas 2D Vector Renderer
 * Adventures of Trishu Preschool Suite
 * Strictly under 500 lines
 */

import { AnimalBandLogic } from './AnimalBandLogic';
import { BandMember, MusicNoteItem } from './types';
import { renderCharacter } from '../../graphics/characters';

export class AnimalBandRenderer {
  public render(
    ctx: CanvasRenderingContext2D,
    logic: AnimalBandLogic,
    w: number,
    h: number
  ): void {
    ctx.save();

    // 1. Stage backdrop & festive bunting
    this.renderStageBackdrop(ctx, w, h);

    // 2. Overhead spotlights
    this.renderSpotlights(ctx, logic, w, h);

    // 3. Wooden stage floor
    this.renderStageFloor(ctx, logic, w, h);

    // 4. Band members with their instruments
    for (let i = 0; i < logic.members.length; i++) {
      this.renderMember(ctx, logic.members[i]);
    }

    // 5. Floating musical note glyphs
    for (const note of logic.notes) {
      this.renderMusicNote(ctx, note);
    }

    // 6. Tutti button & stats
    this.renderTuttiButton(ctx, logic, w, h);

    ctx.restore();
  }

  private renderStageBackdrop(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    // Stage deep twilight backdrop
    const grad = ctx.createLinearGradient(0, 0, 0, h * 0.7);
    grad.addColorStop(0, '#283593');
    grad.addColorStop(1, '#5C6BC0');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Festive bunting flags across top
    const numFlags = 16;
    const flagW = w / numFlags;
    const flagColors = ['#FF5252', '#FFD740', '#69F0AE', '#40C4FF', '#E040FB'];

    ctx.save();
    for (let i = 0; i < numFlags; i++) {
      ctx.fillStyle = flagColors[i % flagColors.length];
      ctx.beginPath();
      ctx.moveTo(i * flagW, 0);
      ctx.lineTo((i + 1) * flagW, 0);
      ctx.lineTo((i + 0.5) * flagW, 26);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  private renderSpotlights(
    ctx: CanvasRenderingContext2D,
    logic: AnimalBandLogic,
    w: number,
    _h: number
  ): void {
    ctx.save();
    for (const member of logic.members) {
      const alpha = member.isBouncing || logic.isTuttiActive ? 0.32 : 0.12;
      const grad = ctx.createRadialGradient(member.x, member.y, 10, member.x, member.y, member.width * 1.2);
      grad.addColorStop(0, `rgba(255, 255, 220, ${alpha})`);
      grad.addColorStop(1, 'rgba(255, 255, 220, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(member.x, member.y, member.width * 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  private renderStageFloor(
    ctx: CanvasRenderingContext2D,
    logic: AnimalBandLogic,
    w: number,
    h: number
  ): void {
    const isPortrait = h > w;
    const floorY = isPortrait ? h * 0.54 : h * 0.62;

    ctx.save();
    // Warm stage wooden planks
    const floorGrad = ctx.createLinearGradient(0, floorY, 0, h);
    floorGrad.addColorStop(0, '#8D6E63');
    floorGrad.addColorStop(1, '#4E342E');
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, floorY, w, h - floorY);

    // Plank lines
    ctx.strokeStyle = '#6D4C41';
    ctx.lineWidth = 3;
    for (let y = floorY + 30; y < h; y += 36) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Footlight glowing bulbs
    const bulbCount = 12;
    for (let i = 0; i < bulbCount; i++) {
      const bx = (w / (bulbCount + 1)) * (i + 1);
      ctx.fillStyle = logic.isTuttiActive ? (i % 2 === 0 ? '#FFEB3B' : '#FF4081') : '#FFF9C4';
      ctx.beginPath();
      ctx.arc(bx, floorY - 6, 6, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  private renderMember(ctx: CanvasRenderingContext2D, member: BandMember): void {
    ctx.save();
    ctx.translate(member.x, member.y + member.hopY);

    // Bounce wobble scale
    if (member.isBouncing) {
      ctx.scale(1.08, 0.94);
    }

    const charW = member.width;
    const charH = member.height;

    // Draw character body
    renderCharacter(ctx, member.characterId, -charW / 2, -charH / 2, charW, charH);

    // Draw instrument in front of character
    this.renderInstrument(ctx, member);

    // Note name pill badge under character
    ctx.fillStyle = member.color;
    ctx.beginPath();
    ctx.roundRect(-22, charH * 0.42, 44, 24, 12);
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(member.noteName, 0, charH * 0.42 + 12);

    ctx.restore();
  }

  private renderInstrument(ctx: CanvasRenderingContext2D, member: BandMember): void {
    const charH = member.height;

    ctx.save();
    switch (member.instrument) {
      case 'xylophone': {
        // Rainbow xylophone bars
        const barColors = ['#F44336', '#FF9800', '#FFEB3B', '#4CAF50', '#2196F3'];
        const barW = 8;
        const totalW = barColors.length * 12;
        ctx.translate(-totalW / 2, charH * 0.15);
        for (let i = 0; i < barColors.length; i++) {
          ctx.fillStyle = barColors[i];
          const barH = 34 - i * 3;
          ctx.beginPath();
          ctx.roundRect(i * 12, -barH / 2, barW, barH, 4);
          ctx.fill();
        }
        break;
      }
      case 'drums': {
        // Red marching drum
        ctx.fillStyle = '#D32F2F';
        ctx.beginPath();
        ctx.roundRect(-24, charH * 0.08, 48, 28, 8);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.ellipse(0, charH * 0.08, 24, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'maracas': {
        // Two colorful maracas
        ctx.font = '24px sans-serif';
        ctx.fillText('🪇', -10, charH * 0.18);
        break;
      }
      case 'accordion': {
        // Squeaky accordion
        ctx.fillStyle = '#E53935';
        ctx.beginPath();
        ctx.roundRect(-22, charH * 0.08, 14, 26, 4);
        ctx.fill();
        ctx.fillStyle = '#1E88E5';
        ctx.beginPath();
        ctx.roundRect(8, charH * 0.08, 14, 26, 4);
        ctx.fill();
        // Pleated bellows
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(-8, charH * 0.1, 16, 22);
        break;
      }
      case 'bass': {
        // Golden brass tuba
        ctx.fillStyle = '#FFB300';
        ctx.beginPath();
        ctx.ellipse(14, charH * 0.04, 18, 24, 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFE082';
        ctx.beginPath();
        ctx.ellipse(22, charH * 0.02, 10, 14, 0.3, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
    }
    ctx.restore();
  }

  private renderMusicNote(ctx: CanvasRenderingContext2D, note: MusicNoteItem): void {
    ctx.save();
    ctx.globalAlpha = Math.max(0, note.alpha);
    ctx.font = `${Math.floor(28 * note.scale)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(note.glyph, note.x, note.y);
    ctx.restore();
  }

  private renderTuttiButton(
    ctx: CanvasRenderingContext2D,
    logic: AnimalBandLogic,
    w: number,
    h: number
  ): void {
    const isPortrait = h > w;
    const btnY = isPortrait ? h * 0.86 : h * 0.86;
    const btnW = 200;
    const btnH = 50;

    ctx.save();
    // Glowing Tutti button
    ctx.translate(w / 2, btnY);
    if (logic.isTuttiActive) {
      const pulse = 1.0 + Math.sin(logic.tuttiTimer * 10) * 0.08;
      ctx.scale(pulse, pulse);
    }

    ctx.shadowColor = 'rgba(255, 64, 129, 0.4)';
    ctx.shadowBlur = 14;

    const btnGrad = ctx.createLinearGradient(0, -btnH / 2, 0, btnH / 2);
    btnGrad.addColorStop(0, '#FF4081');
    btnGrad.addColorStop(1, '#C2185B');
    ctx.fillStyle = btnGrad;
    ctx.beginPath();
    ctx.roundRect(-btnW / 2, -btnH / 2, btnW, btnH, 25);
    ctx.fill();

    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 22px "Fredoka", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🎶 TUTTI! 🎺', 0, 2);

    ctx.restore();
  }
}
