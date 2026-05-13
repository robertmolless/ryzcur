import { useEffect, useRef } from 'react';
import { createPhaserGame } from '../../game/PhaserGame';
import { GameHUD } from './GameHUD';

export function GameContainer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (containerRef.current && !gameRef.current) {
      gameRef.current = createPhaserGame(containerRef.current);
    }

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-[#0d1117]">
      <div ref={containerRef} className="w-full h-full" />
      <GameHUD />
    </div>
  );
}
