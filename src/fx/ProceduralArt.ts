/**
 * Runtime pixel-art generator — richer sprites than flat fallbacks.
 */
import Phaser from 'phaser';

function hex(r: number, g: number, b: number): number {
  return (r << 16) | (g << 8) | b;
}

function px(
  g: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  w: number,
  h: number,
  color: number,
  a = 1
): void {
  g.fillStyle(color, a);
  g.fillRect(x, y, w, h);
}

export function generateCombatSprites(scene: Phaser.Scene): void {
  makePlayer(scene);
  makeSkeleton(scene);
  makeRat(scene);
  makeCultist(scene);
  makeArcher(scene);
  makeBrute(scene);
  makeMage(scene);
  makeKnight(scene);
  makeZombie(scene);
  makeBoss(scene);
  makeTiles(scene);
  makeIcons(scene);
}

function makePlayer(scene: Phaser.Scene): void {
  const g = scene.make.graphics({ x: 0, y: 0 });
  const S = 2;
  px(g, 8 * S, 14 * S, 6 * S, 14 * S, hex(90, 20, 30));
  px(g, 9 * S, 12 * S, 8 * S, 10 * S, hex(110, 115, 125));
  px(g, 10 * S, 13 * S, 6 * S, 2 * S, hex(140, 145, 155));
  px(g, 10 * S, 6 * S, 6 * S, 6 * S, hex(210, 170, 130));
  px(g, 9 * S, 5 * S, 8 * S, 2 * S, hex(140, 40, 40));
  px(g, 11 * S, 8 * S, 1 * S, 1 * S, hex(40, 80, 160));
  px(g, 14 * S, 8 * S, 1 * S, 1 * S, hex(40, 80, 160));
  px(g, 10 * S, 22 * S, 2 * S, 5 * S, hex(70, 70, 80));
  px(g, 14 * S, 22 * S, 2 * S, 5 * S, hex(70, 70, 80));
  px(g, 9 * S, 26 * S, 3 * S, 2 * S, hex(90, 50, 30));
  px(g, 14 * S, 26 * S, 3 * S, 2 * S, hex(90, 50, 30));
  px(g, 18 * S, 10 * S, 1 * S, 12 * S, hex(200, 200, 210));
  px(g, 17 * S, 9 * S, 3 * S, 1 * S, hex(180, 150, 50));
  px(g, 18 * S, 21 * S, 1 * S, 2 * S, hex(120, 80, 40));
  g.generateTexture('player', 48, 56);
  g.destroy();
}

function makeSkeleton(scene: Phaser.Scene): void {
  const g = scene.make.graphics({ x: 0, y: 0 });
  const S = 2;
  px(g, 10 * S, 5 * S, 7 * S, 7 * S, hex(220, 215, 200));
  px(g, 11 * S, 7 * S, 2 * S, 2 * S, hex(180, 20, 20));
  px(g, 15 * S, 7 * S, 2 * S, 2 * S, hex(180, 20, 20));
  px(g, 13 * S, 10 * S, 2 * S, 1 * S, hex(40, 40, 40));
  px(g, 11 * S, 13 * S, 6 * S, 8 * S, hex(200, 195, 180));
  px(g, 12 * S, 14 * S, 4 * S, 1 * S, hex(160, 155, 140));
  px(g, 12 * S, 16 * S, 4 * S, 1 * S, hex(160, 155, 140));
  px(g, 12 * S, 18 * S, 4 * S, 1 * S, hex(160, 155, 140));
  px(g, 7 * S, 13 * S, 3 * S, 1 * S, hex(200, 195, 180));
  px(g, 18 * S, 13 * S, 3 * S, 1 * S, hex(200, 195, 180));
  px(g, 11 * S, 21 * S, 2 * S, 6 * S, hex(200, 195, 180));
  px(g, 15 * S, 21 * S, 2 * S, 6 * S, hex(200, 195, 180));
  px(g, 21 * S, 10 * S, 1 * S, 10 * S, hex(180, 180, 190));
  g.generateTexture('enemy_skeleton', 48, 56);
  g.destroy();
}

function makeRat(scene: Phaser.Scene): void {
  const g = scene.make.graphics({ x: 0, y: 0 });
  const S = 2;
  px(g, 8 * S, 14 * S, 12 * S, 6 * S, hex(120, 90, 60));
  px(g, 6 * S, 12 * S, 5 * S, 5 * S, hex(130, 100, 70));
  px(g, 5 * S, 13 * S, 1 * S, 1 * S, hex(220, 40, 40));
  px(g, 4 * S, 14 * S, 2 * S, 1 * S, hex(80, 60, 40));
  px(g, 10 * S, 11 * S, 2 * S, 2 * S, hex(90, 70, 50));
  px(g, 19 * S, 16 * S, 5 * S, 1 * S, hex(160, 100, 100));
  px(g, 9 * S, 19 * S, 2 * S, 2 * S, hex(80, 60, 40));
  px(g, 14 * S, 19 * S, 2 * S, 2 * S, hex(80, 60, 40));
  g.generateTexture('enemy_rat', 48, 48);
  g.destroy();
}

