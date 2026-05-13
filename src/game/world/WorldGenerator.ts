import Phaser from 'phaser';
import { PALETTE, WORLD_WIDTH, WORLD_HEIGHT } from '../constants';

export class WorldGenerator {
  private scene: Phaser.Scene;
  private graphics!: Phaser.GameObjects.Graphics;
  private parallaxLayers: Phaser.GameObjects.Graphics[] = [];
  private animatedObjects: Array<{ obj: Phaser.GameObjects.Graphics; baseY: number; phase: number }> = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  create() {
    this.createParallaxBackground();
    this.createGround();
    this.createHouse();
    this.createYard();
    this.createForest();
    this.createPond();
    this.createGreenhouse();
    this.createInteractiveObjects();
  }

  update(delta: number) {
    const t = this.scene.time.now * 0.001;
    this.animatedObjects.forEach(({ obj, baseY, phase }) => {
      if (obj && obj.active) {
        obj.y = baseY + Math.sin(t * 0.8 + phase) * 3;
      }
    });
  }

  private createParallaxBackground() {
    const W = WORLD_WIDTH;
    const H = WORLD_HEIGHT;

    const bg = this.scene.add.graphics().setDepth(-20).setScrollFactor(0.1);
    const gradient = bg.fillGradientStyle(0x87CEEB, 0x87CEEB, 0xC8E6C9, 0xC8E6C9, 1);
    bg.fillRect(0, 0, W * 2, H);

    const farTrees = this.scene.add.graphics().setDepth(-15).setScrollFactor(0.2);
    for (let x = 0; x < W * 2; x += 80) {
      this.drawSilhouetteTree(farTrees, x, H * 0.5, 0.5 + Math.random() * 0.5, 0x2D5A27);
    }

    const midTrees = this.scene.add.graphics().setDepth(-10).setScrollFactor(0.4);
    for (let x = 0; x < W * 2; x += 120) {
      if (Math.random() > 0.3) {
        this.drawSilhouetteTree(midTrees, x + Math.random() * 60, H * 0.55, 0.6 + Math.random() * 0.7, 0x3D7A37);
      }
    }

    const distantHills = this.scene.add.graphics().setDepth(-18).setScrollFactor(0.15);
    distantHills.fillStyle(0x5C9E57, 0.4);
    for (let x = 0; x < W * 2; x += 300) {
      distantHills.fillEllipse(x, H * 0.52, 400 + Math.random() * 200, 150 + Math.random() * 80);
    }

    this.parallaxLayers.push(bg, farTrees, midTrees, distantHills);
  }

  private drawSilhouetteTree(g: Phaser.GameObjects.Graphics, x: number, baseY: number, scale: number, color: number) {
    const h = 120 * scale;
    const w = 60 * scale;
    g.fillStyle(color, 0.8);
    g.fillRect(x - 5 * scale, baseY - h * 0.4, 10 * scale, h * 0.4);
    g.fillTriangle(x, baseY - h, x - w / 2, baseY - h * 0.45, x + w / 2, baseY - h * 0.45);
    g.fillTriangle(x, baseY - h * 0.7, x - w * 0.65, baseY - h * 0.25, x + w * 0.65, baseY - h * 0.25);
    g.fillTriangle(x, baseY - h * 0.45, x - w * 0.8, baseY, x + w * 0.8, baseY);
  }

  private createGround() {
    const g = this.scene.add.graphics().setDepth(-5);
    g.fillStyle(PALETTE.GRASS_LIGHT, 1);
    g.fillRect(0, 700, WORLD_WIDTH, 500);
    g.fillStyle(PALETTE.GRASS_DARK, 1);
    g.fillRect(0, 700, WORLD_WIDTH, 15);

    for (let x = 0; x < WORLD_WIDTH; x += 8) {
      const h = 8 + Math.random() * 12;
      const shade = Math.random() > 0.5 ? PALETTE.GRASS_LIGHT : PALETTE.GRASS_DARK;
      g.fillStyle(shade, 0.6);
      g.fillRect(x, 700 - h, 3, h);
    }

    const pathG = this.scene.add.graphics().setDepth(-4);
    pathG.fillStyle(0xD4B483, 0.7);
    pathG.fillRect(600, 700, 80, 400);
    for (let y = 720; y < 900; y += 30) {
      pathG.fillStyle(0xC4A070, 0.5);
      pathG.fillRect(605 + Math.random() * 20, y, 30, 10);
    }
  }

