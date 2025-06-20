// Moved to prevent route collision with [id].ts in Next.js
import getAirtableContext from "./airtable_base.js";
import { createSearchHandler } from "./airtableSearch.js";

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

export default apiContactsSearchHandler;
