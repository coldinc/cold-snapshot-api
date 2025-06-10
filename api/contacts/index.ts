// /api/contacts/index.ts
const axios = require('axios');

const airtableBaseId = process.env.AIRTABLE_BASE_ID;
const tableName = process.env.AIRTABLE_CONTACTS_TABLE_NAME;
const airtableToken = process.env.AIRTABLE_TOKEN;

const airtableUrl = `https://api.airtable.com/v0/${airtableBaseId}/${encodeURIComponent(tableName)}`;

module.exports = async function handler(req, res) {
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
            const airtableFieldMap = {
  "Pattern___Match:___Archetype": "Pattern Match: Archetype",
  "Pattern___Match:___Collaboration": "Pattern Match: Collaboration",
  "Relationship___Strength": "Relationship Strength",
  "Relationship___Type": "Relationship Type"
  // Add others if needed
};

const transformedFields = {};
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

          },
        ],
      };
      const response = await axios.post(airtableUrl, newRecord, config);
      return res.status(201).json(response.data);
    }

    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error('API error:', {
      message: error.message,
      config: error.config,
      response: error.response?.data,
    });
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};