import { describe, test, expect } from './e2e_runner.mjs';
import {
  STORY_CHAPTERS,
  STORY_STOPS,
  getStoryStopByIndex,
  getStoryStopByModeId,
  getNextStoryStop,
  getChapterByStopIndex
} from '../src/story/storyData';
import { StorageManager } from '../src/engine/StorageManager';
import { GameEngine } from '../src/engine/GameEngine';
import { StoryMapRenderer } from '../src/story/storyMapRenderer';
import { MenuScene } from '../src/games/menu/MenuScene';
import { EggLayingScene } from '../src/games/egg-laying/EggLayingScene';
import { DadKitchenScene } from '../src/games/dad-kitchen/DadKitchenScene';
import { DuckPicnicScene } from '../src/games/duck-picnic/DuckPicnicScene';

describe('Tier 10: Story Journey Narrative & Adventure Map', () => {
  test('T10.01: Story Data - 5 chapters and 16 stops have complete metadata, biomes, goals, and stamps', () => {
    expect(STORY_CHAPTERS.length).toBe(5);
    expect(STORY_STOPS.length).toBe(16);

    // Verify all 5 chapters with their distinct biomes
    const expectedBiomes = ['farm', 'home', 'mud', 'garden', 'castle'];
    for (let i = 0; i < STORY_CHAPTERS.length; i++) {
      const ch = STORY_CHAPTERS[i];
      expect(ch.id).toBe(i + 1);
      expect(ch.title.length).toBeGreaterThan(0);
      expect(ch.subtitle.length).toBeGreaterThan(0);
      expect(ch.emoji.length).toBeGreaterThan(0);
      expect(expectedBiomes.includes(ch.biome)).toBe(true);
      expect(ch.stopIndices.length).toBeGreaterThan(0);
    }

    // Verify all 16 stops
    for (let i = 0; i < STORY_STOPS.length; i++) {
      const stop = STORY_STOPS[i];
      expect(stop.index).toBe(i);
      expect(stop.id.startsWith('stop_')).toBe(true);
      expect(stop.modeId.length).toBeGreaterThan(0);
      expect(stop.chapterId).toBeGreaterThanOrEqual(1);
      expect(stop.chapterId).toBeLessThanOrEqual(5);
      expect(stop.title.length).toBeGreaterThan(0);
      expect(stop.subtitle.length).toBeGreaterThan(0);
      expect(stop.storyBlurb.length).toBeGreaterThan(0);
      expect(stop.victoryBlurb.length).toBeGreaterThan(0);
      expect(stop.goalDescription.length).toBeGreaterThan(0);
      expect(stop.goalTarget).toBeGreaterThan(0);
      expect(stop.stampId.startsWith('stamp_')).toBe(true);
      expect(stop.stampEmoji.length).toBeGreaterThan(0);
      expect(stop.stampName.length).toBeGreaterThan(0);
    }

    // Helper lookups
    expect(getStoryStopByIndex(0)?.modeId).toBe('EGG_LAYING');
    expect(getStoryStopByIndex(15)?.modeId).toBe('WINDY_KITE');
    expect(getStoryStopByModeId('CAR_WASH')?.index).toBe(7);
    expect(getNextStoryStop(0)?.index).toBe(1);
    expect(getNextStoryStop(15)).toBe(undefined);
    expect(getChapterByStopIndex(0)?.biome).toBe('farm');
    expect(getChapterByStopIndex(15)?.biome).toBe('castle');
  });

  test('T10.02: StorageManager - Story progress tracking, stop completion, star ratings, and passport stamps', () => {
    localStorage.clear();
    const storage = new StorageManager();
    const progress = storage.getStoryProgress();
    expect(progress.currentStopIndex).toBe(0);
    expect(Array.isArray(progress.passportStamps)).toBe(true);
    expect(storage.hasPassportStamp('stamp_golden_egg')).toBe(false);

    // Complete stop 0 (Golden Egg Stamp)
    const stop0 = STORY_STOPS[0];
    storage.completeStoryStop(0, 100, 3);
    const updated = storage.getStoryProgress();
    expect(updated.completedStops[stop0.id]?.completed).toBe(true);
    expect(updated.completedStops[stop0.id]?.stars).toBe(3);
    expect(updated.completedStops[stop0.id]?.bestScore).toBe(100);
    expect(updated.currentStopIndex).toBe(1); // Auto-advanced to next stop
    expect(storage.hasPassportStamp('stamp_golden_egg')).toBe(true);
    expect(updated.passportStamps.includes('stamp_golden_egg')).toBe(true);

    // Completing with higher score updates stars and bestScore
    storage.completeStoryStop(0, 250, 3);
    expect(storage.getStoryProgress().completedStops[stop0.id]?.bestScore).toBe(250);
  });

  test('T10.03: StorageManager - View mode switching (journey <-> grid) and stop index clamping', () => {
    localStorage.clear();
    const storage = new StorageManager();
    expect(storage.getStoryViewMode()).toBe('journey');

    storage.setStoryViewMode('grid');
    expect(storage.getStoryViewMode()).toBe('grid');

    storage.setStoryViewMode('journey');
    expect(storage.getStoryViewMode()).toBe('journey');

    // Index clamping
    storage.setCurrentStoryStopIndex(5);
    expect(storage.getCurrentStoryStopIndex()).toBe(5);

    storage.setCurrentStoryStopIndex(99);
    expect(storage.getCurrentStoryStopIndex()).toBe(15);

    storage.setCurrentStoryStopIndex(-5);
    expect(storage.getCurrentStoryStopIndex()).toBe(0);
  });

  test('T10.04: GameEngine - launchStoryStop, activeStoryStopIndex, and story victory triggering', () => {
    localStorage.clear();
    const canvas = document.createElement('canvas');
    const engine = new GameEngine(canvas);

    let introStopIndex: number | null = null;
    let victoryStopIndex: number | null = null;
    let victoryScore: number = 0;
    let victoryStars: number = 0;
    let victoryNewStamp: boolean = false;

    engine.onStoryIntroCallback = (stopIndex) => { introStopIndex = stopIndex; };
    engine.onStoryVictoryCallback = (stopIndex, score, stars, isNewStamp) => {
      victoryStopIndex = stopIndex;
      victoryScore = score;
      victoryStars = stars;
      victoryNewStamp = isNewStamp;
    };

    // Launch story stop 1 (Chick Maze)
    engine.launchStoryStop(1, true);
    expect(engine.activeStoryStopIndex).toBe(1);
    expect(engine.currentSceneId).toBe('CHICK_MAZE');
    expect(introStopIndex).toBe(1);

    // Trigger victory on stop 1
    engine.triggerStoryVictory(500, 3);
    expect(victoryStopIndex).toBe(1);
    expect(victoryStars).toBe(3);
    expect(victoryScore).toBe(500);
    expect(victoryNewStamp).toBe(true);
    expect(engine.storage.hasPassportStamp('stamp_fluffy_chick')).toBe(true);

    engine.destroy();
  });

  test('T10.05: StoryMapRenderer - Biome layout generation, responsive trail coordinates, and node positioning', () => {
    const canvas = document.createElement('canvas');
    const engine = new GameEngine(canvas);
    const renderer = new StoryMapRenderer();

    // Portrait layout
    engine.display.isPortrait = true;
    engine.display.vWidth = 540;
    engine.display.vHeight = 960;
    const portraitNodes = renderer.getNodeLayout(engine.display, engine);
    expect(portraitNodes.length).toBe(16);
    expect(portraitNodes[0].y).toBeLessThan(portraitNodes[15].y); // Monotonically progresses downwards
    expect(renderer.getTotalContentHeight(engine.display)).toBeGreaterThan(engine.display.vHeight);

    // Landscape layout
    engine.display.isPortrait = false;
    engine.display.vWidth = 960;
    engine.display.vHeight = 540;
    const landscapeNodes = renderer.getNodeLayout(engine.display, engine);
    expect(landscapeNodes.length).toBe(16);
    expect(landscapeNodes[0].y).toBeLessThan(landscapeNodes[15].y);
    expect(renderer.getTotalContentHeight(engine.display)).toBeGreaterThan(engine.display.vHeight);

    engine.destroy();
  });

  test('T10.06: StoryMapRenderer - Tap hit testing accurately identifies tapped stop node and continue banner', () => {
    localStorage.clear();
    const canvas = document.createElement('canvas');
    const engine = new GameEngine(canvas);
    const renderer = new StoryMapRenderer();

    engine.display.isPortrait = true;
    engine.display.vWidth = 540;
    engine.display.vHeight = 960;
    const nodes = renderer.getNodeLayout(engine.display, engine);

    // Stop 0 is unlocked by default: tapping it returns true and launches stop 0
    const tappedNode = renderer.handleTap(nodes[0].x, nodes[0].y, engine.display, engine, 0);
    expect(tappedNode).toBe(true);
    expect(engine.currentSceneId).toBe('EGG_LAYING');

    // Tapping empty space returns false
    const tappedEmpty = renderer.handleTap(0, 0, engine.display, engine, 0);
    expect(tappedEmpty).toBe(false);

    // Bottom banner tap: x at center, y near bottom
    const vWidth = engine.display.vWidth;
    const vHeight = engine.display.vHeight;
    const tappedBanner = renderer.handleTap(vWidth / 2, vHeight - 40, engine.display, engine, 0);
    expect(tappedBanner).toBe(true);

    engine.destroy();
  });

  test('T10.07: MenuScene - Dual-mode switching, toggle tap hit-testing, and story map vs grid delegation', () => {
    localStorage.clear();
    const canvas = document.createElement('canvas');
    const engine = new GameEngine(canvas);
    engine.storage.setStoryViewMode('journey');
    const menu = engine.scenes.get('MENU') as MenuScene;
    menu.enter();

    expect(menu.viewMode).toBe('journey');

    // Tap toggle switch to switch to grid
    const vWidth = engine.display.vWidth;
    // Right tab is Free Play: x ~ vWidth / 2 + 65, y ~ 52
    menu.handleTap(vWidth / 2 + 65, 52);
    expect(menu.viewMode).toBe('grid');
    expect(engine.storyViewMode).toBe('grid');

    // Tap toggle switch back to journey
    // Left tab is Story Journey: x ~ vWidth / 2 - 65, y ~ 52
    menu.handleTap(vWidth / 2 - 65, 52);
    expect(menu.viewMode).toBe('journey');
    expect(engine.storyViewMode).toBe('journey');

    engine.destroy();
  });

  test('T10.08: In-game Story Goals - checkStoryGoal triggers victory on reaching target milestones', () => {
    localStorage.clear();
    const canvas = document.createElement('canvas');
    const engine = new GameEngine(canvas);

    let victoryTriggered = false;
    engine.onStoryVictoryCallback = () => { victoryTriggered = true; };

    // Mode 1: Egg Laying (Stop 0)
    engine.launchStoryStop(0, false);
    const eggScene = engine.scenes.get('EGG_LAYING') as EggLayingScene;
    eggScene.enter();
    expect(eggScene.storyGoalTriggered).toBe(false);

    // Hatch 5 chicks
    eggScene.chicks = [{}, {}, {}, {}, {}] as any;
    eggScene.checkStoryGoal(eggScene.chicks.length);
    expect(eggScene.storyGoalTriggered).toBe(true);
    expect(victoryTriggered).toBe(true);

    // Mode 4: Dad's Kitchen (Stop 3, target 6)
    victoryTriggered = false;
    engine.launchStoryStop(3, false);
    const dadScene = engine.scenes.get('DADDY_PIG') as DadKitchenScene;
    dadScene.enter();
    expect(dadScene.storyGoalTriggered).toBe(false);

    for (let i = 0; i < 6; i++) {
      dadScene.tap();
    }
    expect(dadScene.storyGoalTriggered).toBe(true);
    expect(victoryTriggered).toBe(true);

    // Mode 16: Duck Picnic (Stop 14, target 6)
    victoryTriggered = false;
    engine.launchStoryStop(14, false);
    const duckScene = engine.scenes.get('DUCK_PICNIC') as DuckPicnicScene;
    duckScene.enter();
    expect(duckScene.storyGoalTriggered).toBe(false);

    duckScene.foodsFedCount = 6;
    duckScene.checkStoryGoal(duckScene.foodsFedCount, 6);
    expect(duckScene.storyGoalTriggered).toBe(true);
    expect(victoryTriggered).toBe(true);

    engine.destroy();
  });
});
