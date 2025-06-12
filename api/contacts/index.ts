import fieldMap from '../../../lib/fieldMap.json';
import axios from 'axios';

export default async function handler(req: any, res: any) {
  const airtableBaseId = process.env.AIRTABLE_BASE_ID || '';
  const tableName = process.env.AIRTABLE_CONTACTS_TABLE_NAME || '';
  const airtableToken = process.env.AIRTABLE_TOKEN || '';

  const airtableUrl = `https://api.airtable.com/v0/${airtableBaseId}/${encodeURIComponent(tableName)}`;
  
  const transformFieldsToFieldIds = (input: Record<string, any>) => {
  const transformed: Record<string, any> = {};
  for (const key in input) {
    const fieldId = (fieldMap.contacts as Record<string, string>)[key] || key;
    transformed[fieldId] = input[key];
  }
  return transformed;
};
  
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
    } else if (req.method === 'POST') {
      const transformedFields = transformFieldsToFieldIds(req.body);
      const newRecord = {
        records: [{ fields: transformedFields }],
      };
      const response = await axios.post(airtableUrl, newRecord, config);
      return res.status(201).json(response.data);
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
