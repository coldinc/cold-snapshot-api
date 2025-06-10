// /api/contacts/search.ts
import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const searchBaseId = process.env.AIRTABLE_BASE_ID;
const searchTable = process.env.AIRTABLE_CONTACTS_TABLE_NAME;
const searchToken = process.env.AIRTABLE_API_KEY;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { name } = req.query;
  const config = {
    headers: {
      Authorization: `Bearer ${searchToken}`,
    },
  };

  const formula = `FIND(LOWER('${name}'), LOWER({Name}))`;
  const url = `https://api.airtable.com/v0/${searchBaseId}/${encodeURIComponent(searchTable!)}?filterByFormula=${encodeURIComponent(formula)}`;

  try {
    const response = await axios.get(url, config);
    return res.status(200).json(response.data);
  } catch (error: any) {
    console.error('Search error:', error.message);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
