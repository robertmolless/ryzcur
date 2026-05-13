import type { DialogueTree } from '../types';

export const DIALOGUE: Record<string, DialogueTree[]> = {
  lyokha: [
    {
      id: 'lyokha_intro',
      lines: [
        { speaker: 'Лёха', text: 'О, привет, Рыжик. Рад тебя видеть... хотя сегодня не очень хорошее настроение.', emotion: 'sad' },
        { speaker: 'Лёха', text: 'Я потерял кассету. Ту самую, старую. С летними записями.', emotion: 'worried' },
        { speaker: 'Лёха', text: 'Кажется, оставил её в сарае, когда разбирал коробки. Ты поможешь найти?', emotion: 'hopeful' },
      ],
      choices: [
        { text: 'Мяу! (Конечно помогу)', nextId: 'lyokha_quest_accept', effect: { questProgress: 'old_cassette' } },
        { text: 'Мурр... (Попозже)', nextId: 'lyokha_wait' }
      ]
    },
    {
      id: 'lyokha_quest_accept',
      lines: [
        { speaker: 'Лёха', text: 'Ты лучший, Рыжик. Правда.', emotion: 'grateful' },
        { speaker: 'Лёха', text: 'Сарай вон там, за гаражом. Осторожно только — там много коробок.', emotion: 'calm' },
      ]
    },
    {
      id: 'lyokha_wait',
      lines: [
        { speaker: 'Лёха', text: 'Ничего, ничего. Зайди потом, если захочешь.', emotion: 'calm' },
      ]
    },
    {
      id: 'lyokha_found',
      lines: [
        { speaker: 'Лёха', text: 'Нашёл! Рыжик, ты невероятный.', emotion: 'happy' },
        { speaker: 'Лёха', text: 'Знаешь, эту кассету записали здесь, в этом доме, много лет назад.', emotion: 'nostalgic' },
        { speaker: 'Лёха', text: 'Давай послушаем вместе?', emotion: 'warm' },
      ]
    },
    {
      id: 'lyokha_daily',
      lines: [
        { speaker: 'Лёха', text: 'Хорошее утро, Рыжик. Тихое.', emotion: 'calm' },
      ]
    },
  ],
  igor: [
    {
      id: 'igor_intro',
      lines: [
        { speaker: 'Игорь', text: 'А, кот! Слушай, у меня проблема.', emotion: 'frustrated' },
        { speaker: 'Игорь', text: 'Репетиция через час, а медиатор куда-то пропал. Любимый!', emotion: 'anxious' },
        { speaker: 'Игорь', text: 'Красный такой, с черепом. Не видел нигде?', emotion: 'hopeful' },
      ],
      choices: [
        { text: '*Принюхаться к гаражу*', nextId: 'igor_quest_accept', effect: { questProgress: 'lost_pick' } },
        { text: '*Зевнуть*', nextId: 'igor_wait' }
      ]
    },
    {
      id: 'igor_quest_accept',
      lines: [
        { speaker: 'Игорь', text: 'Ты чуешь? Серьёзно?! Коты — лучшие существа на свете.', emotion: 'excited' },
      ]
    },
    {
      id: 'igor_wait',
      lines: [
        { speaker: 'Игорь', text: 'Ладно, буду искать сам...', emotion: 'resigned' },
      ]
    },
    {
      id: 'igor_found',
      lines: [
        { speaker: 'Игорь', text: 'ДА! Нашёл! Рыжик, ты — легенда!', emotion: 'elated' },
        { speaker: 'Игорь', text: 'Слушай, после репетиции сыграю тебе специально. Только для тебя.', emotion: 'warm' },
      ]
    },
    {
      id: 'igor_concert',
      lines: [
        { speaker: 'Игорь', text: 'Это посвящается самому крутому коту в мире.', emotion: 'sincere' },
      ]
    },
  ],
  nastya: [
    {
      id: 'nastya_intro',
      lines: [
        { speaker: 'Настя', text: 'Привет, Рыжик! Смотри, какой закат сегодня...', emotion: 'dreamy' },
        { speaker: 'Настя', text: 'Я хочу сделать фото со светлячками у пруда, но одной страшно идти ночью в лес.', emotion: 'shy' },
        { speaker: 'Настя', text: 'Может, составишь компанию? Ты же кот, ты не боишься темноты.', emotion: 'hopeful' },
      ],
      choices: [
        { text: '*Мяукнуть согласно*', nextId: 'nastya_quest_accept', effect: { questProgress: 'firefly_photo' } },
        { text: '*Потереться об ноги*', nextId: 'nastya_comfort' }
      ]
    },
    {
      id: 'nastya_quest_accept',
      lines: [
        { speaker: 'Настя', text: 'Ура! Встретимся у пруда после заката, хорошо?', emotion: 'happy' },
        { speaker: 'Настя', text: 'И попробуй поймать несколько светлячков — создадим идеальную атмосферу!', emotion: 'excited' },
      ]
    },
    {
      id: 'nastya_comfort',
      lines: [
        { speaker: 'Настя', text: 'Такой мягкий... Ладно, наберусь храбрости.', emotion: 'warm' },
      ]
    },
  ],
  liza: [
    {
      id: 'liza_intro',
      lines: [
        { speaker: 'Лиза', text: 'РЫЖИК! Рыжик-рыжик-рыжик! Тут катастрофа!', emotion: 'dramatic' },
        { speaker: 'Лиза', text: 'Ветер унёс мои наклейки! Они по всему двору разлетелись!', emotion: 'upset' },
        { speaker: 'Лиза', text: 'Ты же маленький и быстрый — помоги найти! Пожалуйста-пожалуйста!', emotion: 'pleading' },
      ],
      choices: [
        { text: '*Навострить уши и побежать*', nextId: 'liza_quest_accept', effect: { questProgress: 'lost_stickers' } },
        { text: '*Сесть и потянуться*', nextId: 'liza_wait' }
      ]
    },
    {
      id: 'liza_quest_accept',
      lines: [
        { speaker: 'Лиза', text: 'ТЫ ЛУЧШИЙ! Я потом тебе бант сделаю, хочешь?', emotion: 'ecstatic' },
      ]
    },
    {
      id: 'liza_wait',
      lines: [
        { speaker: 'Лиза', text: 'Ладно-ладно, ты кот, тебе можно.', emotion: 'amused' },
      ]
    },
  ],
  mag: [
    {
      id: 'mag_intro',
      lines: [
        { speaker: 'Маг', text: '...', emotion: 'mysterious' },
        { speaker: 'Маг', text: 'Кот видит то, что скрыто от людей.', emotion: 'cryptic' },
        { speaker: 'Маг', text: 'В этом лесу есть старый колокольчик. Он звенит только в полнолуние.', emotion: 'serious' },
        { speaker: 'Маг', text: 'Принеси его сюда. Это важно.', emotion: 'urgent' },
      ],
      choices: [
        { text: '*Насторожиться и кивнуть*', nextId: 'mag_quest_accept', effect: { questProgress: 'moon_bell' } },
        { text: '*Недоверчиво прищуриться*', nextId: 'mag_suspicious' }
      ]
    },
    {
      id: 'mag_quest_accept',
      lines: [
        { speaker: 'Маг', text: 'Хорошо. Иди в лес после полуночи. Следуй за звуком.', emotion: 'nod' },
      ]
    },
    {
      id: 'mag_suspicious',
      lines: [
        { speaker: 'Маг', text: 'Умный кот. Хорошо — тогда просто посмотри на теплицу. Скоро поймёшь.', emotion: 'knowing' },
      ]
    },
    {
      id: 'mag_night_only',
      lines: [
        { speaker: 'Маг', text: 'Я появляюсь только ночью. Приходи после заката.', emotion: 'distant' },
      ]
    },
  ],
  sonya: [
    {
      id: 'sonya_intro',
      lines: [
        { speaker: 'Соня', text: 'Привет, рыжий. Красивое место, правда?', emotion: 'peaceful' },
        { speaker: 'Соня', text: 'Я здесь часто бываю. Лес вокруг старый, в нём много скрытых мест.', emotion: 'thoughtful' },
        { speaker: 'Соня', text: 'Если хочешь — могу показать тебе тайные тропы. Только нужно следовать за мной.', emotion: 'inviting' },
      ],
      choices: [
        { text: '*Радостно запрыгать*', nextId: 'sonya_quest_accept', effect: { questProgress: 'forest_path' } },
        { text: '*Уютно свернуться рядом*', nextId: 'sonya_relax' }
      ]
    },
    {
      id: 'sonya_quest_accept',
      lines: [
        { speaker: 'Соня', text: 'Тогда пойдём. Я покажу тебе заброшенный колодец и домик на дереве.', emotion: 'calm' },
      ]
    },
    {
      id: 'sonya_relax',
      lines: [
        { speaker: 'Соня', text: 'Хорошая идея. Просто посидим тут немного.', emotion: 'peaceful' },
      ]
    },
  ],
  nena: [
    {
      id: 'nena_intro',
      lines: [
        { speaker: 'Нэна', text: 'О! Рыжик, именно ты мне и нужен.', emotion: 'excited' },
        { speaker: 'Нэна', text: 'Я нашла несколько странных записок по всему дому.', emotion: 'curious' },
        { speaker: 'Нэна', text: 'Они написаны разными людьми, но все об одном месте. Об этом доме.', emotion: 'intrigued' },
        { speaker: 'Нэна', text: 'Раньше здесь жили музыканты! Помоги мне найти все записки.', emotion: 'eager' },
      ],
      choices: [
        { text: '*Принюхаться к запаху старой бумаги*', nextId: 'nena_quest_accept', effect: { questProgress: 'strange_notes' } },
        { text: '*Потрогать лапой блокнот*', nextId: 'nena_curious' }
      ]
    },
    {
      id: 'nena_quest_accept',
      lines: [
        { speaker: 'Нэна', text: 'Отлично! Первые я нашла на кухне и в гостиной. Одна должна быть на чердаке.', emotion: 'determined' },
      ]
    },
    {
      id: 'nena_curious',
      lines: [
        { speaker: 'Нэна', text: 'Нет-нет, это блокнот исследователя! *прячет*', emotion: 'amused' },
      ]
    },
  ],
  kristina: [
    {
      id: 'kristina_intro',
      lines: [
        { speaker: 'Кристина', text: 'Рыжик.', emotion: 'direct' },
        { speaker: 'Кристина', text: 'Фонарь. Сломан. Нужен провод и лампочка.', emotion: 'matter_of_fact' },
        { speaker: 'Кристина', text: 'Провод в сарае видела. Лампочка где-то в доме.', emotion: 'focused' },
        { speaker: 'Кристина', text: 'Поможешь?', emotion: 'asks' },
      ],
      choices: [
        { text: '*Кивнуть и побежать в сарай*', nextId: 'kristina_quest_accept', effect: { questProgress: 'broken_lantern' } },
        { text: '*Ласково мяукнуть*', nextId: 'kristina_soft' }
      ]
    },
    {
      id: 'kristina_quest_accept',
      lines: [
        { speaker: 'Кристина', text: 'Хорошо. Спасибо.', emotion: 'brief_smile' },
      ]
    },
    {
      id: 'kristina_soft',
      lines: [
        { speaker: 'Кристина', text: '...симпатичный ты всё-таки.', emotion: 'softens' },
      ]
    },
    {
      id: 'kristina_done',
      lines: [
        { speaker: 'Кристина', text: 'Починила. Теперь двор будет освещён.', emotion: 'satisfied' },
        { speaker: 'Кристина', text: 'Спасибо, Рыжик. Ты хороший.', emotion: 'warm' },
      ]
    },
  ],
  danya: [
    {
      id: 'danya_intro',
      lines: [
        { speaker: 'Даня', text: 'О! Рыжик! Смотри что я делаю!', emotion: 'excited' },
        { speaker: 'Даня', text: 'Это музыкальная шкатулка, которая играет мелодию по звёздам!', emotion: 'enthusiastic' },
        { speaker: 'Даня', text: 'Но мне нужна особая шестерёнка и кристалл из леса.', emotion: 'thinking' },
        { speaker: 'Даня', text: 'Кот же умеет искать вещи, да?', emotion: 'hopeful' },
      ],
      choices: [
        { text: '*Заинтересованно потрогать устройство*', nextId: 'danya_quest_accept', effect: { questProgress: 'treasure_box' } },
        { text: '*Сесть рядом и смотреть*', nextId: 'danya_company' }
      ]
    },
    {
      id: 'danya_quest_accept',
      lines: [
        { speaker: 'Даня', text: 'ОТЛИЧНО! Шестерёнка должна быть в сарае. Кристалл — в лесу, он светится голубым!', emotion: 'beaming' },
      ]
    },
    {
      id: 'danya_company',
      lines: [
        { speaker: 'Даня', text: 'Понял, просто посидишь. Тоже хорошо, веселее работать.', emotion: 'content' },
      ]
    },
  ],
  prokhor: [
    {
      id: 'prokhor_intro',
      lines: [
        { speaker: 'Прохор', text: 'Рыжик. Помощь нужна.', emotion: 'gruff' },
        { speaker: 'Прохор', text: 'Забор старый, сгнил. Чиню. Нужны доски из сарая.', emotion: 'direct' },
        { speaker: 'Прохор', text: 'Три доски. Принесёшь?', emotion: 'hopeful' },
      ],
      choices: [
        { text: '*Деловито побежать к сараю*', nextId: 'prokhor_quest_accept', effect: { questProgress: 'fence_repair' } },
        { text: '*Потереться о большую ногу*', nextId: 'prokhor_friendly' }
      ]
    },
    {
      id: 'prokhor_quest_accept',
      lines: [
        { speaker: 'Прохор', text: 'Хорошо. Там, за кустами сарай.', emotion: 'nod' },
      ]
    },
    {
      id: 'prokhor_friendly',
      lines: [
        { speaker: 'Прохор', text: '*тихонько улыбается* ...Помогай давай.', emotion: 'amused' },
      ]
    },
    {
      id: 'prokhor_done',
      lines: [
        { speaker: 'Прохор', text: 'Готово. Крепко.', emotion: 'satisfied' },
        { speaker: 'Прохор', text: 'Спасибо, котяра.', emotion: 'warm' },
      ]
    },
  ],
};

export const AMBIENT_TEXTS: string[] = [
  'Ветер шелестит в листьях...',
  'Где-то вдалеке поёт птица...',
  'Запах дождя в воздухе...',
  'Закат окрашивает всё в золотой...',
  'Светлячки начинают появляться...',
  'Тихая музыка долетает с крыльца...',
  'Кузнечики поют в траве...',
  'Листья мягко падают...',
  'Луна отражается в пруду...',
  'Звёзды одна за другой появляются на небе...',
  'Кот мурчит... всё хорошо.',
];
