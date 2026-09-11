import Phaser from 'phaser';
import type { GameState, RoomType } from '../save/SaveManager';
import { saveManager } from '../save/SaveManager';
import { ENEMIES } from '../data/enemies';
import { SKILLS, PLAYER_SKILL_IDS } from '../data/skills';
import { createPlayerEntity, createEnemyEntity, CombatEntity } from '../entities/Character';
import { TurnManager } from '../combat/TurnManager';
import { calculatePhysicalDamage, calculateMagicalDamage, calculateHeal, getWeaponAtk } from '../combat/DamageCalculator';
import { chooseEnemyAction, getSkillDef } from '../combat/AIController';
import { generateItem } from '../items/ItemGenerator';
import { TelegramService } from '../telegram/TelegramService';

type BattlePhase = 'intro' | 'player_select' | 'player_skills' | 'player_items' | 'animating' | 'enemy_turn' | 'victory' | 'defeat';

export class BattleScene extends Phaser.Scene {
  private state!: GameState;
  private enemyIds!: string[];
  private roomType!: RoomType;
  private player!: CombatEntity;
  private enemies: CombatEntity[] = [];
  private turnManager = new TurnManager();
  private phase: BattlePhase = 'intro';
  private turnCount = 0;
  private logText!: Phaser.GameObjects.Text;
  private enemySprites: Phaser.GameObjects.Image[] = [];
  private playerSprite!: Phaser.GameObjects.Image;
  private hpTexts: Phaser.GameObjects.Text[] = [];
  private menuButtons: Phaser.GameObjects.Container[] = [];

  constructor() { super({ key: 'BattleScene' }); }

  init(data: { state: GameState; enemyIds: string[]; roomType: RoomType }): void {
    this.state = data.state;
    this.enemyIds = data.enemyIds;
    this.roomType = data.roomType;
  }

