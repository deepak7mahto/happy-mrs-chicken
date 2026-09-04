import React, { useEffect, useState } from 'react';
import { pwaManager } from '../pwa/PwaManager';

export const PwaOfflinePill: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [showReconnected, setShowReconnected] = useState<boolean>(false);

  useEffect(() => {
    setIsOnline(pwaManager.isOnline());

    const unsubscribe = pwaManager.on('connectionChange', (online: boolean) => {
      setIsOnline(online);
      if (online) {
        setShowReconnected(true);
        const timer = setTimeout(() => setShowReconnected(false), 2500);
        return () => clearTimeout(timer);
      }
    });

    return () => unsubscribe();
  }, []);

  if (isOnline && !showReconnected) {
    return null;
  }

  return (
    <aside
      aria-label="Network Status"
      className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all duration-300"
    >
      <div
        style={{
          background: isOnline ? 'rgba(46, 125, 50, 0.95)' : 'rgba(230, 81, 0, 0.95)',
          border: `2.5px solid ${isOnline ? '#1B5E20' : '#BF360C'}`,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }}
        className="px-4 py-2 rounded-full text-white text-sm font-bold flex items-center gap-2 backdrop-blur-sm shadow-lg"
      >
        <span>{isOnline ? '🟢' : '⚡'}</span>
        <span>{isOnline ? 'Back Online!' : '100% Offline Ready'}</span>
      </div>
    </aside>
  );
};
