/**
 * 3D Muddy Kart Headless Simulation & Physics
 * Adventures of Trishu - Mode 17
 * Strictly under 500 Lines of Code
 */

import { KartPlayer, RaceSessionStats, RoadProp, TrackSegment } from './types';
import { typesafeRacing } from './typesafeRacing';

export const SEGMENT_LENGTH = 200;
export const ROAD_WIDTH = 2000;
export const CAMERA_HEIGHT = 1000;
export const CAMERA_DEPTH = 0.84; // 1 / Math.tan((fieldOfView/2) * Math.PI/180)
export const TOTAL_SEGMENTS = 300;

export class MuddyKartLogic {
  public segments: TrackSegment[] = [];
  public player: KartPlayer;
  public stats: RaceSessionStats;
  public trackLength: number = 0;
  private offRoadTime: number = 0;
  private steerJitterCount: number = 0;
  private lastSteerSign: number = 0;

  // Events emitted for Scene to trigger SFX and Particles
  public onMudSplash?: (x: number, y: number) => void;
  public onStarCollect?: (x: number, y: number, combo: number) => void;
  public onBoostRamp?: () => void;
  public onHayBaleBump?: () => void;
  public onLapComplete?: (lap: number) => void;

  constructor() {
    this.player = this.createDefaultPlayer();
    this.stats = this.createDefaultStats();
    this.buildTrack();
  }

  public reset(): void {
    this.player = this.createDefaultPlayer();
    this.stats = this.createDefaultStats();
    this.offRoadTime = 0;
    this.steerJitterCount = 0;
    this.lastSteerSign = 0;

    // Reset collectibles on track
    for (const segment of this.segments) {
      for (const prop of segment.props) {
        prop.collected = false;
      }
    }
  }

  private createDefaultPlayer(): KartPlayer {
    return {
      x: 0,
      z: 0,
      speed: 0,
      maxSpeed: 7200,
      steer: 0,
      airY: 0,
      airVy: 0,
      turboTimer: 0,
      mudTimer: 0,
      bumpTimer: 0,
      distance: 0,
      lap: 1
    };
  }

  private createDefaultStats(): RaceSessionStats {
    return {
      score: 0,
      starsCollected: 0,
      mudSplashes: 0,
      combo: 1,
      maxCombo: 1,
      offRoadCount: 0,
      boostCount: 0,
      elapsedTime: 0,
      titleAwarded: ''
    };
  }

  private buildTrack(): void {
    this.segments = [];
    let curY = 0;

    for (let i = 0; i < TOTAL_SEGMENTS; i++) {
      let curve = 0;
      // Gentle curve design suited for toddlers
      if (i > 40 && i < 80) curve = 2.5;         // Turn right
      else if (i > 100 && i < 140) curve = -2.8; // Turn left
      else if (i > 160 && i < 210) curve = 3.2;  // Gentle S-curve right
      else if (i > 220 && i < 260) curve = -2.5; // Gentle S-curve left

      // Gentle rolling hill
      if (i > 50 && i < 90) curY += 15;
      else if (i > 90 && i < 130) curY -= 15;

      const isEven = Math.floor(i / 3) % 2 === 0;
      const colors = {
        road: isEven ? '#616161' : '#545454',
        grass: isEven ? '#7CB342' : '#8BC34A',
        rumble: isEven ? '#E53935' : '#FFFFFF',
        lane: isEven ? '#FFF176' : '#545454'
      };

      const props: RoadProp[] = [];

      // Add roadside scenery
      if (i % 8 === 0) {
        props.push({ id: i * 10 + 1, type: 'TREE', offset: -1.6, collected: false, scale: 1, wobble: 0 });
        props.push({ id: i * 10 + 2, type: 'FLOWER', offset: 1.5, collected: false, scale: 1, wobble: 0 });
      } else if (i % 12 === 0) {
        props.push({ id: i * 10 + 3, type: 'BUSH', offset: 1.7, collected: false, scale: 1, wobble: 0 });
      }

      // Add gameplay items on the road
      if (i > 20 && i % 25 === 0) {
        // Mud Puddle!
        props.push({ id: i * 10 + 4, type: 'MUD_PUDDLE', offset: (Math.sin(i) * 0.5), collected: false, scale: 1, wobble: 0 });
      } else if (i > 15 && i % 18 === 0) {
        // Golden Star!
        props.push({ id: i * 10 + 5, type: 'GOLDEN_STAR', offset: (Math.cos(i) * 0.6), collected: false, scale: 1, wobble: 0 });
      } else if (i === 95 || i === 200) {
        // Rainbow Boost Ramp!
        props.push({ id: i * 10 + 6, type: 'BOOST_RAMP', offset: 0, collected: false, scale: 1.2, wobble: 0 });
      } else if (i > 30 && i % 45 === 0) {
        // Soft Hay Bale obstacle on side of road
        props.push({ id: i * 10 + 7, type: 'HAY_BALE', offset: Math.sin(i) > 0 ? 0.75 : -0.75, collected: false, scale: 1, wobble: 0 });
      }

      this.segments.push({
        index: i,
        p1: {
          world: { x: 0, y: curY, z: i * SEGMENT_LENGTH },
          screen: { x: 0, y: 0, w: 0, scale: 0 }
        },
        p2: {
          world: { x: 0, y: curY, z: (i + 1) * SEGMENT_LENGTH },
          screen: { x: 0, y: 0, w: 0, scale: 0 }
        },
        curve,
        clip: 0,
        colors,
        props
      });
    }

    this.trackLength = this.segments.length * SEGMENT_LENGTH;
  }

  public findSegment(z: number): TrackSegment {
    const wrappedZ = (z % this.trackLength + this.trackLength) % this.trackLength;
    const index = Math.floor(wrappedZ / SEGMENT_LENGTH) % this.segments.length;
    return this.segments[index];
  }

