# Cold Snapshot API

Serverless API routes for interacting with Airtable records of contacts, logs, threads and snapshots. The endpoints are designed for use with GPT custom actions and other Cold OS services.

Documentation for individual scripts and workflows lives in the [docs](./docs) directory.

## Synthesis Endpoints

Two routes help generate GPT summaries:

1. **GET `/api/snapshots-synthesize-current-state`** – returns the latest snapshot with mapped fields.
2. **POST `/api/synthesize-thread`** – builds a prompt from a thread, calls GPT‑4 and saves the result as a log entry.

See [docs/synthesisEndpoints.md](docs/synthesisEndpoints.md) for examples and more details.

### `GET /api/log-entries-index`

List log entries with optional pagination.

```bash
curl "https://your-domain.com/api/log-entries-index?limit=5"
```

The response includes a list of records and an `offset` token for fetching the next page.
