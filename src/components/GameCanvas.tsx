import React, { useRef, useEffect } from 'react';
import { GameEngine } from '../engine/GameEngine';
import { GameModeId } from '../types/game';

interface GameCanvasProps {
  onEngineReady: (engine: GameEngine) => void;
  onSceneChange: (mode: GameModeId) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ onEngineReady, onSceneChange }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const onSceneChangeRef = useRef(onSceneChange);
  onSceneChangeRef.current = onSceneChange;
  const onEngineReadyRef = useRef(onEngineReady);
  onEngineReadyRef.current = onEngineReady;

  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new GameEngine(canvasRef.current);
    engine.onSceneChangeCallback = (mode) => {
      onSceneChangeRef.current(mode);
    };
    onEngineReadyRef.current(engine);
    engine.start();

    return () => {
      engine.destroy();
    };
  }, []);

  return (
    <canvas
      id="gameCanvas"
      ref={canvasRef}
      className="block w-full h-full cursor-pointer select-none"
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#0f172a',
        touchAction: 'none'
      }}
    />
  );
};
