// /api/contacts/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const airtableBaseId = process.env.AIRTABLE_BASE_ID;
const tableName = process.env.AIRTABLE_CONTACTS_TABLE_NAME;
const airtableToken = process.env.AIRTABLE_TOKEN;

const airtableUrl = `https://api.airtable.com/v0/${airtableBaseId}/${encodeURIComponent(tableName!)}`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const config = {
    headers: {
      Authorization: `Bearer ${airtableToken}`,
    },
  };

  try {
    if (req.method === 'GET') {
      const response = await axios.get(airtableUrl, config);
      return res.status(200).json(response.data);
    }

    if (req.method === 'POST') {
      const newRecord = {
        records: [
          {
            fields: req.body,
          },
        ],
      };
      const response = await axios.post(airtableUrl, newRecord, config);
      return res.status(201).json(response.data);
    }

    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error: any) {
    console.error('API error:', error.message);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}