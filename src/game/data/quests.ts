import type { QuestData } from '../types';

export const QUESTS: QuestData[] = [
  {
    id: 'old_cassette',
    title: 'Old Cassette',
    titleRu: 'Старая кассета',
    description: 'Лёха потерял свою любимую кассету где-то в сарае. Помоги ему найти её.',
    npcId: 'lyokha',
    steps: [
      { id: 'talk_lyokha', description: 'Поговори с Лёхой о кассете', type: 'talk', targetId: 'lyokha', completed: false },
      { id: 'find_barn', description: 'Исследуй сарай', type: 'explore', targetId: 'barn', completed: false },
      { id: 'move_boxes', description: 'Подвинь коробки в сарае', type: 'interact', targetId: 'barn_boxes', targetCount: 3, completed: false },
      { id: 'collect_cassette', description: 'Найди кассету', type: 'collect', targetId: 'cassette_old', targetCount: 1, completed: false },
      { id: 'return_lyokha', description: 'Верни кассету Лёхе', type: 'deliver', targetId: 'lyokha', completed: false },
    ],
    reward: {
      friendship: 20,
      items: ['cassette_summer'],
      music: 'summer_memories',
      event: 'lyokha_plays_guitar'
    }
  },
  {
    id: 'lost_pick',
    title: 'Lost Pick',
    titleRu: 'Пропавший медиатор',
    description: 'Игорь ищет свой любимый медиатор перед важной репетицией.',
    npcId: 'igor',
    steps: [
      { id: 'talk_igor', description: 'Поговори с Игорем', type: 'talk', targetId: 'igor', completed: false },
      { id: 'search_garage', description: 'Обыщи гараж', type: 'explore', targetId: 'garage', completed: false },
      { id: 'find_pick', description: 'Найди медиатор', type: 'collect', targetId: 'guitar_pick', targetCount: 1, completed: false },
      { id: 'return_igor', description: 'Верни медиатор Игорю', type: 'deliver', targetId: 'igor', completed: false },
    ],
    reward: {
      friendship: 15,
      items: ['cassette_rock'],
      event: 'igor_mini_concert'
    }
  },
  {
    id: 'firefly_photo',
    title: 'Photo with Fireflies',
    titleRu: 'Фото со светлячками',
    description: 'Настя хочет сделать идеальную ночную фотографию с светлячками у пруда.',
    npcId: 'nastya',
    steps: [
      { id: 'talk_nastya', description: 'Поговори с Настей', type: 'talk', targetId: 'nastya', completed: false },
      { id: 'wait_night', description: 'Дождись ночи', type: 'explore', targetId: 'night_time', completed: false },
      { id: 'catch_fireflies', description: 'Поймай светлячков (3)', type: 'collect', targetId: 'firefly', targetCount: 3, completed: false },
      { id: 'go_pond', description: 'Отведи светлячков к пруду', type: 'explore', targetId: 'pond', completed: false },
      { id: 'help_photo', description: 'Помоги Насте сделать фото', type: 'interact', targetId: 'nastya_photo', completed: false },
    ],
    reward: {
      friendship: 25,
      items: ['photo_fireflies'],
      event: 'nastya_photo_album'
    }
  },
  {
    id: 'lost_stickers',
    title: 'Lost Stickers',
    titleRu: 'Потерянные наклейки',
    description: 'Лиза рассыпала свою коллекцию наклеек по всему двору.',
    npcId: 'liza',
    steps: [
      { id: 'talk_liza', description: 'Поговори с Лизой', type: 'talk', targetId: 'liza', completed: false },
      { id: 'find_stickers', description: 'Найди наклейки во дворе (5)', type: 'collect', targetId: 'sticker', targetCount: 5, completed: false },
      { id: 'return_liza', description: 'Верни наклейки Лизе', type: 'deliver', targetId: 'liza', completed: false },
    ],
    reward: {
      friendship: 15,
      items: ['ribbon_pink'],
      event: 'liza_decorates_yard'
    }
  },
  {
    id: 'moon_bell',
    title: 'Moon Bell',
    titleRu: 'Колокольчик луны',
    description: 'Маг говорит о старом колокольчике в лесу, который звонит только в полнолуние.',
    npcId: 'mag',
    steps: [
      { id: 'talk_mag', description: 'Дождись Мага ночью и поговори с ним', type: 'talk', targetId: 'mag', completed: false },
      { id: 'enter_forest', description: 'Войди в лес ночью', type: 'explore', targetId: 'forest', completed: false },
      { id: 'follow_sound', description: 'Следуй за звуком сквозь туман', type: 'explore', targetId: 'forest_deep', completed: false },
      { id: 'find_bell', description: 'Найди колокольчик', type: 'collect', targetId: 'moonbell', targetCount: 1, completed: false },
      { id: 'return_mag', description: 'Принеси колокольчик Магу', type: 'deliver', targetId: 'mag', completed: false },
    ],
    reward: {
      friendship: 30,
      items: ['moonbell'],
      location: 'greenhouse',
      event: 'greenhouse_unlocked',
      music: 'mystical_night'
    }
  },
  {
    id: 'forest_path',
    title: 'Forest Path',
    titleRu: 'Лесная тропа',
    description: 'Соня знает скрытые тропы в лесу и может показать тебе тайные места.',
    npcId: 'sonya',
    steps: [
      { id: 'talk_sonya', description: 'Поговори с Соней', type: 'talk', targetId: 'sonya', completed: false },
      { id: 'follow_sonya', description: 'Следуй за Соней по тропе', type: 'explore', targetId: 'forest_path_1', completed: false },
      { id: 'discover_well', description: 'Найди заброшенный колодец', type: 'explore', targetId: 'old_well', completed: false },
      { id: 'discover_treehouse', description: 'Найди домик на дереве', type: 'explore', targetId: 'treehouse', completed: false },
    ],
    reward: {
      friendship: 20,
      items: ['forest_map'],
      location: 'forest',
      event: 'treehouse_unlocked'
    }
  },
  {
    id: 'strange_notes',
    title: 'Strange Notes',
    titleRu: 'Странные записи',
    description: 'Нэна нашла странные записи по всему дому. Они могут раскрыть историю этого места.',
    npcId: 'nena',
    steps: [
      { id: 'talk_nena', description: 'Поговори с Нэной', type: 'talk', targetId: 'nena', completed: false },
      { id: 'find_notes', description: 'Найди записи в доме (4)', type: 'collect', targetId: 'old_note', targetCount: 4, completed: false },
      { id: 'attic_note', description: 'Найди запись на чердаке', type: 'explore', targetId: 'attic', completed: false },
      { id: 'return_nena', description: 'Покажи записи Нэне', type: 'deliver', targetId: 'nena', completed: false },
    ],
    reward: {
      friendship: 20,
      items: ['lore_book'],
      event: 'nena_reveals_lore',
      music: 'nostalgic_piano'
    }
  },
  {
    id: 'broken_lantern',
    title: 'Broken Lantern',
    titleRu: 'Сломанный фонарик',
    description: 'Кристина хочет починить старый уличный фонарь, но ей нужны детали.',
    npcId: 'kristina',
    steps: [
      { id: 'talk_kristina', description: 'Поговори с Кристиной', type: 'talk', targetId: 'kristina', completed: false },
      { id: 'find_wire', description: 'Найди провод в сарае', type: 'collect', targetId: 'wire', targetCount: 1, completed: false },
      { id: 'find_bulb', description: 'Найди лампочку в доме', type: 'collect', targetId: 'light_bulb', targetCount: 1, completed: false },
      { id: 'bring_parts', description: 'Принеси Кристине детали', type: 'deliver', targetId: 'kristina', completed: false },
    ],
    reward: {
      friendship: 15,
      items: ['lantern_fixed'],
      event: 'yard_lights_up'
    }
  },
  {
    id: 'treasure_box',
    title: 'Treasure Box',
    titleRu: 'Коробка сокровищ',
    description: 'Даня создаёт особое устройство и ему нужны редкие предметы.',
    npcId: 'danya',
    steps: [
      { id: 'talk_danya', description: 'Поговори с Даней', type: 'talk', targetId: 'danya', completed: false },
      { id: 'find_gear', description: 'Найди шестерёнку', type: 'collect', targetId: 'gear', targetCount: 1, completed: false },
      { id: 'find_crystal', description: 'Найди кристалл в лесу', type: 'collect', targetId: 'crystal', targetCount: 1, completed: false },
      { id: 'return_danya', description: 'Верни предметы Дане', type: 'deliver', targetId: 'danya', completed: false },
    ],
    reward: {
      friendship: 20,
      items: ['music_box'],
      event: 'danya_invention_works'
    }
  },
  {
    id: 'fence_repair',
    title: 'Fence Repair',
    titleRu: 'Ремонт забора',
    description: 'Прохор чинит старый забор вокруг дома и нужна помощь.',
    npcId: 'prokhor',
    steps: [
      { id: 'talk_prokhor', description: 'Поговори с Прохором', type: 'talk', targetId: 'prokhor', completed: false },
      { id: 'find_planks', description: 'Принеси доски (3)', type: 'collect', targetId: 'plank', targetCount: 3, completed: false },
      { id: 'help_build', description: 'Помоги строить забор', type: 'interact', targetId: 'fence_build', targetCount: 1, completed: false },
    ],
    reward: {
      friendship: 15,
      items: ['hammer'],
      event: 'fence_completed'
    }
  },
];

