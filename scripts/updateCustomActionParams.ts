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
    // Merge properties, preserving manual field-level descriptions (and any other extra keys)
    reqBodySchema.properties = reqBodySchema.properties || {};
    for (const [key, newProp] of Object.entries(newSchema.properties)) {
      const oldProp = reqBodySchema.properties[key] || {};
      reqBodySchema.properties[key] = {
        ...newProp,
        ...(oldProp.description && !newProp.description ? { description: oldProp.description } : {})
      };
    }
    // Keep any properties that are in the old schema but not in the new one
    for (const key of Object.keys(reqBodySchema.properties)) {
      if (!newSchema.properties[key]) {
        reqBodySchema.properties[key] = reqBodySchema.properties[key];
      }
    }
    console.log(`Patched properties for ${route} from ${fileName}, preserving descriptions`);
    if (newSchema.required) {
      reqBodySchema.required = newSchema.required;
      console.log(`Patched required for ${route} from ${fileName}`);
    }
  } else {
    console.log(`Skipped ${route} - no requestBody schema`);
  }

  // ----- PATCH operation generation -----
  const postOpId = config.post.operationId as string;
  const baseId = postOpId ? postOpId.replace(/^create/i, "") : toCamelCase(tableName);
  const updateOpId = `update${baseId.charAt(0).toUpperCase()}${baseId.slice(1)}`;

  const postSummary: string = config.post.summary || tableName;
  const singular = postSummary.replace(/create (a new |an |a )?/i, "").trim();

  const patchSchemaProps: Record<string, any> = {};
  const oldPatchProps = config.patch?.requestBody?.content?.["application/json"]?.schema?.properties || {};
  if (newSchema.properties) {
    for (const [key, val] of Object.entries(newSchema.properties)) {
      if (!(val as any).readOnly) {
        patchSchemaProps[key] = {
          ...val,
          ...(oldPatchProps[key]?.description && !val.description
            ? { description: oldPatchProps[key].description }
            : {})
        };
      }
    }
  }

  const patchOp = config.patch || {};
  patchOp.operationId = updateOpId;
  patchOp.summary = `Update an existing ${singular}`;
  patchOp.description = `Update an existing ${singular}. Do not include read-only fields.`;
  patchOp.parameters = [
    {
      name: "id",
      in: "query",
      required: true,
      schema: { type: "string" }
    }
  ];
  patchOp.requestBody = {
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: patchSchemaProps
        }
      }
    }
  };
  patchOp.responses = {
    200: {
      description: `The updated ${singular}`
    }
  };

  config.patch = patchOp;
}

fs.writeFileSync(openApiPath, JSON.stringify(openApi, null, 2));
console.log("custom_action_schema.json updated.");
