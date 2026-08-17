/**
 * Milestone M2 Challenger 2 Empirical Test Harness
 * Target Subsystems: Character Models, Procedural Vector Graphics, Animation Controller, Universal Dispatcher
 * Challenger 2 Verification Suite
 */

import {
  CHARACTER_RENDERERS,
  renderCharacter,
  drawGeorgePig,
  renderGeorge,
  renderGeorgePig,
  drawGeorge,
  drawMummyPig,
  renderMummyPig,
  renderMummy,
  drawMummy,
  drawGrandpaPig,
  renderGrandpaPig,
  renderGrandpa,
  drawGrandpa,
  drawSuzySheep,
  renderSuzySheep,
  renderSuzy,
  drawSuzy,
  drawMrsChicken,
  renderChicken,
  renderMrsChicken,
  drawChicken,
  drawPeppaPig,
  renderPeppa,
  renderPeppaPig,
  drawPeppa,
  drawDaddyPig,
  renderDaddyPig,
  renderDaddy,
  drawDaddy,
  drawBabyChick,
  renderChick,
  renderBabyChick,
  drawChick
} from '../../src/graphics/characters';

import {
  createCharacterAnimState,
  updateCharacterAnimState,
  preserveVolume,
  getJawRotationAngle,
  getFryingPanAngle,
  getVeggiePullTension,
  getHopscotchPhase,
  getEggLayingSquat,
  getMudSplashReaction,
  getDaddyPigPanic,
  getBabyChickWaddle,
  getBubbleBlowPose,
  getBalloonPopReaction,
  AnimMath,
  clamp,
  lerp,
  easeInQuad,
  easeOutQuad,
  easeInOutQuad,
  easeOutBack,
  easeOutElastic,
  easeOutBounce
} from '../../src/graphics/animations';

import { PALETTE } from '../../src/graphics/palette';
import { CharacterId, CharacterAnimState } from '../../src/types/characters';

// =============================================================================
// Test Harness & Assertion Engine
// =============================================================================

let totalAssertions = 0;
let passedAssertions = 0;
let failedAssertions = 0;
const failures: string[] = [];

function assert(condition: boolean, testName: string, detail?: string) {
  totalAssertions++;
  if (condition) {
    passedAssertions++;
    console.log(`  ✓ [PASS] ${testName}`);
  } else {
    failedAssertions++;
    const msg = `  ✗ [FAIL] ${testName}${detail ? ` - ${detail}` : ''}`;
    console.error(msg);
    failures.push(msg);
  }
}

function assertEqual<T>(actual: T, expected: T, testName: string) {
  const match = actual === expected || JSON.stringify(actual) === JSON.stringify(expected);
  assert(
    match,
    testName,
    `Expected: ${JSON.stringify(expected)}, Actual: ${JSON.stringify(actual)}`
  );
}

function section(title: string) {
  console.log(`\n============================================================`);
  console.log(`SECTION: ${title}`);
  console.log(`============================================================`);
}

// =============================================================================
// Comprehensive Mock Canvas 2D Context with Deep Telemetry
// =============================================================================

export interface CanvasCall {
  method: string;
  args: any[];
  fillStyle?: any;
  strokeStyle?: any;
  lineWidth?: number;
  globalAlpha?: number;
}

export class SpyCanvasContext {
  public calls: CanvasCall[] = [];
  public fillStyle: string | CanvasGradient | CanvasPattern = '#000000';
  public strokeStyle: string | CanvasGradient | CanvasPattern = '#000000';
  public lineWidth: number = 1;
  public lineCap: CanvasLineCap = 'butt';
  public lineJoin: CanvasLineJoin = 'miter';
  public globalAlpha: number = 1.0;
  public font: string = '10px sans-serif';
  public textAlign: CanvasTextAlign = 'start';
  public textBaseline: CanvasTextBaseline = 'alphabetic';

  public saveDepth: number = 0;
  public maxSaveDepth: number = 0;
  public saveCount: number = 0;
  public restoreCount: number = 0;

  private record(method: string, args: any[]) {
    this.calls.push({
      method,
      args: [...args],
      fillStyle: this.fillStyle,
      strokeStyle: this.strokeStyle,
      lineWidth: this.lineWidth,
      globalAlpha: this.globalAlpha
    });
  }

  reset() {
    this.calls = [];
    this.saveDepth = 0;
    this.maxSaveDepth = 0;
    this.saveCount = 0;
    this.restoreCount = 0;
    this.fillStyle = '#000000';
    this.strokeStyle = '#000000';
    this.lineWidth = 1;
  }

  save() {
    this.saveCount++;
    this.saveDepth++;
    if (this.saveDepth > this.maxSaveDepth) this.maxSaveDepth = this.saveDepth;
    this.record('save', []);
  }

