# Party Wipe

A D&D 5e roguelike survival game. Build a party of 4, descend into procedurally generated dungeon rooms, fight monsters, collect loot, level up. The dungeon always wins — the question is how far you get.

## How It Works

Zone-based combat (melee / ranged / far) with 5e-lite rules. Turn-based initiative, d20 attack rolls, spell saves, status effects. Rooms scale in difficulty until your party wipes. Score tracks rooms cleared, damage dealt, characters lost, and more.

No grid. No sprites. Text, icons, and chips — with CSS/Three.js/Motion.js status effect animations on character placards that show the design craft.

## Status

**In development.** Data pipeline complete (26 typed SRD datasets). Game engine and frontend are next.

## Data

All game data is sourced from the [5e Systems Reference Document](https://dnd.wizards.com/resources/systems-reference-document) via the [5e SRD API](https://www.dnd5eapi.co/). A two-step merge/seed pipeline normalizes 2014 and 2024 SRD editions into unified TypeScript-typed JSON.

Homebrew content uses the same type shapes and is tagged separately.

## Setup

```bash
cd server
npm install
```

### Run data pipeline

```bash
npm run seed-monsters       # transform raw SRD → complete-data
npm run seed-spells
npm run merge-conditions    # normalize reference tables
# see package.json for all available scripts
```

## Documentation

| Document | Purpose |
|----------|---------|
| [CLAUDE.md](CLAUDE.md) | Project context and conventions |
| [TODO.md](TODO.md) | Build checklist |
| [docs/V1-SPEC.md](docs/V1-SPEC.md) | Full v1 game design spec |
| [docs/DATA-LICENSING.md](docs/DATA-LICENSING.md) | SRD licensing and data source notes |

---

This game uses content from the Systems Reference Document 5.1 ("SRD 5.1") by Wizards of the Coast LLC, available at https://dnd.wizards.com/resources/systems-reference-document. The SRD 5.1 is licensed under the Creative Commons Attribution 4.0 International License (CC-BY-4.0).
