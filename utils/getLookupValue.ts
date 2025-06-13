const fieldMap = require('../fieldMap.json');

function getLookupValue(tableName, fieldKey, record) {
  const lookupFieldId = fieldMap['Lookup Fields']?.[tableName]?.[fieldKey];

  if (!lookupFieldId) {
    console.warn(`Lookup field "${fieldKey}" not found for table "${tableName}".`);
    return undefined;
  }

  const value = record.fields?.[lookupFieldId];

  if (!value) {
    console.warn(`No value found in record for lookup field "${fieldKey}" (ID: ${lookupFieldId}).`);
  }

  return value;
}

module.exports = { getLookupValue };
