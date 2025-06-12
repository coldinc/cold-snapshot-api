/** @type {(req: any, res: any) => Promise<void>} */
const handler = async (req: any, res: any) => {
  const Airtable = require('airtable');
  const fieldMap = require('../../lib/fieldMap.json');

  const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
    process.env.AIRTABLE_BASE_ID
  );

  const TABLE_NAME = 'Logs';

  if (req.method === 'POST') {
    try {
      const logicalInput: { [key: string]: any } = req.body;
      const logsMap: { [key: string]: string } = fieldMap.Logs;
      const mappedFields: { [key: string]: any } = {};

      for (const [key, value] of Object.entries(logicalInput)) {
        const fieldId = logsMap[key];
        if (fieldId) {
          mappedFields[fieldId] = value;
        } else {
          console.warn(`Unmapped field: ${key}`);
        }
      }

      if (!mappedFields[logsMap['Log Type']] || !mappedFields[logsMap['Content']]) {
        return res.status(400).json({
          error: 'Missing required fields: Log Type and/or Content'
        });
      }

      const createdRecords = await base(TABLE_NAME).create([
        { fields: mappedFields }
      ]);

      return res.status(201).json({
        message: 'Log entry created successfully',
        id: createdRecords[0].id
      });
    } catch (error) {
      console.error('[Logs POST Error]', error);
      return res.status(500).json({ error: 'Failed to create log entry' });
    }
  }

  if (req.method === 'GET') {
    try {
      const records: any[] = await base(TABLE_NAME).select().all();

      const logs = records.map((record: any) => ({
        id: record.id,
        ...record.fields
      }));

      return res.status(200).json(logs);
    } catch (error) {
      console.error('[Logs GET Error]', error);
      return res.status(500).json({ error: 'Failed to fetch log entries' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
};

module.exports = handler;
