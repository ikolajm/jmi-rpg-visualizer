/**
 * generate-game-data.mjs
 *
 * Reads SRD complete-data JSONs and generates typed TypeScript
 * lookup files for the frontend. Single source of truth.
 *
 * Run: node scripts/generate-game-data.mjs
 *
 * Outputs:
 *   src/data/spell-meta.ts    — spell school, damage, range, concentration
 *   src/data/feature-meta.ts  — class features with descriptions by level
 *   src/data/monster-pool.ts  — monster templates grouped by CR
 *
 * Loot is NOT generated here — it comes from the curated v1-roster.ts.
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const DATA_DIR = join(import.meta.dirname, '../../server/data/databases/complete-data');
const OUT_DIR = join(import.meta.dirname, '../src/data');

// ─── Spells ──────────────────────────────────────────────────

function generateSpellMeta() {
  const spells = JSON.parse(readFileSync(join(DATA_DIR, 'spells.json'), 'utf-8'));

  const lines = [
    '/**',
    ' * Spell metadata — Auto-generated from SRD spells.json',
    ' * Do not edit manually. Run: node scripts/generate-game-data.mjs',
    ' */',
    '',
    'export interface SpellMeta {',
    '  school: string;',
    '  level: number;',
    '  range: string;',
    '  concentration: boolean;',
    '  damageType?: string;',
    '  damage?: string;',
    '  description?: string;',
    '}',
    '',
    'export const spellMeta: Record<string, SpellMeta> = {',
  ];

  for (const sp of spells) {
    const entry = {
      school: sp.school?.index || 'unknown',
      level: sp.level,
      range: sp.range || 'Self',
      concentration: sp.concentration || false,
    };

    // Damage
    if (sp.damage?.damage_type) {
      entry.damageType = sp.damage.damage_type.index;
      if (sp.damage.damage_at_character_level) {
        entry.damage = sp.damage.damage_at_character_level['1'] || null;
      } else if (sp.damage.damage_at_slot_level) {
        entry.damage = sp.damage.damage_at_slot_level[String(sp.level)] || null;
      }
    }

    // Healing
    if (sp.heal_at_slot_level) {
      entry.damageType = 'healing';
      entry.damage = sp.heal_at_slot_level[String(sp.level)] || null;
    }

    // Description — first paragraph, cleaned
    const rawDesc = Array.isArray(sp.description) ? sp.description[0] : (sp.description || '');
    const desc = rawDesc.replace(/'/g, "\\'").replace(/\n/g, ' ').trim();

    let props = `school: '${entry.school}', level: ${entry.level}, range: '${entry.range}', concentration: ${entry.concentration}`;
    if (entry.damageType) props += `, damageType: '${entry.damageType}'`;
    if (entry.damage) props += `, damage: '${entry.damage}'`;
    if (desc) props += `, description: '${desc}'`;

    lines.push(`  '${sp.index}': { ${props} },`);
  }

  lines.push('};');
  lines.push('');

  const outPath = join(OUT_DIR, 'spell-meta.ts');
  writeFileSync(outPath, lines.join('\n'));
  console.log(`✓ spell-meta.ts — ${spells.length} spells`);
}

// ─── Features ────────────────────────────────────────────────

