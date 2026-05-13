import Phaser from 'phaser';
import type { CharacterData } from '../types';
import { useGameStore } from '../../store/gameStore';

type NPCBehavior = 'standing' | 'walking' | 'sitting' | 'playing' | 'working' | 'sleeping';

export class NPC {
  public id: string;
  public nameRu: string;
  public container: Phaser.GameObjects.Container;
  private scene: Phaser.Scene;
  private data: CharacterData;

  private body!: Phaser.GameObjects.Arc;
  private head!: Phaser.GameObjects.Arc;
  private leftArm!: Phaser.GameObjects.Rectangle;
  private rightArm!: Phaser.GameObjects.Rectangle;
  private leftLeg!: Phaser.GameObjects.Rectangle;
  private rightLeg!: Phaser.GameObjects.Rectangle;
  private hair!: Phaser.GameObjects.Arc;
  private nameLabel!: Phaser.GameObjects.Text;
  private friendshipBar!: Phaser.GameObjects.Rectangle;
  private friendshipBg!: Phaser.GameObjects.Rectangle;
  private activityIcon!: Phaser.GameObjects.Text;

  private behavior: NPCBehavior = 'standing';
  private walkTarget: { x: number; y: number } | null = null;
  private walkTimer = 0;
  private animTimer = 0;
  private walkCycle = 0;
  private facingLeft = false;

  public x: number;
  public y: number;

  constructor(scene: Phaser.Scene, data: CharacterData) {
    this.scene = scene;
    this.data = data;
    this.id = data.id;
    this.nameRu = data.nameRu;
    this.x = data.startPosition.x;
    this.y = data.startPosition.y;
    this.container = scene.add.container(this.x, this.y).setDepth(15);
    this.buildSprite();
    this.startBehavior();
  }

  private buildSprite() {
    const bodyColor = this.data.color;
    const hairColor = this.data.hairColor;
    const skinColor = this.data.skinColor;

    this.leftLeg = this.scene.add.rectangle(-5, 22, 6, 18, bodyColor).setOrigin(0.5, 0);
    this.rightLeg = this.scene.add.rectangle(5, 22, 6, 18, bodyColor).setOrigin(0.5, 0);

    this.leftLeg.setFillStyle(Phaser.Display.Color.GetColor(
      ...this.shadeColor(bodyColor, -20)
    ));
    this.rightLeg.setFillStyle(Phaser.Display.Color.GetColor(
      ...this.shadeColor(bodyColor, -10)
    ));

    this.body = this.scene.add.arc(0, 10, 13, 0, 360, false, bodyColor);

    this.leftArm = this.scene.add.rectangle(-15, 8, 5, 16, bodyColor).setOrigin(0.5, 0).setAngle(15);
    this.rightArm = this.scene.add.rectangle(15, 8, 5, 16, bodyColor).setOrigin(0.5, 0).setAngle(-15);

    const neck = this.scene.add.rectangle(0, -2, 7, 8, skinColor).setOrigin(0.5, 0);

    this.head = this.scene.add.arc(0, -14, 12, 0, 360, false, skinColor);

    this.hair = this.scene.add.arc(0, -20, 11, 180, 360, false, hairColor);

    const leftEye = this.scene.add.arc(-4, -16, 2, 0, 360, false, 0x1A1A1A);
    const rightEye = this.scene.add.arc(4, -16, 2, 0, 360, false, 0x1A1A1A);

    const leftEyeWhite = this.scene.add.arc(-4, -16, 3, 0, 360, false, 0xFFFFFF);
    leftEyeWhite.setAlpha(0.3);
    const rightEyeWhite = this.scene.add.arc(4, -16, 3, 0, 360, false, 0xFFFFFF);
    rightEyeWhite.setAlpha(0.3);

    const mouth = this.scene.add.arc(0, -11, 3, 0, 180, true, skinColor);
    mouth.setStrokeStyle(1, 0xAA7755, 0.8);

    this.addHairStyle();

    this.activityIcon = this.scene.add.text(0, -38, '', { fontSize: '12px' }).setOrigin(0.5).setDepth(1);

    this.nameLabel = this.scene.add.text(0, -55, this.data.nameRu, {
      fontSize: '9px',
      color: '#FFFFFF',
      backgroundColor: 'rgba(0,0,0,0.5)',
      padding: { x: 3, y: 2 }
    }).setOrigin(0.5);

    this.friendshipBg = this.scene.add.rectangle(0, -44, 30, 4, 0x333333).setAlpha(0.8);
    this.friendshipBar = this.scene.add.rectangle(-15, -44, 0, 4, 0x4CAF50).setOrigin(0, 0.5);

    this.container.add([
      this.leftLeg, this.rightLeg,
      this.body, this.leftArm, this.rightArm,
      neck, this.head, this.hair,
      leftEyeWhite, rightEyeWhite,
      leftEye, rightEye,
      mouth,
      this.activityIcon,
      this.friendshipBg, this.friendshipBar,
      this.nameLabel,
    ]);
  }

