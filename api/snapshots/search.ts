const axios = require("axios");
const { TABLES } = require("../../lib/airtableBase");

const normalizeString = (str: string): string =>
  str.toLowerCase().replace(/[^a-z0-9]/g, "");

const isMatch = (recordValue: string, query: string): boolean =>
  normalizeString(recordValue).includes(normalizeString(query));

const apiSnapshotsSearchHandler = async (req: any, res: any) => {
  const baseId = process.env.AIRTABLE_BASE_ID;
  const tableName = TABLES.SNAPSHOTS;
  const airtableToken = process.env.AIRTABLE_TOKEN;

  const { query } = req.query;
  if (!query || typeof query !== "string") {
    return res.status(400).json({ error: "Missing or invalid query parameter" });
  }

  const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`;
  const config = {
    headers: {
      Authorization: `Bearer ${airtableToken}`,
    },
  };

  try {
    const response = await axios.get(url, config);
    const matchingRecords = response.data.records.filter((record: any) =>
      isMatch(record.fields?.["Key Updates"] || "", query)
    );

    if (matchingRecords.length === 0) {
      return res.status(404).json({ message: "No matching snapshot found" });
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

module.exports = apiSnapshotsSearchHandler;
