export type TimeOfDay = 'dawn' | 'morning' | 'noon' | 'afternoon' | 'golden' | 'dusk' | 'night' | 'deep_night';
export type Season = 'summer' | 'autumn' | 'winter' | 'spring';
export type Weather = 'clear' | 'cloudy' | 'rain' | 'storm' | 'fog' | 'windy';
export type Location = 'yard' | 'house' | 'forest' | 'pond' | 'greenhouse' | 'attic' | 'basement';

export interface Vector2 {
  x: number;
  y: number;
}

export interface CharacterData {
  id: string;
  name: string;
  nameRu: string;
  color: number;
  hairColor: number;
  skinColor: number;
  description: string;
  personality: string[];
  favoritItems: string[];
  questId: string;
  startPosition: Vector2;
  schedule: ScheduleEntry[];
}

export interface ScheduleEntry {
  timeStart: number;
  timeEnd: number;
  location: Location;
  activity: string;
  position: Vector2;
}

export interface QuestData {
  id: string;
  title: string;
  titleRu: string;
  description: string;
  npcId: string;
  steps: QuestStep[];
  reward: QuestReward;
  requiredItems?: string[];
  requiredFriendship?: number;
}

export interface QuestStep {
  id: string;
  description: string;
  type: 'collect' | 'talk' | 'explore' | 'deliver' | 'interact';
  targetId?: string;
  targetCount?: number;
  completed: boolean;
}

export interface QuestReward {
  friendship: number;
  items?: string[];
  music?: string;
  location?: Location;
  event?: string;
}

export interface DialogueLine {
  speaker: string;
  text: string;
  emotion?: string;
  portrait?: string;
}

export interface DialogueTree {
  id: string;
  lines: DialogueLine[];
  choices?: DialogueChoice[];
}

export interface DialogueChoice {
  text: string;
  nextId?: string;
  effect?: { friendship?: number; questProgress?: string; item?: string };
}

export interface InventoryItem {
  id: string;
  name: string;
  nameRu: string;
  description: string;
  icon: string;
  type: 'cassette' | 'photo' | 'key' | 'tool' | 'gift' | 'collectible';
  questId?: string;
}

export interface GameState {
  time: number;
  day: number;
  season: Season;
  weather: Weather;
  location: Location;
  inventory: InventoryItem[];
  quests: { [questId: string]: QuestProgress };
  friendship: { [npcId: string]: number };
  discoveries: string[];
  cassettes: string[];
  photos: string[];
  catMood: 'happy' | 'curious' | 'sleepy' | 'playful' | 'calm';
}

export interface QuestProgress {
  status: 'locked' | 'available' | 'active' | 'completed';
  currentStep: number;
  stepProgress: { [stepId: string]: number };
}
