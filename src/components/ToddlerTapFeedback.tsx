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
    <div className="tap-feedback-overlay">
      {ripples.map((r) => (
        <div
          key={r.id}
          className="tap-feedback-emoji"
          style={{
            left: `${r.x}px`,
            top: `${r.y}px`
          }}
        >
          {r.emoji}
        </div>
      ))}
    </div>
  );
};
