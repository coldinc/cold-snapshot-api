import axios from "axios";
import getAirtableContext from "./airtableBase.js";

async function airtableSearch(tableName: string, filterFormula: string) {
  const { airtableToken, baseId } = getAirtableContext();

  if (!airtableToken || !baseId) {
    throw new Error("Missing Airtable configuration");
  }

  
    console.log("[airtableSearch] baseId:", baseId, "tableName:", tableName);
    console.log("[airtableSearch] filterFormula:", filterFormula);
  

  const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`;


    console.log("[airtableSearch] url:", url);
  
  const config = {
    headers: { Authorization: `Bearer ${airtableToken}` },
    params: { filterByFormula: filterFormula, maxRecords: 10 }
  };

  const response = await axios.get(url, config);
  return response.data.records;
}

function createSearchHandler({ tableName, fieldName, queryParam }: { tableName: string; fieldName: string; queryParam: string }) {
  if (tableName.includes('/')) {
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
