/**
 * Mode 17: Hungry Farmyard Friends - Canvas 2D Vector Renderer
 * Adventures of Trishu Preschool Suite
 * Strictly under 500 lines
 */

import { AnimalFeedingLogic } from './AnimalFeedingLogic';
import { SeatedAnimal, SnackItem, FlyingFood } from './types';
import { renderCharacter } from '../../graphics/characters';

export class AnimalFeedingRenderer {
  public render(
    ctx: CanvasRenderingContext2D,
    logic: AnimalFeedingLogic,
    w: number,
    h: number
  ): void {
    ctx.save();

    // 1. Background sky and grassy meadow
    this.renderBackground(ctx, w, h);

    // 2. Wooden dining table
    this.renderTable(ctx, logic, w, h);

    // 3. Seated animals with bibs and chew animations
    for (let i = 0; i < logic.animals.length; i++) {
      this.renderSeatedAnimal(ctx, logic.animals[i], i);
    }

    // 4. Bottom wooden snack tray
    this.renderSnackTray(ctx, logic, w, h);

    // 5. Snacks on tray
    for (const snack of logic.snacks) {
      this.renderSnack(ctx, snack);
    }

    // 6. Flying food in arc
    for (const food of logic.activeFlyingFood) {
      this.renderFlyingFood(ctx, food);
    }

    // 7. Toddler fed counter indicator
    this.renderStats(ctx, logic, w, h);

    ctx.restore();
  }

  private renderBackground(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    // Sky
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.65);
    skyGrad.addColorStop(0, '#B3E5FC');
    skyGrad.addColorStop(1, '#E1F5FE');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    // Rolling green hills
    ctx.fillStyle = '#81C784';
    ctx.beginPath();
    ctx.ellipse(w * 0.25, h * 0.55, w * 0.45, h * 0.22, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#66BB6A';
    ctx.beginPath();
    ctx.ellipse(w * 0.75, h * 0.58, w * 0.5, h * 0.24, 0, 0, Math.PI * 2);
    ctx.fill();

    // Foreground lawn
    const lawnGrad = ctx.createLinearGradient(0, h * 0.45, 0, h);
    lawnGrad.addColorStop(0, '#4CAF50');
    lawnGrad.addColorStop(1, '#388E3C');
    ctx.fillStyle = lawnGrad;
    ctx.fillRect(0, h * 0.46, w, h * 0.54);
  }

  private renderTable(
    ctx: CanvasRenderingContext2D,
    logic: AnimalFeedingLogic,
    w: number,
    h: number
  ): void {
    const isPortrait = h > w;
    const tableY = isPortrait ? h * 0.38 : h * 0.44;
    const tableH = h * 0.16;

    ctx.save();
    // Red-and-white checkered table runner
    ctx.fillStyle = '#FFF8E1';
    ctx.fillRect(w * 0.05, tableY, w * 0.9, tableH);

    // Wooden table edge
    ctx.fillStyle = '#8D6E63';
    ctx.beginPath();
    ctx.roundRect(w * 0.04, tableY, w * 0.92, 14, 7);
    ctx.fill();

    // Table cloth soft border
    ctx.fillStyle = '#EF5350';
    ctx.fillRect(w * 0.05, tableY + 14, w * 0.9, 8);
    ctx.restore();
  }

