# Plan: Graphics / Animation / Audio

## Status (2026-09-11)

### Done (in main, deploying to Pages)
- BattleFX: floating damage, CRIT/WEAK/MISS, hit flash, burst particles, slash arc, shake, banners
- SpriteJuice: idle bob, attack lunge, hit recoil, death fall
- SoundManager: procedural SFX (slash, hit, crit, heal, death, boss, loot, etc.)
- BattleScene + battleHandlers wired to all of the above
- Dungeon/Menu SFX (click, chest, rest, step)
- Ambient torch embers + UI panel in battle

### Next phases
1. **P1 Graph polish** — improved pixel sprites (more detail, outlines), floor tiles for dungeon rooms
2. **P1 Frame anim** — optional 2–4 frame attack/idle sheets if art pipeline available
3. **P1 Dungeon FX** — room transition fade, loot popup glow pulse
4. **P2 UI** — HP bars as graphics, skill icons
5. **P2 Audio** — short ambient loop (optional)

### How to verify
1. Hard refresh https://neonkotick.github.io/dungeon-descent/
2. START RUN → Enter COMBAT
3. Expect: idle bob on sprites, attack lunge, floating numbers, screen shake, SFX on hit
