import axios from 'axios';

const airtableBaseId = process.env.AIRTABLE_BASE_ID;
const logsTableName = process.env.AIRTABLE_LOGS_TABLE_NAME;
const airtableToken = process.env.AIRTABLE_TOKEN;

export default async function handler(req: any, res: any) {
  const { summary } = req.query;
  if (!summary || typeof summary !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid summary parameter' });
  }

  const formula = `FIND(LOWER("${summary.toLowerCase()}"), LOWER({Summary}))`;
  const url = `https://api.airtable.com/v0/${airtableBaseId}/${encodeURIComponent(logsTableName!)}?filterByFormula=${encodeURIComponent(formula)}`;

  const config = {
    headers: {
      Authorization: `Bearer ${airtableToken}`,
      'Content-Type': 'application/json',
    },
  };

  try {
    const response = await axios.get(url, config);
    return res.status(200).json(response.data);
  } catch (error: any) {
    console.error('API error:', {
      message: error.message,
      config: error.config,
      response: error.response?.data,
    });
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
