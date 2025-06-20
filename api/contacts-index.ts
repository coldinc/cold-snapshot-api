import getAirtableContext from "./airtable_base.js";
import { getFieldMap } from "./resolveFieldMap";
import { mapInternalToAirtable } from "./mapRecordFields";
import { FieldSet, Record as AirtableRecord } from "airtable";

const apiContactsHandler = async (req: any, res: any) => {
  const { base, TABLES, airtableToken, baseId } = getAirtableContext();

  const tableName = TABLES.CONTACTS;

  try {
    if (req.method === "GET") {
      const records: AirtableRecord<FieldSet>[] = [];
      const fieldMap = getFieldMap(tableName);

      await base(tableName)
        .select({ view: "Grid view" })
        .eachPage((recordsPage, fetchNextPage) => {
          records.push(...recordsPage);
          fetchNextPage();
        });

      const mappedRecords = records.map((record) => {
        const rec = record as AirtableRecord<FieldSet>;
        const mapped: Record<string, any> = { id: rec.id };
        const fields = rec.fields as Record<string, any>;
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
      const airtableFields = mapInternalToAirtable(req.body, fieldMap);
      
      console.log("Airtable fields being sent:", airtableFields);

      const createdRecord = await base(tableName).create([{ fields: airtableFields }]);

      return res.status(201).json({ id: createdRecord[0]?.id || createdRecord.id, ...req.body });
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

export default apiContactsHandler;