  private createHouse() {
    const hx = 450;
    const hy = 500;
    const g = this.scene.add.graphics().setDepth(5);

    g.fillStyle(0xECDFBF, 1);
    g.fillRect(hx, hy, 260, 200);

    g.fillStyle(0x8B4513, 1);
    g.fillTriangle(hx - 20, hy, hx + 140, hy - 100, hx + 300, hy);

    g.fillStyle(0x6B3410, 1);
    g.fillRect(hx + 5, hy - 60, 8, 65);
    for (let ry = hy - 65; ry < hy; ry += 12) {
      g.fillStyle(0x5A2D0C, 0.5);
      g.fillRect(hx - 20, ry, 300, 2);
    }

    g.fillStyle(0x4A90D9, 0.6);
    g.fillRect(hx + 20, hy + 30, 55, 45);
    g.fillRect(hx + 185, hy + 30, 55, 45);

    g.fillStyle(0xFFFFFF, 0.3);
    g.fillRect(hx + 22, hy + 32, 25, 43);
    g.fillRect(hx + 187, hy + 32, 25, 43);

    g.fillStyle(0xA0522D, 1);
    g.fillRect(hx + 100, hy + 120, 60, 80);
    g.fillStyle(0x8B4513, 1);
    g.fillRect(hx + 98, hy + 118, 64, 6);
    g.fillStyle(0xFFD700, 1);
    g.fillRect(hx + 155, hy + 158, 6, 6);

    g.fillStyle(0xD4B483, 0.3);
    g.fillRect(hx, hy, 260, 4);

    this.addWindowGlow(hx + 20, hy + 30, 55, 45);
    this.addWindowGlow(hx + 185, hy + 30, 55, 45);

    const chimney = this.scene.add.graphics().setDepth(6);
    chimney.fillStyle(0x8B4513, 1);
    chimney.fillRect(hx + 190, hy - 90, 30, 50);

    const smokeEmitter = this.scene.add.particles(hx + 205, hy - 90, 'sparkle_particle', {
      quantity: 0,
      speedX: { min: -5, max: 5 },
      speedY: { min: -30, max: -10 },
      scale: { start: 0.5, end: 0 },
      alpha: { start: 0.4, end: 0 },
      lifespan: 2000,
      tint: 0xAAAAAA,
    }).setDepth(7);
    smokeEmitter.setQuantity(1);
    this.scene.time.addEvent({ delay: 500, callback: () => smokeEmitter.setQuantity(1), loop: true });
  }

  private addWindowGlow(x: number, y: number, w: number, h: number) {
    const glow = this.scene.add.rectangle(x + w / 2, y + h / 2, w, h, 0xFFE082, 0.4).setDepth(6);
    this.scene.tweens.add({
      targets: glow,
      alpha: { from: 0.3, to: 0.6 },
      duration: 2000 + Math.random() * 2000,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    });
  }

  private createYard() {
    const g = this.scene.add.graphics().setDepth(2);

    this.createFence(g);
    this.createCampfire();
    this.createSwing();
    this.createHammock();
    this.createStringLights();
    this.createGarden();
    this.createBench(800, 720);
    this.createBicycle(1050, 730);
    this.createCatCorner(380, 730);
  }

  private createFence(g: Phaser.GameObjects.Graphics) {
    const startX = 320;
    const endX = 1350;
    const y = 715;

    for (let x = startX; x < endX; x += 25) {
      g.fillStyle(0xDEB887, 1);
      g.fillRect(x, y - 60, 12, 75);
      g.fillStyle(0xC4A070, 0.5);
      g.fillRect(x, y - 60, 3, 75);
    }
    g.fillStyle(0xA0522D, 1);
    g.fillRect(startX, y - 30, endX - startX, 8);
    g.fillRect(startX, y - 50, endX - startX, 8);
  }

