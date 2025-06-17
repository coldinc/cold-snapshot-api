const getAirtableContext = require("../../lib/airtableBase");
const { createSearchHandler } = require("../../lib/airtableSearch");

const { TABLES } = getAirtableContext();

module.exports = createSearchHandler({
  tableName: TABLES.THREADS,
  fieldName: "Name",
  queryParam: "title",
});
