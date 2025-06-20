// Moved to prevent route collision with [id].ts in Next.js
import getAirtableContext from "./airtableBase";
import { createSearchHandler } from "./airtableSearch";
import { getFieldMap } from "./resolveFieldMap";

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
