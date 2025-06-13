import axios from 'axios';

const airtableBaseId = process.env.AIRTABLE_BASE_ID;
const logsTableName = process.env.AIRTABLE_LOGS_TABLE_NAME;
const airtableToken = process.env.AIRTABLE_TOKEN;

export default async function handler(req: any, res: any) {
  const { summary, contactId, tags, logType, startDate, endDate } = req.query;

  const filters: string[] = [];

  if (summary && typeof summary === 'string') {
    const summaryFormula = `OR(FIND(LOWER(\"${summary.toLowerCase()}\"), LOWER({Summary})), FIND(LOWER(\"${summary.toLowerCase()}\"), LOWER({Content})))`;
    filters.push(summaryFormula);
  }

  if (contactId && typeof contactId === 'string') {
    filters.push(`FIND(\"${contactId}\", ARRAYJOIN({Contacts (Linked)}))`);
  }

  if (tags && Array.isArray(tags)) {
    const tagFilters = tags.map(tag => `FIND(\"${tag}\", ARRAYJOIN({Tags}))`);
    filters.push(...tagFilters);
  }

  if (logType && typeof logType === 'string') {
    filters.push(`{Log Type} = \"${logType}\"`);
  }

  if (startDate && endDate) {
    filters.push(`AND(IS_AFTER({Date}, \"${startDate}\"), IS_BEFORE({Date}, \"${endDate}\"))`);
  } else if (startDate) {
    filters.push(`IS_AFTER({Date}, \"${startDate}\")`);
  } else if (endDate) {
    filters.push(`IS_BEFORE({Date}, \"${endDate}\")`);
  }

  const formula = filters.length > 0 ? `AND(${filters.join(',')})` : '';
  const url = `https://api.airtable.com/v0/${airtableBaseId}/${encodeURIComponent(logsTableName!)}${formula ? `?filterByFormula=${encodeURIComponent(formula)}` : ''}`;

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
