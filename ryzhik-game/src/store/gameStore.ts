import { create } from 'zustand';

export type TimeOfDay = 'morning' | 'day' | 'evening' | 'night';
export type Weather = 'clear' | 'rain' | 'storm' | 'fog' | 'wind' | 'cloudy';
export type Season = 'summer' | 'autumn' | 'winter' | 'spring';
export type GameScreen = 'title' | 'playing' | 'paused';

interface QuestProgress {
  questId: string;
  currentStep: number;
  completed: boolean;
  started: boolean;
}

interface NPCState {
  id: string;
  friendship: number;
  talkedToday: boolean;
  questProgress: QuestProgress;
  currentDialogueLevel: number;
}

interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  type: string;
}

interface Collection {
  cassettes: string[];
  photos: string[];
  diaryPages: string[];
  stickers: string[];
}

interface GameState {
  screen: GameScreen;
  setScreen: (screen: GameScreen) => void;

  currentLocation: string;
  setCurrentLocation: (location: string) => void;

  gameHour: number;
  gameMinute: number;
  gameDay: number;
  timeOfDay: TimeOfDay;
  setGameTime: (hour: number, minute: number) => void;
  advanceTime: () => void;

  weather: Weather;
  setWeather: (weather: Weather) => void;

  season: Season;
  setSeason: (season: Season) => void;

  npcs: Record<string, NPCState>;
  updateNPC: (id: string, updates: Partial<NPCState>) => void;
  addFriendship: (id: string, amount: number) => void;

  inventory: InventoryItem[];
  addItem: (item: InventoryItem) => void;
  removeItem: (itemId: string) => void;
  hasItem: (itemId: string) => boolean;

  collections: Collection;
  addToCollection: (type: keyof Collection, itemId: string) => void;

  unlockedLocations: string[];
  unlockLocation: (locationId: string) => void;

  unlockedFeatures: string[];
  unlockFeature: (featureId: string) => void;

  showDialogue: boolean;
  dialogueNPC: string | null;
  dialogueText: string[];
  dialogueIndex: number;
  openDialogue: (npcId: string, texts: string[]) => void;
  advanceDialogue: () => void;
  closeDialogue: () => void;

  showInventoryUI: boolean;
  toggleInventory: () => void;

  showQuestLog: boolean;
  toggleQuestLog: () => void;

  showCollections: boolean;
  toggleCollections: () => void;

  notification: string | null;
  showNotification: (text: string) => void;
  clearNotification: () => void;

  catMood: 'happy' | 'sleepy' | 'playful' | 'scared' | 'curious';
  setCatMood: (mood: 'happy' | 'sleepy' | 'playful' | 'scared' | 'curious') => void;

  isTransitioning: boolean;
  setTransitioning: (v: boolean) => void;

  totalQuestsCompleted: number;
  gameProgress: number;
}

const initialNPCs: Record<string, NPCState> = {};
const npcIds = ['lyoha', 'igor', 'nastya', 'liza', 'mag', 'sonya', 'nena', 'kristina', 'danya', 'prohor'];
npcIds.forEach(id => {
  initialNPCs[id] = {
    id,
    friendship: 0,
    talkedToday: false,
    questProgress: {
      questId: '',
      currentStep: 0,
      completed: false,
      started: false,
    },
    currentDialogueLevel: 0,
  };
});

