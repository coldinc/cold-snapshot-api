import getAirtableContext from "./airtable_base.js";
import { getFieldMap } from "./resolveFieldMap.js";
import { FieldSet, Record as AirtableRecord } from "airtable";
import { prepareFields } from "./preparePayload.js";


const apiThreadsHandler = async (req: any, res: any) => {
    const { base, TABLES, airtableToken, baseId } = getAirtableContext();

    const tableName = TABLES.THREADS;

    try {
        if (req.method === "GET") {
            const records: AirtableRecord<FieldSet>[] = [];
            const fieldMap = getFieldMap(tableName);

            await base(tableName)
                .select({ view: "Grid view" })
                .eachPage(
                    (
                        recordsPage: readonly AirtableRecord<FieldSet>[],
                        fetchNextPage: () => void
                    ) => {
                        records.push(...recordsPage);
                        fetchNextPage();
                    }
                );

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
            const airtableFields = await prepareFields(tableName, req.body);

            // Final scrub: ensure only mapped fields are sent to Airtable
            const cleanFields: Record<string, any> = {};
            const stripped: string[] = [];
            const validFields = new Set(Object.values(fieldMap));
            for (const [key, value] of Object.entries(airtableFields)) {
                if (validFields.has(key)) {
                    cleanFields[key] = value;
                } else {
                    stripped.push(key);
                }
            }
            if (stripped.length > 0) {
                console.log(`[finalScrub] stripped fields for ${tableName}:`, stripped);
            }

            const createdRecord = await base(tableName).create([
                { fields: cleanFields }
            ]);

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
