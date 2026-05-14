# Party Wipe

A D&D 5e roguelike survival game. Build a party of 4, descend into procedurally generated dungeon rooms, fight monsters, collect loot, level up. The dungeon always wins — the question is how far you get.

## How It Works

Zone-based combat (melee / ranged / far) with 5e-lite rules. Turn-based initiative, d20 attack rolls, spell saves, status effects. Rooms scale in difficulty until your party wipes. Score tracks rooms cleared, damage dealt, characters lost, and more.

No grid. No sprites. Text, icons, and tokens — with CSS/Motion/Three.js status effect animations in combat that show the design craft.

## Status

V1 is feature-complete and plays end to end — combat engine, full UI, polish, and balance are all done. Remaining for ship: Vercel deploy, demo video, case study writeup. See [SPRINT.md](SPRINT.md) for the detailed build state.

## Setup

The game lives in `frontend/`:

```bash
cd frontend
npm install
npm run dev
```

Then open the dev server. `/` is the title screen, `/draft` builds a party, `/dev` jumps to any game phase for testing.

### Regenerating game data (optional)

Game data is committed — you only need this if the SRD subset changes. The `server/` pipeline merges and seeds the raw SRD; `frontend/scripts/generate-game-data.mjs` then emits the typed game data files. See [CLAUDE.md](CLAUDE.md#data-pipeline) for the full flow.

## Data

All game data is sourced from the [5e Systems Reference Document](https://dnd.wizards.com/resources/systems-reference-document) via the [5e SRD API](https://www.dnd5eapi.co/). A two-step merge/seed pipeline normalizes 2014 and 2024 SRD editions into unified TypeScript-typed JSON.

## Documentation

| Document | Purpose |
|----------|---------|
| [CLAUDE.md](CLAUDE.md) | Project context, structure, and conventions |
| [SPRINT.md](SPRINT.md) | Active tracker — source of truth for build state |
| [TODO.md](TODO.md) | Frozen historical build checklist |
| [docs/V1-SPEC.md](docs/V1-SPEC.md) | Game design spec |
| [docs/ENGINE-RULES.md](docs/ENGINE-RULES.md) | Shipped engine mechanics reference |
| [docs/UI-SPEC.md](docs/UI-SPEC.md) | UI component sizing and spec reference |
| [docs/DATA-LICENSING.md](docs/DATA-LICENSING.md) | SRD licensing and data source notes |

---

This game uses content from the Systems Reference Document 5.1 ("SRD 5.1") by Wizards of the Coast LLC, available at https://dnd.wizards.com/resources/systems-reference-document. The SRD 5.1 is licensed under the Creative Commons Attribution 4.0 International License (CC-BY-4.0).
