/** @type {(req: any, res: any) => Promise<void>} */
const snapshotsHandler = async (req: any, res: any) => {
    const Airtable = require("airtable");
    const { getFieldMap, filterMappedFields } = require("../../lib/resolveFieldMap");

    const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

    const TABLE_NAME = "Cold Snapshots";

    if (req.method === "POST") {
        try {
            const logicalInput: { [key: string]: any } = req.body;
            const snapshotsMap: { [key: string]: string } = getFieldMap("Cold Snapshots");
            const mappedFields = filterMappedFields(logicalInput, "Cold Snapshots");

            if (!mappedFields[snapshotsMap["Snapshot Markdown"]]) {
                return res.status(400).json({ error: "Missing required field: Snapshot Markdown" });
            }

            const createdRecords = await base(TABLE_NAME).create([{ fields: mappedFields }]);

            return res.status(201).json({
                message: "Snapshot created successfully",
                id: createdRecords[0].id
            });
        } catch (error: any) {
            console.error("[Snapshots POST Error]", error);
            return res.status(500).json({ error: "Failed to create snapshot" });
        }
    }

    if (req.method === "GET") {
        try {
            const records: any[] = await base(TABLE_NAME).select().all();

            const snapshots = records.map((record: any) => ({
                id: record.id,
                ...record.fields
            }));

            return res.status(200).json(snapshots);
        } catch (error: any) {
            console.error("[Snapshots GET Error]", error);
            return res.status(500).json({ error: "Failed to fetch snapshots" });
        }
    }

    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
};

module.exports = snapshotsHandler;
