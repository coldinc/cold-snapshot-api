const { base, TABLES } = require("../../../lib/airtableBase");
const { getFieldMap } = require("../../../lib/resolveFieldMap");

const synthesizeCurrentState = async (req: any, res: any) => {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const tableName = TABLES.SNAPSHOTS;
    const fieldMap = getFieldMap(tableName);

    const records = await base(tableName)
      .select({
        sort: [{ field: fieldMap["Date"], direction: "desc" }],
        maxRecords: 1,
      })
      .firstPage();

    if (!records.length) {
      return res.status(404).json({ error: "No snapshots found" });
    }

    const latestSnapshot = records[0];
    const snapshotMarkdown = latestSnapshot.fields[fieldMap["Snapshot Markdown"]];
    const keyUpdates = latestSnapshot.fields[fieldMap["Key Updates"]];
    const phaseId = latestSnapshot.fields[fieldMap["Phase ID"]];

    const response = {
      snapshot: snapshotMarkdown,
      keyUpdates,
      phaseId,
    };

    return res.status(200).json(response);
  } catch (error: any) {
    console.error("Synthesize error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = synthesizeCurrentState;
