import Phaser from 'phaser';
import type { TimeOfDay, Season } from '../types';
import { TIME_COLORS } from '../constants';
import { useGameStore } from '../../store/gameStore';

const GAME_MINUTES_PER_REAL_SECOND = 2;

export class TimeSystem {
  private scene: Phaser.Scene;
  private elapsed = 0;
  private skyOverlay!: Phaser.GameObjects.Rectangle;
  private sunMoon!: Phaser.GameObjects.Arc;
  private stars: Phaser.GameObjects.Arc[] = [];
  private worldWidth: number;
  private worldHeight: number;

  constructor(scene: Phaser.Scene, worldWidth: number, worldHeight: number) {
    this.scene = scene;
    this.worldWidth = worldWidth;
    this.worldHeight = worldHeight;
  }

  create() {
    const cam = this.scene.cameras.main;
    const W = cam.width;
    const H = cam.height;

    this.sunMoon = this.scene.add.arc(W / 2, 0, 30)
      .setFillStyle(0xFFE87C)
      .setScrollFactor(0)
      .setDepth(1);

    this.skyOverlay = this.scene.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0)
      .setScrollFactor(0)
      .setDepth(98);

    for (let i = 0; i < 80; i++) {
      const star = this.scene.add.arc(
        Math.random() * W,
        Math.random() * H * 0.6,
        Math.random() * 1.5 + 0.5
      ).setFillStyle(0xFFFFFF, Math.random())
       .setScrollFactor(0)
       .setDepth(2)
       .setAlpha(0);
      this.stars.push(star);
    }
  }

  update(delta: number) {
    this.elapsed += delta;
    const minutesAdvanced = (delta / 1000) * GAME_MINUTES_PER_REAL_SECOND;
    const store = useGameStore.getState();
    const newTime = store.time + minutesAdvanced;
    useGameStore.setState({ time: newTime >= 1440 ? newTime - 1440 : newTime });
    if (newTime >= 1440) useGameStore.getState().advanceDay();
    this.updateVisuals(store.time);
  }

  private updateVisuals(gameMinutes: number) {
    const hours = gameMinutes / 60;
    const tod = this.getTimeOfDay(hours);
    const config = TIME_COLORS[tod];
    if (!config) return;

    this.skyOverlay.setFillStyle(0x000022, config.alpha * 0.6);

    const angle = ((gameMinutes / 1440) * Math.PI * 2) - Math.PI / 2;
    const cam = this.scene.cameras.main;
    const cx = cam.width / 2;
    const radius = cam.height * 0.65;
    const sx = cx + Math.cos(angle) * radius;
    const sy = cam.height * 0.4 + Math.sin(angle) * radius;
    this.sunMoon.setPosition(sx, sy);

    const isNight = hours >= 20 || hours < 6;
    const nightAlpha = isNight ? Math.min(1, config.alpha * 1.2) : 0;
    this.sunMoon.setFillStyle(isNight ? 0xE8E8FF : 0xFFE87C);
    this.stars.forEach(s => s.setAlpha(nightAlpha * (0.3 + Math.random() * 0.7) > 0.5 ? nightAlpha : 0));
  }

  getTimeOfDay(hours?: number): TimeOfDay {
    const h = hours !== undefined ? hours : useGameStore.getState().time / 60;
    if (h >= 5 && h < 7)  return 'dawn';
    if (h >= 7 && h < 10) return 'morning';
    if (h >= 10 && h < 13) return 'noon';
    if (h >= 13 && h < 17) return 'afternoon';
    if (h >= 17 && h < 19) return 'golden';
    if (h >= 19 && h < 21) return 'dusk';
    if (h >= 21 && h < 24) return 'night';
    return 'deep_night';
  }

  getFormattedTime(): string {
    const minutes = Math.floor(useGameStore.getState().time);
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  getSkyGradient(): { top: number; bottom: number } {
    const hours = useGameStore.getState().time / 60;
    if (hours >= 5 && hours < 7)   return { top: 0xFF6B35, bottom: 0xFFB347 };
    if (hours >= 7 && hours < 10)  return { top: 0x87CEEB, bottom: 0xC8E6C9 };
    if (hours >= 10 && hours < 17) return { top: 0x4FC3F7, bottom: 0x81D4FA };
    if (hours >= 17 && hours < 19) return { top: 0xFF9A3C, bottom: 0xFFCC80 };
    if (hours >= 19 && hours < 21) return { top: 0x7B3F8C, bottom: 0xAB6CC8 };
    if (hours >= 21 && hours < 24) return { top: 0x1A237E, bottom: 0x283593 };
    return { top: 0x0A0A2E, bottom: 0x0D0D40 };
  }

  getSeasonColors(): { grass: number; leaves: number; sky_tint: number } {
    const season = useGameStore.getState().season;
    switch (season) {
      case 'summer':  return { grass: 0x7CB342, leaves: 0x66BB6A, sky_tint: 0x4FC3F7 };
      case 'autumn':  return { grass: 0xA5781C, leaves: 0xFF8F00, sky_tint: 0x78909C };
      case 'winter':  return { grass: 0xE0E0E0, leaves: 0xECEFF1, sky_tint: 0x90A4AE };
      case 'spring':  return { grass: 0x8BC34A, leaves: 0xAED581, sky_tint: 0x81D4FA };
    }
  }
}
