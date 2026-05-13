import { useGameStore } from '../../store/gameStore';
import { NPC_DATA } from '../../game/data/npcs';
import { LOCATIONS } from '../../game/data/locations';
import { QUESTS } from '../../game/data/quests';

const WEATHER_ICONS: Record<string, string> = {
  clear: '☀️', rain: '🌧️', storm: '⛈️', fog: '🌫️', wind: '💨', cloudy: '☁️',
};

const TIME_ICONS: Record<string, string> = {
  morning: '🌅', day: '☀️', evening: '🌆', night: '🌙',
};

const SEASON_NAMES: Record<string, string> = {
  summer: 'Лето', autumn: 'Осень', winter: 'Зима', spring: 'Весна',
};

export function GameHUD() {
  const {
    gameHour, gameMinute, timeOfDay, weather, season, currentLocation,
    showDialogue, dialogueNPC, dialogueText, dialogueIndex, advanceDialogue,
    showInventoryUI, toggleInventory, inventory,
    showQuestLog, toggleQuestLog, npcs,
    showCollections, toggleCollections, collections,
    notification, catMood,
  } = useGameStore();

  const loc = LOCATIONS.find(l => l.id === currentLocation);
  const timeStr = `${gameHour.toString().padStart(2, '0')}:${gameMinute.toString().padStart(2, '0')}`;

  const moodEmoji: Record<string, string> = {
    happy: '😺', sleepy: '😴', playful: '😸', scared: '🙀', curious: '😼',
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-20" style={{ fontFamily: 'Georgia, serif' }}>
      <div className="absolute top-3 left-3 right-3 flex justify-between items-start pointer-events-auto">
        <div className="glass-panel px-3 py-2 flex items-center gap-2 text-sm" style={{ color: '#FFE4B5' }}>
          <span>{TIME_ICONS[timeOfDay]}</span>
          <span>{timeStr}</span>
          <span className="opacity-50">|</span>
          <span>{WEATHER_ICONS[weather]}</span>
          <span className="opacity-50">|</span>
          <span className="text-xs opacity-60">{SEASON_NAMES[season]}</span>
        </div>

        <div className="glass-panel px-3 py-2 text-sm" style={{ color: '#FFE4B5' }}>
          <span>📍 {loc?.name || currentLocation}</span>
        </div>
      </div>

      <div className="absolute top-3 left-1/2 -translate-x-1/2">
        <div className="glass-panel px-3 py-1 text-xs" style={{ color: '#d4a574' }}>
          {moodEmoji[catMood]} Рыжик
        </div>
      </div>

      <div className="absolute bottom-3 left-3 right-3 flex justify-center gap-2 pointer-events-auto">
        <button onClick={toggleInventory}
                className="glass-button px-4 py-2 text-sm flex items-center gap-1">
          🎒 <span className="hidden sm:inline">Инвентарь</span>
          {inventory.length > 0 && (
            <span className="ml-1 bg-amber-600/30 px-1.5 rounded-full text-xs">{inventory.length}</span>
          )}
        </button>
        <button onClick={toggleQuestLog}
                className="glass-button px-4 py-2 text-sm flex items-center gap-1">
          📜 <span className="hidden sm:inline">Квесты</span>
        </button>
        <button onClick={toggleCollections}
                className="glass-button px-4 py-2 text-sm flex items-center gap-1">
          📷 <span className="hidden sm:inline">Коллекции</span>
        </button>
      </div>

      {showDialogue && dialogueNPC && (
        <div className="absolute bottom-16 left-3 right-3 pointer-events-auto slide-up">
          <div className="glass-panel p-4 max-w-lg mx-auto cursor-pointer" onClick={advanceDialogue}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">💬</span>
              <span className="font-bold text-sm" style={{ color: '#f4a460' }}>
                {NPC_DATA.find(n => n.id === dialogueNPC)?.nameRu || dialogueNPC}
              </span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: '#e8dcc8' }}>
              {dialogueText[dialogueIndex]}
            </p>
            <p className="text-xs mt-2 opacity-40 text-right">
              {dialogueIndex < dialogueText.length - 1 ? 'Нажмите для продолжения...' : 'Нажмите для закрытия'}
            </p>
          </div>
        </div>
      )}

      {showInventoryUI && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-auto fade-in">
          <div className="absolute inset-0 bg-black/40" onClick={toggleInventory} />
          <div className="glass-panel p-5 w-[90%] max-w-md max-h-[70vh] overflow-y-auto relative z-10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold" style={{ color: '#FFE4B5' }}>🎒 Инвентарь</h2>
              <button onClick={toggleInventory} className="text-white/40 hover:text-white/80 text-xl">×</button>
            </div>
            {inventory.length === 0 ? (
              <p className="text-sm opacity-40" style={{ color: '#e8dcc8' }}>Пусто... Исследуй мир!</p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {inventory.map(item => (
                  <div key={item.id} className="glass-button p-3 text-xs">
                    <p className="font-medium" style={{ color: '#FFE4B5' }}>{item.name}</p>
                    <p className="opacity-50 mt-1">×{item.quantity}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {showQuestLog && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-auto fade-in">
          <div className="absolute inset-0 bg-black/40" onClick={toggleQuestLog} />
          <div className="glass-panel p-5 w-[90%] max-w-md max-h-[70vh] overflow-y-auto relative z-10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold" style={{ color: '#FFE4B5' }}>📜 Квесты</h2>
              <button onClick={toggleQuestLog} className="text-white/40 hover:text-white/80 text-xl">×</button>
            </div>
            <div className="space-y-3">
              {Object.values(npcs).filter(n => n.questProgress.started).map(npcState => {
                const quest = QUESTS.find(q => q.npcId === npcState.id);
                const npcData = NPC_DATA.find(n => n.id === npcState.id);
                if (!quest) return null;
                return (
                  <div key={npcState.id} className="glass-button p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={npcState.questProgress.completed ? 'opacity-50' : ''}>
                        {npcState.questProgress.completed ? '✅' : '⭐'}
                      </span>
                      <span className="text-sm font-medium" style={{ color: '#FFE4B5' }}>
                        {quest.name}
                      </span>
                    </div>
                    <p className="text-xs opacity-60" style={{ color: '#e8dcc8' }}>
                      {npcData?.nameRu} — {quest.description}
                    </p>
                    {!npcState.questProgress.completed && (
                      <p className="text-xs mt-1" style={{ color: '#f4a460' }}>
                        Шаг {npcState.questProgress.currentStep + 1}/{quest.steps.length}:
                        {' '}{quest.steps[npcState.questProgress.currentStep]?.description}
                      </p>
                    )}
                    <div className="mt-2 flex items-center gap-1">
                      <span className="text-xs opacity-40">❤️ {npcState.friendship}/100</span>
                      <div className="flex-1 h-1 rounded-full bg-white/10">
                        <div className="h-full rounded-full transition-all duration-500"
                             style={{
                               width: `${npcState.friendship}%`,
                               background: 'linear-gradient(90deg, #f4a460, #ff6b6b)',
                             }} />
                      </div>
                    </div>
                  </div>
                );
              })}
              {Object.values(npcs).filter(n => n.questProgress.started).length === 0 && (
                <p className="text-sm opacity-40" style={{ color: '#e8dcc8' }}>
                  Поговори с жителями, чтобы начать квесты!
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {showCollections && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-auto fade-in">
          <div className="absolute inset-0 bg-black/40" onClick={toggleCollections} />
          <div className="glass-panel p-5 w-[90%] max-w-md max-h-[70vh] overflow-y-auto relative z-10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold" style={{ color: '#FFE4B5' }}>📷 Коллекции</h2>
              <button onClick={toggleCollections} className="text-white/40 hover:text-white/80 text-xl">×</button>
            </div>
            <div className="space-y-3">
              <CollectionRow icon="📼" name="Кассеты" items={collections.cassettes} total={8} />
              <CollectionRow icon="📷" name="Фотографии" items={collections.photos} total={12} />
              <CollectionRow icon="📖" name="Страницы дневника" items={collections.diaryPages} total={10} />
              <CollectionRow icon="⭐" name="Наклейки" items={collections.stickers} total={15} />
            </div>
          </div>
        </div>
      )}

      {notification && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 pointer-events-none fade-in">
          <div className="glass-panel px-4 py-2 text-sm whitespace-nowrap" style={{ color: '#FFE4B5' }}>
            {notification}
          </div>
        </div>
      )}
    </div>
  );
}

function CollectionRow({ icon, name, items, total }: { icon: string; name: string; items: string[]; total: number }) {
  return (
    <div className="glass-button p-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm" style={{ color: '#FFE4B5' }}>{icon} {name}</span>
        <span className="text-xs opacity-50">{items.length}/{total}</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/10">
        <div className="h-full rounded-full transition-all duration-500"
             style={{
               width: `${(items.length / total) * 100}%`,
               background: 'linear-gradient(90deg, #7cb342, #f4a460)',
             }} />
      </div>
    </div>
  );
}
