export interface FormulaOptions {
  /** if present, search across all string fields */
  q?: string | string[];
  /** map of query params excluding reserved ones */
  params: Record<string, string | string[]>;
  /** additional filters */
  updatedAfter?: string;
  createdAfter?: string;
  recent?: string;
}

export interface FieldTypeOptions {
  searchableFields?: string[];
  booleanFields?: string[];
}

export function buildAirtableFormula(
  options: FormulaOptions,
  fieldMap: Record<string, string>,
  types: FieldTypeOptions = {},
): string {
  const conds: string[] = [];
  const { searchableFields = Object.keys(fieldMap), booleanFields = [] } =
    types;
  const { q, params, updatedAfter, createdAfter, recent } = options;

  const getValue = (v: string | string[] | undefined): string | undefined => {
    if (!v) return undefined;
    return Array.isArray(v) ? v[0] : v;
  };

  const escape = (val: string) => val.replace(/"/g, '\\"');

  const qVal = getValue(q)?.trim();
  if (qVal) {
    const esc = escape(qVal);
    const subs = searchableFields
      .map((key) => fieldMap[key])
      .filter(Boolean)
      .map((f) => `FIND(LOWER("${esc}"), LOWER({${f}}))`);
    if (subs.length) conds.push(`OR(${subs.join(", ")})`);
  }

  for (const [key, value] of Object.entries(params)) {
    const val = getValue(value);
    if (val === undefined) continue;
    const field = fieldMap[key];
    if (!field) continue;

    if (booleanFields.includes(key)) {
      const boolVal = val.toString().toLowerCase();
      if (boolVal === "true" || boolVal === "1") {
        conds.push(`{${field}}`);
      } else if (boolVal === "false" || boolVal === "0") {
        conds.push(`NOT({${field}})`);
      }
      continue;
    }

    if (val.trim() === "") continue;
    const esc = escape(val);

    if (searchableFields.includes(key)) {
      conds.push(`FIND(LOWER("${esc}"), LOWER({${field}}))`);
    } else {
      conds.push(`LOWER({${field}}) = LOWER("${esc}")`);
    }
  }

  const dateFieldForUpdated =
    fieldMap.lastModified ||
    fieldMap.updatedAt ||
    fieldMap.updated ||
    fieldMap.lastModifiedTime;
  const dateFieldForCreated =
    fieldMap.created || fieldMap.createdDate || fieldMap.createdAt;

  const addDateFilter = (field: string | undefined, date: string) => {
    if (!field) return;
    conds.push(`IS_AFTER({${field}}, \"${date}\")`);
  };

  const upd = getValue(updatedAfter);
  if (upd) addDateFilter(dateFieldForUpdated, new Date(upd).toISOString());
  const crt = getValue(createdAfter);
  if (crt) addDateFilter(dateFieldForCreated, new Date(crt).toISOString());
  const rec = getValue(recent);
  if (rec && !isNaN(parseInt(rec))) {
    const days = parseInt(rec);
    const date = new Date(Date.now() - days * 86400000).toISOString();
    addDateFilter(dateFieldForUpdated || dateFieldForCreated, date);
  }

  if (conds.length === 0) return "";
  if (conds.length === 1) return conds[0];
  return `AND(${conds.join(", ")})`;
}
