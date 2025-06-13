/** @type {(req: any, res: any) => Promise<void>} */
const axios = require("axios");
const { getFieldMap } = require("../../lib/resolveFieldMap");

const airtableBaseId = process.env.AIRTABLE_BASE_ID;
const logsTableName = process.env.AIRTABLE_LOGS_TABLE_NAME;
const airtableToken = process.env.AIRTABLE_TOKEN;

const logsSearchHandler = async (req: any, res: any) => {
  const query: { [key: string]: any } = req.query;
  const { summary, contactId, tag, logType } = query;

  if (!summary && !contactId && !tag && !logType) {
    return res.status(400).json({
      error:
        "At least one query parameter (summary, contactId, tag, logType) must be provided.",
    });
  }

  const fieldMap = getFieldMap("Logs");
  const filters: string[] = [];

  if (summary) {
    filters.push(
      `FIND(LOWER("${summary.toLowerCase()}"), LOWER({${fieldMap["Summary"]}}))`,
    );
  }

  if (contactId) {
    filters.push(
      `FIND("${contactId}", ARRAYJOIN({${fieldMap["Contacts (Linked)"]}}))`,
    );
  }

  if (tag) {
    const tags = Array.isArray(tag) ? tag : [tag];
    tags.forEach((t) => {
      filters.push(`FIND("${t}", ARRAYJOIN({${fieldMap["Tags"]}}))`);
    });
  }

  if (logType) {
    filters.push(`{${fieldMap["Log Type"]}} = "${logType}"`);
  }

  const formula =
    filters.length === 1 ? filters[0] : `AND(${filters.join(",")})`;

  if (!logsTableName) {
    return res
      .status(500)
      .json({ error: "Missing logs table name in env vars" });
  }

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
  } catch (error: unknown) {
    const err = error as any;
    console.error("[Logs Search Error]", {
      message: err.message,
      response: err.response?.data,
    });
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = logsSearchHandler;
