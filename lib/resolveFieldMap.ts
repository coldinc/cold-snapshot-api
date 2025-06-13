const fieldMap = require("./fieldMap.json");

/**
 * Gets the field mapping object for a specific table.
 * @param {string} tableName
 * @returns {{ [key: string]: string }}
 */
function _getFieldMap(tableName: string): { [key: string]: string } {
  return fieldMap[tableName] || {};
}

/**
 * Filters and maps input fields to Airtable field IDs for a specific table.
 * @param {{ [key: string]: any }} input
 * @param {string} tableName
 * @returns {{ [key: string]: any }}
 */
function filterMappedFields(input: { [key: string]: any }, tableName: string): { [key: string]: any } {
  const map = _getFieldMap(tableName);
  const mappedFields: { [key: string]: any } = {};

  for (const [key, value] of Object.entries(input)) {
    if (map[key]) {
      mappedFields[map[key]] = value;
    } else {
      console.warn(`Unmapped field: ${key}`);
    }
  }

  return mappedFields;
}

module.exports = {
  getFieldMap: _getFieldMap,
  filterMappedFields
};