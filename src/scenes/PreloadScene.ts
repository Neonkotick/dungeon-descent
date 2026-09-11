import Phaser from 'phaser';
import { PIXEL_ASSETS } from '../data/pixelAssets';
import { generateCombatSprites } from '../fx/ProceduralArt';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload(): void {
    const { width, height } = this.cameras.main;

    this.add.rectangle(width / 2, height / 2, 200, 12, 0x333344);
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

    for (const [key, dataUri] of Object.entries(PIXEL_ASSETS)) {
      this.load.image(key, dataUri);
    }
  }

  create(): void {
    const required = [
      'player', 'enemy_rat', 'enemy_skeleton', 'enemy_archer', 'enemy_cultist',
      'enemy_brute', 'enemy_mage', 'enemy_knight', 'enemy_zombie', 'enemy_boss',
    ];
    for (const key of required) {
      this.ensureFallback(key, this.fallbackColor(key));
    }

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

    generateCombatSprites(this);

    this.scene.start('MainMenuScene');
  }

  private fallbackColor(key: string): number {
    const map: Record<string, number> = {
      player: 0x3a5f8a,
      enemy_rat: 0x8b7355,
      enemy_skeleton: 0xc0c0c0,
      enemy_archer: 0x6b8e23,
      enemy_cultist: 0x4b0082,
      enemy_brute: 0x228b22,
      enemy_mage: 0x9370db,
      enemy_knight: 0xa9a9a9,
      enemy_zombie: 0x4682b4,
      enemy_boss: 0x708090,
    };
    return map[key] ?? 0x555555;
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
