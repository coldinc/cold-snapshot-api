const { base, TABLES } = require("../../lib/airtableBase");
const {
  getFieldMap,
  filterMappedFields,
} = require("../../lib/resolveFieldMap");

const logsTable = TABLES.LOGS;

const logsHandler = async (req: any, res: any) => {
  try {
    if (req.method === "GET") {
      const records = await base(logsTable).select({}).all();
      const results = records.map((record: any) => ({
        id: record.id,
        ...record.fields,
      }));
      return res.status(200).json({ records: results });
    }

    if (req.method === "POST") {
      const fieldMap = getFieldMap();
      const filteredFields = filterMappedFields(req.body, fieldMap[logsTable]);

      const created = await base(logsTable).create([{ fields: filteredFields }]);
      return res.status(201).json({ id: created[0].id, ...created[0].fields });
    }

    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error: any) {
    console.error("Logs API error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = logsHandler;
