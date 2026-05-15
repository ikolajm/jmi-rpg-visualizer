# Party Wipe — Build TODO

> Historical build checklist. Phases 0–3 were the foundation.
> Phases 4–5 are mostly complete as of May 2026.
> **Active work tracked in `SPRINT.md`** — that's the source of truth for what's left.

---

## Phase 0 — Repo Setup ✓
## Phase 1 — Data Audit ✓
## Phase 2 — Game-Specific Data ✓
## Phase 3 — Design System ✓
## Phase 3.5 — Iconography System ✓

See git history for details on these phases.

---

## Phase 4 — Game Engine ✓ (core complete)

### Combat system
- [x] Dice rolling utilities (rollD20, rollDice with spaces/flat numbers, statMod)
- [x] Attack resolution (d20 + mod + prof vs AC, crits, fumbles)
- [x] Spell casting — damage, healing, conditions (hold/sleep/web/spirit guardians/command/spike growth), buffs (bless/hunter's mark/shield/shield of faith)
- [x] Spell engine classification — 52 class spells tagged, utility filtered from cast menu
- [x] HP tracking, death at 0 HP
- [x] Status effect system — ActiveEffect with conditions, saves, duration, zone aura
- [x] Initiative system (d20 + DEX mod, sorted)
- [x] Zone movement (1-3, ±1 per turn)
- [x] Damage type resolution (immunities, resistances, vulnerabilities)
- [x] Dodge action (disadvantage on attacks against)
- [x] Bonus actions (Second Wind, Rage, Healing Word)
- [x] Consumables (Health Potions with quantity tracking)
- [x] Turn resources (action/bonus/movement, auto-advance)
- [x] Feature use tracking (Second Wind 1/rest, Rage 2/day)
- [x] Equipment as resolved objects (EquippedWeapon/EquippedArmor)
- [ ] Concentration breaking on damage — see SPRINT.md
- [ ] Advantage/disadvantage from conditions wired into rolls — see SPRINT.md
- [ ] Cantrip scaling — see SPRINT.md

### Room generation
- [x] Procedural room type selection (weighted random, boss every 5th)
- [x] Encounter generation from monster pool (304 monsters, CR-scaled to floor tier)
- [x] Rest rooms (25% HP heal, restore spell slot, reset features)
- [x] Treasure rooms (guaranteed loot → loot phase)
- [x] Easy first room (CR 0.125-0.25, 2 enemies)
- [x] Flavor text by tier

### Progression
- [x] XP from kills → level threshold check
- [x] Level-up auto-applied (HP, features, spells, proficiency, ranger L2 spellcasting)
- [x] Level-up recap screen (single screen, all characters)
- [x] Loot drop generation (pick 1 of 3, rarity/category weighted)
- [x] Equipment swap (weapon damage/type, armor AC recalc)

### Enemy AI
- [x] Behavior-based: melee-aggro, flexible, caster, boss, boss-caster, passive
- [x] Zone movement for melee enemies
- [x] Status effect skip (paralyzed/unconscious enemies skip turns)

### Run stats
- [x] Damage dealt/taken, enemies killed, characters lost, rooms cleared, floor reached
- [x] Game over screen displays stats

---

## Phase 5 — UI ✓ (core complete)

- [x] Title screen
- [x] Draft page (6 class cards, sheet with 5 tabs, 4 placards)
- [x] Game page (room-driven phase flow: preview → combat → loot → level-up → rest → repeat)
- [x] Dev page (`/dev` — jump to any phase)
- [x] Room preview (icon, type, flavor text)
- [x] Combat (ZoneLayout, InitiativeBar, ActionBar, GameLog)
- [x] Loot view (3 cards, rarity colors, descriptions, assign to character)
- [x] Rest view (heal summary)
- [x] Level-up recap (all characters, HP/features/spells)
- [x] Game over (death icon, stats, try again)
- [x] Inspect sheet — modularized (CharacterInspect + EnemyInspect)
  - Characters: stats + spellcasting stats, combat features (filtered for relevance, aggregated by level), spells, gear, XP progress bar
  - Enemies: traits (DetailItem accordion), attacks vs abilities split, behavior badge, XP value, resistances
- [x] DetailItem molecule (shared accordion pattern for features/traits/spells/abilities)
- [x] Design system dogfooding (Tailwind utilities throughout)

---

## Phase 5.5 — UI Polish Pass (partial)

- [x] Layout overhaul, floating HUD overlays
- [x] Action bar, game log, zone tokens, initiative bar, inspect sheet
- [x] Token dogfooding
- [ ] Style passes, keyword highlighting, transitions, responsive — see SPRINT.md

---

## Phase 6 — Status Effect Animations — see SPRINT.md
## Phase 7 — Polish & Ship — see SPRINT.md

---

## Cut from V1

- Trap rooms, scoreboard, rings, death saves, reactions, multiclass, feats, ASI
- Multi-level spell slots, complex spells (haste/polymorph/banishment/counterspell)
- Utility spells with no combat effect
- Responsive/mobile, online leaderboards, multiplayer
