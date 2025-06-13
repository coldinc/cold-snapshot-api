const axios = require("axios");

const { base, TABLES } = require("../../lib/airtableBase");
const { getFieldMap } = require("../../lib/resolveFieldMap");

// Utility to normalize strings for fuzzy matching
const normalizeString = (str: string): string =>
  str.toLowerCase().replace(/[^a-z0-9]/g, "");

const isMatch = (recordName: string, query: string): boolean =>
  normalizeString(recordName).includes(normalizeString(query));

const searchThreadsHandler = async (req: any, res: any) => {
  const fieldMap = getFieldMap("Threads");
  const threadsTable = TABLES.Threads;
  const airtableToken = process.env.AIRTABLE_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID;

  const { name } = req.query;

  if (!name || typeof name !== "string") {
    return res.status(400).json({ error: "Missing or invalid name parameter" });
  }

  const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(threadsTable)}`;
  const config = {
    headers: {
      Authorization: `Bearer ${airtableToken}`,
    },
  };

  try {
    const response = await axios.get(url, config);
    const matchingRecords = response.data.records.filter((record: any) =>
      isMatch(record.fields?.[fieldMap["Name"]] || "", name),
    );

    if (matchingRecords.length === 0) {
      return res.status(404).json({ message: "No matching thread found" });
    }

    return res.status(200).json(matchingRecords);
  } catch (error: any) {
    console.error("Thread search error:", {
      message: error.message,
      config: error.config,
      response: error.response?.data,
    });
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = searchThreadsHandler;