  private addHairStyle() {
    const { id, hairColor } = this.data;
    const extras: Phaser.GameObjects.GameObject[] = [];

    if (id === 'liza') {
      const bangs = this.scene.add.arc(0, -25, 8, 0, 180, false, hairColor);
      const ponytail = this.scene.add.rectangle(0, -10, 6, 20, hairColor).setAngle(20).setOrigin(0.5, 0);
      extras.push(bangs, ponytail);
    } else if (id === 'nena') {
      const glasses = this.scene.add.graphics();
      glasses.lineStyle(1.5, 0x444444, 1);
      glasses.strokeCircle(-4, -16, 4);
      glasses.strokeCircle(4, -16, 4);
      glasses.beginPath(); glasses.moveTo(0, -16); glasses.lineTo(0, -16); glasses.strokePath();
      extras.push(glasses);
    } else if (id === 'danya') {
      const glasses = this.scene.add.graphics();
      glasses.lineStyle(1.5, 0xFF4444, 1);
      glasses.strokeRect(-8, -19, 7, 5);
      glasses.strokeRect(2, -19, 7, 5);
      extras.push(glasses);
    } else if (id === 'igor') {
      const jacket = this.scene.add.rectangle(0, 10, 28, 22, 0x111111).setOrigin(0.5, 0.5);
      jacket.setAlpha(0.8);
    const chain = this.scene.add.arc(0, 2, 6, 0, 360, false);
    chain.setStrokeStyle(1, 0xCCCCCC, 0.9);
      extras.push(jacket, chain);
    }

    if (extras.length > 0) {
      this.container.add(extras);
    }
  }

  private shadeColor(hex: number, percent: number): [number, number, number] {
    const r = (hex >> 16) & 0xFF;
    const g = (hex >> 8) & 0xFF;
    const b = hex & 0xFF;
    return [
      Math.max(0, Math.min(255, r + percent)),
      Math.max(0, Math.min(255, g + percent)),
      Math.max(0, Math.min(255, b + percent))
    ];
  }

  private startBehavior() {
    this.walkTimer = Math.random() * 5000;
  }

  update(delta: number) {
    this.animTimer += delta;
    this.walkTimer += delta;
    this.updateBehavior(delta);
    this.updateAnimation();
    this.updateFriendshipBar();
  }

  private updateBehavior(delta: number) {
    const hours = useGameStore.getState().time / 60;
    const schedule = this.data.schedule.find(s =>
      (s.timeStart < s.timeEnd && hours >= s.timeStart && hours < s.timeEnd) ||
      (s.timeStart > s.timeEnd && (hours >= s.timeStart || hours < s.timeEnd))
    );

    if (schedule) {
      this.activityIcon.setText(this.getActivityIcon(schedule.activity));
      const targetPos = schedule.position;
      const dist = Phaser.Math.Distance.Between(this.x, this.y, targetPos.x, targetPos.y);

      if (dist > 30 && this.walkTimer > 3000) {
        this.walkTo(targetPos.x, targetPos.y);
      }

      if (schedule.activity === 'sleeping') {
        this.behavior = 'sleeping';
      } else if (['sitting_campfire', 'resting', 'lunch_break'].includes(schedule.activity)) {
        this.behavior = 'sitting';
      } else if (['playing_guitar', 'rehearsing', 'mini_concert'].includes(schedule.activity)) {
        this.behavior = 'playing';
      } else if (['building', 'repairing', 'decorating', 'inventing'].includes(schedule.activity)) {
        this.behavior = 'working';
      }
    }

    if (this.walkTarget) {
      const dist = Phaser.Math.Distance.Between(this.x, this.y, this.walkTarget.x, this.walkTarget.y);
      if (dist < 5) {
        this.walkTarget = null;
        this.behavior = 'standing';
        this.walkTimer = 0;
      } else {
        const speed = 60;
        const angle = Math.atan2(this.walkTarget.y - this.y, this.walkTarget.x - this.x);
        this.x += Math.cos(angle) * speed * (delta / 1000);
        this.y += Math.sin(angle) * speed * (delta / 1000);
        this.facingLeft = this.walkTarget.x < this.x;
        this.behavior = 'walking';
        this.container.setPosition(this.x, this.y);
      }
    }
  }

