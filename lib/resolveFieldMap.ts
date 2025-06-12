import fieldMap from './fieldMap.json';

/**
 * Get the field mapping for a specific table.
 */
export function getFieldMap(tableName: string): Record<string, string> {
  const map = (fieldMap as Record<string, Record<string, string>>)[tableName];

  if (!map) {
    throw new Error(`No field mapping found for table: ${tableName}`);
  }

  return map;
}

/**
 * Strip any fields from the input that are not in the field mapping.
 */
export function filterMappedFields(
  input: Record<string, any>,
  tableName: string
): Record<string, any> {
  const map = getFieldMap(tableName);
  const result: Record<string, any> = {};

  for (const [key, value] of Object.entries(input)) {
    if (map[key]) {
      result[map[key]] = value;
    } else {
      console.warn(`[Unmapped Field Warning] '${key}' not found in mapping for '${tableName}'`);
    }
  }

  return result;
}
