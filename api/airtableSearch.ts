import getAirtableContext from "./airtable_base.js";

interface SearchOptions {
  maxRecords?: number;
  sortField?: string;
  sortDirection?: "asc" | "desc";
}

async function airtableSearch(
  tableName: string,
  filterFormula: string,
  options: SearchOptions = {}
) {
  const { airtableToken, baseId } = getAirtableContext();

  if (!airtableToken || !baseId) {
    throw new Error("Missing Airtable configuration");
  }

  console.log("[airtableSearch] baseId:", baseId, "tableName:", tableName);
  console.log("[airtableSearch] filterFormula:", filterFormula);

  const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`;

  console.log("[airtableSearch] url:", url);

  const config = {
    headers: { Authorization: `Bearer ${airtableToken}` }
  };

  const params = new URLSearchParams();
  if (filterFormula) params.set("filterByFormula", filterFormula);
  params.set("maxRecords", String(options.maxRecords ?? 10));
  if (options.sortField) {
    params.append("sort[0][field]", options.sortField);
    params.append(
      "sort[0][direction]",
      options.sortDirection ?? "asc"
    );
  }
  const fullUrl = url + "?" + params.toString();

  const response = await fetch(fullUrl, config);
  if (!response.ok) {
    throw new Error(`Airtable request failed: ${await response.text()}`);
  }
  const data = (await response.json()) as { records: any[] };
  return data.records;
}

function createSearchHandler({
  tableName,
  fieldName,
  queryParam
}: {
  tableName: string;
  fieldName: string;
  queryParam: string;
}) {
  if (tableName.includes("/")) {
    throw new Error(`Invalid tableName "${tableName}" - must not contain '/'`);
  }
  return async function (req: any, res: any) {
    const value = req.query[queryParam];
    if (!value || typeof value !== "string") {
      return res.status(400).json({ error: `Missing or invalid ${queryParam} parameter` });
    }

    const escaped = (value as string).replace(/"/g, '\\"');
    const formula = `FIND(LOWER("${escaped}"), LOWER({${fieldName}}))`;

    try {
      const records = await airtableSearch(tableName, formula);
      if (!records || records.length === 0) {
        return res.status(404).json({ message: "No matching record found" });
      }
      return res.status(200).json(records);
    } catch (error: any) {
      console.error("Search API error:", {
        message: error.message,
        config: error.config,
        response: error.response?.data
      });
      return res.status(500).json({ error: "Internal Server Error" });
    }
  };
}

export { airtableSearch, createSearchHandler };
