# Party Wipe — Build TODO

> Master checklist. Work top to bottom. Each phase gates the next.

---

## Phase 0 — Repo Setup

- [ ] Rename `jmi-rpg-visualizer` → `party-wipe` (GitHub settings + local remote)
- [ ] Fix any cascading references from rename (imports, package.json name, etc.)
- [ ] Write CLAUDE.md (project context, structure, conventions)
- [ ] Write README.md (project description, SRD attribution, setup instructions)
- [ ] Clean up `outdated-ideas/` — archive or delete
- [ ] Update `TODO.txt` → point at this doc or remove
- [ ] Restructure for game project:
  ```
  party-wipe/
  ├── CLAUDE.md
  ├── README.md
  ├── data/
  │   ├── complete/          ← merged SRD output (game reads from here)
  │   ├── raw/               ← 5e-Databases/2014 + 2024 (source of truth)
  │   ├── types/             ← TypeScript interfaces
  │   ├── pipeline/          ← merger + seeder scripts
  │   │   ├── mergers/
  │   │   └── seeders/
  │   └── game/              ← game-specific data (encounter tables, loot tables, class builds, zone maps)
  ├── engine/                ← game logic (combat, rooms, AI, progression)
  ├── frontend/              ← Next.js app (design system, screens, effects)
  └── package.json
  ```
- [ ] Move existing files into new structure
- [ ] Verify all seeder/merger scripts still run after restructure
- [ ] Commit clean baseline

---

## Phase 1 — Data Audit

Scan each complete-data JSON against its type definition. Confirm data is solid before building game logic on top of it.

### Verify existing complete-data

- [ ] `monsters.json` — spot-check 10-15 entries across CR range, verify actions/damage/DC shapes parse correctly
- [ ] `spells.json` — verify damage, range, components, class lists are populated
- [ ] `equipment.json` — verify weapon damage dice, armor AC, category fields
- [ ] `classes.json` — verify hit_die, saving_throws, starting_equipment, proficiency_choices
- [ ] `levels.json` — verify class_specific data per class, spellcasting slots, proficiency_bonus
- [ ] `features.json` — verify class linkage, level requirements, descriptions
- [ ] `conditions.json` — verify description format matches our status effect needs
- [ ] `magicItems.json` — verify rarity, descriptions, usability
- [ ] Reference tables (abilityScores, damageTypes, skills, proficiencies, etc.) — quick pass for completeness

### Identify gaps

- [ ] Flag any SRD entities missing from complete-data that seeders haven't processed
- [ ] Flag any type mismatches between 2014 and unified shapes
- [ ] Note which complete-data files have 2024 data merged vs. 2014-only
- [ ] Document data coverage: how many monsters, spells, equipment items, etc. are in each file

---

## Phase 2 — Game-Specific Data

Build the data layers the game engine needs that don't exist in raw SRD.

### Zone system

- [ ] Zone range mapping utility — convert SRD `range` strings ("Touch", "30 feet", "Self", "120 feet") into zone values (`melee | adjacent | any`)
- [ ] Tag all spells with zone range
- [ ] Tag all monster attacks with zone range (derive from action descriptions + attack type)

### Classes (v1 — 6 classes)

- [ ] Fixed stat arrays for: Fighter, Rogue, Wizard, Cleric, Ranger, Barbarian
- [ ] Starting equipment loadout per class (from SRD starting_equipment, curated for game)
- [ ] Starting spell list per caster class (level 0-1 combat-relevant spells)
- [ ] Class feature progression level 1-10 (from levels.json + features.json, filtered to v1 scope)

### Monsters

- [ ] AI behavior tags per monster (`melee-aggro | ranged-kite | caster | boss`) — derive from action types
- [ ] Filter/flag combat-relevant monsters by CR (1/4 through 10 for v1)
- [ ] Boss candidates list — notable monsters per CR tier

### Encounter tables

- [ ] CR-to-floor-tier mapping (floor 1-5 → CR 1/4-1, floor 6-10 → CR 2-5, etc.)
- [ ] Enemy count per room type (combat: 2-4, elite: 1-2 strong, boss: 1 + adds)
- [ ] Room type probability weights

### Loot tables

- [ ] Floor-tier-to-item-rarity mapping
- [ ] Weapon loot pool by tier
- [ ] Armor loot pool by tier
- [ ] Consumable pool (potions, scrolls) by tier
- [ ] Pick-1-of-3 loot generation logic spec

