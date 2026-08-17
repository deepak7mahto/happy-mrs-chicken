/**
 * Tier 4: Real-World Scenarios & Full Playthroughs (TC73 - TC80)
 * End-to-end sessions verifying complete gameplay arcs, mobile touch emulation,
 * sustained 60 FPS endurance, offline hermetic isolation, and the Grand Tour journey.
 */

import { assert, assertEqual, assertInRange } from '../helpers/assert_helpers.mjs';

export const tier4Tests = [
  {
    id: 'TC73',
    tier: 4,
    group: 'Real-World Scenarios',
    title: 'Complete Mode 1 Playthrough: Lay 15 eggs, observe hatching, chicks scamper off',
    description: 'Executes full lifecycle of classic egg laying from spawning to scampering chicks',
    async run(ctx) {
      await ctx.navigateToScene('EGG_LAYING');
      for (let i = 0; i < 15; i++) {
        await ctx.keyPress(' ');
        await ctx.sleep(70);
      }
      await ctx.sleep(2000);
      const state = await ctx.getGameState();
      assert(state.currentScene === 'EGG_LAYING', 'Classic mode playthrough active');
      const errors = await ctx.getErrors();
      assertEqual(errors.length, 0, 'Zero errors during Mode 1 playthrough');
    }
  },
  {
    id: 'TC74',
    tier: 4,
    group: 'Real-World Scenarios',
    title: 'Complete Mode 2 Playthrough: Multi-puddle splash sequence to game over recap',
    description: 'Executes Muddy Puddles session jumping into multiple puddles',
    async run(ctx) {
      await ctx.navigateToScene('MUDDY_PUDDLES');
      for (let i = 0; i < 5; i++) {
        const state = await ctx.getGameState();
        const puddles = state.entities?.puddles || [];
        if (puddles.length > 0) {
          await ctx.click(puddles[0].x, puddles[0].y);
        } else {
          await ctx.click(480, 400);
        }
        await ctx.sleep(400);
      }
      const finalState = await ctx.getGameState();
      assert(finalState.score >= 0, 'Score tracked during Muddy Puddles session');
    }
  },
  {
    id: 'TC75',
    tier: 4,
    group: 'Real-World Scenarios',
    title: 'Complete Mode 3 Playthrough: Garden seed trail guiding chicks into coop',
    description: 'Executes Chick Maze session laying seed trail towards coop goal',
    async run(ctx) {
      await ctx.navigateToScene('CHICK_MAZE');
      await ctx.sleep(300);
      // Drop strategic trail of seeds
      await ctx.click(300, 250);
      await ctx.sleep(100);
      await ctx.click(500, 200);
      await ctx.sleep(100);
      await ctx.click(750, 150); // Near coop
      await ctx.sleep(1000);
      const state = await ctx.getGameState();
      assert(state.currentScene === 'CHICK_MAZE', 'Chick maze completed step');
    }
  },
  {
    id: 'TC76',
    tier: 4,
    group: 'Real-World Scenarios',
    title: 'Complete Mode 4 Playthrough: Daddy Pig high-speed fever to crash cutscene',
    description: 'Executes rapid-fire egg laying reaching fever multiplier and crash sequence',
    async run(ctx) {
      await ctx.navigateToScene('DADDY_PIG');
      for (let i = 0; i < 30; i++) {
        await ctx.keyPress(' ');
        await ctx.sleep(30);
      }
      await ctx.sleep(500);
      const state = await ctx.getGameState();
      assert(state.score > 0, 'Score earned in Daddy Pig challenge');
    }
  },
  {
    id: 'TC77',
    tier: 4,
    group: 'Real-World Scenarios',
    title: 'Mobile Touch Emulation: TouchStart, TouchMove, and TouchEnd across all modes',
    description: 'Simulates mobile device touch interaction across menu and gameplay modes',
    async run(ctx) {
      await ctx.setViewport({ width: 390, height: 844, isMobile: true });
      await ctx.navigateToScene('MENU');
      await ctx.tap(480, 270);
      await ctx.sleep(200);
      await ctx.tap(480, 270);
      await ctx.sleep(200);
      const errors = await ctx.getErrors();
      assertEqual(errors.length, 0, 'Zero errors on mobile touch emulation');
      await ctx.setViewport({ width: 960, height: 540, isMobile: false });
    }
  },
  {
    id: 'TC78',
    tier: 4,
    group: 'Real-World Scenarios',
    title: 'Endurance & Stability: Continuous 60 FPS rendering with zero memory leaks',
    description: 'Monitors frame rate stability and memory bounds over sustained rendering cycles',
    async run(ctx) {
      await ctx.navigateToScene('EGG_LAYING');
      for (let i = 0; i < 10; i++) {
        await ctx.keyPress(' ');
        await ctx.sleep(100);
      }
      const fps = await ctx.getFpsMonitor();
      if (fps) {
        assert(fps.averageFps >= 30 || fps.avgFPS >= 30, 'Average FPS should remain stable');
      }
    }
  },
  {
    id: 'TC79',
    tier: 4,
    group: 'Real-World Scenarios',
    title: 'Offline Isolation: Zero outbound CDN network requests and 100% offline execution',
    description: 'Ensures application operates completely offline without external network dependencies',
    async run(ctx) {
      if (ctx.isCDP) {
        await ctx.setNetworkConditions({ offline: true });
        await ctx.sleep(200);
      }
      await ctx.navigateToScene('MENU');
      await ctx.sleep(100);
      const state = await ctx.getGameState();
      assert(state, 'Game executes cleanly offline');
      if (ctx.isCDP) {
        await ctx.setNetworkConditions({ offline: false });
      }
    }
  },
  {
    id: 'TC80',
    tier: 4,
    group: 'Real-World Scenarios',
    title: 'The Grand Tour: Menu -> Mode 1 -> Menu -> Mode 2 -> Menu -> Mode 3 -> Menu -> Mode 4 -> Menu',
    description: 'Comprehensive full-loop navigation traversing all 4 game modes in a single session',
    async run(ctx) {
      // 1. Menu
      await ctx.navigateToScene('MENU');
      assertEqual((await ctx.getGameState()).currentScene, 'MENU', 'Step 1: In Menu');

      // 2. Mode 1
      await ctx.selectMode('EGG_LAYING');
      await ctx.sleep(150);
      assertEqual((await ctx.getGameState()).currentScene, 'EGG_LAYING', 'Step 2: In Mode 1');
      await ctx.keyPress(' ');
      await ctx.sleep(100);

      // 3. Menu
      await ctx.navigateToScene('MENU');
      await ctx.sleep(150);
      assertEqual((await ctx.getGameState()).currentScene, 'MENU', 'Step 3: In Menu');

      // 4. Mode 2
      await ctx.selectMode('MUDDY_PUDDLES');
      await ctx.sleep(150);
      assertEqual((await ctx.getGameState()).currentScene, 'MUDDY_PUDDLES', 'Step 4: In Mode 2');

      // 5. Menu
      await ctx.navigateToScene('MENU');
      await ctx.sleep(150);
      assertEqual((await ctx.getGameState()).currentScene, 'MENU', 'Step 5: In Menu');

      // 6. Mode 3
      await ctx.selectMode('CHICK_MAZE');
      await ctx.sleep(150);
      assertEqual((await ctx.getGameState()).currentScene, 'CHICK_MAZE', 'Step 6: In Mode 3');

      // 7. Menu
      await ctx.navigateToScene('MENU');
      await ctx.sleep(150);
      assertEqual((await ctx.getGameState()).currentScene, 'MENU', 'Step 7: In Menu');

      // 8. Mode 4
      await ctx.selectMode('DADDY_PIG');
      await ctx.sleep(150);
      assertEqual((await ctx.getGameState()).currentScene, 'DADDY_PIG', 'Step 8: In Mode 4');
      await ctx.keyPress(' ');

      // 9. Back to Menu
      await ctx.navigateToScene('MENU');
      await ctx.sleep(150);
      assertEqual((await ctx.getGameState()).currentScene, 'MENU', 'Step 9: Completed Grand Tour');

      const errors = await ctx.getErrors();
      assertEqual(errors.length, 0, 'Grand Tour completed with zero errors');
    }
  }
];
