/**
 * Mode 12: Grandpa's Little Train
 * Adventures of Trishu Mini-Game Suite
 * Strictly under 500 Lines of Code
 */

import { BaseScene } from '../base/BaseScene';
import { GameEngine } from '../../engine/GameEngine';
import { InputManager } from '../../engine/InputManager';
import { DisplayManager } from '../../engine/DisplayManager';
import { soundEngine } from '../../engine/SoundEngine';
import { Haptics } from '../../engine/Haptics';
import { drawGrandpa, drawTrishu, drawMimi, drawLeo, drawBabyChick } from '../../graphics/characters';

interface PassengerStation {
  x: number;
  type: 'mimi' | 'trishu' | 'leo' | 'chick';
  pickedUp: boolean;
}

export class LittleTrainScene extends BaseScene {
  public time: number = 0;
  private trainX: number = 0;
  private trainSpeed: number = 110;
  private whistleTimer: number = 0;
  private passengers: Array<'mimi' | 'trishu' | 'leo' | 'chick'> = [];
  private stations: PassengerStation[] = [];
  private steamPuffs: Array<{ x: number; y: number; radius: number; life: number }> = [];

  constructor(game: GameEngine) {
    super(game);
  }

  enter(): void {
    this.score = 0;
    this.trainX = 0;
    this.trainSpeed = 110;
    this.whistleTimer = 0;
    this.passengers = ['trishu'];
    this.steamPuffs = [];
    this.initStations();
    soundEngine.unlock();
  }

  private initStations(): void {
    this.stations = [
      { x: 450, type: 'mimi', pickedUp: false },
      { x: 950, type: 'leo', pickedUp: false },
      { x: 1450, type: 'chick', pickedUp: false },
      { x: 1950, type: 'mimi', pickedUp: false },
      { x: 2450, type: 'chick', pickedUp: false }
    ];
  }

  blowWhistle(): void {
    soundEngine.playSFX('whoosh');
    soundEngine.playSFX('toddlerGiggle');
    Haptics.medium();
    this.whistleTimer = 0.8;
    this.trainSpeed = 190;
    this.score += 15;
    this.game.storage.saveHighScore('littleTrain', this.score);

    // Spawn massive steam puffs
    const vHeight = this.game.display.vHeight;
    const trainScreenX = 170;
    const smokestackY = vHeight - 165;
    for (let i = 0; i < 4; i++) {
      this.steamPuffs.push({
        x: trainScreenX - i * 15,
        y: smokestackY - i * 8,
        radius: 16 + i * 6,
        life: 1.0
      });
    }
  }

  update(dt: number, input: InputManager): void {
    this.time += dt;

    if (this.whistleTimer > 0) {
      this.whistleTimer -= dt;
      if (this.whistleTimer <= 0) {
        this.trainSpeed = 110;
      }
    }

    this.trainX += this.trainSpeed * dt;

    // Periodic gentle steam puff
    if (Math.random() < dt * 4) {
      const vHeight = this.game.display.vHeight;
      this.steamPuffs.push({
        x: 170,
        y: vHeight - 165,
        radius: 14,
        life: 1.0
      });
    }

    // Update steam puffs
    for (let i = this.steamPuffs.length - 1; i >= 0; i--) {
      const p = this.steamPuffs[i];
      p.x -= 80 * dt;
      p.y -= 35 * dt;
      p.radius += 18 * dt;
      p.life -= dt * 1.1;
      if (p.life <= 0) {
        this.steamPuffs.splice(i, 1);
      }
    }

    // Check station pickups
    for (const st of this.stations) {
      if (!st.pickedUp && this.trainX >= st.x) {
        st.pickedUp = true;
        this.passengers.push(st.type);
        this.score += 50;
        this.game.storage.saveHighScore('littleTrain', this.score);
        soundEngine.playSFX('fanfare');
        soundEngine.playSFX('bunnySqueak');
        Haptics.success();

        const vHeight = this.game.display.vHeight;
        this.game.particles.spawnSparkles(220, vHeight - 140, 12);
      }
    }

    // Loop stations when train travels far
    if (this.trainX > 2800) {
      this.trainX = 0;
      for (const st of this.stations) {
        st.pickedUp = false;
      }
    }

    if (input.actionJustReleased) {
      this.blowWhistle();
    }
  }

