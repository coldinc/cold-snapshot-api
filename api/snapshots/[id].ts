/** @type {(req: any, res: any) => Promise<void>} */
const getSnapshotByIdHandler = async (req: any, res: any) => {
  const Airtable = require("airtable");

  const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
    process.env.AIRTABLE_BASE_ID,
  );

  const TABLE_NAME = "Cold Snapshots";

  if (req.method === "GET") {
    try {
      const { id } = req.query;

      if (!id || typeof id !== "string") {
        return res
          .status(400)
          .json({ error: "Missing or invalid snapshot ID" });
      }

      const record = await base(TABLE_NAME).find(id);

      return res.status(200).json({
        id: record.id,
        ...record.fields,
      });
    } catch (error: any) {
      console.error("[Snapshot GET BY ID Error]", error);
      return res.status(500).json({ error: "Failed to retrieve snapshot" });
    }
  }

  res.setHeader("Allow", ["GET"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
};

module.exports = getSnapshotByIdHandler;
