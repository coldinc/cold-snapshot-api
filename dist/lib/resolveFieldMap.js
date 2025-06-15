"use strict";

// lib/resolveFieldMap.ts
function getFieldMap(tableName) {
  switch (tableName) {
    case "Contacts":
      return {
        Name: "name",
        Role: "role",
        Organisation: "organisation",
        Email: "email",
        Tags: "tags",
        Notes: "notes"
      };
    case "Logs":
      return {
        Date: "date",
        Summary: "summary",
        Content: "content",
        Tags: "tags",
        "Log Type": "logType",
        Contacts: "contacts"
      };
    case "Snapshots":
      return {
        Title: "title",
        Date: "date",
        Content: "content",
        "Key Updates": "keyUpdates",
        "Phase ID": "phaseId"
      };
    case "Threads":
      return {
        Title: "title",
        Summary: "summary",
        Content: "content",
        Tags: "tags",
        Date: "date",
        Contacts: "contacts",
        Experiments: "experiments",
        Outputs: "outputs"
      };
    default:
      return {};
  }
}
function filterMappedFields(fields, tableName) {
  const fieldMap = getFieldMap(tableName);
  const mapped = {};
  for (const key in fields) {
    if (fieldMap[key]) {
      mapped[fieldMap[key]] = fields[key];
    }
  }
  return mapped;
}
module.exports = {
  getFieldMap,
  filterMappedFields
};
//# sourceMappingURL=resolveFieldMap.js.map