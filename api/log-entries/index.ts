// /api/log-entries/index.ts

const axios = require('axios');

const airtableBaseId = process.env.AIRTABLE_BASE_ID;
const tableName = process.env.AIRTABLE_LOGS_TABLE_NAME;
const airtableToken = process.env.AIRTABLE_TOKEN;

const airtableUrl = `https://api.airtable.com/v0/${airtableBaseId}/${encodeURIComponent(tableName)}`;

module.exports = async function handler(req: any, res: any) {
  const config = {
    headers: {
      Authorization: `Bearer ${airtableToken}`,
      'Content-Type': 'application/json',
    },
  };

  const airtableFieldMap: Record<string, string> = {
    "Log___Type": "Log Type",
    "Content": "Content",
    "Summary": "Summary",
    "Date": "Date",
    "Tags": "Tags",
    "Follow__Up___Needed": "Follow-up Needed",
    "Follow__Up___Notes": "Follow-up Notes",
    "Related___Output": "Related Output",
    "Contacts___(Linked)": "Contacts (Linked)",
  };

  try {
    if (req.method === 'GET') {
      const response = await axios.get(airtableUrl, config);
      return res.status(200).json(response.data);
    }

    if (req.method === 'POST') {
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
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error: any) {
    console.error('API error:', {
      message: error.message,
      config: error.config,
      response: error.response?.data,
    });
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
