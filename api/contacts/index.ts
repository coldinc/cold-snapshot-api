/** @type {(req: any, res: any) => Promise<void>} */
const handler = async (req: any, res: any) => {
  const Airtable = require('airtable');
  const fieldMap = require('../../lib/fieldMap.json');

  const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
    process.env.AIRTABLE_BASE_ID
  );

  const TABLE_NAME = 'Contacts';

  if (req.method === 'POST') {
    try {
      const logicalInput: { [key: string]: any } = req.body;
      const contactsMap: { [key: string]: string } = fieldMap.Contacts;
      const mappedFields: { [key: string]: any } = {};

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
      const records: any[] = await base(TABLE_NAME).select().all();

      const contacts = records.map((record: any) => ({
        id: record.id,
        ...record.fields
      }));

      return res.status(200).json(contacts);
    } catch (error) {
      console.error('[Contacts GET Error]()
