/**
 * Tier 2 Extension: Milestone M2 Character Vector Graphics Empirical Suite
 * Target Subsystems: 8 Character Models, Procedural Vector Geometry, Animation Controller, Universal Dispatcher
 * Peppa Pig: Happy Mrs Chicken 8-Game Deluxe Expansion Suite
 */

import { describe, test, expect, beforeEach } from './e2e_runner.mjs';
import {
  CHARACTER_RENDERERS,
  renderCharacter,
  drawGeorgePig,
  drawMummyPig,
  drawGrandpaPig,
  drawSuzySheep,
  drawMrsChicken,
  drawPeppaPig,
  drawDaddyPig,
  drawBabyChick
} from '../src/graphics/characters';

import {
  createCharacterAnimState,
  updateCharacterAnimState,
  preserveVolume,
  getJawRotationAngle,
  getFryingPanAngle,
  getVeggiePullTension,
  getHopscotchPhase,
  getEggLayingSquat,
  getDaddyPigPanic,
  getBabyChickWaddle,
  getBubbleBlowPose,
  getBalloonPopReaction
} from '../src/graphics/animations';

import { PALETTE } from '../src/graphics/palette';
import { CharacterId, CharacterAnimState } from '../src/types/characters';

interface LogCall {
  method: string;
  args: any[];
  fillStyle: any;
  strokeStyle: any;
  lineWidth: number;
}

class TestSpyCanvasContext {
  public calls: LogCall[] = [];
  public fillStyle: string = '#000000';
  public strokeStyle: string = '#000000';
  public lineWidth: number = 1;
  public saveCount: number = 0;
  public restoreCount: number = 0;

  private record(method: string, args: any[]) {
    this.calls.push({
      method,
      args: [...args],
      fillStyle: this.fillStyle,
      strokeStyle: this.strokeStyle,
      lineWidth: this.lineWidth
    });
  }

  reset() {
    this.calls = [];
    this.saveCount = 0;
    this.restoreCount = 0;
    this.fillStyle = '#000000';
    this.strokeStyle = '#000000';
    this.lineWidth = 1;
  }

  save() { this.saveCount++; this.record('save', []); }
  restore() { this.restoreCount++; this.record('restore', []); }
  scale(sx: number, sy: number) { this.record('scale', [sx, sy]); }
  translate(tx: number, ty: number) { this.record('translate', [tx, ty]); }
  rotate(angle: number) { this.record('rotate', [angle]); }
  beginPath() { this.record('beginPath', []); }
  closePath() { this.record('closePath', []); }
  moveTo(x: number, y: number) { this.record('moveTo', [x, y]); }
  lineTo(x: number, y: number) { this.record('lineTo', [x, y]); }
  quadraticCurveTo(cpx: number, cpy: number, x: number, y: number) { this.record('quadraticCurveTo', [cpx, cpy, x, y]); }
  bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number) { this.record('bezierCurveTo', [cp1x, cp1y, cp2x, cp2y, x, y]); }
  arc(x: number, y: number, r: number, sa: number, ea: number, ac?: boolean) { this.record('arc', [x, y, r, sa, ea, ac]); }
  ellipse(x: number, y: number, rx: number, ry: number, rot: number, sa: number, ea: number, ac?: boolean) { this.record('ellipse', [x, y, rx, ry, rot, sa, ea, ac]); }
  rect(x: number, y: number, w: number, h: number) { this.record('rect', [x, y, w, h]); }
  roundRect(x: number, y: number, w: number, h: number, radii: any) { this.record('roundRect', [x, y, w, h, radii]); }
  fillRect(x: number, y: number, w: number, h: number) { this.record('fillRect', [x, y, w, h]); }
  fill() { this.record('fill', []); }
  stroke() { this.record('stroke', []); }
}

