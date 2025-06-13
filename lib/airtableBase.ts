const Airtable = require("airtable");

const getBase = () => {
  return new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
    process.env.AIRTABLE_BASE_ID
  );
};

const TABLES = {
  Contacts: process.env.AIRTABLE_CONTACTS_TABLE_NAME,
  Logs: process.env.AIRTABLE_LOGS_TABLE_NAME,
  Snapshots: process.env.AIRTABLE_SNAPSHOTS_TABLE_NAME,
  Threads: process.env.AIRTABLE_THREADS_TABLE_NAME,
};

module.exports = { getBase, TABLES };
