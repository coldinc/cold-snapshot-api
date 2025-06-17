// Moved to prevent route collision with [id].ts in Next.js
const getAirtableContext = require("../../lib/airtableBase");
const { createSearchHandler } = require("../../lib/airtableSearch");
const { getFieldMap } = require("../../lib/resolveFieldMap");

const apiSnapshotsSearchHandler = async (req: any, res: any) => {
  const { TABLES } = getAirtableContext();
  const fieldMap = getFieldMap(TABLES.SNAPSHOTS);

  const handler = createSearchHandler({
    tableName: TABLES.SNAPSHOTS,
    fieldName: fieldMap.keyUpdates || "Key Updates",
    queryParam: "query",
  });

  return handler(req, res);
};

module.exports = apiSnapshotsSearchHandler;
