import Phaser from 'phaser';
import { SCENE_KEYS } from '../constants';
import { audioManager } from '../systems/AudioManager';

export class MenuScene extends Phaser.Scene {
  private catContainer!: Phaser.GameObjects.Container;
  private fireflies: Phaser.GameObjects.Arc[] = [];
  private titleGlow!: Phaser.GameObjects.Text;
  private animTimer = 0;

  constructor() { super({ key: SCENE_KEYS.MENU }); }

  create() {
    const W = this.cameras.main.width;
    const H = this.cameras.main.height;
    const cx = W / 2;
    const cy = H / 2;

    this.createBackground(W, H);
    this.createHouseScene(W, H);
    this.createTitle(cx, cy);
    this.createMenuButtons(cx, cy);
    this.createCat(cx - 80, H - 120);
    this.createFireflies(W, H);
    this.createParticles(W, H);
    this.createCopyrightText(cx, H);

    audioManager.init();
    audioManager.playMusicTrack('night_ambient');
  }

  private createBackground(W: number, H: number) {
    const skyGradient = this.add.graphics();
    skyGradient.fillGradientStyle(0x0A0A2E, 0x0A0A2E, 0x1A237E, 0x283593, 1);
    skyGradient.fillRect(0, 0, W, H);

    for (let i = 0; i < 120; i++) {
      const x = Math.random() * W;
      const y = Math.random() * H * 0.7;
      const size = Math.random() * 1.8 + 0.3;
      const star = this.add.arc(x, y, size, 0, 360, false, 0xFFFFFF, Math.random() * 0.8 + 0.2);
      if (Math.random() > 0.7) {
        this.tweens.add({
          targets: star, alpha: { from: 0.2, to: 1 },
          duration: 1000 + Math.random() * 3000,
          ease: 'Sine.easeInOut', yoyo: true, repeat: -1, delay: Math.random() * 3000
        });
      }
    }

    const fog = this.add.graphics();
    fog.fillStyle(0x1A237E, 0.15);
    fog.fillRect(0, H * 0.55, W, H * 0.2);

    const groundGrad = this.add.graphics();
    groundGrad.fillGradientStyle(0x1B5E20, 0x1B5E20, 0x0A0A1A, 0x0A0A1A, 0.8);
    groundGrad.fillRect(0, H * 0.68, W, H * 0.32);

    for (let i = 0; i < 15; i++) {
      const tx = Math.random() * W;
      const ty = H * 0.7 + Math.random() * H * 0.1;
      this.drawMenuTree(tx, ty, 0.4 + Math.random() * 0.6);
    }
  }

  private drawMenuTree(x: number, y: number, scale: number) {
    const g = this.add.graphics().setDepth(1);
    g.fillStyle(0x263238, 0.9);
    g.fillRect(x - 6 * scale, y - 50 * scale, 12 * scale, 50 * scale);
    g.fillStyle(0x1B3A2A, 0.85);
    g.fillTriangle(x, y - 90 * scale, x - 35 * scale, y - 45 * scale, x + 35 * scale, y - 45 * scale);
    g.fillTriangle(x, y - 120 * scale, x - 25 * scale, y - 80 * scale, x + 25 * scale, y - 80 * scale);
  }

  private createHouseScene(W: number, H: number) {
    const hy = H * 0.6;
    const hx = W * 0.5;
    const g = this.add.graphics().setDepth(2);

    g.fillStyle(0x2D2520, 1);
    g.fillRect(hx - 130, hy - 100, 260, 100);
    g.fillStyle(0x1A1512, 1);
    g.fillTriangle(hx - 150, hy - 100, hx, hy - 180, hx + 150, hy - 100);
    g.fillStyle(0x1E1512, 0.8);
    g.fillRect(hx - 25, hy, 50, 80);

    const winColors = [0xFFE082, 0xFFD54F, 0xFFF8E1];
    [[hx - 80, hy - 70], [hx + 30, hy - 70], [hx - 80, hy - 30], [hx + 30, hy - 30]].forEach(([wx, wy], i) => {
      const winG = this.add.graphics().setDepth(3);
      winG.fillStyle(winColors[i % winColors.length], 0.7);
      winG.fillRect(wx, wy, 40, 32);
      winG.lineStyle(2, 0x8B7355, 0.8);
      winG.strokeRect(wx, wy, 40, 32);
      this.tweens.add({
        targets: winG, alpha: { from: 0.6, to: 1 },
        duration: 2000 + Math.random() * 3000, ease: 'Sine.easeInOut',
        yoyo: true, repeat: -1, delay: Math.random() * 2000
      });
    });

    const porch = this.add.graphics().setDepth(3);
    porch.fillStyle(0x3E2723, 0.9);
    porch.fillRect(hx - 80, hy, 160, 15);
    for (let i = 0; i < 4; i++) {
      porch.fillStyle(0x4E342E, 0.8);
      porch.fillRect(hx - 55 + i * 40, hy, 8, 80);
    }

    for (let i = 0; i < 3; i++) {
      const lampX = hx - 100 + i * 100;
      const lampY = hy - 120;
      const lampG = this.add.graphics().setDepth(4);
      lampG.fillStyle(0x8B7355, 1);
      lampG.fillRect(lampX - 2, lampY - 40, 4, 40);
      lampG.fillStyle(0xFFD54F, 0.8);
      lampG.fillCircle(lampX, lampY - 40, 8);
      const glow = this.add.arc(lampX, lampY - 40, 25, 0, 360, false, 0xFFD54F, 0.15).setDepth(3);
      this.tweens.add({
        targets: glow, alpha: { from: 0.1, to: 0.3 },
        duration: 1500, ease: 'Sine.easeInOut', yoyo: true, repeat: -1, delay: i * 500
      });
    }
  }

