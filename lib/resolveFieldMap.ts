// This file is auto-generated. Run yarn generate:fieldmap to refresh.

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
        contacts: "Contacts (Linked)",
        threadId: "Thread ID"
      };
    case "Cold Snapshots":
      return {
        date: "Date",
        content: "Snapshot Markdown",
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

module.exports = { getFieldMap };