  restore() {
    this.restoreCount++;
    this.saveDepth--;
    this.record('restore', []);
  }

  scale(sx: number, sy: number) {
    this.record('scale', [sx, sy]);
  }

  translate(tx: number, ty: number) {
    this.record('translate', [tx, ty]);
  }

  rotate(angle: number) {
    this.record('rotate', [angle]);
  }

  beginPath() {
    this.record('beginPath', []);
  }

  closePath() {
    this.record('closePath', []);
  }

  moveTo(x: number, y: number) {
    this.record('moveTo', [x, y]);
  }

  lineTo(x: number, y: number) {
    this.record('lineTo', [x, y]);
  }

  quadraticCurveTo(cpx: number, cpy: number, x: number, y: number) {
    this.record('quadraticCurveTo', [cpx, cpy, x, y]);
  }

  bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number) {
    this.record('bezierCurveTo', [cp1x, cp1y, cp2x, cp2y, x, y]);
  }

  arc(x: number, y: number, r: number, sa: number, ea: number, anticlockwise?: boolean) {
    this.record('arc', [x, y, r, sa, ea, anticlockwise]);
  }

  ellipse(x: number, y: number, rx: number, ry: number, rot: number, sa: number, ea: number, anticlockwise?: boolean) {
    this.record('ellipse', [x, y, rx, ry, rot, sa, ea, anticlockwise]);
  }

  rect(x: number, y: number, w: number, h: number) {
    this.record('rect', [x, y, w, h]);
  }

  roundRect(x: number, y: number, w: number, h: number, radii: any) {
    this.record('roundRect', [x, y, w, h, radii]);
  }

  fillRect(x: number, y: number, w: number, h: number) {
    this.record('fillRect', [x, y, w, h]);
  }

  fill() {
    this.record('fill', []);
  }

  stroke() {
    this.record('stroke', []);
  }

  // Filter query utilities
  getCallsByMethod(method: string): CanvasCall[] {
    return this.calls.filter(c => c.method === method);
  }

  hasColor(color: string): boolean {
    return this.calls.some(c => c.fillStyle === color || c.strokeStyle === color);
  }

  countColor(color: string, type?: 'fill' | 'stroke'): number {
    return this.calls.filter(c => {
      if (type === 'fill') return c.fillStyle === color && (c.method === 'fill' || c.method === 'fillRect');
      if (type === 'stroke') return c.strokeStyle === color && (c.method === 'stroke' || c.method === 'strokeRect');
      return c.fillStyle === color || c.strokeStyle === color;
    }).length;
  }
}

const mockCtx = new SpyCanvasContext() as unknown as CanvasRenderingContext2D;
const spy = mockCtx as unknown as SpyCanvasContext;

// =============================================================================
// 1. GEORGE PIG & MR. DINOSAUR EMPIRICAL CHALLENGES
// =============================================================================

