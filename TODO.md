# Party Wipe — Build TODO

> Master checklist. Work top to bottom. Each phase gates the next.

---

## Phase 0 — Repo Setup ✓

- [x] Rename `jmi-rpg-visualizer` → `party-wipe` (GitHub settings + local remote)
- [x] Fix any cascading references from rename (imports, package.json name, etc.)
- [x] Write CLAUDE.md (project context, structure, conventions)
- [x] Write README.md (project description, SRD attribution, setup instructions)
- [x] Clean up `outdated-ideas/` — archive or delete
- [x] Update `TODO.txt` → point at this doc or remove
- [x] Restructure for game project (server/, engine/, frontend/ layout)
- [x] Move existing files into new structure
- [x] Verify all seeder/merger scripts still run after restructure
- [x] Commit clean baseline

---

## Phase 1 — Data Audit ✓

Scan each complete-data JSON against its type definition. Confirm data is solid before building game logic on top of it.

### Verify existing complete-data

- [x] `monsters.json` — spot-check 10-15 entries across CR range, verify actions/damage/DC shapes parse correctly
- [x] `spells.json` — verify damage, range, components, class lists are populated
- [x] `equipment.json` — verify weapon damage dice, armor AC, category fields
- [x] `classes.json` — verify hit_die, saving_throws, starting_equipment, proficiency_choices
- [x] `levels.json` — verify class_specific data per class, spellcasting slots, proficiency_bonus
- [x] `features.json` — verify class linkage, level requirements, descriptions
- [x] `conditions.json` — verify description format matches our status effect needs
- [x] `magicItems.json` — verify rarity, descriptions, usability
- [x] Reference tables (abilityScores, damageTypes, skills, proficiencies, etc.) — quick pass for completeness

### Identify gaps

- [x] Flag any SRD entities missing from complete-data that seeders haven't processed
- [x] Flag any type mismatches between 2014 and unified shapes — fixed 7 type issues (Monster ArmorClass→array, spellcasting slots optional, level fields optional, equipment description + max_bonus optional, feature desc→description)
- [x] Note which complete-data files have 2024 data merged vs. 2014-only
- [x] Document data coverage: 26 typed SRD datasets total

### Data fixes applied

- [x] Removed 227 duplicate `desc` fields from spells
- [x] Renamed `desc` → `description` on 407 features
- [x] Fixed spell seeder bug (line 34: `...s14` should have been `...trimmedSpell`)
- [x] Updated feature seeder to transform `desc` → `description`
- [x] Fighter empty `starting_equipment` confirmed correct (all choices via options)

---

## Phase 2 — Game-Specific Data ✓

Build the data layers the game engine needs that don't exist in raw SRD.

### Zone system

- [x] Zone range mapping utility (`engine/utils/zone.ts`) — convert SRD `range` strings into zone values (`melee | adjacent | any`)
- [x] Tag all spells with zone range (derived at runtime, not baked)
- [x] Tag all monster attacks with zone range (derived from action descriptions + attack type)

### Classes (v1 — 6 classes)

- [x] Fixed stat arrays for: Fighter, Rogue, Wizard, Cleric, Ranger, Barbarian (`engine/config/classes.ts`)
- [x] Starting equipment loadout per class (from SRD starting_equipment, curated for game)
- [x] Starting spell list per caster class (level 0-1 combat-relevant spells)
- [x] Class feature progression level 1-10 (from levels.json + features.json, filtered to v1 scope)
- [x] AC calculations per class (including Barbarian Unarmored Defense)
- [x] Caster progression through level 10

### Monsters

- [x] AI behavior classifier (`engine/utils/monster-ai.ts`) — 6 behaviors: melee-aggro (220), flexible (49), caster (30), boss (26), boss-caster (6), passive (3)
- [ ] Filter/flag combat-relevant monsters by CR (1/4 through 10 for v1)
- [ ] Boss candidates list — notable monsters per CR tier

