import type { NextApiRequest, NextApiResponse } from 'next';
import Airtable from 'airtable';
import { getFieldMap } from '../../lib/resolveFieldMap';

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
  process.env.AIRTABLE_BASE_ID as string
);

const logsMap = getFieldMap('Cold Logs');
const contactsMap = getFieldMap('Cold Contacts');

export default async function synthesizeCurrentState(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // Step 1: Fetch recent logs (last 14 days)
    const logsRecords = await base('Cold Logs')
      .select({
        filterByFormula: `IS_AFTER({${logsMap['Date']}}, DATEADD(TODAY(), -14, 'days'))`,
        sort: [{ field: logsMap['Date'], direction: 'desc' }],
        maxRecords: 25,
      })
      .all();

    const logsSummary = logsRecords.map((record) => ({
      id: record.id,
      date: record.fields[logsMap['Date']],
      type: record.fields[logsMap['Log Type']],
      summary: record.fields[logsMap['Summary']],
      content: record.fields[logsMap['Content']],
    }));

    // Step 2: Fetch active contacts (strong, warm, or needing followup)
    const contactFilter = `OR(
      {${contactsMap['Relationship Strength']}} = 'Strong',
      {${contactsMap['Relationship Strength']}} = 'Warm',
      {${contactsMap['Followup Needed']}} = TRUE()
    )`;

    const contactsRecords = await base('Cold Contacts')
      .select({
        filterByFormula: contactFilter,
        maxRecords: 50,
      })
      .all();

    const contactsSummary = contactsRecords.map((record) => ({
      id: record.id,
      name: record.fields[contactsMap['Name']],
      company: record.fields[contactsMap['Company']],
      role: record.fields[contactsMap['Role']],
      relationship: record.fields[contactsMap['Relationship Strength']],
      followupDate: record.fields[contactsMap['Next Followup Date']],
      followupSummary: record.fields[contactsMap['Followup Summary']],
    }));

    // Step 3: Compose payload
    const response = {
      logsSummary,
      contactsSummary,
      emergingPatterns: [], // Optionally computed later by GPT
      currentPhase: 'P1-B4', // Eventually make dynamic
      lastUpdated: new Date().toISOString(),
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('[SYNTHESIZE STATE ERROR]', error);
    return res.status(500).json({ error: 'Failed to synthesize current state' });
  }
}
