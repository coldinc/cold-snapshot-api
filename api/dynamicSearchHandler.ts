import { getTableFieldMap } from "./resolveFieldMap.js";
import { airtableSearch } from "./airtableSearch.js";
import { buildAirtableFormula } from "./buildAirtableFormula.js";
import { getBooleanFields } from "./tableSchemas.js";

/**
 * Dynamic search handler used by multiple endpoints.
 *
 * - `q` or `search` performs fuzzy matching across text-like fields only.
 * - Boolean/checkbox fields are excluded from the fuzzy search but can be
 *   filtered explicitly with query parameters (e.g. `?followupNeeded=true`).
 * - Text search and explicit boolean filters can be combined in a single
 *   Airtable formula.
 */

export function createDynamicSearchHandler(tableName: string) {
  return async function (req: any, res: any) {
    const { method, query } = req;
    if (method !== "GET") {
      res.setHeader("Allow", ["GET"]);
      return res.status(405).end(`Method ${method} Not Allowed`);
    }

    const { fields: fieldMap, searchableFields } = getTableFieldMap(tableName);
    const {
      limit,
      sortBy,
      sortOrder,
      q,
      updatedAfter,
      createdAfter,
      recent,
      ...rest
    } = query as Record<string, any>;

    const booleanFields = getBooleanFields(tableName);
    const formula = buildAirtableFormula(
      { q, params: rest, updatedAfter, createdAfter, recent },
      fieldMap,
      { searchableFields, booleanFields },
    );

    const options: any = {};
    if (limit) {
      const n = parseInt(Array.isArray(limit) ? limit[0] : limit);
      if (!isNaN(n)) options.maxRecords = n;
    }
    if (sortBy && typeof sortBy === "string") {
      const field = fieldMap[sortBy];
      if (field) {
        options.sortField = field;
        options.sortDirection =
          typeof sortOrder === "string" && sortOrder.toLowerCase() === "desc"
            ? "desc"
            : "asc";
      }
    }

    try {
      const records = await airtableSearch(tableName, formula, options);
      if (!records || records.length === 0) {
        return res.status(404).json({ message: "No matching record found" });
      }

      const mappedRecords = records.map((record: any) => {
        const mapped: Record<string, any> = { id: record.id };
        const fields = record.fields as Record<string, any>;
        for (const [internalKey, airtableField] of Object.entries(fieldMap)) {
          const key = airtableField as keyof typeof fields;
          mapped[internalKey] = fields[key] !== undefined ? fields[key] : null;
        }
        return mapped;
      });

      return res.status(200).json(mappedRecords);
    } catch (error: any) {
      console.error("API error:", {
        message: error.message,
        config: error.config,
        response: error.response?.data,
      });
      return res.status(500).json({ error: "Internal Server Error" });
    }
  };
}
