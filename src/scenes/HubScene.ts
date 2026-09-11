import Phaser from 'phaser';

/**
 * Hub is currently merged into MainMenu for MVP.
 * Kept for future expansion (Blacksmith, Shop, etc.).
 */
export class HubScene extends Phaser.Scene {
  constructor() {
    super({ key: 'HubScene' });
  }

  create(): void {
    this.scene.start('MainMenuScene');
  }
}
