export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;
export const WORLD_WIDTH = 4096;
export const WORLD_HEIGHT = 1200;

export const DAY_DURATION = 600000; // 10 min real = 1 game day
export const MINUTES_PER_SECOND = 24 * 60 / (DAY_DURATION / 1000);

export const TIME_COLORS: Record<string, { sky: number; ambient: number; alpha: number }> = {
  dawn:       { sky: 0xFF6B6B, ambient: 0xFF8C69, alpha: 0.3 },
  morning:    { sky: 0x87CEEB, ambient: 0xFFF8DC, alpha: 0.0 },
  noon:       { sky: 0x4FC3F7, ambient: 0xFFFFE0, alpha: 0.0 },
  afternoon:  { sky: 0x64B5F6, ambient: 0xFFF0C8, alpha: 0.0 },
  golden:     { sky: 0xFF9A3C, ambient: 0xFFD700, alpha: 0.2 },
  dusk:       { sky: 0x7B3F8C, ambient: 0xFF6B9D, alpha: 0.4 },
  night:      { sky: 0x1A237E, ambient: 0x3F51B5, alpha: 0.6 },
  deep_night: { sky: 0x0A0A2E, ambient: 0x1A1A4A, alpha: 0.8 },
};

export const WEATHER_CONFIG: Record<string, { windSpeed: number; rainIntensity: number; fogDensity: number }> = {
  clear:   { windSpeed: 0.3, rainIntensity: 0,   fogDensity: 0   },
  cloudy:  { windSpeed: 0.5, rainIntensity: 0,   fogDensity: 0.1 },
  rain:    { windSpeed: 1.0, rainIntensity: 0.7, fogDensity: 0.2 },
  storm:   { windSpeed: 2.0, rainIntensity: 1.0, fogDensity: 0.3 },
  fog:     { windSpeed: 0.1, rainIntensity: 0,   fogDensity: 0.7 },
  windy:   { windSpeed: 2.5, rainIntensity: 0,   fogDensity: 0.0 },
};

export const CAT_SPEED = 180;
export const CAT_SPRINT_SPEED = 280;
export const CAT_JUMP_VELOCITY = -450;

export const FRIENDSHIP_LEVELS = [0, 20, 40, 60, 80, 100];
export const FRIENDSHIP_NAMES = ['Незнакомец', 'Знакомый', 'Приятель', 'Друг', 'Близкий друг', 'Лучший друг'];

export const PALETTE = {
  ORANGE_CAT: 0xFF8C32,
  ORANGE_DARK: 0xCC6A0E,
  WHITE: 0xFFFFFF,
  CREAM: 0xFFF8DC,
  AMBER: 0xFFB347,
  GRASS_LIGHT: 0x7CB342,
  GRASS_DARK: 0x558B2F,
  SOIL: 0x6D4C41,
  WOOD_LIGHT: 0xA1887F,
  WOOD_DARK: 0x6D4C41,
  STONE: 0x78909C,
  SKY_DAY: 0x87CEEB,
  SKY_NIGHT: 0x0A0A2E,
  WATER: 0x29B6F6,
  LEAF_GREEN: 0x66BB6A,
  LEAF_AUTUMN: 0xFF8F00,
  FIREFLY: 0xCCFF00,
  LANTERN: 0xFFD54F,
  WINDOW_GLOW: 0xFFE082,
};

export const SCENE_KEYS = {
  BOOT: 'BootScene',
  PRELOAD: 'PreloadScene',
  MENU: 'MenuScene',
  GAME: 'GameScene',
  UI: 'UIScene',
};

export const ASSET_KEYS = {
  CAT: 'cat',
  CAT_WALK: 'cat_walk',
  CAT_SLEEP: 'cat_sleep',
  HOUSE: 'house',
  TREE_BIG: 'tree_big',
  TREE_MED: 'tree_med',
  BUSH: 'bush',
  GRASS_TILE: 'grass_tile',
  FENCE: 'fence',
  LANTERN: 'lantern',
  FIREFLY: 'firefly',
  RAIN_DROP: 'rain_drop',
  LEAF: 'leaf',
  CAMPFIRE: 'campfire',
  SWING: 'swing',
  HAMMOCK: 'hammock',
  POND: 'pond',
  CASSETTE: 'cassette',
  STAR: 'star',
  CLOUD: 'cloud',
  SMOKE: 'smoke',
  SPARKLE: 'sparkle',
  NPC_BASE: 'npc_base',
};
