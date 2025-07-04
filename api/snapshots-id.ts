import getAirtableContext from "./airtable_base.js";
import { getFieldMap } from "./resolveFieldMap.js";
import { mapInternalToAirtable } from "./mapRecordFields.js";

const idSnapshotsHandler = async (req: any, res: any) => {
    const { base, TABLES, airtableToken, baseId } = getAirtableContext();

    const { id } = req.query;
    if (!id) {
        return res.status(400).json({ error: "Missing snapshot ID" });
    }

    if (!airtableToken || !baseId || !TABLES.SNAPSHOTS) {
        return res.status(500).json({ error: "Missing Airtable configuration" });
    }

    const recordUrl = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(TABLES.SNAPSHOTS)}/${id}`;

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
            const fieldMap = getFieldMap(TABLES.SNAPSHOTS);
            const airtableFields = mapInternalToAirtable(req.body, fieldMap);

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

export default idSnapshotsHandler;
