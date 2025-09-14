console.log("🚀 Running generateFieldMap...");

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { config as loadEnv } from "dotenv";
import { ProxyAgent } from "undici";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from `.env` if present, otherwise fall back to
// `.env.example` so that the script can run locally without manual setup.
const envPath = path.join(__dirname, "../.env");
if (fs.existsSync(envPath)) {
  loadEnv({ path: envPath });
} else {
  const examplePath = path.join(__dirname, "../.env.example");
  if (fs.existsSync(examplePath)) {
    loadEnv({ path: examplePath });
  } else {
    // Default to loading from process.env only
    loadEnv();
  }
}
const TABLES = [
  process.env.AIRTABLE_CONTACTS_TABLE_NAME || "Contacts",
  process.env.AIRTABLE_LOGS_TABLE_NAME || "Logs",
  process.env.AIRTABLE_SNAPSHOTS_TABLE_NAME || "Cold Snapshots",
  process.env.AIRTABLE_THREADS_TABLE_NAME || "Threads",
];

// Suffixes that indicate synthetic helper fields returned alongside real
// Airtable fields (e.g. "Linked Contacts ID"). These helpers are not part of
// the Airtable metadata and should be excluded from generated schemas.
const SYNTHETIC_SUFFIXES = [" ID", " IDs", " Name", " Names"]; 

