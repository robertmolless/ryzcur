import { useGameStore } from './store/gameStore';
import { TitleScreen } from './ui/components/TitleScreen';
import { GameContainer } from './ui/components/GameContainer';

export default function App() {
  const screen = useGameStore(s => s.screen);

  return (
    <div className="w-full h-full">
      {screen === 'title' && <TitleScreen />}
      {screen === 'playing' && <GameContainer />}
    </div>
  );
}
