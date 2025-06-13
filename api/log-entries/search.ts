const axios = require("axios");
const { baseId, airtableToken, TABLES } = require("../../lib/airtableBase");

const normalizeString = (str: string): string =>
  str.toLowerCase().replace(/[^a-z0-9]/g, "");

const isMatch = (recordName: string, query: string): boolean =>
  normalizeString(recordName).includes(normalizeString(query));

const searchLogsHandler = async (req: any, res: any) => {
  const searchTable = TABLES.LOGS;

  if (!baseId || !searchTable || !airtableToken) {
    return res.status(500).json({ error: "Missing Airtable configuration" });
  }

  const { summary } = req.query;
  if (!summary || typeof summary !== "string") {
    return res.status(400).json({ error: "Missing or invalid summary parameter" });
  }

  const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(searchTable)}`;

  const config = {
    headers: {
      Authorization: `Bearer ${airtableToken}`,
    },
  };

  try {
    const response = await axios.get(url, config);
    const matchingRecords = response.data.records.filter((record: any) =>
      isMatch(record.fields?.Summary || "", summary),
    );

    if (matchingRecords.length === 0) {
      return res.status(404).json({ message: "No matching log entry found" });
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

module.exports = searchLogsHandler;
