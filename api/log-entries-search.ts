// Moved to prevent route collision with [id].ts in Next.js
import { airtableSearch } from "./airtableSearch";
import getAirtableContext from "./airtable_base";
import { getFieldMap } from "./resolveFieldMap";

const fieldMap = getFieldMap("Logs");

const apiLogEntriesSearchHandler = async (req: any, res: any) => {
  const { TABLES } = getAirtableContext();
  const { name, threadId } = req.query;

  if (!name && !threadId) {
    return res.status(400).json({ error: "Missing search parameter (name or threadId)" });
  }

  let formula: string;
  if (name) {
    if (typeof name !== "string") {
      return res.status(400).json({ error: "Missing or invalid name parameter" });
    }
    const escaped = name.replace(/"/g, '\\"');
    formula = `FIND(LOWER("${escaped}"), LOWER({${fieldMap.summary}}))`;
  } else {
    if (typeof threadId !== "string") {
      return res.status(400).json({ error: "Invalid threadId parameter" });
    }
    formula = `{${fieldMap.threadId}} = "${threadId}"`;
  }

  try {
    const records = await airtableSearch(TABLES.LOGS, formula);
    if (!records || records.length === 0) {
      return res.status(404).json({ message: "No matching log entry found" });
    }
    return res.status(200).json(records);
  } catch (error: any) {
    console.error("Search API error:", {
      message: error.message,
      config: error.config,
      response: error.response?.data
    });
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export default apiLogEntriesSearchHandler;
