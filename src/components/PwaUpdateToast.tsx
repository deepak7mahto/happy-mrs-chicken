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
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-auto max-w-md w-11/12 transition-all duration-300"
    >
      <div
        style={{
          background: 'linear-gradient(180deg, #FFF9C4 0%, #FFF59D 100%)',
          border: '3px solid #FBC02D',
          boxShadow: '0 6px 0 #F57F17, 0 10px 20px rgba(0,0,0,0.3)',
          borderRadius: '18px',
          color: '#3E2723'
        }}
        className="p-3.5 flex items-center justify-between gap-3"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-2xl" aria-hidden="true">🎉</span>
          <div className="text-left">
            <div className="text-sm font-extrabold leading-tight">New Adventure Update!</div>
            <div className="text-xs text-amber-900 opacity-90 leading-tight">Fresh games & fun fixes are ready</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleUpdate}
            style={{
              background: 'linear-gradient(180deg, #4CAF50 0%, #388E3C 100%)',
              border: '2px solid #1B5E20',
              boxShadow: '0 2px 0 #1B5E20',
              color: '#FFFFFF'
            }}
            className="px-3 py-1.5 rounded-full font-bold text-xs cursor-pointer hover:brightness-105 active:translate-y-0.5"
          >
            Update
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss Update"
            className="w-7 h-7 rounded-full bg-amber-200 text-amber-900 font-bold flex items-center justify-center text-xs opacity-75 hover:opacity-100 cursor-pointer"
          >
            ✕
          </button>
        </div>
      </div>
    </aside>
  );
};
