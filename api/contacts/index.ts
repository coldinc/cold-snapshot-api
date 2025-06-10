import axios from 'axios';

export default async function handler(req: any, res: any) {
  const airtableBaseId = process.env.AIRTABLE_BASE_ID || '';
  const tableName = process.env.AIRTABLE_CONTACTS_TABLE_NAME || '';
  const airtableToken = process.env.AIRTABLE_TOKEN || '';

  const airtableUrl = `https://api.airtable.com/v0/${airtableBaseId}/${encodeURIComponent(tableName)}`;

  const config = {
    headers: {
      Authorization: `Bearer ${airtableToken}`,
      'Content-Type': 'application/json',
    },
  };

  try {
    if (req.method === 'GET') {
      const response = await axios.get(airtableUrl, config);
      return res.status(200).json(response.data);
    }

    if (req.method === 'POST') {
      // Field key mappings for Airtable compatibility
      const airtableFieldMap: Record<string, string> = {
        "Pattern___Match:___Archetype": "Pattern Match: Archetype",
        "Pattern___Match:___Collaboration": "Pattern Match: Collaboration",
        "Relationship___Strength": "Relationship Strength",
        "Relationship___Type": "Relationship Type",
        // Add others as needed
      };

      const transformedFields: Record<string, any> = {};
      for (const key in req.body) {
        const airtableKey = airtableFieldMap[key] || key;
        transformedFields[airtableKey] = req.body[key];
      }

      const newRecord = {
        records: [
          {
            fields: transformedFields,
          },
        ],
      };

      const response = await axios.post(airtableUrl, newRecord, config);
      return res.status(201).json(response.data);
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    const err = error as any;
    console.error('API error:', {
      message: err.message,
      config: err.config,
      response: err.response?.data,
    });
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
