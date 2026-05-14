# Engine Rules — V1

The mechanics the v1 engine actually implements. Reference for how combat, rest, death, and rolls behave as built.

---

## Resource Economy

### Rest Rooms
Rest rooms offer a three-way choice (`useRest.ts`):
- **Full Rest** — heal 50% of max HP, restore all spell slots, reset feature uses
- **Quick Rest** — heal 25% of max HP, restore one spell slot, reset feature uses
- **Train** — +3 to each character's primary stat until the next rest; no healing

### Spell Slot Scarcity
Casters must manage slots across multiple rooms between rest rooms. Cantrips are the fallback. This is intentional — it makes the Full/Quick rest tradeoff matter and loot scrolls/potions meaningful.

---

## Action Economy

### Per Turn
- **Action** — Attack, Cast Spell, Use Item, Defend, Dash (shift two zones), Loot Ally
- **Move** — shift one zone (free, optional)
- **Bonus Action** — class-specific only:
  - Barbarian: Rage (activate)
  - Cleric: Healing Word
  - Rogue: Cunning Action (Disengage, Dash, Hide)
  - Ranger: Hunter's Mark (when unlocked at level 2)
- **Reaction** — none. There is no reaction system in v1. The Shield spell is cast on the Wizard's turn as a buff action (+5 AC for one turn), not as a reaction.

### What's Skipped
- Opportunity attacks
- Ready action
- Reactions entirely (Shield is a normal buff action, not a reaction)
- Object interaction as a separate category

---

## Advantage / Disadvantage

### Sources of Advantage
- Rogue Sneak Attack condition: advantage on attack OR an ally in the same zone as the target
- Barbarian Reckless Attack: advantage on all melee attacks this turn (grants enemies advantage against you until next turn)
- Guiding Bolt: next attack against the target has advantage
- Greater Invisibility: advantage on attacks while invisible
- Faerie Fire / similar: advantage on attacks against affected creatures
- Status: Blessed → advantage on saves (from Bless spell)

### Sources of Disadvantage
- Status: Poisoned → disadvantage on attacks
- Status: Cursed → disadvantage on attacks/ability checks
- Barbarian Reckless Attack (against you): enemies have advantage = effectively your disadvantage
- Long range attacks (adjacent zone attacking far zone — optional, discuss during playtesting)

