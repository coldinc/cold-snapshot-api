import { getFieldMap } from "./resolveFieldMap.js";
import { mapInternalToAirtable } from "./mapRecordFields.js";
import { resolveLinkedRecordIds } from "./resolveLinkedRecordIds.js";
import { scrubPayload } from "./scrubPayload.js";

export async function prepareFields(tableName: string, data: Record<string, any>) {
  const resolved = await resolveLinkedRecordIds(tableName, data);
  const scrubbed = await scrubPayload(tableName, resolved);
  const fieldMap = getFieldMap(tableName);
  return mapInternalToAirtable(scrubbed, fieldMap);
}
