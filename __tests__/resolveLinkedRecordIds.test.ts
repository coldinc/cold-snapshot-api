import { jest } from '@jest/globals';
import { resolveLinkedRecordIds } from '../api/resolveLinkedRecordIds';
import { airtableSearch } from '../api/airtableSearch';

jest.mock('../api/airtableSearch', () => ({
  airtableSearch: jest.fn(),
}));

describe('resolveLinkedRecordIds', () => {
  it('converts display names to record ids', async () => {
    (airtableSearch as jest.Mock).mockResolvedValueOnce([{ id: 'rec123' }]);
    const result = await resolveLinkedRecordIds('Contacts', { linkedLogs: ['Log A'] });
    expect(result.linkedLogs).toEqual(['rec123']);
  });
});
