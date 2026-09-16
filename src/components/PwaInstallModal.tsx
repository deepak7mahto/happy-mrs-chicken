import React, { useState, useEffect } from 'react';
import { pwaManager } from '../pwa/PwaManager';
import { soundEngine } from '../engine/SoundEngine';
import { Haptics } from '../engine/Haptics';

interface PwaInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PwaInstallModal: React.FC<PwaInstallModalProps> = ({ isOpen, onClose }) => {
  const [isInstallable, setIsInstallable] = useState<boolean>(pwaManager.isInstallable());
  const isIOS = pwaManager.isIOS();

  useEffect(() => {
    setIsInstallable(pwaManager.isInstallable());
    const unsub = pwaManager.on('installableChange', (canInstall) => {
      setIsInstallable(canInstall);
    });
    return () => unsub();
  }, []);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    soundEngine.playSFX('click');
    Haptics.tap();
    const outcome = await pwaManager.promptInstall();
    if (outcome === 'accepted') {
      soundEngine.playSFX('fanfare');
      onClose();
    }
  };

  const handleClose = () => {
    soundEngine.playSFX('click');
    Haptics.tap();
    onClose();
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Close Install App Dialog"
      className="modal-backdrop"
      onKeyDown={(e) => {
        if (e.key === 'Escape' || e.key === 'Enter') handleClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="modal-card">
        {/* Close button */}
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close dialog"
          className="modal-close-btn"
        >
          ✕
        </button>

        {/* Hero badge */}
        <div className="modal-hero-badge">
          <img src="./icons/icon-192.png" alt="Trishu App Icon" className="modal-hero-img" />
        </div>

        <h2 id="install-modal-title" className="modal-title">
          Install Trishu App!
        </h2>
        <p className="modal-subtitle">
          Play fullscreen with instant launching and 100% offline play anytime!
        </p>

        {/* Platform-specific flow */}
        {isInstallable ? (
          <div>
            <button
              type="button"
              onClick={handleInstallClick}
              className="modal-primary-btn"
            >
              <span style={{ fontSize: '1.25rem' }}>⬇️</span>
              <span>Install to Home Screen</span>
            </button>
          </div>
        ) : isIOS ? (
          <div className="ios-instructions-box">
            <div style={{ fontWeight: 900, fontSize: '0.85rem', marginBottom: 2 }}>
              🍎 Safari iOS Quick Install:
            </div>
            <div className="ios-step-row">
              <span className="ios-step-badge">1</span>
              <span>Tap the <strong>Share button</strong> (⎋ with arrow) in Safari.</span>
            </div>
            <div className="ios-step-row">
              <span className="ios-step-badge">2</span>
              <span>Scroll down and select <strong>&ldquo;Add to Home Screen&rdquo;</strong> (➕).</span>
            </div>
            <div className="ios-step-row">
              <span className="ios-step-badge">3</span>
              <span>Tap <strong>&ldquo;Add&rdquo;</strong> in top right to start playing!</span>
            </div>
          </div>
        ) : (
          <div className="ios-instructions-box" style={{ textAlign: 'center' }}>
            To install, open your browser menu (⋮) and choose &ldquo;Install App&rdquo; or &ldquo;Add to Home screen&rdquo;.
          </div>
        )}

        <button
          type="button"
          onClick={handleClose}
          className="modal-link-btn"
        >
          Maybe Later
        </button>
      </div>
    </div>
  );
};
