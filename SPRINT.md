# Party Wipe — V1 Sprint Sheet

> Single source of truth for what's done, what's left, and what's cut.
> TODO.md, V1-SPEC.md, ENGINE-RULES.md are reference — this is the active tracker.

---

## What's Built (done, working)

### Data Pipeline
- [x] 26 SRD datasets typed and seeded (monsters, spells, equipment, classes, features, levels, magic items, conditions, all reference tables)
- [x] `generate-game-data.mjs` outputs 3 typed files: spell-meta (319), feature-meta (71), monster-pool (304 by CR). Loot comes from the curated `v1-roster.ts` + `loot-generator.ts`, not a generated pool.
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
- [x] Advantage/disadvantage from conditions wired into all attack rolls
- [x] AC bonus from shield effects in enemy attack resolution
- [x] Concentration breaking on damage (CON save)
- [x] Wake unconscious on damage
- [x] Effect duration ticking + dead entity cleanup
- [x] Status icons on zone tokens (20px, wrapping)

### Enemy AI
- [x] Behavior-based: melee-aggro (move toward, melee attack), flexible (adapt range), caster (prefer ranged/DC), boss, passive (skip)
- [x] Zone movement for melee enemies
- [ ] **Boss telegraphing / legendary actions** (→ see Enemy Intent in Strategy Depth)

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

### Strategy Depth ✓
- [x] Enemy Intent — broadcast next action as icon above token (sword/flame/shield/arrow)
- [x] Rest Choices — Full Rest (50% HP, all slots) / Quick Rest (25% HP, 1 slot) / Train (+3 primary stat, no heal)
- [x] Weakness Stagger — vulnerability hit triggers CON save or 1-turn stagger (skip next action)
- [x] Floor Modifiers — 8 modifiers (Darkness, Hallowed Ground, Blood Moon, Ironhide, Thin Veil, Echoing Halls, Blessed Winds, Unstable Ground), floor 1 clean
- [x] Equipment On-Hit Effects — 5 magic weapons (Flame Tongue, Frost Brand, Venom Dagger, Holy Avenger, Thunderous Maul) with on-hit conditions/damage
- [x] Zone Synergies — flanking (+2 melee hit), cleric aura (+1 saves), ranger overwatch (+2 ranged dmg)
- All-Out Attack — cut from v1 scope