export const useGameStore = create<GameState>((set, get) => ({
  screen: 'title',
  setScreen: (screen) => set({ screen }),

  currentLocation: 'yard',
  setCurrentLocation: (location) => set({ currentLocation: location }),

  gameHour: 14,
  gameMinute: 0,
  gameDay: 1,
  timeOfDay: 'day',
  setGameTime: (hour, minute) => {
    let tod: TimeOfDay = 'day';
    if (hour >= 5 && hour < 10) tod = 'morning';
    else if (hour >= 10 && hour < 17) tod = 'day';
    else if (hour >= 17 && hour < 21) tod = 'evening';
    else tod = 'night';
    set({ gameHour: hour, gameMinute: minute, timeOfDay: tod });
  },
  advanceTime: () => {
    const { gameHour, gameMinute, gameDay } = get();
    let newMinute = gameMinute + 1;
    let newHour = gameHour;
    let newDay = gameDay;
    if (newMinute >= 60) {
      newMinute = 0;
      newHour++;
      if (newHour >= 24) {
        newHour = 0;
        newDay++;
      }
    }
    let tod: TimeOfDay = 'day';
    if (newHour >= 5 && newHour < 10) tod = 'morning';
    else if (newHour >= 10 && newHour < 17) tod = 'day';
    else if (newHour >= 17 && newHour < 21) tod = 'evening';
    else tod = 'night';
    set({ gameHour: newHour, gameMinute: newMinute, gameDay: newDay, timeOfDay: tod });
  },

  weather: 'clear',
  setWeather: (weather) => set({ weather }),

  season: 'summer',
  setSeason: (season) => set({ season }),

  npcs: initialNPCs,
  updateNPC: (id, updates) => set(state => ({
    npcs: { ...state.npcs, [id]: { ...state.npcs[id], ...updates } },
  })),
  addFriendship: (id, amount) => set(state => ({
    npcs: {
      ...state.npcs,
      [id]: { ...state.npcs[id], friendship: Math.min(100, state.npcs[id].friendship + amount) },
    },
  })),

  inventory: [],
  addItem: (item) => set(state => {
    const existing = state.inventory.find(i => i.id === item.id);
    if (existing) {
      return {
        inventory: state.inventory.map(i =>
          i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
        ),
      };
    }
    return { inventory: [...state.inventory, item] };
  }),
  removeItem: (itemId) => set(state => ({
    inventory: state.inventory.filter(i => i.id !== itemId),
  })),
  hasItem: (itemId) => get().inventory.some(i => i.id === itemId),

  collections: {
    cassettes: [],
    photos: [],
    diaryPages: [],
    stickers: [],
  },
  addToCollection: (type, itemId) => set(state => {
    if (state.collections[type].includes(itemId)) return state;
    return {
      collections: {
        ...state.collections,
        [type]: [...state.collections[type], itemId],
      },
    };
  }),

  unlockedLocations: ['yard', 'house', 'forest', 'pond'],
  unlockLocation: (locationId) => set(state => ({
    unlockedLocations: state.unlockedLocations.includes(locationId)
      ? state.unlockedLocations
      : [...state.unlockedLocations, locationId],
  })),

  unlockedFeatures: [],
  unlockFeature: (featureId) => set(state => ({
    unlockedFeatures: state.unlockedFeatures.includes(featureId)
      ? state.unlockedFeatures
      : [...state.unlockedFeatures, featureId],
  })),

  showDialogue: false,
  dialogueNPC: null,
  dialogueText: [],
  dialogueIndex: 0,
  openDialogue: (npcId, texts) => set({
    showDialogue: true,
    dialogueNPC: npcId,
    dialogueText: texts,
    dialogueIndex: 0,
  }),
  advanceDialogue: () => {
    const { dialogueIndex, dialogueText } = get();
    if (dialogueIndex < dialogueText.length - 1) {
      set({ dialogueIndex: dialogueIndex + 1 });
    } else {
      get().closeDialogue();
    }
  },
  closeDialogue: () => set({
    showDialogue: false,
    dialogueNPC: null,
    dialogueText: [],
    dialogueIndex: 0,
  }),

  showInventoryUI: false,
  toggleInventory: () => set(state => ({ showInventoryUI: !state.showInventoryUI })),

  showQuestLog: false,
  toggleQuestLog: () => set(state => ({ showQuestLog: !state.showQuestLog })),

  showCollections: false,
  toggleCollections: () => set(state => ({ showCollections: !state.showCollections })),

  notification: null,
  showNotification: (text) => {
    set({ notification: text });
    setTimeout(() => get().clearNotification(), 3000);
  },
  clearNotification: () => set({ notification: null }),

  catMood: 'curious',
  setCatMood: (mood) => set({ catMood: mood }),

  isTransitioning: false,
  setTransitioning: (v) => set({ isTransitioning: v }),

  totalQuestsCompleted: 0,
  gameProgress: 0,
}));
