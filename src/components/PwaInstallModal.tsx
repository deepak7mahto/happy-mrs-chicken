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
      role="dialog"
      aria-modal="true"
      aria-labelledby="install-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm pointer-events-auto"
      onClick={handleClose}
    >
      <div
        style={{
          background: 'linear-gradient(180deg, #E1F5FE 0%, #B3E5FC 100%)',
          border: '4px solid #0288D1',
          boxShadow: '0 8px 0 #01579B, 0 16px 32px rgba(0,0,0,0.4)',
          borderRadius: '28px',
          maxWidth: '420px',
          width: '100%',
          color: '#01579B'
        }}
        className="p-6 text-center relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close dialog"
          style={{
            background: '#FF8A80',
            border: '2.5px solid #D50000',
            boxShadow: '0 2px 0 #D50000',
            color: '#FFFFFF'
          }}
          className="absolute top-4 right-4 w-9 h-9 rounded-full font-bold flex items-center justify-center text-sm cursor-pointer hover:brightness-105 active:translate-y-0.5"
        >
          ✕
        </button>

        {/* Hero badge */}
        <div className="w-20 h-20 mx-auto mb-3 rounded-3xl bg-white shadow-md flex items-center justify-center p-2 border-3 border-sky-400">
          <img src="./icons/icon-192.png" alt="Trishu App Icon" className="w-full h-full rounded-2xl object-cover" />
        </div>

        <h2 id="install-modal-title" className="text-2xl font-black mb-1 text-sky-950">
          Install Trishu App!
        </h2>
        <p className="text-sm font-bold text-sky-800 mb-4 leading-relaxed">
          Play fullscreen with instant launching and 100% offline play anytime!
        </p>

        {/* Platform-specific flow */}
        {isInstallable ? (
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleInstallClick}
              style={{
                background: 'linear-gradient(180deg, #FF7043 0%, #F4511E 100%)',
                border: '3.5px solid #BF360C',
                boxShadow: '0 5px 0 #BF360C, 0 8px 16px rgba(191,54,12,0.35)',
                color: '#FFFFFF'
              }}
              className="w-full py-3.5 px-6 rounded-full font-extrabold text-lg flex items-center justify-center gap-2 cursor-pointer hover:brightness-105 active:translate-y-1 active:shadow-none transition-transform"
            >
              <span className="text-xl">⬇️</span>
              <span>Install to Home Screen</span>
            </button>
          </div>
        ) : isIOS ? (
          <div className="bg-white/85 rounded-2xl p-4 text-left border-2 border-sky-300 text-sky-950 text-xs space-y-2 mb-2">
            <div className="font-extrabold text-sm text-sky-900 mb-1 flex items-center gap-1.5">
              <span>🍎</span> Safari iOS Quick Install:
            </div>
            <div className="flex items-center gap-2 font-semibold">
              <span className="w-6 h-6 rounded-full bg-sky-200 text-sky-900 font-bold flex items-center justify-center shrink-0">1</span>
              <span>Tap the <strong className="text-sky-700">Share button</strong> (⎋ with arrow) in Safari.</span>
            </div>
            <div className="flex items-center gap-2 font-semibold">
              <span className="w-6 h-6 rounded-full bg-sky-200 text-sky-900 font-bold flex items-center justify-center shrink-0">2</span>
              <span>Scroll down and select <strong className="text-sky-700">&ldquo;Add to Home Screen&rdquo;</strong> (➕).</span>
            </div>
            <div className="flex items-center gap-2 font-semibold">
              <span className="w-6 h-6 rounded-full bg-sky-200 text-sky-900 font-bold flex items-center justify-center shrink-0">3</span>
              <span>Tap <strong className="text-sky-700">&ldquo;Add&rdquo;</strong> in the top right to start playing!</span>
            </div>
          </div>
        ) : (
          <div className="bg-white/80 rounded-2xl p-3 text-sky-900 text-xs font-semibold mb-2">
            To install, open your browser menu (⋮) and choose &ldquo;Install App&rdquo; or &ldquo;Add to Home screen&rdquo;.
          </div>
        )}

        <button
          type="button"
          onClick={handleClose}
          className="mt-3 text-xs font-extrabold text-sky-800 underline opacity-80 hover:opacity-100 cursor-pointer"
        >
          Maybe Later
        </button>
      </div>
    </div>
  );
};
