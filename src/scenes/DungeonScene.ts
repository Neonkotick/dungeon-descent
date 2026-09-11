import Phaser from 'phaser';
import type { GameState, RoomChoice, RoomType } from '../save/SaveManager';
import { saveManager } from '../save/SaveManager';
import { generateFloor, getRoomChoices, getEnemyIdsForRoom, type DungeonFloor } from '../dungeon/DungeonGenerator';
import { getFloor } from '../data/floors';
import { TelegramService } from '../telegram/TelegramService';
import { generateItem, generateBossLoot } from '../items/ItemGenerator';

export class DungeonScene extends Phaser.Scene {
  private state!: GameState;
  private floorData!: DungeonFloor;
  private statusText!: Phaser.GameObjects.Text;
  private choiceContainer!: Phaser.GameObjects.Container;
  private battleVictory = false;
  private victoryRoomType: RoomType | null = null;

  constructor() { super({ key: 'DungeonScene' }); }

  init(data: { state: GameState; battleVictory?: boolean; roomType?: RoomType }): void {
    this.state = data.state;
    this.battleVictory = !!data.battleVictory;
    this.victoryRoomType = data.roomType || null;
  }

  create(): void {
    const { width, height } = this.cameras.main;
    TelegramService.showBackButton(() => {
      saveManager.saveRun(this.state);
      this.scene.start('MainMenuScene');
    });

    const floorDef = getFloor(this.state.currentFloor);
    this.cameras.main.setBackgroundColor(floorDef.backgroundColor);

    this.add.text(width / 2, 16, floorDef.name, {
      fontFamily: 'monospace', fontSize: '14px', color: '#c9a227',
    }).setOrigin(0.5);
    this.add.text(10, 8, `Floor ${this.state.currentFloor}`, {
      fontFamily: 'monospace', fontSize: '10px', color: '#8888aa',
    });
    this.add.text(width - 10, 8, `Gold: ${this.state.gold}`, {
      fontFamily: 'monospace', fontSize: '10px', color: '#ffd700',
    }).setOrigin(1, 0);

    this.statusText = this.add.text(10, 28, this.getStatusLine(), {
      fontFamily: 'monospace', fontSize: '10px', color: '#aaccaa',
    });

    this.choiceContainer = this.add.container(0, 0);

    this.createSmallButton(width - 50, height - 20, 'INV', () => {
      saveManager.saveRun(this.state);
      this.scene.start('InventoryScene', { state: this.state, returnScene: 'DungeonScene' });
    });

    if (!this.floorData || this.floorData.floorId !== this.state.currentFloor) {
      this.floorData = generateFloor(this.state.currentFloor, this.state.dungeonSeed);
    }

    if (this.battleVictory) {
      this.handleBattleVictory(this.victoryRoomType || 'combat');
    } else {
      this.showCurrentRoom();
    }
  }

  private getStatusLine(): string {
    const s = this.state.player.stats;
    return `HP ${s.hp}/${s.maxHp}  MP ${s.mp}/${s.maxMp}  Lv${this.state.player.level}`;
  }

  private handleBattleVictory(roomType: RoomType): void {
    if (roomType === 'boss') {
      this.state.runStats.bossesDefeated += 1;
      this.state.runStats.floorsCleared += 1;
      const loot = generateBossLoot(this.state.currentFloor);
      for (const item of loot) {
        this.state.inventory.push(item);
        this.state.runStats.itemsFound += 1;
      }
      const bossGold = 50 + this.state.currentFloor * 20;
      this.state.gold += bossGold;
      this.state.runStats.goldEarned += bossGold;
      this.floorData.rooms[this.floorData.currentIndex].completed = true;
      saveManager.saveRun(this.state);
      this.showMessage(`Boss defeated! +${bossGold} gold & rare loot`, () => this.goNextFloor());
    } else {
      this.floorData.rooms[this.floorData.currentIndex].completed = true;
      saveManager.saveRun(this.state);
      this.showRoomChoices();
    }
  }

