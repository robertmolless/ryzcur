import Phaser from 'phaser';
import { SCENE_KEYS } from '../constants';
import { useGameStore } from '../../store/gameStore';
import { DIALOGUE } from '../data/dialogue';
import { QUESTS } from '../data/quests';

export class UIScene extends Phaser.Scene {
  private hudContainer!: Phaser.GameObjects.Container;
  private timeText!: Phaser.GameObjects.Text;
  private weatherIcon!: Phaser.GameObjects.Text;
  private moodText!: Phaser.GameObjects.Text;
  private dayText!: Phaser.GameObjects.Text;
  private seasonText!: Phaser.GameObjects.Text;

  private dialogueContainer!: Phaser.GameObjects.Container;
  private dialogueText!: Phaser.GameObjects.Text;
  private speakerText!: Phaser.GameObjects.Text;
  private choiceButtons: Phaser.GameObjects.Container[] = [];
  private currentDialogueTree: any = null;
  private currentLineIndex = 0;

  private questLogContainer!: Phaser.GameObjects.Container;
  private inventoryContainer!: Phaser.GameObjects.Container;

  private friendshipPanels: Phaser.GameObjects.Container[] = [];
  private notificationQueue: string[] = [];
  private showingNotification = false;

  private updateInterval = 0;

  constructor() { super({ key: SCENE_KEYS.UI }); }

  create() {
    const W = this.cameras.main.width;
    const H = this.cameras.main.height;

    this.createHUD(W, H);
    this.createDialogueBox(W, H);
    this.createQuestLog(W, H);
    this.createInventory(W, H);
    this.createMinimap(W, H);

    this.input.keyboard!.on('keydown-SPACE', () => this.advanceDialogue());
    this.input.keyboard!.on('keydown-ESC', () => this.closeAllPanels());
  }

  private createHUD(W: number, H: number) {
    this.hudContainer = this.add.container(0, 0).setDepth(200);

    const topBar = this.add.rectangle(W / 2, 0, W, 50, 0x000000, 0.4)
      .setOrigin(0.5, 0).setStrokeStyle(1, 0xFF8C32, 0.2);

    this.timeText = this.add.text(20, 12, '🕐 09:00', { fontSize: '13px', color: '#FFE082' });
    this.dayText = this.add.text(100, 12, 'День 1', { fontSize: '11px', color: '#CCBBAA' });
    this.seasonText = this.add.text(155, 12, '☀️ Лето', { fontSize: '11px', color: '#90EE90' });
    this.weatherIcon = this.add.text(215, 12, '🌤️', { fontSize: '14px' });
    this.moodText = this.add.text(W - 90, 12, '😺 Спокоен', { fontSize: '11px', color: '#FF8C32' });

    const questHint = this.add.text(W / 2, 32, '[Q] Квесты  [I] Инвентарь  [E] Говорить  [WASD] Движение', {
      fontSize: '9px', color: '#888888', align: 'center'
    }).setOrigin(0.5);

    this.hudContainer.add([topBar, this.timeText, this.dayText, this.seasonText, this.weatherIcon, this.moodText, questHint]);
  }

