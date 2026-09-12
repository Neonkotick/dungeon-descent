import Phaser from 'phaser';
import { saveManager, type MetaProgression } from '../save/SaveManager';
import { TelegramService } from '../telegram/TelegramService';
import { SoundManager } from '../audio/SoundManager';

interface UpgradeDef {
  id: 'startingHp' | 'startingPotion';
  name: string;
  desc: string;
  cost: number;
  max: number;
  getLevel: (m: MetaProgression) => number;
}

const UPGRADES: UpgradeDef[] = [
  {
    id: 'startingHp',
    name: '+5% Starting HP',
    desc: '+5 max HP at run start (stacks)',
    cost: 10,
    max: 10,
    getLevel: (m) => m.upgrades.startingHp,
  },
  {
    id: 'startingPotion',
    name: '+1 Starting Potion',
    desc: 'Extra potion when a run begins',
    cost: 15,
    max: 3,
    getLevel: (m) => m.upgrades.startingPotion,
  },
];

export class UpgradesScene extends Phaser.Scene {
  private meta!: MetaProgression;
  private shardText!: Phaser.GameObjects.Text;
  private rows: Phaser.GameObjects.Container[] = [];

  constructor() {
    super({ key: 'UpgradesScene' });
  }

  create(): void {
    SoundManager.unlock();
    const { width } = this.cameras.main;
    this.cameras.main.setBackgroundColor(0x0a0a12);
    this.cameras.main.fadeIn(200, 0, 0, 0);
    TelegramService.showBackButton(() => this.scene.start('MainMenuScene'));

    this.meta = saveManager.loadMeta();

    this.add
      .text(width / 2, 18, 'META UPGRADES', {
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#c9a227',
      })
      .setOrigin(0.5);

    this.shardText = this.add
      .text(width / 2, 38, `Soul Shards: ${this.meta.soulShards}`, {
        fontFamily: 'monospace',
        fontSize: '11px',
        color: '#9b59b6',
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, 54, 'Permanent. Spent on death rewards.', {
        fontFamily: 'monospace',
        fontSize: '9px',
        color: '#666688',
      })
      .setOrigin(0.5);

    this.renderRows();

    const back = this.add.rectangle(width / 2, 250, 100, 24, 0x333344).setInteractive({ useHandCursor: true });
    back.setStrokeStyle(1, 0x666688);
    this.add
      .text(width / 2, 250, 'BACK', {
        fontFamily: 'monospace',
        fontSize: '11px',
        color: '#e0d0b0',
      })
      .setOrigin(0.5);
    back.on('pointerdown', () => {
      SoundManager.play('click');
      this.scene.start('MainMenuScene');
    });
  }

  private renderRows(): void {
    this.rows.forEach((r) => r.destroy());
    this.rows = [];
    this.shardText.setText(`Soul Shards: ${this.meta.soulShards}`);

    UPGRADES.forEach((u, i) => {
      const y = 80 + i * 55;
      const level = u.getLevel(this.meta);
      const maxed = level >= u.max;
      const canBuy = !maxed && this.meta.soulShards >= u.cost;
      const c = this.add.container(0, 0);

      const bg = this.add.rectangle(240, y, 420, 48, 0x14101c).setStrokeStyle(1, canBuy ? 0x8b6914 : 0x3a3550);
      c.add(bg);

      c.add(
        this.add.text(40, y - 10, u.name, {
          fontFamily: 'monospace',
          fontSize: '12px',
          color: '#e0d0b0',
        })
      );
      c.add(
        this.add.text(40, y + 6, `${u.desc}  [${level}/${u.max}]`, {
          fontFamily: 'monospace',
          fontSize: '9px',
          color: '#8888aa',
        })
      );

      const btnLabel = maxed ? 'MAX' : `BUY ${u.cost}`;
      const btnColor = maxed ? 0x333333 : canBuy ? 0x4a3728 : 0x2a2a30;
      const btn = this.add
        .rectangle(400, y, 70, 26, btnColor)
        .setInteractive({ useHandCursor: canBuy })
        .setStrokeStyle(1, maxed ? 0x555555 : 0x8b6914);
      c.add(btn);
      c.add(
        this.add
          .text(400, y, btnLabel, {
            fontFamily: 'monospace',
            fontSize: '10px',
            color: canBuy ? '#e0d0b0' : '#666',
          })
          .setOrigin(0.5)
      );

      if (canBuy) {
        btn.on('pointerdown', () => this.buy(u));
      }

      this.rows.push(c);
    });
  }

  private buy(u: UpgradeDef): void {
    const level = u.getLevel(this.meta);
    if (level >= u.max || this.meta.soulShards < u.cost) return;

    this.meta.soulShards -= u.cost;
    if (u.id === 'startingHp') this.meta.upgrades.startingHp += 1;
    if (u.id === 'startingPotion') this.meta.upgrades.startingPotion += 1;

    saveManager.saveMeta(this.meta);
    SoundManager.play('levelup');
    TelegramService.hapticSuccess();
    this.renderRows();
  }
}
