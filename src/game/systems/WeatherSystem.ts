import Phaser from 'phaser';
import type { Weather } from '../types';
import { WEATHER_CONFIG } from '../constants';
import { useGameStore } from '../../store/gameStore';
import { audioManager } from './AudioManager';

export class WeatherSystem {
  private scene: Phaser.Scene;
  private rainEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;
  private fogOverlay!: Phaser.GameObjects.Rectangle;
  private lightningOverlay!: Phaser.GameObjects.Rectangle;
  private windLeaves!: Phaser.GameObjects.Particles.ParticleEmitter;
  private currentWeather: Weather = 'clear';
  private weatherTimer = 0;
  private weatherChangeCooldown = 120000;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  create() {
    const cam = this.scene.cameras.main;
    const W = cam.width;
    const H = cam.height;

    this.fogOverlay = this.scene.add.rectangle(W / 2, H / 2, W, H, 0xC0C0C0, 0)
      .setScrollFactor(0).setDepth(95);

    this.lightningOverlay = this.scene.add.rectangle(W / 2, H / 2, W, H, 0xFFFFFF, 0)
      .setScrollFactor(0).setDepth(97);

    const rainParticle = this.scene.add.graphics();
    rainParticle.fillStyle(0x89CFF0, 0.8);
    rainParticle.fillRect(0, 0, 1, 8);
    rainParticle.generateTexture('rain_drop', 1, 8);
    rainParticle.destroy();

    const leafParticle = this.scene.add.graphics();
    leafParticle.fillStyle(0x7CB342, 0.9);
    leafParticle.fillEllipse(0, 0, 8, 5);
    leafParticle.generateTexture('leaf_particle', 8, 5);
    leafParticle.destroy();

    this.rainEmitter = this.scene.add.particles(0, 0, 'rain_drop', {
      x: { min: -50, max: W + 50 },
      y: { min: -20, max: 0 },
      speedX: { min: 30, max: 80 },
      speedY: { min: 400, max: 700 },
      lifespan: { min: 600, max: 900 },
      scale: { min: 0.7, max: 1.3 },
      alpha: { start: 0.8, end: 0 },
      quantity: 0,
      frequency: 20,
      gravityY: 0,
    }).setScrollFactor(0).setDepth(96);

    this.windLeaves = this.scene.add.particles(0, 0, 'leaf_particle', {
      x: { min: -50, max: W + 50 },
      y: { min: 100, max: H - 100 },
      speedX: { min: 80, max: 200 },
      speedY: { min: -30, max: 30 },
      lifespan: { min: 2000, max: 4000 },
      scale: { min: 0.6, max: 1.2 },
      rotate: { min: 0, max: 360 },
      alpha: { start: 0.8, end: 0 },
      quantity: 0,
      frequency: 200,
    }).setScrollFactor(0).setDepth(94);
  }

  update(delta: number) {
    this.weatherTimer += delta;
    if (this.weatherTimer >= this.weatherChangeCooldown) {
      this.weatherTimer = 0;
      this.randomWeatherChange();
    }

    const weather = useGameStore.getState().weather;
    if (weather !== this.currentWeather) {
      this.applyWeather(weather);
      this.currentWeather = weather;
    }

    if (this.currentWeather === 'storm' && Math.random() < 0.001 * delta) {
      this.triggerLightning();
    }
  }

  applyWeather(weather: Weather) {
    const config = WEATHER_CONFIG[weather];

    this.rainEmitter.setQuantity(weather === 'rain' ? 3 : weather === 'storm' ? 8 : 0);
    this.windLeaves.setQuantity(weather === 'windy' ? 2 : weather === 'storm' ? 4 : 0);

    const fogAlpha = config.fogDensity * 0.5;
    this.fogOverlay.setAlpha(fogAlpha);

    if (weather === 'rain' || weather === 'storm') {
      audioManager.playRain(config.rainIntensity);
    } else {
      audioManager.stopRain();
    }

    if (weather === 'clear') {
      audioManager.playCrickets();
    }
  }

  private triggerLightning() {
    this.lightningOverlay.setAlpha(0.8);
    audioManager.playThunder();
    this.scene.time.delayedCall(80, () => {
      this.lightningOverlay.setAlpha(0);
      this.scene.time.delayedCall(100, () => {
        this.lightningOverlay.setAlpha(0.4);
        this.scene.time.delayedCall(60, () => {
          this.lightningOverlay.setAlpha(0);
        });
      });
    });
  }

  private randomWeatherChange() {
    const weathers: Weather[] = ['clear', 'clear', 'clear', 'cloudy', 'cloudy', 'rain', 'fog', 'windy'];
    const season = useGameStore.getState().season;
    if (season === 'summer') weathers.push('storm');
    if (season === 'autumn') weathers.push('fog', 'fog', 'rain');
    if (season === 'winter') weathers.push('fog', 'cloudy');

    const newWeather = weathers[Math.floor(Math.random() * weathers.length)];
    useGameStore.getState().setWeather(newWeather);
  }

  setWeather(w: Weather) {
    useGameStore.getState().setWeather(w);
  }
}
