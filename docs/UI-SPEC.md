# Party Wipe — UI Component Spec

> Derived from visual reference analysis: BG3, FF IX/X/XV/XVI, CrossCode, Kingdom Hearts II/III, Sekiro, Bloodborne, Fire Emblem, God of War, MGS Snake Eater. Reference images in `visual-ref.md`.

---

## Core Problem

Everything is too small. Icons at 12-16px, HP bars at 12px height, stat text at 10px. AAA games use substantially larger UI elements — the smallest icons in any reference are 24-32px, with selected/focused items at 64-128px. We need to be bolder.

### Icon Size Guidelines

| Context | Current | Target | Rationale |
|---------|---------|--------|-----------|
| Zone token class/monster icon | sm (16px) | lg (24px) | Must read at a glance across the zone layout |
| Spell school icon in spell list | md (20px) | lg (24px) | Needs to differentiate schools visually |
| Damage type inline icon | 10px (size-2.5) | sm (16px) | Currently invisible at combat speed |
| Action menu spell/item icon | — (none) | lg-xl (24-32px) | FF/Pokemon show large icons in selection |
| Inspect sheet header icon | xl (32px) | 48-64px custom | BG3 spell icons are large and glowing |
| Initiative bar token | xs (12px) | md-lg (20-24px) | BG3 uses ~40px portraits in initiative |
| Status effect on token | xs (12px) | sm (16px) | Must be readable stacked horizontally |

---

## Spell Lists — Action Menu & Draft

### States

Every spell in a selection list has a visual state. This is how Pokemon handles PP and FF handles MP — the option is always visible but communicates availability.

| State | Visual | When |
|-------|--------|------|
| **Available** | Full color, interactive | Has slots (or cantrip), targets in range, no conflicts |
| **No Slots** | Dimmed (opacity-40), non-interactive | Leveled spell, all slots of that level expended |
| **Out of Range** | Visible but muted, "Out of range" tag | No valid target within the spell's reach from caster's zone |
| **Concentration Conflict** | Visible but muted, "Already concentrating" tag | Caster already has an active concentration spell |
| **At Will** | Always available, distinct indicator | Cantrips — unlimited use, no slot cost |

### Spell Row Layout (Action Menu)

Larger than the draft sheet version. Each row in the combat spell menu:

```
┌─────────────────────────────────────────────────────────┐
│ [school icon 24px]  Fire Bolt                           │
│                     ⚡ 1d10 fire  ↗ Any Zone             │
│                                            [At Will]    │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ [school icon 24px]  Magic Missile        [Slot: I ◆◆◇] │
│                     ⚡ 3×(1d4+1) force  ↗ Any Zone      │
│                                                         │
└─────────────────────────────────────────────────────────┘

┌─── DISABLED ────────────────────────────────────────────┐
│ [school icon 24px]  Shield               [Slot: I ◆◆◇] │
│  (dimmed)           +5 AC · Reaction                    │
│                     ⚠ Cannot use — not your reaction    │
└─────────────────────────────────────────────────────────┘
```

### Slot Cost Display

Instead of a badge, show remaining slots as pips inline:
- `Slot: I ◆◆◇` — 2 of 3 Level I slots remaining
- `Slot: II ◆◇` — 1 of 2 Level II slots remaining
- Pips deplete left-to-right as slots are used
- When all depleted: `Slot: I ◇◇◇` — row becomes disabled

### Cantrip Indicator

Cantrips don't consume slots. Instead of "Cantrip" badge:
- Show `At Will` in a distinct style (primary color, italic or different weight)
- Or a small ∞ symbol
- Cantrip rows never dim or disable (always available as long as the character is conscious)

---

## Move Lists / Features — Action Menu

### Resource-Limited Actions

Class features with limited uses need tracking in the action menu:

```
┌─────────────────────────────────────────────────────────┐
│ ⚡ Second Wind                             [Uses: 1/1] │
│   Heal 1d10 + level HP                    Bonus Action  │
└─────────────────────────────────────────────────────────┘

┌─── DISABLED ────────────────────────────────────────────┐
│ ⚡ Action Surge                            [Uses: 0/1] │
│   Take one additional action                    Action  │
│   ⚠ Expended — recharges on rest                       │
└─────────────────────────────────────────────────────────┘
```

### Action Type Indicators

BG3 uses distinct **shapes** per action type, not just colors. Adopt this:

