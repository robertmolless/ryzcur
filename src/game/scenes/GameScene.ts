import Phaser from 'phaser';
import { SCENE_KEYS, WORLD_WIDTH, WORLD_HEIGHT, PALETTE } from '../constants';
import { Cat } from '../entities/Cat';
import { NPC } from '../entities/NPC';
import { WorldGenerator } from '../world/WorldGenerator';
import { TimeSystem } from '../systems/TimeSystem';
import { WeatherSystem } from '../systems/WeatherSystem';
import { LightingSystem } from '../systems/LightingSystem';
import { audioManager } from '../systems/AudioManager';
import { useGameStore } from '../../store/gameStore';
import { CHARACTERS } from '../data/characters';

export class GameScene extends Phaser.Scene {
  private cat!: Cat;
  private npcs: NPC[] = [];
  private world!: WorldGenerator;
  private timeSystem!: TimeSystem;
  private weatherSystem!: WeatherSystem;
  private lightingSystem!: LightingSystem;

  private qKey!: Phaser.Input.Keyboard.Key;
  private iKey!: Phaser.Input.Keyboard.Key;
  private mKey!: Phaser.Input.Keyboard.Key;

  private ambientTextTimer = 0;
  private ambientInterval = 30000;
  private collectibleZones: Array<{ x: number; y: number; id: string; radius: number; collected: boolean }> = [];

  constructor() { super({ key: SCENE_KEYS.GAME }); }

  create() {
    this.cameras.main.setBackgroundColor(0x4FC3F7);
    this.cameras.main.fadeIn(1000);

    this.world = new WorldGenerator(this);
    this.world.createSparkleParticle();
    this.world.create();

    this.timeSystem = new TimeSystem(this, WORLD_WIDTH, WORLD_HEIGHT);
    this.timeSystem.create();

    this.weatherSystem = new WeatherSystem(this);
    this.weatherSystem.create();

    this.lightingSystem = new LightingSystem(this, WORLD_WIDTH);
    this.lightingSystem.create();

    this.cat = new Cat(this, 700, 710);

    this.npcs = CHARACTERS.map(charData => new NPC(this, charData));

    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.cameras.main.startFollow(this.cat.container, true, 0.1, 0.1);
    this.cameras.main.setZoom(1.2);

    this.setupInput();
    this.setupCollectibles();
    this.createSkyBackground();

    audioManager.resume();
    audioManager.playMusicTrack('morning_acoustic');
    audioManager.playCrickets();

    useGameStore.getState().setPlaying(true);

    this.time.addEvent({
      delay: 30000,
      callback: this.showAmbientText,
      callbackScope: this,
      loop: true
    });

    this.time.addEvent({
      delay: 120000,
      callback: this.randomEvent,
      callbackScope: this,
      loop: true
    });

    this.updateMusicByTime();
  }

  private createSkyBackground() {
    const skyGraphics = this.add.graphics().setDepth(-25).setScrollFactor(0);
    this.updateSkyColors(skyGraphics);
    this.time.addEvent({
      delay: 5000,
      callback: () => this.updateSkyColors(skyGraphics),
      loop: true
    });
  }

  private updateSkyColors(g: Phaser.GameObjects.Graphics) {
    const W = this.cameras.main.width;
    const H = this.cameras.main.height;
    const colors = this.timeSystem.getSkyGradient();
    g.clear();
    g.fillGradientStyle(colors.top, colors.top, colors.bottom, colors.bottom, 1);
    g.fillRect(0, 0, W, H);
  }

  private setupInput() {
    this.qKey = this.input.keyboard!.addKey('Q');
    this.iKey = this.input.keyboard!.addKey('I');
    this.mKey = this.input.keyboard!.addKey('M');

    this.input.keyboard!.on('keydown-Q', () => {
      useGameStore.getState().toggleQuestLog();
    });
    this.input.keyboard!.on('keydown-I', () => {
      useGameStore.getState().toggleInventory();
    });
    this.input.keyboard!.on('keydown-M', () => {
      audioManager.resume();
    });
  }

  private setupCollectibles() {
    const items = [
      { x: 620, y: 710, id: 'sticker', radius: 25 },
      { x: 750, y: 715, id: 'sticker', radius: 25 },
      { x: 880, y: 713, id: 'sticker', radius: 25 },
      { x: 1000, y: 711, id: 'sticker', radius: 25 },
      { x: 1150, y: 715, id: 'sticker', radius: 25 },
      { x: 500, y: 709, id: 'old_note', radius: 30 },
      { x: 680, y: 707, id: 'old_note', radius: 30 },
      { x: 1220, y: 713, id: 'wire', radius: 30 },
      { x: 960, y: 709, id: 'gear', radius: 30 },
      { x: 900, y: 720, id: 'campfire_item', radius: 40 },
    ];

    this.collectibleZones = items.map(item => ({ ...item, collected: false }));
  }

  private checkCollectibles() {
    const store = useGameStore.getState();
    const catX = this.cat.x;
    const catY = this.cat.y;

    this.collectibleZones.forEach(zone => {
      if (zone.collected) return;
      const dist = Phaser.Math.Distance.Between(catX, catY, zone.x, zone.y);
      if (dist < zone.radius) {
        zone.collected = true;
        this.collectItem(zone.id);
      }
    });
  }

