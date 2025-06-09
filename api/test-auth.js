const Airtable = require("airtable");

module.exports = async (req, res) => {
  try {
    const base = new Airtable({ apiKey: process.env.AIRTABLE_TOKEN });
    const metaApi = base.meta;

    if (!metaApi || !metaApi.listTablesAsync) {
      return res.status(500).json({ error: "Metadata API is not accessible via this token." });
    }

    const tables = await metaApi.listTablesAsync();
    res.status(200).json({ tables });
  } catch (err) {
    res.status(500).json({ error: "Diagnostic check failed", details: err.message });
  }
};