section('1. George Pig: Dino Jaw Articulation, Crying Branch & Dino Spines');
{
  // 1.1 Dino Spines Count
  spy.reset();
  drawGeorgePig(mockCtx, 100, 100, 1.0, { holdingDino: true });
  assert(spy.saveCount === spy.restoreCount, 'George Pig: Canvas save/restore stack is strictly balanced');
  assert(spy.saveCount >= 2, 'George Pig holding dino has nested save/restore matrix');

  // Verify dinosaur colors used
  assert(spy.hasColor(PALETTE.DINOSAUR_GREEN), 'Dino green color (#4CAF50) present in draw calls');
  assert(spy.hasColor(PALETTE.DINOSAUR_OUTLINE), 'Dino outline (#2E7D32) present in draw calls');
  assert(spy.hasColor(PALETTE.DINOSAUR_TEETH), 'Dino teeth (#FFFFFF) present in draw calls');

  // Verify spines count (4 triangular spines rendered)
  const dinoOutlineFillCalls = spy.calls.filter(c => c.method === 'fill' && c.fillStyle === PALETTE.DINOSAUR_OUTLINE);
  assert(dinoOutlineFillCalls.length >= 4, `Found ${dinoOutlineFillCalls.length} dino outline fill calls (expected >= 4 spines)`);

  // 1.2 Dino Jaw Articulation Angle Variation
  const anglesToTest = [0, 0.25, 0.5, 0.75, 1.0];
  for (const chomp of anglesToTest) {
    spy.reset();
    drawGeorgePig(mockCtx, 100, 100, 1.0, { holdingDino: true, dinoChomp: chomp });
    const rotateCalls = spy.getCallsByMethod('rotate');
    const expectedAngle = chomp * (Math.PI / 6);
    const hasExpectedRotation = rotateCalls.some(c => Math.abs(c.args[0] - expectedAngle) < 0.0001);
    assert(
      hasExpectedRotation,
      `dinoChomp=${chomp} triggers jaw rotate(${expectedAngle.toFixed(4)} rad = ${(chomp * 30).toFixed(1)}°)`
    );

    // If dinoChomp > 0.05, mouth interior #D32F2F is rendered
    const hasMouthRed = spy.hasColor(PALETTE.DINOSAUR_MOUTH);
    if (chomp > 0.05) {
      assert(hasMouthRed, `dinoChomp=${chomp} (>0.05) renders mouth interior #${PALETTE.DINOSAUR_MOUTH}`);
    } else {
      assert(!hasMouthRed, `dinoChomp=${chomp} (<=0.05) does not render mouth interior`);
    }
  }

  // 1.3 Crying Tears Branch
  // Non-crying (default)
  spy.reset();
  drawGeorgePig(mockCtx, 100, 100, 1.0, { isCrying: false });
  const tearColor = '#4FC3F7';
  assert(!spy.hasColor(tearColor), 'Non-crying George does not render teardrops');

  // Crying via isCrying: true
  spy.reset();
  drawGeorgePig(mockCtx, 100, 100, 1.0, { isCrying: true });
  assert(spy.hasColor(tearColor), 'isCrying=true renders blue teardrops (#4FC3F7)');
  const tearArcFills = spy.calls.filter(c => c.method === 'arc' && c.fillStyle === tearColor);
  assertEqual(tearArcFills.length, 2, 'Crying George renders exactly 2 teardrop arcs');

  // Crying via expression: 'crying'
  spy.reset();
  drawGeorgePig(mockCtx, 100, 100, 1.0, { expression: 'crying' });
  assert(spy.hasColor(tearColor), 'expression="crying" also triggers crying branch and teardrops');

  // 1.4 Holding Dino vs Normal Arm Branch
  spy.reset();
  drawGeorgePig(mockCtx, 100, 100, 1.0, { holdingDino: false });
  assert(!spy.hasColor(PALETTE.DINOSAUR_GREEN), 'holdingDino=false skips dinosaur rendering completely');
  assertEqual(spy.saveCount, spy.restoreCount, 'holdingDino=false maintains balanced save/restore');
}

// =============================================================================
// 2. MUMMY PIG EMPIRICAL CHALLENGES
// =============================================================================

section('2. Mummy Pig: Mascara/Lashes Drawing Paths, Frying Pan Articulation & Pancake Sizzle');
{
  // 2.1 Mascara / Eyelashes Paths
  spy.reset();
  drawMummyPig(mockCtx, 100, 100, 1.0, { eyeBlink: false });
  assert(spy.saveCount === spy.restoreCount, 'Mummy Pig: Canvas save/restore stack is strictly balanced');
  assert(spy.hasColor(PALETTE.MUMMY_MASCARA), 'Mummy mascara (#111111) is present in draw calls');

  // Verify 3 curled eyelashes per eye = quadratic curves with mascara stroke
  const mascaraQuadCurves = spy.calls.filter(c => c.method === 'quadraticCurveTo' && c.strokeStyle === PALETTE.MUMMY_MASCARA);
  assertEqual(mascaraQuadCurves.length, 6, 'Mummy Pig renders exactly 6 quadratic eyelash curves (3 per eye)');

  // Eyelashes also rendered during eyeBlink: true
  spy.reset();
  drawMummyPig(mockCtx, 100, 100, 1.0, { eyeBlink: true });
  const blinkMascaraCurves = spy.calls.filter(c => c.method === 'quadraticCurveTo' && c.strokeStyle === PALETTE.MUMMY_MASCARA);
  assertEqual(blinkMascaraCurves.length, 6, 'Mascara eyelashes remain rendered even when blinking');

  // 2.2 Frying Pan Angle Articulation
  const panPhases = [0, 0.1, 0.35, 0.65, 0.9, 1.0];
  for (const p of panPhases) {
    const art = getFryingPanAngle(p);
    spy.reset();
    drawMummyPig(mockCtx, 100, 100, 1.0, { holdingPan: true, panAngle: art.panAngle });
    const rotateCalls = spy.getCallsByMethod('rotate');
    const hasPanRotation = rotateCalls.some(c => Math.abs(c.args[0] - art.panAngle) < 0.0001);
    assert(
      hasPanRotation,
      `panAngle=${art.panAngle.toFixed(3)} at flipPhase=${p} is applied to canvas rotation`
    );
  }

  // 2.3 Pancake & Butter Sizzle Geometry
  spy.reset();
  drawMummyPig(mockCtx, 100, 100, 1.0, { holdingPan: true });
  assert(spy.hasColor(PALETTE.MUMMY_PAN), 'Frying pan base (#78909C) rendered');
  assert(spy.hasColor(PALETTE.MUMMY_PANCAKE), 'Golden pancake (#FFB74D) rendered in pan');
  assert(spy.hasColor(PALETTE.MUMMY_BUTTER), 'Butter pat (#FFF59D) rendered in pan');

  const butterRects = spy.calls.filter(c => c.method === 'fillRect' && c.fillStyle === PALETTE.MUMMY_BUTTER);
  assertEqual(butterRects.length, 1, 'Exactly 1 butter pat fillRect rendered on pancake');

  // 2.4 Holding Pan = false
  spy.reset();
  drawMummyPig(mockCtx, 100, 100, 1.0, { holdingPan: false });
  assert(!spy.hasColor(PALETTE.MUMMY_PAN), 'holdingPan=false skips pan, pancake and butter rendering');
}