function toCamelCase(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .map((w, i) => {
      const lower = w.toLowerCase();
      return i === 0 ? lower : lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join("");
}

function fieldToSchema(field: any): Record<string, any> {
  const type = field.type;
  const schema: Record<string, any> = {};
  const readOnlyTypes = ["formula", "rollup", "lookup", "createdTime", "lastModifiedTime", "autoNumber", "count"];
  switch (type) {
    case "singleSelect":
      schema.type = "string";
      if (field.options?.choices) {
        schema.enum = field.options.choices.map((c: any) => c.name);
      }
      break;
    case "multipleSelects":
      schema.type = "array";
      schema.items = { type: "string" };
      if (field.options?.choices) {
        schema.items.enum = field.options.choices.map((c: any) => c.name);
      }
      break;
    case "checkbox":
      schema.type = "boolean";
      break;
    case "number":
    case "percent":
    case "currency":
    case "rating":
    case "duration":
    case "count":
      schema.type = "number";
      break;
    case "date":
    case "dateTime":
    case "createdTime":
    case "lastModifiedTime":
      schema.type = "string";
      schema.format = "date-time";
      break;
    case "multipleAttachments":
      schema.type = "array";
      break;
    case "multipleRecordLinks":
      schema.type = "array";
      schema.items = { type: "string", format: "record-id" };
      break;
    case "multipleCollaborators":
      schema.type = "array";
      break;
    default:
      schema.type = "string";
  }
  if (schema.type === "array" && !schema.items) {
    schema.items = { type: "string" };
  }
  // Add readOnly flag for calculated/system fields
  if (readOnlyTypes.includes(type)) {
    schema.readOnly = true;
  }
  return schema;
}

async function main() {
  const token = process.env.AIRTABLE_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID;
  if (!token || !baseId) {
    throw new Error("Missing AIRTABLE_TOKEN or AIRTABLE_BASE_ID environment variables");
  }

  const proxy =
    process.env.HTTPS_PROXY ||
    process.env.https_proxy ||
    process.env.HTTP_PROXY ||
    process.env.http_proxy;
  const dispatcher = proxy ? new ProxyAgent(proxy) : undefined;

  const query = TABLES.map((t) => `tableNames[]=${encodeURIComponent(t)}`).join("&");
  const url = `https://api.airtable.com/v0/meta/bases/${baseId}/tables?${query}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    // cast to any for Node <22 type compatibility
    dispatcher: dispatcher as any,
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch metadata: ${res.status} ${res.statusText}`);
  }
  const data = (await res.json()) as any;
  console.log(
    "Fetched tables:",
    data.tables?.map((t: any) => t.name)
  );

  const schemaDir = path.join(__dirname, "../schemas");
  fs.mkdirSync(schemaDir, { recursive: true });

  // Map Airtable table IDs to their names so we can resolve linked table names
  const tableIdToName: Record<string, string> = {};
  for (const tbl of data.tables || []) {
    tableIdToName[tbl.id] = tbl.name;
  }

  const allMaps: Record<
    string,
    {
      fields: Record<string, string>;
      searchableFields: string[];
      booleanFields: string[];
      linkedRecordFields: Record<string, { linkedTable?: string; isArray: boolean }>;
    }
  > = {};

  const isSearchable = (field: any): boolean => {
    const type = field.type;
    const resultType =
      field.options?.result?.type || field.result?.type || field.options?.resultType;
    const stringResults = new Set([
      "singleLineText",
      "multilineText",
      "richText",
      "string",
    ]);
    if (type === "singleLineText" || type === "multilineText") return true;
    if (type === "formula") return stringResults.has(resultType);
    if (type === "lookup" || type === "rollup") return stringResults.has(resultType);
    return false;
  };
  for (const table of data.tables || []) {
    if (!TABLES.includes(table.name)) continue;
    const mapping: Record<string, string> = {};
    const properties: Record<string, any> = {};
    const searchableFields: string[] = [];
    const booleanFields: string[] = [];
    const linkedRecordFields: Record<string, { linkedTable?: string; isArray: boolean }> = {};
    for (const field of table.fields || []) {
      const lowerName = field.name.toLowerCase();
      const suffix = SYNTHETIC_SUFFIXES.find((s) => lowerName.endsWith(s.toLowerCase()));
      if (suffix) {
        const baseName = field.name.slice(0, -suffix.length);
        const hasBase = (table.fields || []).some((f: any) => f.name === baseName);
        if (hasBase) {
          // Skip synthetic helper fields like "Linked Contacts ID" or "Linked Contacts Names"
          continue;
        }
      }
      const key = toCamelCase(field.name);
      mapping[key] = field.name;
      properties[key] = fieldToSchema(field);
      if (isSearchable(field)) {
        // Include only text-like fields safe for fuzzy search
        searchableFields.push(key);
      }
      if (properties[key].type === "boolean") {
        booleanFields.push(key);
      }
      if (field.type === "multipleRecordLinks") {
        const linkedId = field.options?.linkedTableId;
        linkedRecordFields[key] = {
          linkedTable: linkedId ? tableIdToName[linkedId] : undefined,
          isArray: true,
        };
      }
    }
    allMaps[table.name] = { fields: mapping, searchableFields, booleanFields, linkedRecordFields };
    const schema = {
      $schema: "http://json-schema.org/draft-07/schema#",
      title: table.name,
      type: "object",
      properties
    };
    fs.writeFileSync(path.join(schemaDir, `${toCamelCase(table.name)}.schema.json`), JSON.stringify(schema, null, 2));
  }

  const lines: string[] = [];
  lines.push("// AUTO-GENERATED FILE - DO NOT EDIT DIRECTLY");
  lines.push("// Generated by scripts/generateFieldMap.ts");
  lines.push("");
  lines.push("interface TableFieldMap {");
  lines.push("  fields: { [key: string]: string };");
  lines.push("  searchableFields: string[];");
  lines.push("  booleanFields: string[];");
  lines.push("  linkedRecordFields: Record<string, { linkedTable?: string; isArray: boolean }>;" );
  lines.push("}");
  lines.push("");
  lines.push("function getTableFieldMap(tableName: string): TableFieldMap {");
  lines.push("  switch (tableName) {");

  for (const [table, info] of Object.entries(allMaps)) {
    lines.push(`    case ${JSON.stringify(table)}:`);
    lines.push("      return {");
    lines.push("        fields: {");
    for (const [key, field] of Object.entries(info.fields)) {
      lines.push(`          ${key}: ${JSON.stringify(field)},`);
    }
    lines.push("        },");
    lines.push(`        searchableFields: ${JSON.stringify(info.searchableFields)},`);
    lines.push(`        booleanFields: ${JSON.stringify(info.booleanFields)},`);
    lines.push("        linkedRecordFields: {");
    for (const [key, cfg] of Object.entries(info.linkedRecordFields)) {
      lines.push(
        `          ${key}: { linkedTable: ${JSON.stringify(cfg.linkedTable)}, isArray: ${cfg.isArray} },`
      );
    }
    lines.push("        },");
    lines.push("      };");
  }

  lines.push("    default:");
  lines.push("      return { fields: {}, searchableFields: [], booleanFields: [], linkedRecordFields: {} };");
  lines.push("  }");
  lines.push("}");
  lines.push("");
  lines.push("function getFieldMap(tableName: string): { [key: string]: string } {");
  lines.push("  return getTableFieldMap(tableName).fields;");
  lines.push("}");
  lines.push("");
  lines.push(
    "function filterMappedFields(data: Record<string, any>, fieldMap: Record<string, string>): Record<string, any> {"
  );
  lines.push("  const src = (data as any).fields || data;");
  lines.push("  const result: Record<string, any> = {};");
  lines.push("  for (const [internal, airtable] of Object.entries(fieldMap)) {");
  lines.push("    if (src[internal] !== undefined) {");
  lines.push("      result[airtable] = src[internal];");
  lines.push("    } else if (src[airtable] !== undefined) {");
  lines.push("      result[airtable] = src[airtable];");
  lines.push("    }");
  lines.push("  }");
  lines.push("  return result;");
  lines.push("}");
  lines.push("");
  lines.push("export { getTableFieldMap, getFieldMap, filterMappedFields };");

  const outputPath = path.join(__dirname, "../api/resolveFieldMap.ts");
  fs.writeFileSync(outputPath, lines.join("\n"));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
