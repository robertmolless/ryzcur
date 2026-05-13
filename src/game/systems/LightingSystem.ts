import Phaser from 'phaser';
import { useGameStore } from '../../store/gameStore';

interface LightSource {
  x: number;
  y: number;
  radius: number;
  color: number;
  intensity: number;
  flicker: boolean;
  flickerSpeed: number;
  circle?: Phaser.GameObjects.Arc;
}

export class LightingSystem {
  private scene: Phaser.Scene;
  private darkOverlay!: Phaser.GameObjects.RenderTexture;
  private lightSources: LightSource[] = [];
  private fireflyEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;
  private elapsed = 0;
  private worldWidth: number;

  constructor(scene: Phaser.Scene, worldWidth: number) {
    this.scene = scene;
    this.worldWidth = worldWidth;
  }

  create() {
    const cam = this.scene.cameras.main;
    const W = cam.width;
    const H = cam.height;

    this.darkOverlay = this.scene.add.renderTexture(0, 0, W, H)
      .setScrollFactor(0)
      .setDepth(90)
      .setBlendMode(Phaser.BlendModes.MULTIPLY);

    const ffParticle = this.scene.add.graphics();
    ffParticle.fillStyle(0xCCFF00, 1);
    ffParticle.fillCircle(3, 3, 3);
    ffParticle.generateTexture('firefly_glow', 6, 6);
    ffParticle.destroy();

    this.fireflyEmitter = this.scene.add.particles(0, 0, 'firefly_glow', {
      x: { min: 400, max: this.worldWidth - 400 },
      y: { min: 400, max: 650 },
      speedX: { min: -20, max: 20 },
      speedY: { min: -15, max: 15 },
      lifespan: { min: 3000, max: 7000 },
      scale: { min: 0.3, max: 1.2 },
      alpha: { start: 0.9, end: 0 },
      tint: [0xCCFF00, 0xFFFF00, 0xAAFF88],
      quantity: 0,
      blendMode: Phaser.BlendModes.ADD,
    }).setDepth(89);

    this.addDefaultLights();
  }

  private addDefaultLights() {
    this.lightSources = [
      { x: 680, y: 600, radius: 120, color: 0xFFD54F, intensity: 0.7, flicker: false, flickerSpeed: 0 },
      { x: 900, y: 640, radius: 80, color: 0xFF8C32, intensity: 0.9, flicker: true, flickerSpeed: 5 },
      { x: 500, y: 580, radius: 100, color: 0xFFE082, intensity: 0.5, flicker: false, flickerSpeed: 0 },
      { x: 1200, y: 600, radius: 90, color: 0xFFD54F, intensity: 0.6, flicker: false, flickerSpeed: 0 },
      { x: 1600, y: 630, radius: 70, color: 0xFFB347, intensity: 0.5, flicker: false, flickerSpeed: 0 },
    ];
  }

  addLight(x: number, y: number, radius: number, color: number = 0xFFD54F, flicker = false) {
    this.lightSources.push({ x, y, radius, color, intensity: 0.8, flicker, flickerSpeed: 3 + Math.random() * 5 });
  }

  update(delta: number) {
    this.elapsed += delta;
    const hours = useGameStore.getState().time / 60;
    const isNight = hours >= 20 || hours < 6;
    const isDusk = hours >= 18 || hours < 7;

    let darkness = 0;
    if (hours >= 6 && hours < 8)  darkness = Phaser.Math.Linear(0.6, 0, (hours - 6) / 2);
    else if (hours >= 8 && hours < 18) darkness = 0;
    else if (hours >= 18 && hours < 20) darkness = Phaser.Math.Linear(0, 0.5, (hours - 18) / 2);
    else if (hours >= 20 && hours < 22) darkness = Phaser.Math.Linear(0.5, 0.82, (hours - 20) / 2);
    else if (hours >= 22) darkness = 0.82;
    else darkness = 0.85;

    this.darkOverlay.clear();
    if (darkness > 0.05) {
      this.darkOverlay.fill(0x000033, darkness);
      if (isDusk || isNight) this.renderLights();
    }

    this.fireflyEmitter.setQuantity(isNight ? 1 : 0);
    if (this.fireflyEmitter.active) {
      const cam = this.scene.cameras.main;
      this.fireflyEmitter.setPosition(
        cam.scrollX + 200,
        cam.scrollY + 300
      );
    }
  }

  private renderLights() {
    const cam = this.scene.cameras.main;
    this.lightSources.forEach(light => {
      const screenX = light.x - cam.scrollX;
      const screenY = light.y - cam.scrollY;
      const flicker = light.flicker
        ? 0.85 + 0.15 * Math.sin(this.elapsed * 0.001 * light.flickerSpeed + light.x)
        : 1;
      const r = light.radius * flicker;

      const gradient = this.scene.add.graphics();
      gradient.fillStyle(light.color, light.intensity * flicker * 0.4);
      gradient.fillCircle(screenX, screenY, r);
      this.darkOverlay.draw(gradient, 0, 0, 1, Phaser.BlendModes.ERASE);
      gradient.destroy();
    });
  }
}
