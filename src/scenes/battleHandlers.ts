import type Phaser from 'phaser';
import type { CombatEntity } from '../entities/Character';
import { calculatePhysicalDamage, calculateMagicalDamage, calculateHeal, getWeaponAtk } from '../combat/DamageCalculator';
import { chooseEnemyAction, getSkillDef } from '../combat/AIController';
import { generateItem } from '../items/ItemGenerator';
import { saveManager } from '../save/SaveManager';
import { TelegramService } from '../telegram/TelegramService';
import { SoundManager } from '../audio/SoundManager';

/** Mixin methods attached to BattleScene instance */
export function attachBattleHandlers(ctx: any): void {
  ctx.playerAttack = function (skillId: string) {
    this.clearMenu();
    this.phase = 'animating';
    const skill = getSkillDef(skillId);
    if (this.player.stats.mp < skill.mpCost) {
      this.log('Not enough MP!');
      this.showMainMenu();
      return;
    }
    this.player.stats.mp -= skill.mpCost;
    const target = this.enemies.find((e: CombatEntity) => e.isAlive);
    if (!target) {
      this.onVictory();
      return;
    }

    if (skill.type === 'heal') {
      const healed = this.player.heal(calculateHeal(this.player.stats, skill.power));
      this.log(`Second Wind! +${healed} HP`);
      SoundManager.play('heal');
      this.fx.healSparkles(this.playerSprite.x, this.playerSprite.y - 12);
      this.fx.floatText(90, 120, `+${healed}`, 'heal');
      this.finishPlayerAction(skill.delay, target);
      return;
    }

    SoundManager.play(skill.type === 'magical' ? 'magic' : 'slash');
    const spr = this.enemySprites[this.enemies.indexOf(target)];
    const impact = () => this.resolvePlayerHit(skill, target, spr);
    if (spr) this.juice.attack(this.playerSprite, spr.x, spr.y, impact);
    else impact();
    this.finishPlayerAction(skill.delay, target);
  };

  ctx.resolvePlayerHit = function (skill: any, target: CombatEntity, spr?: Phaser.GameObjects.Image) {
    const weapon = getWeaponAtk(this.state.equipment);
    const result =
      skill.type === 'magical'
        ? calculateMagicalDamage(this.player.stats, target.stats, skill, target.resistances as any, target.isDefending)
        : calculatePhysicalDamage(
            this.player.stats,
            target.stats,
            skill.power,
            weapon.min,
            weapon.max,
            (skill.element as any) || 'physical',
            target.resistances as any,
            target.isDefending
          );

    if (result.isMiss) {
      this.log('MISS!');
      SoundManager.play('miss');
      this.fx.floatText(340, 55, 'MISS', 'miss');
      return;
    }
    const dealt = target.takeDamage(result.damage);
    this.state.runStats.damageDealt += dealt;
    let msg = `${skill.name}: ${dealt}`;
    if (result.isCrit) {
      msg = `CRITICAL! ${dealt}`;
      this.fx.floatText(340, 45, 'CRIT!', 'crit');
      SoundManager.play('crit');
      this.fx.shake(0.012, 160);
    } else {
      SoundManager.play('hit');
      this.fx.shake(0.005, 90);
    }
    if (result.isWeak) {
      msg += ' WEAK!';
      this.fx.floatText(340, 70, 'WEAK!', 'weak');
    }
    if (result.isResist) {
      msg += ' RESIST';
      this.fx.floatText(340, 70, 'RESIST', 'resist');
    }
    if (result.isImmune) msg = 'IMMUNE!';
    this.log(msg);
    this.fx.floatText(340, 55, `${dealt}`, result.isCrit ? 'crit' : 'damage');
    if (spr) {
      this.fx.slashArc(this.playerSprite.x + 16, this.playerSprite.y, spr.x, spr.y);
      this.fx.hitFlash(spr);
      this.fx.burst(spr.x, spr.y, result.isCrit ? 0xffd54a : 0xff6644, result.isCrit ? 12 : 7);
      this.juice.hitRecoil(spr, true);
    }
    if (result.lifestealAmount > 0) this.player.heal(result.lifestealAmount);
    if (skill.breakDamage && target.maxBreakGauge > 0 && target.reduceBreak(skill.breakDamage)) {
      this.log(`${target.name} BREAK!`);
      SoundManager.play('break');
      if (spr) this.fx.breakPulse(spr.x, spr.y);
    }
    if (skill.statusChance && skill.statusId && Math.random() * 100 < skill.statusChance) {
      target.statuses.add(skill.statusId as any);
      this.log(`${target.name}: ${skill.statusId}`);
    }
    this.drawStatusBars();
  };

  ctx.finishPlayerAction = function (delay: number, target: CombatEntity) {
    this.drawStatusBars();
    this.turnManager.scheduleNext(this.player.id, delay);
    this.time.delayedCall(750, () => {
      if (!target.isAlive) this.onEnemyDeath(target);
      this.processTurn();
    });
  };

  ctx.playerDefend = function () {
    this.clearMenu();
    this.player.isDefending = true;
    this.log('Defending!');
    SoundManager.play('block');
    this.fx.floatText(90, 130, 'GUARD', 'block');
    this.tweens.add({ targets: this.playerSprite, scaleX: this.playerSprite.scaleX * 0.92, duration: 100, yoyo: true });
    this.turnManager.scheduleNext(this.player.id, 0.5);
    this.time.delayedCall(400, () => this.processTurn());
  };

  ctx.usePotion = function () {
    if (this.state.consumables.potion <= 0) return;
    this.state.consumables.potion -= 1;
    const heal = Math.floor(this.player.stats.maxHp * 0.4);
    this.player.heal(heal);
    this.log(`Potion: +${heal} HP`);
    SoundManager.play('heal');
    this.fx.healSparkles(this.playerSprite.x, this.playerSprite.y - 10);
    this.fx.floatText(90, 120, `+${heal}`, 'heal');
    this.drawStatusBars();
    this.turnManager.scheduleNext(this.player.id, 0.8);
    this.time.delayedCall(500, () => this.processTurn());
  };

  ctx.tryEscape = function () {
    if (this.roomType === 'boss') {
      this.log('Cannot escape Boss!');
      return;
    }
    if (Math.random() * 100 < 40 + this.player.stats.speed * 2) {
      this.log('Escaped!');
      this.state.player.stats.hp = this.player.stats.hp;
      this.state.player.stats.mp = this.player.stats.mp;
      saveManager.saveRun(this.state);
      this.juice.destroy();
      this.scene.start('DungeonScene', { state: this.state });
    } else {
      this.log('Escape failed!');
      this.turnManager.scheduleNext(this.player.id, 1.0);
      this.time.delayedCall(500, () => this.processTurn());
    }
  };

  ctx.enemyAct = function (enemy: CombatEntity) {
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
      self: {
        id: enemy.id,
        hp: enemy.stats.hp,
        maxHp: enemy.stats.maxHp,
        skills: enemy.skills,
        isBoss: enemy.isBoss,
        isElite: enemy.isElite,
        statuses: enemy.statuses,
      },
      player: { hp: this.player.stats.hp, maxHp: this.player.stats.maxHp, statuses: this.player.statuses },
      allies: this.enemies
        .filter((e: CombatEntity) => e.isAlive)
        .map((e: CombatEntity) => ({
          id: e.id,
          hp: e.stats.hp,
          maxHp: e.stats.maxHp,
          skills: e.skills,
          statuses: e.statuses,
        })),
      turnCount: this.turnCount++,
    });
    const skill = getSkillDef(skillId);
    if (skill.isUltimate) {
      this.log(`${enemy.name} prepares: ${skill.name.toUpperCase()}!`);
      this.fx.floatText(340, 40, '!', 'crit');
      this.time.delayedCall(550, () => this.executeEnemySkill(enemy, skillId));
    } else this.executeEnemySkill(enemy, skillId);
  };

  ctx.executeEnemySkill = function (enemy: CombatEntity, skillId: string) {
    const skill = getSkillDef(skillId);
    const eidx = this.enemies.indexOf(enemy);
    const espr = this.enemySprites[eidx];
    if (skill.type === 'heal') {
      enemy.heal(calculateHeal(enemy.stats, skill.power));
      this.log(`${enemy.name} heals`);
      SoundManager.play('heal');
      if (espr) this.fx.healSparkles(espr.x, espr.y);
    } else if (skill.type === 'buff') {
      if (skill.statusId) enemy.statuses.add(skill.statusId as any);
      this.log(`${enemy.name}: ${skill.name}`);
    } else if (skill.id === 'summon_skeleton') {
      this.log(`${enemy.name} summons allies!`);
      SoundManager.play('magic');
    } else {
      SoundManager.play(skill.type === 'magical' ? 'magic' : 'slash');
      const doHit = () => {
        const result =
          skill.type === 'magical'
            ? calculateMagicalDamage(enemy.stats, this.player.stats, skill, {}, this.player.isDefending)
            : calculatePhysicalDamage(
                enemy.stats,
                this.player.stats,
                skill.power,
                6,
                10,
                (skill.element as any) || 'physical',
                {},
                this.player.isDefending
              );
        if (result.isMiss) {
          this.log(`${enemy.name} misses!`);
          SoundManager.play('miss');
          this.fx.floatText(90, 120, 'MISS', 'miss');
        } else {
          const dealt = this.player.takeDamage(result.damage);
          this.state.runStats.damageTaken += dealt;
          this.state.player.stats.hp = this.player.stats.hp;
          let msg = `${enemy.name}: ${skill.name} ${dealt}`;
          if (result.isCrit) msg = `${enemy.name} CRITICAL! ${dealt}`;
          if (this.player.isDefending) msg += ' (blocked)';
          this.log(msg);
          this.fx.floatText(90, 120, `${dealt}`, 'damage');
          SoundManager.play(result.isCrit ? 'crit' : this.player.isDefending ? 'block' : 'hit');
          this.fx.hitFlash(this.playerSprite);
          this.fx.burst(this.playerSprite.x, this.playerSprite.y, 0xff4444, 6);
          this.juice.hitRecoil(this.playerSprite, false);
          this.fx.shake(this.player.isDefending ? 0.003 : 0.009, 110);
          if (skill.statusChance && skill.statusId && Math.random() * 100 < skill.statusChance) {
            this.player.statuses.add(skill.statusId as any);
            this.log(`Afflicted: ${skill.statusId}`);
          }
        }
        this.drawStatusBars();
      };
      if (espr) this.juice.attack(espr, this.playerSprite.x, this.playerSprite.y, doHit);
      else doHit();
    }
    this.turnManager.scheduleNext(enemy.id, skill.delay);
    this.time.delayedCall(700, () => {
      if (!this.player.isAlive) this.onDefeat();
      else this.processTurn();
    });
  };

  ctx.onEnemyDeath = function (enemy: CombatEntity) {
    enemy.isAlive = false;
    const idx = this.enemies.indexOf(enemy);
    SoundManager.play(enemy.isBoss ? 'boss' : 'death');
    if (this.enemySprites[idx]) {
      this.fx.burst(this.enemySprites[idx].x, this.enemySprites[idx].y, 0x886655, 14);
      this.juice.death(this.enemySprites[idx]);
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
      SoundManager.play('levelup');
      this.fx.banner(`LEVEL ${this.state.player.level}`, '#6bff8a');
      TelegramService.hapticSuccess();
    }
    if (Math.random() < 0.35 || enemy.isElite || enemy.isBoss) {
      const item = generateItem(this.state.currentFloor, enemy.isBoss ? 'rare' : undefined);
      this.state.inventory.push(item);
      this.state.runStats.itemsFound += 1;
      this.log(`Loot: ${item.name} (${item.rarity})`);
      SoundManager.play('loot');
    }
  };

  ctx.onVictory = function () {
    this.phase = 'victory';
    this.clearMenu();
    this.log('VICTORY!');
    SoundManager.play('victory');
    this.fx.banner('VICTORY', '#ffd54a');
    this.state.player.stats.hp = this.player.stats.hp;
    this.state.player.stats.mp = this.player.stats.mp;
    this.state.currentRoomType = this.roomType;
    saveManager.saveRun(this.state);
    TelegramService.hapticSuccess();
    this.time.delayedCall(1100, () => {
      this.juice.destroy();
      this.scene.start('DungeonScene', {
        state: this.state,
        battleVictory: true,
        roomType: this.roomType,
      });
    });
  };

  ctx.onDefeat = function () {
    this.phase = 'defeat';
    this.clearMenu();
    this.log('You have fallen...');
    SoundManager.play('defeat');
    this.fx.banner('DEFEAT', '#ff5555');
    this.juice.death(this.playerSprite);
    this.state.isDead = true;
    this.state.player.stats.hp = 0;
    TelegramService.hapticError();
    this.time.delayedCall(1200, () => {
      this.juice.destroy();
      this.scene.start('GameOverScene', { state: this.state });
    });
  };
}
