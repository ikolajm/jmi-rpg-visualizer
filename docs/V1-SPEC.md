# Party Wipe v1 — Game Spec

> D&D 5e roguelike survival game. Solo party of 4. Zone-based combat.
> Text/icon/dashboard UI with CSS/Three.js/Motion.js status effect animations.
> Pipeline proof #2 — dark/fantasy brand generated via jmi-hub design system.

---

## Core Loop

```
Create Party (4 chars, class-only)
    → Enter Dungeon
        → Room (procedural)
            → Encounter (combat / trap / rest / treasure / boss)
                → Resolution (loot, XP)
                    → Level up (between rooms)
                        → Next Room (harder)
                            → TPK = Game Over → Score Summary
```

The game is designed to kill you. The question is how far you get.

---

## Party Creation

**What the player chooses:** Class for each of 4 slots. That's it.

Everything else is auto-derived from class selection — HP, base stats, starting equipment, starting spells/abilities. No names, no race, no backstory. The party is disposable by design.

### Class Roster (v1 — 6 classes)

| Class | Role | Hit Die | Primary Stat | Starting Gear | Why Include |
|-------|------|---------|-------------|--------------|-------------|
| Fighter | Melee DPS/Tank | d10 | STR | Longsword + Chain Mail + Shield | Anchor melee class |
| Rogue | Melee Burst | d8 | DEX | Shortsword + Leather + Shortbow | Sneak attack, tactical positioning |
| Wizard | Ranged AoE/Control | d6 | INT | Quarterstaff + Spellbook | Glass cannon, spell variety |
| Cleric | Healer/Support | d8 | WIS | Mace + Scale Mail + Shield | Party can't survive without healing |
| Ranger | Ranged DPS | d10 | DEX | Longbow + Leather + Shortsword | Ranged damage dealer |
| Barbarian | Melee Tank | d12 | STR | Greataxe + no armor (Unarmored Defense) | HP sponge, rage mechanic |

**Stat generation:** Fixed array per class, not random rolls. Predictable, balanced, no reroll-fishing.

**Open question:** Do players pick from a pool of pre-built characters, or just pick 4 classes and stats are auto-assigned? Former gives a draft feel, latter is faster.

---

## Zone-Based Combat

Three zones instead of a grid. Biggest simplification, right decision.

```
┌─────────┐   ┌─────────┐   ┌─────────┐
│  MELEE  │ ← │ RANGED  │ ← │   FAR   │
│         │   │         │   │         │
│ Fighter │   │ Ranger  │   │ Wizard  │
│ Goblin  │   │ Goblin  │   │         │
│ Goblin  │   │ Archer  │   │         │
└─────────┘   └─────────┘   └─────────┘
```

### Zone Rules

- Characters and enemies occupy zones
- **Melee attacks** — only hit targets in your zone
- **Ranged attacks** — hit targets in your zone or adjacent zones
- **Spells** — range per spell (touch = same zone, 30ft = adjacent, 60ft+ = any zone)
- **Movement** — shift one zone per turn (free action). Can't shift if grappled/stunned.
- **AoE spells** — hit all enemies in a zone (makes zone choice tactically meaningful)

### Why Zones Work

Real positioning decisions (keep wizard safe in Far? send rogue to melee to flank?) without pathfinding, tile math, or spatial rendering. Three columns/panels. Chips move between zones.

---

## Turn Structure

Initiative-based, classic D&D:

1. **Roll initiative** — d20 + DEX modifier for everyone (party + enemies)
2. **Sort turn order** — displayed as horizontal queue at top
3. **Each turn:**
   - **Move** (optional) — shift one zone
   - **Action** — Attack, Cast Spell, Use Item, Defend, Dash (shift two zones)
   - **Bonus Action** — class-specific (Rogue: disengage, Cleric: healing word, etc.)
4. **Status effects** resolve at start or end of turn (per effect)

### Enemy AI (v1 — simple patterns)

