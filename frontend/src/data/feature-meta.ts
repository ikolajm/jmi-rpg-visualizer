/**
 * Class feature progression — Auto-generated from SRD features.json + levels.json
 * Do not edit manually. Run: node scripts/generate-game-data.mjs
 */

export interface FeatureMeta {
  index: string;
  name: string;
  description: string;
  hasParent: boolean;
}

/** Features by class → level → feature list. Levels 1-10 only. */
export const classFeatures: Record<string, Record<number, FeatureMeta[]>> = {
  'fighter': {
    1: [
      { index: 'fighter-fighting-style', name: 'Fighting Style', description: 'You adopt a particular style of fighting as your specialty. Choose one of the following options. You can\'t take a Fighting Style option more than once, even if you later get to choose again.', hasParent: false },
      { index: 'second-wind', name: 'Second Wind', description: 'You have a limited well of stamina that you can draw on to protect yourself from harm. On your turn, you can use a bonus action to regain hit points equal to 1d10 + your fighter level. Once you use this feature, you must finish a short or long rest before you can use it again.', hasParent: false },
    ],
    2: [
      { index: 'action-surge-1-use', name: 'Action Surge (1 use)', description: 'Starting at 2nd level, you can push yourself beyond your normal limits for a moment. On your turn, you can take one additional action on top of your regular action and a possible bonus action. Once you use this feature, you must finish a short or long rest before you can use it again. Starting at 17th level, you can use it twice before a rest, but only once on the same turn.', hasParent: false },
    ],
    3: [
      { index: 'improved-critical', name: 'Improved Critical', description: 'Beginning when you choose this archetype at 3rd level, your weapon attacks score a critical hit on a roll of 19 or 20.', hasParent: false },
    ],
    4: [
      { index: 'fighter-ability-score-improvement-1', name: 'Ability Score Improvement', description: 'When you reach 4th level, and again at 6th, 8th, 12th, 14th, 16th, and 19th level, you can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1. As normal, you can\'t increase an ability score above 20 using this feature.', hasParent: false },
    ],
    5: [
      { index: 'extra-attack-1', name: 'Extra Attack', description: 'Beginning at 5th level, you can attack twice, instead of once, whenever you take the Attack action on your turn. The number of attacks increases to three when you reach 11th level in this class and to four when you reach 20th level in this class.', hasParent: false },
    ],
    6: [
      { index: 'fighter-ability-score-improvement-2', name: 'Ability Score Improvement', description: 'When you reach 4th level, and again at 6th, 8th, 12th, 14th, 16th, and 19th level, you can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1. As normal, you can\'t increase an ability score above 20 using this feature.', hasParent: false },
    ],
    7: [
      { index: 'remarkable-athlete', name: 'Remarkable Athlete', description: 'Starting at 7th level, you can add half your proficiency bonus (round up) to any Strength, Dexterity, or Constitution check you make that doesn\'t already use your proficiency bonus. In addition, when you make a running long jump, the distance you can cover increases by a number of feet equal to your Strength modifier.', hasParent: false },
    ],
    8: [
      { index: 'fighter-ability-score-improvement-3', name: 'Ability Score Improvement', description: 'When you reach 4th level, and again at 6th, 8th, 12th, 14th, 16th, and 19th level, you can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1. As normal, you can\'t increase an ability score above 20 using this feature.', hasParent: false },
    ],
    9: [
      { index: 'indomitable-1-use', name: 'Indomitable (1 use)', description: 'Beginning at 9th level, you can reroll a saving throw that you fail. If you do so, you must use the new roll, and you can\'t use this feature again until you finish a long rest. You can use this feature twice between long rests starting at 13th level and three times between long rests starting at 17th level.', hasParent: false },
    ],
    10: [
      { index: 'additional-fighting-style', name: 'Additional Fighting Style', description: 'At 10th level, you can choose a second option from the Fighting Style class feature.', hasParent: false },
    ],
  },
  'rogue': {
    1: [
      { index: 'rogue-expertise-1', name: 'Expertise', description: 'At 1st level, choose two of your skill proficiencies, or one of your skill proficiencies and your proficiency with thieves\' tools. Your proficiency bonus is doubled for any ability check you make that uses either of the chosen proficiencies. At 6th level, you can choose two more of your proficiencies (in skills or with thieves\' tools) to gain this benefit', hasParent: false },
      { index: 'sneak-attack', name: 'Sneak Attack', description: 'Beginning at 1st level, you know how to strike subtly and exploit a foe\'s distraction. Once per turn, you can deal an extra 1d6 damage to one creature you hit with an attack if you have advantage on the attack roll. The attack must use a finesse or a ranged weapon. You don\'t need advantage on the attack roll if another enemy of the target is within 5 feet of it, that enemy isn\'t incapacitated, and you don\'t have disadvantage on the attack roll. The amount of the extra damage increases as you gain levels in this class, as shown in the Sneak Attack column of the Rogue table.', hasParent: false },
      { index: 'thieves-cant', name: 'Thieves\' Cant', description: 'During your rogue training you learned thieves\' cant, a secret mix of dialect, jargon, and code that allows you to hide messages in seemingly normal conversation. Only another creature that knows thieves\' cant understands such messages. It takes four times longer to convey such a message than it does to speak the same idea plainly. In addition, you understand a set of secret signs and symbols used to convey short, simple messages, such as whether an area is dangerous or the territory of a thieves\' guild, whether loot is nearby, or whether the people in an area are easy marks or will provide a safe house for thieves on the run.', hasParent: false },
    ],
    2: [
      { index: 'cunning-action', name: 'Cunning Action', description: 'Starting at 2nd level, your quick thinking and agility allow you to move and act quickly. You can take a bonus action on each of your turns in combat. This action can be used only to take the Dash, Disengage, or Hide action.', hasParent: false },
    ],
    3: [
      { index: 'fast-hands', name: 'Fast Hands', description: 'Starting at 3rd level, you can use the bonus action granted by your Cunning Action to make a Dexterity (Sleight of Hand) check, use your thieves\' tools to disarm a trap or open a lock, or take the Use an Object action.', hasParent: false },
      { index: 'second-story-work', name: 'Second-Story Work', description: 'When you choose this archetype at 3rd level, you gain the ability to climb faster than normal; climbing no longer costs you extra movement. In addition, when you make a running jump, the distance you cover increases by a number of feet equal to your Dexterity modifier.', hasParent: false },
    ],
    4: [
      { index: 'rogue-ability-score-improvement-1', name: 'Ability Score Improvement', description: 'When you reach 4th level, and again at 8th, 10th, 12th, 16th, and 19th level, you can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1. As normal, you can\'t increase an ability score above 20 using this feature.', hasParent: false },
    ],
    5: [
      { index: 'uncanny-dodge', name: 'Uncanny Dodge', description: 'Starting at 5th level, when an attacker that you can see hits you with an attack, you can use your reaction to halve the attack\'s damage against you.', hasParent: false },
    ],
    6: [
      { index: 'rogue-expertise-2', name: 'Expertise', description: 'At 1st level, choose two of your skill proficiencies, or one of your skill proficiencies and your proficiency with thieves\' tools. Your proficiency bonus is doubled for any ability check you make that uses either of the chosen proficiencies. At 6th level, you can choose two more of your proficiencies (in skills or with thieves\' tools) to gain this benefit', hasParent: false },
    ],
    7: [
      { index: 'rogue-evasion', name: 'Evasion', description: 'Beginning at 7th level, you can nimbly dodge out of the way of certain area effects, such as a red dragon\'s fiery breath or an ice storm spell. When you are subjected to an effect that allows you to make a Dexterity saving throw to take only half damage, you instead take no damage if you succeed on the saving throw, and only half damage if you fail.', hasParent: false },
    ],
    8: [
      { index: 'rogue-ability-score-improvement-2', name: 'Ability Score Improvement', description: 'When you reach 4th level, and again at 8th, 10th, 12th, 16th, and 19th level, you can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1. As normal, you can\'t increase an ability score above 20 using this feature.', hasParent: false },
    ],
    9: [
      { index: 'supreme-sneak', name: 'Supreme Sneak', description: 'Starting at 9th level, you have advantage on a Dexterity (Stealth) check if you move no more than half your speed on the same turn.', hasParent: false },
    ],
    10: [
      { index: 'rogue-ability-score-improvement-3', name: 'Ability Score Improvement', description: 'When you reach 4th level, and again at 8th, 10th, 12th, 16th, and 19th level, you can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1. As normal, you can\'t increase an ability score above 20 using this feature.', hasParent: false },
    ],
  },
  'wizard': {
    1: [
      { index: 'spellcasting-wizard', name: 'Spellcasting: Wizard', description: 'As a student of arcane magic, you have a spellbook containing spells that show the first glimmerings of your true power.', hasParent: false },
      { index: 'arcane-recovery', name: 'Arcane Recovery', description: 'You have learned to regain some of your magical energy by studying your spellbook. Once per day when you finish a short rest, you can choose expended spell slots to recover. The spell slots can have a combined level that is equal to or less than half your wizard level (rounded up), and none of the slots can be 6th level or higher. For example, if you\'re a 4th-level wizard, you can recover up to two levels worth of spell slots. You can recover either a 2nd-level spell slot or two 1st-level spell slots.', hasParent: false },
    ],
    2: [
      { index: 'evocation-savant', name: 'Evocation Savant', description: 'Beginning when you select this school at 2nd level, the gold and time you must spend to copy an evocation spell into your spellbook is halved.', hasParent: false },
      { index: 'sculpt-spells', name: 'Sculpt Spells', description: 'Beginning at 2nd level, you can create pockets of relative safety within the effects of your evocation spells. When you cast an evocation spell that affects other creatures that you can see, you can choose a number of them equal to 1 + the spell\'s level. The chosen creatures automatically succeed on their saving throws against the spell, and they take no damage if they would normally take half damage on a successful save.', hasParent: false },
    ],
    4: [
      { index: 'wizard-ability-score-improvement-1', name: 'Ability Score Improvement', description: 'When you reach 4th level, and again at 8th, 12th, 16th, and 19th level, you can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1. As normal, you can\'t increase an ability score above 20 using this feature.', hasParent: false },
    ],
    6: [
      { index: 'potent-cantrip', name: 'Potent Cantrip', description: 'Starting at 6th level, your damaging cantrips affect even creatures that avoid the brunt of the effect. When a creature succeeds on a saving throw against your cantrip, the creature takes half the cantrip\'s damage (if any) but suffers no additional effect from the cantrip.', hasParent: false },
    ],
    8: [
      { index: 'wizard-ability-score-improvement-2', name: 'Ability Score Improvement', description: 'When you reach 4th level, and again at 8th, 12th, 16th, and 19th level, you can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1. As normal, you can\'t increase an ability score above 20 using this feature.', hasParent: false },
    ],
    10: [
      { index: 'empowered-evocation', name: 'Empowered Evocation', description: 'Beginning at 10th level, you can add your Intelligence modifier to one damage roll of any wizard evocation spell you cast.', hasParent: false },
    ],
  },
  'cleric': {
    1: [
      { index: 'bonus-proficiency', name: 'Bonus Proficiency', description: 'When you choose this domain at 1st level, you gain proficiency with heavy armor.', hasParent: false },
      { index: 'disciple-of-life', name: 'Disciple of Life', description: 'Also starting at 1st level, your healing spells are more effective. Whenever you use a spell of 1st level or higher to restore hit points to a creature, the creature regains additional hit points equal to 2 + the spell\'s level.', hasParent: false },
    ],
    2: [
      { index: 'channel-divinity-preserve-life', name: 'Channel Divinity: Preserve Life', description: 'Starting at 2nd level, you can use your Channel Divinity to heal the badly injured. As an action, you present your holy symbol and evoke healing energy that can restore a number of hit points equal to five times your cleric level. Choose any creatures within 30 feet of you, and divide those hit points among them. This feature can restore a creature to no more than half of its hit point maximum. You can\'t use this feature on an undead or a construct.', hasParent: false },
    ],
    3: [
      { index: 'domain-spells-2', name: 'Domain Spells', description: 'Each domain has a list of spells--its domain spells--that you gain at the cleric levels noted in the domain description. Once you gain a domain spell, you always have it prepared, and it doesn\'t count against the number of spells you can prepare each day. If you have a domain spell that doesn\'t appear on the cleric spell list, the spell is nonetheless a cleric spell for you.', hasParent: false },
    ],
    4: [
      { index: 'cleric-ability-score-improvement-1', name: 'Ability Score Improvement', description: 'When you reach 4th level, and again at 8th, 12th, 16th, and 19th level, you can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1. As normal, you can\'t increase an ability score above 20 using this feature.', hasParent: false },
    ],
    5: [
      { index: 'domain-spells-3', name: 'Domain Spells', description: 'Each domain has a list of spells--its domain spells--that you gain at the cleric levels noted in the domain description. Once you gain a domain spell, you always have it prepared, and it doesn\'t count against the number of spells you can prepare each day. If you have a domain spell that doesn\'t appear on the cleric spell list, the spell is nonetheless a cleric spell for you.', hasParent: false },
      { index: 'destroy-undead-cr-1-2-or-below', name: 'Destroy Undead (CR 1/2 or below)', description: 'Starting at 5th level, when an undead fails its saving throw against your Turn Undead feature, the creature is instantly destroyed if its challenge rating is at or below a certain threshold.', hasParent: false },
    ],
    6: [
      { index: 'blessed-healer', name: 'Blessed Healer', description: 'Beginning at 6th level, the healing spells you cast on others heal you as well. When you cast a spell of 1st level or higher that restores hit points to a creature other than you, you regain hit points equal to 2 + the spell\'s level.', hasParent: false },
    ],
    7: [
      { index: 'domain-spells-4', name: 'Domain Spells', description: 'Each domain has a list of spells--its domain spells--that you gain at the cleric levels noted in the domain description. Once you gain a domain spell, you always have it prepared, and it doesn\'t count against the number of spells you can prepare each day. If you have a domain spell that doesn\'t appear on the cleric spell list, the spell is nonetheless a cleric spell for you.', hasParent: false },
    ],
    8: [
      { index: 'divine-strike', name: 'Divine Strike', description: 'At 8th level, you gain the ability to infuse your weapon strikes with divine energy. Once on each of your turns when you hit a creature with a weapon attack, you can cause the attack to deal an extra 1d8 radiant damage to the target. When you reach 14th level, the extra damage increases to 2d8.', hasParent: false },
    ],
    9: [
      { index: 'domain-spells-5', name: 'Domain Spells', description: 'Each domain has a list of spells--its domain spells--that you gain at the cleric levels noted in the domain description. Once you gain a domain spell, you always have it prepared, and it doesn\'t count against the number of spells you can prepare each day. If you have a domain spell that doesn\'t appear on the cleric spell list, the spell is nonetheless a cleric spell for you.', hasParent: false },
    ],
    10: [
      { index: 'divine-intervention', name: 'Divine Intervention', description: 'Beginning at 10th level, you can call on your deity to intervene on your behalf when your need is great. Imploring your deity\'s aid requires you to use your action. Describe the assistance you seek, and roll percentile dice. If you roll a number equal to or lower than your cleric level, your deity intervenes. The GM chooses the nature of the intervention; the effect of any cleric spell or cleric domain spell would be appropriate. If your deity intervenes, you can\'t use this feature again for 7 days. Otherwise, you can use it again after you finish a long rest. At 20th level, your call for intervention succeeds automatically, no roll required.', hasParent: false },
    ],
  },
  'ranger': {
    1: [
      { index: 'favored-enemy-1-type', name: 'Favored Enemy (1 type)', description: 'Beginning at 1st level, you have significant experience studying, tracking, hunting, and even talking to a certain type of enemy. Choose a type of favored enemy: aberrations, beasts, celestials, constructs, dragons, elementals, fey, fiends, giants, monstrosities, oozes, plants, or undead. Alternatively, you can select two races of humanoid (such as gnolls and orcs) as favored enemies. You have advantage on Wisdom (Survival) checks to track your favored enemies, as well as on Intelligence checks to recall information about them. When you gain this feature, you also learn one language of your choice that is spoken by your favored enemies, if they speak one at all. You choose one additional favored enemy, as well as an associated language, at 6th and 14th level. As you gain levels, your choices should reflect the types of monsters you have encountered on your adventures.', hasParent: false },
      { index: 'natural-explorer-1-terrain-type', name: 'Natural Explorer (1 terrain type)', description: 'You are particularly familiar with one type of natural environment and are adept at traveling and surviving in such regions. Choose one type of favored terrain: arctic, coast, desert, forest, grassland, mountain, or swamp. When you make an Intelligence or Wisdom check related to your favored terrain, your proficiency bonus is doubled if you are using a skill that you\'re proficient in. While traveling for an hour or more in your favored terrain, you gain the following benefits: - Difficult terrain doesn\'t slow your group\'s travel. - Your group can\'t become lost except by magical means. - Even when you are engaged in another activity while traveling (such as foraging, navigating, or tracking), you remain alert to danger. - If you are traveling alone, you can move stealthily at a normal pace. - When you forage, you find twice as much food as you normally would. - While tracking other creatures, you also learn their exact number, their sizes, and how long ago they passed through the area. You choose additional favored terrain types at 6th and 10th level.', hasParent: false },
    ],
    2: [
      { index: 'ranger-fighting-style', name: 'Fighting Style', description: 'At 2nd level, you adopt a particular style of fighting as your specialty. Choose one of the following options. You can\'t take a Fighting Style option more than once, even if you later get to choose again.', hasParent: false },
      { index: 'spellcasting-ranger', name: 'Spellcasting: Ranger', description: 'By the time you reach 2nd level, you have learned to use the magical essence of nature to cast spells, much as a druid does.', hasParent: false },
    ],
    3: [
      { index: 'hunters-prey', name: 'Hunter\'s Prey', description: 'At 3rd level, you gain one of the following features of your choice. Colossus Slayer Giant Killer Horde Breaker', hasParent: false },
    ],
    4: [
      { index: 'ranger-ability-score-improvement-1', name: 'Ability Score Improvement', description: 'When you reach 4th level, and again at 8th, 12th, 16th, and 19th level, you can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1. As normal, you can\'t increase an ability score above 20 using this feature.', hasParent: false },
    ],
    5: [
      { index: 'ranger-extra-attack', name: 'Extra Attack', description: 'Beginning at 5th level, you can attack twice, instead of once, whenever you take the Attack action on your turn.', hasParent: false },
    ],
    6: [
      { index: 'favored-enemy-2-types', name: 'Favored Enemy (2 types)', description: 'Beginning at 1st level, you have significant experience studying, tracking, hunting, and even talking to a certain type of enemy. Choose a type of favored enemy: aberrations, beasts, celestials, constructs, dragons, elementals, fey, fiends, giants, monstrosities, oozes, plants, or undead. Alternatively, you can select two races of humanoid (such as gnolls and orcs) as favored enemies. You have advantage on Wisdom (Survival) checks to track your favored enemies, as well as on Intelligence checks to recall information about them. When you gain this feature, you also learn one language of your choice that is spoken by your favored enemies, if they speak one at all. You choose one additional favored enemy, as well as an associated language, at 6th and 14th level. As you gain levels, your choices should reflect the types of monsters you have encountered on your adventures.', hasParent: false },
      { index: 'natural-explorer-2-terrain-types', name: 'Natural Explorer (2 terrain types)', description: 'You are particularly familiar with one type of natural environment and are adept at traveling and surviving in such regions. Choose one type of favored terrain: arctic, coast, desert, forest, grassland, mountain, or swamp. When you make an Intelligence or Wisdom check related to your favored terrain, your proficiency bonus is doubled if you are using a skill that you\'re proficient in. While traveling for an hour or more in your favored terrain, you gain the following benefits: - Difficult terrain doesn\'t slow your group\'s travel. - Your group can\'t become lost except by magical means. - Even when you are engaged in another activity while traveling (such as foraging, navigating, or tracking), you remain alert to danger. - If you are traveling alone, you can move stealthily at a normal pace. - When you forage, you find twice as much food as you normally would. - While tracking other creatures, you also learn their exact number, their sizes, and how long ago they passed through the area. You choose additional favored terrain types at 6th and 10th level.', hasParent: false },
    ],
    7: [
      { index: 'defensive-tactics', name: 'Defensive Tactics', description: 'At 7th level, you gain one of the following features of your choice. Escape the Horde Multiattack Defense Steel Will', hasParent: false },
    ],
    8: [
      { index: 'ranger-ability-score-improvement-2', name: 'Ability Score Improvement', description: 'When you reach 4th level, and again at 8th, 12th, 16th, and 19th level, you can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1. As normal, you can\'t increase an ability score above 20 using this feature.', hasParent: false },
      { index: 'ranger-lands-stride', name: 'Land\'s Stride', description: 'Starting at 8th level, moving through nonmagical difficult terrain costs you no extra movement. You can also pass through nonmagical plants without being slowed by them and without taking damage from them if they have thorns, spines, or a similar hazard. In addition, you have advantage on saving throws against plants that are magically created or manipulated to impede movement, such those created by the entangle spell.', hasParent: false },
    ],
    10: [
      { index: 'natural-explorer-3-terrain-types', name: 'Natural Explorer (3 terrain types)', description: 'You are particularly familiar with one type of natural environment and are adept at traveling and surviving in such regions. Choose one type of favored terrain: arctic, coast, desert, forest, grassland, mountain, or swamp. When you make an Intelligence or Wisdom check related to your favored terrain, your proficiency bonus is doubled if you are using a skill that you\'re proficient in. While traveling for an hour or more in your favored terrain, you gain the following benefits: - Difficult terrain doesn\'t slow your group\'s travel. - Your group can\'t become lost except by magical means. - Even when you are engaged in another activity while traveling (such as foraging, navigating, or tracking), you remain alert to danger. - If you are traveling alone, you can move stealthily at a normal pace. - When you forage, you find twice as much food as you normally would. - While tracking other creatures, you also learn their exact number, their sizes, and how long ago they passed through the area. You choose additional favored terrain types at 6th and 10th level.', hasParent: false },
      { index: 'hide-in-plain-sight', name: 'Hide in Plain Sight', description: 'Starting at 10th level, you can spend 1 minute creating camouflage for yourself. You must have access to fresh mud, dirt, plants, soot, and other naturally occurring materials with which to create your camouflage. Once you are camouflaged in this way, you can try to hide by pressing yourself up against a solid surface, such as a tree or wall, that is at least as tall and wide as you are. You gain a +10 bonus to Dexterity (Stealth) checks as long as you remain there without moving or taking actions. Once you move or take an action or a reaction, you must camouflage yourself again to gain this benefit.', hasParent: false },
    ],
  },
  'barbarian': {
    1: [
      { index: 'rage', name: 'Rage', description: 'In battle, you fight with primal ferocity. On your turn, you can enter a rage as a bonus action. While raging, you gain the following benefits if you aren\'t wearing heavy armor: - You have advantage on Strength checks and Strength saving throws. - When you make a melee weapon Attack using Strength, you gain a +2 bonus to the damage roll. This bonus increases as you level. - You have Resistance to bludgeoning, piercing, and slashing damage. If you are able to cast Spells, you can\'t cast them or concentrate on them while raging. Your rage lasts for 1 minute. It ends early if you are knocked Unconscious or if Your Turn ends and you haven\'t attacked a hostile creature since your last turn or taken damage since then. You can also end your rage on Your Turn as a Bonus Action. Once you have raged the maximum number of times for your barbarian level, you must finish a Long Rest before you can rage again. You may rage 2 times at 1st level, 3 at 3rd, 4 at 6th, 5 at 12th, and 6 at 17th.', hasParent: false },
      { index: 'barbarian-unarmored-defense', name: 'Unarmored Defense', description: 'While you are not wearing any armor, your Armor Class equals 10 + your Dexterity modifier + your Constitution modifier. You can use a shield and still gain this benefit.', hasParent: false },
    ],
    2: [
      { index: 'reckless-attack', name: 'Reckless Attack', description: 'Starting at 2nd level, you can throw aside all concern for defense to attack with fierce desperation. When you make your first attack on your turn, you can decide to attack recklessly. Doing so gives you advantage on melee weapon attack rolls using Strength during this turn, but attack rolls against you have advantage until your next turn.', hasParent: false },
      { index: 'danger-sense', name: 'Danger Sense', description: 'At 2nd level, you gain an uncanny sense of when things nearby aren\'t as they should be, giving you an edge when you dodge away from danger. You have advantage on Dexterity saving throws against effects that you can see, such as traps and spells. To gain this benefit, you can\'t be blinded, deafened, or incapacitated.', hasParent: false },
    ],
    3: [
      { index: 'frenzy', name: 'Frenzy', description: 'Starting when you choose this path at 3rd level, you can go into a frenzy when you rage. If you do so, for the duration of your rage you can make a single melee weapon attack as a bonus action on each of your turns after this one. When your rage ends, you suffer one level of exhaustion (as described in appendix A).', hasParent: false },
    ],
    4: [
      { index: 'barbarian-ability-score-improvement-1', name: 'Ability Score Improvement', description: 'When you reach 4th level, and again at 8th, 12th, 16th, and 19th level, you can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1. As normal, you can\'t increase an ability score above 20 using this feature.', hasParent: false },
    ],
    5: [
      { index: 'barbarian-extra-attack', name: 'Extra Attack', description: 'Beginning at 5th level, you can attack twice, instead of once, whenever you take the Attack action on your turn.', hasParent: false },
      { index: 'fast-movement', name: 'Fast Movement', description: 'Starting at 5th level, your speed increases by 10 feet while you aren\'t wearing heavy armor.', hasParent: false },
    ],
    6: [
      { index: 'mindless-rage', name: 'Mindless Rage', description: 'Beginning at 6th level, you can\'t be charmed or frightened while raging. If you are charmed or frightened when you enter your rage, the effect is suspended for the duration of the rage.', hasParent: false },
    ],
    7: [
      { index: 'feral-instinct', name: 'Feral Instinct', description: 'By 7th level, your instincts are so honed that you have advantage on initiative rolls. Additionally, if you are surprised at the beginning of combat and aren\'t incapacitated, you can act normally on your first turn, but only if you enter your rage before doing anything else on that turn.', hasParent: false },
    ],
    8: [
      { index: 'barbarian-ability-score-improvement-2', name: 'Ability Score Improvement', description: 'When you reach 4th level, and again at 8th, 12th, 16th, and 19th level, you can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1. As normal, you can\'t increase an ability score above 20 using this feature.', hasParent: false },
    ],
    9: [
      { index: 'brutal-critical-1-die', name: 'Brutal Critical (1 die)', description: 'Beginning at 9th level, you can roll one additional weapon damage die when determining the extra damage for a critical hit with a melee attack. This increases to two additional dice at 13th level and three additional dice at 17th level.', hasParent: false },
    ],
    10: [
      { index: 'intimidating-presence', name: 'Intimidating Presence', description: 'Beginning at 10th level, you can use your action to frighten someone with your menacing presence. When you do so, choose one creature that you can see within 30 feet of you. If the creature can see or hear you, it must succeed on a Wisdom saving throw (DC equal to 8 + your proficiency bonus + your Charisma modifier) or be frightened of you until the end of your next turn. On subsequent turns, you can use your action to extend the duration of this effect on the frightened creature until the end of your next turn. This effect ends if the creature ends its turn out of line of sight or more than 60 feet away from you.  If the creature succeeds on its saving throw, you can\'t use this feature on that creature again for 24 hours.', hasParent: false },
    ],
  },
};
