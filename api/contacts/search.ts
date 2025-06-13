const apiContactsSearchHandler = async (req: any, res: any) => {
  const axios = require("axios");
  const { base, TABLES, airtableToken, baseId } = require("@/lib/airtableBase");
  const { normalizeString, isMatch } = require("@/lib/stringUtils");

  const contactsTable = TABLES.CONTACTS;

  const { name } = req.query;
  if (!name || typeof name !== "string") {
    return res.status(400).json({ error: "Missing or invalid name parameter" });
  }

  const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(contactsTable)}`;

  const config = {
    headers: {
      Authorization: `Bearer ${airtableToken}`,
    },
  };

  try {
    const response = await axios.get(url, config);
    const matchingRecords = response.data.records.filter((record: any) =>
      isMatch(record.fields?.Name || "", name)
    );

    if (matchingRecords.length === 0) {
      return res.status(404).json({ message: "No matching contact found" });
    }

    return res.status(200).json(matchingRecords);
  } catch (error: any) {
    console.error("Search API error:", {
      message: error.message,
      config: error.config,
      response: error.response?.data,
    });
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = apiContactsSearchHandler;
