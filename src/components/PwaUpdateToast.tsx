import React, { useEffect, useState } from 'react';
import { pwaManager } from '../pwa/PwaManager';
import { soundEngine } from '../engine/SoundEngine';
import { Haptics } from '../engine/Haptics';

export const PwaUpdateToast: React.FC = () => {
  const [hasUpdate, setHasUpdate] = useState<boolean>(false);

  useEffect(() => {
    setHasUpdate(pwaManager.hasUpdate());

    const unsubscribe = pwaManager.on('updateAvailable', () => {
      setHasUpdate(true);
    });

    return () => unsubscribe();
  }, []);

  if (!hasUpdate) return null;

  const handleUpdate = () => {
    soundEngine.playSFX('fanfare');
    Haptics.tap();
    pwaManager.skipWaitingAndReload();
  };

  const handleDismiss = () => {
    soundEngine.playSFX('click');
    setHasUpdate(false);
  };

  return (
    <aside
      aria-label="App Update Available"
      className="update-toast"
    >
      <div className="update-toast-content">
        <span className="update-toast-emoji" aria-hidden="true">🎉</span>
        <div className="update-toast-text">
          <div className="update-toast-title">New Adventure Update!</div>
          <div className="update-toast-desc">Fresh games &amp; fun fixes are ready</div>
        </div>
      </div>

      <div className="update-toast-actions">
        <button
          type="button"
          onClick={handleUpdate}
          className="update-toast-btn"
        >
          Update
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss Update"
          className="update-toast-close"
        >
          ✕
        </button>
      </div>
    </aside>
  );
};
