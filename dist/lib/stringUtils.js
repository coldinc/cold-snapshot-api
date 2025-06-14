"use strict";

// lib/stringUtils.ts
var normalizeString = (str) => str.toLowerCase().replace(/[^a-z0-9]/g, "");
var isMatch = (recordName, query) => normalizeString(recordName).includes(normalizeString(query));
module.exports = { normalizeString, isMatch };
//# sourceMappingURL=stringUtils.js.map