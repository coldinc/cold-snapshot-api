// This file is auto-generated. Run yarn generate:fieldmap to refresh.

function getFieldMap(tableName: string): { [key: string]: string } {
  switch (tableName) {
    case "Contacts":
      return {
        name: "Name",
        role: "Role",
        company: "Company",
        website: "Website",
        overview: "Overview",
        relationshipType: "Relationship Type",
        patternMatchCollaboration: "Pattern Match: Collaboration",
        patternMatchArchetype: "Pattern Match: Archetype",
        id: "ID",
        lastModified: "Last Modified",
        created: "Created",
      };
    case "Logs":
      return {
        logType: "Log Type",
        content: "Content",
        summary: "Summary",
        createdAt: "Created At",
        lastModified: "Last Modified",
        logId: "Log ID",
      };
    case "Cold Snapshots":
      return {
        snapshotMarkdown: "Snapshot Markdown",
        date: "Date",
        keyUpdates: "Key Updates",
        phaseId: "Phase ID",
        id: "ID",
        created: "Created",
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
        createdDate: "Created Date",
        lastModified: "Last Modified",
        threadId: "Thread ID",
      };
    default:
      return {};
  }
}

module.exports = { getFieldMap };