### Spell filtering

- [ ] Flag combat-relevant spells (damage, healing, buff, debuff, control)
- [ ] Exclude ritual-only, utility, out-of-combat spells from game pool
- [ ] Map spells to status effects where applicable (e.g., Ray of Frost → Frozen)

---

## Phase 3 — Design System

Generate brand and component scaffold via jmi-hub pipeline.

- [ ] Run questionnaire — dark/fantasy aesthetic, Party Wipe brand
- [ ] Generate configs (colors, typography, spacing, sizing, effects)
- [ ] Generate tokens.css
- [ ] Generate 55 atoms
- [ ] Generate Figma scripts
- [ ] Run setup.sh into `frontend/`
- [ ] Verify scaffold renders

---

## Phase 4 — Game Engine

Core logic, no UI. Everything testable in isolation.

### Combat system

- [ ] Dice rolling utilities (d4, d6, d8, d10, d12, d20, advantage/disadvantage)
- [ ] Attack resolution (d20 + mod + prof vs AC → hit/miss → damage roll)
- [ ] Spell resolution (spell save DC vs target save → effect/damage)
- [ ] HP tracking, death at 0 HP
- [ ] Status effect application, duration tracking, turn-start/end resolution
- [ ] Initiative system (d20 + DEX mod, sort turn order)
- [ ] Zone movement rules

### Room generation

- [ ] Procedural room type selection (weighted random)
- [ ] Encounter generation from monster pool (CR-scaled to floor)
- [ ] Trap rooms (saving throw → damage)
- [ ] Rest rooms (heal % of max HP)
- [ ] Treasure rooms (loot roll)
- [ ] Boss rooms (every 5th floor)

### Progression

- [ ] XP from kills → level threshold check
- [ ] Level-up stat application (HP, features, spell slots)
- [ ] Loot drop generation (pick 1 of 3)
- [ ] Equipment swap logic

### Enemy AI

- [ ] Melee-aggro pattern (move to melee zone, attack nearest)
- [ ] Ranged-kite pattern (stay at range, attack nearest in range)
- [ ] Caster pattern (highest-value spell, fall back to cantrips)
- [ ] Boss pattern (telegraphed heavy attack every N turns)

### Scoring

- [ ] Run stats accumulator (damage, kills, rooms, healing, deaths)
- [ ] Score calculation
- [ ] Local storage scoreboard (top 10 runs)

---

## Phase 5 — UI

Screens built with design system components.

- [ ] Title screen (start, scoreboard)
- [ ] Party draft screen (class selection × 4)
- [ ] Dungeon view (room sequence, floor indicator, party HP summary)
- [ ] Combat screen (three zone panels, initiative bar, action menu, game log)
- [ ] Character placard (HP bar, status effects, equipment, spells/abilities)
- [ ] Level-up screen (before/after, confirm)
- [ ] Loot screen (3 options, pick 1, assign to character)
- [ ] Game over screen (full run stats, save to scoreboard)
- [ ] Scoreboard screen (top 10, expandable details)

---

## Phase 6 — Status Effect Animations

The design-chops showcase. CSS / Motion.js / Three.js on character placards.

- [ ] Poisoned — toxic green fog drift
- [ ] Burning — flame particles from edges
- [ ] Frozen — ice crystal overlay, frost creep
- [ ] Cursed — dark corruption pulse, purple/black glow
- [ ] Blessed — golden shimmer, light particles
- [ ] Stunned — glitch/static, desaturated
- [ ] Raging — red pulse, intensity on hit
- [ ] Concentrating — subtle aura glow in spell school color

### Tech assignments

- [ ] Identify which effects are pure CSS (`@keyframes`, `backdrop-filter`, `box-shadow`)
- [ ] Identify which use Motion.js (physics-based: pulse, intensity)
- [ ] Identify which use Three.js (particle systems: fog, flame, shimmer)
- [ ] Build reusable effect layer component that composites onto any placard

---

## Phase 7 — Polish & Ship

- [ ] Playtest balance pass — are floors 1-5 too easy? Is TPK too fast/slow?
- [ ] Tune encounter tables, loot drops, XP curves
- [ ] Game feel — turn transitions, hit feedback, death animation
- [ ] Responsive layout (desktop-first, but playable on tablet)
- [ ] Write case study for portfolio
- [ ] Record demo video
- [ ] Deploy (Vercel or similar)
