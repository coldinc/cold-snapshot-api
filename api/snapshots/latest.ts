import { NextApiRequest, NextApiResponse } from "next";
const Airtable = require("airtable");
const { getFieldMap } = require("../../lib/resolveFieldMap");

const latestSnapshotHandler = async (req: NextApiRequest, res: NextApiResponse) => {
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

      const snapshot = records.map((record: any) => ({
        id: record.id,
        ...record.fields
      }));

      return res.status(200).json(snapshot[0] || null);
    } catch (error) {
      console.error("[Snapshots LATEST Error]", error);
      return res.status(500).json({ error: "Failed to fetch latest snapshot" });
    }
  }

  res.setHeader("Allow", ["GET"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
};

export default latestSnapshotHandler;
