# Party Wipe — V1 Sprint Sheet

> Single source of truth for what's done, what's left, and what's cut.
> TODO.md, V1-SPEC.md, ENGINE-RULES.md are reference — this is the active tracker.

---

## What's Built (done, working)

### Data Pipeline
- [x] 26 SRD datasets typed and seeded (monsters, spells, equipment, classes, features, levels, magic items, conditions, all reference tables)
- [x] `generate-game-data.mjs` outputs 4 typed files: spell-meta (319), feature-meta (71), monster-pool (304 by CR), loot-pool (153 items)
- [x] Zone range mapping (SRD range → melee/adjacent/any)
- [x] Monster AI classifier (6 behaviors: melee-aggro, flexible, caster, boss, boss-caster, passive)

### Design System
- [x] Brand: amber/gold, Cinzel/JetBrains Mono, dark mode
- [x] 55 atoms, tokens.css, Tailwind utilities throughout
- [x] 17 molecules: DetailItem, FeatureItem, SpellListItem, AttackLine, EquipmentCard, CreatureHeader, StatRow, ResistanceRow, HealthBar, AcShield, SpellSlotPips, DamageIcon, ActionShape, ResourceBar, StatusStack, ZoneToken
- [x] Game color system (damage, schools, actions, rarity, status, resources, surfaces)
- [x] Icon system: 6 class, 12 monster types, 8 status, 8 spell schools, 5 room types, 12 items, 2 loot, 5 UI

### Combat Engine
- [x] Dice utilities (d20, expression parser with spaces/flat numbers, statMod)
- [x] Attack resolution (d20 + mod + prof vs AC, crits, fumbles)
- [x] Spell casting (damage, healing, conditions, buffs — see spell engine below)
- [x] HP tracking, death at 0
- [x] Initiative (d20 + DEX, sorted)
- [x] Zone movement (1-3, ±1 per turn)
- [x] Damage types (immunities, resistances, vulnerabilities)
- [x] Dodge action (disadvantage)
- [x] Bonus actions (Second Wind, Rage, Healing Word)
- [x] Consumables (Health Potions, quantity tracking)
- [x] Turn resources (action/bonus/movement, auto-advance)
- [x] Feature use tracking (Second Wind 1/rest, Rage 2/day)
- [x] Equipment as resolved objects (EquippedWeapon/EquippedArmor with stats)

