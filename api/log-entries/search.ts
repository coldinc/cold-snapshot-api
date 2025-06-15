const apiLogEntriesSearchHandler = async (req: any, res: any) => {
    const axios = require("axios");
    const { isMatch } = require("../../lib/stringUtils");
    const getAirtableContext = require("../../lib/airtableBase");
    const { getFieldMap } = require("../../lib/resolveFieldMap");

    const { base, TABLES, airtableToken, baseId } = getAirtableContext();
    const logFieldMap = getFieldMap("Logs");

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
        const records = response.data.records;

        const matchingRecords = records.filter((record: any) => {
            try {
                if (name) return isMatch(record.fields?.[logFieldMap.name] || "", name);
                if (threadId) return record.fields?.[logFieldMap.threadId] === threadId;
                return false;
            } catch (e) {
                console.warn("Failed to filter record:", record.id, e);
                return false;
            }
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
