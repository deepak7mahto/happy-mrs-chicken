import React, { useState, useEffect } from 'react';

interface TapRipple {
  id: number;
  x: number;
  y: number;
  emoji: string;
}

const TODDLER_EMOJIS = ['✨', '🐣', '⭐', '🎈', '💖', '🥚', '🌸'];

export const ToddlerTapFeedback: React.FC = () => {
  const [ripples, setRipples] = useState<TapRipple[]>([]);

  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      const newRipple: TapRipple = {
        id: Date.now() + Math.random(),
        x: e.clientX,
        y: e.clientY,
        emoji: TODDLER_EMOJIS[Math.floor(Math.random() * TODDLER_EMOJIS.length)]
      };
      setRipples((prev) => [...prev.slice(-10), newRipple]);
    };

    window.addEventListener('pointerdown', handlePointerDown);
    return () => window.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  useEffect(() => {
    if (ripples.length === 0) return;
    const timer = setTimeout(() => {
      setRipples((prev) => prev.slice(1));
    }, 700);
    return () => clearTimeout(timer);
  }, [ripples]);

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {ripples.map((r) => (
        <div
          key={r.id}
          className="absolute animate-ping text-3xl select-none"
          style={{
            left: `${r.x - 16}px`,
            top: `${r.y - 16}px`,
            animation: 'toddlerBurst 0.65s cubic-bezier(0.1, 0.9, 0.2, 1) forwards'
          }}
        >
          {r.emoji}
        </div>
      ))}
      <style>{`
        @keyframes toddlerBurst {
          0% { transform: scale(0.4) translateY(0); opacity: 1; }
          100% { transform: scale(1.8) translateY(-40px); opacity: 0; }
        }
      `}</style>
    </div>
  );
};