  private createTitle(cx: number, cy: number) {
    const titleContainer = this.add.container(cx, cy * 0.45).setDepth(10);

    const titleBg = this.add.rectangle(0, 0, 500, 110, 0x000000, 0.4);
    titleBg.setStrokeStyle(1, 0xFF8C32, 0.3);

    const titleMain = this.add.text(0, -20, '🐱 Рыжик', {
      fontSize: '38px',
      color: '#FF8C32',
      fontStyle: 'bold',
      stroke: '#2D1B00',
      strokeThickness: 4,
      shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 8, fill: true }
    }).setOrigin(0.5);

    const titleSub = this.add.text(0, 22, 'и Старый Загородный Дом', {
      fontSize: '16px',
      color: '#FFB347',
      fontStyle: 'italic',
      stroke: '#000',
      strokeThickness: 2
    }).setOrigin(0.5);

    const tagline = this.add.text(0, 46, '✦ Уютная история о доме и тёплых воспоминаниях ✦', {
      fontSize: '9px',
      color: '#CCAA66',
    }).setOrigin(0.5).setAlpha(0.8);

    titleContainer.add([titleBg, titleMain, titleSub, tagline]);
    this.tweens.add({
      targets: titleContainer, y: cy * 0.45 - 5,
      duration: 3000, ease: 'Sine.easeInOut', yoyo: true, repeat: -1
    });

