import React, { useState, useEffect } from 'react';
import { StorageManager, storageManager } from '../engine/StorageManager';
import { soundEngine } from '../engine/SoundEngine';
import { Haptics } from '../engine/Haptics';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  storage?: StorageManager;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  storage = storageManager
}) => {
  const [bgmVolume, setBgmVolume] = useState<number>(storage.getBgmVolume());
  const [sfxVolume, setSfxVolume] = useState<number>(storage.getSfxVolume());
  const [hapticsEnabled, setHapticsEnabled] = useState<boolean>(storage.isHapticsEnabled());
  const [toddlerLock, setToddlerLock] = useState<boolean>(storage.isToddlerLockEnabled());
  const [scoresResetFeedback, setScoresResetFeedback] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setBgmVolume(storage.getBgmVolume());
      setSfxVolume(storage.getSfxVolume());
      setHapticsEnabled(storage.isHapticsEnabled());
      setToddlerLock(storage.isToddlerLockEnabled());
      setScoresResetFeedback(false);
    }
  }, [isOpen, storage]);

  if (!isOpen) return null;

  const handleClose = () => {
    soundEngine.playSFX('click');
    Haptics.tap();
    onClose();
  };

  const handleBgmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setBgmVolume(val);
    storage.setBgmVolume(val);
    soundEngine.setBgmVolume(val);
  };

  const handleSfxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setSfxVolume(val);
    storage.setSfxVolume(val);
    soundEngine.setSfxVolume(val);
  };

  const handleToggleHaptics = () => {
    const next = !hapticsEnabled;
    setHapticsEnabled(next);
    storage.setHapticsEnabled(next);
    soundEngine.playSFX('click');
    if (next) {
      Haptics.tap();
    }
  };

  const handleToggleToddlerLock = () => {
    const next = !toddlerLock;
    setToddlerLock(next);
    storage.setToddlerLockEnabled(next);
    soundEngine.playSFX('click');
    Haptics.tap();
  };

  const handleResetHighScores = () => {
    storage.resetHighScores();
    soundEngine.playSFX('fanfare');
    Haptics.heavy();
    setScoresResetFeedback(true);
    const timer = setTimeout(() => setScoresResetFeedback(false), 2500);
    return () => clearTimeout(timer);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Close Settings Dialog"
      className="modal-backdrop"
      onKeyDown={(e) => {
        if (e.key === 'Escape' || e.key === 'Enter') handleClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="modal-card settings-modal">
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close settings"
          className="modal-close-btn"
        >
          ✕
        </button>

        <h2 id="settings-modal-title" className="modal-title">
          Settings ⚙️
        </h2>
        <p className="modal-subtitle">
          Audio volume, vibration &amp; toddler lock controls
        </p>

        <div className="settings-list">
          {/* BGM Volume */}
          <div className="settings-row">
            <div className="settings-label">
              <span className="settings-label-icon">🎵</span>
              <span>Music</span>
            </div>
            <div className="settings-control">
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={bgmVolume}
                onChange={handleBgmChange}
                aria-label="Background Music Volume"
                className="volume-slider"
              />
              <span style={{ fontSize: '0.8rem', fontWeight: 800, minWidth: 36, textAlign: 'right' }}>
                {Math.round(bgmVolume * 100)}%
              </span>
            </div>
          </div>

          {/* SFX Volume */}
          <div className="settings-row">
            <div className="settings-label">
              <span className="settings-label-icon">🔊</span>
              <span>Sound FX</span>
            </div>
            <div className="settings-control">
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={sfxVolume}
                onChange={handleSfxChange}
                aria-label="Sound Effects Volume"
                className="volume-slider"
              />
              <span style={{ fontSize: '0.8rem', fontWeight: 800, minWidth: 36, textAlign: 'right' }}>
                {Math.round(sfxVolume * 100)}%
              </span>
            </div>
          </div>

          {/* Haptics Toggle */}
          <div className="settings-row">
            <div className="settings-label">
              <span className="settings-label-icon">📳</span>
              <span>Haptics</span>
            </div>
            <button
              type="button"
              onClick={handleToggleHaptics}
              aria-label="Toggle Haptics"
              className={`settings-toggle-btn ${hapticsEnabled ? 'on' : 'off'}`}
            >
              {hapticsEnabled ? 'ON 🟢' : 'OFF ⚪'}
            </button>
          </div>

          {/* Toddler Lock Toggle */}
          <div className="settings-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div className="settings-label">
                <span className="settings-label-icon">🔒</span>
                <span>Toddler Lock</span>
              </div>
              <button
                type="button"
                onClick={handleToggleToddlerLock}
                aria-label="Toggle Toddler Lock"
                className={`settings-toggle-btn ${toddlerLock ? 'on' : 'off'}`}
              >
                {toddlerLock ? 'ON 🟢' : 'OFF ⚪'}
              </button>
            </div>
            <div style={{ fontSize: '0.725rem', color: '#6D4C41', fontWeight: 600, textAlign: 'left' }}>
              Requires holding the Home button for 3 seconds to exit mini-games.
            </div>
          </div>

          {/* Reset High Scores */}
          <div style={{ marginTop: 8 }}>
            <button
              type="button"
              onClick={handleResetHighScores}
              className="settings-reset-btn"
            >
              🏆 Reset High Scores
            </button>
            {scoresResetFeedback && (
              <div style={{ marginTop: 8, fontSize: '0.85rem', fontWeight: 800, color: '#2E7D32' }}>
                All high scores have been reset! ✨
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
