/**
 * Room-based procedural dungeon generation with controlled randomness.
 */

import type { RoomType, RoomChoice } from '../save/SaveManager';
import { getFloor } from '../data/floors';

export interface DungeonRoom {
  index: number;
  type: RoomType;
  completed: boolean;
  choices?: RoomChoice[];
}

export interface DungeonFloor {
  seed: number;
  floorId: number;
  rooms: DungeonRoom[];
  currentIndex: number;
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function generateFloor(floorId: number, seed: number): DungeonFloor {
  const floorDef = getFloor(floorId);
  const rand = seededRandom(seed + floorId * 997);
  const roomCount = floorDef.roomCountMin + Math.floor(rand() * (floorDef.roomCountMax - floorDef.roomCountMin + 1));

  const types: RoomType[] = [];
  types.push('combat');
  const combatCount = 3 + Math.floor(rand() * 3);
  for (let i = 0; i < combatCount; i++) types.push('combat');
  if (rand() < (floorId === 1 ? 0.6 : 0.75)) types.push('elite');
  if (rand() < 0.85) types.push('treasure');
  if (rand() < 0.7) types.push('event');
  types.push('rest');
  if (rand() < 0.4) types.push('shop');
  while (types.length < roomCount - 1) types.push('combat');

  const middle = types.slice(1);
  for (let i = middle.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [middle[i], middle[j]] = [middle[j], middle[i]];
  }

  const finalTypes: RoomType[] = ['combat', ...middle.slice(0, roomCount - 2), 'boss'];
  if (!finalTypes.includes('rest')) {
    finalTypes[Math.max(1, finalTypes.length - 3)] = 'rest';
  }

  const rooms: DungeonRoom[] = finalTypes.map((type, index) => ({
    index, type, completed: false,
  }));

  return { seed, floorId, rooms, currentIndex: 0 };
}

export function getRoomChoices(floor: DungeonFloor, fromIndex: number): RoomChoice[] {
  const remaining = floor.rooms.filter((r) => r.index > fromIndex && !r.completed);
  if (remaining.length === 0) return [];
  const next = remaining[0];
  const choices: RoomChoice[] = [roomToChoice(next.type)];
  if (remaining.length > 1 && Math.random() < 0.6) {
    const alt = remaining[1];
    if (alt.type !== next.type) choices.push(roomToChoice(alt.type));
  }
  if (choices.length === 1 && next.type !== 'combat' && next.type !== 'boss') {
    choices.push(roomToChoice('combat'));
  }
  return choices;
}

function roomToChoice(type: RoomType): RoomChoice {
  const map: Record<RoomType, { label: string; icon: string; danger: number }> = {
    combat: { label: 'COMBAT', icon: '⚔', danger: 1 },
    elite: { label: 'ELITE', icon: '☠', danger: 3 },
    treasure: { label: 'TREASURE', icon: '💰', danger: 0 },
    event: { label: 'EVENT', icon: '?', danger: 1 },
    rest: { label: 'REST', icon: '🏕️', danger: 0 },
    shop: { label: 'SHOP', icon: '🛒', danger: 0 },
    secret: { label: 'SECRET', icon: '✦', danger: 1 },
    boss: { label: 'BOSS', icon: '👑', danger: 3 },
  };
  const m = map[type];
  return { type, label: m.label, icon: m.icon, danger: m.danger };
}

export function getEnemyIdsForRoom(floorId: number, roomType: RoomType, seed: number): string[] {
  const floorDef = getFloor(floorId);
  const rand = seededRandom(seed + roomType.length * 13);
  if (roomType === 'boss') return [floorDef.boss];
  if (roomType === 'elite') {
    const pool = floorDef.elitePool;
    return [pool[Math.floor(rand() * pool.length)]];
  }
  const count = 1 + Math.floor(rand() * (floorId === 1 ? 2 : 3));
  const pool = floorDef.enemyPool;
  const result: string[] = [];
  for (let i = 0; i < count; i++) result.push(pool[Math.floor(rand() * pool.length)]);
  return result;
}
