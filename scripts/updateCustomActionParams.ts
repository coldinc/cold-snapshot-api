console.log("\u{1F680} Running updateCustomActionParams...");

import "dotenv/config";

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

interface OpenAPISchema {
  paths: Record<string, any>;
}

const rootDir = path.join(__dirname, "..");
const openApiPath = path.join(rootDir, "custom_action_schema.json");
const schemasDir = path.join(rootDir, "schemas");

const tableNames: Record<string, string> = {
  "/api/contacts-index": process.env.AIRTABLE_CONTACTS_TABLE_NAME || "Contacts",
  "/api/log-entries-index": process.env.AIRTABLE_LOGS_TABLE_NAME || "Logs",
  "/api/snapshots-latest": process.env.AIRTABLE_SNAPSHOTS_TABLE_NAME || "Cold Snapshots",
  "/api/threads-index": process.env.AIRTABLE_THREADS_TABLE_NAME || "Threads"
};

const openApi: OpenAPISchema = JSON.parse(fs.readFileSync(openApiPath, "utf8"));

for (const [route, config] of Object.entries(openApi.paths)) {
  if (!config.post) continue;
  const tableName = tableNames[route];
  if (!tableName) {
    console.log(`Skipped ${route} - no table mapping`);
    continue;
  }
  const fileName = `${toCamelCase(tableName)}.schema.json`;
  const schemaFile = path.join(schemasDir, fileName);
  if (!fs.existsSync(schemaFile)) {
    console.log(`Missing schema for ${route}: ${fileName}`);
    continue;
  }
  const newSchema = JSON.parse(fs.readFileSync(schemaFile, "utf8"));
  const reqBodySchema = config.post?.requestBody?.content?.["application/json"]?.schema;
  if (reqBodySchema) {
    // Only update "properties" and "required" if they exist
    if (newSchema.properties) {
      reqBodySchema.properties = newSchema.properties;
      console.log(`Patched properties for ${route} from ${fileName}`);
    }
    if (newSchema.required) {
      reqBodySchema.required = newSchema.required;
      console.log(`Patched required for ${route} from ${fileName}`);
    }
    // Optionally: patch enums, descriptions, etc. if desired
  } else {
    console.log(`Skipped ${route} - no requestBody schema`);
  }
}

// Optionally, repeat for GET/response schemas if you want to patch those as well

fs.writeFileSync(openApiPath, JSON.stringify(openApi, null, 2));
console.log("custom_action_schema.json updated.");
