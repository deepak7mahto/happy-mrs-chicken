/**
 * 3D Muddy Kart Canvas 2D Pseudo-3D Perspective Renderer
 * Adventures of Trishu - Mode 17
 * Strictly under 500 Lines of Code
 */

import { DisplayManager } from '../../engine/DisplayManager';
import { CharacterId } from '../../types/characters';
import { renderCharacter } from '../../graphics/characters';
import { MuddyKartLogic, CAMERA_HEIGHT, CAMERA_DEPTH, ROAD_WIDTH, SEGMENT_LENGTH } from './MuddyKartLogic';
import { RoadProp, TrackSegment, ProjectedPoint2D, TrackPoint3D } from './types';

const DRAW_DISTANCE = 120; // Number of segments visible forward

export class MuddyKartRenderer {
  public render(
    ctx: CanvasRenderingContext2D,
    logic: MuddyKartLogic,
    display: DisplayManager,
    selectedAvatar: CharacterId,
    time: number
  ): void {
    const w = display.vWidth;
    const h = display.vHeight;

    ctx.save();

    // 1. Sky & Rolling Hills Horizon
    this.renderSkyAndHills(ctx, logic, w, h);

    // 2. Project & Render Pseudo-3D Road
    this.renderRoadAndProps(ctx, logic, w, h);

    // 3. Render 3D Kart & Driver
    this.renderKart(ctx, logic, selectedAvatar, w, h, time);

    // 4. Screen-space Mud Splatters when recently splashed
    if (logic.player.mudTimer > 0) {
      this.renderScreenMudSplats(ctx, logic.player.mudTimer, w, h);
    }

    ctx.restore();
  }

  private renderSkyAndHills(
    ctx: CanvasRenderingContext2D,
    logic: MuddyKartLogic,
    w: number,
    h: number
  ): void {
    const horizon = h * 0.46;

    // Sky gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, horizon);
    skyGrad.addColorStop(0, '#4FC3F7');
    skyGrad.addColorStop(0.7, '#B3E5FC');
    skyGrad.addColorStop(1, '#E1F5FE');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, horizon);

    // Sun
    ctx.fillStyle = '#FFEE58';
    ctx.beginPath();
    ctx.arc(w * 0.82, horizon * 0.35, Math.min(36, w * 0.08), 0, Math.PI * 2);
    ctx.fill();

    // Distant Rolling Hills
    const hillOffset = (logic.player.x * 30) % w;
    ctx.fillStyle = '#66BB6A';
    ctx.beginPath();
    ctx.moveTo(0, horizon);
    for (let x = 0; x <= w; x += 40) {
      const hillY = horizon - 28 - Math.sin((x + hillOffset) * 0.012) * 22;
      ctx.lineTo(x, hillY);
    }
    ctx.lineTo(w, horizon);
    ctx.closePath();
    ctx.fill();

