const getAirtableContext = require("../../lib/airtableBase");
const { createSearchHandler } = require("../../lib/airtableSearch");
const { getFieldMap } = require("../../lib/resolveFieldMap");

const { TABLES } = getAirtableContext();
const fieldMap = getFieldMap(TABLES.SNAPSHOTS);

module.exports = createSearchHandler({
  tableName: TABLES.SNAPSHOTS,
  fieldName: fieldMap.keyUpdates || "Key Updates",
  queryParam: "query",
});
