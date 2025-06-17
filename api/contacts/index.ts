export {};
const apiContactsHandler = async (req: any, res: any) => {
  const getAirtableContext = require("../../lib/airtableBase");
  const { base, TABLES, airtableToken, baseId } = getAirtableContext();

  const { getFieldMap } = require("../../lib/resolveFieldMap");
  const { mapInternalToAirtable } = require("../../lib/mapRecordFields");

  const tableName = TABLES.CONTACTS;

  try {
    if (req.method === "GET") {
      const records: any[] = [];
      const fieldMap = getFieldMap(tableName);

      await base(tableName)
        .select({ view: "Grid view" })
        .eachPage((recordsPage: any[], fetchNextPage: () => void) => {
          records.push(...recordsPage);
          fetchNextPage();
        });

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
    }

    if (req.method === "POST") {
      const fieldMap = getFieldMap(tableName);
      const airtableFields = mapInternalToAirtable(req.body, fieldMap);

      const createdRecord = await base(tableName).create([{ fields: airtableFields }]);

      return res.status(201).json({ id: createdRecord[0]?.id || createdRecord.id, ...req.body });
    }

    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error: any) {
    console.error("API error:", {
      message: error.message,
      stack: error.stack
    });
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = apiContactsHandler;