  private createDialogueBox(W: number, H: number) {
    this.dialogueContainer = this.add.container(W / 2, H - 20).setDepth(300).setVisible(false);

    const boxBg = this.add.rectangle(0, 0, W * 0.85, 150, 0x0A0A1A, 0.92)
      .setOrigin(0.5, 1)
      .setStrokeStyle(2, 0xFF8C32, 0.8);

    const boxAccent = this.add.rectangle(0, -144, W * 0.85, 6, 0xFF8C32, 0.6)
      .setOrigin(0.5, 0);

    this.speakerText = this.add.text(-W * 0.4, -145, '', {
      fontSize: '13px', color: '#FF8C32', fontStyle: 'bold',
      backgroundColor: 'rgba(10,10,26,0.9)', padding: { x: 10, y: 4 }
    }).setOrigin(0, 1);

    this.dialogueText = this.add.text(0, -110, '', {
      fontSize: '13px', color: '#EEEEEE', wordWrap: { width: W * 0.78 }, lineSpacing: 6,
      align: 'left'
    }).setOrigin(0.5);

    const continueHint = this.add.text(W * 0.39, -10, '[ПРОБЕЛ / Клик]', {
      fontSize: '9px', color: '#666666', fontStyle: 'italic'
    }).setOrigin(1, 1);

    this.dialogueContainer.add([boxBg, boxAccent, this.speakerText, this.dialogueText, continueHint]);

    this.dialogueContainer.setInteractive(
      new Phaser.Geom.Rectangle(-W * 0.425, -155, W * 0.85, 155),
      Phaser.Geom.Rectangle.Contains
    ).on('pointerdown', () => this.advanceDialogue());
  }

