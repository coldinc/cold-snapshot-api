const Airtable = require("airtable");

const base = new Airtable({ apiKey: process.env.AIRTABLE_TOKEN }).base(process.env.AIRTABLE_BASE_ID);

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: "Missing snapshot content" });

    await base(process.env.AIRTABLE_TABLE_NAME).create([{
      fields: {
        "Snapshot Markdown": content,
        "Date": new Date().toISOString()
      }
    }]);
    res.status(200).json({ message: "Snapshot saved" });
  } catch (err) {
    res.status(500).json({ error: "Failed to save snapshot", details: err.message });
  }
};