import { create } from 'zustand';
import type { GameState, Season, Weather, Location, QuestProgress, InventoryItem } from '../game/types';
import { QUESTS } from '../game/data/quests';

interface GameStore extends GameState {
  isPlaying: boolean;
  showDialogue: boolean;
  currentDialogueNPC: string | null;
  showQuestLog: boolean;
  showInventory: boolean;
  currentAmbientText: string;
  musicTrack: string;
  catMoodTimer: number;

  setPlaying: (val: boolean) => void;
  setTime: (t: number) => void;
  advanceDay: () => void;
  setSeason: (s: Season) => void;
  setWeather: (w: Weather) => void;
  setLocation: (l: Location) => void;

  addItem: (item: InventoryItem) => void;
  removeItem: (id: string) => void;
  hasItem: (id: string) => boolean;

  addFriendship: (npcId: string, amount: number) => void;
  getFriendship: (npcId: string) => number;

  startQuest: (questId: string) => void;
  advanceQuestStep: (questId: string, stepId: string) => void;
  completeQuest: (questId: string) => void;
  getQuestStatus: (questId: string) => QuestProgress;

  addDiscovery: (id: string) => void;
  hasDiscovery: (id: string) => boolean;
  addCassette: (id: string) => void;
  addPhoto: (id: string) => void;

  openDialogue: (npcId: string) => void;
  closeDialogue: () => void;
  toggleQuestLog: () => void;
  toggleInventory: () => void;
  setAmbientText: (text: string) => void;
  setMusicTrack: (track: string) => void;
  setCatMood: (mood: GameState['catMood']) => void;
}

const initialQuestProgress = (): Record<string, QuestProgress> => {
  const progress: Record<string, QuestProgress> = {};
  QUESTS.forEach(q => {
    progress[q.id] = {
      status: q.id === 'old_cassette' || q.id === 'lost_pick' || q.id === 'fence_repair' ? 'available' : 'locked',
      currentStep: 0,
      stepProgress: {}
    };
  });
  return progress;
};

export const useGameStore = create<GameStore>((set, get) => ({
  isPlaying: false,
  showDialogue: false,
  currentDialogueNPC: null,
  showQuestLog: false,
  showInventory: false,
  currentAmbientText: '',
  musicTrack: 'morning_acoustic',
  catMoodTimer: 0,

  time: 9 * 60,
  day: 1,
  season: 'summer',
  weather: 'clear',
  location: 'yard',
  inventory: [],
  quests: initialQuestProgress(),
  friendship: {},
  discoveries: [],
  cassettes: [],
  photos: [],
  catMood: 'calm',

  setPlaying: (val) => set({ isPlaying: val }),
  setTime: (t) => set({ time: ((t % 1440) + 1440) % 1440 }),
  advanceDay: () => set(s => ({ day: s.day + 1 })),
  setSeason: (s) => set({ season: s }),
  setWeather: (w) => set({ weather: w }),
  setLocation: (l) => set({ location: l }),

  addItem: (item) => set(s => ({
    inventory: s.inventory.some(i => i.id === item.id) ? s.inventory : [...s.inventory, item]
  })),
  removeItem: (id) => set(s => ({ inventory: s.inventory.filter(i => i.id !== id) })),
  hasItem: (id) => get().inventory.some(i => i.id === id),

  addFriendship: (npcId, amount) => set(s => ({
    friendship: {
      ...s.friendship,
      [npcId]: Math.min(100, (s.friendship[npcId] || 0) + amount)
    }
  })),
  getFriendship: (npcId) => get().friendship[npcId] || 0,

  startQuest: (questId) => set(s => ({
    quests: {
      ...s.quests,
      [questId]: { ...s.quests[questId], status: 'active' }
    }
  })),

  advanceQuestStep: (questId, stepId) => set(s => {
    const quest = s.quests[questId];
    if (!quest) return s;
    const questData = QUESTS.find(q => q.id === questId);
    if (!questData) return s;
    const newStepProgress = { ...quest.stepProgress, [stepId]: 1 };
    const completedSteps = Object.keys(newStepProgress).filter(k => newStepProgress[k] >= 1).length;
    const newCurrentStep = Math.min(completedSteps, questData.steps.length - 1);
    return {
      quests: {
        ...s.quests,
        [questId]: { ...quest, currentStep: newCurrentStep, stepProgress: newStepProgress }
      }
    };
  }),

  completeQuest: (questId) => set(s => {
    const questData = QUESTS.find(q => q.id === questId);
    if (!questData) return s;
    const newFriendship = { ...s.friendship };
    newFriendship[questData.npcId] = Math.min(100, (newFriendship[questData.npcId] || 0) + questData.reward.friendship);
    const newQuests = { ...s.quests, [questId]: { ...s.quests[questId], status: 'completed' as const } };
    const newCassettes = questData.reward.music ? [...s.cassettes, questData.reward.music] : s.cassettes;
    return { quests: newQuests, friendship: newFriendship, cassettes: newCassettes };
  }),

  getQuestStatus: (questId) => get().quests[questId] || { status: 'locked', currentStep: 0, stepProgress: {} },

  addDiscovery: (id) => set(s => ({
    discoveries: s.discoveries.includes(id) ? s.discoveries : [...s.discoveries, id]
  })),
  hasDiscovery: (id) => get().discoveries.includes(id),
  addCassette: (id) => set(s => ({
    cassettes: s.cassettes.includes(id) ? s.cassettes : [...s.cassettes, id]
  })),
  addPhoto: (id) => set(s => ({
    photos: s.photos.includes(id) ? s.photos : [...s.photos, id]
  })),

  openDialogue: (npcId) => set({ showDialogue: true, currentDialogueNPC: npcId }),
  closeDialogue: () => set({ showDialogue: false, currentDialogueNPC: null }),
  toggleQuestLog: () => set(s => ({ showQuestLog: !s.showQuestLog, showInventory: false })),
  toggleInventory: () => set(s => ({ showInventory: !s.showInventory, showQuestLog: false })),
  setAmbientText: (text) => set({ currentAmbientText: text }),
  setMusicTrack: (track) => set({ musicTrack: track }),
  setCatMood: (mood) => set({ catMood: mood }),
}));
