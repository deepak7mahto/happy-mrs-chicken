import React from 'react';
import { GameEngine } from '../engine/GameEngine';

interface HUDProps {
  engine: GameEngine | null;
  currentMode: string;
  isMuted: boolean;
  onToggleMute: () => void;
  onToggleFullscreen: () => void;
  onGoHome: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  currentMode,
  isMuted,
  onToggleMute,
  onToggleFullscreen,
  onGoHome
}) => {
  const handleAction = (cb: () => void) => (e: React.SyntheticEvent) => {
    e.stopPropagation();
    cb();
  };

  return (
    <div className="hud-layer">
      {/* Top Navigation Bar */}
      <div className="hud-top-bar">
        {currentMode !== 'MENU' ? (
          <button
            type="button"
            onClick={handleAction(onGoHome)}
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
          <button
            type="button"
            onClick={handleAction(onToggleFullscreen)}
            onPointerDown={(e) => e.stopPropagation()}
            aria-label="Toggle Fullscreen"
            className="hud-btn-icon hud-btn-fs"
          >
            ⛶
          </button>
          <button
            type="button"
            onClick={handleAction(onToggleMute)}
            onPointerDown={(e) => e.stopPropagation()}
            aria-label="Toggle Audio"
            className="hud-btn-icon hud-btn-audio"
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
        </div>
      </div>
    </div>
  );
};

