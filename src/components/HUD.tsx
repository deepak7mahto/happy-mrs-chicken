import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GameEngine } from '../engine/GameEngine';
import { storageManager } from '../engine/StorageManager';
import { soundEngine } from '../engine/SoundEngine';
import { Haptics } from '../engine/Haptics';
import { AVATAR_ROSTER } from '../types/characters';
import { STORY_STOPS } from '../story/storyData';

interface HUDProps {
  engine: GameEngine | null;
  currentMode: string;
  isMuted: boolean;
  canInstall?: boolean;
  onOpenInstall?: () => void;
  onOpenSettings?: () => void;
  onOpenAvatarSelect?: () => void;
  onOpenPassport?: () => void;
  onToggleMute: () => void;
  onToggleFullscreen: () => void;
  onGoHome: () => void;
}

const HOLD_DURATION_MS = 3000;

export const HUD: React.FC<HUDProps> = ({
  engine,
  currentMode,
  isMuted,
  canInstall = false,
  onOpenInstall,
  onOpenSettings,
  onOpenAvatarSelect,
  onOpenPassport,
  onToggleMute,
  onToggleFullscreen,
  onGoHome
}) => {
  const lastActionTime = useRef(0);
  const [holdProgress, setHoldProgress] = useState<number>(0);
  const [isHoldingHome, setIsHoldingHome] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const holdTimerRef = useRef<number | null>(null);
  const holdStartTimeRef = useRef<number>(0);
  const hintTimeoutRef = useRef<number | null>(null);

  const selectedAvatarId = engine?.selectedAvatar || storageManager.getSelectedAvatar();
  const avatarInfo = AVATAR_ROSTER.find(a => a.id === selectedAvatarId);
  const avatarEmoji = avatarInfo?.emoji || '🐷';

  const isToddlerLocked = engine?.storage
    ? engine.storage.isToddlerLockEnabled()
    : storageManager.isToddlerLockEnabled();

  const handleAction = useCallback((cb?: () => void) => (e: React.SyntheticEvent) => {
    e.stopPropagation();
    const now = Date.now();
    if (now - lastActionTime.current < 250) return;
    lastActionTime.current = now;
    cb?.();
  }, []);

  const clearHoldTimer = useCallback(() => {
    if (holdTimerRef.current !== null) {
      clearInterval(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    setIsHoldingHome(false);
    setHoldProgress(0);
  }, []);

  useEffect(() => {
    return () => {
      clearHoldTimer();
      if (hintTimeoutRef.current !== null) {
        clearTimeout(hintTimeoutRef.current);
      }
    };
  }, [clearHoldTimer]);

  const handleHomePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    if (!isToddlerLocked) return;

    clearHoldTimer();
    setShowHint(false);
    setIsHoldingHome(true);
    setHoldProgress(0);
    holdStartTimeRef.current = Date.now();

    holdTimerRef.current = window.setInterval(() => {
      const elapsed = Date.now() - holdStartTimeRef.current;
      const progress = Math.min(1, elapsed / HOLD_DURATION_MS);
      setHoldProgress(progress);

      if (progress >= 1) {
        clearHoldTimer();
        soundEngine.playSFX('fanfare');
        Haptics.heavy();
        onGoHome();
      }
    }, 30);
  };

  const handleHomePointerUp = (e: React.PointerEvent) => {
    e.stopPropagation();
    if (!isToddlerLocked) {
      handleAction(onGoHome)(e);
      return;
    }

    if (isHoldingHome) {
      const elapsed = Date.now() - holdStartTimeRef.current;
      clearHoldTimer();
      if (elapsed < HOLD_DURATION_MS) {
        setShowHint(true);
        if (hintTimeoutRef.current !== null) clearTimeout(hintTimeoutRef.current);
        hintTimeoutRef.current = window.setTimeout(() => setShowHint(false), 2000);
      }
    }
  };

  const handleHomePointerCancel = (e: React.PointerEvent) => {
    e.stopPropagation();
    if (isToddlerLocked) {
      clearHoldTimer();
    }
  };

  const handleHomeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isToddlerLocked) {
      // Handled via pointer events for hold progress
      return;
    }
    handleAction(onGoHome)(e);
  };

  return (
    <header className="hud-layer">
      {/* Top Navigation Bar */}
      <div className="hud-top-bar">
        {currentMode !== 'MENU' ? (
          <div className="hud-home-wrapper">
            <button
              type="button"
              onClick={handleHomeClick}
              onPointerDown={handleHomePointerDown}
              onPointerUp={handleHomePointerUp}
              onPointerLeave={handleHomePointerCancel}
              onPointerCancel={handleHomePointerCancel}
              aria-label="Back to Menu"
              className="hud-btn-home"
              style={{ position: 'relative' }}
            >
              <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>🏠</span>
              <span>Home {isToddlerLocked ? '🔒' : ''}</span>
              {isToddlerLocked && isHoldingHome && (
                <div className="toddler-lock-progress">
                  <div
                    className="toddler-lock-progress-fill"
                    style={{ width: `${Math.round(holdProgress * 100)}%` }}
                  />
                </div>
              )}
            </button>
            {isToddlerLocked && isHoldingHome && (
              <div className="toddler-lock-tooltip">
                Hold 3s to exit... {Math.round(holdProgress * 100)}%
              </div>
            )}
            {isToddlerLocked && showHint && !isHoldingHome && (
              <div className="toddler-lock-tooltip">
                Hold 3s to exit 🔒
              </div>
            )}
          </div>
        ) : (
          <div />
        )}

        <div className="hud-controls-right">
          {canInstall && onOpenInstall && (
            <button
              type="button"
              onClick={handleAction(onOpenInstall)}
              onPointerUp={handleAction(onOpenInstall)}
              onPointerDown={(e) => e.stopPropagation()}
              aria-label="Install App"
              className="hud-btn-icon"
              style={{
                background: 'linear-gradient(180deg, #FFB74D 0%, #FF9800 100%)',
                border: '3.5px solid #E65100',
                boxShadow: '0 3px 0 #E65100, 0 5px 12px rgba(0, 0, 0, 0.22)',
                color: '#FFFFFF'
              }}
            >
              📲
            </button>
          )}
          {onOpenPassport && (
            <button
              type="button"
              onClick={handleAction(onOpenPassport)}
              onPointerUp={handleAction(onOpenPassport)}
              onPointerDown={(e) => e.stopPropagation()}
              aria-label="Open Adventure Passport"
              className="hud-btn-icon hud-btn-passport"
            >
              📖
            </button>
          )}
          {onOpenAvatarSelect && (
            <button
              type="button"
              onClick={handleAction(onOpenAvatarSelect)}
              onPointerUp={handleAction(onOpenAvatarSelect)}
              onPointerDown={(e) => e.stopPropagation()}
              aria-label="Select Avatar Hero"
              className="hud-btn-icon hud-btn-avatar"
            >
              {avatarEmoji}
            </button>
          )}
          {onOpenSettings && (
            <button
              type="button"
              onClick={handleAction(onOpenSettings)}
              onPointerUp={handleAction(onOpenSettings)}
              onPointerDown={(e) => e.stopPropagation()}
              aria-label="Open Settings"
              className="hud-btn-icon hud-btn-settings"
            >
              ⚙️
            </button>
          )}
          <button
            type="button"
            onClick={handleAction(onToggleFullscreen)}
            onPointerUp={handleAction(onToggleFullscreen)}
            onPointerDown={(e) => e.stopPropagation()}
            aria-label="Toggle Fullscreen"
            className="hud-btn-icon hud-btn-fs"
          >
            ⛶
          </button>
          <button
            type="button"
            onClick={handleAction(onToggleMute)}
            onPointerUp={handleAction(onToggleMute)}
            onPointerDown={(e) => e.stopPropagation()}
            aria-label="Toggle Audio"
            className="hud-btn-icon hud-btn-audio"
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
        </div>
      </div>
    </header>
  );
};
