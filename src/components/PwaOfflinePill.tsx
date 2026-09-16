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
      className={`offline-pill ${isOnline ? 'online' : 'offline'}`}
    >
      <span>{isOnline ? '🟢' : '⚡'}</span>
      <span>{isOnline ? 'Back Online!' : '100% Offline Ready'}</span>
    </aside>
  );
};
