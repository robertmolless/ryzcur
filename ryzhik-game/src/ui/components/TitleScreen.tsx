import { useGameStore } from '../../store/gameStore';
import { useEffect, useState } from 'react';

export function TitleScreen() {
  const setScreen = useGameStore(s => s.setScreen);
  const [fadeIn, setFadeIn] = useState(false);
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    setFadeIn(true);
    const t1 = setTimeout(() => setShowSubtitle(true), 800);
    const t2 = setTimeout(() => setShowButton(true), 1500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden"
         style={{ background: 'linear-gradient(180deg, #0B0B2A 0%, #1A1A4E 30%, #2C1654 60%, #FF6B35 85%, #FFB347 100%)' }}>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 40 }).map((_, i) => (
          <div key={i} className="absolute rounded-full bg-yellow-200"
               style={{
                 width: 2 + Math.random() * 3,
                 height: 2 + Math.random() * 3,
                 left: `${Math.random() * 100}%`,
                 top: `${Math.random() * 60}%`,
                 opacity: 0.3 + Math.random() * 0.5,
                 animation: `pulse ${2 + Math.random() * 3}s ease-in-out infinite`,
                 animationDelay: `${Math.random() * 3}s`,
               }} />
        ))}

        {Array.from({ length: 15 }).map((_, i) => (
          <div key={`ff-${i}`} className="absolute rounded-full"
               style={{
                 width: 4 + Math.random() * 4,
                 height: 4 + Math.random() * 4,
                 left: `${20 + Math.random() * 60}%`,
                 top: `${50 + Math.random() * 40}%`,
                 background: 'radial-gradient(circle, #FFFF88 0%, #FFDD44 40%, transparent 70%)',
                 opacity: 0,
                 animation: `fireflyFloat ${4 + Math.random() * 4}s ease-in-out infinite`,
                 animationDelay: `${Math.random() * 5}s`,
               }} />
        ))}
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-[40%]"
           style={{
             background: 'linear-gradient(0deg, #1a3a1a 0%, #2a5a2a 30%, transparent 100%)',
             opacity: 0.6,
           }} />

      <div className={`relative z-10 text-center transition-all duration-1000 ${fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="mb-2">
          <span className="text-6xl">🐱</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold mb-3"
            style={{
              color: '#FFE4B5',
              textShadow: '0 0 30px rgba(255, 165, 0, 0.3), 0 2px 10px rgba(0,0,0,0.5)',
              fontFamily: 'Georgia, serif',
            }}>
          Рыжик
        </h1>

        <div className={`transition-all duration-700 ${showSubtitle ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <p className="text-lg md:text-xl mb-1"
             style={{ color: '#d4a574', fontFamily: 'Georgia, serif' }}>
            и Старый Загородный Дом
          </p>
          <p className="text-sm mt-4 max-w-md mx-auto px-4"
             style={{ color: 'rgba(255,228,181,0.5)', fontFamily: 'Georgia, serif' }}>
            Атмосферная история о доме, дружбе и лете, которое никогда не заканчивается
          </p>
        </div>
      </div>

      <div className={`relative z-10 mt-12 transition-all duration-700 ${showButton ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <button
          onClick={() => setScreen('playing')}
          className="px-10 py-4 text-lg font-medium rounded-2xl cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95"
          style={{
            background: 'rgba(244, 164, 96, 0.2)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(244, 164, 96, 0.4)',
            color: '#FFE4B5',
            fontFamily: 'Georgia, serif',
            boxShadow: '0 0 30px rgba(244, 164, 96, 0.1), inset 0 0 30px rgba(244, 164, 96, 0.05)',
          }}>
          Начать историю
        </button>

        <p className="text-center mt-6 text-xs" style={{ color: 'rgba(255,228,181,0.3)' }}>
          Нажмите, чтобы войти в мир Рыжика
        </p>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.3); }
        }
        @keyframes fireflyFloat {
          0%, 100% { opacity: 0; transform: translate(0, 0); }
          20% { opacity: 0.8; }
          50% { opacity: 0.6; transform: translate(${Math.random() > 0.5 ? '' : '-'}${10 + Math.random() * 20}px, -${10 + Math.random() * 30}px); }
          80% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
