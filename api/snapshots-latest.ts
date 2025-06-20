import getAirtableContext from "./airtable_base.js";

const apiSnapshotsLatestHandler = async (req: any, res: any) => {
    const { base, TABLES, airtableToken, baseId } = getAirtableContext();

    const tableName = TABLES.SNAPSHOTS;

    try {
        const records = await base(tableName)
            .select({
                view: "Grid view",
                sort: [{ field: "Date", direction: "desc" }],
                maxRecords: 1
            })
            .firstPage();

        if (records.length === 0) {
            return res.status(404).json({ error: "No snapshot found" });
        }

        return res.status(200).json(records[0]);
    } catch (error: any) {
        console.error("API error:", {
            message: error.message,
            stack: error.stack
        });
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export default apiSnapshotsLatestHandler;
