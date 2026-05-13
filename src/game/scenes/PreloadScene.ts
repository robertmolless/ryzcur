import Phaser from 'phaser';
import { SCENE_KEYS } from '../constants';

export class PreloadScene extends Phaser.Scene {
  private progressBar!: Phaser.GameObjects.Graphics;
  private progressBg!: Phaser.GameObjects.Graphics;
  private loadingText!: Phaser.GameObjects.Text;

  constructor() { super({ key: SCENE_KEYS.PRELOAD }); }

  preload() {
    this.createLoadingScreen();
    this.generateAllTextures();

    this.load.on('progress', (v: number) => {
      this.progressBar.clear();
      this.progressBar.fillStyle(0xFF8C32, 1);
      this.progressBar.fillRoundedRect(
        this.cameras.main.width / 2 - 200, this.cameras.main.height / 2 + 20,
        400 * v, 20, 5
      );
      this.loadingText.setText(`Загрузка мира... ${Math.floor(v * 100)}%`);
    });
  }

  private createLoadingScreen() {
    const W = this.cameras.main.width;
    const H = this.cameras.main.height;
    const cx = W / 2;
    const cy = H / 2;

    const bg = this.add.rectangle(cx, cy, W, H, 0x0A0A1A);

    for (let i = 0; i < 60; i++) {
      const star = this.add.arc(Math.random() * W, Math.random() * H * 0.6,
        Math.random() * 1.5 + 0.3, 0, 360, false, 0xFFFFFF, Math.random() * 0.8 + 0.2);
      this.tweens.add({
        targets: star, alpha: { from: 0.1, to: 0.9 },
        duration: 1000 + Math.random() * 2000,
        ease: 'Sine.easeInOut', yoyo: true, repeat: -1, delay: Math.random() * 2000
      });
    }

    this.add.text(cx, cy - 80, '🐱', { fontSize: '48px' }).setOrigin(0.5);
    this.tweens.add({
      targets: this.add.text(cx, cy - 40, 'Рыжик', { fontSize: '28px', color: '#FF8C32', fontStyle: 'bold' }).setOrigin(0.5),
      alpha: { from: 0.5, to: 1 }, duration: 1500, ease: 'Sine.easeInOut', yoyo: true, repeat: -1
    });
    this.add.text(cx, cy - 10, 'и Старый Загородный Дом', { fontSize: '14px', color: '#FFB347' }).setOrigin(0.5);

    this.progressBg = this.add.graphics();
    this.progressBg.fillStyle(0x333333, 0.8);
    this.progressBg.fillRoundedRect(cx - 202, cy + 18, 404, 24, 6);

    this.progressBar = this.add.graphics();
    this.loadingText = this.add.text(cx, cy + 55, 'Загрузка мира...', {
      fontSize: '12px', color: '#CCCCCC'
    }).setOrigin(0.5);
  }

  private generateAllTextures() {
    this.generateSparkleParticle();
    this.generateFireflyTexture();
    this.generateRainDrop();
    this.generateLeafTexture();
    this.generateMagicParticle();
  }

  private generateSparkleParticle() {
    const g = this.add.graphics();
    g.fillStyle(0xFFD700, 1);
    g.fillCircle(4, 4, 4);
    g.generateTexture('sparkle_particle', 8, 8);
    g.destroy();
  }

  private generateFireflyTexture() {
    const g = this.add.graphics();
    g.fillStyle(0xCCFF00, 1);
    g.fillCircle(5, 5, 5);
    g.generateTexture('firefly_glow', 10, 10);
    g.destroy();
  }

  private generateRainDrop() {
    const g = this.add.graphics();
    g.fillStyle(0x89CFF0, 0.7);
    g.fillRect(0, 0, 2, 10);
    g.generateTexture('rain_drop', 2, 10);
    g.destroy();
  }

  private generateLeafTexture() {
    const g = this.add.graphics();
    g.fillStyle(0x66BB6A, 0.9);
    g.fillEllipse(5, 4, 10, 7);
    g.generateTexture('leaf_particle', 10, 8);
    g.destroy();
  }

  private generateMagicParticle() {
    const g = this.add.graphics();
    g.fillStyle(0xCE93D8, 1);
    g.fillCircle(5, 5, 5);
    g.generateTexture('magic_particle', 10, 10);
    g.destroy();
  }

  create() {
    this.time.delayedCall(800, () => {
      this.scene.start(SCENE_KEYS.MENU);
    });
  }
}
