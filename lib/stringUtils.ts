const normalizeString = (str: string): string =>
  str.toLowerCase().replace(/[^a-z0-9]/g, "");

const isMatch = (recordName: string, query: string): boolean =>
  normalizeString(recordName).includes(normalizeString(query));

module.exports = { normalizeString, isMatch };

