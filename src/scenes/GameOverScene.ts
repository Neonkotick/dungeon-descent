import Phaser from 'phaser';
import type { GameState } from '../save/SaveManager';
import { saveManager } from '../save/SaveManager';
import { TelegramService } from '../telegram/TelegramService';

export class GameOverScene extends Phaser.Scene {
  private state!: GameState;

  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data: { state: GameState }): void {
    this.state = data.state;
  }

  create(): void {
    const { width, height } = this.cameras.main;
    this.cameras.main.setBackgroundColor(0x1a0a0a);
    TelegramService.hideBackButton();

    this.add
      .text(width / 2, 40, 'YOU HAVE FALLEN', {
        fontFamily: 'monospace',
        fontSize: '18px',
        color: '#e74c3c',
      })
      .setOrigin(0.5);

    const stats = this.state.runStats;
    const lines = [
      `Floor reached: ${this.state.currentFloor}`,
      `Enemies slain: ${stats.enemiesKilled}`,
      `Bosses defeated: ${stats.bossesDefeated}`,
      `Gold earned: ${stats.goldEarned}`,
      `Items found: ${stats.itemsFound}`,
      `Damage dealt: ${stats.damageDealt}`,
    ];

    lines.forEach((l, i) => {
      this.add
        .text(width / 2, 80 + i * 16, l, {
          fontFamily: 'monospace',
          fontSize: '11px',
          color: '#ccc',
        })
        .setOrigin(0.5);
    });

    const meta = saveManager.endRun(this.state, false);
    this.add
      .text(width / 2, 190, `+${meta.soulShards - this.state.metaProgression.soulShards} Soul Shards`, {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#9b59b6',
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, 210, `Total Shards: ${meta.soulShards}`, {
        fontFamily: 'monospace',
        fontSize: '10px',
        color: '#888',
      })
      .setOrigin(0.5);

    const btn = this.add.rectangle(width / 2, 245, 140, 28, 0x4a3728).setInteractive({ useHandCursor: true });
    btn.setStrokeStyle(1, 0x8b6914);
    this.add
      .text(width / 2, 245, 'RETURN TO HUB', {
        fontFamily: 'monospace',
        fontSize: '11px',
        color: '#e0d0b0',
      })
      .setOrigin(0.5);

    btn.on('pointerdown', () => {
      TelegramService.haptic('medium');
      this.scene.start('MainMenuScene');
    });
  }
}
