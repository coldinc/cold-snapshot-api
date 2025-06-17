export {};
function mapInternalToAirtable(input: Record<string, any>, fieldMap: Record<string, string>): Record<string, any> {
  const mapped: Record<string, any> = {};
  for (const key in input) {
    const airtableField = fieldMap[key];
    if (airtableField) {
      mapped[airtableField] = input[key];
    }
  }
  return mapped;
}

function mapAirtableToInternal(record: { id?: string; fields?: Record<string, any> }, fieldMap: Record<string, string>): Record<string, any> {
  const result: Record<string, any> = { id: record.id };
  for (const internalKey in fieldMap) {
    const airtableField = fieldMap[internalKey];
    const value = record.fields && record.fields[airtableField];
    result[internalKey] = value !== undefined ? value : null;
  }
  return result;
}

module.exports = { mapInternalToAirtable, mapAirtableToInternal };
