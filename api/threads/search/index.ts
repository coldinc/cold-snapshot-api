// Moved to prevent route collision with [id].ts in Next.js
const getAirtableContext = require("../../../lib/airtableBase");
const { createSearchHandler } = require("../../../lib/airtableSearch");

const apiThreadsSearchHandler = async (req: any, res: any) => {
  const { TABLES } = getAirtableContext();

  const handler = createSearchHandler({
    tableName: TABLES.THREADS,
    fieldName: "Name",
    queryParam: "title",
  });

  return handler(req, res);
};

module.exports = apiThreadsSearchHandler;
