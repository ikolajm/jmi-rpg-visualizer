# UI Deep Dive — Game Reference Analysis

> Per-game breakdown of combat flows, menu patterns, information display, and UX decisions. Four reference pillars: Final Fantasy series, Baldur's Gate 3, D&D Digital Tools (D&D Beyond + Roll20), and Darkest Dungeon/Slay the Spire.

---

## 1. Final Fantasy (IX, X, XVI)

### Combat Flow — FF X (Turn-Based, Closest to Us)

FF X uses a **Conditional Turn-Based** system — no ATB bars, pure turn order like ours:

1. **Initiative**: Turn order displayed as a vertical strip on the right side of screen. Shows next ~8 turns. Player can see how actions affect future turn order.
2. **Command Menu**: When it's your turn, a compact menu appears:
   - Attack
   - Magic → sub-list of available spells with MP cost
   - Skill → character-specific abilities
   - Item → consumable list with quantities
   - Defend
   - Flee (not applicable for us)
3. **Target Selection**: After choosing action, cursor moves to enemy/ally selection. Valid targets highlighted, invalid dimmed.
4. **Resolution**: Animation plays, damage numbers pop, HP bars update. Turn advances.

**Key UX decisions:**
- All menu options always visible — disabled ones are grayed, not hidden
- MP cost shown inline next to every spell: `Fire (5 MP)` vs `Firaga (32 MP)`
- Insufficient MP = spell is dimmed with no interaction
- Command menu is compact (5-6 items max at top level)
- Sub-menus (Magic, Item) are scrollable lists with costs visible
- Turn order strip lets player plan ahead: "if I use Haste, Tidus gets two turns before the enemy"

### Equipment — FF X (Image 24)

Clean key-value pairs:
```
Overdrive    Mode: Stoic
Weapon       ⚔ Brotherhood
Armor        🛡 Buckler
```

Below, two columns: Equipment (available items) | Abilities (passive bonuses from equipment).

Each item has a small icon prefix showing its type. Current equipment shown prominently at top, swappable items listed below.

**Takeaway for us:** Equipment display doesn't need to be complex. Icon + name + one key stat. The FF approach is simpler than BG3's multi-section tooltip and arguably faster to scan.

### Equipment Comparison — FF XVI (Image 23)

Side-by-side cards: Currently Equipped vs. Selected Item. Below both cards:
```
Attack  2704  →  3004  (+300, green)
Defense 2182  →  2182  (no change)
Stagger  408  →   408  (no change)
```

Delta values in green (upgrade) or red (downgrade). Player instantly sees the trade-off.

**Takeaway for us:** Our loot selection phase MUST show comparison deltas. Not raw stats — the difference from current equipment.

### Inventory — FF IX (Image 26)

The simplest, most readable inventory in gaming:
```
[potion icon] Potion .............. 99
[ether icon]  Ether ............... 17
[phoenix icon] Phoenix Down ....... 55
```

Two columns, icon + name + quantity. No stat panels, no descriptions inline. Selected item's description appears separately. Color-coded icons by type (green potions, blue ethers, yellow combat items).

**Takeaway for us:** For consumables in our action menu, this is the model. Don't over-design it. Icon + name + count. Detail on hover/select.

---

## 2. Baldur's Gate 3

### Combat Flow

1. **Initiative Roll**: All participants roll d20 + DEX mod. Turn order shown as horizontal portrait strip (Images 8-9).
2. **Active Turn**: Your character highlights. Action bar at bottom shows available actions as icon tiles, categorized by tab (Common, Spell, Class, Items).
3. **Resource Display** (Image 22): Bottom HUD shows remaining resources:
   - `● Movement 9.0m`
   - `◆◆ Spell Slots`
   - `●● Infusion Slots`
4. **Action Selection**: Click ability icon → valid targets highlight on the battlefield → click target → resolve.
5. **End Turn**: Explicit "End Turn" button, large and separate.

### Spell Presentation — The Gold Standard

**Spell List (Image 14 — Character Creation):**
- Spells shown as circular icon tiles in rows
- Organized by: Cantrips (3/3), Spells (6/6), Prepared Spells (4/4)
- Each has a "Customize" button to swap choices
- Small circular icons with school-colored art

**Spell Tooltip (Images 6, 13, 20, 21):**

Consistent hierarchy across every spell:

