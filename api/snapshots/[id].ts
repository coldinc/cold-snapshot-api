const axios = require("axios");
const { TABLES } = require("../../lib/airtableBase");

const idSnapshotsHandler = async (req: any, res: any) => {
  const tableName = TABLES.SNAPSHOTS;
  const baseId = process.env.AIRTABLE_BASE_ID || "";
  const airtableToken = process.env.AIRTABLE_TOKEN || "";

  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ error: "Missing snapshot ID" });
  }

  const recordUrl = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}/${id}`;

  const config = {
    headers: {
      Authorization: `Bearer ${airtableToken}`,
      "Content-Type": "application/json",
    },
  };

  try {
    if (req.method === "GET") {
      const response = await axios.get(recordUrl, config);
      return res.status(200).json(response.data);
    }

    if (req.method === "PATCH") {
      const response = await axios.patch(recordUrl, { fields: req.body }, config);
      return res.status(200).json(response.data);
    }

    res.setHeader("Allow", ["GET", "PATCH"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error: any) {
    console.error("API error:", {
      message: error.message,
      config: error.config,
      response: error.response?.data,
    });
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = idSnapshotsHandler;
