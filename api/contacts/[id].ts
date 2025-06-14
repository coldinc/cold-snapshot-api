const idContactsHandler = async (req: any, res: any) => {
  const axios = require("axios");
  const { base, TABLES, airtableToken, baseId } = require("../../lib/airtableBase");
  const { getFieldMap, filterMappedFields } = require("../../lib/resolveFieldMap");

  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ error: "Missing contact ID" });
  }

  if (!airtableToken || !baseId || !TABLES.CONTACTS) {
    return res.status(500).json({ error: "Missing Airtable configuration" });
  }

  const recordUrl = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(TABLES.CONTACTS)}/${id}`;

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

module.exports = idContactsHandler;
