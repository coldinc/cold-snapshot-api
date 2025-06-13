const Airtable = require("airtable");

const getAirtableContext = () => {
  const airtableToken = process.env.AIRTABLE_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID;

  if (!airtableToken || !baseId) {
    throw new Error("Missing Airtable configuration (token or base ID)");
  }

  const base = new Airtable({ apiKey: airtableToken }).base(baseId);

  const TABLES = {
    CONTACTS: process.env.AIRTABLE_CONTACTS_TABLE_NAME,
    LOG_ENTRIES: process.env.AIRTABLE_LOG_ENTRIES_TABLE_NAME,
    SNAPSHOTS: process.env.AIRTABLE_SNAPSHOTS_TABLE_NAME,
    THREADS: process.env.AIRTABLE_THREADS_TABLE_NAME,
  };

  return {
    airtableToken,
    baseId,
    base,
    TABLES,
  };
};

module.exports = getAirtableContext;
