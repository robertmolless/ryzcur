import { useEffect, useRef } from 'react';
import { createPhaserGame } from '../../game/PhaserGame';
import { audioSystem } from '../../game/systems/AudioSystem';
import { useGameStore } from '../../store/gameStore';
import { GameHUD } from './GameHUD';

export function GameContainer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const audioInitialized = useRef(false);
  const timeOfDay = useGameStore(s => s.timeOfDay);
  const weather = useGameStore(s => s.weather);
  const currentLocation = useGameStore(s => s.currentLocation);

  useEffect(() => {
    if (containerRef.current && !gameRef.current) {
      gameRef.current = createPhaserGame(containerRef.current);
    }

    const initAudio = () => {
      if (!audioInitialized.current) {
        audioSystem.init();
        audioInitialized.current = true;
      }
      audioSystem.resume();
    };
    document.addEventListener('click', initAudio, { once: true });
    document.addEventListener('touchstart', initAudio, { once: true });

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
      audioSystem.destroy();
      document.removeEventListener('click', initAudio);
      document.removeEventListener('touchstart', initAudio);
    };
  }, []);

  useEffect(() => {
    audioSystem.updateMood(timeOfDay, weather, currentLocation);
  }, [timeOfDay, weather, currentLocation]);

  return (
    <div className="fixed inset-0 bg-[#0d1117]">
      <div ref={containerRef} className="w-full h-full" />
      <GameHUD />
    </div>
  );
}
