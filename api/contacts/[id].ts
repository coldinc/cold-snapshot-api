// /api/contacts/[id].ts
const axios = require('axios');

const baseId = process.env.AIRTABLE_BASE_ID;
const contactsTable = process.env.AIRTABLE_CONTACTS_TABLE_NAME;
const apiKey = process.env.AIRTABLE_TOKEN;

module.exports = async function handler(req, res) {
  const { id } = req.query;
  const config = {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  };

  const recordUrl = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(contactsTable)}/${id}`;

  try {
    if (req.method === 'GET') {
      const response = await axios.get(recordUrl, config);
      return res.status(200).json(response.data);
    }

    if (req.method === 'PATCH') {
      const updatedRecord = {
        fields: req.body,
      };
      const response = await axios.patch(recordUrl, updatedRecord, config);
      return res.status(200).json(response.data);
    }

    res.setHeader('Allow', ['GET', 'PATCH']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error('Record error:', {
      message: error.message,
      config: error.config,
      response: error.response?.data,
    });
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};