export const ITEMS_DATA: Record<string, { nameRu: string; description: string; icon: string; type: string }> = {
  cassette_old:     { nameRu: 'Старая кассета',        description: 'Кассета с летней записью', icon: '📼', type: 'cassette' },
  cassette_summer:  { nameRu: 'Лето \'98',              description: 'Тёплое лето в записи', icon: '📼', type: 'cassette' },
  cassette_rock:    { nameRu: 'Рок-кассета',            description: 'Игорь в своей стихии', icon: '📼', type: 'cassette' },
  guitar_pick:      { nameRu: 'Медиатор',               description: 'Любимый медиатор Игоря', icon: '🎸', type: 'tool' },
  photo_fireflies:  { nameRu: 'Фото со светлячками',   description: 'Идеальная ночная съёмка', icon: '📸', type: 'photo' },
  sticker:          { nameRu: 'Наклейка',               description: 'Яркая наклейка Лизы', icon: '⭐', type: 'collectible' },
  ribbon_pink:      { nameRu: 'Розовая лента',          description: 'От Лизы с любовью', icon: '🎀', type: 'collectible' },
  moonbell:         { nameRu: 'Колокольчик луны',       description: 'Звенит в полнолуние', icon: '🔔', type: 'key' },
  forest_map:       { nameRu: 'Карта леса',             description: 'Тропы, известные Соне', icon: '🗺️', type: 'collectible' },
  lore_book:        { nameRu: 'Книга истории',          description: 'Записи Нэны о доме', icon: '📖', type: 'collectible' },
  lantern_fixed:    { nameRu: 'Починенный фонарь',      description: 'Теперь освещает двор', icon: '🔦', type: 'tool' },
  music_box:        { nameRu: 'Музыкальная шкатулка',   description: 'Изобретение Дани', icon: '🎵', type: 'collectible' },
  wire:             { nameRu: 'Провод',                 description: 'Нужен для ремонта', icon: '🔌', type: 'tool' },
  light_bulb:       { nameRu: 'Лампочка',               description: 'Для фонаря', icon: '💡', type: 'tool' },
  plank:            { nameRu: 'Доска',                  description: 'Строительный материал', icon: '🪵', type: 'tool' },
  gear:             { nameRu: 'Шестерёнка',             description: 'Механическая деталь', icon: '⚙️', type: 'tool' },
  crystal:          { nameRu: 'Лесной кристалл',        description: 'Светится ночью', icon: '💎', type: 'collectible' },
  old_note:         { nameRu: 'Старая записка',         description: 'Чья-то история', icon: '📝', type: 'collectible' },
  firefly:          { nameRu: 'Светлячок',              description: 'Живой огонёк', icon: '✨', type: 'collectible' },
  hammer:           { nameRu: 'Молоток',                description: 'От Прохора', icon: '🔨', type: 'tool' },
};
