import type { NextApiRequest, NextApiResponse } from 'next';
import Airtable from 'airtable';
import fieldMap from '../../lib/fieldMap.json';

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
  process.env.AIRTABLE_BASE_ID as string
);

const TABLE_NAME = 'Contacts';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const logicalInput = req.body;
      const mappedFields: { [key: string]: any } = {};

      // Safely map logical keys to Airtable field IDs
      for (const [key, value] of Object.entries(logicalInput)) {
        const fieldId = (fieldMap.contacts || fieldMap)[key];
        if (fieldId) {
          mappedFields[fieldId] = value;
        } else {
          console.warn(`Field "${key}" not found in fieldMap — skipping`);
        }
      }

      // Basic validation
      if (!mappedFields || !Object.values(mappedFields).length) {
        return res.status(400).json({ error: 'No valid fields provided in request body' });
      }

      const createdRecord = await base(TABLE_NAME).create([{ fields: mappedFields }]);

      return res.status(201).json({
        message: 'Contact created successfully',
        id: createdRecord[0].id
      });
    } catch (error: any) {
      console.error('[Contacts POST Error]', error);
      return res.status(500).json({ error: 'Failed to create contact' });
    }
  }

  if (req.method === 'GET') {
    try {
      const records = await base(TABLE_NAME).select().all();

      const contacts = records.map((record) => ({
        id: record.id,
        ...record.fields
      }));

      return res.status(200).json(contacts);
    } catch (error: any) {
      console.error('[Contacts GET Error]', error);
      return res.status(500).json({ error: 'Failed to fetch contacts' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
