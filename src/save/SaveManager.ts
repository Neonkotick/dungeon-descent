/**
 * Save system with versioning and LocalSaveRepository.
 * Designed for future CloudSaveRepository swap.
 */

export interface SaveRepository {
  load(key: string): string | null;
  save(key: string, data: string): void;
  remove(key: string): void;
}

export class LocalSaveRepository implements SaveRepository {
  load(key: string): string | null {
    try { return localStorage.getItem(key); }
    catch { console.warn('[Save] localStorage unavailable'); return null; }
  }
  save(key: string, data: string): void {
    try { localStorage.setItem(key, data); }
    catch (e) { console.error('[Save] Failed to write localStorage', e); }
  }
  remove(key: string): void {
    try { localStorage.removeItem(key); } catch { /* ignore */ }
  }
}

export const SAVE_VERSION = 1;
const SAVE_KEY = 'dungeon_descent_save_v1';
const META_KEY = 'dungeon_descent_meta_v1';

export interface PlayerStats {
  hp: number; maxHp: number; mp: number; maxMp: number;
  str: number; def: number; mag: number; speed: number;
  crit: number; acc: number; evasion: number;
}

export interface ItemInstance {
  id: string; definitionId: string; name: string; rarity: Rarity;
  slot: EquipmentSlotType;
  baseStats: Partial<PlayerStats> & { atkMin?: number; atkMax?: number };
  affixes: AffixInstance[];
  specialEffect?: string;
}

export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'unique';
export type EquipmentSlotType = 'weapon' | 'helmet' | 'armor' | 'gloves' | 'boots' | 'accessory' | 'consumable';

export interface AffixInstance { id: string; name: string; stat: string; value: number; }
export interface SkillInstance { id: string; level: number; }
export interface RelicInstance { id: string; definitionId: string; }

export interface EquipmentSlot {
  weapon: ItemInstance | null; helmet: ItemInstance | null; armor: ItemInstance | null;
  gloves: ItemInstance | null; boots: ItemInstance | null; accessory: ItemInstance | null;
}

export interface RunStats {
  floorsCleared: number; enemiesKilled: number; goldEarned: number;
  damageDealt: number; damageTaken: number; itemsFound: number;
  bossesDefeated: number; startTime: number;
}

export interface MetaProgression {
  soulShards: number; bestFloor: number; totalRuns: number; totalKills: number;
  unlockedRelics: string[]; unlockedWeapons: string[];
  upgrades: { startingHp: number; startingPotion: number };
  achievements: string[];
}

export type RoomType = 'combat' | 'elite' | 'treasure' | 'event' | 'rest' | 'shop' | 'secret' | 'boss';

export interface RoomChoice {
  type: RoomType; label: string; icon: string; danger: number;
}

export interface GameState {
  saveVersion: number;
  player: {
    name: string; classId: string; level: number; xp: number; xpToNext: number;
    stats: PlayerStats; skillPoints: number; skills: SkillInstance[];
  };
  party: never[];
  inventory: ItemInstance[];
  equipment: EquipmentSlot;
  consumables: { potion: number; manaPotion: number };
  gold: number;
  currentFloor: number;
  currentRoomIndex: number;
  dungeonSeed: number;
  runStats: RunStats;
  activeRelics: RelicInstance[];
  metaProgression: MetaProgression;
  roomChoices: RoomChoice[] | null;
  currentRoomType: RoomType | null;
  inBattle: boolean;
  isDead: boolean;
}

export function createDefaultMeta(): MetaProgression {
  return {
    soulShards: 0, bestFloor: 0, totalRuns: 0, totalKills: 0,
    unlockedRelics: [], unlockedWeapons: ['rustbound_sword'],
    upgrades: { startingHp: 0, startingPotion: 0 },
    achievements: [],
  };
}

export function createNewRunState(meta: MetaProgression, seed?: number): GameState {
  const baseHp = 120 + meta.upgrades.startingHp * 5;
  return {
    saveVersion: SAVE_VERSION,
    player: {
      name: 'Warden', classId: 'warden', level: 1, xp: 0, xpToNext: 100,
      stats: {
        hp: baseHp, maxHp: baseHp, mp: 20, maxMp: 20,
        str: 12, def: 10, mag: 5, speed: 10, crit: 5, acc: 95, evasion: 5,
      },
      skillPoints: 0,
      skills: [
        { id: 'heavy_slash', level: 1 }, { id: 'quick_strike', level: 1 },
        { id: 'guard_break', level: 1 }, { id: 'second_wind', level: 1 },
      ],
    },
    party: [],
    inventory: [],
    equipment: {
      weapon: {
        id: 'start_weapon_' + Date.now(), definitionId: 'rustbound_sword',
        name: 'Rustbound Sword', rarity: 'common', slot: 'weapon',
        baseStats: { atkMin: 8, atkMax: 12, str: 0 }, affixes: [],
      },
      helmet: null, armor: null, gloves: null, boots: null, accessory: null,
    },
    consumables: { potion: 1 + meta.upgrades.startingPotion, manaPotion: 0 },
    gold: 50,
    currentFloor: 1, currentRoomIndex: 0,
    dungeonSeed: seed ?? Date.now() % 1000000,
    runStats: {
      floorsCleared: 0, enemiesKilled: 0, goldEarned: 0,
      damageDealt: 0, damageTaken: 0, itemsFound: 0, bossesDefeated: 0,
      startTime: Date.now(),
    },
    activeRelics: [],
    metaProgression: { ...meta },
    roomChoices: null, currentRoomType: null, inBattle: false, isDead: false,
  };
}

export class SaveManager {
  private repo: SaveRepository;
  constructor(repo: SaveRepository = new LocalSaveRepository()) { this.repo = repo; }

  loadRun(): GameState | null {
    const raw = this.repo.load(SAVE_KEY);
    if (!raw) return null;
    try {
      const data = JSON.parse(raw) as GameState;
      if (data.saveVersion !== SAVE_VERSION) return null;
      if (!data.player || !data.player.stats) return null;
      return data;
    } catch { return null; }
  }

  saveRun(state: GameState): void {
    try { this.repo.save(SAVE_KEY, JSON.stringify(state)); }
    catch (e) { console.error('[Save] Failed to serialize', e); }
  }

  clearRun(): void { this.repo.remove(SAVE_KEY); }

  loadMeta(): MetaProgression {
    const raw = this.repo.load(META_KEY);
    if (!raw) return createDefaultMeta();
    try {
      const data = JSON.parse(raw) as MetaProgression;
      return { ...createDefaultMeta(), ...data };
    } catch { return createDefaultMeta(); }
  }

  saveMeta(meta: MetaProgression): void {
    this.repo.save(META_KEY, JSON.stringify(meta));
  }

  endRun(state: GameState, _survived: boolean): MetaProgression {
    const meta = { ...state.metaProgression };
    meta.totalRuns += 1;
    meta.totalKills += state.runStats.enemiesKilled;
    if (state.currentFloor > meta.bestFloor) meta.bestFloor = state.currentFloor;
    const shards =
      Math.floor(state.runStats.floorsCleared * 3) +
      state.runStats.bossesDefeated * 15 +
      Math.floor(state.runStats.enemiesKilled / 5);
    meta.soulShards += Math.max(1, shards);
    this.saveMeta(meta);
    this.clearRun();
    return meta;
  }
}

export const saveManager = new SaveManager();