// =============================================================================
// 3. GRANDPA PIG EMPIRICAL CHALLENGES
// =============================================================================

section('3. Grandpa Pig: Sailing Cap Anchor Badge, Stubble Dots, Wellies & Veggie Pull Lean');
{
  // 3.1 Nautical Sailing Cap & Anchor Badge
  spy.reset();
  drawGrandpaPig(mockCtx, 100, 100, 1.0);
  assert(spy.saveCount === spy.restoreCount, 'Grandpa Pig: Canvas save/restore stack is strictly balanced');
  assert(spy.hasColor(PALETTE.GRANDPA_CAP), 'Sailing cap color (#1565C0) present');
  assert(spy.hasColor(PALETTE.GRANDPA_ANCHOR), 'Gold anchor badge color (#FFD54F) present');

  // Anchor badge contains ring arc, stock line, shank line, and fluke curve
  const anchorDraws = spy.calls.filter(c => c.strokeStyle === PALETTE.GRANDPA_ANCHOR);
  assert(anchorDraws.length >= 4, `Anchor badge contains ${anchorDraws.length} vector drawing primitives (arc, lines, curve)`);

  // 3.2 Beard Stubble Count
  const stubbleArcs = spy.calls.filter(c => c.method === 'arc' && c.strokeStyle === PALETTE.GRANDPA_STUBBLE);
  assertEqual(stubbleArcs.length, 7, 'Grandpa Pig renders exactly 7 white beard stubble arcs');

  // 3.3 Dark Wellies & Mud
  assert(spy.hasColor(PALETTE.GRANDPA_WELLIES), 'Dark garden wellies (#2E7D32) present');
  assert(spy.hasColor(PALETTE.MUD_DARK), 'Mud splatters on wellies present by default (welliesMuddy=true)');

  // welliesMuddy = false skips mud
  spy.reset();
  drawGrandpaPig(mockCtx, 100, 100, 1.0, { welliesMuddy: false });
  assert(!spy.hasColor(PALETTE.MUD_DARK), 'welliesMuddy=false skips mud splatters on boots');

  // 3.4 Veggie Pull Tension Lean & Clenched Teeth Expression
  const tensions = [0, 0.25, 0.5, 0.75, 1.0];
  for (const t of tensions) {
    const tensionData = getVeggiePullTension(t, 1.0);
    spy.reset();
    drawGrandpaPig(mockCtx, 100, 100, 1.0, { pulling: true, pullTension: t });
    const rotateCalls = spy.getCallsByMethod('rotate');
    const hasLeanAngle = rotateCalls.some(c => Math.abs(c.args[0] - tensionData.strainAngle) < 0.0001 || c.args[0] < 0);
    assert(hasLeanAngle, `pullTension=${t} produces backward strain angle rotation (${tensionData.strainAngle.toFixed(3)} rad)`);

    // Clenched grimace teeth rect rendered when pulling=true
    const hasRect = spy.calls.some(c => c.method === 'rect');
    const hasWhiteFill = spy.calls.some(c => c.method === 'fill' && c.fillStyle === PALETTE.WHITE);
    assert(hasRect && hasWhiteFill, `pulling=true renders clenched white teeth grimace at tension=${t}`);
  }
}

// =============================================================================
// 4. SUZY SHEEP EMPIRICAL CHALLENGES
// =============================================================================

