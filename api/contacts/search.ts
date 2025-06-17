// Moved to prevent route collision with [id].ts in Next.js
const getAirtableContext = require("../../lib/airtableBase");
const { createSearchHandler } = require("../../lib/airtableSearch");

const apiContactsSearchHandler = async (req: any, res: any) => {
  const { TABLES } = getAirtableContext();

  const tableName = TABLES.CONTACTS;
  console.log("[api/contacts/search] resolved tableName:", tableName);

  const handler = createSearchHandler({
    tableName,
    fieldName: "Name",
    queryParam: "name",
  });

  return handler(req, res);
};

module.exports = apiContactsSearchHandler;
