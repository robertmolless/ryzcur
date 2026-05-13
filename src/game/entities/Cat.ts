import Phaser from 'phaser';
import { PALETTE, CAT_SPEED, CAT_SPRINT_SPEED } from '../constants';
import { audioManager } from '../systems/AudioManager';
import { useGameStore } from '../../store/gameStore';

export type CatState = 'idle' | 'walk' | 'run' | 'sit' | 'sleep' | 'stretch' | 'play' | 'purr' | 'scared';

export class Cat {
  public container: Phaser.GameObjects.Container;
  private scene: Phaser.Scene;
  private body!: Phaser.GameObjects.Arc;
  private head!: Phaser.GameObjects.Arc;
  private leftEar!: Phaser.GameObjects.Triangle;
  private rightEar!: Phaser.GameObjects.Triangle;
  private tail!: Phaser.GameObjects.Arc;
  private leftEye!: Phaser.GameObjects.Arc;
  private rightEye!: Phaser.GameObjects.Arc;
  private nose!: Phaser.GameObjects.Arc;
  private muzzleLeft!: Phaser.GameObjects.Arc;
  private muzzleRight!: Phaser.GameObjects.Arc;
  private chestPatch!: Phaser.GameObjects.Arc;
  private pawFrontLeft!: Phaser.GameObjects.Arc;
  private pawFrontRight!: Phaser.GameObjects.Arc;
  private purringParticles!: Phaser.GameObjects.Particles.ParticleEmitter;
  private heartParticles!: Phaser.GameObjects.Particles.ParticleEmitter;
  private zParticles!: Phaser.GameObjects.Particles.ParticleEmitter;

  private state: CatState = 'idle';
  private facingLeft = false;
  private walkCycle = 0;
  private idleTimer = 0;
  private purringTimer = 0;
  private stateTimer = 0;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasdKeys!: Record<string, Phaser.Input.Keyboard.Key>;
  private sprintKey!: Phaser.Input.Keyboard.Key;
  private interactKey!: Phaser.Input.Keyboard.Key;

  public velocityX = 0;
  public velocityY = 0;
  public x: number;
  public y: number;

