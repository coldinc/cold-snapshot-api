import axios from 'axios';

const baseId = process.env.AIRTABLE_BASE_ID;
const tableName = process.env.AIRTABLE_CONTACTS_TABLE_NAME;
const token = process.env.AIRTABLE_TOKEN;

const airtableUrl = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`;
const config = {
  headers: {
    Authorization: `Bearer ${token}`,
  },
};

// Utility: Normalize string input for flexible matching
function normalizeString(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function isMatch(input: string, target: string): boolean {
  return normalizeString(input) === normalizeString(target);
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name } = req.query;

  if (!name) {
    return res.status(400).json({ error: 'Missing name parameter' });
  }

  try {
    const response = await axios.get(airtableUrl, config);
    const matchingRecords = response.data.records.filter((record: any) =>
      record.fields?.Name && isMatch(record.fields.Name, name as string)
    );

    return res.status(200).json({ results: matchingRecords });
  } catch (error: any) {
    console.error('Search error:', {
      message: error.message,
      config: error.config,
      response: error.response?.data,
    });
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
