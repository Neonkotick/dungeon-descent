/**
 * Enemy definitions - data-driven.
 */

export type Element = 'physical' | 'fire' | 'ice' | 'lightning' | 'holy' | 'dark';

export interface EnemyDefinition {
  id: string; name: string; maxHp: number;
  str: number; def: number; mag: number; speed: number;
  crit: number; acc: number; evasion: number;
  element: Element;
  resistances: Partial<Record<Element, number>>;
  skills: string[];
  isElite?: boolean; isBoss?: boolean; breakGauge?: number;
  xp: number; goldMin: number; goldMax: number;
  lootTable: string; color: number;
}

export const ENEMIES: Record<string, EnemyDefinition> = {
  cave_rat: {
    id: 'cave_rat', name: 'Cave Rat', maxHp: 35,
    str: 6, def: 2, mag: 0, speed: 12, crit: 5, acc: 90, evasion: 15,
    element: 'physical', resistances: {}, skills: ['basic_attack'],
    xp: 12, goldMin: 3, goldMax: 8, lootTable: 'floor1_common', color: 0x8b7355,
  },
  hollow_skeleton: {
    id: 'hollow_skeleton', name: 'Hollow Skeleton', maxHp: 55,
    str: 9, def: 8, mag: 0, speed: 8, crit: 5, acc: 85, evasion: 5,
    element: 'physical', resistances: { physical: 0.7 }, skills: ['basic_attack', 'bone_throw'],
    xp: 18, goldMin: 5, goldMax: 12, lootTable: 'floor1_common', color: 0xc0c0c0,
  },
  crypt_archer: {
    id: 'crypt_archer', name: 'Crypt Archer', maxHp: 40,
    str: 11, def: 3, mag: 0, speed: 11, crit: 12, acc: 92, evasion: 10,
    element: 'physical', resistances: {}, skills: ['basic_attack', 'precise_shot'],
    xp: 20, goldMin: 6, goldMax: 14, lootTable: 'floor1_common', color: 0x6b8e23,
  },
  plague_rat: {
    id: 'plague_rat', name: 'Plague Rat', maxHp: 45,
    str: 7, def: 3, mag: 4, speed: 13, crit: 5, acc: 88, evasion: 18,
    element: 'physical', resistances: {}, skills: ['basic_attack', 'poison_bite'],
    xp: 22, goldMin: 7, goldMax: 15, lootTable: 'floor1_common', color: 0x556b2f,
  },
  cultist: {
    id: 'cultist', name: 'Cultist', maxHp: 50,
    str: 5, def: 4, mag: 12, speed: 9, crit: 8, acc: 90, evasion: 8,
    element: 'dark', resistances: { dark: 0.5, holy: 1.5 }, skills: ['basic_attack', 'dark_bolt', 'weak_curse'],
    xp: 25, goldMin: 8, goldMax: 18, lootTable: 'floor1_common', color: 0x4b0082,
  },
  goblin_brute: {
    id: 'goblin_brute', name: 'Goblin Brute', maxHp: 95,
    str: 15, def: 7, mag: 0, speed: 6, crit: 5, acc: 80, evasion: 3,
    element: 'physical', resistances: {}, skills: ['basic_attack', 'heavy_smash'],
    xp: 30, goldMin: 10, goldMax: 22, lootTable: 'floor1_common', color: 0x228b22,
  },
  bone_mage: {
    id: 'bone_mage', name: 'Bone Mage', maxHp: 48,
    str: 3, def: 4, mag: 15, speed: 10, crit: 5, acc: 92, evasion: 8,
    element: 'dark', resistances: { dark: 0.5, physical: 0.8 }, skills: ['dark_bolt', 'minor_heal', 'bone_shield'],
    xp: 28, goldMin: 10, goldMax: 20, lootTable: 'floor1_common', color: 0x9370db,
  },
  skeleton_knight: {
    id: 'skeleton_knight', name: 'Skeleton Knight', maxHp: 150,
    str: 15, def: 12, mag: 0, speed: 7, crit: 8, acc: 88, evasion: 5,
    element: 'physical', resistances: { physical: 0.7 },
    skills: ['basic_attack', 'shield_bash', 'execution'],
    isElite: true, breakGauge: 100,
    xp: 80, goldMin: 30, goldMax: 55, lootTable: 'elite', color: 0xa9a9a9,
  },
  drowned_zombie: {
    id: 'drowned_zombie', name: 'Drowned Zombie', maxHp: 70,
    str: 12, def: 7, mag: 0, speed: 5, crit: 3, acc: 75, evasion: 2,
    element: 'physical', resistances: { ice: 0.5, fire: 1.4 }, skills: ['basic_attack', 'grab'],
    xp: 35, goldMin: 12, goldMax: 25, lootTable: 'floor2_common', color: 0x4682b4,
  },
  frost_cultist: {
    id: 'frost_cultist', name: 'Frost Cultist', maxHp: 60,
    str: 4, def: 5, mag: 16, speed: 9, crit: 8, acc: 90, evasion: 8,
    element: 'ice', resistances: { ice: 0.3, fire: 1.5 }, skills: ['ice_bolt', 'frost_armor'],
    xp: 40, goldMin: 14, goldMax: 28, lootTable: 'floor2_common', color: 0x87ceeb,
  },
  crypt_guardian: {
    id: 'crypt_guardian', name: 'Crypt Guardian', maxHp: 360,
    str: 15, def: 13, mag: 8, speed: 6, crit: 10, acc: 90, evasion: 5,
    element: 'physical', resistances: { physical: 0.8, dark: 0.7 },
    skills: ['basic_attack', 'shield_slam', 'summon_skeleton', 'aoe_sweep', 'execution'],
    isBoss: true, breakGauge: 150,
    xp: 250, goldMin: 80, goldMax: 120, lootTable: 'boss1', color: 0x708090,
  },
  drowned_saint: {
    id: 'drowned_saint', name: 'The Drowned Saint', maxHp: 380,
    str: 13, def: 11, mag: 20, speed: 8, crit: 8, acc: 92, evasion: 8,
    element: 'ice', resistances: { ice: 0.2, fire: 1.6, physical: 0.9 },
    skills: ['ice_bolt', 'tidal_wave', 'drown', 'frost_nova'],
    isBoss: true, breakGauge: 180,
    xp: 350, goldMin: 100, goldMax: 160, lootTable: 'boss2', color: 0x1e90ff,
  },
};

export const FLOOR_ENEMY_POOLS: Record<number, string[]> = {
  1: ['cave_rat', 'hollow_skeleton', 'crypt_archer', 'plague_rat', 'cultist', 'goblin_brute', 'bone_mage'],
  2: ['drowned_zombie', 'frost_cultist', 'hollow_skeleton', 'plague_rat', 'cultist'],
  3: ['cultist', 'goblin_brute', 'bone_mage', 'skeleton_knight'],
};

export const FLOOR_ELITE_POOLS: Record<number, string[]> = {
  1: ['skeleton_knight'], 2: ['skeleton_knight'], 3: ['skeleton_knight'],
};

export const FLOOR_BOSSES: Record<number, string> = {
  1: 'crypt_guardian', 2: 'drowned_saint', 3: 'crypt_guardian',
};
