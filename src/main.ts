import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { PreloadScene } from './scenes/PreloadScene';
import { MainMenuScene } from './scenes/MainMenuScene';
import { HubScene } from './scenes/HubScene';
import { DungeonScene } from './scenes/DungeonScene';
import { BattleScene } from './scenes/BattleScene';
import { InventoryScene } from './scenes/InventoryScene';
import { GameOverScene } from './scenes/GameOverScene';
import { TelegramService } from './telegram/TelegramService';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: 480,
  height: 270,
  backgroundColor: '#0a0a0f',
  pixelArt: true,
  antialias: false,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 480,
    height: 270,
  },
  scene: [
    BootScene,
    PreloadScene,
    MainMenuScene,
    HubScene,
    DungeonScene,
    BattleScene,
    InventoryScene,
    GameOverScene,
  ],
  input: {
    activePointers: 3,
  },
};

TelegramService.init();

const game = new Phaser.Game(config);
(window as any).game = game;
export default game;
