const axios = require("axios");
const { getBase, TABLES } = require("../../lib/airtableBase");
const { getFieldMap } = require("../../lib/resolveFieldMap");

const handler = async (req: any, res: any) => {
  const base = getBase();

  const normalizeString = (str: string): string =>
    str.toLowerCase().replace(/[^a-z0-9]/g, "");

  const isMatch = (recordName: string, query: string): boolean =>
    normalizeString(recordName).includes(normalizeString(query));

  try {
    const { title } = req.query;
    if (!title || typeof title !== "string") {
      return res.status(400).json({ error: "Missing or invalid title parameter" });
    }

    const fieldMap = getFieldMap("Threads");
    const nameField = fieldMap?.Name;

    const records = await base(TABLES.Threads).select({}).all();
    const matchingRecords = records.filter((record: any) =>
      isMatch(record.fields?.[nameField] || "", title),
    );

    if (matchingRecords.length === 0) {
      return res.status(404).json({ message: "No matching thread found" });
    }

    const results = matchingRecords.map((record: any) => ({
      id: record.id,
      ...record.fields,
    }));

    return res.status(200).json(results);
  } catch (error: any) {
    console.error("Thread Search API Error:", {
      message: error.message,
      stack: error.stack,
    });
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = handler;
