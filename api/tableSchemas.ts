import contacts from "../schemas/contacts.schema.json" assert { type: "json" };
import logs from "../schemas/logs.schema.json" assert { type: "json" };
import coldSnapshots from "../schemas/coldSnapshots.schema.json" assert { type: "json" };
import threads from "../schemas/threads.schema.json" assert { type: "json" };

interface TableSchema {
  properties?: Record<string, any>;
}

function getTableSchema(tableName: string): TableSchema {
  switch (tableName) {
    case "Contacts":
      return contacts as TableSchema;
    case "Logs":
      return logs as TableSchema;
    case "Cold Snapshots":
      return coldSnapshots as TableSchema;
    case "Threads":
      return threads as TableSchema;
    default:
      return { properties: {} };
  }
}

function getBooleanFields(tableName: string): string[] {
  const schema = getTableSchema(tableName);
  const props = schema.properties || {};
  return Object.entries(props)
    .filter(([, val]) => (val as any).type === "boolean")
    .map(([key]) => key);
}

function getSearchableTextFields(tableName: string): string[] {
  const schema = getTableSchema(tableName);
  const props = schema.properties || {};
  const result: string[] = [];
  for (const [key, val] of Object.entries(props)) {
    const v = val as any;
    if (v.type !== "string") continue;
    if (v.readOnly) continue;
    if (v.format === "date-time") continue;
    const name = key.toLowerCase();
    if (name === "id" || name.endsWith("id") || name.includes("date")) continue;
    result.push(key);
  }
  return result;
}

export { getTableSchema, getBooleanFields, getSearchableTextFields };