### Spell Engine
- [x] Classification map: 52 class spells tagged as damage/healing/condition/buff/utility
- [x] Utility spells filtered from cast menu (goodberry, mage-armor, fog-cloud, etc.)
- [x] ActionBar routes targets correctly (allies for heal/buff, enemies for damage/condition, hunter's mark exception)

### Status Effect System
- [x] ActiveEffect type with condition, source, target, duration, save info
- [x] Tier 1 conditions: Hold Person (paralyzed), Sleep (unconscious), Web (restrained), Spirit Guardians (zone aura damage), Command (skip turn), Spike Growth (zone damage)
- [x] Tier 2 buffs: Bless (+1d4 attacks), Hunter's Mark (+1d6 damage), Shield of Faith (+2 AC), Shield (+5 AC 1 turn)
- [x] Turn skip for paralyzed/unconscious/commanded entities
- [x] End-of-turn repeat saves (hold person, web)
- [x] Spirit Guardians zone damage at enemy turn start
- [ ] **Advantage/disadvantage from conditions not yet wired into attack rolls**
- [ ] **Concentration breaking on damage not implemented**
- [ ] **Unconscious wake on damage not implemented**
- [ ] **Tick/expire effects at turn boundaries not fully wired**
- [ ] **Effect display on zone tokens not wired**

### Enemy AI
- [x] Behavior-based: melee-aggro (move toward, melee attack), flexible (adapt range), caster (prefer ranged/DC), boss, passive (skip)
- [x] Zone movement for melee enemies
- [ ] **No boss telegraphing or legendary actions**

### Dungeon Progression
- [x] Room generator (weighted random, boss every 5th, flavor text by tier)
- [x] Encounter generator (monsters by CR pool per floor tier, zone assignment, name dedup)
- [x] Easy first room (CR 0.125-0.25, 2 enemies)
- [x] Loot generator (drop rates by room type, pick 1 of 3, rarity/category weighted)
- [x] XP awards (split among alive party), level thresholds
- [x] Level-up (auto-applied: HP roll, features, spells, proficiency, ranger L2 spellcasting)
- [x] Equipment swap on loot pick (weapon damage/type, armor AC recalc)
- [x] Rest rooms (25% HP heal, restore 1 spell slot, reset feature uses)
- [x] Treasure rooms → loot phase
- [x] Victory → XP → loot check → level-up recap → next room
- [x] TPK → game over screen with room count + stats

### UI — Screens & Components
- [x] Title screen (logo reveal, breathing start button)
- [x] Draft page (4 placards, 6 class cards, sheet with Stats/Movesets/Spells/Equipment/Progression tabs)
- [x] Game page (room-driven phase flow)
- [x] Dev page (`/dev` — jump to any phase for testing)
- [x] Room preview (icon, type label, flavor text, enter button)
- [x] Combat (ZoneLayout, InitiativeBar, ActionBar, GameLog)
- [x] Loot view (3 cards with rarity color, description, stats, assign to character)
- [x] Rest view (heal/restore summary, rest button)
- [x] Level-up recap (single screen, all characters, HP/features/spells summary)
- [x] Game over (death icon, room count, stats, try again)
- [x] Inspect sheet (modularized: CharacterInspect + EnemyInspect)
  - Character: stats (with spellcasting stats), combat (proficiency-scaled, level-aggregated features, filtered for combat relevance), spells, gear
  - Enemy: HP/AC, stats, resistances, traits (DetailItem accordion), attacks vs abilities split, behavior badge, XP value
- [x] XP progress bar on character inspect

### Additional Work Completed
- [x] Curated v1 rosters: 46 monsters, 27 spells, 29 equipment, combat-only features
- [x] 13 combat features: Extra Attack, Sneak Attack, Action Surge, Improved Critical, Reckless Attack, Rage +2, Brutal Critical, Disciple of Life, Blessed Healer, Divine Strike, Hunter's Prey, Empowered Evocation, Channel Divinity: Preserve Life
- [x] Auto-ASI at level-up (+2 primary stat)
- [x] 14 conditions: paralyzed, unconscious, restrained, poisoned, frightened, prone, petrified, burning, frozen, blessed, hunterMarked, shielded, spiritGuarded, commanded
- [x] Monster condition application from SRD (ghoul paralysis, wolf knockdown, spider poison, etc.)
- [x] Breath weapons / save-based damage (dragon fire, hell hound, ankheg acid)
- [x] Advantage/disadvantage from conditions wired into all attack rolls
- [x] AC bonus from shield effects in enemy attack resolution
- [x] Concentration breaking on damage (CON save)
- [x] Wake unconscious on damage
- [x] Effect duration ticking + dead entity cleanup
- [x] Frightened movement restriction (player + enemy AI)
- [x] Frozen movement block
- [x] Condition stacking rules (severity hierarchy, same-source refresh)
- [x] Cantrip scaling (double dice at L5)
- [x] AI prefers DC actions (breath weapons first)
- [x] Hybrid icon system: PixArts (9) + Lucide (9) for all conditions
- [x] Rich ConditionList molecule in inspect sheets (icon, description, duration, save info)
- [x] Status icons on tokens: 20px, wrapping
- [x] Spell engine filtering (utility spells removed from class lists)
- [x] All lists alphabetically sorted (features, spells, traits, attacks, conditions, consumables, resources)
- [x] Non-caster Spells tab hidden, ring slots removed
- [x] Dev page: full condition injector for all 14 conditions
- [x] Ranger duplicate spell fix
- [x] Draft page features/progression filtered to v1 combat features only

- [x] Boundary spell system (Wall of Fire between zones, crossing damage, AI blocked, visual indicator)
- [x] Condition stacking enforced everywhere (player spells, enemy attacks, dev injector)
- [x] Code audit: removed all `as any` casts, centralized proficiencyBonus, dogfooded statusColors/boundaryColors
- [x] Orphaned files identified: loot-pool.ts, monster-actions.ts (safe to delete)

---

## What's Left for V1

### Cleanup ✓
- [x] Deleted orphaned files (loot-pool.ts, monster-actions.ts)
- [x] Draft page: refactored weapon helpers to use V1_WEAPONS roster data (58 → 25 lines)

### Strategy Depth (next session)
- [ ] Enemy Intent — broadcast next action as icon above token (sword/flame/shield/arrow)
- [ ] Rest Choices — Full Rest / Quick Rest / Train / Scout options
- [ ] Weakness Stagger — exploiting vulnerability staggers enemy (lose next action)
- [ ] Floor Modifiers — random twist per floor (Darkness, Hallowed Ground, Blood Moon, etc.)
- [ ] Equipment On-Hit Effects — Flame Tongue burns on crit, Frost Brand slows, etc.
- [ ] All-Out Attack — group attack when all enemies in a zone are disabled
- [ ] Zone Synergies — flanking bonus, cleric aura, positioning rewards

### UI — Polish (Track 2)
- [ ] Component-by-component visual polish (BG3/FF direction)
- [ ] Style pass on ZoneTokens (visual weight, spacing, damage feedback)
- [ ] Style pass on ActionBar (tile sizing, selection panel)
- [ ] Hit/damage feedback animations (screen shake, flash)
- [ ] Death animation on zone tokens
- [ ] Keyword highlighting in descriptions
- [ ] Title → draft → game transition animations

### Status Effect Animations (Phase 6 — case study showcase)
- [ ] Animated treatments on ConditionList DetailItems (CSS/Motion.js)
- [ ] Subtle token indicators (colored glow/tint per condition)
- [ ] Reusable effect layer component

### Ship
- [ ] Playtest balance pass (floor 1-5 difficulty, XP curve, loot drops)
- [ ] Deploy (Vercel)
- [ ] Case study writeup
- [ ] Demo video/recording

---

## Cut from V1

- Trap rooms (removed — no player agency, just a save roll)
- Scoreboard / local storage top 10 (game over screen with stats is enough)
- Rings / ring equipment slots (deferred — no ring items in loot pool)
- Death saves (0 HP = dead, brutal and simple)
- Reactions / opportunity attacks
- Multiclassing / feats / ASI choices
- Multi-level spell slots (flat slotsTotal/slotsUsed for now)
- Complex spells: Haste, Polymorph, Banishment, Counterspell, Wall of Force
- Utility spells with no combat effect (goodberry, mage-armor, fog-cloud, etc.)
- Responsive / mobile layout (desktop-first for case study)
- Online leaderboards
- Multiplayer

---

## File Map (active game code)

```
frontend/src/
├── app/
│   ├── page.tsx              — title screen
│   ├── draft/page.tsx        — party builder
│   ├── game/page.tsx         — main game loop (room → combat → loot → level → repeat)
│   └── dev/page.tsx          — dev harness (jump to any phase)
├── data/
│   ├── game-types.ts         — Character, Enemy, CombatState, Room, GamePhase, etc.
│   ├── classes.ts            — 6 ClassBuilds + casterProgression
│   ├── dice.ts               — rollD20, rollDice, statMod
│   ├── zones.ts              — zone distance, reach, movement
│   ├── spell-meta.ts         — [generated] 319 spells
│   ├── spell-engine.ts       — cast type classification (damage/healing/condition/buff/utility)
│   ├── feature-meta.ts       — [generated] class features by level
│   ├── monster-pool.ts       — [generated] 304 monsters by CR
│   ├── loot-pool.ts          — [generated] 153 loot items
│   ├── status-effects.ts     — ActiveEffect system, condition helpers
│   ├── encounter-config.ts   — floor tiers, room weights, boss interval
│   ├── encounter-generator.ts — monster selection, zone assignment
│   ├── loot-config.ts        — rarity tiers, drop rates
│   ├── loot-generator.ts     — loot roll + pick-1-of-3
│   ├── room-generator.ts     — procedural room selection + flavor text
│   ├── progression.ts        — XP, level-up, LevelUpResult
│   ├── game-colors.ts        — damage, school, action, rarity, status colors
│   ├── bonus-actions.ts      — bonus action definitions
│   ├── consumables.ts        — potion/scroll definitions
│   ├── weapon-helpers.ts     — icon lookup (legacy, used by draft page)
│   ├── monster-actions.ts    — SRD action normalizer
│   └── mock-combat.ts        — test scenario + rollInitiative
├── hooks/
│   └── useCombat.ts          — combat logic, enemy AI, spell casting, status effects
├── components/
│   ├── game/                 — ActionBar, ZoneLayout, InitiativeBar, GameLog, InspectSheet, CharacterInspect, EnemyInspect
│   ├── molecules/            — DetailItem, FeatureItem, SpellListItem, AttackLine, + 13 others
│   ├── atoms/                — 55 design system atoms + GameIcon, Logo
│   └── providers/            — GameProvider (state), ThemeProvider
└── scripts/
    └── generate-game-data.mjs — SRD → typed TS (spells, features, monsters, loot)
```
