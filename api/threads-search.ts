// Moved to prevent route collision with [id].ts in Next.js
import getAirtableContext from "./airtable_base";
import { createSearchHandler } from "./airtableSearch";

const apiThreadsSearchHandler = async (req: any, res: any) => {

  const { TABLES } = getAirtableContext();

  const handler = createSearchHandler({
    tableName: TABLES.THREADS,
    fieldName: "Name",
    queryParam: "title",
  });

  return handler(req, res);
};

export default apiThreadsSearchHandler;
