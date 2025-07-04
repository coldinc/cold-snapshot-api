import getAirtableContext from "./airtable_base.js";
import { getFieldMap } from "./resolveFieldMap.js";
import { mapInternalToAirtable } from "./mapRecordFields.js";
import { resolveLinkedRecordIds } from "./resolveLinkedRecordIds.js";

const idContactsHandler = async (req: any, res: any) => {
  const { base, TABLES, airtableToken, baseId } = getAirtableContext();

  const { id } = req.query;
  console.log("[contacts/[id]] TABLES.CONTACTS =", TABLES.CONTACTS, "| id =", id);
  if (!id) {
    return res.status(400).json({ error: "Missing contact ID" });
  }

  if (!airtableToken || !baseId || !TABLES.CONTACTS) {
    return res.status(500).json({ error: "Missing Airtable configuration" });
  }

  const recordUrl = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(TABLES.CONTACTS)}/${id}`;

  const config = {
    headers: {
      Authorization: `Bearer ${airtableToken}`,
      "Content-Type": "application/json"
    }
  };

  try {
    if (req.method === "GET") {
      const response = await fetch(recordUrl, {
        method: "GET",
        headers: config.headers
      });
      if (!response.ok) {
        return res.status(response.status).json({ error: await response.text() });
      }
      const data = await response.json();
      return res.status(200).json(data);
    }

    if (req.method === "PATCH") {
      const fieldMap = getFieldMap(TABLES.CONTACTS);
      const resolvedBody = await resolveLinkedRecordIds(TABLES.CONTACTS, req.body);
      const airtableFields = mapInternalToAirtable(resolvedBody, fieldMap);

      const response = await fetch(recordUrl, {
        method: "PATCH",
        headers: config?.headers,
        body: JSON.stringify({ fields: airtableFields })
      });
      if (!response.ok) {
        return res.status(response.status).json({ error: await response.text() });
      }
      const data = await response.json();
      return res.status(200).json(data);
    }

    res.setHeader("Allow", ["GET", "PATCH"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error: any) {
    console.error("API error:", {
      message: error.message,
      config: error.config,
      response: error.response?.data
    });
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export default idContactsHandler;
