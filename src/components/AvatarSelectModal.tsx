import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameEngine } from '../engine/GameEngine';
import { storageManager } from '../engine/StorageManager';
import { soundEngine } from '../engine/SoundEngine';
import { Haptics } from '../engine/Haptics';
import { CharacterId, AvatarInfo, AvatarCategory, AVATAR_ROSTER } from '../types/characters';
import { renderCharacter } from '../graphics/characters';

interface AvatarSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  engine: GameEngine | null;
  onAvatarChange?: (avatar: CharacterId) => void;
}

const CATEGORY_TABS: Array<{ id: 'all' | AvatarCategory; label: string }> = [
  { id: 'all', label: 'All 🌟' },
  { id: 'peppa', label: 'Peppa Pig 🐷' },
  { id: 'trishu', label: 'Trishu Family 👧' },
  { id: 'farm', label: 'Farmyard 🐔' }
];

interface AvatarCardPreviewProps {
  avatarId: CharacterId;
  isSelected: boolean;
}

const AvatarCardPreview: React.FC<AvatarCardPreviewProps> = ({ avatarId, isSelected }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dynamic scaling per character to fit 76x76 canvas nicely
    let scale = 0.42;
    let offsetY = 50;
    let offsetX = 38;

    if (avatarId === 'peppa' || avatarId === 'george') {
      scale = 0.38;
      offsetY = 52;
    } else if (avatarId === 'daddyPig' || avatarId === 'mummyPig' || avatarId === 'grandpaPig') {
      scale = 0.28;
      offsetY = 55;
    } else if (avatarId === 'suzySheep') {
      scale = 0.34;
      offsetY = 52;
    } else if (avatarId === 'trishu' || avatarId === 'leo') {
      scale = 0.38;
      offsetY = 52;
    } else if (avatarId === 'dad' || avatarId === 'mom' || avatarId === 'grandpa') {
      scale = 0.28;
      offsetY = 54;
    } else if (avatarId === 'mimi') {
      scale = 0.34;
      offsetY = 52;
    } else if (avatarId === 'chicken' || avatarId === 'duck') {
      scale = 0.45;
      offsetY = 48;
    } else if (avatarId === 'chick') {
      scale = 0.65;
      offsetY = 46;
    }

    try {
      renderCharacter(avatarId, ctx, offsetX, offsetY, scale, {
        expression: isSelected ? 'excited' : 'happy',
        muddyBoots: true,
        holdingDino: avatarId === 'george' || avatarId === 'leo'
      });
    } catch (_) {}
  }, [avatarId, isSelected]);

  return (
    <canvas
      ref={canvasRef}
      width={76}
      height={76}
      className="avatar-canvas-preview"
      aria-hidden="true"
    />
  );
};

export const AvatarSelectModal: React.FC<AvatarSelectModalProps> = ({
  isOpen,
  onClose,
  engine,
  onAvatarChange
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | AvatarCategory>('all');
  const [selectedAvatar, setSelectedAvatar] = useState<CharacterId>(() => {
    return engine?.selectedAvatar || storageManager.getSelectedAvatar();
  });

  useEffect(() => {
    if (isOpen) {
      const current = engine?.selectedAvatar || storageManager.getSelectedAvatar();
      setSelectedAvatar(current);
    }
  }, [isOpen, engine]);

  const handleSelectAvatar = useCallback((info: AvatarInfo) => {
    setSelectedAvatar(info.id);
    if (engine) {
      engine.setSelectedAvatar(info.id);
    } else {
      storageManager.setSelectedAvatar(info.id);
    }

    // Sound and haptic feedback
    if (info.sound) {
      soundEngine.playSFX(info.sound);
    }
    Haptics.medium();

    onAvatarChange?.(info.id);
  }, [engine, onAvatarChange]);

  const handleClose = useCallback(() => {
    soundEngine.playSFX('click');
    Haptics.tap();
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  const filteredRoster = activeCategory === 'all'
    ? AVATAR_ROSTER
    : AVATAR_ROSTER.filter(a => a.category === activeCategory);

  return (
    <div
      className="modal-backdrop"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Escape' || e.key === 'Enter') handleClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
      aria-label="Close Avatar Selection"
    >
      <div className="modal-card avatar-modal-card">
        {/* Header */}
        <div className="avatar-modal-header">
          <div>
            <h2 className="avatar-modal-title">Choose Your Hero! 🌟</h2>
            <p className="avatar-modal-subtitle">Pick who plays in all the games!</p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="avatar-close-btn"
            aria-label="Close Avatar Selection"
          >
            ✕
          </button>
        </div>

        {/* Category Tabs */}
        <div className="avatar-category-pills">
          {CATEGORY_TABS.map(tab => (
            <button
              key={tab.id}
              type="button"
              className={`avatar-pill-btn ${activeCategory === tab.id ? 'active' : ''}`}
              onClick={() => {
                soundEngine.playSFX('click');
                Haptics.tap();
                setActiveCategory(tab.id);
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Avatar Grid */}
        <div className="avatar-grid-scroll">
          <div className="avatar-grid">
            {filteredRoster.map(info => {
              const isSelected = selectedAvatar === info.id;
              return (
                <button
                  key={info.id}
                  type="button"
                  className={`avatar-card ${isSelected ? 'selected' : ''}`}
                  style={{
                    backgroundColor: isSelected ? '#FFFFFF' : '#FAFAFA',
                    borderColor: isSelected ? '#4CAF50' : info.borderColor
                  }}
                  onClick={() => handleSelectAvatar(info)}
                  aria-pressed={isSelected}
                  aria-label={`Select ${info.name}`}
                >
                  <div className="avatar-card-preview-wrapper" style={{ backgroundColor: info.bgColor }}>
                    <AvatarCardPreview avatarId={info.id} isSelected={isSelected} />
                    {isSelected && (
                      <span className="avatar-card-selected-badge" aria-label="Selected">
                        ⭐
                      </span>
                    )}
                  </div>
                  <div className="avatar-card-details">
                    <span className="avatar-card-name">
                      {info.emoji} {info.name}
                    </span>
                    <span className="avatar-card-subtitle">{info.subtitle}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Confirm Button */}
        <div className="avatar-modal-footer">
          <button
            type="button"
            className="avatar-confirm-btn"
            onClick={handleClose}
          >
            Let's Play! 🌟
          </button>
        </div>
      </div>
    </div>
  );
};