    // Nearer Dark Green Hills
    ctx.fillStyle = '#4CAF50';
    ctx.beginPath();
    ctx.moveTo(0, horizon);
    for (let x = 0; x <= w; x += 30) {
      const hillY = horizon - 14 - Math.cos((x - hillOffset * 1.5) * 0.018) * 16;
      ctx.lineTo(x, hillY);
    }
    ctx.lineTo(w, horizon);
    ctx.closePath();
    ctx.fill();
  }

  private project(
    p: { world: TrackPoint3D; screen: ProjectedPoint2D },
    cameraX: number,
    cameraY: number,
    cameraZ: number,
    w: number,
    h: number
  ): void {
    const worldX = p.world.x - cameraX;
    const worldY = p.world.y - cameraY;
    const worldZ = p.world.z - cameraZ;

    p.screen.scale = CAMERA_DEPTH / Math.max(1, worldZ);
    p.screen.x = Math.round((w / 2) + (p.screen.scale * worldX * w / 2));
    p.screen.y = Math.round((h * 0.46) - (p.screen.scale * worldY * h / 2));
    p.screen.w = Math.round(p.screen.scale * ROAD_WIDTH * w / 2);
  }

  private renderRoadAndProps(
    ctx: CanvasRenderingContext2D,
    logic: MuddyKartLogic,
    w: number,
    h: number
  ): void {
    const baseSegment = logic.findSegment(logic.player.z);
    const cameraX = logic.player.x * ROAD_WIDTH;
    const cameraY = CAMERA_HEIGHT + baseSegment.p1.world.y + logic.player.airY;
    const cameraZ = logic.player.z - (CAMERA_HEIGHT * CAMERA_DEPTH);

    let maxy = h;
    let dx = -(baseSegment.curve * (logic.player.z % SEGMENT_LENGTH / SEGMENT_LENGTH));
    let x = 0;

    const renderList: { segment: TrackSegment; clipY: number }[] = [];

    for (let n = 0; n < DRAW_DISTANCE; n++) {
      const segIndex = (baseSegment.index + n) % logic.segments.length;
      const segment = logic.segments[segIndex];
      const looped = segment.index < baseSegment.index;

      const zOffset = looped ? logic.trackLength : 0;
      segment.p1.world.z = (segment.index * SEGMENT_LENGTH) + zOffset;
      segment.p2.world.z = ((segment.index + 1) * SEGMENT_LENGTH) + zOffset;

      this.project(segment.p1, cameraX - x, cameraY, cameraZ, w, h);
      x += dx;
      dx += segment.curve;
      this.project(segment.p2, cameraX - x, cameraY, cameraZ, w, h);

      if (segment.p1.screen.y >= maxy || segment.p2.screen.y >= segment.p1.screen.y) {
        continue;
      }

      // Draw grass, rumble, and road polygons
      this.drawSegment(ctx, segment.p1.screen, segment.p2.screen, segment.colors, w);
      maxy = segment.p1.screen.y;
      segment.clip = maxy;
      renderList.push({ segment, clipY: maxy });
    }

    // Render roadside scenery and road items back-to-front (Painter's algorithm)
    for (let i = renderList.length - 1; i >= 0; i--) {
      const { segment } = renderList[i];
      for (const prop of segment.props) {
        if (!prop.collected) {
          this.renderProp(ctx, prop, segment.p1.screen, w);
        }
      }
    }
  }

  private drawSegment(
    ctx: CanvasRenderingContext2D,
    p1: ProjectedPoint2D,
    p2: ProjectedPoint2D,
    colors: TrackSegment['colors'],
    w: number
  ): void {
    const r1 = p1.w / 6;
    const r2 = p2.w / 6;

    // Grass background
    ctx.fillStyle = colors.grass;
    ctx.fillRect(0, p2.y, w, p1.y - p2.y);

    // Rumble strips
    ctx.fillStyle = colors.rumble;
    this.drawPolygon(ctx, p1.x - p1.w - r1, p1.y, p1.x - p1.w, p1.y, p2.x - p2.w, p2.y, p2.x - p2.w - r2, p2.y);
    this.drawPolygon(ctx, p1.x + p1.w, p1.y, p1.x + p1.w + r1, p1.y, p2.x + p2.w + r2, p2.y, p2.x + p2.w, p2.y);

    // Road asphalt
    ctx.fillStyle = colors.road;
    this.drawPolygon(ctx, p1.x - p1.w, p1.y, p1.x + p1.w, p1.y, p2.x + p2.w, p2.y, p2.x - p2.w, p2.y);

    // Center lane divider
    if (colors.lane !== colors.road) {
      const l1 = p1.w / 32;
      const l2 = p2.w / 32;
      ctx.fillStyle = colors.lane;
      this.drawPolygon(ctx, p1.x - l1, p1.y, p1.x + l1, p1.y, p2.x + l2, p2.y, p2.x - l2, p2.y);
    }
  }

  private drawPolygon(
    ctx: CanvasRenderingContext2D,
    x1: number, y1: number,
    x2: number, y2: number,
    x3: number, y3: number,
    x4: number, y4: number
  ): void {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.lineTo(x4, y4);
    ctx.closePath();
    ctx.fill();
  }

  private renderProp(
    ctx: CanvasRenderingContext2D,
    prop: RoadProp,
    screen: ProjectedPoint2D,
    w: number
  ): void {
    const propX = screen.x + (screen.scale * prop.offset * ROAD_WIDTH * w / 2);
    const propY = screen.y;
    const baseScale = Math.max(0.08, Math.min(2.5, screen.scale * 1200 * prop.scale));

    ctx.save();
    ctx.translate(propX, propY);

    if (prop.type === 'MUD_PUDDLE') {
      // Big glossy brown mud puddle on road
      ctx.fillStyle = '#5D4037';
      ctx.beginPath();
      ctx.ellipse(0, 0, 48 * baseScale, 16 * baseScale, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#795548';
      ctx.beginPath();
      ctx.ellipse(-4 * baseScale, -2 * baseScale, 36 * baseScale, 11 * baseScale, 0, 0, Math.PI * 2);
      ctx.fill();
      // Splatter drops around puddle
      ctx.fillStyle = '#4E342E';
      ctx.beginPath();
      ctx.arc(38 * baseScale, 4 * baseScale, 4 * baseScale, 0, Math.PI * 2);
      ctx.arc(-36 * baseScale, 2 * baseScale, 5 * baseScale, 0, Math.PI * 2);
      ctx.fill();
    } else if (prop.type === 'GOLDEN_STAR') {
      // Floating rotating golden star
      ctx.fillStyle = '#FFD54F';
      ctx.strokeStyle = '#FFA000';
      ctx.lineWidth = 3 * baseScale;
      ctx.beginPath();
      const r = 24 * baseScale;
      for (let i = 0; i < 5; i++) {
        const a = (i * 4 * Math.PI) / 5 - Math.PI / 2;
        const dist = i % 2 === 0 ? r : r * 0.45;
        const sx = Math.cos(a) * dist;
        const sy = Math.sin(a) * dist - 25 * baseScale;
        if (i === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (prop.type === 'BOOST_RAMP') {
      // Rainbow turbo boost ramp
      const rw = 52 * baseScale;
      const rh = 30 * baseScale;
      const colors = ['#F44336', '#FF9800', '#4CAF50', '#2196F3'];
      for (let k = 0; k < 4; k++) {
        ctx.fillStyle = colors[k];
        ctx.fillRect(-rw + (k * (rw / 2)), -rh, rw / 2, rh);
      }
      // White forward arrows
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.moveTo(0, -rh * 0.8);
      ctx.lineTo(12 * baseScale, -rh * 0.2);
      ctx.lineTo(-12 * baseScale, -rh * 0.2);
      ctx.closePath();
      ctx.fill();
    } else if (prop.type === 'HAY_BALE') {
      // Cylindrical Golden Hay Bale
      ctx.fillStyle = '#FBC02D';
      ctx.beginPath();
      ctx.roundRect(-26 * baseScale, -38 * baseScale, 52 * baseScale, 38 * baseScale, 8 * baseScale);
      ctx.fill();
      // Straw tie bands
      ctx.strokeStyle = '#F57F17';
      ctx.lineWidth = 3 * baseScale;
      ctx.beginPath();
      ctx.moveTo(-26 * baseScale, -26 * baseScale);
      ctx.lineTo(26 * baseScale, -26 * baseScale);
      ctx.moveTo(-26 * baseScale, -14 * baseScale);
      ctx.lineTo(26 * baseScale, -14 * baseScale);
      ctx.stroke();
    } else if (prop.type === 'TREE') {
      // Roadside Pine / Apple Tree
      ctx.fillStyle = '#795548';
      ctx.fillRect(-8 * baseScale, -40 * baseScale, 16 * baseScale, 40 * baseScale);
      ctx.fillStyle = '#388E3C';
      ctx.beginPath();
      ctx.arc(0, -75 * baseScale, 42 * baseScale, 0, Math.PI * 2);
      ctx.fill();
      // Red apples
      ctx.fillStyle = '#E53935';
      ctx.beginPath();
      ctx.arc(-14 * baseScale, -80 * baseScale, 5 * baseScale, 0, Math.PI * 2);
      ctx.arc(16 * baseScale, -72 * baseScale, 5 * baseScale, 0, Math.PI * 2);
      ctx.fill();
    } else if (prop.type === 'FLOWER') {
      // Roadside Daisy
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(0, -16 * baseScale, 12 * baseScale, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FDD835';
      ctx.beginPath();
      ctx.arc(0, -16 * baseScale, 6 * baseScale, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  private renderKart(
    ctx: CanvasRenderingContext2D,
    logic: MuddyKartLogic,
    selectedAvatar: CharacterId,
    w: number,
    h: number,
    time: number
  ): void {
    const kartX = (w / 2) + (logic.player.steer * 40);
    const kartBaseY = h * 0.88 - logic.player.airY * 0.22;
    const wobble = Math.sin(time * 0.02) * (logic.player.speed > 500 ? 3 : 0);
    const bumpWobble = logic.player.bumpTimer > 0 ? Math.sin(time * 0.08) * 8 : 0;

    ctx.save();
    ctx.translate(kartX, kartBaseY + wobble + bumpWobble);

    // Kart Chassis Shadows
    ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
    ctx.beginPath();
    ctx.ellipse(0, 16, 68, 20, 0, 0, Math.PI * 2);
    ctx.fill();

    // Left & Right Rear Tires
    ctx.fillStyle = '#212121';
    ctx.beginPath();
    ctx.roundRect(-72, -18, 22, 34, 6);
    ctx.roundRect(50, -18, 22, 34, 6);
    ctx.fill();

    // Wheel Hubcaps
    ctx.fillStyle = '#B0BEC5';
    ctx.beginPath();
    ctx.arc(-61, -1, 5, 0, Math.PI * 2);
    ctx.arc(61, -1, 5, 0, Math.PI * 2);
    ctx.fill();

    // Main Kart Chassis Body (Vibrant Red/Yellow)
    const bodyGrad = ctx.createLinearGradient(0, -32, 0, 18);
    bodyGrad.addColorStop(0, '#E53935');
    bodyGrad.addColorStop(1, '#C62828');
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.roundRect(-54, -22, 108, 38, 14);
    ctx.fill();

    // Yellow racing stripes
    ctx.fillStyle = '#FFEB3B';
    ctx.fillRect(-10, -22, 20, 38);

    // Front Bumper
    ctx.fillStyle = '#37474F';
    ctx.beginPath();
    ctx.roundRect(-46, 10, 92, 12, 6);
    ctx.fill();

    // Headlights
    ctx.fillStyle = '#FFF59D';
    ctx.beginPath();
    ctx.arc(-34, 6, 7, 0, Math.PI * 2);
    ctx.arc(34, 6, 7, 0, Math.PI * 2);
    ctx.fill();

    // Driver in Seat
    ctx.save();
    renderCharacter(selectedAvatar, ctx, 0, -42, 0.58, {
      blinkProgress: 0,
      squashX: 1.0,
      squashY: 1.0,
      wobbleAngle: logic.player.steer * 0.15,
      isTalking: false,
      mouthOpenness: 0
    });
    ctx.restore();

    // Steering wheel
    ctx.strokeStyle = '#263238';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(0, -16, 14, 0, Math.PI * 2);
    ctx.stroke();

    // Turbo flame / boost trail
    if (logic.player.turboTimer > 0) {
      ctx.fillStyle = '#FF5722';
      ctx.beginPath();
      ctx.moveTo(-18, 16);
      ctx.lineTo(0, 42 + Math.random() * 12);
      ctx.lineTo(18, 16);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#FFEB3B';
      ctx.beginPath();
      ctx.moveTo(-10, 16);
      ctx.lineTo(0, 32 + Math.random() * 8);
      ctx.lineTo(10, 16);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }

  private renderScreenMudSplats(
    ctx: CanvasRenderingContext2D,
    mudTimer: number,
    w: number,
    h: number
  ): void {
    const alpha = Math.min(1, mudTimer);
    ctx.save();
    ctx.fillStyle = `rgba(109, 76, 65, ${alpha * 0.72})`;

    // Corner screen mud splashes
    ctx.beginPath();
    ctx.arc(w * 0.14, h * 0.22, 34, 0, Math.PI * 2);
    ctx.arc(w * 0.18, h * 0.26, 22, 0, Math.PI * 2);
    ctx.arc(w * 0.84, h * 0.18, 38, 0, Math.PI * 2);
    ctx.arc(w * 0.78, h * 0.22, 26, 0, Math.PI * 2);
    ctx.arc(w * 0.88, h * 0.28, 18, 0, Math.PI * 2);
    ctx.fill();

    // Drips
    ctx.fillRect(w * 0.13, h * 0.22, 12, 35 * alpha);
    ctx.fillRect(w * 0.83, h * 0.18, 14, 40 * alpha);

    ctx.restore();
  }
}
