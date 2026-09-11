/**
 * Enemy AI - situation-aware, not pure random.
 */

import type { SkillDefinition } from '../data/skills';
import { SKILLS } from '../data/skills';
import type { StatusEffectManager } from './StatusEffectManager';

export interface AICombatant {
  id: string;
  hp: number;
  maxHp: number;
  skills: string[];
  isBoss?: boolean;
  isElite?: boolean;
  statuses: StatusEffectManager;
}

export interface AIContext {
  self: AICombatant;
  player: { hp: number; maxHp: number; statuses: StatusEffectManager };
  allies: AICombatant[];
  turnCount: number;
}

export function chooseEnemyAction(ctx: AIContext): string {
  const { self, player, allies, turnCount } = ctx;
  const hpRatio = self.hp / self.maxHp;
  const playerHpRatio = player.hp / player.maxHp;
  const available = self.skills.filter((id) => SKILLS[id]);

  if (self.isBoss) {
    if (hpRatio < 0.5 && available.includes('summon_skeleton') && Math.random() < 0.35) {
      return 'summon_skeleton';
    }
    if (available.includes('aoe_sweep') && turnCount > 0 && turnCount % 4 === 0) {
      return 'aoe_sweep';
    }
    if (available.includes('execution') && playerHpRatio < 0.4 && Math.random() < 0.4) {
      return 'execution';
    }
    if (available.includes('tidal_wave') && turnCount % 5 === 0) {
      return 'tidal_wave';
    }
  }

  if (hpRatio < 0.3) {
    const healSkill = available.find((id) => SKILLS[id].type === 'heal');
    if (healSkill && Math.random() < 0.7) return healSkill;
  }

  const hurtAlly = allies.find((a) => a.id !== self.id && a.hp / a.maxHp < 0.35);
  if (hurtAlly) {
    const heal = available.find((id) => SKILLS[id].type === 'heal' && SKILLS[id].target === 'ally');
    if (heal && Math.random() < 0.5) return heal;
  }

  if (!player.statuses.has('poison')) {
    const poison = available.find((id) => SKILLS[id].statusId === 'poison');
    if (poison && Math.random() < 0.45) return poison;
  }

  if (player.statuses.has('defense_down')) {
    const heavy = available
      .filter((id) => (SKILLS[id].power || 0) >= 1.4)
      .sort((a, b) => (SKILLS[b].power || 0) - (SKILLS[a].power || 0))[0];
    if (heavy && Math.random() < 0.6) return heavy;
  }

  if (!self.statuses.has('defense_up')) {
    const buff = available.find((id) => SKILLS[id].type === 'buff');
    if (buff && Math.random() < 0.25) return buff;
  }

  if (Math.random() < 0.35) {
    const sorted = [...available].sort(
      (a, b) => (SKILLS[b].power || 0) - (SKILLS[a].power || 0)
    );
    return sorted[0] || 'basic_attack';
  }

  return available[Math.floor(Math.random() * available.length)] || 'basic_attack';
}

export function getSkillDef(id: string): SkillDefinition {
  return SKILLS[id] || SKILLS.basic_attack;
}
