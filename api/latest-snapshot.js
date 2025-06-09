const Airtable = require("airtable");

const base = new Airtable({ apiKey: process.env.AIRTABLE_TOKEN }).base(process.env.AIRTABLE_BASE_ID);

module.exports = async (req, res) => {
  try {
    const records = await base(process.env.AIRTABLE_TABLE_NAME)
      .select({ sort: [{ field: "Date", direction: "desc" }], maxRecords: 1 })
      .firstPage();
    const latest = records.length ? records[0].fields : null;
    res.status(200).json({ snapshot: latest });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch snapshot", details: err.message });
  }
};