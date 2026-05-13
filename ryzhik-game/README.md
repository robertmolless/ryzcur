# 🐱 Рыжик и Старый Загородный Дом

Атмосферная narrative cozy life-sim игра про доброго рыжего кота по имени Рыжик, который живёт возле старого загородного дома.

## Технологии

- **React** + **TypeScript** + **Vite** — frontend framework
- **Phaser 3** — 2D game engine с Canvas рендерингом
- **Zustand** — state management
- **Tailwind CSS** — UI стилизация
- **Web Audio API** — процедурное аудио
- **GitHub Pages** — деплой

## Запуск

```bash
cd ryzhik-game
npm install
npm run dev
```

Откройте `http://localhost:5173`

## Сборка

```bash
npm run build
```

## Архитектура

```
src/
  game/
    scenes/      — Phaser сцены (GameScene — основная)
    systems/     — Игровые системы (аудио)
    data/        — Данные (NPC, квесты, локации)
    utils/       — Утилиты (цвета, освещение)
  ui/
    components/  — React компоненты UI
  store/         — Zustand хранилище
```

## Возможности

- 5 локаций: Двор, Дом, Лес, Пруд, Теплица
- 10 NPC с уникальными внешностями и диалогами
- 10 квестов с прогрессией
- Цикл дня/ночи с реалистичным освещением
- Система погоды (солнце, дождь, гроза, туман, ветер)
- Процедурные частицы (светлячки, дождь, листья)
- Коллекции (кассеты, фото, дневник, наклейки)
- Система дружбы с NPC
- Процедурное ambient аудио
- Glassmorphism UI
- Mobile-friendly