- **Melee enemies:** Move toward nearest party member, attack
- **Ranged enemies:** Stay at range, attack nearest in range
- **Casters:** Use highest-value spell available, fall back to cantrips
- **Boss:** Pattern-based (telegraphed heavy attack every N turns)

Predictable enemies + random encounters = enough variety for v1.

---

## Combat Math (5e-lite)

Keep the d20 core, strip the edge cases:

- **Attack roll:** d20 + ability modifier + proficiency vs. AC
- **Damage roll:** weapon die + ability modifier
- **Spell save:** target d20 + save modifier vs. caster's spell DC
- **Spell damage:** per spell data
- **Critical hit:** nat 20 = double damage dice
- **Death:** 0 HP = dead. No death saves in v1. Brutal, simple.
- **Healing:** Cleric spells, potions. Can't exceed max HP. Can't heal the dead.

### Included

- Advantage/disadvantage (roll 2d20, take higher/lower) — too good and too cheap to skip

### Skipped (v1)

- Reactions / opportunity attacks
- Concentration checks
- Multiclassing
- Feats
- Ability score improvements (just give HP + features on level-up)

---

## Room Types & Progression

Procedural room sequence. Each room = one encounter.

| Room Type | Frequency | What Happens |
|-----------|-----------|-------------|
| **Combat** | ~60% | 1-N enemies, scaled to floor level |
| **Elite Combat** | ~15% | Tougher enemies, better loot drop |
| **Boss** | Every 5th room | Single powerful enemy or enemy + adds. Guaranteed loot. |
| **Rest** | ~10% | Heal party for % of max HP. Optional: rest vs. search for loot |
| **Treasure** | ~10% | Guaranteed item drop. Maybe trapped (DEX save) |
| **Trap** | ~5% | Saving throw to avoid damage. No enemies. |

### Scaling

- **Floor 1-5:** CR 1/4 to CR 1 enemies, basic loot
- **Floor 6-10:** CR 2-5, uncommon loot
- **Floor 11-15:** CR 5-8, rare loot
- **Floor 16+:** CR 8+, escalating until TPK is inevitable

### Between Rooms

Level-up screen if XP threshold reached. Equip new loot. See party status. Proceed.

---

## Loot & Equipment

### Drop Sources
Combat victory, treasure rooms, boss kills.

### Loot by Floor Tier
- Weapons with scaling damage
- Armor with scaling AC
- Potions (healing, resistance, stat boost — single use)
- Scrolls (one-time spell cast, any class)

### Equipment Slots (per character)
Weapon, Armor, 2 consumable slots. No encumbrance, no weight, no bag management.

### Loot Presentation
Pick 1 of 3 — adds a strategy layer and feels more roguelike than random drops.

---

## Leveling

XP from kills → level thresholds → level up between rooms.

### Per Level-Up
- HP increase (hit die + CON modifier)
- New spell slot / spell known (casters)
- New ability or feature at key class levels (e.g., Fighter Extra Attack at 5)

### Level Cap
10 for v1. 5e's power curve gets weird above 10, and surviving past floor 20+ already exceeds the game's intent.

---

## Status Effects (The Visual Showcase)

Each status effect gets a distinct CSS/Motion.js/Three.js animation on the character placard. This is where design chops live.

| Effect | Gameplay | Visual |
|--------|----------|--------|
| **Poisoned** | Disadvantage on attacks, DoT | Toxic green fog drifting over placard |
| **Burning** | DoT at turn start | Flame particles rising from edges |
| **Frozen** | Can't move zones, disadvantage on DEX | Ice crystal overlay, frost creep |
| **Cursed** | Reduced max HP | Dark corruption pulse, purple/black glow |
| **Blessed** | Advantage on saves | Golden shimmer, light particles |
| **Stunned** | Skip turn | Glitch/static effect, desaturated |
| **Raging** (Barbarian) | Extra damage, damage resistance | Red pulse, intensity on hit |
| **Concentrating** (caster) | Maintaining a spell | Subtle aura glow in spell school color |