  private createQuestLog(W: number, H: number) {
    this.questLogContainer = this.add.container(W / 2, H / 2).setDepth(250).setVisible(false);

    const panelW = 420;
    const panelH = 320;
    const bg = this.add.rectangle(0, 0, panelW, panelH, 0x0A0A1A, 0.95)
      .setStrokeStyle(2, 0xFF8C32, 0.8);

    const title = this.add.text(0, -panelH / 2 + 20, '📋  Журнал квестов', {
      fontSize: '15px', color: '#FF8C32', fontStyle: 'bold'
    }).setOrigin(0.5);

    const closeBtn = this.add.text(panelW / 2 - 15, -panelH / 2 + 15, '✕', {
      fontSize: '14px', color: '#FF6666'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => useGameStore.getState().toggleQuestLog());

    this.questLogContainer.add([bg, title, closeBtn]);
    this.questLogContainer.setInteractive(
      new Phaser.Geom.Rectangle(-panelW / 2, -panelH / 2, panelW, panelH),
      Phaser.Geom.Rectangle.Contains
    );
  }

  private createInventory(W: number, H: number) {
    this.inventoryContainer = this.add.container(W / 2, H / 2).setDepth(250).setVisible(false);

    const panelW = 380;
    const panelH = 280;
    const bg = this.add.rectangle(0, 0, panelW, panelH, 0x0A0A1A, 0.95)
      .setStrokeStyle(2, 0x4A90D9, 0.8);

    const title = this.add.text(0, -panelH / 2 + 20, '🎒  Инвентарь Рыжика', {
      fontSize: '14px', color: '#87CEEB', fontStyle: 'bold'
    }).setOrigin(0.5);

    const closeBtn = this.add.text(panelW / 2 - 15, -panelH / 2 + 15, '✕', {
      fontSize: '14px', color: '#FF6666'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => useGameStore.getState().toggleInventory());

    this.inventoryContainer.add([bg, title, closeBtn]);
    this.inventoryContainer.setInteractive(
      new Phaser.Geom.Rectangle(-panelW / 2, -panelH / 2, panelW, panelH),
      Phaser.Geom.Rectangle.Contains
    );
  }

  private createMinimap(W: number, H: number) {
    const mapBg = this.add.rectangle(W - 10, H - 10, 120, 80, 0x0A0A1A, 0.7)
      .setOrigin(1, 1).setStrokeStyle(1, 0x555555, 0.8).setDepth(200);

    const mapTitle = this.add.text(W - 65, H - 82, '🗺️ Карта', {
      fontSize: '9px', color: '#AAAAAA'
    }).setOrigin(0.5).setDepth(201);

    const locations = [
      { name: 'ЛЕС', x: W - 118, y: H - 55, color: 0x2D5A27 },
      { name: 'ДВОР', x: W - 80, y: H - 50, color: 0x7CB342 },
      { name: 'ДОМ', x: W - 70, y: H - 40, color: 0x8B4513 },
      { name: 'ПРУД', x: W - 35, y: H - 55, color: 0x29B6F6 },
    ];

    locations.forEach(loc => {
      this.add.rectangle(loc.x, loc.y, 20, 14, loc.color, 0.7)
        .setStrokeStyle(0.5, 0xFFFFFF, 0.3).setDepth(201);
      this.add.text(loc.x, loc.y, loc.name, {
        fontSize: '5px', color: '#FFFFFF'
      }).setOrigin(0.5).setDepth(202);
    });
  }

  private updateQuestLogContent() {
    while (this.questLogContainer.length > 3) {
      const last = this.questLogContainer.list[this.questLogContainer.length - 1] as Phaser.GameObjects.GameObject;
      this.questLogContainer.remove(last, true);
    }

    const store = useGameStore.getState();
    const panelH = 320;
    let yOff = -panelH / 2 + 55;

    QUESTS.forEach(quest => {
      const progress = store.getQuestStatus(quest.id);
      if (progress.status === 'locked') return;

      const statusIcon = progress.status === 'completed' ? '✅' :
                         progress.status === 'active' ? '📌' : '💬';
      const color = progress.status === 'completed' ? '#90EE90' :
                    progress.status === 'active' ? '#FFD700' : '#CCCCCC';

      const questText = this.add.text(-190, yOff, `${statusIcon} ${quest.titleRu}`, {
        fontSize: '11px', color
      });

      if (progress.status === 'active') {
        const currentStep = quest.steps[progress.currentStep];
        if (currentStep) {
          this.add.text(-180, yOff + 14, `→ ${currentStep.description}`, {
            fontSize: '9px', color: '#AAAAAA'
          });
          yOff += 28;
        }
      }

      this.questLogContainer.add(questText);
      yOff += 24;
    });

    const totalQuests = QUESTS.length;
    const completedQuests = QUESTS.filter(q => store.getQuestStatus(q.id).status === 'completed').length;
    const progressText = this.add.text(0, panelH / 2 - 25, `Выполнено: ${completedQuests}/${totalQuests}`, {
      fontSize: '10px', color: '#888888'
    }).setOrigin(0.5);
    this.questLogContainer.add(progressText);
  }

  private updateInventoryContent() {
    while (this.inventoryContainer.length > 3) {
      const last = this.inventoryContainer.list[this.inventoryContainer.length - 1] as Phaser.GameObjects.GameObject;
      this.inventoryContainer.remove(last, true);
    }

    const store = useGameStore.getState();
    const items = store.inventory;
    const panelH = 280;
    let yOff = -panelH / 2 + 55;
    let xOff = -170;
    let col = 0;

    if (items.length === 0) {
      const emptyText = this.add.text(0, 0, 'Инвентарь пуст...', { fontSize: '12px', color: '#666666' }).setOrigin(0.5);
      this.inventoryContainer.add(emptyText);
      return;
    }

    items.slice(0, 20).forEach((item, i) => {
      const itemBg = this.add.rectangle(xOff + col * 90, yOff, 80, 50, 0x1A1A2E, 0.8)
        .setStrokeStyle(1, 0x444466, 0.6).setOrigin(0.5);
      const itemIcon = this.add.text(xOff + col * 90, yOff - 10, item.icon, { fontSize: '16px' }).setOrigin(0.5);
      const itemName = this.add.text(xOff + col * 90, yOff + 12, item.nameRu.substring(0, 10), {
        fontSize: '8px', color: '#CCCCCC'
      }).setOrigin(0.5);
      this.inventoryContainer.add([itemBg, itemIcon, itemName]);

      col++;
      if (col >= 4) { col = 0; yOff += 60; }
    });

    const stats = this.add.text(0, panelH / 2 - 25, `Предметов: ${items.length}  📼 Кассет: ${store.cassettes.length}  📸 Фото: ${store.photos.length}`, {
      fontSize: '9px', color: '#888888'
    }).setOrigin(0.5);
    this.inventoryContainer.add(stats);
  }

  openDialogue(npcId: string) {
    const trees = DIALOGUE[npcId];
    if (!trees || trees.length === 0) return;

    const store = useGameStore.getState();
    let treeId = trees[0].id;

    const quest = QUESTS.find(q => q.npcId === npcId);
    if (quest) {
      const progress = store.getQuestStatus(quest.id);
      if (progress.status === 'completed') {
        treeId = `${npcId}_daily`;
      } else if (progress.status === 'active') {
        treeId = quest.id + '_active';
      }
    }

    this.currentDialogueTree = trees.find(t => t.id === treeId) || trees[0];
    this.currentLineIndex = 0;
    this.showDialogueLine();
    this.dialogueContainer.setVisible(true);
  }

  private showDialogueLine() {
    if (!this.currentDialogueTree) return;
    const lines = this.currentDialogueTree.lines;

    if (this.currentLineIndex >= lines.length) {
      this.showDialogueChoices();
      return;
    }

    const line = lines[this.currentLineIndex];
    this.speakerText.setText(line.speaker);
    this.dialogueText.setText('');

    this.clearChoices();

    let charIndex = 0;
    const fullText = line.text;
    const typeTimer = this.time.addEvent({
      delay: 25,
      callback: () => {
        if (charIndex < fullText.length) {
          this.dialogueText.setText(fullText.substring(0, ++charIndex));
        } else {
          typeTimer.destroy();
        }
      },
      loop: true
    });
  }

  private advanceDialogue() {
    if (!this.currentDialogueTree) return;
    const lines = this.currentDialogueTree.lines;

    if (this.currentLineIndex < lines.length - 1) {
      this.currentLineIndex++;
      this.showDialogueLine();
    } else if (this.currentDialogueTree.choices && this.currentDialogueTree.choices.length > 0) {
      this.showDialogueChoices();
    } else {
      this.closeDialogue();
    }
  }

  private showDialogueChoices() {
    if (!this.currentDialogueTree?.choices) {
      this.closeDialogue();
      return;
    }

    this.clearChoices();
    const choices = this.currentDialogueTree.choices;
    const W = this.cameras.main.width;

    choices.forEach((choice: any, i: number) => {
      const y = -50 + i * 35;
      const choiceContainer = this.add.container(0, y);

      const bg = this.add.rectangle(0, 0, W * 0.75, 28, 0x1A1A3E, 0.9)
        .setStrokeStyle(1, 0x4A90D9, 0.6).setInteractive({ useHandCursor: true });

      const text = this.add.text(0, 0, choice.text, {
        fontSize: '11px', color: '#87CEEB'
      }).setOrigin(0.5);

      bg.on('pointerover', () => { bg.setFillStyle(0x2A2A5E, 0.95); text.setColor('#FFD700'); });
      bg.on('pointerout', () => { bg.setFillStyle(0x1A1A3E, 0.9); text.setColor('#87CEEB'); });
      bg.on('pointerdown', () => this.selectChoice(choice));

      choiceContainer.add([bg, text]);
      this.dialogueContainer.add(choiceContainer);
      this.choiceButtons.push(choiceContainer);
    });
  }

  private selectChoice(choice: any) {
    const store = useGameStore.getState();
    if (choice.effect) {
      if (choice.effect.friendship) store.addFriendship(this.currentDialogueTree?.npcId || '', choice.effect.friendship);
      if (choice.effect.questProgress) {
        store.startQuest(choice.effect.questProgress);
        this.showNotification(`📌 Новый квест: ${QUESTS.find(q => q.id === choice.effect.questProgress)?.titleRu || ''}`);
      }
    }

    if (choice.nextId) {
      const trees = DIALOGUE[store.currentDialogueNPC || ''];
      const nextTree = trees?.find((t: any) => t.id === choice.nextId);
      if (nextTree) {
        this.currentDialogueTree = nextTree;
        this.currentLineIndex = 0;
        this.clearChoices();
        this.showDialogueLine();
        return;
      }
    }

    this.closeDialogue();
  }

  private clearChoices() {
    this.choiceButtons.forEach(btn => {
      this.dialogueContainer.remove(btn, true);
    });
    this.choiceButtons = [];
  }

  private closeDialogue() {
    this.dialogueContainer.setVisible(false);
    this.currentDialogueTree = null;
    this.currentLineIndex = 0;
    this.clearChoices();
    useGameStore.getState().closeDialogue();
  }

  private closeAllPanels() {
    this.closeDialogue();
    const store = useGameStore.getState();
    if (store.showQuestLog) store.toggleQuestLog();
    if (store.showInventory) store.toggleInventory();
  }

  showNotification(message: string) {
    const W = this.cameras.main.width;
    const notif = this.add.rectangle(W / 2, 70, 320, 36, 0x1A1A3E, 0.92)
      .setStrokeStyle(1, 0xFF8C32, 0.8).setDepth(500);
    const notifText = this.add.text(W / 2, 70, message, {
      fontSize: '12px', color: '#FFD700', align: 'center'
    }).setOrigin(0.5).setDepth(501);

    this.tweens.add({
      targets: [notif, notifText], alpha: { from: 0, to: 1 },
      duration: 400, ease: 'Power2', onComplete: () => {
        this.tweens.add({
          targets: [notif, notifText], alpha: 0,
          duration: 500, delay: 3000,
          onComplete: () => { notif.destroy(); notifText.destroy(); }
        });
      }
    });
  }

  update(time: number, delta: number) {
    this.updateInterval += delta;
    if (this.updateInterval < 500) return;
    this.updateInterval = 0;

    const store = useGameStore.getState();
    this.updateHUD(store);

    if (store.showDialogue && store.currentDialogueNPC) {
      if (!this.dialogueContainer.visible) {
        this.openDialogue(store.currentDialogueNPC);
      }
    } else if (!store.showDialogue && this.dialogueContainer.visible) {
      this.closeDialogue();
    }

    this.questLogContainer.setVisible(store.showQuestLog);
    this.inventoryContainer.setVisible(store.showInventory);

    if (store.showQuestLog) this.updateQuestLogContent();
    if (store.showInventory) this.updateInventoryContent();
  }

  private updateHUD(store: ReturnType<typeof useGameStore.getState>) {
    const hours = Math.floor(store.time / 60);
    const mins = Math.floor(store.time % 60);
    const timeStr = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;

    const timeIcons: Record<number, string> = { 5: '🌅', 8: '☀️', 12: '🌞', 17: '🌇', 20: '🌙', 23: '⭐' };
    let timeIcon = '🌙';
    Object.entries(timeIcons).forEach(([h, icon]) => { if (hours >= parseInt(h)) timeIcon = icon; });

    this.timeText.setText(`${timeIcon} ${timeStr}`);
    this.dayText.setText(`День ${store.day}`);

    const seasonIcons = { summer: '☀️', autumn: '🍂', winter: '❄️', spring: '🌸' };
    const seasonNames = { summer: 'Лето', autumn: 'Осень', winter: 'Зима', spring: 'Весна' };
    this.seasonText.setText(`${seasonIcons[store.season]} ${seasonNames[store.season]}`);

    const weatherIcons: Record<string, string> = {
      clear: '🌤️', cloudy: '☁️', rain: '🌧️', storm: '⛈️', fog: '🌫️', windy: '💨'
    };
    this.weatherIcon.setText(weatherIcons[store.weather] || '🌤️');

    const moodIcons: Record<string, string> = {
      happy: '😸', curious: '🐱', sleepy: '😴', playful: '😺', calm: '😌'
    };
    const moodNames: Record<string, string> = {
      happy: 'Счастлив', curious: 'Любопытен', sleepy: 'Сонный', playful: 'Игривый', calm: 'Спокоен'
    };
    this.moodText.setText(`${moodIcons[store.catMood]} ${moodNames[store.catMood]}`);
  }
}
