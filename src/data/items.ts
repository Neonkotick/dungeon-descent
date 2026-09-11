/**
 * Item definitions, affixes, loot tables.
 */

import type { Rarity, EquipmentSlotType } from '../save/SaveManager';

export interface ItemDefinition {
  id: string; name: string; rarity: Rarity; slot: EquipmentSlotType;
  baseAtkMin?: number; baseAtkMax?: number;
  baseStats?: Record<string, number>;
  specialEffect?: string; description?: string;
}

export interface AffixDefinition {
  id: string; name: string; stat: string; min: number; max: number;
  forSlots?: EquipmentSlotType[];
}

export const AFFIXES: AffixDefinition[] = [
  { id: 'str', name: '+STR', stat: 'str', min: 1, max: 4 },
  { id: 'def', name: '+DEF', stat: 'def', min: 1, max: 4 },
  { id: 'mag', name: '+MAG', stat: 'mag', min: 1, max: 4 },
  { id: 'speed', name: '+SPEED', stat: 'speed', min: 1, max: 3 },
  { id: 'hp', name: '+HP', stat: 'maxHp', min: 8, max: 25 },
  { id: 'mp', name: '+MP', stat: 'maxMp', min: 3, max: 12 },
  { id: 'crit', name: '+CRIT', stat: 'crit', min: 2, max: 6 },
  { id: 'fire_dmg', name: '+Fire Dmg', stat: 'fireDamage', min: 5, max: 15 },
  { id: 'ice_dmg', name: '+Ice Dmg', stat: 'iceDamage', min: 5, max: 15 },
  { id: 'lightning_dmg', name: '+Lightning Dmg', stat: 'lightningDamage', min: 5, max: 15 },
  { id: 'holy_res', name: '+Holy Res', stat: 'holyRes', min: 5, max: 15 },
  { id: 'dark_res', name: '+Dark Res', stat: 'darkRes', min: 5, max: 15 },
  { id: 'poison_res', name: '+Poison Res', stat: 'poisonRes', min: 10, max: 25 },
  { id: 'lifesteal', name: 'Lifesteal', stat: 'lifesteal', min: 2, max: 6 },
  { id: 'phys_dmg', name: '+Phys Dmg', stat: 'physDamage', min: 3, max: 10 },
  { id: 'mag_dmg', name: '+Mag Dmg', stat: 'magDamage', min: 3, max: 10 },
  { id: 'gold_gain', name: '+Gold Gain', stat: 'goldGain', min: 5, max: 15 },
  { id: 'status_chance', name: '+Status Chance', stat: 'statusChance', min: 5, max: 12 },
  { id: 'heal_power', name: '+Healing', stat: 'healPower', min: 5, max: 15 },
  { id: 'evasion', name: '+Evasion', stat: 'evasion', min: 2, max: 6 },
];

