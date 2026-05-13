export interface LocationData {
  id: string;
  name: string;
  width: number;
  height: number;
  connections: { targetId: string; x: number; y: number; direction: string }[];
  interactables: { id: string; x: number; y: number; width: number; height: number; name: string; type: string }[];
  ambience: string;
  musicTrack: string;
}

export const LOCATIONS: LocationData[] = [
  {
    id: 'yard',
    name: 'Двор',
    width: 1200,
    height: 700,
    connections: [
      { targetId: 'house', x: 600, y: 150, direction: 'north' },
      { targetId: 'forest', x: 50, y: 400, direction: 'west' },
      { targetId: 'pond', x: 1150, y: 400, direction: 'east' },
    ],
    interactables: [
      { id: 'campfire', x: 400, y: 450, width: 80, height: 60, name: 'Костёр', type: 'fire' },
      { id: 'swing', x: 200, y: 380, width: 60, height: 80, name: 'Качели', type: 'interactive' },
      { id: 'hammock', x: 700, y: 350, width: 100, height: 50, name: 'Гамак', type: 'rest' },
      { id: 'shed', x: 900, y: 300, width: 120, height: 100, name: 'Сарай', type: 'search' },
      { id: 'flowerbed', x: 550, y: 500, width: 80, height: 40, name: 'Клумба', type: 'garden' },
      { id: 'cat_corner', x: 800, y: 480, width: 60, height: 50, name: 'Кошачий уголок', type: 'cat' },
    ],
    ambience: 'yard_ambience',
    musicTrack: 'yard_day',
  },
  {
    id: 'house',
    name: 'Старый Дом',
    width: 1200,
    height: 700,
    connections: [
      { targetId: 'yard', x: 600, y: 650, direction: 'south' },
    ],
    interactables: [
      { id: 'cassette_player', x: 300, y: 350, width: 60, height: 40, name: 'Кассетный плеер', type: 'music' },
      { id: 'old_tv', x: 500, y: 300, width: 80, height: 60, name: 'Старый ТВ', type: 'interactive' },
      { id: 'guitar', x: 150, y: 400, width: 40, height: 80, name: 'Гитара', type: 'music' },
      { id: 'bookshelf', x: 700, y: 280, width: 100, height: 120, name: 'Книжная полка', type: 'search' },
      { id: 'window_seat', x: 900, y: 300, width: 80, height: 60, name: 'Подоконник', type: 'rest' },
      { id: 'old_pc', x: 800, y: 400, width: 60, height: 50, name: 'Старый ПК', type: 'interactive' },
    ],
    ambience: 'house_ambience',
    musicTrack: 'house_cozy',
  },
  {
    id: 'forest',
    name: 'Лес',
    width: 1200,
    height: 700,
    connections: [
      { targetId: 'yard', x: 1150, y: 400, direction: 'east' },
      { targetId: 'greenhouse', x: 200, y: 200, direction: 'north' },
    ],
    interactables: [
      { id: 'old_well', x: 400, y: 350, width: 60, height: 60, name: 'Старый колодец', type: 'search' },
      { id: 'mushroom_spot', x: 250, y: 450, width: 50, height: 40, name: 'Грибная поляна', type: 'gather' },
      { id: 'treehouse', x: 700, y: 200, width: 120, height: 100, name: 'Домик на дереве', type: 'explore' },
      { id: 'stream', x: 500, y: 550, width: 200, height: 40, name: 'Ручей', type: 'ambient' },
    ],
    ambience: 'forest_ambience',
    musicTrack: 'forest_mysterious',
  },
  {
    id: 'pond',
    name: 'Пруд',
    width: 1200,
    height: 700,
    connections: [
      { targetId: 'yard', x: 50, y: 400, direction: 'west' },
    ],
    interactables: [
      { id: 'dock', x: 500, y: 450, width: 120, height: 40, name: 'Мостик', type: 'rest' },
      { id: 'boat', x: 650, y: 400, width: 80, height: 50, name: 'Лодка', type: 'interactive' },
      { id: 'fishing_spot', x: 400, y: 500, width: 60, height: 40, name: 'Место для рыбалки', type: 'minigame' },
      { id: 'lily_pads', x: 600, y: 350, width: 100, height: 60, name: 'Кувшинки', type: 'ambient' },
    ],
    ambience: 'pond_ambience',
    musicTrack: 'pond_calm',
  },
  {
    id: 'greenhouse',
    name: 'Теплица',
    width: 1200,
    height: 700,
    connections: [
      { targetId: 'forest', x: 600, y: 650, direction: 'south' },
    ],
    interactables: [
      { id: 'magic_plants', x: 300, y: 350, width: 80, height: 60, name: 'Магические растения', type: 'special' },
      { id: 'growth_table', x: 600, y: 300, width: 100, height: 60, name: 'Стол выращивания', type: 'craft' },
      { id: 'secret_shelf', x: 800, y: 280, width: 60, height: 80, name: 'Тайная полка', type: 'search' },
    ],
    ambience: 'greenhouse_ambience',
    musicTrack: 'greenhouse_mystic',
  },
];
