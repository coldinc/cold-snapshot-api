// /api/contacts/search.ts
import axios from 'axios';
import { VercelRequest, VercelResponse } from '@vercel/node';

const searchBaseId = process.env.AIRTABLE_BASE_ID;
const searchTable = process.env.AIRTABLE_CONTACTS_TABLE_NAME;
const airtableToken = process.env.AIRTABLE_TOKEN;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const config = {
    headers: {
      Authorization: `Bearer ${airtableToken}`,
    },
  };

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const name = req.query.name as string;
    if (!name) {
      return res.status(400).json({ error: 'Missing name query parameter' });
    }

    const formula = `FIND(LOWER("${name}"), LOWER({Name}))`;
    const url = `https://api.airtable.com/v0/${searchBaseId}/${encodeURIComponent(
      searchTable || ''
    )}?filterByFormula=${encodeURIComponent(formula)}`;

    const response = await axios.get(url, config);
    return res.status(200).json(response.data);
  } catch (error: any) {
    console.error('Search error:', {
      message: error.message,
      config: error.config,
      response: error.response?.data,
    });
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}