import { useEffect, useRef, useState } from 'react';
import { createGame } from '../game/Game';
import { useGameStore } from '../store/gameStore';

export function GameContainer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const [gameStarted, setGameStarted] = useState(false);

  const isPlaying = useGameStore(s => s.isPlaying);

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    const game = createGame(containerRef.current);
    gameRef.current = game;
    setGameStarted(true);

    return () => {
      game.destroy(true);
      gameRef.current = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{ touchAction: 'none' }}
    />
  );
}
