import Phaser from 'phaser';
import { saveManager, createNewRunState } from '../save/SaveManager';
import { TelegramService } from '../telegram/TelegramService';

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainMenuScene' });
  }

  create(): void {
    const { width, height } = this.cameras.main;
    TelegramService.hideBackButton();
    TelegramService.hideMainButton();

    this.add.rectangle(width / 2, height / 2, width, height, 0x0a0a0f);

    this.add
      .text(width / 2, 50, 'DUNGEON', {
        fontFamily: 'monospace',
        fontSize: '28px',
        color: '#c9a227',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, 78, 'DESCENT', {
        fontFamily: 'monospace',
        fontSize: '22px',
        color: '#8b6914',
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, 100, 'Enter the dungeon.', {
        fontFamily: 'monospace',
        fontSize: '10px',
        color: '#666688',
      })
      .setOrigin(0.5);

    const meta = saveManager.loadMeta();

    this.add
      .text(width / 2, 120, `Best Floor: ${meta.bestFloor}`, {
        fontFamily: 'monospace',
        fontSize: '11px',
        color: '#8888aa',
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, 134, `Soul Shards: ${meta.soulShards}`, {
        fontFamily: 'monospace',
        fontSize: '10px',
        color: '#9b59b6',
      })
      .setOrigin(0.5);

    this.createButton(width / 2, 170, 'START RUN', () => this.startRun());
    this.createButton(width / 2, 205, 'UPGRADES', () => this.showUpgrades());
    this.createButton(width / 2, 240, 'CODEX', () => {
      TelegramService.showAlert('Codex coming in v0.2');
    });

    const existing = saveManager.loadRun();
    if (existing && !existing.isDead) {
      this.createButton(width / 2, 30, 'CONTINUE', () => {
        this.scene.start('DungeonScene', { state: existing });
      }, 0x2d5a27);
    }
  }

  private createButton(x: number, y: number, label: string, cb: () => void, color = 0x4a3728): void {
    const bg = this.add.rectangle(x, y, 140, 26, color).setInteractive({ useHandCursor: true });
    bg.setStrokeStyle(1, 0x8b6914);
    this.add
      .text(x, y, label, {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#e0d0b0',
      })
      .setOrigin(0.5);

    bg.on('pointerdown', () => {
      TelegramService.haptic('light');
      bg.setFillStyle(0x6b4f2a);
    });
    bg.on('pointerup', () => {
      bg.setFillStyle(color);
      cb();
    });
    bg.on('pointerout', () => bg.setFillStyle(color));
  }

  private startRun(): void {
    const meta = saveManager.loadMeta();
    const state = createNewRunState(meta);
    saveManager.saveRun(state);
    this.scene.start('DungeonScene', { state });
  }

  private showUpgrades(): void {
    const meta = saveManager.loadMeta();
    const msg = `Soul Shards: ${meta.soulShards}\n\n+5% Starting HP (10 shards)\n+1 Starting Potion (15 shards)\n\n(Upgrades UI in progress)`;
    TelegramService.showAlert(msg);
  }
}