  private showCurrentRoom(): void {
    this.choiceContainer.removeAll(true);
    const { width } = this.cameras.main;
    const room = this.floorData.rooms[this.floorData.currentIndex];
    if (!room) { this.goNextFloor(); return; }

    this.state.currentRoomType = room.type;
    this.state.currentRoomIndex = room.index;

    const titles: Record<RoomType, string> = {
      combat: '⚔ Combat Room', elite: '☠ Elite Encounter', treasure: '💰 Treasure Chamber',
      event: '? Strange Event', rest: '🏕️ Rest Site', shop: '🛒 Merchant',
      secret: '✦ Hidden Room', boss: '👑 BOSS ROOM',
    };
    this.choiceContainer.add(
      this.add.text(width / 2, 70, titles[room.type] || room.type, {
        fontFamily: 'monospace', fontSize: '16px', color: '#e0d0b0',
      }).setOrigin(0.5)
    );

    if (room.completed) { this.showRoomChoices(); return; }

    this.choiceContainer.add(
      this.createChoiceButton(width / 2, 130, `Enter ${room.type.toUpperCase()}`, () => this.enterRoom(room.type))
    );
  }

  private enterRoom(type: RoomType): void {
    TelegramService.haptic('medium');
    const room = this.floorData.rooms[this.floorData.currentIndex];
    switch (type) {
      case 'combat': case 'elite': case 'boss': {
        const enemyIds = getEnemyIdsForRoom(this.state.currentFloor, type, this.state.dungeonSeed + room.index);
        saveManager.saveRun(this.state);
        this.scene.start('BattleScene', { state: this.state, enemyIds, roomType: type });
        break;
      }
      case 'treasure': this.doTreasure(); break;
      case 'rest': this.doRest(); break;
      case 'shop': this.doShop(); break;
      case 'event': this.doEvent(); break;
      default: this.completeRoom();
    }
  }

  private doTreasure(): void {
    const item = generateItem(this.state.currentFloor);
    this.state.inventory.push(item);
    this.state.runStats.itemsFound += 1;
    this.showLootPopup(item.name, item.rarity, () => this.completeRoom());
  }

  private doRest(): void {
    const heal = Math.floor(this.state.player.stats.maxHp * 0.4);
    this.state.player.stats.hp = Math.min(this.state.player.stats.maxHp, this.state.player.stats.hp + heal);
    this.state.player.stats.mp = Math.min(this.state.player.stats.maxMp, this.state.player.stats.mp + 10);
    this.statusText.setText(this.getStatusLine());
    this.showMessage(`Rested. +${heal} HP, +10 MP`, () => this.completeRoom());
  }

  private doShop(): void {
    if (this.state.gold >= 25) {
      this.state.gold -= 25;
      this.state.consumables.potion += 1;
      this.showMessage('Bought a Potion for 25 gold', () => this.completeRoom());
    } else {
      this.showMessage('Not enough gold for potion (25)', () => this.completeRoom());
    }
  }

  private doEvent(): void {
    const roll = Math.random();
    if (roll < 0.4) {
      const gold = 15 + Math.floor(Math.random() * 20);
      this.state.gold += gold;
      this.state.runStats.goldEarned += gold;
      this.showMessage(`Found a hidden stash: +${gold} gold`, () => this.completeRoom());
    } else if (roll < 0.7) {
      const dmg = 8 + Math.floor(Math.random() * 12);
      this.state.player.stats.hp = Math.max(1, this.state.player.stats.hp - dmg);
      this.statusText.setText(this.getStatusLine());
      this.showMessage(`Trap! Took ${dmg} damage`, () => this.completeRoom());
    } else {
      const item = generateItem(this.state.currentFloor, 'uncommon');
      this.state.inventory.push(item);
      this.showLootPopup(item.name, item.rarity, () => this.completeRoom());
    }
  }

  private completeRoom(): void {
    this.floorData.rooms[this.floorData.currentIndex].completed = true;
    saveManager.saveRun(this.state);
    this.showRoomChoices();
  }

