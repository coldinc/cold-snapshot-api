# 🤖 `customActions.md`

This document provides guidance for maintaining alignment between the Cold Snapshot API and the GPT **Custom Actions** defined in the OpenAI UI.

---

## 🎯 Purpose

To ensure GPT knows:

* Which Cold Snapshot API endpoints are available
* What parameters each endpoint expects
* How to format requests with the correct data types and field names (based on Airtable field structure)

---

## 🧩 Components

Custom Actions consist of:

* **Name & Description** (e.g. "Create Contact")
* **API Endpoint** (e.g. `POST https://cold-snapshot-api.vercel.app/api/contacts`)
* **Authentication** (typically: none or API key)
* **Request Parameters** (defined using JSON Schema)
* **Request Body** (format for payload, often mirrors parameters)

To ensure accuracy, we generate these from real Airtable metadata.

---

## 🔁 Workflow for Keeping Schema in Sync

> This process uses outputs from `scripts/generateFieldMap.ts`

### Step 1: Run the Generator

```bash
npx ts-node scripts/generateFieldMap.ts
```

You can also run both the generator and schema updater at once:

```bash
npm run refresh:airtable
```

This generates:

* `lib/resolveFieldMap.ts` → API-level mapping helper
* `schemas/*.schema.json` → JSON Schemas for custom actions

### Step 2: Open Custom Action Editor in OpenAI

1. Navigate to [https://platform.openai.com/](https://platform.openai.com/)
2. Select your GPT → Click **Actions**
3. Edit or create a new action

### Step 3: Copy Schema from `/schemas` into Action

For each relevant endpoint:

1. Locate the correct schema (e.g. `schemas/contacts.schema.json`)
2. Copy the contents into the **Parameters** section of the OpenAI UI
3. Ensure the **Request Body** maps fields properly (typically same as parameter keys)

### Step 4: Save and Test

Test the action in GPT to verify:

* Field names are correctly interpreted
* Enum choices are honored (e.g. dropdown values)
* Payloads are properly formatted

---

## 🧠 Best Practices

* **Always regenerate schemas** after changing Airtable field names or structures
* Use **camelCase** internally — the script handles this automatically
* Use consistent names between parameter keys and payload fields
* Store backups of working action configs (e.g. in `openai/actions/*.json`)

---

## 🛠️ Future Automation (Planned)

We're exploring ways to:

* Auto-generate full OpenAI-compatible JSON config files
* Inject schemas directly via CLI into OpenAI API (if/when supported)
* Compare existing custom action config to latest schema for drift detection

---

## 🔗 Related Files

* [`scripts/generateFieldMap.ts`](./scripts/generateFieldMap.ts)
* [`schemas/*.schema.json`](./schemas/)
* [`lib/resolveFieldMap.ts`](./lib/resolveFieldMap.ts)

---

For questions or updates, start with `generateFieldMap.ts` and check this file regularly.
