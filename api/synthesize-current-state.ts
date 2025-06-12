/** @type {(req: any, res: any) => Promise<void>} */
const handler = async (req: any, res: any) => {
  const Airtable = require("airtable");
  const { getFieldMap } = require("../lib/resolveFieldMap");

  const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
    process.env.AIRTABLE_BASE_ID
  );

  const CONTACTS_TABLE = "Contacts";
  const LOGS_TABLE = "Logs";
  const SNAPSHOTS_TABLE = "Cold Snapshots";

  const contactsMap = getFieldMap(CONTACTS_TABLE);
  const logsMap = getFieldMap(LOGS_TABLE);
  const snapshotsMap = getFieldMap(SNAPSHOTS_TABLE);

  if (req.method === "GET") {
    try {
      // Fetch latest snapshot (optional, fallback context)
      const latestSnapshotRecords = await base(SNAPSHOTS_TABLE)
        .select({
          sort: [{ field: snapshotsMap["Date"], direction: "desc" }],
          maxRecords: 1
        })
        .all();

      const latestSnapshot = latestSnapshotRecords[0]
        ? latestSnapshotRecords[0].fields
        : null;

      // Fetch latest contacts (limit to 10 recent additions or updates)
      const contactRecords = await base(CONTACTS_TABLE)
        .select({
          sort: [{ field: "Last Modified", direction: "desc" }],
          maxRecords: 10
        })
        .all();

      const contacts = contactRecords.map((record: any) => ({
        id: record.id,
        ...record.fields
      }));

      // Fetch recent logs (limit to 10)
      const logRecords = await base(LOGS_TABLE)
        .select({
          sort: [{ field: logsMap["Date"], direction: "desc" }],
          maxRecords: 10
        })
        .all();

      const logs = logRecords.map((record: any) => ({
        id: record.id,
        ...record.fields
      }));

      return res.status(200).json({
        snapshot: latestSnapshot,
        contacts,
        logs
      });
    } catch (error) {
      console.error("[SYNTHESIZE ERROR]", error);
      return res.status(500).json({ error: "Failed to synthesize state" });
    }
  }

  res.setHeader("Allow", ["GET"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
};

module.exports = handler;