```
┌─────────────────────────────────────────────────┐
│  Spell Name                        [icon 48px]  │
│  Level X School Spell (in school color)         │
│                                                 │
│  ⚠ Warning text (if applicable, orange)         │
│                                                 │
│  10~30 Damage                                   │
│    2d6+6 ⟋ Slashing                            │
│    +2d6 🔥 Fire (in orange)                     │
│                                                 │
│  Description paragraph with **keywords**        │
│  highlighted in relevant colors.                │
│                                                 │
│  ⏱ 10 turns                                    │
│                                                 │
│  ↗ 18m  🎲 WIS Save  👁 Concentration          │
│  🔄 Long Rest                                  │
│                                                 │
│ ┌─── footer bar (darker bg) ──────────────────┐│
│ │ ● Action    ▲ Bonus Action                  ││
│ │ ■ Level 6 Spell Slot                        ││
│ └─────────────────────────────────────────────┘│
└─────────────────────────────────────────────────┘
```

**Critical patterns:**
- **Damage breakdown**: Primary damage line, then bonus damage on separate indented line in its damage type color
- **Keywords highlighted**: "Cold damage" in blue, "Concentrating" linked, "Immune" bolded
- **Footer bar**: Visually separated with darker background. Action types as colored shapes. Slot cost as colored square.
- **Warning state**: Orange triangle + text for blocked actions ("Casting spells is blocked")
- **Properties row**: Icon + text pairs in a horizontal row (range, save, concentration)

### Item/Weapon Tooltip (Mourning Frost — Image 10)

```
┌─────────────────────────────────────────────────┐
│  Mourning Frost                    [icon]       │
│  Very Rare (in purple/rarity color)             │
│                                                 │
│  7~17 Damage                                    │
│  Versatile                                      │
│    1d8 (1d6)+5 ⟋ Bludgeoning                   │
│    +1d4 ❄ Cold (in blue)                       │
│                                                 │
│  Heart of Ice: When dealing Cold damage...      │
│  Insidious Cold: Dealing Cold damage...         │
│                                                 │
│  ✨ Weapon Enchantment +1                       │
│  ❄ Ray of Frost (Evocation Cantrip)            │
│  Main Hand Only                                 │
│  ⚔ Topple (Weapon Actions)                     │
│                                                 │
│ ┌─── flavor text (italic) ────────────────────┐│
│ │ The air around this staff crackles...        ││
│ └─────────────────────────────────────────────┘│
│ ✕ Quarterstaff  ⚡ Versatile  | 1.8 | 770     │
└─────────────────────────────────────────────────┘
```

**Critical patterns:**
- **Rarity in rarity color** as subtitle
- **Damage range** (7~17) shown as summary, then dice breakdown below
- **Bonus damage** on indented line in its type color
- **Special abilities** as bold name + description, with keywords colored
- **Granted spells/actions** shown as sub-entries with their own icons
- **Flavor text** visually separated (italic, bordered section)
- **Footer**: weapon type + properties + weight + gold value

### Character Sheet (Images 5, 18, 19)

**Stat Row**: Six stats horizontal, highlighted primary stat (CHA 19 for Warlock in gold circle).

**Conditions**: Listed as icon + name rows. Each active condition/buff has its own line with a distinct icon:
```
🔮 Loviatar's Love
🛡 Githzerai Mind Barrier
💛 Temporary Hit Points
⚔ Blade Ward
✨ Bless
⚔ Great Weapon Master: Bonus Attack
```

**Equipment + Combat Summary** (Image 18, bottom):
```
Melee        AC        Ranged
[weapon]    [shield]   [weapon]
+14          19         +22
Attack Bonus            Attack Bonus
8-18                    8-18
Damage                  Damage
```

**Takeaway:** The AC-in-shield, attack summary with bonus + damage range, and condition list patterns are all things we've adopted. What we're missing is the **condition list** with distinct icons per condition — our StatusStack shows tiny icons but doesn't list names.

---

## 3. D&D Digital Tools (D&D Beyond + Roll20)

### Spell Information Architecture (Roll20)

Roll20 presents spells as structured key-value documents:

```
FIRE BOLT
Cantrip Evocation
───────────────────────
Casting Time: 1 action
Range: 120 feet
Target: A creature or object within range
Components: V S
Duration: Instantaneous
Classes: Artificer, Sorcerer, Wizard

[Description paragraph]

At Higher Levels: [scaling info]
```

