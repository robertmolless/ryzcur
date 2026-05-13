import Phaser from 'phaser';

export interface TouchInput {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  sprint: boolean;
  interact: boolean;
}

export class TouchControls {
  private scene: Phaser.Scene;
  private container!: Phaser.GameObjects.Container;
  private input: TouchInput = {
    left: false, right: false, up: false, down: false,
    sprint: false, interact: false
  };
  private joystickBase!: Phaser.GameObjects.Arc;
  private joystickStick!: Phaser.GameObjects.Arc;
  private joystickPointer: Phaser.Input.Pointer | null = null;
  private joystickOrigin = { x: 0, y: 0 };
  private isVisible = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  create() {
    const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent) ||
      ('ontouchstart' in window);
    if (!isMobile) return;

    const W = this.scene.cameras.main.width;
    const H = this.scene.cameras.main.height;

    this.container = this.scene.add.container(0, 0).setScrollFactor(0).setDepth(500);

    this.joystickBase = this.scene.add.arc(100, H - 120, 55, 0, 360, false, 0x000000, 0.25)
      .setStrokeStyle(2, 0xFFFFFF, 0.4).setScrollFactor(0).setDepth(500);

    this.joystickStick = this.scene.add.arc(100, H - 120, 25, 0, 360, false, 0xFF8C32, 0.7)
      .setScrollFactor(0).setDepth(501);

    const interactBtn = this.scene.add.arc(W - 70, H - 100, 35, 0, 360, false, 0xFF8C32, 0.6)
      .setScrollFactor(0).setDepth(500).setStrokeStyle(2, 0xFFFFFF, 0.5)
      .setInteractive({ useHandCursor: true });
    const interactLabel = this.scene.add.text(W - 70, H - 100, 'E', {
      fontSize: '18px', color: '#FFFFFF', fontStyle: 'bold'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(501);

    const sprintBtn = this.scene.add.arc(W - 140, H - 80, 25, 0, 360, false, 0x4A90D9, 0.5)
      .setScrollFactor(0).setDepth(500).setStrokeStyle(1, 0xFFFFFF, 0.4)
      .setInteractive({ useHandCursor: true });
    const sprintLabel = this.scene.add.text(W - 140, H - 80, '⚡', { fontSize: '14px' })
      .setOrigin(0.5).setScrollFactor(0).setDepth(501);

    this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.x < W / 2) {
        this.joystickPointer = pointer;
        this.joystickOrigin = { x: pointer.x, y: pointer.y };
        this.joystickBase.setPosition(pointer.x, pointer.y);
        this.joystickStick.setPosition(pointer.x, pointer.y);
      }
    });

    this.scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.joystickPointer?.id === pointer.id) {
        const dx = pointer.x - this.joystickOrigin.x;
        const dy = pointer.y - this.joystickOrigin.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 50;
        const clampedDist = Math.min(dist, maxDist);
        const angle = Math.atan2(dy, dx);
        this.joystickStick.setPosition(
          this.joystickOrigin.x + Math.cos(angle) * clampedDist,
          this.joystickOrigin.y + Math.sin(angle) * clampedDist
        );

        const threshold = 0.3;
        this.input.left = dx < -maxDist * threshold;
        this.input.right = dx > maxDist * threshold;
        this.input.up = dy < -maxDist * threshold;
        this.input.down = dy > maxDist * threshold;
      }
    });

    this.scene.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (this.joystickPointer?.id === pointer.id) {
        this.joystickPointer = null;
        this.input.left = false; this.input.right = false;
        this.input.up = false; this.input.down = false;
        this.joystickStick.setPosition(this.joystickOrigin.x, this.joystickOrigin.y);
      }
    });

    interactBtn.on('pointerdown', () => {
      this.input.interact = true;
      this.scene.time.delayedCall(100, () => { this.input.interact = false; });
    });
    sprintBtn.on('pointerdown', () => { this.input.sprint = true; });
    sprintBtn.on('pointerup', () => { this.input.sprint = false; });
  }

  getInput(): TouchInput { return this.input; }
  isInteractPressed(): boolean { return this.input.interact; }
}