  private renderSeatedAnimal(
    ctx: CanvasRenderingContext2D,
    animal: SeatedAnimal,
    index: number
  ): void {
    ctx.save();
    ctx.translate(animal.x, animal.y);

    // Tummy rub wobble
    if (animal.tummyRubTimer > 0) {
      const wobble = Math.sin(animal.tummyRubTimer * 20) * 0.12;
      ctx.rotate(wobble);
      ctx.scale(1.08, 1.08);
    }

    // Chewing bounce
    if (animal.chewTimer > 0) {
      const chewBounce = Math.sin(animal.chewCycle) * 4;
      ctx.translate(0, chewBounce);
    }

    // Render character body
    const charW = animal.width;
    const charH = animal.height;
    renderCharacter(ctx, animal.id, -charW / 2, -charH / 2, charW, charH, {
      facingLeft: index === 2
    });

    // Render cute bib around neck
    const bibColors = ['#FFD54F', '#81D4FA', '#F48FB1'];
    ctx.fillStyle = bibColors[index % bibColors.length];
    ctx.beginPath();
    ctx.arc(0, charH * 0.12, 28, 0, Math.PI);
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Favorite food badge on bib
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const favEmoji = animal.favSnack === 'COOKIE' ? '🍪' : animal.favSnack === 'BERRY' ? '🍓' : '🥕';
    ctx.fillText(favEmoji, 0, charH * 0.14 + 10);

    // Open mouth / Anticipation indicator
    if (animal.mouthOpen > 0.1) {
      ctx.fillStyle = '#B71C1C';
      ctx.beginPath();
      ctx.ellipse(0, -charH * 0.06, 12 * animal.mouthOpen, 16 * animal.mouthOpen, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFCDD2';
      ctx.beginPath();
      ctx.ellipse(0, -charH * 0.06 + 6 * animal.mouthOpen, 8 * animal.mouthOpen, 6 * animal.mouthOpen, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Giggles / Hearts when tummy is rubbed
    if (animal.tummyRubTimer > 0) {
      ctx.font = '24px sans-serif';
      ctx.fillText('💖', -20, -charH * 0.5);
      ctx.fillText('✨', 22, -charH * 0.55);
    }

    ctx.restore();
  }

  private renderSnackTray(
    ctx: CanvasRenderingContext2D,
    logic: AnimalFeedingLogic,
    w: number,
    h: number
  ): void {
    const isPortrait = h > w;
    const trayY = isPortrait ? h * 0.77 : h * 0.74;
    const trayH = isPortrait ? h * 0.16 : h * 0.18;

    ctx.save();
    // Warm wood platter
    ctx.shadowColor = 'rgba(0,0,0,0.18)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 6;

    ctx.fillStyle = '#D7CCC8';
    ctx.beginPath();
    ctx.roundRect(w * 0.04, trayY, w * 0.92, trayH, 20);
    ctx.fill();

    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = '#8D6E63';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Wood grain accents
    ctx.strokeStyle = '#BCAAA4';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(w * 0.1, trayY + trayH * 0.3);
    ctx.lineTo(w * 0.9, trayY + trayH * 0.3);
    ctx.moveTo(w * 0.08, trayY + trayH * 0.7);
    ctx.lineTo(w * 0.92, trayY + trayH * 0.7);
    ctx.stroke();

    ctx.restore();
  }

  private renderSnack(ctx: CanvasRenderingContext2D, snack: SnackItem): void {
    ctx.save();
    ctx.translate(snack.x, snack.y);

    // Plate circle
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(0, 0, snack.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = snack.color;
    ctx.lineWidth = 4;
    ctx.stroke();

    // Emoji icon
    ctx.font = '32px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(snack.emoji, 0, 2);

    ctx.restore();
  }

  private renderFlyingFood(ctx: CanvasRenderingContext2D, food: FlyingFood): void {
    ctx.save();
    ctx.translate(food.currentX, food.currentY);
    ctx.rotate(food.rotation);

    // Glowing halo
    ctx.shadowColor = food.color;
    ctx.shadowBlur = 16;
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(0, 0, 28, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = '36px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(food.emoji, 0, 2);

    ctx.restore();
  }

  private renderStats(
    ctx: CanvasRenderingContext2D,
    logic: AnimalFeedingLogic,
    w: number,
    _h: number
  ): void {
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.beginPath();
    ctx.roundRect(w / 2 - 80, 16, 160, 44, 22);
    ctx.fill();
    ctx.strokeStyle = '#FFB300';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#E65100';
    ctx.font = 'bold 20px "Fredoka", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`🍎 Fed: ${logic.totalFed}`, w / 2, 38);
    ctx.restore();
  }
}
