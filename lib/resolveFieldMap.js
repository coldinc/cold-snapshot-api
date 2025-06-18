// lib/resolveFieldMap.ts
function getFieldMap(tableName) {
  switch (tableName) {
    case "Cold Snapshots":
      return {
        date: "Date",
        phaseId: "Phase ID",
        snapshotMarkdown: "Snapshot Markdown",
        keyUpdates: "Key Updates",
        id: "ID",
        created: "Created"
      };
    case "Contacts":
      return {
        name: "Name",
        role: "Role",
        company: "Company",
        website: "Website",
        linkedin: "LinkedIn",
        overview: "Overview",
        email: "Email",
        source: "Source",
        relationshipType: "Relationship Type",
        relationshipStrength: "Relationship Strength",
        status: "Status",
        patternMatchCollaboration: "Pattern Match: Collaboration",
        patternMatchArchetype: "Pattern Match: Archetype",
        importedTable: "Imported table",
        followupNeeded: "Followup Needed",
        nextFollowupDate: "Next Followup Date",
        followupSummary: "Followup Summary",
        latestRelatedLog: "Latest Related Log",
        id: "ID",
        lastModified: "Last Modified",
        logs: "Logs",
        threads: "Threads",
        created: "Created"
      };
    case "Logs":
      return {
        summary: "Summary",
        contactsLinked: "Contacts (Linked)",
        linkedContactId: "Linked Contact ID",
        logType: "Log Type",
        date: "Date",
        content: "Content",
        followupNeeded: "Followup Needed",
        followupNotes: "Followup Notes",
        tags: "Tags",
        relatedOutput: "Related Output",
        logId: "Log ID",
        author: "Author",
        createdAt: "Created At",
        lastModified: "Last Modified",
        contacts: "Contacts",
        threadLinked: "Thread (Linked)",
        threadId: "Thread ID"
      };
    case "Threads":
      return {
        name: "Name",
        type: "Type",
        status: "Status",
        description: "Description",
        associatedContacts: "Associated Contacts",
        contactId: "Contact ID",
        associatedLogs: "Associated Logs",
        logId: "Log ID",
        linkToOutputs: "Link to Outputs",
        createdDate: "Created Date",
        lastModified: "Last Modified",
        threadId: "Thread ID"
      };
    default:
      return {};
  }
}
function filterMappedFields(data, fieldMap) {
  const src = data.fields || data;
  const result = {};
  for (const [internal, airtable] of Object.entries(fieldMap)) {
    if (src[internal] !== void 0) {
      result[airtable] = src[internal];
    } else if (src[airtable] !== void 0) {
      result[airtable] = src[airtable];
    }
  }
  return result;
}
export {
  filterMappedFields,
  getFieldMap
};
//# sourceMappingURL=resolveFieldMap.js.map