function getFieldMap(tableName: string): { [key: string]: string } {
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

function filterMappedFields(fields: Record<string, any>, tableName: string): Record<string, any> {
  const fieldMap = getFieldMap(tableName);
  const mapped: Record<string, any> = {};
  for (const internalKey in fieldMap) {
    const airtableField = fieldMap[internalKey];
    if (fields[airtableField] !== undefined) {
      mapped[internalKey] = fields[airtableField];
    }
  }
  return mapped;
}

module.exports = {
  getFieldMap,
  filterMappedFields
};
