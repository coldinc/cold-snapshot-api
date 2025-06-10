// /api/contacts/search.ts
import axios from 'axios';

const airtableToken = process.env.AIRTABLE_TOKEN;
const airtableBaseId = process.env.AIRTABLE_BASE_ID;
const tableName = process.env.AIRTABLE_CONTACTS_TABLE_NAME;

const normalize = (str: string): string => {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '') // Remove non-alphanumeric characters
    .trim();
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name } = req.query;

  if (!name) {
    return res.status(400).json({ error: 'Missing required query parameter: name' });
  }

  if (!airtableBaseId || !tableName) {
    return res.status(500).json({ error: 'Missing Airtable configuration values' });
  }

  const normalizedInput = normalize(name as string);
  const url = `https://api.airtable.com/v0/${airtableBaseId}/${encodeURIComponent(tableName)}`;

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${airtableToken}`,
      },
    });

    const matchedRecords = response.data.records.filter((record: any) => {
      const recordName = record.fields.Name || '';
      return normalize(recordName) === normalizedInput;
    });

    if (matchedRecords.length === 0) {
      return res.status(404).json({ message: 'No matching contacts found' });
    }

    return res.status(200).json(matchedRecords[0]);
  } catch (error: any) {
    console.error('API error:', {
      message: error.message,
      config: error.config,
      response: error.response?.data,
    });
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