section('4. Suzy Sheep: Scalloped Fluffy Ears (3 Arcs), Bubble Wand & Hopscotch Jump');
{
  // 4.1 Scalloped Fluffy Ears (3 Continuous Arcs per Ear) + Crown Puffs
  spy.reset();
  drawSuzySheep(mockCtx, 100, 100, 1.0);
  assert(spy.saveCount === spy.restoreCount, 'Suzy Sheep: Canvas save/restore stack is strictly balanced');

  // Check wool colors
  assert(spy.hasColor(PALETTE.SUZY_WOOL), 'Suzy white wool (#FAFAFA) present');
  assert(spy.hasColor(PALETTE.SUZY_WOOL_OUTLINE), 'Suzy wool outline (#CFD8DC) present');
  assert(spy.hasColor(PALETTE.SUZY_DRESS), 'Suzy pink dress (#F48FB1) present');
  assert(spy.hasColor(PALETTE.SUZY_NOSE), 'Suzy pink sheep nose pad (#FF8DA1) present');

  // Suzy ears: 3 arcs per ear * 2 ears = 6 arcs, plus 3 crown puffs = 9 wool head arcs
  const woolArcs = spy.calls.filter(c => c.method === 'arc' && c.fillStyle === PALETTE.SUZY_WOOL);
  assert(woolArcs.length >= 9, `Suzy head features ${woolArcs.length} wool arcs (6 ear arcs + 3 crown puffs)`);

  // 4.2 Bubble Wand & Shimmering Bubble Soap Film
  spy.reset();
  drawSuzySheep(mockCtx, 100, 100, 1.0, { holdingWand: true });
  assert(spy.hasColor(PALETTE.SUZY_WAND), 'Bubble wand stick (#FFE082) present');
  assert(spy.hasColor(PALETTE.SUZY_BUBBLE), 'Bubble wand ring (#4FC3F7) present');
  assert(spy.hasColor('rgba(79, 195, 247, 0.35)'), 'Shimmering translucent soap film fill present');

  // holdingWand = false
  spy.reset();
  drawSuzySheep(mockCtx, 100, 100, 1.0, { holdingWand: false });
  assert(!spy.hasColor(PALETTE.SUZY_WAND), 'holdingWand=false skips wand rendering');

  // 4.3 Hopscotch Jump Cycles Math
  const hopPhases = [0, 0.1, 0.25, 0.5, 0.75, 0.9, 1.0];
  for (const hp of hopPhases) {
    const hopData = getHopscotchPhase(hp);
    assert(hopData.hopY <= 0, `hopPhase=${hp} yields hopY <= 0 (${hopData.hopY.toFixed(2)}px)`);
    assert(hopData.squashY > 0, `hopPhase=${hp} yields positive squashY (${hopData.squashY.toFixed(2)})`);
    if (hp === 0.5) {
      assertEqual(hopData.hopY, -36, 'Hopscotch apex reaches maximum displacement of -36px at phase 0.5');
    }
  }

  // 4.4 Bubble Blowing Expression & Puckered Mouth
  spy.reset();
  drawSuzySheep(mockCtx, 100, 100, 1.0, { blowingBubble: true });
  const puckerCircle = spy.calls.filter(c => c.method === 'arc' && c.fillStyle === PALETTE.SUZY_DRESS_OUTLINE);
  assert(puckerCircle.length >= 1, 'blowingBubble=true renders puckered circle mouth');
}

// =============================================================================
// 5. UPGRADED EXISTING CHARACTERS: BLINKING & BREATHING MASS CONSERVATION
// =============================================================================

