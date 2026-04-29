# Icon Pick List

> Browse your icon sources, pick one SVG per slot, drop it in the matching folder with the exact filename listed. Check off as you go.

## Sources

- **PixArts Store** — `~/Desktop/projects/RPG/RPG UI/AI Icons/` (3,179 pixel art icons, 11 themed sets)
- **Video Game UI** — `~/Desktop/projects/RPG/RPG UI/Video Game UI Icons/` (714 detailed silhouettes)

## Destination

All icons go in `frontend/src/assets/{category}/{filename}.svg`

---

## `class/` — Character Classes (6) ✅ DONE

Already populated from PixArts v1.

- [x] `fighter.svg`
- [x] `rogue.svg`
- [x] `wizard.svg`
- [x] `cleric.svg`
- [x] `ranger.svg`
- [x] `barbarian.svg`

---

## `monster/` — Enemy Type Silhouettes (12)

One icon per monster type. Shown on enemy chips in combat zones. Should read as a creature category at small sizes.

**Best sets to browse:** v1-general (mixed creatures), v3-dark-magic (undead/fiend vibes), v5-divine (celestial/angelic), v6-elemental (elemental creatures)

- [ ] `aberration.svg` — tentacles, alien, eldritch (beholders, mind flayers)
- [ ] `beast.svg` — generic animal (wolves, bears, boars, giant spiders)
- [ ] `celestial.svg` — angelic, winged, radiant (angels, couatl)
- [ ] `construct.svg` — mechanical, golem, built (golems, animated armor)
- [ ] `dragon.svg` — winged reptile, classic dragon silhouette
- [ ] `elemental.svg` — swirling energy, flame/water/stone form
- [ ] `fey.svg` — whimsical, nature spirit, fairy-like (sprites, dryads)
- [ ] `fiend.svg` — demonic, horns, hellish (demons, devils)
- [ ] `giant.svg` — large humanoid, towering figure
- [ ] `humanoid.svg` — generic person/warrior (goblins, orcs, bandits)
- [ ] `monstrosity.svg` — chimera, hybrid beast, unnatural (owlbear, manticore)
- [ ] `undead.svg` — skull, skeleton, ghostly (zombies, skeletons, wraiths)

---

## `status/` — Status Effect Indicators (8)

Shown as small icons stacking on character placards. These are the animation showcase icons — they'll get CSS/Motion.js/Three.js effects layered on top, so the base icon should be simple and readable at 16-24px.

**Best sets to browse:** v6-elemental (fire/ice effects), v3-dark-magic (curses/corruption), v5-divine (blessings/holy), v2-combat-action (stun/rage)

- [ ] `poisoned.svg` — dripping venom, toxic droplet, skull + crossbones
- [ ] `burning.svg` — flame, fire, ember
- [ ] `frozen.svg` — snowflake, ice crystal, frost
- [ ] `cursed.svg` — dark mark, evil eye, corrupted symbol
- [ ] `blessed.svg` — radiant light, halo, holy symbol
- [ ] `stunned.svg` — stars/spirals around head, dazed, static
- [ ] `raging.svg` — fury, roar, berserker energy, clenched fist
- [ ] `concentrating.svg` — focus, meditation, aura, third eye

---

## `spell-school/` — Schools of Magic (8)

Shown on spell cards/lists to identify the school. Abstract magical symbols work best. Each school will also get a signature color in the UI.

**Best sets to browse:** v7-magic (270 general magic icons), v3-dark-magic (necromancy), v5-divine (abjuration/divination)

- [ ] `abjuration.svg` — shield, ward, protective barrier (Protection magic)
- [ ] `conjuration.svg` — portal, summoning circle, materializing object (Creating/summoning)
- [ ] `divination.svg` — eye, crystal ball, seeing (Knowledge/foresight)
- [ ] `enchantment.svg` — charm, hypnotic spiral, mind control (Affecting minds)
- [ ] `evocation.svg` — explosion, energy burst, raw power (Damage spells: fireball, lightning bolt)
- [ ] `illusion.svg` — mirror, mask, double image (Deception/trickery)
- [ ] `necromancy.svg` — skull, dark energy, life drain (Death/undead magic)
- [ ] `transmutation.svg` — transformation, gears, morphing shape (Changing matter)

---

## `room/` — Dungeon Room Types (6)

Shown in the dungeon sequence view as room type indicators. Player sees these approaching the next room.

**Best sets to browse:** v2-combat-action, v10-loot, v11-survival, v1-general

- [ ] `combat.svg` — crossed swords, clash, battle
- [ ] `elite-combat.svg` — skull + swords, elite/dangerous variant
- [ ] `boss.svg` — crown, dragon head, or imposing figure
- [ ] `rest.svg` — campfire, safe haven, peaceful
- [ ] `treasure.svg` — open chest, jewels, gold pile
- [ ] `trap.svg` — spike pit, bear trap, danger warning

