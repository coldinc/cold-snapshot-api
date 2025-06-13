const Airtable = require("airtable");

const base = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY,
}).base(process.env.AIRTABLE_BASE_ID);

const TABLES = {
  CONTACTS: process.env.AIRTABLE_CONTACTS_TABLE_NAME,       // "Contacts"
  LOGS: process.env.AIRTABLE_LOGS_TABLE_NAME,               // "Logs"
  THREADS: process.env.AIRTABLE_THREADS_TABLE_NAME,         // "Threads"
  SNAPSHOTS: process.env.AIRTABLE_SNAPSHOTS_TABLE_NAME,     // "Cold Snapshots"
  // Add more as needed
};

module.exports = {
  base,
  TABLES,
};
