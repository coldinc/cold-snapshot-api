const { getFieldMap } = require("@/lib/resolveFieldMap");

/**
 * Retrieves a field value from a given record using the mapped Airtable field name.
 * @param tableName - Name of the Airtable table (e.g., "Contacts", "Snapshots")
 * @param fieldKey - Internal key used in Cold OS (e.g., "name", "tags")
 * @param record - Airtable record object
 * @returns The field value, or undefined if not found
 */
function getLookupValue(
  tableName: string,
  fieldKey: string,
  record: Record<string, any>
): any {
  const map = getFieldMap(tableName);
  const airtableFieldName = map[fieldKey];
  return airtableFieldName ? record.fields?.[airtableFieldName] : undefined;
}

module.exports = {
  getLookupValue,
};