  create(): void {
    this.cameras.main.setBackgroundColor(0x0d0d18);
    this.player = createPlayerEntity(
      this.state.player.stats, this.state.equipment,
      this.state.player.skills.map((s) => s.id)
    );
    this.enemies = this.enemyIds.map((id, i) => {
      const def = ENEMIES[id] || ENEMIES.cave_rat;
      return createEnemyEntity(def, i);
    });

    this.turnManager.reset([
      { id: this.player.id, name: this.player.name, isPlayer: true, speed: this.player.stats.speed },
      ...this.enemies.map((e) => ({ id: e.id, name: e.name, isPlayer: false, speed: e.stats.speed })),
    ]);

    this.playerSprite = this.add.image(80, 140, 'player').setScale(2);
    this.enemies.forEach((e, i) => {
      const key = this.enemyTextureKey(e.definitionId);
      const spr = this.add.image(320 + (i % 2) * 50, 80 + Math.floor(i / 2) * 50, key).setScale(1.8);
      spr.setTint(e.color);
      this.enemySprites.push(spr);
    });

    this.logText = this.add.text(10, 200, '', {
      fontFamily: 'monospace', fontSize: '9px', color: '#aaaacc', wordWrap: { width: 460 },
    });

    this.drawStatusBars();
    this.showMainMenu();
    this.log('Battle start!');
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

  private drawStatusBars(): void {
    this.hpTexts.forEach((t) => t.destroy());
    this.hpTexts = [];
    const p = this.player;
    this.hpTexts.push(this.add.text(10, 175, `WARDEN  HP ${p.stats.hp}/${p.stats.maxHp}  MP ${p.stats.mp}/${p.stats.maxMp}`, {
      fontFamily: 'monospace', fontSize: '10px', color: '#7dcea0',
    }));
    this.enemies.forEach((e, i) => {
      if (!e.isAlive) return;
      const breakStr = e.maxBreakGauge > 0 ? ` BRK ${Math.ceil((e.breakGauge / e.maxBreakGauge) * 10)}` : '';
      this.hpTexts.push(this.add.text(280, 30 + i * 18, `${e.name} ${e.stats.hp}/${e.stats.maxHp}${breakStr}`, {
        fontFamily: 'monospace', fontSize: '9px',
        color: e.isBoss ? '#e74c3c' : e.isElite ? '#e67e22' : '#ecf0f1',
      }));
    });
  }

  private clearMenu(): void {
    this.menuButtons.forEach((b) => b.destroy());
    this.menuButtons = [];
  }

  private showMainMenu(): void {
    this.clearMenu();
    this.phase = 'player_select';
    const labels = [
      { t: 'ATTACK', cb: () => this.playerAttack('basic_attack') },
      { t: 'SKILLS', cb: () => this.showSkillsMenu() },
      { t: 'ITEM', cb: () => this.showItemsMenu() },
      { t: 'DEFEND', cb: () => this.playerDefend() },
    ];
    labels.forEach((l, i) => this.menuButtons.push(this.makeBtn(60 + i * 100, 240, l.t, l.cb)));
    this.menuButtons.push(this.makeBtn(420, 240, 'ESC', () => this.tryEscape(), 50));
  }

  private showSkillsMenu(): void {
    this.clearMenu();
    this.phase = 'player_skills';
    PLAYER_SKILL_IDS.forEach((id, i) => {
      const sk = SKILLS[id];
      const can = this.player.stats.mp >= sk.mpCost;
      this.menuButtons.push(this.makeBtn(60 + (i % 2) * 180, 230 + Math.floor(i / 2) * 28,
        `${sk.name} ${sk.mpCost}MP`, () => {
          if (can) this.playerAttack(id); else this.log('Not enough MP!');
        }, 160, can ? 0x4a3728 : 0x333333));
    });
    this.menuButtons.push(this.makeBtn(400, 250, 'BACK', () => this.showMainMenu(), 60));
  }

  private showItemsMenu(): void {
    this.clearMenu();
    if (this.state.consumables.potion > 0) {
      this.menuButtons.push(this.makeBtn(120, 240, `Potion x${this.state.consumables.potion}`, () => this.usePotion(), 140));
    } else this.log('No potions!');
    this.menuButtons.push(this.makeBtn(300, 240, 'BACK', () => this.showMainMenu(), 60));
  }

  private makeBtn(x: number, y: number, label: string, cb: () => void, w = 90, color = 0x4a3728): Phaser.GameObjects.Container {
    const c = this.add.container(x, y);
    const bg = this.add.rectangle(0, 0, w, 24, color).setInteractive({ useHandCursor: true });
    bg.setStrokeStyle(1, 0x8b6914);
    const t = this.add.text(0, 0, label, { fontFamily: 'monospace', fontSize: '10px', color: '#e0d0b0' }).setOrigin(0.5);
    c.add([bg, t]);
    bg.on('pointerdown', () => { TelegramService.haptic('light'); cb(); });
    return c;
  }

  private log(msg: string): void { this.logText.setText(msg); }

  private processTurn(): void {
    if (this.phase === 'victory' || this.phase === 'defeat') return;
    if (!this.player.isAlive) { this.onDefeat(); return; }
    if (this.enemies.every((e) => !e.isAlive)) { this.onVictory(); return; }

    const next = this.turnManager.next();
    if (!next) return;

    if (next.isPlayer) {
      this.phase = 'player_select';
      this.player.isDefending = false;
      const tick = this.player.statuses.tick(this.player.stats.maxHp);
      if (tick.damage > 0) {
        this.player.takeDamage(tick.damage);
        this.log(`Status: ${tick.messages.join(', ')}`);
        this.drawStatusBars();
        if (!this.player.isAlive) { this.onDefeat(); return; }
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
      this.time.delayedCall(400, () => this.enemyAct(enemy));
    }
  }

  private playerAttack(skillId: string): void {
    this.clearMenu();
    this.phase = 'animating';
    const skill = getSkillDef(skillId);
    if (this.player.stats.mp < skill.mpCost) {
      this.log('Not enough MP!'); this.showMainMenu(); return;
    }
    this.player.stats.mp -= skill.mpCost;

    const target = this.enemies.find((e) => e.isAlive);
    if (!target) { this.onVictory(); return; }

    if (skill.type === 'heal') {
      const amount = calculateHeal(this.player.stats, skill.power);
      const healed = this.player.heal(amount);
      this.log(`Second Wind! +${healed} HP`);
      this.flashHeal(this.playerSprite);
    } else {
      const weapon = getWeaponAtk(this.state.equipment);
      const result = skill.type === 'magical'
        ? calculateMagicalDamage(this.player.stats, target.stats, skill, target.resistances as any, target.isDefending)
        : calculatePhysicalDamage(this.player.stats, target.stats, skill.power, weapon.min, weapon.max,
            (skill.element as any) || 'physical', target.resistances as any, target.isDefending);

      if (result.isMiss) {
        this.log('MISS!'); this.showFloatText(true, 'MISS', '#888');
      } else {
        const dealt = target.takeDamage(result.damage);
        this.state.runStats.damageDealt += dealt;
        let msg = `${skill.name}: ${dealt}`;
        if (result.isCrit) { msg = `CRITICAL! ${dealt}`; this.showFloatText(false, 'CRIT!', '#ff0'); this.cameras.main.shake(100, 0.01); }
        if (result.isWeak) { msg += ' WEAK!'; this.showFloatText(false, 'WEAK!', '#0ff'); }
        if (result.isResist) msg += ' RESIST';
        if (result.isImmune) msg = 'IMMUNE!';
        this.log(msg);
        this.showFloatText(false, `${dealt}`, result.isCrit ? '#ff0' : '#fff');
        this.flashHit(this.enemySprites[this.enemies.indexOf(target)]);
        if (result.lifestealAmount > 0) this.player.heal(result.lifestealAmount);
        if (skill.breakDamage && target.maxBreakGauge > 0) {
          if (target.reduceBreak(skill.breakDamage)) this.log(`${target.name} BREAK!`);
        }
        if (skill.statusChance && skill.statusId && Math.random() * 100 < skill.statusChance) {
          target.statuses.add(skill.statusId as any);
          this.log(`${target.name}: ${skill.statusId}`);
        }
      }
    }

    this.drawStatusBars();
    this.turnManager.scheduleNext(this.player.id, skill.delay);
    this.time.delayedCall(700, () => {
      if (!target.isAlive) this.onEnemyDeath(target);
      this.processTurn();
    });
  }

  private playerDefend(): void {
    this.clearMenu();
    this.player.isDefending = true;
    this.log('Defending!');
    this.turnManager.scheduleNext(this.player.id, 0.5);
    this.time.delayedCall(400, () => this.processTurn());
  }

  private usePotion(): void {
    if (this.state.consumables.potion <= 0) return;
    this.state.consumables.potion -= 1;
    const heal = Math.floor(this.player.stats.maxHp * 0.4);
    this.player.heal(heal);
    this.log(`Potion: +${heal} HP`);
    this.drawStatusBars();
    this.turnManager.scheduleNext(this.player.id, 0.8);
    this.time.delayedCall(500, () => this.processTurn());
  }

  private tryEscape(): void {
    if (this.roomType === 'boss') { this.log('Cannot escape Boss!'); return; }
    if (Math.random() * 100 < 40 + this.player.stats.speed * 2) {
      this.log('Escaped!');
      this.state.player.stats.hp = this.player.stats.hp;
      this.state.player.stats.mp = this.player.stats.mp;
      saveManager.saveRun(this.state);
      this.scene.start('DungeonScene', { state: this.state });
    } else {
      this.log('Escape failed!');
      this.turnManager.scheduleNext(this.player.id, 1.0);
      this.time.delayedCall(500, () => this.processTurn());
    }
  }

  private enemyAct(enemy: CombatEntity): void {
    const tick = enemy.statuses.tick(enemy.stats.maxHp);
    if (tick.damage > 0) {
      enemy.takeDamage(tick.damage);
      this.log(`${enemy.name} ${tick.messages.join(', ')}`);
      this.drawStatusBars();
      if (!enemy.isAlive) {
        this.onEnemyDeath(enemy);
        this.time.delayedCall(400, () => this.processTurn());
        return;
      }
    }
    if (enemy.statuses.isActionBlocked()) {
      this.log(`${enemy.name} stunned!`);
      this.turnManager.scheduleNext(enemy.id, 1.0);
      this.time.delayedCall(500, () => this.processTurn());
      return;
    }
    enemy.applyStatusModifiers();

    const skillId = chooseEnemyAction({
      self: { id: enemy.id, hp: enemy.stats.hp, maxHp: enemy.stats.maxHp, skills: enemy.skills, isBoss: enemy.isBoss, isElite: enemy.isElite, statuses: enemy.statuses },
      player: { hp: this.player.stats.hp, maxHp: this.player.stats.maxHp, statuses: this.player.statuses },
      allies: this.enemies.filter((e) => e.isAlive).map((e) => ({
        id: e.id, hp: e.stats.hp, maxHp: e.stats.maxHp, skills: e.skills, statuses: e.statuses,
      })),
      turnCount: this.turnCount++,
    });

    const skill = getSkillDef(skillId);
    if (skill.isUltimate) {
      this.log(`${enemy.name} prepares: ${skill.name.toUpperCase()}!`);
      this.time.delayedCall(600, () => this.executeEnemySkill(enemy, skillId));
    } else {
      this.executeEnemySkill(enemy, skillId);
    }
  }

  private executeEnemySkill(enemy: CombatEntity, skillId: string): void {
    const skill = getSkillDef(skillId);
    if (skill.type === 'heal') {
      const amount = calculateHeal(enemy.stats, skill.power);
      enemy.heal(amount);
      this.log(`${enemy.name} heals ${amount}`);
    } else if (skill.type === 'buff') {
      if (skill.statusId) enemy.statuses.add(skill.statusId as any);
      this.log(`${enemy.name}: ${skill.name}`);
    } else if (skill.id === 'summon_skeleton') {
      this.log(`${enemy.name} summons allies!`);
    } else {
      const result = skill.type === 'magical'
        ? calculateMagicalDamage(enemy.stats, this.player.stats, skill, {}, this.player.isDefending)
        : calculatePhysicalDamage(enemy.stats, this.player.stats, skill.power, 6, 10,
            (skill.element as any) || 'physical', {}, this.player.isDefending);

      if (result.isMiss) {
        this.log(`${enemy.name} misses!`); this.showFloatText(true, 'MISS', '#888');
      } else {
        const dealt = this.player.takeDamage(result.damage);
        this.state.runStats.damageTaken += dealt;
        this.state.player.stats.hp = this.player.stats.hp;
        let msg = `${enemy.name}: ${skill.name} ${dealt}`;
        if (result.isCrit) msg = `${enemy.name} CRITICAL! ${dealt}`;
        if (this.player.isDefending) msg += ' (blocked)';
        this.log(msg);
        this.showFloatText(true, `${dealt}`, '#f44');
        this.flashHit(this.playerSprite);
        this.cameras.main.shake(80, 0.008);
        if (skill.statusChance && skill.statusId && Math.random() * 100 < skill.statusChance) {
          this.player.statuses.add(skill.statusId as any);
          this.log(`Afflicted: ${skill.statusId}`);
        }
      }
    }

    this.drawStatusBars();
    this.turnManager.scheduleNext(enemy.id, skill.delay);
    this.time.delayedCall(700, () => {
      if (!this.player.isAlive) this.onDefeat();
      else this.processTurn();
    });
  }

  private onEnemyDeath(enemy: CombatEntity): void {
    enemy.isAlive = false;
    const idx = this.enemies.indexOf(enemy);
    if (this.enemySprites[idx]) {
      this.enemySprites[idx].setAlpha(0.3);
      this.enemySprites[idx].setTint(0x333333);
    }
    this.turnManager.remove(enemy.id);
    this.state.runStats.enemiesKilled += 1;
    this.state.player.xp += enemy.xp;
    const gold = enemy.goldMin + Math.floor(Math.random() * (enemy.goldMax - enemy.goldMin + 1));
    this.state.gold += gold;
    this.state.runStats.goldEarned += gold;
    this.log(`${enemy.name} defeated! +${enemy.xp}XP +${gold}G`);

    while (this.state.player.xp >= this.state.player.xpToNext) {
      this.state.player.xp -= this.state.player.xpToNext;
      this.state.player.level += 1;
      this.state.player.xpToNext = Math.floor(100 * Math.pow(1.45, this.state.player.level - 1));
      this.state.player.stats.maxHp += 8;
      this.state.player.stats.hp += 8;
      this.state.player.stats.str += 1;
      this.state.player.stats.def += 1;
      this.state.player.skillPoints += 1;
      this.player.stats.maxHp = this.state.player.stats.maxHp;
      this.player.stats.hp = this.state.player.stats.hp;
      this.player.baseStats = { ...this.player.stats };
      this.log(`LEVEL UP! Lv${this.state.player.level}`);
      TelegramService.hapticSuccess();
    }

    if (Math.random() < 0.35 || enemy.isElite || enemy.isBoss) {
      const item = generateItem(this.state.currentFloor, enemy.isBoss ? 'rare' : undefined);
      this.state.inventory.push(item);
      this.state.runStats.itemsFound += 1;
      this.log(`Loot: ${item.name} (${item.rarity})`);
    }
  }

  private onVictory(): void {
    this.phase = 'victory';
    this.clearMenu();
    this.log('VICTORY!');
    this.state.player.stats.hp = this.player.stats.hp;
    this.state.player.stats.mp = this.player.stats.mp;
    this.state.currentRoomType = this.roomType;
    saveManager.saveRun(this.state);
    TelegramService.hapticSuccess();
    this.time.delayedCall(900, () => {
      this.scene.start('DungeonScene', { state: this.state, battleVictory: true, roomType: this.roomType });
    });
  }

  private onDefeat(): void {
    this.phase = 'defeat';
    this.clearMenu();
    this.log('You have fallen...');
    this.state.isDead = true;
    this.state.player.stats.hp = 0;
    TelegramService.hapticError();
    this.time.delayedCall(1000, () => {
      this.scene.start('GameOverScene', { state: this.state });
    });
  }

  private showFloatText(isPlayer: boolean, text: string, color: string): void {
    const x = isPlayer ? 80 : 340;
    const y = isPlayer ? 120 : 60;
    const t = this.add.text(x, y, text, {
      fontFamily: 'monospace', fontSize: '14px', color, fontStyle: 'bold',
    }).setOrigin(0.5);
    this.tweens.add({ targets: t, y: y - 30, alpha: 0, duration: 800, onComplete: () => t.destroy() });
  }

  private flashHit(sprite?: Phaser.GameObjects.Image): void {
    if (!sprite) return;
    sprite.setTint(0xff0000);
    this.time.delayedCall(100, () => sprite.clearTint());
  }

  private flashHeal(sprite: Phaser.GameObjects.Image): void {
    sprite.setTint(0x00ff00);
    this.time.delayedCall(150, () => sprite.clearTint());
  }
}