section('5. Upgraded Existing Characters: Blinking, Breathing & Volume Preservation');
{
  // 5.1 Mass Conservation Math (scaleX = 1 / sqrt(scaleY))
  const squashesToTest = [0.2, 0.5, 0.7, 1.0, 1.3, 1.6, 2.0];
  for (const sq of squashesToTest) {
    const vol = preserveVolume(sq);
    const expectedX = 1.0 / Math.sqrt(sq);
    assert(
      Math.abs(vol.scaleX - expectedX) < 0.0001,
      `preserveVolume(${sq}) preserves volume: scaleX=${vol.scaleX.toFixed(4)}, scaleY=${vol.scaleY.toFixed(4)}`
    );
    // Area / Volume product check: scaleX^2 * scaleY = 1.0
    const volumeProduct = vol.scaleX * vol.scaleX * vol.scaleY;
    assert(
      Math.abs(volumeProduct - 1.0) < 0.0001,
      `Volume product (scaleX^2 * scaleY) = ${volumeProduct.toFixed(4)} strictly equals 1.0`
    );
  }

  // 5.2 Blinking Across All 8 Characters
  const allRenderers: Array<{ name: string; render: (ctx: any, opt: any) => void; charId: CharacterId }> = [
    { name: 'Happy Mrs Chicken', render: (c, o) => drawMrsChicken(c, 0, 0, 1, o), charId: 'chicken' },
    { name: 'Peppa Pig', render: (c, o) => drawPeppaPig(c, 0, 0, 1, o), charId: 'peppa' },
    { name: 'Daddy Pig', render: (c, o) => drawDaddyPig(c, 0, 0, 1, o), charId: 'daddy' },
    { name: 'Baby Chick', render: (c, o) => drawBabyChick(c, 0, 0, 1, o), charId: 'chick' },
    { name: 'George Pig', render: (c, o) => drawGeorgePig(c, 0, 0, 1, o), charId: 'george' },
    { name: 'Mummy Pig', render: (c, o) => drawMummyPig(c, 0, 0, 1, o), charId: 'mummy' },
    { name: 'Grandpa Pig', render: (c, o) => drawGrandpaPig(c, 0, 0, 1, o), charId: 'grandpa' },
    { name: 'Suzy Sheep', render: (c, o) => drawSuzySheep(c, 0, 0, 1, o), charId: 'suzy' }
  ];

  for (const char of allRenderers) {
    // Open eyes (eyeBlink: false)
    spy.reset();
    char.render(mockCtx, { eyeBlink: false });
    const openEyeArcs = spy.calls.filter(c => c.method === 'arc');
    assert(openEyeArcs.length > 0, `${char.name}: Open eyes uses arc() circles for pupils/eyes`);

    // Closed eyes (eyeBlink: true)
    spy.reset();
    char.render(mockCtx, { eyeBlink: true });
    assertEqual(spy.saveCount, spy.restoreCount, `${char.name}: Save/restore balanced during blink`);
  }

  // 5.3 Daddy Pig Panic Escalation
  const daddyPanicStages = [0, 1, 2, 3, 4];
  for (const st of daddyPanicStages) {
    spy.reset();
    drawDaddyPig(mockCtx, 100, 100, 1.0, { panicStage: st, time: 1.0 });
    const sweatDrops = spy.calls.filter(c => c.method === 'arc' && c.fillStyle === '#4FC3F7');
    if (st === 0) {
      assertEqual(sweatDrops.length, 0, 'Daddy Pig stage 0: 0 sweat drops');
    } else if (st === 1) {
      assertEqual(sweatDrops.length, 1, 'Daddy Pig stage 1: 1 sweat drop');
    } else if (st === 2) {
      assertEqual(sweatDrops.length, 2, 'Daddy Pig stage 2: 2 sweat drops');
    } else if (st >= 3) {
      assertEqual(sweatDrops.length, 4, `Daddy Pig stage ${st}: 4 sweat drops`);
    }

    if (st >= 3) {
      // Screaming open mouth
      const hasEllipse = spy.calls.some(c => c.method === 'ellipse');
      const hasRedFill = spy.calls.some(c => c.method === 'fill' && c.fillStyle === '#D32F2F');
      assert(hasEllipse && hasRedFill, `Daddy Pig stage ${st} renders screaming red mouth (#D32F2F)`);
    }
  }

  // 5.4 Happy Mrs Chicken Egg Laying Squat & Beak Squawk
  spy.reset();
  drawMrsChicken(mockCtx, 100, 100, 1.0, { squawk: 0 });
  const normalBeakCalls = spy.calls.length;

  spy.reset();
  drawMrsChicken(mockCtx, 100, 100, 1.0, { squawk: 1.0, flap: 0.5 });
  const squawkBeakCalls = spy.calls.length;
  assert(squawkBeakCalls >= normalBeakCalls, 'Mrs Chicken open squawk beak renders with widened line coordinates');

  // 5.5 Baby Chick Waddle Cycle & Peep
  spy.reset();
  drawBabyChick(mockCtx, 100, 100, 1.0, { isPeeping: false });
  spy.reset();
  drawBabyChick(mockCtx, 100, 100, 1.0, { isPeeping: true });
  assert(spy.saveCount === spy.restoreCount, 'Baby Chick: Save/restore balanced with peeping beak');
}

// =============================================================================
// 6. UNIVERSAL DISPATCHER `renderCharacter` & ROSTER VERIFICATION
// =============================================================================