### Architecture Refactors ✓
- [x] useCombat split: combat-resolvers.ts (pure), enemy-turn.ts (context), combat-modifiers.ts (helpers)
- [x] useRest hook extracted for shared rest logic
- [x] createCharacter factory extracted from GameProvider into character-factory.ts
- [x] CharacterInspect unified with mode='draft'|'combat' — shared by draft + game pages
- [x] Action economy: actionUsed boolean → actionsRemaining counter (Extra Attack = 2 discrete picks)
- [x] Ring slots removed from Character type (cut from v1)
- [x] V1_FEATURES trimmed to mechanically active only (9 dead features removed)
- [x] V1_FEATURE_SUMMARIES: data-driven feature badges with badge + detail fields
- [x] Token dogfooding: ~50 tracking values, 17 font declarations, 2 border vars cleaned up
- [x] Physical damage color fixed for dark mode (#9a9590 → #c4bdb8)

### UI — Polish (Track 2)
- [x] Title screen: tagline updated ("The dungeon awaits..."), standard Button
- [x] Draft page: role subtitles on class cards, drafted indicators, iconic HP/AC placards, fade-out transition
- [x] Inspect sheets: modifier-primary StatRow, tactical ResistanceRow, section dividers, on-hit surfacing, slot-labeled Gear tab, Items tab separated, data-driven feature list
- [x] Enemy inspect: AC beside HP, CR/XP inline, species icon on defenses, behavior badge on attacks
- [x] RoomPreview component (Motion): watermark icon, letter-tick title, threat-level coloring, floor modifier briefing
- [x] LootScreen component (Motion): chest watermark, card drop, selection → assignment with stat comparison
- [x] LevelUpScreen component (Motion): letter-tick title, staggered character cards, sequential stat reveals
- [x] RestScreen component (Motion): rest watermark, sanctuary title, 3 choice cards with tradeoff coloring
- [x] GameOverScreen component (Motion): death watermark, slow letter-tick, staggered stats, "Party: Wiped." tagline
- [x] Motion (framer-motion) v12 installed, animations.css for shared keyframes + corner brackets
- [x] ZoneTokens: condition tints, attack swing, crit shake, active pulse, death animation, zone slide (layoutId)
- [x] ActionBar: larger tiles, hover lift, slide-in/out on turn change, action pips
- [x] Floating combat text: damage numbers, MISS, CRIT, IMMUNE, VULNERABLE!, RESISTED, heal
- [x] Impact slash SVG overlay on hit, spell cast glow, defend shield icon, kill vignette
- [x] Combat phase banners ("Player Phase" / "Enemy Phase" sweep)
- [x] Victory overlay ("Victory!" + XP, 2.5s before loot)
- [x] Enemy turn sequencing: async pulse → move → swing → damage → advance (abort signal pattern)
- [x] Combat log keyword highlighting (damage types, conditions, crits)
- [x] Zone layout atmospheric gradients
- [x] Initiative bar HP indicators
- [x] Game page fade-in (transition chain complete)
- [x] All raw text-[Xpx] replaced with text-label-sm across 16 files

### Status Effect Animations (Phase 6 — case study showcase)
- [x] Status effect pop-in/out with AnimatePresence (scale bounce)
- [x] Token condition tints (burning=orange, frozen=blue, poisoned=green, etc.)
- [x] CombatOverlays component as reusable effect layer (impact, defend, spell-cast, kill)

### Balance Pass ✓
- [x] Boss interval: 5 → 10 rooms
- [x] XP thresholds: ~1/3 of standard 5e for roguelike pacing
- [x] Floor tiers: smoother 6-tier curve (was 5)
- [x] Dead characters excluded from initiative
- [x] Cross-zone melee attacks prevented (reach-aware action selection)

### Ship
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
│   ├── draft/page.tsx        — party builder (shared CharacterInspect)
│   ├── game/page.tsx         — main game loop (room → combat → loot → level → repeat)
│   ├── dev/page.tsx          — dev harness (jump to any phase)
│   ├── animations.css        — shared keyframes + corner bracket component
│   ├── title.css             — title screen choreography
│   └── room.css              — room preview choreography (partially superseded by Motion)
├── data/
│   ├── game-types.ts         — Character, Enemy, CombatState, Room, GamePhase, FloorModifier, EnemyIntent, WeaponOnHit, etc.
│   ├── character-factory.ts  — shared createCharacter from ClassBuild (used by GameProvider + draft)
│   ├── classes.ts            — 6 ClassBuilds + casterProgression
│   ├── dice.ts               — rollD20, rollDice, statMod
│   ├── zones.ts              — zone distance, reach, movement
│   ├── zone-synergies.ts     — flanking, cleric aura, ranger overwatch
│   ├── spell-meta.ts         — [generated] 319 spells
│   ├── spell-engine.ts       — cast type classification (damage/healing/condition/buff/utility)
│   ├── feature-meta.ts       — [generated] class features by level
│   ├── monster-pool.ts       — [generated] 304 monsters by CR
│   ├── status-effects.ts     — ActiveEffect system, condition helpers, staggered condition
│   ├── enemy-intent.ts       — planIntents() for enemy action prediction
│   ├── floor-modifiers.ts    — 8 floor modifiers + pickFloorModifier()
│   ├── condition-descriptions.ts — ConditionInfo for 15 conditions including staggered
│   ├── encounter-config.ts   — floor tiers, room weights, boss interval
│   ├── encounter-generator.ts — monster selection, zone assignment, initiative bonus
│   ├── loot-config.ts        — rarity tiers, drop rates
│   ├── loot-generator.ts     — loot roll + pick-1-of-3, onHit propagation
│   ├── v1-roster.ts          — curated monsters/spells/equipment/features, V1_FEATURE_SUMMARIES, magic weapons
│   ├── room-generator.ts     — procedural room selection + flavor text
│   ├── progression.ts        — XP, level-up, LevelUpResult, PRIMARY_STAT
│   ├── game-colors.ts        — damage, school, action, rarity, status colors
│   ├── bonus-actions.ts      — bonus action definitions
│   ├── consumables.ts        — potion/scroll definitions
│   ├── weapon-helpers.ts     — icon lookup (legacy, used by draft page)
│   └── mock-combat.ts        — test scenario + rollInitiative
├── hooks/
│   ├── useCombat.ts          — combat glue: state, turns, spells, movement, bonus actions
│   ├── combat-resolvers.ts   — pure: player attack + spell damage resolution
│   ├── enemy-turn.ts         — enemy AI: DoT, movement, target selection, attack resolution
│   ├── combat-modifiers.ts   — floor modifier helpers (getModifiers, bloodMoonDamage, hallowedHeal)
│   └── useRest.ts            — shared rest logic (Full/Quick/Train) with onComplete callback
├── components/
│   ├── game/
│   │   ├── ActionBar.tsx     — turn action UI with actionsRemaining pips
│   │   ├── ZoneLayout.tsx    — 3-zone grid with enemy intent display
│   │   ├── InitiativeBar.tsx — turn order tracker
│   │   ├── GameLog.tsx       — combat event log
│   │   ├── InspectSheet.tsx  — sheet wrapper for character/enemy inspect
│   │   ├── CharacterInspect.tsx — unified inspect (mode='draft'|'combat'), data-driven features
│   │   ├── EnemyInspect.tsx  — enemy inspect with species defenses, behavior badges
│   │   ├── RoomPreview.tsx   — Motion-powered room preview with watermark + letter-tick
│   │   ├── LootScreen.tsx    — Motion-powered loot selection + stat comparison assignment
│   │   ├── LevelUpScreen.tsx — Motion-powered staggered level-up reveals
│   │   ├── RestScreen.tsx    — Motion-powered rest choices with tradeoff coloring
│   │   └── GameOverScreen.tsx — Motion-powered game over with run stats + "Party: Wiped."
│   ├── molecules/            — StatRow (modifier-primary), ResistanceRow (tactical grid), + 14 others
│   ├── atoms/                — 55 design system atoms + GameIcon, Logo
│   └── providers/            — GameProvider (state + setFloorModifier), ThemeProvider
└── scripts/
    └── generate-game-data.mjs — SRD → typed TS (spells, features, monsters, loot)
```
