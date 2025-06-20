import getAirtableContext from "../lib/airtableBase";

const idThreadsHandler = async (req: any, res: any) => {
    const { base, TABLES, airtableToken, baseId } = getAirtableContext();

    const { id } = req.query;
    if (!id) {
        return res.status(400).json({ error: "Missing thread ID" });
    }

    if (!airtableToken) {
        console.error("Missing AIRTABLE_API_KEY");
        return res.status(500).json({ error: "Missing Airtable API Key" });
    }

    if (!baseId) {
        console.error("Missing AIRTABLE_BASE_ID");
        return res.status(500).json({ error: "Missing Airtable Base ID" });
    }

    if (!TABLES?.THREADS) {
        console.error("Missing AIRTABLE_THREADS_TABLE_NAME");
        return res.status(500).json({ error: "Missing Airtable Threads Table Name" });
    }

    const recordUrl = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(TABLES.THREADS)}/${id}`;

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
            const response = await fetch(recordUrl, {
                method: "PATCH",
                headers: config?.headers,
                body: JSON.stringify({ fields: req.body })
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

export default idThreadsHandler;
