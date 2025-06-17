export {};
const Airtable = require("airtable");

const getAirtableContext = () => {
  const airtableToken = process.env.AIRTABLE_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID;

  if (!airtableToken || !baseId) {
    throw new Error("Missing Airtable configuration (token or base ID)");
  }

  const base = new Airtable({ apiKey: airtableToken }).base(baseId);

  const TABLES = {
    CONTACTS: process.env.AIRTABLE_CONTACTS_TABLE_NAME || "Contacts",
    LOGS: process.env.AIRTABLE_LOGS_TABLE_NAME || "Logs",
    SNAPSHOTS: process.env.AIRTABLE_SNAPSHOTS_TABLE_NAME || "Cold Snapshots",
    THREADS: process.env.AIRTABLE_THREADS_TABLE_NAME || "Threads",
  };

  return {
    airtableToken,
    baseId,
    base,
    TABLES,
  };
};

module.exports = getAirtableContext;
