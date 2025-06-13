import axios from "axios";

const normalizeString = (str: string): string => str.toLowerCase().replace(/[^a-z0-9]/g, "");

const isMatch = (recordName: string, query: string): boolean =>
  normalizeString(recordName).includes(normalizeString(query));

const apiContactsHandler = async (req: any, res: any) => {
  const searchBaseId = process.env.AIRTABLE_BASE_ID;
  const searchTable = process.env.AIRTABLE_CONTACTS_TABLE_NAME;
  const airtableToken = process.env.AIRTABLE_TOKEN;

  if (!searchBaseId || !searchTable || !airtableToken) {
    return res.status(500).json({ error: "Missing Airtable configuration" });
  }

  const { name } = req.query;
  if (!name || typeof name !== "string") {
    return res.status(400).json({ error: "Missing or invalid name parameter" });
  }

  const url = `https://api.airtable.com/v0/${searchBaseId!}/${encodeURIComponent(searchTable!)}`;

  const config = {
    headers: {
      Authorization: `Bearer ${airtableToken}`
    }
  };

  try {
    const response = await axios.get(url, config);
    const matchingRecords = response.data.records.filter((record: any) => isMatch(record.fields?.Name || "", name));

    if (matchingRecords.length === 0) {
      return res.status(404).json({ message: "No matching contact found" });
    }

    return res.status(200).json(matchingRecords);
  } catch (error: any) {
    console.error("Search API error:", {
      message: error.message,
      config: error.config,
      response: error.response?.data
    });
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = apiContactsHandler;