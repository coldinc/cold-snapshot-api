const fieldMap: Record<string, Record<string, string>> = {
  Contacts: {
    name: "Name",
    email: "Email",
    role: "Role",
    company: "Company",
    notes: "Notes",
    relationshipStrength: "Relationship Strength",
    patternMatches: "Pattern Matches",
    linkedExperiments: "Linked Experiments",
    tags: "Tags",
  },
  "Log Entries": {
    date: "Date",
    summary: "Summary",
    content: "Content",
    logType: "Log Type",
    tags: "Tags",
    contacts: "Contacts (Linked)",
  },
  Snapshots: {
    date: "Date",
    summary: "Summary",
    content: "Content",
    keyUpdates: "Key Updates",
    phaseId: "Phase ID",
  },
  Threads: {
    date: "Date",
    summary: "Summary",
    content: "Content",
    threadType: "Thread Type",
    tags: "Tags",
    linkedExperiments: "Linked Experiments",
    contacts: "Contacts (Linked)",
  },
};

function getFieldMap(tableName: string): Record<string, string> {
  return fieldMap[tableName] || {};
}

function filterMappedFields(
  tableName: string,
  inputFields: Record<string, any>
): Record<string, any> {
  const map = getFieldMap(tableName);
  const filtered: Record<string, any> = {};

  for (const key in inputFields) {
    if (map[key]) {
      filtered[map[key]] = inputFields[key];
    }
  }

  return filtered;
}

module.exports = {
  getFieldMap,
  filterMappedFields,
};