export const ITEMS: Record<string, ItemDefinition> = {
  rustbound_sword: { id: 'rustbound_sword', name: 'Rustbound Sword', rarity: 'common', slot: 'weapon', baseAtkMin: 8, baseAtkMax: 12 },
  soldier_blade: { id: 'soldier_blade', name: "Soldier's Blade", rarity: 'uncommon', slot: 'weapon', baseAtkMin: 12, baseAtkMax: 18, baseStats: { str: 2 } },
  gravekeeper_sword: { id: 'gravekeeper_sword', name: "Gravekeeper's Sword", rarity: 'rare', slot: 'weapon', baseAtkMin: 18, baseAtkMax: 26, baseStats: { str: 4 }, specialEffect: 'dark_damage_5' },
  bloodfang: { id: 'bloodfang', name: 'Bloodfang', rarity: 'epic', slot: 'weapon', baseAtkMin: 22, baseAtkMax: 32, baseStats: { crit: 5 }, specialEffect: 'lifesteal_3_bleed_10' },
  soulrender: { id: 'soulrender', name: 'Soulrender', rarity: 'legendary', slot: 'weapon', baseAtkMin: 28, baseAtkMax: 40, baseStats: { str: 8, crit: 7 }, specialEffect: 'kill_heal_5' },
  bone_cleaver: { id: 'bone_cleaver', name: 'Bone Cleaver', rarity: 'uncommon', slot: 'weapon', baseAtkMin: 14, baseAtkMax: 20, baseStats: { str: 1 } },
  shadow_dagger: { id: 'shadow_dagger', name: 'Shadow Dagger', rarity: 'rare', slot: 'weapon', baseAtkMin: 10, baseAtkMax: 16, baseStats: { speed: 3, crit: 8 } },
  leather_cap: { id: 'leather_cap', name: 'Leather Cap', rarity: 'common', slot: 'helmet', baseStats: { def: 2, maxHp: 5 } },
  iron_helm: { id: 'iron_helm', name: 'Iron Helm', rarity: 'uncommon', slot: 'helmet', baseStats: { def: 5, maxHp: 12 } },
  bone_mask: { id: 'bone_mask', name: 'Bone Mask', rarity: 'rare', slot: 'helmet', baseStats: { def: 4, mag: 3, maxHp: 10 } },
  ragged_tunic: { id: 'ragged_tunic', name: 'Ragged Tunic', rarity: 'common', slot: 'armor', baseStats: { def: 3, maxHp: 10 } },
  chain_mail: { id: 'chain_mail', name: 'Chain Mail', rarity: 'uncommon', slot: 'armor', baseStats: { def: 8, maxHp: 20 } },
  crypt_plate: { id: 'crypt_plate', name: 'Crypt Plate', rarity: 'rare', slot: 'armor', baseStats: { def: 12, maxHp: 30, str: 2 } },
  blood_armor: { id: 'blood_armor', name: 'Blood Armor', rarity: 'epic', slot: 'armor', baseStats: { def: 10, maxHp: 40 }, specialEffect: 'lifesteal_2' },
  leather_gloves: { id: 'leather_gloves', name: 'Leather Gloves', rarity: 'common', slot: 'gloves', baseStats: { def: 1, str: 1 } },
  iron_gauntlets: { id: 'iron_gauntlets', name: 'Iron Gauntlets', rarity: 'uncommon', slot: 'gloves', baseStats: { def: 3, str: 2 } },
  assassin_gloves: { id: 'assassin_gloves', name: 'Assassin Gloves', rarity: 'rare', slot: 'gloves', baseStats: { crit: 5, speed: 2 } },
  worn_boots: { id: 'worn_boots', name: 'Worn Boots', rarity: 'common', slot: 'boots', baseStats: { def: 1, speed: 1 } },
  traveler_boots: { id: 'traveler_boots', name: "Traveler's Boots", rarity: 'uncommon', slot: 'boots', baseStats: { def: 2, speed: 3, evasion: 3 } },
  shadow_boots: { id: 'shadow_boots', name: 'Shadow Boots', rarity: 'rare', slot: 'boots', baseStats: { speed: 5, evasion: 6 } },
  copper_ring: { id: 'copper_ring', name: 'Copper Ring', rarity: 'common', slot: 'accessory', baseStats: { maxHp: 8 } },
  silver_amulet: { id: 'silver_amulet', name: 'Silver Amulet', rarity: 'uncommon', slot: 'accessory', baseStats: { maxMp: 8, mag: 2 } },
  blood_talisman: { id: 'blood_talisman', name: 'Blood Talisman', rarity: 'rare', slot: 'accessory', baseStats: { crit: 4 }, specialEffect: 'lifesteal_3' },
  soul_crystal: { id: 'soul_crystal', name: 'Soul Crystal', rarity: 'epic', slot: 'accessory', baseStats: { mag: 5, maxMp: 15 }, specialEffect: 'dark_damage_10' },
};

export const RARITY_AFFIX_COUNT: Record<Rarity, number> = {
  common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4, unique: 0,
};

export const RARITY_COLORS: Record<Rarity, number> = {
  common: 0xaaaaaa, uncommon: 0x4caf50, rare: 0x2196f3,
  epic: 0x9c27b0, legendary: 0xff9800, unique: 0xf44336,
};

export const RARITY_WEIGHTS_FLOOR: Record<number, Record<Rarity, number>> = {
  1: { common: 70, uncommon: 22, rare: 7, epic: 0.9, legendary: 0.1, unique: 0 },
  2: { common: 60, uncommon: 28, rare: 10, epic: 1.5, legendary: 0.5, unique: 0 },
  3: { common: 50, uncommon: 32, rare: 14, epic: 3, legendary: 1, unique: 0 },
  5: { common: 45, uncommon: 35, rare: 16, epic: 3.5, legendary: 0.5, unique: 0 },
  10: { common: 25, uncommon: 35, rare: 28, epic: 10, legendary: 2, unique: 0 },
};

export function getRarityWeights(floor: number): Record<Rarity, number> {
  const keys = Object.keys(RARITY_WEIGHTS_FLOOR).map(Number).sort((a, b) => a - b);
  let best = 1;
  for (const k of keys) { if (floor >= k) best = k; }
  return RARITY_WEIGHTS_FLOOR[best];
}
