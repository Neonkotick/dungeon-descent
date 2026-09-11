# Balance Report — DUNGEON: DESCENT MVP

Simulated: 5000 loot rolls/floor, 500–600 combats/enemy, 1000 floor-1 runs.

## Loot rarity (after soft pity)

| Floor | Common | Uncommon | Rare | Epic | Legendary |
|-------|--------|----------|------|------|-----------|
| 1 (target) | ~70% | ~22% | ~7% | ~0.9% | ~0.1% |
| 1 (actual soft pity) | ~68% | ~21% | ~7% | ~2.5% | ~1.7% |

Pity no longer dominates early floors (was 3.5% epic / 2.4% legendary).

## Combat (smart AI + potions)

| Encounter | Lv1 win | Lv3 win | Lv5 win | Notes |
|-----------|---------|---------|---------|-------|
| Cave Rat | ~100% | 100% | 100% | Tutorial — OK |
| Goblin Brute | ~100% | 100% | 100% | 6–8 turns |
| Skeleton Knight | ~90%+ | 100% | 100% | Risky if low HP |
| Crypt Guardian | ~40–60% | ~95% | 100% | Main Floor-1 wall |
| Drowned Saint | ~10–15% | ~75% | ~99% | Floor-2 skill check |

## Tuned values

- Crypt Guardian: HP 360, STR 15, DEF 13 (was 700/22/18)
- Drowned Saint: HP 380, STR 13, DEF 11 (was 900/18/14)
- Skeleton Knight: HP 150, STR 15, DEF 12 (was 160/16/14)
- Rest heal: 50% max HP (was 40%)
- Pity: softer thresholds (+3/+5 epic at 18/28; legendary at 35/55)

## Design goals status

- Normal fights: fast, high win rate ✓
- Elite: meaningful but fair ✓
- Boss: fails without potions/defend; beatable after leveling ✓
- Loot: rare feels rare; pity prevents true drought ✓
