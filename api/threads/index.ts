import getAirtableContext from "../../lib/airtableBase.js";
import { getFieldMap, filterMappedFields } from "../../lib/resolveFieldMap.js";
import { FieldSet, Record as AirtableRecord } from "airtable";


const apiThreadsHandler = async (req: any, res: any) => {
    const { base, TABLES, airtableToken, baseId } = getAirtableContext();

    const tableName = TABLES.THREADS;

    try {
        if (req.method === "GET") {
            const records: any[] = [];
            const fieldMap = getFieldMap(tableName);

            await base(tableName)
                .select({ view: "Grid view" })
                .eachPage((recordsPage: Records<FieldSet>, fetchNextPage: () => void) => {
                    records.push(...recordsPage);
                    fetchNextPage();
                });

            const mappedRecords = records.map((record) => {
                const mapped: Record<string, any> = { id: record.id };
                const fields = record.fields as Record<string, any>;
                for (const [internalKey, airtableField] of Object.entries(fieldMap)) {
                    const key = airtableField as keyof typeof fields;
                    mapped[internalKey] = fields[key] !== undefined ? fields[key] : null;
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

export default apiThreadsHandler;
