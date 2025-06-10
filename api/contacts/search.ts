const axios = require('axios');

const searchBaseId = process.env.AIRTABLE_BASE_ID;
const searchTable = process.env.AIRTABLE_CONTACTS_TABLE_NAME;
const airtableToken = process.env.AIRTABLE_TOKEN;

function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]/gi, '') // remove non-alphanumeric characters
    .trim();
}

function isMatch(a: string, b: string): boolean {
  return a.includes(b) || b.includes(a);
}

export default async function handler(req: any, res: any) {
  const { name } = req.query;

  if (!name) {
    return res.status(400).json({ error: 'Name query parameter is required' });
  }

  const config = {
    headers: {
      Authorization: `Bearer ${airtableToken}`,
    },
  };

  const url = `https://api.airtable.com/v0/${searchBaseId}/${encodeURIComponent(searchTable)}`;

  try {
    const response = await axios.get(url, config);
    const allRecords = response.data.records;
    const normalizedQuery = normalizeString(name);

    const matchedRecords = allRecords.filter((record: any) => {
      const recordName = record.fields?.Name || '';
      const normalizedRecordName = normalizeString(recordName);
      return isMatch(normalizedRecordName, normalizedQuery);
    });

    if (matchedRecords.length === 0) {
      return res.status(404).json({ error: 'No matching records found' });
    }

    return res.status(200).json({ records: matchedRecords });
  } catch (error: any) {
    console.error('Search API error:', {
      message: error.message,
      config: error.config,
      response: error.response?.data,
    });
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
