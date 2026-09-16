/**
 * Story Journey Type Definitions
 * Adventures of Trishu — The Grand Story Journey
 * Strictly under 500 Lines of Code
 */

import { GameModeId } from './game';

export type StoryChapterId = 1 | 2 | 3 | 4 | 5;

export type StoryBiome = 'farm' | 'home' | 'mud' | 'garden' | 'castle';

export interface StoryChapter {
  id: StoryChapterId;
  title: string;
  subtitle: string;
  emoji: string;
  biome: StoryBiome;
  bgGradient: [string, string];
  pathColor: string;
  stopIndices: number[]; // 0-based indices into STORY_STOPS
}

export interface StoryStopDef {
  index: number; // 0 to 15
  id: string; // e.g. 'stop_1_egg_laying'
  modeId: GameModeId;
  chapterId: StoryChapterId;
  title: string;
  subtitle: string;
  storyBlurb: string;
  victoryBlurb: string;
  goalDescription: string;
  goalTarget: number;
  stampId: string;
  stampEmoji: string;
  stampName: string;
  stampColor: string;
  nodeBgColor: string;
}

export interface StoryStopProgress {
  completed: boolean;
  stars: number; // 1 to 3
  bestScore: number;
  timestamp: number;
}

export interface StoryProgress {
  currentStopIndex: number; // 0 to 15
  completedStops: Record<string, StoryStopProgress>;
  passportStamps: string[]; // List of unlocked stampIds
  viewMode: 'journey' | 'grid';
  hasCompletedGrandFinale?: boolean;
}

export interface StoryIntroRequest {
  stopIndex: number;
  def: StoryStopDef;
}

export interface StoryVictoryRequest {
  stopIndex: number;
  def: StoryStopDef;
  score: number;
  stars: number;
  isNewStamp: boolean;
}