  private interactionRadius = 80;
  private nearbyNPC: string | null = null;
  private interactPrompt!: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.container = scene.add.container(x, y).setDepth(20);
    this.buildSprite();
    this.setupInput();
    this.setupParticles();
    this.createInteractPrompt();
  }

  private buildSprite() {
    this.body = this.scene.add.arc(0, 2, 14, 0, 360, false, PALETTE.ORANGE_CAT);
    this.body.setStrokeStyle(1, PALETTE.ORANGE_DARK, 0.5);

    this.chestPatch = this.scene.add.arc(0, 5, 7, 0, 360, false, 0xFFFFFF);
    this.chestPatch.setAlpha(0.9);

    this.head = this.scene.add.arc(0, -12, 11, 0, 360, false, PALETTE.ORANGE_CAT);
    this.head.setStrokeStyle(1, PALETTE.ORANGE_DARK, 0.3);

    this.leftEar = this.scene.add.triangle(-8, -22, 0, -10, -7, 0, 7, 0, PALETTE.ORANGE_CAT);
    this.rightEar = this.scene.add.triangle(8, -22, 0, -10, -7, 0, 7, 0, PALETTE.ORANGE_CAT);

    const leftInner = this.scene.add.triangle(-8, -22, 0, -8, -4, 0, 4, 0, 0xFFB6C1);
    const rightInner = this.scene.add.triangle(8, -22, 0, -8, -4, 0, 4, 0, 0xFFB6C1);
    leftInner.setAlpha(0.7);
    rightInner.setAlpha(0.7);

    this.muzzleLeft = this.scene.add.arc(-4, -10, 5, 0, 360, false, 0xFFFFFF);
    this.muzzleRight = this.scene.add.arc(4, -10, 5, 0, 360, false, 0xFFFFFF);

    this.nose = this.scene.add.arc(0, -9, 2, 0, 360, false, 0xFF69B4);

    this.leftEye = this.scene.add.arc(-4, -14, 3, 0, 360, false, 0x8B6914);
    this.rightEye = this.scene.add.arc(4, -14, 3, 0, 360, false, 0x8B6914);

    const leftPupil = this.scene.add.arc(-4, -14, 1.5, 0, 360, false, 0x000000);
    const rightPupil = this.scene.add.arc(4, -14, 1.5, 0, 360, false, 0x000000);
    const leftShine = this.scene.add.arc(-3, -15, 0.8, 0, 360, false, 0xFFFFFF);
    const rightShine = this.scene.add.arc(5, -15, 0.8, 0, 360, false, 0xFFFFFF);

    const whiskerL1 = this.scene.add.line(0, 0, -18, -9, -6, -9, 0x222222, 0.6).setLineWidth(0.5);
    const whiskerL2 = this.scene.add.line(0, 0, -18, -7, -6, -8, 0x222222, 0.4).setLineWidth(0.5);
    const whiskerR1 = this.scene.add.line(0, 0, 18, -9, 6, -9, 0x222222, 0.6).setLineWidth(0.5);
    const whiskerR2 = this.scene.add.line(0, 0, 18, -7, 6, -8, 0x222222, 0.4).setLineWidth(0.5);

    this.tail = this.scene.add.arc(18, 6, 8, 0, 180, false, PALETTE.ORANGE_CAT);
    this.tail.setStrokeStyle(1, PALETTE.ORANGE_DARK, 0.4);

    const tailTip = this.scene.add.arc(22, 10, 5, 0, 360, false, 0xFFE0B2);

    this.pawFrontLeft = this.scene.add.arc(-8, 15, 4, 0, 360, false, PALETTE.ORANGE_CAT);
    this.pawFrontRight = this.scene.add.arc(8, 15, 4, 0, 360, false, PALETTE.ORANGE_CAT);

    const stripesG = this.scene.add.graphics();
    stripesG.lineStyle(1.5, PALETTE.ORANGE_DARK, 0.4);
    stripesG.beginPath(); stripesG.moveTo(-5, -4); stripesG.lineTo(5, -4); stripesG.strokePath();
    stripesG.beginPath(); stripesG.moveTo(-7, 0); stripesG.lineTo(7, 0); stripesG.strokePath();
    stripesG.beginPath(); stripesG.moveTo(-5, 4); stripesG.lineTo(5, 4); stripesG.strokePath();

    this.container.add([
      this.tail, tailTip,
      this.body, this.chestPatch, stripesG,
      this.pawFrontLeft, this.pawFrontRight,
      this.head,
      this.leftEar, this.rightEar,
      leftInner, rightInner,
      this.muzzleLeft, this.muzzleRight,
      this.nose,
      this.leftEye, this.rightEye,
      leftPupil, rightPupil,
      leftShine, rightShine,
      whiskerL1, whiskerL2, whiskerR1, whiskerR2,
    ]);
  }

  private setupParticles() {
    const purr = this.scene.add.graphics();
    purr.fillStyle(0xFF69B4, 1);
    purr.fillCircle(4, 4, 4);
    purr.generateTexture('heart_particle', 8, 8);
    purr.destroy();

    const zzz = this.scene.add.graphics();
    zzz.fillStyle(0xAAAAAA, 1);
    zzz.fillCircle(4, 4, 4);
    zzz.generateTexture('zzz_particle', 8, 8);
    zzz.destroy();

    this.heartParticles = this.scene.add.particles(0, 0, 'heart_particle', {
      quantity: 0,
      speedX: { min: -10, max: 10 },
      speedY: { min: -40, max: -20 },
      scale: { start: 0.8, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 1200,
      tint: [0xFF69B4, 0xFF1493, 0xFFB6C1],
      blendMode: Phaser.BlendModes.ADD,
    }).setDepth(25);

    this.zParticles = this.scene.add.particles(0, 0, 'zzz_particle', {
      quantity: 0,
      speedX: { min: 5, max: 15 },
      speedY: { min: -25, max: -10 },
      scale: { start: 0.5, end: 1.0 },
      alpha: { start: 0.8, end: 0 },
      lifespan: 2000,
      tint: 0x9E9E9E,
    }).setDepth(25);
  }

  private setupInput() {
    this.cursors = this.scene.input.keyboard!.createCursorKeys();
    this.wasdKeys = {
      W: this.scene.input.keyboard!.addKey('W'),
      A: this.scene.input.keyboard!.addKey('A'),
      S: this.scene.input.keyboard!.addKey('S'),
      D: this.scene.input.keyboard!.addKey('D'),
    };
    this.sprintKey = this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    this.interactKey = this.scene.input.keyboard!.addKey('E');
  }

  private createInteractPrompt() {
    this.interactPrompt = this.scene.add.container(0, -50).setDepth(30).setVisible(false);
    const bg = this.scene.add.rectangle(0, 0, 80, 24, 0x000000, 0.6).setOrigin(0.5);
    bg.setStrokeStyle(1, 0xFFD700, 0.8);
    const text = this.scene.add.text(0, 0, '[E] Говорить', {
      fontSize: '10px', color: '#FFD700', align: 'center'
    }).setOrigin(0.5);
    this.interactPrompt.add([bg, text]);
    this.container.add(this.interactPrompt);
  }

  update(delta: number, npcs: Array<{ id: string; x: number; y: number }>) {
    this.stateTimer += delta;
    this.updateMovement(delta);
    this.updateAnimation(delta);
    this.updateNPCInteraction(npcs);
    this.updateParticles();
    this.updateParticlePositions();
  }

  private updateMovement(delta: number) {
    const dt = delta / 1000;
    const isSprinting = this.sprintKey.isDown;
    const speed = isSprinting ? CAT_SPRINT_SPEED : CAT_SPEED;

    let vx = 0;
    let vy = 0;

    const left = this.cursors.left.isDown || this.wasdKeys.A.isDown;
    const right = this.cursors.right.isDown || this.wasdKeys.D.isDown;
    const up = this.cursors.up.isDown || this.wasdKeys.W.isDown;
    const down = this.cursors.down.isDown || this.wasdKeys.S.isDown;

    if (left) { vx = -speed; this.facingLeft = true; }
    if (right) { vx = speed; this.facingLeft = false; }
    if (up) vy = -speed * 0.5;
    if (down) vy = speed * 0.5;

    if (vx !== 0 && vy !== 0) {
      vx *= 0.707;
      vy *= 0.707;
    }

    this.velocityX = vx;
    this.velocityY = vy;

    const newX = this.x + vx * dt;
    const newY = this.y + vy * dt;

    this.x = Phaser.Math.Clamp(newX, 100, 3900);
    this.y = Phaser.Math.Clamp(newY, 630, 760);
    this.container.setPosition(this.x, this.y);

    if (vx !== 0 || vy !== 0) {
      this.setState(isSprinting ? 'run' : 'walk');
      this.idleTimer = 0;
    } else {
      this.idleTimer += delta;
      if (this.idleTimer > 5000 && this.state !== 'sleep' && this.state !== 'sit') {
        this.setState('sit');
      }
      if (this.idleTimer > 15000 && this.state !== 'sleep') {
        this.setState('sleep');
        useGameStore.getState().setCatMood('sleepy');
      }
      if (this.state === 'walk' || this.state === 'run') {
        this.setState('idle');
      }
    }
  }

  private updateAnimation(delta: number) {
    this.walkCycle += delta * 0.005;
    const isMoving = this.state === 'walk' || this.state === 'run';
    const speedMult = this.state === 'run' ? 1.5 : 1;

    if (isMoving) {
      const bob = Math.sin(this.walkCycle * 8 * speedMult) * 2;
      const sway = Math.sin(this.walkCycle * 8 * speedMult) * 3;
      this.body.setY(2 + bob);
      this.head.setY(-12 + bob * 0.5);

      this.pawFrontLeft.setY(15 + Math.abs(Math.sin(this.walkCycle * 8 * speedMult)) * 4);
      this.pawFrontRight.setY(15 + Math.abs(Math.cos(this.walkCycle * 8 * speedMult)) * 4);

      const tailSwing = Math.sin(this.walkCycle * 6 * speedMult) * 20;
      this.tail.setAngle(tailSwing);
    } else if (this.state === 'sit') {
      this.body.setY(5);
      this.head.setY(-10);
      this.pawFrontLeft.setY(18);
      this.pawFrontRight.setY(18);
    } else if (this.state === 'sleep') {
      this.container.setAngle(90);
    } else {
      const breathe = Math.sin(this.walkCycle * 2) * 0.5;
      this.body.setScale(1, 1 + breathe * 0.02);
    }

    if (this.state !== 'sleep') {
      this.container.setAngle(0);
    }

    const tailWave = Math.sin(this.walkCycle * (isMoving ? 8 : 3)) * (isMoving ? 15 : 8);
    if (!isMoving) this.tail.setAngle(tailWave);

    this.container.setScale(this.facingLeft ? -1 : 1, 1);

    const stretch = Math.sin(this.walkCycle) * 0.008;
    this.head.setScale(1 + stretch, 1 + stretch);
  }

  private updateNPCInteraction(npcs: Array<{ id: string; x: number; y: number }>) {
    let closestNPC: { id: string; x: number; y: number } | null = null;
    let closestDist = this.interactionRadius;

    npcs.forEach(npc => {
      const dist = Phaser.Math.Distance.Between(this.x, this.y, npc.x, npc.y);
      if (dist < closestDist) {
        closestDist = dist;
        closestNPC = npc;
      }
    });

    this.nearbyNPC = closestNPC ? (closestNPC as { id: string }).id : null;
    this.interactPrompt.setVisible(!!closestNPC);

    if (closestNPC && Phaser.Input.Keyboard.JustDown(this.interactKey)) {
      useGameStore.getState().openDialogue((closestNPC as { id: string }).id);
      audioManager.playPurr();
    }
  }

  private updateParticles() {
    if (this.state === 'sleep') {
      this.purringTimer += 16;
      if (this.purringTimer > 2000) {
        this.purringTimer = 0;
        this.zParticles.setQuantity(1);
        this.scene.time.delayedCall(200, () => this.zParticles.setQuantity(0));
      }
    } else {
      this.zParticles.setQuantity(0);
    }
  }

  private updateParticlePositions() {
    this.heartParticles.setPosition(this.x, this.y - 30);
    this.zParticles.setPosition(this.x + (this.facingLeft ? -20 : 20), this.y - 30);
  }

  setState(newState: CatState) {
    if (this.state === newState) return;
    this.state = newState;
    this.stateTimer = 0;
  }

  showHearts() {
    this.heartParticles.setQuantity(3);
    this.scene.time.delayedCall(500, () => this.heartParticles.setQuantity(0));
    useGameStore.getState().setCatMood('happy');
  }

  getState(): CatState { return this.state; }
  getNearbyNPC(): string | null { return this.nearbyNPC; }
}
