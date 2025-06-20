import getAirtableContext from "./airtableBase";
import { getFieldMap } from "./resolveFieldMap";

export function getLookupValue(tableName: string, fieldKey: string, record: Record<string, any>): string | null {
    const { base, TABLES, airtableToken, baseId } = getAirtableContext();

    const fieldMap = getFieldMap(tableName);
    const mappedFieldName = fieldMap[fieldKey];

    if (!mappedFieldName || !record.fields) return null;

    const value = record.fields[mappedFieldName];

    if (Array.isArray(value) && value.length === 1 && typeof value[0] === "string") {
        return value[0]; // e.g., single linked record
    }

    if (typeof value === "string") {
        return value;
    }

    return null;
}
