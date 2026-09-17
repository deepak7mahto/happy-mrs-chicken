/**
 * Mode 12: Grandpa's Little Train - Pure Game Logic
 * Adventures of Trishu Mini-Game Suite
 */

import { PassengerStation, PassengerType, SteamPuff } from './types';

export class LittleTrainLogic {
  public time: number = 0;
  public trainX: number = 0;
  public trainSpeed: number = 110;
  public whistleTimer: number = 0;
  public passengers: PassengerType[] = [];
  public stations: PassengerStation[] = [];
  public steamPuffs: SteamPuff[] = [];
  public score: number = 0;
  public throttleLevel: 1 | 2 | 3 = 2;
  public isInTunnel: boolean = false;
  public tunnelBonusGiven: boolean = false;

  public reset(): void {
    this.score = 0;
    this.trainX = 0;
    this.trainSpeed = 110;
    this.throttleLevel = 2;
    this.isInTunnel = false;
    this.tunnelBonusGiven = false;
    this.whistleTimer = 0;
    this.passengers = ['trishu'];
    this.steamPuffs = [];
    this.time = 0;
    this.initStations();
  }

  public cycleThrottle(): number {
    this.throttleLevel = ((this.throttleLevel % 3) + 1) as 1 | 2 | 3;
    return this.throttleLevel;
  }

  public initStations(): void {
    this.stations = [
      { x: 450, type: 'mimi', pickedUp: false },
      { x: 950, type: 'leo', pickedUp: false },
      { x: 1450, type: 'chick', pickedUp: false },
      { x: 1950, type: 'mimi', pickedUp: false },
      { x: 2450, type: 'chick', pickedUp: false }
    ];
  }

  public blowWhistle(vHeight: number): SteamPuff[] {
    this.whistleTimer = 0.8;
    this.trainSpeed = 190;
    this.score += 15;

    const trainScreenX = 170;
    const smokestackY = vHeight - 165;
    const newPuffs: SteamPuff[] = [];

    for (let i = 0; i < 4; i++) {
      const puff: SteamPuff = {
        x: trainScreenX - i * 15,
        y: smokestackY - i * 8,
        radius: 16 + i * 6,
        life: 1.0
      };
      this.steamPuffs.push(puff);
      newPuffs.push(puff);
    }
    return newPuffs;
  }

  public update(dt: number, vHeight: number): { pickedUpPassenger?: PassengerType; enteredTunnel?: boolean } {
    this.time += dt;

    const baseSpeed = this.throttleLevel === 1 ? 75 : this.throttleLevel === 2 ? 115 : 190;
    if (this.whistleTimer > 0) {
      this.whistleTimer -= dt;
      this.trainSpeed = 220;
    } else {
      this.trainSpeed = baseSpeed;
    }

    this.trainX += this.trainSpeed * dt;

    // Mountain tunnel detection (between 1600 and 1920)
    const wasInTunnel = this.isInTunnel;
    this.isInTunnel = (this.trainX >= 1600 && this.trainX <= 1920);
    let enteredTunnel = false;
    if (this.isInTunnel && !wasInTunnel && !this.tunnelBonusGiven) {
      this.tunnelBonusGiven = true;
      this.score += 30;
      enteredTunnel = true;
    }

    // Periodic steam puffs scaled by speed
    const puffChance = dt * (this.throttleLevel === 3 ? 8 : 4);
    if (Math.random() < puffChance) {
      this.steamPuffs.push({
        x: 170,
        y: vHeight - 165,
        radius: this.throttleLevel === 3 ? 18 : 14,
        life: 1.0
      });
    }

    // Update steam puffs
    for (let i = this.steamPuffs.length - 1; i >= 0; i--) {
      const p = this.steamPuffs[i];
      p.x -= (this.trainSpeed * 0.6) * dt;
      p.y -= 35 * dt;
      p.radius += 18 * dt;
      p.life -= dt * 1.1;
      if (p.life <= 0) {
        this.steamPuffs.splice(i, 1);
      }
    }

    // Check station pickups
    let pickedUpPassenger: PassengerType | undefined;
    for (const st of this.stations) {
      if (!st.pickedUp && this.trainX >= st.x) {
        st.pickedUp = true;
        this.passengers.push(st.type);
        this.score += 50;
        pickedUpPassenger = st.type;
        break;
      }
    }

    // Loop stations when train travels far
    if (this.trainX > 2800) {
      this.trainX = 0;
      this.tunnelBonusGiven = false;
      for (const st of this.stations) {
        st.pickedUp = false;
      }
    }

    return { pickedUpPassenger, enteredTunnel };
  }
}
