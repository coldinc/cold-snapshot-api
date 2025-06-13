const { base, TABLES } = require("../../lib/airtableBase");
const {
  getFieldMap,
  filterMappedFields,
} = require("../../lib/resolveFieldMap");

const snapshotsHandler = async (req: any, res: any) => {
  try {
    const tableName = TABLES.SNAPSHOTS;
    const fieldMap = getFieldMap(tableName);

    if (req.method === "GET") {
      const records = await base(tableName).select({}).all();
      const results = records.map((record) => ({
        id: record.id,
        ...record.fields,
      }));
      return res.status(200).json({ records: results });
    }

    if (req.method === "POST") {
      const data = req.body;
      const createPayload = Object.entries(data).reduce((acc, [key, value]) => {
        const fieldId = fieldMap[key];
        if (fieldId) acc[fieldId] = value;
        return acc;
      }, {});

      const created = await base(tableName).create([{ fields: createPayload }]);
      return res.status(201).json({ id: created[0].id, ...created[0].fields });
    }

    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};

module.exports = snapshotsHandler;
