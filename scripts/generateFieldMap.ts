require('dotenv').config();

import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

const TABLES = ["Contacts", "Logs", "Cold Snapshots", "Threads"];

function toCamelCase(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9]+/g, ' ') // replace non-alphanumeric with space
    .trim()
    .split(/\s+/)
    .map((word, index) => {
      const lower = word.toLowerCase();
      if (index === 0) return lower;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join('');
}

async function fetchFieldMap(table: string, token: string, baseId: string): Promise<Record<string, string> | null> {
  const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(table)}?maxRecords=10`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch table ${table}: ${res.status} ${res.statusText}`);
  }
  const data = (await res.json()) as any;
  const records = Array.isArray(data.records) ? data.records : [];
  if (records.length === 0) {
    console.warn(`Warning: No records found for table ${table}`);
    return null;
  }

  const fieldNames = new Set<string>();
  for (const rec of records) {
    if (rec && rec.fields) {
      for (const name of Object.keys(rec.fields)) {
        fieldNames.add(name);
      }
    }
  }

  const mapping: Record<string, string> = {};
  for (const fieldName of fieldNames) {
    const key = toCamelCase(fieldName);
    mapping[key] = fieldName;
  }
  return mapping;
}

async function main() {
  const token = process.env.AIRTABLE_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID;
  if (!token || !baseId) {
    throw new Error('Missing AIRTABLE_TOKEN or AIRTABLE_BASE_ID environment variables');
  }
  const allMaps: Record<string, Record<string, string>> = {};
  for (const table of TABLES) {
    const map = await fetchFieldMap(table, token, baseId);
    if (map) {
      allMaps[table] = map;
    }
  }

  const lines: string[] = [];
  lines.push('// This file is auto-generated. Run yarn generate:fieldmap to refresh.');
  lines.push('');
  lines.push('function getFieldMap(tableName: string): { [key: string]: string } {');
  lines.push('  switch (tableName) {');

  for (const [table, mapping] of Object.entries(allMaps)) {
    lines.push(`    case ${JSON.stringify(table)}:`);
    lines.push('      return {');
    for (const [key, field] of Object.entries(mapping)) {
      lines.push(`        ${key}: ${JSON.stringify(field)},`);
    }
    lines.push('      };');
  }

  lines.push('    default:');
  lines.push('      return {};');
  lines.push('  }');
  lines.push('}');
  lines.push('');
  lines.push('module.exports = { getFieldMap };');

  const outputPath = path.join(__dirname, '../lib/resolveFieldMap.ts');
  fs.writeFileSync(outputPath, lines.join('\n'));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
