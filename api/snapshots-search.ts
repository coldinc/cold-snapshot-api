// Moved to prevent route collision with [id].ts in Next.js
import getAirtableContext from "./airtable_base.js";
import { createSearchHandler } from "./airtableSearch.js";
import { getFieldMap } from "./resolveFieldMap.js";

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

export default apiSnapshotsSearchHandler;
