import Phaser from 'phaser';
import type { GameState, RoomType } from '../save/SaveManager';
import { ENEMIES } from '../data/enemies';
import { SKILLS, PLAYER_SKILL_IDS } from '../data/skills';
import { createPlayerEntity, createEnemyEntity, CombatEntity } from '../entities/Character';
import { TurnManager } from '../combat/TurnManager';
import { TelegramService } from '../telegram/TelegramService';
import { SoundManager } from '../audio/SoundManager';
import { BattleFX } from '../fx/BattleFX';
import { SpriteJuice } from '../fx/SpriteJuice';
import { attachBattleHandlers } from './battleHandlers';

type BattlePhase = 'intro' | 'player_select' | 'player_skills' | 'player_items' | 'animating' | 'enemy_turn' | 'victory' | 'defeat';

export class BattleScene extends Phaser.Scene {
  state!: GameState;
  enemyIds!: string[];
  roomType!: RoomType;
  player!: CombatEntity;
  enemies: CombatEntity[] = [];
  turnManager = new TurnManager();
  phase: BattlePhase = 'intro';
  turnCount = 0;
  logText!: Phaser.GameObjects.Text;
  enemySprites: Phaser.GameObjects.Image[] = [];
  playerSprite!: Phaser.GameObjects.Image;
  hpTexts: Phaser.GameObjects.Text[] = [];
  menuButtons: Phaser.GameObjects.Container[] = [];
  fx!: BattleFX;
  juice!: SpriteJuice;

  constructor() { super({ key: 'BattleScene' }); }

  init(data: { state: GameState; enemyIds: string[]; roomType: RoomType }): void {
    this.state = data.state;
    this.enemyIds = data.enemyIds;
    this.roomType = data.roomType;
  }

  create(): void {
    this.cameras.main.setBackgroundColor(0x0d0d18);
    this.cameras.main.fadeIn(220, 0, 0, 0);
    this.fx = new BattleFX(this);
    this.juice = new SpriteJuice(this);
    SoundManager.unlock();
    attachBattleHandlers(this);

    this.player = createPlayerEntity(
      this.state.player.stats, this.state.equipment,
      this.state.player.skills.map((s) => s.id)
    );
    this.enemies = this.enemyIds.map((id, i) => createEnemyEntity(ENEMIES[id] || ENEMIES.cave_rat, i));

    this.turnManager.reset([
      { id: this.player.id, name: this.player.name, isPlayer: true, speed: this.player.stats.speed },
      ...this.enemies.map((e) => ({ id: e.id, name: e.name, isPlayer: false, speed: e.stats.speed })),
    ]);

    this.add.rectangle(240, 170, 480, 8, 0x1a1528, 0.7).setDepth(0);
    this.add.rectangle(240, 174, 480, 2, 0x2a2440, 0.5).setDepth(0);

    this.playerSprite = this.add.image(90, 145, 'player').setScale(1.2).setDepth(10);
    this.juice.startIdle(this.playerSprite, 3, 1000);

    this.enemies.forEach((e, i) => {
      const key = this.enemyTextureKey(e.definitionId);
      const spr = this.add.image(340 + (i % 2) * 55, 85 + Math.floor(i / 2) * 55, key)
        .setScale(1.15).setDepth(10);
      this.enemySprites.push(spr);
      this.juice.startIdle(spr, e.isBoss ? 2 : 3, 800 + i * 120);
    });

    for (let i = 0; i < 10; i++) {
      const ember = this.add.circle(30 + Math.random() * 420, 40 + Math.random() * 90, 1 + Math.random(), 0xff6622, 0.5).setDepth(2);
      this.tweens.add({
        targets: ember, y: ember.y - 28, alpha: 0, duration: 1800 + Math.random() * 1200, repeat: -1, delay: i * 150,
        onRepeat: () => { ember.y = 40 + Math.random() * 90; ember.x = 30 + Math.random() * 420; ember.alpha = 0.5; },
      });
    }

    this.add.rectangle(240, 238, 470, 58, 0x0e0c16, 0.92).setStrokeStyle(1, 0x3d3550).setDepth(5);
    this.logText = this.add.text(10, 208, '', {
      fontFamily: 'monospace', fontSize: '9px', color: '#aaaacc', wordWrap: { width: 460 },
    }).setDepth(15);

    this.drawStatusBars();
    this.showMainMenu();
    this.log('Battle start!');
    if (this.roomType === 'boss') {
      SoundManager.play('boss');
      this.fx.banner('BOSS', '#e74c3c');
    }
    this.phase = 'player_select';
    this.processTurn();
  }

  private enemyTextureKey(defId: string): string {
    if (defId.includes('rat')) return 'enemy_rat';
    if (defId.includes('skeleton') || defId.includes('hollow')) return 'enemy_skeleton';
    if (defId.includes('archer')) return 'enemy_archer';
    if (defId.includes('cultist')) return 'enemy_cultist';
    if (defId.includes('brute') || defId.includes('goblin')) return 'enemy_brute';
    if (defId.includes('mage')) return 'enemy_mage';
    if (defId.includes('knight')) return 'enemy_knight';
    if (defId.includes('zombie') || defId.includes('drowned')) return 'enemy_zombie';
    if (defId.includes('guardian') || defId.includes('saint')) return 'enemy_boss';
    return 'enemy_skeleton';
  }

