import { getTableFieldMap } from './resolveFieldMap.js';
import { airtableSearch } from './airtableSearch.js';

/**
 * Resolve linked record display names to record IDs.
 *
 * @param tableName - Table containing the linked record fields.
 * @param data - Data object with display name arrays for linked records.
 * @returns Updated data object with arrays of record IDs.
 */
export async function resolveLinkedRecordIds(
  tableName: string,
  data: Record<string, any>,
): Promise<Record<string, any>> {
  const { linkedRecordFields } = getTableFieldMap(tableName);
  const result: Record<string, any> = { ...data };

  for (const [fieldKey, cfg] of Object.entries(linkedRecordFields)) {
    const val = data[fieldKey];
    if (!val) continue;
    const names = Array.isArray(val) ? val : [val];

    const { fields: linkedFields } = getTableFieldMap(cfg.linkedTable);
    const primaryField = linkedFields[Object.keys(linkedFields)[0]];
    const ids: string[] = [];

    for (const name of names) {
      const escaped = String(name).replace(/"/g, '\\"');
      const formula = `LOWER({${primaryField}}) = LOWER("${escaped}")`;
      const records = await airtableSearch(cfg.linkedTable, formula, {
        maxRecords: 2,
      });
      if (records.length === 0) {
        throw new Error(
          `No record in ${cfg.linkedTable} matches "${name}" for field ${fieldKey}`,
        );
      }
      if (records.length > 1) {
        throw new Error(
          `Multiple records in ${cfg.linkedTable} match "${name}" for field ${fieldKey}`,
        );
      }
      ids.push(records[0].id);
    }

    result[fieldKey] = ids;
  }

  return result;
}
