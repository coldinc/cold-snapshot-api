// /api/contacts/search.ts
import axios from 'axios';

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '') // remove non-alphanumeric characters
    .trim();
}

export default async function handler(req: any, res: any) {
  const searchBaseId = process.env.AIRTABLE_BASE_ID;
  const searchTable = encodeURIComponent(process.env.AIRTABLE_CONTACTS_TABLE_NAME || 'Contacts');
  const airtableToken = process.env.AIRTABLE_TOKEN;

  if (!searchBaseId || !searchTable || !airtableToken) {
    return res.status(500).json({ error: 'Missing required environment variables' });
  }

  const name = req.query.name as string;
  if (!name) {
    return res.status(400).json({ error: 'Name query parameter is required' });
  }

  const normalizedName = normalizeName(name);

  const url = `https://api.airtable.com/v0/${searchBaseId}/${searchTable}?filterByFormula=SEARCH("${normalizedName}", SUBSTITUTE(LOWER({Name}), " ", ""))`;

  const config = {
    headers: {
      Authorization: `Bearer ${airtableToken}`,
    },
  };

  try {
    const response = await axios.get(url, config);
    return res.status(200).json(response.data);
  } catch (error: any) {
    console.error('API error:', {
      message: error.message,
      config: error.config,
      response: error.response?.data,
    });
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