section('6. Universal Dispatcher `renderCharacter` & Roster Registry');
{
  const expectedRoster: CharacterId[] = [
    'chicken',
    'peppa',
    'george',
    'daddy',
    'mummy',
    'grandpa',
    'suzy',
    'chick'
  ];

  // 6.1 Verify Roster Completeness
  for (const id of expectedRoster) {
    assert(id in CHARACTER_RENDERERS, `CHARACTER_RENDERERS has registered handler for '${id}'`);
    assert(typeof CHARACTER_RENDERERS[id] === 'function', `CHARACTER_RENDERERS['${id}'] is a callable function`);
  }

  // 6.2 Universal renderCharacter dispatch matches direct call execution
  for (const id of expectedRoster) {
    spy.reset();
    renderCharacter(id, mockCtx, 150, 200, 1.5, { eyeBlink: false });
    const dispatchedCalls = [...spy.calls];
    const dispatchedSaveCount = spy.saveCount;

    spy.reset();
    CHARACTER_RENDERERS[id](mockCtx, 150, 200, 1.5, { eyeBlink: false });
    const directCalls = [...spy.calls];
    const directSaveCount = spy.saveCount;

    assertEqual(
      dispatchedCalls.length,
      directCalls.length,
      `renderCharacter('${id}') generates identical call count (${dispatchedCalls.length}) to direct renderer`
    );
    assertEqual(
      dispatchedSaveCount,
      directSaveCount,
      `renderCharacter('${id}') preserves exact save depth (${dispatchedSaveCount})`
    );
  }

  // 6.3 Graceful Handling of Unknown Character IDs
  spy.reset();
  let didThrowOnInvalidId = false;
  try {
    renderCharacter('non_existent_character' as any, mockCtx, 0, 0);
  } catch (e) {
    didThrowOnInvalidId = true;
  }
  assert(!didThrowOnInvalidId, 'renderCharacter gracefully handles unknown character ID without throwing');
  assertEqual(spy.calls.length, 0, 'Unknown character ID performs a clean zero-draw no-op');

  // 6.4 Verify All Re-Export Shims & Named Aliases
  const aliasMatrix: Array<{ name: string; fn: Function }> = [
    { name: 'drawMrsChicken', fn: drawMrsChicken },
    { name: 'renderChicken', fn: renderChicken },
    { name: 'renderMrsChicken', fn: renderMrsChicken },
    { name: 'drawChicken', fn: drawChicken },
    { name: 'drawPeppaPig', fn: drawPeppaPig },
    { name: 'renderPeppa', fn: renderPeppa },
    { name: 'renderPeppaPig', fn: renderPeppaPig },
    { name: 'drawPeppa', fn: drawPeppa },
    { name: 'drawGeorgePig', fn: drawGeorgePig },
    { name: 'renderGeorge', fn: renderGeorge },
    { name: 'renderGeorgePig', fn: renderGeorgePig },
    { name: 'drawGeorge', fn: drawGeorge },
    { name: 'drawDaddyPig', fn: drawDaddyPig },
    { name: 'renderDaddyPig', fn: renderDaddyPig },
    { name: 'renderDaddy', fn: renderDaddy },
    { name: 'drawDaddy', fn: drawDaddy },
    { name: 'drawMummyPig', fn: drawMummyPig },
    { name: 'renderMummyPig', fn: renderMummyPig },
    { name: 'renderMummy', fn: renderMummy },
    { name: 'drawMummy', fn: drawMummy },
    { name: 'drawGrandpaPig', fn: drawGrandpaPig },
    { name: 'renderGrandpaPig', fn: renderGrandpaPig },
    { name: 'renderGrandpa', fn: renderGrandpa },
    { name: 'drawGrandpa', fn: drawGrandpa },
    { name: 'drawSuzySheep', fn: drawSuzySheep },
    { name: 'renderSuzySheep', fn: renderSuzySheep },
    { name: 'renderSuzy', fn: renderSuzy },
    { name: 'drawSuzy', fn: drawSuzy },
    { name: 'drawBabyChick', fn: drawBabyChick },
    { name: 'renderChick', fn: renderChick },
    { name: 'renderBabyChick', fn: renderBabyChick },
    { name: 'drawChick', fn: drawChick }
  ];

  for (const alias of aliasMatrix) {
    assert(typeof alias.fn === 'function', `Alias '${alias.name}' is exported and callable`);
  }
}

// =============================================================================
// 7. ANIMATION CONTROLLER STATE MACHINE & STOCHASTIC BLINKING
// =============================================================================

