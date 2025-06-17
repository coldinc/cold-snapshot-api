const getAirtableContext = require("../../lib/airtableBase");
const { createSearchHandler } = require("../../lib/airtableSearch");

const apiContactsSearchHandler = async (req: any, res: any) => {
  const { TABLES } = getAirtableContext();

  const handler = createSearchHandler({
    tableName: TABLES.CONTACTS,
    fieldName: "Name",
    queryParam: "name",
  });

  return handler(req, res);
};

module.exports = apiContactsSearchHandler;
