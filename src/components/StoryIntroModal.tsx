/**
 * Story Intro Modal
 * Adventures of Trishu — The Grand Story Journey
 * Strictly under 500 Lines of Code
 */

import React, { useCallback } from 'react';
import { StoryStopDef } from '../types/story';
import { getChapterByStopIndex } from '../story/storyData';
import { soundEngine } from '../engine/SoundEngine';
import { Haptics } from '../engine/Haptics';

interface StoryIntroModalProps {
  isOpen: boolean;
  stopDef: StoryStopDef | null;
  onStart: () => void;
  onClose: () => void;
}

export const StoryIntroModal: React.FC<StoryIntroModalProps> = ({
  isOpen,
  stopDef,
  onStart,
  onClose
}) => {
  const handleStart = useCallback(() => {
    soundEngine.playSFX('fanfare');
    Haptics.medium();
    onStart();
  }, [onStart]);

  const handleClose = useCallback(() => {
    soundEngine.playSFX('click');
    Haptics.tap();
    onClose();
  }, [onClose]);

  if (!isOpen || !stopDef) return null;

  const chapter = getChapterByStopIndex(stopDef.index);

  return (
    <div
      className="modal-backdrop"
      role="button"
      tabIndex={0}
      aria-label="Story Intro Dialog"
      onKeyDown={(e) => {
        if (e.key === 'Escape') handleClose();
        if (e.key === 'Enter' || e.key === ' ') handleStart();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="modal-card story-intro-card">
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close Story Intro"
          className="modal-close-btn"
        >
          ✕
        </button>

        {/* Chapter Pill */}
        {chapter && (
          <div className="story-intro-chapter-pill">
            {chapter.emoji} Chapter {chapter.id}: {chapter.title}
          </div>
        )}

        {/* Big Animated Emoji */}
        <div className="story-intro-emoji-banner" aria-hidden="true">
          {stopDef.stampEmoji}
        </div>

        {/* Stop Title */}
        <h2 className="story-intro-title">
          Stop {stopDef.index + 1}: {stopDef.title}
        </h2>

        {/* Story Blurb */}
        <p className="story-intro-blurb">
          {stopDef.storyBlurb}
        </p>

        {/* Goal Box */}
        <div className="story-intro-goal-box">
          <span>🎯</span>
          <span>Goal: <strong>{stopDef.goalDescription}</strong></span>
        </div>

        {/* Giant Start Button */}
        <button
          type="button"
          className="story-intro-start-btn"
          onClick={handleStart}
        >
          Let's Play! 🚀
        </button>
      </div>
    </div>
  );
};
