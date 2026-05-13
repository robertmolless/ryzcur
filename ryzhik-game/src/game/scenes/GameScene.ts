import Phaser from 'phaser';
import { useGameStore } from '../../store/gameStore';
import type { TimeOfDay, Weather } from '../../store/gameStore';
import { NPC_DATA } from '../data/npcs';
import type { NPCData } from '../data/npcs';
import { LOCATIONS } from '../data/locations';
import { getSkyColors, lerpColor } from '../utils/colors';
import type { SkyColors } from '../utils/colors';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: number;
  alpha: number;
  type: string;
}

interface NPCSprite {
  data: NPCData;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  facing: 'left' | 'right';
  animFrame: number;
  isMoving: boolean;
  bobOffset: number;
  action: string;
}

export class GameScene extends Phaser.Scene {
  private worldWidth = 1200;
  private worldHeight = 700;
  private catX = 400;
  private catY = 450;
  private catTargetX = 400;
  private catTargetY = 450;
  private catFacing: 'left' | 'right' = 'right';
  private catAnimFrame = 0;
  private catAnimTimer = 0;
  private catIsMoving = false;
  private catState: 'idle' | 'walking' | 'sleeping' | 'playing' | 'purring' = 'idle';
  private catIdleTimer = 0;
  private catBobOffset = 0;
  private catTailAngle = 0;

  private npcSprites: NPCSprite[] = [];
  private particles: Particle[] = [];
  private stars: { x: number; y: number; size: number; twinkle: number; speed: number }[] = [];
  private clouds: { x: number; y: number; width: number; height: number; speed: number; alpha: number }[] = [];
  private grassBlades: { x: number; y: number; height: number; angle: number; speed: number }[] = [];

  private timeAccum = 0;
  private weatherTimer = 0;
  private windStrength = 0;
  private windTarget = 0;
  private globalTime = 0;

  private mainGfx!: Phaser.GameObjects.Graphics;
  private bgGfx!: Phaser.GameObjects.Graphics;
  private fgGfx!: Phaser.GameObjects.Graphics;
  private uiGfx!: Phaser.GameObjects.Graphics;
  private lightGfx!: Phaser.GameObjects.Graphics;

  private cameraX = 0;
  private cameraY = 0;

  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    this.bgGfx = this.add.graphics();
    this.mainGfx = this.add.graphics();
    this.fgGfx = this.add.graphics();
    this.lightGfx = this.add.graphics();
    this.uiGfx = this.add.graphics();