### Tech Mix
- **Pure CSS** (`@keyframes`, `backdrop-filter`, layered `box-shadow`) for simpler effects (blessed, stunned, concentrating)
- **Motion.js** for physics-based animations (cursed pulse, rage intensity)
- **Three.js** for 1-2 standout effects where WebGL adds value CSS can't (poison fog, flame particles)

The mix itself demonstrates range.

---

## Scoring

TPK triggers the score screen.

### Tracked Stats
- Rooms cleared (primary score)
- Enemies killed (total + by type)
- Damage dealt / taken (per character + total)
- Healing done
- Characters lost (and on which room)
- Last character standing
- Floor reached
- Run duration
- Loot collected

Local scoreboard. Top 10 runs with expandable details.

---

## Screens

| Screen | What | Key Components |
|--------|------|---------------|
| **Title** | Start game, view scores | Logo, start button, scoreboard button |
| **Party Draft** | Pick 4 classes | Class cards with stats preview, confirm |
| **Dungeon View** | Room sequence, floor indicator | Room type icon, floor counter, party HP summary |
| **Combat** | Zone view, turn order, action menu | Three zone panels, initiative bar, action buttons, game log |
| **Character Placard** | Detailed character state | HP bar, status effects (animated), equipment, spells/abilities |
| **Level Up** | Stat increases, new abilities | Before/after comparison, confirm |
| **Loot** | Pick reward | 3 options with stats, pick 1, assign to character |
| **Game Over** | TPK score summary | Full run stats, save to scoreboard |
| **Scoreboard** | Top runs | Expandable run details |

---

## Data Layer — 5e SRD

### What We Need

| Dataset | Fields | Est. Records (v1) |
|---------|--------|-------------------|
| **Monsters** | name, CR, HP, AC, stats, attacks (name, hit, damage, range), abilities, type | ~100-150 (CR 1/4 through 10) |
| **Spells** | name, level, school, range, damage/effect, save type, classes, concentration | ~80-100 (levels 0-5, combat-relevant) |
| **Weapons** | name, damage die, damage type, properties (finesse, thrown, etc.) | ~20-30 |
| **Armor** | name, AC, type (light/medium/heavy), stealth disadvantage | ~10-15 |
| **Items** | name, type (potion/scroll), effect, rarity | ~20-30 |
| **Classes** | name, hit die, primary stat, saves, proficiencies, features by level 1-10, spell list | 6 |

### Data Licensing — SRD vs. Full 5e Content

See [data-licensing.md](data-licensing.md) for full analysis.

**TL;DR:** Use only 5e SRD content (CC-BY-4.0). More than enough for v1. The Kaggle/Roll20 dataset likely mixes SRD and licensed content — needs filtering or replacement with a clean SRD source.

---

## Build Pipeline

1. **Data** — type/structure the 5e SRD datasets
2. **Brand** — run questionnaire, generate dark/fantasy design system via jmi-hub pipeline
3. **Scaffold** — setup.sh into Party Wipe repo, atoms ready
4. **Game engine** — core logic (combat math, room gen, enemy AI, leveling)
5. **UI** — screens built with design system components
6. **Status effects** — CSS/Motion.js/Three.js animation layer
7. **Polish** — scoring, scoreboard, game feel

Steps 1-3 can overlap. Step 4 is the heaviest lift. Steps 5-6 are where design strengths shine.

---

## V1 Boundary

### In
- Solo play, single party of 4
- 6 classes, fixed stat arrays
- Zone-based combat (melee/ranged/far)
- Turn-based, initiative order
- Advantage/disadvantage
- Procedural rooms with scaling difficulty
- Boss every 5 rooms
- Loot (pick 1 of 3), equipment slots
- Leveling to 10
- Status effect animations on placards
- TPK scoring + local scoreboard
- Roll20 5e SRD data as backbone
- Design system pipeline proof #2

### Out (v2+)
- Multiplayer / WebSocket
- Sprites or character-specific art
- Grid-based movement
- Full 5e rules (reactions, concentration, feats, multiclass)
- Death saves
- Homebrew extension system
- Skill trees / deep equipment upgrades
- Online leaderboards
