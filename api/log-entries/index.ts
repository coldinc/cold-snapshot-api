import type { NextApiRequest, NextApiResponse } from 'next';
import Airtable from 'airtable';
import { getFieldMap, filterMappedFields } from '../../lib/resolveFieldMap';

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY! }).base(
  process.env.AIRTABLE_BASE_ID!
);

const TABLE_NAME = 'Logs';
const fieldMap = getFieldMap(TABLE_NAME);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const input = req.body;

    // Validate required fields
    if (!input['Log Type'] || !input['Content']) {
      return res.status(400).json({ error: 'Missing required fields: Log Type and/or Content' });
    }

    const airtableFields = filterMappedFields(input, TABLE_NAME);

    const createdRecord = await base(TABLE_NAME).create([{ fields: airtableFields }]);

    res.status(201).json({ id: createdRecord[0].id, fields: createdRecord[0].fields });
  } catch (error: any) {
    console.error('[Logs POST Error]', error);
    res.status(500).json({ error: error.message || 'Unknown error' });
  }
}
