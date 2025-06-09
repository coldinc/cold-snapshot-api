const axios = require('axios');

module.exports = async (req, res) => {
  try {
    const baseId = process.env.AIRTABLE_BASE_ID;
    const tableName = process.env.AIRTABLE_TABLE_NAME;

    const response = await axios.get(`https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}?sort[0][field]=Date&sort[0][direction]=desc&maxRecords=1`, {
      headers: {
        Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}`
      }
    });

    const record = response.data.records[0];
    if (!record) {
      return res.status(200).json({ snapshot: {} });
    }

    return res.status(200).json({ snapshot: record.fields });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch snapshot", details: error.message });
  }
};