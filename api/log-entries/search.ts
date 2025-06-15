const apiLogEntriesSearchHandler = async (req: any, res: any) => {
    const axios = require("axios");
    const { isMatch } = require("../../lib/stringUtils");
    const getAirtableContext = require("../../lib/airtableBase");
    const { getFieldMap } = require("../../lib/resolveFieldMap");

    const { base, TABLES, airtableToken, baseId } = getAirtableContext();
    const logFieldMap = getFieldMap("Logs");

    if (!airtableToken || !baseId || !TABLES.LOGS) {
        console.error("Missing Airtable configuration", { airtableToken, baseId, LOGS: TABLES.LOGS });
        return res.status(500).json({ error: "Missing Airtable configuration" });
    }

    const { name, threadId } = req.query;

    if (!name && !threadId) {
        console.warn("No valid query provided. Either name or threadId is required.");
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

        console.log("Total records fetched:", records.length);
        console.log("Using Airtable field map key:", logFieldMap);
        console.log("Searching for threadId:", threadId);
        console.log("Searching for name:", name);

        // Log all Thread ID values from the records
        records.forEach((record: any, i: number) => {
            console.log(`Record ${i + 1} Thread ID field (${logFieldMap.threadId}):`, record.fields?.[logFieldMap.threadId]);
        });

        let matchingRecords = [];
        try {
            matchingRecords = records.filter((record: any) => {
                if (name) return isMatch(record.fields?.[logFieldMap.name] || "", name);
                if (threadId) return record.fields?.[logFieldMap.threadId] === threadId;
                return false;
            });
        } catch (filterErr) {
            console.error("Error in filter loop:", filterErr);
            return res.status(500).json({ error: "Error during filtering" });
        }

        console.log("Matching records found:", matchingRecords.length);

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
