import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // Minimal boot - no assets yet
  }

  create(): void {
    this.scene.start('PreloadScene');
  }
}
