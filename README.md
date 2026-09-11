# DUNGEON: DESCENT

**Pixel Art Dungeon Crawler + Turn-Based JRPG + Roguelite**  
Telegram Mini App ready · Mobile-first · Phaser 3 + TypeScript + Vite

## Overview

Descend into unknown catacombs, grow stronger, collect rare loot and push deeper.  
Each run tells a story of risk, builds and boss fights.

**Core loop:** Hub → Start Run → Explore rooms → Turn-based battles → Loot → Rest → Boss → Next floor  
On death: Run results → Meta progression (Soul Shards) → New run

## Quick Start

```bash
git clone https://github.com/Neonkotick/dungeon-descent.git
cd dungeon-descent
npm install
npm run dev
```

Open http://localhost:5173

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview production build |
| `npm run lint` | TypeScript check |

## Implemented Systems (MVP)

- Main Menu + Continue run
- GameState + Save / Load (versioned)
- Meta progression (Soul Shards, best floor)
- Room-based dungeon generation (combat, elite, treasure, rest, shop, event, boss)
- Turn-based combat with SPEED timeline
- Player skills (Heavy Slash, Quick Strike, Guard Break, Second Wind)
- Enemy AI (situation-aware)
- Status effects (Poison, Burn, Bleed, Stun, Slow, Atk/Def Down, Break)
- Elements + resistances
- Break gauge on elites/bosses
- Loot system (rarity, affixes, pity, boss loot)
- Equipment slots + inventory
- Level up + stat growth
- Rest, Treasure, Shop, Event rooms
- Boss fights (Crypt Guardian, Drowned Saint)
- Death → run summary → meta currency
- Telegram integration layer (user, theme, back/main button, haptics, fallback)

## Architecture

```
src/
├── scenes/          # Boot, Menu, Dungeon, Battle, Inventory, GameOver
├── combat/          # TurnManager, DamageCalculator, AI, Statuses
├── dungeon/         # Procedural room-based floor generation
├── entities/        # CombatEntity (player & enemies)
├── items/           # Item generation, affixes, rarity, pity
├── data/            # enemies, skills, items, floors
├── telegram/        # TelegramService + mock
├── save/            # SaveManager + LocalSaveRepository
└── main.ts
```

## Telegram Mini App

1. `npm run build`
2. Host `dist/` on HTTPS (Vercel / Cloudflare Pages)
3. Create bot via @BotFather → `/newapp` → set URL
4. Open the bot and launch the Mini App

Works outside Telegram with mock user.

## License

MIT
