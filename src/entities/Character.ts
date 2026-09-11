/**
 * Runtime combat entities.
 */

import { StatusEffectManager } from '../combat/StatusEffectManager';
import type { CombatantStats } from '../combat/DamageCalculator';
import type { PlayerStats, EquipmentSlot, ItemInstance } from '../save/SaveManager';
import type { EnemyDefinition } from '../data/enemies';

export class CombatEntity {
  id: string;
  name: string;
  isPlayer: boolean;
  stats: CombatantStats;
  baseStats: CombatantStats;
  statuses: StatusEffectManager;
  skills: string[];
  isAlive = true;
  isDefending = false;
  breakGauge = 0;
  maxBreakGauge = 0;
  isElite = false;
  isBoss = false;
  element: string = 'physical';
  resistances: Record<string, number> = {};
  color = 0xffffff;
  xp = 0;
  goldMin = 0;
  goldMax = 0;
  lootTable = '';
  definitionId = '';

  constructor(id: string, name: string, isPlayer: boolean, stats: CombatantStats, skills: string[] = []) {
    this.id = id;
    this.name = name;
    this.isPlayer = isPlayer;
    this.baseStats = { ...stats };
    this.stats = { ...stats };
    this.statuses = new StatusEffectManager();
    this.skills = skills;
  }

  applyStatusModifiers(): void {
    const mods = this.statuses.getStatModifiers();
    this.stats = { ...this.baseStats };
    for (const [k, v] of Object.entries(mods)) {
      if (k in this.stats) {
        (this.stats as any)[k] = Math.max(1, (this.stats as any)[k] + v);
      }
    }
  }

  takeDamage(amount: number): number {
    if (this.statuses.isBroken()) amount = Math.floor(amount * 1.5);
    this.stats.hp = Math.max(0, this.stats.hp - amount);
    if (this.stats.hp <= 0) { this.isAlive = false; this.stats.hp = 0; }
    return amount;
  }

  heal(amount: number): number {
    const before = this.stats.hp;
    this.stats.hp = Math.min(this.stats.maxHp, this.stats.hp + amount);
    return this.stats.hp - before;
  }

  reduceBreak(amount: number): boolean {
    if (this.maxBreakGauge <= 0) return false;
    this.breakGauge = Math.max(0, this.breakGauge - amount);
    if (this.breakGauge <= 0) {
      this.statuses.add('broken', 1, 1);
      this.breakGauge = this.maxBreakGauge;
      return true;
    }
    return false;
  }

  getHpRatio(): number { return this.stats.hp / this.stats.maxHp; }
}

export function createPlayerEntity(
  stats: PlayerStats,
  equipment: EquipmentSlot,
  skills: string[],
  extraMods: Partial<CombatantStats> = {}
): CombatEntity {
  const s: CombatantStats = { ...stats, ...extraMods };
  const slots = Object.values(equipment) as (ItemInstance | null)[];
  for (const item of slots) {
    if (!item) continue;
    for (const [k, v] of Object.entries(item.baseStats)) {
      if (k === 'atkMin' || k === 'atkMax') continue;
      if (k in s) (s as any)[k] = ((s as any)[k] || 0) + (v as number);
    }
    for (const aff of item.affixes) {
      if (aff.stat in s) (s as any)[aff.stat] = ((s as any)[aff.stat] || 0) + aff.value;
      else (s as any)[aff.stat] = aff.value;
    }
  }
  s.hp = Math.min(s.hp, s.maxHp);
  s.mp = Math.min(s.mp, s.maxMp);
  return new CombatEntity('player', 'Warden', true, s, skills);
}

export function createEnemyEntity(def: EnemyDefinition, index: number): CombatEntity {
  const stats: CombatantStats = {
    hp: def.maxHp, maxHp: def.maxHp, mp: 0, maxMp: 0,
    str: def.str, def: def.def, mag: def.mag, speed: def.speed,
    crit: def.crit, acc: def.acc, evasion: def.evasion,
  };
  const e = new CombatEntity(`enemy_${index}_${def.id}`, def.name, false, stats, def.skills);
  e.isElite = !!def.isElite;
  e.isBoss = !!def.isBoss;
  e.element = def.element;
  e.resistances = def.resistances as Record<string, number>;
  e.color = def.color;
  e.xp = def.xp;
  e.goldMin = def.goldMin;
  e.goldMax = def.goldMax;
  e.lootTable = def.lootTable;
  e.definitionId = def.id;
  if (def.breakGauge) {
    e.maxBreakGauge = def.breakGauge;
    e.breakGauge = def.breakGauge;
  }
  return e;
}
