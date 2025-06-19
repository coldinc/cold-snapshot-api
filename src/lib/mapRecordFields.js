// lib/mapRecordFields.ts
function mapInternalToAirtable(input, fieldMap) {
  const mapped = {};
  for (const key in input) {
    const airtableField = fieldMap[key];
    if (airtableField) {
      mapped[airtableField] = input[key];
    }
  }
  return mapped;
}
function mapAirtableToInternal(record, fieldMap) {
  const result = { id: record.id };
  for (const internalKey in fieldMap) {
    const airtableField = fieldMap[internalKey];
    const value = record.fields && record.fields[airtableField];
    result[internalKey] = value !== void 0 ? value : null;
  }
  return result;
}
export {
  mapAirtableToInternal,
  mapInternalToAirtable
};
//# sourceMappingURL=mapRecordFields.js.map