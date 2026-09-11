/**
 * Procedural item generation with rarity, affixes, pity.
 */

import {
  ITEMS,
  AFFIXES,
  RARITY_AFFIX_COUNT,
  getRarityWeights,
  type ItemDefinition,
} from '../data/items';
import type { ItemInstance, Rarity, AffixInstance, EquipmentSlotType } from '../save/SaveManager';

let pityEpic = 0;
let pityLegendary = 0;

export function resetPity(): void {
  pityEpic = 0;
  pityLegendary = 0;
}

export function rollRarity(floor: number): Rarity {
  const weights = { ...getRarityWeights(floor) };
  // Soft pity — nudge only, do not dominate base weights
  if (pityEpic >= 18) weights.epic += 3;
  if (pityEpic >= 28) weights.epic += 5;
  if (pityLegendary >= 35) weights.legendary += 2;
  if (pityLegendary >= 55) weights.legendary += 4;

  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (const [rar, w] of Object.entries(weights) as [Rarity, number][]) {
    r -= w;
    if (r <= 0) {
      if (rar === 'epic' || rar === 'legendary') {
        pityEpic = 0;
        if (rar === 'legendary') pityLegendary = 0;
      } else {
        pityEpic++;
        pityLegendary++;
      }
      return rar;
    }
  }
  pityEpic++;
  pityLegendary++;
  return 'common';
}

function pickAffixes(count: number, slot: EquipmentSlotType): AffixInstance[] {
  const pool = [...AFFIXES];
  const result: AffixInstance[] = [];
  for (let i = 0; i < count && pool.length > 0; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    const def = pool.splice(idx, 1)[0];
    const value = def.min + Math.floor(Math.random() * (def.max - def.min + 1));
    result.push({
      id: def.id + '_' + Date.now() + i,
      name: def.name,
      stat: def.stat,
      value,
    });
  }
  return result;
}

function scaleItemPower(def: ItemDefinition, floor: number): { atkMin?: number; atkMax?: number; stats: Record<string, number> } {
  const scale = 1 + (floor - 1) * 0.12;
  const atkMin = def.baseAtkMin ? Math.floor(def.baseAtkMin * scale) : undefined;
  const atkMax = def.baseAtkMax ? Math.floor(def.baseAtkMax * scale) : undefined;
  const stats: Record<string, number> = {};
  if (def.baseStats) {
    for (const [k, v] of Object.entries(def.baseStats)) {
      stats[k] = Math.floor(v * scale);
    }
  }
  return { atkMin, atkMax, stats };
}

export function generateItem(
  floor: number,
  forcedRarity?: Rarity,
  forcedSlot?: EquipmentSlotType
): ItemInstance {
  const rarity = forcedRarity || rollRarity(floor);
  const candidates = Object.values(ITEMS).filter((i) => {
    if (forcedSlot && i.slot !== forcedSlot) return false;
    const order: Rarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'unique'];
    return order.indexOf(i.rarity) <= order.indexOf(rarity);
  });

  let def: ItemDefinition;
  if (candidates.length === 0) {
    def = ITEMS.rustbound_sword;
  } else {
    const exact = candidates.filter((c) => c.rarity === rarity);
    def = (exact.length > 0 ? exact : candidates)[
      Math.floor(Math.random() * (exact.length > 0 ? exact.length : candidates.length))
    ];
  }

  const scaled = scaleItemPower(def, floor);
  const affixCount = RARITY_AFFIX_COUNT[rarity] || 0;
  const affixes = pickAffixes(affixCount, def.slot);

  const baseStats: ItemInstance['baseStats'] = { ...scaled.stats };
  if (scaled.atkMin !== undefined) baseStats.atkMin = scaled.atkMin;
  if (scaled.atkMax !== undefined) baseStats.atkMax = scaled.atkMax;

  return {
    id: `item_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    definitionId: def.id,
    name: def.name,
    rarity,
    slot: def.slot,
    baseStats,
    affixes,
    specialEffect: def.specialEffect,
  };
}

export function generateBossLoot(floor: number): ItemInstance[] {
  const items: ItemInstance[] = [];
  items.push(generateItem(floor, Math.random() < 0.3 ? 'epic' : 'rare'));
  if (Math.random() < 0.15 + floor * 0.02) {
    items.push(generateItem(floor, 'legendary'));
  }
  return items;
}

export function getSellPrice(item: ItemInstance): number {
  const base: Record<Rarity, number> = {
    common: 8,
    uncommon: 25,
    rare: 60,
    epic: 150,
    legendary: 400,
    unique: 500,
  };
  return base[item.rarity] + item.affixes.length * 10;
}