function makeCultist(scene: Phaser.Scene): void {
  const g = scene.make.graphics({ x: 0, y: 0 });
  const S = 2;
  px(g, 8 * S, 8 * S, 10 * S, 16 * S, hex(50, 20, 70));
  px(g, 9 * S, 6 * S, 8 * S, 4 * S, hex(40, 15, 55));
  px(g, 11 * S, 9 * S, 4 * S, 3 * S, hex(20, 10, 25));
  px(g, 12 * S, 10 * S, 1 * S, 1 * S, hex(200, 40, 40));
  px(g, 14 * S, 10 * S, 1 * S, 1 * S, hex(200, 40, 40));
  px(g, 19 * S, 6 * S, 1 * S, 18 * S, hex(100, 70, 40));
  px(g, 18 * S, 5 * S, 3 * S, 2 * S, hex(140, 40, 180));
  g.generateTexture('enemy_cultist', 48, 56);
  g.destroy();
}

function makeArcher(scene: Phaser.Scene): void {
  const g = scene.make.graphics({ x: 0, y: 0 });
  const S = 2;
  px(g, 10 * S, 6 * S, 5 * S, 5 * S, hex(200, 160, 120));
  px(g, 9 * S, 11 * S, 7 * S, 9 * S, hex(60, 100, 50));
  px(g, 10 * S, 20 * S, 2 * S, 5 * S, hex(50, 40, 30));
  px(g, 14 * S, 20 * S, 2 * S, 5 * S, hex(50, 40, 30));
  px(g, 18 * S, 8 * S, 1 * S, 12 * S, hex(140, 100, 50));
  px(g, 19 * S, 9 * S, 1 * S, 1 * S, hex(200, 200, 200));
  px(g, 19 * S, 18 * S, 1 * S, 1 * S, hex(200, 200, 200));
  g.generateTexture('enemy_archer', 48, 56);
  g.destroy();
}

function makeBrute(scene: Phaser.Scene): void {
  const g = scene.make.graphics({ x: 0, y: 0 });
  const S = 2;
  px(g, 7 * S, 10 * S, 12 * S, 12 * S, hex(40, 100, 40));
  px(g, 9 * S, 5 * S, 7 * S, 6 * S, hex(180, 140, 100));
  px(g, 10 * S, 7 * S, 1 * S, 1 * S, hex(220, 40, 40));
  px(g, 14 * S, 7 * S, 1 * S, 1 * S, hex(220, 40, 40));
  px(g, 8 * S, 22 * S, 3 * S, 5 * S, hex(30, 70, 30));
  px(g, 14 * S, 22 * S, 3 * S, 5 * S, hex(30, 70, 30));
  px(g, 20 * S, 12 * S, 3 * S, 8 * S, hex(100, 70, 40));
  g.generateTexture('enemy_brute', 48, 56);
  g.destroy();
}

function makeMage(scene: Phaser.Scene): void {
  const g = scene.make.graphics({ x: 0, y: 0 });
  const S = 2;
  px(g, 9 * S, 8 * S, 8 * S, 14 * S, hex(80, 50, 140));
  px(g, 10 * S, 4 * S, 6 * S, 5 * S, hex(100, 70, 160));
  px(g, 12 * S, 2 * S, 2 * S, 3 * S, hex(120, 90, 180));
  px(g, 11 * S, 10 * S, 1 * S, 1 * S, hex(100, 200, 255));
  px(g, 14 * S, 10 * S, 1 * S, 1 * S, hex(100, 200, 255));
  px(g, 18 * S, 6 * S, 1 * S, 16 * S, hex(120, 90, 50));
  px(g, 17 * S, 5 * S, 3 * S, 2 * S, hex(80, 180, 255));
  g.generateTexture('enemy_mage', 48, 56);
  g.destroy();
}