### Zone Synergies
Positioning rewards make zone placement tactically meaningful (`zone-synergies.ts`):
- **Flanking** — when 2+ alive allies share the target's zone, melee attacks get +2 to hit
- **Cleric Aura** — an alive cleric grants +1 on saves to allies in their zone (the cleric doesn't benefit from their own aura)
- **Ranger Overwatch** — when a ranger is alone in their zone (no enemies present), their ranged attacks and spells get +2 damage

---

## Concentration

**Tracked.** One concentration spell per caster at a time.

- When a concentrating caster takes damage: CON save, DC = max(10, damage / 2)
- On failure: the maintained spell ends
- Casting a new concentration spell automatically drops the previous one
- Tracked on the spell's own `ActiveEffect` (`turnsRemaining: -1`, keyed to `sourceId`); when concentration breaks, all effects from that source are removed via `removeBySource`. There is no separate `concentrating` badge — the maintained effect (e.g. Blessed on the target) is what's shown.

This is load-bearing for balance. Without it, casters stack Bless + Spirit Guardians + Hold Person simultaneously and break the game.

---

## Death

- 0 HP = dead. No death saves. Keeps stakes brutal and code simple.
- Dead characters are removed from the initiative order.
- Healing cannot revive dead characters (no Revivify/Raise Dead in v1).
- Ally looting (taking a dead character's gear) was designed but not built for v1 — a dead character's equipment is simply gone.

---

## Fighter Extra Attack (Level 5+)

When a Fighter reaches level 5, the Attack action allows two attacks per turn.
- Player selects "Attack" → picks first target → resolves → picks second target → resolves
- Can target the same enemy twice or split across two enemies
- Same pattern applies to monsters with Multiattack (already in the data as separate actions)

---

## Game State Persistence

There is no run save/resume in v1 — a run is one sitting, and closing the tab ends it. The only persisted state is the theme preference (`localStorage`) and the draft selection handed from the draft page to the game page (`sessionStorage`, cleared on read).

---

## Derived Values Reference

| Value | Formula |
|-------|---------|
| AC | armor base + DEX mod (+ shield +2) (+ Fighting Style Defense +1) |
| Attack bonus | proficiency + ability mod (STR for melee, DEX for ranged/finesse) |
| Damage | weapon die + ability mod |
| Spell save DC | 8 + proficiency + casting ability mod |
| Spell attack bonus | proficiency + casting ability mod |
| Initiative | d20 + DEX mod |
| HP on level up | hit die + CON mod (min 1) |
| Proficiency bonus | +2 (levels 1-4), +3 (levels 5-8), +4 (levels 9-10) |
| Barbarian Unarmored AC | 10 + DEX mod + CON mod |
| Rogue Sneak Attack | (ceil(level / 2))d6 extra damage |
| Barbarian Rage damage | +2 (levels 1-8), +3 (levels 9+) |

---

## Damage Types, Resistances & Immunities

**Tracked.** The SRD data already has this on every monster and every damage source.

### Monster fields (already in data)
- `damage_vulnerabilities: string[]` — takes double damage from these types
- `damage_resistances: string[]` — takes half damage from these types
- `damage_immunities: string[]` — takes zero damage from these types

### Resolution
1. Calculate base damage normally
2. Check damage type against target's immunities → 0 damage
3. Check damage type against target's resistances → halve damage (round down)
4. Check damage type against target's vulnerabilities → double damage

Resistance and vulnerability don't stack. If somehow both apply, they cancel out (standard 5e rule).

### Damage types in play
Weapons: slashing, piercing, bludgeoning (from `equipment.damage.damage_type`)
Spells: fire, cold, lightning, acid, poison, radiant, necrotic, force, thunder, psychic (from `spell.damage.damage_type`)
Monster attacks: per action data (`action.damage[].damage_type`)

### Why this matters
- Party composition: you want a mix of damage types, not four slashing weapons
- Loot decisions: "frost sword vs. fire sword" depends on what you've been fighting
- Tactical reads: learn monster type patterns over repeated runs (undead resist necrotic, fiends resist fire, etc.)
- Roguelike knowledge loop: experienced players recognize enemy types and adapt

---

## Cantrip Scaling

**Tracked.** Cantrip damage scales with character level, not class level. The SRD data already has `damage.damage_at_character_level` on damage cantrips.

| Character Level | Cantrip Dice |
|----------------|-------------|
| 1-4 | Base (e.g., Fire Bolt 1d10) |
| 5-10 | 2× base (e.g., Fire Bolt 2d10) |

The engine reads `damage_at_character_level` and selects the correct die for the character's current level. Without this, casters become irrelevant when spell slots run dry. With it, cantrips are always a meaningful baseline — weaker than slotted spells, but never useless.

---

## Non-Combat Rooms

Trap rooms were cut from v1. The two non-combat room types are:

- **Treasure rooms** — grant a guaranteed loot pick (1 of 3). No trap, no check.
- **Rest rooms** — the Full / Quick / Train choice (see Resource Economy above).

The "ability checks create non-combat decisions" design from earlier planning was not built — non-combat rooms are a loot pick or a rest choice.

---

## Critical Failures (Nat 1)

A natural 1 on an attack roll is an automatic miss, regardless of modifiers, with a flavor log line ("swings wildly … fumble!"). It applies to both player and enemy attacks.

The weighted mechanical fumble effects originally designed (lose movement, disadvantage on the next attack, a free enemy attack, self-damage) were not built for v1 — a nat 1 is a plain auto-miss with flavor text.