### Encounter tables

- [x] CR-to-floor-tier mapping — 5 floor tiers (`engine/config/encounters.ts`)
- [x] Enemy count per room type (combat: 2-4, elite: 1-2 strong, boss: 1 + adds)
- [x] Room type probability weights

### Loot tables

- [x] Floor-tier-to-item-rarity mapping (`engine/config/loot.ts`)
- [x] Rarity pools by floor, category weights, drop rates by room type
- [ ] Weapon loot pool by tier (specific items)
- [ ] Armor loot pool by tier (specific items)
- [ ] Consumable pool (potions, scrolls) by tier (specific items)
- [x] Pick-1-of-3 loot generation logic spec

### Spell filtering

- [x] Flag combat-relevant spells — 197 total (125 auto + 72 manual) (`engine/config/spells.ts`)
- [x] Exclude ritual-only, utility, out-of-combat spells from game pool
- [x] Map spells to status effects — 48-entry status effect map (auto-detected from descriptions, curated), SRD→game condition consolidation

---

## Phase 3 — Design System ✓

Generate brand and component scaffold via jmi-hub pipeline.

- [x] Run questionnaire — amber/gold #DAA520, Cinzel/JetBrains Mono, dark mode, sharp/compact/flat
- [x] Generate configs (colors, typography, spacing, sizing, effects) — auto-derived secondary #2e5bcc (blue), accent #29d1a1 (teal)
- [x] Generate tokens.css
- [x] Generate 55 atoms
- [x] Generate 30 Figma scripts
- [x] Run setup.sh into `frontend/`
- [x] Verify scaffold renders at /design-system route
- [x] Fix Cinzel font weight overrides (500→Regular, 600→Bold) across 3 pipeline files
- [x] Fix Inter Regular must-load bug in Figma scripts (orchestrator.js)
- [x] Fix ColorsView/TypographyView stale baked data — setup.sh now copies config JSONs + fresh views

---

## Phase 3.5 — Iconography System

Two-source icon system: PixArts pixel art for personality items, Video Game UI silhouettes for scannable inventory items. See `docs/ICON-PICKLIST.md` for the full pick list.

### What does NOT get an icon (handled by design system)

Damage types (color chips), ability scores (letter badges), skills (text), spell levels (number badges), rarity tiers (border colors), armor weight (text), game actions (text buttons), individual spells/monsters (type icon + text name).

### Folder structure (`frontend/src/assets/`)

- [x] `class/` — 6 character class icons (PixArts v1)
- [x] `monster/` — 12 enemy type silhouettes (PixArts hand-picked: aberration, beast, celestial, construct, dragon, elemental, fey, fiend, giant, humanoid, monstrosity, undead)
- [x] `status/` — 8 status effect indicators (PixArts hand-picked: poisoned, burning, frozen, cursed, blessed, stunned, raging, concentrating)
- [x] `spell-school/` — 8 school of magic symbols (PixArts hand-picked: abjuration, conjuration, divination, enchantment, evocation, illusion, necromancy, transmutation)
- [x] `room/` — 5 dungeon room types (combat, boss, rest, treasure, trap) — elite combat uses `combat.svg` + flavor text, no separate icon
- [x] `item/` — 12 icons (sword, axe, bow, arrow, crossbow, bowie-knife/dagger, mace, orb-wand/staff, shield, chain-mail/all armor, consumable-potion, consumable-food, consumable-scroll)
- [x] `loot/` — 2 icons (open-treasure-chest, big-diamond-ring) — v1 loot is just item icons, treasure room/merchant expansion later
- [x] `ui/` — 5 icons (d12/dice, death, hasty-grave/TPK, heart-minus, heart-plus) — level-up uses Lucide `ChevronsUp` inline

### V1 Simplifications

