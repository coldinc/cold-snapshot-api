const axios = require("axios");
const { base, TABLES, airtableToken, baseId } = require("../../lib/airtableBase");
const { getFieldMap, filterMappedFields } = require("../../lib/resolveFieldMap");

const contactsHandler = async (req: any, res: any) => {
  const tableName = TABLES.CONTACTS;

  const config = {
    headers: {
      Authorization: `Bearer ${airtableToken}`,
      "Content-Type": "application/json",
    },
  };

  const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`;

  try {
    if (req.method === "GET") {
      const response = await axios.get(url, config);
      const records = response.data.records.map((record: any) => ({
        id: record.id,
        ...record.fields,
      }));
      return res.status(200).json({ records });
    }

    if (req.method === "POST") {
      const fieldMap = getFieldMap(tableName);
      const payload = {
        fields: filterMappedFields(fieldMap, req.body),
      };

      const response = await axios.post(url, payload, config);
      return res.status(201).json(response.data);
    }

    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error: any) {
    console.error("Contacts API error:", {
      message: error.message,
      config: error.config,
      response: error.response?.data,
    });
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = contactsHandler;
