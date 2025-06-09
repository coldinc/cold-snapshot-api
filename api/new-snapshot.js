const axios = require('axios');

module.exports = async (req, res) => {
  const { content, keyUpdates, phaseId } = req.body;

  if (!content) {
    return res.status(400).json({ error: "Missing 'content' in request body" });
  }

  const now = new Date().toISOString().slice(0, 16); // ISO with HH:mm, no TZ

  const fields = {
    "Snapshot Markdown": content,
    "Date": now
  };

  if (keyUpdates) fields["Key Updates"] = keyUpdates;
  if (phaseId) fields["Phase ID"] = phaseId;

  try {
    const baseId = process.env.AIRTABLE_BASE_ID;
    const tableName = process.env.AIRTABLE_TABLE_NAME;

    const result = await axios.post(`https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`, {
      records: [{
        fields
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