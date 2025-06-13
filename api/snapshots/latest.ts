const { base, TABLES } = require("../../lib/airtableBase");

const latestSnapshotHandler = async (req: any, res: any) => {
  const tableName = TABLES.SNAPSHOTS;

  try {
    const records = await base(tableName)
      .select({
        sort: [{ field: "Date", direction: "desc" }],
        maxRecords: 1,
      })
      .firstPage();

    if (!records.length) {
      return res.status(404).json({ message: "No snapshots found" });
    }

    const latest = records[0];
    return res.status(200).json({ id: latest.id, ...latest.fields });
  } catch (error: any) {
    console.error("Latest Snapshot Error:", {
      message: error.message,
    });
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = latestSnapshotHandler;