- Elite combat → `combat.svg` + cinematic flavor text animation ("Heavy footsteps approach...")
- All armor → `chain-mail.svg` (no light/medium/heavy distinction in icons)
- Loot/treasure → item icons are the loot (weapons, consumables). Treasure room uses `open-treasure-chest.svg` contextually
- Level-up → Lucide `ChevronsUp` badge on placard, no custom icon
- Gold/gems/keys → not needed for v1 gameplay loop (weapons + armor + consumables only). Reserve for future merchant/shopping expansion

### Integration work

- [x] Build icon registry generator (`scripts/generate-icon-registry.mjs`) — extracts SVG path data into TypeScript
- [x] Build `GameIcon` component — `<GameIcon category="monster" name="dragon" size="md" />`, maps to icon size tokens
- [x] Replace Lucide placeholders in draft page with GameIcon
- [x] Build `DamageIcon` molecule — 14 damage type icons (Lucide) with game colors
- [x] Icons render in dark mode via `fill="currentColor"` + `style` prop
- [ ] Normalize SVGs — strip Inkscape metadata (low priority, icons work as-is)

---

## Phase 4 — Game Engine

Core logic, no UI. Everything testable in isolation.

### Combat system

- [x] Dice rolling utilities (`data/dice.ts` — rollD20, rollDice expression parser, statMod)
- [x] Attack resolution (d20 + mod + prof vs AC → hit/miss → damage roll)
- [x] Spell casting (attack roll spells, auto-hit, healing, slot consumption, cantrip at-will)
- [ ] Spell save DC resolution (save-based spells like Burning Hands)
- [x] HP tracking, death at 0 HP
- [ ] Status effect application, duration tracking, turn-start/end resolution
- [x] Initiative system (d20 + DEX mod, sort descending)
- [x] Zone movement rules (numeric zones 1-3, reach = melee/adjacent/any, move ±1 per turn)
- [ ] Concentration tracking (CON save on damage, DC = max(10, damage/2))
- [x] Damage type resolution (immunities → 0, resistances → half, vulnerabilities → double)
- [ ] Cantrip scaling (read `damage_at_character_level` from spell data)
- [x] Critical hit (nat 20 = double damage dice)
- [x] Critical miss (nat 1 = auto-miss)
- [ ] Fumble flavor pool (weighted fumble text on nat 1)
- [x] Dodge action (proper 5e — enemies roll with disadvantage against dodging character)
- [x] Bonus action system (Second Wind heal, Rage, Healing Word as bonus)
- [x] Consumable items (Health Potions with quantity tracking, use in combat costs Action)
- [x] Turn resource tracking (action/bonus/movement used/available per turn, auto-advance when spent)
- [x] Feature use tracking (Second Wind 1/rest, Rage 2/day — tracked per character)

### Room generation

- [ ] Procedural room type selection (weighted random)
- [ ] Encounter generation from monster pool (CR-scaled to floor)
- [ ] Trap rooms (DEX/INT/WIS checks, DC scales with floor tier)
- [ ] Rest rooms (heal % + restore one spell slot, OR search for bonus loot via ability check)
- [ ] Treasure rooms (investigation check for trap, loot on open)
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
- [ ] Flexible pattern (switch melee/ranged based on position)
- [ ] Passive pattern (non-aggressive until provoked)

### Scoring

- [ ] Run stats accumulator (damage, kills, rooms, healing, deaths)
- [ ] Score calculation
- [ ] Local storage scoreboard (top 10 runs)

---

## Phase 5 — UI

Persistent dashboard layout with design system components. NES/SNES-inspired, text+icon, corner bracket motif.