**Gold divider lines** above and below content sections. Clean, reference-style. This is the authoritative format — our SRD data matches this structure exactly.

### D&D Beyond Spell List

Table format with sortable columns:
```
Level | Name | School | Components | Casting Time | Duration | Range | Attack/Save | Damage
```

Plus a robust filter panel:
- Filter by class, level, school, concentration, ritual, components
- Damage type filter (all 13 types)
- Attack type vs. save type filter

**Takeaway:** For a spell management screen (not combat, but character sheet or draft), this sortable table with filters is the model. Our SpellListItem works for short lists, but if we ever need to browse 40+ spells, we need filtering.

### D&D Beyond Action Economy

The 5e turn structure as documented:

```
YOUR TURN:
├── Move (up to your speed, can split before/after action)
├── Action (ONE of:)
│   ├── Attack
│   ├── Cast a Spell (with 1 action casting time)
│   ├── Dash (double movement)
│   ├── Disengage (no opportunity attacks)
│   ├── Dodge (disadvantage on attacks against you)
│   ├── Help (grant advantage to ally)
│   ├── Hide (Stealth check)
│   ├── Ready (prepare reaction trigger)
│   └── Search (Perception/Investigation check)
├── Bonus Action (if available from class/spell)
├── Free Interaction (draw weapon, open door)
└── Reaction (Shield spell, opportunity attack — on OTHER turns)
```

**For our v1 simplified version:**
```
YOUR TURN:
├── Move (shift 1 zone)
├── Action (ONE of:)
│   ├── Attack (weapon)
│   ├── Cast (spell with Action casting time)
│   ├── Defend (Dodge equivalent)
│   └── Use Item (consume potion/scroll)
├── Bonus Action (if class feature provides)
│   ├── Second Wind (Fighter)
│   ├── Cunning Action (Rogue — Dash/Disengage/Hide)
│   ├── Rage (Barbarian)
│   └── Healing Word (Cleric — bonus action spell)
└── End Turn
```

This maps cleanly to our action bar: each option is one button. Movement is free (can move before or after action). Bonus action buttons only appear for classes that have them.

### Damage Types — The Full System

From Roll20 combat rules, all 13 types with mechanical meaning:
- **Resistance**: Take half damage of that type
- **Immunity**: Take zero damage of that type
- **Vulnerability**: Take double damage of that type

These are tracked per-monster in our SRD data. The skeleton example: vulnerable to bludgeoning, immune to poison. A cleric's mace (bludgeoning) deals double, while a poisoned blade deals zero.

**Takeaway:** We already handle this mechanically. What we need is better VISUAL communication — when the player attacks a skeleton with a sword (slashing), the log should show the damage type icon and the "no modifier" result. When they use a mace, it should prominently show "VULNERABLE — 2× damage" with the bludgeoning icon.

---

## 4. How This Maps to Our Current State

### What We Have vs. What We Need

| Feature | Current State | Target State | Reference |
|---------|--------------|-------------|-----------|
| **Spell display** | SpellListItem with school icon, damage, range, accordion description | Add slot cost pips, disabled states, keyword highlighting in descriptions | BG3 tooltips, Roll20 structure |
| **Action menu** | JRPG nested text menu (Attack → target list) | Flat icon buttons like DD, or hybrid: compact icon bar + detail on select | DD skill bar, FF command menu |
| **Zone tokens** | Compact horizontal rows, tiny icons (16px) | Larger tokens (32-48px icons), prominent HP bars, enemy intent | DD character figures, StS enemy display |
| **Initiative** | Horizontal strip with xs icons | Larger icons (20-24px), clearer active turn indicator | BG3 portrait strip |
| **Resource tracking** | Spell slots on party token only | Full resource HUD: Action/Bonus/Movement/Slots as shape pips | BG3 Image 22, StS energy |
| **Equipment** | EquipmentCard with icon + stats | Comparison deltas for loot, rarity borders | FF XVI side-by-side |
| **Consumables** | Not tracked | Icon + name + count, disabled at 0 | FF IX simplicity |
| **Conditions** | StatusStack as tiny icons only | Expandable condition list with names + icons in inspect | BG3 condition list |
| **Damage feedback** | Log text only | Log text + floating damage number on token + type icon | BG3 combat log |
| **Disabled actions** | Not implemented | Visible but grayed, reason text, cursor: not-allowed | FF/Pokemon/BG3 |
| **Keyword highlighting** | Game log entity names only | Spell/feature descriptions highlight damage types, conditions, spell names | BG3 tooltips |
| **Enemy intent** | Not implemented | Icon above enemy token showing planned action + damage estimate | StS intent system |
| **End Turn** | In menu list | Separate, prominent button | StS/BG3 |

