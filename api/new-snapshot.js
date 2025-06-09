const axios = require('axios');

module.exports = async (req, res) => {
  const { content } = req.body;
  if (!content) {
    return res.status(400).json({ error: "Missing content in request body" });
  }

  try {
    const baseId = process.env.AIRTABLE_BASE_ID;
    const tableName = process.env.AIRTABLE_TABLE_NAME;

    const result = await axios.post(`https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`, {
      records: [{
        fields: {
          "Snapshot Markdown": content,
          "Date": new Date().toISOString()
        }
      }]
    }, {
      headers: {
        Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}`,
        "Content-Type": "application/json"
      }
    });

    return res.status(200).json({ message: "Snapshot saved", id: result.data.records[0].id });
  } catch (error) {
    return res.status(500).json({ error: "Failed to save snapshot", details: error.message });
  }
};