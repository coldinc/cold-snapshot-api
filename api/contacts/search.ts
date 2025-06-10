// /api/contacts/search.ts
import axios from 'axios';

const searchBaseId = process.env.AIRTABLE_BASE_ID;
const searchTable = process.env.AIRTABLE_CONTACTS_TABLE_NAME;
const airtableToken = process.env.AIRTABLE_TOKEN;

if (!searchBaseId || !searchTable || !airtableToken) {
  throw new Error('Missing required Airtable environment variables');
}

const config = {
  headers: {
    Authorization: `Bearer ${airtableToken}`,
  },
};

// Utility function to normalize names for comparison
function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]/gi, '') // Remove non-alphanumeric
    .trim();
}

// Fuzzy match using normalization
function isMatch(input: string, recordName: string): boolean {
  return normalizeString(recordName).includes(normalizeString(input));
}

export default async function handler(req: any, res: any) {
  try {
    const rawName = req.query.name;
    const name = typeof rawName === 'string' ? rawName : '';

    if (!name) {
      return res.status(400).json({ error: 'Name query parameter is required' });
    }

    const url = `https://api.airtable.com/v0/${searchBaseId}/${encodeURIComponent(searchTable)}`;
    const response = await axios.get(url, config);

    const matchingRecords = response.data.records.filter((record: any) => {
      const recordName = record.fields['Name'];
      return recordName && isMatch(name, recordName);
    });

    return res.status(200).json({ matches: matchingRecords });
  } catch (error: any) {
    console.error('API error:', {
      message: error.message,
      config: error.config,
      response: error.response?.data,
    });
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
