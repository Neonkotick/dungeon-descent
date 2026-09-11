/**
 * Combat visual juice — floating numbers, flashes, particles, shake.
 * Inspired by: Shattered Pixel Dungeon, Slice & Dice, Darkest Dungeon mobile.
 */

import Phaser from 'phaser';

export type FloatStyle = 'damage' | 'crit' | 'heal' | 'miss' | 'weak' | 'resist' | 'block' | 'break' | 'status';

const COLORS: Record<FloatStyle, string> = {
  damage: '#ff6b4a',
  crit: '#ffd54a',
  heal: '#6bff8a',
  miss: '#aaaaaa',
  weak: '#ff9a3c',
  resist: '#7eb6ff',
  block: '#c0c0c0',
  break: '#e040fb',
  status: '#b388ff',
};

export class BattleFX {
  constructor(private scene: Phaser.Scene) {}

  floatText(x: number, y: number, text: string, style: FloatStyle = 'damage'): void {
    const color = COLORS[style];
    const t = this.scene.add
      .text(x, y, text, {
        fontFamily: 'monospace',
        fontSize: style === 'crit' ? '16px' : '13px',
        color,
        stroke: '#000000',
        strokeThickness: 3,
        fontStyle: style === 'crit' ? 'bold' : 'normal',
      })
      .setOrigin(0.5)
      .setDepth(100);

    this.scene.tweens.add({
      targets: t,
      y: y - 28 - Math.random() * 10,
      x: x + (Math.random() * 16 - 8),
      alpha: 0,
      duration: style === 'crit' ? 900 : 700,
      ease: 'Cubic.easeOut',
      onComplete: () => t.destroy(),
    });

    if (style === 'crit') {
      this.scene.tweens.add({
        targets: t,
        scale: { from: 1.4, to: 1 },
        duration: 200,
      });
    }
  }

  hitFlash(target: Phaser.GameObjects.Image | Phaser.GameObjects.Sprite, color = 0xffffff): void {
    if (!target?.active) return;
    target.setTintFill(color);
    this.scene.time.delayedCall(60, () => {
      if (target.active) target.clearTint();
    });
    this.scene.time.delayedCall(120, () => {
      if (target.active) {
        target.setTintFill(0xff3333);
        this.scene.time.delayedCall(50, () => {
          if (target.active) target.clearTint();
        });
      }
    });
  }

  attackLunge(
    sprite: Phaser.GameObjects.Image,
    towardX: number,
    towardY: number,
    onHit?: () => void
  ): void {
    if (!sprite?.active) return;
    const ox = sprite.x;
    const oy = sprite.y;
    const dx = (towardX - ox) * 0.25;
    const dy = (towardY - oy) * 0.25;
    this.scene.tweens.add({
      targets: sprite,
      x: ox + dx,
      y: oy + dy,
      duration: 80,
      yoyo: true,
      ease: 'Quad.easeOut',
      onYoyo: () => onHit?.(),
    });
  }

  deathAnim(sprite: Phaser.GameObjects.Image, onDone?: () => void): void {
    if (!sprite?.active) {
      onDone?.();
      return;
    }
    this.scene.tweens.add({
      targets: sprite,
      alpha: 0,
      y: sprite.y + 20,
      angle: sprite.angle + (Math.random() > 0.5 ? 25 : -25),
      duration: 450,
      ease: 'Quad.easeIn',
      onComplete: () => {
        sprite.setVisible(false);
        onDone?.();
      },
    });
  }

  burst(x: number, y: number, color = 0xffaa44, count = 8): void {
    for (let i = 0; i < count; i++) {
      const p = this.scene.add.rectangle(
        x,
        y,
        2 + Math.random() * 2,
        2 + Math.random() * 2,
        color
      ).setDepth(90);
      const angle = Math.random() * Math.PI * 2;
      const dist = 12 + Math.random() * 24;
      this.scene.tweens.add({
        targets: p,
        x: x + Math.cos(angle) * dist,
        y: y + Math.sin(angle) * dist - 10,
        alpha: 0,
        duration: 350 + Math.random() * 250,
        onComplete: () => p.destroy(),
      });
    }
  }

  slashArc(fromX: number, fromY: number, toX: number, toY: number, color = 0xffeecc): void {
    const g = this.scene.add.graphics().setDepth(80);
    g.lineStyle(2, color, 0.9);
    g.beginPath();
    g.moveTo(fromX, fromY - 8);
    g.lineTo(toX, toY);
    g.lineTo(fromX, fromY + 8);
    g.strokePath();
    this.scene.tweens.add({
      targets: g,
      alpha: 0,
      duration: 180,
      onComplete: () => g.destroy(),
    });
  }

  shake(intensity = 0.004, duration = 120): void {
    this.scene.cameras.main.shake(duration, intensity);
  }

  healSparkles(x: number, y: number): void {
    this.burst(x, y, 0x66ff99, 10);
    this.floatText(x, y - 10, 'HEAL', 'heal');
  }

  magicRing(x: number, y: number, color = 0xaa66ff): void {
    const ring = this.scene.add.circle(x, y, 4, color, 0.4).setDepth(85);
    this.scene.tweens.add({
      targets: ring,
      scale: 4,
      alpha: 0,
      duration: 400,
      onComplete: () => ring.destroy(),
    });
    this.burst(x, y, color, 6);
  }

  breakPulse(x: number, y: number): void {
    this.floatText(x, y - 20, 'BREAK!', 'break');
    this.burst(x, y, 0xe040fb, 14);
    this.shake(0.008, 180);
  }

  banner(text: string, color = '#ffd54a'): void {
    const cam = this.scene.cameras.main;
    const t = this.scene.add
      .text(cam.centerX, cam.centerY - 20, text, {
        fontFamily: 'monospace',
        fontSize: '22px',
        color,
        stroke: '#000',
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setDepth(200)
      .setAlpha(0)
      .setScale(0.5);

    this.scene.tweens.add({
      targets: t,
      alpha: 1,
      scale: 1,
      duration: 300,
      ease: 'Back.easeOut',
      hold: 800,
      yoyo: true,
      onComplete: () => t.destroy(),
    });
  }
}