function generateFeatureMeta() {
  const features = JSON.parse(readFileSync(join(DATA_DIR, 'features.json'), 'utf-8'));
  const levels = JSON.parse(readFileSync(join(DATA_DIR, 'levels.json'), 'utf-8'));

  // Build feature lookup by index
  const featureMap = {};
  for (const f of features) {
    featureMap[f.index] = f;
  }

  // Build per-class, per-level feature list (levels 1-10 only)
  const V1_CLASSES = ['fighter', 'rogue', 'wizard', 'cleric', 'ranger', 'barbarian'];
  const classFeatures = {};

  for (const cls of V1_CLASSES) {
    classFeatures[cls] = {};
    const classLevels = levels
      .filter(l => l.class?.index === cls && l.level <= 10)
      .sort((a, b) => a.level - b.level);

    for (const lvl of classLevels) {
      if (!lvl.features || lvl.features.length === 0) continue;

      const feats = [];
      for (const ref of lvl.features) {
        const feat = featureMap[ref.index];
        if (!feat) continue;

        // Skip parent choice features (e.g., "Fighting Style" parent — keep sub-options)
        // Include everything — the UI can filter
        const desc = Array.isArray(feat.description)
          ? feat.description.join(' ')
          : (feat.description || '');

        feats.push({
          index: feat.index,
          name: feat.name,
          description: desc,
          hasParent: !!feat.parent,
        });
      }

      if (feats.length > 0) {
        classFeatures[cls][lvl.level] = feats;
      }
    }
  }

  const lines = [
    '/**',
    ' * Class feature progression — Auto-generated from SRD features.json + levels.json',
    ' * Do not edit manually. Run: node scripts/generate-game-data.mjs',
    ' */',
    '',
    'export interface FeatureMeta {',
    '  index: string;',
    '  name: string;',
    '  description: string;',
    '  hasParent: boolean;',
    '}',
    '',
    '/** Features by class → level → feature list. Levels 1-10 only. */',
    'export const classFeatures: Record<string, Record<number, FeatureMeta[]>> = {',
  ];

  for (const cls of V1_CLASSES) {
    lines.push(`  '${cls}': {`);
    const lvls = classFeatures[cls];
    for (const [level, feats] of Object.entries(lvls)) {
      lines.push(`    ${level}: [`);
      for (const f of feats) {
        const escapedDesc = f.description.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
        const escapedName = f.name.replace(/'/g, "\\'");
        lines.push(`      { index: '${f.index}', name: '${escapedName}', description: '${escapedDesc}', hasParent: ${f.hasParent} },`);
      }
      lines.push(`    ],`);
    }
    lines.push(`  },`);
  }

  lines.push('};');
  lines.push('');

  const outPath = join(OUT_DIR, 'feature-meta.ts');
  writeFileSync(outPath, lines.join('\n'));

  const totalFeatures = Object.values(classFeatures).reduce(
    (sum, cls) => sum + Object.values(cls).reduce((s, feats) => s + feats.length, 0), 0
  );
  console.log(`✓ feature-meta.ts — ${totalFeatures} features across ${V1_CLASSES.length} classes`);
}

// ─── Monster Pool ───────────────────────────────────────────

function inferReach(desc) {
  if (desc.includes('Melee or Ranged')) return 'any';
  if (desc.includes('Melee Weapon Attack') || desc.includes('Melee Spell Attack')) return 'melee';
  if (desc.includes('Ranged Weapon Attack') || desc.includes('Ranged Spell Attack')) return 'any';
  if (/\bDC\b/.test(desc)) return 'any';
  return 'melee';
}

function classifyMonster(monster) {
  const hasLegendary = (monster.legendary_actions || []).length > 0;
  const hasSpellcasting = (monster.special_abilities || []).some(sa => sa.spellcasting);
  if (!monster.actions || !monster.actions.length) return 'passive';

  let hasMelee = false, hasRanged = false;
  for (const action of monster.actions) {
    if (action.name === 'Multiattack') continue;
    const desc = action.description || '';
    if (desc.includes('Melee Weapon Attack') || desc.includes('Melee Spell Attack')) hasMelee = true;
    if (desc.includes('Ranged Weapon Attack') || desc.includes('Ranged Spell Attack')) hasRanged = true;
    if (desc.includes('Melee or Ranged')) { hasMelee = true; hasRanged = true; }
  }

  if (hasLegendary) return hasSpellcasting ? 'boss-caster' : 'boss';
  if (hasSpellcasting) return 'caster';
  if (hasRanged && !hasMelee) return 'flexible';
  if (hasMelee && hasRanged) return 'flexible';
  return 'melee-aggro';
}

function generateMonsterPool() {
  const monsters = JSON.parse(readFileSync(join(DATA_DIR, 'monsters.json'), 'utf-8'));

  // Use JSON.stringify for all string values to avoid quote escaping issues
  const S = (v) => JSON.stringify(v);

  // Group transformed monsters by CR
  const byCR = {};
  let total = 0;
  let skipped = 0;

  for (const m of monsters) {
    if (m.challenge_rating === 0) { skipped++; continue; }

    const actions = [];
    for (const a of (m.actions || [])) {
      if (a.name === 'Multiattack') continue;
      const desc = (a.description || '').replace(/\n/g, ' ');
      const entry = {
        name: a.name,
        description: desc,
        reach: inferReach(desc),
      };
      if (a.attack_bonus !== undefined) entry.toHit = a.attack_bonus;
      if (a.damage && a.damage.length > 0) {
        if (a.damage[0].damage_dice) entry.damage = a.damage[0].damage_dice;
        if (a.damage[0].damage_type?.index) entry.damageType = a.damage[0].damage_type.index;
      }

      // Parse condition-on-hit from description (e.g., "DC 10 Constitution saving throw or be paralyzed")
      const condMatch = desc.match(/DC (\d+) (\w+) saving throw.*?(poisoned|paralyzed|frightened|petrified|restrained|prone|stunned|blinded|charmed|unconscious|incapacitated|grappled)/i);
      if (condMatch) {
        entry.conditionDC = parseInt(condMatch[1], 10);
        entry.conditionSave = condMatch[2].toLowerCase().slice(0, 3); // str, dex, con, int, wis, cha
        entry.conditionApplied = condMatch[3].toLowerCase();
      }

      // Parse structured DC field (breath weapons, AoE saves)
      if (a.dc && a.dc.dc_value && !entry.toHit) {
        entry.saveDC = a.dc.dc_value;
        entry.saveType = a.dc.dc_type?.index || 'dex';
        entry.saveSuccess = a.dc.dc_success || 'half';
        // Get damage from the damage array if not already set
        if (!entry.damage && a.damage && a.damage.length > 0) {
          if (a.damage[0].damage_dice) entry.damage = a.damage[0].damage_dice;
          if (a.damage[0].damage_type?.index) entry.damageType = a.damage[0].damage_type.index;
        }
      }

      actions.push(entry);
    }

    if (actions.length === 0) { skipped++; continue; }

    const behavior = classifyMonster(m);
    const cr = m.challenge_rating;

    if (!byCR[cr]) byCR[cr] = [];
    byCR[cr].push({
      monsterIndex: m.index,
      name: m.name,
      type: m.type,
      cr,
      xp: m.xp || 0,
      hp: m.hit_points,
      ac: Array.isArray(m.armor_class) ? m.armor_class[0].value : m.armor_class,
      stats: {
        str: m.strength, dex: m.dexterity, con: m.constitution,
        int: m.intelligence, wis: m.wisdom, cha: m.charisma,
      },
      damageResistances: m.damage_resistances || [],
      damageImmunities: m.damage_immunities || [],
      damageVulnerabilities: m.damage_vulnerabilities || [],
      conditionImmunities: (m.condition_immunities || []).map(ci => typeof ci === 'string' ? ci : ci.index),
      actions,
      specialAbilities: (m.special_abilities || []).map(sa => ({
        name: sa.name,
        description: (sa.description || '').replace(/\n/g, ' '),
      })),
      behavior,
    });
    total++;
  }

  const lines = [
    '/**',
    ' * Monster Pool — Auto-generated from SRD monsters.json',
    ' * Do not edit manually. Run: node scripts/generate-game-data.mjs',
    ' */',
    '',
    "export type MonsterBehavior = 'melee-aggro' | 'flexible' | 'caster' | 'boss' | 'boss-caster' | 'passive';",
    '',
    'export interface MonsterTemplate {',
    '  monsterIndex: string;',
    '  name: string;',
    '  type: string;',
    '  cr: number;',
    '  xp: number;',
    '  hp: number;',
    '  ac: number;',
    '  stats: { str: number; dex: number; con: number; int: number; wis: number; cha: number };',
    '  damageResistances: string[];',
    '  damageImmunities: string[];',
    '  damageVulnerabilities: string[];',
    '  conditionImmunities: string[];',
    '  actions: { name: string; description: string; toHit?: number; damage?: string; damageType?: string; reach: string; conditionDC?: number; conditionSave?: string; conditionApplied?: string; saveDC?: number; saveType?: string; saveSuccess?: string }[];',
    '  specialAbilities: { name: string; description: string }[];',
    '  behavior: MonsterBehavior;',
    '}',
    '',
    'export const monstersByCR: Record<number, MonsterTemplate[]> = {',
  ];

  for (const cr of Object.keys(byCR).sort((a, b) => Number(a) - Number(b))) {
    lines.push(`  ${cr}: [`);
    for (const t of byCR[cr]) {
      const actionsStr = t.actions.map(a => {
        let s = `{ name: ${S(a.name)}, description: ${S(a.description)}, reach: ${S(a.reach)}`;
        if (a.toHit !== undefined) s += `, toHit: ${a.toHit}`;
        if (a.damage) s += `, damage: ${S(a.damage)}`;
        if (a.damageType) s += `, damageType: ${S(a.damageType)}`;
        if (a.conditionDC) s += `, conditionDC: ${a.conditionDC}, conditionSave: ${S(a.conditionSave)}, conditionApplied: ${S(a.conditionApplied)}`;
        if (a.saveDC) s += `, saveDC: ${a.saveDC}, saveType: ${S(a.saveType)}, saveSuccess: ${S(a.saveSuccess)}`;
        s += ' }';
        return s;
      }).join(', ');

      const saStr = t.specialAbilities.map(sa =>
        `{ name: ${S(sa.name)}, description: ${S(sa.description)} }`
      ).join(', ');

      lines.push(`    {`);
      lines.push(`      monsterIndex: ${S(t.monsterIndex)}, name: ${S(t.name)}, type: ${S(t.type)},`);
      lines.push(`      cr: ${t.cr}, xp: ${t.xp}, hp: ${t.hp}, ac: ${t.ac},`);
      lines.push(`      stats: { str: ${t.stats.str}, dex: ${t.stats.dex}, con: ${t.stats.con}, int: ${t.stats.int}, wis: ${t.stats.wis}, cha: ${t.stats.cha} },`);
      lines.push(`      damageResistances: [${t.damageResistances.map(r => S(r)).join(', ')}],`);
      lines.push(`      damageImmunities: [${t.damageImmunities.map(r => S(r)).join(', ')}],`);
      lines.push(`      damageVulnerabilities: [${t.damageVulnerabilities.map(r => S(r)).join(', ')}],`);
      lines.push(`      conditionImmunities: [${t.conditionImmunities.map(r => S(r)).join(', ')}],`);
      lines.push(`      actions: [${actionsStr}],`);
      lines.push(`      specialAbilities: [${saStr}],`);
      lines.push(`      behavior: ${S(t.behavior)},`);
      lines.push(`    },`);
    }
    lines.push(`  ],`);
  }

  lines.push('};');
  lines.push('');

  const outPath = join(OUT_DIR, 'monster-pool.ts');
  writeFileSync(outPath, lines.join('\n'));
  console.log(`✓ monster-pool.ts — ${total} monsters across ${Object.keys(byCR).length} CR tiers (${skipped} skipped)`);
}

// ─── Run ─────────────────────────────────────────────────────

generateSpellMeta();
generateFeatureMeta();
generateMonsterPool();