    this.tweens.add({
      targets: titleMain, alpha: { from: 0.85, to: 1 },
      duration: 2000, ease: 'Sine.easeInOut', yoyo: true, repeat: -1
    });
  }

  private createMenuButtons(cx: number, cy: number) {
    const buttonConfigs = [
      { text: '▶   Начать историю', color: 0xFF8C32, hoverColor: 0xFFAA55, action: () => this.startGame() },
      { text: '♪   Настройки звука', color: 0x5C8BE8, hoverColor: 0x7AABFF, action: () => this.toggleAudio() },
    ];

    buttonConfigs.forEach((btn, i) => {
      const y = cy * 0.75 + i * 60;
      const btnBg = this.add.rectangle(cx, y, 220, 44, btn.color, 0.9)
        .setInteractive({ useHandCursor: true })
        .setDepth(10)
        .setStrokeStyle(2, 0xFFFFFF, 0.3);

      const btnBgGlow = this.add.rectangle(cx, y, 224, 48, 0xFFFFFF, 0.05).setDepth(9);

      const btnText = this.add.text(cx, y, btn.text, {
        fontSize: '15px', color: '#FFFFFF', fontStyle: 'bold',
        stroke: '#000000', strokeThickness: 2
      }).setOrigin(0.5).setDepth(11);

      btnBg.on('pointerover', () => {
        this.tweens.add({ targets: btnBg, scaleX: 1.05, scaleY: 1.05, duration: 100 });
        this.tweens.add({ targets: btnBgGlow, alpha: 0.15, duration: 100 });
        btnBg.setFillStyle(btn.hoverColor, 0.95);
      });
      btnBg.on('pointerout', () => {
        this.tweens.add({ targets: btnBg, scaleX: 1, scaleY: 1, duration: 100 });
        this.tweens.add({ targets: btnBgGlow, alpha: 0.05, duration: 100 });
        btnBg.setFillStyle(btn.color, 0.9);
      });
      btnBg.on('pointerdown', () => {
        this.tweens.add({ targets: [btnBg, btnText], scaleX: 0.95, scaleY: 0.95, duration: 80, yoyo: true });
        this.time.delayedCall(80, btn.action);
      });

      this.tweens.add({
        targets: [btnBg, btnText], y: y - 5,
        duration: 2500 + i * 300, ease: 'Sine.easeInOut', yoyo: true, repeat: -1, delay: i * 400
      });
    });

    const hint = this.add.text(cx, cy * 0.75 + 125, 'WASD / Стрелки — движение    E — взаимодействие    Q — журнал квестов    I — инвентарь', {
      fontSize: '9px', color: '#888888', align: 'center'
    }).setOrigin(0.5).setDepth(10);
  }

  private createCat(x: number, y: number) {
    this.catContainer = this.add.container(x, y).setDepth(5);
    const g = this.add.graphics();
    g.fillStyle(0xFF8C32);
    g.fillCircle(0, 2, 14);
    g.fillStyle(0xFF8C32);
    g.fillCircle(0, -12, 11);
    g.fillStyle(0xFFFFFF);
    g.fillCircle(0, -10, 6);
    g.fillStyle(0x8B6914);
    g.fillCircle(-4, -14, 3);
    g.fillCircle(4, -14, 3);
    g.fillStyle(0x000000);
    g.fillCircle(-4, -14, 1.5);
    g.fillCircle(4, -14, 1.5);
    g.fillStyle(0xFF69B4);
    g.fillCircle(0, -9, 2);
    g.fillStyle(0xFF8C32);
    g.fillTriangle(-8, -22, -1, -27, -14, -27);
    g.fillTriangle(8, -22, 1, -27, 14, -27);
    g.fillStyle(0xFF8C32);
    g.fillCircle(18, 8, 7);
    this.catContainer.add(g);

    this.tweens.add({
      targets: this.catContainer, y: y - 8,
      duration: 2000, ease: 'Sine.easeInOut', yoyo: true, repeat: -1
    });

    this.tweens.add({
      targets: g, angle: { from: -5, to: 5 },
      duration: 3000, ease: 'Sine.easeInOut', yoyo: true, repeat: -1
    });
  }

  private createFireflies(W: number, H: number) {
    for (let i = 0; i < 20; i++) {
      const ff = this.add.arc(Math.random() * W, H * 0.55 + Math.random() * H * 0.4,
        2 + Math.random() * 2, 0, 360, false, 0xCCFF00).setDepth(6).setAlpha(0);
      this.fireflies.push(ff);

      const startDelay = Math.random() * 5000;
      this.time.delayedCall(startDelay, () => {
        this.tweens.add({
          targets: ff, alpha: { from: 0, to: 0.9 },
          duration: 500, ease: 'Power2', onComplete: () => {
            this.tweens.add({
              targets: ff,
              x: ff.x + (Math.random() - 0.5) * 100,
              y: ff.y + (Math.random() - 0.5) * 60,
              alpha: 0, duration: 2000 + Math.random() * 3000,
              ease: 'Sine.easeInOut', onComplete: () => {
                ff.setPosition(Math.random() * W, H * 0.55 + Math.random() * H * 0.4);
              }
            });
          }
        });
      });
    }
  }

  private createParticles(W: number, H: number) {
    for (let i = 0; i < 8; i++) {
      const leaf = this.add.text(Math.random() * W, Math.random() * H * 0.4 + H * 0.1,
        ['🍃', '🍂', '✨'][Math.floor(Math.random() * 3)], { fontSize: '12px' })
        .setDepth(4).setAlpha(0.6);
      this.tweens.add({
        targets: leaf,
        x: leaf.x + (Math.random() - 0.5) * 200,
        y: leaf.y + H * 0.8,
        angle: Math.random() * 360,
        alpha: 0,
        duration: 6000 + Math.random() * 6000,
        ease: 'Linear',
        delay: Math.random() * 5000,
        onComplete: () => {
          leaf.setPosition(Math.random() * W, -50);
          leaf.setAlpha(0.6);
          this.tweens.add({
            targets: leaf, y: leaf.y + H + 100, alpha: 0,
            duration: 8000, ease: 'Linear', repeat: -1
          });
        }
      });
    }
  }

  private createCopyrightText(cx: number, H: number) {
    this.add.text(cx, H - 20, '© 2024 Ryzhik Game — Made with ❤️ for cozy indie gaming', {
      fontSize: '8px', color: '#555555'
    }).setOrigin(0.5).setDepth(10);
  }

  private startGame() {
    this.cameras.main.fadeOut(800, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      audioManager.stopMusic();
      this.scene.start(SCENE_KEYS.GAME);
      this.scene.start(SCENE_KEYS.UI);
    });
  }

  private toggleAudio() {
    audioManager.resume();
  }

  update(time: number, delta: number) {
    this.animTimer += delta;
  }
}
