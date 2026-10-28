import { describe, it, expect } from './e2e_runner.mjs';
import { EmojisLogic } from '../src/games/emojis/EmojisLogic';
import { GameEngine } from '../src/engine/GameEngine';
import { EmojisScene } from '../src/games/emojis/EmojisScene';

describe('Mode: Emojis Logic & Scene', () => {
  it('T-EMJ.01: Initializes 4 major emotion buttons and small emoji items', () => {
    const logic = new EmojisLogic();
    logic.reset(960, 540);

    expect(logic.majorButtons.length).toBe(4);
    const emotionIds = logic.majorButtons.map((b) => b.id);
    expect(emotionIds).toContain('HAPPY');
    expect(emotionIds).toContain('SAD');
    expect(emotionIds).toContain('ANGRY');
    expect(emotionIds).toContain('SURPRISE');

    expect(logic.smallEmojis.length).toBeGreaterThanOrEqual(20);
    expect(logic.currentEmotion).toBe('HAPPY');
  });

  it('T-EMJ.02: Selecting emotion updates currentEmotion, reaction timer and emits sparkles', () => {
    const logic = new EmojisLogic();
    logic.reset(960, 540);

    const resSad = logic.selectEmotion('SAD');
    expect(resSad.changed).toBe(true);
    expect(logic.currentEmotion).toBe('SAD');
    expect(logic.emotionReactionTimer).toBe(1.0);
    expect(logic.sparkles.length).toBeGreaterThan(0);
    expect(logic.score).toBe(2);

    const resAngry = logic.selectEmotion('ANGRY');
    expect(logic.currentEmotion).toBe('ANGRY');
    expect(logic.score).toBe(4);

    const resSurprise = logic.selectEmotion('SURPRISE');
    expect(logic.currentEmotion).toBe('SURPRISE');
    expect(logic.score).toBe(6);
  });

  it('T-EMJ.03: Tapping small emoji spawns bouncing entity with physics', () => {
    const logic = new EmojisLogic();
    logic.reset(960, 540);

    const entity = logic.tapSmallEmoji(0);
    expect(entity).toBeDefined();
    expect(entity?.emoji).toBe(logic.smallEmojis[0].emoji);
    expect(logic.bouncingEntities.length).toBe(1);
    expect(logic.score).toBe(1);

    // Physics step
    const initialY = entity!.y;
    const initialVy = entity!.vy;
    logic.update(0.016);
    expect(logic.bouncingEntities[0].y).not.toBe(initialY);
    expect(logic.bouncingEntities[0].vy).toBeGreaterThan(initialVy); // gravity applied
  });

  it('T-EMJ.04: Popping an entity by stage tap awards extra score and triggers burst', () => {
    const logic = new EmojisLogic();
    logic.reset(960, 540);

    const entity = logic.spawnEmojiEntity('⭐', 400, 300);
    const popped = logic.popEntityAt(400, 300);
    expect(popped).toBe(true);
    expect(logic.bouncingEntities.length).toBe(0);
    expect(logic.score).toBe(3);
  });

  it('T-EMJ.05: Party mode spawns cascade of emojis and sparkles', () => {
    const logic = new EmojisLogic();
    logic.reset(960, 540);

    logic.triggerParty();
    expect(logic.bouncingEntities.length).toBe(8);
    expect(logic.score).toBe(10);
  });

  it('T-EMJ.06: EmojisScene renders cleanly without canvas state leaks', () => {
    const canvas = document.createElement('canvas');
    const engine = new GameEngine(canvas);
    const scene = engine.scenes.get('EMOJIS') as EmojisScene;
    expect(scene).toBeDefined();

    scene.enter();
    const ctx = canvas.getContext('2d')!;
    let saveCount = 0;
    let restoreCount = 0;
    const origSave = ctx.save.bind(ctx);
    const origRestore = ctx.restore.bind(ctx);
    ctx.save = () => { saveCount++; origSave(); };
    ctx.restore = () => { restoreCount++; origRestore(); };

    scene.render(ctx, 1.0, engine.display);
    expect(saveCount).toBe(restoreCount);
  });
});
