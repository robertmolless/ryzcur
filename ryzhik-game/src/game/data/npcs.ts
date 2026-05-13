export interface NPCData {
  id: string;
  name: string;
  nameRu: string;
  appearance: {
    hairColor: string;
    skinTone: string;
    outfitColor: string;
    accentColor: string;
    hasGlasses?: boolean;
    hasTattoos?: boolean;
  };
  personality: string;
  greeting: string;
  dialogues: Record<number, string[]>;
  questId: string;
  questName: string;
  favoriteItems: string[];
  defaultLocation: string;
  schedule: Record<string, { x: number; y: number; action: string }>;
}

export const NPC_DATA: NPCData[] = [
  {
    id: 'lyoha',
    name: 'Lyoha',
    nameRu: 'Лёха',
    appearance: {
      hairColor: '#e8c547',
      skinTone: '#f5d0a9',
      outfitColor: '#6b8e7b',
      accentColor: '#a8c99a',
    },
    personality: 'calm',
    greeting: 'Привет, Рыжик... Хочешь послушать что-нибудь?',
    dialogues: {
      0: [
        'Этот дом... он помнит столько историй.',
        'Я раньше часто приходил сюда с гитарой.',
        'Где-то в сарае должна быть старая кассета...',
      ],
      1: [
        'Ты нашёл кассету! Давай послушаем вместе.',
        'Эта мелодия... я давно её не слышал.',
        'Спасибо, Рыжик. Это важно для меня.',
      ],
      2: [
        'Знаешь, музыка — это как воспоминания. Она никуда не уходит.',
        'Хочешь, я сыграю что-нибудь на гитаре?',
      ],
    },
    questId: 'old_cassette',
    questName: 'Старая кассета',
    favoriteItems: ['cassette', 'guitar_pick'],
    defaultLocation: 'yard',
    schedule: {
      morning: { x: 350, y: 400, action: 'sitting' },
      day: { x: 500, y: 350, action: 'playing_guitar' },
      evening: { x: 300, y: 420, action: 'by_fire' },
      night: { x: 400, y: 300, action: 'sleeping' },
    },
  },
  {
    id: 'igor',
    name: 'Igor',
    nameRu: 'Игорь',
    appearance: {
      hairColor: '#2a2a2a',
      skinTone: '#e8c4a0',
      outfitColor: '#1a1a1a',
      accentColor: '#c0392b',
    },
    personality: 'energetic',
    greeting: 'Йо! Рыжик! Ты готов к рок-н-роллу?',
    dialogues: {
      0: [
        'Чувак, я потерял свой медиатор!',
        'Без него я не могу играть свой лучший рифф.',
        'Кажется, он где-то в гараже... или на крыше?',
      ],
      1: [
        'ТЫ НАШЁЛ ЕГО! Легенда!',
        'Сейчас устроим мини-концерт!',
        'Рок-н-ролл жив, детка!',
      ],
      2: [
        'Хочешь послушать новый рифф?',
        'Я работаю над песней для всех нас.',
      ],
    },
    questId: 'lost_pick',
    questName: 'Пропавший медиатор',
    favoriteItems: ['guitar_pick', 'vinyl'],
    defaultLocation: 'house',
    schedule: {
      morning: { x: 600, y: 380, action: 'sleeping' },
      day: { x: 700, y: 400, action: 'practicing' },
      evening: { x: 350, y: 420, action: 'concert' },
      night: { x: 500, y: 350, action: 'stargazing' },
    },
  },
  {
    id: 'nastya',
    name: 'Nastya',
    nameRu: 'Настя',
    appearance: {
      hairColor: '#8b6914',
      skinTone: '#f0d5b8',
      outfitColor: '#d4a574',
      accentColor: '#5a8f5a',
    },
    personality: 'gentle',
    greeting: 'Рыжик! Стой так... идеальный кадр!',
    dialogues: {
      0: [
        'Я хочу сделать особенную фотографию...',
        'Ночью, у пруда, когда летают светлячки.',
        'Поможешь мне поймать нужный момент?',
      ],
      1: [
        'Посмотри какая красота получилась!',
        'Это фото — как маленькое волшебство.',
        'Я добавлю его в наш альбом воспоминаний.',
      ],
      2: [
        'Каждый момент здесь стоит того, чтобы его запомнить.',
        'Хочешь посмотреть фотоальбом?',
      ],
    },
    questId: 'firefly_photo',
    questName: 'Фото со светлячками',
    favoriteItems: ['photo', 'firefly_jar'],
    defaultLocation: 'pond',
    schedule: {
      morning: { x: 200, y: 380, action: 'photographing' },
      day: { x: 450, y: 300, action: 'walking' },
      evening: { x: 300, y: 400, action: 'sunset_photos' },
      night: { x: 350, y: 450, action: 'night_photos' },
    },
  },
  {
    id: 'liza',
    name: 'Liza',
    nameRu: 'Лиза',
    appearance: {
      hairColor: '#ff69b4',
      skinTone: '#f5d0b0',
      outfitColor: '#ff91af',
      accentColor: '#ffd700',
    },
    personality: 'chaotic',
    greeting: 'РЫЖИК! У меня идея! Давай украсим ВСЁ!',
    dialogues: {
      0: [
        'О нет, мои наклейки! Они разлетелись по всему двору!',
        'Там были звёздочки, сердечки, котики...',
        'Помоги мне их собрать, пожалуйста!',
      ],
      1: [
        'Ура! Все наклейки на месте!',
        'Теперь давай украсим что-нибудь!',
        'Этот дом будет самым красивым!',
      ],
      2: [
        'Знаешь что нам нужно? ГИРЛЯНДЫ!',
        'И ещё больше цветов! И шариков!',
      ],
    },
    questId: 'lost_stickers',
    questName: 'Потерянные наклейки',
    favoriteItems: ['sticker', 'garland', 'flower'],
    defaultLocation: 'yard',
    schedule: {
      morning: { x: 450, y: 350, action: 'decorating' },
      day: { x: 350, y: 300, action: 'crafting' },
      evening: { x: 400, y: 420, action: 'party_prep' },
      night: { x: 300, y: 380, action: 'dancing' },
    },
  },
  {
    id: 'mag',
    name: 'Mag',
    nameRu: 'Маг',
    appearance: {
      hairColor: '#4a3a6a',
      skinTone: '#e0c8b0',
      outfitColor: '#2d1b4e',
      accentColor: '#9b59b6',
    },
    personality: 'mysterious',
    greeting: '...Ты чувствуешь это? Ночь что-то шепчет...',
    dialogues: {
      0: [
        'Есть старая легенда о колокольчике луны...',
        'Говорят, его звон можно услышать в полнолуние.',
        'Он спрятан где-то в глубине леса...',
      ],
      1: [
        'Ты нашёл его... Колокольчик луны.',
        'Теперь теплица откроет свои секреты.',
        'Магия этого места пробуждается.',
      ],
      2: [
        'Растения в теплице... они особенные.',
        'Они помнят тех, кто жил здесь раньше.',
      ],
    },
    questId: 'moon_bell',
    questName: 'Колокольчик луны',
    favoriteItems: ['moon_bell', 'mystic_herb'],
    defaultLocation: 'forest',
    schedule: {
      morning: { x: 600, y: 300, action: 'meditating' },
      day: { x: 500, y: 350, action: 'absent' },
      evening: { x: 400, y: 400, action: 'appearing' },
      night: { x: 300, y: 350, action: 'ritual' },
    },
  },
  {
    id: 'sonya',
    name: 'Sonya',
    nameRu: 'Соня',
    appearance: {
      hairColor: '#6b4423',
      skinTone: '#e8c4a0',
      outfitColor: '#556b2f',
      accentColor: '#8fbc8f',
    },
    personality: 'adventurous',
    greeting: 'Рыжик! Я нашла новую тропинку в лесу!',
    dialogues: {
      0: [
        'В лесу есть тропа, которую давно никто не ходил.',
        'Она ведёт к чему-то интересному, я уверена.',
        'Но мне нужна помощь, чтобы расчистить путь.',
      ],
      1: [
        'Мы сделали это! Смотри, какое место!',
        'Домик на дереве... Он всё ещё стоит.',
        'Теперь у нас есть секретное место.',
      ],
      2: [
        'Мир полон чудес, если знать, куда смотреть.',
        'Пойдём гулять?',
      ],
    },
    questId: 'forest_path',
    questName: 'Лесная тропа',
    favoriteItems: ['mushroom', 'map', 'compass'],
    defaultLocation: 'forest',
    schedule: {
      morning: { x: 200, y: 350, action: 'exploring' },
      day: { x: 400, y: 300, action: 'hiking' },
      evening: { x: 350, y: 400, action: 'by_fire' },
      night: { x: 450, y: 380, action: 'storytelling' },
    },
  },
  {
    id: 'nena',
    name: 'Nena',
    nameRu: 'Нэна',
    appearance: {
      hairColor: '#2c3e50',
      skinTone: '#f0d5b8',
      outfitColor: '#34495e',
      accentColor: '#e67e22',
      hasGlasses: true,
    },
    personality: 'observant',
    greeting: 'Рыжик, подойди... Я кое-что записала.',
    dialogues: {
      0: [
        'Я нашла странные записи в подвале дома.',
        'Кто-то вёл дневник... много лет назад.',
        'Но некоторые страницы пропали. Поможешь найти?',
      ],
      1: [
        'Все страницы на месте...',
        'Это дневник музыканта. Он жил здесь давно.',
        'Теперь я понимаю историю этого дома.',
      ],
      2: [
        'Каждый дом хранит истории тех, кто в нём жил.',
        'Хочешь послушать, что я узнала?',
      ],
    },
    questId: 'strange_notes',
    questName: 'Странные записи',
    favoriteItems: ['diary_page', 'pen', 'book'],
    defaultLocation: 'house',
    schedule: {
      morning: { x: 500, y: 350, action: 'reading' },
      day: { x: 400, y: 300, action: 'investigating' },
      evening: { x: 350, y: 380, action: 'writing' },
      night: { x: 450, y: 400, action: 'researching' },
    },
  },
  {
    id: 'kristina',
    name: 'Kristina',
    nameRu: 'Кристина',
    appearance: {
      hairColor: '#1a1a1a',
      skinTone: '#e0c0a0',
      outfitColor: '#2c2c2c',
      accentColor: '#8e44ad',
      hasTattoos: true,
    },
    personality: 'practical',
    greeting: 'Эй, Рыжик. Видишь этот фонарик? Он сломан.',
    dialogues: {
      0: [
        'Этот старый фонарик... он красивый, но не работает.',
        'Мне нужны детали, чтобы его починить.',
        'Посмотри в гараже и в сарае.',
      ],
      1: [
        'Готово! Смотри, как он светит!',
        'Теперь повесим его у входа.',
        'Этот дом заслуживает красивого света.',
      ],
      2: [
        'Всё можно починить, если постараться.',
        'Что ещё тут нужно отремонтировать?',
      ],
    },
    questId: 'broken_lantern',
    questName: 'Сломанный фонарик',
    favoriteItems: ['wrench', 'bulb', 'wire'],
    defaultLocation: 'yard',
    schedule: {
      morning: { x: 600, y: 380, action: 'fixing' },
      day: { x: 500, y: 350, action: 'building' },
      evening: { x: 350, y: 400, action: 'resting' },
      night: { x: 400, y: 420, action: 'by_fire' },
    },
  },
  {
    id: 'danya',
    name: 'Danya',
    nameRu: 'Даня',
    appearance: {
      hairColor: '#8b4513',
      skinTone: '#f0d5b8',
      outfitColor: '#2980b9',
      accentColor: '#e74c3c',
      hasGlasses: true,
    },
    personality: 'inventive',
    greeting: 'Рыжик! Смотри, что я собрал!',
    dialogues: {
      0: [
        'Я делаю коробку сокровищ для всех нас.',
        'Но мне нужны особенные вещи для неё.',
        'Найди что-нибудь интересное вокруг дома!',
      ],
      1: [
        'Идеально! Коробка сокровищ готова!',
        'Теперь каждый может положить сюда что-то важное.',
        'Это будет наша капсула времени.',
      ],
      2: [
        'Знаешь, лучшие изобретения — из того, что под рукой.',
        'Хочешь помочь мне с новым проектом?',
      ],
    },
    questId: 'treasure_box',
    questName: 'Коробка сокровищ',
    favoriteItems: ['gear', 'crystal', 'toy'],
    defaultLocation: 'house',
    schedule: {
      morning: { x: 450, y: 300, action: 'tinkering' },
      day: { x: 550, y: 350, action: 'building' },
      evening: { x: 400, y: 400, action: 'showing_off' },
      night: { x: 350, y: 380, action: 'planning' },
    },
  },
  {
    id: 'prohor',
    name: 'Prohor',
    nameRu: 'Прохор',
    appearance: {
      hairColor: '#3a2a1a',
      skinTone: '#d4a574',
      outfitColor: '#5a4a3a',
      accentColor: '#8b7355',
      hasTattoos: true,
    },
    personality: 'strong',
    greeting: 'Рыжик. *кивает* Забор не починится сам.',
    dialogues: {
      0: [
        'Двор нужно привести в порядок.',
        'Забор сломан, скамейка шатается...',
        'Принеси мне доски из сарая.',
      ],
      1: [
        'Хорошая работа. Забор как новый.',
        'Теперь двор выглядит достойно.',
        '*одобрительно кивает*',
      ],
      2: [
        'Тяжёлая работа — честная работа.',
        'Что ещё нужно построить?',
      ],
    },
    questId: 'fix_fence',
    questName: 'Починить забор',
    favoriteItems: ['plank', 'hammer', 'nail'],
    defaultLocation: 'yard',
    schedule: {
      morning: { x: 650, y: 400, action: 'working' },
      day: { x: 500, y: 380, action: 'building' },
      evening: { x: 350, y: 420, action: 'resting' },
      night: { x: 400, y: 350, action: 'sleeping' },
    },
  },
];

export const getTimeOfDay = (hour: number): string => {
  if (hour >= 5 && hour < 10) return 'morning';
  if (hour >= 10 && hour < 17) return 'day';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
};
