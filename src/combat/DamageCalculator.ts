/**
 * All damage and combat formulas live here.
 */

import type { Element } from '../data/enemies';
import type { SkillDefinition } from '../data/skills';

export interface CombatantStats {
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  str: number;
  def: number;
  mag: number;
  speed: number;
  crit: number;
  acc: number;
  evasion: number;
  physDamage?: number;
  magDamage?: number;
  fireDamage?: number;
  iceDamage?: number;
  lightningDamage?: number;
  lifesteal?: number;
  statusChance?: number;
  healPower?: number;
}

export interface DamageResult {
  damage: number;
  isCrit: boolean;
  isWeak: boolean;
  isResist: boolean;
  isImmune: boolean;
  isMiss: boolean;
  isBlocked: boolean;
  element: Element;
  lifestealAmount: number;
}

const STR_COEF = 1.2;
const DEF_COEF = 0.6;
const MAG_COEF = 1.4;
const MIN_DAMAGE = 1;

export function rollHit(attackerAcc: number, defenderEvasion: number): boolean {
  const chance = Math.max(5, Math.min(95, attackerAcc - defenderEvasion));
  return Math.random() * 100 < chance;
}

export function rollCrit(critChance: number): boolean {
  return Math.random() * 100 < critChance;
}

export function getElementModifier(
  element: Element,
  resistances: Partial<Record<Element, number>>
): { mod: number; isWeak: boolean; isResist: boolean; isImmune: boolean } {
  const res = resistances[element];
  if (res === undefined) return { mod: 1.0, isWeak: false, isResist: false, isImmune: false };
  if (res <= 0) return { mod: 0, isWeak: false, isResist: false, isImmune: true };
  if (res < 1) return { mod: res, isWeak: false, isResist: true, isImmune: false };
  if (res > 1) return { mod: res, isWeak: true, isResist: false, isImmune: false };
  return { mod: 1.0, isWeak: false, isResist: false, isImmune: false };
}

export function calculatePhysicalDamage(
  attacker: CombatantStats,
  defender: CombatantStats,
  skillPower: number,
  weaponAtkMin: number,
  weaponAtkMax: number,
  element: Element = 'physical',
  resistances: Partial<Record<Element, number>> = {},
  isDefend = false
): DamageResult {
  const isMiss = !rollHit(attacker.acc, defender.evasion);
  if (isMiss) {
    return { damage: 0, isCrit: false, isWeak: false, isResist: false, isImmune: false, isMiss: true, isBlocked: false, element, lifestealAmount: 0 };
  }
  const weaponAtk = weaponAtkMin + Math.random() * (weaponAtkMax - weaponAtkMin);
  let raw = (weaponAtk + attacker.str * STR_COEF) * skillPower - defender.def * DEF_COEF;
  const isCrit = rollCrit(attacker.crit);
  if (isCrit) raw *= 1.5;
  const elem = getElementModifier(element, resistances);
  raw *= elem.mod;
  if (attacker.physDamage) raw *= 1 + attacker.physDamage / 100;
  if (isDefend) raw *= 0.5;
  const damage = Math.max(MIN_DAMAGE, Math.floor(raw));
  const lifestealAmount = attacker.lifesteal && damage > 0 ? Math.floor(damage * (attacker.lifesteal / 100)) : 0;
  return { damage, isCrit, isWeak: elem.isWeak, isResist: elem.isResist, isImmune: elem.isImmune, isMiss: false, isBlocked: isDefend, element, lifestealAmount };
}

export function calculateMagicalDamage(
  attacker: CombatantStats,
  defender: CombatantStats,
  skill: SkillDefinition,
  resistances: Partial<Record<Element, number>> = {},
  isDefend = false
): DamageResult {
  const element = (skill.element as Element) || 'dark';
  const isMiss = !rollHit(attacker.acc, defender.evasion);
  if (isMiss) {
    return { damage: 0, isCrit: false, isWeak: false, isResist: false, isImmune: false, isMiss: true, isBlocked: false, element, lifestealAmount: 0 };
  }
  let raw = attacker.mag * MAG_COEF * skill.power - defender.def * 0.3;
  const isCrit = rollCrit(attacker.crit * 0.7);
  if (isCrit) raw *= 1.4;
  const elem = getElementModifier(element, resistances);
  raw *= elem.mod;
  if (attacker.magDamage) raw *= 1 + attacker.magDamage / 100;
  if (element === 'fire' && attacker.fireDamage) raw *= 1 + attacker.fireDamage / 100;
  if (element === 'ice' && attacker.iceDamage) raw *= 1 + attacker.iceDamage / 100;
  if (element === 'lightning' && attacker.lightningDamage) raw *= 1 + attacker.lightningDamage / 100;
  if (isDefend) raw *= 0.5;
  const damage = Math.max(MIN_DAMAGE, Math.floor(raw));
  return { damage, isCrit, isWeak: elem.isWeak, isResist: elem.isResist, isImmune: elem.isImmune, isMiss: false, isBlocked: isDefend, element, lifestealAmount: 0 };
}

export function calculateHeal(caster: CombatantStats, skillPower: number): number {
  const base = Math.floor(caster.maxHp * skillPower);
  const bonus = caster.healPower ? 1 + caster.healPower / 100 : 1;
  return Math.floor(base * bonus);
}

export function getWeaponAtk(equipment: { weapon: { baseStats: { atkMin?: number; atkMax?: number } } | null }): { min: number; max: number } {
  if (!equipment.weapon) return { min: 4, max: 6 };
  const s = equipment.weapon.baseStats;
  return { min: s.atkMin ?? 4, max: s.atkMax ?? 6 };
}
