/**
 * generate-icon-registry.mjs
 *
 * Reads all SVGs from src/assets/{category}/ folders,
 * extracts path data + viewBox, and generates a TypeScript
 * icon registry at src/components/atoms/game-icons.ts
 *
 * Run: node scripts/generate-icon-registry.mjs
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, basename } from 'path';

const ASSETS_DIR = join(import.meta.dirname, '../src/assets');
const OUTPUT_FILE = join(import.meta.dirname, '../src/components/atoms/game-icons.ts');

const CATEGORIES = ['class', 'monster', 'status', 'spell-school', 'room', 'item', 'loot', 'ui'];

function extractSvgData(svgContent) {
  // Extract viewBox
  const viewBoxMatch = svgContent.match(/viewBox="([^"]+)"/);
  const viewBox = viewBoxMatch ? viewBoxMatch[1] : '0 0 24 24';

  // Extract all path d attributes
  const paths = [];
  const pathRegex = /<path[^>]*\bd="([^"]+)"[^>]*\/?>/g;
  let match;
  while ((match = pathRegex.exec(svgContent)) !== null) {
    paths.push(match[1]);
  }

  // Also extract rect, circle, polygon if present
  const rectRegex = /<rect([^>]+)\/?>/g;
  while ((match = rectRegex.exec(svgContent)) !== null) {
    const attrs = match[1];
    const x = attrs.match(/\bx="([^"]+)"/)?.[1] || '0';
    const y = attrs.match(/\by="([^"]+)"/)?.[1] || '0';
    const w = attrs.match(/\bwidth="([^"]+)"/)?.[1];
    const h = attrs.match(/\bheight="([^"]+)"/)?.[1];
    const transform = attrs.match(/\btransform="([^"]+)"/)?.[1] || '';
    if (w && h) {
      paths.push(`__rect:${x},${y},${w},${h},${transform}`);
    }
  }

  return { viewBox, paths };
}

function toIconKey(category, filename) {
  const name = basename(filename, '.svg');
  return `${category}/${name}`;
}

// Collect all icons
const registry = {};

for (const category of CATEGORIES) {
  const dir = join(ASSETS_DIR, category);
  try {
    const files = readdirSync(dir).filter(f => f.endsWith('.svg'));
    for (const file of files) {
      const content = readFileSync(join(dir, file), 'utf-8');
      const { viewBox, paths } = extractSvgData(content);
      const key = toIconKey(category, file);
      registry[key] = { viewBox, paths };
    }
  } catch (e) {
    // Directory might not exist, skip
  }
}

// Generate TypeScript
const lines = [
  '/**',
  ' * Game Icon Registry — Auto-generated',
  ' * Do not edit manually. Run: node scripts/generate-icon-registry.mjs',
  ' */',
  '',
  'export interface IconData {',
  '  viewBox: string;',
  '  paths: string[];',
  '}',
  '',
  'export const gameIcons: Record<string, IconData> = {',
];

for (const [key, data] of Object.entries(registry)) {
  lines.push(`  '${key}': {`);
  lines.push(`    viewBox: '${data.viewBox}',`);
  lines.push(`    paths: [`);
  for (const p of data.paths) {
    lines.push(`      '${p.replace(/'/g, "\\'")}',`);
  }
  lines.push(`    ],`);
  lines.push(`  },`);
}

lines.push('};');
lines.push('');
lines.push('export const iconCategories = ' + JSON.stringify(CATEGORIES) + ' as const;');
lines.push('export type IconCategory = typeof iconCategories[number];');
lines.push('');
lines.push('export function getIconKeys(category: IconCategory): string[] {');
lines.push('  return Object.keys(gameIcons).filter(k => k.startsWith(category + "/"));');
lines.push('}');
lines.push('');

writeFileSync(OUTPUT_FILE, lines.join('\n'));

const count = Object.keys(registry).length;
console.log(`✓ Generated ${count} icons across ${CATEGORIES.length} categories → ${OUTPUT_FILE}`);