  render(ctx: CanvasRenderingContext2D, _alpha: number, display: DisplayManager): void {
    const vWidth = display.vWidth;
    const vHeight = display.vHeight;
    const trackY = vHeight - 90;

    // Sky and Hills with parallax
    ctx.save();
    ctx.fillStyle = '#81D4FA';
    ctx.fillRect(0, 0, vWidth, vHeight);

    // Sun
    ctx.fillStyle = '#FFEE58';
    ctx.beginPath();
    ctx.arc(vWidth - 80, 80, 42, 0, Math.PI * 2);
    ctx.fill();

    // Far green hills (parallax)
    const hillOff = (this.trainX * 0.2) % vWidth;
    ctx.fillStyle = '#81C784';
    ctx.beginPath();
    ctx.arc(vWidth * 0.3 - hillOff, vHeight - 70, 220, Math.PI, 0);
    ctx.arc(vWidth * 0.9 - hillOff, vHeight - 70, 260, Math.PI, 0);
    ctx.arc(vWidth * 1.5 - hillOff, vHeight - 70, 240, Math.PI, 0);
    ctx.fill();

    // Near Green Ground
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(0, trackY, vWidth, vHeight - trackY);

    // Railroad Track Sleepers & Rails
    ctx.fillStyle = '#795548';
    for (let x = -(this.trainX % 30); x < vWidth + 30; x += 30) {
      ctx.fillRect(x, trackY + 8, 14, 16);
    }
    // Rails
    ctx.fillStyle = '#9E9E9E';
    ctx.fillRect(0, trackY + 10, vWidth, 4);
    ctx.fillRect(0, trackY + 20, vWidth, 4);
    ctx.restore();

    // Upcoming Station Platforms
    for (const st of this.stations) {
      const screenX = st.x - this.trainX + 170;
      if (screenX > -100 && screenX < vWidth + 100) {
        ctx.save();
        // Station Sign & Bench
        ctx.fillStyle = '#FFF59D';
        ctx.strokeStyle = '#FBC02D';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect(screenX - 30, trackY - 45, 60, 22, 6);
        ctx.fill();
        ctx.stroke();

        ctx.font = 'bold 11px "Comic Sans MS", sans-serif';
        ctx.fillStyle = '#F57F17';
        ctx.textAlign = 'center';
        ctx.fillText('STATION', screenX, trackY - 30);

        if (!st.pickedUp) {
          if (st.type === 'mimi') {
            drawMimi(ctx, screenX, trackY - 10, 0.35, { hopY: Math.abs(Math.sin(this.time * 6)) * 8, earFlap: 0.2 });
          } else if (st.type === 'leo') {
            drawLeo(ctx, screenX, trackY - 10, 0.35, { jumpY: Math.abs(Math.sin(this.time * 5)) * 6 });
          } else if (st.type === 'chick') {
            drawBabyChick(ctx, screenX, trackY - 5, 0.6, { isPeeping: true, walkCycle: this.time * 8 });
          }
        }
        ctx.restore();
      }
    }

    // Steam Puffs
    for (const p of this.steamPuffs) {
      ctx.save();
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, p.life * 0.85)})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Train Carriages (Behind Engine)
    const trainBaseX = 170;
    const trainBaseY = trackY + 5;
    const carriageCount = Math.min(3, Math.max(1, this.passengers.length));

    for (let c = carriageCount; c >= 1; c--) {
      const carX = trainBaseX - c * 95;
      ctx.save();
      // Carriage coupling
      ctx.fillStyle = '#424242';
      ctx.fillRect(carX + 75, trainBaseY - 15, 25, 6);

      // Carriage Body
      ctx.fillStyle = c === 1 ? '#42A5F5' : '#AB47BC';
      ctx.strokeStyle = c === 1 ? '#1565C0' : '#6A1B9A';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.roundRect(carX, trainBaseY - 50, 80, 42, 8);
      ctx.fill();
      ctx.stroke();

      // Carriage Wheels
      ctx.fillStyle = '#212121';
      ctx.strokeStyle = '#BDBDBD';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(carX + 18, trainBaseY - 4, 12, 0, Math.PI * 2);
      ctx.arc(carX + 62, trainBaseY - 4, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Draw passenger inside
      const pass = this.passengers[c - 1];
      if (pass === 'trishu') {
        drawTrishu(ctx, carX + 40, trainBaseY - 45, 0.32, { armWave: Math.sin(this.time * 6) * 0.2 });
      } else if (pass === 'mimi') {
        drawMimi(ctx, carX + 40, trainBaseY - 45, 0.32, { hopY: 0 });
      } else if (pass === 'leo') {
        drawLeo(ctx, carX + 40, trainBaseY - 45, 0.32, { holdingDino: true });
      } else if (pass === 'chick') {
        drawBabyChick(ctx, carX + 40, trainBaseY - 40, 0.5, { isPeeping: true });
      }
      ctx.restore();
    }

    // Engine Locomotive
    ctx.save();
    // Engine Body
    ctx.fillStyle = '#E53935';
    ctx.strokeStyle = '#B71C1C';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.roundRect(trainBaseX, trainBaseY - 60, 95, 52, [12, 20, 4, 4]);
    ctx.fill();
    ctx.stroke();

    // Engine Cab Roof
    ctx.fillStyle = '#FFCA28';
    ctx.beginPath();
    ctx.roundRect(trainBaseX - 5, trainBaseY - 65, 55, 10, 5);
    ctx.fill();

    // Smokestack
    ctx.fillStyle = '#424242';
    ctx.fillRect(trainBaseX + 68, trainBaseY - 82, 16, 26);
    ctx.fillStyle = '#FFD54F';
    ctx.beginPath();
    ctx.ellipse(trainBaseX + 76, trainBaseY - 82, 12, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Golden Cowcatcher on Front
    ctx.fillStyle = '#FFA000';
    ctx.beginPath();
    ctx.moveTo(trainBaseX + 95, trainBaseY - 10);
    ctx.lineTo(trainBaseX + 115, trainBaseY - 2);
    ctx.lineTo(trainBaseX + 95, trainBaseY - 2);
    ctx.closePath();
    ctx.fill();

    // Engine Wheels
    ctx.fillStyle = '#212121';
    ctx.strokeStyle = '#FFF';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(trainBaseX + 22, trainBaseY - 6, 16, 0, Math.PI * 2);
    ctx.arc(trainBaseX + 58, trainBaseY - 6, 16, 0, Math.PI * 2);
    ctx.arc(trainBaseX + 85, trainBaseY - 6, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Driver: Grandpa in Cab
    drawGrandpa(ctx, trainBaseX + 22, trainBaseY - 55, 0.35, {
      pullTension: 0,
      eyeBlink: Math.sin(this.time * 2) > 0.85
    });
    ctx.restore();

    // Whistle Callout
    if (this.whistleTimer > 0) {
      ctx.save();
      ctx.font = '900 32px "Comic Sans MS", cursive, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#FF6F00';
      ctx.fillText('TOOT! TOOT! 🚂💨', trainBaseX + 75, trainBaseY - 105);
      ctx.restore();
    }

    // Top HUD
    ctx.save();
    ctx.font = 'bold 18px "Comic Sans MS", sans-serif';
    ctx.fillStyle = '#1565C0';
    ctx.textAlign = 'left';
    ctx.fillText(`🚂 Passengers: ${this.passengers.length}`, 22, 38);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#D81B60';
    ctx.fillText(`★ Score: ${this.score}`, vWidth - 22, 38);
    ctx.restore();
  }
}
