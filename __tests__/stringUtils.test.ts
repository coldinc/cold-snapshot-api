const { normalizeString, isMatch } = require('../lib/stringUtils');

describe('normalizeString', () => {
  it('removes non-alphanumeric characters', () => {
    expect(normalizeString('Hello, World!')).toBe('helloworld');
    expect(normalizeString('123-456')).toBe('123456');
  });
});

describe('isMatch', () => {
  it('performs case-insensitive comparisons', () => {
    expect(isMatch('Hello World', 'hello')).toBe(true);
    expect(isMatch('Test', 'TEST')).toBe(true);
  });
});