| Action Type | Shape | Color | Display |
|-------------|-------|-------|---------|
| Action | Filled circle ● | Gold #e8c263 | `● Action` |
| Bonus Action | Filled triangle ▲ | Orange #e8723a | `▲ Bonus Action` |
| Reaction | Lightning bolt ⚡ | Blue #5b9bd5 | `⚡ Reaction` |
| Free | Open circle ○ | Green #5bad5a | `○ Free` |

These appear:
1. On spell/feature rows in the action menu
2. On the combat resource HUD (tracking what's been used this turn)
3. In spell tooltips/detail views

### Combat Resource HUD

During a character's turn, display remaining resources prominently (BG3 Image 22 pattern):

```
● Action    ▲ Bonus Action    ↗ Movement (1 zone)    ◆◆ Spell Slots
```

When used, the icon dims/empties:
```
○ Action    △ Bonus Action    ↗ Moved    ◇◇ Spell Slots
```

This sits in or near the action bar — constant visibility during the active turn.

---

## Inventory / Equipment

### Item Card Layout

When viewing equipment (in inspect sheet, loot selection, or equipment tab):

```
┌─────────────────────────────────────────────────────────┐
│ [item icon 32px]    Longsword                           │
│                     Martial Weapon · Versatile           │
│                                                         │
│  ⚔ +4 to hit   🗡 1d8+2 slashing   ↗ Melee            │
│                                                         │
│  ── Properties ──                                       │
│  Versatile: 1d10 damage when used two-handed            │
│                                                         │
│  [Main Hand]                              [Common]      │
└─────────────────────────────────────────────────────────┘
```

### Loot Comparison (FF XVI Pattern)

When choosing loot, show current vs. new side-by-side with delta indicators:

```
┌── Current ────────────┐  ┌── New ─────────────────────┐
│ [sword] Longsword     │  │ [axe] Battleaxe            │
│ 1d8+2 slashing        │  │ 1d8+3 slashing             │
│                       │  │                             │
│ Attack: +4            │  │ Attack: +5  ▲+1 (green)    │
│ Damage: 3-10          │  │ Damage: 4-11 ▲+1 (green)  │
│ Range: Melee          │  │ Range: Melee                │
└───────────────────────┘  └─────────────────────────────┘
```

Green ▲ for improvements, Red ▼ for downgrades. Player instantly sees whether the new item is better.

### Consumable Display

From Sekiro (Image 30) — items with limited uses show:
- Icon (large, 32px+)
- Name
- Uses: `3/3` or `1/5` — shown as a fraction, not pips (consumables can stack higher than spell slots)
- Brief effect description

In the action menu during combat, show consumables with remaining count:

```
┌─────────────────────────────────────────────────────────┐
│ [potion icon 24px]  Health Potion              [x2]     │
│                     Heal 2d4+2 HP              Action   │
└─────────────────────────────────────────────────────────┘

┌─── DISABLED ────────────────────────────────────────────┐
│ [scroll icon 24px]  Scroll of Fireball         [x0]    │
│                     8d6 fire · Any Zone         Action  │
│                     ⚠ None remaining                    │
└─────────────────────────────────────────────────────────┘
```

### Rarity Visual Treatment

From God of War (Image 33) — rarity conveyed through:
1. **Border color** on the item card/row (left border or full border)
2. **Rarity label** in rarity color ("Common", "Uncommon", "Rare", etc.)

Apply our `rarityColors` from game-colors.ts:
- Common: gray border, "Common" in gray
- Uncommon: green border, "Uncommon" in green
- Rare: blue border, "Rare" in blue
- Very Rare: purple border, "Very Rare" in purple
- Legendary: gold border, "Legendary" in gold

---

## Zone Tokens — Combat Field

### Current Problem

Tokens are compressed rows with tiny icons. They read like a spreadsheet, not a battlefield. Need more visual weight and spatial presence.

### Target Token Layout

Each token in the zone should feel like a game piece, not a list item:

```
┌─────────────────────────┐
│     [class icon 32px]   │
│       Fighter           │
│  ████████████░░ 10/12   │  ← HP bar, md size
│    [⛊ 18]  [🔥][❄]    │  ← AC + status effects
└─────────────────────────┘
```

- **Card-style**, not row-style — more vertical, less horizontal
- **Icon dominant** — 32px class/monster icon as the visual anchor
- **Name below icon** — Cinzel for characters, body font for enemies
- **HP bar prominent** — md size (20px height), not sm (12px)
- **AC shield** next to status effect icons below HP
- **Active turn** — golden border glow + slight scale-up, not just a ring
- **Ally vs Enemy** — allies have primary/gold accent, enemies have error/red accent, with distinct background tints
- **Dead** — full desaturation + reduced opacity + maybe a skull overlay or crossed-out effect

### Initiative Bar Tokens

Larger than current. BG3 uses ~40px circular portraits:
- Class/monster icon at md-lg (20-24px)
- Background tinted ally/enemy color
- Active turn = full primary border + glow
- Dead = grayed out, crossed out

---

## Keyword Highlighting in Descriptions

From BG3 — spell and feature descriptions highlight game-relevant terms:

| Term Type | Color | Examples |
|-----------|-------|---------|
| Damage types | Damage type color | "1d8 **Cold** damage" in blue |
| Conditions | Status effect color | "target is **Poisoned**" in green |
| Spell names | Primary color | "cast **Eyebite** without" in gold |
| Numeric values | Slightly brighter | "**1d10**" "**+5 AC**" in white/bright |
| Save types | Neutral emphasis | "**WIS Save**" bold |

Implementation: a `highlightKeywords()` function that parses description text and wraps known terms in colored spans. Similar to our existing `colorizeLog()` function for the game log but extended with damage type colors, condition colors, and spell name matching.

---

## Disabled/Unavailable Actions

### Rules for Availability

| Action | Available When | Unavailable Reason |
|--------|---------------|-------------------|
| **Attack (weapon)** | Target in range, Action not used | No targets in range, Action spent |
| **Cast (leveled spell)** | Slots remaining, target in range, no conc. conflict | No slots, out of range, already concentrating |
| **Cast (cantrip)** | Always (if Action available) | Action spent |
| **Use Item** | Item in inventory, count > 0 | Out of items |
| **Move** | Movement not used, adjacent zone exists | Already moved, at edge zone |
| **Defend** | Action not used | Action spent |
| **Second Wind** | Uses remaining, Bonus Action available | Expended this rest |
| **Rage** | Uses remaining, Bonus Action available | Expended all rages |

### Visual Treatment

From Pokemon/FF — unavailable options are **visible but disabled**:
- Opacity reduced to 40%
- No hover effect
- Cursor: not-allowed
- Brief reason shown below the action name: "⚠ Out of range" or "⚠ No spell slots" or "⚠ Expended"
- The player always sees what they COULD do if circumstances were different — this teaches the game's mechanics

### Action Used Indicators

After a character uses their Action, the "Attack" and "Cast" options should show as completed:
- Icon changes from filled to outline
- Text shows "Action spent" instead of being removed
- Same for Bonus Action, Movement

---

## Tooltip / Hover Card Hierarchy

When hovering any game entity (spell, item, feature, enemy), the detail card follows a consistent structure:

### Spell Tooltip
1. **Icon** (top-right, 48px, school-colored glow) + **Name** (title size)
2. **Type line**: "Level 2 Illusion Spell" in school color
3. **Damage line** (if applicable): damage icon + dice + type in damage color
4. **Description** paragraph with keyword highlighting
5. **Duration** (icon + text): "10 rounds" / "Instantaneous" / "Until rest"
6. **Properties row**: Range icon + range | Save type | Concentration icon
7. **Recovery**: "Long Rest" / "Short Rest" (if applicable)
8. **Footer bar** (darker bg): Action type shape + Spell slot cost

### Item Tooltip
1. **Icon** (top-right, 48px) + **Name** (title size)
2. **Rarity** in rarity color
3. **Damage/AC line**: weapon stats or armor AC
4. **Properties**: weapon properties, weight class
5. **Special abilities** (if magical): bold name + description
6. **Slot**: Main Hand / Off Hand / Body
7. **Footer bar**: Item type + properties

### Feature Tooltip
1. **Name** + action type shape
2. **Brief mechanical description**
3. **Uses**: "1/rest" or "At Will" or "Passive"
4. **Source**: "Fighter Level 2" or "Champion Archetype"

### Enemy Tooltip (on hover in zone)
1. **Monster type icon** + **Name** + **CR**
2. **HP bar** (prominent)
3. **AC** in shield
4. **Stat row** (compact)
5. **Resistances/Immunities/Vulnerabilities**
6. **Conditions** (active status effects)

---

## Darkest Dungeon + Slay the Spire Findings

### Tokens as Spatial Figures (DD Pattern)

Tokens should not be list rows in a container. They should be **vertical cards with visual weight** arranged spatially within the zone. Each token is a "game piece":

```
┌──────────┐
│  [icon]  │  ← class/monster icon, 48px, color-tinted
│  48px    │
│          │
│  Name    │  ← Cinzel for characters, body for enemies
│ ████████ │  ← HP bar, md height (20px), prominent
│ AC⛊18   │  ← AC shield + status icons
└──────────┘
```

- **Ally tokens**: primary/gold border tint, surface-2 background
- **Enemy tokens**: error/red border tint, darker background
- **Active turn**: golden glow border + subtle scale (1.05), pulsing animation
- **Dead**: full grayscale filter + 30% opacity + crossed-out or skull icon overlay
- **Enemy intent** (StS pattern): above enemy token, show intended action icon + damage number. "⚔ 5" means "will deal 5 damage." Calculated from AI behavior before the enemy acts.

### Action Bar as Icon Buttons (DD Pattern)

Replace the JRPG nested text menu with a **flat icon bar** of available actions:

```
┌────────────────────────────────────────────────────────────────┬────────────┐
│ [⚔ 48px] [✨ 48px] [🛡 48px] [💊 48px] [↗ 48px]            │ [END TURN] │
│  Attack   Fire Bolt  Shield    Potion    Move                  │            │
│  ● Action  At Will   ⚡ React  ● Action  ○ Free               │            │
└────────────────────────────────────────────────────────────────┴────────────┘
```

- Each ability is a **large icon button** (~48px icon in a card)
- Action type indicator below (●▲⚡○ shapes with colors)
- Disabled actions: grayed, tooltip shows reason
- Spell slot cost shown as pips below spell icons: `◆◆◇`
- **End Turn** is visually distinct — separated, larger, different color (ghost variant)
- After selecting an attack/spell, click a valid target in the zone view
- The bar shows ALL available actions flat — no sub-menus to drill into

### Combat Resource Tracker

Persistent during active turn, sits above or within the action bar:

```
● Action    ▲ Bonus Action    ↗ Movement    ◆◆ Lv I Slots
```

After using action:
```
○ Action    ▲ Bonus Action    ↗ Movement    ◆◇ Lv I Slots
```

Shapes match the action type indicators on the abilities. Player instantly knows what resources remain.

### Enemy Intent (StS Pattern)

Above each enemy token during the player's turn, show what the enemy plans to do:

```
    ⚔ 5        ← sword icon + damage number (attack intent)
  ┌──────┐
  │Goblin│
  │██████│
  └──────┘
```

Intent types:
- `⚔ 5` — attack, will deal ~5 damage
- `🛡` — defending/dodging
- `✨` — casting a spell (show spell icon if known)
- `↗` — moving to a different zone
- `❓` — unknown (boss abilities, first encounter)

This gives the player tactical information: "The goblin is going to attack for 5, but the skeleton is going to move closer — I should focus the goblin first."

---

## Summary of Changes Needed

### Session A — UI Overhaul (Combat)
- [ ] Redesign zone tokens as vertical cards (48px icons, md HP bars, spatial layout)
- [ ] Rebuild action bar as DD-style flat icon buttons (not nested text menus)
- [ ] Add enemy intent indicators above enemy tokens (StS pattern)
- [ ] Add combat resource tracker (action/bonus/movement/slots as shape pips)
- [ ] Add disabled states with reason text on unavailable actions
- [ ] Separate End Turn as visually distinct button
- [ ] Scale up icons globally (see size guidelines table)

### Session B — Spell & Item Polish
- [ ] Implement keyword highlighting in spell/feature descriptions
- [ ] Add slot cost pips to spell items in action bar
- [ ] Show cantrips as "At Will" (always available)
- [ ] Track and display feature uses (Second Wind 1/1, Rage 2/2)
- [ ] Track consumable quantities with count display
- [ ] Build action type shape indicators (● ▲ ⚡ ○)

### Session C — Game Engine Depth
- [ ] Spell casting action (slot consumption, save DC, effects)
- [ ] Bonus action system (class features that use bonus)
- [ ] Action/bonus/movement tracking per turn in game state
- [ ] Status effect application, duration, turn-start/end resolution
- [ ] Room generation (procedural type selection + encounter scaling)

### Session D — Loot & Progression
- [ ] Loot comparison view (current vs. new, green/red deltas — FF XVI pattern)
- [ ] Rarity border colors on equipment items
- [ ] Rest phase (heal or search)
- [ ] Level-up phase (stat increases, new features/spells)
- [ ] XP from kills, level threshold

### Session E — Boss Fights & Polish
- [ ] Boss room encounters (every 5th floor)
- [ ] Boss intent patterns (telegraphed attacks)
- [ ] Status effect animations on placards (the design showcase)
- [ ] Active turn glow animation (pulse on token border)
- [ ] Death visual treatment (grayscale + skull)
- [ ] Turn transition animations
- [ ] Room entrance flavor text typewriter effect
