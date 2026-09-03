import React, { useState, useCallback, useEffect } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { HUD } from './components/HUD';
import { ToddlerTapFeedback } from './components/ToddlerTapFeedback';
import { GameEngine } from './engine/GameEngine';
import { GameModeId } from './types/game';
import { soundEngine } from './engine/SoundEngine';
import { Haptics } from './engine/Haptics';

export const App: React.FC = () => {
  const [engine, setEngine] = useState<GameEngine | null>(null);
  const [currentMode, setCurrentMode] = useState<GameModeId>('MENU');
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Initialize root history state
  useEffect(() => {
    if (typeof window === 'undefined' || !window.history) return;
    try {
      window.history.replaceState({ mode: 'MENU' }, '', window.location.pathname + window.location.search);
    } catch (_) {}
  }, []);

  const handleEngineReady = useCallback((inst: GameEngine) => {
    setEngine(inst);
    setIsMuted(inst.storage.isMuted());
  }, []);

  const handleSceneChange = useCallback((mode: GameModeId) => {
    setCurrentMode(mode);
    if (typeof window !== 'undefined' && window.history) {
      try {
        if (mode !== 'MENU') {
          const hash = `#${mode.toLowerCase()}`;
          if (window.location.hash !== hash) {
            window.history.pushState({ mode }, '', hash);
          }
        } else if (window.location.hash) {
          window.history.replaceState({ mode: 'MENU' }, '', window.location.pathname + window.location.search);
        }
      } catch (_) {}
    }
  }, []);

  // Intercept mobile back gesture / Android hardware back button
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handlePopState = () => {
      if (!engine) return;
      if (engine.currentSceneId !== 'MENU') {
        soundEngine.playSFX('click');
        Haptics.tap();
        engine.changeScene('MENU');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [engine]);

  const handleToggleMute = useCallback(() => {
    if (!engine) return;
    const newMute = !engine.storage.isMuted();
    engine.storage.setMuted(newMute);
    soundEngine.setMuted(newMute);
    soundEngine.playSFX('click');
    Haptics.tap();
    setIsMuted(newMute);
  }, [engine]);

  const handleToggleFullscreen = useCallback(() => {
    if (!engine) return;
    engine.toggleFullscreen();
    soundEngine.playSFX('click');
    Haptics.tap();
  }, [engine]);

  const handleGoHome = useCallback(() => {
    if (!engine) return;
    soundEngine.playSFX('click');
    Haptics.tap();
    if (typeof window !== 'undefined' && window.location.hash) {
      window.history.back();
    } else {
      engine.changeScene('MENU');
    }
  }, [engine]);

  return (
    <main id="game-container" className="fixed inset-0 w-full h-full overflow-hidden select-none bg-slate-900">
      <GameCanvas onEngineReady={handleEngineReady} onSceneChange={handleSceneChange} />
      <HUD
        engine={engine}
        currentMode={currentMode}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onToggleFullscreen={handleToggleFullscreen}
        onGoHome={handleGoHome}
      />
      <ToddlerTapFeedback />
    </main>
  );
};