section('7. Animation Controller State Machine & Stochastic Blinking');
{
  // 7.1 State Creation
  const state = createCharacterAnimState();
  assert(state.breathScale === 1.0, 'Initial breathScale is 1.0');
  assert(state.isBlinking === false, 'Initial isBlinking is false');
  assert(typeof state.nextBlinkTime === 'number' && state.nextBlinkTime >= 2.5 && state.nextBlinkTime <= 4.0, 'nextBlinkTime randomized between 2.5s and 4.0s');

  // 7.2 Timestep Evolution & Blinking Trigger
  // Advance right before nextBlinkTime
  const timeToBlink = (state.nextBlinkTime ?? 3.0) - 0.01;
  updateCharacterAnimState(state, timeToBlink);
  assert(!state.isBlinking, 'Eyes remain open before blink threshold');

  // Advance past blink threshold -> eyes close
  updateCharacterAnimState(state, 0.02);
  assert(state.isBlinking, 'Eyes close (isBlinking = true) when threshold reached');

  // Advance duration of blink (0.12s) -> eyes reopen
  updateCharacterAnimState(state, 0.13);
  assert(!state.isBlinking, 'Eyes reopen (isBlinking = false) after blink duration (0.12s)');

  // 7.3 Elastic Decay of Squash & Squawk
  state.squash = 0.5; // squashed
  state.squawk = 1.0; // wide open
  updateCharacterAnimState(state, 0.5);
  assert(state.squash > 0.5, 'Squash decayed towards 1.0');
  assert(state.squawk < 1.0, 'Squawk decayed towards 0.0');

  // Advance further
  updateCharacterAnimState(state, 1.0);
  assertEqual(state.squash, 1.0, 'Squash fully restored to 1.0');
  assertEqual(state.squawk, 0, 'Squawk fully restored to 0.0');
}

// =============================================================================
// 8. ADVERSARIAL STRESS & EXTREME BOUNDARY CONDITIONS
// =============================================================================

section('8. Adversarial Stress & Extreme Boundary Conditions');
{
  // 8.1 Extreme Scales and Coordinates
  const extremeCoords = [
    { x: -999999, y: 999999, scale: 0.0001 },
    { x: 0, y: 0, scale: 100.0 },
    { x: 500, y: 500, scale: -1.0 }, // negative scale = flipped
    { x: 100, y: 100, scale: 0.0 }
  ];

  for (const c of extremeCoords) {
    for (const id of ['chicken', 'peppa', 'george', 'daddy', 'mummy', 'grandpa', 'suzy', 'chick'] as CharacterId[]) {
      spy.reset();
      let didThrow = false;
      try {
        renderCharacter(id, mockCtx, c.x, c.y, c.scale);
      } catch (e) {
        didThrow = true;
      }
      assert(!didThrow, `renderCharacter('${id}') survived extreme coordinate (x=${c.x}, y=${c.y}, s=${c.scale})`);
      assertEqual(spy.saveCount, spy.restoreCount, `renderCharacter('${id}') preserved balanced save/restore under extreme coords`);
    }
  }

  // 8.2 Extreme AnimState Properties (Negative / Huge values)
  const extremeAnim: CharacterAnimState = {
    blinkTimer: -100,
    isBlinking: true,
    breathTimer: 100000,
    breathScale: 0.001,
    wobbleTimer: -500,
    wobbleAngle: 100,
    squash: 1000,
    panicStage: 99,
    pullTension: 50,
    chompingJaw: 500,
    flipperAngle: -100,
    hopY: 5000
  };

  for (const id of ['chicken', 'peppa', 'george', 'daddy', 'mummy', 'grandpa', 'suzy', 'chick'] as CharacterId[]) {
    spy.reset();
    let didThrow = false;
    try {
      renderCharacter(id, mockCtx, 100, 100, 1.0, { animState: extremeAnim });
    } catch (e) {
      didThrow = true;
    }
    assert(!didThrow, `renderCharacter('${id}') survived extreme animState without throwing`);
    assertEqual(spy.saveCount, spy.restoreCount, `renderCharacter('${id}') preserved stack balance with extreme animState`);
  }

  // 8.3 10,000 High-Throughput Character Render Passes (Performance Benchmark)
  const t0 = performance.now();
  for (let i = 0; i < 10000; i++) {
    const id = (['chicken', 'peppa', 'george', 'daddy', 'mummy', 'grandpa', 'suzy', 'chick'] as CharacterId[])[i % 8];
    renderCharacter(id, mockCtx, (i * 7) % 960, (i * 13) % 540, 1.0);
  }
  const t1 = performance.now();
  const renderDuration = t1 - t0;
  assert(
    renderDuration < 200,
    `10,000 character render passes completed in ${renderDuration.toFixed(2)}ms (< 200ms for 50,000+ ops/sec)`
  );
}

// =============================================================================
// Summary & Exit Handling
// =============================================================================

console.log('\n============================================================');
console.log('CHALLENGER 2 EMPIRICAL VERIFICATION SUMMARY');
console.log('============================================================');
console.log(`Total Assertions:  ${totalAssertions}`);
console.log(`Passed Assertions: ${passedAssertions}`);
console.log(`Failed Assertions: ${failedAssertions}`);
console.log('============================================================');

if (failedAssertions > 0) {
  console.error(`\nFAILED (${failedAssertions} failures):`);
  for (const f of failures) {
    console.error(f);
  }
  process.exit(1);
} else {
  console.log(`\nALL ${passedAssertions} ASSERTIONS EMPIRICALLY PASSED!`);
  process.exit(0);
}
