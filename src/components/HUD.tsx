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
  return (
    <div className="hud-layer">
      {/* Top Navigation Bar */}
      <div className="hud-top-bar">
        {currentMode !== 'MENU' ? (
          <button
            onClick={onGoHome}
            aria-label="Back to Menu"
            className="hud-btn-home"
          >
            <span>🏠</span> Home
          </button>
        ) : (
          <div />
        )}

        <div className="hud-controls-right">
          <button
            onClick={onToggleFullscreen}
            aria-label="Toggle Fullscreen"
            className="hud-btn-icon hud-btn-fs"
          >
            ⛶
          </button>
          <button
            onClick={onToggleMute}
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

