const getAirtableContext = require("../../lib/airtableBase");
const { createSearchHandler } = require("../../lib/airtableSearch");

const { TABLES } = getAirtableContext();

module.exports = createSearchHandler({
  tableName: TABLES.CONTACTS,
  fieldName: "Name",
  queryParam: "name",
});
