/** @type {(req: any, res: any) => Promise<void>} */
const searchSnapshotsHandler = async (req: any, res: any) => {
  const Airtable = require("airtable");
  const { getFieldMap } = require("../../lib/resolveFieldMap");

  const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
    process.env.AIRTABLE_BASE_ID
  );

  const TABLE_NAME = "Cold Snapshots";
  const snapshotsMap = getFieldMap("Cold Snapshots");

  if (req.method === "GET") {
    try {
      const { phaseId, date, limit } = req.query;

      const formulaParts: string[] = [];

      if (phaseId) {
        formulaParts.push(`{${snapshotsMap["Phase ID"]}} = "${phaseId}"`);
      }

      if (date) {
        formulaParts.push(`{${snapshotsMap["Date"]}} = "${date}"`);
      }

      const filterByFormula = formulaParts.length > 1
        ? `AND(${formulaParts.join(",")})`
        : formulaParts[0]; // Use raw string if only one condition

      const records = await base(TABLE_NAME)
        .select({
          ...(filterByFormula && { filterByFormula }),
          sort: [{ field: snapshotsMap["Date"], direction: "desc" }],
          maxRecords: limit ? parseInt(limit as string, 10) : 1
        })
        .all();

      const snapshots = records.map((record: any) => ({
        id: record.id,
        ...record.fields
      }));

      return res.status(200).json(snapshots);
    } catch (error) {
      console.error("[Snapshots SEARCH Error]", error);
      return res.status(500).json({ error: "Failed to search snapshots" });
    }
  }

  res.setHeader("Allow", ["GET"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
};

module.exports = searchSnapshotsHandler;