describe('Tier 2: Character Models & Procedural Vector Graphics Suite', () => {
  let spy: TestSpyCanvasContext;
  let ctx: CanvasRenderingContext2D;

  beforeEach(() => {
    spy = new TestSpyCanvasContext();
    ctx = spy as unknown as CanvasRenderingContext2D;
  });

  test('T2.C01_george_pig_dino_chomping_jaw - Articulates jaw rotation across dinoChomp range and draws teeth/mouth', () => {
    const chomps = [0, 0.25, 0.5, 0.75, 1.0];
    for (const chomp of chomps) {
      spy.reset();
      drawGeorgePig(ctx, 100, 100, 1.0, { holdingDino: true, dinoChomp: chomp });
      expect(spy.saveCount).toBe(spy.restoreCount);

      const rotateCalls = spy.calls.filter(c => c.method === 'rotate');
      const expectedAngle = chomp * (Math.PI / 6);
      const matched = rotateCalls.some(c => Math.abs(c.args[0] - expectedAngle) < 0.001);
      expect(matched).toBeTruthy();

      if (chomp > 0.05) {
        const hasMouthFill = spy.calls.some(c => c.fillStyle === PALETTE.DINOSAUR_MOUTH && c.method === 'fill');
        expect(hasMouthFill).toBeTruthy();
      }
    }
  });

  test('T2.C02_george_pig_crying_teardrops - Branches to crying mouth and blue teardrops when isCrying or expression=crying', () => {
    // Normal George
    spy.reset();
    drawGeorgePig(ctx, 100, 100, 1.0, { isCrying: false });
    expect(spy.calls.some(c => c.fillStyle === '#4FC3F7')).toBeFalsy();

    // Crying George
    spy.reset();
    drawGeorgePig(ctx, 100, 100, 1.0, { isCrying: true });
    const blueTears = spy.calls.filter(c => c.fillStyle === '#4FC3F7' && c.method === 'arc');
    expect(blueTears.length).toBe(2);

    // expression: crying
    spy.reset();
    drawGeorgePig(ctx, 100, 100, 1.0, { expression: 'crying' });
    expect(spy.calls.some(c => c.fillStyle === '#4FC3F7')).toBeTruthy();
  });

  test('T2.C03_george_pig_dino_spines_count - Draws 4 triangular spines on Mr. Dinosaur back', () => {
    spy.reset();
    drawGeorgePig(ctx, 100, 100, 1.0, { holdingDino: true });
    const spineFills = spy.calls.filter(c => c.fillStyle === PALETTE.DINOSAUR_OUTLINE && c.method === 'fill');
    expect(spineFills.length).toBeGreaterThanOrEqual(4);
  });

  test('T2.C04_mummy_pig_mascara_eyelashes - Renders 6 curved mascara eyelashes (3 per eye) in open and blinking states', () => {
    spy.reset();
    drawMummyPig(ctx, 100, 100, 1.0, { eyeBlink: false });
    const lashes = spy.calls.filter(c => c.strokeStyle === PALETTE.MUMMY_MASCARA && c.method === 'quadraticCurveTo');
    expect(lashes.length).toBe(6);

    spy.reset();
    drawMummyPig(ctx, 100, 100, 1.0, { eyeBlink: true });
    const blinkLashes = spy.calls.filter(c => c.strokeStyle === PALETTE.MUMMY_MASCARA && c.method === 'quadraticCurveTo');
    expect(blinkLashes.length).toBe(6);
  });

  test('T2.C05_mummy_pig_frying_pan_articulation - Renders pan angle, sizzling pancake, and butter pat', () => {
    spy.reset();
    drawMummyPig(ctx, 100, 100, 1.0, { holdingPan: true, panAngle: 0.35 });
    expect(spy.saveCount).toBe(spy.restoreCount);

    const rotates = spy.calls.filter(c => c.method === 'rotate');
    expect(rotates.some(c => Math.abs(c.args[0] - 0.35) < 0.001)).toBeTruthy();

    const pancake = spy.calls.filter(c => c.fillStyle === PALETTE.MUMMY_PANCAKE && c.method === 'ellipse');
    expect(pancake.length).toBe(1);

    const butter = spy.calls.filter(c => c.fillStyle === PALETTE.MUMMY_BUTTER && c.method === 'fillRect');
    expect(butter.length).toBe(1);
  });

  test('T2.C06_grandpa_pig_sailing_cap_anchor - Renders sailing cap visor, crown arc, and gold anchor badge', () => {
    spy.reset();
    drawGrandpaPig(ctx, 100, 100, 1.0);
    expect(spy.saveCount).toBe(spy.restoreCount);

    const anchorParts = spy.calls.filter(c => c.strokeStyle === PALETTE.GRANDPA_ANCHOR);
    expect(anchorParts.length).toBeGreaterThanOrEqual(4);
  });

  test('T2.C07_grandpa_pig_stubble_and_wellies - Renders exactly 7 beard stubble arcs and dark green wellies with mud', () => {
    spy.reset();
    drawGrandpaPig(ctx, 100, 100, 1.0, { welliesMuddy: true });
    const stubbles = spy.calls.filter(c => c.strokeStyle === PALETTE.GRANDPA_STUBBLE && c.method === 'arc');
    expect(stubbles.length).toBe(7);

    const wellies = spy.calls.filter(c => c.fillStyle === PALETTE.GRANDPA_WELLIES);
    expect(wellies.length).toBeGreaterThan(0);

    const mud = spy.calls.filter(c => c.fillStyle === PALETTE.MUD_DARK);
    expect(mud.length).toBeGreaterThan(0);
  });

  test('T2.C08_grandpa_pig_veggie_pull_tension_lean - Strains backwards with pull angle and clenched white teeth', () => {
    spy.reset();
    drawGrandpaPig(ctx, 100, 100, 1.0, { pulling: true, pullTension: 0.8 });
    expect(spy.saveCount).toBe(spy.restoreCount);

    const rotateCalls = spy.calls.filter(c => c.method === 'rotate');
    expect(rotateCalls.some(c => c.args[0] < 0)).toBeTruthy();

    const teethRect = spy.calls.some(c => c.method === 'rect');
    const whiteFill = spy.calls.some(c => c.method === 'fill' && c.fillStyle === PALETTE.WHITE);
    expect(teethRect && whiteFill).toBeTruthy();
  });

  test('T2.C09_suzy_sheep_scalloped_ears_and_crown - Renders 6 ear arcs (3 per ear) and 3 wool crown puffs', () => {
    spy.reset();
    drawSuzySheep(ctx, 100, 100, 1.0);
    expect(spy.saveCount).toBe(spy.restoreCount);

    const woolArcs = spy.calls.filter(c => c.fillStyle === PALETTE.SUZY_WOOL && c.method === 'arc');
    expect(woolArcs.length).toBeGreaterThanOrEqual(9);
  });

  test('T2.C10_suzy_sheep_bubble_wand_and_pucker - Renders bubble wand, soap film highlight, and puckered mouth', () => {
    spy.reset();
    drawSuzySheep(ctx, 100, 100, 1.0, { holdingWand: true, blowingBubble: true });
    expect(spy.saveCount).toBe(spy.restoreCount);

    expect(spy.calls.some(c => c.strokeStyle === PALETTE.SUZY_WAND)).toBeTruthy();
    expect(spy.calls.some(c => c.strokeStyle === PALETTE.SUZY_BUBBLE)).toBeTruthy();
    expect(spy.calls.some(c => c.fillStyle === 'rgba(79, 195, 247, 0.35)')).toBeTruthy();

    const puckerMouth = spy.calls.filter(c => c.fillStyle === PALETTE.SUZY_DRESS_OUTLINE && c.method === 'arc');
    expect(puckerMouth.length).toBeGreaterThanOrEqual(1);
  });

  test('T2.C11_suzy_sheep_hopscotch_math - Parabolic trajectory reaches apex -36px and preserves bounce squash', () => {
    const apex = getHopscotchPhase(0.5);
    expect(apex.hopY).toBeCloseTo(-36, 1);
    expect(apex.squashY).toBeGreaterThan(0.5);

    const start = getHopscotchPhase(0.0);
    expect(start.hopY).toBe(0);
    expect(start.squashY).toBe(1.0);
  });

  test('T2.C12_upgraded_characters_blinking_and_volume - All 8 characters support blinking and mass conservation', () => {
    const chars: CharacterId[] = ['chicken', 'peppa', 'daddy', 'chick', 'george', 'mummy', 'grandpa', 'suzy'];
    for (const id of chars) {
      spy.reset();
      renderCharacter(id, ctx, 50, 50, 1.0, { eyeBlink: true });
      expect(spy.saveCount).toBe(spy.restoreCount);

      spy.reset();
      renderCharacter(id, ctx, 50, 50, 1.0, { eyeBlink: false });
      expect(spy.saveCount).toBe(spy.restoreCount);
    }

    const vol = preserveVolume(0.5);
    expect(vol.scaleX * vol.scaleX * vol.scaleY).toBeCloseTo(1.0, 3);
  });

  test('T2.C13_daddy_pig_panic_escalation - Stage 0..4 escalates sweat drops (0, 1, 2, 4) and red screaming mouth', () => {
    const sweatExpectations = [0, 1, 2, 4, 4];
    for (let st = 0; st <= 4; st++) {
      spy.reset();
      drawDaddyPig(ctx, 100, 100, 1.0, { panicStage: st, time: 1.0 });
      const drops = spy.calls.filter(c => c.fillStyle === '#4FC3F7' && c.method === 'arc');
      expect(drops.length).toBe(sweatExpectations[st]);

      if (st >= 3) {
        const scream = spy.calls.some(c => c.fillStyle === '#D32F2F' && c.method === 'fill');
        expect(scream).toBeTruthy();
      }
    }
  });

  test('T2.C14_universal_dispatcher_renderCharacter - Dispatches all 8 registered character IDs to matching functions', () => {
    const allIds: CharacterId[] = ['chicken', 'peppa', 'george', 'daddy', 'mummy', 'grandpa', 'suzy', 'chick'];
    for (const id of allIds) {
      expect(CHARACTER_RENDERERS[id]).toBeDefined();

      spy.reset();
      renderCharacter(id, ctx, 100, 100, 1.2);
      const callCount1 = spy.calls.length;

      spy.reset();
      CHARACTER_RENDERERS[id](ctx, 100, 100, 1.2);
      const callCount2 = spy.calls.length;

      expect(callCount1).toBe(callCount2);
    }

    // Graceful no-op on unknown ID
    spy.reset();
    expect(() => renderCharacter('unknown' as any, ctx, 0, 0)).not.toThrow();
    expect(spy.calls.length).toBe(0);
  });

  test('T2.C15_animation_state_stochastic_blinking_decay - Randomizes blink interval and elastically decays squash', () => {
    const state = createCharacterAnimState();
    expect(state.nextBlinkTime).toBeGreaterThanOrEqual(2.5);
    expect(state.nextBlinkTime).toBeLessThanOrEqual(4.0);

    state.squash = 0.5;
    updateCharacterAnimState(state, 0.5);
    expect(state.squash).toBeGreaterThan(0.5);
  });
});