  private createCampfire() {
    const cx = 900;
    const cy = 720;
    const g = this.scene.add.graphics().setDepth(3);

    g.fillStyle(0x5D4037, 1);
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      g.fillRect(cx + Math.cos(angle) * 18, cy - 5, 15, 6);
    }
    g.fillStyle(0x795548, 1);
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2 + 0.3;
      g.fillRect(cx + Math.cos(angle) * 12, cy - 3, 18, 5);
    }

    const fireEmitter = this.scene.add.particles(cx, cy - 10, 'firefly_glow', {
      quantity: 2,
      speedX: { min: -15, max: 15 },
      speedY: { min: -60, max: -20 },
      scale: { start: 1.5, end: 0 },
      alpha: { start: 0.9, end: 0 },
      tint: [0xFF4500, 0xFF8C00, 0xFFD700, 0xFF6347],
      lifespan: 800,
      blendMode: Phaser.BlendModes.ADD,
    }).setDepth(4);

    const emberEmitter = this.scene.add.particles(cx, cy - 8, 'firefly_glow', {
      quantity: 1,
      speedX: { min: -20, max: 20 },
      speedY: { min: -80, max: -30 },
      scale: { start: 0.3, end: 0 },
      alpha: { start: 1, end: 0 },
      tint: [0xFF8C00, 0xFFD700],
      lifespan: 1200,
      blendMode: Phaser.BlendModes.ADD,
    }).setDepth(4);

    this.scene.data.set('campfire_x', cx);
    this.scene.data.set('campfire_y', cy);
  }

  private createSwing() {
    const sx = 750;
    const sy = 650;
    const g = this.scene.add.graphics().setDepth(3);

    g.lineStyle(3, 0x8B4513, 1);
    g.strokeRect(sx - 50, sy - 120, 100, 4);

    g.lineStyle(2, 0xDEB887, 0.9);
    g.beginPath();
    g.moveTo(sx - 25, sy - 116);
    g.lineTo(sx - 25, sy);
    g.strokePath();
    g.beginPath();
    g.moveTo(sx + 25, sy - 116);
    g.lineTo(sx + 25, sy);
    g.strokePath();

    g.fillStyle(0xA0522D, 1);
    g.fillRect(sx - 30, sy - 5, 60, 10);

    this.scene.tweens.add({
      targets: g,
      angle: { from: -8, to: 8 },
      duration: 2500,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    });
  }

  private createHammock() {
    const hx = 1100;
    const hy = 680;
    const g = this.scene.add.graphics().setDepth(3);

    g.fillStyle(0x8B4513, 1);
    g.fillRect(hx - 80, hy - 100, 15, 120);
    g.fillRect(hx + 80, hy - 100, 15, 120);

    const hammockColor = 0xF4A460;
    g.fillStyle(hammockColor, 0.9);
    for (let i = 0; i < 6; i++) {
      const y = hy - 30 + i * 8;
      g.fillRect(hx - 70, y, 155, 4);
    }
    g.fillStyle(hammockColor, 0.6);
    g.fillEllipse(hx + 7, hy - 5, 155, 40);
  }

  private createStringLights() {
    const g = this.scene.add.graphics().setDepth(8);
    const points = [
      { x: 420, y: 600 }, { x: 600, y: 590 }, { x: 780, y: 600 },
      { x: 900, y: 580 }, { x: 1050, y: 590 }, { x: 1200, y: 600 }
    ];

    g.lineStyle(1, 0x888888, 0.6);
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i], p2 = points[i + 1];
      g.beginPath();
      g.moveTo(p1.x, p1.y);
      const cp = { x: (p1.x + p2.x) / 2, y: Math.max(p1.y, p2.y) + 20 };
      g.lineTo(cp.x, cp.y);
      g.lineTo(p2.x, p2.y);
      g.strokePath();
    }

    const colors = [0xFFD700, 0xFF6B6B, 0x87CEEB, 0x90EE90, 0xFFB347];
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i], p2 = points[i + 1];
      const steps = 5;
      for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        const x = p1.x + (p2.x - p1.x) * t;
        const y = p1.y + (p2.y - p1.y) * t + Math.sin(t * Math.PI) * 15;
        const bulb = this.scene.add.arc(x, y, 5).setFillStyle(colors[Math.floor(Math.random() * colors.length)]).setDepth(9);
        this.scene.tweens.add({
          targets: bulb,
          alpha: { from: 0.6, to: 1 },
          duration: 1000 + Math.random() * 2000,
          ease: 'Sine.easeInOut',
          yoyo: true,
          repeat: -1,
          delay: Math.random() * 2000
        });
      }
    }
  }

  private createGarden() {
    const g = this.scene.add.graphics().setDepth(2);
    const flowerColors = [0xFF69B4, 0xFFD700, 0xFF6347, 0x9370DB, 0xFF4500];

    for (let i = 0; i < 20; i++) {
      const fx = 340 + Math.random() * 80;
      const fy = 720 + Math.random() * 30;
      const color = flowerColors[Math.floor(Math.random() * flowerColors.length)];
      g.fillStyle(0x228B22, 1);
      g.fillRect(fx, fy - 20, 2, 20);
      g.fillStyle(color, 1);
      g.fillCircle(fx + 1, fy - 22, 6);
      g.fillStyle(0xFFFF00, 0.8);
      g.fillCircle(fx + 1, fy - 22, 3);
    }

    for (let i = 0; i < 15; i++) {
      const fx = 1250 + Math.random() * 80;
      const fy = 715 + Math.random() * 25;
      const color = flowerColors[Math.floor(Math.random() * flowerColors.length)];
      g.fillStyle(0x228B22, 1);
      g.fillRect(fx, fy - 18, 2, 18);
      g.fillStyle(color, 1);
      g.fillCircle(fx + 1, fy - 20, 5);
      g.fillStyle(0xFFFF00, 0.8);
      g.fillCircle(fx + 1, fy - 20, 2);
    }
  }

  private createBench(x: number, y: number) {
    const g = this.scene.add.graphics().setDepth(3);
    g.fillStyle(0xA0522D, 1);
    g.fillRect(x - 40, y - 30, 80, 10);
    g.fillRect(x - 40, y - 50, 80, 8);
    g.fillStyle(0x8B4513, 1);
    g.fillRect(x - 35, y - 30, 8, 30);
    g.fillRect(x + 27, y - 30, 8, 30);
    g.fillRect(x - 35, y - 55, 8, 5);
    g.fillRect(x + 27, y - 55, 8, 5);
  }

  private createBicycle(x: number, y: number) {
    const g = this.scene.add.graphics().setDepth(3);
    g.lineStyle(3, 0x555555, 1);
    g.strokeCircle(x - 25, y - 20, 22);
    g.strokeCircle(x + 25, y - 20, 22);
    g.beginPath(); g.moveTo(x - 25, y - 20); g.lineTo(x, y - 30); g.lineTo(x + 25, y - 20); g.strokePath();
    g.beginPath(); g.moveTo(x, y - 30); g.lineTo(x - 5, y - 20); g.strokePath();
    g.fillStyle(0x333333, 1);
    g.fillRect(x - 15, y - 42, 20, 5);
    g.fillStyle(0xFF4444, 1);
    g.fillRect(x + 20, y - 42, 15, 4);
  }

  private createCatCorner(x: number, y: number) {
    const g = this.scene.add.graphics().setDepth(3);
    g.fillStyle(0xA0522D, 1);
    g.fillRect(x - 30, y - 40, 60, 8);
    g.fillRect(x - 30, y - 40, 8, 40);
    g.fillRect(x + 22, y - 40, 8, 40);

    g.fillStyle(0xF5F5DC, 1);
    g.fillEllipse(x, y - 10, 50, 25);
    g.fillStyle(0xDDDDCC, 0.5);
    g.fillRect(x - 15, y - 12, 30, 4);
    g.fillRect(x - 15, y - 6, 30, 4);

    const sign = this.scene.add.text(x, y - 55, '🐱 Уголок\nРыжика', {
      fontSize: '9px', color: '#5D4037', align: 'center', lineSpacing: 2
    }).setOrigin(0.5).setDepth(4);
  }

  private createForest() {
    const startX = 100;
    const g = this.scene.add.graphics().setDepth(1);
    const fg = this.scene.add.graphics().setDepth(10);
    const fogG = this.scene.add.graphics().setDepth(12);

    for (let i = 0; i < 25; i++) {
      const tx = startX + Math.random() * 250;
      const ty = 700 + Math.random() * 20;
      const scale = 0.7 + Math.random() * 0.8;
      this.drawDetailedTree(g, tx, ty, scale, 0x3D7A37, 0x2D5A27);
    }

    for (let i = 0; i < 8; i++) {
      const mx = 50 + Math.random() * 200;
      const my = 750 + Math.random() * 40;
      g.fillStyle(0x4A148C, 0.4);
      g.fillEllipse(mx, my, 25 + Math.random() * 15, 15 + Math.random() * 8);
    }

    fogG.fillStyle(0xFFFFFF, 0.15);
    fogG.fillRect(startX - 50, 650, 320, 100);

    const wellX = 150;
    const wellY = 695;
    this.createWell(g, wellX, wellY);

    for (let i = 0; i < 10; i++) {
      const msx = startX + Math.random() * 200;
      const msy = 730 + Math.random() * 20;
      g.fillStyle(Math.random() > 0.5 ? 0xC62828 : 0xEF9A9A, 0.9);
      g.fillCircle(msx, msy, 4 + Math.random() * 5);
      g.fillStyle(0xF9A825, 0.7);
      g.fillCircle(msx + Math.random() * 6 - 3, msy - 6, 3);
    }
  }

  private drawDetailedTree(g: Phaser.GameObjects.Graphics, x: number, y: number, scale: number, lightColor: number, darkColor: number) {
    const trunkH = 60 * scale;
    const trunkW = 14 * scale;
    g.fillStyle(0x6D4C41, 1);
    g.fillRect(x - trunkW / 2, y - trunkH, trunkW, trunkH);

    const layers = 3;
    for (let l = 0; l < layers; l++) {
      const ly = y - trunkH - l * 40 * scale;
      const lw = (120 - l * 25) * scale;
      const lh = 50 * scale;
      g.fillStyle(l % 2 === 0 ? lightColor : darkColor, 1);
      g.fillTriangle(x, ly - lh, x - lw / 2, ly, x + lw / 2, ly);
      g.fillStyle(0x1B5E20, 0.3);
      g.fillTriangle(x, ly - lh, x, ly - lh * 0.3, x + lw / 2, ly);
    }
  }

  private createWell(g: Phaser.GameObjects.Graphics, x: number, y: number) {
    g.fillStyle(0x78909C, 1);
    g.fillEllipse(x, y - 30, 40, 15);
    g.fillStyle(0x607D8B, 1);
    g.fillRect(x - 20, y - 30, 40, 30);
    g.fillStyle(0x546E7A, 1);
    g.fillEllipse(x, y, 40, 15);
    g.fillStyle(0x8B4513, 1);
    g.fillRect(x - 25, y - 50, 5, 25);
    g.fillRect(x + 20, y - 50, 5, 25);
    g.fillRect(x - 25, y - 50, 50, 5);
    g.lineStyle(1, 0x8B4513, 0.8);
    g.beginPath(); g.moveTo(x - 5, y - 45); g.lineTo(x - 5, y - 35); g.strokePath();
  }

  private createPond() {
    const px = 1600;
    const py = 680;
    const g = this.scene.add.graphics().setDepth(0);

    g.fillGradientStyle(0x1565C0, 0x1565C0, 0x29B6F6, 0x29B6F6, 0.85);
    g.fillEllipse(px, py, 280, 100);

    g.fillStyle(0x81D4FA, 0.3);
    g.fillEllipse(px - 30, py - 10, 100, 30);

    for (let i = 0; i < 6; i++) {
      const lpx = px + (Math.random() - 0.5) * 200;
      const lpy = py + (Math.random() - 0.5) * 60;
      g.fillStyle(0x2E7D32, 0.8);
      g.fillEllipse(lpx, lpy, 20 + Math.random() * 15, 12 + Math.random() * 8);
      g.fillStyle(0xF8BBD9, 0.6);
      g.fillCircle(lpx + Math.random() * 6 - 3, lpy - 3, 4);
    }

    g.fillStyle(0x4CAF50, 1);
    for (let i = 0; i < 8; i++) {
      const rx = px + 100 + Math.random() * 40;
      const ry = py + (Math.random() - 0.5) * 40;
      g.fillRect(rx, ry - 20, 3, 20);
      g.fillStyle(0x388E3C, 0.7);
      g.fillEllipse(rx + 1, ry - 22, 8, 18);
    }

    const bridge = this.scene.add.graphics().setDepth(4);
    bridge.fillStyle(0xA0522D, 1);
    bridge.fillRect(px - 15, py - 55, 30, 55);
    bridge.fillStyle(0x8B4513, 1);
    bridge.fillRect(px - 15, py - 57, 30, 5);
    for (let i = 0; i < 4; i++) {
      bridge.fillRect(px - 12 + i * 9, py - 53, 4, 53);
    }

    const boatG = this.scene.add.graphics().setDepth(3);
    boatG.fillStyle(0xA0522D, 1);
    boatG.fillRect(px + 40, py - 12, 60, 12);
    boatG.fillTriangle(px + 40, py, px + 100, py, px + 70, py + 8);
    boatG.fillStyle(0xECDFBF, 1);
    boatG.fillRect(px + 65, py - 30, 2, 18);
    boatG.fillTriangle(px + 67, py - 30, px + 85, py - 22, px + 67, py - 14);

    const frogG = this.scene.add.graphics().setDepth(3);
    frogG.fillStyle(0x4CAF50, 1);
    frogG.fillCircle(px - 100, py + 10, 8);
    frogG.fillCircle(px - 104, py + 5, 5);
    frogG.fillCircle(px - 96, py + 5, 5);
    frogG.fillStyle(0x388E3C, 1);
    frogG.fillCircle(px - 103, py + 4, 3);
    frogG.fillCircle(px - 97, py + 4, 3);
  }

  private createGreenhouse() {
    const ghx = 2800;
    const ghy = 580;
    const g = this.scene.add.graphics().setDepth(3);

    g.lineStyle(3, 0x90A4AE, 1);
    g.fillStyle(0x80DEEA, 0.2);
    g.fillRect(ghx, ghy, 200, 120);
    g.strokeRect(ghx, ghy, 200, 120);

    for (let i = 1; i < 5; i++) {
      g.lineStyle(2, 0xB0BEC5, 0.5);
      g.beginPath(); g.moveTo(ghx + i * 40, ghy); g.lineTo(ghx + i * 40, ghy + 120); g.strokePath();
    }
    for (let i = 1; i < 4; i++) {
      g.beginPath(); g.moveTo(ghx, ghy + i * 30); g.lineTo(ghx + 200, ghy + i * 30); g.strokePath();
    }

    g.fillStyle(0x90A4AE, 1);
    g.fillTriangle(ghx - 10, ghy, ghx + 100, ghy - 50, ghx + 210, ghy);

    g.fillStyle(0xAA4400, 0.8);
    g.fillRect(ghx + 80, ghy + 80, 40, 40);
    g.fillStyle(0xFFFFFF, 0.5);
    g.fillRect(ghx + 82, ghy + 82, 16, 36);

    const magicParticle = this.scene.add.graphics();
    magicParticle.fillStyle(0x9C27B0, 1);
    magicParticle.fillCircle(5, 5, 5);
    magicParticle.generateTexture('magic_particle', 10, 10);
    magicParticle.destroy();

    const ghEmitter = this.scene.add.particles(ghx + 100, ghy + 60, 'magic_particle', {
      quantity: 1,
      speedX: { min: -10, max: 10 },
      speedY: { min: -30, max: -10 },
      scale: { start: 0.5, end: 0 },
      alpha: { start: 0.8, end: 0 },
      tint: [0x9C27B0, 0x7B1FA2, 0xCE93D8, 0x4FC3F7],
      lifespan: 2000,
      blendMode: Phaser.BlendModes.ADD,
    }).setDepth(5);

    const lock = this.scene.add.text(ghx + 100, ghy + 120, '🔒', { fontSize: '20px' })
      .setOrigin(0.5).setDepth(6);
    this.scene.data.set('greenhouse_lock', lock);
  }

  private createInteractiveObjects() {
    this.createCassettePlayer(500, 660);
    this.createCollectibleItems();
  }

  private createCassettePlayer(x: number, y: number) {
    const g = this.scene.add.graphics().setDepth(4);
    g.fillStyle(0x333333, 1);
    g.fillRoundedRect(x - 25, y - 15, 50, 30, 4);
    g.fillStyle(0x555555, 1);
    g.fillRect(x - 18, y - 10, 36, 14);
    g.fillStyle(0x222222, 0.5);
    g.fillRect(x - 16, y - 8, 32, 10);
    g.fillStyle(0xFF0000, 1);
    g.fillCircle(x + 18, y + 10, 3);
    g.fillStyle(0xFFFFFF, 1);
    g.fillTriangle(x - 5, y + 7, x - 5, y + 13, x + 3, y + 10);

    this.scene.data.set('cassette_player_x', x);
    this.scene.data.set('cassette_player_y', y);
  }

  private createCollectibleItems() {
    const items = [
      { id: 'sticker', x: 620, y: 715, emoji: '⭐', color: 0xFFD700 },
      { id: 'sticker', x: 750, y: 720, emoji: '⭐', color: 0xFF69B4 },
      { id: 'sticker', x: 880, y: 718, emoji: '⭐', color: 0x87CEEB },
      { id: 'sticker', x: 1000, y: 716, emoji: '⭐', color: 0x90EE90 },
      { id: 'sticker', x: 1150, y: 720, emoji: '⭐', color: 0xFFB347 },
      { id: 'old_note', x: 500, y: 714, emoji: '📝', color: 0xF5DEB3 },
      { id: 'old_note', x: 680, y: 712, emoji: '📝', color: 0xF5DEB3 },
      { id: 'wire', x: 1220, y: 718, emoji: '🔌', color: 0x808080 },
      { id: 'gear', x: 960, y: 714, emoji: '⚙️', color: 0x888888 },
    ];

    items.forEach(item => {
      const glow = this.scene.add.arc(item.x, item.y - 5, 10)
        .setFillStyle(item.color, 0.3).setDepth(5);
      const label = this.scene.add.text(item.x, item.y - 15, item.emoji, { fontSize: '14px' })
        .setOrigin(0.5).setDepth(6);
      this.scene.tweens.add({
        targets: [glow, label],
        y: `-=5`,
        duration: 1500 + Math.random() * 500,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1,
        delay: Math.random() * 1000
      });

      this.scene.data.set(`item_${item.id}_${item.x}`, { x: item.x, y: item.y, id: item.id, glow, label });
    });
  }

  createSparkleParticle() {
    const g = this.scene.add.graphics();
    g.fillStyle(0xFFD700, 1);
    g.fillCircle(3, 3, 3);
    g.generateTexture('sparkle_particle', 6, 6);
    g.destroy();
  }
}
