/** @type {(req: any, res: any) => Promise<void>} */
const getLatestSnapshotHandler = async (req, res) => {
  const Airtable = require("airtable");
  const { getFieldMap } = require("../../lib/resolveFieldMap");

  const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
    process.env.AIRTABLE_BASE_ID
  );

  const TABLE_NAME = "Cold Snapshots";
  const snapshotsMap = getFieldMap("Cold Snapshots");

  if (req.method === "GET") {
    try {
      const records = await base(TABLE_NAME)
        .select({
          sort: [{ field: snapshotsMap["Date"], direction: "desc" }],
          maxRecords: 1
        })
        .all();

      if (records.length === 0) {
        return res.status(404).json({ error: "No snapshot found" });
      }

      const latestSnapshot = {
        id: records[0].id,
        ...records[0].fields
      };

      return res.status(200).json(latestSnapshot);
    } catch (error) {
      console.error("[Snapshots LATEST Error]", error);
      return res.status(500).json({ error: "Failed to fetch latest snapshot" });
    }
  }

  res.setHeader("Allow", ["GET"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
};

module.exports = getLatestSnapshotHandler;
