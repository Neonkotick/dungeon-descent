import Phaser from 'phaser';
import type { GameState, ItemInstance } from '../save/SaveManager';
import { saveManager } from '../save/SaveManager';
import { getSellPrice } from '../items/ItemGenerator';
import { RARITY_COLORS } from '../data/items';
import { TelegramService } from '../telegram/TelegramService';

export class InventoryScene extends Phaser.Scene {
  private state!: GameState;
  private returnScene = 'DungeonScene';
  private listContainer!: Phaser.GameObjects.Container;

  constructor() { super({ key: 'InventoryScene' }); }

  init(data: { state: GameState; returnScene?: string }): void {
    this.state = data.state;
    this.returnScene = data.returnScene || 'DungeonScene';
  }

  create(): void {
    const { width, height } = this.cameras.main;
    this.cameras.main.setBackgroundColor(0x0a0a0f);
    TelegramService.showBackButton(() => this.goBack());

    this.add.text(width / 2, 16, 'INVENTORY', {
      fontFamily: 'monospace', fontSize: '14px', color: '#c9a227',
    }).setOrigin(0.5);

    this.add.text(10, 8, `Gold: ${this.state.gold}`, {
      fontFamily: 'monospace', fontSize: '10px', color: '#ffd700',
    });

    this.listContainer = this.add.container(0, 0);
    this.renderList();

    this.add.text(10, height - 40, this.equippedSummary(), {
      fontFamily: 'monospace', fontSize: '9px', color: '#8888aa',
      wordWrap: { width: 460 },
    });
  }

  private equippedSummary(): string {
    const e = this.state.equipment;
    const parts: string[] = [];
    if (e.weapon) parts.push(`W: ${e.weapon.name}`);
    if (e.armor) parts.push(`A: ${e.armor.name}`);
    if (e.helmet) parts.push(`H: ${e.helmet.name}`);
    return parts.length ? 'Equipped: ' + parts.join(' | ') : 'No equipment beyond starting weapon';
  }

  private renderList(): void {
    this.listContainer.removeAll(true);
    const items = this.state.inventory;
    if (items.length === 0) {
      this.listContainer.add(
        this.add.text(240, 80, 'Empty', { fontFamily: 'monospace', fontSize: '12px', color: '#666' }).setOrigin(0.5)
      );
      return;
    }
    items.forEach((item, i) => {
      const y = 40 + i * 28;
      if (y > 200) return;
      const color = '#' + RARITY_COLORS[item.rarity].toString(16).padStart(6, '0');
      const row = this.add.container(0, y);
      const bg = this.add.rectangle(240, 0, 440, 26, 0x1a1520).setInteractive({ useHandCursor: true });
      bg.setStrokeStyle(1, RARITY_COLORS[item.rarity]);
      const label = this.add.text(30, 0, `${item.name} [${item.rarity}]`, {
        fontFamily: 'monospace', fontSize: '10px', color,
      }).setOrigin(0, 0.5);
      row.add([bg, label]);
      bg.on('pointerdown', () => this.showItemActions(item, i));
      this.listContainer.add(row);
    });
  }

  private showItemActions(item: ItemInstance, index: number): void {
    TelegramService.haptic('light');
    const isEquip = ['weapon', 'helmet', 'armor', 'gloves', 'boots', 'accessory'].includes(item.slot);
    if (isEquip) {
      const slot = item.slot as keyof typeof this.state.equipment;
      const old = this.state.equipment[slot];
      this.state.equipment[slot] = item;
      this.state.inventory.splice(index, 1);
      if (old && old.definitionId !== 'rustbound_sword') this.state.inventory.push(old);
      saveManager.saveRun(this.state);
      TelegramService.showAlert(`Equipped ${item.name}`);
      this.renderList();
    } else {
      this.state.gold += getSellPrice(item);
      this.state.inventory.splice(index, 1);
      saveManager.saveRun(this.state);
      TelegramService.showAlert(`Sold for ${getSellPrice(item)}g`);
      this.renderList();
    }
  }

  private goBack(): void {
    saveManager.saveRun(this.state);
    this.scene.start(this.returnScene, { state: this.state });
  }
}
