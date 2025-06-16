# 🧭 `generateFieldMap.ts` Documentation

This document explains the purpose, usage, and behavior of the `scripts/generateFieldMap.ts` script in the Cold Snapshot API project.

---

## ✅ Purpose

This script automates the process of generating:

1. A **field mapping utility** (`lib/resolveFieldMap.ts`) that maps internal field keys to Airtable field names
2. A set of **JSON Schema files** (in `/schemas/`) describing the expected structure and types for each Airtable table

These outputs are used to ensure:

* Consistent field mapping between internal API usage and Airtable
* Up-to-date and validated parameter definitions for GPT custom actions

---

## 🚀 How to Run

```bash
npx ts-node scripts/generateFieldMap.ts
```

Before running:

* Ensure your `.env` file is configured with the following:

  ```bash
  AIRTABLE_BASE_ID=your_base_id
  AIRTABLE_TOKEN=your_token
  ```
* You must be connected to a network that allows access to the Airtable Metadata API (`api.airtable.com`)

---

## 🛠️ Output Files

1. `lib/resolveFieldMap.ts`

   * Auto-generated mapping functions
   * Includes:

     * `getFieldMap(tableName: string)` → Airtable field mapping
     * `filterMappedFields(data, fieldMap)` → transforms internal data to Airtable-ready format

2. `/schemas/*.schema.json`

   * One file per table (e.g. `schemas/contacts.schema.json`)
   * Follows JSON Schema Draft-07 format
   * Contains inferred field types and enum values where possible (from Airtable Metadata)

3. `custom_action_schema.json` *(planned)*

   * (Upcoming feature) Will be generated from `/schemas` files
   * Used to populate the `parameters` section in GPT custom actions
   * Refer to `customActions.md` for usage and syncing guidance

---

## 📍 When to Run

Run this script anytime:

* A new Airtable field is added, renamed, or deleted
* A new table is added to the system
* You want to regenerate GPT-compatible parameter schemas

It is safe to run the script multiple times.

---

## 🧪 Troubleshooting

**Missing .env config?**

> Ensure `.env` contains valid `AIRTABLE_BASE_ID` and `AIRTABLE_TOKEN` values.

**Schema not updating?**

> Check if the table name is included in the `TABLES` array in the script.

**Silent run / no output?**

> This is expected if there are no changes. Check timestamps on `/lib/resolveFieldMap.ts` and `/schemas/` files to confirm generation.

**Network error (e.g. `ENETUNREACH`)?**

> You may be in a restricted environment (e.g. Codex sandbox). Run locally or from an environment with outbound internet access.

---

## 📌 Notes

* This script **does not auto-update the GPT custom action schema UI**.
* It **will soon generate** a `custom_action_schema.json` file that you can manually paste into OpenAI.
* See `customActions.md` for guidance on syncing generated schema to OpenAI.
* The script uses the Airtable **Metadata API** — which may require [specific access](https://airtable.com/developers/web/api/meta-api-introduction) depending on your Airtable plan.

---

For updates or to expand this script (e.g. auto-update OpenAI JSON), see `customActions.md`.