    this.initStars();
    this.initClouds();
    this.initGrass();
    this.initNPCs();

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.handleClick(pointer.x + this.cameraX, pointer.y + this.cameraY);
    });

    const store = useGameStore.getState();
    this.catX = 400;
    this.catY = 450;
    this.catTargetX = this.catX;
    this.catTargetY = this.catY;

    if (store.currentLocation === 'yard') {
      this.catX = 400;
      this.catY = 450;
    }
  }

  private initStars() {
    this.stars = [];
    for (let i = 0; i < 120; i++) {
      this.stars.push({
        x: Math.random() * this.worldWidth,
        y: Math.random() * this.worldHeight * 0.4,
        size: Math.random() * 2 + 0.5,
        twinkle: Math.random() * Math.PI * 2,
        speed: Math.random() * 2 + 1,
      });
    }
  }

  private initClouds() {
    this.clouds = [];
    for (let i = 0; i < 6; i++) {
      this.clouds.push({
        x: Math.random() * this.worldWidth * 1.5 - 200,
        y: 30 + Math.random() * 120,
        width: 120 + Math.random() * 180,
        height: 30 + Math.random() * 40,
        speed: 0.15 + Math.random() * 0.3,
        alpha: 0.3 + Math.random() * 0.4,
      });
    }
  }

  private initGrass() {
    this.grassBlades = [];
    for (let i = 0; i < 200; i++) {
      this.grassBlades.push({
        x: Math.random() * this.worldWidth,
        y: this.worldHeight * 0.65 + Math.random() * this.worldHeight * 0.35,
        height: 8 + Math.random() * 18,
        angle: 0,
        speed: 1 + Math.random() * 2,
      });
    }
  }

  private initNPCs() {
    const store = useGameStore.getState();
    const loc = store.currentLocation;

    this.npcSprites = NPC_DATA
      .filter(npc => npc.defaultLocation === loc || (loc === 'yard'))
      .slice(0, 5)
      .map(npc => {
        const tod = store.timeOfDay;
        const sched = npc.schedule[tod] || npc.schedule['day'];
        return {
          data: npc,
          x: sched.x + (Math.random() - 0.5) * 60,
          y: sched.y + (Math.random() - 0.5) * 30,
          targetX: sched.x,
          targetY: sched.y,
          facing: Math.random() > 0.5 ? 'right' as const : 'left' as const,
          animFrame: 0,
          isMoving: false,
          bobOffset: Math.random() * Math.PI * 2,
          action: sched.action,
        };
      });
  }

  private handleClick(worldX: number, worldY: number) {
    const store = useGameStore.getState();
    if (store.showDialogue || store.isTransitioning) return;

    const loc = LOCATIONS.find(l => l.id === store.currentLocation);
    if (!loc) return;

    for (const conn of loc.connections) {
      const dx = worldX - conn.x;
      const dy = worldY - conn.y;
      if (Math.sqrt(dx * dx + dy * dy) < 50) {
        if (conn.targetId === 'greenhouse' && !store.unlockedLocations.includes('greenhouse')) {
          store.showNotification('Теплица закрыта... Нужен ключ.');
          return;
        }
        this.transitionTo(conn.targetId);
        return;
      }
    }

    for (const npc of this.npcSprites) {
      const dx = worldX - npc.x;
      const dy = worldY - npc.y;
      if (Math.sqrt(dx * dx + dy * dy) < 40) {
        this.interactWithNPC(npc);
        return;
      }
    }

    for (const inter of loc.interactables) {
      const dx = worldX - inter.x;
      const dy = worldY - inter.y;
      if (Math.abs(dx) < inter.width / 2 && Math.abs(dy) < inter.height / 2) {
        this.interactWithObject(inter);
        return;
      }
    }

    const groundY = Math.max(this.worldHeight * 0.55, Math.min(worldY, this.worldHeight - 30));
    this.catTargetX = Math.max(30, Math.min(worldX, this.worldWidth - 30));
    this.catTargetY = groundY;
    this.catIsMoving = true;
    this.catState = 'walking';
  }

  private transitionTo(locationId: string) {
    const store = useGameStore.getState();
    store.setTransitioning(true);

    this.time.delayedCall(500, () => {
      store.setCurrentLocation(locationId);
      this.catX = this.worldWidth / 2;
      this.catY = this.worldHeight * 0.7;
      this.catTargetX = this.catX;
      this.catTargetY = this.catY;
      this.catIsMoving = false;
      this.initNPCs();
      this.initGrass();
      store.setTransitioning(false);
    });
  }

  private interactWithNPC(npc: NPCSprite) {
    const store = useGameStore.getState();
    const npcState = store.npcs[npc.data.id];
    const dialogueLevel = npcState?.currentDialogueLevel || 0;
    const dialogues = npc.data.dialogues[dialogueLevel] || npc.data.dialogues[0];

    store.openDialogue(npc.data.id, dialogues);
    store.addFriendship(npc.data.id, 2);

    if (!npcState?.questProgress.started) {
      store.updateNPC(npc.data.id, {
        questProgress: {
          questId: npc.data.questId,
          currentStep: 0,
          completed: false,
          started: true,
        },
      });
      this.time.delayedCall(500, () => {
        store.showNotification(`Новый квест: ${npc.data.questName}`);
      });
    }
  }

  private interactWithObject(obj: { id: string; name: string; type: string }) {
    const store = useGameStore.getState();

    switch (obj.type) {
      case 'search':
        store.showNotification(`Обыскиваю ${obj.name}...`);
        this.time.delayedCall(1500, () => {
          const items = ['old_cassette', 'guitar_pick', 'diary_pages', 'sticker_set', 'lantern_parts', 'planks', 'treasures'];
          const found = items[Math.floor(Math.random() * items.length)];
          const names: Record<string, string> = {
            old_cassette: 'Старая кассета', guitar_pick: 'Медиатор', diary_pages: 'Страницы дневника',
            sticker_set: 'Набор наклеек', lantern_parts: 'Детали фонарика', planks: 'Доски', treasures: 'Сокровища',
          };
          store.addItem({ id: found, name: names[found] || found, quantity: 1, type: 'quest' });
          store.showNotification(`Найдено: ${names[found] || found}!`);
        });
        break;
      case 'fire':
        store.showNotification('Тёплый костёр потрескивает...');
        this.catState = 'purring';
        break;
      case 'rest':
        store.showNotification(`Отдыхаю на ${obj.name}...`);
        this.catState = 'sleeping';
        break;
      case 'music':
        store.showNotification('Играет музыка...');
        break;
      case 'interactive':
        store.showNotification(`Использую ${obj.name}`);
        break;
      case 'garden':
        store.showNotification('Красивые цветы!');
        break;
      case 'gather':
        store.addItem({ id: 'mushroom', name: 'Гриб', quantity: 1, type: 'gather' });
        store.showNotification('Найден гриб!');
        break;
      case 'minigame':
        store.showNotification('Рыбалка! (Кликни ещё раз, чтобы поймать)');
        this.time.delayedCall(2000, () => {
          store.showNotification('Поймана рыбка! 🐟');
          store.addItem({ id: 'fish', name: 'Рыбка', quantity: 1, type: 'gather' });
        });
        break;
      default:
        store.showNotification(obj.name);
    }
  }

  update(_time: number, delta: number) {
    const store = useGameStore.getState();
    if (store.screen !== 'playing') return;

    const dt = delta / 1000;
    this.globalTime += dt;

    this.timeAccum += dt;
    if (this.timeAccum > 2) {
      this.timeAccum = 0;
      store.advanceTime();
    }

    this.weatherTimer += dt;
    if (this.weatherTimer > 60) {
      this.weatherTimer = 0;
      const weathers: Weather[] = ['clear', 'clear', 'clear', 'rain', 'cloudy', 'fog', 'wind'];
      store.setWeather(weathers[Math.floor(Math.random() * weathers.length)]);
    }

    this.windTarget = store.weather === 'wind' ? 2 : store.weather === 'storm' ? 3 : 0.5;
    this.windStrength += (this.windTarget - this.windStrength) * dt * 0.5;

    this.updateCat(dt);
    this.updateNPCs(dt);
    this.updateParticles(dt);
    this.updateClouds(dt);
    this.updateCamera(dt);

    this.draw(store);
  }

  private updateCat(dt: number) {
    if (this.catIsMoving) {
      const dx = this.catTargetX - this.catX;
      const dy = this.catTargetY - this.catY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 3) {
        const speed = 120;
        this.catX += (dx / dist) * speed * dt;
        this.catY += (dy / dist) * speed * dt;
        this.catFacing = dx > 0 ? 'right' : 'left';
        this.catAnimTimer += dt;
        if (this.catAnimTimer > 0.15) {
          this.catAnimTimer = 0;
          this.catAnimFrame = (this.catAnimFrame + 1) % 4;
        }
      } else {
        this.catIsMoving = false;
        this.catState = 'idle';
        this.catAnimFrame = 0;
      }
    } else {
      this.catIdleTimer += dt;
      if (this.catIdleTimer > 8 && this.catState === 'idle') {
        this.catIdleTimer = 0;
        const r = Math.random();
        if (r < 0.3) {
          this.catState = 'sleeping';
        } else if (r < 0.5) {
          this.catState = 'purring';
        } else {
          this.catTargetX = this.catX + (Math.random() - 0.5) * 200;
          this.catTargetY = Math.max(this.worldHeight * 0.55,
            Math.min(this.catY + (Math.random() - 0.5) * 100, this.worldHeight - 30));
          this.catTargetX = Math.max(30, Math.min(this.catTargetX, this.worldWidth - 30));
          this.catIsMoving = true;
          this.catState = 'walking';
        }
      }
    }

    this.catBobOffset = Math.sin(this.globalTime * 2) * 2;
    this.catTailAngle = Math.sin(this.globalTime * 3) * 0.3;
  }

  private updateNPCs(dt: number) {
    const store = useGameStore.getState();

    for (const npc of this.npcSprites) {
      npc.bobOffset += dt * 2;
      const sched = npc.data.schedule[store.timeOfDay] || npc.data.schedule['day'];

      if (Math.random() < 0.005) {
        npc.targetX = sched.x + (Math.random() - 0.5) * 100;
        npc.targetY = sched.y + (Math.random() - 0.5) * 50;
        npc.targetY = Math.max(this.worldHeight * 0.55, Math.min(npc.targetY, this.worldHeight - 30));
        npc.isMoving = true;
      }

      if (npc.isMoving) {
        const dx = npc.targetX - npc.x;
        const dy = npc.targetY - npc.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 3) {
          npc.x += (dx / dist) * 40 * dt;
          npc.y += (dy / dist) * 40 * dt;
          npc.facing = dx > 0 ? 'right' : 'left';
          npc.animFrame = (npc.animFrame + dt * 5) % 4;
        } else {
          npc.isMoving = false;
          npc.animFrame = 0;
        }
      }
    }
  }

  private updateParticles(dt: number) {
    const store = useGameStore.getState();

    if (store.timeOfDay === 'night' && Math.random() < 0.08) {
      this.particles.push({
        x: Math.random() * this.worldWidth,
        y: this.worldHeight * 0.5 + Math.random() * this.worldHeight * 0.4,
        vx: (Math.random() - 0.5) * 15,
        vy: (Math.random() - 0.5) * 10 - 5,
        life: 3 + Math.random() * 4,
        maxLife: 7,
        size: 2 + Math.random() * 3,
        color: 0xFFFF88,
        alpha: 0,
        type: 'firefly',
      });
    }

    if (store.weather === 'rain' || store.weather === 'storm') {
      const count = store.weather === 'storm' ? 8 : 4;
      for (let i = 0; i < count; i++) {
        this.particles.push({
          x: Math.random() * this.worldWidth,
          y: -10,
          vx: this.windStrength * 30,
          vy: 300 + Math.random() * 200,
          life: 2,
          maxLife: 2,
          size: 1,
          color: 0xAABBDD,
          alpha: 0.5,
          type: 'rain',
        });
      }
    }

    if (Math.random() < 0.02) {
      this.particles.push({
        x: Math.random() * this.worldWidth,
        y: this.worldHeight * 0.6 + Math.random() * this.worldHeight * 0.3,
        vx: this.windStrength * 20 + Math.random() * 10,
        vy: -10 - Math.random() * 20,
        life: 3 + Math.random() * 3,
        maxLife: 6,
        size: 3 + Math.random() * 4,
        color: store.season === 'autumn' ? 0xCC7722 : 0x44AA44,
        alpha: 0.7,
        type: 'leaf',
      });
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      if (p.type === 'firefly') {
        p.vx += (Math.random() - 0.5) * 20 * dt;
        p.vy += (Math.random() - 0.5) * 15 * dt;
        p.alpha = Math.sin((p.maxLife - p.life) * 2) * 0.8;
      } else if (p.type === 'leaf') {
        p.vx += Math.sin(this.globalTime * 2 + p.y * 0.1) * 5 * dt;
        p.alpha = p.life / p.maxLife * 0.7;
      } else if (p.type === 'rain') {
        p.alpha = 0.4;
      }

      if (p.life <= 0 || p.y > this.worldHeight + 20 || p.x < -50 || p.x > this.worldWidth + 50) {
        this.particles.splice(i, 1);
      }
    }

    if (this.particles.length > 500) {
      this.particles.splice(0, this.particles.length - 500);
    }
  }

  private updateClouds(dt: number) {
    for (const cloud of this.clouds) {
      cloud.x += cloud.speed * (1 + this.windStrength) * dt * 15;
      if (cloud.x > this.worldWidth + 200) {
        cloud.x = -cloud.width - 50;
        cloud.y = 30 + Math.random() * 120;
      }
    }
  }

  private updateCamera(dt: number) {
    const screenW = this.scale.width;
    const screenH = this.scale.height;
    const targetCX = this.catX - screenW / 2;
    const targetCY = this.catY - screenH / 2;
    const cx = Math.max(0, Math.min(targetCX, this.worldWidth - screenW));
    const cy = Math.max(0, Math.min(targetCY, this.worldHeight - screenH));
    this.cameraX += (cx - this.cameraX) * dt * 3;
    this.cameraY += (cy - this.cameraY) * dt * 3;
  }

  private draw(store: ReturnType<typeof useGameStore.getState>) {
    const w = this.scale.width;
    const h = this.scale.height;
    const tod = store.timeOfDay;
    const sky = getSkyColors(tod, store.season);

    this.bgGfx.clear();
    this.mainGfx.clear();
    this.fgGfx.clear();
    this.lightGfx.clear();
    this.uiGfx.clear();

    this.drawSky(w, h, sky, tod);
    this.drawStars(w, h, sky);
    this.drawClouds(w, h, tod);
    this.drawSunMoon(w, h, sky, store);
    this.drawMountains(w, h, tod);
    this.drawBackground(w, h, store);
    this.drawGround(w, h, store);
    this.drawInteractables(store);
    this.drawGrass(store);
    this.drawNPCs();
    this.drawCat(tod);
    this.drawParticles();
    this.drawLighting(w, h, sky, store);
    this.drawLocationMarkers(store);
    this.drawTransition(w, h, store);
  }

  private drawSky(w: number, h: number, sky: SkyColors, _tod: TimeOfDay) {
    const steps = 12;
    for (let i = 0; i < steps; i++) {
      const t = i / steps;
      const color = lerpColor(sky.top, sky.bottom, t);
      this.bgGfx.fillStyle(color, 1);
      this.bgGfx.fillRect(0, (h / steps) * i, w, h / steps + 1);
    }
  }

  private drawStars(_w: number, _h: number, sky: SkyColors) {
    if (sky.starAlpha <= 0) return;
    for (const star of this.stars) {
      const twinkle = Math.sin(this.globalTime * star.speed + star.twinkle) * 0.5 + 0.5;
      const alpha = sky.starAlpha * twinkle * 0.8;
      this.bgGfx.fillStyle(0xFFFFFF, alpha);
      this.bgGfx.fillCircle(star.x, star.y, star.size);
      if (star.size > 1.5 && twinkle > 0.7) {
        this.bgGfx.fillStyle(0xFFFFFF, alpha * 0.3);
        this.bgGfx.fillCircle(star.x, star.y, star.size * 2);
      }
    }
  }

  private drawClouds(_w: number, _h: number, tod: TimeOfDay) {
    const alpha = tod === 'night' ? 0.15 : 0.4;
    for (const cloud of this.clouds) {
      const cx = cloud.x - this.cameraX * 0.1;
      const cy = cloud.y;
      const grd = tod === 'night' ? 0x2a2a5a : 0xFFFFFF;
      for (let i = 0; i < 5; i++) {
        const ox = (i - 2) * cloud.width * 0.22;
        const oy = Math.sin(i * 1.5) * cloud.height * 0.3;
        const r = cloud.width * 0.2 + Math.sin(i * 2) * 8;
        this.bgGfx.fillStyle(grd, alpha * cloud.alpha);
        this.bgGfx.fillEllipse(cx + ox, cy + oy, r * 2, r * 1.2);
      }
    }
  }

  private drawSunMoon(w: number, _h: number, sky: SkyColors, store: ReturnType<typeof useGameStore.getState>) {
    const sunX = w * 0.75;
    const sunY = sky.sunMoonY * 200;

    if (store.timeOfDay === 'night') {
      this.bgGfx.fillStyle(sky.sunMoonColor, 0.9);
      this.bgGfx.fillCircle(sunX, sunY, 25);
      this.bgGfx.fillStyle(sky.top, 0.9);
      this.bgGfx.fillCircle(sunX - 7, sunY - 3, 22);
      this.bgGfx.fillStyle(sky.sunMoonColor, 0.1);
      this.bgGfx.fillCircle(sunX, sunY, 50);
    } else {
      this.bgGfx.fillStyle(sky.sunMoonColor, 0.15);
      this.bgGfx.fillCircle(sunX, sunY, 80);
      this.bgGfx.fillStyle(sky.sunMoonColor, 0.25);
      this.bgGfx.fillCircle(sunX, sunY, 50);
      this.bgGfx.fillStyle(sky.sunMoonColor, 0.8);
      this.bgGfx.fillCircle(sunX, sunY, 22);
    }
  }

  private drawMountains(w: number, h: number, tod: TimeOfDay) {
    const baseColor = tod === 'night' ? 0x151530 : tod === 'evening' ? 0x3a2050 : 0x4a6a4a;
    const midY = h * 0.35;

    this.bgGfx.fillStyle(baseColor, 0.5);
    this.bgGfx.beginPath();
    this.bgGfx.moveTo(0, midY + 60);
    for (let x = 0; x <= w; x += 30) {
      const py = midY + Math.sin(x * 0.008 + 1) * 40 + Math.sin(x * 0.015) * 20;
      this.bgGfx.lineTo(x, py);
    }
    this.bgGfx.lineTo(w, h);
    this.bgGfx.lineTo(0, h);
    this.bgGfx.closePath();
    this.bgGfx.fillPath();

    const fgColor = tod === 'night' ? 0x1a1a35 : tod === 'evening' ? 0x4a3060 : 0x3a5a3a;
    this.bgGfx.fillStyle(fgColor, 0.6);
    this.bgGfx.beginPath();
    this.bgGfx.moveTo(0, midY + 100);
    for (let x = 0; x <= w; x += 25) {
      const py = midY + 80 + Math.sin(x * 0.012 + 3) * 30 + Math.sin(x * 0.02) * 15;
      this.bgGfx.lineTo(x, py);
    }
    this.bgGfx.lineTo(w, h);
    this.bgGfx.lineTo(0, h);
    this.bgGfx.closePath();
    this.bgGfx.fillPath();
  }

  private drawBackground(w: number, h: number, store: ReturnType<typeof useGameStore.getState>) {
    const loc = store.currentLocation;
    const tod = store.timeOfDay;
    const ox = -this.cameraX * 0.3;

    if (loc === 'yard') {
      this.drawTrees(w, h, ox, tod, 'bg');
      this.drawHouseExterior(w, h, tod);
      this.drawYardDetails(w, h, tod);
    } else if (loc === 'house') {
      this.drawHouseInterior(w, h, tod);
    } else if (loc === 'forest') {
      this.drawDenseForest(w, h, ox, tod);
      this.drawForestDetails(w, h, tod);
    } else if (loc === 'pond') {
      this.drawPondBg(w, h, tod);
      this.drawPondDetails(w, h, tod);
    } else if (loc === 'greenhouse') {
      this.drawGreenhouseBg(w, h, tod);
    }
  }

  private drawTrees(w: number, _h: number, ox: number, tod: TimeOfDay, _layer: string) {
    const treePositions = [80, 200, 350, 550, 750, 900, 1050];
    const treeColor = tod === 'night' ? 0x1a2a1a : tod === 'evening' ? 0x3a5030 : 0x2d6a2d;
    const trunkColor = tod === 'night' ? 0x2a1a10 : 0x5a3a1a;

    for (const tx of treePositions) {
      const x = tx + ox;
      if (x < -100 || x > w + 100) continue;
      const treeH = 120 + Math.sin(tx * 0.5) * 30;
      const baseY = this.worldHeight * 0.48 - this.cameraY * 0.3;

      this.mainGfx.fillStyle(trunkColor, 0.9);
      this.mainGfx.fillRect(x - 6, baseY - treeH * 0.3, 12, treeH * 0.5);

      const sway = Math.sin(this.globalTime * 0.8 + tx * 0.1) * 3 * this.windStrength;

      for (let layer = 0; layer < 3; layer++) {
        const ly = baseY - treeH * 0.3 - layer * treeH * 0.25;
        const lr = 35 - layer * 6;
        const lc = lerpColor(treeColor, 0x88CC44, layer * 0.15);
        this.mainGfx.fillStyle(lc, 0.85);
        this.mainGfx.fillEllipse(x + sway * (1 + layer * 0.3), ly, lr * 2, lr * 1.5);
      }
    }
  }

  private drawDenseForest(w: number, h: number, _ox: number, tod: TimeOfDay) {
    const colors = tod === 'night'
      ? [0x0a150a, 0x0f1f0f, 0x142814]
      : tod === 'evening'
      ? [0x2a3a20, 0x354a2a, 0x405a34]
      : [0x1a4a1a, 0x226622, 0x2a7a2a];

    for (let layer = 0; layer < 3; layer++) {
      const y = h * 0.3 + layer * 40;
      this.bgGfx.fillStyle(colors[layer], 0.7);
      this.bgGfx.beginPath();
      this.bgGfx.moveTo(0, y + 50);
      for (let x = 0; x <= w; x += 15) {
        const py = y + Math.sin(x * 0.03 + layer * 2) * 25 + Math.sin(x * 0.07) * 10;
        this.bgGfx.lineTo(x, py);
      }
      this.bgGfx.lineTo(w, h);
      this.bgGfx.lineTo(0, h);
      this.bgGfx.closePath();
      this.bgGfx.fillPath();
    }

    if (tod === 'night' || tod === 'evening') {
      this.bgGfx.fillStyle(0x000000, 0.15);
      this.bgGfx.fillRect(0, 0, w, h);
    }
  }

  private drawPondBg(w: number, h: number, tod: TimeOfDay) {
    const waterColor = tod === 'night' ? 0x0a1a3a : tod === 'evening' ? 0x1a3050 : 0x2a6090;
    const waterY = h * 0.55;

    this.bgGfx.fillStyle(waterColor, 0.6);
    this.bgGfx.fillRect(0, waterY, w, h - waterY);

    for (let x = 0; x < w; x += 40) {
      const wy = waterY + Math.sin(this.globalTime * 1.5 + x * 0.05) * 3;
      this.bgGfx.fillStyle(0xFFFFFF, 0.06);
      this.bgGfx.fillEllipse(x, wy, 35, 4);
    }

    if (tod === 'night') {
      const moonReflX = w * 0.75;
      for (let i = 0; i < 5; i++) {
        const ry = waterY + 20 + i * 15 + Math.sin(this.globalTime * 2 + i) * 3;
        this.bgGfx.fillStyle(0xE8E8F0, 0.08 - i * 0.012);
        this.bgGfx.fillEllipse(moonReflX + Math.sin(this.globalTime + i) * 5, ry, 20 - i * 2, 4);
      }
    }
  }

  private drawGreenhouseBg(w: number, h: number, tod: TimeOfDay) {
    const glassColor = tod === 'night' ? 0x1a2a3a : 0x88AACC;
    this.bgGfx.fillStyle(glassColor, 0.15);
    this.bgGfx.fillRect(0, 0, w, h);

    for (let x = 0; x < w; x += 80) {
      this.bgGfx.lineStyle(1, 0xAABBCC, 0.2);
      this.bgGfx.lineBetween(x, 0, x, h);
    }

    for (let i = 0; i < 8; i++) {
      const px = 100 + i * 130;
      const py = h * 0.6 + Math.sin(i * 1.5) * 30;
      const plantColor = [0x22AA44, 0x44CC66, 0x66DD88, 0x9944CC, 0x44AACC][i % 5];
      this.drawPlant(px - this.cameraX * 0.5, py, plantColor, 0.7);
    }
  }

  private drawPlant(x: number, y: number, color: number, alpha: number) {
    const sway = Math.sin(this.globalTime * 1.5 + x * 0.1) * 5;
    this.mainGfx.fillStyle(0x336633, alpha);
    this.mainGfx.fillRect(x - 2, y - 20, 4, 25);
    for (let i = 0; i < 4; i++) {
      const angle = (i - 1.5) * 0.5 + sway * 0.02;
      const lx = x + Math.cos(angle) * 15;
      const ly = y - 15 - i * 6;
      this.mainGfx.fillStyle(color, alpha);
      this.mainGfx.fillEllipse(lx, ly, 12, 8);
    }
  }

  private drawHouseExterior(w: number, _h: number, tod: TimeOfDay) {
    const ox = -this.cameraX * 0.2;
    const houseX = w * 0.45 + ox;
    const houseY = this.worldHeight * 0.28;
    const houseW = 240;
    const houseH = 160;

    const wallColor = tod === 'night' ? 0x3a3028 : tod === 'evening' ? 0x6a5a48 : 0x8a7a68;
    const roofColor = tod === 'night' ? 0x2a1a12 : tod === 'evening' ? 0x5a3020 : 0x7a4030;
    const trimColor = tod === 'night' ? 0x4a3a28 : 0x9a8a78;

    this.bgGfx.fillStyle(wallColor, 0.95);
    this.bgGfx.fillRect(houseX - houseW / 2, houseY, houseW, houseH);

    this.bgGfx.fillStyle(roofColor, 0.95);
    this.bgGfx.fillTriangle(
      houseX - houseW / 2 - 20, houseY,
      houseX + houseW / 2 + 20, houseY,
      houseX, houseY - 60
    );
    this.bgGfx.fillStyle(lerpColor(roofColor, 0x000000, 0.15), 0.9);
    this.bgGfx.fillTriangle(
      houseX - houseW / 2 - 20, houseY,
      houseX, houseY,
      houseX, houseY - 60
    );

    this.bgGfx.lineStyle(2, trimColor, 0.6);
    this.bgGfx.strokeRect(houseX - houseW / 2, houseY, houseW, houseH);

    const windowGlow = tod === 'night' ? 0.6 : tod === 'evening' ? 0.3 : 0.1;
    const windowColor = tod === 'night' ? 0xFFD080 : 0x88AACC;

    const windows = [
      { x: houseX - 60, y: houseY + 30, w: 30, h: 35 },
      { x: houseX + 30, y: houseY + 30, w: 30, h: 35 },
      { x: houseX - 60, y: houseY + 85, w: 30, h: 35 },
      { x: houseX + 30, y: houseY + 85, w: 30, h: 35 },
    ];

    for (const win of windows) {
      this.bgGfx.fillStyle(windowColor, windowGlow + 0.1);
      this.bgGfx.fillRect(win.x, win.y, win.w, win.h);
      this.bgGfx.lineStyle(1, trimColor, 0.7);
      this.bgGfx.strokeRect(win.x, win.y, win.w, win.h);
      this.bgGfx.lineBetween(win.x + win.w / 2, win.y, win.x + win.w / 2, win.y + win.h);
      this.bgGfx.lineBetween(win.x, win.y + win.h / 2, win.x + win.w, win.y + win.h / 2);

      if (tod === 'night' || tod === 'evening') {
        this.lightGfx.fillStyle(0xFFD080, 0.04);
        this.lightGfx.fillCircle(win.x + win.w / 2, win.y + win.h / 2, 40);
      }
    }

    this.bgGfx.fillStyle(lerpColor(wallColor, 0x000000, 0.2), 0.9);
    this.bgGfx.fillRect(houseX - 15, houseY + 100, 30, 60);
    this.bgGfx.fillStyle(0xCCA030, 0.8);
    this.bgGfx.fillCircle(houseX + 10, houseY + 130, 2);

    const verandaColor = tod === 'night' ? 0x2a2018 : 0x6a5a48;
    this.bgGfx.fillStyle(verandaColor, 0.8);
    this.bgGfx.fillRect(houseX - houseW / 2 - 10, houseY + houseH - 5, houseW + 20, 10);

    this.bgGfx.fillStyle(verandaColor, 0.6);
    for (let i = 0; i < 4; i++) {
      const px = houseX - houseW / 2 + i * (houseW / 3);
      this.bgGfx.fillRect(px, houseY + houseH - 5, 4, 20);
    }

    this.bgGfx.fillStyle(roofColor, 0.7);
    this.bgGfx.fillRect(houseX - houseW / 2 - 10, houseY + houseH - 15, houseW + 20, 5);

    const chimneyX = houseX + 40;
    this.bgGfx.fillStyle(lerpColor(wallColor, 0x000000, 0.1), 0.9);
    this.bgGfx.fillRect(chimneyX, houseY - 55, 18, 40);

    if (tod === 'evening' || tod === 'night') {
      for (let i = 0; i < 3; i++) {
        const smokeY = houseY - 60 - i * 15 - Math.sin(this.globalTime + i) * 5;
        const smokeX = chimneyX + 9 + Math.sin(this.globalTime * 0.5 + i * 2) * 8;
        this.bgGfx.fillStyle(0x888888, 0.12 - i * 0.03);
        this.bgGfx.fillCircle(smokeX, smokeY, 8 + i * 4);
      }
    }
  }

  private drawYardDetails(_w: number, _h: number, tod: TimeOfDay) {
    const ox = -this.cameraX;
    const oy = -this.cameraY;

    const fenceColor = tod === 'night' ? 0x2a2018 : 0x6a5a40;
    for (let i = 0; i < 15; i++) {
      const fx = 80 + i * 75 + ox;
      const fy = this.worldHeight * 0.52 + oy;
      this.mainGfx.fillStyle(fenceColor, 0.5);
      this.mainGfx.fillRect(fx, fy - 20, 3, 25);
      this.mainGfx.fillRect(fx - 1, fy - 18, 5, 2);
    }
    this.mainGfx.lineStyle(1.5, fenceColor, 0.4);
    this.mainGfx.lineBetween(80 + ox, this.worldHeight * 0.52 - 12 + oy, 80 + 14 * 75 + ox, this.worldHeight * 0.52 - 12 + oy);
    this.mainGfx.lineBetween(80 + ox, this.worldHeight * 0.52 - 5 + oy, 80 + 14 * 75 + ox, this.worldHeight * 0.52 - 5 + oy);

    if (tod === 'night' || tod === 'evening') {
      const garlandPositions = [150, 300, 450, 600, 750, 900];
      for (let i = 0; i < garlandPositions.length - 1; i++) {
        const x1 = garlandPositions[i] + ox;
        const x2 = garlandPositions[i + 1] + ox;
        const midY = this.worldHeight * 0.45 + 10 + oy;

        for (let t = 0; t <= 1; t += 0.1) {
          const bx = x1 + (x2 - x1) * t;
          const by = midY + Math.sin(t * Math.PI) * 12;
          this.mainGfx.lineStyle(0.5, 0x333333, 0.3);
          if (t > 0) {
            const pbx = x1 + (x2 - x1) * (t - 0.1);
            const pby = midY + Math.sin((t - 0.1) * Math.PI) * 12;
            this.mainGfx.lineBetween(pbx, pby, bx, by);
          }

          const colors = [0xFF6B6B, 0xFFD93D, 0x6BCB77, 0x4D96FF, 0xFF9FF3];
          const bulbColor = colors[Math.floor((i * 10 + t * 10) % colors.length)];
          const flicker = 0.5 + Math.sin(this.globalTime * 3 + i + t * 5) * 0.3;
          this.fgGfx.fillStyle(bulbColor, flicker);
          this.fgGfx.fillCircle(bx, by, 2.5);
          this.fgGfx.fillStyle(bulbColor, flicker * 0.2);
          this.fgGfx.fillCircle(bx, by, 6);
        }
      }
    }

    const bikeX = 850 + ox;
    const bikeY = this.worldHeight * 0.65 + oy;
    const bikeColor = tod === 'night' ? 0x3a2a1a : 0x7a5a3a;
    this.mainGfx.lineStyle(2, bikeColor, 0.6);
    this.mainGfx.strokeCircle(bikeX - 12, bikeY, 10);
    this.mainGfx.strokeCircle(bikeX + 12, bikeY, 10);
    this.mainGfx.lineBetween(bikeX - 12, bikeY, bikeX, bikeY - 12);
    this.mainGfx.lineBetween(bikeX, bikeY - 12, bikeX + 12, bikeY);
    this.mainGfx.lineBetween(bikeX, bikeY - 12, bikeX - 3, bikeY - 18);
  }

  private drawHouseInterior(w: number, h: number, tod: TimeOfDay) {
    const floorColor = tod === 'night' ? 0x2a2018 : 0x6a5a48;
    const wallColor = tod === 'night' ? 0x2a2828 : 0x8a8278;
    const ceilingColor = tod === 'night' ? 0x1a1818 : 0x7a7268;

    this.bgGfx.fillStyle(ceilingColor, 1);
    this.bgGfx.fillRect(0, 0, w, h * 0.15);

    this.bgGfx.fillStyle(wallColor, 1);
    this.bgGfx.fillRect(0, h * 0.15, w, h * 0.4);

    const patternColor = lerpColor(wallColor, 0xFFFFFF, 0.03);
    for (let x = 0; x < w; x += 30) {
      for (let y = h * 0.15; y < h * 0.55; y += 30) {
        this.bgGfx.fillStyle(patternColor, 0.3);
        this.bgGfx.fillRect(x + 10, y + 10, 8, 8);
      }
    }

    this.bgGfx.fillStyle(floorColor, 1);
    this.bgGfx.fillRect(0, h * 0.55, w, h * 0.45);

    const plankColor = lerpColor(floorColor, 0x000000, 0.05);
    for (let x = 0; x < w; x += 60) {
      this.bgGfx.lineStyle(0.5, plankColor, 0.3);
      this.bgGfx.lineBetween(x, h * 0.55, x, h);
    }

    this.bgGfx.lineStyle(2, lerpColor(wallColor, 0x000000, 0.1), 0.5);
    this.bgGfx.lineBetween(0, h * 0.55, w, h * 0.55);

    const moldingColor = tod === 'night' ? 0x3a3028 : 0x9a8a78;
    this.bgGfx.fillStyle(moldingColor, 0.6);
    this.bgGfx.fillRect(0, h * 0.53, w, 4);
    this.bgGfx.fillRect(0, h * 0.14, w, 3);

    const windowX = w * 0.8;
    const windowY = h * 0.2;
    const windowW = 80;
    const windowH = 100;

    if (tod === 'night') {
      this.bgGfx.fillStyle(0x0B0B2A, 0.8);
    } else if (tod === 'evening') {
      this.bgGfx.fillStyle(0xFF8C4A, 0.6);
    } else {
      this.bgGfx.fillStyle(0x88CCEE, 0.6);
    }
    this.bgGfx.fillRect(windowX, windowY, windowW, windowH);
    this.bgGfx.lineStyle(3, moldingColor, 0.8);
    this.bgGfx.strokeRect(windowX, windowY, windowW, windowH);
    this.bgGfx.lineBetween(windowX + windowW / 2, windowY, windowX + windowW / 2, windowY + windowH);
    this.bgGfx.lineBetween(windowX, windowY + windowH / 2, windowX + windowW, windowY + windowH / 2);

    if (tod === 'day' || tod === 'morning') {
      this.lightGfx.fillStyle(0xFFFFCC, 0.06);
      this.lightGfx.beginPath();
      this.lightGfx.moveTo(windowX, windowY + windowH);
      this.lightGfx.lineTo(windowX - 60, h);
      this.lightGfx.lineTo(windowX + windowW + 60, h);
      this.lightGfx.lineTo(windowX + windowW, windowY + windowH);
      this.lightGfx.closePath();
      this.lightGfx.fillPath();
    }

    const curtainColor = tod === 'night' ? 0x4a2020 : 0x8a4040;
    this.bgGfx.fillStyle(curtainColor, 0.5);
    this.bgGfx.fillRect(windowX - 8, windowY - 5, 15, windowH + 10);
    this.bgGfx.fillRect(windowX + windowW - 7, windowY - 5, 15, windowH + 10);

    const sofaX = 100;
    const sofaY = h * 0.55 - 35;
    const sofaColor = tod === 'night' ? 0x2a3a4a : 0x4a6a7a;
    this.mainGfx.fillStyle(sofaColor, 0.9);
    this.mainGfx.fillRoundedRect(sofaX, sofaY, 120, 40, 6);
    this.mainGfx.fillStyle(lerpColor(sofaColor, 0x000000, 0.15), 0.9);
    this.mainGfx.fillRoundedRect(sofaX, sofaY - 30, 120, 35, 6);
    this.mainGfx.fillStyle(lerpColor(sofaColor, 0xFFFFFF, 0.1), 0.4);
    this.mainGfx.fillRoundedRect(sofaX + 10, sofaY + 5, 30, 25, 4);
    this.mainGfx.fillRoundedRect(sofaX + 50, sofaY + 5, 30, 25, 4);

    const tableX = 350;
    const tableY = h * 0.55 - 20;
    const tableColor = tod === 'night' ? 0x3a2a18 : 0x7a5a38;
    this.mainGfx.fillStyle(tableColor, 0.9);
    this.mainGfx.fillRoundedRect(tableX, tableY, 80, 25, 3);
    this.mainGfx.fillRect(tableX + 5, tableY + 22, 5, 25);
    this.mainGfx.fillRect(tableX + 70, tableY + 22, 5, 25);

    if (tod === 'night' || tod === 'evening') {
      this.mainGfx.fillStyle(0xCCA030, 0.8);
      this.mainGfx.fillRect(tableX + 35, tableY - 20, 10, 20);
      this.mainGfx.fillStyle(0xFF8C00, 0.7);
      const flicker = Math.sin(this.globalTime * 8) * 2;
      this.mainGfx.fillTriangle(tableX + 37, tableY - 20, tableX + 43, tableY - 20, tableX + 40, tableY - 28 + flicker);
      this.lightGfx.fillStyle(0xFF8C00, 0.06);
      this.lightGfx.fillCircle(tableX + 40, tableY - 10, 60);
    }

    const shelfX = w * 0.5;
    const shelfY = h * 0.2;
    this.mainGfx.fillStyle(tableColor, 0.8);
    this.mainGfx.fillRect(shelfX, shelfY, 100, 5);
    this.mainGfx.fillRect(shelfX, shelfY + 35, 100, 5);
    this.mainGfx.fillRect(shelfX, shelfY + 70, 100, 5);
    this.mainGfx.fillRect(shelfX - 2, shelfY, 4, 75);
    this.mainGfx.fillRect(shelfX + 98, shelfY, 4, 75);

    const bookColors = [0xCC3333, 0x3366CC, 0x33AA33, 0xCC9933, 0x9933CC, 0xCC6633, 0x336666];
    for (let i = 0; i < 7; i++) {
      const bx = shelfX + 5 + i * 13;
      const bh = 18 + Math.sin(i * 2) * 5;
      this.mainGfx.fillStyle(bookColors[i], 0.7);
      this.mainGfx.fillRect(bx, shelfY - bh + 5, 10, bh);
    }
    for (let i = 0; i < 5; i++) {
      const bx = shelfX + 5 + i * 17;
      const bh = 16 + Math.sin(i * 3) * 4;
      this.mainGfx.fillStyle(bookColors[(i + 3) % bookColors.length], 0.7);
      this.mainGfx.fillRect(bx, shelfY + 35 - bh + 5, 13, bh);
    }

    const rugColor = tod === 'night' ? 0x3a2028 : 0x8a4050;
    this.mainGfx.fillStyle(rugColor, 0.3);
    this.mainGfx.fillEllipse(w * 0.4, h * 0.75, 200, 60);
    this.mainGfx.lineStyle(1, lerpColor(rugColor, 0xFFFFFF, 0.2), 0.2);
    this.mainGfx.strokeEllipse(w * 0.4, h * 0.75, 180, 50);
    this.mainGfx.strokeEllipse(w * 0.4, h * 0.75, 150, 38);
  }

  private drawForestDetails(w: number, h: number, tod: TimeOfDay) {
    const ox = -this.cameraX * 0.4;

    const mossColor = tod === 'night' ? 0x0a1a0a : 0x2a5a2a;
    for (let i = 0; i < 8; i++) {
      const rx = 100 + i * 140 + ox + Math.sin(i * 3) * 30;
      const ry = h * 0.6 + Math.sin(i * 2) * 20;
      this.mainGfx.fillStyle(0x555544, 0.5);
      this.mainGfx.fillEllipse(rx, ry, 15 + Math.sin(i) * 5, 10);
      this.mainGfx.fillStyle(mossColor, 0.4);
      this.mainGfx.fillEllipse(rx - 3, ry - 3, 10, 6);
    }

    const mushroomPositions = [180, 400, 650, 850];
    for (const mx of mushroomPositions) {
      const x = mx + ox;
      const y = h * 0.68 + Math.sin(mx * 0.1) * 10;
      this.mainGfx.fillStyle(0xEEDDBB, 0.7);
      this.mainGfx.fillRect(x - 1.5, y - 5, 3, 8);
      const capColor = Math.sin(mx) > 0 ? 0xCC3333 : 0xDD8833;
      this.mainGfx.fillStyle(capColor, 0.8);
      this.mainGfx.fillEllipse(x, y - 7, 8, 5);
      if (Math.sin(mx) > 0) {
        this.mainGfx.fillStyle(0xFFFFFF, 0.6);
        this.mainGfx.fillCircle(x - 2, y - 8, 1.5);
        this.mainGfx.fillCircle(x + 2, y - 7, 1);
      }
    }

    if (tod === 'night' || tod === 'evening') {
      this.lightGfx.fillStyle(0x000000, 0.1);
      this.lightGfx.fillRect(0, 0, w, h);
    }

    if (tod === 'day' || tod === 'morning') {
      for (let i = 0; i < 6; i++) {
        const rx = 100 + i * 150 + Math.sin(i * 5) * 50;
        this.lightGfx.fillStyle(0xFFFF88, 0.02);
        this.lightGfx.beginPath();
        this.lightGfx.moveTo(rx, 0);
        this.lightGfx.lineTo(rx - 25, h);
        this.lightGfx.lineTo(rx + 25, h);
        this.lightGfx.closePath();
        this.lightGfx.fillPath();
      }
    }
  }

  private drawPondDetails(w: number, _h: number, tod: TimeOfDay) {
    const waterY = this.scale.height * 0.55;

    const lilyPositions = [200, 350, 500, 700, 850];
    for (const lx of lilyPositions) {
      const x = lx - this.cameraX * 0.3;
      const y = waterY + 20 + Math.sin(this.globalTime + lx * 0.1) * 3;
      this.mainGfx.fillStyle(0x228B22, 0.6);
      this.mainGfx.fillEllipse(x, y, 18, 10);
      if (Math.sin(lx * 0.5) > 0) {
        this.mainGfx.fillStyle(0xFF69B4, 0.7);
        for (let p = 0; p < 5; p++) {
          const angle = (p / 5) * Math.PI * 2;
          const px = x + Math.cos(angle) * 5;
          const py = y - 3 + Math.sin(angle) * 3;
          this.mainGfx.fillEllipse(px, py, 4, 6);
        }
        this.mainGfx.fillStyle(0xFFFF00, 0.6);
        this.mainGfx.fillCircle(x, y - 3, 2);
      }
    }

    const reedPositions = [50, 120, w - 80, w - 150, w - 30];
    for (const rx of reedPositions) {
      const sway = Math.sin(this.globalTime * 1.2 + rx * 0.05) * 4;
      this.mainGfx.lineStyle(2, 0x556B2F, 0.6);
      this.mainGfx.lineBetween(rx, waterY + 30, rx + sway, waterY - 20);
      this.mainGfx.fillStyle(0x8B7355, 0.7);
      this.mainGfx.fillEllipse(rx + sway, waterY - 22, 4, 8);
    }

    if (tod === 'night') {
      for (let i = 0; i < 3; i++) {
        const fx = 200 + i * 250;
        const fy = waterY - 30;
        this.fgGfx.fillStyle(0xFFFF88, 0.1 + Math.sin(this.globalTime * 2 + i * 3) * 0.08);
        this.fgGfx.fillCircle(fx + Math.sin(this.globalTime + i) * 20, fy + Math.cos(this.globalTime * 0.7 + i) * 15, 3);
      }
    }
  }

  private drawGround(_w: number, _h: number, store: ReturnType<typeof useGameStore.getState>) {
    const tod = store.timeOfDay;
    const loc = store.currentLocation;
    const w = this.worldWidth;
    const h = this.worldHeight;
    const groundY = h * 0.55;

    let groundColor = tod === 'night' ? 0x1a2a1a : tod === 'evening' ? 0x3a5030 : 0x4a8a3a;
    if (loc === 'house') groundColor = tod === 'night' ? 0x2a2018 : 0x6a5040;
    if (loc === 'pond') groundColor = tod === 'night' ? 0x1a2a2a : 0x3a6a5a;

    const steps = 8;
    for (let i = 0; i < steps; i++) {
      const t = i / steps;
      const y = groundY + (h - groundY) * t;
      const segH = (h - groundY) / steps + 1;
      const darken = lerpColor(groundColor, 0x1a1a0a, t * 0.5);
      this.mainGfx.fillStyle(darken, 1);
      this.mainGfx.fillRect(-this.cameraX, y - this.cameraY, w + 200, segH);
    }

    if (loc === 'yard') {
      this.drawPath(300 - this.cameraX, groundY + 50 - this.cameraY, 600 - this.cameraX, h - 20 - this.cameraY, tod);
    }
  }

  private drawPath(x1: number, y1: number, x2: number, y2: number, tod: TimeOfDay) {
    const pathColor = tod === 'night' ? 0x3a3020 : 0x8a7a5a;
    const steps = 15;
    for (let i = 0; i < steps; i++) {
      const t = i / steps;
      const x = x1 + (x2 - x1) * t + Math.sin(t * 5) * 15;
      const y = y1 + (y2 - y1) * t;
      const w = 30 + Math.sin(t * 3) * 8;
      this.mainGfx.fillStyle(pathColor, 0.5);
      this.mainGfx.fillEllipse(x, y, w, 10);
    }
  }

  private drawInteractables(store: ReturnType<typeof useGameStore.getState>) {
    const loc = LOCATIONS.find(l => l.id === store.currentLocation);
    if (!loc) return;
    const tod = store.timeOfDay;

    for (const obj of loc.interactables) {
      const x = obj.x - this.cameraX;
      const y = obj.y - this.cameraY;

      switch (obj.type) {
        case 'fire':
          this.drawCampfire(x, y, tod);
          break;
        case 'interactive':
        case 'music':
          this.drawObject(x, y, obj.width, obj.height, 0x8B7355, tod);
          break;
        case 'rest':
          this.drawObject(x, y, obj.width, obj.height, 0x6B8E7B, tod);
          break;
        case 'search':
          this.drawShed(x, y, tod);
          break;
        case 'garden':
          this.drawFlowerbed(x, y);
          break;
        case 'cat':
          this.drawCatCorner(x, y, tod);
          break;
        case 'ambient':
          break;
        case 'explore':
          this.drawTreehouse(x, y, tod);
          break;
        case 'minigame':
          this.drawFishingSpot(x, y, tod);
          break;
        default:
          this.drawObject(x, y, obj.width, obj.height, 0x7a6a5a, tod);
      }
    }
  }

  private drawCampfire(x: number, y: number, tod: TimeOfDay) {
    this.mainGfx.fillStyle(0x4a3a2a, 0.8);
    this.mainGfx.fillEllipse(x, y + 10, 50, 15);

    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const sx = x + Math.cos(angle) * 18;
      const sy = y + 5 + Math.sin(angle) * 6;
      this.mainGfx.fillStyle(0x3a2a1a, 0.9);
      this.mainGfx.fillRect(sx - 2, sy - 1, 8, 3);
    }

    const fireHeight = 25 + Math.sin(this.globalTime * 5) * 5;
    const flames = [
      { ox: 0, h: fireHeight, c: 0xFF4500 },
      { ox: -5, h: fireHeight * 0.7, c: 0xFF6B35 },
      { ox: 5, h: fireHeight * 0.8, c: 0xFF8C00 },
      { ox: 0, h: fireHeight * 0.5, c: 0xFFD700 },
    ];

    for (const f of flames) {
      const fx = x + f.ox + Math.sin(this.globalTime * 8 + f.ox) * 3;
      this.mainGfx.fillStyle(f.c, 0.8);
      this.mainGfx.fillTriangle(fx - 8, y, fx + 8, y, fx, y - f.h);
    }

    if (tod === 'night' || tod === 'evening') {
      this.lightGfx.fillStyle(0xFF6B35, 0.08);
      this.lightGfx.fillCircle(x, y, 120);
      this.lightGfx.fillStyle(0xFF8C00, 0.05);
      this.lightGfx.fillCircle(x, y, 80);
    }
  }

  private drawObject(x: number, y: number, w: number, h: number, color: number, _tod: TimeOfDay) {
    this.mainGfx.fillStyle(color, 0.7);
    this.mainGfx.fillRoundedRect(x - w / 2, y - h / 2, w, h, 4);
    this.mainGfx.lineStyle(1, 0x000000, 0.2);
    this.mainGfx.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 4);
  }

  private drawShed(x: number, y: number, tod: TimeOfDay) {
    const wallColor = tod === 'night' ? 0x3a2a1a : 0x7a5a3a;
    const roofColor = tod === 'night' ? 0x2a1a0a : 0x5a3a2a;

    this.mainGfx.fillStyle(wallColor, 0.9);
    this.mainGfx.fillRect(x - 50, y - 30, 100, 70);

    this.mainGfx.fillStyle(roofColor, 0.9);
    this.mainGfx.fillTriangle(x - 60, y - 30, x + 60, y - 30, x, y - 70);

    this.mainGfx.fillStyle(0x2a1a0a, 0.6);
    this.mainGfx.fillRect(x - 12, y, 24, 40);
    this.mainGfx.fillStyle(0xCCA030, 0.8);
    this.mainGfx.fillCircle(x + 8, y + 20, 2);
  }

  private drawFlowerbed(x: number, y: number) {
    this.mainGfx.fillStyle(0x5a4020, 0.6);
    this.mainGfx.fillEllipse(x, y, 70, 25);

    const flowerColors = [0xFF6B6B, 0xFFD93D, 0xFF8ED4, 0xFFFFFF, 0xFF9FF3];
    for (let i = 0; i < 7; i++) {
      const fx = x - 25 + i * 8 + Math.sin(i * 2) * 3;
      const fy = y - 5 + Math.sin(i * 3) * 5;
      this.mainGfx.fillStyle(0x228B22, 0.8);
      this.mainGfx.fillRect(fx, fy, 2, 10);
      this.mainGfx.fillStyle(flowerColors[i % flowerColors.length], 0.9);
      const sway = Math.sin(this.globalTime * 2 + i) * 2;
      this.mainGfx.fillCircle(fx + sway, fy - 3, 4);
    }
  }

  private drawCatCorner(x: number, y: number, tod: TimeOfDay) {
    this.mainGfx.fillStyle(tod === 'night' ? 0x3a2a2a : 0x8a6a5a, 0.7);
    this.mainGfx.fillRoundedRect(x - 25, y - 15, 50, 35, 8);
    this.mainGfx.fillStyle(tod === 'night' ? 0x5a3a2a : 0xAA8A6A, 0.5);
    this.mainGfx.fillEllipse(x, y + 5, 40, 20);
  }

  private drawTreehouse(x: number, y: number, tod: TimeOfDay) {
    const trunkColor = tod === 'night' ? 0x2a1a0a : 0x5a3a1a;
    this.mainGfx.fillStyle(trunkColor, 0.9);
    this.mainGfx.fillRect(x - 8, y - 60, 16, 100);

    const leafColor = tod === 'night' ? 0x1a3a1a : 0x2a7a2a;
    this.mainGfx.fillStyle(leafColor, 0.8);
    this.mainGfx.fillEllipse(x, y - 80, 80, 50);

    const houseColor = tod === 'night' ? 0x3a2a1a : 0x7a5a3a;
    this.mainGfx.fillStyle(houseColor, 0.8);
    this.mainGfx.fillRect(x - 25, y - 55, 50, 35);
    this.mainGfx.fillStyle(0xFFD700, tod === 'night' ? 0.6 : 0.2);
    this.mainGfx.fillRect(x - 8, y - 48, 16, 12);
  }

  private drawFishingSpot(x: number, y: number, _tod: TimeOfDay) {
    this.mainGfx.fillStyle(0x6a5a40, 0.7);
    this.mainGfx.fillRect(x - 30, y - 2, 60, 6);
    this.mainGfx.fillRect(x - 2, y - 30, 4, 30);
    this.mainGfx.lineStyle(1, 0xCCCCCC, 0.5);
    this.mainGfx.lineBetween(x, y - 28, x + 15, y + 10);
  }

  private drawGrass(store: ReturnType<typeof useGameStore.getState>) {
    const tod = store.timeOfDay;
    const grassColor = tod === 'night' ? 0x1a3a1a : tod === 'evening' ? 0x3a5a2a : 0x3a8a2a;

    for (const blade of this.grassBlades) {
      const x = blade.x - this.cameraX;
      const y = blade.y - this.cameraY;
      if (x < -20 || x > this.scale.width + 20) continue;

      const sway = Math.sin(this.globalTime * blade.speed + blade.x * 0.05) * this.windStrength * 4;
      this.mainGfx.lineStyle(1.5, grassColor, 0.6);
      this.mainGfx.lineBetween(x, y, x + sway, y - blade.height);
    }
  }

  private drawNPCs() {
    for (const npc of this.npcSprites) {
      const x = npc.x - this.cameraX;
      const y = npc.y - this.cameraY;
      const bob = Math.sin(npc.bobOffset) * (npc.isMoving ? 3 : 1);
      this.drawNPCCharacter(x, y + bob, npc);
    }
  }

  private drawNPCCharacter(x: number, y: number, npc: NPCSprite) {
    const app = npc.data.appearance;
    const dir = npc.facing === 'right' ? 1 : -1;

    this.mainGfx.fillStyle(0x000000, 0.15);
    this.mainGfx.fillEllipse(x, y + 22, 24, 8);

    const legSwing = npc.isMoving ? Math.sin(npc.animFrame * Math.PI) * 5 : 0;
    this.mainGfx.fillStyle(0x3a3a5a, 0.8);
    this.mainGfx.fillRoundedRect(x - 6 - legSwing, y + 8, 8, 14, 2);
    this.mainGfx.fillRoundedRect(x + legSwing - 2, y + 8, 8, 14, 2);

    this.mainGfx.fillStyle(Phaser.Display.Color.HexStringToColor(app.outfitColor).color, 0.9);
    this.mainGfx.fillRoundedRect(x - 10, y - 12, 20, 24, 4);
    this.mainGfx.fillStyle(Phaser.Display.Color.HexStringToColor(app.accentColor).color, 0.4);
    this.mainGfx.fillRoundedRect(x - 8, y - 10, 16, 6, 2);

    const armSwing = npc.isMoving ? Math.sin(npc.animFrame * Math.PI) * 4 : 0;
    this.mainGfx.fillStyle(Phaser.Display.Color.HexStringToColor(app.outfitColor).color, 0.8);
    this.mainGfx.fillRoundedRect(x - 14, y - 8 + armSwing, 6, 16, 3);
    this.mainGfx.fillRoundedRect(x + 8, y - 8 - armSwing, 6, 16, 3);

    this.mainGfx.fillStyle(Phaser.Display.Color.HexStringToColor(app.skinTone).color, 0.9);
    this.mainGfx.fillCircle(x, y - 18, 10);

    this.mainGfx.fillStyle(Phaser.Display.Color.HexStringToColor(app.hairColor).color, 0.9);
    this.mainGfx.fillEllipse(x, y - 25, 18, 10);
    this.mainGfx.fillEllipse(x + dir * 2, y - 22, 16, 8);

    this.mainGfx.fillStyle(0x1a1a1a, 0.9);
    this.mainGfx.fillCircle(x + dir * 3, y - 19, 1.5);
    this.mainGfx.fillCircle(x + dir * 7, y - 19, 1.5);
    this.mainGfx.lineStyle(1, 0xCC6666, 0.5);
    this.mainGfx.beginPath();
    this.mainGfx.arc(x + dir * 5, y - 16, 3, 0, Math.PI, false);
    this.mainGfx.strokePath();

    if (app.hasGlasses) {
      this.mainGfx.lineStyle(1, 0x333333, 0.8);
      this.mainGfx.strokeCircle(x + dir * 3, y - 19, 4);
      this.mainGfx.strokeCircle(x + dir * 7, y - 19, 4);
      this.mainGfx.lineBetween(x + dir * 3 + 4, y - 19, x + dir * 7 - 4, y - 19);
    }

    const store = useGameStore.getState();
    const npcState = store.npcs[npc.data.id];
    if (npcState && npcState.questProgress.started && !npcState.questProgress.completed) {
      this.mainGfx.fillStyle(0xFFD700, 0.9);
      this.mainGfx.fillCircle(x, y - 36, 5);
      this.mainGfx.fillStyle(0xFFFFFF, 0.9);
      this.mainGfx.fillCircle(x, y - 36, 4);
      this.mainGfx.fillStyle(0xFFD700, 1);
      this.mainGfx.fillCircle(x, y - 36, 3);
    }
  }

  private drawCat(tod: TimeOfDay) {
    const x = this.catX - this.cameraX;
    const y = this.catY - this.cameraY + this.catBobOffset;
    const dir = this.catFacing === 'right' ? 1 : -1;

    this.mainGfx.fillStyle(0x000000, 0.12);
    this.mainGfx.fillEllipse(x, y + 10, 22, 6);

    const bodyColor = 0xE87C1E;
    const lightColor = 0xF5A623;
    const darkColor = 0xCC6600;
    const bellyColor = 0xFFF5E0;

    if (this.catState === 'sleeping') {
      this.mainGfx.fillStyle(bodyColor, 0.95);
      this.mainGfx.fillEllipse(x, y, 22, 12);
      this.mainGfx.fillStyle(bellyColor, 0.5);
      this.mainGfx.fillEllipse(x + dir * 3, y + 2, 12, 7);

      this.mainGfx.fillStyle(bodyColor, 0.95);
      this.mainGfx.fillCircle(x + dir * 14, y - 4, 8);
      this.mainGfx.fillStyle(bellyColor, 0.7);
      this.mainGfx.fillCircle(x + dir * 16, y - 3, 4);

      this.mainGfx.lineStyle(1, 0x1a1a1a, 0.4);
      this.mainGfx.lineBetween(x + dir * 12, y - 5, x + dir * 16, y - 5);
      this.mainGfx.lineBetween(x + dir * 12, y - 3, x + dir * 16, y - 3);

      this.mainGfx.fillStyle(bodyColor, 0.9);
      const tailX = x - dir * 18 + Math.sin(this.globalTime) * 3;
      this.mainGfx.fillEllipse(tailX, y + 2, 12, 5);

      if (this.catState === 'sleeping' && Math.sin(this.globalTime * 2) > 0.5) {
        this.fgGfx.fillStyle(0xFFFFFF, 0.4);
        const zzx = x + dir * 20;
        const zzy = y - 15 + Math.sin(this.globalTime * 1.5) * 3;
        this.drawZzz(zzx, zzy);
      }

      return;
    }

    if (this.catIsMoving) {
      const walkBob = Math.sin(this.catAnimFrame * Math.PI * 2) * 2;
      const legAnim = Math.sin(this.catAnimFrame * Math.PI);

      this.mainGfx.fillStyle(bodyColor, 0.9);
      this.mainGfx.fillRoundedRect(x - 5 + dir * legAnim * 3, y + 2, 5, 8, 2);
      this.mainGfx.fillRoundedRect(x + 2 - dir * legAnim * 3, y + 2, 5, 8, 2);
      this.mainGfx.fillRoundedRect(x - 10 - dir * legAnim * 2, y + 2, 5, 8, 2);
      this.mainGfx.fillRoundedRect(x + 7 + dir * legAnim * 2, y + 2, 5, 8, 2);

      this.mainGfx.fillStyle(bodyColor, 0.95);
      this.mainGfx.fillEllipse(x, y - 2 + walkBob, 24, 14);

      this.mainGfx.fillStyle(darkColor, 0.3);
      this.mainGfx.fillEllipse(x + 3, y - 4 + walkBob, 8, 5);
      this.mainGfx.fillEllipse(x - 5, y - 1 + walkBob, 6, 4);

      this.mainGfx.fillStyle(bellyColor, 0.5);
      this.mainGfx.fillEllipse(x, y + 3 + walkBob, 14, 6);
    } else {
      this.mainGfx.fillStyle(bodyColor, 0.9);
      this.mainGfx.fillRoundedRect(x - 5, y + 2, 5, 6, 2);
      this.mainGfx.fillRoundedRect(x + 2, y + 2, 5, 6, 2);

      this.mainGfx.fillStyle(bodyColor, 0.95);
      this.mainGfx.fillEllipse(x, y - 2, 22, 14);

      this.mainGfx.fillStyle(darkColor, 0.3);
      this.mainGfx.fillEllipse(x + 3, y - 4, 8, 5);
      this.mainGfx.fillEllipse(x - 5, y - 1, 6, 4);

      this.mainGfx.fillStyle(bellyColor, 0.5);
      this.mainGfx.fillEllipse(x, y + 3, 14, 6);
    }

    const tailAngle = this.catTailAngle;
    const tailX1 = x - dir * 12;
    const tailX2 = tailX1 - dir * 12 + Math.sin(tailAngle) * 8;
    const tailY2 = y - 8 + Math.cos(tailAngle) * 5;
    this.mainGfx.lineStyle(4, bodyColor, 0.9);
    this.mainGfx.lineBetween(tailX1, y - 2, tailX2, tailY2);
    this.mainGfx.lineStyle(3, lightColor, 0.6);
    this.mainGfx.lineBetween(tailX1, y - 2, tailX2, tailY2);

    this.mainGfx.fillStyle(bodyColor, 0.95);
    this.mainGfx.fillCircle(x + dir * 10, y - 10, 9);

    this.mainGfx.fillStyle(bellyColor, 0.8);
    this.mainGfx.fillCircle(x + dir * 12, y - 9, 5);

    this.mainGfx.fillStyle(bodyColor, 0.95);
    this.mainGfx.fillTriangle(
      x + dir * 5, y - 18,
      x + dir * 3, y - 22,
      x + dir * 9, y - 18
    );
    this.mainGfx.fillTriangle(
      x + dir * 13, y - 18,
      x + dir * 15, y - 22,
      x + dir * 11, y - 18
    );
    this.mainGfx.fillStyle(0xFFB6C1, 0.6);
    this.mainGfx.fillTriangle(
      x + dir * 6, y - 18,
      x + dir * 5, y - 20,
      x + dir * 8, y - 18
    );
    this.mainGfx.fillTriangle(
      x + dir * 13, y - 18,
      x + dir * 14, y - 20,
      x + dir * 12, y - 18
    );

    const blink = Math.sin(this.globalTime * 0.5) > 0.95;
    if (blink) {
      this.mainGfx.lineStyle(1, 0x1a1a1a, 0.8);
      this.mainGfx.lineBetween(x + dir * 7, y - 11, x + dir * 10, y - 11);
      this.mainGfx.lineBetween(x + dir * 12, y - 11, x + dir * 15, y - 11);
    } else {
      this.mainGfx.fillStyle(0xE8A020, 0.95);
      this.mainGfx.fillEllipse(x + dir * 8, y - 11, 4, 3.5);
      this.mainGfx.fillEllipse(x + dir * 14, y - 11, 4, 3.5);
      this.mainGfx.fillStyle(0x1a1a1a, 0.9);
      const pupilSize = tod === 'night' ? 2.5 : 1.5;
      this.mainGfx.fillEllipse(x + dir * 8, y - 11, pupilSize, 3);
      this.mainGfx.fillEllipse(x + dir * 14, y - 11, pupilSize, 3);
      this.mainGfx.fillStyle(0xFFFFFF, 0.6);
      this.mainGfx.fillCircle(x + dir * 7, y - 12, 1);
      this.mainGfx.fillCircle(x + dir * 13, y - 12, 1);
    }

    this.mainGfx.fillStyle(0xFFB6C1, 0.8);
    this.mainGfx.fillTriangle(
      x + dir * 10, y - 8,
      x + dir * 11, y - 9.5,
      x + dir * 12, y - 8
    );

    this.mainGfx.lineStyle(0.7, 0x1a1a1a, 0.3);
    this.mainGfx.lineBetween(x + dir * 3, y - 9, x + dir * -3, y - 10);
    this.mainGfx.lineBetween(x + dir * 3, y - 8, x + dir * -3, y - 8);
    this.mainGfx.lineBetween(x + dir * 18, y - 9, x + dir * 24, y - 10);
    this.mainGfx.lineBetween(x + dir * 18, y - 8, x + dir * 24, y - 8);

    if (this.catState === 'purring') {
      const purrAlpha = (Math.sin(this.globalTime * 4) + 1) * 0.3;
      this.fgGfx.fillStyle(0xFFE4B5, purrAlpha);
      this.fgGfx.fillCircle(x + dir * 11, y - 6, 8 + Math.sin(this.globalTime * 3) * 2);
    }
  }

  private drawZzz(x: number, y: number) {
    const sizes = [6, 8, 10];
    for (let i = 0; i < 3; i++) {
      const zy = y - i * 10;
      const zx = x + i * 5;
      const alpha = 0.3 - i * 0.08;
      this.fgGfx.lineStyle(1.5, 0x6666AA, alpha);
      this.fgGfx.lineBetween(zx, zy, zx + sizes[i], zy);
      this.fgGfx.lineBetween(zx + sizes[i], zy, zx, zy - sizes[i]);
      this.fgGfx.lineBetween(zx, zy - sizes[i], zx + sizes[i], zy - sizes[i]);
    }
  }

  private drawParticles() {
    for (const p of this.particles) {
      const px = p.x - this.cameraX;
      const py = p.y - this.cameraY;

      if (p.type === 'firefly') {
        this.fgGfx.fillStyle(p.color, p.alpha * 0.3);
        this.fgGfx.fillCircle(px, py, p.size * 3);
        this.fgGfx.fillStyle(p.color, p.alpha);
        this.fgGfx.fillCircle(px, py, p.size);
        this.fgGfx.fillStyle(0xFFFFFF, p.alpha * 0.6);
        this.fgGfx.fillCircle(px, py, p.size * 0.4);
      } else if (p.type === 'rain') {
        this.fgGfx.lineStyle(1, p.color, p.alpha);
        this.fgGfx.lineBetween(px, py, px + p.vx * 0.02, py + 8);
      } else if (p.type === 'leaf') {
        const rot = this.globalTime * 3 + p.x;
        const lw = p.size * Math.abs(Math.cos(rot));
        this.fgGfx.fillStyle(p.color, p.alpha);
        this.fgGfx.fillEllipse(px, py, lw + 2, p.size * 0.6);
      }
    }
  }

  private drawLighting(w: number, h: number, sky: SkyColors, store: ReturnType<typeof useGameStore.getState>) {
    if (sky.ambientAlpha > 0) {
      this.lightGfx.fillStyle(sky.ambientColor, sky.ambientAlpha);
      this.lightGfx.fillRect(0, 0, w, h);
    }

    if (store.timeOfDay === 'evening') {
      this.lightGfx.fillStyle(0xFF6B35, 0.06);
      this.lightGfx.fillRect(0, 0, w, h);
    }

    if (store.weather === 'fog') {
      for (let i = 0; i < 5; i++) {
        const fogX = Math.sin(this.globalTime * 0.3 + i * 2) * 100 + w * (i / 5);
        const fogY = h * 0.5 + Math.sin(this.globalTime * 0.2 + i) * 30;
        this.lightGfx.fillStyle(0xCCCCCC, 0.08);
        this.lightGfx.fillEllipse(fogX, fogY, 200, 80);
      }
    }

    if (store.timeOfDay === 'evening' || store.timeOfDay === 'morning') {
      const godRayAlpha = store.timeOfDay === 'evening' ? 0.04 : 0.03;
      for (let i = 0; i < 4; i++) {
        const rx = w * 0.7 + i * 40;
        const angle = -0.3 + i * 0.08;
        this.lightGfx.fillStyle(0xFFD700, godRayAlpha);
        this.lightGfx.beginPath();
        this.lightGfx.moveTo(rx, 0);
        this.lightGfx.lineTo(rx - 30 + Math.tan(angle) * h, h);
        this.lightGfx.lineTo(rx + 50 + Math.tan(angle) * h, h);
        this.lightGfx.lineTo(rx + 20, 0);
        this.lightGfx.closePath();
        this.lightGfx.fillPath();
      }
    }

    const vignette = 0.25;
    this.lightGfx.fillStyle(0x000000, vignette);
    const gradient_steps = 8;
    for (let i = 0; i < gradient_steps; i++) {
      const t = i / gradient_steps;
      const margin = t * 60;
      const alpha = vignette * (1 - t);
      this.lightGfx.fillStyle(0x000000, alpha * 0.3);
      this.lightGfx.fillRect(0, 0, margin, h);
      this.lightGfx.fillRect(w - margin, 0, margin, h);
      this.lightGfx.fillRect(0, 0, w, margin);
      this.lightGfx.fillRect(0, h - margin, w, margin);
    }
  }

  private drawLocationMarkers(store: ReturnType<typeof useGameStore.getState>) {
    const loc = LOCATIONS.find(l => l.id === store.currentLocation);
    if (!loc) return;

    for (const conn of loc.connections) {
      const x = conn.x - this.cameraX;
      const y = conn.y - this.cameraY;
      const bounce = Math.sin(this.globalTime * 2) * 3;
      const targetLoc = LOCATIONS.find(l => l.id === conn.targetId);
      const locked = conn.targetId === 'greenhouse' && !store.unlockedLocations.includes('greenhouse');

      this.uiGfx.fillStyle(locked ? 0x666666 : 0xFFD700, 0.6);
      this.uiGfx.fillTriangle(x - 8, y + bounce + 5, x + 8, y + bounce + 5, x, y + bounce - 5);
      this.uiGfx.fillStyle(locked ? 0x888888 : 0xFFE4B5, 0.4);
      this.uiGfx.fillCircle(x, y + bounce, 18);

      if (targetLoc) {
        const arrowDir = conn.direction;
        const ax = arrowDir === 'east' ? 6 : arrowDir === 'west' ? -6 : 0;
        const ay = arrowDir === 'south' ? 6 : arrowDir === 'north' ? -6 : 0;
        this.uiGfx.fillStyle(0xFFFFFF, 0.7);
        this.uiGfx.fillTriangle(
          x + ax * 1.5, y + bounce + ay * 1.5,
          x + ax * 0.3 - ay * 0.6, y + bounce + ay * 0.3 + ax * 0.6,
          x + ax * 0.3 + ay * 0.6, y + bounce + ay * 0.3 - ax * 0.6
        );
      }
    }
  }

  private drawTransition(w: number, h: number, store: ReturnType<typeof useGameStore.getState>) {
    if (store.isTransitioning) {
      this.uiGfx.fillStyle(0x000000, 0.7);
      this.uiGfx.fillRect(0, 0, w, h);
    }
  }
}