  private collectItem(itemId: string) {
    const store = useGameStore.getState();
    const itemsData = {
      sticker: { nameRu: 'Наклейка', description: 'Яркая наклейка Лизы', icon: '⭐', type: 'collectible' as const },
      old_note: { nameRu: 'Старая записка', description: 'Чья-то история', icon: '📝', type: 'collectible' as const },
      wire: { nameRu: 'Провод', description: 'Нужен для ремонта', icon: '🔌', type: 'tool' as const },
      gear: { nameRu: 'Шестерёнка', description: 'Механическая деталь', icon: '⚙️', type: 'tool' as const },
    };

    const data = itemsData[itemId as keyof typeof itemsData];
    if (!data) return;

    const uniqueId = `${itemId}_${Date.now()}`;
    store.addItem({ id: uniqueId, name: itemId, ...data });

    const sparkle = this.add.particles(this.cat.x, this.cat.y - 20, 'sparkle_particle', {
      quantity: 5, speedX: { min: -40, max: 40 }, speedY: { min: -60, max: -20 },
      scale: { start: 0.8, end: 0 }, alpha: { start: 1, end: 0 },
      lifespan: 600, tint: 0xFFD700, blendMode: Phaser.BlendModes.ADD
    }).setDepth(30);
    this.time.delayedCall(700, () => sparkle.destroy());

    this.showFloatingText(this.cat.x, this.cat.y - 40, `+${data.icon} ${data.nameRu}`, '#FFD700');

    this.checkQuestProgress(itemId);
  }

  private checkQuestProgress(itemId: string) {
    const store = useGameStore.getState();
    const questMap: Record<string, { questId: string; stepId: string }> = {
      sticker: { questId: 'lost_stickers', stepId: 'find_stickers' },
      old_note: { questId: 'strange_notes', stepId: 'find_notes' },
      wire: { questId: 'broken_lantern', stepId: 'find_wire' },
      gear: { questId: 'treasure_box', stepId: 'find_gear' },
    };

    const questInfo = questMap[itemId];
    if (questInfo) {
      const quest = store.getQuestStatus(questInfo.questId);
      if (quest.status === 'active') {
        store.advanceQuestStep(questInfo.questId, questInfo.stepId);
      }
    }
  }

  private showFloatingText(x: number, y: number, text: string, color: string = '#FFFFFF') {
    const floatText = this.add.text(x, y, text, {
      fontSize: '12px', color, stroke: '#000', strokeThickness: 2
    }).setOrigin(0.5).setDepth(35);

    this.tweens.add({
      targets: floatText, y: y - 50, alpha: 0,
      duration: 1500, ease: 'Power2',
      onComplete: () => floatText.destroy()
    });
  }

  private showAmbientText() {
    const texts = [
      'Ветер шелестит в листьях...', 'Где-то поёт птица...', 'Запах дождя в воздухе...',
      'Светлячки начинают мерцать...', 'Тихая музыка долетает с крыльца...',
      'Кузнечики поют в траве...', 'Луна отражается в пруду...',
      'Кот мурчит... всё хорошо.', 'Звёзды одна за другой появляются...',
      'Листья мягко падают...', 'Ветер несёт запах сена и травы...'
    ];
    const text = texts[Math.floor(Math.random() * texts.length)];
    useGameStore.getState().setAmbientText(text);

    const cam = this.cameras.main;
    const cx = cam.width / 2;
    const ambText = this.add.text(cx, cam.height - 80, text, {
      fontSize: '11px', color: '#CCCCCC', fontStyle: 'italic',
      stroke: '#000000', strokeThickness: 2
    }).setOrigin(0.5).setScrollFactor(0).setDepth(100).setAlpha(0.85);

    this.tweens.add({
      targets: ambText, alpha: { from: 0, to: 0.85 },
      duration: 1000, ease: 'Power1', onComplete: () => {
        this.tweens.add({
          targets: ambText, alpha: 0,
          duration: 2000, ease: 'Power2', delay: 3000,
          onComplete: () => ambText.destroy()
        });
      }
    });
  }

  private randomEvent() {
    const events = ['weather_change', 'firefly_bloom', 'igor_concert'];
    const event = events[Math.floor(Math.random() * events.length)];

    if (event === 'weather_change') {
      const weathers = ['clear', 'cloudy', 'rain', 'fog'];
      const w = weathers[Math.floor(Math.random() * weathers.length)] as any;
      useGameStore.getState().setWeather(w);
    } else if (event === 'firefly_bloom') {
      this.showFloatingText(this.cat.x, this.cat.y - 60, '✨ Светлячки!', '#CCFF00');
    }
  }

  private updateMusicByTime() {
    this.time.addEvent({
      delay: 10000,
      callback: () => {
        const hours = useGameStore.getState().time / 60;
        const weather = useGameStore.getState().weather;

        let track = 'morning_acoustic';
        if (hours >= 20 || hours < 6) track = 'night_ambient';
        else if (hours >= 17) track = 'nostalgic_piano';
        else if (hours >= 12) track = 'summer_memories';

        if (weather === 'rain' || weather === 'storm') track = 'mystical_night';
        audioManager.playMusicTrack(track);
      },
      loop: true
    });
  }

  update(time: number, delta: number) {
    const npcPositions = this.npcs.map(npc => ({ id: npc.id, x: npc.x, y: npc.y }));
    this.cat.update(delta, npcPositions);
    this.npcs.forEach(npc => npc.update(delta));
    this.timeSystem.update(delta);
    this.weatherSystem.update(delta);
    this.lightingSystem.update(delta);
    this.world.update(delta);
    this.checkCollectibles();
    this.updateCatMoodByContext();
  }

  private updateCatMoodByContext() {
    const hours = useGameStore.getState().time / 60;
    const isNight = hours >= 21 || hours < 5;
    const weather = useGameStore.getState().weather;

    if (this.cat.getState() === 'sleep') {
      useGameStore.getState().setCatMood('sleepy');
    } else if (isNight) {
      useGameStore.getState().setCatMood('curious');
    } else if (weather === 'storm') {
      useGameStore.getState().setCatMood('calm');
    }
  }
}
