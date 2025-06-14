const apiThreadsHandler = async (req: any, res: any) => {
  const { base, TABLES } = require("../../lib/airtableBase");
  const { getFieldMap, filterMappedFields } = require("../../lib/resolveFieldMap");

  const tableName = TABLES.THREADS;

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

      const filteredRecords = records.map((record) =>
        filterMappedFields(record, fieldMap)
      );

      return res.status(200).json(filteredRecords);
    }

    if (req.method === "POST") {
      const fieldMap = getFieldMap(tableName);
      const fields = req.body;

      const createdRecord = await base(tableName).create([
        { fields: filterMappedFields({ fields }, fieldMap) },
      ]);

      return res.status(201).json(createdRecord);
    }

    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error: any) {
    console.error("API error:", {
      message: error.message,
      stack: error.stack,
    });
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = apiThreadsHandler;
