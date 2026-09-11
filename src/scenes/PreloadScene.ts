import Phaser from 'phaser';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload(): void {
    const { width, height } = this.cameras.main;

    const barBg = this.add.rectangle(width / 2, height / 2, 200, 12, 0x333344);
    const bar = this.add.rectangle(width / 2 - 98, height / 2, 4, 8, 0xc9a227).setOrigin(0, 0.5);
    this.add
      .text(width / 2, height / 2 - 20, 'Loading...', {
        fontFamily: 'monospace',
        fontSize: '10px',
        color: '#8888aa',
      })
      .setOrigin(0.5);

    this.load.on('progress', (value: number) => {
      bar.width = 4 + 192 * value;
    });

    // Pixel art sprites (dark fantasy)
    this.load.image('player', 'assets/sprites/player.png');
    this.load.image('enemy_rat', 'assets/sprites/enemy_rat.png');
    this.load.image('enemy_skeleton', 'assets/sprites/enemy_skeleton.png');
    this.load.image('enemy_archer', 'assets/sprites/enemy_archer.png');
    this.load.image('enemy_cultist', 'assets/sprites/enemy_cultist.png');
    this.load.image('enemy_brute', 'assets/sprites/enemy_brute.png');
    this.load.image('enemy_mage', 'assets/sprites/enemy_mage.png');
    this.load.image('enemy_knight', 'assets/sprites/enemy_knight.png');
    this.load.image('enemy_zombie', 'assets/sprites/enemy_zombie.png');
    this.load.image('enemy_boss', 'assets/sprites/enemy_boss.png');
    this.load.image('tile_floor', 'assets/sprites/tile_floor.png');

    // UI
    this.load.image('ui_button', 'assets/ui/button.png');
    this.load.image('ui_panel', 'assets/ui/panel.png');
    this.load.image('ui_hp', 'assets/ui/hp_fill.png');
    this.load.image('ui_mp', 'assets/ui/mp_fill.png');

    // Icons
    this.load.image('icon_sword', 'assets/icons/sword.png');
    this.load.image('icon_potion', 'assets/icons/potion.png');
    this.load.image('icon_chest', 'assets/icons/chest.png');
    this.load.image('icon_coin', 'assets/icons/coin.png');

    this.load.on('loaderror', (file: Phaser.Loader.File) => {
      console.warn('[Preload] Failed to load', file.key, '— using procedural fallback');
    });
  }

  create(): void {
    this.ensureFallback('player', 0x3a5f8a);
    this.ensureFallback('enemy_rat', 0x8b7355);
    this.ensureFallback('enemy_skeleton', 0xc0c0c0);
    this.ensureFallback('enemy_archer', 0x6b8e23);
    this.ensureFallback('enemy_cultist', 0x4b0082);
    this.ensureFallback('enemy_brute', 0x228b22);
    this.ensureFallback('enemy_mage', 0x9370db);
    this.ensureFallback('enemy_knight', 0xa9a9a9);
    this.ensureFallback('enemy_zombie', 0x4682b4);
    this.ensureFallback('enemy_boss', 0x708090);

    if (!this.textures.exists('particle')) {
      const pt = this.make.graphics({ x: 0, y: 0 });
      pt.fillStyle(0xffffff, 1);
      pt.fillCircle(4, 4, 4);
      pt.generateTexture('particle', 8, 8);
      pt.destroy();
    }
    if (!this.textures.exists('btn')) {
      const btn = this.make.graphics({ x: 0, y: 0 });
      btn.fillStyle(0x4a3728, 1);
      btn.fillRoundedRect(0, 0, 120, 28, 4);
      btn.lineStyle(2, 0x8b6914, 1);
      btn.strokeRoundedRect(0, 0, 120, 28, 4);
      btn.generateTexture('btn', 120, 28);
      btn.destroy();
    }

    this.scene.start('MainMenuScene');
  }

  private ensureFallback(key: string, color: number): void {
    if (this.textures.exists(key)) return;
    const g = this.make.graphics({ x: 0, y: 0 });
    g.fillStyle(color, 1);
    g.fillRect(2, 2, 28, 28);
    g.lineStyle(2, 0x000000, 0.6);
    g.strokeRect(2, 2, 28, 28);
    g.fillStyle(0xff2020, 1);
    g.fillRect(8, 10, 4, 4);
    g.fillRect(20, 10, 4, 4);
    g.generateTexture(key, 32, 32);
    g.destroy();
  }
}