  public update(dt: number, steerInput: number): void {
    this.stats.elapsedTime += dt;

    // Track steering changes for TypeSafe assist detection
    const currentSign = Math.sign(steerInput);
    if (currentSign !== 0 && currentSign !== this.lastSteerSign) {
      this.steerJitterCount++;
      this.lastSteerSign = currentSign;
    }

    // Accelerate smoothly (toddler friendly auto-cruising)
    const targetMax = this.player.turboTimer > 0 ? this.player.maxSpeed * 1.45 : this.player.maxSpeed;
    const accel = this.player.turboTimer > 0 ? 4500 : 2600;

    // If bumped into hay bale, temporarily slow down
    const effectiveTarget = this.player.bumpTimer > 0 ? targetMax * 0.45 : targetMax;

    if (this.player.speed < effectiveTarget) {
      this.player.speed = Math.min(effectiveTarget, this.player.speed + accel * dt);
    } else {
      this.player.speed = Math.max(effectiveTarget, this.player.speed - 1800 * dt);
    }

    // Current segment
    const currentSegment = this.findSegment(this.player.z);

    // Centrifugal curve physics
    const speedRatio = this.player.speed / this.player.maxSpeed;
    this.player.x -= (speedRatio * currentSegment.curve * 0.85 * dt);

    // Apply player steering
    this.player.steer = steerInput;
    this.player.x += steerInput * 1.85 * dt;

    // Check off-road condition
    const isOffRoad = Math.abs(this.player.x) > 1.05;
    if (isOffRoad) {
      this.offRoadTime += dt;
      // Slight off-road drag
      this.player.speed = Math.max(this.player.maxSpeed * 0.4, this.player.speed - 2200 * dt);
    } else {
      this.offRoadTime = Math.max(0, this.offRoadTime - dt * 2);
    }

    // TypeSafe System One Steering Assist:
    // If the toddler is struggling off-road or erratically mashing, gently center the kart
    const assistResult = typesafeRacing.evaluateSteeringAssist({
      offRoadDurationSec: this.offRoadTime,
      recentSteerJitter: this.steerJitterCount / Math.max(1, this.stats.elapsedTime),
      missedCollectibles: 0,
      averageSpeed: this.player.speed / 100,
      toddlerAgeBand: '2-5'
    });

    if (assistResult.suggestedAction === 'APPLY_GENTLE_ROAD_MAGNET') {
      // Gentle restorative magnetic pull toward center
      this.player.x += (-this.player.x) * 1.5 * dt;
    }

    // Soft clamp road bounds
    this.player.x = Math.max(-1.75, Math.min(1.75, this.player.x));

    // Move forward
    const oldZ = this.player.z;
    this.player.z += this.player.speed * dt;
    this.player.distance += this.player.speed * dt;

    // Lap completion
    if (this.player.z >= this.trackLength) {
      this.player.z %= this.trackLength;
      this.player.lap++;
      this.onLapComplete?.(this.player.lap);
    }

    // Jump / Air physics
    if (this.player.airY > 0 || this.player.airVy !== 0) {
      this.player.airY += this.player.airVy * dt;
      this.player.airVy -= 1800 * dt; // Gravity
      if (this.player.airY <= 0) {
        this.player.airY = 0;
        this.player.airVy = 0;
      }
    }

    // Timers
    if (this.player.turboTimer > 0) this.player.turboTimer -= dt;
    if (this.player.mudTimer > 0) this.player.mudTimer -= dt;
    if (this.player.bumpTimer > 0) this.player.bumpTimer -= dt;

    // Score accumulation for forward driving
    this.stats.score += Math.floor(this.player.speed * dt * 0.05);

    // Check collisions with collectibles & props on nearby segments
    this.checkCollisions(oldZ, this.player.z);
  }

  private checkCollisions(startZ: number, endZ: number): void {
    const startIndex = Math.floor(startZ / SEGMENT_LENGTH);
    const endIndex = Math.floor(endZ / SEGMENT_LENGTH);

    for (let idx = startIndex; idx <= endIndex + 1; idx++) {
      const segIndex = (idx % this.segments.length + this.segments.length) % this.segments.length;
      const segment = this.segments[segIndex];

      for (const prop of segment.props) {
        if (prop.collected) continue;

        // X collision tolerance
        const dx = Math.abs(this.player.x - prop.offset);

        if (prop.type === 'MUD_PUDDLE' && dx < 0.45) {
          prop.collected = true;
          this.player.mudTimer = 1.2;
          this.stats.mudSplashes++;
          this.stats.score += 250 * this.stats.combo;
          this.onMudSplash?.(this.player.x, this.player.z);
        } else if (prop.type === 'GOLDEN_STAR' && dx < 0.42) {
          prop.collected = true;
          this.stats.starsCollected++;
          this.stats.combo = Math.min(10, this.stats.combo + 1);
          if (this.stats.combo > this.stats.maxCombo) {
            this.stats.maxCombo = this.stats.combo;
          }
          this.stats.score += 150 * this.stats.combo;
          this.onStarCollect?.(this.player.x, this.player.z, this.stats.combo);
        } else if (prop.type === 'BOOST_RAMP' && dx < 0.5) {
          this.player.turboTimer = 2.8;
          this.player.airVy = 750;
          this.stats.boostCount++;
          this.stats.score += 500;
          this.onBoostRamp?.();
        } else if (prop.type === 'HAY_BALE' && dx < 0.4) {
          prop.collected = true;
          this.player.bumpTimer = 0.8;
          this.stats.combo = 1; // reset combo, but no game over!
          this.onHayBaleBump?.();
        }
      }
    }
  }
}
