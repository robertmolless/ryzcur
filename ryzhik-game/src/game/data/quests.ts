export interface QuestStep {
  id: string;
  description: string;
  hint: string;
  requiredItem?: string;
  requiredLocation?: string;
  requiredAction?: string;
}

export interface Quest {
  id: string;
  name: string;
  description: string;
  npcId: string;
  steps: QuestStep[];
  reward: {
    item?: string;
    unlock?: string;
    friendshipBonus: number;
  };
}

export const QUESTS: Quest[] = [
  {
    id: 'old_cassette',
    name: 'Старая кассета',
    description: 'Лёха потерял любимую кассету где-то в сарае. Найди её!',
    npcId: 'lyoha',
    steps: [
      {
        id: 'talk_lyoha',
        description: 'Поговори с Лёхой',
        hint: 'Лёха обычно сидит во дворе с гитарой',
      },
      {
        id: 'search_shed',
        description: 'Обыщи сарай',
        hint: 'Загляни за старые коробки в сарае',
        requiredLocation: 'yard',
      },
      {
        id: 'find_cassette',
        description: 'Найди кассету',
        hint: 'Она спрятана под досками',
        requiredItem: 'old_cassette',
      },
      {
        id: 'return_cassette',
        description: 'Отнеси кассету Лёхе',
        hint: 'Лёха ждёт тебя',
      },
    ],
    reward: {
      item: 'cassette_summer_evening',
      unlock: 'cassette_player',
      friendshipBonus: 25,
    },
  },
  {
    id: 'lost_pick',
    name: 'Пропавший медиатор',
    description: 'Игорь потерял свой любимый медиатор. Где же он?',
    npcId: 'igor',
    steps: [
      {
        id: 'talk_igor',
        description: 'Поговори с Игорем',
        hint: 'Игорь в гараже или на крыше',
      },
      {
        id: 'search_garage',
        description: 'Обыщи гараж',
        hint: 'Посмотри среди инструментов',
        requiredLocation: 'house',
      },
      {
        id: 'find_pick',
        description: 'Найди медиатор',
        hint: 'Он застрял между досками на крыше',
        requiredItem: 'guitar_pick',
      },
      {
        id: 'return_pick',
        description: 'Верни медиатор Игорю',
        hint: 'Игорь будет в восторге',
      },
    ],
    reward: {
      item: 'rock_vinyl',
      unlock: 'garage_concerts',
      friendshipBonus: 25,
    },
  },
  {
    id: 'firefly_photo',
    name: 'Фото со светлячками',
    description: 'Настя мечтает сделать волшебную ночную фотографию у пруда.',
    npcId: 'nastya',
    steps: [
      {
        id: 'talk_nastya',
        description: 'Поговори с Настей',
        hint: 'Настя часто фотографирует у пруда',
      },
      {
        id: 'wait_night',
        description: 'Дождись ночи',
        hint: 'Светлячки появляются только ночью',
      },
      {
        id: 'catch_fireflies',
        description: 'Поймай светлячков',
        hint: 'Подойди к светлячкам у пруда',
        requiredLocation: 'pond',
        requiredAction: 'catch_firefly',
      },
      {
        id: 'take_photo',
        description: 'Помоги Насте сделать фото',
        hint: 'Встань рядом с Настей у пруда',
      },
    ],
    reward: {
      item: 'firefly_photo',
      unlock: 'photo_album',
      friendshipBonus: 25,
    },
  },
  {
    id: 'lost_stickers',
    name: 'Потерянные наклейки',
    description: 'Лиза потеряла свои наклейки по всему двору!',
    npcId: 'liza',
    steps: [
      {
        id: 'talk_liza',
        description: 'Поговори с Лизой',
        hint: 'Лиза украшает двор',
      },
      {
        id: 'find_stickers',
        description: 'Найди 5 наклеек',
        hint: 'Они разлетелись по двору и дому',
        requiredItem: 'sticker_set',
      },
      {
        id: 'return_stickers',
        description: 'Верни наклейки Лизе',
        hint: 'Лиза будет рада!',
      },
    ],
    reward: {
      item: 'decoration_set',
      unlock: 'yard_decorations',
      friendshipBonus: 25,
    },
  },
  {
    id: 'moon_bell',
    name: 'Колокольчик луны',
    description: 'Маг рассказал о легендарном колокольчике, спрятанном в лесу.',
    npcId: 'mag',
    steps: [
      {
        id: 'talk_mag',
        description: 'Поговори с Магом ночью',
        hint: 'Маг появляется только ночью',
      },
      {
        id: 'go_forest_night',
        description: 'Иди в лес ночью',
        hint: 'Следуй за звуком колокольчика',
        requiredLocation: 'forest',
      },
      {
        id: 'find_bell',
        description: 'Найди колокольчик луны',
        hint: 'Он спрятан у старого колодца',
        requiredItem: 'moon_bell',
      },
      {
        id: 'return_bell',
        description: 'Покажи колокольчик Магу',
        hint: 'Маг знает, что делать дальше',
      },
    ],
    reward: {
      item: 'greenhouse_key',
      unlock: 'greenhouse',
      friendshipBonus: 30,
    },
  },
  {
    id: 'forest_path',
    name: 'Лесная тропа',
    description: 'Соня нашла заброшенную тропу. Куда она ведёт?',
    npcId: 'sonya',
    steps: [
      {
        id: 'talk_sonya',
        description: 'Поговори с Соней',
        hint: 'Соня гуляет в лесу',
      },
      {
        id: 'clear_path',
        description: 'Расчисти тропу',
        hint: 'Убери ветки и камни с пути',
        requiredLocation: 'forest',
      },
      {
        id: 'discover_treehouse',
        description: 'Найди домик на дереве',
        hint: 'Тропа ведёт к большому дубу',
      },
    ],
    reward: {
      item: 'forest_map',
      unlock: 'treehouse',
      friendshipBonus: 25,
    },
  },
  {
    id: 'strange_notes',
    name: 'Странные записи',
    description: 'Нэна нашла загадочный дневник в подвале.',
    npcId: 'nena',
    steps: [
      {
        id: 'talk_nena',
        description: 'Поговори с Нэной',
        hint: 'Нэна в доме, изучает что-то',
      },
      {
        id: 'find_pages',
        description: 'Найди пропавшие страницы',
        hint: 'Они разбросаны по дому и двору',
        requiredItem: 'diary_pages',
      },
      {
        id: 'read_diary',
        description: 'Прочитай полный дневник',
        hint: 'Отнеси все страницы Нэне',
      },
    ],
    reward: {
      item: 'old_diary',
      unlock: 'house_lore',
      friendshipBonus: 25,
    },
  },
  {
    id: 'broken_lantern',
    name: 'Сломанный фонарик',
    description: 'Кристина хочет починить старый фонарик у входа.',
    npcId: 'kristina',
    steps: [
      {
        id: 'talk_kristina',
        description: 'Поговори с Кристиной',
        hint: 'Кристина во дворе',
      },
      {
        id: 'find_parts',
        description: 'Найди запчасти',
        hint: 'Загляни в гараж и сарай',
        requiredItem: 'lantern_parts',
      },
      {
        id: 'fix_lantern',
        description: 'Помоги починить фонарик',
        hint: 'Отнеси детали Кристине',
      },
    ],
    reward: {
      item: 'restored_lantern',
      unlock: 'yard_lighting',
      friendshipBonus: 25,
    },
  },
  {
    id: 'treasure_box',
    name: 'Коробка сокровищ',
    description: 'Даня создаёт капсулу времени для всей компании.',
    npcId: 'danya',
    steps: [
      {
        id: 'talk_danya',
        description: 'Поговори с Даней',
        hint: 'Даня мастерит что-то в доме',
      },
      {
        id: 'collect_treasures',
        description: 'Собери особенные предметы',
        hint: 'Найди что-нибудь от каждого друга',
        requiredItem: 'treasures',
      },
      {
        id: 'complete_box',
        description: 'Помоги собрать коробку',
        hint: 'Отнеси всё Дане',
      },
    ],
    reward: {
      item: 'time_capsule',
      unlock: 'secret_room',
      friendshipBonus: 30,
    },
  },
  {
    id: 'fix_fence',
    name: 'Починить забор',
    description: 'Прохор хочет починить забор вокруг двора.',
    npcId: 'prohor',
    steps: [
      {
        id: 'talk_prohor',
        description: 'Поговори с Прохором',
        hint: 'Прохор работает во дворе',
      },
      {
        id: 'find_planks',
        description: 'Найди доски в сарае',
        hint: 'Доски лежат в дальнем углу сарая',
        requiredItem: 'planks',
      },
      {
        id: 'help_build',
        description: 'Помоги Прохору',
        hint: 'Поднеси доски к забору',
      },
    ],
    reward: {
      item: 'strong_fence',
      unlock: 'yard_expansion',
      friendshipBonus: 25,
    },
  },
];
