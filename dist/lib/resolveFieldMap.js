"use strict";

// lib/resolveFieldMap.ts
function getFieldMap(tableName) {
  switch (tableName) {
    case "Contacts":
      return {
        name: "Name",
        role: "Role",
        organisation: "Organisation",
        email: "Email",
        tags: "Tags",
        notes: "Notes"
      };
    case "Logs":
      return {
        date: "Date",
        summary: "Summary",
        content: "Content",
        tags: "Tags",
        logType: "Log Type",
        contacts: "Contacts",
        threadId: "Thread ID"
      };
    case "Snapshots":
      return {
        title: "Title",
        date: "Date",
        content: "Content",
        keyUpdates: "Key Updates",
        phaseId: "Phase ID"
      };
    case "Threads":
      return {
        title: "Title",
        summary: "Summary",
        content: "Content",
        tags: "Tags",
        date: "Date",
        contacts: "Contacts",
        experiments: "Experiments",
        outputs: "Outputs"
      };
    default:
      return {};
  }
}
function filterMappedFields(fields, tableName) {
  const fieldMap = getFieldMap(tableName);
  const mapped = {};
  for (const internalKey in fieldMap) {
    const airtableField = fieldMap[internalKey];
    if (fields[airtableField] !== void 0) {
      mapped[internalKey] = fields[airtableField];
    }
  }
  return mapped;
}
module.exports = {
  getFieldMap,
  filterMappedFields
};
//# sourceMappingURL=resolveFieldMap.js.map