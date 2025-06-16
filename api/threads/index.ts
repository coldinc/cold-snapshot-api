const apiThreadsHandler = async (req: any, res: any) => {
    const getAirtableContext = require("../../lib/airtableBase");
    const { base, TABLES, airtableToken, baseId } = getAirtableContext();

    const { getFieldMap, filterMappedFields } = require("../../lib/resolveFieldMap");

    const tableName = TABLES.THREADS;

    try {
        if (req.method === "GET") {
            const records: any[] = [];
            const fieldMap = getFieldMap(tableName);

            await base(tableName)
                .select({ view: "Grid view" })
                .eachPage((recordsPage: any[], fetchNextPage: () => void) => {
                    records.push(...recordsPage);
                    fetchNextPage();
                });

            const mappedRecords = records.map((record) => {
                const mapped: Record<string, any> = { id: record.id };
                for (const [internalKey, airtableField] of Object.entries(fieldMap)) {
                    mapped[internalKey] =
                        record.fields[airtableField] !== undefined ? record.fields[airtableField] : null;
                }
                return mapped;
            });

            return res.status(200).json(mappedRecords);
        }

        if (req.method === "POST") {
            const fieldMap = getFieldMap(tableName);
            const fields = req.body;

            const createdRecord = await base(tableName).create([{ fields: filterMappedFields({ fields }, fieldMap) }]);

            return res.status(201).json(createdRecord);
        }

        res.setHeader("Allow", ["GET", "POST"]);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    } catch (error: any) {
        console.error("API error:", {
            message: error.message,
            stack: error.stack
        });
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = apiThreadsHandler;
