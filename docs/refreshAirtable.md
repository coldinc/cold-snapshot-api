# 🔄 `refreshAirtable.js`

This short script orchestrates the regeneration of Airtable field mappings and the OpenAPI schema used for GPT custom actions. It runs two existing TypeScript scripts and then commits any changes to the repository.

---

## 🚀 CLI Usage

Run the script through the npm task:

```bash
npm run refresh:airtable
```

The command performs the following steps:

1. Executes `scripts/generateFieldMap.ts` and `scripts/updateCustomActionParams.ts`.
2. Stages the updated `api/resolveFieldMap.ts` and `custom_action_schema.json` files.
3. If changes were detected, commits with the message `chore: refresh Airtable field map and schema` and pushes to the `main` branch.

Environment variables for the Airtable Metadata API must be available (see `.env.example`).

---

## 🤖 GitHub Actions Workflow

`.github/workflows/auto-refresh-airtable.yml` runs this command automatically every day. The workflow:

1. Checks out the repository and installs dependencies with `npm ci`.
2. Runs `npm run refresh:airtable` using the Airtable credentials stored in repository secrets.
3. Commits and pushes any resulting changes back to `main`.

The schedule is defined using a cron expression (`0 0 * * *`) so metadata stays current without manual intervention.

---

Use the CLI command to refresh on demand, or rely on the workflow for daily updates.
