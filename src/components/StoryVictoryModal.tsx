/**
 * Story Victory & Stamp Award Modal
 * Adventures of Trishu — The Grand Story Journey
 * Strictly under 500 Lines of Code
 */

import React, { useCallback, useEffect } from 'react';
import { StoryStopDef } from '../types/story';
import { soundEngine } from '../engine/SoundEngine';
import { Haptics } from '../engine/Haptics';

interface StoryVictoryModalProps {
  isOpen: boolean;
  stopDef: StoryStopDef | null;
  score: number;
  stars: number;
  isNewStamp: boolean;
  hasNext: boolean;
  onNextStop: () => void;
  onReplay: () => void;
  onBackToMap: () => void;
}

export const StoryVictoryModal: React.FC<StoryVictoryModalProps> = ({
  isOpen,
  stopDef,
  stars,
  isNewStamp,
  hasNext,
  onNextStop,
  onReplay,
  onBackToMap
}) => {
  useEffect(() => {
    if (isOpen) {
      soundEngine.playVictoryFanfare();
      Haptics.fanfare();
    }
  }, [isOpen]);

  const handleNext = useCallback(() => {
    soundEngine.playSFX('fanfare');
    Haptics.medium();
    onNextStop();
  }, [onNextStop]);

  const handleReplay = useCallback(() => {
    soundEngine.playSFX('click');
    Haptics.tap();
    onReplay();
  }, [onReplay]);

  const handleBackToMap = useCallback(() => {
    soundEngine.playSFX('click');
    Haptics.tap();
    onBackToMap();
  }, [onBackToMap]);

  if (!isOpen || !stopDef) return null;

  const starString = '⭐'.repeat(Math.max(1, Math.min(3, stars)));

  return (
    <div
      className="modal-backdrop"
      role="button"
      tabIndex={0}
      aria-label="Story Victory Dialog"
      onKeyDown={(e) => {
        if (e.key === 'Escape') handleBackToMap();
        if (e.key === 'Enter' || e.key === ' ') {
          if (hasNext) handleNext();
          else handleBackToMap();
        }
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleBackToMap();
      }}
    >
      <div className="modal-card story-victory-card">
        {/* Header Title */}
        <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#E65100', margin: '4px 0' }}>
          Stop Complete! 🎉
        </h2>

        {/* Stamped Seal Box */}
        <div className="story-victory-stamp-box" aria-hidden="true">
          {stopDef.stampEmoji}
        </div>

        {/* Stamp Award Label */}
        <div className="story-victory-stamp-name">
          {isNewStamp ? '🌟 New Passport Stamp! 🌟' : 'Stamp Collected!'}
        </div>
        <div style={{ fontSize: '1rem', fontWeight: 800, color: '#37474F', marginBottom: 8 }}>
          {stopDef.stampName}
        </div>

        {/* Stars */}
        <div className="story-victory-stars" aria-label={`${stars} stars`}>
          {starString}
        </div>

        {/* Story Victory Blurb */}
        <p className="story-victory-blurb">
          {stopDef.victoryBlurb}
        </p>

        {/* Action Buttons */}
        <div className="story-victory-actions">
          {hasNext ? (
            <button
              type="button"
              className="story-victory-next-btn"
              onClick={handleNext}
            >
              Next Adventure! ➡️
            </button>
          ) : (
            <button
              type="button"
              className="story-victory-next-btn"
              onClick={handleBackToMap}
              style={{ background: 'linear-gradient(180deg, #FFB300 0%, #F57F17 100%)', borderColor: '#E65100' }}
            >
              🏆 Complete Grand Journey! 🏆
            </button>
          )}

          <div className="story-victory-sub-btns">
            <button
              type="button"
              className="story-victory-sub-btn"
              onClick={handleReplay}
            >
              🔄 Play Again
            </button>
            <button
              type="button"
              className="story-victory-sub-btn"
              onClick={handleBackToMap}
            >
              🗺️ Story Map
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
