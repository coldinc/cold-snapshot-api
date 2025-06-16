const threadsSearchHandler = async (req: any, res: any) => {
    const axios = require("axios");
    const { normalizeString, isMatch } = require("../../lib/stringUtils");
    const getAirtableContext = require("../../lib/airtableBase");
    const { base, TABLES, airtableToken, baseId } = getAirtableContext();

    const { getFieldMap } = require("../../lib/resolveFieldMap");

    const fieldMap = getFieldMap("Threads");

    if (!airtableToken || !baseId || !TABLES.THREADS) {
        return res.status(500).json({ error: "Missing Airtable configuration" });
    }

    const { title } = req.query;
    if (!title || typeof title !== "string") {
        return res.status(400).json({ error: "Missing or invalid title parameter" });
    }

    const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(TABLES.THREADS)}`;
    const config = {
        headers: {
            Authorization: `Bearer ${airtableToken}`
        }
    };

    try {
        const response = await axios.get(url, config);
        const matchingRecords = response.data.records.filter((record: any) =>
            isMatch(record.fields?.[fieldMap["Title"]] || "", title)
        );

        if (matchingRecords.length === 0) {
            return res.status(404).json({ message: "No matching thread found" });
        }

        return res.status(200).json(matchingRecords);
    } catch (error: any) {
        console.error("Search API error:", {
            message: error.message,
            config: error.config,
            response: error.response?.data
        });
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = threadsSearchHandler;
