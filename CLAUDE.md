# Party Wipe — CLAUDE.md

## What This Is

A D&D 5e roguelike survival game. Solo party of 4 characters, zone-based combat, procedural dungeon rooms, loot, leveling. Game ends on TPK. Score tracks how far you got.

Built as pipeline proof #2 — dark/fantasy brand generated via the jmi-hub design system pipeline. Status effect animations (CSS/Motion.js/Three.js) on character placards are the design-chops showcase.

## Project Structure

```
party-wipe/
├── CLAUDE.md               ← You are here
├── README.md
├── TODO.md                 ← Build checklist (phases 0-7)
├── docs/
│   ├── V1-SPEC.md          ← Full game design spec
│   └── DATA-LICENSING.md   ← SRD licensing notes
├── engine/                 ← Game logic — utils and config
│   ├── config/
│   │   ├── encounters.ts   ← Floor tiers, CR pools, enemy counts, room weights
│   │   ├── loot.ts         ← Rarity pools by floor, drop rates, category weights
│   │   ├── spells.ts       ← Combat relevance filter, status effect mapping
│   │   └── classes.ts      ← 6 class builds (stats, gear, spells, features)
│   └── utils/
│       ├── zone.ts         ← Spell/weapon/action → zone reach (melee/adjacent/any)
│       └── monster-ai.ts   ← Monster tactical behavior classifier
├── server/                 ← SRD data pipeline
│   ├── data/
│   │   ├── databases/
│   │   │   ├── 5e-Databases/   ← Raw SRD source (2014 + 2024 editions)
│   │   │   ├── complete-data/  ← Merged/seeded output (game reads from here)
│   │   │   ├── types/          ← TypeScript interfaces for all SRD entities
│   │   │   └── read.txt
│   │   └── helpers/
│   │       ├── 5e-merger/      ← Normalize shared tables across eras
│   │       ├── 5e-seeder/      ← Transform raw SRD → complete-data
│   │       └── misc/
│   └── package.json
└── frontend/               ← Next.js 16 + React 19 + Tailwind
    ├── src/
    │   ├── app/             ← Pages (page.tsx = title screen)
    │   ├── assets/          ← Source SVGs (logo.svg)
    │   ├── components/
    │   │   ├── atoms/       ← Design system atoms (55 generated + Logo.tsx)
    │   │   ├── molecules/   ← Composed components (empty, for game UI)
    │   │   ├── playground/  ← Design system playground (ColorsView, TypographyView)
    │   │   └── providers/   ← ThemeProvider, ThemeToggle
    │   ├── config/          ← Runtime config (colors.json, typography.json, standards.json)
    │   ├── stories/         ← Component stories + registry
    │   └── tokens.css       ← Design system tokens
    └── public/              ← Static assets
```

## Data Pipeline

Two-step process: **merge** then **seed**.

- **Mergers** normalize reference tables (ability scores, conditions, damage types, etc.) across the 2014 and 2024 SRD editions into unified shapes.
- **Seeders** transform raw SRD JSON into the `complete-data/` output with consistent types (`desc` → `description`, DC structure normalization, etc.).

Run from `server/`:
```bash
npm run merge-conditions    # normalize a reference table
npm run seed-monsters       # transform raw → complete-data
```

26 complete-data JSON files with matching TypeScript types cover: monsters, spells, equipment, classes, levels, features, conditions, magic items, and all reference tables.

## Key Types

- `Monster` — full stat block with actions, legendary actions, special abilities, DC conversions
- `Spell` — level, range, damage, components, class lists, concentration
- `Equipment` — weapons (damage dice, properties), armor (AC, type), gear
- `Class` — hit die, saves, starting equipment, proficiency choices, spellcasting
- `Level` — class-specific data per level, spellcasting slots, proficiency bonus
- `Feature` — class features by level, prerequisites, descriptions
- `Condition` — status effect rules and descriptions

Shared types in `general.types.ts`: `APIReference`, `DifficultyClass`, `OptionSelection`, `SpellDamage`.

## V1 Scope

See `docs/V1-SPEC.md` for the full game design spec, `docs/ENGINE-RULES.md` for settled mechanics. Key constraints:

- 6 classes: Fighter, Rogue, Wizard, Cleric, Ranger, Barbarian
- Zone combat (melee/ranged/far), not grid
- Full SRD dataset available — no arbitrary cutoffs, game logic filters at runtime
- Level cap 10
- Solo play only (multiplayer is v2)
- Text/icon/dashboard UI — no sprites, no character-specific art
- CSS/Motion.js/Three.js status effect animations on placards ARE in scope
- Damage types + resistances/immunities tracked (data already on all monsters)
- Cantrip scaling tracked (data already in spells)
- Ability checks in non-combat rooms (trap, treasure, rest)

## Data Source

5e SRD (CC-BY-4.0). All data from the official SRD API. See `docs/DATA-LICENSING.md`.

## UI Architecture

Persistent dashboard layout — NOT discrete screen navigation:
- **Party panel** (left/persistent) — 4 character placards always visible with HP, status effects, equipment
- **Center stage** (contextual) — swaps content based on game phase (draft, combat zones, loot, rest, etc.)
- **Action bar** (bottom/contextual) — phase-appropriate actions
- **Game log** (collapsible) — combat events, loot, ability checks

Title screen is the exception — standalone, transitions into the dashboard shell.

NES/SNES-inspired aesthetic. Corner bracket motif. Lucide icons for v1, custom icons later.

## Design System

Generated via jmi-hub pipeline. Brand: amber/gold primary (#DAA520), Cinzel headings, JetBrains Mono body, dark mode default.

- Tokens in `frontend/src/tokens.css` — use `var(--space-*)`, `var(--primary)`, `var(--font-heading)`, etc.
- Typography classes: `text-display-*`, `text-title-*`, `text-body-*`, `text-label-*`
- 55 generated atoms in `components/atoms/`
- Game-specific styles in per-screen CSS files (e.g., `title.css`), NOT in globals
- Game-specific color system (rarity colors, item type colors) is a separate layer — not in design tokens

## Conventions

- TypeScript throughout
- Dogfood design system tokens — no hardcoded spacing, colors, or typography when a token exists
- Types have dual interfaces: `Monster2014` (raw) and `Monster` (unified) — game code uses unified only
- `complete-data/` is the single read path for game logic — never read from `5e-Databases/` directly
- SRD data is committed to the repo (small, ~1-3MB for v1 subset)
- Per-screen CSS files with namespaced classes (e.g., `ts-` for title screen)