- [x] Title screen — pixelated logo → staggered Cinzel letter reveal → JetBrains Mono tagline → breathing corner bracket button
- [x] Party draft screen — `/draft` route with class cards, Sheet pull-out with tabbed breakdown (Stats with proficient highlights, Movesets with AttackLine + FeatureItem accordion, Spells with school icons + damage colors + accordion descriptions, Equipment with main-hand/off-hand/body slots, Progression from SRD feature data + caster spell progression)
- [x] Dashboard shell — `/game` route with GameProvider context, party strip (left), center stage (phase-driven), action bar (bottom, combat only)
- [x] Party token component — compact placard with class icon, HP bar, AC shield, spell slot pips, status stack
- [x] Combat zone layout — 3-column grid (Zone 1/2/3), ally + enemy tokens with HP bars and AC
- [x] Initiative bar — horizontal turn order strip with class/monster icons
- [x] Action bar — DD-style icon tiles (Attack, Cast, Move, Defend, Item, Bonus) + selection panel + separated End Turn
- [x] Combat resource tracker — action/bonus/movement/spell slots as shape pips (●▲↗◆)
- [x] Zone tokens — vertical card style with 32px icons, prominent HP bars, active turn glow, dead state grayscale
- [x] Game log — WoW-style absolute overlay, auto-scroll to bottom, color-coded (party names gold, enemy names red, system messages, death messages)
- [x] Inspect sheet — universal sidebar for character + enemy details (stats, resistances, actions)
- [ ] Level-up view — before/after stat comparison, new features/spells, confirm
- [ ] Loot view — 3 options in center stage, pick 1, assign to character via party panel
- [ ] Rest view — rest vs. search choice
- [ ] Game over view — full run stats in center stage, save to scoreboard
- [ ] Scoreboard view — top 10 runs, expandable details

---

### Architecture

Game page modularized (1207→109 lines):
- `hooks/useCombat.ts` — all combat logic (attack, cast, defend, items, bonus, move, enemy AI, turn advancement)
- `components/game/` — InitiativeBar, ZoneLayout, ActionBar, GameLog, PartyStrip, InspectSheet
- `data/weapon-helpers.ts`, `data/bonus-actions.ts`, `data/consumables.ts`, `data/game-colors.ts`, `data/zones.ts`

### Design system dogfooding

- [x] Replaced ~250 raw `[var(--*)]` bracket references with Tailwind utility classes across all components and pages
- [x] All colors use `bg-surface-2`, `text-primary`, `border-outline-subtle` etc.
- [x] All spacing uses `px-3`, `gap-4`, `p-2` etc.
- [x] All radii use `rounded-card`, `rounded-component` etc.
- Only `--bw-2` (border width) and `--font-heading` (font family) remain as legitimate custom property references

### Reference docs

- `docs/UI-SPEC.md` — component specs, icon sizes, token layouts, disabled states, tooltips
- `docs/UI-DEEP-DIVE.md` — per-game analysis (FF, BG3, D&D Beyond, DD, StS), turn flow, availability rules

---

## Phase 5.5 — UI Polish Pass (NEXT)

Refine modular components, styling, and user flows before adding more features.

- [x] Layout overhaul — sidebar removed, full-viewport game board, all HUD elements as absolute overlays
- [x] Action bar — floating bottom-center, panels expand upward, resource tracker above tiles
- [x] Game log — FAB overlay card with compact (3 entries) and expanded (scrollable) states
- [x] Zone tokens — heart icon + HP numerics + AC shield, ally/enemy divider with "vs" label, alphabetical sort
- [x] Initiative bar — floating top-center overlay
- [x] Inspect sheet — full character tabs (stats, combat, spells, gear with ring slots) + enemy view (resistances, actions)
- [x] Token dogfooding — all var() replaced with Tailwind utility classes
- [ ] Style pass on ZoneTokens — further visual weight, spacing refinement
- [ ] Style pass on ActionBar — tile sizing, selection panel polish
- [ ] Style pass on Party Strip — alignment, hover states, info density
- [ ] Keyword highlighting in spell/feature descriptions (damage types, conditions colored)
- [ ] Draft page polish — class cards, sheet tabs, overall flow
- [ ] Title screen → draft → game transition animations
- [ ] Responsive layout audit (min viewport, overflow handling)

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