### Action Bar Decision

Two valid approaches from our references:

**Option A — DD-Style Icon Bar:**
All available actions as large icon tiles in a single row. Click action → click target. No sub-menus. Works when action count is small (4-8 actions).

Pros: Fastest interaction (2 clicks). Most visual. Scales well for martial classes (3-4 options).
Cons: Gets crowded for casters with 8+ spells. Needs scrolling or pagination.

**Option B — FF-Style Command Menu with Enhancement:**
Compact command list (Attack, Cast, Item, Move, End Turn) with a detail panel that shows options for the selected command. Hybrid of text menu + visual detail.

Pros: Handles many spells gracefully. Familiar JRPG pattern. Detail panel can show spell info.
Cons: Extra click depth. Less visual than DD.

**Recommendation for v1:** Start with **Option A for martial classes** (Fighter gets: Attack, Second Wind, Defend, Move — 4 tiles) and **Option B for casters** (Wizard gets: Attack, then Cast opens a spell list panel). The action bar adapts based on who's active. This is actually what BG3 does — the action bar shows common actions as tiles, and spells get their own scrollable section.

---

## Turn Flow — Our V1 Implementation

Based on D&D Beyond's rules + our simplifications:

```
1. TURN STARTS
   └── Resolve start-of-turn effects (burning damage, regeneration)
   └── Show combat resource tracker: ● Action  ▲ Bonus  ↗ Move

2. PLAYER CHOOSES (in any order):
   ├── MOVE (free, once per turn)
   │   └── Select adjacent zone → character shifts → ↗ becomes used
   │
   ├── ACTION (one per turn, unless Action Surge):
   │   ├── Attack → select target in range → roll → resolve → ● becomes used
   │   ├── Cast Spell → select spell → select target → roll/save → resolve
   │   ├── Use Item → select consumable → select target → resolve
   │   └── Defend → gain dodge bonus until next turn
   │
   └── BONUS ACTION (one per turn, if class provides):
       ├── Second Wind (Fighter) → heal 1d10+level
       ├── Cunning Action (Rogue) → Dash/Disengage/Hide
       ├── Rage (Barbarian) → enter rage state
       └── Healing Word (Cleric) → heal ally at range

3. END TURN
   └── Resolve end-of-turn effects (concentration checks, etc.)
   └── Advance to next in initiative

4. ENEMY TURN (auto-resolved):
   └── Show intent indicator → brief pause → resolve action → log result
   └── Advance to next in initiative
```

---

## Appendix: Feature/Spell Availability Rules

For the action menu disabled states:

### Spells
```
AVAILABLE when:
  - Cantrip: Always (no slot cost)
  - Leveled: Remaining slots ≥ 1 for that spell's level
  - AND: At least one valid target within reach
  - AND: No concentration conflict (or willing to break current)
  - AND: Action/Bonus Action not yet spent (matching the spell's cast time)

DISABLED reasons (in priority):
  1. "Action spent" — already used your action this turn
  2. "No spell slots" — all slots of required level expended
  3. "No targets in range" — no valid targets within spell's reach
  4. "Concentrating on [spell]" — would need to break current concentration
```

### Features
```
AVAILABLE when:
  - Uses remaining > 0 (for limited-use features)
  - Required action type not spent (Action, Bonus Action, Reaction)

DISABLED reasons:
  1. "Action spent" / "Bonus action spent"
  2. "Expended — recharges on rest"
  3. "Already raging" (can't rage twice)
```

### Items
```
AVAILABLE when:
  - Count > 0 in inventory
  - Action not spent (items cost an Action, unless Thief Fast Hands)

DISABLED reasons:
  1. "Action spent"
  2. "None remaining"
```

### Movement
```
AVAILABLE when:
  - Has not moved this turn
  - Adjacent zone exists (not at edge)
  - Not grappled/restrained

DISABLED reasons:
  1. "Already moved"
  2. "No valid zone" (at zone 1 or 3 edge)
  3. "Restrained" / "Grappled"
```
