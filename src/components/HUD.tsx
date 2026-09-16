import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GameEngine } from '../engine/GameEngine';
import { storageManager } from '../engine/StorageManager';
import { soundEngine } from '../engine/SoundEngine';
import { Haptics } from '../engine/Haptics';
import { AVATAR_ROSTER } from '../types/characters';

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
  const [viewMode, setViewMode] = useState<'journey' | 'grid'>(() => {
    return engine?.storyViewMode || storageManager.getStoryViewMode();
  });
  const [holdProgress, setHoldProgress] = useState<number>(0);
  const [isHoldingHome, setIsHoldingHome] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const holdTimerRef = useRef<number | null>(null);
  const holdStartTimeRef = useRef<number>(0);
  const hintTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (engine) {
      setViewMode(engine.storyViewMode);
    }
  }, [engine, currentMode]);

  const selectedAvatarId = engine?.selectedAvatar || storageManager.getSelectedAvatar();
  const avatarInfo = AVATAR_ROSTER.find(a => a.id === selectedAvatarId);
  const avatarEmoji = avatarInfo?.emoji || '🐷';

  const isToddlerLocked = engine?.storage
    ? engine.storage.isToddlerLockEnabled()
    : storageManager.isToddlerLockEnabled();

  const handleSwitchMode = (mode: 'journey' | 'grid') => {
    if (viewMode === mode) return;
    setViewMode(mode);
    if (engine) {
      engine.setStoryViewMode(mode);
      const menuScene = engine.scenes.get('MENU') as { scrollY?: number; scrollVy?: number } | undefined;
      if (menuScene) {
        menuScene.scrollY = 0;
        menuScene.scrollVy = 0;
      }
    } else {
      storageManager.setStoryViewMode(mode);
    }
    soundEngine.playSFX('click');
    Haptics.tap();
  };

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
      onGoHome();
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
    if (isToddlerLocked) return;
    onGoHome();
  };

  const isMenuMode = currentMode === 'MENU';

  return (
    <header className={`hud-layer ${isMenuMode ? 'hud-menu-layer' : 'hud-game-layer'}`}>
      {/* Top Navigation Row */}
      <div className="hud-top-bar">
        {isMenuMode ? (
          <div className="hud-brand">
            <span className="hud-brand-sparkle">🌟</span>
            <span className="hud-brand-title">Adventures of Trishu</span>
          </div>
        ) : (
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
            >
              <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>🏠</span>
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
        )}

        {/* Desktop Mode Toggle (Center of header on wide screens) */}
        {isMenuMode && (
          <div className="hud-mode-toggle hud-mode-toggle-desktop" role="tablist" aria-label="Game Mode">
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === 'journey'}
              className={`hud-mode-pill ${viewMode === 'journey' ? 'active' : ''}`}
              onClick={() => handleSwitchMode('journey')}
            >
              🗺️ Story Journey
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === 'grid'}
              className={`hud-mode-pill ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => handleSwitchMode('grid')}
            >
              🎮 Free Play
            </button>
          </div>
        )}

        {/* Action Controls Right */}
        <div className="hud-controls-right">
          {canInstall && onOpenInstall && isMenuMode && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onOpenInstall(); }}
              aria-label="Install App"
              className="hud-btn-icon hud-btn-install"
            >
              📲
            </button>
          )}
          {onOpenPassport && isMenuMode && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onOpenPassport(); }}
              aria-label="Open Adventure Passport"
              className="hud-btn-icon hud-btn-passport"
            >
              📖
            </button>
          )}
          {onOpenAvatarSelect && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onOpenAvatarSelect(); }}
              aria-label="Select Avatar Hero"
              className="hud-btn-icon hud-btn-avatar"
            >
              {avatarEmoji}
            </button>
          )}
          {onOpenSettings && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onOpenSettings(); }}
              aria-label="Open Settings"
              className="hud-btn-icon hud-btn-settings"
            >
              ⚙️
            </button>
          )}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onToggleFullscreen(); }}
            aria-label="Toggle Fullscreen"
            className="hud-btn-icon hud-btn-fs"
          >
            ⛶
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onToggleMute(); }}
            aria-label="Toggle Audio"
            className="hud-btn-icon hud-btn-audio"
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
        </div>
      </div>

      {/* Mobile Mode Row (Row 2, centered on mobile portrait) */}
      {isMenuMode && (
        <div className="hud-mode-row-mobile">
          <div className="hud-mode-toggle" role="tablist" aria-label="Game Mode">
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === 'journey'}
              className={`hud-mode-pill ${viewMode === 'journey' ? 'active' : ''}`}
              onClick={() => handleSwitchMode('journey')}
            >
              🗺️ Story Journey
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === 'grid'}
              className={`hud-mode-pill ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => handleSwitchMode('grid')}
            >
              🎮 Free Play
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
