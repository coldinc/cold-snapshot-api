const Airtable = require('airtable');
const fieldMap = require('../../lib/fieldMap.json');

/**
 * @typedef {import('@vercel/node').VercelRequest} VercelRequest
 * @typedef {import('@vercel/node').VercelResponse} VercelResponse
 */

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
  process.env.AIRTABLE_BASE_ID
);

const TABLE_NAME = 'Contacts';

/**
 * @param {VercelRequest} req
 * @param {VercelResponse} res
 */
const handler = async (req, res) => {
  if (req.method === 'POST') {
    try {
      const logicalInput = req.body;
      const contactsMap = /** @type {{ [key: string]: string }} */ (fieldMap.Contacts);
      const mappedFields = /** @type {{ [key: string]: any }} */ ({});

      for (const [key, value] of Object.entries(logicalInput)) {
        const fieldId = contactsMap[key];
        if (fieldId) {
          mappedFields[fieldId] = value;
        } else {
          console.warn(`Unmapped field: ${key}`);
        }
      }

      if (!mappedFields[contactsMap['Name']]) {
        return res.status(400).json({ error: 'Missing required field: Name' });
      }

      const createdRecords = await base(TABLE_NAME).create([
        { fields: mappedFields }
      ]);

      return res.status(201).json({
        message: 'Contact created successfully',
        id: createdRecords[0].id
      });
    } catch (error) {
      console.error('[Contacts POST Error]', error);
      return res.status(500).json({ error: 'Failed to create contact' });
    }
  }

  if (req.method === 'GET') {
    try {
      const records = await base(TABLE_NAME).select().all();

      const contacts = records.map(
        /** @param {{ id: string, fields: any }} record */ (record) => ({
          id: record.id,
          ...record.fields
        })
      );

      return res.status(200).json(contacts);
    } catch (error) {
      console.error('[Contacts GET Error]', error);
      return res.status(500).json({ error: 'Failed to fetch contacts' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
};

module.exports = handler;
