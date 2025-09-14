import { getFieldMap } from "./resolveFieldMap.js";
import { mapInternalToAirtable } from "./mapRecordFields.js";
import { resolveLinkedRecordIds } from "./resolveLinkedRecordIds.js";
import { scrubPayload } from "./scrubPayload.js";

export async function prepareFields(tableName: string, data: Record<string, any>) {
  const resolved = await resolveLinkedRecordIds(tableName, data);
  const scrubbed = await scrubPayload(tableName, resolved);
  console.log("[prepareFields] after scrub:", scrubbed);
  const fieldMap = getFieldMap(tableName);
  const mapped = mapInternalToAirtable(scrubbed, fieldMap);
  console.log("[prepareFields] after mapInternalToAirtable:", mapped);
  return mapped;
}
