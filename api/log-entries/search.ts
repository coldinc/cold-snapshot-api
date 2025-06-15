const apiLogEntriesSearchHandler = async (req: any, res: any) => {
    const axios = require("axios");
    const { normalizeString, isMatch } = require("../../lib/stringUtils");
    const getAirtableContext = require("../../lib/airtableBase");
    const { base, TABLES, airtableToken, baseId } = getAirtableContext();

    if (!airtableToken || !baseId || !TABLES.LOGS) {
        return res.status(500).json({ error: "Missing Airtable configuration" });
    }

    const { name, threadId } = req.query;

    if (!name && !threadId) {
        return res.status(400).json({ error: "Missing search parameter (name or threadId)" });
    }

    const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(TABLES.LOGS)}`;
    const config = {
        headers: {
            Authorization: `Bearer ${airtableToken}`
        }
    };

    try {
        const response = await axios.get(url, config);

        const matchingRecords = response.data.records.filter((record: any) => {
            if (name) return isMatch(record.fields?.Name || "", name);
            if (threadId) return record.fields?.threadId === threadId;
            return false;
        });

        if (matchingRecords.length === 0) {
            return res.status(404).json({ message: "No matching log entries found" });
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

module.exports = apiLogEntriesSearchHandler;
