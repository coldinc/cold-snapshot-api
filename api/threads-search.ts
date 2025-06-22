// Moved to prevent route collision with [id].ts in Next.js
import getAirtableContext from "./airtable_base.js";
import { airtableSearch } from "./airtableSearch.js";
import { getFieldMap } from "./resolveFieldMap.js";

const apiThreadsSearchHandler = async (req: any, res: any) => {
  const { TABLES } = getAirtableContext();
  const tableName = TABLES.THREADS;

  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { title } = req.query;
  if (!title || typeof title !== "string") {
    return res.status(400).json({ error: "Missing or invalid title parameter" });
  }

  const escaped = title.replace(/"/g, '\\"');
  const formula = `FIND(LOWER("${escaped}"), LOWER({Name}))`;

  try {
    const records = await airtableSearch(tableName, formula);
    if (!records || records.length === 0) {
      return res.status(404).json({ message: "No matching record found" });
    }

    const fieldMap = getFieldMap(tableName);
    const mappedRecords = records.map((record) => {
      const mapped: Record<string, any> = { id: record.id };
      const fields = record.fields as Record<string, any>;
      for (const [internalKey, airtableField] of Object.entries(fieldMap)) {
        const key = airtableField as keyof typeof fields;
        mapped[internalKey] = fields[key] !== undefined ? fields[key] : null;
      }
      return mapped;
    });

    return res.status(200).json(mappedRecords);
  } catch (error: any) {
    console.error("API error:", {
      message: error.message,
      config: error.config,
      response: error.response?.data,
    });
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export default apiThreadsSearchHandler;
