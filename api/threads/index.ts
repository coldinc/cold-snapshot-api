const { base, TABLES } = require("../../lib/airtableBase");
const { getFieldMap, filterMappedFields } = require("../../lib/resolveFieldMap");

const threadsHandler = async (req: any, res: any) => {
  const fieldMap = getFieldMap("Threads");

  try {
    if (req.method === "GET") {
      const records = await base(TABLES.Threads).select({}).all();
      const results = records.map((record: any) => ({
        id: record.id,
        ...filterMappedFields(record.fields, fieldMap),
      }));
      return res.status(200).json({ records: results });
    }

    if (req.method === "POST") {
      const data = req.body;
      const createPayload = Object.entries(data).reduce((acc: any, [key, value]) => {
        const fieldId = fieldMap[key];
        if (fieldId) acc[fieldId] = value;
        return acc;
      }, {});

      const created = await base(TABLES.Threads).create([{ fields: createPayload }]);
      return res.status(201).json({ id: created[0].id, ...created[0].fields });
    }

    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error: any) {
    console.error("Threads API error:", {
      message: error.message,
      stack: error.stack,
    });
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = threadsHandler;
