import React from 'react';
import { GameEngine } from '../engine/GameEngine';

interface HUDProps {
  engine: GameEngine | null;
  currentMode: string;
  isMuted: boolean;
  canInstall?: boolean;
  onOpenInstall?: () => void;
  onToggleMute: () => void;
  onToggleFullscreen: () => void;
  onGoHome: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  currentMode,
  isMuted,
  canInstall = false,
  onOpenInstall,
  onToggleMute,
  onToggleFullscreen,
  onGoHome
}) => {
  const lastActionTime = React.useRef(0);
  const handleAction = (cb?: () => void) => (e: React.SyntheticEvent) => {
    e.stopPropagation();
    const now = Date.now();
    if (now - lastActionTime.current < 250) return;
    lastActionTime.current = now;
    cb?.();
  };

  return (
    <header className="hud-layer">
      {/* Top Navigation Bar */}
      <div className="hud-top-bar">
        {currentMode !== 'MENU' ? (
          <button
            type="button"
            onClick={handleAction(onGoHome)}
            onPointerUp={handleAction(onGoHome)}
            onPointerDown={(e) => e.stopPropagation()}
            aria-label="Back to Menu"
            className="hud-btn-home"
          >
            <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>🏠</span>
            <span>Home</span>
          </button>
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
