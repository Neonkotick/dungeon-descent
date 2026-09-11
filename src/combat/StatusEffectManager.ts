/**
 * Status effects: Poison, Burn, Bleed, Stun, Slow, Attack Down, Defense Down, Haste.
 */

export type StatusId =
  | 'poison' | 'burn' | 'bleed' | 'stun' | 'slow'
  | 'attack_down' | 'defense_down' | 'defense_up' | 'haste' | 'broken';

export interface StatusEffect {
  id: StatusId;
  name: string;
  duration: number;
  potency: number;
  source?: string;
}

export interface StatusDefinition {
  id: StatusId;
  name: string;
  maxStack: number;
  defaultDuration: number;
  tickDamage?: (potency: number, maxHp: number) => number;
  statMod?: (potency: number) => Partial<Record<string, number>>;
  blocksAction?: boolean;
}

export const STATUS_DEFS: Record<StatusId, StatusDefinition> = {
  poison: { id: 'poison', name: 'Poison', maxStack: 1, defaultDuration: 3, tickDamage: (p, maxHp) => Math.max(2, Math.floor(maxHp * 0.04) + p) },
  burn: { id: 'burn', name: 'Burn', maxStack: 1, defaultDuration: 3, tickDamage: (p, maxHp) => Math.max(3, Math.floor(maxHp * 0.05) + p) },
  bleed: { id: 'bleed', name: 'Bleed', maxStack: 1, defaultDuration: 3, tickDamage: (p, maxHp) => Math.max(2, Math.floor(maxHp * 0.03) + p) },
  stun: { id: 'stun', name: 'Stun', maxStack: 1, defaultDuration: 1, blocksAction: true },
  slow: { id: 'slow', name: 'Slow', maxStack: 1, defaultDuration: 2, statMod: () => ({ speed: -4 }) },
  attack_down: { id: 'attack_down', name: 'Attack Down', maxStack: 1, defaultDuration: 3, statMod: (p) => ({ str: -3 - p, mag: -2 }) },
  defense_down: { id: 'defense_down', name: 'Defense Down', maxStack: 1, defaultDuration: 3, statMod: (p) => ({ def: -4 - p }) },
  defense_up: { id: 'defense_up', name: 'Defense Up', maxStack: 1, defaultDuration: 2, statMod: (p) => ({ def: 5 + p }) },
  haste: { id: 'haste', name: 'Haste', maxStack: 1, defaultDuration: 2, statMod: () => ({ speed: 5 }) },
  broken: { id: 'broken', name: 'Broken', maxStack: 1, defaultDuration: 1 },
};

export class StatusEffectManager {
  private effects: StatusEffect[] = [];

  getAll(): StatusEffect[] { return [...this.effects]; }
  has(id: StatusId): boolean { return this.effects.some((e) => e.id === id); }
  get(id: StatusId): StatusEffect | undefined { return this.effects.find((e) => e.id === id); }

  add(id: StatusId, potency = 1, duration?: number): void {
    const def = STATUS_DEFS[id];
    if (!def) return;
    const existing = this.effects.find((e) => e.id === id);
    if (existing) {
      existing.duration = Math.max(existing.duration, duration ?? def.defaultDuration);
      existing.potency = Math.max(existing.potency, potency);
      return;
    }
    if (this.effects.filter((e) => e.id === id).length >= def.maxStack) return;
    this.effects.push({ id, name: def.name, duration: duration ?? def.defaultDuration, potency });
  }

  remove(id: StatusId): void { this.effects = this.effects.filter((e) => e.id !== id); }

  tick(maxHp: number): { damage: number; messages: string[] } {
    let totalDamage = 0;
    const messages: string[] = [];
    const remaining: StatusEffect[] = [];
    for (const e of this.effects) {
      const def = STATUS_DEFS[e.id];
      if (def.tickDamage) {
        const dmg = def.tickDamage(e.potency, maxHp);
        totalDamage += dmg;
        messages.push(`${def.name}: ${dmg}`);
      }
      e.duration -= 1;
      if (e.duration > 0) remaining.push(e);
    }
    this.effects = remaining;
    return { damage: totalDamage, messages };
  }

  isActionBlocked(): boolean { return this.effects.some((e) => STATUS_DEFS[e.id]?.blocksAction); }

  getStatModifiers(): Partial<Record<string, number>> {
    const mods: Record<string, number> = {};
    for (const e of this.effects) {
      const def = STATUS_DEFS[e.id];
      if (def.statMod) {
        const m = def.statMod(e.potency);
        for (const [k, v] of Object.entries(m)) {
          mods[k] = (mods[k] || 0) + (v as number);
        }
      }
    }
    return mods;
  }

  clear(): void { this.effects = []; }
  isBroken(): boolean { return this.has('broken'); }
}
