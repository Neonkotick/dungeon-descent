/**
 * Lightweight combatant juice: idle bob, attack punch, hit recoil, death.
 * Works with static pixel Image sprites (no spritesheet required).
 */
import Phaser from 'phaser';

export class SpriteJuice {
  private idleTweens = new Map<Phaser.GameObjects.Image, Phaser.Tweens.Tween>();

  constructor(private scene: Phaser.Scene) {}

  startIdle(sprite: Phaser.GameObjects.Image, amp = 2.5, period = 900): void {
    this.stopIdle(sprite);
    if (!sprite?.active) return;
    const baseY = sprite.y;
    (sprite as any).__baseY = baseY;
    const tw = this.scene.tweens.add({
      targets: sprite,
      y: baseY - amp,
      duration: period,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
    this.idleTweens.set(sprite, tw);
  }

  stopIdle(sprite: Phaser.GameObjects.Image): void {
    const tw = this.idleTweens.get(sprite);
    if (tw) {
      tw.stop();
      this.idleTweens.delete(sprite);
    }
    if (sprite && (sprite as any).__baseY != null) {
      sprite.y = (sprite as any).__baseY;
    }
  }

  attack(
    sprite: Phaser.GameObjects.Image,
    targetX: number,
    targetY: number,
    onImpact?: () => void
  ): void {
    if (!sprite?.active) return;
    this.stopIdle(sprite);
    const ox = sprite.x;
    const oy = (sprite as any).__baseY ?? sprite.y;
    const dx = (targetX - ox) * 0.28;
    const dy = (targetY - oy) * 0.18;
    this.scene.tweens.add({
      targets: sprite,
      x: ox + dx,
      y: oy + dy,
      scaleX: sprite.scaleX * 1.08,
      scaleY: sprite.scaleY * 0.95,
      duration: 90,
      ease: 'Quad.easeOut',
      yoyo: true,
      onYoyo: () => onImpact?.(),
      onComplete: () => {
        sprite.x = ox;
        sprite.y = oy;
        this.startIdle(sprite);
      },
    });
  }

  hitRecoil(sprite: Phaser.GameObjects.Image, fromLeft = true): void {
    if (!sprite?.active) return;
    this.stopIdle(sprite);
    const ox = sprite.x;
    const oy = (sprite as any).__baseY ?? sprite.y;
    const kick = fromLeft ? 10 : -10;
    this.scene.tweens.add({
      targets: sprite,
      x: ox + kick,
      angle: fromLeft ? 6 : -6,
      duration: 70,
      yoyo: true,
      onComplete: () => {
        sprite.x = ox;
        sprite.y = oy;
        sprite.angle = 0;
        this.startIdle(sprite);
      },
    });
  }

  death(sprite: Phaser.GameObjects.Image, onDone?: () => void): void {
    if (!sprite?.active) {
      onDone?.();
      return;
    }
    this.stopIdle(sprite);
    this.scene.tweens.add({
      targets: sprite,
      alpha: 0,
      y: sprite.y + 24,
      angle: Phaser.Math.Between(-35, 35),
      duration: 480,
      ease: 'Quad.easeIn',
      onComplete: () => {
        sprite.setVisible(false);
        onDone?.();
      },
    });
  }

  destroy(): void {
    this.idleTweens.forEach((tw) => tw.stop());
    this.idleTweens.clear();
  }
}
