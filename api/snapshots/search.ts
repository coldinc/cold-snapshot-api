const apiSnapshotsSearchHandler = async (req: any, res: any) => {
  const axios = require("axios");
  const { normalizeString, isMatch } = require("@/lib/stringUtils");
  const { base, TABLES, airtableToken, baseId } = require("@/lib/airtableBase");
  const { getFieldMap } = require("@/lib/resolveFieldMap");

  const fieldMap = getFieldMap("Snapshots");

  if (!airtableToken || !baseId || !TABLES.Snapshots) {
    return res.status(500).json({ error: "Missing Airtable configuration" });
  }

  const { query } = req.query;
  if (!query || typeof query !== "string") {
    return res.status(400).json({ error: "Missing or invalid query parameter" });
  }

  const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(TABLES.Snapshots)}`;
  const config = {
    headers: {
      Authorization: `Bearer ${airtableToken}`,
    },
  };

  try {
    const response = await axios.get(url, config);
    const matchingRecords = response.data.records.filter((record: any) =>
      isMatch(record.fields?.[fieldMap["Key Updates"]] || "", query)
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
