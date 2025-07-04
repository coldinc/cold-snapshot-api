import getAirtableContext from "./airtable_base.js";
import { getFieldMap, filterMappedFields } from "./resolveFieldMap.js";

const apiSnapshotsSynthesizeHandler = async (req: any, res: any) => {
  const { base, TABLES, airtableToken, baseId } = getAirtableContext();

  const tableName = TABLES.SNAPSHOTS;

  try {
    const records = await base(tableName)
      .select({ view: "Grid view", sort: [{ field: "Date", direction: "desc" }] })
      .all();

    if (records.length === 0) {
      return res.status(404).json({ error: "No snapshots found" });
    }

    const latestRecord = records[0];
    const allFields = getFieldMap(tableName);
    const filtered = filterMappedFields(latestRecord.fields, allFields);

    return res.status(200).json(filtered);
  } catch (error: any) {
    console.error("Synthesize Snapshot Error:", {
      message: error.message,
      stack: error.stack
    });
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export default apiSnapshotsSynthesizeHandler;
