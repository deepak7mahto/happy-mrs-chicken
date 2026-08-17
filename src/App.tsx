import React, { useState, useCallback } from 'react';
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

  const handleEngineReady = useCallback((inst: GameEngine) => {
    setEngine(inst);
    setIsMuted(inst.storage.isMuted());
  }, []);

  const handleSceneChange = useCallback((mode: GameModeId) => {
    setCurrentMode(mode);
  }, []);

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
    engine.changeScene('MENU');
  }, [engine]);

  return (
    <main id="game-container" className="relative h-screen w-screen overflow-hidden select-none bg-slate-900">
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
