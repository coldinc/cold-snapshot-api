import axios from 'axios';
export default async function handler(req, res) {
    const searchBaseId = process.env.AIRTABLE_BASE_ID || '';
    const searchTable = process.env.AIRTABLE_CONTACTS_TABLE_NAME || '';
    const airtableToken = process.env.AIRTABLE_TOKEN || '';
    const config = {
        headers: {
            Authorization: `Bearer ${airtableToken}`,
            'Content-Type': 'application/json',
        },
    };
    try {
        const { name } = req.query;
        if (!name) {
            return res.status(400).json({ error: 'Missing name query parameter' });
        }
        const formula = `FIND(LOWER("${name}"), LOWER({Name})) > 0`;
        const url = `https://api.airtable.com/v0/${searchBaseId}/${encodeURIComponent(searchTable)}?filterByFormula=${encodeURIComponent(formula)}`;
        const response = await axios.get(url, config);
        return res.status(200).json(response.data);
    }
    catch (error) {
        const err = error;
        console.error('API error:', {
            message: err.message,
            config: err.config,
            response: err.response?.data,
        });
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
