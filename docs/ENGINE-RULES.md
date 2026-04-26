# Engine Rules — V1

Settled design decisions for the game engine. Reference during implementation.

---

## Resource Economy

### Rest Rooms
- Restore HP (% of max, per V1-SPEC)
- Restore **one** spell slot (not all) — prevents caster dominance over long runs
- Class resources (Rage, Second Wind, Action Surge) refresh **every encounter** — these are balanced around 5e's "per short rest" and each room is a short rest boundary

### Spell Slot Scarcity
Casters must manage slots across multiple rooms between rest rooms. Cantrips are the fallback. This is intentional — it makes rest rooms valuable and loot scrolls/potions meaningful.

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
- **Reaction** — Shield spell only (Wizard). Auto-prompt when Wizard is hit and has a spell slot available. No other reactions in v1 (no opportunity attacks).

### What's Skipped
- Opportunity attacks
- Ready action
- Full reaction system beyond Shield
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

### No Flanking
Flanking is a house rule, not core 5e. Sneak Attack's ally-in-zone condition covers the same tactical ground without needing positional tracking within a zone.

---

## Concentration

**Tracked.** One concentration spell per caster at a time.

- When a concentrating caster takes damage: CON save, DC = max(10, damage / 2)
- On failure: spell ends, `concentrating` status effect removed
- Casting a new concentration spell automatically drops the previous one
- UI: `concentrating` status effect shows a subtle aura glow on the placard

This is load-bearing for balance. Without it, casters stack Bless + Spirit Guardians + Hold Person simultaneously and break the game.

---

## Death & Ally Looting

### Death
- 0 HP = dead. No death saves. Keeps stakes brutal and code simple.
- Dead characters are removed from the initiative order.
- Healing cannot revive dead characters (no Revivify/Raise Dead in v1).

### Looting Dead Allies
Two paths:

1. **Mid-combat (costs an action):** If a living character is in the same zone as a dead ally, they can spend their Action to take one piece of equipment from the corpse (weapon, armor, or consumable).

2. **Post-combat (free):** After a room clears, before pressing on to the next room, a screen shows dead allies' equipment. Players can freely reassign any gear to surviving characters.

**Once you leave the post-combat screen, dead allies' remaining gear is lost permanently.**

---

## Fighter Extra Attack (Level 5+)

When a Fighter reaches level 5, the Attack action allows two attacks per turn.
- Player selects "Attack" → picks first target → resolves → picks second target → resolves
- Can target the same enemy twice or split across two enemies
- Same pattern applies to monsters with Multiattack (already in the data as separate actions)

---

## Game State Persistence

Save to **localStorage** after each room completes:
- Party state (HP, equipment, spells, level, XP)
- Floor number, room count
- Run stats accumulator
- Score history (top 10)

On page load: check for saved state → offer to resume or start fresh.
Mid-room state is NOT saved — if you close during combat, you restart that room.

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

## Ability Checks in Non-Combat Rooms

Non-combat rooms use ability checks to create decisions, not just passive outcomes.

### Trap Rooms
Player chooses one character to act:
- **DEX check** — dodge the trap (success: no damage, failure: full damage)
- **INT check** — disarm the trap (success: no damage + small loot, failure: damage + trap triggers on party)
- **WIS check** — spot it early (success: avoid entirely, failure: walk into it, disadvantage on the DEX dodge)

DC scales with floor tier. The character's ability modifier + proficiency (if applicable) matters.

### Treasure Rooms
Chest may be trapped:
- **Investigation (INT) check** to detect the trap
- If detected: choose to disarm (Thieves' Tools / DEX check) or trigger it knowingly
- If not detected: trap triggers on open (saving throw to halve damage)
- Loot quality is the same either way — the trap is a tax, not a gate

### Rest Rooms
Choice:
- **Rest** — heal % of max HP + restore one spell slot (safe, guaranteed)
- **Search** — ability check (WIS/INT) for bonus loot (success: heal + loot, failure: heal only, no loot)

This makes stat spreads matter outside combat. A party with a high-INT Wizard and a high-WIS Cleric handles non-combat rooms differently than four melee bruisers.

---

## Critical Failures (Nat 1)

**Tracked.** A natural 1 on an attack roll is an automatic miss with a fumble consequence.

### Fumble effects (weighted random from a flavor pool)
- **Stumble** — lose remaining movement this turn
- **Wide swing** — weapon clatters, next attack at disadvantage
- **Overextend** — one enemy in your zone gets a free basic attack against you
- **Pulled muscle** — 1d4 self-damage (non-typed, can't be resisted)

Fumble messages are drawn from a flavor text pool — randomized descriptions that make each fumble feel different even when the mechanical effect repeats. The flavor pool is a future session's work (batch out 20-30 per fumble type).

### What nat 1 does NOT do
- Does not break weapons
- Does not hit allies (too punishing, not fun)
- Does not stack with other penalties

### Nat 1 on saving throws
Auto-fail the save. No additional fumble — the spell/effect landing is punishment enough.

### Nat 1 on ability checks
Auto-fail. Flavor text only, no mechanical penalty beyond the failure itself.
