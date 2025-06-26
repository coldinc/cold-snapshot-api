import getAirtableContext from "./airtable_base.js";
import { getFieldMap } from "./resolveFieldMap.js";
import { mapInternalToAirtable } from "./mapRecordFields.js";
import { resolveRecordId } from "./resolveLinkedRecordIds.js";

const threadsLinkHandler = async (req: any, res: any) => {
  const { baseId, airtableToken, TABLES } = getAirtableContext();
  const tableName = TABLES.THREADS;

  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { childThread, parentThread, linkType } = req.body || {};
  if (!childThread || !parentThread || !linkType) {
    return res.status(400).json({ error: "childThread, parentThread and linkType are required" });
  }
  if (linkType !== "parent" && linkType !== "subthread") {
    return res.status(400).json({ error: "linkType must be 'parent' or 'subthread'" });
  }

  try {
    const childId = await resolveRecordId(tableName, String(childThread));
    const parentId = await resolveRecordId(tableName, String(parentThread));

    const recordId = linkType === "parent" ? childId : parentId;
    const updateData = linkType === "parent"
      ? { parentThread: [parentId] }
      : { subthread: [childId] };

    const fieldMap = getFieldMap(tableName);
    const airtableFields = mapInternalToAirtable(updateData, fieldMap);
    const recordUrl = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}/${recordId}`;
    const headers = {
      Authorization: `Bearer ${airtableToken}`,
      "Content-Type": "application/json",
    };
    const response = await fetch(recordUrl, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ fields: airtableFields }),
    });
    if (!response.ok) {
      return res.status(response.status).json({ error: await response.text() });
    }

    return res.status(200).json({ message: "Thread link updated" });
  } catch (error: any) {
    console.error("API error:", error);
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};

export default threadsLinkHandler;
