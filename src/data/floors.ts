/**
 * Floor definitions - data-driven for easy expansion.
 */

export interface FloorDefinition {
  id: number;
  name: string;
  theme: string;
  enemyPool: string[];
  elitePool: string[];
  boss: string;
  lootMultiplier: number;
  difficultyMultiplier: number;
  backgroundColor: number;
  roomCountMin: number;
  roomCountMax: number;
}

export const FLOORS: Record<number, FloorDefinition> = {
  1: {
    id: 1,
    name: 'Forgotten Catacombs',
    theme: 'stone, skeletons, candles, old altars, blood, mist',
    enemyPool: ['cave_rat', 'hollow_skeleton', 'crypt_archer', 'plague_rat', 'cultist', 'goblin_brute', 'bone_mage'],
    elitePool: ['skeleton_knight'],
    boss: 'crypt_guardian',
    lootMultiplier: 1.0,
    difficultyMultiplier: 1.0,
    backgroundColor: 0x1a1520,
    roomCountMin: 8,
    roomCountMax: 12,
  },
  2: {
    id: 2,
    name: 'Drowned Ruins',
    theme: 'water, ruined temples, swamp creatures, cold blue light',
    enemyPool: ['drowned_zombie', 'frost_cultist', 'hollow_skeleton', 'plague_rat', 'cultist'],
    elitePool: ['skeleton_knight'],
    boss: 'drowned_saint',
    lootMultiplier: 1.2,
    difficultyMultiplier: 1.25,
    backgroundColor: 0x0a1a2a,
    roomCountMin: 9,
    roomCountMax: 13,
  },
  3: {
    id: 3,
    name: 'Blood Sanctum',
    theme: 'red stone, altars, demonic symbols, cultists',
    enemyPool: ['cultist', 'goblin_brute', 'bone_mage', 'plague_rat'],
    elitePool: ['skeleton_knight'],
    boss: 'crypt_guardian',
    lootMultiplier: 1.4,
    difficultyMultiplier: 1.5,
    backgroundColor: 0x2a0a0a,
    roomCountMin: 10,
    roomCountMax: 14,
  },
};

export function getFloor(id: number): FloorDefinition {
  if (FLOORS[id]) return FLOORS[id];
  const base = FLOORS[3];
  return {
    ...base,
    id,
    name: `Depths ${id}`,
    lootMultiplier: 1 + id * 0.15,
    difficultyMultiplier: 1 + id * 0.2,
  };
}