---

## `item/` — Equipment & Consumables (9)

Shown in equipment slots on character placards and loot selection. Should clearly read as the object they represent.

**Existing (PixArts v1) — keep as-is:**
- [x] `sword.svg`
- [x] `axe.svg`
- [x] `bow.svg`
- [x] `arrow.svg`
- [x] `consumable-potion.svg`
- [x] `consumable-food.svg`

**Need to add (try Video Game UI first, PixArts as backup):**
- [ ] `crossbow.svg` — crossbow weapon (Video Game UI has `crossbow.svg`)
- [ ] `dagger.svg` — short blade, stabbing weapon (Video Game UI has `bowie-knife.svg`, `stiletto.svg`, `switchblade.svg`)
- [ ] `staff.svg` — wizard/cleric staff, quarterstaff (Video Game UI has `orb-wand.svg`)
- [ ] `mace.svg` — blunt weapon, flanged head (check PixArts v8-weapon-shield)
- [ ] `greataxe.svg` — two-handed large axe (check PixArts v8-weapon-shield, or reuse `axe.svg`)
- [ ] `longsword.svg` — longer blade than dagger (or reuse `sword.svg`)
- [ ] `shield.svg` — defensive shield for equipment slot (Video Game UI has `shield.svg`, `round-shield.svg`)
- [ ] `armor-light.svg` — leather armor representation (Video Game UI has `cloak.svg`)
- [ ] `armor-medium.svg` — scale/chain mail (Video Game UI has `chain-mail.svg`)
- [ ] `armor-heavy.svg` — plate armor, full protection (Video Game UI has `armor-blueprint.svg`)
- [ ] `consumable-scroll.svg` — magic scroll (Video Game UI has `white-book.svg`)

> **Note:** Not every weapon in the SRD needs its own icon. Longsword and shortsword can share `sword.svg`. Greataxe can share `axe.svg`. Only add variants if they look obviously different. A handful of weapon icons covering the visual archetypes (blade, axe, bow, crossbow, dagger, staff, mace) is plenty.

---

## `loot/` — Treasure & Reward Items (5)

Shown during loot drops and treasure room events.

**Best source:** Video Game UI (strong name matches)

- [ ] `chest.svg` — treasure chest (Video Game UI: `open-treasure-chest.svg` or `open-chest.svg`)
- [ ] `gold.svg` — gold bars/coins (Video Game UI: `gold-bar.svg` or `coinflip.svg`)
- [ ] `gem.svg` — precious stone (Video Game UI: `amethyst.svg`, `topaz.svg`, or `diamonds.svg`)
- [ ] `key.svg` — key item (Video Game UI: `key.svg`)
- [ ] `ring.svg` — magic ring (Video Game UI: `big-diamond-ring.svg`)

---

## `ui/` — Game Interface Icons (6)

General HUD and game state indicators.

**Best source:** Video Game UI

- [ ] `health-up.svg` — healing indicator (Video Game UI: `health-increase.svg`)
- [ ] `health-down.svg` — damage indicator (Video Game UI: `health-decrease.svg`)
- [ ] `death.svg` — character death (Video Game UI: `death-skull.svg`)
- [ ] `dice.svg` — dice roll indicator (Video Game UI: `d12.svg` or `inverted-dice-6.svg`)
- [ ] `level-up.svg` — level up indicator (Video Game UI: `level-two.svg` or `achievement.svg`)
- [ ] `tombstone.svg` — game over / TPK (Video Game UI: `tombstone.svg` or `hasty-grave.svg`)

---

## Summary

| Folder | Count | Source Strategy |
|--------|-------|-----------------|
| `class/` | 6 | ✅ Done |
| `monster/` | 12 | Browse PixArts — v1, v3, v5, v6 |
| `status/` | 8 | Browse PixArts — v6, v3, v5, v2 |
| `spell-school/` | 8 | Browse PixArts — v7, v3, v5 |
| `room/` | 6 | Browse PixArts — v2, v10, v11 |
| `item/` | 9-15 | Mix — keep 6 existing, add from Video Game UI + PixArts v8 |
| `loot/` | 5 | Video Game UI — direct filename matches |
| `ui/` | 6 | Video Game UI — direct filename matches |
| **Total** | **~60-66** | |

### What Doesn't Need an Icon (handled by design system)

- Damage types → color-coded text chips
- Ability scores → three-letter badges (STR, DEX, etc.)
- Skills → text labels
- Spell levels → number badges
- Rarity tiers → border colors (gray/green/blue/purple/gold/red)
- Armor weight classes → text labels
- Game actions → styled text buttons
- Individual spell names → spell school icon + text
- Individual monster names → monster type icon + text