  drawStatusBars(): void {
    this.hpTexts.forEach((t) => t.destroy());
    this.hpTexts = [];
    const p = this.player;
    this.hpTexts.push(this.add.text(10, 178, `WARDEN  HP ${p.stats.hp}/${p.stats.maxHp}  MP ${p.stats.mp}/${p.stats.maxMp}`, {
      fontFamily: 'monospace', fontSize: '10px', color: '#7dcea0',
    }).setDepth(15));
    this.enemies.forEach((e, i) => {
      if (!e.isAlive) return;
      const br = e.maxBreakGauge > 0 ? ` BRK ${Math.ceil((e.breakGauge / e.maxBreakGauge) * 10)}` : '';
      this.hpTexts.push(this.add.text(280, 28 + i * 18, `${e.name} ${e.stats.hp}/${e.stats.maxHp}${br}`, {
        fontFamily: 'monospace', fontSize: '9px',
        color: e.isBoss ? '#e74c3c' : e.isElite ? '#e67e22' : '#ecf0f1',
      }).setDepth(15));
    });
  }

  clearMenu(): void {
    this.menuButtons.forEach((b) => b.destroy());
    this.menuButtons = [];
  }

  showMainMenu(): void {
    this.clearMenu();
    this.phase = 'player_select';
    [
      { t: 'ATTACK', cb: () => (this as any).playerAttack('basic_attack') },
      { t: 'SKILLS', cb: () => this.showSkillsMenu() },
      { t: 'ITEM', cb: () => this.showItemsMenu() },
      { t: 'DEFEND', cb: () => (this as any).playerDefend() },
    ].forEach((l, i) => this.menuButtons.push(this.makeBtn(60 + i * 100, 242, l.t, l.cb)));
    this.menuButtons.push(this.makeBtn(420, 242, 'ESC', () => (this as any).tryEscape(), 50));
  }

  showSkillsMenu(): void {
    this.clearMenu();
    this.phase = 'player_skills';
    PLAYER_SKILL_IDS.forEach((id, i) => {
      const sk = SKILLS[id];
      const can = this.player.stats.mp >= sk.mpCost;
      this.menuButtons.push(this.makeBtn(60 + (i % 2) * 180, 230 + Math.floor(i / 2) * 28,
        `${sk.name} ${sk.mpCost}MP`,
        () => { if (can) (this as any).playerAttack(id); else this.log('Not enough MP!'); },
        160, can ? 0x4a3728 : 0x333333));
    });
    this.menuButtons.push(this.makeBtn(400, 250, 'BACK', () => this.showMainMenu(), 60));
  }

  showItemsMenu(): void {
    this.clearMenu();
    if (this.state.consumables.potion > 0) {
      this.menuButtons.push(this.makeBtn(120, 242, `Potion x${this.state.consumables.potion}`, () => (this as any).usePotion(), 140));
    } else this.log('No potions!');
    this.menuButtons.push(this.makeBtn(300, 242, 'BACK', () => this.showMainMenu(), 60));
  }

  makeBtn(x: number, y: number, label: string, cb: () => void, w = 90, color = 0x4a3728): Phaser.GameObjects.Container {
    const c = this.add.container(x, y).setDepth(20);
    const bg = this.add.rectangle(0, 0, w, 26, color).setInteractive({ useHandCursor: true });
    bg.setStrokeStyle(1, 0x8b6914);
    c.add([bg, this.add.text(0, 0, label, { fontFamily: 'monospace', fontSize: '10px', color: '#e0d0b0' }).setOrigin(0.5)]);
    bg.on('pointerdown', () => { SoundManager.play('click'); TelegramService.haptic('light'); cb(); });
    return c;
  }

  log(msg: string): void { this.logText.setText(msg); }

  processTurn(): void {
    if (this.phase === 'victory' || this.phase === 'defeat') return;
    if (!this.player.isAlive) { (this as any).onDefeat(); return; }
    if (this.enemies.every((e) => !e.isAlive)) { (this as any).onVictory(); return; }

    const next = this.turnManager.next();
    if (!next) return;

    if (next.isPlayer) {
      this.phase = 'player_select';
      this.player.isDefending = false;
      const tick = this.player.statuses.tick(this.player.stats.maxHp);
      if (tick.damage > 0) {
        this.player.takeDamage(tick.damage);
        this.log(`Status: ${tick.messages.join(', ')}`);
        SoundManager.play('poison');
        this.fx.floatText(90, 120, `-${tick.damage}`, 'status');
        this.juice.hitRecoil(this.playerSprite, false);
        this.drawStatusBars();
        if (!this.player.isAlive) { (this as any).onDefeat(); return; }
      }
      if (this.player.statuses.isActionBlocked()) {
        this.log('Stunned! Skipping turn.');
        this.turnManager.scheduleNext(this.player.id, 1.0);
        this.time.delayedCall(600, () => this.processTurn());
        return;
      }
      this.player.applyStatusModifiers();
      this.showMainMenu();
      this.log('Your turn!');
    } else {
      this.phase = 'enemy_turn';
      this.clearMenu();
      const enemy = this.enemies.find((e) => e.id === next.id);
      if (!enemy || !enemy.isAlive) {
        this.turnManager.remove(next.id);
        this.processTurn();
        return;
      }
      this.time.delayedCall(350, () => (this as any).enemyAct(enemy));
    }
  }
}