  private showRoomChoices(): void {
    this.choiceContainer.removeAll(true);
    const { width } = this.cameras.main;
    const choices = getRoomChoices(this.floorData, this.floorData.currentIndex);
    if (choices.length === 0) { this.goNextFloor(); return; }

    this.choiceContainer.add(
      this.add.text(width / 2, 70, 'CHOOSE NEXT ROOM', {
        fontFamily: 'monospace', fontSize: '12px', color: '#8888aa',
      }).setOrigin(0.5)
    );
    choices.forEach((c, i) => {
      this.choiceContainer.add(
        this.createChoiceButton(width / 2, 110 + i * 40, `${c.icon} ${c.label}`, () => this.selectRoom(c),
          c.danger >= 3 ? 0x5a2020 : 0x4a3728)
      );
    });
  }

  private selectRoom(choice: RoomChoice): void {
    const nextIdx = this.floorData.currentIndex + 1;
    if (nextIdx < this.floorData.rooms.length) {
      this.floorData.rooms[nextIdx].type = choice.type;
      this.floorData.currentIndex = nextIdx;
    }
    this.showCurrentRoom();
  }

  private goNextFloor(): void {
    this.state.currentFloor += 1;
    this.state.currentRoomIndex = 0;
    this.floorData = generateFloor(this.state.currentFloor, this.state.dungeonSeed);
    saveManager.saveRun(this.state);
    this.showMessage(`Descending to Floor ${this.state.currentFloor}...`, () => {
      this.scene.restart({ state: this.state });
    });
  }

  private createChoiceButton(x: number, y: number, label: string, cb: () => void, color = 0x4a3728): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    const bg = this.add.rectangle(0, 0, 180, 30, color).setInteractive({ useHandCursor: true });
    bg.setStrokeStyle(1, 0x8b6914);
    const text = this.add.text(0, 0, label, {
      fontFamily: 'monospace', fontSize: '12px', color: '#e0d0b0',
    }).setOrigin(0.5);
    container.add([bg, text]);
    bg.on('pointerdown', () => { TelegramService.haptic('light'); cb(); });
    return container;
  }

  private createSmallButton(x: number, y: number, label: string, cb: () => void): void {
    const bg = this.add.rectangle(x, y, 40, 20, 0x333344).setInteractive({ useHandCursor: true });
    bg.setStrokeStyle(1, 0x666688);
    this.add.text(x, y, label, { fontFamily: 'monospace', fontSize: '9px', color: '#aaaacc' }).setOrigin(0.5);
    bg.on('pointerdown', cb);
  }

  private showMessage(msg: string, onClose: () => void): void {
    this.choiceContainer.removeAll(true);
    const { width } = this.cameras.main;
    this.choiceContainer.add(
      this.add.text(width / 2, 120, msg, {
        fontFamily: 'monospace', fontSize: '12px', color: '#e0d0b0',
        align: 'center', wordWrap: { width: 400 },
      }).setOrigin(0.5)
    );
    this.choiceContainer.add(this.createChoiceButton(width / 2, 180, 'CONTINUE', onClose));
  }

  private showLootPopup(name: string, rarity: string, onClose: () => void): void {
    this.choiceContainer.removeAll(true);
    const { width } = this.cameras.main;
    const colors: Record<string, string> = {
      common: '#aaaaaa', uncommon: '#4caf50', rare: '#2196f3',
      epic: '#9c27b0', legendary: '#ff9800', unique: '#f44336',
    };
    const box = this.add.rectangle(width / 2, 130, 220, 100, 0x1a1520);
    box.setStrokeStyle(2, Phaser.Display.Color.HexStringToColor(colors[rarity] || '#aaa').color);
    this.choiceContainer.add(box);
    this.choiceContainer.add(this.add.text(width / 2, 100, rarity.toUpperCase(), {
      fontFamily: 'monospace', fontSize: '10px', color: colors[rarity] || '#aaa',
    }).setOrigin(0.5));
    this.choiceContainer.add(this.add.text(width / 2, 125, name, {
      fontFamily: 'monospace', fontSize: '13px', color: '#e0d0b0',
    }).setOrigin(0.5));
    this.choiceContainer.add(this.createChoiceButton(width / 2, 190, 'TAKE', onClose));
    TelegramService.hapticSuccess();
  }
}
