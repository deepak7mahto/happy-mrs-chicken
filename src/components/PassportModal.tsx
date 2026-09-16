/**
 * Adventure Passport & Collectible Stamp Album Modal
 * Adventures of Trishu — The Grand Story Journey
 * Strictly under 500 Lines of Code
 */

import React, { useCallback } from 'react';
import { STORY_STOPS } from '../story/storyData';
import { StorageManager } from '../engine/StorageManager';
import { soundEngine } from '../engine/SoundEngine';
import { Haptics } from '../engine/Haptics';

interface PassportModalProps {
  isOpen: boolean;
  storage: StorageManager;
  onClose: () => void;
  onSelectStop?: (stopIndex: number) => void;
}

export const PassportModal: React.FC<PassportModalProps> = ({
  isOpen,
  storage,
  onClose,
  onSelectStop
}) => {
  const handleClose = useCallback(() => {
    soundEngine.playSFX('click');
    Haptics.tap();
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  const progress = storage.getStoryProgress();
  const stamps = progress.passportStamps;
  const totalStamps = stamps.length;
  const isAllComplete = totalStamps >= STORY_STOPS.length;

  let totalStars = 0;
  for (const s of Object.values(progress.completedStops)) {
    totalStars += s.stars || 0;
  }

  return (
    <div
      className="modal-backdrop"
      role="button"
      tabIndex={0}
      aria-label="Adventure Passport Dialog"
      onKeyDown={(e) => {
        if (e.key === 'Escape') handleClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="modal-card passport-modal-card">
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close Passport"
          className="modal-close-btn"
        >
          ✕
        </button>

        {/* Header */}
        <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#E65100', margin: '4px 0 6px' }}>
          Adventure Passport 📖
        </h2>
        <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#5D4037', marginBottom: 12 }}>
          Stamps: {totalStamps} / {STORY_STOPS.length} • Stars: ⭐ {totalStars}
        </div>

        {/* Grand Finale Trophy Banner if all collected */}
        {isAllComplete && (
          <div style={{
            background: 'linear-gradient(90deg, #FFD54F 0%, #FFB300 100%)',
            border: '2.5px solid #FF8F00',
            borderRadius: 16,
            padding: '8px 12px',
            color: '#3E2723',
            fontWeight: 900,
            fontSize: '0.9rem',
            marginBottom: 10
          }}>
            🏆 Grand Master Explorer Trophy Unlocked! 🏆
          </div>
        )}

        {/* 16-Stamp Grid */}
        <div className="passport-grid">
          {STORY_STOPS.map((stop, idx) => {
            const isUnlocked = stamps.includes(stop.stampId);
            const stopProgress = progress.completedStops[stop.id];
            const stars = stopProgress?.stars || (isUnlocked ? 3 : 0);

            return (
              <button
                type="button"
                key={stop.id}
                disabled={!isUnlocked || !onSelectStop}
                aria-label={isUnlocked ? `${stop.title}, Stop ${idx + 1}` : `Stop ${idx + 1}, locked`}
                className={`passport-slot ${isUnlocked ? 'unlocked' : ''}`}
                style={{
                  cursor: isUnlocked && onSelectStop ? 'pointer' : 'default',
                  border: 'none',
                  background: 'none',
                  padding: 0,
                  font: 'inherit',
                  textAlign: 'inherit'
                }}
                onClick={() => {
                  if (isUnlocked && onSelectStop) {
                    soundEngine.playSFX('click');
                    Haptics.tap();
                    onSelectStop(idx);
                    onClose();
                  }
                }}
              >
                <div className="passport-slot-emoji">
                  {isUnlocked ? stop.stampEmoji : '🔒'}
                </div>
                <div className="passport-slot-index">
                  Stop {idx + 1}
                </div>
                <div className="passport-slot-name">
                  {isUnlocked ? stop.stampName : 'Locked'}
                </div>
                {isUnlocked && (
                  <div style={{ fontSize: '0.65rem', marginTop: 1 }}>
                    {'⭐'.repeat(stars)}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer info */}
        <p style={{ fontSize: '0.78rem', color: '#795548', margin: '4px 0 0' }}>
          Complete each story adventure stop to collect all 16 passport stamps!
        </p>
      </div>
    </div>
  );
};
