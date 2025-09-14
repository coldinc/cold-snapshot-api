import { readFile } from "node:fs/promises";
import path from "node:path";

const writableCache = new Map<string, Set<string>>();

function toSchemaFileName(entity: string): string {
  const noSpaces = entity.replace(/\s+/g, "");
  return noSpaces.charAt(0).toLowerCase() + noSpaces.slice(1);
}

async function getWritableFields(entity: string): Promise<Set<string>> {
  if (writableCache.has(entity)) {
    return writableCache.get(entity)!;
  }
  try {
    const schemaFile = toSchemaFileName(entity);
    const schemaPath = path.join(process.cwd(), "schemas", `${schemaFile}.schema.json`);
    const content = await readFile(schemaPath, "utf-8");
    const schema = JSON.parse(content);
    const props = schema.properties || {};
    const writable = new Set<string>();
    for (const [key, def] of Object.entries<any>(props)) {
      if (!def.readOnly) writable.add(key);
    }
    writableCache.set(entity, writable);
    return writable;
  } catch (err) {
    console.error(`Failed to load schema for ${entity}:`, err);
    const empty = new Set<string>();
    writableCache.set(entity, empty);
    return empty;
  }
}

export async function scrubPayload(entity: string, payload: Record<string, any>): Promise<Record<string, any>> {
  const writable = await getWritableFields(entity);
  const clean: Record<string, any> = {};
  const stripped: string[] = [];
  for (const [key, value] of Object.entries(payload || {})) {
    if (writable.has(key)) {
      clean[key] = value;
    } else {
      stripped.push(key);
    }
  }
  if (stripped.length > 0) {
    console.log(`[scrubPayload] stripped fields for ${entity.toLowerCase()}:`, stripped);
  }
  return clean;
}