  private walkTo(tx: number, ty: number) {
    this.walkTarget = { x: tx, y: ty };
  }

  private getActivityIcon(activity: string): string {
    const icons: Record<string, string> = {
      playing_guitar: '🎸', rehearsing: '🎵', mini_concert: '🎤',
      sitting_campfire: '🔥', resting: '😌', stargazing: '⭐',
      sleeping: '💤', decorating: '✨', crafting: '🎨',
      repairing: '🔧', building: '🔨', inventing: '⚙️',
      writing: '📝', researching: '📚', photography_dawn: '📷',
      photography_pond: '📷', exploring: '🗺️', fishing: '🎣',
      hiking: '🥾', workshop: '🔧', heavy_lifting: '💪',
      ritual: '🌙', tending_plants: '🌿', hidden: '',
      fixing_wiring: '⚡', observing: '🔭', testing_gadgets: '🔬',
      lunch_break: '🍵', party_setup: '🎉',
    };
    return icons[activity] || '';
  }

  private updateAnimation() {
    const t = this.animTimer * 0.001;

    if (this.behavior === 'walking') {
      this.walkCycle += 0.1;
      const legSwing = Math.sin(this.walkCycle * 8) * 8;
      this.leftLeg.setAngle(-legSwing);
      this.rightLeg.setAngle(legSwing);
      this.leftArm.setAngle(15 + legSwing * 0.5);
      this.rightArm.setAngle(-15 - legSwing * 0.5);
      this.body.setY(10 + Math.abs(Math.sin(this.walkCycle * 8)) * 1.5);
    } else if (this.behavior === 'playing') {
      this.leftArm.setAngle(-40);
      this.rightArm.setAngle(40);
      const strum = Math.sin(t * 6) * 5;
      this.rightArm.setAngle(-15 + strum);
    } else if (this.behavior === 'working') {
      const work = Math.abs(Math.sin(t * 3)) * 20;
      this.rightArm.setAngle(-30 - work);
    } else if (this.behavior === 'sleeping') {
      this.container.setAlpha(0.9);
    } else {
      const breathe = Math.sin(t * 1.5) * 0.5;
      this.body.setY(10 + breathe);
      const idleSwing = Math.sin(t * 0.5) * 2;
      this.leftArm.setAngle(15 + idleSwing);
      this.rightArm.setAngle(-15 - idleSwing);
    }

    this.container.setScale(this.facingLeft ? -1 : 1, 1);
    this.nameLabel.setScale(this.facingLeft ? -1 : 1, 1);
    this.activityIcon.setScale(this.facingLeft ? -1 : 1, 1);
    this.friendshipBg.setScale(this.facingLeft ? -1 : 1, 1);
    this.friendshipBar.setScale(this.facingLeft ? -1 : 1, 1);
  }

  private updateFriendshipBar() {
    const friendship = useGameStore.getState().getFriendship(this.id);
    const w = (friendship / 100) * 30;
    this.friendshipBar.setSize(w, 4);
    if (friendship > 70) this.friendshipBar.setFillStyle(0xFFD700);
    else if (friendship > 40) this.friendshipBar.setFillStyle(0x4CAF50);
    else this.friendshipBar.setFillStyle(0x2196F3);
  }
}
