import { getTableFieldMap } from "./resolveFieldMap.js";
import { airtableSearch } from "./airtableSearch.js";

/**
 * Resolve linked record display names to record IDs.
 *
 * @param tableName - Table containing the linked record fields.
 * @param data - Data object with display name arrays for linked records.
 * @returns Updated data object with arrays of record IDs.
 */
export async function resolveRecordId(
  tableName: string,
  value: string,
): Promise<string> {
  const { fields } = getTableFieldMap(tableName);
  const primaryField = fields[Object.keys(fields)[0]];
  const recordIdRegex = /^rec[A-Za-z0-9]{14}$/;

  if (recordIdRegex.test(value)) return value;

  const escaped = value.replace(/"/g, '\\"');
  const formula = `LOWER({${primaryField}}) = LOWER("${escaped}")`;
  const records = await airtableSearch(tableName, formula, { maxRecords: 2 });
  if (records.length === 0) {
    throw new Error(`No record in ${tableName} matches "${value}"`);
  }
  if (records.length > 1) {
    throw new Error(`Multiple records in ${tableName} match "${value}"`);
  }
  return records[0].id;
}

export async function resolveLinkedRecordIds(
  tableName: string,
  data: Record<string, any>,
): Promise<Record<string, any>> {
  const { linkedRecordFields } = getTableFieldMap(tableName);
  const result: Record<string, any> = { ...data };

  for (const [fieldKey, cfg] of Object.entries(linkedRecordFields)) {
    const val = data[fieldKey];
    if (!val) continue;
    const values = Array.isArray(val) ? val : [val];

    const ids: string[] = [];
    for (const value of values) {
      ids.push(await resolveRecordId(cfg.linkedTable!, String(value)));
    }

    result[fieldKey] = ids;
  }

  return result;
}
