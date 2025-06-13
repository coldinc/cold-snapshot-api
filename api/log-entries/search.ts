/** @type {(req: any, res: any) => Promise<void>} */
const axios = require("axios");
const { getFieldMap } = require("../../lib/resolveFieldMap");

const airtableBaseId = process.env.AIRTABLE_BASE_ID;
const logsTableName = process.env.AIRTABLE_LOGS_TABLE_NAME;
const airtableToken = process.env.AIRTABLE_TOKEN;

/**
 * Normalizes input into an array of strings.
 * Accepts 'tag', 'tags', or 'tags[]' as input.
 */
function normalizeTags(query) {
  const raw = query.tags || query.tag || query["tags[]"];
  if (!raw) return [];
  return Array.isArray(raw) ? raw : [raw];
}

const logsSearchHandler = async (req: any, res: any) => {
  const { summary, contactId, logType } = req.query;
  const tags = normalizeTags(req.query);

  if (!summary && !contactId && !logType && tags.length === 0) {
    return res.status(400).json({
      error:
        "At least one query parameter (summary, contactId, tag, logType) must be provided.",
    });
  }

  if (!logsTableName) {
    return res
      .status(500)
      .json({ error: "Missing logs table name in environment variables" });
  }

  const fieldMap = getFieldMap("Logs");
  const filters = [];

  if (summary) {
    filters.push(
      `FIND(LOWER("${summary.toLowerCase()}"), LOWER({${fieldMap["Summary"]}}))`
    );
  }

  if (contactId) {
    filters.push(
      `FIND("${contactId}", ARRAYJOIN({${fieldMap["Contacts (Linked)"]}}))`
    );
  }

  if (tags.length > 0) {
    tags.forEach((t) => {
      filters.push(`FIND("${t}", ARRAYJOIN({${fieldMap["Tags"]}}))`);
    });
  }

  if (logType) {
    filters.push(`{${fieldMap["Log Type"]}} = "${logType}"`);
  }

  const formula =
    filters.length === 1 ? filters[0] : `AND(${filters.join(",")})`;

  const url = `https://api.airtable.com/v0/${airtableBaseId}/${encodeURIComponent(
    logsTableName
  )}?filterByFormula=${encodeURIComponent(formula)}`;

  const config = {
    headers: {
      Authorization: `Bearer ${airtableToken}`,
      "Content-Type": "application/json",
    },
  };

  try {
    const response = await axios.get(url, config);
    return res.status(200).json(response.data);
  } catch (err) {
    const error = err; // cast to satisfy TS in all environments
    console.error("[Logs Search Error]", {
      message: error.message,
      response: error.response?.data,
    });
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = logsSearchHandler;
