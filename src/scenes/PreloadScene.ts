import Phaser from 'phaser';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload(): void {
    const { width, height } = this.cameras.main;

    const barBg = this.add.rectangle(width / 2, height / 2, 200, 12, 0x333344);
    const bar = this.add.rectangle(width / 2 - 98, height / 2, 4, 8, 0x8b5a2b).setOrigin(0, 0.5);

    this.load.on('progress', (value: number) => {
      bar.width = 4 + 192 * value;
    });

    this.createPlaceholderTextures();
  }

  private createPlaceholderTextures(): void {
    const playerGfx = this.make.graphics({ x: 0, y: 0 });
    playerGfx.fillStyle(0x3a5f8a, 1);
    playerGfx.fillRect(4, 2, 24, 28);
    playerGfx.fillStyle(0xc0c0c0, 1);
    playerGfx.fillRect(20, 8, 10, 4);
    playerGfx.fillStyle(0x8b4513, 1);
    playerGfx.fillRect(10, 26, 12, 6);
    playerGfx.generateTexture('player', 32, 32);
    playerGfx.destroy();

    const colors = [
      { key: 'enemy_rat', color: 0x8b7355 },
      { key: 'enemy_skeleton', color: 0xc0c0c0 },
      { key: 'enemy_archer', color: 0x6b8e23 },
      { key: 'enemy_cultist', color: 0x4b0082 },
      { key: 'enemy_brute', color: 0x228b22 },
      { key: 'enemy_mage', color: 0x9370db },
      { key: 'enemy_knight', color: 0xa9a9a9 },
      { key: 'enemy_zombie', color: 0x4682b4 },
      { key: 'enemy_boss', color: 0x708090 },
    ];
    for (const c of colors) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(c.color, 1);
      g.fillRect(2, 2, 28, 28);
      g.lineStyle(2, 0x000000, 0.5);
      g.strokeRect(2, 2, 28, 28);
      g.fillStyle(0xff0000, 1);
      g.fillRect(8, 10, 4, 4);
      g.fillRect(20, 10, 4, 4);
      g.generateTexture(c.key, 32, 32);
      g.destroy();
    }

    const btn = this.make.graphics({ x: 0, y: 0 });
    btn.fillStyle(0x4a3728, 1);
    btn.fillRoundedRect(0, 0, 120, 28, 4);
    btn.lineStyle(2, 0x8b6914, 1);
    btn.strokeRoundedRect(0, 0, 120, 28, 4);
    btn.generateTexture('btn', 120, 28);
    btn.destroy();

    const pt = this.make.graphics({ x: 0, y: 0 });
    pt.fillStyle(0xffffff, 1);
    pt.fillCircle(4, 4, 4);
    pt.generateTexture('particle', 8, 8);
    pt.destroy();

    const hp = this.make.graphics({ x: 0, y: 0 });
    hp.fillStyle(0x2d5a27, 1);
    hp.fillRect(0, 0, 4, 6);
    hp.generateTexture('hp_seg', 4, 6);
    hp.destroy();
  }

  create(): void {
    this.scene.start('MainMenuScene');
  }
}
