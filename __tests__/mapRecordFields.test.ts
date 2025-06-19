import { mapInternalToAirtable, mapAirtableToInternal } from '../src/lib/mapRecordFields.ts';

describe('mapInternalToAirtable', () => {
  it('maps internal keys to Airtable field names', () => {
    const fieldMap = { name: 'Name', age: 'Age' };
    const input = { name: 'Tom', age: 30, extra: 'ignore' };
    expect(mapInternalToAirtable(input, fieldMap)).toEqual({ Name: 'Tom', Age: 30 });
  });
});

describe('mapAirtableToInternal', () => {
  it('maps Airtable record fields to internal keys and includes id', () => {
    const fieldMap = { name: 'Name', age: 'Age', missing: 'Missing' };
    const record = { id: 'rec1', fields: { Name: 'Tom', Age: 30 } };
    expect(mapAirtableToInternal(record, fieldMap)).toEqual({ id: 'rec1', name: 'Tom', age: 30, missing: null });
  });
});
