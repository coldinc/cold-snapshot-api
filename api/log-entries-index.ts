import getAirtableContext from "./airtable_base.js";
import { getFieldMap, filterMappedFields } from "./resolveFieldMap.js";
import { airtableSearch } from "./airtableSearch.js";
import { scrubPayload } from "./scrubPayload.js";
import { mapInternalToAirtable } from "./mapRecordFields.js";

const apiLogEntriesHandler = async (req: any, res: any) => {
  const { base, TABLES, airtableToken, baseId } = getAirtableContext();

  const tableName = TABLES.LOGS;

  try {
    if (req.method === "GET") {
      const fieldMap = getFieldMap(tableName);

      const limitParam = req.query.limit;
      const offsetParam = req.query.offset;

      let limit = 20;
      if (limitParam) {
        const parsed = parseInt(
          Array.isArray(limitParam) ? limitParam[0] : limitParam,
        );
        if (!isNaN(parsed) && parsed > 0) limit = parsed;
      }
      const offset =
        typeof offsetParam === "string"
          ? offsetParam
          : Array.isArray(offsetParam)
            ? offsetParam[0]
            : undefined;

      const { records, offset: nextOffset } = await airtableSearch(
        tableName,
        "",
        {
          maxRecords: limit,
          offset,
        },
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

      return res
        .status(200)
        .json({ records: mappedRecords, offset: nextOffset });
    }

    if (req.method === "POST") {
      const fieldMap = getFieldMap(tableName);

      // Sanitize the incoming payload immediately
      const scrubbed = await scrubPayload(tableName, req.body);
      const cleanFields = mapInternalToAirtable(scrubbed, fieldMap);
      console.log("[createLogEntry] sanitized fields:", cleanFields);
      console.log("[createLogEntry] raw request body:", req.body);

      // Final guard: only allow mapped fields
      const safeFields = filterMappedFields(cleanFields, fieldMap);

      const [createdRecord] = await base(tableName).create([
        { fields: safeFields },
      ]);

      return res.status(201).json({ id: createdRecord.id, ...scrubbed });
    }

    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error: any) {
    console.error("API error:", {
      message: error.message,
      stack: error.stack,
    });
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export default apiLogEntriesHandler;