function makeKnight(scene: Phaser.Scene): void {
  const g = scene.make.graphics({ x: 0, y: 0 });
  const S = 2;
  px(g, 9 * S, 10 * S, 9 * S, 12 * S, hex(140, 145, 155));
  px(g, 10 * S, 5 * S, 7 * S, 6 * S, hex(160, 165, 175));
  px(g, 11 * S, 7 * S, 2 * S, 1 * S, hex(20, 20, 30));
  px(g, 14 * S, 7 * S, 2 * S, 1 * S, hex(20, 20, 30));
  px(g, 10 * S, 22 * S, 2 * S, 5 * S, hex(100, 100, 110));
  px(g, 15 * S, 22 * S, 2 * S, 5 * S, hex(100, 100, 110));
  px(g, 19 * S, 8 * S, 2 * S, 14 * S, hex(180, 180, 190));
  px(g, 18 * S, 7 * S, 4 * S, 1 * S, hex(160, 130, 50));
  g.generateTexture('enemy_knight', 48, 56);
  g.destroy();
}

function makeZombie(scene: Phaser.Scene): void {
  const g = scene.make.graphics({ x: 0, y: 0 });
  const S = 2;
  px(g, 9 * S, 11 * S, 8 * S, 10 * S, hex(60, 90, 70));
  px(g, 10 * S, 5 * S, 6 * S, 6 * S, hex(100, 130, 90));
  px(g, 11 * S, 7 * S, 1 * S, 1 * S, hex(200, 50, 50));
  px(g, 14 * S, 7 * S, 1 * S, 1 * S, hex(200, 50, 50));
  px(g, 11 * S, 10 * S, 3 * S, 1 * S, hex(40, 40, 40));
  px(g, 10 * S, 21 * S, 2 * S, 5 * S, hex(50, 70, 55));
  px(g, 15 * S, 21 * S, 2 * S, 5 * S, hex(50, 70, 55));
  g.generateTexture('enemy_zombie', 48, 56);
  g.destroy();
}

function makeBoss(scene: Phaser.Scene): void {
  const g = scene.make.graphics({ x: 0, y: 0 });
  const S = 2;
  px(g, 6 * S, 10 * S, 14 * S, 14 * S, hex(90, 95, 110));
  px(g, 8 * S, 3 * S, 10 * S, 8 * S, hex(120, 125, 140));
  px(g, 10 * S, 6 * S, 2 * S, 2 * S, hex(220, 40, 40));
  px(g, 14 * S, 6 * S, 2 * S, 2 * S, hex(220, 40, 40));
  px(g, 4 * S, 10 * S, 3 * S, 3 * S, hex(70, 70, 80));
  px(g, 19 * S, 10 * S, 3 * S, 3 * S, hex(70, 70, 80));
  px(g, 8 * S, 24 * S, 3 * S, 5 * S, hex(60, 60, 70));
  px(g, 14 * S, 24 * S, 3 * S, 5 * S, hex(60, 60, 70));
  px(g, 22 * S, 4 * S, 2 * S, 20 * S, hex(200, 200, 210));
  px(g, 21 * S, 3 * S, 4 * S, 2 * S, hex(180, 150, 40));
  g.generateTexture('enemy_boss', 56, 60);
  g.destroy();
}

function makeTiles(scene: Phaser.Scene): void {
  const g = scene.make.graphics({ x: 0, y: 0 });
  g.fillStyle(0x1a1624, 1);
  g.fillRect(0, 0, 16, 16);
  g.fillStyle(0x221c30, 1);
  g.fillRect(1, 1, 14, 14);
  g.lineStyle(1, 0x2e2740, 0.8);
  g.strokeRect(0, 0, 16, 16);
  g.fillStyle(0x2a2438, 0.5);
  g.fillRect(3, 3, 2, 2);
  g.fillRect(10, 9, 2, 2);
  g.generateTexture('tile_stone', 16, 16);
  g.destroy();

  const w = scene.make.graphics({ x: 0, y: 0 });
  w.fillStyle(0x12101a, 1);
  w.fillRect(0, 0, 16, 16);
  w.fillStyle(0x1c1828, 1);
  w.fillRect(0, 0, 16, 4);
  w.lineStyle(1, 0x3a3050, 0.6);
  w.strokeRect(0, 0, 16, 16);
  w.generateTexture('tile_wall', 16, 16);
  w.destroy();
}

function makeIcons(scene: Phaser.Scene): void {
  const g = scene.make.graphics({ x: 0, y: 0 });
  g.fillStyle(0x8b6914, 1);
  g.fillRect(4, 10, 24, 16);
  g.fillStyle(0xc9a227, 1);
  g.fillRect(4, 8, 24, 6);
  g.fillStyle(0xffd700, 1);
  g.fillRect(14, 12, 4, 4);
  g.generateTexture('icon_chest', 32, 32);
  g.destroy();

  const p = scene.make.graphics({ x: 0, y: 0 });
  p.fillStyle(0xe74c3c, 1);
  p.fillCircle(16, 18, 10);
  p.fillStyle(0x2ecc71, 1);
  p.fillRect(14, 4, 4, 8);
  p.generateTexture('icon_potion', 32, 32);
  p.destroy();
}
