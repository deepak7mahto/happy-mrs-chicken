/**
 * Mode 17: Grandpa's Muddy Kart 3D & TypeSafe AI Racing Unit Tests
 * Adventures of Trishu
 */

import { describe, test, expect, beforeEach } from './e2e_runner.mjs';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { MuddyKartLogic, SEGMENT_LENGTH } from '../src/games/muddy-kart/MuddyKartLogic';
import { MuddyKartRenderer } from '../src/games/muddy-kart/MuddyKartRenderer';
import { MuddyKartScene } from '../src/games/muddy-kart/MuddyKartScene';
import { typesafeRacing } from '../src/games/muddy-kart/typesafeRacing';
import { GameEngine } from '../src/engine/GameEngine';

describe('Mode 17: Grandpa\'s Muddy Kart 3D & TypeSafe AI', () => {
  let logic: MuddyKartLogic;

  beforeEach(() => {
    logic = new MuddyKartLogic();
  });

  test('T17.01: Track initializes with 300 segments and proper loop geometry', () => {
    expect(logic.segments.length).toBe(300);
    expect(logic.trackLength).toBe(300 * SEGMENT_LENGTH);
    expect(logic.player.x).toBe(0);
    expect(logic.player.z).toBe(0);
    expect(logic.player.lap).toBe(1);
  });

  test('T17.02: Forward acceleration and speed limits operate smoothly', () => {
    expect(logic.player.speed).toBe(0);
    // Simulate 1 second of forward driving
    for (let i = 0; i < 60; i++) {
      logic.update(0.016, 0);
    }
    expect(logic.player.speed).toBeGreaterThan(1000);
    expect(logic.player.distance).toBeGreaterThan(0);
    expect(logic.player.z).toBeGreaterThan(0);
  });

  test('T17.03: Steering bounds and centrifugal road curve pull', () => {
    // Steer right
    for (let i = 0; i < 30; i++) {
      logic.update(0.016, 1.0);
    }
    expect(logic.player.x).toBeGreaterThan(0);

    // Steer hard left to clamp
    for (let i = 0; i < 120; i++) {
      logic.update(0.016, -1.0);
    }
    expect(logic.player.x).toBeGreaterThanOrEqual(-1.75);
  });

  test('T17.04: Mud puddle collision triggers splash and score', () => {
    let splashTriggered = false;
    logic.onMudSplash = () => {
      splashTriggered = true;
    };

    // Find first segment with a mud puddle
    const puddleSeg = logic.segments.find(s => s.props.some(p => p.type === 'MUD_PUDDLE'));
    expect(puddleSeg).toBeDefined();
    if (puddleSeg) {
      const prop = puddleSeg.props.find(p => p.type === 'MUD_PUDDLE')!;
      logic.player.z = puddleSeg.index * SEGMENT_LENGTH;
      logic.player.x = prop.offset;
      logic.update(0.016, 0);

      expect(splashTriggered).toBe(true);
      expect(prop.collected).toBe(true);
      expect(logic.stats.mudSplashes).toBe(1);
      expect(logic.player.mudTimer).toBeGreaterThan(0);
    }
  });

  test('T17.05: Golden star collision builds combo and awards score', () => {
    let starTriggered = false;
    logic.onStarCollect = () => {
      starTriggered = true;
    };

    const starSeg = logic.segments.find(s => s.props.some(p => p.type === 'GOLDEN_STAR'));
    expect(starSeg).toBeDefined();
    if (starSeg) {
      const prop = starSeg.props.find(p => p.type === 'GOLDEN_STAR')!;
      logic.player.z = starSeg.index * SEGMENT_LENGTH;
      logic.player.x = prop.offset;
      logic.update(0.016, 0);

      expect(starTriggered).toBe(true);
      expect(prop.collected).toBe(true);
      expect(logic.stats.starsCollected).toBe(1);
      expect(logic.stats.combo).toBe(2);
    }
  });

  test('T17.06: Boost ramp launches kart in air with turbo speed', () => {
    let boostTriggered = false;
    logic.onBoostRamp = () => {
      boostTriggered = true;
    };

    const rampSeg = logic.segments.find(s => s.props.some(p => p.type === 'BOOST_RAMP'));
    expect(rampSeg).toBeDefined();
    if (rampSeg) {
      logic.player.z = rampSeg.index * SEGMENT_LENGTH;
      logic.player.x = 0;
      logic.update(0.016, 0);

      expect(boostTriggered).toBe(true);
      expect(logic.player.airVy).toBeGreaterThan(0);
      expect(logic.player.turboTimer).toBeGreaterThan(0);
      expect(logic.stats.boostCount).toBe(1);
    }
  });

  test('T17.07: TypeSafe AI Noul primitive evaluates steering assist need', () => {
    // Case 1: Player driving smoothly on road
    const normalResult = typesafeRacing.evaluateSteeringAssist({
      offRoadDurationSec: 0,
      recentSteerJitter: 0.5,
      missedCollectibles: 0,
      averageSpeed: 65,
      toddlerAgeBand: '2-5'
    });
    expect(normalResult.primitive).toBe('noul');
    expect(normalResult.probability).toBeLessThan(0.5);
    expect(normalResult.suggestedAction).toBe('MAINTAIN_NORMAL_PHYSICS');

    // Case 2: Player struggling off-road with erratic jitter
    const strugglingResult = typesafeRacing.evaluateSteeringAssist({
      offRoadDurationSec: 2.5,
      recentSteerJitter: 4.2,
      missedCollectibles: 3,
      averageSpeed: 15,
      toddlerAgeBand: '2-5'
    });
    expect(strugglingResult.probability).toBeGreaterThan(0.65);
    expect(strugglingResult.suggestedAction).toBe('APPLY_GENTLE_ROAD_MAGNET');
  });

  test('T17.08: TypeSafe AI Choice primitive evaluates calibrated trophy titles', () => {
    // High mud splashes -> Mud Puddle Champion
    const mudStats = {
      score: 12000,
      starsCollected: 3,
      mudSplashes: 12,
      combo: 3,
      maxCombo: 4,
      offRoadCount: 1,
      boostCount: 1,
      elapsedTime: 45,
      titleAwarded: ''
    };

    const trophyResult = typesafeRacing.evaluateTrophy({
      avatar: 'grandpa',
      stats: mudStats
    });

    expect(trophyResult.primitive).toBe('choice');
    expect(trophyResult.choice).toBe('The Mud Puddle Champion');
    expect(trophyResult.confidence).toBeGreaterThan(0.4);
    expect(trophyResult.distribution['The Mud Puddle Champion']).toBeDefined();
  });

  test('T17.09: MuddyKartScene renders without canvas state leaks', () => {
    const canvas = document.createElement('canvas');
    canvas.width = 360;
    canvas.height = 640;
    const engine = new GameEngine(canvas);
    const scene = new MuddyKartScene(engine);

    scene.enter();
    expect(scene.score).toBe(0);

    const ctx = canvas.getContext('2d')!;
    let saveCount = 0;
    let restoreCount = 0;
    const origSave = ctx.save.bind(ctx);
    const origRestore = ctx.restore.bind(ctx);

    ctx.save = () => {
      saveCount++;
      origSave();
    };
    ctx.restore = () => {
      restoreCount++;
      origRestore();
    };

    try {
      scene.render(ctx, 1.0, engine.display);
      expect(saveCount).toBeGreaterThan(0);
      expect(saveCount).toBe(restoreCount);
    } finally {
      ctx.save = origSave;
      ctx.restore = origRestore;
    }
  });

  test('T17.10: Quality Gate - All files under src/games/muddy-kart are strictly < 500 LOC', () => {
    const root = resolve(__dirname, '..');
    const files = [
      'src/games/muddy-kart/types.ts',
      'src/games/muddy-kart/typesafeRacing.ts',
      'src/games/muddy-kart/MuddyKartLogic.ts',
      'src/games/muddy-kart/MuddyKartRenderer.ts',
      'src/games/muddy-kart/MuddyKartScene.ts',
      'src/games/muddy-kart/index.ts'
    ];

    for (const f of files) {
      const content = readFileSync(resolve(root, f), 'utf8');
      const lines = content.split('\n').length;
      expect(lines).toBeLessThan(500);
    }
  });
});
