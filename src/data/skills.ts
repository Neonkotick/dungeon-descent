/**
 * Skill definitions for player and enemies.
 */

export interface SkillDefinition {
  id: string; name: string; description: string;
  mpCost: number; delay: number;
  type: 'physical' | 'magical' | 'heal' | 'buff' | 'debuff' | 'special';
  element?: string; power: number;
  target: 'single' | 'all' | 'self' | 'ally';
  statusChance?: number; statusId?: string;
  breakDamage?: number; isUltimate?: boolean;
}

export const SKILLS: Record<string, SkillDefinition> = {
  basic_attack: { id: 'basic_attack', name: 'Attack', description: 'A basic physical attack.', mpCost: 0, delay: 1.0, type: 'physical', element: 'physical', power: 1.0, target: 'single' },
  heavy_slash: { id: 'heavy_slash', name: 'Heavy Slash', description: 'Powerful overhead slash.', mpCost: 8, delay: 1.4, type: 'physical', element: 'physical', power: 1.8, target: 'single', breakDamage: 25 },
  quick_strike: { id: 'quick_strike', name: 'Quick Strike', description: 'Fast strike, recovers quickly.', mpCost: 5, delay: 0.7, type: 'physical', element: 'physical', power: 0.85, target: 'single' },
  guard_break: { id: 'guard_break', name: 'Guard Break', description: 'Lowers defense and deals break damage.', mpCost: 7, delay: 1.1, type: 'physical', element: 'physical', power: 1.1, target: 'single', statusChance: 80, statusId: 'defense_down', breakDamage: 40 },
  second_wind: { id: 'second_wind', name: 'Second Wind', description: 'Restore a portion of HP.', mpCost: 10, delay: 0.9, type: 'heal', power: 0.25, target: 'self' },
  bone_throw: { id: 'bone_throw', name: 'Bone Throw', description: 'Throws a sharp bone.', mpCost: 0, delay: 1.0, type: 'physical', element: 'physical', power: 1.15, target: 'single' },
  precise_shot: { id: 'precise_shot', name: 'Precise Shot', description: 'High accuracy arrow.', mpCost: 0, delay: 1.1, type: 'physical', element: 'physical', power: 1.3, target: 'single' },
  poison_bite: { id: 'poison_bite', name: 'Poison Bite', description: 'Bite that may poison.', mpCost: 0, delay: 1.0, type: 'physical', element: 'physical', power: 0.9, target: 'single', statusChance: 60, statusId: 'poison' },
  dark_bolt: { id: 'dark_bolt', name: 'Dark Bolt', description: 'A bolt of dark energy.', mpCost: 0, delay: 1.2, type: 'magical', element: 'dark', power: 1.25, target: 'single' },
  weak_curse: { id: 'weak_curse', name: 'Weak Curse', description: 'Lowers attack.', mpCost: 0, delay: 1.0, type: 'debuff', power: 0, target: 'single', statusChance: 70, statusId: 'attack_down' },
  heavy_smash: { id: 'heavy_smash', name: 'Heavy Smash', description: 'Slow but devastating.', mpCost: 0, delay: 1.5, type: 'physical', element: 'physical', power: 1.7, target: 'single' },
  minor_heal: { id: 'minor_heal', name: 'Minor Heal', description: 'Heals an ally.', mpCost: 0, delay: 1.0, type: 'heal', power: 0.3, target: 'ally' },
  bone_shield: { id: 'bone_shield', name: 'Bone Shield', description: 'Raises defense.', mpCost: 0, delay: 0.8, type: 'buff', power: 0, target: 'self', statusId: 'defense_up' },
  shield_bash: { id: 'shield_bash', name: 'Shield Bash', description: 'Stuns the target.', mpCost: 0, delay: 1.2, type: 'physical', element: 'physical', power: 1.0, target: 'single', statusChance: 40, statusId: 'stun', breakDamage: 20 },
  execution: { id: 'execution', name: 'Execution', description: 'Devastating finishing move.', mpCost: 0, delay: 1.6, type: 'physical', element: 'physical', power: 2.4, target: 'single', isUltimate: true },
  shield_slam: { id: 'shield_slam', name: 'Shield Slam', description: 'Heavy shield attack.', mpCost: 0, delay: 1.3, type: 'physical', element: 'physical', power: 1.5, target: 'single', breakDamage: 15 },
  summon_skeleton: { id: 'summon_skeleton', name: 'Summon Skeleton', description: 'Calls a Hollow Skeleton.', mpCost: 0, delay: 1.4, type: 'special', power: 0, target: 'self' },
  aoe_sweep: { id: 'aoe_sweep', name: 'AoE Sweep', description: 'Wide sweeping attack.', mpCost: 0, delay: 1.5, type: 'physical', element: 'physical', power: 1.3, target: 'all', isUltimate: true },
  ice_bolt: { id: 'ice_bolt', name: 'Ice Bolt', description: 'Freezing projectile.', mpCost: 0, delay: 1.1, type: 'magical', element: 'ice', power: 1.3, target: 'single', statusChance: 25, statusId: 'slow' },
  grab: { id: 'grab', name: 'Grab', description: 'Pulls and damages.', mpCost: 0, delay: 1.2, type: 'physical', element: 'physical', power: 1.2, target: 'single' },
  frost_armor: { id: 'frost_armor', name: 'Frost Armor', description: 'Ice barrier.', mpCost: 0, delay: 0.9, type: 'buff', power: 0, target: 'self', statusId: 'defense_up' },
  tidal_wave: { id: 'tidal_wave', name: 'Tidal Wave', description: 'Massive water attack.', mpCost: 0, delay: 1.6, type: 'magical', element: 'ice', power: 1.6, target: 'all', isUltimate: true },
  drown: { id: 'drown', name: 'Drown', description: 'Suffocating grip.', mpCost: 0, delay: 1.3, type: 'magical', element: 'ice', power: 1.4, target: 'single' },
  frost_nova: { id: 'frost_nova', name: 'Frost Nova', description: 'Freezing explosion.', mpCost: 0, delay: 1.4, type: 'magical', element: 'ice', power: 1.2, target: 'all', statusChance: 50, statusId: 'slow' },
};

export const PLAYER_SKILL_IDS = ['heavy_slash', 'quick_strike', 'guard_break', 'second_wind'];
